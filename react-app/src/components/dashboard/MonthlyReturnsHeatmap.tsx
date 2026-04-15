'use client';

import React, { useMemo } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtPct } from '@/utils/formatters';

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
      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(30, 41, 59, 0.3)',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '0.8rem',
      }}>
        Monthly returns heatmap — data will be available soon
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Title */}
      <h3 style={{
        fontSize: '0.95rem',
        fontWeight: '600',
        marginBottom: '16px',
        color: '#cbd5e1',
      }}>
        Monthly Returns — 24-Month Heatmap
      </h3>

      {/* Heatmap Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(12, entries.length)}, minmax(32px, 1fr))`,
        gap: '4px',
        padding: '12px',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '8px',
        border: '1px solid rgba(71, 85, 105, 0.25)',
        overflowX: 'auto',
      }}>
        {entries.map(([month, returnValue], idx) => (
          <div
            key={month}
            style={{
              position: 'relative',
              aspectRatio: '1',
              backgroundColor: getColor(returnValue),
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.65rem',
              fontWeight: 600,
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '12px',
        fontSize: '0.7rem',
        color: '#94a3b8',
      }}>
        <div>← Worst</div>
        <div style={{ color: '#22c55e', fontWeight: 600 }}>Positive Returns</div>
        <div style={{ color: '#ef4444', fontWeight: 600 }}>Negative Returns</div>
        <div>Best →</div>
      </div>

      {/* Summary Stats */}
      {entries.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginTop: '12px',
        }}>
          {[
            { label: 'Positive Months', value: `${entries.filter(([, v]) => v > 0).length}/${entries.length}` },
            { label: 'Avg Return', value: privacyMode ? '••••' : fmtPct(entries.reduce((sum, [, v]) => sum + v, 0) / entries.length, 2) },
            { label: 'Best Month', value: privacyMode ? '••••' : fmtPct(Math.max(...entries.map(([, v]) => v)), 2) },
            { label: 'Worst Month', value: privacyMode ? '••••' : fmtPct(Math.min(...entries.map(([, v]) => v)), 2) },
          ].map((stat, idx) => (
            <div key={idx} style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(30, 41, 59, 0.3)',
              borderRadius: '6px',
              fontSize: '0.75rem',
            }}>
              <div style={{ color: '#94a3b8', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.85rem' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
