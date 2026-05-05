'use client';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { EC, EC_AXIS_LINE, EC_SPLIT_LINE } from '@/utils/echarts-theme';

// PROXY_CUTOFF: target_alocacao_total uses academic proxies before 2024-12 (first UCITS purchase)
// Frontend marks it as dashed thin before this date per spec (DEV-shadow-allocation-series, Decisão 5)
const PROXY_CUTOFF = '2024-12';

export interface AllocationSeriesSpec {
  name: string;
  key: string;
  color: string;
  /** 'solid' | 'dashed' — default 'solid'. Area style only applied to the protagonist (first area-flagged series). */
  style?: 'solid' | 'dashed';
  /** If true, render as area chart (protagonist series) */
  area?: boolean;
}

export interface BacktestChartProps {
  data: DashboardData;
  period?: string; // '3y' | '5y' | 'since2020' | 'since2013' | 'since2009' | 'since2021' | 'all'
  height?: number;
  /** Optional dataset override — when provided, used instead of data.backtest */
  dataset?: { dates: string[]; target: number[]; shadowA?: number[] };
  /**
   * Optional N-series spec for allocation-total mode.
   * Retro-compat: when absent, legacy 2-series (Target + VWRA) behavior is preserved.
   */
  series?: AllocationSeriesSpec[];
}

const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

/** Compute the ISO year-month string for rolling-window periods */
function rollingStartYm(period: string): string {
  const now = new Date();
  if (period === '3y') return `${now.getFullYear() - 3}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (period === '5y') return `${now.getFullYear() - 5}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return '';
}

/** Resolve the ISO start year-month for a given period key */
function startYmForPeriod(period?: string): string {
  if (!period) return '';
  if (period === '3y' || period === '5y') return rollingStartYm(period);
  if (period === 'since2020') return '2020-01';
  if (period === 'since2021') return '2021-04'; // allocation series starts 2021-04
  if (period === 'since2013') return '2013-01';
  if (period === 'since2009') return '2009-01';
  return ''; // 'all' and undefined → full range
}

// ── Legacy 2-series filter (retro-compat) ────────────────────────────────────

function filterByPeriod(
  dates: string[],
  target: number[],
  shadow: number[],
  period?: string,
) {
  const startYm = startYmForPeriod(period);
  if (!startYm) return { dates, target, shadow };

  const idx = dates.findIndex(d => d >= startYm);
  if (idx <= 0) return { dates, target, shadow };

  const slicedDates = dates.slice(idx);
  const slicedTarget = target.slice(idx);
  const slicedShadow = shadow.slice(idx);

  // Rebase both series to 100 at the start of the window
  const tb = slicedTarget[0] ?? 100;
  const sb = slicedShadow[0] ?? 100;
  return {
    dates: slicedDates,
    target: slicedTarget.map(v => (v / tb) * 100),
    shadow: slicedShadow.map(v => (v / sb) * 100),
  };
}

// ── N-series filter for allocation-total mode ─────────────────────────────────

function filterNSeriesByPeriod(
  dates: string[],
  seriesData: number[][],
  period?: string,
): { dates: string[]; seriesData: number[][] } {
  const startYm = startYmForPeriod(period);
  if (!startYm) return { dates, seriesData };

  const idx = dates.findIndex(d => d >= startYm);
  if (idx <= 0) return { dates, seriesData };

  const slicedDates = dates.slice(idx);
  const slicedSeries = seriesData.map(vals => {
    const sliced = vals.slice(idx);
    const base = sliced[0] ?? 100;
    return sliced.map(v => (v / base) * 100);
  });
  return { dates: slicedDates, seriesData: slicedSeries };
}

// ── ECharts series builder ────────────────────────────────────────────────────

/** Build an ECharts series object for one allocation line */
function buildEChartsSeries(
  spec: AllocationSeriesSpec,
  dates: string[],
  values: number[],
  isProtagonist: boolean,
) {
  const isArea = isProtagonist && spec.area;

  // For target_alocacao_total: split into two segments (proxy dashed / solid)
  // The simplest approach: render two overlapping series (proxy + live)
  const isTargetWithProxy = spec.key === 'target_alocacao_total';

  if (isTargetWithProxy) {
    // Find index where proxy ends (first date >= PROXY_CUTOFF)
    const cutoffIdx = dates.findIndex(d => d >= PROXY_CUTOFF);

    // Proxy segment (dashed, thin) — null from cutoff onward
    const proxyData = values.map((v, i) => (cutoffIdx < 0 || i <= cutoffIdx ? v : null));
    // Live segment (solid) — null before cutoff
    const liveData = values.map((v, i) => (cutoffIdx < 0 || i >= cutoffIdx ? v : null));

    return [
      {
        name: `${spec.name} (proxy)`,
        type: 'line',
        data: proxyData,
        smooth: true,
        lineStyle: { width: 1.5, color: spec.color, type: 'dashed' },
        symbolSize: 0,
        // Hide from legend (suffix distinguishes it from the live segment)
        legendHoverLink: false,
      },
      {
        name: spec.name,
        type: 'line',
        data: liveData,
        smooth: true,
        lineStyle: { width: 2, color: spec.color, type: 'solid' },
        symbolSize: 0,
      },
    ];
  }

  const lineType = spec.style === 'dashed' ? 'dashed' : 'solid';
  const lineWidth = isProtagonist ? 2.5 : (spec.style === 'dashed' ? 1.5 : 2);

  const base: Record<string, unknown> = {
    name: spec.name,
    type: 'line',
    data: values,
    smooth: true,
    lineStyle: { width: lineWidth, color: spec.color, type: lineType },
    symbolSize: 0,
  };

  if (isArea) {
    base.areaStyle = {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: `${spec.color}30` },
          { offset: 1, color: `${spec.color}00` },
        ],
      },
    };
  }

  return [base];
}

export function BacktestChart({ data, period, height = 300, dataset, series }: BacktestChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    // ── N-series allocation-total mode ───────────────────────────────────────
    if (series && series.length > 0) {
      const alloc = (data as any)?.backtest?.allocation ?? {};
      const allDates: string[] = alloc.dates ?? [];

      // Extract raw series arrays from allocation data
      const rawSeriesData: number[][] = series.map(s => alloc[s.key] ?? []);

      const { dates, seriesData } = filterNSeriesByPeriod(allDates, rawSeriesData, period);

      const xAxisData = dates.map(ym => {
        const [y, m] = ym.split('-');
        return MONTHS_PT[parseInt(m, 10) - 1] + '/' + y.slice(2);
      });
      const interval = Math.max(1, Math.floor(dates.length / 7));

      // Build ECharts series — protagonist (first) gets area treatment
      const eChartsSeries = series.flatMap((spec, i) =>
        buildEChartsSeries(spec, dates, seriesData[i] ?? [], i === 0)
      );

      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: theme.tooltip.backgroundColor,
          borderColor: theme.tooltip.borderColor,
          textStyle: theme.tooltip.textStyle,
          formatter: (params: CallbackDataParams[]) => {
            if (!Array.isArray(params)) return '';
            let r = `${(params[0] as (CallbackDataParams & { axisValueLabel?: string })).axisValueLabel}<br/>`;
            params.forEach((p: any) => {
              if (p.value == null) return;
              r += `${p.marker} ${p.seriesName}: ${(p.value as number).toFixed(1)}<br/>`;
            });
            return r;
          },
        },
        legend: {
          textStyle: { color: theme.textStyle.color },
          top: 0,
          itemWidth: 12,
          itemHeight: 10,
          fontSize: 11,
        },
        grid: { left: 50, right: 16, top: 28, bottom: 24, containLabel: true },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLine: EC_AXIS_LINE,
          axisLabel: { color: privacyMode ? 'transparent' : EC.muted, fontSize: 10, interval },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: privacyMode ? 'transparent' : EC.muted,
            fontSize: 10,
            formatter: (v: number) => v.toFixed(0),
          },
          splitLine: EC_SPLIT_LINE,
        },
        series: eChartsSeries,
      };
    }

    // ── Legacy 2-series mode (retro-compat) ──────────────────────────────────
    const backtest = dataset ?? (data as any)?.backtest ?? {};
    const allDates: string[] = backtest.dates ?? [];
    const allTarget: number[] = backtest.target ?? [];
    const allShadow: number[] = backtest.shadowA ?? [];

    const { dates, target, shadow } = filterByPeriod(allDates, allTarget, allShadow, period);

    const xAxisData = dates.map(ym => {
      const [y, m] = ym.split('-');
      return MONTHS_PT[parseInt(m, 10) - 1] + '/' + y.slice(2);
    });

    const interval = Math.max(1, Math.floor(dates.length / 7));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: CallbackDataParams[]) => {
          if (!Array.isArray(params)) return '';
          let r = `${(params[0] as (CallbackDataParams & { axisValue?: string; axisValueLabel?: string })).axisValueLabel}<br/>`;
          params.forEach((p: any) => {
            const v = p.value?.toFixed(1);
            r += `${p.marker} ${p.seriesName}: ${v}<br/>`;
          });
          return r;
        },
      },
      legend: {
        textStyle: { color: theme.textStyle.color },
        top: 0,
        itemWidth: 12,
        itemHeight: 10,
        fontSize: 11,
      },
      grid: { left: 50, right: 16, top: 28, bottom: 24, containLabel: true },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLine: EC_AXIS_LINE,
        axisLabel: {
          color: privacyMode ? 'transparent' : EC.muted,
          fontSize: 10,
          interval,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: privacyMode ? 'transparent' : EC.muted,
          fontSize: 10,
          formatter: (v: number) => v.toFixed(0),
        },
        splitLine: EC_SPLIT_LINE,
      },
      series: [
        {
          name: 'Target',
          type: 'line',
          data: target,
          smooth: true,
          lineStyle: { width: 2, color: EC.accent },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(88,166,255,0.18)' },
                { offset: 1, color: 'rgba(88,166,255,0)' },
              ],
            },
          },
          symbolSize: 0,
        },
        {
          name: 'VWRA',
          type: 'line',
          data: shadow,
          smooth: true,
          lineStyle: { width: 1.5, color: EC.muted, type: 'dashed' },
          symbolSize: 0,
        },
      ],
    };
  }, [data, period, privacyMode, theme, dataset, series]);

  // Render guard: needs either the explicit series dataset, the legacy backtest, or allocation data
  if (!series && !dataset && !(data as any)?.backtest?.dates?.length) return null;
  if (series && !(data as any)?.backtest?.allocation?.dates?.length) return null;

  return (
    <EChart ref={chartRef} option={option} style={{ height, width: '100%' }} />
  );
}
