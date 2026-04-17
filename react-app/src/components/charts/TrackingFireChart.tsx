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
    // Use real fire_trilha data from data.json
    const ft = (data as any)?.fire_trilha ?? {};
    const rawDates: string[] = ft.dates ?? [];
    const realizadoBrl: (number | null)[] = ft.realizado_brl ?? [];
    const trilhaBrl: number[] = ft.trilha_brl ?? [];
    const metaFireBrl: number = ft.meta_fire_brl ?? 8333333;

    if (rawDates.length === 0) {
      return { title: { text: 'Sem dados de trilha FIRE', textStyle: { color: '#94a3b8' } } };
    }

    // Keep raw 'YYYY-MM' for x-axis; display only year labels

    // Meta horizontal line
    const metaLine = rawDates.map(() => metaFireBrl);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
          const rawYm: string = params[0]?.axisValue ?? '';
          const [y, m] = rawYm.split('-');
          const label = m ? MONTHS_PT[parseInt(m, 10) - 1] + '/' + y.slice(2) : rawYm;
          let html = `<div style="padding:8px"><strong>${label}</strong><br/>`;
          params.forEach((p: any) => {
            if (p.value != null) {
              const val = privacyMode ? '••••' : `R$${(p.value / 1e6).toFixed(2)}M`;
              html += `${p.marker} ${p.seriesName}: <strong>${val}</strong><br/>`;
            }
          });
          html += '</div>';
          return html;
        },
      },
      legend: {
        data: ['Realizado', 'Projeção P50', 'Meta FIRE'],
        textStyle: { color: theme.textStyle.color },
        top: 8,
        itemWidth: 14,
        itemHeight: 8,
      },
      grid: { left: 70, right: 20, top: 44, bottom: 30, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: rawDates,
        axisLine: { lineStyle: { color: '#1c2128' } },
        axisTick: { show: false },
        axisLabel: {
          color: privacyMode ? 'transparent' : '#94a3b8',
          fontSize: 10,
          // Show only year labels (one per year — Jan, or first data point)
          interval: (idx: number, val: string) => idx === 0 || val.endsWith('-01'),
          formatter: (val: string) => val.slice(0, 4),
          hideOverlap: true,
        },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: {
          color: privacyMode ? 'transparent' : '#94a3b8',
          formatter: (v: number) => `R$${(v / 1e6).toFixed(1)}M`,
          fontSize: 11,
        },
        splitLine: { lineStyle: { color: '#161b22' } },
      },
      series: [
        {
          name: 'Realizado',
          type: 'line' as const,
          data: realizadoBrl,
          smooth: true,
          itemStyle: { color: '#58a6ff' },
          lineStyle: { width: 2.5, color: '#58a6ff' },
          symbolSize: 0,
          areaStyle: { opacity: 0.05, color: '#58a6ff' },
        },
        {
          name: 'Projeção P50',
          type: 'line' as const,
          data: trilhaBrl,
          smooth: true,
          itemStyle: { color: '#3ed381' },
          lineStyle: { width: 2, color: '#3ed381', type: 'dashed' as const },
          symbolSize: 0,
          areaStyle: { opacity: 0.07, color: '#3ed381' },
        },
        {
          name: 'Meta FIRE',
          type: 'line' as const,
          data: metaLine,
          smooth: false,
          itemStyle: { color: '#f59e0b' },
          lineStyle: { width: 1.5, color: '#f59e0b', type: 'dotted' as const },
          symbolSize: 0,
        },
      ],
    };
  }, [data, privacyMode, theme]);

  return (
    <ReactECharts ref={chartRef} option={option} style={{ height: 350, width: '100%' }} />
  );
}
