'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createDualLineChartOption } from '@/utils/chartSetup';

export interface BacktestR7ChartProps {
  data: DashboardData;
}

export function BacktestR7Chart({ data }: BacktestR7ChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const months = 84;
    const xAxisData = Array.from({ length: months }, (_, i) => `M${i + 1}`);
    const portfolioData = Array.from({ length: months }, (_, i) => {
      const monthlyReturn = 0.07 / 12;
      const volatility = 0.12 / Math.sqrt(12);
      const noise = (Math.random() - 0.5) * volatility * 2;
      return 1000000 * Math.pow(1 + monthlyReturn + noise, i);
    });
    const r7BenchmarkData = Array.from({ length: months }, (_, i) => {
      const monthlyReturn = 0.06 / 12;
      const volatility = 0.14 / Math.sqrt(12);
      const noise = (Math.random() - 0.5) * volatility * 2;
      return 1000000 * Math.pow(1 + monthlyReturn + noise, i);
    });

    return createDualLineChartOption({
      data, privacyMode, theme, xAxisData, series1Data: portfolioData, series1Name: 'Current Portfolio',
      series2Data: r7BenchmarkData, series2Name: 'R7 Benchmark (70/30)',
      series1Color: 'var(--accent)', series2Color: 'var(--yellow)',
      yAxisFormatter: (v) => `R$ ${(v / 1e6).toFixed(1)}M`,
    });
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Portfolio vs R7 Benchmark (84 months)</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 400, width: "100%" }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--card2)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '14px',
  },
  title: {
    margin: '0 0 16px 0',
    color: '#fff',
  },
};
