'use client';

import { useUiStore } from '@/store/uiStore';
import { fmtBrl, fmtPct, fmtUsd } from '@/utils/formatters';

export interface KpiHeroProps {
  networth: number;
  networthUsd: number;
  fireProgress: number; // 0-1
  yearsToFire: number;
  pfire: number; // 0-1, probability of FIRE
  cambio?: number;
  fireStatus?: 'on-track' | 'warning' | 'critical';
}

export function KpiHero({
  networth,
  networthUsd,
  fireProgress,
  yearsToFire,
  pfire,
  cambio = 5.156,
  fireStatus = 'on-track',
}: KpiHeroProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  // Format years and months for "14a 0m" format
  const yearsInt = Math.floor(yearsToFire);
  const monthsInt = Math.round((yearsToFire - yearsInt) * 12);
  const yearsMonthsStr = `${yearsInt}a ${monthsInt}m`;

  const kpis = [
    {
      label: 'Patrimônio Total',
      value: privacyMode ? '••••' : fmtBrl(networth),
      subtitle: privacyMode ? '••••' : `USD ${fmtUsd(networthUsd).replace('$', '')}`,
      primary: true,
    },
    {
      label: 'Anos até FIRE',
      value: privacyMode ? '••••' : yearsMonthsStr,
    },
    {
      label: 'Progresso FIRE',
      value: privacyMode ? '••••' : fmtPct(fireProgress, 1),
      color: '#facc15', // yellow
    },
    {
      label: 'P(FIRE)',
      value: privacyMode ? '••••' : fmtPct(pfire, 1),
    },
  ];

  return (
    <div style={styles.hero}>
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          style={{
            ...styles.kpiItem,
            ...(kpi.primary ? styles.kpiPrimary : {}),
          }}
        >
          <div style={styles.label}>{kpi.label}</div>
          <div style={{
            ...styles.heroValue,
            color: kpi.color || '#fff',
          }}>
            {kpi.value}
          </div>
          {kpi.subtitle && (
            <div style={styles.subtitle}>{kpi.subtitle}</div>
          )}
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hero: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
    marginBottom: '16px',
  },
  kpiItem: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  },
  kpiPrimary: {
    border: '2px solid #3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.07)',
  },
  label: {
    color: '#9ca3af',
    fontSize: '0.6rem',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: '4px',
    letterSpacing: '0.5px',
  },
  heroValue: {
    fontSize: '2rem',
    fontWeight: '800',
    marginTop: '4px',
    marginBottom: '4px',
    lineHeight: '1',
  },
  subtitle: {
    fontSize: '0.65rem',
    color: '#9ca3af',
    marginTop: '4px',
  },
};
