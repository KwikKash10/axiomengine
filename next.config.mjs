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
  // Disable server components for static export
  experimental: {
    appDir: true
  },
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://checkout.stripe.com https://*.stripe.com https://*.stripe.network;"
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://checkout.stripe.com'
          }
        ]
      }
    ];
  }
};

export default nextConfig; 