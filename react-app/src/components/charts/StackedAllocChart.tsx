'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createStackedAreaChartOption } from '@/utils/chartSetup';

export interface StackedAllocChartProps {
  data: DashboardData;
}

export function StackedAllocChart({ data }: StackedAllocChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(
    () => createStackedAreaChartOption({ data, privacyMode, theme }),
    [data, privacyMode, theme]
  );

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Por Classe de Ativo</div>
        <ReactECharts ref={chartRef} option={option} style={{ height: 220, width: "100%" }} />
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Intra-Equity — Pesos Atuais vs Alvo</div>
      </div>
    </div>
  );
}
