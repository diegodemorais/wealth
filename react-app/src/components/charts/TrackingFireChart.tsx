'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface TrackingFireChartProps {
  data: DashboardData;
}

export function TrackingFireChart({ data }: TrackingFireChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    const months = 180; // 15 years to FIRE
    const labels = Array.from({ length: months }, (_, i) => `M${i + 1}`);
    
    const fireTarget = 2500000;
    const currentNetworth = 1250000;
    
    // Actual trajectory
    const actual = Array.from({ length: months }, (_, i) => {
      const monthlyReturn = 0.07 / 12;
      const monthlyContribution = 5000;
      return currentNetworth * Math.pow(1 + monthlyReturn, i) + monthlyContribution * i;
    });
    
    // Target trajectory (constant)
    const target = Array(months).fill(fireTarget);
    
    // Lower bound (75% confidence)
    const lowerBound = Array.from({ length: months }, (_, i) => {
      const monthlyReturn = 0.05 / 12;
      const monthlyContribution = 5000;
      return currentNetworth * Math.pow(1 + monthlyReturn, i) + monthlyContribution * i;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Actual (Base Case)',
          data: actual,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: 'FIRE Target',
          data: target,
          borderColor: '#f59e0b',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: 'Lower Bound (75% confidence)',
          data: lowerBound,
          borderColor: '#ef4444',
          borderWidth: 1,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    };
  }, []);

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { display: !privacyMode },
      tooltip: {
        enabled: !privacyMode,
        callbacks: {
          label: (context: any) =>
            `${context.dataset.label}: R$ ${(context.parsed.y / 1e6).toFixed(1)}M`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          display: !privacyMode,
          callback: (value: any) => `R$ ${(value / 1e6).toFixed(1)}M`,
        },
      },
    },
  }), [privacyMode]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>FIRE Target Tracking (15-year projection)</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
