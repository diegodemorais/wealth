'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createGlidePathChartOption } from '@/utils/chartSetup';

export interface GlidePathChartProps {
  data: DashboardData;
}

export function GlidePathChart({ data }: GlidePathChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(
    () => createGlidePathChartOption({ data, privacyMode, theme }),
    [data, privacyMode, theme]
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Glide Path: Target Allocation by Age</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 400 }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
  },
  title: {
    margin: '0 0 16px 0',
    color: '#fff',
  },
};
