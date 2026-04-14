/**
 * Period-based Series Filtering
 * Port from dashboard/js/07-init-tabs.mjs filterByPeriod()
 */

import { Period } from '@/types/dashboard';

export interface TimeSeries {
  labels: string[];
  values: number[];
}

/**
 * Filter time series by period
 * @param series - Original series with labels and values
 * @param period - Time period: 'all' | '1y' | '3m' | '1m'
 * @returns Filtered series
 */
export function filterSeriesByPeriod(series: TimeSeries, period: Period = 'all'): TimeSeries {
  if (!series || !series.labels || !series.values) {
    return { labels: [], values: [] };
  }

  if (period === 'all') {
    return series;
  }

  const now = new Date();
  const cutoffDate = calculateCutoffDate(now, period);

  const filtered = series.labels
    .map((label, idx) => ({ label, value: series.values[idx], date: parseYearMonth(label) }))
    .filter(item => item.date >= cutoffDate)
    .reduce(
      (acc, item) => {
        acc.labels.push(item.label);
        acc.values.push(item.value);
        return acc;
      },
      { labels: [] as string[], values: [] as number[] }
    );

  return filtered.labels.length > 0 ? filtered : series;
}

/**
 * Calculate cutoff date based on period
 */
function calculateCutoffDate(now: Date, period: Period): Date {
  const cutoff = new Date(now);

  switch (period) {
    case '1m':
      cutoff.setMonth(cutoff.getMonth() - 1);
      break;
    case '3m':
      cutoff.setMonth(cutoff.getMonth() - 3);
      break;
    case '1y':
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      break;
    case 'all':
      cutoff.setFullYear(1900); // Far past
      break;
  }

  return cutoff;
}

/**
 * Parse YYYY-MM label to Date
 */
function parseYearMonth(label: string): Date {
  if (!label || typeof label !== 'string') {
    return new Date(0);
  }

  const parts = label.split('-');
  if (parts.length < 2) {
    return new Date(0);
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed

  if (isNaN(year) || isNaN(month)) {
    return new Date(0);
  }

  return new Date(year, month, 1);
}

/**
 * Get period label for display
 */
export function getPeriodLabel(period: Period): string {
  const labels: Record<Period, string> = {
    all: 'Todo o período',
    '1y': 'Últimos 12 meses',
    '3m': 'Últimos 3 meses',
    '1m': 'Último mês',
  };
  return labels[period] || 'N/A';
}
