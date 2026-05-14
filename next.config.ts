import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  devIndicators: {
    buildActivity: false,
  } as any,
};

export default nextConfig;
