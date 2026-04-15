import type { NextConfig } from "next";

const basePath = '/wealth';

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === 'development' ? undefined : 'export',
  distDir: process.env.NODE_ENV === 'development' ? undefined : '../dash',
  basePath,
  images: {
    unoptimized: process.env.NODE_ENV !== 'development',
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
