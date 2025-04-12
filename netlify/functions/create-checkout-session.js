const Stripe = require('stripe');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get request body
    const { planType } = JSON.parse(event.body);
    
    if (!planType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Please provide a plan type' }),
      };
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
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid plan type provided' }),
        };
    }

    // Session parameters
    const origin = event.headers.origin || 'http://localhost:3000';
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
    const isEmbedded = event.headers['x-requested-from'] === 'embedded-checkout';
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
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to create embedded checkout session' }),
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          clientSecret: session.client_secret,
          sessionId: session.id 
        }),
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ sessionId: session.id }),
      };
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error creating checkout session', 
        message: error.message,
        details: error
      }),
    };
  }
}; 