import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Link from 'next/link';
import { FiChevronLeft, FiCreditCard, FiLock, FiCheckCircle } from 'react-icons/fi';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// CheckoutForm component that uses the newer PaymentElement
function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentMethodTypes, setPaymentMethodTypes] = useState<string[]>([]);

  useEffect(() => {
    if (elements) {
      // Listen to ready event to know when payment methods are available
      const paymentElement = elements.getElement('payment');
      if (paymentElement) {
        paymentElement.on('ready', (event: any) => {
          if (event.availablePaymentMethods) {
            setPaymentMethodTypes(event.availablePaymentMethods.map((m: any) => m.type));
            console.log("Available payment methods:", event.availablePaymentMethods);
          }
        });
      }
    }
  }, [elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/success?source=payment_element',
        payment_method_data: {
          billing_details: {
            address: {
              city: "Not provided",
              line1: "Not provided",
              line2: "Not provided"
            }
          }
        }
      },
      redirect: 'if_required',
    });

    if (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'An error occurred during payment');
      setIsLoading(false);
    } else {
      // Payment succeeded with no redirect
      console.log('Payment succeeded!');
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
        
        {/* Payment Element - the new unified component */}
        <PaymentElement 
          options={{
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
                phone: 'auto',
                address: {
                  country: 'auto',
                  postalCode: 'auto',
                  line1: 'never',
                  line2: 'never',
                  city: 'never',
                  state: 'auto',
                }
              }
            },
            terms: {
              bancontact: 'never',
              card: 'never',
              ideal: 'never',
              sepaDebit: 'never',
              sofort: 'never',
              auBecsDebit: 'never',
            },
            business: {
              name: 'Getino Pro'
            },
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
              radios: false,
              spacedAccordionItems: true
            }
          }}
        />

        {/* Error message */}
        {errorMessage && (
          <div className="rounded-md bg-red-50 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods Info */}
        {paymentMethodTypes.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            <p className="mb-2">Available payment methods:</p>
            <div className="flex flex-wrap gap-2">
              {paymentMethodTypes.map(type => (
                <span key={type} className="px-2 py-1 bg-gray-100 rounded-md">{type}</span>
              ))}
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="w-full mt-6 bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <FiLock className="mr-2" />
              Pay $49.99
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function PaymentElementPage() {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create payment intent to get client secret
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            amount: 4999, 
            planType: 'monthly',
            userCurrency: 'USD',
            convertedAmount: 4999
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, []);

  const handleSuccess = () => {
    setPaymentSuccess(true);
    // Redirect to success page after a short delay
    setTimeout(() => {
      router.push('/success?source=payment_element');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-8">
          <Link href="/stripe-methods" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <FiChevronLeft className="mr-1" />
            Back to all methods
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Stripe Payment Element Demo
          </h1>
          <p className="text-gray-600">
            Unified payment component with multiple payment methods
          </p>
        </div>

        {/* Payment form or success message */}
        {paymentSuccess ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-green-100 rounded-full">
              <FiCheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-4 text-lg font-medium text-gray-900">Payment Successful!</h2>
            <p className="mt-2 text-gray-600">Your payment has been processed successfully.</p>
            <p className="mt-1 text-gray-500">Redirecting you to the success page...</p>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Preparing payment options...</p>
          </div>
        ) : clientSecret ? (
          <Elements 
            options={{ 
              clientSecret,
              appearance: { 
                theme: 'stripe',
                variables: {
                  colorPrimary: '#3B82F6',
                  colorBackground: '#ffffff',
                  colorText: '#1F2937',
                  colorDanger: '#EF4444',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  spacingUnit: '4px',
                  borderRadius: '8px',
                },
                rules: {
                  '.Tab': {
                    border: '1px solid #E5E7EB',
                    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                  },
                  '.Tab--selected': {
                    borderColor: '#3B82F6',
                    boxShadow: '0px 1px 2px rgba(59, 130, 246, 0.2)',
                  },
                  '.Input': {
                    border: '1px solid #E5E7EB',
                    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                  }
                }
              },
              loader: 'auto'
            }}
            stripe={stripePromise}
          >
            <CheckoutForm onSuccess={handleSuccess} />
          </Elements>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-red-600">Failed to load payment form. Please try again later.</p>
          </div>
        )}

        {/* Payment methods help message */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
          <p className="text-xs text-blue-800 flex items-start">
            <FiCreditCard className="flex-shrink-0 h-4 w-4 mr-2 mt-0.5" />
            <span>
              <strong>About Payment Element:</strong> Stripe's Payment Element is a unified component that automatically shows relevant payment methods for the customer's location and transaction. It's more flexible than the older Card Element and better optimizes the checkout experience.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}


// This ensures the page is always server-rendered and not statically generated
export const getServerSideProps = async () => {
  return {
    props: {}
  };
};
