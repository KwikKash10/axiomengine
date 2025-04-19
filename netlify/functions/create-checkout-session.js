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
    const { planType, userCurrency, convertedAmount } = JSON.parse(event.body);
    
    if (!planType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Plan type is required' }),
      };
    }

    if (!userCurrency) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Currency is required' }),
      };
    }

    if (!convertedAmount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Converted amount is required' }),
      };
    }
    
    // Set the line items based on plan type with dynamic currency
    let lineItems;
    let mode = 'payment';
    const productIds = {
      lifetime: 'prod_S4nB4crsooi2fN',
      yearly: 'prod_S4nAJKWNYnrZ8C',
      monthly: 'prod_S4n8GRGIBAlcmW',
    };
    
    switch (planType) {
      case 'lifetime':
        lineItems = [
          {
            price_data: {
              currency: userCurrency.toLowerCase(),
              product: productIds[planType],
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
              currency: userCurrency.toLowerCase(),
              product: productIds[planType],
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
              currency: userCurrency.toLowerCase(),
              product: productIds[planType],
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