'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { createBoundedLineChartOption } from '@/utils/chartSetup';

export interface GuardrailsChartProps {
  data: DashboardData;
}

export function GuardrailsChart({ data }: GuardrailsChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const years = 30;
    const xAxisData = Array.from({ length: years }, (_, i) => `Y${i + 1}`);
    const upperBoundData = Array.from({ length: years }, (_, i) => 60000 * Math.pow(1.03, i) * 1.2);
    const lowerBoundData = Array.from({ length: years }, (_, i) => 60000 * Math.pow(1.03, i) * 0.8);
    const targetPathData = Array.from({ length: years }, (_, i) => 60000 * Math.pow(1.03, i));

    return createBoundedLineChartOption({
      data, privacyMode, theme, xAxisData, upperData: upperBoundData, targetData: targetPathData,
      lowerData: lowerBoundData, upperLabel: 'Upper Guardrail', targetLabel: 'Safe Spending Path',
      lowerLabel: 'Lower Guardrail', yAxisFormatter: (v) => `R$ ${(v / 1e3).toFixed(0)}K`,
    });
  }, [privacyMode, theme]);

  return (
    <div className="bg-card border border-border rounded-md p-4 mb-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Safe Spending Guardrails</h3>
      <ReactECharts ref={chartRef} option={option} style={{ height: 400, width: "100%" }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--card2)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '14px',
  },
  title: {
    margin: '0 0 16px 0',
    color: '#fff',
  },
};
