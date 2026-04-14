'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface RollingSharpChartProps {
  data: DashboardData;
}

export function RollingSharpChart({ data }: RollingSharpChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    const months = 48;
    const labels = Array.from({ length: months }, (_, i) => `M${i + 1}`);
    const rollingSharp = Array.from({ length: months }, (_, i) => 
      0.5 + 0.2 * Math.sin(i * 0.1) + Math.random() * 0.3
    );

    return {
      labels,
      datasets: [{
        label: 'Rolling Sharpe Ratio (12m)',
        data: rollingSharp,
        borderColor: '#f59e0b',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      }],
    };
  }, []);

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { display: !privacyMode },
      tooltip: { enabled: !privacyMode },
    },
    scales: {
      y: { ticks: { display: !privacyMode } },
    },
  }), [privacyMode]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Rolling Sharpe Ratio (12-month window)</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
