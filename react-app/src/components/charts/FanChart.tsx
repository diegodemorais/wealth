'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { DashboardData } from '@/types/dashboard';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';

interface FanChartProps {
  data: DashboardData;
}

export function FanChart({ data }: FanChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();

  const option = useMemo(() => {
    const timeline = data.timeline || { values: [], labels: [] };
    const values = timeline.values || [];
    const labels = timeline.labels || [];

    if (values.length === 0) {
      return { title: { text: 'No projection data available' } };
    }

    // Create fan chart with base, optimistic, pessimistic scenarios
    const dates = labels.map((ym: string) => ym.replace('-', '/'));
    const baseValue = values[values.length - 1] || 0;
    
    // Simple projections: base + 5% p.a. (otimista), base + 3% p.a. (base), base + 0% p.a. (pessimista)
    const years = 10;
    const months = dates.length + years * 12;
    
    const baselineProj = Array.from({ length: years * 12 }, (_, i) => {
      const monthsOut = i + 1;
      return baseValue * Math.pow(1 + 0.03 / 12, monthsOut);
    });

    const optimisticProj = Array.from({ length: years * 12 }, (_, i) => {
      const monthsOut = i + 1;
      return baseValue * Math.pow(1 + 0.05 / 12, monthsOut);
    });

    const pessimisticProj = Array.from({ length: years * 12 }, (_, i) => {
      const monthsOut = i + 1;
      return baseValue * Math.pow(1 + 0.00 / 12, monthsOut);
    });

    const forecastDates = Array.from({ length: years * 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() + i + 1);
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    });

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          let html = `<div style="padding: 8px;">`;
          params.forEach((p: any) => {
            html += `<div>${p.seriesName}: <strong>R$ ${(p.value / 1e6).toFixed(1)}M</strong></div>`;
          });
          html += `</div>`;
          return html;
        },
      },
      legend: {
        data: ['Histórico', 'Pessimista (0%)', 'Base (3% a.a.)', 'Otimista (5% a.a.)'],
        textStyle: { color: '#d1d5db' },
      },
      grid: { left: 60, right: 40, top: 40, bottom: 40 },
      xAxis: {
        type: 'category',
        data: [...dates.slice(-24), ...forecastDates.slice(0, 48)],
        axisLabel: { interval: 12, formatter: (v: string) => v },
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: (v: number) => `R$ ${(v / 1e6).toFixed(0)}M` },
      },
      series: [
        {
          name: 'Histórico',
          type: 'line',
          data: [...values.slice(-24), ...baselineProj.slice(0, 48)],
          itemStyle: { color: '#f59e0b' },
          lineStyle: { width: 2.5 },
          smooth: true,
        },
        {
          name: 'Pessimista (0%)',
          type: 'line',
          data: Array(dates.slice(-24).length).fill(null).concat(pessimisticProj.slice(0, 48)),
          itemStyle: { color: '#ef4444' },
          lineStyle: { width: 1.5, type: 'dashed' },
          smooth: true,
        },
        {
          name: 'Base (3% a.a.)',
          type: 'line',
          data: Array(dates.slice(-24).length).fill(null).concat(baselineProj.slice(0, 48)),
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 1.5, type: 'dashed' },
          smooth: true,
        },
        {
          name: 'Otimista (5% a.a.)',
          type: 'line',
          data: Array(dates.slice(-24).length).fill(null).concat(optimisticProj.slice(0, 48)),
          itemStyle: { color: '#3b82f6' },
          lineStyle: { width: 1.5, type: 'dashed' },
          smooth: true,
        },
      ],
    };
  }, [data]);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ReactECharts option={option} theme={theme} />
    </div>
  );
}
