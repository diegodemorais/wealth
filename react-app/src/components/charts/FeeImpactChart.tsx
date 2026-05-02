'use client';

/**
 * FeeImpactChart — custo acumulado de TERs projetado 20 anos em BRL.
 * Argumento visual para escolha de ETFs de baixo custo.
 *
 * Dados: fee_impact (do data.json — gerado em generate_data.py)
 * Feature: benchmark-competitivo Fee Impact Visualization
 */

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { EC, EC_TOOLTIP, EC_AXIS_LABEL, EC_SPLIT_LINE } from '@/utils/echarts-theme';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface FeeImpactData {
  ter_medio_pct: number;
  ter_swrd_pct?: number;
  ter_avgs_pct?: number;
  ter_avem_pct?: number;
  retorno_real_pct?: number;
  fonte_ter_avgs?: string;
  anos: number[];
  portfolio_com_ter: number[];
  portfolio_sem_ter: number[];
  custo_acumulado: number[];
}

export interface FeeImpactChartProps {
  data: FeeImpactData | null | undefined;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtBRL(v: number, priv: boolean): string {
  // DEV-privacy-deep-fix: privacy mode masks instead of transforming
  if (priv) return 'R$ ••••';
  if (v >= 1e9) return `R$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `R$${(v / 1e6).toFixed(1)}M`;
  return `R$${(v / 1e3).toFixed(0)}k`;
}

function fmtAxisBRL(v: number, priv: boolean): string {
  if (priv) {
    return 'R$ ••••';
  }
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  return `${(v / 1e3).toFixed(0)}k`;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function FeeImpactChart({ data }: FeeImpactChartProps) {
  const chartRef = useChartResize();
  const { privacyMode, pv } = useEChartsPrivacy();

  const option = useMemo(() => {
    if (!data?.anos?.length) return {};

    const anos = data.anos;
    const comTer = data.portfolio_com_ter.map(v => pv(v));
    const semTer = data.portfolio_sem_ter.map(v => pv(v));
    const custo  = data.custo_acumulado.map(v => pv(v));

    return {
      backgroundColor: 'transparent',
      animation: false,
      grid: { left: 64, right: 24, top: 28, bottom: 48 },
      xAxis: {
        type: 'category' as const,
        data: anos.map(a => `Ano ${a}`),
        axisLabel: {
          ...EC_AXIS_LABEL,
          rotate: 45,
          interval: 3,  // mostra ano 1, 5, 9, 13, 17 — evita sobreposição
        },
        axisLine: { lineStyle: { color: EC.border2 } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value' as const,
        name: privacyMode ? 'BRL (escala)' : 'BRL',
        nameLocation: 'middle' as const,
        nameGap: 56,
        nameTextStyle: { color: EC.muted, fontSize: 10 },
        axisLabel: {
          ...EC_AXIS_LABEL,
          formatter: (v: number) => fmtAxisBRL(v, privacyMode),
        },
        splitLine: EC_SPLIT_LINE,
        axisLine: { lineStyle: { color: EC.border2 } },
      },
      tooltip: {
        trigger: 'axis' as const,
        ...EC_TOOLTIP,
        formatter: (params: any[]) => {
          const idx = params[0]?.dataIndex ?? 0;
          const ano  = anos[idx];
          const c    = custo[idx];
          const cRaw = data.custo_acumulado[idx];
          const rows = params.map((p: any) => {
            const val = privacyMode ? `${fmtAxisBRL(p.value, false)}` : fmtBRL(p.data ?? p.value, false);
            return `<div style="display:flex;justify-content:space-between;gap:12px">
              <span style="color:${p.color}">● ${p.seriesName}</span>
              <span style="font-weight:700">${privacyMode ? '••••' : fmtBRL(p.data ?? p.value, false)}</span>
            </div>`;
          });
          const custoStr = privacyMode ? '••••' : fmtBRL(cRaw, false);
          return `<div style="padding:6px 10px;min-width:200px">
            <div style="font-weight:700;margin-bottom:6px;color:${EC.text}">Ano ${ano}</div>
            ${rows.join('')}
            <div style="border-top:1px solid ${EC.border2};margin-top:6px;padding-top:6px">
              <div style="display:flex;justify-content:space-between;gap:12px">
                <span style="color:${EC.red}">Custo acumulado em fees</span>
                <span style="font-weight:700;color:${EC.red}">${custoStr}</span>
              </div>
            </div>
          </div>`;
        },
      },
      legend: {
        bottom: 0,
        left: 'center' as const,
        textStyle: { color: EC.muted, fontSize: 10 },
        itemWidth: 14,
        itemHeight: 8,
        data: ['Sem fees (referência)', 'Carteira atual (com TER)'],
      },
      series: [
        {
          name: 'Sem fees (referência)',
          type: 'line' as const,
          data: semTer,
          smooth: false,
          symbol: 'none',
          lineStyle: { color: EC.muted, type: 'dashed' as const, width: 2, opacity: 0.8 },
          itemStyle: { color: EC.muted },
          // Área de preenchimento entre as linhas (custo = gap entre sem e com TER)
          areaStyle: {
            color: EC.red,
            opacity: 0.08,
          },
          z: 1,
        },
        {
          name: 'Carteira atual (com TER)',
          type: 'line' as const,
          data: comTer,
          smooth: false,
          symbol: 'circle',
          symbolSize: 4,
          lineStyle: { color: EC.accent, width: 2 },
          itemStyle: { color: EC.accent },
          z: 2,
        },
      ],
    };
  }, [data, privacyMode, pv]);

  if (!data?.anos?.length) return null;

  const terMedio = data.ter_medio_pct;
  const custo20a = data.custo_acumulado[19];

  return (
    <div style={{ padding: '0 16px 16px' }}>
      {/* Sumário rápido */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' as const }}>
        {[
          { label: 'TER médio ponderado', val: `${terMedio.toFixed(3)}%/ano`, color: EC.accent },
          { label: 'Custo em 20 anos',    val: privacyMode ? '••••' : fmtBRL(custo20a, false), color: EC.red },
          { label: 'Retorno real usado', val: `${data.retorno_real_pct ?? 4}% a.a.`, color: EC.muted },
        ].map(({ label, val, color }) => (
          <div key={label} style={{
            background: 'var(--card2)',
            border: '1px solid var(--border)',
            borderLeft: `3px solid ${color}`,
            borderRadius: 6,
            padding: '6px 12px',
          }}>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{label}</div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* TER por ETF */}
      {(data.ter_swrd_pct != null || data.ter_avgs_pct != null || data.ter_avem_pct != null) && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' as const }}>
          {[
            { etf: 'SWRD', ter: data.ter_swrd_pct, peso: '50%', fonte: undefined },
            { etf: 'AVGS', ter: data.ter_avgs_pct, peso: '30%', fonte: data.fonte_ter_avgs },
            { etf: 'AVEM', ter: data.ter_avem_pct, peso: '20%', fonte: undefined },
          ].map(({ etf, ter, peso, fonte }) => (
            <div
              key={etf}
              title={fonte ?? undefined}
              style={{
                fontSize: 10,
                color: 'var(--muted)',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '3px 8px',
                cursor: fonte ? 'help' : undefined,
              }}
            >
              {etf}: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{ter?.toFixed(2)}%</span> · peso {peso}
              {fonte && <span style={{ marginLeft: 4, opacity: 0.6 }}>ⓘ</span>}
            </div>
          ))}
        </div>
      )}

      <div data-testid="fee-impact-chart">
        <EChart ref={chartRef} option={option} style={{ height: 320 }} />
      </div>

      <div className="src" style={{ marginTop: 8 }}>
        Projeção mensal: P(t) = P₀×(1+g_m)^t + A_m×[(1+g_m)^t−1]/g_m · g_m = (r−TER)/12 · aporte mensal constante · retorno real {data.retorno_real_pct ?? 4}% a.a. (valores em BRL de hoje).
        Área vermelha = dinheiro perdido em fees. TER ponderado = Σ(peso × TER). AVGS: TER conforme prospecto ETF.
      </div>
    </div>
  );
}
