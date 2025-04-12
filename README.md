# Payment Service

A modern payment processing service built with Next.js and Stripe integration.

## Features

- Stripe payment integration
- Multiple payment methods support
- Embedded checkout functionality
- Payment form handling
- Success page routing
- API routes for payment processing

## Tech Stack

- Next.js
- TypeScript
- Stripe API
- Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file with:
   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Available Routes

- `/` - Home page
- `/form` - Payment form
- `/embedded` - Embedded payment flow
- `/embedded-checkout` - Embedded checkout experience
- `/embedded-components` - Custom payment components
- `/link` - Payment link handling
- `/success` - Payment success page

## API Endpoints

- `/api/create-payment-intent` - Creates a new payment intent
- `/api/create-checkout-session` - Creates a new checkout session

## Environment Variables

Required environment variables:
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`

## License

MIT 