'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { DashboardData } from '@/types/dashboard';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { createSankeyChartOption } from '@/utils/chartSetup';

// Handle hidden container resize: check offsetWidth > 0 and retry with setTimeout
const handleChartResize = (containerRef: any) => {
  if (containerRef?.current?.offsetWidth > 0) {
    setTimeout(() => containerRef.current?.getEchartsInstance?.()?.resize?.(), 100);
  }
};

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
