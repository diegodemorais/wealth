'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createIncomeChartOption } from '@/utils/chartSetup';

export interface IncomeChartProps {
  data: DashboardData;
}

export function IncomeChart({ data }: IncomeChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(
    () => createIncomeChartOption({ data, privacyMode, theme }),
    [data, privacyMode, theme]
  );

  return (
    <div className="bg-card border border-border rounded-md p-4 mb-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Current Income Sources</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 300, width: "100%" }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    color: '#fff',
  },
};
