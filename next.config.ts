import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Vercel's deployment trace inside this repository even when a parent
  // folder happens to contain another package-lock.json.
  outputFileTracingRoot: process.cwd(),

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
  serverExternalPackages: ["@prisma/client", "prisma", "@prisma/adapter-pg", "pg"],

  webpack(config) {
    // Leaflet uses browser globals — no canvas on server
    config.externals = config.externals || [];
    return config;
  },
};

export default nextConfig;
