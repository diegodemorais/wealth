'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { DashboardData } from '@/types/dashboard';
import { EC, EC_TOOLTIP } from '@/utils/echarts-theme';
import { fmtPrivacy } from '@/utils/privacyTransform';

// Handle hidden container resize: check offsetWidth > 0 and retry with setTimeout
const handleChartResize = (containerRef: any) => {
  if (containerRef?.current?.offsetWidth > 0) {
    setTimeout(() => containerRef.current?.getEchartsInstance?.()?.resize?.(), 100);
  }
};

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
    const totalBrl = conc.total_portfolio_brl ?? 0;
    const brasilBrl = conc.total_brasil_brl ?? 0;
    // cripto = HODL11 + Binance legado (global/cripto, não Brasil)
    const criptoBrl = conc.total_cripto_brl ?? (conc.composicao?.hodl11_brl ?? 0);
    const internacionalBrl = Math.max(0, totalBrl - brasilBrl - criptoBrl);

    const rfBrl = conc.composicao?.rf_total_brl ?? 0;
    const coeBrl = conc.composicao?.coe_net_brl ?? 0;
    // hodl11 e legado separados no pie (total_cripto_brl = soma dos dois)
    const hodl11Brl = conc.composicao?.hodl11_brl ?? 0;
    const cryptoLegadoBrl = conc.composicao?.crypto_legado_brl ?? 0;

    const segments = [
      { name: 'Intl (ETFs)', value: internacionalBrl, color: EC.accent },
      { name: 'RF Brasil (TD)', value: rfBrl, color: EC.green },
      { name: 'COE XP', value: coeBrl, color: '#60a5fa' },
      { name: 'HODL11 (BTC)', value: hodl11Brl, color: EC.orange },
      { name: 'Binance (legado)', value: cryptoLegadoBrl, color: '#a371f7' },
    ].filter(s => s.value > 0);

    const cambialPct = totalBrl > 0 ? ((internacionalBrl / totalBrl) * 100).toFixed(0) : '0';

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        ...EC_TOOLTIP,
        formatter: (p: any) =>
          `<div style="padding:6px 10px">
            <strong style="color:${p.data.itemStyle?.color ?? '#fff'}">${p.name}</strong><br/>
            ${fmtPrivacy(p.value, privacyMode)}<br/>
            <span style="font-size:13px;font-weight:700">${p.percent?.toFixed(1)}%</span>
          </div>`,
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        textStyle: { color: EC.muted, fontSize: 10 },
        itemWidth: 10,
        itemHeight: 10,
      },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '38%',
          style: {
            text: `${cambialPct}%`,
            fontSize: 16,
            fontWeight: 700,
            fill: EC.accent,
            textAlign: 'center',
          },
        },
        {
          type: 'text',
          left: 'center',
          top: `calc(38% + 20px)`,
          style: {
            text: 'Cambial',
            fontSize: 9,
            fill: EC.muted,
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
            itemStyle: { color: s.color, borderRadius: 4, borderColor: EC.bg, borderWidth: 2 },
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
  // DEV-coe-hodl11-classificacao: cripto_pct = HODL11 (global/cripto, não Brasil)
  const criptoPct = conc.cripto_pct ?? 0;
  const cambialPct = Math.max(0, 100 - brasilPct - criptoPct);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Concentração Geográfica</h3>
      <div style={styles.kpiRow}>
        <div style={styles.kpi}>
          <span style={styles.kpiLabel}>Brasil</span>
          <span style={{ ...styles.kpiValue, color: EC.orange }}>
            {`${brasilPct.toFixed(1)}%`}
          </span>
        </div>
        <div style={styles.kpi}>
          <span style={styles.kpiLabel}>Cambial (IBKR)</span>
          <span style={{ ...styles.kpiValue, color: EC.accent }}>
            {`${cambialPct.toFixed(1)}%`}
          </span>
        </div>
        <div style={styles.kpi}>
          <span style={styles.kpiLabel}>Cripto (HODL11+Binance)</span>
          <span style={{ ...styles.kpiValue, color: EC.orange }}>
            {`${criptoPct.toFixed(1)}%`}
          </span>
        </div>
      </div>
      <EChart option={option} style={{ height: 260 }} />
      <div style={styles.footnote}>
        HODL11 = Cripto Global (BTC/USD) — categoria própria, não Brasil soberano. Brasil = RF Tesouro + COE XP.
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
