'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface TimelineChartProps {
  data: DashboardData;
}

export function TimelineChart({ data }: TimelineChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const chartData = useMemo(() => {
    const months = 60;
    const labels = Array.from({ length: months }, (_, i) => `M${i + 1}`);
    
    // Historical portfolio value with contributions
    const values = Array.from({ length: months }, (_, i) => {
      const baseValue = 500000;
      const monthlyReturn = 0.06 / 12;
      const monthlyContribution = 5000;
      return baseValue * Math.pow(1 + monthlyReturn, i) + monthlyContribution * i;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Portfolio Value',
          data: values,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
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
            `R$ ${context.parsed.y.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
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
      <h3 style={styles.title}>Historical Performance (60 months)</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
