const basePath = '/wealth';

module.exports = {
  output: process.env.NODE_ENV === 'development' ? undefined : 'export',
  distDir: process.env.NODE_ENV === 'development' ? undefined : '.dash',
  basePath,
  images: {
    unoptimized: process.env.NODE_ENV !== 'development',
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  turbopack: {
    root: __dirname,
  },
};
