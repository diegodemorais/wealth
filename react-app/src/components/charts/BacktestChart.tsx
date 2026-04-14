'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useUiStore } from '@/store/uiStore';
import { useEChartsTheme } from '@/hooks/useEChartsTheme';
import { DashboardData } from '@/types/dashboard';

export interface BacktestChartProps {
  data: DashboardData;
}

export function BacktestChart({ data }: BacktestChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);
  const theme = useEChartsTheme();

  const option = useMemo(() => {
    const months = 84;
    const xAxisData = Array.from({ length: months }, (_, i) => `M${i + 1}`);
    const portfolioData = Array.from({ length: months }, (_, i) =>
      100 * Math.pow(1.0088, i)
    );
    const benchmarkData = Array.from({ length: months }, (_, i) =>
      100 * Math.pow(1.0075, i)
    );

    return {
      color: ['#10b981', '#9ca3af'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          let result = params[0].axisValueLabel + '<br/>';
          params.forEach((p: any) => {
            result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(2)}<br/>`;
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
          interval: 11, // Show every year
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
          name: 'Portfolio',
          type: 'line',
          data: portfolioData,
          smooth: true,
          lineStyle: { width: 2 },
          symbolSize: 0,
        },
        {
          name: 'Benchmark',
          type: 'line',
          data: benchmarkData,
          smooth: true,
          lineStyle: { width: 2 },
          symbolSize: 0,
        },
      ],
    };
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Backtest Equity Curve (7 years)</h3>
      <ReactECharts option={option} style={{ height: 400 }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
