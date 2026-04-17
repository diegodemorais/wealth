'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { DashboardData } from '@/types/dashboard';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { createSankeyChartOption } from '@/utils/chartSetup';

interface SankeyChartProps {
  data: DashboardData;
}

export function SankeyChart({ data }: SankeyChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(
    () => createSankeyChartOption({ data, privacyMode, theme }),
    [data, privacyMode, theme]
  );

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <EChart ref={chartRef} option={option} theme={theme} />
    </div>
  );
}
