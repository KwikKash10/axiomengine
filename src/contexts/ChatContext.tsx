import React, { createContext, useContext, useState } from 'react'

interface ChatContextType {
  isOpen: boolean
  openChat: () => void
  closeChat: () => void
  sendMessage: (message: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const openChat = () => {
    setIsOpen(true)
  }
  
  const closeChat = () => {
    setIsOpen(false)
  }
  
  const sendMessage = async (message: string) => {
    console.log('Sending message:', message)
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 500)
    })
  }
  
  const value = {
    isOpen,
    openChat,
    closeChat,
    sendMessage
  }
  
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
} 