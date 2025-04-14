'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutPageWrapper from '../components/CheckoutPageWrapper';
import LoadingDots from '../components/LoadingDots';
import { 
  FiCheck, FiLock, FiAlertCircle, FiCreditCard, FiShield, 
  FiArrowLeft, FiUsers, FiStar, FiClock, FiAward, FiThumbsUp,
  FiCheckCircle, FiCheckSquare, FiDollarSign, FiSlash, FiBarChart2, FiX,
  FiRotateCcw, FiSearch, FiFileText, FiPhone, FiBell, FiCalendar,
  FiTrendingUp, FiFilter, FiLink, FiMail, FiInbox, FiUnlock,
  FiPackage, FiRefreshCw, FiHeadphones, FiGift, FiZap, FiInfo, 
  FiChevronUp, FiChevronDown
} from 'react-icons/fi';
import { BsCash } from 'react-icons/bs';

const CHECKOUT_LINKS = {
  monthly: 'https://checkout.stripe.com/c/pay/cs_live_a1WqFaE8YcF8v3wMWRoGDfXyqkGzVdoXeBOlx5sKP6AQGEwzKBR4Jq5Hs#fidkdWxOYHwnPyd1blpxYHZxWjA0TjE0PW1PTVdTPXZ1YzVUbTJra21hZGNvQTVqNmZoYWxQQ3NXaE1IZEZyVjZpMVZzSDZXNTVscGR8NWdBZHdTYUhqfGtyXFdwkGJgNTVzM3YzYnVnTmRqNTVgYGRhaicpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',
  yearly: 'https://checkout.stripe.com/c/pay/cs_live_a1BoHrnLlCLF8v3wMWRoGDfXyqkGzVdoXeBOlx5sKP6AQGEwzKBR4Jq5Hs#fidkdWxOYHwnPyd1blpxYHZxWjA0TjE0PW1PTVdTPXZ1YzVUbTJra21hZGNvQTVqNmZoYWxQQ3NXaE1IZEZyVjZpMVZzSDZXNTVscGR8NWdBZHdTYUhqfGtyXFdwkGJgNTVzM3YzYnVnTmRqNTVgYGRhaicpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',
  lifetime: 'https://checkout.stripe.com/c/pay/cs_live_a1jYUJpRZoOxKrAMNfhJtL2GLWlxVVXZPQZBGFHSWRYBYQDGGKDR4Jq5Hs#fidkdWxOYHwnPyd1blpxYHZxWjA0TjE0PW1PTVdTPXZ1YzVUbTJra21hZGNvQTVqNmZoYWxQQ3NXaE1IZEZyVjZpMVZzSDZXNTVscGR8NWdBZHdTYUhqfGtyXFdwkGJgNTVzM3YzYnVnTmRqNTVgYGRhaicpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl'
};

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isValidPlan, setIsValidPlan] = useState(false);
  const [showTestimonials, setShowTestimonials] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null); // State for FAQ accordion

  const plan = searchParams.get('plan') as 'monthly' | 'yearly' | 'lifetime' | null;
  const couponCode = searchParams.get('coupon') || '';

  // Check for valid plan
  useEffect(() => {
    if (plan) {
      setSelectedPlan(plan);
      setIsValidPlan(true);
    } else {
      // Set a default plan instead of showing an error
      setSelectedPlan(null);
      setIsValidPlan(false);
      // Don't update URL if there's no plan
    }
  }, [plan, router]);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    // Set default selected plan to 'lifetime' when component mounts
    if (!selectedPlan) {
      setSelectedPlan('Lifetime');
    }
  }, [selectedPlan]);

  // Handle checkout
  const handleCheckout = async () => {
    setLoading(true);
    setErrorDetails(null);
    setError(null);
  
    try {
      // Ensure we have a valid plan selected
      if (!selectedPlan) {
        setError('Please select a plan to continue');
        setErrorDetails('No plan selected');
        setLoading(false);
        return;
      }
      
      // Prepare data for API
      const checkoutData = {
        planType: selectedPlan.toLowerCase(),
      };
      
      console.log('Sending checkout data:', JSON.stringify(checkoutData, null, 2));
  
      // Call API to create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });
  
      // Check if response is OK
      if (!response.ok) {
        const errorStatus = response.status;
        let errorText = '';
        
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Unable to read error response';
        }
        
        console.error(`Error response from server: ${errorStatus}`, errorText);
        throw new Error(`Server returned ${errorStatus}: ${errorText.substring(0, 100)}`);
      }
      
      // Try to parse JSON response
      let responseData;
      try {
        responseData = await response.json();
      } catch (error) {
        const responseText = await response.text();
        console.error('Invalid JSON response:', responseText.substring(0, 100) + '...');
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
      }
  
      // Check for direct URL from Stripe (preferred method)
      if (responseData.url) {
        console.log('Redirecting to Stripe URL:', responseData.url);
        window.location.href = responseData.url;
        return;
      }
      
      // Fallback to session ID if URL not provided
      if (!responseData.sessionId) {
        console.error('Missing sessionId in response:', responseData);
        throw new Error('Missing session ID in response');
      }
  
      // Redirect to checkout using session ID
      const stripeUrl = `https://checkout.stripe.com/c/pay/${responseData.sessionId}`;
      console.log('Redirecting to Stripe:', stripeUrl);
      window.location.href = stripeUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      setError('Error creating checkout session');
      setErrorDetails(error.message || 'Error creating checkout session');
    } finally {
      setLoading(false);
    }
  };

  // Get plan details
  const getPlanDetails = () => {
    switch (plan) {
      case 'monthly':
        return {
          name: 'Monthly Plan',
          price: '$14.99',
          period: 'month',
          features: [
            'Full access to all features',
            'Monthly billing',
            'Standard customer support',
            'Free updates during subscription'
          ],
          savings: 'No long-term commitment',
          popular: true,
          recommended: false
        };
      case 'yearly':
        return {
          name: 'Yearly Plan',
          price: '$49.00',
          period: 'year',
          features: [
            'Full access to all features',
            'Annual billing (save over 73%)',
            'Priority customer support',
            'Free updates during subscription'
          ],
          savings: 'Save $299 compared to monthly plan',
          popular: false,
          recommended: true
        };
      default:
        return {
          name: 'Lifetime',
          price: '$99.00',
          period: 'one-time',
          features: [
            'Lifetime access to all features',
            'No recurring payments',
            'Priority customer support',
            'Free updates forever',
          ],
          savings: 'Pay once, use forever',
          popular: false,
          recommended: false,
          special: true
        };
    }
  };

  // Testimonials for social proof
  const testimonials = [
    {
      name: "James K.",
      role: "Warehouse Worker",
      content: "Paid for itself in a day. Incredible value for the price.",
      stars: 5,
      verified: true,
      date: "2 days ago",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60"
    },
    {
      name: "Dana R.",
      role: "Remote Worker",
      content: "Best investment this year. The opportunities are high-quality and the support is excellent.",
      stars: 5,
      verified: true,
      date: "1 week ago",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60"
    },
    {
      name: "Michael T.",
      role: "Student",
      content: "The premium features are definitely worth it! I've found incredible opportunities that have helped me earn while studying.",
      stars: 4,
      verified: true,
      date: "2 weeks ago",
      image: "https://images.unsplash.com/photo-1517070208541-6ddc4d3efbcb?w=150&auto=format&fit=crop&q=60"
    },
    {
      name: "Sarah J.",
      role: "Freelancer",
      content: "Made $2,000 in my first month! The opportunities are high-quality and legitimate.",
      stars: 4,
      verified: true,
      date: "1 month ago",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&auto=format&fit=crop&q=60"
    },
    {
      name: "Robert L.",
      role: "Part-time Worker",
      content: "The yearly plan is a no-brainer. I've saved so much compared to the monthly plan and the features are amazing.",
      stars: 5,
      verified: true,
      date: "2 months ago",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60"
    }
  ];

  const planDetails = getPlanDetails();

  // Function to toggle FAQ item
  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "What's included in the free trial?",
      answer: "The 14-day free trial includes all premium features, giving you full access to test everything the platform has to offer."
    },
    {
      question: "Can I switch plans later?",
      answer: (
        <>
          Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.
        </>
      )
    },
    {
      question: "How do I cancel my subscription?",
      answer: (
        <>
          You can cancel your subscription at any time from your account settings. 
          Your premium access will continue until the end of your current billing period.
        </>
      )
    }
  ];

  return (
    <CheckoutPageWrapper>
      <div className="min-h-screen bg-[#f3f4f7] py-8 px-6 sm:px-10">
        <div className="w-full">
          {/* Back button */}
          <div className="mb-4">
            <Link href="https://getino.app/pricing" className="flex items-center text-gray-600 hover:text-gray-900">
              <FiArrowLeft className="mr-2" />
              Back to Pricing
            </Link>
          </div>

          {/* Limited time offer banner */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-lg mb-4 shadow-md">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-2 sm:mb-0">
                <FiClock className="mr-2 h-5 w-5" />
                <span className="font-medium">Limited Time Offer!</span>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-sm">Expires in <span className="font-bold">{formatTime(timeLeft)}</span></p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column - Payment form */}
            <div className="w-full md:flex-[0.63]">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">Complete Your Purchase</h2>
                
                {/* Plan Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 text-center">You're just one step away from unlocking premium features</h3>
                  <div className="space-y-4">
                    <div 
                      onClick={() => {
                        if (plan === 'monthly') {
                          // If already selected, clear selection
                          router.push('/', { scroll: false });
                        } else {
                          router.push('/?plan=monthly', { scroll: false });
                        }
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        plan === 'monthly' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">Monthly Plan</h4>
                          <p className="text-sm text-gray-500">Billed monthly</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">$14.99</p>
                          <p className="text-sm text-gray-500">/month</p>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={() => {
                        if (plan === 'yearly') {
                          // If already selected, clear selection
                          router.push('/', { scroll: false });
                        } else {
                          router.push('/?plan=yearly', { scroll: false });
                        }
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        plan === 'yearly' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">Yearly Plan</h4>
                          <p className="text-sm text-gray-500">Billed annually (save over 73%)</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">$49.00</p>
                          <p className="text-sm text-gray-500">/year</p>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={() => {
                        if (plan === 'lifetime') {
                          // If already selected, clear selection
                          router.push('/', { scroll: false });
                        } else {
                          router.push('/?plan=lifetime', { scroll: false });
                        }
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        plan === 'lifetime' 
                          ? 'border-amber-500 bg-amber-50' 
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">Lifetime</h4>
                          <p className="text-sm text-gray-500">One-time payment</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">$99.00</p>
                          <p className="text-sm text-gray-500">Once</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {plan && selectedPlan && (
                  <>
                {/* Order summary */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                  <dl className="space-y-4">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm font-medium text-gray-600">Plan</dt>
                      <dd className="text-sm font-medium text-gray-900 flex items-center">
                        {planDetails.name}
                        {planDetails.popular && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-normal ml-2">
                            Popular
                          </span>
                        )}
                        {planDetails.recommended && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-normal ml-2">
                            Recommended
                          </span>
                        )}
                        {planDetails.special && (
                          <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-xs font-normal ml-2">
                            Best Value
                          </span>
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm font-medium text-gray-600">Billing</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {plan === 'lifetime' ? 'One-time payment' : plan === 'yearly' ? 'Annual' : 'Per month'}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm font-medium text-gray-600">Price</dt>
                      <dd className="text-sm font-medium text-gray-900">{planDetails.price}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm font-medium text-gray-600">VAT</dt>
                      <dd className="text-sm font-medium text-gray-900">incl.</dd>
                    </div>
                    {couponCode && (
                      <div className="flex items-center justify-between">
                        <dt className="text-sm font-medium text-gray-600">Coupon</dt>
                        <dd className="text-sm font-medium text-green-600">{couponCode}</dd>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <dt className="text-base font-medium text-gray-900">Total</dt>
                        <dd className="text-base font-medium text-gray-900">{planDetails.price}</dd>
                      </div>
                          <div className="flex items-center justify-between text-sm mt-2">
                            <dt className="font-light text-green-600">You save</dt>
                            <dd className="font-light text-green-600">
                              {plan === 'monthly' && 'No long-term commitment'}
                              {plan === 'yearly' && '$130.88 compared to monthly plan'}
                              {plan === 'lifetime' && 'Pay once, use forever'}
                            </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* Payment form placeholder - REMOVED */}
                
                {/* Checkout button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading || !isValidPlan}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center"
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
                    <>
                      <FiCreditCard className="mr-2" />
                      Proceed to Secure Payment
                    </>
                  )}
                </button>

                {/* Security notice */}
                <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-start">
                    <FiShield className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Your payment information is secure</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        We use industry-standard encryption to protect your data. Your payment information is processed securely with PCI Service Provider Level 1, the highest grade of payment processing security.
                      </p>
                    </div>
                  </div>
                    </div>

                    {/* Social proof section - user stats */}
                    <div className="mt-5 bg-blue-50 rounded-lg p-4 flex flex-col sm:flex-row justify-around items-center">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <FiUsers className="text-blue-600 mr-2" />
                        <span className="text-sm font-medium">5,000+ active users</span>
                      </div>
                      <div className="flex items-center mb-3 sm:mb-0">
                        <FiStar className="text-blue-600 mr-2" />
                        <span className="text-sm font-medium">4.8/5 average rating</span>
                      </div>
                      <div className="flex items-center">
                        <FiThumbsUp className="text-blue-600 mr-2" />
                        <span className="text-sm font-medium">96% satisfaction</span>
                      </div>
                    </div>

                    <div className="text-center mt-3">
                      <p className="text-sm text-gray-500">
                        By proceeding, you agree to our{' '}
                        <a href="https://getino.app/terms" className="text-blue-600 hover:text-blue-500">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="https://getino.app/privacy" className="text-blue-600 hover:text-blue-500">
                          Privacy Policy
                        </a>
                      </p>
                    </div>

                    {/* Trust signals */}
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <div className="flex flex-wrap justify-center items-center gap-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <FiLock className="h-4 w-4 mr-1 text-gray-400" />
                          <span>Secure checkout</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiShield className="h-4 w-4 mr-1 text-gray-400" />
                          <span>SSL Encrypted</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiCreditCard className="h-4 w-4 mr-1 text-gray-400" />
                          <span>Trusted Payment</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiRotateCcw className="h-4 w-4 mr-1 text-gray-400" />
                          <span>Cancel Anytime</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiFileText className="h-4 w-4 mr-1 text-gray-400" />
                          <span>No Hidden Fees, Ever</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiShield className="h-4 w-4 mr-1 text-gray-400" />
                          <span>PCI Compliant</span>
                        </div>
                      </div>
                      
                      {/* Money-back guarantee card */}
                      <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-100">
                        <div className="flex items-start">
                          <FiCheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-green-800">100% Satisfaction Guarantee</h4>
                            <p className="text-xs text-green-700 mt-1">
                              If you're not completely satisfied with your purchase, we'll refund your payment within 30 days, no questions asked.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error message */}
                    {error && (
                      <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                        <p className="flex items-center">
                          <FiAlertCircle className="mr-2" />
                          {error}
                        </p>
                        {errorDetails && (
                          <div className="mt-2 text-xs">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(errorDetails, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Secure Payment Methods section - directly below the Complete Your Order box */}
              <div className="rounded-lg bg-transparent p-3 mt-3">
                <h3 className="text-lg font-semibold text-[#374151] mb-4 text-center">
                  Secure Payment Methods
                </h3>
                <div className="flex justify-center items-center gap-4">
                  <img src="/secure payment methods/visa.svg" alt="Visa" className="h-8 rounded-md transition-all duration-200 hover:scale-110 hover:shadow-md" />
                  <img src="/secure payment methods/mastercard.svg" alt="Mastercard" className="h-8 rounded-md transition-all duration-200 hover:scale-110 hover:shadow-md" />
                  <img src="/secure payment methods/maestro.svg" alt="Maestro" className="h-8 rounded-md transition-all duration-200 hover:scale-110 hover:shadow-md" />
                  <img src="/secure payment methods/amex.svg" alt="American Express" className="h-8 rounded-md transition-all duration-200 hover:scale-110 hover:shadow-md" />
                  <img src="/secure payment methods/discover.svg" alt="Discover" className="h-8 rounded-md transition-all duration-200 hover:scale-110 hover:shadow-md" />
                  <img src="/secure payment methods/diners.svg" alt="Diners Club" className="h-8 rounded-md transition-all duration-200 hover:scale-110 hover:shadow-md" />
                  <img src="/secure payment methods/cartes-bancaires.svg" alt="Cartes Bancaires" className="h-8 rounded-md transition-all duration-200 hover:scale-110 hover:shadow-md" />
                  <img src="/secure payment methods/apple-pay.svg" alt="Apple Pay" className="h-8 rounded-md transition-all duration-200 hover:scale-110 hover:shadow-md" />
                  <img src="/secure payment methods/google-pay.svg" alt="Google Pay" className="h-8 rounded-md transition-all duration-200 hover:scale-110 hover:shadow-md" />
                </div>

                {/* Need help choosing section - MOVED & STYLED */}
                <div className="text-center mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-base font-medium text-[#1e293b] mb-2">Need help choosing the right plan?</h3>
                  <a
                    href="https://getino.app/support"
                    className="text-[#2663eb] hover:text-blue-500 transition-colors duration-200 text-base font-medium inline-flex items-center"
                  >
                    Contact support
                  </a>
                </div>
              </div>
            </div>

            {/* Right column - Plan details */}
            <div className="w-full md:flex-[0.37] md:flex md:justify-end">
              <div className="space-y-6 w-[95%]">
                {/* Plan details card */}
                <div className="rounded-lg shadow overflow-hidden bg-white border border-gray-100 relative">
                  <div className="p-6">
                    {plan && selectedPlan ? (
                      <>
                    {/* Plan name */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{planDetails.name}</h3>
                    
                    {/* Plan tags as diagonal banners */}
                    {planDetails.popular && (
                      <div className="absolute top-4 right-[-35px] w-[140px] transform rotate-45 bg-blue-100 text-blue-800 text-xs text-center py-1 font-normal shadow-sm z-10 overflow-hidden border-t border-b border-blue-200">
                        <span className="pl-1">Popular</span>
                      </div>
                    )}
                    {planDetails.recommended && (
                      <div className="absolute top-8 right-[-40px] w-[160px] transform rotate-45 bg-green-100 text-green-800 text-xs text-center py-1 font-normal shadow-sm z-10 overflow-hidden border-t border-b border-green-200">
                        <span className="pr-[0.625rem] flex items-center justify-center">Recommended</span>
                      </div>
                    )}
                    {planDetails.special && (
                      <div className="absolute top-5 right-[-36px] w-[140px] transform rotate-45 bg-amber-100 text-amber-800 text-xs text-center py-1 font-normal shadow-sm z-10 overflow-hidden border-t border-b border-amber-200">
                        <span>Best Value</span>
                      </div>
                    )}
                    
                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-gray-900">{planDetails.price}</span>
                      {plan !== 'lifetime' && <span className="text-gray-500 text-sm">/{plan === 'yearly' ? 'year' : 'month'}</span>}
                    </div>
                    
                    {/* Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Features included:</h4>
                      <ul className="space-y-2">
                            {plan === 'monthly' && (
                              <>
                                <li className="flex items-start">
                                  <FiUnlock className={`h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Full access to all opportunities</span>
                                </li>
                                <li className="flex items-start">
                                  <FiFilter className={`h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Advanced search with filters</span>
                                </li>
                                <li className="flex items-start">
                                  <FiBarChart2 className={`h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Detailed Earnings Reports</span>
                                </li>
                                <li className="flex items-start">
                                  <FiFileText className={`h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Detailed instructions & direct links</span>
                                </li>
                                <li className="flex items-start">
                                  <FiAward className={`h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Priority support</span>
                                </li>
                                <li className="flex items-start">
                                  <FiTrendingUp className={`h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Earnings tracking & analytics</span>
                                </li>
                                <li className="flex items-start">
                                  <FiBell className={`h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Push notifications</span>
                                </li>
                                <li className="flex items-start">
                                  <FiInbox className={`h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Weekly opportunity digest</span>
                                </li>
                                <li className="flex items-start">
                                  <FiPhone className={`h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Provider contact information</span>
                                </li>
                                <li className="flex items-start">
                                  <FiAlertCircle className={`h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Custom opportunity alerts</span>
                                </li>
                                <li className="flex items-start">
                                  <FiUsers className={`h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Premium community features</span>
                                </li>
                                <li className="flex items-start">
                                  <FiRefreshCw className={`h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Free updates during subscription</span>
                                </li>
                              </>
                            )}
                            {plan === 'yearly' && (
                              <>
                                <li className="flex items-start">
                                  <FiPackage className={`h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">All monthly features</span>
                                </li>
                                <li className="flex items-start">
                                  <BsCash className={`h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Save over 73% compared to monthly</span>
                                </li>
                                <li className="flex items-start">
                                  <FiClock className={`h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Early access to new features</span>
                                </li>
                                <li className="flex items-start">
                                  <FiHeadphones className={`h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">VIP support</span>
                                </li>
                                <li className="flex items-start">
                                  <FiGift className={`h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Exclusive opportunities</span>
                                </li>
                                <li className="flex items-start">
                                  <FiRefreshCw className={`h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Free updates during subscription</span>
                                </li>
                              </>
                            )}
                            {plan === 'lifetime' && (
                              <>
                                <li className="flex items-start">
                                  <FiPackage className={`h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">All yearly features</span>
                                </li>
                                <li className="flex items-start">
                                  <BsCash className={`h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Never pay again</span>
                                </li>
                                <li className="flex items-start">
                                  <FiRefreshCw className={`h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Lifetime updates forever</span>
                                </li>
                                <li className="flex items-start">
                                  <FiHeadphones className={`h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Premium support</span>
                                </li>
                                <li className="flex items-start">
                                  <FiZap className={`h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Early access to all new features</span>
                                </li>
                                <li className="flex items-start">
                                  <FiUsers className={`h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">Exclusive community access</span>
                                </li>
                                <li className="flex items-start">
                                  <FiCreditCard className={`h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5`} />
                                  <span className="text-xs text-gray-600">No recurring payments</span>
                          </li>
                              </>
                            )}
                      </ul>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="mx-auto h-12 w-12 text-[#d4a373] mb-4">
                          <FiPackage className="h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a plan</h3>
                        <p className="text-gray-500">Select a plan to see detailed features and pricing</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Limited availability card */}
                <div className="rounded-lg bg-blue-50 overflow-hidden border border-blue-100">
                  <div className="flex items-center p-4">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiClock className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 text-base">Limited availability!</h4>
                      <p className="text-blue-700 text-sm">Only <span className="font-bold">10</span> spots left.</p>
                    </div>
                  </div>
                </div>

                {/* Money-back guarantee card */}
                <div className="rounded-lg bg-green-50 overflow-hidden border border-green-100">
                  <div className="flex items-center p-4">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                        <FiShield className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-800 text-xs md:text-sm">30-Day Money-Back Guarantee</h4>
                      <p className="text-gray-600 text-xs mt-2">Not satisfied? Get a full refund, no questions asked.</p>
                    </div>
                  </div>
                </div>

                {/* Why choose Getino Premium? */}
                <div className="rounded-lg shadow-md border border-gray-200 overflow-hidden bg-white mt-4">
                  <div className="p-6">
                    <h4 className="text-base font-semibold text-gray-900 mb-4">Why choose Getino Premium?</h4>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                          <FiStar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900">Higher quality opportunities</h5>
                          <p className="text-sm text-gray-500">Access vetted, high-paying opportunities not available to free users</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                          <FiUsers className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900">Premium community</h5>
                          <p className="text-sm text-gray-500">Connect with successful members and share strategies</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                          <FiAward className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900">Priority support</h5>
                          <p className="text-sm text-gray-500">Get help when you need it with priority customer service</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonials for the right column */}
                <div className="rounded-lg shadow overflow-hidden bg-white border border-gray-100 mt-6">
                  <div className="p-6">
                    {/* Avatar circles representing users */}
                    <div className="flex -space-x-2 mb-4 justify-center">
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm relative z-50">
                        <img 
                          src="https://randomuser.me/api/portraits/women/18.jpg" 
                          alt="User" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm relative z-40">
                        <img 
                          src="https://randomuser.me/api/portraits/men/45.jpg" 
                          alt="User" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm relative z-30">
                        <img 
                          src="https://randomuser.me/api/portraits/women/68.jpg" 
                          alt="User" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm relative z-20">
                        <img 
                          src="https://randomuser.me/api/portraits/men/22.jpg" 
                          alt="User" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm relative z-10">
                        <img 
                          src="https://randomuser.me/api/portraits/women/88.jpg" 
                          alt="User" 
                          className="w-full h-full object-cover object-right"
                        />
                      </div>
                      <div className="w-10 w-14 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-sm relative z-0">
                        +1.2K
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-sm font-bold flex items-center justify-center">
                        <FiUsers className="mr-2 text-blue-500" />
                        Join over 5,000 active users
                      </h3>



                      <button 
                        onClick={() => setShowTestimonials(!showTestimonials)}
                        className="mt-2 mx-auto text-blue-500 hover:text-blue-700 text-sm flex items-center justify-center w-6 h-6"
                        aria-label={showTestimonials ? "Hide reviews" : "Show reviews"}
                      >
                        {showTestimonials ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                    </div>
                    
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showTestimonials ? 'opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                      <div className="space-y-3">
                        {testimonials.slice(0, 5).map((testimonial, index) => (
                          <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs font-medium text-gray-700">
                                {testimonial.name}
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                {testimonial.verified && (
                                  <span className="flex items-center mr-2 text-green-600">
                                    Verified
                                  </span>
                                )}
                                <span>{testimonial.date}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 italic mb-1">
                              {testimonial.name === "James K." && 
                                <>"<strong>Paid for itself in a day</strong>. Incredible value for the price."</>
                              }
                              {testimonial.name === "Dana R." && 
                                <>"<strong>Best investment this year</strong>. The opportunities are high-quality and the support is excellent."</>
                              }
                              {testimonial.name === "Michael T." && 
                                <>"The premium features are definitely worth it! I've <strong>found incredible opportunities</strong> that have helped me earn while studying."</>
                              }
                              {testimonial.name === "Sarah J." && 
                                <>"<strong>Made $2,000 in my first month!</strong> The opportunities are high-quality and legitimate."</>
                              }
                              {testimonial.name === "Robert L." && 
                                <>"The yearly plan is a no-brainer. I've saved so much compared to the monthly plan and <strong>the features are amazing</strong>."</>
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      {/* Total rating and reviews section */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex mr-2">
                              {/* First 4 full stars */}
                              {[...Array(4)].map((_, i) => (
                                <FiStar 
                                  key={i} 
                                  className="h-4 w-4 text-amber-400 fill-amber-400" 
                                />
                              ))}
                              {/* Half-filled 5th star */}
                              <div className="relative h-4 w-4">
                                {/* Empty star as background */}
                                <FiStar className="h-4 w-4 text-amber-400 absolute" />
                                {/* Half-filled star using overflow hidden */}
                                <div className="absolute overflow-hidden w-[50%] h-4">
                                  <FiStar className="h-4 w-4 text-amber-400 fill-amber-400" />
                                </div>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-gray-700">4.8</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Based on <span className="font-medium">347 reviews</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges and icons section */}
          <div className="mt-10">
            {/* Benefits section */}
            <div className="pt-8 pb-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center">
                    <FiZap className="h-6 w-6 text-[#1e293b]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[#1e293b] mb-2">Instant Access</h3>
                <p className="text-[#475569] text-sm">Get started immediately with your chosen plan</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center">
                    <FiClock className="h-6 w-6 text-[#1e293b]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[#1e293b] mb-2">Cancel Anytime</h3>
                <p className="text-[#475569] text-sm">No long-term commitments required</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center">
                    <FiAward className="h-6 w-6 text-[#1e293b]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[#1e293b] mb-2">Money-Back Guarantee</h3>
                <p className="text-[#475569] text-sm">30-day satisfaction guarantee</p>
              </div>
            </div>
            
            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto py-12">
              <h2 className="text-2xl font-bold text-center text-[#1e293b] mb-8">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="py-2">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full text-center text-gray-700 hover:text-gray-900 focus:outline-none"
                    >
                      <h3 className="text-lg font-medium">{faq.question}</h3>
                    </button>
                    {openFAQ === index && (
                      <div className="mt-3 px-4 text-center">
                        <p className="text-base text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 pb-4 border-t border-[#f3f4f7]">
              <div className="flex flex-wrap justify-center items-center gap-3 mb-4">
                <div>
                  <img 
                    src="/security badges/ssl-256bit-secured.svg" 
                    alt="SSL Secured" 
                    className="h-10 object-contain transition-all duration-200 hover:scale-105 hover:brightness-110 hover:shadow-sm"
                  />
                </div>
                <div>
                  <img 
                    src="/security badges/pci-compliant-badge.svg" 
                    alt="PCI Compliant" 
                    className="h-10 object-contain transition-all duration-200 hover:scale-105 hover:brightness-110 hover:shadow-sm"
                  />
                </div>
                <div>
                  <img 
                    src="/security badges/verified-by-visa.svg" 
                    alt="Verified by VISA" 
                    className="h-10 object-contain transition-all duration-200 hover:scale-105 hover:brightness-110 hover:shadow-sm"
                  />
                </div>
                <div>
                  <img 
                    src="/security badges/mcafee-secure.svg" 
                    alt="McAfee Secure" 
                    className="h-10 object-contain transition-all duration-200 hover:scale-105 hover:brightness-110 hover:shadow-sm"
                  />
                </div>
                <div>
                  <img 
                    src="/security badges/norton-secured.svg" 
                    alt="Norton Secured" 
                    className="h-10 object-contain transition-all duration-200 hover:scale-105 hover:brightness-110 hover:shadow-sm"
                  />
                </div>
                <div>
                  <img 
                    src="/security badges/secure-checkout.svg" 
                    alt="Secure Checkout" 
                    className="h-10 object-contain transition-all duration-200 hover:scale-105 hover:brightness-110 hover:shadow-sm"
                  />
                </div>
                <div>
                  <img 
                    src="/security badges/secure-payment-badge.svg" 
                    alt="Secure Payment" 
                    className="h-10 object-contain transition-all duration-200 hover:scale-105 hover:brightness-110 hover:shadow-sm"
                  />
                </div>
              </div>
              
              <div className="text-center mt-6">
                <p className="text-[#4b5563] font-light">Your payment is secure and encrypted. We never store your card details.</p>
              </div>
              
              <div className="flex justify-center mt-6 space-x-4 text-sm items-center">
                <a href="https://getino.app/terms" className="text-[#2663eb] hover:text-blue-500 transition-colors duration-200">Terms of Service</a>
                <span className="text-[#9ca3af] text-xl flex items-center">·</span>
                <a href="https://getino.app/privacy" className="text-[#2663eb] hover:text-blue-500 transition-colors duration-200">Privacy Policy</a>
                <span className="text-[#9ca3af] text-xl flex items-center">·</span>
                <a href="https://getino.app/help" className="text-[#2663eb] hover:text-blue-500 transition-colors duration-200">Refund Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CheckoutPageWrapper>
  );
} 
