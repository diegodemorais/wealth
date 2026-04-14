'use client';

import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface DonutChartsProps {
  data: DashboardData;
}

export function DonutCharts({ data }: DonutChartsProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  // Allocation by asset class
  const classChartData = useMemo(() => {
    const equity = 1500000;
    const rf = 750000;
    const crypto = 125000;

    return {
      labels: ['Equity', 'Fixed Income', 'Crypto'],
      datasets: [
        {
          data: [equity, rf, crypto],
          backgroundColor: ['#3b82f6', '#f59e0b', '#ec4899'],
          borderColor: '#1f2937',
          borderWidth: 2,
        },
      ],
    };
  }, []);

  // Geographic allocation
  const geoChartData = useMemo(() => {
    const us = 800000;
    const dm = 600000;
    const em = 375000;

    return {
      labels: ['United States', 'Developed Markets', 'Emerging Markets'],
      datasets: [
        {
          data: [us, dm, em],
          backgroundColor: ['#10b981', '#0ea5e9', '#f59e0b'],
          borderColor: '#1f2937',
          borderWidth: 2,
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
          position: 'bottom' as const,
        },
        tooltip: {
          enabled: !privacyMode,
          callbacks: {
            label: (context: any) => {
              const value = context.parsed;
              const total = context.dataset.data.reduce(
                (a: number, b: number) => a + b,
                0
              );
              const pct = ((value / total) * 100).toFixed(1);
              return `${context.label}: R$ ${value.toLocaleString('pt-BR', {
                maximumFractionDigits: 0,
              })} (${pct}%)`;
            },
          },
        },
      },
    }),
    [privacyMode]
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Asset Allocation</h3>
      <div style={styles.gridContainer}>
        <div style={styles.chartWrapper}>
          <h4 style={styles.chartTitle}>By Asset Class</h4>
          <Doughnut data={classChartData} options={options} />
        </div>
        <div style={styles.chartWrapper}>
          <h4 style={styles.chartTitle}>By Geography</h4>
          <Doughnut data={geoChartData} options={options} />
        </div>
      </div>
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
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  chartWrapper: {
    backgroundColor: '#111827',
    borderRadius: '8px',
    padding: '12px',
  },
  chartTitle: {
    margin: '0 0 12px 0',
    color: '#9ca3af',
    fontSize: '14px',
  },
};
