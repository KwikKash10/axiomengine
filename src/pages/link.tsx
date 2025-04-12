'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentLinkPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('lifetime');

  // Define payment links for each plan
  const paymentLinks = {
    monthly: 'https://buy.stripe.com/eVa3fAaUf0gX0Lu3cg',
    yearly: 'https://buy.stripe.com/8wM3fAgez9Rx0Lu28a',
    lifetime: 'https://buy.stripe.com/bIYg2m6DZbZFdyg7sx'
  };

  // Define plan details
  const planDetails = {
    monthly: {
      name: 'Monthly Subscription',
      price: '$14.99/month',
      features: [
        'Full access to all features',
        'Monthly billing',
        'Standard customer support',
        'Free updates during subscription'
      ]
    },
    yearly: {
      name: 'Yearly Subscription',
      price: '$49.00/year',
      features: [
        'Full access to all features',
        'Annual billing (save over 70%)',
        'Priority customer support',
        'Free updates during subscription'
      ]
    },
    lifetime: {
      name: 'Lifetime Access',
      price: '$99.00',
      features: [
        'Lifetime access to all features',
        'One-time payment',
        'Priority customer support',
        'Free updates forever'
      ]
    }
  };

  const handlePayment = () => {
    window.location.href = paymentLinks[selectedPlan];
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Choose Your Plan
            </h2>
            <p className="mt-2 text-xl text-gray-600">
              Select the plan that fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Monthly Plan */}
            <div 
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                selectedPlan === 'monthly' 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Plan</h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">$14.99</p>
                <p className="text-sm text-gray-500">per month</p>
                <div className="mt-4 space-y-2">
                  {planDetails.monthly.features.map((feature, i) => (
                    <div key={i} className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 text-left">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Yearly Plan */}
            <div 
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                selectedPlan === 'yearly' 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedPlan('yearly')}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Yearly Plan</h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">$49.00</p>
                <p className="text-sm text-gray-500">per year</p>
                <div className="mt-4 space-y-2">
                  {planDetails.yearly.features.map((feature, i) => (
                    <div key={i} className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 text-left">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lifetime Plan */}
            <div 
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                selectedPlan === 'lifetime' 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedPlan('lifetime')}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Lifetime Access</h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">$99.00</p>
                <p className="text-sm text-gray-500">one-time payment</p>
                <div className="mt-4 space-y-2">
                  {planDetails.lifetime.features.map((feature, i) => (
                    <div key={i} className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 text-left">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {planDetails[selectedPlan].name}
              </h3>
              <span className="font-bold text-xl text-gray-900">
                {planDetails[selectedPlan].price}
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              {selectedPlan === 'lifetime' 
                ? 'One-time payment, lifetime access' 
                : `Billed ${selectedPlan === 'monthly' ? 'monthly' : 'annually'}, cancel anytime`}
            </p>
          </div>

          <button
            onClick={handlePayment}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
} 