import Stripe from 'stripe';
import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false, // Need raw body for webhook signature verification
  },
};

const webhookHandler = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Webhook secret is not configured' });
  }

  try {
    // Get the raw body data
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'];

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed:`, err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Process the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
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
          
          // Example code to store customer and subscription info
          // await database.users.update({
          //   where: { email: session.customer_email },
          //   data: {
          //     stripeCustomerId: session.customer,
          //     subscriptionType: selectedPlan,
          //     subscriptionId: session.subscription,
          //     hasActiveSubscription: true,
          //   },
          // });
          
        } catch (lineItemsError) {
          console.error('Error retrieving line items:', lineItemsError);
        }
        break;
        
      case 'invoice.paid':
        // Handle successful payment for subscription renewals
        const invoice = event.data.object;
        console.log(`Payment succeeded for subscription: ${invoice.subscription}`);
        // Update subscription status or renewal date in your database
        break;
        
      case 'invoice.payment_failed':
        // Handle failed payment for subscription renewals
        const failedInvoice = event.data.object;
        console.log(`Payment failed for subscription: ${failedInvoice.subscription}`);
        // Send email notification to customer or update subscription status
        break;
        
      case 'customer.subscription.updated':
        // Handle subscription updates (e.g., plan changes)
        const subscription = event.data.object;
        console.log(`Subscription ${subscription.id} was updated`);
        // Update subscription details in your database
        break;
        
      case 'customer.subscription.deleted':
        // Handle subscription cancellations
        const canceledSubscription = event.data.object;
        console.log(`Subscription ${canceledSubscription.id} was canceled`);
        // Update user status in your database
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (err) {
    console.error(`❌ Error processing webhook:`, err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

export default webhookHandler; 