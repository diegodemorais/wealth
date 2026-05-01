'use client';

/**
 * FactorProfileChart — Factor Profile Comparativo (AVGS vs AVEM vs SWRD).
 * Bar chart horizontal mostrando exposição fatorial dos 3 ETFs lado a lado.
 * Análogo ao Morningstar Factor Profile.
 *
 * Feature: benchmark-competitivo Factor Profile Comparativo
 */

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useChartResize } from '@/hooks/useChartResize';
import { EC, EC_TOOLTIP, EC_AXIS_LABEL, EC_SPLIT_LINE } from '@/utils/echarts-theme';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface FactorLoadings {
  hml: number;
  smb: number;
  rmw: number;
  cma: number;
  mkt_rf: number;
  mom: number;
  [key: string]: number;
}

export interface FactorProfileData {
  SWRD?: FactorLoadings;
  AVGS_composite?: FactorLoadings;
  EIMI?: FactorLoadings;
  portfolio_equity?: FactorLoadings;
  [key: string]: FactorLoadings | undefined;
}

export interface FactorProfileChartProps {
  data: FactorProfileData | null | undefined;
}

// ── Constantes ────────────────────────────────────────────────────────────────

// Excluir MKT_RF — todos têm ~1.0, menos útil visualmente
const FACTORS: Array<{ key: string; label: string }> = [
  { key: 'hml', label: 'HML (Value)' },
  { key: 'smb', label: 'SMB (Size)' },
  { key: 'rmw', label: 'RMW (Quality)' },
  { key: 'cma', label: 'CMA (Invest.)' },
  { key: 'mom', label: 'MOM (Momentum)' },
];

// ETFs a mostrar com mapeamento para key no data e cor
const ETF_CONFIG = [
  { key: 'SWRD',          label: 'SWRD',         color: EC.blue600 },
  { key: 'AVGS_composite', label: 'AVGS',        color: EC.accent  },
  { key: 'EIMI',          label: 'AVEM (EIMI)',   color: EC.cyan    },
] as const;

// ── Componente ────────────────────────────────────────────────────────────────

export function FactorProfileChart({ data }: FactorProfileChartProps) {
  const chartRef = useChartResize();

  const option = useMemo(() => {
    if (!data) return {};

    // Verifica se há pelo menos um ETF com dados
    const hasData = ETF_CONFIG.some(({ key }) => data[key] != null);
    if (!hasData) return {};

    const categories = FACTORS.map(f => f.label);

    const series = ETF_CONFIG
      .filter(({ key }) => data[key] != null)
      .map(({ key, label, color }) => {
        const loadings = data[key]!;
        const values = FACTORS.map(f => {
          const v = loadings[f.key];
          return v != null ? parseFloat(v.toFixed(4)) : 0;
        });
        return {
          name: label,
          type: 'bar' as const,
          data: values,
          itemStyle: { color },
          barMaxWidth: 20,
          label: {
            show: true,
            position: 'right' as const,
            formatter: (p: { value: number }) => p.value >= 0 ? `+${p.value.toFixed(2)}` : p.value.toFixed(2),
            color: EC.muted,
            fontSize: 9,
          },
        };
      });

    return {
      backgroundColor: 'transparent',
      animation: false,
      grid: { left: 96, right: 64, top: 24, bottom: 32 },
      xAxis: {
        type: 'value' as const,
        name: 'Loading (vs neutro = 0)',
        nameLocation: 'middle' as const,
        nameGap: 24,
        nameTextStyle: { color: EC.muted, fontSize: 10 },
        axisLabel: {
          ...EC_AXIS_LABEL,
          formatter: (v: number) => v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1),
        },
        splitLine: EC_SPLIT_LINE,
        axisLine: { lineStyle: { color: EC.border2 } },
        // Linha vertical em x=0 via markLine na primeira série
      },
      yAxis: {
        type: 'category' as const,
        data: categories,
        axisLabel: { ...EC_AXIS_LABEL, fontSize: 10 },
        axisLine: { show: false },
        axisTick: { show: false },
        inverse: false,
      },
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: { type: 'shadow' as const },
        ...EC_TOOLTIP,
        formatter: (params: any[]) => {
          const fatorIdx = params[0]?.dataIndex ?? 0;
          const fatorLabel = categories[fatorIdx];
          const rows = params.map((p: any) =>
            `<div style="display:flex;justify-content:space-between;gap:12px">
              <span style="color:${p.color}">● ${p.seriesName}</span>
              <span style="font-weight:700">${p.value >= 0 ? '+' : ''}${(p.value as number).toFixed(4)}</span>
            </div>`
          ).join('');
          return `<div style="padding:6px 10px;min-width:200px">
            <div style="font-weight:700;margin-bottom:6px;color:${EC.text}">${fatorLabel}</div>
            ${rows}
            <div style="font-size:10px;color:${EC.muted};margin-top:4px">vs neutro (= 0)</div>
            <div style="font-size:9px;color:${EC.muted};margin-top:2px;font-style:italic">Estimativa baseada em regressão histórica</div>
          </div>`;
        },
      },
      legend: {
        bottom: 0,
        left: 'center' as const,
        textStyle: { color: EC.muted, fontSize: 10 },
        itemWidth: 12,
        itemHeight: 8,
        data: ETF_CONFIG.filter(({ key }) => data[key] != null).map(({ label }) => label),
      },
      series: series.map((s, i) => i === 0
        ? {
            ...s,
            // Linha vertical em x=0 (neutro) na primeira série
            markLine: {
              silent: true,
              symbol: 'none',
              data: [{ xAxis: 0, lineStyle: { color: EC.border2, type: 'solid' as const, width: 1.5 } }],
              label: { show: false },
            },
          }
        : s
      ),
    };
  }, [data]);

  if (!data || !ETF_CONFIG.some(({ key }) => data[key] != null)) return null;

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div data-testid="factor-profile-chart">
        <EChart ref={chartRef} option={option} style={{ height: 280 }} />
      </div>
      <div className="src" style={{ marginTop: 8 }}>
        Estimativa baseada em regressão histórica · AVGS = pesos per Avantis AVGS factsheet (58% AVUV + 42% AVDV) · AVEM = proxy EIMI.
        Barra direita = tilt positivo · esquerda = tilt negativo · neutro = 0.
        HML (Value), SMB (Size), RMW (Profitability/Quality), CMA (Investment conservatism), MOM (Momentum). MKT_RF excluído (~1 em todos).
      </div>
    </div>
  );
}
