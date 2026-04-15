'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createBoundedLineChartOption } from '@/utils/chartSetup';

export interface IncomeProjectionChartProps {
  data: DashboardData;
}

export function IncomeProjectionChart({ data }: IncomeProjectionChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const years = 30;
    const xAxisData = Array.from({ length: years }, (_, i) => `Y${i + 1}`);
    const salaryIncomeData = Array.from({ length: years }, (_, i) => {
      if (i < 15) return 120000 * Math.pow(1.025, i);
      return 120000 * Math.pow(1.025, 15) * Math.pow(0.95, i - 15);
    });
    const portfolioIncomeData = Array.from({ length: years }, (_, i) =>
      (35000 + 18000 + 24000) * Math.pow(1.04, i)
    );
    const totalIncomeData = salaryIncomeData.map((s, i) => s + portfolioIncomeData[i]);
    const upperBoundData = totalIncomeData.map(x => x * 1.2);
    const lowerBoundData = totalIncomeData.map(x => x * 0.8);

    return createBoundedLineChartOption({
      data, privacyMode, theme, xAxisData, upperData: upperBoundData, targetData: totalIncomeData,
      lowerData: lowerBoundData, upperLabel: 'Upper Projection (+20%)', targetLabel: 'Total Income Projection',
      lowerLabel: 'Lower Projection (-20%)', yAxisFormatter: (v) => `R$ ${(v / 1e3).toFixed(0)}K`,
    });
  }, [privacyMode, theme]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Income Projection (30 Years)</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 400, width: "100%" }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '14px',
  },
  title: {
    margin: '0 0 16px 0',
    color: '#fff',
  },
};
