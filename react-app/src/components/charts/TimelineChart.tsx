'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createSimpleLineChartOption } from '@/utils/chartSetup';

export interface TimelineChartProps {
  data: DashboardData;
}

export function TimelineChart({ data }: TimelineChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const months = 60;
    const xAxisData = Array.from({ length: months }, (_, i) => `M${i + 1}`);
    const values = Array.from({ length: months }, (_, i) => {
      const baseValue = 500000;
      const monthlyReturn = 0.06 / 12;
      const monthlyContribution = 5000;
      return baseValue * Math.pow(1 + monthlyReturn, i) + monthlyContribution * i;
    });

    return createSimpleLineChartOption({
      data, privacyMode, theme, xAxisData,
      seriesData: [{ name: 'Portfolio Value', data: values, color: '#3b82f6', areaStyle: true }],
      yAxisFormatter: (v) => `R$ ${(v / 1e6).toFixed(1)}M`,
    });
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Historical Performance (60 months)</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 400 }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
