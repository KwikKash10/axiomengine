'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ClientOnly from '../components/ClientOnly';
import { FiCheckCircle, FiArrowLeft } from 'react-icons/fi';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const plan = searchParams.get('plan') as 'monthly' | 'yearly' | 'lifetime' | null;
  
  // Get plan name
  const getPlanName = () => {
    switch (plan) {
      case 'monthly':
        return 'Monthly Subscription';
      case 'yearly':
        return 'Yearly Subscription';
      case 'lifetime':
        return 'Lifetime Access';
      default:
        return 'Premium Plan';
    }
  };
  
  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-6">
            <FiCheckCircle className="h-6 w-6 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for your purchase of the {getPlanName()}. Your account has been upgraded.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              We've sent a confirmation email with your receipt and account details.
            </p>
          </div>
          
          <Link 
            href="https://getino.app/dashboard" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Dashboard
          </Link>
          
          <div className="mt-4">
            <Link 
              href="https://getino.app/pricing" 
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
              <FiArrowLeft className="mr-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
} 

// This ensures the page is always server-rendered and not statically generated
export const getServerSideProps = async () => {
  return {
    props: {}
  };
};
