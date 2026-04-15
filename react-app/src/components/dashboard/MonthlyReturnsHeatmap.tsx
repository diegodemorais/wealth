'use client';

import React, { useMemo } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtPct } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HeatmapData {
  [key: string]: number; // "2024-01": 0.025, etc
}

interface MonthlyReturnsHeatmapProps {
  data?: HeatmapData;
}

export function MonthlyReturnsHeatmap({ data }: MonthlyReturnsHeatmapProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  // Generate mock data if not provided (for now)
  const heatmapData = useMemo(() => {
    if (data && Object.keys(data).length > 0) {
      return data;
    }

    // Generate 24 months of mock data
    const mockData: HeatmapData = {};
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      mockData[yearMonth] = (Math.random() - 0.3) * 0.08; // -8% to +5%
    }
    return mockData;
  }, [data]);

  const entries = Object.entries(heatmapData).sort((a, b) => a[0].localeCompare(b[0]));

  // Color by return value
  const getColor = (returnValue: number): string => {
    const abs = Math.abs(returnValue);
    const intensity = Math.min(abs / 0.1, 1); // normalize to 0-10% as max

    if (returnValue > 0) {
      // Green gradient: light to dark
      const g = Math.round(34 + (221 - 34) * intensity);
      const r = Math.round(197 - (197 - 34) * intensity);
      const b = Math.round(94 - (94 - 34) * intensity);
      return `rgb(34, ${g}, 94)`;
    } else {
      // Red gradient: light to dark
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
      <Card className="bg-slate-900/30">
        <CardContent className="text-xs text-slate-400 text-center py-6">
          Monthly returns heatmap — data will be available soon
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-200">
        Monthly Returns — 24-Month Heatmap
      </h3>

      {/* Heatmap Grid */}
      <div className="grid gap-1 p-3 bg-slate-900/50 rounded-lg border border-slate-700/25 overflow-x-auto"
        style={{
          gridTemplateColumns: `repeat(${Math.min(12, entries.length)}, minmax(32px, 1fr))`,
        }}
      >
        {entries.map(([month, returnValue], idx) => (
          <div
            key={month}
            className="aspect-square rounded flex items-center justify-center cursor-pointer transition-all text-xs font-semibold"
            style={{
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
      <div className="flex justify-between text-xs text-slate-400 mt-3">
        <div>← Worst</div>
        <div className="font-semibold text-green-500">Positive Returns</div>
        <div className="font-semibold text-red-500">Negative Returns</div>
        <div>Best →</div>
      </div>

      {/* Summary Stats */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Positive Months', value: `${entries.filter(([, v]) => v > 0).length}/${entries.length}` },
            { label: 'Avg Return', value: privacyMode ? '••••' : fmtPct(entries.reduce((sum, [, v]) => sum + v, 0) / entries.length, 2) },
            { label: 'Best Month', value: privacyMode ? '••••' : fmtPct(Math.max(...entries.map(([, v]) => v)), 2) },
            { label: 'Worst Month', value: privacyMode ? '••••' : fmtPct(Math.min(...entries.map(([, v]) => v)), 2) },
          ].map((stat, idx) => (
            <Card key={idx} className="bg-slate-900/30">
              <CardContent className="p-2">
                <div className="text-xs text-slate-400 mb-1">{stat.label}</div>
                <div className="text-slate-200 font-semibold text-sm">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
