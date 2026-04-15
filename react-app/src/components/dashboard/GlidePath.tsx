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

  // Generate glide path points
  const yearsToRetirement = retirementAge - currentAge;
  const glidePathPoints: GlidePathPoint[] = [];

  for (let i = 0; i <= yearsToRetirement; i++) {
    const age = currentAge + i;
    const progress = i / yearsToRetirement; // 0 to 1
    const equityPercent =
      currentEquityPercent + (retirementEquityPercent - currentEquityPercent) * progress;
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
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
          {
            label: 'RF %',
            data: glidePathPoints.map(p => p.rfPercent),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#f59e0b',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              color: '#cbd5e1',
              font: {
                size: 12,
              },
              padding: 12,
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            titleColor: '#cbd5e1',
            bodyColor: '#94a3b8',
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
            min: 0,
            max: 100,
            grid: {
              color: 'rgba(71, 85, 105, 0.1)',
            },
            ticks: {
              color: '#94a3b8',
              callback: function (value) {
                return (value as number).toFixed(0) + '%';
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#cbd5e1',
            },
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
    <div
      style={{
        padding: '16px 18px',
        border: '1px solid rgba(71, 85, 105, 0.25)',
        borderRadius: '8px',
        marginBottom: '14px',
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
      }}
    >
      <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 14px', padding: 0 }}>
        Glide Path — Evolução de Alocação até FIRE
      </h2>

      {/* Chart */}
      <div style={{ marginBottom: '16px' }}>
        <canvas ref={chartRef} style={{ maxHeight: '300px' }} />
      </div>

      {/* Current vs Target */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
        }}
      >
        {/* Current Position */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid #3b82f640',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>
            Posição Atual (Idade {currentAge})
          </div>
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '2px' }}>
              Equity
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#3b82f6' }}>
              {currentEquityPercent.toFixed(1)}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '2px' }}>
              RF
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>
              {currentRfPercent.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Target at Retirement */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid #22c55e40',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>
            Meta FIRE (Idade {retirementAge})
          </div>
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '2px' }}>
              Equity
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#3b82f6' }}>
              {retirementEquityPercent.toFixed(1)}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '2px' }}>
              RF
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>
              {retirementRfPercent.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Migration Distance */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid #8b5cf640',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>
            Distância a Migrar
          </div>
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '2px' }}>
              Equity
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: retirementEquityPercent < currentEquityPercent ? '#ef4444' : '#22c55e' }}>
              {retirementEquityPercent < currentEquityPercent ? '−' : '+'}
              {Math.abs(retirementEquityPercent - currentEquityPercent).toFixed(1)}pp
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '2px' }}>
              Taxa Anual
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#8b5cf6' }}>
              {yearsToRetirement > 0 ? (Math.abs(retirementEquityPercent - currentEquityPercent) / yearsToRetirement).toFixed(2) : '—'}pp/a
            </div>
          </div>
        </div>
      </div>

      {/* Timeline summary */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(71, 85, 105, 0.15)',
        }}
      >
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>
          Timeline (cada {Math.max(1, Math.floor(yearsToRetirement / 5))} anos)
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '10px',
          }}
        >
          {glidePathPoints
            .filter((p, idx) => idx === 0 || idx === glidePathPoints.length - 1 || idx % Math.max(1, Math.floor(yearsToRetirement / 5)) === 0)
            .map(p => (
              <div
                key={p.year}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'rgba(71, 85, 105, 0.1)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>
                  {p.label} (idade {p.age})
                </div>
                <div style={{ color: '#3b82f6', marginBottom: '2px' }}>
                  {p.equityPercent.toFixed(0)}% Equity
                </div>
                <div style={{ color: '#f59e0b' }}>
                  {p.rfPercent.toFixed(0)}% RF
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Footer note */}
      <div
        style={{
          marginTop: '12px',
          fontSize: '0.7rem',
          color: '#64748b',
          padding: '8px',
          backgroundColor: 'rgba(71, 85, 105, 0.08)',
          borderRadius: '4px',
        }}
      >
        <strong>📌 Nota:</strong> Glide path assume redução linear de equity até a idade de aposentadoria. Revisit anualmente ou em eventos de rebalanço.
      </div>
    </div>
  );
};

export default GlidePath;
