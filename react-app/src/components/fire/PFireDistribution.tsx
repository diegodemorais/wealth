'use client';

import { pfireColor } from '@/utils/fire';

export interface PFirePercentiles {
  p5?: number;
  p10?: number;
  p25?: number;
  p50?: number;
  p75?: number;
  p90?: number;
  p95?: number;
}

export interface PFireDistributionProps {
  base: number | null;
  percentiles?: PFirePercentiles | null;
  label?: string;
}

export function PFireDistribution({
  base,
  percentiles,
  label = 'P(FIRE) Distribuição Monte Carlo',
}: PFireDistributionProps) {
  if (!base) return null;

  // Fallback: se não houver percentis, usar range conservador
  const p5 = percentiles?.p5 ?? (base - 12);
  const p10 = percentiles?.p10 ?? (base - 10);
  const p25 = percentiles?.p25 ?? (base - 8);
  const p50 = percentiles?.p50 ?? base;
  const p75 = percentiles?.p75 ?? (base + 5);
  const p90 = percentiles?.p90 ?? (base + 8);
  const p95 = percentiles?.p95 ?? (base + 10);

  const range = [
    { label: 'p5', value: p5, desc: '5º percentil (pior 5%)' },
    { label: 'p10', value: p10, desc: '10º percentil' },
    { label: 'p25', value: p25, desc: '25º percentil (1º quartil)' },
    { label: 'p50', value: p50, desc: 'Mediana', highlight: true },
    { label: 'p75', value: p75, desc: '75º percentil (3º quartil)' },
    { label: 'p90', value: p90, desc: '90º percentil' },
    { label: 'p95', value: p95, desc: '95º percentil (melhor 5%)' },
  ];

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px 20px',
        marginTop: '12px',
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
        {label}
      </h3>

      {/* Horizontal box plot visualization */}
      <div style={{ position: 'relative', height: '40px', background: 'var(--bg)', borderRadius: '8px', marginBottom: '16px', overflow: 'hidden' }}>
        {/* Whiskers: p5 to p95 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${Math.max(0, (p5 - 50) / 0.5)}%`,
            right: `${Math.max(0, (100 - p95) / 0.5)}%`,
            height: '2px',
            background: 'rgba(255,255,255,0.2)',
            transform: 'translateY(-50%)',
          }}
        />
        {/* Box: p25 to p75 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${Math.max(0, (p25 - 50) / 0.5)}%`,
            right: `${Math.max(0, (100 - p75) / 0.5)}%`,
            height: '24px',
            background: `color-mix(in srgb, ${pfireColor(base)} 25%, transparent)`,
            border: `2px solid ${pfireColor(base)}`,
            borderRadius: '4px',
            transform: 'translateY(-50%)',
          }}
        />
        {/* Median line */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${Math.max(0, (p50 - 50) / 0.5)}%`,
            width: '3px',
            height: '28px',
            background: 'var(--text)',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
          }}
        />
      </div>

      {/* Labels */}
      <div style={{ position: 'relative', height: '20px', marginBottom: '16px', fontSize: '10px', color: 'var(--muted)' }}>
        <span style={{ position: 'absolute', left: `${Math.max(2, (p5 - 50) / 0.5)}%`, transform: 'translateX(-50%)' }}>
          {p5.toFixed(0)}%
        </span>
        <span style={{ position: 'absolute', left: `${Math.max(2, (p50 - 50) / 0.5)}%`, transform: 'translateX(-50%)', fontWeight: 600, color: 'var(--text)' }}>
          {p50.toFixed(0)}%
        </span>
        <span style={{ position: 'absolute', right: `${Math.max(2, (100 - p95) / 0.5)}%`, transform: 'translateX(50%)' }}>
          {p95.toFixed(0)}%
        </span>
      </div>

      {/* Table of percentiles */}
      <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 600, color: 'var(--muted)' }}>Percentil</th>
            <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 600, color: 'var(--muted)' }}>P(FIRE)</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 500, color: 'var(--muted)', fontSize: '10px' }}>Interpretação</th>
          </tr>
        </thead>
        <tbody>
          {range.map((r) => (
            <tr
              key={r.label}
              style={{
                borderBottom: '1px solid var(--border)',
                background: r.highlight ? 'rgba(255,255,255,0.03)' : 'transparent',
              }}
            >
              <td style={{ padding: '6px 0', color: 'var(--text)', fontWeight: r.highlight ? 600 : 400 }}>
                {r.label}
              </td>
              <td
                style={{
                  padding: '6px 0',
                  textAlign: 'right',
                  color: pfireColor(r.value),
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}
              >
                {r.value.toFixed(1)}%
              </td>
              <td style={{ padding: '6px 8px', color: 'var(--muted)', fontSize: '10px' }}>
                {r.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ margin: '12px 0 0', fontSize: '10px', color: 'var(--muted)', lineHeight: 1.4 }}>
        <strong>Leitura:</strong> P(FIRE) = {base.toFixed(1)}% é a <strong>mediana</strong> (p50). Há 50% de probabilidade de outcome melhor,
        50% pior. Intervalo p25–p75 contém 50% mais provável dos resultados.
      </p>
    </div>
  );
}
