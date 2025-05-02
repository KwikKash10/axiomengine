const Stripe = require('stripe');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil',
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
    
    // Sanitize inputs
    const sanitizedPlanType = planType.toLowerCase().trim();
    const sanitizedCurrency = userCurrency.toUpperCase().trim();
    
    // Product names and descriptions based on plan type
    const productDetails = {
      lifetime: {
        name: 'Getino Pro - Lifetime',
        description: 'Lifetime access to Getino Pro'
      },
      yearly: {
        name: 'Getino Pro - Yearly',
        description: 'Annual subscription to Getino Pro'
      },
      monthly: {
        name: 'Getino Pro - Monthly',
        description: 'Monthly subscription to Getino Pro'
      },
      'monthly-yearly': {
        name: 'Getino Pro - Annual (Monthly Billing)',
        description: 'Annual subscription with monthly billing'
      }
    };

    const productName = productDetails[sanitizedPlanType]?.name || 'Getino Pro';
    
    // Use predefined price IDs for upsell functionality
    let lineItems;
    let mode = sanitizedPlanType === 'lifetime' ? 'payment' : 'subscription';
    const priceIds = {
      lifetime: 'price_1RE8O72KitrBpBuO12sd4L3M', // Lifetime plan ($99)
      yearly: 'price_1RE8Lt2KitrBpBuOYYbxSAKp',   // Yearly plan ($49)
      monthly: 'price_1RE4uK2KitrBpBuOLcp4UXHX',  // Monthly plan ($14.99)
      'monthly-yearly': 'price_1RGf3I2KitrBpBuOak7aQHKb', // Monthly billed yearly plan ($49)
    };
    
    if (!priceIds[sanitizedPlanType]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid plan type provided' }),
      };
    }
    
    // Log currency information for reference but use USD pricing
    console.log(`Creating ${mode} checkout with reference ${sanitizedCurrency} ${convertedAmount}`);

    // Set up line items with price IDs 
    switch (sanitizedPlanType) {
      case 'lifetime':
        lineItems = [
          {
            price: priceIds.lifetime,
            quantity: 1,
          },
        ];
        break;
      case 'yearly':
        lineItems = [
          {
            price: priceIds.yearly,
            quantity: 1,
          },
        ];
        break;
      case 'monthly':
        lineItems = [
          {
            price: priceIds.monthly,
            quantity: 1,
          },
        ];
        break;
      case 'monthly-yearly':
        lineItems = [
          {
            price: priceIds['monthly-yearly'],
            quantity: 1,
          },
        ];
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
      payment_method_types: mode === 'payment' 
        ? ['card', 'amazon_pay', 'link', 'paypal'] 
        : ['card', 'amazon_pay', 'link'],
      line_items: lineItems,
      mode,
      billing_address_collection: 'required',
      shipping_address_collection: {
        enabled: false
      },
      // Disable phone number collection to only show email in contact section
      phone_number_collection: {
        enabled: false,
      },
      // Disable automatic tax to show subtotal instead
      automatic_tax: {
        enabled: false,
      },
      tax_id_collection: {
        enabled: false,
      },
      locale: 'auto',
      // Make users explicitly select a payment method - only for subscription mode
      ...(mode === 'subscription' ? { payment_method_collection: 'always' } : {}),
      // Configure payment method options
      payment_method_options: {},
      // Use hosted mode for clean layout
      ui_mode: 'hosted',
      // Customize checkout button text
      custom_text: {
        submit: {
          message: 'Pay and subscribe'
        }
      },
      // Add customer email to pre-fill the email field
      customer_email: JSON.parse(event.body).email || undefined,
      // Add payment intent data for one-time payments
      payment_intent_data: mode === 'payment' ? {
        description: productName
      } : undefined,
      // Add metadata to track currency and other information
      metadata: {
        plan: sanitizedPlanType,
        currency: sanitizedCurrency,
        source: event.headers.referer || 'netlify',
      },
    };

    // Add specific params based on checkout type
    const isEmbedded = event.headers['x-requested-from'] === 'embedded-checkout';
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
        cancel_url: `${origin}/checkout?plan=${sanitizedPlanType}&recovered=true`,
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
        body: JSON.stringify({ 
          url: session.url,
          sessionId: session.id 
        }),
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