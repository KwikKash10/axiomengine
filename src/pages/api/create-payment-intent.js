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
    
    const { amount, convertedAmount, userCurrency, planType } = req.body;

    if (!amount) {
      console.error('No amount provided');
      return res.status(400).json({ error: 'Amount is required' });
    }

    if (!convertedAmount) {
      console.error('No converted amount provided');
      return res.status(400).json({ error: 'Converted amount is required' });
    }

    if (!userCurrency) {
      console.error('No currency provided');
      return res.status(400).json({ error: 'Currency is required' });
    }

    // Ensure amount is a clean number
    const sanitizedAmount = parseInt(convertedAmount, 10);
    if (isNaN(sanitizedAmount)) {
      return res.status(400).json({ error: 'Invalid amount value' });
    }

    // Sanitize currency
    const sanitizedCurrency = userCurrency.toUpperCase().trim();

    // Define metadata based on the plan type
    const metadata = {};
    
    if (planType) {
      const sanitizedPlanType = planType.toLowerCase().trim();
      metadata.planType = sanitizedPlanType;
      
      // Add product IDs based on plan type
      const productIds = {
        lifetime: 'prod_S4nB4crsooi2fN',
        yearly: 'prod_S4nAJKWNYnrZ8C',
        monthly: 'prod_S4n8GRGIBAlcmW',
      };
      
      if (sanitizedPlanType in productIds) {
        metadata.productId = productIds[sanitizedPlanType];
      }
    }

    console.log('Creating payment intent with amount:', sanitizedAmount, 'currency:', sanitizedCurrency);

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: sanitizedAmount,
      currency: sanitizedCurrency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
      description: planType 
        ? `Payment for ${planType.toLowerCase().trim()} plan` 
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
      message: error.message || 'Unknown error',
      details: error
    });
  }
} 