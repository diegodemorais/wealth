'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { CHART_COLORS } from '@/utils/chartSetup';

export interface ShadowChartProps {
  data: DashboardData;
}

export function ShadowChart({ data }: ShadowChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    // Use real backtest data: target vs shadowA (VWRA proxy / 70-30)
    const bt = (data as any)?.backtest ?? {};
    const rawDates: string[] = bt.dates ?? [];
    const targetValues: number[] = bt.target ?? [];
    const shadowAValues: number[] = bt.shadowA ?? [];

    if (rawDates.length === 0) {
      return {
        backgroundColor: 'transparent',
        title: { text: 'Sem dados de shadow portfolio', textStyle: { color: '#94a3b8' } },
      };
    }

    // Format dates: '2019-08' → 'ago/19'
    const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const xAxisData = rawDates.map((ym: string) => {
      const [y, m] = ym.split('-');
      return MONTHS_PT[parseInt(m, 10) - 1] + '/' + y.slice(2);
    });

    const shadows = (data as any)?.shadows ?? {};
    const deltaVwra = shadows.delta_vwra != null ? ` (Δ VWRA: ${shadows.delta_vwra > 0 ? '+' : ''}${shadows.delta_vwra?.toFixed(2)}%)` : '';

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
              html += `${p.marker} ${p.seriesName}: <strong>${p.value.toFixed(1)}</strong><br/>`;
            }
          });
          html += '</div>';
          return html;
        },
      },
      legend: {
        data: [`Target Portfolio`, `Shadow A (VWRA proxy)${deltaVwra}`],
        textStyle: { color: theme.textStyle.color },
        top: 5,
        right: 10,
      },
      grid: { left: 50, right: 20, top: 40, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: xAxisData,
        axisLabel: {
          color: privacyMode ? 'transparent' : '#94a3b8',
          fontSize: 11,
          interval: Math.floor(xAxisData.length / 8),
        },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: {
          color: privacyMode ? 'transparent' : '#94a3b8',
          formatter: (v: number) => `${v.toFixed(0)}`,
          fontSize: 11,
        },
        splitLine: { lineStyle: { color: '#161b22' } },
      },
      series: [
        {
          name: 'Target Portfolio',
          type: 'line' as const,
          data: targetValues,
          smooth: true,
          itemStyle: { color: CHART_COLORS.accent },
          lineStyle: { width: 2.5, color: CHART_COLORS.accent },
          symbolSize: 0,
          areaStyle: { opacity: 0.05, color: CHART_COLORS.accent },
        },
        ...(shadowAValues.length > 0 ? [{
          name: `Shadow A (VWRA proxy)${deltaVwra}`,
          type: 'line' as const,
          data: shadowAValues,
          smooth: true,
          itemStyle: { color: CHART_COLORS.red },
          lineStyle: { width: 1.5, color: CHART_COLORS.red, type: 'dashed' as const },
          symbolSize: 0,
        }] : []),
      ],
    };
  }, [data, privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Actual vs Shadow Portfolio — Equity Curve</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 400, width: "100%" }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: 'var(--card)', border: '1px solid var(--card2)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '14px' },
  title: { margin: '0 0 16px 0', color: 'var(--text)' },
};
