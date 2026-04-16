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
    // Use real spending_guardrails data
    const sg = (data as any)?.spending_guardrails ?? {};
    const upperSpending: number = sg.upper_guardrail_spending ?? 300000;
    const safeTarget: number = sg.safe_target_spending ?? 250000;
    const lowerSpending: number = sg.lower_guardrail_spending ?? 200000;

    // Use spending smile for post-FIRE time series projection
    const spendingSmile = (data as any)?.spendingSmile ?? {};
    const smileDates: string[] = spendingSmile.dates ?? [];
    const smileGoGo: number[] = spendingSmile.go_go ?? [];
    const smileSlowGo: number[] = spendingSmile.slow_go ?? [];
    const smileNoGo: number[] = spendingSmile.no_go ?? [];

    if (smileDates.length > 0) {
      // Spending smile data available
      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis' as const,
          backgroundColor: theme.tooltip.backgroundColor,
          borderColor: theme.tooltip.borderColor,
          textStyle: theme.tooltip.textStyle,
          formatter: (params: any) => {
            if (!Array.isArray(params)) return '';
            let html = `<div style="padding:8px"><strong>${params[0]?.axisValueLabel}</strong><br/>`;
            params.forEach((p: any) => {
              if (p.value != null) {
                const val = privacyMode ? '••••' : `R$${Math.round(p.value / 1000)}k/ano`;
                html += `${p.marker} ${p.seriesName}: <strong>${val}</strong><br/>`;
              }
            });
            html += '</div>';
            return html;
          },
        },
        legend: {
          data: ['Go-Go', 'Slow-Go', 'No-Go'],
          textStyle: { color: theme.textStyle.color },
          top: 10,
        },
        grid: { left: 70, right: 30, top: 50, bottom: 40, containLabel: true },
        xAxis: {
          type: 'category' as const,
          data: smileDates,
          axisLabel: { color: privacyMode ? 'transparent' : '#94a3b8', fontSize: 11 },
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
          {
            name: 'Go-Go',
            type: 'line' as const,
            data: smileGoGo,
            smooth: true,
            itemStyle: { color: '#3ed381' },
            lineStyle: { width: 2, color: '#3ed381' },
            symbolSize: 0,
          },
          {
            name: 'Slow-Go',
            type: 'line' as const,
            data: smileSlowGo,
            smooth: true,
            itemStyle: { color: '#f59e0b' },
            lineStyle: { width: 2, color: '#f59e0b' },
            symbolSize: 0,
          },
          {
            name: 'No-Go',
            type: 'line' as const,
            data: smileNoGo,
            smooth: true,
            itemStyle: { color: '#f85149' },
            lineStyle: { width: 2, color: '#f85149' },
            symbolSize: 0,
          },
        ],
      };
    }

    // Fallback: simple guardrail bands over 30 years
    const years = 30;
    const xAxisData = Array.from({ length: years }, (_, i) => `Ano ${i + 1}`);
    // Adjust for 3% inflation
    const upper = Array.from({ length: years }, (_, i) => upperSpending * Math.pow(1.03, i));
    const safe = Array.from({ length: years }, (_, i) => safeTarget * Math.pow(1.03, i));
    const lower = Array.from({ length: years }, (_, i) => lowerSpending * Math.pow(1.03, i));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
      },
      legend: {
        data: ['Upper Guardrail', 'Safe Spending Path', 'Lower Guardrail'],
        textStyle: { color: theme.textStyle.color },
        top: 10,
      },
      grid: { left: 70, right: 30, top: 50, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: xAxisData,
        axisLabel: { color: privacyMode ? 'transparent' : '#94a3b8', fontSize: 11 },
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
          name: 'Safe Spending Path',
          type: 'line' as const,
          data: safe,
          smooth: true,
          itemStyle: { color: '#3ed381' },
          lineStyle: { width: 2.5, color: '#3ed381' },
          symbolSize: 0,
          areaStyle: { opacity: 0.07, color: '#3ed381' },
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
      ],
    };
  }, [data, privacyMode, theme]);

  return (
    <div className="bg-card border border-border rounded-md p-4 mb-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Safe Spending Guardrails</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 400, width: '100%' }} />
    </div>
  );
}
