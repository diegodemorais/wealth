'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { DashboardData } from '@/types/dashboard';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { createDonutChartOption } from '@/utils/chartSetup';

interface DonutChartsProps {
  data: DashboardData;
}

export function DonutCharts({ data }: DonutChartsProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(
    () => createDonutChartOption({ data, privacyMode, theme }),
    [data, privacyMode, theme]
  );

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ReactECharts ref={chartRef} option={option} theme={theme} />
    </div>
  );
}
