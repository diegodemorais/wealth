import { describe, it, expect } from 'vitest';
import { formatBrt, formatBrtCompact, decimalYearsToYearsMonths } from '../time';

describe('time formatters — BRT (America/Sao_Paulo)', () => {
  // BRT = UTC−3 (no DST since 2019). Tests below assume that fact.

  describe('formatBrt', () => {
    it('converts UTC (Z) to BRT and emits the BRT label', () => {
      // 22:35 UTC = 19:35 BRT
      expect(formatBrt('2026-05-01T22:35:35.806Z')).toBe('01/05/26 19:35 BRT');
    });

    it('preserves the wall clock when the ISO is already -03:00', () => {
      expect(formatBrt('2026-05-01T19:35:00-03:00')).toBe('01/05/26 19:35 BRT');
    });

    it('agrees between Z and -03:00 inputs that represent the same instant', () => {
      const a = formatBrt('2026-05-01T18:00:00Z');         // 15:00 BRT
      const b = formatBrt('2026-05-01T15:00:00-03:00');    // 15:00 BRT
      expect(a).toBe(b);
    });

    it('returns the input string for invalid ISO', () => {
      expect(formatBrt('not-a-date')).toBe('not-a-date');
    });
  });

  describe('formatBrtCompact', () => {
    it('omits the year but still shows BRT label', () => {
      expect(formatBrtCompact('2026-05-01T22:35:35.806Z')).toBe('01/05 19:35 BRT');
    });

    it('handles -03:00 entries the same as Z when wall clock matches', () => {
      // changelog mixes both formats; the formatter must yield one canonical
      // BRT display regardless of source TZ marker.
      expect(formatBrtCompact('2026-05-01T13:30:00-03:00')).toBe('01/05 13:30 BRT');
      // Same instant from UTC perspective:
      expect(formatBrtCompact('2026-05-01T16:30:00Z')).toBe('01/05 13:30 BRT');
    });

    it('handles the cross-midnight case (UTC late = BRT same day, evening)', () => {
      // 02:00 UTC on May 2 = 23:00 BRT on May 1
      expect(formatBrtCompact('2026-05-02T02:00:00Z')).toBe('01/05 23:00 BRT');
    });
  });

  describe('decimalYearsToYearsMonths', () => {
    // Sanity — pre-existing helper still works after the addition above.
    it('splits a decimal year into years + months', () => {
      const r = decimalYearsToYearsMonths(14.25);
      expect(r.years).toBe(14);
      expect(r.months).toBe(3);
      expect(r.short).toBe('14a 3m');
    });
  });
});
