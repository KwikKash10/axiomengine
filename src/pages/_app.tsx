import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Fix for server-side rendering with React context
function SafeHydrate({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <div suppressHydrationWarning>
      {isClient ? children : <div style={{ visibility: 'hidden' }}>Loading...</div>}
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <SafeHydrate>
      <AuthProvider>
        <Head>
          <title>SECURE CHECKOUT</title>
          <meta name="description" content="Secure payment processing for your order" />
        </Head>
        <Component {...pageProps} />
      </AuthProvider>
    </SafeHydrate>
  );
} 