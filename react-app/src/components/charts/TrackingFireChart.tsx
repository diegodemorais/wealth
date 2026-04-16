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

    // Format dates: '2021-04' → 'abr/21'
    const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const xDates = rawDates.map((ym: string) => {
      const [y, m] = ym.split('-');
      return MONTHS_PT[parseInt(m, 10) - 1] + '/' + y.slice(2);
    });

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
          let html = `<div style="padding:8px"><strong>${params[0]?.axisValueLabel}</strong><br/>`;
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
        top: 10,
      },
      grid: { left: 70, right: 30, top: 50, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: xDates,
        axisLine: { lineStyle: { color: '#1c2128' } },
        axisLabel: {
          color: privacyMode ? 'transparent' : '#94a3b8',
          fontSize: 11,
          interval: Math.floor(xDates.length / 10),
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
    <div className="bg-card border border-border rounded-md p-4 mb-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Tracking FIRE — Realizado vs Projeção P50
      </h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 350, width: '100%' }} />
    </div>
  );
}
