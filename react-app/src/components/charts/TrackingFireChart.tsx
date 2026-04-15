'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createBoundedLineChartOption } from '@/utils/chartSetup';

export interface TrackingFireChartProps {
  data: DashboardData;
}

export function TrackingFireChart({ data }: TrackingFireChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const months = 180;
    const xAxisData = Array.from({ length: months }, (_, i) => `M${i + 1}`);
    const fireTarget = 2500000;
    const currentNetworth = 1250000;
    const actualData = Array.from({ length: months }, (_, i) => {
      const monthlyReturn = 0.07 / 12;
      const monthlyContribution = 5000;
      return currentNetworth * Math.pow(1 + monthlyReturn, i) + monthlyContribution * i;
    });
    const targetData = Array(months).fill(fireTarget);
    const lowerBoundData = Array.from({ length: months }, (_, i) => {
      const monthlyReturn = 0.05 / 12;
      const monthlyContribution = 5000;
      return currentNetworth * Math.pow(1 + monthlyReturn, i) + monthlyContribution * i;
    });

    return createBoundedLineChartOption({
      data, privacyMode, theme, xAxisData, upperData: actualData, targetData: targetData,
      lowerData: lowerBoundData, upperLabel: 'Actual (Base Case)', targetLabel: 'FIRE Target',
      lowerLabel: 'Lower Bound (75% confidence)', yAxisFormatter: (v) => `R$ ${(v / 1e6).toFixed(1)}M`,
    });
  }, [privacyMode, theme]);

  return (
    <div className="bg-card border border-border rounded-md p-4 mb-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">FIRE Target Tracking (15-year projection)</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 400, width: "100%" }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: 'var(--card)', border: '1px solid var(--card2)', borderRadius: '8px', padding: '16px', marginBottom: '14px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
};
