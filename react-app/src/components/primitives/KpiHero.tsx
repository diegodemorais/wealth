'use client';

import { useUiStore } from '@/store/uiStore';
import { fmtBrl, fmtPct } from '@/utils/formatters';

export interface KpiHeroProps {
  networth: number;
  fireProgress: number;
  yearsToFire: number;
  fireStatus?: 'on-track' | 'warning' | 'critical';
}

export function KpiHero({
  networth,
  fireProgress,
  yearsToFire,
  fireStatus = 'on-track',
}: KpiHeroProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const kpis = [
    {
      label: 'Net Worth',
      value: privacyMode ? '••••' : fmtBrl(networth),
      icon: '💰',
      color: '#3b82f6',
    },
    {
      label: 'FIRE Progress',
      value: privacyMode ? '••••' : fmtPct(fireProgress),
      icon: '🔥',
      color: '#f59e0b',
    },
    {
      label: 'Years to FIRE',
      value: privacyMode ? '••••' : Math.round(yearsToFire),
      icon: '⏱️',
      color: '#10b981',
      unit: 'y',
    },
  ];

  return (
    <div style={styles.hero}>
      {kpis.map((kpi, idx) => (
        <div key={idx} style={styles.kpiItem}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>{kpi.icon}</div>
          <div style={styles.label}>{kpi.label}</div>
          <div style={styles.heroValue}>
            {kpi.value}
            {kpi.unit && <span style={styles.unit}>{kpi.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hero: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  kpiItem: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
  },
  label: {
    color: '#9ca3af',
    fontSize: '13px',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: '12px',
  },
  heroValue: {
    color: '#fff',
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '1',
  },
  unit: {
    fontSize: '16px',
    color: '#9ca3af',
    marginLeft: '4px',
  },
};
