import { describe, it, expect } from 'vitest';
import {
  fmtBrl, fmtUsd, fmtPct, fmtNum, fmtDate, fmtIsoDate,
  fmtDelta, fmtShort, getStatusColor, getStatusLabel,
} from '../formatters';

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

    it('handles null/undefined', () => {
      expect(fmtUsd(null as any)).toBe('—');
      expect(fmtUsd(undefined as any)).toBe('—');
    });

    it('handles zero', () => {
      expect(fmtUsd(0)).toContain('0');
    });

    it('handles negative values', () => {
      const result = fmtUsd(-500);
      expect(result).toContain('500');
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

    it('handles null/undefined', () => {
      expect(fmtPct(null as any)).toBe('—');
      expect(fmtPct(undefined as any)).toBe('—');
    });

    it('handles zero', () => {
      expect(fmtPct(0)).toContain('0');
      expect(fmtPct(0)).toContain('%');
    });

    it('formats 1.0 as 100%', () => {
      expect(fmtPct(1.0)).toContain('100');
    });
  });

  describe('fmtNum', () => {
    it('formats number with thousands separator', () => {
      const result = fmtNum(1234.56);
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('handles null/undefined', () => {
      expect(fmtNum(null as any)).toBe('—');
      expect(fmtNum(undefined as any)).toBe('—');
    });

    it('handles custom decimal places', () => {
      const result = fmtNum(1234.5678, 0);
      expect(result).not.toContain(',');
    });

    it('handles zero', () => {
      expect(fmtNum(0)).toContain('0');
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

    it('handles empty string', () => {
      expect(fmtDate('')).toBe('—');
    });
  });

  describe('fmtIsoDate', () => {
    it('formats ISO string to DD/MM/YYYY', () => {
      const result = fmtIsoDate('2026-04-14');
      expect(result).toMatch(/\d{2}\/\d{2}\/2026/);
    });

    it('handles empty string', () => {
      expect(fmtIsoDate('')).toBe('—');
    });

    it('handles null', () => {
      expect(fmtIsoDate(null as any)).toBe('—');
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

    it('formats zero without sign', () => {
      const result = fmtDelta(0);
      expect(result).toContain('+');
      expect(result).toContain('%');
    });

    it('handles null/undefined', () => {
      expect(fmtDelta(null as any)).toBe('—');
      expect(fmtDelta(undefined as any)).toBe('—');
    });

    it('handles custom decimal places', () => {
      const result = fmtDelta(0.1234, 1);
      expect(result).toContain('%');
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

    it('returns red for null/undefined', () => {
      expect(getStatusColor(null as any)).toBe('text-red-600');
      expect(getStatusColor(undefined as any)).toBe('text-red-600');
    });

    it('inverted=true flips green/red logic', () => {
      // Low raw value → high inverted → green
      expect(getStatusColor(0.1, true)).toBe('text-green-600');
      // High raw value → low inverted → red
      expect(getStatusColor(0.9, true)).toBe('text-red-600');
    });

    it('boundary: exactly 0.8 → green', () => {
      expect(getStatusColor(0.8)).toBe('text-green-600');
    });

    it('boundary: exactly 0.5 → yellow', () => {
      expect(getStatusColor(0.5)).toBe('text-yellow-600');
    });
  });

  describe('getStatusLabel', () => {
    it('returns Excelente for >= 0.9', () => {
      expect(getStatusLabel(0.9)).toBe('Excelente');
      expect(getStatusLabel(1.0)).toBe('Excelente');
    });

    it('returns OK for >= 0.7', () => {
      expect(getStatusLabel(0.7)).toBe('OK');
      expect(getStatusLabel(0.85)).toBe('OK');
    });

    it('returns Aviso for >= 0.5', () => {
      expect(getStatusLabel(0.5)).toBe('Aviso');
      expect(getStatusLabel(0.65)).toBe('Aviso');
    });

    it('returns Crítico for < 0.5', () => {
      expect(getStatusLabel(0.4)).toBe('Crítico');
      expect(getStatusLabel(0)).toBe('Crítico');
    });
  });

  describe('fmtShort', () => {
    it('handles null/undefined', () => {
      expect(fmtShort(null as any)).toBe('—');
      expect(fmtShort(undefined as any)).toBe('—');
    });

    it('formats billions with B suffix', () => {
      const result = fmtShort(2_500_000_000);
      expect(result).toContain('B');
    });

    it('formats millions with M suffix', () => {
      const result = fmtShort(3_500_000);
      expect(result).toContain('M');
      expect(result).toContain('3');
    });

    it('formats thousands with K suffix', () => {
      const result = fmtShort(25_000);
      expect(result).toContain('K');
    });

    it('formats small numbers without suffix', () => {
      const result = fmtShort(500);
      expect(result).not.toContain('K');
      expect(result).not.toContain('M');
    });

    it('handles negative values', () => {
      const result = fmtShort(-1_500_000);
      expect(result).toContain('M');
    });

    it('handles zero', () => {
      expect(fmtShort(0)).toContain('0');
    });
  });
});
