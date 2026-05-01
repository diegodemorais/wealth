'use client';

/**
 * RiskReturnScatter — gráfico scatter de Retorno vs. Risco por classe de ativos.
 * DEV-risk-return-scatter
 *
 * Eixos: X = volatilidade anualizada (%), Y = CAGR nominal (%).
 * Tamanho bubble: peso no portfolio (% alocação).
 * Linha de referência: Sharpe = 0.5 (y = 0.5 × x).
 * Seletor de período: Pós-COVID | Pós-Euro | Pós-GFC | Máximo | 5a | 3a.
 */

import { useState, useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useChartResize } from '@/hooks/useChartResize';
import { EC, EC_TOOLTIP, EC_AXIS_LABEL, EC_SPLIT_LINE } from '@/utils/echarts-theme';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface BucketPoint {
  twr: number;
  vol: number;
  sharpe: number | null;
  label: string;
  weight: number;   // % do portfolio (ex: 43.0)
  color_key: string;
}

type PeriodData = Record<string, BucketPoint>;

export interface RiskReturnScatterProps {
  data: Record<string, PeriodData> | null | undefined;
}

// ── Constantes ────────────────────────────────────────────────────────────────

// Alinhados ao backtest page — mesmo vocabulário de marcos históricos
const PERIODS: Array<{ id: string; label: string; title: string }> = [
  { id: 'since2020', label: 'Pós-COVID',  title: 'Jan/2020→hoje (6a) · desde o fundo de março 2020' },
  { id: 'since2013', label: 'Pós-Euro',   title: 'Jan/2013→hoje (13a) · pós-crise da dívida europeia' },
  { id: 'since2009', label: 'Pós-GFC',    title: 'Jan/2009→hoje (17a) · desde o fundo da crise 2008' },
  { id: 'all',       label: 'Máximo',     title: 'Jan/2005→hoje (21a) · histórico completo com proxies' },
  { id: '5y',        label: '5 anos',     title: 'Jan/2021→hoje (5a)' },
  { id: '3y',        label: '3 anos',     title: 'Jan/2023→hoje (3a)' },
];

// since2020 = início operacional da carteira; fallback para primeiro disponível
const DEFAULT_PERIOD = 'since2020';

// Mapa color_key → hex (EC não exporta 'blue'/'teal' direto — usar aliases)
const COLOR_MAP: Record<string, string> = {
  accent:  EC.accent,
  blue:    EC.blue600,
  teal:    EC.cyan,
  green:   EC.green,
  yellow:  EC.yellow,
  orange:  EC.orange,
  pink:    EC.pink,
  purple:  EC.purple,
};

function bucketColor(color_key: string): string {
  return COLOR_MAP[color_key] ?? EC.muted;
}

// Interpola symbolSize: peso 0% → 12px; peso 100% → 40px
function symbolSize(weight: number): number {
  const MIN = 12, MAX = 40;
  return MIN + (MAX - MIN) * Math.min(weight / 50, 1);
}

// ── Componente ────────────────────────────────────────────────────────────────

export function RiskReturnScatter({ data }: RiskReturnScatterProps) {
  const chartRef = useChartResize();
  const [period, setPeriod] = useState(DEFAULT_PERIOD);

  // Escolher período disponível mais próximo do selecionado
  const activePeriod = useMemo(() => {
    if (!data) return null;
    if (data[period]) return period;
    // Fallback para primeiro período disponível
    return PERIODS.find(p => data[p.id])?.id ?? null;
  }, [data, period]);

  const periodData: PeriodData | null = activePeriod ? (data?.[activePeriod] ?? null) : null;

  const option = useMemo(() => {
    if (!periodData) return {};

    const buckets = Object.entries(periodData);

    // Série scatter: um ponto por bucket
    const scatterSeries = buckets.map(([key, pt]) => ({
      name: pt.label,
      type: 'scatter' as const,
      symbolSize: symbolSize(pt.weight),
      data: [[pt.vol, pt.twr]],
      itemStyle: { color: bucketColor(pt.color_key), opacity: key === 'TOTAL' ? 0.85 : 1 },
      label: {
        show: true,
        position: 'top' as const,
        formatter: pt.label.split(' ')[0],  // primeira palavra como label curto
        color: bucketColor(pt.color_key),
        fontSize: 10,
        fontWeight: 700,
      },
      // Afasta labels sobrepostos automaticamente + traça leader line
      labelLayout: { moveOverlap: 'shiftY' as const },
      labelLine: { show: true, length2: 4, lineStyle: { color: bucketColor(pt.color_key), opacity: 0.35, width: 1 } },
      tooltip: {},
    }));

    // Linha Sharpe = 0.5: y = 0.5 × x
    const sharpeLine = {
      name: 'Sharpe = 0.5',
      type: 'line' as const,
      data: [[0, 0], [32, 16]],
      lineStyle: { type: 'dashed' as const, color: EC.muted, width: 1, opacity: 0.5 },
      symbol: 'none',
      label: {
        show: true,
        position: 'end' as const,
        formatter: 'Sharpe=0.5',
        color: EC.muted,
        fontSize: 9,
      },
      tooltip: { show: false },
    };

    return {
      backgroundColor: 'transparent',
      grid: { left: 52, right: 24, top: 24, bottom: 36 },
      xAxis: {
        type: 'value' as const,
        name: 'Volatilidade anual (%)',
        nameLocation: 'middle' as const,
        nameGap: 24,
        nameTextStyle: { color: EC.muted, fontSize: 10 },
        min: 0,
        max: 85,
        axisLabel: { ...EC_AXIS_LABEL, formatter: (v: number) => `${v}%` },
        splitLine: EC_SPLIT_LINE,
        axisLine: { lineStyle: { color: EC.border2 } },
      },
      yAxis: {
        type: 'value' as const,
        name: 'Retorno nominal (%)',
        nameLocation: 'middle' as const,
        nameGap: 36,
        nameTextStyle: { color: EC.muted, fontSize: 10 },
        axisLabel: { ...EC_AXIS_LABEL, formatter: (v: number) => `${v}%` },
        splitLine: EC_SPLIT_LINE,
        axisLine: { lineStyle: { color: EC.border2 } },
      },
      tooltip: {
        trigger: 'item' as const,
        ...EC_TOOLTIP,
        formatter: (params: any) => {
          if (!params.seriesName || params.seriesName === 'Sharpe = 0.5') return '';
          const [vol, twr] = params.data as [number, number];
          // Encontrar weight e sharpe do bucket correspondente
          const bucket = Object.values(periodData).find(
            b => Math.abs(b.vol - vol) < 0.01 && Math.abs(b.twr - twr) < 0.01
          );
          const weight = bucket?.weight ?? 0;
          const sharpe = bucket?.sharpe ?? (twr / vol);
          return `
            <div style="padding:6px 10px;min-width:140px">
              <div style="font-weight:700;color:${params.color};margin-bottom:4px">${params.seriesName}</div>
              <div style="display:flex;justify-content:space-between;gap:12px">
                <span style="color:${EC.muted}">Retorno</span>
                <span style="font-weight:700">${twr.toFixed(1)}%</span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:12px">
                <span style="color:${EC.muted}">Vol</span>
                <span style="font-weight:700">${vol.toFixed(1)}%</span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:12px">
                <span style="color:${EC.muted}">Sharpe</span>
                <span style="font-weight:700">${sharpe !== null ? sharpe.toFixed(2) : '—'}</span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:12px">
                <span style="color:${EC.muted}">Peso</span>
                <span style="font-weight:700">${weight.toFixed(1)}%</span>
              </div>
            </div>`;
        },
      },
      // Legenda desativada no ECharts — exibida como flex acima do gráfico via JSX
      legend: { show: false },
      series: [...scatterSeries, sharpeLine],
    };
  }, [periodData]);

  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div style={{ padding: '0 16px 16px' }}>
      {/* Seletor de período — scroll horizontal, labels com contexto histórico */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' as const, paddingBottom: 2 }}>
        {PERIODS.filter(p => data[p.id]).map(p => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            title={p.title}
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              border: `1px solid ${period === p.id ? EC.accent : 'var(--border)'}`,
              background: period === p.id ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
              color: period === p.id ? EC.accent : 'var(--muted)',
              fontSize: 12,
              fontWeight: period === p.id ? 700 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap' as const,
              flexShrink: 0,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Legenda inline — acima do chart, 3 itens por linha, não sobrepõe eixos */}
      {periodData && (
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px 12px', marginBottom: 8 }}>
          {Object.values(periodData).map(pt => (
            <div key={pt.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: bucketColor(pt.color_key), display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>{pt.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {periodData ? (
        <div data-testid="risk-return-scatter-chart">
          <EChart ref={chartRef} option={option} style={{ height: 340 }} />
        </div>
      ) : (
        <div style={{ color: 'var(--muted)', fontSize: 12, padding: '20px 0' }}>
          Dados não disponíveis para este período.
        </div>
      )}

      {/* Legenda de buckets com métricas */}
      {periodData && (
        <div
          className="grid grid-cols-2 sm:grid-cols-4"
          style={{ gap: 8, marginTop: 12 }}
        >
          {Object.entries(periodData).map(([key, pt]) => (
            <div
              key={key}
              style={{
                background: 'var(--bg)',
                border: `1px solid var(--border)`,
                borderLeft: `3px solid ${bucketColor(pt.color_key)}`,
                borderRadius: 6,
                padding: '8px 10px',
              }}
            >
              <div style={{ fontSize: 10, color: bucketColor(pt.color_key), fontWeight: 700, textTransform: 'uppercase' as const }}>
                {pt.label}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>
                {pt.twr.toFixed(1)}% / {pt.vol.toFixed(1)}%
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                ret / vol · peso {pt.weight.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="src" style={{ marginTop: 8 }}>
        Retorno nominal em USD (não deflacionado). Bubble size = peso na carteira.
        Linha tracejada = Sharpe 0.5 (referência). Buckets RF: estimativa sintética (nominal BRL).
      </div>
    </div>
  );
}
