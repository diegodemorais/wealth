'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { DashboardData } from '@/types/dashboard';
import { createDeltaBarChartOption } from '@/utils/chartSetup';

export interface DeltaBarChartProps {
  data: DashboardData;
  title?: string;
  chartType?: 'alpha' | 'factor-rolling';
  height?: number;
}

export function DeltaBarChart({ data, chartType, height = 260 }: DeltaBarChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();

  const option = useMemo(
    () => createDeltaBarChartOption({ data, privacyMode, theme, chartType }),
    [data, privacyMode, theme, chartType]
  );

  return (
    <ReactECharts option={option} style={{ height, width: '100%' }} />
  );
}
