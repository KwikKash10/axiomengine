# Vercel Serverless Functions

This directory contains Next.js API Routes that are deployed as Vercel serverless functions. These functions replace the previous Netlify functions that were located in the `netlify/functions` directory.

## How Vercel Serverless Functions Work

In Next.js applications deployed to Vercel, any file inside the `pages/api` directory is mapped to `/api/*` and will be treated as an API endpoint instead of a page. These are server-side only bundles and won't increase your client-side bundle size.

## Available Functions

1. `create-checkout-session.js`
   - Endpoint: `/api/create-checkout-session`
   - Purpose: Creates a Stripe Checkout session for processing payments
   - Replaces: `/.netlify/functions/create-checkout-session`

2. `create-payment-intent.js`
   - Endpoint: `/api/create-payment-intent`
   - Purpose: Creates a Stripe Payment Intent for custom payment flows
   - Replaces: `/.netlify/functions/create-payment-intent`

## Documentation

For more information on Vercel Serverless Functions and Next.js API Routes:

- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [Vercel Serverless Functions Documentation](https://vercel.com/docs/functions/serverless-functions) 