import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests in development
  allowedDevOrigins: ['http://10.77.31.53:3000'],

  // Configure allowed image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'egk31mb3raihvv27.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Experimental features for Next.js 16
  experimental: {
    // Enable if using app directory features
  },
};

export default nextConfig;
