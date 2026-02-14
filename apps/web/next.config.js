/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "@salesos/ui",
    "@salesos/core",
    "@salesos/auth",
    "@salesos/database",
    "@salesos/enterprise",
    "@salesos/growth",
    "@salesos/social",
  ],
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
