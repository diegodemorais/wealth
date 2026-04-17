/**
 * Formatting utilities for dashboard display
 * Port from dashboard/js/03-utils.mjs
 */

/**
 * Format number as Brazilian Real (BRL)
 * @example fmtBrl(1234.56) => "R$ 1.234,56"
 */
export function fmtBrl(value: number): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format number as US Dollar (USD)
 * @example fmtUsd(1234.56) => "$1,234.56"
 */
export function fmtUsd(value: number): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format number as percentage
 * @example fmtPct(0.0567) => "5,67%"
 */
export function fmtPct(value: number, decimals = 2): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format number with thousands separator
 * @example fmtNum(1234.56) => "1.234,56"
 */
export function fmtNum(value: number, decimals = 2): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format date as DD/MM/YYYY
 * @example fmtDate(new Date('2026-04-14')) => "14/04/2026"
 */
export function fmtDate(date: Date | string): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format ISO date string to DD/MM/YYYY
 * @example fmtIsoDate('2026-04-14') => "14/04/2026"
 */
export function fmtIsoDate(isoDate: string): string {
  if (!isoDate) return '—';
  return fmtDate(new Date(isoDate));
}

/**
 * Format delta with color indicator
 * @example fmtDelta(0.05) => "+5,00%" (positive = green)
 */
export function fmtDelta(value: number, decimals = 2): string {
  if (value === null || value === undefined) return '—';
  const sign = value >= 0 ? '+' : '';
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  return `${sign}${formatted}`;
}

/**
 * Get color class based on value
 * @example getStatusColor(0.95) => 'text-green-600' (high is good)
 */
export function getStatusColor(value: number, inverted = false): 'text-green-600' | 'text-yellow-600' | 'text-red-600' {
  if (value === null || value === undefined) return 'text-red-600';

  let normalizedValue = value;
  if (inverted) normalizedValue = 1 - value;

  if (normalizedValue >= 0.8) return 'text-green-600';
  if (normalizedValue >= 0.5) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get status label
 */
export function getStatusLabel(value: number): 'Crítico' | 'Aviso' | 'OK' | 'Excelente' {
  if (value >= 0.9) return 'Excelente';
  if (value >= 0.7) return 'OK';
  if (value >= 0.5) return 'Aviso';
  return 'Crítico';
}

/**
 * Format number as BRL with M/k suffix (compact Brazilian style)
 * @example fmtBrlM(1500000) => "R$1.50M"
 * @example fmtBrlM(25000) => "R$25k"
 */
export function fmtBrlM(value: number): string {
  if (value === null || value === undefined) return '—';
  if (Math.abs(value) >= 1e6) return `R$ ${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `R$ ${(value / 1e3).toFixed(0)}k`;
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

/**
 * Abbreviate large numbers
 * @example fmtShort(1234567) => "1,2M"
 */
export function fmtShort(value: number): string {
  if (value === null || value === undefined) return '—';

  const absValue = Math.abs(value);
  if (absValue >= 1e9) {
    return fmtNum(value / 1e9, 1) + 'B';
  }
  if (absValue >= 1e6) {
    return fmtNum(value / 1e6, 1) + 'M';
  }
  if (absValue >= 1e3) {
    return fmtNum(value / 1e3, 1) + 'K';
  }
  return fmtNum(value, 0);
}
