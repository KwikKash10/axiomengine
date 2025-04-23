import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ClientOnly from '../components/ClientOnly';

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Skip rendering of client-only pages during SSR
  if (typeof window === 'undefined' && router.pathname === '/form') {
    return null;
  }

  return (
    <AuthProvider>
      <Head>
        <title>SECURE CHECKOUT</title>
        <meta name="description" content="Secure payment processing for your order" />
      </Head>
      <ClientOnly>
        {(!router.pathname.includes('/embedded-checkout') || isClient) && (
          <Component {...pageProps} />
        )}
      </ClientOnly>
    </AuthProvider>
  );
}

// Adding getInitialProps disables automatic static optimization
// This forces Next.js to render all pages on the server or client, avoiding SSG
App.getInitialProps = async () => {
  return { pageProps: {} };
};

export default App; 