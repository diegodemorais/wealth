'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { EC, EC_AXIS_LINE, EC_SPLIT_LINE } from '@/utils/echarts-theme';
import { fmtPrivacy } from '@/utils/privacyTransform';

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

    // ── DOWNSAMPLING: 226 monthly → ~20 annual pre-FIRE + keep post-FIRE annual ──
    // This ensures proportional x-axis space (prevent 226 vs 36 squeeze)
    const downsampledDates: string[] = [];
    const downsampledRealizado: (number | null)[] = [];
    const downsampledP10: number[] = [];
    const downsampledP50: number[] = [];
    const downsampledP90: number[] = [];

    // Find which year contains the transition from historical to projected
    const transitionYear = nHistorico < rawDates.length ? rawDates[nHistorico].slice(0, 4) : null;

    let currentYear: string | null = null;
    for (let i = 0; i < rawDates.length; i++) {
      const year = rawDates[i].slice(0, 4);
      if (year !== currentYear) {
        downsampledDates.push(rawDates[i]);
        downsampledRealizado.push(realizadoBrl[i]);
        // For transition year, use projected values (at nHistorico) instead of model's historical
        if (year === transitionYear && i < nHistorico) {
          downsampledP10.push(trilhaP10[nHistorico]);
          downsampledP50.push(trilhaBrl[nHistorico]);
          downsampledP90.push(trilhaP90[nHistorico]);
        } else {
          downsampledP10.push(trilhaP10[i]);
          downsampledP50.push(trilhaBrl[i]);
          downsampledP90.push(trilhaP90[i]);
        }
        currentYear = year;
      }
    }

    // P10/P90 only for future dates (nulls in historical range)
    // Transition year (contains both historical and projected) gets the projection value
    const p10Data = downsampledP10.map((v, i) => {
      const year = downsampledDates[i].slice(0, 4);
      const lastIdxOfYear = rawDates.reduce((acc, d, j) => d.startsWith(year) ? j : acc, -1);
      return lastIdxOfYear >= nHistorico ? v : null;
    });
    const p90Data = downsampledP90.map((v, i) => {
      const year = downsampledDates[i].slice(0, 4);
      const lastIdxOfYear = rawDates.reduce((acc, d, j) => d.startsWith(year) ? j : acc, -1);
      return lastIdxOfYear >= nHistorico ? v : null;
    });

    // Band fill series: floor = P10, gap = P90-P10 (stacked)
    const bandGap = p10Data.map((p10, i) => {
      const p90 = p90Data[i];
      return p10 != null && p90 != null ? p90 - p10 : null;
    });

    const metaLine = downsampledDates.map(() => metaFireBrl);
    const fmt = (v: number) => privacyMode ? '••••' : `R$${(v / 1e6).toFixed(2)}M`;

    // Find P50 × Meta crossover point
    let crossoverIdx: number | null = null;
    for (let i = 1; i < downsampledP50.length; i++) {
      if (downsampledP50[i] >= metaFireBrl && downsampledP50[i - 1] < metaFireBrl) {
        crossoverIdx = i;
        break;
      }
    }
    const crossoverYear = crossoverIdx != null ? downsampledDates[crossoverIdx]?.slice(0, 4) : null;

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
        data: downsampledDates,
        axisLine: EC_AXIS_LINE,
        axisTick: { show: false },
        axisLabel: {
          color: privacyMode ? 'transparent' : EC.muted,
          fontSize: 10,
          interval: 0,
          formatter: (val: string) => val.slice(0, 4),
          hideOverlap: false,
        },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: {
          color: privacyMode ? 'transparent' : EC.muted,
          formatter: (v: number) => `R$${(v / 1e6).toFixed(1)}M`,
          fontSize: 11,
        },
        splitLine: EC_SPLIT_LINE,
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
          data: downsampledP50,
          smooth: true,
          itemStyle: { color: EC.green },
          lineStyle: { width: 2, color: EC.green, type: 'dashed' as const },
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
          data: downsampledRealizado,
          smooth: true,
          itemStyle: { color: EC.accent },
          lineStyle: { width: 2.5, color: EC.accent },
          symbolSize: 0,
          areaStyle: { opacity: 0.06, color: EC.accent },
          z: 10,
        },
        {
          name: 'Meta FIRE',
          type: 'line' as const,
          data: metaLine,
          smooth: false,
          itemStyle: { color: EC.yellow },
          lineStyle: { width: 1.5, color: EC.yellow, type: 'dotted' as const },
          symbolSize: 0,
          markPoint: crossoverIdx != null ? {
            symbol: 'circle',
            symbolSize: 10,
            data: [{
              coord: [downsampledDates[crossoverIdx!], metaFireBrl],
              itemStyle: { color: EC.yellow, borderColor: '#fff', borderWidth: 2 },
              label: {
                show: !privacyMode,
                formatter: `P50 cruza meta\nem ${crossoverYear}`,
                position: 'top',
                fontSize: 10,
                fontWeight: 'bold' as const,
                color: EC.yellow,
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: [4, 8],
                borderRadius: 4,
              },
            }],
          } : undefined,
        },
      ],
    };
  }, [data, privacyMode, theme]);

  return (
    <EChart ref={chartRef} option={option} style={{ height: 380, width: '100%' }} />
  );
}
