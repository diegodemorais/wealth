'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { DashboardData } from '@/types/dashboard';
import { createDeltaBarChartOption } from '@/utils/chartSetup';

// Handle hidden container resize: check offsetWidth > 0 and retry with setTimeout
const handleChartResize = (containerRef: any) => {
  if (containerRef?.current?.offsetWidth > 0) {
    setTimeout(() => containerRef.current?.getEchartsInstance?.()?.resize?.(), 100);
  }
};

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
    <EChart option={option} style={{ height, width: '100%' }} />
  );
}
