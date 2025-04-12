/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Optimize production builds
  poweredByHeader: false,
  // Enable React Fast Refresh
  fastRefresh: true,
  // Optimize images
  images: {
    domains: ['localhost', 'paymentsgetino.netlify.app'],
    unoptimized: true
  },
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  // Ensure proper output for Netlify
  output: 'export',
  // Disable server components for static export
  experimental: {
    appDir: true
  },
  // Disable webpack5 as it's not needed for static export
  webpack5: false
};

export default nextConfig; 