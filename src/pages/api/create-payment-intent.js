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
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, planType } = req.body;

    if (!amount) {
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