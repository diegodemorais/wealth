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
    const brasilPct = conc.brasil_pct ?? 0;
    const internacionalBrl = conc.total_portfolio_brl - conc.total_brasil_brl;
    const rfBrl = conc.composicao?.rf_total_brl ?? 0;
    const hodl11Brl = conc.composicao?.hodl11_brl ?? 0;
    const cryptoLegadoBrl = conc.composicao?.crypto_legado_brl ?? 0;

    const segments = [
      { name: 'Intl (ETFs)', value: internacionalBrl, color: '#58a6ff' },
      { name: 'RF Brasil', value: rfBrl, color: '#3ed381' },
      { name: 'HODL11 (BTC)', value: hodl11Brl, color: '#f0883e' },
      { name: 'Crypto', value: cryptoLegadoBrl, color: '#a371f7' },
    ].filter(s => s.value > 0);

    const fmt = (v: number) =>
      privacyMode ? '••••' : `R$${(v / 1e6).toFixed(2)}M`;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#161b22',
        borderColor: '#30363d',
        textStyle: { color: '#e6edf3', fontSize: 11 },
        formatter: (p: any) =>
          `<div style="padding:6px 10px">
            <strong style="color:${p.data.itemStyle?.color ?? '#fff'}">${p.name}</strong><br/>
            ${privacyMode ? '••••' : fmt(p.value)}<br/>
            <span style="font-size:13px;font-weight:700">${p.percent?.toFixed(1)}%</span>
          </div>`,
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        textStyle: { color: '#8b949e', fontSize: 10 },
        itemWidth: 10,
        itemHeight: 10,
      },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '38%',
          style: {
            text: privacyMode ? '••%' : `${(100 - brasilPct).toFixed(0)}%`,
            fontSize: 16,
            fontWeight: 700,
            fill: '#58a6ff',
            textAlign: 'center',
          },
        },
        {
          type: 'text',
          left: 'center',
          top: `calc(38% + 20px)`,
          style: {
            text: 'Intl',
            fontSize: 9,
            fill: '#8b949e',
            textAlign: 'center',
          },
        },
      ],
      series: [
        {
          type: 'pie',
          radius: ['44%', '70%'],
          center: ['50%', '42%'],
          data: segments.map(s => ({
            name: s.name,
            value: s.value,
            itemStyle: { color: s.color, borderRadius: 4, borderColor: '#0d1117', borderWidth: 2 },
          })),
          label: {
            show: true,
            position: 'inside',
            formatter: (p: any) => privacyMode ? '' : `${p.percent?.toFixed(0)}%`,
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
          },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)', borderWidth: 0 },
          },
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
          <span style={{ ...styles.kpiValue, color: '#f0883e' }}>
            {privacyMode ? '••%' : `${brasilPct.toFixed(1)}%`}
          </span>
        </div>
        <div style={styles.kpi}>
          <span style={styles.kpiLabel}>Internacional</span>
          <span style={{ ...styles.kpiValue, color: '#58a6ff' }}>
            {privacyMode ? '••%' : `${internacionalPct.toFixed(1)}%`}
          </span>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: 260 }} />
      <div style={styles.footnote}>
        HODL11 = wrapper B3 de BTC
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
    minWidth: 0,
    overflow: 'hidden',
  },
  title: { margin: '0 0 10px 0', color: 'var(--text)', fontSize: '1rem' },
  kpiRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '8px',
  },
  kpi: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
  },
  kpiLabel: {
    fontSize: '10px',
    color: 'var(--muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  kpiValue: { fontSize: '20px', fontWeight: 700, fontFamily: 'monospace' },
  footnote: { fontSize: '10px', color: 'var(--muted)', marginTop: '4px' },
};
