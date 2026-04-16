'use client';

import { DashboardData } from '@/types/dashboard';

export interface ConcentrationChartProps {
  data: DashboardData;
}

export function ConcentrationChart({ data }: ConcentrationChartProps) {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Concentration Risk</h3>
      <div style={styles.placeholder}>
        <p>📊 Concentration analysis chart coming soon</p>
      </div>
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
  },
  title: {
    margin: '0 0 16px 0',
    color: 'var(--text)',
  },
  placeholder: {
    backgroundColor: 'var(--bg)',
    borderRadius: '4px',
    padding: 'var(--space-7)',
    textAlign: 'center',
    color: 'var(--muted)',
  },
};
