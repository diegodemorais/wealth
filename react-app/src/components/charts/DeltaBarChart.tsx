'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useUiStore } from '@/store/uiStore';
import { useEChartsTheme } from '@/hooks/useEChartsTheme';
import { DashboardData } from '@/types/dashboard';

export interface DeltaBarChartProps {
  data: DashboardData;
}

export function DeltaBarChart({ data }: DeltaBarChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);
  const theme = useEChartsTheme();

  const option = useMemo(() => {
    const xAxisData = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
    const deltaData = [0.8, -0.2, 1.2, 0.5, -0.1, 0.9, 1.1, 0.3, -0.4, 0.6, 0.8, 0.7];

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const p = params[0];
          return `${p.name}<br/>${p.marker} Delta: ${p.value.toFixed(2)}%`;
        },
        axisPointer: { type: 'shadow' },
      },
      legend: {
        display: !privacyMode,
        textStyle: { color: theme.textStyle.color },
        top: 10,
      },
      grid: {
        left: 50,
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
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: privacyMode ? 'transparent' : '#9ca3af',
          formatter: '{value}%',
          fontSize: 12,
        },
        splitLine: { lineStyle: { color: '#2d3748' } },
      },
      series: [
        {
          name: 'Portfolio vs Benchmark',
          type: 'bar',
          data: deltaData.map((value) => ({
            value,
            itemStyle: { color: value >= 0 ? '#10b981' : '#ef4444' },
          })),
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Monthly Delta vs Benchmark</h3>
      <ReactECharts option={option} style={{ height: 300 }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
