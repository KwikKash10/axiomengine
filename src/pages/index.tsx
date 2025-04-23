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

// This ensures the page is always server-rendered and not statically generated
export const getServerSideProps = async () => {
  return {
    props: {}
  };
};
