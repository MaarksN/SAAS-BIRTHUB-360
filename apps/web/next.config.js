/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ["@salesos/ui"],
  reactStrictMode: true,
  output: "standalone",
};

module.exports = nextConfig;
