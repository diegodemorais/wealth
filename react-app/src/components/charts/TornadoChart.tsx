'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { DashboardData } from '@/types/dashboard';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';

interface TornadoChartProps {
  data: DashboardData;
}

export function TornadoChart({ data }: TornadoChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const tornadoData = data.tornado || [];

    if (!tornadoData || tornadoData.length === 0) {
      return {
        title: { text: 'No sensitivity data available' },
      };
    }

    const sorted = [...tornadoData]
      .sort((a, b) => Math.abs((b.impacto_pfire || 0) - 50) - Math.abs((a.impacto_pfire || 0) - 50))
      .slice(0, 6);

    const categories = sorted.map((d) => d.variavel || 'Unknown');
    const baselineValue = 50;
    const downside = sorted.map((d) => -(baselineValue - (d.impacto_pfire_pessimista || 0)));
    const upside = sorted.map((d) => (d.impacto_pfire_otimista || 0) - baselineValue);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          let html = `<div style="padding: 8px;">`;
          params.forEach((p: any) => {
            const val = Math.abs(p.value);
            html += `<div>${p.seriesName}: <strong>${val.toFixed(1)}%</strong></div>`;
          });
          html += `</div>`;
          return html;
        },
      },
      legend: {
        data: ['Cenário Pessimista', 'Cenário Otimista'],
        textStyle: { color: '#d1d5db' },
      },
      grid: {
        left: 120,
        right: 60,
        top: 40,
        bottom: 40,
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: (v: number) => `${v}%`,
        },
      },
      yAxis: {
        type: 'category',
        data: categories,
      },
      series: [
        {
          name: 'Cenário Pessimista',
          type: 'bar',
          stack: 'total',
          data: downside,
          itemStyle: { color: '#ef4444', opacity: 0.8 },
        },
        {
          name: 'Cenário Otimista',
          type: 'bar',
          stack: 'total',
          data: upside,
          itemStyle: { color: '#10b981', opacity: 0.8 },
        },
      ],
    };
  }, [data]);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ReactECharts ref={chartRef} option={option} theme={theme} />
    </div>
  );
}
