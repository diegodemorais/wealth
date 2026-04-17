'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';

export interface GuardrailsChartProps {
  data: DashboardData;
}

export function GuardrailsChart({ data }: GuardrailsChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const sg = (data as any)?.spending_guardrails ?? {};
    const upperSpending: number = sg.upper_guardrail_spending ?? 300000;
    const safeTarget: number   = sg.safe_target_spending   ?? 250000;
    const lowerSpending: number = sg.lower_guardrail_spending ?? 200000;
    const spendingAtual: number = sg.spending_atual ?? safeTarget;

    const fmt = (v: number) => privacyMode ? '••••' : `R$${Math.round(v / 1000)}k`;

    // 30-year fallback projection with 3% inflation
    const years = 30;
    const xLabels = Array.from({ length: years }, (_, i) => `Ano ${i + 1}`);
    const upper  = xLabels.map((_, i) => upperSpending  * Math.pow(1.03, i));
    const safe   = xLabels.map((_, i) => safeTarget      * Math.pow(1.03, i));
    const lower  = xLabels.map((_, i) => lowerSpending   * Math.pow(1.03, i));
    const atual  = xLabels.map((_, i) => spendingAtual   * Math.pow(1.03, i));

    // Zone gap for band fill: upper - lower
    const zoneGap = lower.map((lo, i) => upper[i] - lo);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          const hidden = new Set(['_zoneFloor', '_zoneGap']);
          const label = params[0]?.axisValue ?? '';
          let html = `<div style="padding:8px 10px"><strong>${label}</strong><br/>`;
          params.forEach((p: any) => {
            if (hidden.has(p.seriesName) || p.value == null) return;
            html += `${p.marker} ${p.seriesName}: <strong>${fmt(p.value)}/ano</strong><br/>`;
          });
          html += '</div>';
          return html;
        },
      },
      legend: {
        data: ['Gasto Atual', 'Safe Target', 'Upper Guardrail', 'Lower Guardrail'],
        textStyle: { color: theme.textStyle.color, fontSize: 11 },
        top: 8,
        itemWidth: 14,
        itemHeight: 8,
      },
      grid: { left: 60, right: 20, top: 44, bottom: 36, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: xLabels,
        axisLine: { lineStyle: { color: '#1c2128' } },
        axisTick: { show: false },
        axisLabel: {
          color: privacyMode ? 'transparent' : '#94a3b8',
          fontSize: 10,
          interval: 1,
          hideOverlap: true,
        },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: {
          color: privacyMode ? 'transparent' : '#94a3b8',
          formatter: (v: number) => `R$${Math.round(v / 1000)}k`,
          fontSize: 11,
        },
        splitLine: { lineStyle: { color: '#161b22' } },
      },
      series: [
        // ── Band fill: green corridor between Lower and Upper ────────────
        {
          name: '_zoneFloor',
          type: 'line' as const,
          data: lower,
          lineStyle: { opacity: 0 },
          areaStyle: { color: 'transparent', opacity: 0 },
          symbolSize: 0,
          stack: 'guardrail-band',
          silent: true,
        },
        {
          name: '_zoneGap',
          type: 'line' as const,
          data: zoneGap,
          lineStyle: { opacity: 0 },
          areaStyle: { color: 'rgba(62,211,129,0.08)' },
          symbolSize: 0,
          stack: 'guardrail-band',
          silent: true,
        },
        // ── Visible lines ─────────────────────────────────────────────────
        {
          name: 'Upper Guardrail',
          type: 'line' as const,
          data: upper,
          smooth: true,
          itemStyle: { color: '#f85149' },
          lineStyle: { width: 1.5, color: '#f85149', type: 'dashed' as const },
          symbolSize: 0,
        },
        {
          name: 'Safe Target',
          type: 'line' as const,
          data: safe,
          smooth: true,
          itemStyle: { color: '#3ed381' },
          lineStyle: { width: 2, color: '#3ed381' },
          symbolSize: 0,
        },
        {
          name: 'Lower Guardrail',
          type: 'line' as const,
          data: lower,
          smooth: true,
          itemStyle: { color: '#f59e0b' },
          lineStyle: { width: 1.5, color: '#f59e0b', type: 'dashed' as const },
          symbolSize: 0,
        },
        {
          name: 'Gasto Atual',
          type: 'line' as const,
          data: atual,
          smooth: true,
          itemStyle: { color: '#58a6ff' },
          lineStyle: { width: 2, color: '#58a6ff', type: 'dotted' as const },
          symbolSize: 0,
          z: 10,
        },
      ],
    };
  }, [data, privacyMode, theme]);

  return (
    <ReactECharts ref={chartRef} option={option} style={{ height: 320, width: '100%' }} />
  );
}
