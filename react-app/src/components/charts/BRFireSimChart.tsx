'use client';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { EC, EC_AXIS_LINE, EC_SPLIT_LINE } from '@/utils/echarts-theme';
import { SWR_KEYS } from '@/app/backtest/brfiresim-constants';

interface CycleResult {
  sucesso: boolean;
  saldo_final: number;
  min_saldo: number;
}

interface Cycle {
  ano_inicio: number;
  duracao_anos: number;
  resultados_swr: Record<string, CycleResult>;
}

interface Props {
  cycles: Cycle[];
}

const SWR_LABELS: Record<string, string> = {
  '3pct': 'SWR 3% · Fat FIRE',
  '4pct': 'SWR 4% · FIRE',
  '6pct': 'SWR 6% · Lean FIRE',
  '8pct': 'SWR 8% · Barista FIRE',
};
const SWR_COLORS: Record<string, string> = {
  '3pct': EC.green,
  '4pct': EC.accent,
  '6pct': EC.yellow,
  '8pct': EC.red,
};

export function BRFireSimChart({ cycles }: Props) {
  const { theme, privacyMode } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    if (!cycles.length) return {};

    const anos = cycles.map(c => String(c.ano_inicio));

    const series = SWR_KEYS.map(key => ({
      name: SWR_LABELS[key],
      type: 'bar' as const,
      barGap: '10%',
      itemStyle: {
        color: (params: { dataIndex: number }) => {
          const cycle = cycles[params.dataIndex];
          const result = cycle?.resultados_swr?.[key];
          return result?.sucesso ? SWR_COLORS[key] : EC.red;
        },
        opacity: 0.85,
        borderRadius: [3, 3, 0, 0],
      },
      data: cycles.map(c => {
        const r = c.resultados_swr?.[key];
        if (!r) return 0;
        return r.sucesso ? Math.round(r.saldo_final / 1_000_000) : -1;
      }),
      markLine: undefined,
    }));

    // Failure indicator series — names prefixed with '_' so they're excluded from legend
    const failSeries = SWR_KEYS.map(key => ({
      name: `_fail_${key}`,
      type: 'bar' as const,
      stack: `fail_${key}`,
      barGap: '10%',
      silent: true,
      itemStyle: { color: EC.red, opacity: 0.6, borderRadius: [3, 3, 0, 0] },
      data: cycles.map(c => {
        const r = c.resultados_swr?.[key];
        return r && !r.sucesso ? 1 : 0;  // 1 = failed (height = 1M BRL visual indicator)
      }),
      tooltip: { show: false },
    }));

    return {
      backgroundColor: 'transparent',
      legend: {
        // Explicit itemStyle per entry so ECharts uses correct colors even with dynamic bar color fn
        data: SWR_KEYS.map(k => ({
          name: SWR_LABELS[k],
          itemStyle: { color: SWR_COLORS[k] },
        })),
        textStyle: { color: theme.tooltip.textStyle.color, fontSize: 11 },
        bottom: 0,
      },
      grid: { left: 60, right: 16, top: 20, bottom: 50 },
      xAxis: {
        type: 'category' as const,
        data: anos,
        axisLine: EC_AXIS_LINE,
        axisTick: { show: false },
        axisLabel: {
          color: theme.tooltip.textStyle.color,
          fontSize: 11,
          formatter: (v: string) => `Início ${v}`,
          rotate: 20,
        },
      },
      yAxis: {
        type: 'value' as const,
        name: 'Saldo final (R$ M)',
        nameTextStyle: { color: theme.tooltip.textStyle.color, fontSize: 10 },
        axisLine: EC_AXIS_LINE,
        splitLine: EC_SPLIT_LINE,
        axisLabel: {
          color: theme.tooltip.textStyle.color,
          fontSize: 10,
          formatter: (v: number) => v < 0 ? 'Falha' : `${v}M`,
        },
      },
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: CallbackDataParams[]) => {
          const ano = (params[0] as (CallbackDataParams & { axisValue?: string; axisValueLabel?: string }))?.axisValue;
          const cycle = cycles.find(c => String(c.ano_inicio) === ano);
          if (!cycle) return '';
          let html = `<b>Ciclo ${ano}–${Number(ano) + cycle.duracao_anos - 1}</b><br/>`;
          for (const p of params) {
            const key = SWR_KEYS.find(k => SWR_LABELS[k] === p.seriesName);
            if (!key) continue;
            const r = cycle.resultados_swr?.[key];
            if (!r) continue;
            const bal = privacyMode ? '••••' : `R$${(r.saldo_final / 1e6).toFixed(1)}M`;
            const status = r.sucesso ? `✓ ${bal}` : '✗ Falhou';
            html += `<span style="color:${SWR_COLORS[key]}">${p.marker}${p.seriesName}: ${status}</span><br/>`;
          }
          return html;
        },
      },
      series,
    };
  }, [cycles, theme, privacyMode]);

  return (
    <EChart
      ref={chartRef}
      option={option}
      style={{ height: 280, width: '100%' }}
    />
  );
}
