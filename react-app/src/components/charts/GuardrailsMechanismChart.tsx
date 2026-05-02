'use client';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { EC, EC_SPLIT_LINE, EC_AXIS_LINE } from '@/utils/echarts-theme';
import { pvText } from '@/utils/privacyTransform';


// privacy-ok: percentage-only chart, monetary copy uses pvText for masking
export function GuardrailsMechanismChart() {
  const { theme, privacyMode } = useEChartsPrivacy();
  const chartRef = useChartResize();


  const option = useMemo(() => {
    const drawdownPcts = Array.from({ length: 51 }, (_, i) => i);

    const getSpendingCut = (drawdownPct: number): number => {
      if (drawdownPct <= 15) return 0;
      if (drawdownPct <= 25) return 10;
      if (drawdownPct <= 35) return 20;
      return 40;
    };

    const spendingCuts = drawdownPcts.map(getSpendingCut);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: { color: theme.tooltip.textStyle.color },
        formatter: (params: CallbackDataParams[]) => {
          if (!params[0]) return '';
          const val = params[0].value as [number, number];
          const dd = val[0];
          const cut = val[1];
          return `Drawdown: ${dd}%<br/>Gasto cortado: ${cut}%`;
        },
      },
      grid: { left: '8%', right: '5%', top: '8%', bottom: '15%', containLabel: true },
      xAxis: {
        type: 'value',
        name: 'Drawdown do Patrimônio (%)',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: { color: EC.muted, fontSize: 12 },
        min: 0,
        max: 50,
        splitLine: EC_SPLIT_LINE,
        axisLine: EC_AXIS_LINE,
        axisLabel: { color: EC.muted, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        name: 'Corte de Gasto (%)',
        nameLocation: 'middle',
        nameGap: 40,
        nameTextStyle: { color: EC.muted, fontSize: 12 },
        min: 0,
        max: 50,
        splitLine: EC_SPLIT_LINE,
        axisLine: EC_AXIS_LINE,
        axisLabel: { color: EC.muted, fontSize: 11 },
      },
      series: [
        {
          name: 'Corte de Gasto',
          type: 'line',
          data: drawdownPcts.map(dd => [dd, getSpendingCut(dd)]),
          smooth: false,
          lineStyle: { color: EC.accent, width: 3 },
          itemStyle: { color: EC.accent },
          areaStyle: { color: `${EC.accent}22` },
          symbol: 'none',
        },
        // Add threshold bands as annotations
        {
          name: 'Zero Corte',
          type: 'line',
          data: [[0, 0], [15, 0]],
          lineStyle: { color: EC.green, width: 2, type: 'dashed' },
          symbolSize: 0,
          label: { show: false },
          tooltip: { show: false },
        },
        {
          name: 'Corte 10%',
          type: 'line',
          data: [[15, 10], [25, 10]],
          lineStyle: { color: EC.yellow, width: 2, type: 'dashed' },
          symbolSize: 0,
          label: { show: false },
          tooltip: { show: false },
        },
        {
          name: 'Corte 20%',
          type: 'line',
          data: [[25, 20], [35, 20]],
          lineStyle: { color: EC.orange || '#d97706', width: 2, type: 'dashed' },
          symbolSize: 0,
          label: { show: false },
          tooltip: { show: false },
        },
      ],
    };
  }, [theme]);

  return (
    <div style={{ marginBottom: 12 }}>
      <EChart ref={chartRef} option={option} style={{ height: 280 }} />
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>
        <strong>Como funciona:</strong> A carteira ativa guardrails automáticos. Em drawdowns:
        <ul style={{ margin: '4px 0', paddingLeft: '1.2em' }}>
          <li>0–15%: nenhum corte (absorver volatilidade)</li>
          <li>15–25%: cortar 10% do gasto (austeridade branda)</li>
          <li>25–35%: cortar 20% do gasto (austeridade moderada)</li>
          <li>35%+: cortar até {pvText('R$180k', privacyMode)}/ano (piso de segurança)</li>
        </ul>
        Permite que a carteira se adapte sem falhar, mantendo qualidade de vida degradada mas segura.
      </div>
    </div>
  );
}
