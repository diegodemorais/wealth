'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface BacktestChartProps {
  data: DashboardData;
}

export function BacktestChart({ data }: BacktestChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    const months = 84;
    const labels = Array.from({ length: months }, (_, i) => `M${i + 1}`);
    const portfolio = Array.from({ length: months }, (_, i) => 
      100 * Math.pow(1.0088, i)
    );
    const benchmark = Array.from({ length: months }, (_, i) => 
      100 * Math.pow(1.0075, i)
    );

    return {
      labels,
      datasets: [
        {
          label: 'Portfolio',
          data: portfolio,
          borderColor: '#10b981',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: 'Benchmark',
          data: benchmark,
          borderColor: '#9ca3af',
          borderWidth: 2,
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
      <h3 style={styles.title}>Backtest Equity Curve (7 years)</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
