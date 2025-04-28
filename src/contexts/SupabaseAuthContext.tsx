import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'

interface UserData {
  id?: string
  displayName?: string
  email?: string
  photoURL?: string
  isPremium?: boolean
  subscriptionType?: 'free' | 'premium' | 'trial'
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
  trialEndDate?: string
}

interface AuthContextType {
  supabase: SupabaseClient
  user: UserData | null
  currentUser: User | null
  userData: UserData | null
  isConfigured: boolean
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabase] = useState(() => 
    createClient(
      import.meta.env.VITE_SUPABASE_URL || '',
      import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    )
  )
  
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfigured] = useState(true)
  
  useEffect(() => {
    async function getUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setCurrentUser(session.user)
          
          // Simulate getting user data
          setUserData({
            id: session.user.id,
            displayName: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            email: session.user.email,
            photoURL: session.user.user_metadata?.avatar_url,
            isPremium: true,
            subscriptionType: 'premium',
            subscriptionStatus: 'active'
          })
        }
      } catch (error) {
        console.error('Error loading user', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    getUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null)
      if (session?.user) {
        setUserData({
          id: session.user.id,
          displayName: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          email: session.user.email,
          photoURL: session.user.user_metadata?.avatar_url,
          isPremium: true,
          subscriptionType: 'premium',
          subscriptionStatus: 'active'
        })
      } else {
        setUserData(null)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])
  
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setCurrentUser(null)
      setUserData(null)
    } catch (error) {
      console.error('Error signing out', error)
    }
  }
  
  const value = {
    supabase,
    user: userData,
    currentUser,
    userData,
    isConfigured,
    isLoading,
    signOut
  }
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 