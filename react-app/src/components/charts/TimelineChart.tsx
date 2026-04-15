'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { DashboardData } from '@/types/dashboard';

export interface TimelineChartProps {
  data: DashboardData;
}

export function TimelineChart({ data }: TimelineChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();

  const option = useMemo(() => {
    const months = 60;
    const xAxisData = Array.from({ length: months }, (_, i) => `M${i + 1}`);

    // Historical portfolio value with contributions
    const values = Array.from({ length: months }, (_, i) => {
      const baseValue = 500000;
      const monthlyReturn = 0.06 / 12;
      const monthlyContribution = 5000;
      return baseValue * Math.pow(1 + monthlyReturn, i) + monthlyContribution * i;
    });

    return {
      color: ['#3b82f6'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const p = params[0];
          return `${p.axisValueLabel}<br/>${p.marker} Portfolio Value: R$ ${p.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
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
          interval: 9, // Show every 10 months
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
          name: 'Portfolio Value',
          type: 'line',
          data: values,
          smooth: true,
          fill: true,
          areaStyle: { opacity: 0.2 },
          lineStyle: { width: 3 },
          symbolSize: 0,
        },
      ],
    };
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Historical Performance (60 months)</h3>
      <ReactECharts option={option} style={{ height: 400 }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
