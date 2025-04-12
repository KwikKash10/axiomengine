import React, { useState, useEffect } from 'react';
import ClientOnly from './ClientOnly';

interface LoadingDotsProps {
  className?: string;
}

/**
 * LoadingDots component that displays animated loading dots.
 * This component is wrapped in ClientOnly to prevent hydration issues.
 */
export default function LoadingDots({ className = '' }: LoadingDotsProps) {
  return (
    <ClientOnly fallback={<span className={className}>...</span>}>
      <AnimatedDots className={className} />
    </ClientOnly>
  );
}

/**
 * Internal component that handles the animation logic.
 * This is only rendered on the client side.
 */
function AnimatedDots({ className = '' }: LoadingDotsProps) {
  const [dots, setDots] = useState('...');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => {
        if (prevDots === '') return '.';
        if (prevDots === '.') return '..';
        if (prevDots === '..') return '...';
        return '';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <span className={className} style={{ display: 'inline-block', width: '24px', textAlign: 'left' }}>
      {dots}
    </span>
  );
} 