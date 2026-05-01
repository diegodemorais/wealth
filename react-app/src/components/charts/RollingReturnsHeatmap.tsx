'use client';

/**
 * RollingReturnsHeatmap — heatmap de retornos por janela temporal (1, 3, 5 anos).
 *
 * Calcula CAGR anualizado para cada janela a partir dos dados de backtest.
 * Eixo X: ano de início (agrupado); Eixo Y: janela (1, 3, 5 anos).
 * Cada célula = CAGR médio de todas as janelas que iniciam naquele ano.
 * Cor divergente: vermelho (<0%) → cinza (0-5%) → verde (5-10%) → azul (≥10%).
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

interface YearWindowStats {
  avgCagr: number;
  count: number;
  negCount: number;
  minCagr: number;
  maxCagr: number;
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

/** Group points by (windowYears, startYear) and compute stats */
function groupByYear(points: HeatmapPoint[]): Map<string, YearWindowStats> {
  const groups = new Map<string, number[]>();

  for (const p of points) {
    const startYear = p.startDate.slice(0, 4);
    const key = `${p.windowYears}-${startYear}`;
    const existing = groups.get(key);
    if (existing) {
      existing.push(p.cagr);
    } else {
      groups.set(key, [p.cagr]);
    }
  }

  const result = new Map<string, YearWindowStats>();
  for (const [key, values] of groups) {
    const avgCagr = values.reduce((a, b) => a + b, 0) / values.length;
    const negCount = values.filter(v => v < 0).length;
    const minCagr = Math.min(...values);
    const maxCagr = Math.max(...values);
    result.set(key, { avgCagr, count: values.length, negCount, minCagr, maxCagr });
  }

  return result;
}

export function RollingReturnsHeatmap({ dates, target }: RollingReturnsHeatmapProps) {
  const { privacyMode } = useUiStore();
  // Hidden-tab handling: ResizeObserver fires when section becomes visible — see useChartResize hook
  const chartRef = useChartResize();

  const { points, yearGroups, uniqueYears, totalByWindow, negativeCounts, avgCagrByWindow } = useMemo(() => {
    if (!dates?.length || !target?.length) {
      return { points: [], yearGroups: new Map(), uniqueYears: [], totalByWindow: {}, negativeCounts: {}, avgCagrByWindow: {} };
    }

    const pts = computeRollingReturns(dates, target);
    const groups = groupByYear(pts);

    // Unique sorted years across all points
    const yearSet = new Set<string>();
    for (const p of pts) yearSet.add(p.startDate.slice(0, 4));
    const uniqueYears = [...yearSet].sort();

    // Totals and avg CAGR per window size (overall, not per year)
    const totalByWindow: Record<number, number> = { 1: 0, 3: 0, 5: 0 };
    const negativeCounts: Record<number, number> = { 1: 0, 3: 0, 5: 0 };
    const cagrSumByWindow: Record<number, number> = { 1: 0, 3: 0, 5: 0 };

    for (const p of pts) {
      totalByWindow[p.windowYears] = (totalByWindow[p.windowYears] ?? 0) + 1;
      if (p.cagr < 0) negativeCounts[p.windowYears] = (negativeCounts[p.windowYears] ?? 0) + 1;
      cagrSumByWindow[p.windowYears] = (cagrSumByWindow[p.windowYears] ?? 0) + p.cagr;
    }

    const avgCagrByWindow: Record<number, number> = {};
    for (const W of WINDOWS) {
      const tot = totalByWindow[W] ?? 0;
      avgCagrByWindow[W] = tot > 0 ? (cagrSumByWindow[W] ?? 0) / tot : 0;
    }

    return { points: pts, yearGroups: groups, uniqueYears, totalByWindow, negativeCounts, avgCagrByWindow };
  }, [dates, target]);

  if (!points.length) {
    return (
      <div style={{ padding: '16px', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
        Dados de backtest não disponíveis para heatmap.
      </div>
    );
  }

  // ECharts heatmap data: [yearIdx, windowIdx, avgCagr] — one point per (year, window) cell
  const seriesData: [number, number, number][] = [];
  for (let yi = 0; yi < WINDOWS.length; yi++) {
    const W = WINDOWS[yi];
    for (let xi = 0; xi < uniqueYears.length; xi++) {
      const year = uniqueYears[xi];
      const key = `${W}-${year}`;
      const stats = yearGroups.get(key);
      if (stats) {
        seriesData.push([xi, yi, stats.avgCagr]);
      }
      // Empty cells (no data for this W×year) are absent — ECharts renders them blank
    }
  }

  // Color scale: red → gray → green → accent
  const visualPieces = [
    { lt: 0,                            color: EC.red,    label: '< 0%' },
    { gte: 0,    lt: 0.05,              color: '#4d5a6b', label: '0–5%' },
    { gte: 0.05, lt: 0.10,              color: EC.green,  label: '5–10%' },
    { gte: 0.10,                        color: EC.accent, label: '≥ 10%' },
  ];

  const option = {
    animation: false,
    grid: { top: 16, right: 120, bottom: 40, left: 64 },
    xAxis: {
      type: 'category',
      data: uniqueYears, // years only, e.g. "2019", "2020", ...
      axisLabel: {
        ...EC_AXIS_LABEL,
        rotate: 0, // years fit horizontally without rotation
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
      label: {
        show: true,
        formatter: (params: { data: [number, number, number] }) =>
          privacyMode ? '••' : `${(params.data[2] * 100).toFixed(0)}%`,
        fontSize: 9,
        color: 'var(--text)',
      },
      emphasis: { itemStyle: { shadowBlur: 6, shadowColor: 'rgba(0,0,0,0.4)' } },
    }],
    tooltip: {
      ...EC_TOOLTIP,
      formatter: (params: { data: [number, number, number] }) => {
        const [xi, yi, avgCagr] = params.data;
        const year = uniqueYears[xi] ?? '';
        const W = WINDOWS[yi] ?? 1;
        const key = `${W}-${year}`;
        const stats = yearGroups.get(key);
        if (!stats) return '';
        const avgStr  = privacyMode ? '••%' : `${(avgCagr * 100).toFixed(1)}%`;
        const minStr  = privacyMode ? '••%' : `${(stats.minCagr * 100).toFixed(1)}%`;
        const maxStr  = privacyMode ? '••%' : `${(stats.maxCagr * 100).toFixed(1)}%`;
        const label = WINDOW_LABELS[yi] ?? `${W} anos`;
        return [
          `<b>${year} · ${label}</b>`,
          `Avg CAGR: <b>${avgStr}</b>`,
          `${stats.count} janelas · min ${minStr} · max ${maxStr}`,
        ].join('<br/>');
      },
    },
  };

  return (
    <div>
      {/* Summary badges — avg CAGR per window size */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12, padding: '0 16px' }}>
        {WINDOWS.map((W, i) => {
          const neg = negativeCounts[W] ?? 0;
          const tot = totalByWindow[W] ?? 0;
          const avg = avgCagrByWindow[W] ?? 0;
          const avgColor = avg < 0 ? 'var(--red)' : avg >= 0.1 ? 'var(--accent)' : avg >= 0.05 ? 'var(--green)' : 'var(--muted)';
          return (
            <div key={W} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', minWidth: 110 }}>
              <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{WINDOW_LABELS[i]}</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: avgColor }}>
                {privacyMode ? '••%' : `${(avg * 100).toFixed(1)}% avg`}
              </div>
              <div style={{ fontSize: 9, color: 'var(--muted)' }}>
                {privacyMode ? '•• neg / •• jan' : `${neg} neg / ${tot} jan`}
              </div>
            </div>
          );
        })}
      </div>

      <div data-testid="rolling-returns-heatmap" style={{ padding: '0 16px' }}>
        <EChart ref={chartRef} option={option} style={{ height: 200 }} />
      </div>

      <div className="src" style={{ padding: '0 16px' }}>
        CAGR médio anualizado por ano de início e janela de {WINDOWS.join('/')} anos.
        Cor: vermelho = negativo · verde = 5–10% · azul = ≥10%. Células em branco = sem dados para aquela combinação.
      </div>
    </div>
  );
}
