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
      subtitle: privacyMode ? '••••' : `${networthUsd ? fmtUsd(networthUsd).replace('$', 'USD ') : '—'} em USD`,
      primary: true,
    },
    {
      label: 'Anos até FIRE',
      value: privacyMode ? '••••' : yearsMonthsStr,
      subtitle: privacyMode ? '••••' : undefined,
    },
    {
      label: 'Progresso FIRE',
      value: privacyMode ? '••••' : fmtPct(fireProgress, 1),
      subtitle: privacyMode ? '••••' : undefined,
      color: 'rgba(234, 179, 8, 0.8)', // yellow
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2.5 mb-4">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="rounded-xl p-4 text-center border transition-colors"
          style={kpi.primary ? {
            borderColor: 'hsl(var(--accent))',
            borderWidth: '2px',
            background: 'rgba(59, 130, 246, 0.07)',
          } : {
            borderColor: 'hsl(var(--border))',
            borderWidth: '1px',
            background: 'hsl(var(--card))',
          }}
        >
          <div className="text-xs uppercase font-semibold text-muted-foreground mb-1 tracking-widest">
            {kpi.label}
          </div>
          <div
            className="text-2xl font-black mt-1 mb-1 leading-none"
            style={{ color: kpi.color || '#fff' }}
          >
            {kpi.value}
          </div>
          {kpi.subtitle && (
            <div className="text-xs text-muted-foreground mt-1">
              {kpi.subtitle}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
