'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useUiStore } from '@/store/uiStore';
import { useEChartsTheme } from '@/hooks/useEChartsTheme';
import { DashboardData } from '@/types/dashboard';

export interface BacktestR7ChartProps {
  data: DashboardData;
}

export function BacktestR7Chart({ data }: BacktestR7ChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);
  const theme = useEChartsTheme();

  const option = useMemo(() => {
    const months = 84; // 7 years backtest
    const xAxisData = Array.from({ length: months }, (_, i) => `M${i + 1}`);

    // Current portfolio: diversified
    const portfolioData = Array.from({ length: months }, (_, i) => {
      const monthlyReturn = 0.07 / 12;
      const volatility = 0.12 / Math.sqrt(12);
      const noise = (Math.random() - 0.5) * volatility * 2;
      return 1000000 * Math.pow(1 + monthlyReturn + noise, i);
    });

    // R7 Benchmark: 70% equity, 30% fixed income
    const r7BenchmarkData = Array.from({ length: months }, (_, i) => {
      const monthlyReturn = 0.06 / 12;
      const volatility = 0.14 / Math.sqrt(12);
      const noise = (Math.random() - 0.5) * volatility * 2;
      return 1000000 * Math.pow(1 + monthlyReturn + noise, i);
    });

    return {
      color: ['#3b82f6', '#f59e0b'],
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
          interval: 11, // Show every year
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: privacyMode ? 'transparent' : '#9ca3af',
          formatter: (value: number) => `R$ ${(value / 1e6).toFixed(1)}M`,
          fontSize: 12,
        },
        splitLine: { lineStyle: { color: '#2d3748' } },
      },
      series: [
        {
          name: 'Current Portfolio',
          type: 'line',
          data: portfolioData,
          smooth: true,
          fill: true,
          areaStyle: { opacity: 0.2 },
          lineStyle: { width: 2 },
          symbolSize: 0,
        },
        {
          name: 'R7 Benchmark (70/30)',
          type: 'line',
          data: r7BenchmarkData,
          smooth: true,
          fill: true,
          areaStyle: { opacity: 0.2 },
          lineStyle: { width: 2 },
          symbolSize: 0,
        },
      ],
    };
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Portfolio vs R7 Benchmark (84 months)</h3>
      <ReactECharts option={option} style={{ height: 400 }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
  },
  title: {
    margin: '0 0 16px 0',
    color: '#fff',
  },
};
