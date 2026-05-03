/**
 * holdingsSemaphore.ts — Semáforos de cor para colunas da HoldingsTable.
 *
 * Spec cravado pelo CIO em HD-portfolio-buckets-view (Caminho A), alinhado com
 * Boldin tier-method de 2026-05-02.
 *
 * Arredondamento canônico: usar mesma precisão do display ANTES de comparar
 * com threshold (lição do bug 84.8% pfire — comparação no valor cru produzia
 * inconsistência com display arredondado).
 */

export type SemaphoreColor = 'green' | 'yellow' | 'red';

export const SEMAPHORE_CSS_VAR: Record<SemaphoreColor, string> = {
  green:  'var(--green)',
  yellow: 'var(--yellow)',
  red:    'var(--red)',
};

/** Drift de bucket em pontos percentuais ABSOLUTOS (já arredondado p/ 1 casa). */
export function classifyDriftBucket(driftPp: number | null | undefined): SemaphoreColor {
  if (driftPp == null || Number.isNaN(driftPp)) return 'green';
  // Arredondar pra 1 casa (display) antes de comparar
  const abs = Math.abs(Math.round(driftPp * 10) / 10);
  if (abs < 2) return 'green';
  if (abs < 5) return 'yellow';
  return 'red';
}

/** TWR YTD em % (ja arredondado p/ 1 casa). */
export function classifyTwrYtd(twrPct: number | null | undefined): SemaphoreColor {
  if (twrPct == null || Number.isNaN(twrPct)) return 'green';
  const v = Math.round(twrPct * 10) / 10;
  if (v >= 0)  return 'green';
  if (v >= -5) return 'yellow';
  return 'red';
}

/** Max drawdown ITD em % (negativo; thresholds em valor absoluto). */
export function classifyMaxDdItd(ddPct: number | null | undefined): SemaphoreColor {
  if (ddPct == null || Number.isNaN(ddPct)) return 'green';
  const abs = Math.abs(Math.round(ddPct * 10) / 10);
  if (abs < 15) return 'green';
  if (abs < 30) return 'yellow';
  return 'red';
}

/** TER all-in em % (já arredondado p/ 2 casas). */
export function classifyTerAllIn(terPct: number | null | undefined): SemaphoreColor {
  if (terPct == null || Number.isNaN(terPct)) return 'green';
  const v = Math.round(terPct * 100) / 100;
  if (v <= 0.40) return 'green';
  if (v <= 1.00) return 'yellow';
  return 'red';
}
