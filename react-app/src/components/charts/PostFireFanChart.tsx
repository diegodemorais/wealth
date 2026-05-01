'use client';
import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { EC, EC_AXIS_LABEL, EC_AXIS_LINE, EC_SPLIT_LINE, EC_TOOLTIP } from '@/utils/echarts-theme';
import type { DashboardData } from '@/types/dashboard';

interface Props { data: DashboardData }

export function PostFireFanChart({ data }: Props) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const { option, fireNumber, latestP50 } = useMemo(() => {
    const ft = (data as any)?.fire_trilha ?? {};
    const ftDates: string[] = ft.dates ?? [];
    const ftBrl: number[] = ft.trilha_brl ?? [];

    const trilhaDatas: number[] = (data as any)?.trilha_datas ?? [];
    const p10: number[] = (data as any)?.trilha_p10 ?? [];
    const p50: number[] = (data as any)?.trilha_p50 ?? [];
    const p90: number[] = (data as any)?.trilha_p90 ?? [];

    const prem = (data as any)?.premissas ?? {};
    const custo: number = prem.custo_vida_base ?? 250_000;
    const swr: number = prem.swr_gatilho ?? 0.03;
    const fireNumber = swr > 0 ? custo / swr : 8_333_333;

    // Reduce fire_trilha to annual (last value per year)
    const preFireByYear: Record<number, number> = {};
    ftDates.forEach((d, i) => {
      const yr = parseInt(d.substring(0, 4));
      preFireByYear[yr] = ftBrl[i];
    });

    const postFireMap10: Record<number, number> = {};
    const postFireMap50: Record<number, number> = {};
    const postFireMap90: Record<number, number> = {};
    trilhaDatas.forEach((yr, i) => {
      postFireMap10[yr] = p10[i];
      postFireMap50[yr] = p50[i];
      postFireMap90[yr] = p90[i];
    });

    const preFireYears = Array.from(new Set(ftDates.map(d => parseInt(d.substring(0, 4))))).sort();
    const allYearsSet = new Set([...preFireYears, ...trilhaDatas]);
    const allYears = Array.from(allYearsSet).sort((a, b) => a - b);
    const xData = allYears.map(String);

    const preFireData = allYears.map(yr => preFireByYear[yr] ?? null);
    const p50Data = allYears.map(yr => postFireMap50[yr] ?? null);
    const p10Data = allYears.map(yr => postFireMap10[yr] ?? null);
    const bandData = allYears.map(yr => {
      const v10 = postFireMap10[yr];
      const v90 = postFireMap90[yr];
      return v10 != null && v90 != null ? v90 - v10 : null;
    });

    const fmtM = (v: number) => privacyMode ? '••M' : `R$${(v / 1e6).toFixed(1)}M`;
    const latestP50 = p50.length > 0 ? p50[0] : null;

    const chartOption = {
      tooltip: {
        ...EC_TOOLTIP,
        trigger: 'axis',
        formatter: (params: any[]) => {
          const ps = Array.isArray(params) ? params : [params];
          const yr = ps[0]?.axisValue ?? '';
          const visible = ps.filter((p: any) => p.value != null && p.seriesName && !p.seriesName.startsWith('_'));
          const lines = visible.map((p: any) => `${p.marker}${p.seriesName}: ${privacyMode ? '••' : `R$${(p.value / 1e6).toFixed(1)}M`}`);
          return `<b>${yr}</b><br/>${lines.join('<br/>')}`;
        },
      },
      legend: {
        data: ['Trajetória real/projetada', 'P50 pós-FIRE', 'Banda P10–P90'],
        textStyle: { color: EC.muted, fontSize: 10 },
        bottom: 0,
      },
      grid: { left: 64, right: 24, top: 28, bottom: 52 },
      xAxis: {
        type: 'category',
        data: xData,
        axisLabel: { ...EC_AXIS_LABEL, interval: 4 },
        axisLine: EC_AXIS_LINE,
      },
      yAxis: {
        type: 'value',
        axisLabel: { ...EC_AXIS_LABEL, formatter: (v: number) => fmtM(v) },
        splitLine: EC_SPLIT_LINE,
      },
      series: [
        // Band bottom (P10) — transparent fill, invisible line; stacked to form band base
        {
          name: '_band-base',
          type: 'line',
          data: p10Data,
          lineStyle: { opacity: 0 },
          areaStyle: { color: 'transparent', opacity: 0 },
          symbol: 'none',
          stack: 'fan',
          tooltip: { show: false },
          legendHoverLink: false,
        },
        // Band height (P90 - P10) stacked on top, visible fill = band
        {
          name: 'Banda P10–P90',
          type: 'line',
          data: bandData,
          lineStyle: { opacity: 0 },
          areaStyle: { color: EC.muted, opacity: 0.18 },
          symbol: 'none',
          stack: 'fan',
          tooltip: { show: false },
        },
        // P50 median line
        {
          name: 'P50 pós-FIRE',
          type: 'line',
          data: p50Data,
          lineStyle: { color: EC.accent, width: 2 },
          itemStyle: { color: EC.accent },
          symbol: 'none',
          markLine: {
            silent: true,
            symbol: ['none', 'none'],
            data: [
              {
                xAxis: '2040',
                lineStyle: { color: EC.yellow, type: 'dashed', width: 1 },
                label: { formatter: 'FIRE Day', color: EC.yellow, fontSize: 10, position: 'insideEndTop' },
              },
              {
                yAxis: fireNumber,
                lineStyle: { color: EC.green, type: 'dotted', width: 1 },
                label: { formatter: 'FIRE #', color: EC.green, fontSize: 10, position: 'insideEndTop' },
              },
            ],
          },
        },
        // Pre-FIRE actual + projected trajectory
        {
          name: 'Trajetória real/projetada',
          type: 'line',
          data: preFireData,
          lineStyle: { color: EC.green, width: 2 },
          itemStyle: { color: EC.green },
          symbol: 'none',
        },
      ],
    };

    return { option: chartOption, fireNumber, latestP50 };
  }, [data, privacyMode, theme]);

  return (
    <div>
      <EChart
        ref={chartRef}
        option={option}
        style={{ height: 320 }}
        data-testid="fan-chart-container"
      />
      <span data-testid="fan-chart-p50" style={{ display: 'none' }}>
        {latestP50 != null ? (latestP50 / 1e6).toFixed(1) : 'N/A'}
      </span>
      <span data-testid="fan-chart-fire-day" style={{ display: 'none' }}>2040</span>
    </div>
  );
}
