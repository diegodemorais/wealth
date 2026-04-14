// Version and build information
export const APP_VERSION = '0.1.0';

// Build timestamp (ISO 8601 format) - set at build time
export const BUILD_TIMESTAMP = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP || 'unknown';

// Build number (can be set via environment variable or CI/CD pipeline)
export const BUILD_NUMBER = process.env.NEXT_PUBLIC_BUILD_NUMBER || 'local';

// Full version string
export const FULL_VERSION = `v${APP_VERSION}+${BUILD_NUMBER}`;

// Development mode
export const IS_DEV = process.env.NODE_ENV === 'development';
