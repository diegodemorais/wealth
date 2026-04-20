'use client';

import React from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useUiStore } from '@/store/uiStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Ma200wData {
  current_price_usd: number;
  ma200w_usd: number;
  pct_above_ma: number;
  zone: string;
  last_touch_below: string | null;
  series: Array<{
    date: string;
    price_usd: number;
    ma200w_usd: number;
    growth_rate_pct: number;
  }>;
}

interface MvrvZscoreData {
  current_value: number;
  signal: string;
  zone: string;
  market_cap_usd: number | null;
  realized_cap_usd: number | null;
  series: Array<{
    date: string;
    zscore: number;
    market_cap_usd?: number | null;
    realized_cap_usd?: number | null;
  }>;
  thresholds: Record<string, number>;
  z_range?: { min: number; max: number };
  note?: string;
}

export interface BtcIndicatorsChartProps {
  ma200w: Ma200wData;
  mvrvZscore: MvrvZscoreData;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtUsd(val: number | null | undefined, privacyMode: boolean): string {
  if (privacyMode) return '$••••';
  if (val == null) return '—';
  if (val >= 1_000_000_000_000) return `$${(val / 1_000_000_000_000).toFixed(2)}T`;
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
  return `$${val.toFixed(0)}`;
}

// Color for 200WMA growth_rate_pct
function growthColor(rate: number): string {
  if (rate < 10) return '#3b82f6';   // azul — cool
  if (rate < 30) return '#f59e0b';   // laranja — warning
  return '#ef4444';                   // vermelho — euphoria
}

// Zone badge colors for 200WMA
function zoneStyle(zone: string): { color: string; bg: string; border: string } {
  switch (zone) {
    case 'below':  return { color: '#22c55e', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)' };
    case 'near':   return { color: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.25)' };
    case 'above':  return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' };
    case 'euphoria': return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' };
    default: return { color: 'var(--muted)', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' };
  }
}

// Signal badge colors for MVRV
function signalStyle(signal: string): { color: string; bg: string; border: string } {
  switch (signal) {
    case 'accumulate': return { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' };
    case 'neutral':    return { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' };
    case 'caution':    return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' };
    case 'trim':       return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' };
    default: return { color: 'var(--muted)', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' };
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InlineBadge({
  label, value, colorStyle,
}: {
  label: string;
  value: string;
  colorStyle: { color: string; bg: string; border: string };
}) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '1px 7px',
        borderRadius: 4,
        border: `1px solid ${colorStyle.border}`,
        background: colorStyle.bg,
        color: colorStyle.color,
        fontFamily: 'monospace',
      }}>
        {value}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// 200WMA Chart
// ---------------------------------------------------------------------------

function Chart200WMA({ data, privacyMode }: { data: Ma200wData; privacyMode: boolean }) {
  const series = data.series;
  const dates = series.map(s => s.date);
  const prices = series.map(s => s.price_usd);
  const maValues = series.map(s => s.ma200w_usd);
  const growthRates = series.map(s => s.growth_rate_pct);

  const priceColorData = prices.map((p, i) => ({
    value: p,
    itemStyle: { color: growthColor(growthRates[i]) },
  }));

  const option = {
    backgroundColor: 'transparent',
    grid: { left: 58, right: 16, top: 36, bottom: 40 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
        interval: Math.floor(dates.length / 6),
        rotate: 30,
        formatter: (val: string) => {
          const parts = val.split('-');
          return parts.length >= 2 ? `${parts[1]}/${parts[0].slice(2)}` : val;
        },
      },
      axisLine: { lineStyle: { color: '#1e293b' } },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        show: !privacyMode,
        color: '#64748b',
        fontSize: 10,
        formatter: (v: number) => {
          if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
          if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
          return `$${v}`;
        },
      },
      splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: { color: '#f1f5f9', fontSize: 11 },
      formatter: (params: unknown) => {
        const arr = params as Array<{ dataIndex: number }>;
        if (!arr || !arr[0]) return '';
        const idx = arr[0].dataIndex;
        const s = series[idx];
        if (!s) return '';
        const priceStr = privacyMode ? '$••••' : `$${s.price_usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        const maStr = privacyMode ? '$••••' : `$${s.ma200w_usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        const pctDiff = ((s.price_usd / s.ma200w_usd - 1) * 100).toFixed(1);
        const sign = parseFloat(pctDiff) >= 0 ? '+' : '';
        return `<div style="font-size:11px;line-height:1.6;min-width:170px">
          <div style="color:#64748b;margin-bottom:4px">${s.date}</div>
          <div>Preço: <b style="color:#e2e8f0">${priceStr}</b></div>
          <div>200WMA: <b style="color:#3b82f6">${maStr}</b></div>
          <div>vs MA: <b style="color:${parseFloat(pctDiff) >= 0 ? '#f59e0b' : '#22c55e'}">${sign}${pctDiff}%</b></div>
        </div>`;
      },
    },
    legend: {
      top: 4, right: 0,
      textStyle: { color: '#64748b', fontSize: 11 },
      icon: 'roundRect',
      itemWidth: 14, itemHeight: 4,
    },
    series: [
      {
        name: 'Preço BTC/USD',
        type: 'line',
        data: priceColorData,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#f59e0b' },
      },
      {
        name: '200-Week MA',
        type: 'line',
        data: maValues,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#3b82f6', width: 2.5 },
      },
    ],
  };

  return (
    <EChart
      option={option}
      style={{ height: 280, width: '100%' }}
      notMerge={true}
    />
  );
}

// ---------------------------------------------------------------------------
// MVRV Z-Score Chart
// ---------------------------------------------------------------------------

function ChartMVRV({ data, privacyMode }: { data: MvrvZscoreData; privacyMode: boolean }) {
  const series = data.series;
  const dates = series.map(s => s.date);
  const zscores = series.map(s => s.zscore);
  const currentZ = data.current_value;
  const thr = data.thresholds;

  const yMin = Math.min(-0.3, Math.min(...zscores) - 0.1);
  const yMax = Math.max(thr.top_signal + 0.2, Math.max(...zscores) + 0.1);

  const option = {
    backgroundColor: 'transparent',
    grid: { left: 44, right: 12, top: 28, bottom: 40 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
        interval: Math.floor(dates.length / 6),
        rotate: 30,
        formatter: (val: string) => {
          const parts = val.split('-');
          return parts.length >= 2 ? `${parts[1]}/${parts[0].slice(2)}` : val;
        },
      },
      axisLine: { lineStyle: { color: '#1e293b' } },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: yMin,
      max: yMax,
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
        formatter: (v: number) => v.toFixed(1),
      },
      splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: '#334155',
      textStyle: { color: '#f1f5f9', fontSize: 11 },
      formatter: (params: unknown) => {
        const arr = params as Array<{ dataIndex: number }>;
        if (!arr || !arr[0]) return '';
        const idx = arr[0].dataIndex;
        const s = series[idx];
        if (!s) return '';
        let zone = 'Neutro';
        if (s.zscore < 0) zone = 'Capitulação';
        else if (s.zscore < thr.neutral) zone = 'Acumulação';
        else if (s.zscore < thr.caution) zone = 'Neutro';
        else if (s.zscore < thr.overheated) zone = 'Sobreaquecido';
        else zone = 'Topo';
        const mcStr = (s.market_cap_usd && !privacyMode)
          ? `<div>Market Cap: ${fmtUsd(s.market_cap_usd, false)}</div>`
          : '';
        const rcStr = (s.realized_cap_usd && !privacyMode)
          ? `<div>Realized Cap: ${fmtUsd(s.realized_cap_usd, false)}</div>`
          : '';
        return `
          <div style="font-size:11px;line-height:1.5">
            <div style="margin-bottom:4px;font-weight:600;color:#94a3b8">${s.date}</div>
            <div>MVRV Z-Score: <b>${s.zscore.toFixed(3)}</b></div>
            <div>Zona: <b>${zone}</b></div>
            ${mcStr}${rcStr}
          </div>
        `;
      },
    },
    series: [
      {
        name: 'MVRV Z-Score',
        type: 'line',
        data: zscores,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#3b82f6', width: 2 },
        markArea: {
          silent: true,
          data: [
            [
              { yAxis: thr.overheated, itemStyle: { color: 'rgba(239,68,68,0.08)' } },
              { yAxis: yMax },
            ],
            [
              { yAxis: thr.caution, itemStyle: { color: 'rgba(245,158,11,0.06)' } },
              { yAxis: thr.overheated },
            ],
            [
              { yAxis: thr.neutral, itemStyle: { color: 'rgba(148,163,184,0.04)' } },
              { yAxis: thr.caution },
            ],
            [
              { yAxis: thr.accumulation, itemStyle: { color: 'rgba(34,197,94,0.06)' } },
              { yAxis: thr.neutral },
            ],
            [
              { yAxis: yMin, itemStyle: { color: 'rgba(34,197,94,0.12)' } },
              { yAxis: thr.accumulation },
            ],
          ],
        },
        markLine: {
          silent: true,
          symbol: ['none', 'none'],
          data: [
            {
              yAxis: currentZ,
              lineStyle: { type: 'dashed', color: '#fbbf24', width: 1.5 },
              label: {
                show: true,
                formatter: `Atual ${currentZ.toFixed(2)}`,
                color: '#fbbf24',
                fontSize: 10,
                position: 'end',
              },
            },
          ],
        },
      },
    ],
    legend: {
      top: 4,
      right: 0,
      textStyle: { color: '#64748b', fontSize: 10 },
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 4,
    },
  };

  return (
    <EChart
      option={option}
      style={{ height: 280, width: '100%' }}
      notMerge={true}
    />
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function BtcIndicatorsChart({ ma200w, mvrvZscore }: BtcIndicatorsChartProps) {
  const { privacyMode } = useUiStore();

  const zStyle = zoneStyle(ma200w.zone);
  const sStyle = signalStyle(mvrvZscore.signal);

  const zoneLabels: Record<string, string> = {
    below: 'Abaixo da MA',
    near: 'Próximo da MA',
    above: 'Acima da MA',
    euphoria: 'Euforia',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Compact status strip */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)',
        borderRadius: 7,
        fontSize: 11,
      }}>
        <InlineBadge
          label="200WMA"
          value={`${ma200w.pct_above_ma >= 0 ? '+' : ''}${ma200w.pct_above_ma.toFixed(1)}% · ${zoneLabels[ma200w.zone] ?? ma200w.zone}`}
          colorStyle={zStyle}
        />
        <span style={{ color: 'var(--border)', userSelect: 'none' }}>|</span>
        <InlineBadge
          label="MVRV Z"
          value={`${mvrvZscore.current_value.toFixed(2)} · ${mvrvZscore.zone}`}
          colorStyle={sStyle}
        />
        {ma200w.last_touch_below && (
          <>
            <span style={{ color: 'var(--border)', userSelect: 'none' }}>|</span>
            <span style={{ fontSize: 10, color: 'var(--muted)' }}>
              Último toque abaixo: {ma200w.last_touch_below}
            </span>
          </>
        )}
        <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>
          BTC/USD spot · HODL11 proxy B3
        </span>
      </div>

      {/* Chart 1: 200WMA */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          200-Week Moving Average Heatmap
        </div>
        <Chart200WMA data={ma200w} privacyMode={privacyMode} />
        <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
          {[
            { cor: '#3b82f6', label: '0–20% acima · acumular' },
            { cor: '#f59e0b', label: '20–80% acima · hold' },
            { cor: '#ef4444', label: '>80% acima · euforia' },
          ].map(item => (
            <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#64748b' }}>
              <span style={{ width: 20, height: 2, background: item.cor, display: 'inline-block', borderRadius: 1 }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', opacity: 0.5 }} />

      {/* Chart 2: MVRV Z-Score */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          MVRV Z-Score
        </div>
        <ChartMVRV data={mvrvZscore} privacyMode={privacyMode} />
        <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
          {[
            { cor: 'rgba(34,197,94,0.5)', label: `< ${mvrzThreshold(mvrvZscore, 'neutral')} · acumular` },
            { cor: 'rgba(148,163,184,0.3)', label: 'neutro' },
            { cor: 'rgba(245,158,11,0.5)', label: `> ${mvrzThreshold(mvrvZscore, 'caution')} · sobreaquecido` },
            { cor: 'rgba(239,68,68,0.5)', label: `> ${mvrzThreshold(mvrvZscore, 'overheated')} · topo` },
          ].map(item => (
            <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#64748b' }}>
              <span style={{ width: 10, height: 10, background: item.cor, display: 'inline-block', borderRadius: 2 }} />
              {item.label}
            </span>
          ))}
        </div>
        {mvrvZscore.note && (
          <p style={{ fontSize: 9, color: 'var(--muted)', marginTop: 4, opacity: 0.6, lineHeight: 1.4 }}>
            {mvrvZscore.note}
          </p>
        )}
      </div>
    </div>
  );
}

function mvrzThreshold(data: MvrvZscoreData, key: string): string {
  const val = data.thresholds[key];
  return val != null ? val.toFixed(1) : '?';
}
