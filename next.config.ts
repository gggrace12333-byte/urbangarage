import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.urban-garage.vercel.app' },
      { protocol: 'https', hostname: '**.urbantrackgarage.com' },
      { protocol: 'https', hostname: '**.resend.com' },
    ],
  },
};

export default nextConfig;
