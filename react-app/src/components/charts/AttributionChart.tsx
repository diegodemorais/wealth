'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface AttributionChartProps {
  data: DashboardData;
}

export function AttributionChart({ data }: AttributionChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => ({
    labels: ['Equity Selection', 'Allocation', 'Market Return', 'Currency', 'Costs'],
    datasets: [{
      label: 'Attribution (%)',
      data: [2.5, 1.2, 4.8, -0.3, -0.6],
      backgroundColor: ['#10b981', '#10b981', '#10b981', '#ef4444', '#ef4444'],
      borderRadius: 4,
    }],
  }), []);

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { display: !privacyMode },
      tooltip: {
        enabled: !privacyMode,
        callbacks: { label: (context: any) => `${context.parsed.y.toFixed(2)}%` },
      },
    },
    scales: {
      y: { ticks: { display: !privacyMode, callback: (value: any) => `${value}%` } },
    },
  }), [privacyMode]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Return Attribution Breakdown</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
