'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface ShadowChartProps {
  data: DashboardData;
}

export function ShadowChart({ data }: ShadowChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    const months = 60;
    const labels = Array.from({ length: months }, (_, i) => `M${i + 1}`);
    const actual = Array.from({ length: months }, (_, i) => 
      100 * Math.pow(1.0085, i)
    );
    const shadow = Array.from({ length: months }, (_, i) => 
      100 * Math.pow(1.0080, i)
    );

    return {
      labels,
      datasets: [
        {
          label: 'Actual Portfolio',
          data: actual,
          borderColor: '#3b82f6',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: 'Shadow Portfolio (60/40)',
          data: shadow,
          borderColor: '#ec4899',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 0,
        },
      ],
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
      <h3 style={styles.title}>Actual vs Shadow Portfolio Comparison</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
