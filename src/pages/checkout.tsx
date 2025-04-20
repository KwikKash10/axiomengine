'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import CheckoutPageWrapper from '../components/CheckoutPageWrapper';
import LoadingDots from '../components/LoadingDots';
import { 
  FiCheck, FiLock, FiAlertCircle, FiCreditCard, FiShield, 
  FiArrowLeft, FiUsers, FiStar, FiClock, FiAward, FiThumbsUp,
  FiCheckCircle, FiCheckSquare, FiDollarSign, FiSlash, FiBarChart2, FiX,
  FiRotateCcw, FiSearch, FiFileText, FiPhone, FiBell, FiCalendar,
  FiTrendingUp, FiFilter, FiLink, FiMail, FiInbox, FiUnlock,
  FiPackage, FiRefreshCw, FiHeadphones, FiGift, FiZap, FiInfo, 
  FiChevronUp, FiChevronDown, FiExternalLink, FiGlobe
} from 'react-icons/fi';
import { BsCash } from 'react-icons/bs';

// Currency types and data
type CurrencyCode = 
  'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'MXN' | 'INR' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'RON' | 'RUB' | 'SGD' | 'HKD' | 'CNY' | 'TWD' | 'THB' | 'MYR' | 'PHP' | 'IDR' | 'KRW' | 'VND' | 'AED' | 'SAR' | 'ILS' | 'TRY' | 'QAR' | 'BHD' | 'KWD' | 'OMR' | 'BRL' | 'ARS' | 'CLP' | 'COP' | 'PEN' | 'UYU' | 'ZAR' | 'NGN' | 'EGP' | 'KES' | 'MAD' | 'GHS' | 'NZD' | 'FJD' | 'MXN';

type CurrencyGroup = {
  label: string;
  currencies: CurrencyCode[];
};

type CurrencyFormat = {
  symbol: string;
  position: 'before' | 'after';
  decimals: boolean;
};

// Country to currency mapping
const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  US: 'USD',
  CA: 'CAD',
  MX: 'MXN',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  JP: 'JPY',
  AU: 'AUD',
  CH: 'CHF',
};

// Exchange rates fallback
const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  // Major world currencies
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  CAD: 1.35,
  AUD: 1.51,
  JPY: 150.42,
  INR: 83.15,
  
  // European currencies
  CHF: 0.90,    // Swiss Franc
  SEK: 10.76,   // Swedish Krona
  NOK: 10.83,   // Norwegian Krone
  DKK: 6.87,    // Danish Krone
  PLN: 3.94,    // Polish Zloty
  CZK: 23.13,   // Czech Koruna
  HUF: 358.96,  // Hungarian Forint
  RON: 4.57,    // Romanian Leu
  RUB: 92.50,   // Russian Ruble
  
  // Asian currencies
  SGD: 1.35,    // Singapore Dollar
  HKD: 7.81,    // Hong Kong Dollar
  CNY: 7.23,    // Chinese Yuan
  TWD: 32.15,   // Taiwan Dollar
  THB: 36.31,   // Thai Baht
  MYR: 4.72,    // Malaysian Ringgit
  PHP: 57.33,   // Philippine Peso
  IDR: 15887.50,// Indonesian Rupiah
  KRW: 1366.35, // South Korean Won
  VND: 25320.00,// Vietnamese Dong
  
  // Middle Eastern currencies
  AED: 3.67,    // UAE Dirham
  SAR: 3.75,    // Saudi Riyal
  ILS: 3.77,    // Israeli Shekel
  TRY: 32.28,   // Turkish Lira
  QAR: 3.64,    // Qatari Riyal
  BHD: 0.376,   // Bahraini Dinar
  KWD: 0.307,   // Kuwaiti Dinar
  OMR: 0.384,   // Omani Rial
  
  // South American currencies
  BRL: 5.65,    // Brazilian Real
  ARS: 880.00,  // Argentine Peso
  CLP: 952.97,  // Chilean Peso
  COP: 4071.82, // Colombian Peso
  PEN: 3.78,    // Peruvian Sol
  UYU: 38.77,   // Uruguayan Peso
  
  // African currencies
  ZAR: 18.64,   // South African Rand
  NGN: 1590.00, // Nigerian Naira
  EGP: 48.32,   // Egyptian Pound
  KES: 131.80,  // Kenyan Shilling
  MAD: 9.94,    // Moroccan Dirham
  GHS: 15.38,   // Ghanaian Cedi
  
  // Oceania
  NZD: 1.67,    // New Zealand Dollar
  FJD: 2.27,    // Fijian Dollar
  
  // North American
  MXN: 17.25,   // Mexican Peso
};

// Currency formatting options
const CURRENCY_FORMATS: Record<CurrencyCode, CurrencyFormat> = {
  // Major world currencies
  USD: { symbol: '$', position: 'before', decimals: true },
  EUR: { symbol: '€', position: 'before', decimals: true },
  GBP: { symbol: '£', position: 'before', decimals: true },
  CAD: { symbol: 'C$', position: 'before', decimals: true },
  AUD: { symbol: 'A$', position: 'before', decimals: true },
  JPY: { symbol: '¥', position: 'before', decimals: false },
  INR: { symbol: '₹', position: 'before', decimals: true },
  
  // European currencies
  CHF: { symbol: 'CHF', position: 'before', decimals: true },
  SEK: { symbol: 'kr', position: 'after', decimals: true },
  NOK: { symbol: 'kr', position: 'after', decimals: true },
  DKK: { symbol: 'kr', position: 'after', decimals: true },
  PLN: { symbol: 'zł', position: 'after', decimals: true },
  CZK: { symbol: 'Kč', position: 'after', decimals: true },
  HUF: { symbol: 'Ft', position: 'after', decimals: false },
  RON: { symbol: 'lei', position: 'after', decimals: true },
  RUB: { symbol: '₽', position: 'after', decimals: true },
  
  // Asian currencies
  SGD: { symbol: 'S$', position: 'before', decimals: true },
  HKD: { symbol: 'HK$', position: 'before', decimals: true },
  CNY: { symbol: '¥', position: 'before', decimals: true },
  TWD: { symbol: 'NT$', position: 'before', decimals: true },
  THB: { symbol: '฿', position: 'before', decimals: true },
  MYR: { symbol: 'RM', position: 'before', decimals: true },
  PHP: { symbol: '₱', position: 'before', decimals: true },
  IDR: { symbol: 'Rp', position: 'before', decimals: true },
  KRW: { symbol: '₩', position: 'before', decimals: false },
  VND: { symbol: '₫', position: 'after', decimals: false },
  
  // Middle Eastern currencies
  AED: { symbol: 'د.إ', position: 'after', decimals: true },
  SAR: { symbol: 'ر.س', position: 'after', decimals: true },
  ILS: { symbol: '₪', position: 'before', decimals: true },
  TRY: { symbol: '₺', position: 'before', decimals: true },
  QAR: { symbol: 'ر.ق', position: 'after', decimals: true },
  BHD: { symbol: '.د.ب', position: 'after', decimals: true },
  KWD: { symbol: 'د.ك', position: 'after', decimals: true },
  OMR: { symbol: 'ر.ع.', position: 'after', decimals: true },
  
  // South American currencies
  BRL: { symbol: 'R$', position: 'before', decimals: true },
  ARS: { symbol: '$', position: 'before', decimals: true },
  CLP: { symbol: '$', position: 'before', decimals: false },
  COP: { symbol: '$', position: 'before', decimals: true },
  PEN: { symbol: 'S/', position: 'before', decimals: true },
  UYU: { symbol: '$U', position: 'before', decimals: true },
  
  // African currencies
  ZAR: { symbol: 'R', position: 'before', decimals: true },
  NGN: { symbol: '₦', position: 'before', decimals: true },
  EGP: { symbol: 'E£', position: 'before', decimals: true },
  KES: { symbol: 'KSh', position: 'before', decimals: true },
  MAD: { symbol: 'د.م.', position: 'after', decimals: true },
  GHS: { symbol: 'GH₵', position: 'before', decimals: true },
  
  // Oceania
  NZD: { symbol: 'NZ$', position: 'before', decimals: true },
  FJD: { symbol: 'FJ$', position: 'before', decimals: true },
  
  // North American
  MXN: { symbol: '$', position: 'before', decimals: true },
};

// Currency display names
const CURRENCY_NAMES: Record<string, string> = {
  // Major world currencies
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  JPY: 'Japanese Yen',
  INR: 'Indian Rupee',
  
  // European currencies
  CHF: 'Swiss Franc',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krone',
  PLN: 'Polish Zloty',
  CZK: 'Czech Koruna',
  HUF: 'Hungarian Forint',
  RON: 'Romanian Leu',
  RUB: 'Russian Ruble',
  
  // Asian currencies
  SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar',
  CNY: 'Chinese Yuan',
  TWD: 'Taiwan Dollar',
  THB: 'Thai Baht',
  MYR: 'Malaysian Ringgit',
  PHP: 'Philippine Peso',
  IDR: 'Indonesian Rupiah',
  KRW: 'South Korean Won',
  VND: 'Vietnamese Dong',
  
  // Middle Eastern currencies
  AED: 'UAE Dirham',
  SAR: 'Saudi Riyal',
  ILS: 'Israeli Shekel',
  TRY: 'Turkish Lira',
  QAR: 'Qatari Riyal',
  BHD: 'Bahraini Dinar',
  KWD: 'Kuwaiti Dinar',
  OMR: 'Omani Rial',
  
  // South American currencies
  BRL: 'Brazilian Real',
  ARS: 'Argentine Peso',
  CLP: 'Chilean Peso',
  COP: 'Colombian Peso',
  PEN: 'Peruvian Sol',
  UYU: 'Uruguayan Peso',
  
  // African currencies
  ZAR: 'South African Rand',
  NGN: 'Nigerian Naira',
  EGP: 'Egyptian Pound',
  KES: 'Kenyan Shilling',
  MAD: 'Moroccan Dirham',
  GHS: 'Ghanaian Cedi',
  
  // Oceania
  NZD: 'New Zealand Dollar',
  FJD: 'Fijian Dollar',
  
  // North American
  MXN: 'Mexican Peso'
};

// Categorize currencies for the dropdown
const CURRENCY_GROUPS: CurrencyGroup[] = [
  {
    label: "Widely Used",
    currencies: ['USD', 'EUR', 'GBP', 'JPY']
  },
  {
    label: "North America",
    currencies: ['USD', 'CAD', 'MXN']
  },
  {
    label: "Europe",
    currencies: ['EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'RUB']
  },
  {
    label: "Asia",
    currencies: ['JPY', 'CNY', 'INR', 'SGD', 'HKD', 'TWD', 'THB', 'MYR', 'PHP', 'IDR', 'KRW', 'VND']
  },
  {
    label: "Middle East",
    currencies: ['AED', 'SAR', 'ILS', 'TRY', 'QAR', 'BHD', 'KWD', 'OMR']
  },
  {
    label: "South America",
    currencies: ['BRL', 'ARS', 'CLP', 'COP', 'PEN', 'UYU']
  },
  {
    label: "Africa",
    currencies: ['ZAR', 'NGN', 'EGP', 'KES', 'MAD', 'GHS']
  },
  {
    label: "Oceania",
    currencies: ['AUD', 'NZD', 'FJD']
  }
];

// Near the top of the file, add this type declaration
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: any) => void;
  }
}

const CHECKOUT_LINKS = {
  monthly: 'https://checkout.stripe.com/c/pay/cs_live_a1WqFaE8YcF8v3wMWRoGDfXyqkGzVdoXeBOlx5sKP6AQGEwzKBR4Jq5Hs',
  yearly: 'https://checkout.stripe.com/c/pay/cs_live_a1BoHrnLlCLF8v3wMWRoGDfXyqkGzVdoXeBOlx5sKP6AQGEwzKBR4Jq5Hs',
  lifetime: 'https://checkout.stripe.com/c/pay/cs_live_a1jYUJpRZoOxKrAMNfhJtL2GLWlxVVXZPQZBGFHSWRYBYQDGGKDR4Jq5Hs'
};

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
  apiVersion: '2023-10-16', // Specify the latest API version
  stripeAccount: process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID, // Optional: if using Connect
});

// Add this check for development environment
if (process.env.NODE_ENV === 'development') {
  console.warn('Running in development mode - ensure HTTPS is enabled for Stripe.js');
}

// CheckoutForm component for embedded payment
function CheckoutForm({ planType, onSwitchToRedirect, formattedPrice }: { planType: string; onSwitchToRedirect: () => void; formattedPrice: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
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

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/success?plan=' + planType.toLowerCase(),
      },
      redirect: 'if_required',
    });

    if (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'An error occurred during payment');
      setIsProcessing(false);
    } else {
      // Payment succeeded without redirect
      window.location.href = '/success?plan=' + planType.toLowerCase();
    }
  };

  // Option to switch to redirect checkout
  const handleRedirectCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    onSwitchToRedirect();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement 
        options={{
          fields: {
            billingDetails: {
              name: 'auto',
              email: 'never',
              phone: 'never',
              address: {
                country: 'auto',
                postalCode: 'auto',
                line1: 'never',
                line2: 'never',
                city: 'never',
                state: 'never',
              }
            }
          },
          layout: {
            type: 'tabs',
            defaultCollapsed: false,
            radios: false,
            spacedAccordionItems: true
          }
        }}
      />

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <div className="flex flex-col space-y-4 mt-6">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <FiLock className="mr-2" />
              Pay {formattedPrice}
            </div>
          )}
        </button>
        
        <button
          type="button"
          onClick={handleRedirectCheckout}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium text-center w-full"
        >
          Need a different way to checkout?
        </button>
      </div>
    </form>
  );
}

// Add GoogleTranslate component
const CheckoutGoogleTranslate: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAllLanguages, setShowAllLanguages] = useState(true);
  const [lastClickedGroup, setLastClickedGroup] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Define language options
  type Language = {
    code: string;
    name: string;
  };

  // Group languages by region
  type LanguageGroup = {
    label: string;
    languages: Language[];
  };

  const LANGUAGE_GROUPS: LanguageGroup[] = [
    {
      label: "Popular",
      languages: [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' }
      ]
    },
    {
      label: "European",
      languages: [
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'nl', name: 'Dutch' },
        { code: 'pl', name: 'Polish' },
        { code: 'ru', name: 'Russian' }
      ]
    },
    {
      label: "Asian",
      languages: [
        { code: 'zh-CN', name: 'Chinese (Simplified)' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'hi', name: 'Hindi' },
        { code: 'ar', name: 'Arabic' }
      ]
    },
    {
      label: "Other",
      languages: [
        { code: 'pt-BR', name: 'Portuguese (Brazilian)' },
        { code: 'tr', name: 'Turkish' },
        { code: 'vi', name: 'Vietnamese' }
      ]
    }
  ];
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const promptTranslation = () => {
    // Don't create multiple popups
    if (isPopupOpen) {
      return;
    }
    
    setIsPopupOpen(true);
    
    // Remove any existing popups first
    const existingPopup = document.getElementById('translation-notification');
    if (existingPopup && existingPopup.parentNode) {
      existingPopup.parentNode.removeChild(existingPopup);
    }
    
    // Create visible notification that prompts the user
    const notification = document.createElement('div');
    notification.id = 'translation-notification';
    notification.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                 background-color: white; color: #333; padding: 15px 20px;
                 border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999;
                 display: flex; flex-direction: column; align-items: center; max-width: 90%;">
        <p style="margin: 0 0 10px; font-weight: bold;">Use your browser's translation feature</p>
        <p style="margin: 0 0 15px;">Right-click anywhere on the page and select "Translate" or use your browser's built-in translation tool.</p>
        <p style="margin: 0 0 15px; font-style: italic; color: #666; font-size: 0.9em;">In-app language feature coming soon!</p>
        <button id="close-translation-prompt" style="background: #282958; color: white; 
                border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          Got it
        </button>
      </div>
    `;
    document.body.appendChild(notification);
    
    // Add click event to close button
    document.addEventListener('click', function handleClick(event) {
      const closeButton = document.getElementById('close-translation-prompt');
      if (event.target === closeButton) {
        const popup = document.getElementById('translation-notification');
        if (popup && popup.parentNode) {
          popup.parentNode.removeChild(popup);
          setIsPopupOpen(false);
          document.removeEventListener('click', handleClick);
        }
      }
    });
  };

  return (
    <div className="inline-flex items-center relative" ref={dropdownRef}>
      <button 
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="bg-gray-100 text-gray-700 border border-gray-400 hover:bg-gray-200 py-2 px-4 rounded-lg shadow-sm flex items-center"
        aria-label="Select language for translation"
      >
        <FiGlobe className="mr-2 text-gray-500" /> Select Language
      </button>
      
      {/* Dropdown Menu (Appears upwards in footer) */}
      {dropdownOpen && (
        <div 
          className="absolute bottom-full left-0 mb-1 bg-black/85 backdrop-blur-sm rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto" 
          style={{ 
            width: '220px',
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none' /* IE and Edge */
          }}
          ref={dropdownContentRef}
        >
          {LANGUAGE_GROUPS.map((group: LanguageGroup) => (
            <div key={group.label}>
              <div 
                className="px-3 py-2 text-gray-500/60"
                style={{ textAlign: 'left', fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif', paddingLeft: '20px' }}
                onClick={() => {
                  if (showAllLanguages) {
                    setLastClickedGroup(group.label);
                    setShowAllLanguages(false);
                  } else {
                    setShowAllLanguages(true);
                    setLastClickedGroup(group.label);
                    
                    // Use setTimeout to ensure the DOM is updated before scrolling
                    setTimeout(() => {
                      const element = groupRefs.current[group.label];
                      const container = dropdownContentRef.current;
                      if (element && container) {
                        // Scroll within the dropdown only, not the whole page
                        const headerTop = element.offsetTop;
                        container.scrollTop = headerTop;
                      }
                    }, 10);
                  }
                }}
                ref={el => groupRefs.current[group.label] = el}
              >
                {group.label}
              </div>
              {showAllLanguages && (
                <div>
                  {group.languages.map((lang) => (
                    <div 
                      key={lang.code}
                      className="px-5 py-2 hover:bg-gray-700/70 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        setDropdownOpen(false);
                        promptTranslation();
                      }}
                    >
                      <span className="text-white font-semibold pl-3" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{lang.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [useRedirect, setUseRedirect] = useState(false);
  
  // Currency selector state
  const [userCurrency, setUserCurrency] = useState<CurrencyCode>('USD');
  const [isDetectingCurrency, setIsDetectingCurrency] = useState(true);
  const [exchangeRates, setExchangeRates] = useState<Record<CurrencyCode, number> | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAllCurrencies, setShowAllCurrencies] = useState(true);
  const [lastClickedGroup, setLastClickedGroup] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Add a state to track payment form loading
  const [paymentFormLoading, setPaymentFormLoading] = useState(false);

  const plan = searchParams.get('plan') as 'monthly' | 'yearly' | 'lifetime' | null;
  const couponCode = searchParams.get('coupon') || '';

  // Detect user's currency based on IP address with browser locale as fallback
  useEffect(() => {
    const detectUserCurrency = async () => {
      if (!isDetectingCurrency) return; // Skip if user manually selected currency
      
      try {
        setIsDetectingCurrency(true);
        
        // First try to retrieve previously detected currency from localStorage
        const savedCurrency = localStorage.getItem('getino_user_currency');
        const savedTimestamp = localStorage.getItem('getino_user_currency_timestamp');
        
        // Check if we have a valid saved currency that's less than 24 hours old
        if (savedCurrency && savedTimestamp) {
          const isValidCurrency = Object.keys(CURRENCY_FORMATS).includes(savedCurrency as CurrencyCode);
          const isRecent = (Date.now() - parseInt(savedTimestamp)) < 24 * 60 * 60 * 1000;
          
          if (isValidCurrency && isRecent) {
            console.log('Using saved currency from localStorage:', savedCurrency);
            setUserCurrency(savedCurrency as CurrencyCode);
            setIsDetectingCurrency(false);
            return;
          }
        }
        
        // Function to attempt IP geolocation with retry
        const attemptIpGeolocation = async (retries = 3): Promise<CurrencyCode | null> => {
          for (let i = 0; i < retries; i++) {
            try {
              // Set a timeout to ensure the fetch doesn't hang
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 3000);
              
              // Try multiple IP geolocation services in case one fails
              const services = [
                'https://ipapi.co/json/',
                'https://api.ipstack.com/check?access_key=' + process.env.NEXT_PUBLIC_IPSTACK_KEY,
                'https://api.ipdata.co?api-key=' + process.env.NEXT_PUBLIC_IPDATA_KEY
              ];
              
              for (const service of services) {
                try {
                  const response = await fetch(service, {
                    signal: controller.signal
                  });
                  
                  clearTimeout(timeoutId);
                  
                  if (response.ok) {
                    const data = await response.json();
                    const countryCode = data.country_code || data.country?.code;
                    console.log('Detected country from IP:', countryCode);
                    
                    if (countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
                      const detectedCurrency = COUNTRY_TO_CURRENCY[countryCode];
                      return detectedCurrency;
                    }
                  }
                } catch (serviceError) {
                  console.warn(`IP service ${service} failed:`, serviceError);
                  continue; // Try next service
                }
              }
              
              // If we get here, all services failed on this attempt
              console.warn(`All IP services failed on attempt ${i + 1}/${retries}`);
              
              // Wait before retrying (exponential backoff)
              if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
              }
            } catch (retryError) {
              console.warn(`Retry ${i + 1}/${retries} failed:`, retryError);
              if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
              }
            }
          }
          return null;
        };
        
        // Try IP geolocation first
        const ipBasedCurrency = await attemptIpGeolocation();
        if (ipBasedCurrency) {
          setUserCurrency(ipBasedCurrency);
          // Save to localStorage with timestamp
          localStorage.setItem('getino_user_currency', ipBasedCurrency);
          localStorage.setItem('getino_user_currency_timestamp', Date.now().toString());
          console.log('Currency set from IP geolocation:', ipBasedCurrency);
          return;
        }
        
        // Fallback 1: Browser locale
        console.log('IP geolocation failed, using browser locale');
        const browserLocale = navigator.language;
        let detectedCurrency: CurrencyCode = 'USD'; // Default to USD
        
        // Enhanced locale to currency mapping
        const localeMap: Record<string, CurrencyCode> = {
          'en-US': 'USD',
          'en-GB': 'GBP',
          'en-CA': 'CAD',
          'en-AU': 'AUD',
          'en-NZ': 'NZD',
          'ja': 'JPY',
          'zh': 'CNY',
          'ko': 'KRW',
          'de': 'EUR',
          'fr': 'EUR',
          'it': 'EUR',
          'es': 'EUR',
          'pt': 'EUR',
          'nl': 'EUR',
          'pl': 'PLN',
          'ru': 'RUB',
          'tr': 'TRY',
          'ar': 'AED',
          'hi': 'INR',
          'th': 'THB',
          'vi': 'VND',
          'id': 'IDR',
          'ms': 'MYR',
        };
        
        // Try exact locale match first
        if (localeMap[browserLocale]) {
          detectedCurrency = localeMap[browserLocale];
        } else {
          // Try language-only match
          const language = browserLocale.split('-')[0];
          if (localeMap[language]) {
            detectedCurrency = localeMap[language];
          }
        }
        
        // Fallback 2: Time zone based detection
        if (detectedCurrency === 'USD') {
          try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const tzToCurrency: Record<string, CurrencyCode> = {
              'America/New_York': 'USD',
              'America/Chicago': 'USD',
              'America/Denver': 'USD',
              'America/Los_Angeles': 'USD',
              'America/Toronto': 'CAD',
              'America/Vancouver': 'CAD',
              'Europe/London': 'GBP',
              'Europe/Paris': 'EUR',
              'Europe/Berlin': 'EUR',
              'Europe/Rome': 'EUR',
              'Europe/Madrid': 'EUR',
              'Asia/Tokyo': 'JPY',
              'Asia/Seoul': 'KRW',
              'Asia/Shanghai': 'CNY',
              'Asia/Singapore': 'SGD',
              'Asia/Hong_Kong': 'HKD',
              'Australia/Sydney': 'AUD',
              'Australia/Melbourne': 'AUD',
              'Pacific/Auckland': 'NZD'
            };
            
            if (tzToCurrency[timeZone]) {
              detectedCurrency = tzToCurrency[timeZone];
              console.log('Currency detected from timezone:', detectedCurrency);
            }
          } catch (tzError) {
            console.warn('Timezone detection failed:', tzError);
          }
        }
        
        setUserCurrency(detectedCurrency);
        // Save to localStorage with timestamp
        localStorage.setItem('getino_user_currency', detectedCurrency);
        localStorage.setItem('getino_user_currency_timestamp', Date.now().toString());
        console.log('Final currency detection result:', detectedCurrency);
        
      } catch (error) {
        console.error('Error in currency detection:', error);
        // Use USD as final fallback
        setUserCurrency('USD');
        // Don't save to localStorage so we can try again next time
      } finally {
        setIsDetectingCurrency(false);
      }
    };

    detectUserCurrency();
  }, [isDetectingCurrency]);

  // Fetch exchange rates from a free API
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        // Check if we have cached rates less than 12 hours old
        const cachedRates = localStorage.getItem('getino_exchange_rates');
        const cachedTime = localStorage.getItem('getino_exchange_rates_timestamp');
        
        if (cachedRates && cachedTime && (Date.now() - parseInt(cachedTime) < 12 * 60 * 60 * 1000)) {
          console.log('Using cached exchange rates');
          setExchangeRates(JSON.parse(cachedRates));
          setRatesLoading(false);
          return;
        }
        
        // If no cached rates or they're expired, fetch new ones
        console.log('Fetching fresh exchange rates');
        // Frankfurter is a free, open-source API with no key required
        const response = await fetch('https://api.frankfurter.app/latest?from=USD');
        
        if (response.ok) {
          const data = await response.json();
          // Create a rates object with all our supported currencies
          const newRates = { ...EXCHANGE_RATES }; // Start with our defaults
          
          // Update with live data where available
          Object.entries(data.rates).forEach(([currency, rate]) => {
            if (currency in newRates) {
              newRates[currency as CurrencyCode] = rate as number;
            }
          });
          
          // Cache the results with a more specific key
          localStorage.setItem('getino_exchange_rates', JSON.stringify(newRates));
          localStorage.setItem('getino_exchange_rates_timestamp', Date.now().toString());
          
          // For backward compatibility, also update old cache keys
          localStorage.setItem('exchangeRates', JSON.stringify(newRates));
          localStorage.setItem('exchangeRatesTimestamp', Date.now().toString());
          
          setExchangeRates(newRates);
        } else {
          // If API fails, fall back to our hardcoded rates
          console.warn('Exchange rate API failed, using fallback rates');
          setExchangeRates(EXCHANGE_RATES);
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        setExchangeRates(EXCHANGE_RATES); // Fall back to hardcoded rates if API fails
      } finally {
        setRatesLoading(false);
      }
    };

    fetchExchangeRates();
  }, []); // Fetch once when component loads

  // Check for valid plan
  useEffect(() => {
    if (plan) {
      setSelectedPlan(plan);
      setIsValidPlan(true);
      
      // Reset client secret and initiate new checkout whenever plan changes
      setClientSecret(null);
      handleCheckout(false);
    } else {
      // Set a default plan instead of showing an error
      setSelectedPlan(null);
      setIsValidPlan(false);
      // Don't update URL if there's no plan
    }
  }, [plan]); // Remove router from dependency array to prevent unnecessary rerenders

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
  const handleCheckout = async (forceRedirect = false) => {
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
      
      // Get UTM parameters from URL if available
      const utmSource = searchParams.get('utm_source') || '';
      const utmMedium = searchParams.get('utm_medium') || '';
      const utmCampaign = searchParams.get('utm_campaign') || '';
      
      // Generate a unique client ID for conversion tracking
      const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Plan prices mapping (in cents)
      const planPrices: Record<string, number> = {
        monthly: 1499,  // $14.99
        yearly: 4900,   // $49.00
        lifetime: 9900  // $99.00
      };

      const amount = planPrices[selectedPlan.toLowerCase() as keyof typeof planPrices] || 9900;
      
      // Use exchange rates for currency conversion
      const rates = exchangeRates || EXCHANGE_RATES;
      const rate = rates[userCurrency];
      const format = CURRENCY_FORMATS[userCurrency];
      
      // Convert amount to user's currency (in cents)
      let convertedAmount: number;
      if (format.decimals) {
        if (selectedPlan.toLowerCase() === 'monthly') {
          convertedAmount = Math.floor(amount * rate) + 99;
        } else {
          // For yearly and lifetime, round to nearest whole number in cents
          convertedAmount = Math.round(amount * rate);
        }
      } else {
        // For currencies without decimals (like JPY), round appropriately
        convertedAmount = Math.ceil((amount * rate) / 100) * 100 - (selectedPlan.toLowerCase() === 'monthly' ? 1 : 0);
      }
      
      // Prepare data for API with enhanced parameters
      const checkoutData = {
        amount, // original amount in USD cents
        convertedAmount, // amount in user's currency (in cents)
        userCurrency, // user's currency code
        planType: selectedPlan.toLowerCase(),
        clientId,
        // Add UTM parameters for attribution
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        // Add timestamp for analytics
        timestamp: new Date().toISOString(),
        // Add device info
        device: window.innerWidth <= 768 ? 'mobile' : 'desktop',
        // Add referrer info if available
        referrer: document.referrer || undefined,
      };
      
      console.log('Sending checkout data:', JSON.stringify(checkoutData, null, 2));
  
      // Call appropriate API based on payment method
      const endpoint = forceRedirect ? '/api/create-checkout-session' : '/api/create-payment-intent';
      const response = await fetch(endpoint, {
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
  
      // Log if we're getting mock data (for local testing)
      if (responseData.isMockData) {
        console.log('Using mock checkout data for local development');
        setSuccessMessage('Mock checkout - In production, you would be redirected to Stripe');
        // Optional: simulate delay and show success message for testing
        setTimeout(() => {
          setLoading(false);
          // Mock successful checkout
          router.push('/success?session_id=' + responseData.sessionId + '&plan=' + selectedPlan.toLowerCase());
        }, 2000);
        return;
      }
  
      // Track checkout initiation (for analytics - if you have analytics set up)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'begin_checkout', {
          currency: 'USD',
          value: selectedPlan === 'monthly' ? 14.99 : selectedPlan === 'yearly' ? 49 : 99,
          items: [{
            id: selectedPlan.toLowerCase(),
            name: `${selectedPlan} Plan`,
            quantity: 1
          }]
        });
      }
  
      if (forceRedirect) {
        // Handle redirect to Stripe Checkout
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
      } else {
        // Set the client secret for the embedded form
        if (responseData.clientSecret) {
          console.log('Client secret received:', responseData.clientSecret.substring(0, 10) + '...');
          setClientSecret(responseData.clientSecret);
          
          // Add a delay to allow Stripe to fully initialize payment methods
          setTimeout(() => {
            setPaymentFormLoading(false);
          }, 1000);
        } else {
          console.error('No client secret in response:', responseData);
          setPaymentFormLoading(false);
          throw new Error('No client secret received from the server');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      let errorMessage = 'Error creating checkout session';
      
      // Try to extract more detailed error from the response
      if (error.message && error.message.includes('Server returned 500')) {
        try {
          // Extract the JSON error message from the error string
          const jsonStart = error.message.indexOf('{');
          const jsonEnd = error.message.lastIndexOf('}') + 1;
          const errorJson = error.message.substring(jsonStart, jsonEnd);
          const errorObj = JSON.parse(errorJson);
          
          errorMessage = errorObj.message || errorMessage;
          console.error('Extracted API error:', errorObj);
        } catch (e) {
          console.error('Error parsing API error:', e);
        }
      }
      
      setError('Error creating checkout session');
      setErrorDetails(errorMessage || error.message || 'Unknown error occurred');
      setPaymentFormLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Convert and format price for display
  const formatPrice = (usdPrice: number, period: string = '', planType: 'monthly' | 'yearly' | 'lifetime' = 'monthly') => {
    // Use live rates if available, otherwise fall back to hardcoded rates
    const rates = exchangeRates || EXCHANGE_RATES;
    
    // Get exchange rate for user's currency
    const rate = rates[userCurrency];
    const format = CURRENCY_FORMATS[userCurrency];
    
    // Convert price to user's currency
    let convertedPrice = usdPrice * rate;
    
    // Format with .99 ending for monthly plans with currencies having decimals
    // Format with .00 ending for yearly and lifetime plans with currencies having decimals
    if (format.decimals) {
      if (planType === 'monthly') {
        convertedPrice = Math.floor(convertedPrice) + 0.99;
      } else {
        // For yearly and lifetime, round to nearest whole number
        convertedPrice = Math.round(convertedPrice);
      }
    } else {
      // For currencies without decimals (like JPY), round to nearest 100
      convertedPrice = Math.ceil(convertedPrice / 100) * 100 - (planType === 'monthly' ? 1 : 0);
    }
    
    // Format with appropriate currency symbol
    const priceString = format.decimals 
      ? convertedPrice.toFixed(2) 
      : Math.round(convertedPrice).toString();
    
    const formattedPrice = format.position === 'before' 
      ? `${format.symbol}${priceString}` 
      : `${priceString}${format.symbol}`;
    
    return period ? `${formattedPrice}${period}` : formattedPrice;
  };

  // Get plan details with dynamic currency conversion
  const getPlanDetails = () => {
    switch (plan) {
      case 'monthly':
        return {
          name: 'Monthly Plan',
          price: formatPrice(14.99, '', 'monthly'),
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
        // Calculate savings percentage for features list
        const monthlyUsdPrice = 14.99;
        const yearlyUsdPrice = 49.00;
        const rates = exchangeRates || EXCHANGE_RATES;
        const rate = rates[userCurrency];
        
        const monthlyPriceInCurrency = 
          CURRENCY_FORMATS[userCurrency].decimals
            ? Math.floor(monthlyUsdPrice * rate) + 0.99
            : Math.ceil((monthlyUsdPrice * rate) / 100) * 100 - 1;
        
        const yearlyPriceInCurrency = 
          CURRENCY_FORMATS[userCurrency].decimals
            ? Math.round(yearlyUsdPrice * rate)
            : Math.round(yearlyUsdPrice * rate / 100) * 100;
        
        const annualCost = monthlyPriceInCurrency * 12;
        const savings = annualCost - yearlyPriceInCurrency;
        const savingsPercent = Math.round((savings / annualCost) * 100);
        
        return {
          name: 'Yearly Plan',
          price: formatPrice(49.00, '', 'yearly'),
          period: 'year',
          features: [
            'Full access to all features',
            `Annual billing (save over ${savingsPercent}%)`,
            'Priority customer support',
            'Free updates during subscription'
          ],
          savings: calculateYearlySavings(),
          popular: false,
          recommended: true
        };
      default:
        return {
          name: 'Lifetime',
          price: formatPrice(99.00, '', 'lifetime'),
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
  
  // Calculate yearly savings compared to monthly
  const calculateYearlySavings = () => {
    // Use the raw USD values and rates directly for accurate calculation
    const monthlyUsdPrice = 14.99;
    const yearlyUsdPrice = 49.00;
    
    // Get exchange rate
    const rates = exchangeRates || EXCHANGE_RATES;
    const rate = rates[userCurrency];
    
    // Convert to user currency with proper formatting
    // For monthly price, apply the .99 ending
    const monthlyPriceInCurrency = 
      CURRENCY_FORMATS[userCurrency].decimals
        ? Math.floor(monthlyUsdPrice * rate) + 0.99
        : Math.ceil((monthlyUsdPrice * rate) / 100) * 100 - 1;
    
    // For yearly price, round to whole number
    const yearlyPriceInCurrency = 
      CURRENCY_FORMATS[userCurrency].decimals
        ? Math.round(yearlyUsdPrice * rate)
        : Math.round(yearlyUsdPrice * rate / 100) * 100;
    
    // Calculate annual cost and savings
    const annualCost = monthlyPriceInCurrency * 12;
    const savings = annualCost - yearlyPriceInCurrency;
    
    // Calculate percentage
    const savingsPercent = Math.round((savings / annualCost) * 100);
    
    // Return the savings text
    return `Save ${savingsPercent}% (${formatPrice(savings / rate, '', 'yearly')})`;
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
          Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle. If you need assistance with your subscription plan, contact the support team.
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

  // Handle plan selection clicks
  const handlePlanSelection = (selectedPlan: string) => {
    // Reset the clientSecret when changing plans to force re-initialization of Stripe Elements
    setClientSecret(null);
    
    if (plan === selectedPlan) {
      // If already selected, clear selection
      router.push('/', { scroll: false });
    } else {
      // Add a timestamp parameter to ensure the URL changes, triggering a re-render
      const timestamp = Date.now();
      router.push(`/?plan=${selectedPlan}&t=${timestamp}`, { scroll: false });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle currency selection
  const handleCurrencySelect = (currency: CurrencyCode) => {
    setUserCurrency(currency);
    setDropdownOpen(false);
    // Prevent auto-detection from overriding user selection
    setIsDetectingCurrency(false);
    
    // Show loading state
    setPaymentFormLoading(true);
    
    // Reset client secret to force recreation of payment intent
    setClientSecret(null);
    
    // If we have a plan selected, recreate the payment intent
    if (selectedPlan) {
      // Small delay to ensure state updates
      setTimeout(() => {
        handleCheckout(false);
      }, 100);
    }
  };

  // Calculate dynamic savings text for features list
  const calculateDynamicSavingsText = () => {
    // Calculate savings percentage dynamically
    const rates = exchangeRates || EXCHANGE_RATES;
    const rate = rates[userCurrency];
    
    // Convert to user currency with proper formatting
    const monthlyPriceInCurrency = 
      CURRENCY_FORMATS[userCurrency].decimals
        ? Math.floor(14.99 * rate) + 0.99
        : Math.ceil((14.99 * rate) / 100) * 100 - 1;
    
    // For yearly price, round to whole number
    const yearlyPriceInCurrency = 
      CURRENCY_FORMATS[userCurrency].decimals
        ? Math.round(49.00 * rate)
        : Math.round(49.00 * rate / 100) * 100;
    
    // Calculate annual cost and savings
    const annualCost = monthlyPriceInCurrency * 12;
    const savings = annualCost - yearlyPriceInCurrency;
    
    // Calculate percentage
    const savingsPercent = Math.round((savings / annualCost) * 100);
    
    return `Save over ${savingsPercent}% compared to monthly`;
  };

  return (
    <CheckoutPageWrapper>
      <div className="min-h-screen bg-[#f3f4f7] font-inter">
        <div className="max-w-7xl mx-auto py-8 px-6 sm:px-8 lg:px-12">
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
                    
                    {/* Custom Currency Selector - Moved between heading and plan boxes */}
                    <div className="flex justify-center items-center mb-6">
                      <div className="inline-flex items-center bg-gray-100 rounded-lg px-3 py-2 shadow-sm relative" ref={dropdownRef}>
                        <FiGlobe className="text-gray-500 mr-2" />
                        
                        {/* Dropdown Button */}
                        <div 
                          className="flex items-center justify-between cursor-pointer min-w-[180px]"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                          <span className="text-gray-700 font-medium">{CURRENCY_NAMES[userCurrency]}</span>
                          <FiChevronDown className={`ml-2 transition-transform ${dropdownOpen ? 'transform rotate-180' : ''}`} />
                        </div>
                        
                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                          <div 
                            className="absolute top-full left-0 mt-1 bg-black/85 backdrop-blur-sm rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto scrollbar-hide" 
                            style={{ 
                              width: '100%',
                              scrollbarWidth: 'none', /* Firefox */
                              msOverflowStyle: 'none', /* IE and Edge */
                            }}
                            ref={dropdownContentRef}
                          >
                            <style jsx>{`
                              div::-webkit-scrollbar {
                                display: none; /* Chrome, Safari, Opera */
                              }
                            `}</style>
                            {CURRENCY_GROUPS.map((group) => (
                              <div key={group.label}>
                                <div 
                                  className="px-3 py-2 text-gray-500/60"
                                  style={{ textAlign: 'left', fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif', paddingLeft: '20px' }}
                                  onClick={() => {
                                    if (showAllCurrencies) {
                                      setLastClickedGroup(group.label);
                                      setShowAllCurrencies(false);
                                    } else {
                                      setShowAllCurrencies(true);
                                      setLastClickedGroup(group.label);
                                      
                                      // Use setTimeout to ensure the DOM is updated before scrolling
                                      setTimeout(() => {
                                        const element = groupRefs.current[group.label];
                                        const container = dropdownContentRef.current;
                                        if (element && container) {
                                          // Scroll within the dropdown only, not the whole page
                                          const headerTop = element.offsetTop;
                                          container.scrollTop = headerTop;
                                        }
                                      }, 10);
                                    }
                                  }}
                                  ref={el => groupRefs.current[group.label] = el}
                                >
                                  {group.label}
                                </div>
                                {showAllCurrencies && (
                                  <div>
                                    {group.currencies.map((code) => (
                                      <div 
                                        key={code}
                                        className={`px-5 py-2 hover:bg-gray-700/70 cursor-pointer flex items-center justify-between ${userCurrency === code ? 'bg-gray-700/50' : ''}`}
                                        onClick={() => handleCurrencySelect(code)}
                                      >
                                        <span className="text-white font-semibold pl-3" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{CURRENCY_NAMES[code]}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div 
                        onClick={() => handlePlanSelection('monthly')}
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
                            <p className="text-lg font-bold text-gray-900">{formatPrice(14.99, '', 'monthly')}</p>
                            <p className="text-sm text-gray-500">/month</p>
                          </div>
                        </div>
                      </div>

                      <div 
                        onClick={() => handlePlanSelection('yearly')}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          plan === 'yearly' 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">Yearly Plan</h4>
                            <p className="text-sm text-gray-500">Billed annually (save over {(() => {
                              // Use the raw USD values and rates directly for accurate calculation
                              const monthlyUsdPrice = 14.99;
                              const yearlyUsdPrice = 49.00;
                              
                              // Get exchange rate
                              const rates = exchangeRates || EXCHANGE_RATES;
                              const rate = rates[userCurrency];
                              
                              // Calculate annual cost and savings
                              const monthlyPriceInCurrency = 
                                CURRENCY_FORMATS[userCurrency].decimals
                                  ? Math.floor(monthlyUsdPrice * rate) + 0.99
                                  : Math.ceil((monthlyUsdPrice * rate) / 100) * 100 - 1;
                              
                              const yearlyPriceInCurrency = 
                                CURRENCY_FORMATS[userCurrency].decimals
                                  ? Math.round(yearlyUsdPrice * rate)
                                  : Math.round(yearlyUsdPrice * rate / 100) * 100;
                              
                              const annualCost = monthlyPriceInCurrency * 12;
                              const savings = annualCost - yearlyPriceInCurrency;
                              
                              // Calculate percentage
                              return Math.round((savings / annualCost) * 100);
                            })()}%)</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{formatPrice(49.00, '', 'yearly')}</p>
                            <p className="text-sm text-gray-500">/year</p>
                          </div>
                        </div>
                      </div>

                      <div 
                        onClick={() => handlePlanSelection('lifetime')}
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
                            <p className="text-lg font-bold text-gray-900">{formatPrice(99.00, '', 'lifetime')}</p>
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
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h3>
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
                                {plan === 'yearly' && planDetails.savings}
                                {plan === 'lifetime' && 'Pay once, use forever'}
                              </dd>
                            </div>
                          </div>
                        </dl>
                      </div>

                      {/* Payment form */}
                      {clientSecret && (
                        <div className="mt-6">
                          {paymentFormLoading ? (
                            <div className="flex justify-center items-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                              <span className="ml-3 text-gray-700">Loading payment options...</span>
                            </div>
                          ) : (
                            <>
                              <Elements 
                                options={{ 
                                  clientSecret,
                                  appearance: { 
                                    theme: 'stripe',
                                    variables: {
                                      colorPrimary: '#0cc471',
                                      colorBackground: '#ffffff',
                                      colorText: '#1F2937',
                                      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                                      borderRadius: '8px',
                                    },
                                  }
                                }}
                                stripe={stripePromise}
                                key={`stripe-elements-${userCurrency}-${clientSecret}`}
                              >
                                <CheckoutForm planType={selectedPlan || 'lifetime'} onSwitchToRedirect={() => handleCheckout(true)} formattedPrice={planDetails.price} />
                              </Elements>
                              
                              {/* Payment options help message */}
                              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                                <p className="text-xs text-blue-800 flex items-start">
                                  <FiInfo className="flex-shrink-0 h-4 w-4 mr-2 mt-0.5" />
                                  <span>
                                    <strong>Can't see multiple payment options?</strong> Some payment methods may not be available in your region or with your selected currency. Try refreshing the checkout session, changing currency, switching to desktop view, or using a different browser. Credit card payments and 'Pay with Link' are always available.
                                  </span>
                                </p>
                              </div>
                            </>
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
                  <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 relative h-14"> {/* Increased height to accommodate animation */}
                    {/* Center card (Discover) */}
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-all duration-200 hover:scale-105 hover:z-50" style={{ '--center-offset-x': '24px' } as React.CSSProperties}>
                      <img src="/secure payment methods/discover.svg" alt="Discover" className="h-6 sm:h-8 rounded-md animate-slide-in-center" style={{ animationDelay: '0s' }} />
                    </div>
                    
                    {/* Left side cards */}
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-105 hover:z-50 invisible" style={{ '--offset-x': '220px' } as React.CSSProperties}>
                      <img src="/secure payment methods/visa.svg" alt="Visa" className="h-6 sm:h-8 rounded-md animate-slide-in-right" style={{ animationDelay: '0.1s' }} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-105 hover:z-50 invisible" style={{ '--offset-x': '165px' } as React.CSSProperties}>
                      <img src="/secure payment methods/mastercard.svg" alt="Mastercard" className="h-6 sm:h-8 rounded-md animate-slide-in-right" style={{ animationDelay: '0.3s' }} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-105 hover:z-50 invisible" style={{ '--offset-x': '110px' } as React.CSSProperties}>
                      <img src="/secure payment methods/maestro.svg" alt="Maestro" className="h-6 sm:h-8 rounded-md animate-slide-in-right" style={{ animationDelay: '0.5s' }} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-105 hover:z-50 invisible" style={{ '--offset-x': '55px' } as React.CSSProperties}>
                      <img src="/secure payment methods/amex.svg" alt="American Express" className="h-6 sm:h-8 rounded-md animate-slide-in-right" style={{ animationDelay: '0.7s' }} />
                    </div>
                    
                    {/* Right side cards */}
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-105 hover:z-50 invisible" style={{ '--offset-x': '55px' } as React.CSSProperties}>
                      <img src="/secure payment methods/diners.svg" alt="Diners Club" className="h-6 sm:h-8 rounded-md animate-slide-in-left" style={{ animationDelay: '0.7s' }} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-105 hover:z-50 invisible" style={{ '--offset-x': '110px' } as React.CSSProperties}>
                      <img src="/secure payment methods/cartes-bancaires.svg" alt="Cartes Bancaires" className="h-6 sm:h-8 rounded-md animate-slide-in-left" style={{ animationDelay: '0.5s' }} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-105 hover:z-50 invisible" style={{ '--offset-x': '165px' } as React.CSSProperties}>
                      <img src="/secure payment methods/apple-pay.svg" alt="Apple Pay" className="h-6 sm:h-8 rounded-md animate-slide-in-left" style={{ animationDelay: '0.3s' }} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-105 hover:z-50 invisible" style={{ '--offset-x': '220px' } as React.CSSProperties}>
                      <img src="/secure payment methods/google-pay.svg" alt="Google Pay" className="h-6 sm:h-8 rounded-md animate-slide-in-left" style={{ animationDelay: '0.1s' }} />
                    </div>
                  </div>
                </div>

                {/* Need help choosing section */}
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
                                    <span className="text-xs text-gray-600">
                                      {calculateDynamicSavingsText()}
                                    </span>
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
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Plan</h3>
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
                          +342
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
            <div className="pt-4">
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
              <div className="max-w-3xl mx-auto pt-4 pb-12">
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

              <div className="pt-8 pb-0 border-t border-[#f3f4f7]">
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
                
                <div className="flex flex-col justify-center items-center mt-6 space-y-4">
                  {/* Links - centered */}
                  <div className="flex justify-center space-x-4 text-sm items-center">
                    <a href="https://getino.app/terms" className="text-[#2663eb] hover:text-blue-500 transition-colors duration-200">Terms of Service</a>
                    <span className="text-[#9ca3af] text-xl flex items-center">·</span>
                    <a href="https://getino.app/privacy" className="text-[#2663eb] hover:text-blue-500 transition-colors duration-200">Privacy Policy</a>
                    <span className="text-[#9ca3af] text-xl flex items-center">·</span>
                    <a href="https://getino.app/help" className="text-[#2663eb] hover:text-blue-500 transition-colors duration-200">Refund Policy</a>
                  </div>
                  
                  {/* Mobile Layout - Language button below links */}
                  <div className="sm:hidden mt-12 pt-4">
                    <CheckoutGoogleTranslate />
                  </div>
                  
                  {/* Desktop Layout - Language button below links */}
                  <div className="hidden sm:block mt-16 pt-4">
                    <CheckoutGoogleTranslate />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CheckoutPageWrapper>
  );
} 
