'use client';

import React, { useState, useRef, useEffect } from 'react';

export const PageExtras = () => {
  return (
    <>
      <ScrollToTopButton />
      <ChatWidgetButton />
    </>
  );
};

const ScrollToTopButton = () => {
  const scrollToTop = () => {
    // Force scroll using both document.documentElement and document.body
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    document.body.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    // Also try window.scrollTo as fallback
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      id="scroll-to-top-button"
      onClick={scrollToTop}
      className="fixed bottom-[22.5px] right-20 z-[9999] w-[35px] h-[35px] flex items-center justify-center transition-all duration-500 cursor-pointer bg-transparent hover:bg-transparent transform hover:scale-110"
      aria-label="Scroll to top"
    >
      <svg 
        className="h-5 w-5 stroke-[3]" 
        style={{ color: '#282958' }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  );
};

const ChatWidgetButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  const closeChat = () => {
    setIsChatOpen(false);
  };
  
  // Close chat when clicking outside
  useEffect(() => {
    if (!isChatOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatContainerRef.current && 
        !chatContainerRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[data-chat-toggle]') &&
        !(event.target as HTMLElement).closest('#scroll-to-top-button')
      ) {
        closeChat();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatOpen]);

  return (
    <>
      {/* Chat toggle button - fixed at bottom right */}
      <button
        data-chat-toggle
        onClick={toggleChat}
        className="fixed bottom-5 right-6 z-[99999] w-[45px] h-[45px] flex items-center justify-center bg-[#282958] text-white rounded-full shadow-[0_2px_6px_0_rgba(0,0,0,0.2)] transition-all duration-300 group transform hover:scale-105"
        style={{ position: 'fixed' }}
        aria-label="Toggle chat"
      >
        <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 7C8 5.34315 9.34315 4 11 4H29C30.6569 4 32 5.34315 32 7V27L32 30H32V35L24 30H11C9.34315 30 8 28.6569 8 27V7Z" fill="white"/>
          <path d="M12 22C15 25 25 25 28 22" stroke="#282958" strokeWidth="2" strokeLinecap="round" className="transition-colors duration-300"/>
        </svg>
      </button>
      
      {/* Chat widget container */}
      {isChatOpen && (
        <div 
          ref={chatContainerRef}
          className="fixed right-6 z-[99999] rounded-lg shadow-xl flex flex-col overflow-hidden bg-white/90 backdrop-blur-sm bottom-[calc(24px+60px)] sm:w-[376px]"
          style={{ 
            height: '60vh',
            width: window.innerWidth <= 640 ? '85vw' : '376px',
            maxHeight: 'calc(100vh - 140px)',
            right: '1.5rem'
          }}
        >
          {/* Chat header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-lg text-gray-900">
              Live Chat
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={closeChat}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Chat body */}
          <div className="flex-1 flex flex-col p-4">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Welcome to Getino Live Support</h3>
              <p className="text-gray-600 mb-4">How can we help you today?</p>
              
              <div className="space-y-4">
                <a href="https://getino.app/support" className="w-full py-3 px-4 bg-[#282958] text-white rounded-lg hover:bg-opacity-90 transition-all inline-block text-center">
                  Contact Support
                </a>
                <a href="https://getino.app/help" className="w-full py-3 px-4 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all inline-block text-center">
                  View FAQs
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PageExtras; 