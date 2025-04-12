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
  output: 'export',
  // Handle API routes with Netlify functions
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: '/.netlify/functions/:path*'
      }
    ]
  }
};

export default nextConfig; 