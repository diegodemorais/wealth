'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { DashboardData } from '@/types/dashboard';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';

interface SankeyChartProps {
  data: DashboardData;
}

export function SankeyChart({ data }: SankeyChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const timeline_attr = data.timeline_attribution || {};
    const cambio = data.cambio || 1;

    const initialCapital = timeline_attr.patrimonio_inicial || 3000000;
    const contributions = timeline_attr.aportes || 0;
    const equityGains = timeline_attr.retorno_equity_usd || 0;
    const fxGains = timeline_attr.retorno_cambio || 0;
    const rfGains = timeline_attr.retorno_rf || 0;
    const finalCapital = timeline_attr.patrimonio_final || initialCapital;

    return {
      title: {
        text: 'Patrimônio: Origem dos Ganhos (60 meses)',
        left: 'center',
      },
      tooltip: {
        formatter: (params: any) => {
          if (params.componentSubType === 'sankey') {
            return `${params.source} → ${params.target}: <strong>R$ ${(params.value / 1e6).toFixed(1)}M</strong>`;
          }
          return '';
        },
      },
      series: [
        {
          type: 'sankey',
          data: [
            { name: 'Capital Inicial', itemStyle: { color: '#3b82f6' } },
            { name: 'Aportes', itemStyle: { color: '#06b6d4' } },
            { name: 'Ganho Equity USD', itemStyle: { color: '#10b981' } },
            { name: 'Ganho FX', itemStyle: { color: '#f59e0b' } },
            { name: 'Ganho RF', itemStyle: { color: '#8b5cf6' } },
            { name: 'Capital Final', itemStyle: { color: '#ec4899' } },
          ],
          links: [
            { source: 0, target: 5, value: initialCapital },
            { source: 1, target: 5, value: contributions },
            { source: 2, target: 5, value: equityGains },
            { source: 3, target: 5, value: fxGains },
            { source: 4, target: 5, value: rfGains },
          ],
          emphasis: {
            focus: 'adjacency',
          },
          levels: [
            { depth: 0, itemStyle: { color: '#3b82f6' } },
            { depth: 1, itemStyle: { color: '#ec4899' } },
          ],
          nodeWidth: 20,
          nodePadding: 120,
        },
      ],
      grid: { left: 0, right: 0, top: 60, bottom: 0 },
    };
  }, [data]);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ReactECharts ref={chartRef} option={option} theme={theme} />
    </div>
  );
}
