import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  FiCheck, FiLock, FiAlertCircle, FiCreditCard, FiShield, 
  FiArrowLeft, FiUsers, FiStar, FiClock, FiAward, FiThumbsUp,
  FiCheckCircle, FiCheckSquare, FiDollarSign, FiSlash, FiBarChart2, FiX,
  FiRotateCcw, FiSearch, FiFileText, FiPhone, FiBell, FiCalendar,
  FiTrendingUp, FiFilter, FiLink, FiMail, FiInbox, FiUnlock,
  FiPackage, FiRefreshCw, FiHeadphones, FiGift, FiZap
} from 'react-icons/fi';
import { BsCash } from 'react-icons/bs';

// Import custom components
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { stripePromise } from '../lib/stripe';

// near the top of the file, add the MAIN_APP_URL constant
const MAIN_APP_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://getino.app';

// Loading animation component
const LoadingDots: React.FC = () => {
  const [dots, setDots] = useState('...');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => {
        if (prevDots === '') return '.';
        if (prevDots === '.') return '..';
        if (prevDots === '..') return '...';
        return '';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  // Use a fixed-width span to prevent text movement
  return <span style={{ display: 'inline-block', width: '24px', textAlign: 'left' }}>{dots}</span>;
};

// Demo checkout links - replace these with actual Stripe checkout links
const DEMO_CHECKOUT_LINKS = {
  monthly: 'https://buy.stripe.com/3csdUe3rNd3J8dW9AB',
  yearly: 'https://buy.stripe.com/8wM3fAgez9Rx0Lu28a',
  lifetime: 'https://buy.stripe.com/aEUaI2bYj1l19i0003',
};

const planDetails: {
  [key in 'monthly' | 'yearly' | 'lifetime']: {
    name: string;
    price: string;
    period: string;
    features: string[];
    savings: string;
    popular: boolean;
    recommended: boolean;
    special?: boolean;
  }
} = {
  monthly: {
    name: 'Monthly Premium',
    price: '$29.00',
    period: 'month',
    features: [
      'Full access to all opportunities',
      'Advanced search with filters',
      'Detailed Earnings Reports',
      'Detailed instructions & direct links',
      'Priority support',
      'Earnings tracking & analytics',
      'Push notifications',
      'Weekly opportunity digest',
      'Provider contact information',
      'Custom opportunity alerts',
      'Premium community features'
    ],
    savings: 'No long-term commitment',
    popular: true,
    recommended: false
  },
  yearly: {
    name: 'Annual Premium',
    price: '$49.00',
    period: 'year',
    features: [
      'All monthly features',
      'Save over 85% compared to monthly',
      'Early access to new features',
      'VIP support',
      'Exclusive opportunities'
    ],
    savings: 'Save $299 compared to monthly plan',
    popular: false,
    recommended: true
  },
  lifetime: {
    name: 'Lifetime Access',
    price: '$149.00',
    period: 'one-time',
    features: [
      'All yearly features',
      'Never pay again',
      'Lifetime updates',
      'Premium support forever',
      'Early access to all new features',
      'Exclusive community access'
    ],
    savings: 'Pay once, use forever',
    popular: false,
    recommended: false,
    special: true
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
    date: "2 days ago"
  },
  {
    name: "Dana R.",
    role: "Remote Worker",
    content: "Best investment this year. The opportunities are high-quality and the support is excellent.",
    stars: 5,
    verified: true,
    date: "1 week ago"
  },
  {
    name: "Michael T.",
    role: "Student",
    content: "The premium features are definitely worth it! I've found incredible opportunities that have helped me earn while studying.",
    stars: 4,
    verified: true,
    date: "2 weeks ago"
  },
  {
    name: "Sarah J.",
    role: "Freelancer",
    content: "Made $2,000 in my first month! The opportunities are high-quality and legitimate.",
    stars: 4,
    verified: true,
    date: "1 month ago"
  },
  {
    name: "Robert L.",
    role: "Part-time Worker",
    content: "The yearly plan is a no-brainer. I've saved so much compared to the monthly plan and the features are amazing.",
    stars: 5,
    verified: true,
    date: "2 months ago"
  }
];

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { userData, currentUser, loading: authLoading, checkMainAppAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Set mounted state when component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if we need to verify auth when component mounts
  useEffect(() => {
    if (!mounted || authInitialized) return;
    
    const verifyAuth = async () => {
      // If we already have a user, we're authenticated
      if (currentUser) {
        setAuthInitialized(true);
        return;
      }
      
      // Try to check if the user is already authenticated on the main app
      try {
        const isAuthenticated = await checkMainAppAuth();
        if (!isAuthenticated && process.env.NODE_ENV !== 'development') {
          // In production, redirect to main app login if not authenticated
          const returnUrl = encodeURIComponent(`${window.location.origin}/checkoutpage?plan=${router.query.plan || ''}`);
          window.location.href = `${MAIN_APP_URL}/login?redirect=${returnUrl}`;
          return;
        }
      } catch (error) {
        console.error("Error verifying auth:", error);
      }
      
      setAuthInitialized(true);
    };
    
    verifyAuth();
  }, [mounted, authInitialized, currentUser, checkMainAppAuth, router.query.plan]);

  // Only access router.query after component has mounted
  const planParam = mounted ? router.query.plan : null;
  const couponParam = mounted ? router.query.coupon : null;
  const plan = planParam as 'monthly' | 'yearly' | 'lifetime' | null;
  const couponCode = couponParam as string || '';

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Countdown timer for urgency - only on client side
  useEffect(() => {
    if (!mounted) return;
    
    const timer = timeLeft > 0 && setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearInterval(timer as NodeJS.Timeout);
  }, [timeLeft, mounted]);

  const handleCheckout = async () => {
    if (!currentUser || !plan) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Creating checkout session for plan: ${plan}`);

      // In production, this would call your API to create a checkout session
      // For now, use the demo links directly
      const checkoutUrl = DEMO_CHECKOUT_LINKS[plan as keyof typeof DEMO_CHECKOUT_LINKS];
      
      if (!checkoutUrl) {
        console.error('No checkout URL available for this plan');
        setError('Failed to get checkout link');
        return;
      }

      setSuccessMessage('Redirecting to secure payment page...');
      
      // Short delay to show the success message before redirecting
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 1000);
    } catch (err) {
      console.error('Error in handleCheckout:', err);
      setError(err instanceof Error ? err.message : 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  // Selected plan based on URL parameter
  const selectedPlan = plan && planDetails[plan] ? planDetails[plan] : null;
  
  // If not mounted yet (server-side rendering), show a minimal loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-transparent py-2 px-3 sm:px-4">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-lg">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  // If still initializing auth or loading auth, show loading
  if (!authInitialized || authLoading) {
    return (
      <div className="min-h-screen bg-transparent py-2 px-3 sm:px-4">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-lg">Verifying your account...</p>
          </div>
        </div>
      </div>
    );
  }

  // If mounted and auth initialized but no user (and not in development), redirect handled in useEffect
  if (mounted && authInitialized && !currentUser && process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen bg-transparent py-2 px-3 sm:px-4">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-lg">Please log in to access checkout.</p>
            <Button
              onClick={() => {
                const returnUrl = encodeURIComponent(`${window.location.origin}/checkoutpage?plan=${plan || ''}`);
                window.location.href = `${MAIN_APP_URL}/login?redirect=${returnUrl}`;
              }}
              color="primary"
              className="mt-4"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-2 px-3 sm:px-4">
      <div className="w-full">
        {/* Back button */}
        <div className="mb-4">
          <Button
            onClick={() => {
              window.location.href = `${MAIN_APP_URL}/pricing`;
            }}
            color="secondary"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back to Pricing
          </Button>
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

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left side - Plan details */}
          <div className="md:col-span-7 space-y-6">
            {/* Current selected plan */}
            {selectedPlan && (
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{selectedPlan.name}</h2>
                    {selectedPlan.popular && (
                      <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Most Popular
                      </span>
                    )}
                    {selectedPlan.recommended && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Recommended
                      </span>
                    )}
                    {selectedPlan.special && (
                      <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Limited Time
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-end">
                    <span className="text-3xl font-bold">{selectedPlan.price}</span>
                    <span className="text-sm ml-2 opacity-90">per {selectedPlan.period}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div className="text-sm text-green-600 font-semibold mb-2">
                      <FiCheck className="inline-block mr-1" />
                      {selectedPlan.savings}
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}

            {/* Testimonials */}
            <Card className="p-4">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FiUsers className="mr-2 text-blue-500" />
                What Our Users Say
              </h3>
              <div className="space-y-4">
                {testimonials.slice(0, 3).map((testimonial, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center mb-2">
                      {/* Star rating */}
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`${
                              i < testimonial.stars ? 'text-amber-400 fill-current' : 'text-gray-300'
                            } w-4 h-4`}
                          />
                        ))}
                      </div>
                      <div className="text-sm font-medium">{testimonial.name}</div>
                      {testimonial.verified && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{testimonial.content}</p>
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <span>{testimonial.role}</span>
                      <span className="mx-2">•</span>
                      <span>{testimonial.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right side - Payment summary */}
          <div className="md:col-span-5">
            <Card className="p-4 sticky top-4">
              <h3 className="text-lg font-bold mb-4">Complete Your Order</h3>
              
              {/* Order summary */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">{selectedPlan?.name}</span>
                  <span className="font-medium">{selectedPlan?.price}</span>
                </div>
                {couponCode && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Coupon: {couponCode}</span>
                    <span className="text-green-600">-$10.00</span>
                  </div>
                )}
                <div className="flex justify-between font-bold mt-3">
                  <span>Total</span>
                  <span>{selectedPlan?.price}</span>
                </div>
              </div>

              {/* Payment action */}
              <div className="space-y-4">
                {/* Error message */}
                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-start">
                    <FiAlertCircle className="flex-shrink-0 mr-2 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Success message */}
                {successMessage && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-start">
                    <FiCheckCircle className="flex-shrink-0 mr-2 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Checkout button */}
                <Button
                  onClick={handleCheckout}
                  disabled={loading || !selectedPlan}
                  color="primary"
                  fullWidth
                  className="py-3 px-4 shadow-sm"
                  icon={loading ? null : <FiLock />}
                  loading={loading}
                >
                  {loading ? (
                    <>Processing<LoadingDots /></>
                  ) : (
                    'Secure Checkout'
                  )}
                </Button>

                {/* Payment methods */}
                <div className="flex items-center justify-center space-x-3 text-gray-400">
                  <FiCreditCard />
                  <BsCash />
                  <span className="text-xs">Multiple payment options available</span>
                </div>

                {/* Security badges */}
                <div className="text-xs text-center text-gray-500 flex flex-col items-center mt-3">
                  <div className="flex items-center mb-1">
                    <FiShield className="mr-1 text-gray-400" />
                    <span>Secure checkout powered by Stripe</span>
                  </div>
                  <span>Your information is protected with 256-bit SSL encryption</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mt-8 p-4">
          <h3 className="text-lg font-bold mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">How does billing work?</h4>
              <p className="text-gray-600 text-sm mt-1">
                You'll be charged once when you subscribe. For monthly plans, you'll be charged monthly on the same date. For annual plans, you'll be charged once per year.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Can I cancel anytime?</h4>
              <p className="text-gray-600 text-sm mt-1">
                Yes, you can cancel your subscription at any time. When you cancel, you'll have access until the end of your billing period.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Is there a refund policy?</h4>
              <p className="text-gray-600 text-sm mt-1">
                We offer a 7-day money-back guarantee. If you're not satisfied, contact our support team within 7 days of purchase for a full refund.
              </p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2023 GetPaid App. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/support">Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 