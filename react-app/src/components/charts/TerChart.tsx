'use client';

import { DashboardData } from '@/types/dashboard';

export interface TerChartProps {
  data: DashboardData;
}

export function TerChart({ data }: TerChartProps) {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Total Expense Ratio (TER)</h3>
      <div style={styles.placeholder}>
        <p>📊 TER analysis chart coming soon</p>
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
    marginBottom: '20px',
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
