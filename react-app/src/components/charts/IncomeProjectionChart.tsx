'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';

export interface IncomeProjectionChartProps {
  data: DashboardData;
}

export function IncomeProjectionChart({ data }: IncomeProjectionChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const years = 30;
    const xAxisData = Array.from({ length: years }, (_, i) => `Y${i + 1}`);

    // Salary phase-out, dividend/bond growth
    const salaryIncomeData = Array.from({ length: years }, (_, i) => {
      if (i < 15) return 120000 * Math.pow(1.025, i); // Growth phase
      return 120000 * Math.pow(1.025, 15) * Math.pow(0.95, i - 15); // Retirement: 95% decline per year
    });

    const portfolioIncomeData = Array.from({ length: years }, (_, i) => {
      return (35000 + 18000 + 24000) * Math.pow(1.04, i); // 4% annual growth
    });

    const totalIncomeData = salaryIncomeData.map((s, i) => s + portfolioIncomeData[i]);

    // Upper bound (optimistic: +20%)
    const upperBoundData = totalIncomeData.map(x => x * 1.2);
    // Lower bound (conservative: -20%)
    const lowerBoundData = totalIncomeData.map(x => x * 0.8);

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
          name: 'Upper Projection (+20%)',
          type: 'line',
          data: upperBoundData,
          smooth: true,
          lineStyle: { width: 1, type: 'dashed' },
          symbolSize: 0,
        },
        {
          name: 'Total Income Projection',
          type: 'line',
          data: totalIncomeData,
          smooth: true,
          fill: true,
          areaStyle: { opacity: 0.2 },
          lineStyle: { width: 3 },
          symbolSize: 0,
        },
        {
          name: 'Lower Projection (-20%)',
          type: 'line',
          data: lowerBoundData,
          smooth: true,
          lineStyle: { width: 1, type: 'dashed' },
          symbolSize: 0,
        },
      ],
    };
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Income Projection (30 Years)</h3>
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
