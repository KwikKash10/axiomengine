/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable webpack5
  webpack5: true,
  // Optimize production builds
  poweredByHeader: false,
  // Enable React Fast Refresh
  fastRefresh: true,
  // Optimize images
  images: {
    domains: ['localhost'],
  },
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  }
};

export default nextConfig; 