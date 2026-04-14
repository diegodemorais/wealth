import { describe, it, expect } from 'vitest';
import { fmtBrl, fmtUsd, fmtPct, fmtNum, fmtDate, fmtDelta, getStatusColor } from '../formatters';

describe('formatters', () => {
  describe('fmtBrl', () => {
    it('formats positive number as BRL', () => {
      const result = fmtBrl(1000);
      expect(result).toContain('1');
      expect(result).toContain('000');
    });

    it('handles zero', () => {
      expect(fmtBrl(0)).toContain('0');
    });

    it('handles null/undefined', () => {
      expect(fmtBrl(null as any)).toBe('—');
      expect(fmtBrl(undefined as any)).toBe('—');
    });
  });

  describe('fmtUsd', () => {
    it('formats positive number as USD', () => {
      const result = fmtUsd(1000);
      expect(result).toContain('1');
      expect(result).toContain('000');
    });
  });

  describe('fmtPct', () => {
    it('formats decimal as percentage', () => {
      const result = fmtPct(0.05);
      expect(result).toContain('5');
      expect(result).toContain('%');
    });

    it('handles custom decimal places', () => {
      const result = fmtPct(0.12345, 3);
      expect(result).toMatch(/12/);
    });
  });

  describe('fmtNum', () => {
    it('formats number with thousands separator', () => {
      const result = fmtNum(1234.56);
      expect(result).toContain('1');
      expect(result).toContain('234');
    });
  });

  describe('fmtDate', () => {
    it('formats Date object', () => {
      const date = new Date('2026-04-14');
      const result = fmtDate(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/2026/);
    });

    it('formats ISO date string', () => {
      const result = fmtDate('2026-04-14');
      expect(result).toMatch(/\d{2}\/\d{2}\/2026/);
    });

    it('handles null', () => {
      expect(fmtDate(null as any)).toBe('—');
    });
  });

  describe('fmtDelta', () => {
    it('formats positive delta with +', () => {
      const result = fmtDelta(0.05);
      expect(result).toContain('+');
      expect(result).toContain('%');
    });

    it('formats negative delta with -', () => {
      const result = fmtDelta(-0.05);
      expect(result).toContain('-');
    });
  });

  describe('getStatusColor', () => {
    it('returns green for high values', () => {
      expect(getStatusColor(0.9)).toBe('text-green-600');
    });

    it('returns yellow for medium values', () => {
      expect(getStatusColor(0.6)).toBe('text-yellow-600');
    });

    it('returns red for low values', () => {
      expect(getStatusColor(0.3)).toBe('text-red-600');
    });
  });
});
