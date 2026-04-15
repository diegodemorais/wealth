'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useUiStore } from '@/store/uiStore';

interface GlidePathPoint {
  year: number;
  age: number;
  equityPercent: number;
  rfPercent: number;
  label: string;
}

interface GlidePathProps {
  currentAge: number;
  retirementAge: number;
  currentEquityPercent: number;
  currentRfPercent: number;
  retirementEquityPercent: number;
  retirementRfPercent: number;
}

const GlidePath: React.FC<GlidePathProps> = ({
  currentAge,
  retirementAge,
  currentEquityPercent,
  currentRfPercent,
  retirementEquityPercent,
  retirementRfPercent,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { privacyMode } = useUiStore();

  const yearsToRetirement = retirementAge - currentAge;
  const glidePathPoints: GlidePathPoint[] = [];

  for (let i = 0; i <= yearsToRetirement; i++) {
    const age = currentAge + i;
    const progress = i / yearsToRetirement;
    const equityPercent = currentEquityPercent + (retirementEquityPercent - currentEquityPercent) * progress;
    const rfPercent = 100 - equityPercent;

    glidePathPoints.push({
      year: i,
      age,
      equityPercent,
      rfPercent,
      label: i === 0 ? 'Hoje' : i === yearsToRetirement ? 'FIRE' : `+${i}a`,
    });
  }

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: glidePathPoints.map(p => p.label),
        datasets: [
          {
            label: 'Equity %',
            data: glidePathPoints.map(p => p.equityPercent),
            borderColor: 'var(--accent)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: 'var(--accent)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
          {
            label: 'RF %',
            data: glidePathPoints.map(p => p.rfPercent),
            borderColor: 'var(--yellow)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: 'var(--yellow)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top' as const,
            labels: { color: 'var(--muted)', font: { size: 12 }, padding: 12, usePointStyle: true },
          },
          tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            titleColor: 'var(--muted)',
            bodyColor: 'var(--muted)',
            borderColor: 'rgba(71, 85, 105, 0.5)',
            borderWidth: 1,
            padding: 8,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${(context.parsed.y).toFixed(1)}%`;
              },
            },
          },
        },
        scales: {
          y: {
            min: 0, max: 100,
            grid: { color: 'rgba(71, 85, 105, 0.1)' },
            ticks: { color: 'var(--muted)', callback: function (value) { return (value as number).toFixed(0) + '%'; } },
          },
          x: {
            grid: { display: false },
            ticks: { color: 'var(--muted)' },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [glidePathPoints]);

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Glide Path — Evolução de Alocação até FIRE
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Chart */}
        <div>
          <canvas ref={chartRef} style={{ maxHeight: '300px' }} />
        </div>

        {/* Current vs Target */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
              Posição Atual (Idade {currentAge})
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px' }}>Equity</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(59, 130, 246, 0.7)' }}>{currentEquityPercent.toFixed(1)}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px' }}>RF</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(249, 115, 22, 0.8)' }}>{currentRfPercent.toFixed(1)}%</div>
            </div>
          </div>

          <div style={{ padding: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
              Meta FIRE (Idade {retirementAge})
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px' }}>Equity</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(59, 130, 246, 0.7)' }}>{retirementEquityPercent.toFixed(1)}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px' }}>RF</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(249, 115, 22, 0.8)' }}>{retirementRfPercent.toFixed(1)}%</div>
            </div>
          </div>

          <div style={{ padding: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
              Distância a Migrar
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px' }}>Equity</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: retirementEquityPercent < currentEquityPercent ? 'var(--red)' : 'var(--green)' }}>
                {retirementEquityPercent < currentEquityPercent ? '−' : '+'}
                {Math.abs(retirementEquityPercent - currentEquityPercent).toFixed(1)}pp
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px' }}>Taxa Anual</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(168, 85, 247, 0.7)' }}>
                {yearsToRetirement > 0 ? (Math.abs(retirementEquityPercent - currentEquityPercent) / yearsToRetirement).toFixed(2) : '—'}pp/a
              </div>
            </div>
          </div>
        </div>

        {/* Timeline summary */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
            Timeline (cada {Math.max(1, Math.floor(yearsToRetirement / 5))} anos)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
            {glidePathPoints
              .filter((p, idx) => idx === 0 || idx === glidePathPoints.length - 1 || idx % Math.max(1, Math.floor(yearsToRetirement / 5)) === 0)
              .map(p => (
                <div
                  key={p.year}
                  style={{ padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.75rem' }}
                >
                  <div style={{ color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>
                    {p.label} (idade {p.age})
                  </div>
                  <div style={{ color: 'rgba(59, 130, 246, 0.7)', marginBottom: '4px' }}>{p.equityPercent.toFixed(0)}% Equity</div>
                  <div style={{ color: 'rgba(249, 115, 22, 0.8)' }}>{p.rfPercent.toFixed(0)}% RF</div>
                </div>
              ))}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--muted)', background: 'var(--bg)', borderRadius: '4px' }}>
          <strong>📌 Nota:</strong> Glide path assume redução linear de equity até a idade de aposentadoria. Revisit anualmente ou em eventos de rebalanço.
        </div>
      </div>
    </div>
  );
};

export default GlidePath;
