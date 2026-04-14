'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useUiStore } from '@/store/uiStore';
import { useEChartsTheme } from '@/hooks/useEChartsTheme';
import { DashboardData } from '@/types/dashboard';

export interface RollingSharpChartProps {
  data: DashboardData;
}

export function RollingSharpChart({ data }: RollingSharpChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);
  const theme = useEChartsTheme();

  const option = useMemo(() => {
    const months = 48;
    const xAxisData = Array.from({ length: months }, (_, i) => `M${i + 1}`);
    const rollingSharpData = Array.from({ length: months }, (_, i) =>
      0.5 + 0.2 * Math.sin(i * 0.1) + Math.random() * 0.3
    );

    return {
      color: ['#f59e0b'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const p = params[0];
          return `${p.axisValueLabel}<br/>${p.marker} Sharpe: ${p.value.toFixed(2)}`;
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
          interval: 7, // Show every 8 months
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: privacyMode ? 'transparent' : '#9ca3af',
          fontSize: 12,
        },
        splitLine: { lineStyle: { color: '#2d3748' } },
      },
      series: [
        {
          name: 'Rolling Sharpe Ratio (12m)',
          type: 'line',
          data: rollingSharpData,
          smooth: true,
          lineStyle: { width: 2 },
          symbolSize: 0,
        },
      ],
    };
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Rolling Sharpe Ratio (12-month window)</h3>
      <ReactECharts option={option} style={{ height: 300 }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
