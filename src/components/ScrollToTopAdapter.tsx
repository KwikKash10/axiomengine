'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Define a simple adapter component that doesn't rely on react-router-dom
const ScrollToTopAdapter = () => {
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

export default ScrollToTopAdapter; 