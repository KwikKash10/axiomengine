import React from 'react';

interface AxiomEngineLogoProps {
  className?: string;
}

const AxiomEngineLogo: React.FC<AxiomEngineLogoProps> = ({ className = "w-24 h-24" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cogGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: 'currentColor', stopOpacity: 0.9}} />
          <stop offset="100%" style={{stopColor: 'currentColor', stopOpacity: 0.5}} />
        </linearGradient>
        <radialGradient id="corePulse" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1">
            <animate attributeName="stop-opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6">
             <animate attributeName="stop-opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
          </stop>
        </radialGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <path 
        fill="none"
        stroke="white"
        strokeWidth="1"
        strokeLinejoin="round"
        opacity="0.3"
        filter="url(#softGlow)"
        d="M50 12
           A 10 10 0 0 1 62.14 17.21 
           L 69.21 24.29 
           A 6 6 0 0 1 73.46 31.71 
           L 73.46 31.71 
           A 38 38 0 0 1 82.79 37.86 
           L 82.79 37.86 
           A 10 10 0 0 1 88 50 
           A 10 10 0 0 1 82.79 62.14 
           L 75.71 69.21 
           A 6 6 0 0 1 68.29 73.46 
           L 68.29 73.46 
           A 38 38 0 0 1 62.14 82.79 
           L 62.14 82.79 
           A 10 10 0 0 1 50 88 
           A 10 10 0 0 1 37.86 82.79 
           L 30.79 75.71 
           A 6 6 0 0 1 26.54 68.29 
           L 26.54 68.29 
           A 38 38 0 0 1 17.21 62.14 
           L 17.21 62.14 
           A 10 10 0 0 1 12 50 
           A 10 10 0 0 1 17.21 37.86 
           L 24.29 30.79 
           A 6 6 0 0 1 31.71 26.54 
           L 31.71 26.54 
           A 38 38 0 0 1 37.86 17.21 
           L 37.86 17.21 
           A 10 10 0 0 1 50 12 Z" 
      />

      <g>
        <path 
          fill="url(#cogGradient)"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
          d="M50 15
             A 10 10 0 0 1 60.45 19.55 L 67.07 26.17 A 5 5 0 0 1 70.61 32.93 L 70.61 32.93 A 35 35 0 0 1 80.45 39.55
             L 80.45 39.55 A 10 10 0 0 1 85 50 A 10 10 0 0 1 80.45 60.45 L 73.83 67.07 A 5 5 0 0 1 67.07 70.61 L 67.07 70.61 A 35 35 0 0 1 60.45 80.45
             L 60.45 80.45 A 10 10 0 0 1 50 85 A 10 10 0 0 1 39.55 80.45 L 32.93 73.83 A 5 5 0 0 1 29.39 67.07 L 29.39 67.07 A 35 35 0 0 1 19.55 60.45
             L 19.55 60.45 A 10 10 0 0 1 15 50 A 10 10 0 0 1 19.55 39.55 L 26.17 32.93 A 5 5 0 0 1 32.93 29.39 L 32.93 29.39 A 35 35 0 0 1 39.55 19.55
             L 39.55 19.55 A 10 10 0 0 1 50 15 Z
             
             M 50 25                
             A 4 4 0 0 1 55 29      
             L 65 40                
             A 5 5 0 0 1 70 45      
             L 70 55                
             A 5 5 0 0 1 65 60      
             L 55 72                
             A 4 4 0 0 1 50 75      
             A 4 4 0 0 1 45 72      
             L 35 60                
             A 5 5 0 0 1 30 55      
             L 30 45                
             A 5 5 0 0 1 35 40      
             L 45 29                
             A 4 4 0 0 1 50 25      
             Z
             " 
           fillRule="evenodd"
        >
           <animateTransform 
             attributeName="transform" 
             type="rotate" 
             from="0 50 50" 
             to="360 50 50" 
             dur="25s" 
             repeatCount="indefinite" />
        </path>
        
        <circle cx="50" cy="50" r="12" fill="url(#corePulse)" filter="url(#softGlow)"/>
      </g>
    </svg>
  );
};

export default AxiomEngineLogo; 