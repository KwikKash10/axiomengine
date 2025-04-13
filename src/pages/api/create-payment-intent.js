/**
 * Vercel Serverless Function - Create Payment Intent
 * 
 * This is a Next.js API route deployed as a Vercel serverless function.
 * Equivalent to the previous Netlify function: /.netlify/functions/create-payment-intent
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

    console.log('Received request body:', req.body);
    
    const { amount, planType } = req.body;

    if (!amount) {
      console.error('No amount provided');
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Define metadata based on the plan type
    const metadata = {};
    
    if (planType) {
      metadata.planType = planType;
      
      // Add product IDs based on plan type
      const productIds = {
        lifetime: 'prod_S4nB4crsooi2fN',
        yearly: 'prod_S4nAJKWNYnrZ8C',
        monthly: 'prod_S4n8GRGIBAlcmW',
      };
      
      if (planType in productIds) {
        metadata.productId = productIds[planType];
      }
    }

    console.log('Creating payment intent with amount:', amount);

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
      description: planType 
        ? `Payment for ${planType} plan` 
        : 'Payment',
    });

    console.log('Payment intent created:', paymentIntent.id);

    return res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    return res.status(500).json({ 
      error: 'Error creating payment intent', 
      message: error.message,
      details: error
    });
  }
} 