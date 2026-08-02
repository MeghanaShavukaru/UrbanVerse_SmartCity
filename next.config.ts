import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile Leaflet for Next.js
  transpilePackages: ["leaflet"],

  // Allow images from external sources
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.openstreetmap.org" },
      { protocol: "https", hostname: "**.cartocdn.com" },
    ],
  },

  // Ensure server-only packages don't get bundled client-side
  serverExternalPackages: ["@prisma/client", "prisma"],

  webpack(config) {
    // Leaflet uses browser globals — no canvas on server
    config.externals = config.externals || [];
    return config;
  },
};

export default nextConfig;
