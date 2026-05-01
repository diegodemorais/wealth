'use client';
import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { EC, EC_AXIS_LABEL, EC_AXIS_LINE, EC_SPLIT_LINE, EC_TOOLTIP } from '@/utils/echarts-theme';
import type { DashboardData } from '@/types/dashboard';

interface Props { data: DashboardData }

interface Phase {
  gasto_lifestyle: number;
  gasto_saude_mid: number;
  gasto_total_mid: number;
  inicio: number;
  fim: number;
}

function getPhase(yearOffset: number, go_go: Phase, slow_go: Phase, no_go: Phase): Phase {
  if (yearOffset < go_go.fim) return go_go;
  if (yearOffset < slow_go.fim) return slow_go;
  return no_go;
}

export function SpendingTimelineChart({ data }: Props) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const { option, totalGoGo, totalNoGo } = useMemo(() => {
    const sm = (data as any)?.spending_smile ?? {};
    const prem = (data as any)?.premissas ?? {};

    const go_go: Phase = sm.go_go ?? { gasto_lifestyle: 242_000, gasto_saude_mid: 30_535, gasto_total_mid: 272_535, inicio: 0, fim: 15 };
    const slow_go: Phase = sm.slow_go ?? { gasto_lifestyle: 200_000, gasto_saude_mid: 51_156, gasto_total_mid: 251_156, inicio: 15, fim: 30 };
    const no_go: Phase = sm.no_go ?? { gasto_lifestyle: 187_000, gasto_saude_mid: 67_363, gasto_total_mid: 254_363, inicio: 30, fim: 99 };

    const idadeAtual: number = prem.idade_atual ?? 39;
    const horizonte: number = prem.horizonte_vida ?? 90;
    const FIRE_YEAR = 2040;
    const idadeFire = idadeAtual + (FIRE_YEAR - 2026);
    const anosPosFire = Math.max(horizonte - idadeFire, 20);

    const anos: string[] = [];
    const lifestyle: number[] = [];
    const saude: number[] = [];

    for (let i = 0; i <= anosPosFire; i++) {
      const yr = FIRE_YEAR + i;
      const phase = getPhase(i, go_go, slow_go, no_go);
      anos.push(String(yr));
      lifestyle.push(phase.gasto_lifestyle);
      saude.push(phase.gasto_saude_mid);
    }

    const fmtK = (v: number) => privacyMode ? '••' : `R$${Math.round(v / 1000)}k`;

    // Phase boundary mark lines
    const goGoEnd = String(FIRE_YEAR + go_go.fim);
    const slowGoEnd = String(FIRE_YEAR + slow_go.fim);

    const chartOption = {
      tooltip: {
        ...EC_TOOLTIP,
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any[]) => {
          const ps = Array.isArray(params) ? params : [params];
          const yr = ps[0]?.axisValue ?? '';
          const lf = ps.find((p: any) => p.seriesName === 'Lifestyle')?.value ?? 0;
          const sd = ps.find((p: any) => p.seriesName === 'Saúde')?.value ?? 0;
          const total = lf + sd;
          return `<b>${yr}</b><br/>
${privacyMode ? '••' : `Lifestyle: R$${Math.round(lf / 1000)}k`}<br/>
${privacyMode ? '••' : `Saúde: R$${Math.round(sd / 1000)}k`}<br/>
<b>${privacyMode ? '••' : `Total: R$${Math.round(total / 1000)}k/ano`}</b>`;
        },
      },
      legend: {
        data: ['Lifestyle', 'Saúde'],
        textStyle: { color: EC.muted, fontSize: 10 },
        bottom: 0,
      },
      grid: { left: 60, right: 24, top: 28, bottom: 52 },
      xAxis: {
        type: 'category',
        data: anos,
        axisLabel: { ...EC_AXIS_LABEL, interval: 4 },
        axisLine: EC_AXIS_LINE,
      },
      yAxis: {
        type: 'value',
        axisLabel: { ...EC_AXIS_LABEL, formatter: (v: number) => fmtK(v) },
        splitLine: EC_SPLIT_LINE,
      },
      series: [
        {
          name: 'Lifestyle',
          type: 'bar',
          stack: 'spending',
          data: lifestyle,
          itemStyle: { color: EC.accent },
          markLine: {
            silent: true,
            symbol: ['none', 'none'],
            data: [
              {
                xAxis: goGoEnd,
                lineStyle: { color: EC.muted, type: 'dashed', width: 1 },
                label: { formatter: 'Slow-Go', color: EC.muted, fontSize: 9, position: 'insideEndTop' },
              },
              {
                xAxis: slowGoEnd,
                lineStyle: { color: EC.muted, type: 'dashed', width: 1 },
                label: { formatter: 'No-Go', color: EC.muted, fontSize: 9, position: 'insideEndTop' },
              },
            ],
          },
        },
        {
          name: 'Saúde',
          type: 'bar',
          stack: 'spending',
          data: saude,
          itemStyle: { color: EC.red },
        },
      ],
    };

    return { option: chartOption, totalGoGo: go_go.gasto_total_mid, totalNoGo: no_go.gasto_total_mid };
  }, [data, privacyMode, theme]);

  return (
    <div>
      <EChart
        ref={chartRef}
        option={option}
        style={{ height: 280 }}
        data-testid="spending-timeline-chart"
      />
      <span data-testid="spending-gogo-total" style={{ display: 'none' }}>
        {Math.round(totalGoGo / 1000)}k
      </span>
      <span data-testid="spending-nogo-total" style={{ display: 'none' }}>
        {Math.round(totalNoGo / 1000)}k
      </span>
    </div>
  );
}
