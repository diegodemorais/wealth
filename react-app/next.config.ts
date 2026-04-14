import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: '../dashboard',
  basePath: '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
