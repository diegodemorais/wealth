'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createSimpleLineChartOption } from '@/utils/chartSetup';

export interface RollingSharpChartProps {
  data: DashboardData;
}

export function RollingSharpChart({ data }: RollingSharpChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const months = 48;
    const xAxisData = Array.from({ length: months }, (_, i) => `M${i + 1}`);
    const rollingSharpData = Array.from({ length: months }, (_, i) =>
      0.5 + 0.2 * Math.sin(i * 0.1) + Math.random() * 0.3
    );

    return createSimpleLineChartOption({
      data, privacyMode, theme, xAxisData,
      seriesData: [{ name: 'Rolling Sharpe Ratio (12m)', data: rollingSharpData, color: '#f59e0b' }],
    });
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Rolling Sharpe Ratio (12-month window)</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 300 }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
