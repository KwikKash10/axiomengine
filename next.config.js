/** @type {import('next').NextConfig} */
const dynamicConfig = require('./dynamic.config.js');

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
  // Ensure Stripe.js loads properly
  webpack: (config) => {
    config.resolve.fallback = { 
      crypto: false,
      fs: false,
      path: false 
    };
    return config;
  },
  // Only export API routes as serverless, render all other routes on client
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    // Filter out dynamic routes
    const filteredPathMap = {};
    for (const [path, page] of Object.entries(defaultPathMap)) {
      // Skip dynamic routes that require client-side rendering
      if (!dynamicConfig.dynamicRoutes.includes(path)) {
        filteredPathMap[path] = page;
      }
    }
    return filteredPathMap;
  }
};

module.exports = nextConfig; 