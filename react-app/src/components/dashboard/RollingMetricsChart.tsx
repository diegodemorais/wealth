'use client';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import React from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { useConfig } from '@/hooks/useConfig';
import { fmtPrivacy } from '@/utils/privacyTransform';

interface RollingMetricsChartProps {
  dates: string[];
  sharpeBRL: number[];
  sharpeUSD: number[];
  sortino: number[];
  volatilidade: number[];
}

type Metric = 'sharpe' | 'sortino' | 'volatilidade';

const RollingMetricsChart: React.FC<RollingMetricsChartProps> = ({
  dates, sharpeBRL, sharpeUSD, sortino, volatilidade,
}) => {
  const { privacyMode } = useEChartsPrivacy();
  const { config } = useConfig();
  const chartRef = useChartResize();
  const [activeMetric, setActiveMetric] = React.useState<Metric>('sharpe');

  // Thin dates to at most MAX_POINTS for legibility
  const MAX_POINTS = config.ui?.rollingMetrics?.maxPoints ?? 36;
  const rawDates = dates.slice(-120);
  const step = Math.max(1, Math.floor(rawDates.length / MAX_POINTS));
  const thinIdx = rawDates.map((_, i) => i).filter(i => i % step === 0 || i === rawDates.length - 1);
  const thinDates = thinIdx.map(i => rawDates[i]);

  const thin = (arr: number[]) => {
    const sliced = arr.slice(-120);
    return thinIdx.map(i => sliced[i] ?? null);
  };

  const metricConfig: Record<Metric, {
    series: Array<{ name: string; data: (number | null)[]; color: string }>;
    yMin: number; yMax: number; suffix: string;
  }> = {
    sharpe: {
      series: [
        { name: 'Sharpe BRL', data: thin(sharpeBRL), color: '#3b82f6' },
        { name: 'Sharpe USD', data: thin(sharpeUSD), color: '#06b6d4' },
      ],
      yMin: -1, yMax: 3, suffix: '',
    },
    sortino: {
      series: [{ name: 'Sortino', data: thin(sortino), color: '#3b82f6' }],
      yMin: 0, yMax: 5, suffix: '',
    },
    volatilidade: {
      series: [{ name: 'Volatilidade', data: thin(volatilidade), color: '#f59e0b' }],
      yMin: 5, yMax: 25, suffix: '%',
    },
  };

  const cfg = metricConfig[activeMetric];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: { color: '#94a3b8', fontSize: 12 },
      formatter: (params: CallbackDataParams[]) => {
        const date = (params[0] as (CallbackDataParams & { axisValue?: string; axisValueLabel?: string })).axisValue;
        const lines = params.map((p: any) => {
          const val = p.value == null ? '—' : p.value.toFixed(2) + cfg.suffix;
          return `<div style="display:flex;justify-content:space-between;gap:16px">
            <span>${p.marker}${p.seriesName}</span>
            <span style="font-weight:600;color:#e2e8f0">${val}</span>
          </div>`;
        }).join('');
        return `<div style="font-size:11px;min-width:180px"><div style="color:#64748b;margin-bottom:6px">${date}</div>${lines}</div>`;
      },
    },
    legend: {
      show: !privacyMode,
      top: 0,
      itemWidth: 12, itemHeight: 2,
      textStyle: { color: '#64748b', fontSize: 11 },
    },
    grid: { left: 48, right: 16, top: 36, bottom: 28 },
    xAxis: {
      type: 'category',
      data: thinDates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#1e293b' } },
      axisTick: { show: false },
      axisLabel: {
        color: '#64748b', fontSize: 10,
        rotate: 30,
        formatter: (v: string) => {
          // YYYY-MM → MM/YY
          const parts = v.split('-');
          if (parts.length >= 2) return `${parts[1]}/${parts[0].slice(2)}`;
          return v;
        },
      },
    },
    yAxis: {
      type: 'value',
      min: cfg.yMin, max: cfg.yMax,
      axisLabel: {
        color: privacyMode ? 'transparent' : '#64748b', fontSize: 11,
        formatter: (v: number) => v.toFixed(1) + cfg.suffix,
      },
      splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
    },
    series: cfg.series.map((s, idx) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: s.color, width: 2 },
      areaStyle: { color: s.color, opacity: idx === 0 ? 0.08 : 0.04 },
      markLine: activeMetric === 'sharpe' ? {
        silent: true,
        lineStyle: { color: '#334155', type: 'dashed', width: 1 },
        label: { fontSize: 9, color: '#64748b' },
        data: [{ yAxis: 1, name: 'Sharpe > 1' }],
      } : undefined,
    })),
  };

  const currentSharpe = sharpeBRL[sharpeBRL.length - 1] ?? 0;
  const currentSortino = sortino[sortino.length - 1] ?? 0;
  const currentVol = volatilidade[volatilidade.length - 1] ?? 0;

  const tabs: { key: Metric; label: string }[] = [
    { key: 'sharpe', label: 'Sharpe' },
    { key: 'sortino', label: 'Sortino' },
    { key: 'volatilidade', label: 'Volatilidade' },
  ];

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        Rolling Metrics — 12M
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>
        Sharpe · Sortino · Volatilidade anualizada
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-2" style={{ marginBottom: 12 }}>
        <div style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>SHARPE BRL</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: currentSharpe > 1 ? '#22c55e' : currentSharpe > 0.5 ? '#f59e0b' : '#ef4444' }}>
            {currentSharpe.toFixed(2)}
          </div>
        </div>
        <div style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>SORTINO</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: currentSortino > 1.5 ? '#22c55e' : currentSortino > 0.75 ? '#f59e0b' : '#ef4444' }}>
            {currentSortino.toFixed(2)}
          </div>
        </div>
        <div style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>VOLATILIDADE</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b' }}>
            {`${currentVol.toFixed(1)}%`}
          </div>
        </div>
      </div>

      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveMetric(t.key)}
            style={{
              padding: '4px 12px', fontSize: 11, fontWeight: 500, borderRadius: 4,
              cursor: 'pointer', border: 'none',
              background: activeMetric === t.key ? '#3b82f6' : 'rgba(71,85,105,0.2)',
              color: activeMetric === t.key ? '#fff' : 'var(--muted)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <EChart ref={chartRef} option={option} style={{ height: 220 }} />

      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>
        Janela 12M rolling · {thinDates.length} pontos exibidos (de {rawDates.length}) · Sharpe &gt; 1 = bom
      </div>
    </div>
  );
};

export default RollingMetricsChart;
