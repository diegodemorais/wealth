'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';

interface BondPoolRunwayData {
  // Deterministic format (actual data in data.json)
  anos_pre_fire?: number[];
  pool_total_brl?: number[];
  pool_td2040_brl?: number[];
  pool_td2050_brl?: number[];
  alvo_pool_brl_2040?: number;
  anos_cobertura_pos_fire?: number[];
  pool_disponivel_pos_fire?: number[];
  custo_vida_anual?: number;
  // Future P10/P50/P90 format (spending scenarios)
  dates?: string[];
  p10?: number[];
  p50?: number[];
  p90?: number[];
}

interface BondPoolRunwayChartProps {
  data: BondPoolRunwayData;
}

export function BondPoolRunwayChart({ data }: BondPoolRunwayChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();

  const hasDeterministic = Array.isArray(data?.anos_pre_fire) && data.anos_pre_fire.length > 0;
  const hasProbabilistic = Array.isArray(data?.dates) && data.dates.length > 0;

  const option = useMemo(() => {
    if (!hasDeterministic && !hasProbabilistic) {
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

    // --- Probabilistic format (P10/P50/P90) ---
    if (hasProbabilistic) {
      const dates = data.dates!;
      const p10 = data.p10 || [];
      const p50 = data.p50 || [];
      const p90 = data.p90 || [];

      return {
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            if (!Array.isArray(params) || params.length === 0) return '';
            let html = `<div style="padding:4px 8px;"><strong>${params[0].axisValue}</strong>`;
            params.forEach((p: any) => {
              if (p.value != null && !p.seriesName.startsWith('_')) {
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
        xAxis: { type: 'category' as const, data: dates, axisLabel: { color: '#9ca3af' } },
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
          {
            name: 'P90 (otimista)',
            type: 'line',
            data: p90,
            lineStyle: { width: 1.5, type: 'dashed', color: '#10b981' },
            itemStyle: { color: '#10b981' },
            areaStyle: { color: 'rgba(16,185,129,0.08)' },
            symbol: 'none',
            smooth: true,
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
    }

    // --- Deterministic format (pool buildup + post-FIRE coverage) ---
    const years = data.anos_pre_fire!;
    const poolTotal = data.pool_total_brl || [];
    const pool2040 = data.pool_td2040_brl || [];
    const pool2050 = data.pool_td2050_brl || [];
    const alvo = data.alvo_pool_brl_2040 || 0;

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          let html = `<div style="padding:4px 8px;"><strong>${params[0].axisValue}</strong>`;
          params.forEach((p: any) => {
            if (p.value != null && !p.seriesName.startsWith('_')) {
              const val = p.value as number;
              const formatted = privacyMode
                ? '••••'
                : `R$ ${(val / 1000).toFixed(0)}k`;
              html += `<div style="display:flex;align-items:center;gap:4px;">`;
              html += `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color}"></span>`;
              html += `${p.seriesName}: <strong>${formatted}</strong></div>`;
            }
          });
          html += '</div>';
          return html;
        },
      },
      legend: {
        data: ['Pool Total', 'IPCA+ 2040', 'IPCA+ 2050', 'Meta 2040'],
        textStyle: { color: '#d1d5db' },
        bottom: 0,
      },
      grid: { left: 70, right: 20, top: 40, bottom: 50 },
      xAxis: {
        type: 'category' as const,
        data: years.map(String),
        axisLabel: { color: '#9ca3af' },
      },
      yAxis: {
        type: 'value' as const,
        name: 'R$ (BRL)',
        nameTextStyle: { color: '#9ca3af' },
        axisLabel: {
          color: privacyMode ? 'transparent' : '#9ca3af',
          formatter: (v: number) => `${(v / 1000).toFixed(0)}k`,
        },
        splitLine: { lineStyle: { color: '#2d3748', width: 0.5 } },
      },
      series: [
        // Stacked area: 2050 below, 2040 on top
        {
          name: 'IPCA+ 2050',
          type: 'bar',
          stack: 'pool',
          data: pool2050,
          itemStyle: { color: '#8b5cf6', borderRadius: [0, 0, 0, 0] },
          emphasis: { focus: 'series' },
        },
        {
          name: 'IPCA+ 2040',
          type: 'bar',
          stack: 'pool',
          data: pool2040,
          itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
          emphasis: { focus: 'series' },
        },
        // Pool total line overlay
        {
          name: 'Pool Total',
          type: 'line',
          data: poolTotal,
          lineStyle: { width: 2.5, color: '#f59e0b' },
          itemStyle: { color: '#f59e0b' },
          symbol: 'circle',
          symbolSize: 6,
          smooth: true,
          z: 10,
        },
        // Target line
        {
          name: 'Meta 2040',
          type: 'line',
          data: years.map(() => alvo),
          lineStyle: { width: 1.5, type: 'dashed', color: '#ef4444' },
          itemStyle: { color: '#ef4444' },
          symbol: 'none',
        },
      ],
    };
  }, [data, privacyMode, hasDeterministic, hasProbabilistic]);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ReactECharts option={option} theme={theme} style={{ height: '100%' }} />
    </div>
  );
}
