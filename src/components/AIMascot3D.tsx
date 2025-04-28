import React from 'react'
import { FaRobot } from 'react-icons/fa'

interface AIMascot3DProps {
  emotion?: 'neutral' | 'thinking' | 'speaking' | 'analyzing' | 'happy' | 'sleeping'
  size?: 'sm' | 'md' | 'lg'
  withSpeechBubble?: boolean
  speechText?: string
  animationState?: 'idle' | 'talking' | 'listening' | 'walking'
}

const AIMascot3D: React.FC<AIMascot3DProps> = ({
  emotion = 'neutral',
  size = 'md',
  withSpeechBubble = false,
  speechText = '',
  animationState = 'idle'
}) => {
  // This is a placeholder component for the real 3D component
  // In the real implementation, this would be a Three.js component
  
  const sizeClass = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-64 h-64'
  }[size]
  
  const emotionColor = {
    neutral: 'text-blue-500',
    thinking: 'text-purple-500',
    speaking: 'text-green-500',
    analyzing: 'text-amber-500',
    happy: 'text-indigo-600',
    sleeping: 'text-gray-400'
  }[emotion]
  
  const animationClass = {
    idle: 'animate-pulse',
    talking: 'animate-bounce',
    listening: 'animate-ping',
    walking: 'animate-spin'
  }[animationState]

  return (
    <div className="relative">
      <div className={`${sizeClass} flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-4 ${animationClass}`}>
        <FaRobot className={`${emotionColor} w-full h-full`} />
      </div>
      
      {withSpeechBubble && speechText && (
        <div className="absolute top-0 left-full ml-4 p-3 bg-white rounded-lg shadow-md max-w-xs">
          <div className="absolute left-0 top-4 transform -translate-x-2 rotate-45 w-4 h-4 bg-white"></div>
          <p className="text-gray-700">{speechText}</p>
        </div>
      )}
    </div>
  )
}

export default AIMascot3D 