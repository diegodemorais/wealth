'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface GuardrailsChartProps {
  data: DashboardData;
}

export function GuardrailsChart({ data }: GuardrailsChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    const years = 30;
    const labels = Array.from({ length: years }, (_, i) => `Y${i + 1}`);

    // Safe spending corridor: upper and lower bounds
    const upperBound = Array.from({ length: years }, (_, i) => {
      const baseSpending = 60000;
      return baseSpending * Math.pow(1.03, i) * 1.2; // 20% buffer above base
    });

    const lowerBound = Array.from({ length: years }, (_, i) => {
      const baseSpending = 60000;
      return baseSpending * Math.pow(1.03, i) * 0.8; // 20% buffer below base
    });

    const targetPath = Array.from({ length: years }, (_, i) => {
      return 60000 * Math.pow(1.03, i);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Upper Guardrail',
          data: upperBound,
          borderColor: '#10b981',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: 'Safe Spending Path',
          data: targetPath,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: 'Lower Guardrail',
          data: lowerBound,
          borderColor: '#ef4444',
          borderWidth: 2,
          borderDash: [5, 5],
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
              `R$ ${(value / 1e3).toFixed(0)}K`,
          },
        },
        x: {
          ticks: {
            display: !privacyMode,
          },
        },
      },
    }),
    [privacyMode]
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Safe Spending Guardrails</h3>
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
