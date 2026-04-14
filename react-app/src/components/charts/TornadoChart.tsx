'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface TornadoChartProps {
  data: DashboardData;
}

export function TornadoChart({ data }: TornadoChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    // Sample sensitivity analysis data
    const factors = [
      { label: 'Return ±2%', down: -85000, up: 95000 },
      { label: 'Inflation ±1%', down: -42000, up: 38000 },
      { label: 'Expenses ±10%', down: -120000, up: 85000 },
      { label: 'Contribution ±20%', down: -75000, up: 92000 },
      { label: 'Market Vol ±5%', down: -55000, up: 48000 },
    ];

    return {
      labels: factors.map(f => f.label),
      datasets: [
        {
          label: 'Downside',
          data: factors.map(f => f.down),
          backgroundColor: '#ef4444',
          borderRadius: 4,
        },
        {
          label: 'Upside',
          data: factors.map(f => f.up),
          backgroundColor: '#10b981',
          borderRadius: 4,
        },
      ],
    };
  }, []);

  const options = useMemo(
    () => ({
      indexAxis: 'y' as const,
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: !privacyMode,
          position: 'top' as const,
        },
        tooltip: {
          enabled: !privacyMode,
          callbacks: {
            label: (context: any) => {
              const value = context.parsed.x;
              return `${context.dataset.label}: R$ ${value.toLocaleString('pt-BR')}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: false,
          ticks: {
            display: !privacyMode,
            callback: (value: any) => `R$ ${(value / 1000).toFixed(0)}K`,
          },
        },
        y: {
          ticks: {
            display: true,
          },
        },
      },
    }),
    [privacyMode]
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Sensitivity Analysis (Tornado)</h3>
      <Bar data={chartData} options={options} />
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
};
