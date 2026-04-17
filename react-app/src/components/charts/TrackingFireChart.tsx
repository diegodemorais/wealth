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
    const ft = (data as any)?.fire_trilha ?? {};
    const rawDates: string[] = ft.dates ?? [];
    const realizadoBrl: (number | null)[] = ft.realizado_brl ?? [];
    const trilhaBrl: number[] = ft.trilha_brl ?? [];
    const trilhaP10: number[] = ft.trilha_p10_brl ?? [];
    const trilhaP90: number[] = ft.trilha_p90_brl ?? [];
    const metaFireBrl: number = ft.meta_fire_brl ?? 8333333;
    const nHistorico: number = ft.n_historico ?? 0;

    if (rawDates.length === 0) {
      return { title: { text: 'Sem dados de trilha FIRE', textStyle: { color: '#94a3b8' } } };
    }

    // P10/P90 only for future dates (nulls in historical range)
    const p10Data = trilhaP10.map((v, i) => (i >= nHistorico ? v : null));
    const p90Data = trilhaP90.map((v, i) => (i >= nHistorico ? v : null));

    // Band fill series: floor = P10, gap = P90-P10 (stacked)
    const bandGap = p10Data.map((p10, i) => {
      const p90 = p90Data[i];
      return p10 != null && p90 != null ? p90 - p10 : null;
    });

    const metaLine = rawDates.map(() => metaFireBrl);
    const fmt = (v: number) => privacyMode ? '••••' : `R$${(v / 1e6).toFixed(2)}M`;

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
          let html = `<div style="padding:8px 10px"><strong>${label}</strong><br/>`;
          const hidden = new Set(['_p10floor', '_bandgap']);
          params.forEach((p: any) => {
            if (hidden.has(p.seriesName)) return;
            if (p.value != null) {
              html += `${p.marker} ${p.seriesName}: <strong>${fmt(p.value)}</strong><br/>`;
            }
          });
          html += '</div>';
          return html;
        },
      },
      legend: {
        data: ['Realizado', 'P10', 'P50', 'P90', 'Meta FIRE'],
        textStyle: { color: theme.textStyle.color, fontSize: 11 },
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
        // ── Band fill (invisible helper series, stacked) ─────────────────
        {
          name: '_p10floor',
          type: 'line' as const,
          data: p10Data,
          lineStyle: { opacity: 0 },
          areaStyle: { color: 'transparent', opacity: 0 },
          symbolSize: 0,
          stack: 'band',
          silent: true,
        },
        {
          name: '_bandgap',
          type: 'line' as const,
          data: bandGap,
          lineStyle: { opacity: 0 },
          areaStyle: { color: 'rgba(62,211,129,0.10)' },
          symbolSize: 0,
          stack: 'band',
          silent: true,
        },
        // ── Visible lines ────────────────────────────────────────────────
        {
          name: 'P10',
          type: 'line' as const,
          data: p10Data,
          smooth: true,
          itemStyle: { color: 'rgba(62,211,129,0.5)' },
          lineStyle: { width: 1, color: 'rgba(62,211,129,0.5)', type: 'dashed' as const },
          symbolSize: 0,
        },
        {
          name: 'P50',
          type: 'line' as const,
          data: trilhaBrl,
          smooth: true,
          itemStyle: { color: '#3ed381' },
          lineStyle: { width: 2, color: '#3ed381', type: 'dashed' as const },
          symbolSize: 0,
        },
        {
          name: 'P90',
          type: 'line' as const,
          data: p90Data,
          smooth: true,
          itemStyle: { color: 'rgba(62,211,129,0.5)' },
          lineStyle: { width: 1, color: 'rgba(62,211,129,0.5)', type: 'dashed' as const },
          symbolSize: 0,
        },
        {
          name: 'Realizado',
          type: 'line' as const,
          data: realizadoBrl,
          smooth: true,
          itemStyle: { color: '#58a6ff' },
          lineStyle: { width: 2.5, color: '#58a6ff' },
          symbolSize: 0,
          areaStyle: { opacity: 0.06, color: '#58a6ff' },
          z: 10,
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
    <ReactECharts ref={chartRef} option={option} style={{ height: 380, width: '100%' }} />
  );
}
