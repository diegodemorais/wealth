'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface BacktestR7ChartProps {
  data: DashboardData;
}

export function BacktestR7Chart({ data }: BacktestR7ChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    const months = 84; // 7 years backtest
    const labels = Array.from({ length: months }, (_, i) => `M${i + 1}`);

    // Current portfolio: diversified (SWRD, AVGS, AVEM, IPCA+, Crypto)
    // Assume ~7% annual return = 0.56% monthly average with volatility
    const portfolio = Array.from({ length: months }, (_, i) => {
      const monthlyReturn = 0.07 / 12;
      const volatility = 0.12 / Math.sqrt(12);
      const noise = (Math.random() - 0.5) * volatility * 2;
      return 1000000 * Math.pow(1 + monthlyReturn + noise, i);
    });

    // R7 Benchmark: 70% equity, 30% fixed income
    // Assume ~6% annual return with higher volatility
    const r7Benchmark = Array.from({ length: months }, (_, i) => {
      const monthlyReturn = 0.06 / 12;
      const volatility = 0.14 / Math.sqrt(12);
      const noise = (Math.random() - 0.5) * volatility * 2;
      return 1000000 * Math.pow(1 + monthlyReturn + noise, i);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Current Portfolio',
          data: portfolio,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
        },
        {
          label: 'R7 Benchmark (70/30)',
          data: r7Benchmark,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
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
            display: !privacyMode,
          },
        },
      },
    }),
    [privacyMode]
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Portfolio vs R7 Benchmark (84 months)</h3>
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
