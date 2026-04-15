'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { DashboardData } from '@/types/dashboard';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { createTimelineChartOption } from '@/utils/chartSetup';

interface FanChartProps {
  data: DashboardData;
}

export function FanChart({ data }: FanChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(
    () => createTimelineChartOption({ data, privacyMode, theme }),
    [data, privacyMode, theme]
  );

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ReactECharts ref={chartRef} option={option} theme={theme} />
    </div>
  );
}
