'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ planType }: { planType: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success?plan=${planType}`,
      },
    });

    if (submitError) {
      setError(submitError.message ?? 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function EmbeddedPage() {
  const [clientSecret, setClientSecret] = useState<string>();
  const [planType, setPlanType] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Function to create payment intent
  const createPaymentIntent = async (plan: string) => {
    // Plan prices mapping (in cents)
    const planPrices: Record<string, number> = {
      monthly: 1499,  // $14.99
      yearly: 4900,   // $49.00
      lifetime: 9900  // $99.00
    };

    const amount = planPrices[plan as keyof typeof planPrices] || 9900;

    try {
      // Create PaymentIntent with the plan type using Netlify function
      const response = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount, 
          planType: plan 
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setError(null);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setError('Failed to initialize payment. Please try again.');
    }
  };

  // Function to handle plan selection
  const handlePlanSelect = (plan: string) => {
    setPlanType(plan);
    createPaymentIntent(plan);
  };

  useEffect(() => {
    // Get plan type from URL query parameter
    const plan = searchParams.get('plan');
    if (plan) {
      setPlanType(plan);
      createPaymentIntent(plan);
    }
  }, [searchParams]);

  // Get formatted plan name for display
  const getPlanDisplay = () => {
    const planLabels: Record<string, string> = {
      monthly: 'Monthly Subscription - $14.99/month',
      yearly: 'Yearly Subscription - $49.00/year',
      lifetime: 'Lifetime Access - $99.00 one-time'
    };
    return planLabels[planType as keyof typeof planLabels] || 'Unknown Plan';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Embedded Payment Form
            </h2>
            {planType && (
              <h3 className="text-xl font-semibold text-gray-800 mt-2">
                {getPlanDisplay()}
              </h3>
            )}
            <p className="mt-2 text-gray-600">
              Complete your payment using the form below
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!planType && (
            <div className="space-y-6">
              <p className="text-center font-medium text-gray-700">Please select a subscription plan:</p>
              
              <div className="grid gap-4">
                <button
                  onClick={() => handlePlanSelect('monthly')}
                  className="bg-white border border-gray-300 rounded-lg p-4 text-left hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Monthly Plan</h3>
                    <span className="text-blue-600 font-bold">$14.99/month</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">Billed monthly, cancel anytime</p>
                </button>
                
                <button
                  onClick={() => handlePlanSelect('yearly')}
                  className="bg-white border border-gray-300 rounded-lg p-4 text-left hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Yearly Plan</h3>
                    <span className="text-blue-600 font-bold">$49.00/year</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">Save over 70% compared to monthly</p>
                </button>
                
                <button
                  onClick={() => handlePlanSelect('lifetime')}
                  className="bg-white border border-gray-300 rounded-lg p-4 text-left hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Lifetime Access</h3>
                    <span className="text-blue-600 font-bold">$99.00</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">One-time payment, lifetime access</p>
                </button>
              </div>
            </div>
          )}

          {clientSecret && planType && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm planType={planType} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
} 