import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  devIndicators: {
    buildActivity: false,
  } as any,
};

export default nextConfig;