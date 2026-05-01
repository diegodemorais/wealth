'use client';
import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { EC, EC_AXIS_LABEL, EC_AXIS_LINE, EC_SPLIT_LINE, EC_TOOLTIP } from '@/utils/echarts-theme';
import type { DashboardData } from '@/types/dashboard';

interface Props { data: DashboardData }

export function WithdrawalRateChart({ data }: Props) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const { option, swrAtFire } = useMemo(() => {
    const trilhaDatas: number[] = (data as any)?.trilha_datas ?? [];
    const p50: number[] = (data as any)?.trilha_p50 ?? [];
    const prem = (data as any)?.premissas ?? {};

    const spending: number = prem.custo_vida_base ?? 250_000;
    const swrGatilho: number = (prem.swr_gatilho ?? 0.03) * 100;
    const inssKatia: number = prem.inss_katia_anual ?? 93_600;
    const inssDiego: number = prem.inss_anual ?? 18_000;

    const xData: string[] = [];
    const swrBruta: number[] = [];
    const swrLiquida: number[] = [];
    const inssKatiaLine: (number | null)[] = [];
    const inssDiegoLine: (number | null)[] = [];

    trilhaDatas.forEach((yr, i) => {
      const pat = p50[i];
      if (!pat) return;
      xData.push(String(yr));

      swrBruta.push(parseFloat(((spending / pat) * 100).toFixed(2)));

      const katia = yr >= 2049 ? inssKatia : 0;
      const diego = yr >= 2052 ? inssDiego : 0;
      const netSpend = Math.max(0, spending - katia - diego);
      swrLiquida.push(parseFloat(((netSpend / pat) * 100).toFixed(2)));

      // INSS as % of portfolio — shows each stream's contribution to reducing the draw
      inssKatiaLine.push(yr >= 2049 ? parseFloat(((inssKatia / pat) * 100).toFixed(2)) : null);
      inssDiegoLine.push(yr >= 2052 ? parseFloat(((inssDiego / pat) * 100).toFixed(2)) : null);
    });

    const swrAtFire = swrBruta[trilhaDatas.indexOf(2040)] ?? swrBruta[0] ?? 0;

    const fmtPct = (v: number) => `${v.toFixed(1)}%`;

    const chartOption = {
      tooltip: {
        ...EC_TOOLTIP,
        trigger: 'axis',
        formatter: (params: any[]) => {
          const ps = Array.isArray(params) ? params : [params];
          const yr = ps[0]?.axisValue ?? '';
          const lines = ps.map((p: any) => `${p.marker}${p.seriesName}: ${fmtPct(p.value)}`);
          return `<b>${yr}</b><br/>${lines.join('<br/>')}`;
        },
      },
      legend: {
        data: ['SWR Bruta', 'SWR Líquida (pós-INSS)', 'INSS Katia', 'INSS Diego'],
        textStyle: { color: EC.muted, fontSize: 10 },
        bottom: 0,
      },
      grid: { left: 52, right: 24, top: 28, bottom: 52 },
      xAxis: {
        type: 'category',
        data: xData,
        axisLabel: { ...EC_AXIS_LABEL, interval: 4 },
        axisLine: EC_AXIS_LINE,
      },
      yAxis: {
        type: 'value',
        axisLabel: { ...EC_AXIS_LABEL, formatter: (v: number) => `${v}%` },
        splitLine: EC_SPLIT_LINE,
        min: 0,
      },
      series: [
        {
          name: 'SWR Bruta',
          type: 'line',
          data: swrBruta,
          lineStyle: { color: EC.yellow, width: 2 },
          itemStyle: { color: EC.yellow },
          symbol: 'none',
          markLine: {
            silent: true,
            symbol: ['none', 'none'],
            data: [
              {
                yAxis: swrGatilho,
                lineStyle: { color: EC.red, type: 'dotted', width: 1.5 },
                label: { formatter: `Gatilho ${swrGatilho}%`, color: EC.red, fontSize: 10, position: 'insideEndTop' },
              },
            ],
          },
          markPoint: {
            data: [
              { xAxis: '2049', yAxis: swrBruta[trilhaDatas.indexOf(2049)] ?? 0, name: 'INSS Katia', symbol: 'pin', symbolSize: 20, itemStyle: { color: EC.green }, label: { formatter: 'INSS K', fontSize: 9 } },
              { xAxis: '2052', yAxis: swrBruta[trilhaDatas.indexOf(2052)] ?? 0, name: 'INSS Diego', symbol: 'pin', symbolSize: 20, itemStyle: { color: EC.accent }, label: { formatter: 'INSS D', fontSize: 9 } },
            ],
          },
        },
        {
          name: 'SWR Líquida (pós-INSS)',
          type: 'line',
          data: swrLiquida,
          lineStyle: { color: EC.green, width: 2, type: 'dashed' },
          itemStyle: { color: EC.green },
          symbol: 'none',
        },
        {
          name: 'INSS Katia',
          type: 'line',
          data: inssKatiaLine,
          lineStyle: { color: EC.accent, width: 1.5, type: 'dotted' },
          itemStyle: { color: EC.accent },
          symbol: 'none',
          connectNulls: false,
        },
        {
          name: 'INSS Diego',
          type: 'line',
          data: inssDiegoLine,
          lineStyle: { color: EC.muted, width: 1.5, type: 'dotted' },
          itemStyle: { color: EC.muted },
          symbol: 'none',
          connectNulls: false,
        },
      ],
    };

    return { option: chartOption, swrAtFire };
  }, [data, privacyMode, theme]);

  return (
    <div>
      <EChart
        ref={chartRef}
        option={option}
        style={{ height: 280 }}
        data-testid="withdrawal-rate-chart"
      />
      <span data-testid="withdrawal-rate-at-fire" style={{ display: 'none' }}>
        {swrAtFire.toFixed(2)}%
      </span>
      <span data-testid="withdrawal-rate-gatilho" style={{ display: 'none' }}>
        {((data as any)?.premissas?.swr_gatilho ?? 0.03) * 100}%
      </span>
    </div>
  );
}
