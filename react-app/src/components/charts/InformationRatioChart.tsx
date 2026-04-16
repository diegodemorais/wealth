'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { CHART_COLORS } from '@/utils/chartSetup';

export interface InformationRatioChartProps {
  data: DashboardData;
}

export function InformationRatioChart({ data }: InformationRatioChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    // Use real information_ratio data from rolling_sharpe
    const rs = (data as any)?.rolling_sharpe ?? {};
    const irObj = rs.information_ratio ?? {};
    const rolling36m = irObj.rolling_36m ?? {};
    const dates: string[] = rolling36m.dates ?? [];
    const values: number[] = rolling36m.values ?? [];

    if (dates.length === 0) {
      return {
        backgroundColor: 'transparent',
        title: { text: 'Sem dados de Information Ratio', textStyle: { color: '#94a3b8' } },
      };
    }

    // Format dates: '2024-04' → 'abr/24'
    const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const xAxisData = dates.map((ym: string) => {
      const [y, m] = ym.split('-');
      return MONTHS_PT[parseInt(m, 10) - 1] + '/' + y.slice(2);
    });

    // Annotate ITD IR
    const itd = irObj.itd ?? {};
    const itdLabel = itd.ir != null ? `IR ITD: ${itd.ir.toFixed(2)} (vs VWRA.L, USD)` : 'Information Ratio';

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params) || !params[0]) return '';
          const p = params[0];
          const val = p.value?.toFixed(2) ?? '-';
          const color = p.value >= 0 ? '#3ed381' : '#f85149';
          return `<div style="padding:8px"><strong>${p.axisValueLabel}</strong><br/>
            ${p.marker} IR 36m: <strong style="color:${color}">${val}</strong></div>`;
        },
      },
      grid: { left: 50, right: 20, top: 30, bottom: 40, containLabel: true },
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
          formatter: (v: number) => v.toFixed(1),
          fontSize: 11,
        },
        splitLine: { lineStyle: { color: '#161b22' } },
        // Zero reference line indicator
      },
      series: [
        {
          name: itdLabel,
          type: 'line' as const,
          data: values,
          smooth: true,
          itemStyle: { color: CHART_COLORS.cyan },
          lineStyle: { width: 2, color: CHART_COLORS.cyan },
          symbolSize: 4,
          // Color above/below zero
          areaStyle: {
            opacity: 0.1,
            color: {
              type: 'linear' as const,
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#3ed381' },
                { offset: 1, color: '#f85149' },
              ],
            },
          },
          markLine: {
            silent: true,
            lineStyle: { color: '#555', type: 'dashed' as const, width: 1 },
            data: [{ yAxis: 0 }],
            label: { show: false },
          },
        },
      ],
    };
  }, [data, privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Information Ratio — Rolling 36m (vs VWRA.L)</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 300, width: "100%" }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: 'var(--card)', border: '1px solid var(--card2)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '14px' },
  title: { margin: '0 0 16px 0', color: 'var(--text)', fontSize: '14px', fontWeight: 600 },
};
