import "./env.mjs";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['tiktoken'],
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "@salesos/ui",
    "@salesos/core",
    "@salesos/auth",
    "@birthhub/database",
    "@salesos/enterprise",
    "@salesos/growth",
    "@salesos/social",
  ],
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default withBundleAnalyzer(nextConfig);
