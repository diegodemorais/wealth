'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';

export interface AttributionChartProps {
  data: DashboardData;
}

export function AttributionChart({ data }: AttributionChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const categories = ['Equity Selection', 'Allocation', 'Market Return', 'Currency', 'Costs'];
    const attributionData = [2.5, 1.2, 4.8, -0.3, -0.6];
    const colors = attributionData.map(v => v >= 0 ? '#10b981' : '#ef4444');

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const p = params[0];
          return `${p.name}<br/>${p.marker} Attribution: ${p.value.toFixed(2)}%`;
        },
        axisPointer: { type: 'shadow' },
      },
      legend: {
        display: !privacyMode,
        textStyle: { color: theme.textStyle.color },
        top: 10,
      },
      grid: {
        left: 120,
        right: 20,
        top: 40,
        bottom: 40,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          color: privacyMode ? 'transparent' : '#9ca3af',
          formatter: '{value}%',
          fontSize: 12,
        },
        splitLine: { lineStyle: { color: '#2d3748' } },
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          color: privacyMode ? 'transparent' : '#9ca3af',
          fontSize: 12,
        },
        axisLine: { lineStyle: { color: '#374151' } },
      },
      series: [
        {
          name: 'Attribution (%)',
          type: 'bar',
          data: attributionData.map((value, idx) => ({
            value,
            itemStyle: { color: colors[idx] },
          })),
          itemStyle: { borderRadius: [0, 4, 4, 0] },
        },
      ],
    };
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Return Attribution Breakdown</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 300 }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
