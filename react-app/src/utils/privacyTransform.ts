/**
 * privacyTransform.ts — Mascaramento de valores monetários em modo privacy
 *
 * Decisão (DEV-privacy-deep-fix, 2026-05-01):
 * Abandonamos transformação matemática (FACTOR=0.07) — era reversível por
 * inspeção do source-map. Agora mascaramos com `R$ ••••` / `$ ••••` puro.
 *
 * Princípio: elemento visível, valor mascarado.
 * - R$/USD absolutos → `R$ ••••` ou `$ ••••`
 * - Percentuais (P(FIRE), drift, SWR, yields) → mostrados como estão
 * - Charts: forma preservada (números reais), eixos/labels/tooltips mascarados
 * - Tabelas: valores mascarados
 */

const MASK_BRL = 'R$ ••••';
const MASK_USD = '$ ••••';

/**
 * Identity transform — kept for API compatibility.
 * In privacy mode, charts keep real shape; only labels/tooltips mask.
 */
export function pvMoney(value: number): number {
  return value;
}

/**
 * Format a monetary value for display, returning a mask in privacy mode.
 */
export function fmtPrivacy(value: number, privacyMode: boolean, opts?: {
  prefix?: string;
  suffix?: string;
  decimals?: number;
  compact?: boolean;
}): string {
  const { prefix = 'R$', suffix = '', decimals = 0, compact = true } = opts ?? {};

  if (privacyMode) {
    // Use prefix-aware mask (R$/USD/etc.)
    const baseMask = prefix.trim().startsWith('$')
      ? `${prefix} ••••`
      : `${prefix} ••••`;
    return suffix ? `${baseMask}${suffix}` : baseMask;
  }

  const v = value;
  const isNegative = v < 0;
  const absV = Math.abs(v);

  let formatted: string;
  if (compact) {
    if (absV >= 1_000_000) formatted = `${prefix}${(absV / 1_000_000).toFixed(2)}M${suffix}`;
    else if (absV >= 1_000) formatted = `${prefix}${(absV / 1_000).toFixed(decimals)}k${suffix}`;
    else formatted = `${prefix}${absV.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  } else {
    formatted = `${prefix}${absV.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  }

  return isNegative ? `−${formatted}` : formatted;
}

/**
 * Format USD value with privacy.
 */
export function fmtPrivacyUsd(value: number, privacyMode: boolean): string {
  return fmtPrivacy(value, privacyMode, { prefix: '$', compact: true });
}

/**
 * Chart data passthrough — preserves shape in privacy mode.
 * Labels/tooltips are masked separately via pvLabel/pvAxisLabel.
 */
export function pvArray(values: number[], _privacyMode: boolean): number[] {
  return values;
}

/**
 * For chart axis labels — returns mask in privacy mode, formatted value otherwise.
 */
export function pvAxisLabel(value: number, privacyMode: boolean): string {
  if (privacyMode) return MASK_BRL;
  if (Math.abs(value) >= 1_000_000) return `R$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `R$${(value / 1_000).toFixed(0)}k`;
  return `R$${value.toFixed(0)}`;
}

/**
 * Generic privacy-aware text helper — for hardcoded copy strings.
 * Returns •••• in privacy mode, original text otherwise.
 *
 * Use for copy strings like "Guardrails cortam de R$250k para R$180k" where
 * the value is hardcoded (not from data). Wrap each literal: pvText("R$250k", priv).
 */
export function pvText(text: string, privacyMode: boolean): string {
  return privacyMode ? '••••' : text;
}

/**
 * Mask all monetary values in a string (regex) — for changelog and rich-text copy.
 * Catches R$X, R$X.X, R$Xk, R$XM, R$X/mês, etc.
 */
export function maskMoneyValues(s: string, privacyMode: boolean): string {
  if (!privacyMode) return s;
  return s
    // R$ values: R$1, R$1.5, R$1,5k, R$10k/mês, R$1.5M, etc.
    .replaceAll(/R\$\s*[\d.,]+\s*[kKMm]?(\/\w+)?/g, 'R$ ••••')
    // USD values: $1, $1.5, $1k, $1.5M
    .replaceAll(/\$\s*[\d.,]+\s*[kKMm]?(\/\w+)?/g, '$ ••••');
}

/**
 * Percentage values — NOT transformed (not sensitive).
 */
export function fmtPct(value: number, _privacyMode: boolean): string {
  return `${value.toFixed(1)}%`;
}
