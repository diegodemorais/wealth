'use client';

import { useMemo } from 'react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { DashboardData } from '@/types/dashboard';

export interface HeatmapChartProps {
  data: DashboardData;
}

const FACTORS = ['market', 'value', 'size', 'quality'];
const ETFS = ['SWRD', 'AVGS', 'AVEM'];
const FACTOR_LABELS: Record<string, string> = {
  market: 'Market',
  value: 'Value',
  size: 'Size',
  quality: 'Quality',
};

export function HeatmapChart({ data }: HeatmapChartProps) {
  const { privacyMode } = useEChartsPrivacy();

  const matrix = useMemo(() => {
    const etfs = (data as any)?.etf_composition?.etfs ?? {};
    return ETFS.map(etf => {
      const fatores = etfs[etf]?.fatores ?? {};
      return FACTORS.map(f => fatores[f] ?? 0);
    });
  }, [data]);

  const getColor = (value: number) => {
    // 0 = dark card, 1 = accent blue
    const r = Math.round(30 + value * (88 - 30));
    const g = Math.round(44 + value * (166 - 44));
    const b = Math.round(61 + value * (255 - 61));
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Factor Loadings por ETF</h3>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}></th>
              {FACTORS.map(f => (
                <th key={f} style={styles.th}>{FACTOR_LABELS[f]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ETFS.map((etf, i) => (
              <tr key={etf}>
                <td style={styles.etfCell}>{etf}</td>
                {matrix[i].map((val, j) => (
                  <td
                    key={j}
                    style={{
                      ...styles.cell,
                      backgroundColor: privacyMode ? 'var(--card2)' : getColor(val),
                    }}
                    title={`${etf} — ${FACTOR_LABELS[FACTORS[j]]}: ${val.toFixed(2)}`}
                  >
                    <span style={styles.cellValue}>
                      {privacyMode ? '••' : val.toFixed(2)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={styles.legend}>
        <span style={styles.legendLabel}>0.0 → baixa exposição</span>
        <div style={styles.legendBar}>
          {Array.from({ length: 10 }, (_, k) => (
            <div key={k} style={{ flex: 1, backgroundColor: getColor(k / 9) }} />
          ))}
        </div>
        <span style={styles.legendLabel}>1.0 → alta exposição</span>
      </div>
      <div style={styles.footnote}>Fonte: etf_composition.json — Avantis/Invesco factor disclosures</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--card2)',
    borderRadius: '8px',
    padding: 'var(--space-5)',
    marginBottom: '14px',
    minWidth: 0,
    overflow: 'hidden',
  },
  title: { margin: '0 0 16px 0', color: 'var(--text)' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    backgroundColor: 'var(--card2)',
    color: 'var(--muted)',
    padding: '8px 16px',
    textAlign: 'center' as const,
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--border)',
  },
  etfCell: {
    color: 'var(--text)',
    fontWeight: 700,
    padding: '10px 16px',
    fontSize: '13px',
    borderRight: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--card2)',
  },
  cell: {
    padding: '10px 16px',
    textAlign: 'center' as const,
    borderRight: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
    transition: 'opacity 0.2s',
    minWidth: '80px',
  },
  cellValue: {
    color: '#fff',
    fontWeight: 600,
    fontSize: '13px',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '14px',
  },
  legendLabel: { fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' as const },
  legendBar: {
    display: 'flex',
    flex: 1,
    height: '10px',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  footnote: { fontSize: '11px', color: 'var(--muted)', marginTop: '10px' },
};
