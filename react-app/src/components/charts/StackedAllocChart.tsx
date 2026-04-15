'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useUiStore } from '@/store/uiStore';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { DashboardData } from '@/types/dashboard';

export interface StackedAllocChartProps {
  data: DashboardData;
}

export function StackedAllocChart({ data }: StackedAllocChartProps) {
  
  const { privacyMode, theme } = useEChartsPrivacy();

  const option = useMemo(() => {
    // Historical allocation over 24 months
    const months = 24;
    const xAxisData = Array.from({ length: months }, (_, i) => `M${i + 1}`);

    const swrdData = Array.from({ length: months }, (_, i) => 1200000 + i * 5000);
    const avgsData = Array.from({ length: months }, (_, i) => 600000 + i * 2500);
    const ipcaData = Array.from({ length: months }, (_, i) => 450000 + i * 3000);
    const cryptoData = Array.from({ length: months }, (_, i) => 120000 + i * 500);

    return {
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          if (privacyMode) return '••••';
          let result = params[0].axisValueLabel + '<br/>';
          params.forEach((p: any) => {
            result += `${p.marker} ${p.seriesName}: R$ ${p.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}<br/>`;
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
          name: 'SWRD',
          type: 'line',
          data: swrdData,
          smooth: true,
          fill: true,
          areaStyle: { opacity: 0.2 },
          lineStyle: { width: 2 },
          symbolSize: 0,
        },
        {
          name: 'AVGS',
          type: 'line',
          data: avgsData,
          smooth: true,
          fill: true,
          areaStyle: { opacity: 0.2 },
          lineStyle: { width: 2 },
          symbolSize: 0,
        },
        {
          name: 'IPCA+',
          type: 'line',
          data: ipcaData,
          smooth: true,
          fill: true,
          areaStyle: { opacity: 0.2 },
          lineStyle: { width: 2 },
          symbolSize: 0,
        },
        {
          name: 'Crypto',
          type: 'line',
          data: cryptoData,
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
      <h3 style={styles.title}>Historical Allocation (24 months)</h3>
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
