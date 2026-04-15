'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';

export function SuccessRateCard() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const mcResults = useDashboardStore(s => s.mcResults);

  const successRate = useMemo(() => {
    if (!mcResults) return null;
    const rate = mcResults.successRate || 0;
    // Ensure it's a valid number
    return typeof rate === 'number' && !isNaN(rate) ? rate : 0;
  }, [mcResults]);

  const getStatusColor = (rate: number) => {
    if (rate >= 90) return '#10b981'; // Green - excellent
    if (rate >= 75) return '#3b82f6'; // Blue - good
    if (rate >= 60) return '#f59e0b'; // Orange - moderate
    return '#ef4444'; // Red - poor
  };

  const getStatusLabel = (rate: number) => {
    if (rate >= 90) return 'Excellent';
    if (rate >= 75) return 'Good';
    if (rate >= 60) return 'Moderate';
    return 'At Risk';
  };

  if (privacyMode) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>FIRE Success Probability</h3>
        <div style={styles.masked}>
          <p>••••</p>
        </div>
      </div>
    );
  }

  if (!mcResults || successRate === null) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>FIRE Success Probability</h3>
        <div style={styles.empty}>
          <p>Run simulation to see success rate</p>
        </div>
      </div>
    );
  }

  const color = getStatusColor(successRate);
  const label = getStatusLabel(successRate);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>FIRE Success Probability</h3>
      <div style={{ ...styles.content, backgroundColor: color + '15', borderColor: color }}>
        <div style={styles.main}>
          <div style={{ ...styles.rate, color }}>
            {successRate.toFixed(1)}%
          </div>
          <div style={styles.label}>{label} Outcome</div>
        </div>
        <div style={styles.bar}>
          <div
            style={{
              ...styles.barFill,
              width: `${successRate}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <p style={styles.description}>
          {successRate >= 90
            ? 'Your scenario has an excellent probability of success across 1,000 simulations.'
            : successRate >= 75
            ? 'Your scenario has a good probability of reaching FIRE target.'
            : successRate >= 60
            ? 'Your scenario has a moderate success rate. Consider adjusting parameters.'
            : 'Your scenario carries significant risk. Increase savings or adjust expectations.'}
        </p>
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
  content: {
    border: '2px solid',
    borderRadius: '6px',
    padding: '20px',
  },
  main: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    marginBottom: '16px',
  },
  rate: {
    fontSize: '48px',
    fontWeight: '700',
    lineHeight: '1',
  },
  label: {
    fontSize: '16px',
    color: '#d1d5db',
    fontWeight: '600',
  },
  bar: {
    width: '100%',
    height: '24px',
    backgroundColor: '#111827',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  barFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  description: {
    margin: '0',
    fontSize: '13px',
    color: '#9ca3af',
    lineHeight: '1.5',
  },
  masked: {
    minHeight: '200px',
    backgroundColor: '#111827',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#9ca3af',
  },
  empty: {
    minHeight: '200px',
    backgroundColor: '#111827',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#9ca3af',
  },
};
