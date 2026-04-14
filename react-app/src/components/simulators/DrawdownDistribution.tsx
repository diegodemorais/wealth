'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';

export function DrawdownDistribution() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const mcResults = useDashboardStore(s => s.mcResults);

  const chartData = useMemo(() => {
    if (!mcResults || !mcResults.drawdownDistribution) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const distribution = mcResults.drawdownDistribution;
    const labels = Object.keys(distribution).sort();
    const data = labels.map(label => distribution[label] || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Frequency (simulations)',
          data,
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderWidth: 1,
        },
      ],
    };
  }, [mcResults]);

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
              return `${value} simulations`;
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

  if (!mcResults) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Drawdown Distribution</h3>
        <div style={styles.empty}>
          <p>Adjust parameters above to generate simulations</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Maximum Drawdown Distribution Across Scenarios</h3>
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
  empty: {
    minHeight: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    backgroundColor: '#111827',
    borderRadius: '4px',
  },
};
