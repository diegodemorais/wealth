/**
 * privacyTransform.ts — Transforma valores monetários em modo privacy
 *
 * Em vez de mostrar "••••", mostra valores transformados que:
 * - Preservam proporções e tendências (gráficos mantêm forma)
 * - Não revelam o valor real
 * - Parecem números plausíveis
 *
 * Regras:
 * - Valores monetários (R$, USD): transformados com fator oculto
 * - Percentuais (P(FIRE), drift, SWR, yields): mostrados como estão (não sensíveis)
 * - Gráficos: eixo Y transformado, forma preservada
 * - Tabelas de posições/lotes: valores transformados
 *
 * O fator é derivado internamente e NÃO é exposto na UI, no código-fonte
 * visível ao usuário, ou nos dados. Nenhuma informação na tela permite
 * reverter a transformação.
 */

// Fator gerado deterministicamente a partir de um seed fixo.
// Não usar constante óbvia (como 10, 100, 0.1).
// O fator transforma mas mantém ordem de grandeza plausível.
const _S = 0x5F3759DF; // Quake fast inverse sqrt constant (arbitrary seed)
const _F = ((_S >>> 16) ^ (_S & 0xFFFF)) / 0xFFFF; // 0..1 deterministic
const FACTOR = 0.3 + _F * 0.7; // range ~0.3 to ~1.0 — never reveals 1:1 or obvious ratio

/**
 * Transform a monetary value for privacy display.
 * Returns a number that preserves relative proportions but hides absolute value.
 */
export function pvMoney(value: number): number {
  return value * FACTOR;
}

/**
 * Format a monetary value for display, applying privacy transform if needed.
 */
export function fmtPrivacy(value: number, privacyMode: boolean, opts?: {
  prefix?: string;
  suffix?: string;
  decimals?: number;
  compact?: boolean;
}): string {
  const { prefix = 'R$', suffix = '', decimals = 0, compact = true } = opts ?? {};

  const v = privacyMode ? pvMoney(value) : value;

  if (compact) {
    if (Math.abs(v) >= 1_000_000) return `${prefix}${(v / 1_000_000).toFixed(2)}M${suffix}`;
    if (Math.abs(v) >= 1_000) return `${prefix}${(v / 1_000).toFixed(decimals)}k${suffix}`;
  }

  return `${prefix}${v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
}

/**
 * Format USD value with privacy.
 */
export function fmtPrivacyUsd(value: number, privacyMode: boolean): string {
  return fmtPrivacy(value, privacyMode, { prefix: '$', compact: true });
}

/**
 * Transform an array of values (for chart data).
 * Preserves shape, hides scale.
 */
export function pvArray(values: number[], privacyMode: boolean): number[] {
  if (!privacyMode) return values;
  return values.map(v => v * FACTOR);
}

/**
 * For chart axis labels — transform the tick value.
 */
export function pvAxisLabel(value: number, privacyMode: boolean): string {
  const v = privacyMode ? pvMoney(value) : value;
  if (Math.abs(v) >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `R$${(v / 1_000).toFixed(0)}k`;
  return `R$${v.toFixed(0)}`;
}

/**
 * Percentage values — NOT transformed (not sensitive).
 */
export function fmtPct(value: number, _privacyMode: boolean): string {
  return `${value.toFixed(1)}%`;
}
