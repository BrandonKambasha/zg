import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.0.123',
        port: '8000', // Include the port if necessary
        pathname: '/storage/**', // Adjust to match your image paths
      },
    ],
  },};

export default nextConfig;
