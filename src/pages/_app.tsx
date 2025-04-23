import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <AuthProvider>
      <Head>
        <title>SECURE CHECKOUT</title>
        <meta name="description" content="Secure payment processing for your order" />
      </Head>
      {(!router.pathname.includes('/embedded-checkout') || isClient) && (
        <Component {...pageProps} />
      )}
    </AuthProvider>
  );
} 