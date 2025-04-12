/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Optimize images
  images: {
    domains: ['localhost', 'paymentsgetino.netlify.app'],
    unoptimized: true
  },
  // Ensure proper output for Netlify
  output: 'export'
};

export default nextConfig; 