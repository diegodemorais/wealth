'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { CHART_COLORS } from '@/utils/chartSetup';

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
          color: privacyMode ? 'transparent' : '#94a3b8',
          fontSize: 11,
          interval: Math.floor(xAxisData.length / 8),
        },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: {
          color: privacyMode ? 'transparent' : '#94a3b8',
          formatter: (v: number) => v.toFixed(1),
          fontSize: 11,
        },
        splitLine: { lineStyle: { color: '#161b22' } },
      },
      series: [
        {
          name: 'Sharpe BRL vs CDI',
          type: 'line' as const,
          data: sharpeValues,
          smooth: true,
          itemStyle: { color: CHART_COLORS.green },
          lineStyle: { width: 2.5, color: CHART_COLORS.green },
          symbolSize: 0,
        },
        {
          name: 'Sharpe USD vs T-Bill',
          type: 'line' as const,
          data: sharpeUsdValues,
          smooth: true,
          itemStyle: { color: CHART_COLORS.accent },
          lineStyle: { width: 1.5, color: CHART_COLORS.accent, type: 'dashed' as const },
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
    <div className="bg-card border border-border rounded p-4 mb-5">
      <h3 className="text-sm font-semibold text-text mb-4 mt-0">Rolling Sharpe &amp; Sortino Ratio (12-month window)</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 300, width: "100%" }} />
    </div>
  );
}
