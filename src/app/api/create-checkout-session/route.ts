import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Check if we have a secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY environment variable');
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    // Get request body
    const body = await request.json();
    console.log('Received request body:', body);
    
    // Check if this is an embedded checkout request
    const requestedFrom = request.headers.get('X-Requested-From');
    const isEmbedded = requestedFrom === 'embedded-checkout';
    console.log('Is embedded checkout:', isEmbedded);
    
    // Get plan type from request
    const { planType } = body;
    
    if (!planType) {
      console.error('No plan type provided');
      return NextResponse.json(
        { error: 'Please provide a plan type' },
        { status: 400 }
      );
    }
    
    // Set the line items based on plan type
    let lineItems;
    let mode: 'payment' | 'subscription' = 'payment';
    
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
        console.error('Invalid plan type provided:', planType);
        return NextResponse.json(
          { error: 'Invalid plan type provided' },
          { status: 400 }
        );
    }

    // Session parameters
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const baseSessionParams: Stripe.Checkout.SessionCreateParams = {
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
    let sessionParams: Stripe.Checkout.SessionCreateParams;
    
    if (isEmbedded) {
      sessionParams = {
        ...baseSessionParams,
        ui_mode: 'embedded',
        return_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      };
    } else {
      sessionParams = {
        ...baseSessionParams,
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/form`,
      };
    }

    // Create checkout session
    console.log('Creating session with params:', JSON.stringify(sessionParams, null, 2));
    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log('Session created successfully. ID:', session.id);

    // Return appropriate data based on checkout type
    if (isEmbedded) {
      if (!session.client_secret) {
        console.error('No client secret in session for embedded checkout');
        return NextResponse.json(
          { error: 'Failed to create embedded checkout session' },
          { status: 500 }
        );
      }
      return NextResponse.json({ 
        clientSecret: session.client_secret,
        sessionId: session.id 
      });
    } else {
      return NextResponse.json({ sessionId: session.id });
    }
  } catch (err) {
    // Log the error for debugging
    const error = err as Error;
    console.error('Error creating checkout session:', error);
    console.error('Error details:', error.message);
    
    if (err instanceof Stripe.errors.StripeError) {
      console.error('Stripe error type:', err.type);
      console.error('Stripe error code:', err.code);
      console.error('Stripe error param:', err.param);
      
      return NextResponse.json(
        { 
          error: `Stripe error: ${err.message}`,
          type: err.type,
          code: err.code,
          param: err.param 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error creating checkout session', details: error.message },
      { status: 500 }
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