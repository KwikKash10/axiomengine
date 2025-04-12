'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  LinkAuthenticationElement,
  AddressElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Link from 'next/link';

// Initialize Stripe
const stripePromise = typeof window !== 'undefined' 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!) 
  : null;

// CheckoutForm component to be used inside Elements
function CheckoutForm({ planType }: { planType: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Check to see if this is a redirect back from Stripe
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    // If there's a clientSecret, it means we're coming back from a payment attempt
    if (clientSecret) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        if (!paymentIntent) return;

        switch (paymentIntent.status) {
          case 'succeeded':
            setMessage('Payment succeeded!');
            break;
          case 'processing':
            setMessage('Your payment is processing.');
            break;
          case 'requires_payment_method':
            setMessage('Your payment was not successful, please try again.');
            break;
          default:
            setMessage('Something went wrong.');
            break;
        }
      });
    }
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/success?plan=${planType}`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`.
    if (error) {
      setMessage(error.message || 'An error occurred');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
        <LinkAuthenticationElement />
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Method</h3>
        <PaymentElement />
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Shipping Address</h3>
        <AddressElement options={{ mode: 'shipping' }} />
      </div>
      
      <button 
        disabled={isLoading || !stripe || !elements} 
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        ) : (
          'Complete payment'
        )}
      </button>
      
      {message && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">{message}</p>
        </div>
      )}
    </form>
  );
}

export default function EmbeddedComponentsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'lifetime' | 'yearly' | 'monthly'>('lifetime');
  const [apiResponse, setApiResponse] = useState<any>(null);

  // Get plan details based on selection
  const getPlanDetails = () => {
    switch (selectedPlan) {
      case 'lifetime':
        return {
          name: 'Lifetime Access',
          description: 'One-time payment for lifetime access',
          price: '$99.00',
          amount: 9900, // in cents
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
          amount: 4900, // in cents
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
          amount: 1499, // in cents
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
          amount: 9900, // in cents
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

  const createPaymentIntent = async () => {
    try {
      if (typeof window === 'undefined') {
        console.error('Cannot create payment intent on server side');
        return;
      }

      setLoading(true);
      setError(null);
      setApiResponse(null);

      console.log(`Creating payment intent for plan: ${selectedPlan}`);
      console.log('Amount:', planDetails.amount);

      // Create a Payment Intent
      const response = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: planDetails.amount,
          planType: selectedPlan
        }),
      });

      // Log the response for debugging
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        setApiResponse(responseData); // Store the full response for debugging
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        console.error('Error response:', responseData);
        throw new Error(responseData.error || 'Something went wrong');
      }

      // Set the client secret
      if (responseData.clientSecret) {
        console.log('Client secret received:', responseData.clientSecret.substring(0, 10) + '...');
        setClientSecret(responseData.clientSecret);
      } else {
        console.error('No client secret in response:', responseData);
        throw new Error('No client secret received from the server');
      }
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Custom Payment Form</h1>
              <div className="w-6"></div>
            </div>
          </div>

          {/* Plan Selection */}
          {!clientSecret && (
            <div className="px-6 py-8 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Select Your Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lifetime Plan */}
                <button
                  onClick={() => setSelectedPlan('lifetime')}
                  className={`relative p-6 border rounded-lg transition-all duration-200 ${
                    selectedPlan === 'lifetime'
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">Lifetime Access</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">$99.00</p>
                    <p className="mt-1 text-sm text-gray-500">One-time payment</p>
                  </div>
                </button>

                {/* Yearly Plan */}
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`relative p-6 border rounded-lg transition-all duration-200 ${
                    selectedPlan === 'yearly'
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">Yearly Plan</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">$49.00</p>
                    <p className="mt-1 text-sm text-gray-500">per year</p>
                  </div>
                </button>

                {/* Monthly Plan */}
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`relative p-6 border rounded-lg transition-all duration-200 ${
                    selectedPlan === 'monthly'
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">Monthly Plan</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">$14.99</p>
                    <p className="mt-1 text-sm text-gray-500">per month</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Product Details */}
          <div className="px-6 py-8">
            {!clientSecret && (
              <>
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
                    
                    {/* Debug Info */}
                    {apiResponse && (
                      <div className="mt-2 text-xs text-red-600">
                        <p className="font-medium">API Response:</p>
                        <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                          {JSON.stringify(apiResponse, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Continue to Checkout Button */}
                <button
                  onClick={createPaymentIntent}
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
                    'Continue to Payment'
                  )}
                </button>
              </>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}

            {/* Stripe Elements Form */}
            {clientSecret && stripePromise && (
              <div className="mt-8">
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#3b82f6',
                        colorBackground: '#ffffff',
                        colorText: '#1f2937',
                      },
                    },
                  }}
                >
                  <CheckoutForm planType={selectedPlan} />
                </Elements>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 