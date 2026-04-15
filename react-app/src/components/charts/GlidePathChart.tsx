'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { DashboardData } from '@/types/dashboard';

export interface GlidePathChartProps {
  data: DashboardData;
}

export function GlidePathChart({ data }: GlidePathChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();

  const option = useMemo(() => {
    // Glide path: equity allocation decreases with age
    const ages = Array.from({ length: 46 }, (_, i) => 35 + i);
    const retirementAge = 50;

    const equityAlloc = ages.map(age => {
      if (age >= retirementAge) return 30;
      const yearsToRetire = retirementAge - age;
      return Math.max(30, 100 - yearsToRetire * 1.5);
    });

    const fixedIncomeAlloc = equityAlloc.map(eq => 100 - eq);

    return {
      color: ['#3b82f6', '#f59e0b'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          let result = `Age ${params[0].axisValueLabel}<br/>`;
          params.forEach((p: any) => {
            result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(1)}%<br/>`;
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
        data: ages.map(a => a.toString()),
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: {
          color: privacyMode ? 'transparent' : '#9ca3af',
          fontSize: 12,
          interval: 4, // Show every 5 years
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          color: privacyMode ? 'transparent' : '#9ca3af',
          formatter: '{value}%',
          fontSize: 12,
        },
        splitLine: { lineStyle: { color: '#2d3748' } },
      },
      series: [
        {
          name: 'Target Equity %',
          type: 'line',
          data: equityAlloc,
          smooth: true,
          fill: true,
          areaStyle: { opacity: 0.3 },
          lineStyle: { width: 3 },
          symbolSize: 0,
        },
        {
          name: 'Fixed Income %',
          type: 'line',
          data: fixedIncomeAlloc,
          smooth: true,
          fill: true,
          areaStyle: { opacity: 0.3 },
          lineStyle: { width: 3 },
          symbolSize: 0,
        },
      ],
    };
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Glide Path: Target Allocation by Age</h3>
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
