'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createSimpleLineChartOption } from '@/utils/chartSetup';

export interface InformationRatioChartProps {
  data: DashboardData;
}

export function InformationRatioChart({ data }: InformationRatioChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const months = 36;
    const xAxisData = Array.from({ length: months }, (_, i) => `M${i + 1}`);
    const irData = Array.from({ length: months }, (_, i) =>
      0.8 + 0.3 * Math.sin(i * 0.15) + (Math.random() - 0.5) * 0.2
    );

    return createSimpleLineChartOption({
      data, privacyMode, theme, xAxisData,
      seriesData: [{ name: 'Information Ratio', data: irData, color: '#06b6d4' }],
    });
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Information Ratio (36 months)</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 300, width: "100%" }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
