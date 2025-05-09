// @ts-nocheck - Disabling type checking for this file to prevent unused import warnings
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import Layout from '../components/Layout';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBrain } from 'react-icons/fa';
import { FiSlack } from 'react-icons/fi';
import { BiBot, BiMessage } from 'react-icons/bi';
import { HiChip, HiSun, HiMoon, HiChatAlt2, HiMicrophone, HiFilter, HiOutlineLightBulb } from 'react-icons/hi';
import { BiExpandAlt } from 'react-icons/bi';
import { MdClose } from 'react-icons/md';
import AIMascot3D from '../components/AIMascot3D';
import { useAuth } from '../contexts/SupabaseAuthContext';
import PremiumFeatureLock from '../components/PremiumFeatureLock';
import { useChat } from '../contexts/ChatContext';
import { Button } from '../components/ui/Button';
import AxiomEngineLogo from '../components/AxiomEngineLogo';
import { supabase } from '../lib/supabase';

// Create Theme Context
interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: true, // Default to dark mode
  toggleDarkMode: () => {},
});

// Theme Toggle Component
const ThemeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  
  return (
    <div className="flex items-center">
      {darkMode && <span className="mr-2 text-gray-300 text-sm">Dark</span>}
      {!darkMode && <span className="mr-2 text-gray-700 text-sm">Light</span>}
      <button 
        onClick={toggleDarkMode}
        className={`p-2 rounded-full ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-[#111827] hover:bg-gray-100'}`}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5 text-[#111827]" />}
      </button>
    </div>
  );
};

// AI service for chat
interface AIResponse {
  text: string;
}

// Function to call Gemini AI service via serverless function
async function getAIResponse(message: string, history: Array<{text: string, sender: 'user' | 'bot' | 'system', timestamp: Date}>): Promise<AIResponse> {
  
  // Define the model fallback chain in the desired order (GA models only)
  const modelFallbackList = [
    "gemini-1.5-pro",         // Primary (GA)
    "gemini-1.5-flash",       // Fallback 1 (GA)
    "gemini-2.0-flash",       // Fallback 2 (GA)
    "gemini-1.5-flash-8b",    // Fallback 3 (GA)
    "gemini-2.0-flash-lite"     // Fallback 4 (GA)
  ];
  let currentModelIndex = 0; // Start with the primary model index

  async function attemptRequest(): Promise<AIResponse> { // Inner function to allow retries
    const currentModelName = modelFallbackList[currentModelIndex];
    
    try {
      console.log(`[InoAIPremium] Attempting request with model: ${currentModelName}`);
      
      // Log the incoming message
      console.log(`[InoAIPremium] Received message: \"${message}\"`);

      // Call the serverless function instead of direct API
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history,
          modelName: currentModelName,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error');
      }
      
      const data = await response.json();
      return {
        text: data.text
      };
      
    } catch (error: any) { // Explicitly type error as any
      console.error(`[InoAIPremium] Error calling Gemini AI service with model ${currentModelName}:`, error);
      
      // Check for 429 error and if we can switch to the next model in the list
      if (error.message && error.message.includes('429')) {
        const nextModelIndex = currentModelIndex + 1;
        if (nextModelIndex < modelFallbackList.length) {
          // If there's another model in the list, switch and retry
          console.warn(`[InoAIPremium] 429 error with ${currentModelName}. Switching to ${modelFallbackList[nextModelIndex]} and retrying...`);
          currentModelIndex = nextModelIndex; // Move to the next model index
          return attemptRequest(); // Retry the request with the new model
        } else {
          // If we've exhausted all models, fall through to the 429 error message
          console.warn(`[InoAIPremium] 429 error with ${currentModelName}. No more fallback models available.`);
        }
      } 
      
      // Handle other errors or if the fallback chain is exhausted for 429
      let fallbackText = "Axiom Engine is experiencing high demand right now across all available models. Can you please try again in a few moments?"; // Default generic error
      
      if (error.message && error.message.includes('429')) {
         // Specific message if the final error after trying all models is 429
         fallbackText = "I encountered an unexpected issue. Could you try rephrasing or asking something else?";
      } else if (error.message && error.message.includes('API key')) {
         fallbackText = "There seems to be an issue with the AI connection. Our team has been notified.";
      } else if (error instanceof TypeError) { 
         fallbackText = "I'm having trouble connecting to the AI service. Please check your network connection and try again.";
      }
      
      return {
        text: fallbackText,
      };
    }
  }

  return attemptRequest(); // Initial call to the inner function
}

const InoAIPremium: React.FC = () => {
  const { openChat: _openChat } = useChat();
  const { signIn } = useAuth();
  const [mascotEmotion, setMascotEmotion] = useState<'neutral' | 'thinking' | 'speaking' | 'analyzing' | 'happy' | 'sleeping'>('neutral');
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [_selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showMoreFeatures, setShowMoreFeatures] = useState(false);
  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(true); // Default to dark mode
  
  // New state for checkout popup
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'working' | 'error'>('checking');
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);

  // New chat-related states
  const [chatMessages, setChatMessages] = useState<Array<{text: string, sender: 'user' | 'bot' | 'system', timestamp: Date}>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [_typingMessageIndex, setTypingMessageIndex] = useState<number | null>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    // Check Supabase connection
    const checkConnection = async () => {
      try {
        // Basic database query to check connection
        const { data, error } = await supabase
          .from('opportunities')
          .select('id')
          .limit(1);
          
        if (error) {
          console.error('[AxiomEngine] Supabase check failed:', error);
          setApiStatus('error');
          setLoginError('Database connection issue. Please try again later.');
        } else {
          console.log('[AxiomEngine] Supabase check passed:', data);
          setApiStatus('working');
        }
      } catch (err) {
        console.error('[AxiomEngine] Supabase check exception:', err);
        setApiStatus('error');
        setLoginError('Connection error. Please try again later.');
      }
    };
    
    checkConnection();
  }, []);

  useEffect(() => {
    // Simulate loading with a small delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      
      // Remove initial welcome message
      // if (chatMessages.length === 0) {
      //   setChatMessages([{
      //     text: "Hi, I'm Ino! How can I help you with GetIno today?",
      //     sender: 'bot',
      //     timestamp: new Date()
      //   }]);
      // }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }

    if (showSpeechBubble) {
      speechTimeoutRef.current = setTimeout(() => {
        setShowSpeechBubble(false);
        if (!isTyping && mascotEmotion !== 'analyzing') {
             setMascotEmotion('neutral');
        }
      }, 5000);
    }

    return () => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, [showSpeechBubble, isTyping, mascotEmotion]);

  // Updated to show checkout popup instead of directly opening chat
  const handleChatClick = () => {
    setShowCheckoutPopup(true);
  };

  // Function to check user subscription directly from database
  const checkSubscriptionStatus = async (userId: string) => {
    try {
      console.log('[Subscription] Checking subscription status for user:', userId);
      
      // Try to get user subscription information from the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_type, subscription_status')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('[Subscription] Error fetching subscription data:', error);
        return { subscriptionType: 'free', isPremium: false };
      }
      
      if (data) {
        console.log('[Subscription] Found subscription data:', data);
        // User is premium if subscription_type is not 'free'
        const isPremium = data.subscription_type !== 'free';
        return {
          subscriptionType: data.subscription_type || 'free',
          subscriptionStatus: data.subscription_status || 'active',
          isPremium
        };
      }
      
      return { subscriptionType: 'free', isPremium: false };
    } catch (err) {
      console.error('[Subscription] Error checking subscription:', err);
      return { subscriptionType: 'free', isPremium: false };
    }
  };

  // Function to handle paid user login
  const handlePaidUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(''); // Clear previous errors
    setShowUpgradeMessage(false);
    
    // Don't proceed if API status isn't working
    if (apiStatus !== 'working') {
      setLoginError('Cannot connect to authentication service. Please try again later.');
      return;
    }
    
    console.log('[Login] Starting login process');
    
    try {
      // Use signIn from context
      const userData = await signIn(username, password);
      
      console.log('[Login] Login successful, checking subscription status');
      
      // First attempt: Check user's subscription type from metadata
      let userSubscriptionType = userData?.user?.user_metadata?.subscription_type || 'free';
      let isPremium = userSubscriptionType !== 'free';
      
      // Second attempt: Check subscription directly from database for more reliability
      if (userData?.user?.id) {
        const subscriptionData = await checkSubscriptionStatus(userData.user.id);
        
        // Use database info if available, as it's more reliable
        if (subscriptionData) {
          userSubscriptionType = subscriptionData.subscriptionType;
          isPremium = subscriptionData.isPremium;
        }
      }
      
      console.log('[Login] Final subscription assessment:', { userSubscriptionType, isPremium });
      
      if (!isPremium) {
        console.log('[Login] Free user detected, showing upgrade message');
        setShowUpgradeMessage(true);
        // Don't close the checkout popup, but show upgrade message
        return;
      }
      
      // Successfully logged in with premium subscription
      console.log('[Login] Premium user confirmed, granting access');
      setShowCheckoutPopup(false);
      setShowChat(true);
      
      // Focus the chat input using the ref after a short delay
      setTimeout(() => {
        if (chatInputRef.current) {
          chatInputRef.current.focus();
        }
      }, 100);
    } catch (error: any) {
      console.error('[Login] Error during login:', error);
      
      // More detailed error handling
      if (error.message === 'Failed to fetch') {
        setLoginError('Network error - Unable to connect to authentication service.');
      } else if (error.toString().includes('ERR_NAME_NOT_RESOLVED')) {
        setLoginError('DNS error - Authentication service URL could not be resolved.');
      } else if (error.toString().includes('Invalid API key')) {
        setLoginError('Invalid API key - Please check Supabase configuration.');
        console.error('[Login] API Key error detected. Using hardcoded key from lib/supabase.ts');
      } else {
        setLoginError(error?.message || 'An error occurred during login');
      }
    }
  };

  // Add sendMessage function to use the getAIResponse
  const sendMessage = async (text: string) => {
    // Add user message
    const userMessage = {
      text,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    // Update messages immediately with user's message
    setChatMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setMascotEmotion('analyzing');
    
    try {
      // Call the AI service for a response
      const aiResponse = await getAIResponse(text, chatMessages);
      
      setMascotEmotion('speaking');
      setTypingMessageIndex(chatMessages.length);
      setIsTyping(true);
      setTypingText('');
      
      const responseText = aiResponse.text;
      let i = 0;
      
      // Start typing animation for the response
      const typingInterval = setInterval(() => {
        if (i < responseText.length) {
          setTypingText(prevText => prevText + responseText.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          setTypingMessageIndex(null);
          setTypingText('');
          
          // Add the complete message after typing is done
          setChatMessages(prev => [...prev, {
            text: responseText,
            sender: 'bot',
            timestamp: new Date()
          }]);
          setSpeechText(responseText);
          setShowSpeechBubble(true);
          setMascotEmotion('neutral');
        }
      }, 30); // typing speed in ms
      
    } catch (error) {
      console.error("Error calling Gemini AI service:", error);
      // Fallback response
      setChatMessages(prev => [...prev, {
        text: "I'm having trouble connecting right now. How else can I help you with GetIno?",
        sender: 'bot',
        timestamp: new Date()
      }]);
      setIsTyping(false);
      setMascotEmotion('neutral');
    }
  };

  // Handle ending the chat session
  const handleEndChat = () => {
    setShowChat(false); // Hide chat UI
    setChatMessages([]); // Clear messages
    setInputValue(''); // Clear input
    setIsTyping(false); // Reset typing state
    setTypingText('');
    setTypingMessageIndex(null);
    setMascotEmotion('neutral'); // Reset emotion
    setShowSpeechBubble(false); // Hide speech bubble
    setSpeechText('');
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current); // Clear speech timeout
    }
  };

  // Handle input submission
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Regular message handling
    sendMessage(inputValue.trim());
  };

  // Handle pre-generated question selection
  const handleQuestionClick = (question: string) => {
    sendMessage(question);
  };

  const premiumFeatures = [
    {
      title: "Unlimited Chat Sessions",
      description: "No limitations on chat interactions with INO AI",
      icon: <HiChatAlt2 className="w-6 h-6" />,
      emotion: "speaking" as const
    },
    {
      title: "Voice Command Support",
      description: "Control and interact with INO AI using natural voice commands",
      icon: <HiMicrophone className="w-6 h-6" />,
      emotion: "listening" as const
    },
    {
      title: "Advanced Filtering",
      description: "Fine-tune opportunity recommendations with premium filters",
      icon: <HiFilter className="w-6 h-6" />,
      emotion: "analyzing" as const
    },
    {
      title: "Offline Access",
      description: "Access INO AI features even without an internet connection",
      icon: <FiSlack className="w-6 h-6" />,
      emotion: "neutral" as const
    },
    {
      title: "Enhanced Intelligence",
      description: "Access to more sophisticated AI capabilities and insights",
      icon: <FaBrain className="w-6 h-6" />,
      emotion: "thinking" as const
    },
    {
      title: "Unrestricted Integration",
      description: "Connect INO AI with your favorite productivity tools",
      icon: <BiExpandAlt className="w-6 h-6" />,
      emotion: "happy" as const
    }
  ];

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  useEffect(() => {
    // Apply dark mode class to document body
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <PremiumFeatureLock featureName="INO AI Premium">
        <div className={`${darkMode ? 'dark bg-[#111111]' : 'bg-white'} transition-colors duration-200`}>
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header with theme toggle */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <AxiomEngineLogo className={`w-8 h-8 ${darkMode ? 'text-white' : 'text-gray-400'}`} />
                <span className={`ml-2 font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>AXIOM ENGINE</span>
              </div>
              <div className="flex items-center">
                <ThemeToggle />
                <a href="/dashboard" className={`ml-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} hover:underline`}>Dashboard</a>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <p className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-600'} max-w-3xl mx-auto`}>
                Experience the Full Power of INO AI
              </p>
              <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto mt-2`}>
                Unlimited conversations and unrestricted context tokens
              </p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:w-1/2 flex flex-col"
              >
                {/* Header section with no background */}
                <div className="flex items-center mb-4 px-4">
                  <div className="w-12 h-12 relative">
                    <AIMascot3D
                      emotion={'happy'}
                      size="sm"
                      animationState="idle"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Chat with Ino</h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your AI assistant is ready to help</p>
                  </div>
                  {showChat && (
                    <Button 
                      onClick={handleEndChat}
                      variant="text"
                      size="sm"
                      className={`${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      End Chat
                    </Button>
                  )}
                </div>

                {!showChat ? (
                  // Default view with mascot and start button
                  <div className={`flex flex-col items-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-2xl p-3 shadow-sm`}>
                    <div className="w-96 h-48 relative mt-2">
                      <AIMascot3D
                        emotion={'happy'}
                        size="sm"
                        withSpeechBubble={showSpeechBubble}
                        speechText={speechText}
                        animationState="idle"
                      />
                    </div>
                    <div className="mt-6 text-center pb-8">
                      <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Ask Ino about anything</h2>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                        Your personal AI assistant, now with enhanced capabilities and unrestricted access.
                      </p>
                      <div className="flex justify-center">
                        <Button 
                          onClick={handleChatClick}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2"
                        >
                          <HiChatAlt2 className="w-5 h-5" />
                          Start Conversation
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Chat interface view - Update for dark mode
                  <>
                    {/* Chat Messages Container */}
                    <div className={`flex-1 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border mb-4 overflow-hidden flex flex-col`} style={{ minHeight: "350px" }}>
                      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                        {chatMessages.length === 0 ? (
                          <div className="flex-1 flex flex-col justify-center">
                            <h1 className={`text-3xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} text-center mt-8`}>
                              What can I help with?
                            </h1>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Messages - Map existing chatMessages */}
                            {chatMessages.map((message, index) => {
                              const isUserMessage = message.sender === 'user';
                              return (
                                <div
                                  key={index}
                                  className={`flex w-full ${isUserMessage ? 'justify-end' : 'justify-start'} mb-2`}
                                >
                                  {/* AI Mascot (only for AI messages) */}
                                  {!isUserMessage && (
                                    <div className="flex-shrink-0 mr-2">
                                      <div className="w-12 h-12">
                                        <AIMascot3D size="sm" emotion={mascotEmotion} animationState="idle" />
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex flex-col items-end max-w-[85%]">
                                    <div className={`${isUserMessage ? 
                                      (darkMode ? 'bg-indigo-900' : 'bg-indigo-100') : 
                                      (darkMode ? 'bg-gray-700' : 'bg-gray-100')
                                    } p-3 rounded-lg w-fit max-w-full`}>
                                      <p className={`text-sm ${darkMode ? 'text-gray-100' : 'text-gray-800'} whitespace-pre-wrap break-words`}>
                                        {message.text}
                                      </p>
                                    </div>
                                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 ${isUserMessage ? 'text-right' : 'text-left'} w-full`}>
                                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                            {/* Typing indicator */}
                            {isTyping && (
                              <div className="flex items-start space-x-1">
                                <div className="flex-shrink-0 mr-1">
                                  <div className="w-12 h-12">
                                    <AIMascot3D size="sm" emotion={mascotEmotion} animationState="idle" />
                                  </div>
                                </div>
                                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded-lg max-w-[85%]`}>
                                  <div>
                                    <p className={`text-sm ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                      {typingText}<span className="animate-pulse">▋</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {/* Dummy div for auto-scrolling */}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </div>
                      
                      {/* Chat UI - Redesigned to match official ChatGPT */}
                      <div className="relative mt-4 p-4">
                        {/* Input container with rounded edges like ChatGPT */}
                        <div className={`max-w-3xl mx-auto shadow-sm rounded-2xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} overflow-hidden`}>
                          {/* Input form */}
                          <form onSubmit={handleInputSubmit} className="relative flex flex-col px-3 py-2">
                            <div className="flex items-center"> {/* Container for textarea only */}
                              {/* Main textarea input */}
                              <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask anything"
                                className={`flex-1 border-0 ${darkMode ? 'bg-transparent text-gray-100 placeholder:text-gray-400' : 'bg-transparent text-gray-800'} py-1.5 pl-1 focus:ring-0 focus:outline-none resize-none max-h-[200px] min-h-[24px]`}
                                rows={1} 
                                disabled={isTyping}
                                ref={chatInputRef}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleInputSubmit(e);
                                  }
                                }}
                              />
                            </div>

                            {/* Bottom row with accessories and action buttons */}
                            <div className="flex items-center justify-between mt-2">
                              {/* Left side: Accessory buttons */}
                              <div className="flex items-center space-x-2">
                                {/* Attachment button */}
                                <button 
                                  type="button" 
                                  className={`p-1 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                  </svg>
                                </button>
                                
                                {/* Search button */}
                                <button 
                                  type="button" 
                                  className={`p-1 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                  </svg>
                                </button>
                                
                                {/* Voice button */}
                                <button 
                                  type="button" 
                                  className={`p-1 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                                  </svg>
                                </button>
                              </div>
                              
                              {/* Right side: End Chat and Send buttons */}
                              <div className="flex items-center space-x-2">
                                {/* Send button */}
                                <button
                                  type="submit"
                                  disabled={isTyping || !inputValue.trim()}
                                  className={`p-1 rounded-lg ${
                                    isTyping || !inputValue.trim()
                                      ? (darkMode ? 'text-gray-500' : 'text-gray-400')
                                      : (darkMode ? 'text-indigo-400 hover:bg-indigo-900' : 'text-indigo-600 hover:bg-indigo-50')
                                  }`}
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                        
                        {/* Suggestion chips - Two rows */}
                        <div className="max-w-3xl mx-auto mt-5 mb-4 space-y-2">
                          {/* Row 1 */}
                          <div className="flex justify-center gap-2">
                            <button className={`px-3 py-1 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'} border rounded-full text-xs flex items-center`} onClick={() => handleQuestionClick('Surprise me with something interesting!')}>
                              <span className="mr-2">🎁</span>
                              Surprise me
                            </button>
                            <button className={`px-3 py-1 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'} border rounded-full text-xs flex items-center`} onClick={() => handleQuestionClick('Help me make a plan for my day.')}> 
                              <span className="mr-2">💡</span>
                              Make a plan
                            </button>
                            <button className={`px-3 py-1 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'} border rounded-full text-xs flex items-center`} onClick={() => handleQuestionClick('Can you analyze this data for me?')}>
                              <span className="mr-2">📊</span>
                              Analyze data
                            </button>
                            <button className={`px-3 py-1 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'} border rounded-full text-xs flex items-center`} onClick={() => handleQuestionClick('I need some advice.')}> 
                              <span className="mr-2">🎓</span>
                              Get advice
                            </button>
                          </div>
                          {/* Row 2 */}
                          <div className="flex justify-center gap-2">
                            <button className={`px-3 py-1 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'} border rounded-full text-xs flex items-center`} onClick={() => handleQuestionClick('Let\'s brainstorm some creative ideas together.')}> 
                              <span className="mr-2">💡</span>
                              Brainstorm
                            </button>
                            <button className={`px-3 py-1 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'} border rounded-full text-xs flex items-center`} onClick={() => handleQuestionClick('Can you summarize this text?')}>
                              <span className="mr-2">📄</span>
                              Summarize text
                            </button>
                            <button className={`px-3 py-1 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'} border rounded-full text-xs flex items-center`} onClick={() => handleQuestionClick('Write a sample code snippet for a to-do app.')}> 
                              <span className="mr-2">💻</span>
                              Code
                            </button>
                            <button className={`px-3 py-1 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'} border rounded-full text-xs flex items-center`} onClick={() => handleQuestionClick('How can I analyze images with AI?')}>
                              <span className="mr-2">👁️</span>
                              Analyze images
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`lg:w-1/2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl ${showMoreFeatures ? 'p-8' : 'p-8 pb-4'} shadow-sm`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {premiumFeatures.slice(0, 4).map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                      className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer`}
                      onClick={() => {
                        setSelectedSection(feature.title);
                        setSpeechText(`${feature.title}: ${feature.description}`);
                        setShowSpeechBubble(true);
                        setMascotEmotion(feature.emotion === 'listening' ? 'speaking' : feature.emotion);
                      }}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 ${darkMode ? 'bg-indigo-900' : 'bg-indigo-100'} p-2 rounded-lg ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                          {feature.icon}
                        </div>
                        <div className="ml-4">
                          <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{feature.title}</h3>
                          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{feature.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {/* Show more dropdown for last 2 features */}
                  {!showMoreFeatures && (
                    <div className="col-span-1 md:col-span-2 flex justify-center mt-1">
                      <button
                        className={`px-4 py-1.5 ${darkMode ? 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'} rounded-lg transition-colors font-medium text-sm`}
                        onClick={() => setShowMoreFeatures(true)}
                      >
                        Show more
                      </button>
                    </div>
                  )}
                  {showMoreFeatures && premiumFeatures.slice(4).map((feature, index) => (
                    <motion.div
                      key={4 + index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
                      transition={{ duration: 0.3, delay: 0.2 + (4 + index) * 0.1 }}
                      className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer`}
                      onClick={() => {
                        setSelectedSection(feature.title);
                        setSpeechText(`${feature.title}: ${feature.description}`);
                        setShowSpeechBubble(true);
                        setMascotEmotion(feature.emotion === 'listening' ? 'speaking' : feature.emotion);
                      }}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 ${darkMode ? 'bg-indigo-900' : 'bg-indigo-100'} p-2 rounded-lg ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                          {feature.icon}
                        </div>
                        <div className="ml-4">
                          <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{feature.title}</h3>
                          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{feature.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} rounded-2xl p-8 shadow-lg mb-12`}
            >
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
                  <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Welcome to the Future of AI Assistance</h2>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  Pro users have access to INO AI's full capabilities. With unrestricted context window tokens and an uncapped conversation limit, you can ask more complex questions and engage in deeper, more productive interactions without constraints.
                  </p>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Our AI model provides deeper insights, more accurate recommendations, and a seamless experience tailored specifically to your preferences and goals.
                  </p>
                </div>
                <div className="md:w-1/3 flex justify-center">
                  <AxiomEngineLogo className={`w-32 h-32 ${darkMode ? 'text-white' : 'text-gray-400'}`} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              <div className={`p-6 border-t-4 border-indigo-500 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-sm`}>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'} p-3 rounded-full`}>
                    <HiOutlineLightBulb className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Enhanced Recommendations</h3>
                    <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Receive personalized opportunity recommendations based on your skills, interests, and past activity.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`p-6 border-t-4 border-purple-500 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-sm`}>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'} p-3 rounded-full`}>
                    <HiMicrophone className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Voice Commands</h3>
                    <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Control INO AI hands-free with natural voice commands for an even more efficient experience.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`p-6 border-t-4 border-blue-500 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-sm`}>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'} p-3 rounded-full`}>
                    <BiExpandAlt className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Seamless Integration</h3>
                    <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Connect INO AI with your favorite tools and services for a unified workflow experience.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-center mb-8"
            >
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Start Exploring INO AI Premium Today</h2>
              <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto mb-6`}>
                Unlock all the pro features and optimize productivity with your own advanced AI assistant.
              </p>
              <Button
                onClick={() => {
                  // Now show checkout popup instead of opening chat directly
                  setShowCheckoutPopup(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-md text-lg"
              >
                Chat with INO
              </Button>
            </motion.div>
            
            {/* Footer */}
            <div className={`mt-20 pt-8 border-t ${darkMode ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'} text-sm`}>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>© 2025 AxiomEngine. All rights reserved.</div>
                <div className="flex gap-4 mt-4 md:mt-0">
                  <a href="#" className="hover:underline">Privacy Policy</a>
                  <a href="#" className="hover:underline">Terms of Service</a>
                  <a href="#" className="hover:underline">Contact</a>
                </div>
              </div>
            </div>

            {/* Checkout Popup */}
            {showCheckoutPopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-xl shadow-xl p-6 w-full max-w-md relative`}>
                  <button 
                    onClick={() => setShowCheckoutPopup(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                    <MdClose className="w-6 h-6" />
                  </button>
                  
                  <div className="flex items-center justify-center mb-6">
                    <AxiomEngineLogo className={`w-10 h-10 text-indigo-500`} />
                    <h2 className="text-xl font-bold ml-2">Axiom Engine Pro</h2>
                  </div>
                  
                  {showUpgradeMessage ? (
                    <div className="mb-6 text-center">
                      <div className={`p-4 mb-4 ${darkMode ? 'bg-red-900/30' : 'bg-red-100'} rounded-lg`}>
                        <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                          Upgrade Required
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                          Your account has a free subscription. Please upgrade to Pro to access premium features.
                        </p>
                      </div>
                      <a 
                        href="https://checkout.getino.app" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium text-center block"
                      >
                        Upgrade Now
                      </a>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6 text-center">
                        <h3 className="text-lg font-semibold mb-2">Upgrade to unlock unlimited chat</h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                          Get unlimited access to INO AI and all pro features
                        </p>
                      </div>
                      
                      <a 
                        href="https://checkout.getino.app" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium text-center block mb-6"
                      >
                        Subscribe Now
                      </a>
                      
                      <div className="mt-8 border-t border-gray-700 pt-6">
                        <h4 className="text-base font-medium mb-4 text-center">Already a Pro user?</h4>
                        
                        <form onSubmit={handlePaidUserLogin}>
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="username" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Email
                              </label>
                              <input
                                type="email"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-indigo-500`}
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Password
                              </label>
                              <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-indigo-500`}
                                required
                              />
                            </div>
                            
                            {loginError && (
                              <div className="text-red-500 text-sm py-2">
                                {loginError}
                              </div>
                            )}
                            
                            <button
                              type="submit"
                              className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} py-2 px-4 rounded-lg font-medium`}
                            >
                              Open Chat
                            </button>
                          </div>
                        </form>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </PremiumFeatureLock>
    </ThemeContext.Provider>
  );
};

export default InoAIPremium; 