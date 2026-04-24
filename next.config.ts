import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://www.snehbharat.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
