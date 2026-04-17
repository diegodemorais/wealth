'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { EC, EC_SPLIT_LINE } from '@/utils/echarts-theme';
import { ChartCard } from '@/components/primitives/ChartCard';

export interface RollingSharpChartProps {
  data: DashboardData;
}

export function RollingSharpChart({ data }: RollingSharpChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    // Use real rolling_sharpe data
    const rs = (data as any)?.rolling_sharpe ?? {};
    const dates: string[] = rs.dates ?? [];
    const sharpeValues: number[] = rs.values ?? [];       // BRL vs CDI
    const sharpeUsdValues: number[] = rs.values_usd ?? []; // USD vs T-Bill

    if (dates.length === 0) {
      return {
        backgroundColor: 'transparent',
        title: { text: 'Sem dados de Sharpe Ratio', textStyle: { color: '#94a3b8' } },
      };
    }

    // Format dates: '2022-04' → 'abr/22'
    const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const xAxisData = dates.map((ym: string) => {
      const [y, m] = ym.split('-');
      return MONTHS_PT[parseInt(m, 10) - 1] + '/' + y.slice(2);
    });

    const window = rs.window ?? 12;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params) || !params[0]) return '';
          let html = `<div style="padding:8px"><strong>${params[0].axisValueLabel}</strong><br/>`;
          params.forEach((p: any) => {
            if (p.value != null) {
              const val = p.value.toFixed(2);
              html += `${p.marker} ${p.seriesName}: <strong>${val}</strong><br/>`;
            }
          });
          html += '</div>';
          return html;
        },
      },
      legend: {
        data: [`Sharpe BRL vs CDI`, `Sharpe USD vs T-Bill`, `Threshold=1`, `Zero`],
        textStyle: { color: theme.textStyle.color },
        top: 5,
        right: 10,
      },
      grid: { left: 50, right: 20, top: 35, bottom: 40, containLabel: true },
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
          formatter: (v: number) => v.toFixed(1),
          fontSize: 11,
        },
        splitLine: EC_SPLIT_LINE,
      },
      series: [
        {
          name: 'Sharpe BRL vs CDI',
          type: 'line' as const,
          data: sharpeValues,
          smooth: true,
          itemStyle: { color: EC.green },
          lineStyle: { width: 2.5, color: EC.green },
          symbolSize: 0,
        },
        {
          name: 'Sharpe USD vs T-Bill',
          type: 'line' as const,
          data: sharpeUsdValues,
          smooth: true,
          itemStyle: { color: EC.accent },
          lineStyle: { width: 1.5, color: EC.accent, type: 'dashed' as const },
          symbolSize: 0,
        },
        {
          name: 'Threshold=1',
          type: 'line' as const,
          data: dates.map(() => 1),
          lineStyle: { color: 'rgba(34,197,94,.4)', type: 'dotted' as const, width: 1 },
          symbolSize: 0,
          itemStyle: { color: 'rgba(34,197,94,.4)' },
        },
        {
          name: 'Zero',
          type: 'line' as const,
          data: dates.map(() => 0),
          lineStyle: { color: '#555', type: 'dashed' as const, width: 1 },
          symbolSize: 0,
          itemStyle: { color: '#555' },
        },
      ],
    };
  }, [data, privacyMode, theme]);

  return (
    <ChartCard title="Rolling Sharpe &amp; Sortino Ratio (12-month window)">
      <EChart ref={chartRef} option={option} style={{ height: 300, width: "100%" }} />
    </ChartCard>
  );
}
