# Stripe Checkout Integration

This is a Next.js application that demonstrates a simple Stripe checkout integration.

## Features

- Modern UI with Tailwind CSS
- Stripe Checkout integration
- Success page after payment
- TypeScript support
- Responsive design

## Prerequisites

- Node.js 18+ installed
- A Stripe account with API keys

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your Stripe keys:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key_here
   STRIPE_SECRET_KEY=your_secret_key_here
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing

To test the checkout:
1. Use Stripe's test card numbers (e.g., 4242 4242 4242 4242)
2. Any future expiration date
3. Any 3-digit CVC
4. Any postal code

## Environment Variables

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `NEXT_PUBLIC_BASE_URL`: The base URL of your application

## License

MIT 