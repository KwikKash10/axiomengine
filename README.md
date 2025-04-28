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