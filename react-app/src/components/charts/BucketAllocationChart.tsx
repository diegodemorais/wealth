'use client';

import { DashboardData } from '@/types/dashboard';

export interface BucketAllocationChartProps {
  data: DashboardData;
}

export function BucketAllocationChart({ data }: BucketAllocationChartProps) {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Bucket Allocation</h3>
      <div style={styles.placeholder}>
        <p>📊 Bucket allocation chart coming soon</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--card2)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '14px',
  },
  title: {
    margin: '0 0 16px 0',
    color: '#fff',
  },
  placeholder: {
    backgroundColor: 'var(--bg)',
    borderRadius: '4px',
    padding: '24px',
    textAlign: 'center',
    color: 'var(--muted)',
  },
};
