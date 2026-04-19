'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createNetWorthProjectionChartOption } from '@/utils/chartSetup';
import { ChartCard } from '@/components/primitives/ChartCard';

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
    <ChartCard title="Net Worth Projection (until 90a, Monte Carlo)">
      <EChart ref={chartRef} option={option} style={{ height: 400, width: "100%" }} />
    </ChartCard>
  );
}
