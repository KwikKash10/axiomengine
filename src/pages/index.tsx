import type { NextPage } from 'next';
import CheckoutPage from './checkout';

/**
 * Homepage that renders the checkout page directly
 * This ensures there's a proper server-side rendered file for the root route
 */
const Home: NextPage = () => {
  return <CheckoutPage />;
};

export default Home; 