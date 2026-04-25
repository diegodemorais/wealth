'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { createAttributionChartOption } from '@/utils/chartSetup';
import { DashboardData } from '@/types/dashboard';

// Handle hidden container resize: check offsetWidth > 0 and retry with setTimeout
const handleChartResize = (containerRef: any) => {
  if (containerRef?.current?.offsetWidth > 0) {
    setTimeout(() => containerRef.current?.getEchartsInstance?.()?.resize?.(), 100);
  }
};

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
    <EChart ref={chartRef} option={option} style={{ height: 320, width: '100%' }} />
  );
}
