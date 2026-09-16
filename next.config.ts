import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Prevent auto-generated AGENTS.md / CLAUDE.md in the repo.
  agentRules: false,
};

export default nextConfig;
