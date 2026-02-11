/** @type {import('next').NextConfig} */
const nextConfig = {
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
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase k}}',
    },
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
