# Axiom Engine

Axiom Engine is the AI-powered premium component of the GetINO app, running as a subdomain at [axiomengine.getino.app](https://axiomengine.getino.app).

## Features

- INO AI Premium interface with interactive 3D mascot
- Advanced AI capabilities showcase
- Seamless integration with the main GetINO application
- Beautiful UI with animations and transitions

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` with your Supabase credentials
4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Vercel Deployment

The easiest way to deploy this application is with Vercel:

1. Push the code to a Git repository
2. Connect the repository to Vercel
3. Set up the environment variables in Vercel:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_APP_NAME`: AxiomEngine
   - `VITE_APP_URL`: https://axiomengine.getino.app
4. Deploy!

### Custom Domain Setup

For the subdomain setup, you should configure DNS:

1. Add a CNAME record in your DNS settings:
   - Name: `axiomengine`
   - Value: `cname.vercel-dns.com`
2. Add the custom domain in your Vercel project settings

## Development

### Structure

- `src/pages` - Page components
- `src/components` - Reusable components
- `src/contexts` - React context providers
- `src/assets` - Static assets

### Tech Stack

- React 19.1.0
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Supabase 

# Axiom Engine - Secure Gemini API Integration

This project includes a server-side secure implementation of Google's Gemini API.

## Security Improvement

The Google Gemini API has been moved from client-side to server-side (via serverless functions) to improve security by preventing API key exposure in the browser.

## Setup Instructions

### 1. Environment Variable Setup

You need to set up an environment variable in your hosting platform (Vercel or Netlify).

#### For Vercel:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add a new environment variable:
   - Name: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key_here`
4. Save the changes and redeploy your application

#### For Netlify:

1. Go to your project in the Netlify dashboard
2. Navigate to Site settings > Build & deploy > Environment
3. Add a new environment variable:
   - Key: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key_here`
4. Save the changes and redeploy your application

### 2. Serverless Function

The API endpoint is located at:
```
/api/gemini
```

This endpoint handles all communication with the Gemini API and keeps your API key secure.

### 3. Testing

After deploying, test the application to ensure:
- The chat functionality works as expected
- No API keys are visible in the browser console
- Server-side error handling works correctly

## Troubleshooting

If you encounter issues:

1. Check that the `GEMINI_API_KEY` environment variable is set correctly
2. Verify the serverless function is deployed correctly
3. Check the Vercel/Netlify function logs for errors

## Security Benefits

- API key is no longer exposed in the browser
- All API calls are made server-side
- Access control can be implemented on the server
- API usage can be monitored and limited as needed 

## Stable Release v1.2.0

Released: May 17, 2025

### Changes
- Updated loading message to "Loading Axiom Engine..."

### Commit Details
- **Commit Hash**: 12df27e504578a1549a661584bbbf9b968c65a19
- **Author**: Hustle10 <hustle10@gmail.com>
- **Project URL**: https://github.com/KwikKash10/axiomengine
- **Branch**: stable-release
- **Tag**: v1.2.0 