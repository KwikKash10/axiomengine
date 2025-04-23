import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

// Only import js-cookie on the client side
let Cookies: any;
if (typeof window !== 'undefined') {
  Cookies = require('js-cookie');
}

// Define the shape of user data
interface UserData {
  id: string;
  email: string | null;
  displayName: string | null;
  isPremium: boolean;
}

// Define the shape of the context
export interface AuthContextType {
  currentUser: any | null;
  userData: UserData | null;
  loading: boolean;
  checkMainAppAuth: () => Promise<boolean>;
}

// Default context value for SSR
const defaultContextValue: AuthContextType = {
  currentUser: null,
  userData: null,
  loading: true,
  checkMainAppAuth: async () => false
};

// Create the context with a default value to make it SSR safe
const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Create a hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Cookie names for shared auth
const AUTH_COOKIE_NAME = 'getino_auth';
const USER_DATA_COOKIE_NAME = 'getino_user_data';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Only run this component on the client
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Return a default value during SSR
  if (!isClient) {
    return <AuthContext.Provider value={defaultContextValue}>
      {children}
    </AuthContext.Provider>;
  }
  
  // Client-side only code below
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const MAIN_APP_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://getino.app';

  // Helper to parse JSON safely
  const safeJsonParse = (str: string | undefined): any => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return null;
    }
  };

  // Function to check if the user is logged in using shared cookies
  const checkMainAppAuth = async (): Promise<boolean> => {
    if (!isClient) return false;
    
    try {
      // For development purposes, we'll simulate an authenticated user
      if (process.env.NODE_ENV === 'development') {
        // Simulate a successful auth check
        const mockUser = { 
          id: 'dev-user', 
          email: 'dev@example.com' 
        };
        
        const mockUserData = {
          id: 'dev-user',
          email: 'dev@example.com',
          displayName: 'Development User',
          isPremium: true
        };
        
        setCurrentUser(mockUser);
        setUserData(mockUserData);
        
        // Set cookies for development testing
        Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(mockUser), { 
          expires: 7, 
          domain: process.env.NODE_ENV as string === 'production' ? '.getino.app' : undefined
        });
        
        Cookies.set(USER_DATA_COOKIE_NAME, JSON.stringify(mockUserData), { 
          expires: 7, 
          domain: process.env.NODE_ENV as string === 'production' ? '.getino.app' : undefined
        });
        
        return true;
      }
      
      // In production: check for shared cookies with domain=.getino.app
      const authCookie = Cookies.get(AUTH_COOKIE_NAME);
      const userDataCookie = Cookies.get(USER_DATA_COOKIE_NAME);
      
      if (authCookie && userDataCookie) {
        const user = safeJsonParse(authCookie);
        const uData = safeJsonParse(userDataCookie);
        
        if (user && uData) {
          console.log('Found auth cookies, user is authenticated');
          setCurrentUser(user);
          setUserData(uData);
          return true;
        }
      }
      
      console.log('No auth cookies found, user is not authenticated');
      return false;
    } catch (error) {
      console.error("Error checking auth:", error);
      return false;
    }
  };

  // Helper to set auth cookies
  const setAuthCookies = (user: any, uData: UserData) => {
    if (!isClient) return;
    
    // Set cookie with domain=.getino.app in production to share between subdomains
    Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(user), { 
      expires: 7, // 7 days
      domain: process.env.NODE_ENV as string === 'production' ? '.getino.app' : undefined
    });
    
    Cookies.set(USER_DATA_COOKIE_NAME, JSON.stringify(uData), { 
      expires: 7, // 7 days
      domain: process.env.NODE_ENV as string === 'production' ? '.getino.app' : undefined
    });
  };

  // Get auth data from URL parameters or check with main app
  useEffect(() => {
    if (!isClient || !router.isReady) return;
    
    const checkAuth = async () => {
      setLoading(true);
  
      // Extract user data from URL if present
      const { userId, userEmail, userName, token, premium } = router.query;
      
      // If we have user data in the URL, use it
      if (userId && userEmail) {
        console.log('Auth data found in URL parameters');
        
        // Create user objects from URL parameters
        const user = { 
          id: userId as string, 
          email: userEmail as string,
          token: token as string || undefined
        };
        
        const uData = {
          id: userId as string,
          email: userEmail as string,
          displayName: userName as string || 'User',
          isPremium: premium === 'true' // Convert the string to boolean
        };
        
        // Set the state
        setCurrentUser(user);
        setUserData(uData);
        
        // Set shared auth cookies
        setAuthCookies(user, uData);
      } else {
        // No auth data in URL, try to check with shared cookies
        const isAuthenticated = await checkMainAppAuth();
        
        if (!isAuthenticated) {
          // Clear any existing auth data if not authenticated
          setCurrentUser(null);
          setUserData(null);
          
          // Clear cookies
          Cookies.remove(AUTH_COOKIE_NAME);
          Cookies.remove(USER_DATA_COOKIE_NAME);
        }
      }
      
      setLoading(false);
      setAuthChecked(true);
    };
    
    checkAuth();
  }, [router.isReady, router.query, isClient]);

  const value = {
    currentUser,
    userData,
    loading,
    checkMainAppAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider; 