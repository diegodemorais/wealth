'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createIncomeChartOption } from '@/utils/chartSetup';
import { ChartCard } from '@/components/primitives/ChartCard';

export interface IncomeChartProps {
  data: DashboardData;
}

export function IncomeChart({ data }: IncomeChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(
    () => createIncomeChartOption({ data, privacyMode, theme }),
    [data, privacyMode, theme]
  );

  return (
    <ChartCard title="Current Income Sources">
      <EChart ref={chartRef} option={option} style={{ height: 300, width: "100%" }} />
    </ChartCard>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    color: 'var(--text)',
  },
};
