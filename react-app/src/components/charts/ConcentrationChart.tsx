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
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '14px',
  },
  title: {
    margin: '0 0 16px 0',
    color: '#fff',
  },
  placeholder: {
    backgroundColor: '#111827',
    borderRadius: '4px',
    padding: '24px',
    textAlign: 'center',
    color: '#9ca3af',
  },
};
