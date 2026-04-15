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

    // Limit data to last 60 points for readability
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
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#fff',
            pointBorderWidth: 1,
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
                return `Drawdown: ${(context.parsed.y).toFixed(2)}%`;
              },
            },
          },
        },
        scales: {
          y: {
            min: -100,
            max: 0,
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
              maxRotation: 45,
              minRotation: 0,
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
  }, [dates, drawdownPct]);

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
        Drawdown History — Perdas Históricas
      </h2>

      {/* Chart */}
      <div style={{ marginBottom: '16px' }}>
        <canvas ref={chartRef} style={{ maxHeight: '300px' }} />
      </div>

      {/* Key metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}
      >
        {/* Max Drawdown */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef444440',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Max Drawdown
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>
            {privacyMode ? '••' : maxDrawdown.toFixed(2)}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            Worst case (histórico)
          </div>
        </div>

        {/* Current Drawdown */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: drawdownPct[drawdownPct.length - 1] > -10
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(245, 158, 11, 0.1)',
            border: drawdownPct[drawdownPct.length - 1] > -10
              ? '1px solid #22c55e40'
              : '1px solid #f59e0b40',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Drawdown Atual
          </div>
          <div
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: drawdownPct[drawdownPct.length - 1] > -10 ? '#22c55e' : '#f59e0b',
            }}
          >
            {privacyMode ? '••' : (drawdownPct[drawdownPct.length - 1] || 0).toFixed(2)}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            Posição presente
          </div>
        </div>

        {/* Recovery Assessment */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid #8b5cf640',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Status de Recuperação
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '2px' }}>
            {drawdownPct[drawdownPct.length - 1] > -5 ? '✅ ATH' : '⚠️ Recuperando'}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            vs. máximo histórico
          </div>
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
        <strong>📌 Nota:</strong> Drawdown = queda máxima do pico anterior até o vale. Valores negativos indicam perda. Monitorar durante correções de mercado para manter disciplina.
      </div>
    </div>
  );
};

export default DrawdownHistoryChart;
