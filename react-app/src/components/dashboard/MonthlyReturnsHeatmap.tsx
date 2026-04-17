'use client';

import React, { useMemo } from 'react';
import { useUiStore } from '@/store/uiStore';

interface HeatmapData {
  [key: string]: number; // "YYYY-MM": decimal (0.023 = 2.3%)
}

interface MonthlyReturnsHeatmapProps {
  data?: HeatmapData;
}

const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

export function MonthlyReturnsHeatmap({ data }: MonthlyReturnsHeatmapProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  // Build year → month[1..12] → return map
  const { years, byYear } = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return { years: [], byYear: {} };

    const byYear: Record<string, Record<number, number>> = {};
    for (const [key, val] of Object.entries(data)) {
      const [y, m] = key.split('-');
      if (!byYear[y]) byYear[y] = {};
      byYear[y][parseInt(m, 10)] = val;
    }
    const years = Object.keys(byYear).sort();
    return { years, byYear };
  }, [data]);

  if (years.length === 0) {
    return (
      <div className="text-center text-xs text-muted py-6">
        Dados de retornos mensais não disponíveis
      </div>
    );
  }

  const getColor = (v: number): string => {
    const abs = Math.abs(v);
    const intensity = Math.min(abs / 0.08, 1); // saturates at ±8%
    if (v > 0) {
      const g = Math.round(100 + (211 - 100) * intensity);
      return `rgba(34, ${g}, 100, ${0.25 + 0.65 * intensity})`;
    } else {
      const r = Math.round(180 + (248 - 180) * intensity);
      return `rgba(${r}, 60, 60, ${0.25 + 0.65 * intensity})`;
    }
  };

  // Annual compound return
  const annualReturn = (yearData: Record<number, number>): number => {
    return Object.values(yearData).reduce((acc, r) => acc * (1 + r), 1) - 1;
  };

  const cellStyle: React.CSSProperties = {
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    textAlign: 'center',
    borderRadius: 3,
    padding: '3px 1px',
    minWidth: 0,
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Scroll fade — indicates horizontal scroll is available */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 32,
          background: 'linear-gradient(to right, transparent, var(--card))',
          pointerEvents: 'none',
          zIndex: 1,
          borderRadius: '0 4px 4px 0',
        }}
      />
      <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 2, width: '100%', fontSize: 'var(--text-xs)' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', paddingRight: 8, color: 'var(--muted)', fontWeight: 600, width: 36 }}></th>
            {MONTHS_PT.map(m => (
              <th key={m} style={{ color: 'var(--muted)', fontWeight: 600, textAlign: 'center', paddingBottom: 4, minWidth: 32 }}>
                {m}
              </th>
            ))}
            <th style={{ color: 'var(--muted)', fontWeight: 600, textAlign: 'center', paddingLeft: 6, minWidth: 40 }}>
              acum.
            </th>
          </tr>
        </thead>
        <tbody>
          {years.map(year => {
            const yearData = byYear[year];
            const annual = annualReturn(yearData);
            return (
              <tr key={year}>
                <td style={{ color: 'var(--muted)', fontWeight: 700, paddingRight: 8, whiteSpace: 'nowrap', fontSize: '0.68rem' }}>
                  {year}
                </td>
                {MONTHS_PT.map((_, i) => {
                  const month = i + 1;
                  const val = yearData[month];
                  if (val == null) {
                    return <td key={month}><div style={{ ...cellStyle, background: 'var(--card2)', opacity: 0.3, color: 'transparent' }}>·</div></td>;
                  }
                  const pct = val * 100;
                  return (
                    <td key={month} title={`${year}-${String(month).padStart(2,'0')}: ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`}>
                      <div style={{ ...cellStyle, background: getColor(val), color: Math.abs(val) < 0.005 ? 'var(--muted)' : '#fff' }}>
                        {privacyMode ? '·' : `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}`}
                      </div>
                    </td>
                  );
                })}
                <td>
                  <div style={{
                    ...cellStyle,
                    background: getColor(annual),
                    color: '#fff',
                    fontWeight: 700,
                    paddingLeft: 4,
                    paddingRight: 4,
                    marginLeft: 4,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    {privacyMode ? '·' : `${annual >= 0 ? '+' : ''}${(annual * 100).toFixed(1)}%`}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
