import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: '../dash',
  basePath: '/dash',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
