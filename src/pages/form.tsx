'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Create a client-side only component to handle Stripe loading
const StripeCheckoutForm = dynamic(
  () => import('../components/StripeCheckoutForm'),
  { ssr: false }
);

export default function FormPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // During SSR, return minimal layout
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
                <div className="w-6"></div>
              </div>
            </div>
            <div className="px-6 py-8">
              <p>Loading checkout form...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Client-side rendering - render the full form
  return <StripeCheckoutForm />;
} 