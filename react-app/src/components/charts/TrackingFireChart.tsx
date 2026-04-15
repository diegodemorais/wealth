'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';

export interface TrackingFireChartProps {
  data: DashboardData;
}

export function TrackingFireChart({ data }: TrackingFireChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const months = 180; // 15 years to FIRE
    const xAxisData = Array.from({ length: months }, (_, i) => `M${i + 1}`);

    const fireTarget = 2500000;
    const currentNetworth = 1250000;

    // Actual trajectory
    const actualData = Array.from({ length: months }, (_, i) => {
      const monthlyReturn = 0.07 / 12;
      const monthlyContribution = 5000;
      return currentNetworth * Math.pow(1 + monthlyReturn, i) + monthlyContribution * i;
    });

    // Target trajectory (constant)
    const targetData = Array(months).fill(fireTarget);

    // Lower bound (75% confidence)
    const lowerBoundData = Array.from({ length: months }, (_, i) => {
      const monthlyReturn = 0.05 / 12;
      const monthlyContribution = 5000;
      return currentNetworth * Math.pow(1 + monthlyReturn, i) + monthlyContribution * i;
    });

    return {
      color: ['#3b82f6', '#f59e0b', '#ef4444'],
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
          interval: 29, // Show every 30 months
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
          name: 'Actual (Base Case)',
          type: 'line',
          data: actualData,
          smooth: true,
          fill: true,
          areaStyle: { opacity: 0.2 },
          lineStyle: { width: 3 },
          symbolSize: 0,
        },
        {
          name: 'FIRE Target',
          type: 'line',
          data: targetData,
          smooth: true,
          lineStyle: { width: 2, type: 'dashed' },
          symbolSize: 0,
        },
        {
          name: 'Lower Bound (75% confidence)',
          type: 'line',
          data: lowerBoundData,
          smooth: true,
          lineStyle: { width: 1 },
          symbolSize: 0,
        },
      ],
    };
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>FIRE Target Tracking (15-year projection)</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 400 }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
