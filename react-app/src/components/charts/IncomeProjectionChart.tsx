'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface IncomeProjectionChartProps {
  data: DashboardData;
}

export function IncomeProjectionChart({ data }: IncomeProjectionChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    const years = 30;
    const labels = Array.from({ length: years }, (_, i) => `Y${i + 1}`);

    // Salary phase-out, dividend/bond growth
    const salaryIncome = Array.from({ length: years }, (_, i) => {
      if (i < 15) return 120000 * Math.pow(1.025, i); // Growth phase
      return 120000 * Math.pow(1.025, 15) * Math.pow(0.95, i - 15); // Retirement: 95% decline per year
    });

    const portfolioIncome = Array.from({ length: years }, (_, i) => {
      return (35000 + 18000 + 24000) * Math.pow(1.04, i); // 4% annual growth
    });

    const totalIncome = salaryIncome.map((s, i) => s + portfolioIncome[i]);

    // Upper bound (optimistic: +20%)
    const upperBound = totalIncome.map(x => x * 1.2);
    // Lower bound (conservative: -20%)
    const lowerBound = totalIncome.map(x => x * 0.8);

    return {
      labels,
      datasets: [
        {
          label: 'Upper Projection (+20%)',
          data: upperBound,
          borderColor: '#10b981',
          borderWidth: 1,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: 'Total Income Projection',
          data: totalIncome,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: 'Lower Projection (-20%)',
          data: lowerBound,
          borderColor: '#ef4444',
          borderWidth: 1,
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
      <h3 style={styles.title}>Income Projection (30 Years)</h3>
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
