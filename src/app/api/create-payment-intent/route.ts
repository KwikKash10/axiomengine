import { NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export async function POST(req: Request) {
  try {
    // Handle CORS
    const origin = req.headers.get('origin') || '';
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.NEXT_PUBLIC_BASE_URL || '',
    ].filter(Boolean);
    
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    
    if (allowedOrigins.includes(origin)) {
      headers.append('Access-Control-Allow-Origin', origin);
      headers.append('Access-Control-Allow-Credentials', 'true');
    }
    
    const body = await req.json();
    console.log('Request body:', body);

    const { amount, planType } = body;

    if (!amount) {
      return new NextResponse(
        JSON.stringify({ error: 'Amount is required' }), 
        { status: 400, headers }
      );
    }

    // Define metadata based on the plan type
    const metadata: Record<string, string> = {};
    
    if (planType) {
      metadata.planType = planType;
      
      // Add product IDs based on plan type
      const productIds = {
        lifetime: 'prod_S4nB4crsooi2fN',
        yearly: 'prod_S4nAJKWNYnrZ8C',
        monthly: 'prod_S4n8GRGIBAlcmW',
      };
      
      if (planType in productIds) {
        metadata.productId = productIds[planType as keyof typeof productIds];
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

    console.log('Payment intent created:', {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret ? 'exists' : 'missing',
      amount: paymentIntent.amount,
    });

    return new NextResponse(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    console.error('Error message:', error.message);
    
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Error creating payment intent', 
        message: error.message,
        details: error
      }),
      { status: 500, headers }
    );
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.NEXT_PUBLIC_BASE_URL || '',
  ].filter(Boolean);
  
  const headers = new Headers();
  
  if (allowedOrigins.includes(origin)) {
    headers.append('Access-Control-Allow-Origin', origin);
    headers.append('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.append('Access-Control-Allow-Headers', 'Content-Type, X-Requested-From');
    headers.append('Access-Control-Allow-Credentials', 'true');
    headers.append('Access-Control-Max-Age', '86400');
  }
  
  return new NextResponse(null, { status: 204, headers });
} 