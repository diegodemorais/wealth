'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { DashboardData } from '@/types/dashboard';
import { createDrawdownHistChartOption } from '@/utils/chartSetup';

export interface DrawdownHistChartProps {
  data: DashboardData;
}

export function DrawdownHistChart({ data }: DrawdownHistChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();

  const option = useMemo(
    () => createDrawdownHistChartOption({ data, privacyMode, theme }),
    [data, privacyMode, theme]
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Historical Drawdown Distribution</h3>
      <ReactECharts option={option} style={{ height: 300 }} />
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
