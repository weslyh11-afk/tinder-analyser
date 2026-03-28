/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@anthropic-ai/sdk", "replicate"],
  },
  images: {
    remotePatterns: [
      { hostname: "replicate.delivery" },
      { hostname: "pbxt.replicate.delivery" },
    ],
  },
};

export default nextConfig;
