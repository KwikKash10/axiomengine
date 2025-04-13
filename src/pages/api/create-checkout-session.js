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
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Next.js API route handler
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get request body
    const { planType } = req.body;
    
    if (!planType) {
      return res.status(400).json({ error: 'Please provide a plan type' });
    }
    
    // Set the line items based on plan type
    let lineItems;
    let mode = 'payment';
    
    switch (planType) {
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
        return res.status(400).json({ error: 'Invalid plan type provided' });
    }

    // Session parameters
    const origin = req.headers.origin || 'http://localhost:3000';
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
        return_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&plan=${planType}`,
      };
    } else {
      sessionParams = {
        ...baseSessionParams,
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&plan=${planType}`,
        cancel_url: `${origin}/form`,
      };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    // Return appropriate data based on checkout type
    if (isEmbedded) {
      if (!session.client_secret) {
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
      message: error.message,
      details: error
    });
  }
} 