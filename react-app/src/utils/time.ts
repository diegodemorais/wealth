export interface YearsMonths {
  years: number;
  months: number;
  short: string;  // "14a 3m"
  long: string;   // "14 anos 3 meses"
}

export function decimalYearsToYearsMonths(decimal: number): YearsMonths {
  const years = Math.floor(decimal);
  const months = Math.round((decimal - years) * 12);
  return {
    years,
    months,
    short: `${years}a ${months}m`,
    long: `${years} ${years === 1 ? 'ano' : 'anos'} ${months} ${months === 1 ? 'mês' : 'meses'}`,
  };
}

// ── Shared timezone formatters ────────────────────────────────────────────────
// Source of truth for any timestamp displayed to Diego (always BRT).
// Copies the proven pattern from Footer/Header — never reimplement inline.
//
// Important: pt-BR de.toLocaleString output varies between Node and Chrome
// (Node injects a comma between date and time). We normalize the output
// to a single space so the format is stable across environments / tests.

const BRT_DATETIME_OPTS = {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
} as const;

function normalize(s: string): string {
  // pt-BR can render as "01/05/26, 19:35" or "01/05/26 19:35" — collapse to single space
  return s.replace(',', '').replace(/\s+/g, ' ').trim();
}

/**
 * Format ISO timestamp as "DD/MM/AA HH:mm BRT".
 * Same format as Footer/Header — use this for any user-visible timestamp.
 */
export function formatBrt(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return normalize(d.toLocaleString('pt-BR', BRT_DATETIME_OPTS)) + ' BRT';
  } catch {
    return iso;
  }
}

const BRT_COMPACT_OPTS = {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
} as const;

/**
 * Compact "DD/MM HH:mm BRT" — no year. For dense tables (changelog).
 * Same TZ semantics as formatBrt; only difference is the omitted year.
 */
export function formatBrtCompact(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return normalize(d.toLocaleString('pt-BR', BRT_COMPACT_OPTS)) + ' BRT';
  } catch {
    return iso;
  }
}
