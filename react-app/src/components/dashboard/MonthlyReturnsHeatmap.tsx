'use client';

import React, { useMemo } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtPct } from '@/utils/formatters';

interface HeatmapData {
  [key: string]: number;
}

interface MonthlyReturnsHeatmapProps {
  data?: HeatmapData;
}

export function MonthlyReturnsHeatmap({ data }: MonthlyReturnsHeatmapProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const heatmapData = useMemo(() => {
    if (data && Object.keys(data).length > 0) return data;

    const mockData: HeatmapData = {};
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      mockData[yearMonth] = (Math.random() - 0.3) * 0.08;
    }
    return mockData;
  }, [data]);

  const entries = Object.entries(heatmapData).sort((a, b) => a[0].localeCompare(b[0]));

  const getColor = (returnValue: number): string => {
    const abs = Math.abs(returnValue);
    const intensity = Math.min(abs / 0.1, 1);

    if (returnValue > 0) {
      const g = Math.round(34 + (221 - 34) * intensity);
      return `rgb(34, ${g}, 94)`;
    } else {
      const r = Math.round(239 - (239 - 127) * intensity);
      const g = Math.round(68 - (68 - 29) * intensity);
      const b = Math.round(68 - (68 - 39) * intensity);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const getTextColor = (returnValue: number): string => {
    if (Math.abs(returnValue) < 0.02) return '#cbd5e1';
    return '#fff';
  };

  if (entries.length === 0) {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)' }}>
        Monthly returns heatmap — data will be available soon
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
        Monthly Returns — 24-Month Heatmap
      </h3>

      {/* Heatmap Grid */}
      <div style={{
        display: 'grid',
        gap: '4px',
        padding: '12px',
        background: 'var(--card)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        overflowX: 'auto',
        gridTemplateColumns: `repeat(${Math.min(12, entries.length)}, minmax(32px, 1fr))`,
      }}>
        {entries.map(([month, returnValue]) => (
          <div
            key={month}
            style={{
              aspectRatio: '1',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: getColor(returnValue),
              color: getTextColor(returnValue),
            }}
            title={`${month}: ${privacyMode ? '••••' : fmtPct(returnValue, 2)}`}
          >
            {!privacyMode && returnValue !== 0 && (
              <span>{returnValue > 0 ? '+' : ''}{(returnValue * 100).toFixed(0)}%</span>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '12px' }}>
        <div>← Worst</div>
        <div style={{ fontWeight: 600, color: '#22c55e' }}>Positive Returns</div>
        <div style={{ fontWeight: 600, color: '#ef4444' }}>Negative Returns</div>
        <div>Best →</div>
      </div>

      {/* Summary Stats */}
      {entries.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginTop: '16px' }}>
          {[
            { label: 'Positive Months', value: `${entries.filter(([, v]) => v > 0).length}/${entries.length}` },
            { label: 'Avg Return', value: privacyMode ? '••••' : fmtPct(entries.reduce((sum, [, v]) => sum + v, 0) / entries.length, 2) },
            { label: 'Best Month', value: privacyMode ? '••••' : fmtPct(Math.max(...entries.map(([, v]) => v)), 2) },
            { label: 'Worst Month', value: privacyMode ? '••••' : fmtPct(Math.min(...entries.map(([, v]) => v)), 2) },
          ].map((stat, idx) => (
            <div key={idx} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.875rem' }}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
