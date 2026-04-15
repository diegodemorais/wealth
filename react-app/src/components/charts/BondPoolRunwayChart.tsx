'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsTheme } from '@/hooks/useEChartsTheme';
import { useUiStore } from '@/store/uiStore';

interface BondPoolRunwayData {
  dates?: string[];
  p10?: number[];
  p50?: number[];
  p90?: number[];
}

interface BondPoolRunwayChartProps {
  data: BondPoolRunwayData;
}

export function BondPoolRunwayChart({ data }: BondPoolRunwayChartProps) {
  const theme = useEChartsTheme();
  const privacyMode = useUiStore(s => s.privacyMode);

  const option = useMemo(() => {
    const dates = data?.dates || [];
    const p10 = data?.p10 || [];
    const p50 = data?.p50 || [];
    const p90 = data?.p90 || [];

    if (dates.length === 0) {
      return {
        title: {
          text: 'Bond Pool Runway',
          subtext: 'Awaiting projection data from FIRE model',
          left: 'center',
          top: 'center',
          textStyle: { color: '#9ca3af', fontSize: 14 },
          subtextStyle: { color: '#6b7280', fontSize: 12 },
        },
      };
    }

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          let html = `<div style="padding:4px 8px;"><strong>${params[0].axisValue}</strong>`;
          params.forEach((p: any) => {
            if (p.value != null) {
              html += `<div>${p.seriesName}: <strong>${p.value.toFixed(1)} anos</strong></div>`;
            }
          });
          html += '</div>';
          return html;
        },
      },
      legend: {
        data: ['P90 (otimista)', 'P50 (mediana)', 'P10 (pessimista)'],
        textStyle: { color: '#d1d5db' },
        bottom: 0,
      },
      grid: { left: 50, right: 20, top: 40, bottom: 50 },
      xAxis: {
        type: 'category' as const,
        data: dates,
        axisLabel: { color: '#9ca3af' },
      },
      yAxis: {
        type: 'value' as const,
        name: 'Anos restantes',
        nameTextStyle: { color: '#9ca3af' },
        axisLabel: {
          color: privacyMode ? 'transparent' : '#9ca3af',
          formatter: (v: number) => `${v.toFixed(0)}`,
        },
        splitLine: { lineStyle: { color: '#2d3748', width: 0.5 } },
      },
      series: [
        // Shaded zone: Green (>2yr) — background reference
        {
          name: '_zone_green',
          type: 'line',
          data: dates.map(() => 2),
          lineStyle: { width: 0 },
          areaStyle: { color: 'rgba(239,68,68,0.06)' },
          symbol: 'none',
          silent: true,
          z: 0,
        },
        // Shaded zone: Yellow (1-2yr) via markArea
        {
          name: 'P90 (otimista)',
          type: 'line',
          data: p90,
          lineStyle: { width: 1.5, type: 'dashed', color: '#10b981' },
          itemStyle: { color: '#10b981' },
          areaStyle: { color: 'rgba(16,185,129,0.08)' },
          symbol: 'none',
          smooth: true,
          markArea: {
            silent: true,
            data: [
              [
                { yAxis: 2, itemStyle: { color: 'rgba(250,204,21,0.06)' } },
                { yAxis: 1 },
              ],
              [
                { yAxis: 1, itemStyle: { color: 'rgba(239,68,68,0.06)' } },
                { yAxis: 0 },
              ],
            ],
          },
        },
        {
          name: 'P50 (mediana)',
          type: 'line',
          data: p50,
          lineStyle: { width: 2.5, color: '#f59e0b' },
          itemStyle: { color: '#f59e0b' },
          symbol: 'none',
          smooth: true,
        },
        {
          name: 'P10 (pessimista)',
          type: 'line',
          data: p10,
          lineStyle: { width: 1.5, type: 'dashed', color: '#ef4444' },
          itemStyle: { color: '#ef4444' },
          symbol: 'none',
          smooth: true,
        },
      ],
    };
  }, [data, privacyMode]);

  return (
    <div style={{ height: '350px', width: '100%' }}>
      <ReactECharts option={option} theme={theme} style={{ height: '100%' }} />
    </div>
  );
}
