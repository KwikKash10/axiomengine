/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure API routes are properly handled
  experimental: {
    serverActions: true,
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
}

module.exports = nextConfig 