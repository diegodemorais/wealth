'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';

export interface InformationRatioChartProps {
  data: DashboardData;
}

export function InformationRatioChart({ data }: InformationRatioChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const months = 36;
    const xAxisData = Array.from({ length: months }, (_, i) => `M${i + 1}`);
    const irData = Array.from({ length: months }, (_, i) =>
      0.8 + 0.3 * Math.sin(i * 0.15) + (Math.random() - 0.5) * 0.2
    );

    return {
      color: ['#06b6d4'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const p = params[0];
          return `${p.axisValueLabel}<br/>${p.marker} IR: ${p.value.toFixed(2)}`;
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
          interval: 5, // Show every 6 months
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
          name: 'Information Ratio',
          type: 'line',
          data: irData,
          smooth: true,
          lineStyle: { width: 2 },
          symbolSize: 0,
        },
      ],
    };
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Information Ratio (36 months)</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 300 }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
