'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createDualLineChartOption, CHART_COLORS } from '@/utils/chartSetup';


export interface BacktestR7ChartProps {
  data: DashboardData;
}

export function BacktestR7Chart({ data }: BacktestR7ChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    // Use real cumulative returns from backtest_r7
    const br7 = (data as any)?.backtest_r7 ?? {};
    const cr = br7.cumulative_returns ?? {};
    const rawDates: string[] = cr.dates ?? [];
    const targetValues: number[] = cr.target ?? [];
    const benchValues: number[] = cr.bench ?? [];

    if (rawDates.length === 0) {
      return {
        backgroundColor: 'transparent',
        title: { text: 'Sem dados de backtest R7', textStyle: { color: '#94a3b8' } },
      };
    }

    // Format dates: '1995-01-31' → 'jan/95'
    const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const xAxisData = rawDates.map((d: string) => {
      const parts = d.split('-');
      const y = parts[0];
      const m = parseInt(parts[1], 10);
      return MONTHS_PT[m - 1] + '/' + y.slice(2);
    });

    // Values are cumulative return index (1.0 = start)
    // Show as indexed to 100
    const portfolioData = targetValues.map((v: number) => v * 100);
    const benchData = benchValues.map((v: number) => v * 100);

    const metricas = br7.metricas_globais ?? {};
    const cagr = metricas.cagr_target_pct != null ? ` (CAGR: ${metricas.cagr_target_pct.toFixed(1)}%)` : '';

    return createDualLineChartOption({
      data, privacyMode, theme,
      xAxisData,
      series1Data: portfolioData,
      series1Name: `Target Portfolio${cagr}`,
      series2Data: benchData,
      series2Name: `R7 Benchmark (CAGR: ${metricas.cagr_bench_pct?.toFixed(1) ?? '?'}%)`,
      series1Color: CHART_COLORS.accent,
      series2Color: CHART_COLORS.yellow,
      yAxisFormatter: (v) => `${v.toFixed(0)}`,
    });
  }, [data, privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Portfolio vs R7 Benchmark — Retorno Acumulado (desde 1995)</h3>
      <EChart ref={chartRef} option={option} style={{ height: 400, width: "100%" }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--card2)',
    borderRadius: '8px',
    padding: 'var(--space-5)',
    marginBottom: '14px',
  },
  title: {
    margin: '0 0 16px 0',
    color: 'var(--text)',
  },
};
