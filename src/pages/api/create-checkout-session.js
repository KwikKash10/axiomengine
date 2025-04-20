/**
 * Vercel Serverless Function - Create Checkout Session
 * 
 * This is a Next.js API route deployed as a Vercel serverless function.
 * Equivalent to the previous Netlify function: /.netlify/functions/create-checkout-session
 * 
 * @see https://vercel.com/docs/functions/serverless-functions
 */

import Stripe from 'stripe';

// Initialize Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(stripeKey?.trim() || '', {
  apiVersion: '2023-10-16', // Keep this version for now as it's stable
  typescript: true, // Enable TypeScript support
  maxNetworkRetries: 3, // Add retry logic for network issues
});

// Mock checkout URLs for local development without Stripe keys
const MOCK_CHECKOUT_URLS = {
  monthly: 'https://checkout.stripe.com/c/pay/cs_test_mock_monthly',
  yearly: 'https://checkout.stripe.com/c/pay/cs_test_mock_yearly',
  lifetime: 'https://checkout.stripe.com/c/pay/cs_test_mock_lifetime',
};

// Next.js API route handler
export default async function handler(req, res) {
  // Add CORS headers to allow API access
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    console.error(`Method not allowed: ${req.method}`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log clean request body for debugging
    console.log('Received request body:', JSON.stringify(req.body));
    
    // Get request body
    const { planType, userCurrency, convertedAmount } = req.body;
    
    if (!planType) {
      console.error('No plan type provided');
      return res.status(400).json({ error: 'Plan type is required' });
    }

    if (!userCurrency) {
      console.error('No currency provided');
      return res.status(400).json({ error: 'Currency is required' });
    }

    if (!convertedAmount) {
      console.error('No converted amount provided');
      return res.status(400).json({ error: 'Converted amount is required' });
    }
    
    // Sanitize inputs
    const sanitizedPlanType = planType.toLowerCase().trim();
    const sanitizedCurrency = userCurrency.toLowerCase().trim();
    
    // Check if we're in local development without Stripe keys
    const isLocalDev = process.env.NODE_ENV === 'development' && !stripe;
    
    if (isLocalDev) {
      console.log('Running in local development mode without Stripe keys. Using mock data.');
      
      // Return mock checkout URL based on plan type
      return res.status(200).json({ 
        url: MOCK_CHECKOUT_URLS[sanitizedPlanType] || MOCK_CHECKOUT_URLS.monthly,
        sessionId: `mock_session_${sanitizedPlanType}_${Date.now()}`,
        isMockData: true
      });
    }
    
    // For production or when Stripe keys are available
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing Stripe secret key in environment variables');
      return res.status(500).json({ error: 'Server configuration error - missing API key' });
    }

    // Set the line items based on plan type with dynamic currency
    let lineItems;
    let mode = 'payment';
    const productIds = {
      lifetime: 'prod_S4nB4crsooi2fN',
      yearly: 'prod_S4nAJKWNYnrZ8C',
      monthly: 'prod_S4n8GRGIBAlcmW',
    };
    
    if (!productIds[sanitizedPlanType]) {
      return res.status(400).json({ error: 'Invalid plan type provided' });
    }
    
    switch (sanitizedPlanType) {
      case 'lifetime':
        lineItems = [
          {
            price_data: {
              currency: sanitizedCurrency,
              product_data: {
                name: 'Buy Getino Lifetime'
              },
              unit_amount: convertedAmount,
            },
            quantity: 1,
          },
        ];
        mode = 'payment'; // One-time payment
        break;
      case 'yearly':
        lineItems = [
          {
            price_data: {
              currency: sanitizedCurrency,
              product_data: {
                name: 'Subscribe to Getino Pro'
              },
              unit_amount: convertedAmount,
              recurring: {
                interval: 'year',
                interval_count: 1,
              },
            },
            quantity: 1,
          },
        ];
        mode = 'subscription'; // Recurring payment
        break;
      case 'monthly':
        lineItems = [
          {
            price_data: {
              currency: sanitizedCurrency,
              product_data: {
                name: 'Subscribe to Getino Pro'
              },
              unit_amount: convertedAmount,
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            quantity: 1,
          },
        ];
        mode = 'subscription'; // Recurring payment
        break;
      default:
        return res.status(400).json({ error: 'Invalid plan type provided' });
    }

    // Session parameters
    const origin = req.headers.origin || 'https://checkout.getino.app';
    console.log('Request origin:', origin);
    
    // Product information
    const productName = sanitizedPlanType === 'lifetime' ? 'Buy Getino Lifetime' : 
                        'Subscribe to Getino Pro';

    // Base parameters for all checkout modes
    const baseSessionParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode,
      // Force collection of billing address with name and phone
      billing_address_collection: 'required',
      // Add phone collection with billing address
      phone_number_collection: {
        enabled: true
      },
      // Improve tax settings
      automatic_tax: {
        enabled: true,
      },
      // Custom text to improve checkout experience and remove "Pay Payment Service"
      custom_text: {
        submit: {
          message: 'Click to complete your secure purchase. By proceeding, you agree to our Terms of Service.',
        },
        after_submit: {
          message: 'You\'ll receive access details via email shortly.',
        },
      },
      allow_promotion_codes: true,
      locale: 'auto',
      // Custom brand colors if set up in Stripe
      custom_branding: {},
      // Enhanced metadata to track conversion and attribution
      metadata: {
        source: req.headers.referer || 'website',
        plan: sanitizedPlanType,
        utm_source: req.body.utm_source || undefined,
        utm_medium: req.body.utm_medium || undefined,
        utm_campaign: req.body.utm_campaign || undefined,
        device: req.headers['user-agent'] ? (req.headers['user-agent'].includes('Mobile') ? 'mobile' : 'desktop') : 'unknown',
      },
      // Prefill customer information if available - this places email at the top
      customer_email: req.body.email || undefined,
      // Payment intent data that helps control the form flow
      payment_intent_data: mode === 'payment' ? {
        description: productName,
        receipt_email: req.body.email || undefined,
        metadata: {
          plan: sanitizedPlanType,
          source: req.headers.referer || 'direct',
        },
        // This capture method helps ensure the form flow shows billing before payment
        capture_method: 'automatic',
      } : undefined,
      // Set the payment submission type to a cleaner label
      submit_type: 'auto',
    };

    // Add customer_creation only for one-time payments (mode=payment)
    // This parameter is not allowed in subscription mode
    if (mode === 'payment') {
      baseSessionParams.customer_creation = 'always';
    }

    // Add specific params based on checkout type
    const isEmbedded = req.headers['x-requested-from'] === 'embedded-checkout';
    let sessionParams;
    
    if (isEmbedded) {
      sessionParams = {
        ...baseSessionParams,
        ui_mode: 'embedded',
        return_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&plan=${sanitizedPlanType}`,
      };
    } else {
      // Add enhanced redirect parameters for hosted checkout
      sessionParams = {
        ...baseSessionParams,
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&plan=${sanitizedPlanType}&coupon={CHECKOUT_SESSION_COUPON}`,
        cancel_url: `${origin}/checkout?plan=${sanitizedPlanType}&recovered=true`,
        // Enable client reference ID to help with analytics
        client_reference_id: req.body.clientId || `user_${Date.now()}`,
      };
    }

    console.log('Creating session with params:', JSON.stringify(sessionParams, null, 2));

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log('Session created:', session.id);

    // Return appropriate data based on checkout type
    if (isEmbedded) {
      if (!session.client_secret) {
        console.error('No client secret in session');
        return res.status(500).json({ error: 'Failed to create embedded checkout session' });
      }
      return res.status(200).json({ 
        clientSecret: session.client_secret,
        sessionId: session.id 
      });
    } else {
      return res.status(200).json({ 
        sessionId: session.id,
        url: session.url // Return the complete URL from Stripe
      });
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return res.status(500).json({ 
      error: 'Error creating checkout session', 
      message: error.message || 'Unknown error',
      details: error
    });
  }
} 