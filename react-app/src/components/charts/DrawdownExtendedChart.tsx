'use client';

import { useMemo, useState } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { EC, EC_AXIS_LINE, EC_SPLIT_LINE } from '@/utils/echarts-theme';

// Handle hidden container resize: check offsetWidth > 0 and retry with setTimeout
const handleChartResize = (containerRef: any) => {
  if (containerRef?.current?.offsetWidth > 0) {
    setTimeout(() => containerRef.current?.getEchartsInstance?.()?.resize?.(), 100);
  }
};

interface Period {
  label: string;
  dates: string[];
  dd_target_pct: number[];
  dd_benchmark_pct: number[];
  note?: string;
}

interface Props {
  periods: Record<string, Period>;
  summary: Record<string, number>;
}

const PERIOD_ORDER = ['real', 'medium', 'long', 'academic'];
const PERIOD_LABELS: Record<string, string> = {
  real: 'Carteira Real (2021+)',
  medium: 'Backtest 7a (2019+)',
  long: 'Backtest 21a (2005+)',
  academic: 'Série Longa 31a (1995+)',
};

export function DrawdownExtendedChart({ periods, summary }: Props) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();
  const availablePeriods = PERIOD_ORDER.filter(k => periods[k]);
  const [selectedPeriod, setSelectedPeriod] = useState(availablePeriods.includes('long') ? 'long' : availablePeriods[0]);

  const period = periods[selectedPeriod];

  const option = useMemo(() => {
    if (!period?.dates?.length) return {};

    const fmtPct = (v: number) => `${v.toFixed(1)}%`;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          const dt = params[0]?.axisValue ?? '';
          let html = `<div style="padding:6px 10px"><strong>${dt}</strong><br/>`;
          params.forEach((p: any) => {
            if (p.value != null) {
              const color = p.value <= -20 ? EC.red : p.value <= -10 ? EC.yellow : EC.green;
              html += `${p.marker} ${p.seriesName}: <strong style="color:${color}">${fmtPct(p.value)}</strong><br/>`;
            }
          });
          html += '</div>';
          return html;
        },
      },
      legend: {
        data: ['Target (50/30/20)', 'Benchmark (VWRA)'],
        textStyle: { color: theme.textStyle.color, fontSize: 11 },
        top: 4,
      },
      grid: { left: 55, right: 15, top: 40, bottom: 30, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: period.dates,
        axisLine: EC_AXIS_LINE,
        axisTick: { show: false },
        axisLabel: {
          color: EC.muted,
          fontSize: 10,
          interval: Math.max(1, Math.floor(period.dates.length / 12)),
          formatter: (v: string) => v.slice(0, 4),
          hideOverlap: true,
        },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: {
          color: EC.muted,
          fontSize: 10,
          formatter: (v: number) => `${v.toFixed(0)}%`,
        },
        splitLine: EC_SPLIT_LINE,
      },
      series: [
        {
          name: 'Target (50/30/20)',
          type: 'line' as const,
          data: period.dd_target_pct,
          smooth: true,
          lineStyle: { width: 2, color: EC.red },
          itemStyle: { color: EC.red },
          areaStyle: { color: 'rgba(239,68,68,0.08)' },
          symbolSize: 0,
        },
        {
          name: 'Benchmark (VWRA)',
          type: 'line' as const,
          data: period.dd_benchmark_pct,
          smooth: true,
          lineStyle: { width: 1.5, color: EC.muted, type: 'dashed' as const },
          itemStyle: { color: EC.muted },
          symbolSize: 0,
        },
      ],
    };
  }, [period, theme, privacyMode]);

  if (!period) return null;

  const maxDDTarget = Math.min(...(period.dd_target_pct ?? [0]));
  const maxDDBench = Math.min(...(period.dd_benchmark_pct ?? [0]));
  const currentDD = period.dd_target_pct?.[period.dd_target_pct.length - 1] ?? 0;

  return (
    <div>
      {/* Period selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {availablePeriods.map(k => (
          <button
            key={k}
            onClick={() => setSelectedPeriod(k)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: selectedPeriod === k ? 700 : 400,
              background: selectedPeriod === k ? 'var(--accent)' : 'var(--card2)',
              color: selectedPeriod === k ? '#fff' : 'var(--muted)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            {PERIOD_LABELS[k] ?? periods[k]?.label ?? k}
          </button>
        ))}
      </div>

      {/* Chart */}
      <EChart ref={chartRef} option={option} style={{ height: 320, width: '100%' }} />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2" style={{ marginTop: 8 }}>
        <div style={{ background: 'var(--card)', border: `1px solid ${maxDDTarget <= -30 ? 'var(--red)' : maxDDTarget <= -15 ? 'var(--yellow)' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', padding: '8px 12px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Max Drawdown Target</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--red)' }}>{maxDDTarget.toFixed(1)}%</div>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '8px 12px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Max DD Benchmark</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--muted)' }}>{maxDDBench.toFixed(1)}%</div>
        </div>
        <div style={{ background: 'var(--card)', border: `1px solid ${currentDD === 0 ? 'var(--green)' : 'var(--yellow)'}`, borderRadius: 'var(--radius-lg)', padding: '8px 12px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>DD Atual</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: currentDD === 0 ? 'var(--green)' : 'var(--yellow)' }}>{currentDD.toFixed(1)}%</div>
        </div>
      </div>

      {/* Note */}
      {period.note && (
        <div className="src" style={{ marginTop: 6 }}>
          {period.note}
        </div>
      )}
    </div>
  );
}
