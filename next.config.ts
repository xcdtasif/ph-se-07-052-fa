import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    // A job application's CV (2 MB at most) goes through a server action, plus the form's overhead
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
  cacheComponents: true,
  // The dev server refuses its scripts to other hostnames; omarchy is this machine on Tailscale
  allowedDevOrigins: ["omarchy"],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
