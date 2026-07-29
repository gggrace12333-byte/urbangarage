/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.urban-garage.vercel.app' },
      { protocol: 'https', hostname: '**.urbantrackgarage.com' },
      { protocol: 'https', hostname: '**.resend.com' },
    ],
  },
};

module.exports = nextConfig;
