const Stripe = require('stripe');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook secret is not configured' }),
    };
  }

  try {
    // Get the raw body data and signature
    const payload = event.body;
    const signature = event.headers['stripe-signature'];

    // Verify webhook signature
    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed:`, err.message);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
      };
    }

    // Process the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        const session = stripeEvent.data.object;
        
        try {
          // Retrieve line items to check which plan the customer chose
          // This is important for subscription upsells where the customer may have 
          // switched from the initial plan to the upsell option
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          const selectedPriceId = lineItems.data[0].price.id;
          
          // Map price IDs to plan types
          const priceToPlans = {
            'price_1RE8O72KitrBpBuO12sd4L3M': 'lifetime', // Lifetime plan ($99)
            'price_1RE8Lt2KitrBpBuOYYbxSAKp': 'yearly',   // Yearly plan ($49)
            'price_1RE4uK2KitrBpBuOLcp4UXHX': 'monthly',  // Monthly plan ($14.99)
            'price_1RGf3I2KitrBpBuOak7aQHKb': 'monthly-yearly', // Monthly billed yearly plan ($49)
          };
          
          const selectedPlan = priceToPlans[selectedPriceId] || 'unknown';
          
          console.log(`Customer selected the ${selectedPlan} plan`);
          
          // Add your subscription provisioning logic here
          // For example, update user status in database, send welcome emails, etc.
          
        } catch (lineItemsError) {
          console.error('Error retrieving line items:', lineItemsError);
        }
        break;
        
      case 'invoice.paid':
        // Handle successful payment for subscription renewals
        const invoice = stripeEvent.data.object;
        console.log(`Payment succeeded for subscription: ${invoice.subscription}`);
        // Update subscription status or renewal date in your database
        break;
        
      case 'invoice.payment_failed':
        // Handle failed payment for subscription renewals
        const failedInvoice = stripeEvent.data.object;
        console.log(`Payment failed for subscription: ${failedInvoice.subscription}`);
        // Send email notification to customer or update subscription status
        break;
        
      case 'customer.subscription.updated':
        // Handle subscription updates (e.g., plan changes)
        const subscription = stripeEvent.data.object;
        console.log(`Subscription ${subscription.id} was updated`);
        // Update subscription details in your database
        break;
        
      case 'customer.subscription.deleted':
        // Handle subscription cancellations
        const canceledSubscription = stripeEvent.data.object;
        console.log(`Subscription ${canceledSubscription.id} was canceled`);
        // Update user status in your database
        break;
        
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (err) {
    console.error(`❌ Error processing webhook:`, err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook handler failed' }),
    };
  }
}; 