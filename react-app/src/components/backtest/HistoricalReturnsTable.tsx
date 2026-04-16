'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';

interface YearMetrics {
  year: number;
  returnPct: number;
  returnUsdPct: number;
  maxDrawdown: number;
  volatility: number;
  sharpe: number;
  monthsUp: number;
  monthsTotal: number;
}

export function HistoricalReturnsTable() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const data = useDashboardStore(s => s.data);

  const yearMetrics = useMemo(() => {
    if (!data?.retornos_mensais) return [];

    const dates = data.retornos_mensais.dates || [];
    const returns = data.retornos_mensais.twr_pct || [];
    const returnsUsd = data.retornos_mensais.twr_usd_pct || [];

    if (dates.length === 0) return [];

    // Group by year
    const yearMap = new Map<number, { ret: number[]; retUsd: number[] }>();

    (dates as string[]).forEach((dateStr, idx) => {
      const year = parseInt(dateStr.split('-')[0]);
      if (!yearMap.has(year)) {
        yearMap.set(year, { ret: [], retUsd: [] });
      }
      const entry = yearMap.get(year)!;
      entry.ret.push(returns[idx] || 0);
      entry.retUsd.push(returnsUsd[idx] || 0);
    });

    // Calculate metrics per year
    const metrics: YearMetrics[] = [];

    yearMap.forEach((monthlyData, year) => {
      const rets = monthlyData.ret;
      const retsUsd = monthlyData.retUsd;

      // Annual return (compound)
      const annualRet = (1 + rets.reduce((a, b) => a + (1 + b / 100), 1) / (rets.length || 1)) ** (rets.length || 1) - 1;
      const annualRetUsd = (1 + retsUsd.reduce((a, b) => a + (1 + b / 100), 1) / (retsUsd.length || 1)) ** (retsUsd.length || 1) - 1;

      // Volatility (std dev of monthly returns)
      const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
      const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length;
      const vol = Math.sqrt(variance);

      // Max drawdown
      let cumulative = 0;
      let peak = 0;
      let maxDD = 0;
      rets.forEach(ret => {
        cumulative += ret;
        peak = Math.max(peak, cumulative);
        const dd = (cumulative - peak) / peak;
        maxDD = Math.min(maxDD, dd);
      });

      // Sharpe ratio (assuming 4% annual risk-free rate)
      const riskFreeMonthly = 0.04 / 12;
      const excessReturn = mean - riskFreeMonthly;
      const sharpe = vol > 0 ? (excessReturn / vol) * Math.sqrt(12) : 0;

      // Months up
      const monthsUp = rets.filter(r => r > 0).length;

      metrics.push({
        year,
        returnPct: annualRet * 100,
        returnUsdPct: annualRetUsd * 100,
        maxDrawdown: maxDD * 100,
        volatility: vol,
        sharpe,
        monthsUp,
        monthsTotal: rets.length,
      });
    });

    return metrics.sort((a, b) => a.year - b.year);
  }, [data?.retornos_mensais]);

  const formatPercent = (value: number) => {
    if (privacyMode) return '••••';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatValue = (value: number, decimals = 2) => {
    if (privacyMode) return '••••';
    return value.toFixed(decimals);
  };

  const getReturnColor = (value: number) => {
    if (value >= 15) return 'var(--green)';
    if (value >= 8) return 'var(--accent)';
    if (value >= 0) return 'var(--text)';
    if (value >= -10) return 'var(--orange)';
    return 'var(--red)';
  };

  if (yearMetrics.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Historical Returns</h3>
        <div style={styles.empty}>
          <p>No historical return data available</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📊 Historical Annual Returns</h3>
      <p style={styles.subtitle}>
        Year-by-year performance metrics including volatility, drawdown, and Sharpe ratio
      </p>

      <table style={styles.table}>
        <thead style={styles.thead}>
          <tr style={styles.headerRow}>
            <th style={styles.th}>Year</th>
            <th style={styles.th}>BRL Return</th>
            <th style={styles.thRight}>USD Return</th>
            <th style={styles.thRight}>Max Drawdown</th>
            <th style={styles.thRight}>Volatility</th>
            <th style={styles.thRight}>Sharpe</th>
            <th style={styles.thCenter}>Up Months</th>
          </tr>
        </thead>
        <tbody style={styles.tbody}>
          {yearMetrics.map((metric) => (
            <tr key={metric.year} style={styles.row}>
              <td style={{ ...styles.td, ...styles.tdYear }}>{metric.year}</td>
              <td
                style={{
                  ...styles.td,
                  color: getReturnColor(metric.returnPct),
                  fontWeight: '600',
                }}
              >
                {formatPercent(metric.returnPct)}
              </td>
              <td
                style={{
                  ...styles.td,
                  ...styles.tdRight,
                  color: getReturnColor(metric.returnUsdPct),
                }}
              >
                {formatPercent(metric.returnUsdPct)}
              </td>
              <td
                style={{
                  ...styles.td,
                  ...styles.tdRight,
                  color: metric.maxDrawdown < -15 ? 'var(--red)' : 'var(--muted)',
                }}
              >
                {formatPercent(metric.maxDrawdown)}
              </td>
              <td style={{ ...styles.td, ...styles.tdRight }}>
                {formatValue(metric.volatility * 100)}%
              </td>
              <td style={{ ...styles.td, ...styles.tdRight }}>
                {formatValue(metric.sharpe)}
              </td>
              <td style={{ ...styles.td, ...styles.tdCenter }}>
                {metric.monthsUp}/{metric.monthsTotal}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.footer}>
        <p style={styles.footnote}>
          <strong>Metrics:</strong> Annual returns calculated via compound growth of monthly TWR.
          Max Drawdown is the largest loss from peak during the year. Volatility = std dev of monthly returns.
          Sharpe ratio assumes 4% annual risk-free rate. Up Months = count of positive return months.
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: 'var(--space-6)',
    marginBottom: '14px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: 'var(--text-lg)',
    fontWeight: '600',
    color: 'var(--text)',
  },
  subtitle: {
    margin: '0 0 20px 0',
    fontSize: 'var(--text-sm)',
    color: 'var(--muted)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 'var(--text-sm)',
  },
  thead: {
    backgroundColor: 'var(--bg)',
    borderBottom: '2px solid var(--border)',
  },
  headerRow: {
    height: '40px',
  },
  th: {
    padding: '8px 12px',
    textAlign: 'left' as const,
    fontWeight: '600',
    color: 'var(--muted)',
    textTransform: 'uppercase' as const,
    fontSize: 'var(--text-xs)',
  },
  thRight: {
    textAlign: 'right' as const,
  },
  thCenter: {
    textAlign: 'center' as const,
  },
  tbody: {},
  row: {
    borderBottom: '1px solid var(--border)',
    height: '36px',
  },
  td: {
    padding: '8px 12px',
    color: 'var(--text)',
    textAlign: 'left' as const,
  },
  tdYear: {
    fontWeight: '600',
    minWidth: '50px',
  },
  tdRight: {
    textAlign: 'right' as const,
  },
  tdCenter: {
    textAlign: 'center' as const,
  },
  footer: {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid var(--border)',
  },
  footnote: {
    margin: '0',
    fontSize: 'var(--text-xs)',
    color: 'var(--muted)',
    lineHeight: '1.5',
  },
  empty: {
    minHeight: '100px',
    backgroundColor: 'var(--card)',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'var(--muted)',
  },
};
