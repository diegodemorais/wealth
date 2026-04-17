'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';

export interface BacktestChartProps {
  data: DashboardData;
  period?: string; // '3y' | '5y' | 'since2020' | 'since2013' | 'since2009' | 'all'
  height?: number;
  /** Optional dataset override — when provided, used instead of data.backtest */
  dataset?: { dates: string[]; target: number[]; shadowA?: number[] };
}

const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

function filterByPeriod(
  dates: string[],
  target: number[],
  shadow: number[],
  period?: string,
) {
  let startYm = '';
  if (period === '3y') {
    const now = new Date();
    startYm = `${now.getFullYear() - 3}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  } else if (period === '5y') {
    const now = new Date();
    startYm = `${now.getFullYear() - 5}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  } else if (period === 'since2020') {
    startYm = '2020-01';
  }
  // since2013, since2009, all, undefined → full range (backtest data starts 2019)

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

export function BacktestChart({ data, period, height = 300, dataset }: BacktestChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
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
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          let r = `${params[0].axisValueLabel}<br/>`;
          params.forEach((p: any) => {
            const v = privacyMode ? '••••' : p.value?.toFixed(1);
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
        axisLine: { lineStyle: { color: '#30363d' } },
        axisLabel: {
          color: privacyMode ? 'transparent' : '#8b949e',
          fontSize: 10,
          interval,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: privacyMode ? 'transparent' : '#8b949e',
          fontSize: 10,
          formatter: (v: number) => v.toFixed(0),
        },
        splitLine: { lineStyle: { color: '#21262d' } },
      },
      series: [
        {
          name: 'Target',
          type: 'line',
          data: target,
          smooth: true,
          lineStyle: { width: 2, color: '#58a6ff' },
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
          lineStyle: { width: 1.5, color: '#8b949e', type: 'dashed' },
          symbolSize: 0,
        },
      ],
    };
  }, [data, period, privacyMode, theme]);

  if (!(data as any)?.backtest?.dates?.length) return null;

  return (
    <ReactECharts ref={chartRef} option={option} style={{ height, width: '100%' }} />
  );
}
