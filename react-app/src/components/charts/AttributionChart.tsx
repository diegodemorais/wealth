'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { createAttributionChartOption } from '@/utils/chartSetup';
import { DashboardData } from '@/types/dashboard';

export interface AttributionChartProps {
  data: DashboardData;
}

export function AttributionChart({ data }: AttributionChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(
    () => createAttributionChartOption({ data, privacyMode, theme }),
    [data, privacyMode, theme]
  );

  return (
    <ReactECharts ref={chartRef} option={option} style={{ height: 280, width: '100%' }} />
  );
}
