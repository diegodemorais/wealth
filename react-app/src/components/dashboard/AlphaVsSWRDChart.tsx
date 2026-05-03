'use client';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import React from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { fmtPrivacy } from '@/utils/privacyTransform';

interface AlphaVsSWRDChartProps {
  oneYear: { targetReturn: number; swrdReturn: number };
  threeYear: { targetReturn: number; swrdReturn: number };
  fiveYear: { targetReturn: number; swrdReturn: number };
  tenYear: { targetReturn: number; swrdReturn: number };
  alphaLiquidoPctYear: number;
}

const AlphaVsSWRDChart: React.FC<AlphaVsSWRDChartProps> = ({
  oneYear, threeYear, fiveYear, tenYear, alphaLiquidoPctYear,
}) => {
  const { privacyMode } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const periods = ['1 ano', '3 anos', '5 anos', '10 anos'];
  const targetData = [oneYear.targetReturn, threeYear.targetReturn, fiveYear.targetReturn, tenYear.targetReturn];
  const swrdData = [oneYear.swrdReturn, threeYear.swrdReturn, fiveYear.swrdReturn, tenYear.swrdReturn];
  const alphaData = targetData.map((t, i) => t - swrdData[i]);

  // Geometric mean: correct for multi-year compounding (alphaData in % units, e.g. 1.4 = 1.4%)
  const avgAlpha = alphaData.length > 0
    ? ((alphaData.reduce((p, a) => p * (1 + a / 100), 1) ** (1 / alphaData.length)) - 1) * 100
    : 0;

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: { color: '#94a3b8', fontSize: 12 },
      formatter: (params: CallbackDataParams[]) => {
        const period = (params[0] as (CallbackDataParams & { axisValue?: string; axisValueLabel?: string })).axisValue;
        const lines = params.map((p: any) => {
          const sign = p.value >= 0 ? '+' : '';
          return `<div style="display:flex;justify-content:space-between;gap:16px">
            <span>${p.marker}${p.seriesName}</span>
            <span style="font-weight:600;color:#e2e8f0">${sign}${p.value.toFixed(2)}%</span>
          </div>`;
        }).join('');
        return `<div style="font-size:11px;min-width:180px"><div style="color:#64748b;margin-bottom:6px">${period}</div>${lines}</div>`;
      },
    },
    legend: {
      show: !privacyMode,
      top: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { color: '#64748b', fontSize: 11 },
    },
    grid: { left: 48, right: 16, top: 40, bottom: 32 },
    xAxis: {
      type: 'category',
      data: periods,
      axisLine: { lineStyle: { color: '#1e293b' } },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: privacyMode ? 'transparent' : '#64748b', fontSize: 11,
        formatter: (v: number) => v.toFixed(0) + '%',
      },
      splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
    },
    series: [
      {
        name: 'Target (SWRD+AVGS+AVEM)',
        type: 'bar',
        barGap: '8%',
        barMaxWidth: 32,
        data: targetData,
        itemStyle: { color: '#22c55e', borderRadius: [3, 3, 0, 0] },
        label: {
          show: !privacyMode, position: 'top', fontSize: 10, color: '#22c55e',
          formatter: (p: any) => (p.value >= 0 ? '+' : '') + p.value.toFixed(1) + '%',
        },
      },
      {
        name: 'SWRD (benchmark)',
        type: 'bar',
        barMaxWidth: 32,
        data: swrdData,
        itemStyle: { color: '#3b82f6', borderRadius: [3, 3, 0, 0] },
        label: {
          show: !privacyMode, position: 'top', fontSize: 10, color: '#3b82f6',
          formatter: (p: any) => (p.value >= 0 ? '+' : '') + p.value.toFixed(1) + '%',
        },
      },
      {
        name: 'Alpha',
        type: 'line',
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
        itemStyle: { color: '#f59e0b', borderColor: '#fff', borderWidth: 2 },
        data: alphaData,
        label: {
          show: !privacyMode, position: 'top', fontSize: 10, color: '#f59e0b',
          formatter: (p: any) => (p.value >= 0 ? '+' : '') + p.value.toFixed(2) + '%',
        },
        // Threshold underperf — anti-pânico (factor drought academicamente esperado)
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { type: 'dashed', width: 1 },
          label: { color: '#94a3b8', fontSize: 10, position: 'insideEndTop' },
          data: [
            {
              yAxis: -5,
              lineStyle: { color: '#eab308' },
              label: { formatter: '−5pp (atenção)', color: '#eab308' },
            },
            {
              yAxis: -10,
              lineStyle: { color: '#ef4444' },
              label: { formatter: '−10pp (crítico)', color: '#ef4444' },
            },
          ],
        },
      },
    ],
  };

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        Alpha vs SWRD — Performance Relativa
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>
        Barras agrupadas por horizonte · linha amarela = alpha (Target − SWRD)
      </div>

      <EChart ref={chartRef} option={option} style={{ height: 260 }} />

      {/* Alpha cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ marginTop: 12 }}>
        {alphaData.map((a, i) => (
          <div key={periods[i]} style={{
            padding: '8px 10px', borderRadius: 6,
            background: a > 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${a > 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>{periods[i]}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: a > 0 ? '#22c55e' : '#ef4444' }}>
              {`${a >= 0 ? '+' : ''}${a.toFixed(2)}%`}
            </div>
          </div>
        ))}
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-2" style={{ marginTop: 8 }}>
        <div style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>MÉDIA ALPHA</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b' }}>
            {`${avgAlpha >= 0 ? '+' : ''}${avgAlpha.toFixed(2)}%`}
          </div>
        </div>
        <div style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>ALPHA LÍQUIDO (haircut 58%)</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#a78bfa' }}>
            {`${(alphaLiquidoPctYear * 100).toFixed(0)}bps/ano`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlphaVsSWRDChart;
