import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineLightBulb, HiChatAlt2, HiMicrophone, HiFilter } from 'react-icons/hi';
import { FaRobot, FaBrain } from 'react-icons/fa';
import { FiSlack, FiUnlock } from 'react-icons/fi';
import { BiExpandAlt } from 'react-icons/bi';
import AIMascot3D from '../components/AIMascot3D';
import PremiumFeatureLock from '../components/PremiumFeatureLock';
import { useChat } from '../contexts/ChatContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface Feature {
  title: string;
  description: string;
  emotion: string;
}

const InoAIPremium: React.FC = () => {
  const { openChat } = useChat();
  const [mascotEmotion, setMascotEmotion] = useState<'neutral' | 'thinking' | 'speaking' | 'analyzing' | 'happy' | 'sleeping'>('happy');
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simulate loading with a small delay
    const timer = setTimeout(() => {
      setIsVisible(true);
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
      }, 5000);
    }

    return () => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, [showSpeechBubble]);

  const displaySpeech = (text: string, emotion: 'neutral' | 'thinking' | 'speaking' | 'analyzing' | 'happy' | 'sleeping' = 'speaking') => {
    setSpeechText(text);
    setMascotEmotion(emotion);
    setShowSpeechBubble(true);
  };

  const handleChatClick = () => {
    displaySpeech('How can I help you today?');
    setTimeout(() => {
      openChat();
    }, 500);
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

  const handleFeatureClick = (feature: Feature) => {
    displaySpeech(`${feature.title}: ${feature.description}`, feature.emotion === 'listening' ? 'speaking' : feature.emotion as any);
  };

  return (
    <PremiumFeatureLock featureName="INO AI Premium">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              INO AI Premium
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock the full potential of INO AI with unrestricted access and premium features.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:w-1/2 flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-8 shadow-sm"
          >
            <div className="w-64 h-64 relative">
              <AIMascot3D
                emotion={mascotEmotion}
                size="lg"
                withSpeechBubble={showSpeechBubble}
                speechText={speechText}
                animationState="idle"
              />
            </div>
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Meet Premium INO</h2>
              <p className="text-gray-600 mb-4">
                Your personal AI assistant, now with enhanced capabilities and unrestricted access.
              </p>
              <Button 
                onClick={handleChatClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2"
              >
                <HiChatAlt2 className="w-5 h-5" />
                Start Chatting
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-1/2 bg-white rounded-2xl p-8 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FiUnlock className="mr-2 text-indigo-600" /> Premium Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {premiumFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    handleFeatureClick(feature);
                  }}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-lg text-indigo-600">
                      {feature.icon}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
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
          className="bg-gray-900 rounded-2xl p-8 shadow-lg text-white mb-12"
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-3xl font-bold mb-4">Welcome to the Future of AI Assistance</h2>
              <p className="text-gray-300 mb-4">
                As a premium user, you now have access to INO AI's full capabilities. Discover opportunities, get personalized guidance, and maximize your earning potential with advanced features that are only available to premium members.
              </p>
              <p className="text-gray-300">
                Our AI model provides deeper insights, more accurate recommendations, and a seamless experience tailored specifically to your preferences and goals.
              </p>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="p-4 bg-indigo-800 rounded-full animate-pulse">
                <FaRobot className="w-24 h-24 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="p-6 border-t-4 border-indigo-500">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-full text-indigo-600">
                <HiOutlineLightBulb className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900">Enhanced Recommendations</h3>
                <p className="mt-2 text-gray-600">
                  Receive personalized opportunity recommendations based on your skills, interests, and past activity.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 border-t-4 border-purple-500">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-purple-100 p-3 rounded-full text-purple-600">
                <HiMicrophone className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900">Voice Commands</h3>
                <p className="mt-2 text-gray-600">
                  Control INO AI hands-free with natural voice commands for an even more efficient experience.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 border-t-4 border-blue-500">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full text-blue-600">
                <BiExpandAlt className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900">Seamless Integration</h3>
                <p className="mt-2 text-gray-600">
                  Connect INO AI with your favorite tools and services for a unified workflow experience.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Exploring INO AI Premium Today</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Unlock all the premium features and maximize your earning potential with our advanced AI assistant.
          </p>
          <Button
            onClick={handleChatClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-md text-lg"
          >
            Chat with INO AI
          </Button>
        </motion.div>
      </div>
    </PremiumFeatureLock>
  );
};

export default InoAIPremium; 