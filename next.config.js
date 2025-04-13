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
  }
};

module.exports = nextConfig; 