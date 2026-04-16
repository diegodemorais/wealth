'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';

export function SimulationTrajectories() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const mcResults = useDashboardStore(s => s.mcResults);

  const chartData = useMemo(() => {
    if (!mcResults || !mcResults.percentiles) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const years = 30;
    const labels = Array.from({ length: years }, (_, i) => `Y${i + 1}`);

    const p10 = mcResults.percentiles.p10 || [];
    const p50 = mcResults.percentiles.p50 || [];
    const p90 = mcResults.percentiles.p90 || [];

    return {
      labels,
      datasets: [
        {
          label: 'P10 (Conservative)',
          data: p10.slice(0, years),
          borderColor: 'var(--red)',
          borderWidth: 1,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: 'P50 (Median)',
          data: p50.slice(0, years),
          borderColor: 'var(--accent)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: 'P90 (Optimistic)',
          data: p90.slice(0, years),
          borderColor: 'var(--green)',
          borderWidth: 1,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 0,
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

  if (!mcResults) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Monte Carlo Trajectories</h3>
        <div style={styles.empty}>
          <p>Adjust parameters above to generate simulations</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Monte Carlo Trajectories (30 Years)</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: 'var(--space-5)',
    marginBottom: '14px',
  },
  title: {
    margin: '0 0 16px 0',
    color: 'var(--text)',
  },
  empty: {
    minHeight: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--muted)',
    backgroundColor: 'var(--bg)',
    borderRadius: '4px',
  },
};
