import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests in development
  allowedDevOrigins: ['http://10.77.31.53:3000'],

  // Experimental features for Next.js 16
  experimental: {
    // Enable if using app directory features
  },
};

export default nextConfig;
