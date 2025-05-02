import React, { createContext, useContext, useState, useEffect } from 'react'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

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
  signIn: (email: string, password: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfigured] = useState(true)
  
  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      console.error('Supabase is not configured');
      throw new Error('Supabase is not configured');
    }
    
    try {
      console.log('[Auth] Attempting to sign in with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('[Auth] Sign in error:', error);
        throw error;
      }

      // If login succeeded, update user state
      if (data.user) {
        setCurrentUser(data.user);
        
        // Get subscription type from user metadata or set default to free
        const subscriptionType = data.user.user_metadata?.subscription_type || 'free';
        console.log('[Auth] User subscription type:', subscriptionType);
        
        // Update user data with subscription info
        const updatedUserData = {
          id: data.user.id,
          displayName: data.user.user_metadata?.name || data.user.email?.split('@')[0],
          email: data.user.email,
          photoURL: data.user.user_metadata?.avatar_url,
          isPremium: subscriptionType !== 'free',
          subscriptionType: subscriptionType,
          subscriptionStatus: data.user.user_metadata?.subscription_status || 'active'
        };
        
        setUserData(updatedUserData);
      }
      
      return data;
    } catch (error) {
      console.error('[Auth] Error during sign in:', error);
      throw error;
    }
  };
  
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
  }, [])
  
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
    signOut,
    signIn
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