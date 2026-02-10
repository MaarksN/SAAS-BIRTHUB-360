/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@salesos/ui",
    "@salesos/core",
    "@salesos/config",
    "@salesos/database",
    "@salesos/auth",
    "@salesos/prospector",
    "@salesos/hub",
    "@salesos/communication",
    "@salesos/ai",
    "@salesos/ai-assistant"
  ],
  reactStrictMode: true,
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
