import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: '../dash',
  basePath: '/wealth/dash',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
