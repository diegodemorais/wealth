'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createNetWorthProjectionChartOption } from '@/utils/chartSetup';

export interface NetWorthProjectionChartProps {
  data: DashboardData;
}

export function NetWorthProjectionChart({ data }: NetWorthProjectionChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(
    () => createNetWorthProjectionChartOption({ data, privacyMode, theme }),
    [data, privacyMode, theme]
  );

  return (
    <div className="bg-card border border-border rounded-md p-4 mb-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Net Worth Projection (30 years, Monte Carlo)</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 400, width: "100%" }} />
    </div>
  );
}
