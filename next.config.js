/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify is not recognized in Next.js 15
  output: 'export',
  images: {
    unoptimized: true
  },
  // This allows Netlify to handle routing
  trailingSlash: true
};

module.exports = nextConfig; 