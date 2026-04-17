'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useUiStore } from '@/store/uiStore';

interface DrawdownHistoryChartProps {
  dates: string[];
  drawdownPct: number[];
  maxDrawdown: number;
}

const DrawdownHistoryChart: React.FC<DrawdownHistoryChartProps> = ({
  dates,
  drawdownPct,
  maxDrawdown,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { privacyMode } = useUiStore();

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const displayDates = dates.slice(-60);
    const displayData = drawdownPct.slice(-60);

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: displayDates,
        datasets: [
          {
            label: 'Drawdown %',
            data: displayData,
            borderColor: 'var(--red)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            pointBackgroundColor: 'var(--red)',
            pointBorderColor: '#fff',
            pointBorderWidth: 1,
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
            labels: { color: 'var(--muted)', font: { size: 12 }, padding: 12 },
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
                return `Drawdown: ${(context.parsed.y).toFixed(2)}%`;
              },
            },
          },
        },
        scales: {
          y: {
            min: -100,
            max: 0,
            grid: { color: 'rgba(71, 85, 105, 0.1)' },
            ticks: {
              color: 'var(--muted)',
              callback: function (value) { return (value as number).toFixed(0) + '%'; },
            },
          },
          x: {
            grid: { display: false },
            ticks: { color: 'var(--muted)', maxRotation: 45, minRotation: 0 },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dates, drawdownPct]);

  const currentDd = drawdownPct[drawdownPct.length - 1] || 0;
  const currentColor = currentDd > -10 ? 'var(--green)' : 'var(--yellow)';
  const currentBg = currentDd > -10 ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)';
  const currentBorder = currentDd > -10 ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)';

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '16px' }}>
      <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Drawdown History — Perdas Históricas
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div>
          <canvas ref={chartRef} style={{ maxHeight: '300px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
          <div style={{ padding: 'var(--space-3)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Max Drawdown</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--red)' }}>
              {privacyMode ? '••%' : `${maxDrawdown.toFixed(2)}%`}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Worst case (histórico)</div>
          </div>

          <div style={{ padding: 'var(--space-3)', background: currentBg, border: `1px solid ${currentBorder}`, borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Drawdown Atual</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '4px', color: currentColor }}>
              {privacyMode ? '••%' : `${currentDd.toFixed(2)}%`}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Posição presente</div>
          </div>

          <div style={{ padding: 'var(--space-3)', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Status de Recuperação</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'rgba(168, 85, 247, 0.7)', marginBottom: '4px' }}>
              {currentDd > -5 ? 'ATH' : 'Recuperando'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>vs. máximo histórico</div>
          </div>
        </div>

        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', padding: '8px 12px', background: 'var(--bg)', borderRadius: '4px' }}>
          <strong>Nota:</strong> Drawdown = queda máxima do pico anterior até o vale. Valores negativos indicam perda. Monitorar durante correções de mercado para manter disciplina.
        </div>
      </div>
    </div>
  );
};

export default DrawdownHistoryChart;
