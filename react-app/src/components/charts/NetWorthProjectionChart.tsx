'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { useConfig } from '@/hooks/useConfig';
import { DashboardData } from '@/types/dashboard';
import { createNetWorthProjectionChartOption } from '@/utils/chartSetup';
import { ChartCard } from '@/components/primitives/ChartCard';

// Handle hidden container resize: check offsetWidth > 0 and retry with setTimeout
const handleChartResize = (containerRef: any) => {
  if (containerRef?.current?.offsetWidth > 0) {
    setTimeout(() => containerRef.current?.getEchartsInstance?.()?.resize?.(), 100);
  }
};

export interface NetWorthProjectionChartProps {
  data: DashboardData;
}

export function NetWorthProjectionChart({ data }: NetWorthProjectionChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const { config } = useConfig();
  const chartRef = useChartResize();

  const option = useMemo(
    () => createNetWorthProjectionChartOption({ data, privacyMode, theme, uiConfig: config.ui }),
    [data, privacyMode, theme, config.ui]
  );

  return (
    <ChartCard title="Net Worth Projection (until 90a, Monte Carlo)">
      <EChart ref={chartRef} option={option} style={{ height: 400, width: "100%" }} />
    </ChartCard>
  );
}
