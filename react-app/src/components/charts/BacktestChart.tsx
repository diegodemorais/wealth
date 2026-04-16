'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createBacktestChartOption } from '@/utils/chartSetup';

export interface BacktestChartProps {
  data: DashboardData;
}

export function BacktestChart({ data }: BacktestChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(
    () => createBacktestChartOption({ data, privacyMode, theme }),
    [data, privacyMode, theme]
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Backtest Equity Curve (7 years)</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 400, width: "100%" }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: 'var(--card)', border: '1px solid var(--card2)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '14px' },
  title: { margin: '0 0 16px 0', color: 'var(--text)' },
};
