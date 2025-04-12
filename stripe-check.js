const Stripe = require('stripe');
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY not found in environment');
  process.exit(1);
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getStripeData() {
  try {
    // Check new lifetime price ID
    console.log('Checking new lifetime price ID...');
    try {
      const lifetimePrice = await stripe.prices.retrieve('price_1RD3gC2KitrBpBuOuqkGm3ak');
      console.log(`New Lifetime price ID: ${lifetimePrice.id}`);
      console.log(`Price: $${lifetimePrice.unit_amount / 100}`);
      console.log(`Type: ${lifetimePrice.type}`);
      console.log(`Is recurring: ${lifetimePrice.recurring ? 'Yes' : 'No'}`);
      if (lifetimePrice.recurring) {
        console.log(`Recurring interval: ${lifetimePrice.recurring.interval}`);
        console.log(`Recurring interval count: ${lifetimePrice.recurring.interval_count}`);
      }
    } catch (error) {
      console.error('Error retrieving new lifetime price:', error.message);
    }
    
    // Check old lifetime price ID for comparison
    console.log('\nChecking old lifetime price ID for comparison...');
    try {
      const oldLifetimePrice = await stripe.prices.retrieve('price_1RD2Z02KitrBpBuOSJo9Bilj');
      console.log(`Old Lifetime price ID: ${oldLifetimePrice.id}`);
      console.log(`Price: $${oldLifetimePrice.unit_amount / 100}`);
      console.log(`Type: ${oldLifetimePrice.type}`);
      console.log(`Is recurring: ${oldLifetimePrice.recurring ? 'Yes' : 'No'}`);
      if (oldLifetimePrice.recurring) {
        console.log(`Recurring interval: ${oldLifetimePrice.recurring.interval}`);
        console.log(`Recurring interval count: ${oldLifetimePrice.recurring.interval_count}`);
      }
    } catch (error) {
      console.error('Error retrieving old lifetime price:', error.message);
    }
    
    // Check monthly price ID
    console.log('\nChecking monthly price ID...');
    try {
      const monthlyPrice = await stripe.prices.retrieve('price_1RD2Qz2KitrBpBuOnrgYdeS9');
      console.log(`Monthly price: $${monthlyPrice.unit_amount / 100} - Type: ${monthlyPrice.type} - Interval: ${monthlyPrice.recurring?.interval}`);
    } catch (error) {
      console.error('Error retrieving monthly price:', error.message);
    }
    
    // Check yearly price ID
    console.log('\nChecking yearly price ID...');
    try {
      const yearlyPrice = await stripe.prices.retrieve('price_1RAdaI2KitrBpBuODqkgJjmt');
      console.log(`Yearly price: $${yearlyPrice.unit_amount / 100} - Type: ${yearlyPrice.type} - Interval: ${yearlyPrice.recurring?.interval}`);
    } catch (error) {
      console.error('Error retrieving yearly price:', error.message);
    }
    
    // Check product IDs
    console.log('\nChecking product IDs...');
    const products = ['prod_S4nB4crsooi2fN', 'prod_S4n8GRGIBAlcmW', 'prod_S4nAJKWNYnrZ8C'];
    for (const productId of products) {
      try {
        const product = await stripe.products.retrieve(productId);
        console.log(`Product ${productId}: ${product.name} - ${product.description || 'No description'}`);
      } catch (error) {
        console.error(`Error retrieving product ${productId}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Error fetching data from Stripe:', error);
  }
}

getStripeData();
