import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// basePath reads env at module load time, so we test withBasePath logic directly
// by importing after env manipulation where possible, or testing the exported functions.
import { getBasePath, withBasePath } from '../basePath';

describe('basePath utilities', () => {
  describe('getBasePath', () => {
    it('returns a string', () => {
      const result = getBasePath();
      expect(typeof result).toBe('string');
    });

    it('returns empty string when NEXT_PUBLIC_BASE_PATH is not set', () => {
      // In test env, env var is not set → defaults to ''
      const result = getBasePath();
      expect(result).toBe('');
    });
  });

  describe('withBasePath', () => {
    it('prepends empty base path to path', () => {
      // BASE_PATH is '' in test env
      expect(withBasePath('/data.json')).toBe('/data.json');
    });

    it('prepends empty base path to any relative path', () => {
      expect(withBasePath('/wealth/data.json')).toBe('/wealth/data.json');
    });

    it('handles paths with no leading slash', () => {
      const result = withBasePath('data.json');
      expect(typeof result).toBe('string');
      expect(result).toContain('data.json');
    });

    it('does not double-prepend when BASE_PATH is empty', () => {
      const result = withBasePath('/data.json');
      expect(result).not.toContain('//');
    });

    it('returns a non-empty string for any valid path', () => {
      expect(withBasePath('/api/test')).toBeTruthy();
      expect(withBasePath('/data.json')).toBeTruthy();
    });
  });
});
