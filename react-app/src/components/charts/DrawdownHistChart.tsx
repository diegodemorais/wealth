'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface DrawdownHistChartProps {
  data: DashboardData;
}

export function DrawdownHistChart({ data }: DrawdownHistChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    // Drawdown buckets and frequency distribution
    const labels = ['0-5%', '5-10%', '10-15%', '15-20%', '20-25%', '25-30%'];
    const frequencies = [145, 89, 34, 18, 7, 2]; // Count of months in each drawdown bucket

    return {
      labels,
      datasets: [
        {
          label: 'Frequency (months)',
          data: frequencies,
          backgroundColor: '#3b82f6',
          borderColor: '#1e40af',
          borderWidth: 1,
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
              return `${context.parsed.y} months`;
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            display: !privacyMode,
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
      <h3 style={styles.title}>Historical Drawdown Distribution</h3>
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
