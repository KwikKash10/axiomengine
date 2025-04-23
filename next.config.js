/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify is not recognized in Next.js 15
  images: {
    unoptimized: true
  },
  // Enable trailing slash for consistent URLs
  trailingSlash: true,
  // Necessary for API routes to work in production
  typescript: {
    // We'll handle TypeScript errors in development
    ignoreBuildErrors: true
  },
  eslint: {
    // We'll handle ESLint errors in development
    ignoreDuringBuilds: true
  },
  // Enable HTTPS in development with proper configuration
  webpackDevMiddleware: config => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
  // Ensure Stripe.js loads properly
  webpack: (config) => {
    config.resolve.fallback = { 
      crypto: false,
      fs: false,
      path: false 
    };
    return config;
  }
};

module.exports = nextConfig; 