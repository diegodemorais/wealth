'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useUiStore } from '@/store/uiStore';
import { useEChartsTheme } from '@/hooks/useEChartsTheme';
import { DashboardData } from '@/types/dashboard';

export interface NetWorthProjectionChartProps {
  data: DashboardData;
}

export function NetWorthProjectionChart({ data }: NetWorthProjectionChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);
  const theme = useEChartsTheme();

  const option = useMemo(() => {
    const years = 30;
    const xAxisData = Array.from({ length: years }, (_, i) => `Y${i + 1}`);

    const p10Data = Array.from({ length: years }, (_, i) =>
      1250000 * Math.pow(1.05, i) + 60000 * i
    );
    const p50Data = Array.from({ length: years }, (_, i) =>
      1250000 * Math.pow(1.07, i) + 60000 * i
    );
    const p90Data = Array.from({ length: years }, (_, i) =>
      1250000 * Math.pow(1.09, i) + 60000 * i
    );

    return {
      color: ['#ef4444', '#10b981', '#3b82f6'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          let result = params[0].axisValueLabel + '<br/>';
          params.forEach((p: any) => {
            result += `${p.marker} ${p.seriesName}: R$ ${(p.value / 1e6).toFixed(1)}M<br/>`;
          });
          return result;
        },
      },
      legend: {
        display: !privacyMode,
        textStyle: { color: theme.textStyle.color },
        top: 10,
      },
      grid: {
        left: 60,
        right: 20,
        top: 40,
        bottom: 40,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: {
          color: privacyMode ? 'transparent' : '#9ca3af',
          fontSize: 12,
          interval: 4, // Show every 5 years
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: privacyMode ? 'transparent' : '#9ca3af',
          formatter: (value: number) => `R$ ${(value / 1e6).toFixed(0)}M`,
          fontSize: 12,
        },
        splitLine: { lineStyle: { color: '#2d3748' } },
      },
      series: [
        {
          name: '10th percentile',
          type: 'line',
          data: p10Data,
          smooth: true,
          lineStyle: { width: 1 },
          symbolSize: 0,
        },
        {
          name: '50th percentile (median)',
          type: 'line',
          data: p50Data,
          smooth: true,
          fill: true,
          areaStyle: { opacity: 0.2 },
          lineStyle: { width: 3 },
          symbolSize: 0,
        },
        {
          name: '90th percentile',
          type: 'line',
          data: p90Data,
          smooth: true,
          lineStyle: { width: 1 },
          symbolSize: 0,
        },
      ],
    };
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Net Worth Projection (30 years, Monte Carlo)</h3>
      <ReactECharts option={option} style={{ height: 400 }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
