/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
      serverActions: true, // Only if you're using Server Actions in the App Router
    },
  };
  
  export default nextConfig;