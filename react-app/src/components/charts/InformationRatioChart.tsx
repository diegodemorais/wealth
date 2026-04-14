'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface InformationRatioChartProps {
  data: DashboardData;
}

export function InformationRatioChart({ data }: InformationRatioChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    const months = 36;
    const labels = Array.from({ length: months }, (_, i) => `M${i + 1}`);
    const ir = Array.from({ length: months }, (_, i) => 
      0.8 + 0.3 * Math.sin(i * 0.15) + (Math.random() - 0.5) * 0.2
    );

    return {
      labels,
      datasets: [{
        label: 'Information Ratio',
        data: ir,
        borderColor: '#0ea5e9',
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
      <h3 style={styles.title}>Information Ratio (36 months)</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
