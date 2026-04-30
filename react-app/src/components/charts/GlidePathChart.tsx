'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createGlidePathChartOption } from '@/utils/chartSetup';
import { ChartCard } from '@/components/primitives/ChartCard';


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
    <ChartCard title="Glide Path: Target Allocation by Age">
      <EChart ref={chartRef} option={option} style={{ height: 400, width: "100%" }} />
    </ChartCard>
  );
}
