'use client';

import { fmtPrivacy } from '@/utils/privacyTransform';

export interface McTrajectoryPercentiles {
  year: number;
  p10?: number;  // 10th percentile portfolio value
  p25?: number;  // 25th percentile
  p50?: number;  // Median (50th)
  p75?: number;  // 75th percentile
  p90?: number;  // 90th percentile
}

export interface SequenceOfReturnsHeatmapProps {
  /** Array of 'YYYY-MM' date strings from fire_trilha */
  dates: string[];
  /** Portfolio value in BRL matching each date */
  trilhaBrl: (number | null)[];
  /** Annual spending in BRL (custo_vida_base) */
  spending: number;
  /** Pre-computed MC trajectory percentiles (optional) */
  mcTrajectories?: McTrajectoryPercentiles[];
}

function pFireFromSWR(swr: number): number {
  if (swr <= 0.025) return 100;
  if (swr <= 0.030) return 85 + (0.030 - swr) / 0.005 * 15;
  if (swr <= 0.035) return 70 + (0.035 - swr) / 0.005 * 15;
  if (swr <= 0.040) return 55 + (0.040 - swr) / 0.005 * 15;
  return Math.max(30, 55 - (swr - 0.040) / 0.005 * 15);
}

function cellColor(p: number) {
  if (p >= 85) return '#16a34a';
  if (p >= 75) return '#ca8a04';
  return '#dc2626';
}

export default function SequenceOfReturnsHeatmap({
  dates,
  trilhaBrl,
  spending,
  mcTrajectories,
}: SequenceOfReturnsHeatmapProps) {
  const years = [2035, 2036, 2037, 2038, 2039, 2040];
  const useMcData = mcTrajectories && mcTrajectories.length > 0;

  // When using MC data, show percentile columns; otherwise show synthetic return scenarios
  const scenarios = useMcData
    ? [
        { label: 'p10', key: 'p10', desc: '10º percentil' },
        { label: 'p25', key: 'p25', desc: '25º percentil' },
        { label: 'p50', key: 'p50', desc: 'Mediana' },
        { label: 'p75', key: 'p75', desc: '75º percentil' },
        { label: 'p90', key: 'p90', desc: '90º percentil' },
      ] as const
    : [
        { label: '-30%', scenario: -0.30 },
        { label: '-20%', scenario: -0.20 },
        { label: '-10%', scenario: -0.10 },
        { label: '0%', scenario: 0 },
        { label: '+10%', scenario: 0.10 },
        { label: '+20%', scenario: 0.20 },
      ] as const;

  function getPatForYear(yr: number): number {
    const idx = dates.indexOf(`${yr}-12`);
    if (idx >= 0) return trilhaBrl[idx] ?? 0;
    const altIdx = dates.indexOf(`${yr}-01`);
    return altIdx >= 0 ? trilhaBrl[altIdx] ?? 0 : 0;
  }

  function getMcPatForYear(yr: number, key: 'p10' | 'p25' | 'p50' | 'p75' | 'p90'): number {
    if (!mcTrajectories) return 0;
    const traj = mcTrajectories.find(t => t.year === yr);
    return traj?.[key] ?? 0;
  }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
        Sequence of Returns Heatmap {useMcData && '(Monte Carlo)'}
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ fontSize: 11, borderCollapse: 'collapse', width: '100%', minWidth: 360 }}>
          <thead>
            <tr>
              <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>
                {useMcData ? 'Ano FIRE' : 'Ano FIRE'}
              </th>
              {scenarios.map((s) => (
                <th key={s.label} style={{ padding: '4px 6px', color: 'var(--muted)', fontWeight: 500 }}>
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map(yr => {
              return (
                <tr key={yr}>
                  <td style={{ padding: '4px 6px', fontWeight: 600, color: 'var(--text)' }}>{yr}</td>
                  {useMcData
                    ? (scenarios as typeof scenarios).map((s) => {
                        const key = s.key as 'p10' | 'p25' | 'p50' | 'p75' | 'p90';
                        const pat = getMcPatForYear(yr, key);
                        const swr = pat > 0 ? spending / pat : 0.1;
                        const p = pFireFromSWR(swr);
                        return (
                          <td key={s.label} style={{ padding: '4px 6px', textAlign: 'center', background: cellColor(p), color: '#fff', borderRadius: 3 }}>
                            {p.toFixed(0)}%
                          </td>
                        );
                      })
                    : (scenarios as typeof scenarios).map((s) => {
                        const basePat = getPatForYear(yr);
                        const adjPat = basePat * (1 + (s as any).scenario);
                        const swr = adjPat > 0 ? spending / adjPat : 0.1;
                        const p = pFireFromSWR(swr);
                        return (
                          <td key={s.label} style={{ padding: '4px 6px', textAlign: 'center', background: cellColor(p), color: '#fff', borderRadius: 3 }}>
                            {p.toFixed(0)}%
                          </td>
                        );
                      })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>
        {useMcData
          ? 'Baseado em trajetórias Monte Carlo reais (10k iterações). Percentis refletem distribuição de outcomes.'
          : 'Modelo simplificado (cenários sintéticos) · aba FIRE usa MC completo'}
      </div>
    </div>
  );
}
