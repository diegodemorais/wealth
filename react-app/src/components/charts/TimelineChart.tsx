'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createSimpleLineChartOption, CHART_COLORS } from '@/utils/chartSetup';

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
      seriesData: [{ name: 'Portfolio Value', data: values, color: CHART_COLORS.accent, areaStyle: true }],
      yAxisFormatter: (v) => `R$ ${(v / 1e6).toFixed(1)}M`,
    });
  }, [privacyMode, theme]);

  return (
    <div className="bg-card border border-border rounded p-4 mb-5">
      <h3 className="text-sm font-semibold text-text mb-4 mt-0">Historical Performance (60 months)</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 400, width: "100%" }} />
    </div>
  );
}
