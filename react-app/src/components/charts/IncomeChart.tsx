'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';

export interface IncomeChartProps {
  data: DashboardData;
}

export function IncomeChart({ data }: IncomeChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const categories = ['Salary', 'Dividends', 'Bond Coupons', 'Rental', 'Other'];
    const amountsData = [120000, 35000, 18000, 24000, 3000];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const p = params[0];
          return `${p.name}<br/>${p.marker} R$ ${p.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
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
          formatter: (value: number) => `R$ ${(value / 1e3).toFixed(0)}K`,
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
          name: 'Annual Income',
          type: 'bar',
          data: amountsData.map((value, idx) => ({
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
      <h3 style={styles.title}>Current Income Sources</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 300 }} />
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
