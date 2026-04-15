/**
 * Utility to get the basePath from environment or construct absolute URLs
 * basePath is configured in next.config.ts and injected via NEXT_PUBLIC_BASE_PATH
 */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function getBasePath(): string {
  return BASE_PATH;
}

export function withBasePath(path: string): string {
  // If path already starts with basePath, return as-is
  if (BASE_PATH && path.startsWith(BASE_PATH)) {
    return path;
  }
  // Prepend basePath to relative paths
  return `${BASE_PATH}${path}`;
}
