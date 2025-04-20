# Vercel Deployment Instructions

This application has been migrated from Netlify to Vercel deployment. The following changes have been made:

## API Routes Migration

The serverless functions have been migrated from Netlify Functions to Vercel API Routes:

- Netlify Functions: `/.netlify/functions/create-checkout-session` → Vercel API: `/api/create-checkout-session`
- Netlify Functions: `/.netlify/functions/create-payment-intent` → Vercel API: `/api/create-payment-intent`

### Why `pages/api` instead of a custom folder?

Unlike Netlify which uses a custom `netlify/functions` folder, Vercel utilizes Next.js's built-in API Routes system:

- Files inside the `pages/api` directory are automatically treated as API endpoints in Next.js
- The path to the file becomes the route (e.g., `pages/api/hello.js` becomes `/api/hello`)
- This is the standard Next.js and Vercel way to implement serverless functions
- A README file has been added to the `src/pages/api` directory explaining these functions

## Configuration Files

- Added `vercel.json` for Vercel-specific configuration
- Updated API endpoints in all frontend files
- Modified `package.json` scripts for Vercel compatibility

## Deployment Steps

1. Ensure you have the Vercel CLI installed:
   ```
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```
   vercel login
   ```

3. Add your environment variables to Vercel:
   ```
   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   vercel env add STRIPE_SECRET_KEY
   ```

4. Deploy to Vercel:
   ```
   vercel
   ```

5. For production deployment:
   ```
   vercel --prod
   ```

## Important Notes

- Ensure your Stripe webhooks are updated to point to the new Vercel deployment URL
- If you encounter CORS issues, you may need to add your frontend URL to the allowed origins in your Vercel API routes
- The API routes implementation follows Next.js API routes pattern, which differs slightly from Netlify Functions