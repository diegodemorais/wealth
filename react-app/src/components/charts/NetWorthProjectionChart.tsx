'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface NetWorthProjectionChartProps {
  data: DashboardData;
}

export function NetWorthProjectionChart({ data }: NetWorthProjectionChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    const years = 30;
    const labels = Array.from({ length: years }, (_, i) => `Y${i + 1}`);
    
    const p10 = Array.from({ length: years }, (_, i) =>
      1250000 * Math.pow(1.05, i) + 60000 * i
    );
    const p50 = Array.from({ length: years }, (_, i) =>
      1250000 * Math.pow(1.07, i) + 60000 * i
    );
    const p90 = Array.from({ length: years }, (_, i) =>
      1250000 * Math.pow(1.09, i) + 60000 * i
    );

    return {
      labels,
      datasets: [
        {
          label: '10th percentile',
          data: p10,
          borderColor: '#ef4444',
          borderWidth: 1,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: '50th percentile (median)',
          data: p50,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: '90th percentile',
          data: p90,
          borderColor: '#3b82f6',
          borderWidth: 1,
          fill: false,
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
      tooltip: {
        enabled: !privacyMode,
        callbacks: {
          label: (context: any) =>
            `${context.dataset.label}: R$ ${(context.parsed.y / 1e6).toFixed(1)}M`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          display: !privacyMode,
          callback: (value: any) => `R$ ${(value / 1e6).toFixed(1)}M`,
        },
      },
    },
  }), [privacyMode]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Net Worth Projection (30 years, Monte Carlo)</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
