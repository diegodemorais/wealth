import type { NextConfig } from "next";

const basePath = '/wealth';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: '../dash',
  basePath,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
