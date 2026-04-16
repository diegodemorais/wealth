'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createSimpleLineChartOption, CHART_COLORS } from '@/utils/chartSetup';

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
      seriesData: [{ name: 'Information Ratio', data: irData, color: CHART_COLORS.cyan }],
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
  container: { backgroundColor: 'var(--card)', border: '1px solid var(--card2)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '14px' },
  title: { margin: '0 0 16px 0', color: 'var(--text)' },
};
