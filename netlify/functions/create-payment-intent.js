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
    const { amount, convertedAmount, userCurrency, planType } = JSON.parse(event.body);

    if (!amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Original amount is required' }),
      };
    }

    if (!convertedAmount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Converted amount is required' }),
      };
    }

    if (!userCurrency) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Currency is required' }),
      };
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
      amount: parseInt(convertedAmount, 10),
      currency: userCurrency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
      description: planType 
        ? `Payment for ${planType} plan` 
        : 'Payment',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id
      }),
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error creating payment intent', 
        message: error.message,
        details: error
      }),
    };
  }
}; 