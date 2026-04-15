'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';

export function NetWorthTable() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const data = useDashboardStore(s => s.data);

  const yearlyData = useMemo(() => {
    if (!data?.timeline?.labels || !data?.timeline?.values) return [];

    const byYear: Record<string, { start: number; end: number; months: string[] }> = {};

    // Group values by year
    data.timeline.labels.forEach((label: string, idx: number) => {
      const year = label.split('-')[0];
      if (!byYear[year]) {
        byYear[year] = { start: 0, end: 0, months: [] };
      }
      if (idx === 0 || label.split('-')[1] === '01') {
        byYear[year].start = data.timeline.values[idx];
      }
      byYear[year].end = data.timeline.values[idx];
      byYear[year].months.push(label);
    });

    return Object.entries(byYear)
      .map(([year, values]) => {
        const startValue = values.start || values.months[0];
        const endValue = values.end;
        const startIdx = data.timeline.labels.indexOf(values.months[0]);
        const endIdx = data.timeline.labels.length - 1;
        const actualStart = data.timeline.values[startIdx];
        const actualEnd = data.timeline.values[endIdx >= data.timeline.labels.length ? endIdx - 1 : endIdx];

        return {
          year,
          start: actualStart,
          end: actualEnd,
          gain: actualEnd - actualStart,
          return_pct: actualStart > 0 ? ((actualEnd - actualStart) / actualStart) * 100 : 0,
        };
      })
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [data?.timeline]);

  const formatCurrency = (value: number) => {
    if (privacyMode) return '••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatReturn = (value: number) => {
    if (privacyMode) return '••••';
    return `${value.toFixed(2)}%`;
  };

  const getReturnColor = (value: number) => {
    if (value > 0) return 'var(--green)';
    if (value < 0) return 'var(--red)';
    return 'var(--text)';
  };

  if (yearlyData.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Annual Net Worth Evolution</h3>
        <div style={styles.empty}>
          <p>No timeline data available</p>
        </div>
      </div>
    );
  }

  const totalGain = yearlyData.reduce((sum, y) => sum + y.gain, 0);
  const startValue = yearlyData[0]?.start || 0;
  const endValue = yearlyData[yearlyData.length - 1]?.end || 0;
  const totalReturn = startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📈 Annual Net Worth Evolution</h3>
      <p style={styles.subtitle}>
        Year-by-year portfolio growth analysis
      </p>
      <div style={styles.tableWrapper}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'center', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Year</th>
              <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Start (BRL)</th>
              <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>End (BRL)</th>
              <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Gain</th>
              <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Return %</th>
            </tr>
          </thead>
          <tbody>
            {yearlyData.map((year) => (
              <tr key={year.year} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ textAlign: 'center', padding: '8px', fontWeight: '600', color: 'var(--text)' }}>
                  {year.year}
                </td>
                <td style={{ textAlign: 'right', padding: '8px', color: 'var(--text)' }}>
                  {formatCurrency(year.start)}
                </td>
                <td style={{ textAlign: 'right', padding: '8px', fontWeight: '500', color: 'var(--text)' }}>
                  {formatCurrency(year.end)}
                </td>
                <td style={{ textAlign: 'right', padding: '8px', color: getReturnColor(year.gain), fontWeight: '500' }}>
                  {formatCurrency(year.gain)}
                </td>
                <td style={{ textAlign: 'right', padding: '8px', color: getReturnColor(year.return_pct), fontWeight: '600' }}>
                  {formatReturn(year.return_pct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.summarySection}>
        <h4 style={styles.summaryTitle}>Total Performance</h4>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Starting Value</span>
            <span style={styles.summaryValue}>{formatCurrency(startValue)}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Ending Value</span>
            <span style={styles.summaryValue}>{formatCurrency(endValue)}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Gain</span>
            <span style={{ ...styles.summaryValue, color: getReturnColor(totalGain) }}>
              {formatCurrency(totalGain)}
            </span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Return</span>
            <span style={{ ...styles.summaryValue, color: getReturnColor(totalReturn) }}>
              {formatReturn(totalReturn)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '14px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  subtitle: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: 'var(--muted)',
  },
  tableWrapper: {
    overflowX: 'auto',
    marginBottom: '14px',
  },
  empty: {
    minHeight: '100px',
    backgroundColor: 'var(--bg)',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'var(--muted)',
  },
  summarySection: {
    borderTop: '1px solid var(--border)',
    paddingTop: '16px',
    marginTop: '16px',
  },
  summaryTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--muted)',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    backgroundColor: 'var(--bg)',
    borderRadius: '4px',
    border: '1px solid var(--border)',
  },
  summaryLabel: {
    fontSize: '11px',
    color: 'var(--muted)',
    fontWeight: '500',
    marginBottom: '4px',
  },
  summaryValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--accent)',
  },
};
