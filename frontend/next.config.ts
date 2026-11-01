import type { NextConfig } from "next";

const apiUrl = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      // Uploaded images live on the API; serving them from this origin keeps content URLs
      // ("/media/<key>") independent of where the API runs, and the API needn't be public.
      { source: "/media/:key", destination: `${apiUrl}/api/media/:key` },
    ];
  },
};

export default nextConfig;
