'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { DashboardData } from '@/types/dashboard';
import { createDeltaBarChartOption } from '@/utils/chartSetup';

export interface DeltaBarChartProps {
  data: DashboardData;
  title?: string;
  chartType?: 'alpha' | 'factor-rolling';
}

export function DeltaBarChart({ data, title = 'Monthly Delta vs Benchmark', chartType }: DeltaBarChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();

  const option = useMemo(
    () => createDeltaBarChartOption({ data, privacyMode, theme, chartType }),
    [data, privacyMode, theme, chartType]
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{title}</h3>
      <ReactECharts option={option} style={{ height: 300 }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: 'var(--card)', border: '1px solid var(--card2)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '14px' },
  title: { margin: '0 0 16px 0', color: 'var(--text)' },
};
