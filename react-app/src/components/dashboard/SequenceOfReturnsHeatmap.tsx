'use client';

import { fmtPrivacy } from '@/utils/privacyTransform';

export interface SequenceOfReturnsHeatmapProps {
  /** Array of 'YYYY-MM' date strings from fire_trilha */
  dates: string[];
  /** Portfolio value in BRL matching each date */
  trilhaBrl: (number | null)[];
  /** Annual spending in BRL (custo_vida_base) */
  spending: number;
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
}: SequenceOfReturnsHeatmapProps) {
  const years = [2035, 2036, 2037, 2038, 2039, 2040];
  const returns = [-0.30, -0.20, -0.10, 0, 0.10, 0.20];
  const returnLabels = ['-30%', '-20%', '-10%', '0%', '+10%', '+20%'];

  function getPatForYear(yr: number): number {
    const idx = dates.indexOf(`${yr}-12`);
    if (idx >= 0) return trilhaBrl[idx] ?? 0;
    const altIdx = dates.indexOf(`${yr}-01`);
    return altIdx >= 0 ? trilhaBrl[altIdx] ?? 0 : 0;
  }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Sequence of Returns Heatmap</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ fontSize: 11, borderCollapse: 'collapse', width: '100%', minWidth: 360 }}>
          <thead>
            <tr>
              <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>Ano FIRE</th>
              {returnLabels.map(r => (
                <th key={r} style={{ padding: '4px 6px', color: 'var(--muted)', fontWeight: 500 }}>{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map(yr => {
              const basePat = getPatForYear(yr);
              return (
                <tr key={yr}>
                  <td style={{ padding: '4px 6px', fontWeight: 600, color: 'var(--text)' }}>{yr}</td>
                  {returns.map((r, ri) => {
                    const adjPat = basePat * (1 + r);
                    const swr = adjPat > 0 ? spending / adjPat : 0.1;
                    const p = pFireFromSWR(swr);
                    return (
                      <td key={ri} style={{ padding: '4px 6px', textAlign: 'center', background: cellColor(p), color: '#fff', borderRadius: 3 }}>
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
        Modelo simplificado · aba FIRE usa MC completo
      </div>
    </div>
  );
}
