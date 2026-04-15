'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createGlidePathChartOption } from '@/utils/chartSetup';

export interface GlidePathChartProps {
  data: DashboardData;
}

export function GlidePathChart({ data }: GlidePathChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(
    () => createGlidePathChartOption({ data, privacyMode, theme }),
    [data, privacyMode, theme]
  );

  return (
    <div className="bg-card border border-border rounded-md p-4 mb-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Glide Path: Target Allocation by Age</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 400, width: "100%" }} />
    </div>
  );
}
