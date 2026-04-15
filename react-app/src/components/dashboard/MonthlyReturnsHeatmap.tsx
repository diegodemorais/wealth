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
      <div className="bg-card border border-border rounded p-6 text-center text-xs text-muted">
        Monthly returns heatmap — data will be available soon
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-text m-0">
        Monthly Returns — 24-Month Heatmap
      </h3>

      {/* Heatmap Grid */}
      <div className="grid gap-1 p-3 bg-card rounded-lg border border-border overflow-x-auto" style={{
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
      <div className="flex justify-between text-xs text-muted mt-3">
        <div>← Worst</div>
        <div className="font-semibold text-green-400">Positive Returns</div>
        <div className="font-semibold text-red-400">Negative Returns</div>
        <div>Best →</div>
      </div>

      {/* Summary Stats */}
      {entries.length > 0 && (
        <div className="grid grid-cols-auto-fit gap-3 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
          {[
            { label: 'Positive Months', value: `${entries.filter(([, v]) => v > 0).length}/${entries.length}` },
            { label: 'Avg Return', value: privacyMode ? '••••' : fmtPct(entries.reduce((sum, [, v]) => sum + v, 0) / entries.length, 2) },
            { label: 'Best Month', value: privacyMode ? '••••' : fmtPct(Math.max(...entries.map(([, v]) => v)), 2) },
            { label: 'Worst Month', value: privacyMode ? '••••' : fmtPct(Math.min(...entries.map(([, v]) => v)), 2) },
          ].map((stat, idx) => (
            <div key={idx} className="bg-card border border-border rounded p-2">
              <div className="text-xs text-muted mb-1">{stat.label}</div>
              <div className="text-text font-semibold text-sm">{stat.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
