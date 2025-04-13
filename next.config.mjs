/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize images
  images: {
    unoptimized: true,
  },
  // Add environment variable for cookies
  env: {
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
  }
};

export default nextConfig; 