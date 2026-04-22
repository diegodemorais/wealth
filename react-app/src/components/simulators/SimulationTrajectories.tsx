'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { useDashboardStore } from '@/store/dashboardStore';
import { EC, EC_AXIS_LINE, EC_SPLIT_LINE } from '@/utils/echarts-theme';

export function SimulationTrajectories() {
  const { privacyMode } = useEChartsPrivacy();
  const chartRef = useChartResize();
  const mcResults = useDashboardStore(s => s.mcResults);

  const option = useMemo(() => {
    if (!mcResults || !mcResults.percentiles) return {};

    const p10 = mcResults.percentiles.p10 || [];
    const p50 = mcResults.percentiles.p50 || [];
    const p90 = mcResults.percentiles.p90 || [];

    const fireYear = 2039;
    const yearsToDisplay = Math.max(p10.length, p50.length, p90.length, 37);
    const xLabels = Array.from({ length: yearsToDisplay }, (_, i) => (fireYear + i).toString());

    const fmt = (v: number) => privacyMode ? '••••' : `R$ ${(v / 1e6).toFixed(1)}M`;

    return {
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: EC.card,
        borderColor: EC.border2,
        textStyle: { color: EC.text, fontSize: 12 },
        formatter: privacyMode ? () => '••••' : undefined,
      },
      legend: {
        show: !privacyMode,
        top: 0,
        textStyle: { color: EC.muted, fontSize: 11 },
        data: ['P10 (Conservative)', 'P50 (Median)', 'P90 (Optimistic)'],
      },
      grid: { left: 60, right: 16, top: 36, bottom: 28 },
      xAxis: {
        type: 'category' as const,
        data: xLabels,
        axisLabel: {
          color: privacyMode ? 'transparent' : EC.muted,
          fontSize: 10,
          interval: 4,
        },
        axisLine: EC_AXIS_LINE,
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: {
          color: privacyMode ? 'transparent' : EC.muted,
          fontSize: 10,
          formatter: (v: number) => fmt(v),
        },
        splitLine: EC_SPLIT_LINE,
      },
      series: [
        {
          name: 'P10 (Conservative)',
          type: 'line' as const,
          data: p10.slice(0, yearsToDisplay),
          lineStyle: { color: EC.red, width: 2, type: 'dashed' as const },
          itemStyle: { color: EC.red },
          symbol: 'none',
          smooth: true,
        },
        {
          name: 'P50 (Median)',
          type: 'line' as const,
          data: p50.slice(0, yearsToDisplay),
          lineStyle: { color: EC.accent, width: 3 },
          itemStyle: { color: EC.accent },
          areaStyle: { color: 'rgba(88, 166, 255, 0.15)' },
          symbol: 'none',
          smooth: true,
        },
        {
          name: 'P90 (Optimistic)',
          type: 'line' as const,
          data: p90.slice(0, yearsToDisplay),
          lineStyle: { color: EC.green, width: 2, type: 'dashed' as const },
          itemStyle: { color: EC.green },
          symbol: 'none',
          smooth: true,
        },
      ],
    };
  }, [mcResults, privacyMode]);

  if (!mcResults) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Monte Carlo Trajectories</h3>
        <div style={styles.empty}>
          <p>Adjust parameters above to generate simulations</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Monte Carlo Trajectories (até 90a)</h3>
      <EChart ref={chartRef} option={option} style={{ height: 350, width: '100%' }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: 'var(--space-5)',
    marginBottom: '14px',
  },
  title: {
    margin: '0 0 16px 0',
    color: 'var(--text)',
  },
  empty: {
    minHeight: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--muted)',
    backgroundColor: 'var(--bg)',
    borderRadius: '4px',
  },
};
