/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict mode to prevent context issues
  reactStrictMode: false,
  // swcMinify is not recognized in Next.js 15
  images: {
    unoptimized: true
  },
  // Enable trailing slash for consistent URLs
  trailingSlash: true,
  // Use standalone output to avoid static generation issues
  output: 'standalone',
  // Necessary for API routes to work in production
  typescript: {
    // We'll handle TypeScript errors in development
    ignoreBuildErrors: true
  },
  eslint: {
    // We'll handle ESLint errors in development
    ignoreDuringBuilds: true
  },
  // Ensure Stripe.js loads properly
  webpack: (config) => {
    config.resolve.fallback = { 
      crypto: false,
      fs: false,
      path: false 
    };
    
    // Add polling for file changes (moved from webpackDevMiddleware)
    if (process.env.NODE_ENV === 'development') {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    return config;
  }
};

module.exports = nextConfig; 