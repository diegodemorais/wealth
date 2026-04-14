'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface GlidePathChartProps {
  data: DashboardData;
}

export function GlidePathChart({ data }: GlidePathChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    // Glide path: equity allocation decreases with age
    // Current age: 35, retire at 50
    const ages = Array.from({ length: 46 }, (_, i) => 35 + i);

    const currentAge = 35;
    const retirementAge = 50;

    const equityAlloc = ages.map(age => {
      if (age >= retirementAge) return 30; // 30% equity in retirement
      const yearsToRetire = retirementAge - age;
      return Math.max(30, 100 - yearsToRetire * 1.5);
    });

    return {
      labels: ages,
      datasets: [
        {
          label: 'Target Equity %',
          data: equityAlloc,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
        },
        {
          label: 'Fixed Income %',
          data: equityAlloc.map(eq => 100 - eq),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          borderWidth: 3,
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
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          stacked: true,
          ticks: {
            display: !privacyMode,
            callback: (value: any) => `${value}%`,
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
      <h3 style={styles.title}>Glide Path: Target Allocation by Age</h3>
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
