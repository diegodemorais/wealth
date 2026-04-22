'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { useDashboardStore } from '@/store/dashboardStore';
import { EC, EC_AXIS_LINE, EC_SPLIT_LINE } from '@/utils/echarts-theme';

export function DrawdownDistribution() {
  const { privacyMode } = useEChartsPrivacy();
  const chartRef = useChartResize();
  const mcResults = useDashboardStore(s => s.mcResults);

  const option = useMemo(() => {
    if (!mcResults || !mcResults.drawdownDistribution) return {};

    const distribution = mcResults.drawdownDistribution;
    const labels = Object.keys(distribution).sort();
    const data = labels.map(label => distribution[label] || 0);

    return {
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: EC.card,
        borderColor: EC.border2,
        textStyle: { color: EC.text, fontSize: 12 },
        formatter: privacyMode ? () => '••••' : undefined,
      },
      legend: { show: false },
      grid: { left: 48, right: 16, top: 16, bottom: 28 },
      xAxis: {
        type: 'category' as const,
        data: labels,
        axisLabel: {
          color: privacyMode ? 'transparent' : EC.muted,
          fontSize: 10,
        },
        axisLine: EC_AXIS_LINE,
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: {
          color: privacyMode ? 'transparent' : EC.muted,
          fontSize: 10,
        },
        splitLine: EC_SPLIT_LINE,
      },
      series: [
        {
          name: 'Frequency',
          type: 'bar' as const,
          data,
          itemStyle: {
            color: 'rgba(239, 68, 68, 0.75)',
            borderColor: 'rgba(239, 68, 68, 0.85)',
            borderWidth: 1,
          },
          barMaxWidth: 40,
        },
      ],
    };
  }, [mcResults, privacyMode]);

  if (!mcResults) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Drawdown Distribution</h3>
        <div style={styles.empty}>
          <p>Adjust parameters above to generate simulations</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Maximum Drawdown Distribution Across Scenarios</h3>
      <EChart ref={chartRef} option={option} style={{ height: 300, width: '100%' }} />
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
