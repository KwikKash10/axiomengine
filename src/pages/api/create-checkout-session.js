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
const stripe = new Stripe(stripeKey ? stripeKey.trim() : '', {
  apiVersion: '2023-10-16',
});

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
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing Stripe secret key in environment variables');
      return res.status(500).json({ error: 'Server configuration error - missing API key' });
    }

    // Log clean request body for debugging
    console.log('Received request body:', JSON.stringify(req.body));
    
    // Get request body
    const { planType } = req.body;
    
    if (!planType) {
      console.error('No plan type provided');
      return res.status(400).json({ error: 'Please provide a plan type' });
    }
    
    // Sanitize the plan type to ensure it's one of the valid options
    const sanitizedPlanType = planType.toLowerCase().trim();
    
    // Set the line items based on sanitized plan type
    let lineItems;
    let mode = 'payment';
    
    switch (sanitizedPlanType) {
      case 'lifetime':
        lineItems = [
          {
            price: 'price_1RD3gC2KitrBpBuOuqkGm3ak', // Lifetime price ID
            quantity: 1,
          },
        ];
        mode = 'payment'; // One-time payment
        break;
      case 'yearly':
        lineItems = [
          {
            price: 'price_1RAdaI2KitrBpBuODqkgJjmt', // Yearly subscription price ID
            quantity: 1,
          },
        ];
        mode = 'subscription'; // Recurring payment
        break;
      case 'monthly':
        lineItems = [
          {
            price: 'price_1RD2Qz2KitrBpBuOnrgYdeS9', // Monthly subscription price ID
            quantity: 1,
          },
        ];
        mode = 'subscription'; // Recurring payment
        break;
      default:
        console.error(`Invalid plan type: ${sanitizedPlanType}`);
        return res.status(400).json({ error: `Invalid plan type provided: ${sanitizedPlanType}` });
    }

    // Session parameters
    const origin = req.headers.origin || 'https://checkout.getino.app';
    console.log('Request origin:', origin);
    
    const baseSessionParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR'],
      },
      phone_number_collection: {
        enabled: true,
      },
      custom_text: {
        submit: {
          message: 'We\'ll confirm your payment shortly after submission',
        },
      },
      locale: 'auto',
    };

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
      sessionParams = {
        ...baseSessionParams,
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&plan=${sanitizedPlanType}`,
        cancel_url: `${origin}/form`,
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
      return res.status(200).json({ sessionId: session.id });
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