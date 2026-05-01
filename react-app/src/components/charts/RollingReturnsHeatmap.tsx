'use client';

/**
 * RollingReturnsHeatmap — heatmap de retornos por janela temporal (1, 3, 5 anos).
 *
 * Calcula CAGR anualizado para cada janela a partir dos dados de backtest.
 * Eixo X: data de início; Eixo Y: janela (1, 3, 5 anos).
 * Cor divergente: vermelho (<0%) → branco (0%) → verde (≥10%).
 */

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useUiStore } from '@/store/uiStore';
import { EC, EC_AXIS_LABEL, EC_TOOLTIP } from '@/utils/echarts-theme';
import { useChartResize } from '@/hooks/useChartResize';

interface RollingReturnsHeatmapProps {
  dates: string[] | undefined;
  target: number[] | undefined;
}

// Windows in years for the heatmap rows
const WINDOWS = [1, 3, 5];
const WINDOW_LABELS = ['1 ano', '3 anos', '5 anos'];

interface HeatmapPoint {
  startDate: string;
  windowYears: number;
  cagr: number;
}

/** Calculate annualized CAGR for all valid windows */
function computeRollingReturns(dates: string[], target: number[]): HeatmapPoint[] {
  const points: HeatmapPoint[] = [];
  const n = Math.min(dates.length, target.length);

  for (const W of WINDOWS) {
    const monthsW = W * 12;
    for (let i = 0; i + monthsW <= n - 1; i++) {
      const v0 = target[i];
      const v1 = target[i + monthsW];
      if (v0 <= 0) continue;
      const cagr = Math.pow(v1 / v0, 1 / W) - 1;
      points.push({ startDate: dates[i], windowYears: W, cagr });
    }
  }

  return points;
}

export function RollingReturnsHeatmap({ dates, target }: RollingReturnsHeatmapProps) {
  const { privacyMode } = useUiStore();
  // Hidden-tab handling: ResizeObserver fires when section becomes visible — see useChartResize hook
  const chartRef = useChartResize();

  const { points, xDates, negativeCounts } = useMemo(() => {
    if (!dates?.length || !target?.length) {
      return { points: [], xDates: [], negativeCounts: {} };
    }

    const pts = computeRollingReturns(dates, target);

    // Unique sorted start dates (x-axis)
    const dateSet = new Set<string>();
    for (const p of pts) dateSet.add(p.startDate);
    const xDates = [...dateSet].sort();

    // Count negative windows per window size
    const negativeCounts: Record<number, number> = { 1: 0, 3: 0, 5: 0 };
    for (const p of pts) {
      if (p.cagr < 0) negativeCounts[p.windowYears] = (negativeCounts[p.windowYears] ?? 0) + 1;
    }

    return { points: pts, xDates, negativeCounts };
  }, [dates, target]);

  if (!points.length) {
    return (
      <div style={{ padding: '16px', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
        Dados de backtest não disponíveis para heatmap.
      </div>
    );
  }

  // Map dates to x-axis indices for ECharts heatmap
  const dateIndex = new Map<string, number>();
  xDates.forEach((d, i) => dateIndex.set(d, i));

  // Format date from "YYYY-MM" to "MM/YYYY"
  const fmtDate = (d: string) => {
    const [y, m] = d.split('-');
    return `${m}/${y}`;
  };

  // ECharts heatmap data: [xIdx, yIdx, value]
  const seriesData = points.map(p => [
    dateIndex.get(p.startDate) ?? 0,
    WINDOWS.indexOf(p.windowYears),
    p.cagr,
  ]);

  // Color scale: red → white → green
  const visualPieces = [
    { lt: 0,                            color: EC.red,    label: '< 0%' },
    { gte: 0,    lt: 0.05,              color: '#4d5a6b', label: '0–5%' },
    { gte: 0.05, lt: 0.10,              color: EC.green,  label: '5–10%' },
    { gte: 0.10,                        color: EC.accent, label: '≥ 10%' },
  ];

  const option = {
    animation: false,
    grid: { top: 16, right: 120, bottom: 56, left: 64 },
    xAxis: {
      type: 'category',
      data: xDates.map(fmtDate),
      axisLabel: {
        ...EC_AXIS_LABEL,
        rotate: 45,
        interval: Math.floor(xDates.length / 10),
      },
      axisLine: { lineStyle: { color: EC.border2 } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: WINDOW_LABELS,
      axisLabel: EC_AXIS_LABEL,
      axisLine: { show: false },
      splitLine: { show: false },
    },
    visualMap: {
      type: 'piecewise',
      show: true,
      orient: 'vertical',
      right: 0,
      top: 'middle',
      pieces: visualPieces,
      textStyle: { color: EC.muted, fontSize: 9 },
    },
    series: [{
      type: 'heatmap',
      data: seriesData,
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 6, shadowColor: 'rgba(0,0,0,0.4)' } },
    }],
    tooltip: {
      ...EC_TOOLTIP,
      formatter: (params: { data: [number, number, number] }) => {
        const [xi, yi, cagr] = params.data;
        const startDate = xDates[xi] ?? '';
        const W = WINDOWS[yi] ?? 1;
        const cagrStr = privacyMode ? '••%' : `${(cagr * 100).toFixed(1)}%`;
        return `<b>${fmtDate(startDate)}</b><br/>Janela: ${W} ano${W > 1 ? 's' : ''}<br/>CAGR: <b>${cagrStr}</b>`;
      },
    },
  };

  // Summary stats
  const totalByWindow: Record<number, number> = { 1: 0, 3: 0, 5: 0 };
  for (const p of points) totalByWindow[p.windowYears] = (totalByWindow[p.windowYears] ?? 0) + 1;

  return (
    <div>
      {/* Summary badges */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12, padding: '0 16px' }}>
        {WINDOWS.map((W, i) => {
          const neg = negativeCounts[W] ?? 0;
          const tot = totalByWindow[W] ?? 0;
          const negColor = neg === 0 ? 'var(--green)' : neg <= 2 ? 'var(--yellow)' : 'var(--red)';
          return (
            <div key={W} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', minWidth: 100 }}>
              <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{WINDOW_LABELS[i]}</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: negColor }}>
                {privacyMode ? '••' : neg} neg.
              </div>
              <div style={{ fontSize: 9, color: 'var(--muted)' }}>{privacyMode ? '•• janelas' : `${tot} janelas`}</div>
            </div>
          );
        })}
      </div>

      <div data-testid="rolling-returns-heatmap" style={{ padding: '0 16px' }}>
        <EChart ref={chartRef} option={option} style={{ height: 160 }} />
      </div>

      <div className="src" style={{ padding: '0 16px' }}>
        CAGR anualizado por janela de {WINDOWS.join('/')} anos iniciando em cada mês.
        Cor: vermelho = negativo · verde = 5–10% · azul = ≥10%. Janelas de 5 anos: ~{totalByWindow[5] ?? 0} pontos.
      </div>
    </div>
  );
}
