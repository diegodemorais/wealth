'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';

export interface GuardrailsChartProps {
  data: DashboardData;
}

export function GuardrailsChart({ data }: GuardrailsChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const years = 30;
    const xAxisData = Array.from({ length: years }, (_, i) => `Y${i + 1}`);

    // Safe spending corridor: upper and lower bounds
    const upperBoundData = Array.from({ length: years }, (_, i) => {
      const baseSpending = 60000;
      return baseSpending * Math.pow(1.03, i) * 1.2; // 20% buffer above base
    });

    const lowerBoundData = Array.from({ length: years }, (_, i) => {
      const baseSpending = 60000;
      return baseSpending * Math.pow(1.03, i) * 0.8; // 20% buffer below base
    });

    const targetPathData = Array.from({ length: years }, (_, i) => {
      return 60000 * Math.pow(1.03, i);
    });

    return {
      color: ['#10b981', '#3b82f6', '#ef4444'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          let result = params[0].axisValueLabel + '<br/>';
          params.forEach((p: any) => {
            result += `${p.marker} ${p.seriesName}: R$ ${(p.value / 1e3).toFixed(0)}K<br/>`;
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
          formatter: (value: number) => `R$ ${(value / 1e3).toFixed(0)}K`,
          fontSize: 12,
        },
        splitLine: { lineStyle: { color: '#2d3748' } },
      },
      series: [
        {
          name: 'Upper Guardrail',
          type: 'line',
          data: upperBoundData,
          smooth: true,
          lineStyle: { width: 2, type: 'dashed' },
          symbolSize: 0,
        },
        {
          name: 'Safe Spending Path',
          type: 'line',
          data: targetPathData,
          smooth: true,
          fill: true,
          areaStyle: { opacity: 0.2 },
          lineStyle: { width: 3 },
          symbolSize: 0,
        },
        {
          name: 'Lower Guardrail',
          type: 'line',
          data: lowerBoundData,
          smooth: true,
          lineStyle: { width: 2, type: 'dashed' },
          symbolSize: 0,
        },
      ],
    };
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Safe Spending Guardrails</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 400 }} />
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
