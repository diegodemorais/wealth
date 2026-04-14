'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface StackedAllocChartProps {
  data: DashboardData;
}

export function StackedAllocChart({ data }: StackedAllocChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    // Historical allocation over 24 months
    const months = 24;
    const labels = Array.from({ length: months }, (_, i) => `M${i + 1}`);

    const swrd = Array.from({ length: months }, (_, i) =>
      1200000 + (i * 5000)
    );
    const avgs = Array.from({ length: months }, (_, i) =>
      600000 + (i * 2500)
    );
    const ipca = Array.from({ length: months }, (_, i) =>
      450000 + (i * 3000)
    );
    const crypto = Array.from({ length: months }, (_, i) => 120000 + i * 500);

    return {
      labels,
      datasets: [
        {
          label: 'SWRD',
          data: swrd,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 2,
        },
        {
          label: 'AVGS',
          data: avgs,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 2,
        },
        {
          label: 'IPCA+',
          data: ipca,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 2,
        },
        {
          label: 'Crypto',
          data: crypto,
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 2,
        },
      ],
    };
  }, []);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: !privacyMode,
        },
        tooltip: {
          enabled: !privacyMode,
          callbacks: {
            label: (context: any) => {
              const value = context.parsed.y;
              return `${context.dataset.label}: R$ ${value.toLocaleString('pt-BR', {
                maximumFractionDigits: 0,
              })}`;
            },
          },
        },
      },
      scales: {
        y: {
          stacked: false,
          ticks: {
            display: !privacyMode,
            callback: (value: any) =>
              `R$ ${(value / 1e6).toFixed(1)}M`,
          },
        },
        x: {
          ticks: {
            display: false,
          },
        },
      },
    }),
    [privacyMode]
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Historical Allocation (24 months)</h3>
      <Line data={chartData} options={options} />
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
