'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface FanChartProps {
  data: DashboardData;
}

export function FanChart({ data }: FanChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    // Generate 30-year projection with uncertainty bands
    const months = 360;
    const labels = Array.from({ length: months }, (_, i) =>
      `M${Math.floor(i / 12) + 1}`
    );

    const initialCapital = 1000000;
    const p10 = Array.from({ length: months }, (_, i) =>
      initialCapital * Math.pow(1.05, i / 12)
    );
    const p50 = Array.from({ length: months }, (_, i) =>
      initialCapital * Math.pow(1.07, i / 12)
    );
    const p90 = Array.from({ length: months }, (_, i) =>
      initialCapital * Math.pow(1.09, i / 12)
    );

    return {
      labels,
      datasets: [
        {
          label: '10th percentile',
          data: p10,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: '50th percentile (median)',
          data: p50,
          borderColor: '#3b82f6',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: '90th percentile',
          data: p90,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
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
      <h3 style={styles.title}>Uncertainty Cone (Fan Chart)</h3>
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
