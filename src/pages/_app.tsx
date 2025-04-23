import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamically import AuthProvider with ssr disabled
const AuthProvider = dynamic(
  () => import('../contexts/AuthContext').then(mod => mod.AuthProvider),
  { ssr: false }
);

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render a loading state until client-side rendering is available
  if (!isClient) {
    return (
      <>
        <Head>
          <title>SECURE CHECKOUT</title>
          <meta name="description" content="Secure payment processing for your order" />
        </Head>
        {/* Show nothing or loading indicator until client-side rendering */}
      </>
    );
  }

  return (
    <AuthProvider>
      <Head>
        <title>SECURE CHECKOUT</title>
        <meta name="description" content="Secure payment processing for your order" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
} 