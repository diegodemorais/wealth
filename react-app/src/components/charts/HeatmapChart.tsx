'use client';

import { useMemo } from 'react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { DashboardData } from '@/types/dashboard';

export interface HeatmapChartProps {
  data: DashboardData;
}

export function HeatmapChart({ data }: HeatmapChartProps) {
  const { privacyMode } = useEChartsPrivacy();

  const heatmapData = useMemo(() => {
    const assets = ['SWRD', 'AVGS', 'AVEM', 'IPCA+', 'Crypto'];
    const correlations = [
      [1.0, 0.75, 0.82, 0.15, 0.22],
      [0.75, 1.0, 0.88, 0.12, 0.25],
      [0.82, 0.88, 1.0, 0.18, 0.28],
      [0.15, 0.12, 0.18, 1.0, -0.05],
      [0.22, 0.25, 0.28, -0.05, 1.0],
    ];
    return { assets, correlations };
  }, []);

  const getColor = (value: number) => {
    if (value < 0) {
      const intensity = Math.abs(value);
      const green = Math.round(255 * (1 - intensity));
      return `rgb(255, ${green}, ${green})`;
    } else {
      const intensity = value;
      const red = Math.round(255 * (1 - intensity));
      return `rgb(${red}, 255, ${red})`;
    }
  };

  if (privacyMode) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Asset Correlations (Heatmap)</h3>
        <div style={styles.masked}>
          <p style={styles.maskedText}>Correlation matrix hidden in privacy mode</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Asset Correlations (Heatmap)</h3>
      <div style={styles.heatmapWrapper}>
        <div style={styles.headerRow}>
          <div style={styles.cornerCell} />
          {heatmapData.assets.map(asset => (
            <div key={asset} style={styles.headerCell}>{asset}</div>
          ))}
        </div>
        {heatmapData.correlations.map((row, i) => (
          <div key={i} style={styles.dataRow}>
            <div style={styles.rowLabel}>{heatmapData.assets[i]}</div>
            {row.map((value, j) => (
              <div
                key={`${i}-${j}`}
                style={{ ...styles.cell, backgroundColor: getColor(value) }}
                title={`${heatmapData.assets[i]} → ${heatmapData.assets[j]}: ${value.toFixed(2)}`}
              >
                <span style={styles.cellValue}>{value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendBox, backgroundColor: 'var(--red)' }} />
          <span>Negative Correlation</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendBox, backgroundColor: 'var(--text)', border: '1px solid #ccc' }} />
          <span>No Correlation</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendBox, backgroundColor: 'var(--green)' }} />
          <span>Positive Correlation</span>
        </div>
      </div>
    </div>
  );
}

const CELL_SIZE = 80;
const HEADER_HEIGHT = 40;

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: 'var(--card)', border: '1px solid var(--card2)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '14px' },
  title: { margin: '0 0 16px 0', color: 'var(--text)' },
  heatmapWrapper: { display: 'inline-block', marginBottom: '16px' },
  headerRow: { display: 'flex' },
  cornerCell: { width: HEADER_HEIGHT, height: HEADER_HEIGHT, backgroundColor: 'var(--bg)' },
  headerCell: { width: CELL_SIZE, height: HEADER_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--border)', fontSize: 'var(--text-xs)', fontWeight: '600', backgroundColor: 'var(--bg)', borderRight: '1px solid var(--card2)', borderBottom: '1px solid var(--card2)' },
  dataRow: { display: 'flex' },
  rowLabel: { width: HEADER_HEIGHT, height: CELL_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--border)', fontSize: 'var(--text-xs)', fontWeight: '600', backgroundColor: 'var(--bg)', borderRight: '1px solid var(--card2)', borderBottom: '1px solid var(--card2)' },
  cell: { width: CELL_SIZE, height: CELL_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--card2)', borderBottom: '1px solid var(--card2)', cursor: 'pointer', transition: 'opacity 0.2s' },
  cellValue: { color: 'var(--bg)', fontWeight: '600', fontSize: 'var(--text-sm)' },
  masked: { minHeight: '400px', backgroundColor: 'var(--bg)', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  maskedText: { textAlign: 'center', color: 'var(--muted)' },
  legend: { display: 'flex', gap: 'var(--space-6)', marginTop: '12px', padding: 'var(--space-3)', backgroundColor: 'var(--bg)', borderRadius: '4px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--muted)' },
  legendBox: { width: '16px', height: '16px', borderRadius: '2px' },
};
