'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface DeltaBarChartProps {
  data: DashboardData;
}

export function DeltaBarChart({ data }: DeltaBarChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => ({
    labels: Array.from({ length: 12 }, (_, i) => `M${i + 1}`),
    datasets: [
      {
        label: 'Portfolio vs Benchmark',
        data: [0.8, -0.2, 1.2, 0.5, -0.1, 0.9, 1.1, 0.3, -0.4, 0.6, 0.8, 0.7],
        backgroundColor: (context: any) => context.parsed.y >= 0 ? '#10b981' : '#ef4444',
        borderRadius: 4,
      },
    ],
  }), []);

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { display: !privacyMode },
      tooltip: { enabled: !privacyMode, callbacks: { label: (context: any) => `${context.parsed.y.toFixed(2)}%` } },
    },
    scales: {
      y: { ticks: { display: !privacyMode, callback: (value: any) => `${value}%` } },
    },
  }), [privacyMode]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Monthly Delta vs Benchmark</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
