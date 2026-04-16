'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { DashboardData } from '@/types/dashboard';

export interface ConcentrationChartProps {
  data: DashboardData;
}

export function ConcentrationChart({ data }: ConcentrationChartProps) {
  const { privacyMode } = useEChartsPrivacy();

  const conc = useMemo(() => {
    return (data as any)?.concentracao_brasil ?? null;
  }, [data]);

  const option = useMemo(() => {
    if (!conc) return {};
    const internacionalBrl = conc.total_portfolio_brl - conc.total_brasil_brl;
    const rfBrl = conc.composicao?.rf_total_brl ?? 0;
    const hodl11Brl = conc.composicao?.hodl11_brl ?? 0;
    const cryptoLegadoBrl = conc.composicao?.crypto_legado_brl ?? 0;
    const rfOutro = rfBrl - hodl11Brl; // equity RJ = rf - hodl (workaround — we use the split provided)

    const segments = [
      { name: 'Internacional (ETFs)', value: internacionalBrl, color: '#58a6ff' },
      { name: 'RF Brasil', value: rfBrl, color: '#3ed381' },
      { name: 'HODL11 (BTC)', value: hodl11Brl, color: '#f0883e' },
      { name: 'Crypto Legado', value: cryptoLegadoBrl, color: '#a371f7' },
    ];

    const fmt = (v: number) =>
      privacyMode ? '••••' : `R$ ${(v / 1e6).toFixed(2)}M`;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#161b22',
        borderColor: '#30363d',
        textStyle: { color: '#e6edf3' },
        formatter: (p: any) =>
          privacyMode
            ? `${p.name}: ••••`
            : `${p.name}<br/>${fmt(p.value)} (${p.percent?.toFixed(1)}%)`,
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { color: '#8b949e', fontSize: 11 },
        formatter: (name: string) => name,
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          data: segments.map(s => ({
            name: s.name,
            value: s.value,
            itemStyle: { color: s.color },
          })),
          label: {
            show: true,
            formatter: (p: any) =>
              privacyMode ? '••' : `${p.percent?.toFixed(0)}%`,
            color: '#e6edf3',
            fontSize: 12,
            fontWeight: 600,
          },
          emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
        },
      ],
    };
  }, [conc, privacyMode]);

  if (!conc) return null;

  const brasilPct = conc.brasil_pct ?? 0;
  const internacionalPct = 100 - brasilPct;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Concentração Geográfica</h3>
      <div style={styles.kpiRow}>
        <div style={styles.kpi}>
          <span style={styles.kpiLabel}>Brasil</span>
          <span style={{ ...styles.kpiValue, color: 'var(--yellow)' }}>
            {privacyMode ? '••%' : `${brasilPct.toFixed(1)}%`}
          </span>
        </div>
        <div style={styles.kpi}>
          <span style={styles.kpiLabel}>Internacional</span>
          <span style={{ ...styles.kpiValue, color: 'var(--accent)' }}>
            {privacyMode ? '••%' : `${internacionalPct.toFixed(1)}%`}
          </span>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: 220 }} />
      <div style={styles.footnote}>
        Fonte: dados/ · HODL11 = wrapper B3 de BTC (risco operacional BR)
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--card2)',
    borderRadius: '8px',
    padding: 'var(--space-5)',
    marginBottom: '14px',
  },
  title: { margin: '0 0 12px 0', color: 'var(--text)' },
  kpiRow: {
    display: 'flex',
    gap: '24px',
    marginBottom: '12px',
  },
  kpi: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  kpiLabel: { fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  kpiValue: { fontSize: '22px', fontWeight: 700, fontFamily: 'monospace' },
  footnote: { fontSize: '11px', color: 'var(--muted)', marginTop: '8px' },
};
