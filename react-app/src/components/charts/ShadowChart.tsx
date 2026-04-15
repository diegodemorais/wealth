'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createDualLineChartOption } from '@/utils/chartSetup';

export interface ShadowChartProps {
  data: DashboardData;
}

export function ShadowChart({ data }: ShadowChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const months = 60;
    const xAxisData = Array.from({ length: months }, (_, i) => `M${i + 1}`);
    const actualData = Array.from({ length: months }, (_, i) => 100 * Math.pow(1.0085, i));
    const shadowData = Array.from({ length: months }, (_, i) => 100 * Math.pow(1.008, i));

    return createDualLineChartOption({
      data, privacyMode, theme, xAxisData, series1Data: actualData, series1Name: 'Actual Portfolio',
      series2Data: shadowData, series2Name: 'Shadow Portfolio (60/40)',
      series1Color: '#3b82f6', series2Color: '#ec4899', dashed: true,
    });
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Actual vs Shadow Portfolio Comparison</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 400, width: "100%" }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
