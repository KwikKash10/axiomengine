'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function FormPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<'lifetime' | 'yearly' | 'monthly'>('lifetime');

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetails(null);

      // Log the data being sent
      const checkoutData = {
        planType: selectedPlan,
      };
      
      console.log('Sending checkout data:', JSON.stringify(checkoutData, null, 2));

      // Create a Checkout Session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: selectedPlan.toLowerCase(),
        }),
      });

      // Log the response status
      console.log('Response status:', response.status);
      
      // Get the response text first to debug
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      // Try to parse the response as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        console.error('Error response:', responseData);
        setErrorDetails(responseData);
        throw new Error(responseData.error || 'Something went wrong');
      }

      const { sessionId } = responseData;
      console.log('Session ID received:', sessionId);

      // Load Stripe
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize');

      // Redirect to Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        throw error;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Get plan details based on selection
  const getPlanDetails = () => {
    switch (selectedPlan) {
      case 'lifetime':
        return {
          name: 'Lifetime Access',
          description: 'One-time payment for lifetime access',
          price: '$99.00',
          features: [
            'Lifetime access to all features',
            'No recurring payments',
            'Priority customer support',
            'Free updates forever',
          ],
        };
      case 'yearly':
        return {
          name: 'Yearly Subscription',
          description: 'Billed annually, cancel anytime',
          price: '$49.00/year',
          features: [
            'Full access to all features',
            'Annual billing',
            'Priority customer support',
            'Free updates during subscription',
          ],
        };
      case 'monthly':
        return {
          name: 'Monthly Subscription',
          description: 'Billed monthly, cancel anytime',
          price: '$14.99/month',
          features: [
            'Full access to all features',
            'Monthly billing',
            'Standard customer support',
            'Free updates during subscription',
          ],
        };
      default:
        return {
          name: 'Lifetime Access',
          description: 'One-time payment for lifetime access',
          price: '$99.00',
          features: [
            'Lifetime access to all features',
            'No recurring payments',
            'Priority customer support',
            'Free updates forever',
          ],
        };
    }
  };

  const planDetails = getPlanDetails();

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
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

          {/* Plan Selection */}
          <div className="px-6 py-8 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Select Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setSelectedPlan('lifetime')}
                className={`p-4 border rounded-lg ${
                  selectedPlan === 'lifetime'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h3 className="font-medium text-gray-900">Lifetime Access</h3>
                <p className="text-sm text-gray-500">One-time payment</p>
                <p className="mt-2 text-lg font-bold">$99.00</p>
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`p-4 border rounded-lg ${
                  selectedPlan === 'yearly'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h3 className="font-medium text-gray-900">Yearly Subscription</h3>
                <p className="text-sm text-gray-500">Billed annually</p>
                <p className="mt-2 text-lg font-bold">$49.00/year</p>
              </button>
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`p-4 border rounded-lg ${
                  selectedPlan === 'monthly'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h3 className="font-medium text-gray-900">Monthly Subscription</h3>
                <p className="text-sm text-gray-500">Billed monthly</p>
                <p className="mt-2 text-lg font-bold">$14.99/month</p>
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{planDetails.name}</h2>
                <p className="text-gray-600">{planDetails.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{planDetails.price}</p>
                <p className="text-sm text-gray-500">
                  {selectedPlan === 'lifetime' ? 'One-time payment' : 'Recurring payment'}
                </p>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {planDetails.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-700 font-medium">{error}</p>
                {errorDetails && (
                  <div className="mt-2 text-xs text-red-600">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(errorDetails, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Checkout with Stripe'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 