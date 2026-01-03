import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    webpackBuildWorker: true,
  },
};

export default nextConfig;
