import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: '../dash',
  basePath: '/wealth',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
