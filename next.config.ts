import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zg-backend-production-84b0.up.railway.app",
        pathname: "/storage/**", // Adjust to match your image paths
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // This will completely skip ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This will ignore TypeScript errors during builds
    ignoreBuildErrors: true,
  },
}

export default nextConfig

