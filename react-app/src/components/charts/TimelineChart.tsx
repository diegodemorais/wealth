'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createDualLineChartOption, CHART_COLORS } from '@/utils/chartSetup';
import { EC, EC_SPLIT_LINE } from '@/utils/echarts-theme';
import { ChartCard } from '@/components/primitives/ChartCard';

// Handle hidden container resize: check offsetWidth > 0 and retry with setTimeout
const handleChartResize = (containerRef: any) => {
  if (containerRef?.current?.offsetWidth > 0) {
    setTimeout(() => containerRef.current?.getEchartsInstance?.()?.resize?.(), 100);
  }
};

export interface TimelineChartProps {
  data: DashboardData;
  period?: string;
}

// Filter parallel arrays by period string relative to today
function filterByPeriod(
  dates: string[],
  arrays: number[][],
  period: string,
): { dates: string[]; arrays: number[][] } {
  if (!period || period === 'all' || dates.length === 0) return { dates, arrays };

  const now = new Date();
  let cutoff: Date;

  if (period === 'ytd') {
    cutoff = new Date(now.getFullYear(), 0, 1);
  } else {
    const months = period === '6m' ? 6 : period === '1y' ? 12 : period === '3y' ? 36 : period === '5y' ? 60 : 0;
    if (!months) return { dates, arrays };
    cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - months);
  }

  const cutoffYM = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}`;
  const idx = dates.findIndex(d => d >= cutoffYM);
  if (idx < 0) return { dates, arrays };

  return {
    dates: dates.slice(idx),
    arrays: arrays.map(a => a.slice(idx)),
  };
}

export function TimelineChart({ data, period = 'all' }: TimelineChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const bt = (data as any)?.backtest ?? {};
    const rawDates: string[] = bt.dates ?? [];
    const targetValues: number[] = bt.target ?? [];
    const shadowAValues: number[] = bt.shadowA ?? [];

    if (rawDates.length === 0) {
      return {
        backgroundColor: 'transparent',
        title: { text: 'Sem dados históricos', textStyle: { color: '#94a3b8' } },
      };
    }

    const { dates: filteredDates, arrays } = filterByPeriod(
      rawDates,
      [targetValues, shadowAValues],
      period,
    );
    const [filtTarget, filtShadow] = arrays;

    const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const xAxisData = filteredDates.map((ym: string) => {
      const [y, m] = ym.split('-');
      return MONTHS_PT[parseInt(m, 10) - 1] + '/' + y.slice(2);
    });

    const metrics = bt.metrics ?? {};
    const cagr = metrics.cagr != null && !privacyMode ? ` (CAGR: ${(metrics.cagr * 100).toFixed(1)}%)` : '';

    if (filtShadow.length > 0) {
      return createDualLineChartOption({
        data, privacyMode, theme,
        xAxisData,
        series1Data: filtTarget,
        series1Name: `Target Portfolio${cagr}`,
        series2Data: filtShadow,
        series2Name: 'Shadow A (60/40)',
        series1Color: CHART_COLORS.accent,
        series2Color: CHART_COLORS.yellow,
        dashed: true,
        yAxisFormatter: (v) => `${v.toFixed(0)}`,
      });
    }

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
      },
      grid: { left: 50, right: 20, top: 30, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: xAxisData,
        axisLabel: {
          color: privacyMode ? 'transparent' : EC.muted,
          fontSize: 11,
          interval: Math.floor(xAxisData.length / 8),
        },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: {
          color: privacyMode ? 'transparent' : EC.muted,
          formatter: (v: number) => `${v.toFixed(0)}`,
          fontSize: 11,
        },
        splitLine: EC_SPLIT_LINE,
      },
      series: [
        {
          name: `Target Portfolio${cagr}`,
          type: 'line' as const,
          data: filtTarget,
          smooth: true,
          itemStyle: { color: EC.accent },
          lineStyle: { width: 2.5, color: EC.accent },
          symbolSize: 0,
          areaStyle: { opacity: 0.08, color: EC.accent },
        },
      ],
    };
  }, [data, privacyMode, theme, period]);

  return (
    <ChartCard title="Historical Performance — Equity Curve (Indexada a 100)">
      <EChart ref={chartRef} option={option} style={{ height: 400, width: "100%" }} />
    </ChartCard>
  );
}
