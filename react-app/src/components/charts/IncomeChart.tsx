'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface IncomeChartProps {
  data: DashboardData;
}

export function IncomeChart({ data }: IncomeChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    const labels = ['Salary', 'Dividends', 'Bond Coupons', 'Rental', 'Other'];
    const amounts = [120000, 35000, 18000, 24000, 3000];

    return {
      labels,
      datasets: [
        {
          label: 'Annual Income by Source',
          data: amounts,
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#8b5cf6',
            '#ec4899',
          ],
          borderWidth: 0,
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
        },
        tooltip: {
          enabled: !privacyMode,
          callbacks: {
            label: (context: any) => {
              const value = context.parsed.x;
              return `R$ ${value.toLocaleString('pt-BR', {
                maximumFractionDigits: 0,
              })}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            display: !privacyMode,
            callback: (value: any) =>
              `R$ ${(value / 1e3).toFixed(0)}K`,
          },
        },
        y: {
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
      <h3 style={styles.title}>Current Income Sources</h3>
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
