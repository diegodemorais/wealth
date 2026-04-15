'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useUiStore } from '@/store/uiStore';

interface TrackingFireChartProps {
  realizadoBrl: number;
  projetadoP50Brl: number;
  fireGatilhoBrl: number;
  patrimonioAtualBrl: number;
}

const TrackingFireChart: React.FC<TrackingFireChartProps> = ({
  realizadoBrl,
  projetadoP50Brl,
  fireGatilhoBrl,
  patrimonioAtualBrl,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { privacyMode } = useUiStore();

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Calculate status
  const diferenca = patrimonioAtualBrl - projetadoP50Brl;
  const diferencaPct = projetadoP50Brl > 0 ? (diferenca / projetadoP50Brl) * 100 : 0;
  const statusColor = diferenca > 0 ? '#22c55e' : diferenca < -100000 ? '#ef4444' : '#eab308';
  const status = diferenca > 0 ? 'ahead' : diferenca < -100000 ? 'behind' : 'tracking';

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Realizado', 'P50 Projetado', 'FIRE Gatilho'],
        datasets: [
          {
            label: 'Patrimônio (BRL)',
            data: [realizadoBrl, projetadoP50Brl, fireGatilhoBrl],
            backgroundColor: ['#06b6d4', '#8b5cf6', '#f59e0b'],
            borderColor: 'rgba(15, 23, 42, 1)',
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
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
                const value = context.parsed.x;
                return `R$ ${(value / 1000000).toFixed(2)}M`;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: 'rgba(71, 85, 105, 0.1)',
            },
            ticks: {
              color: '#94a3b8',
              callback: function (value) {
                return `R$ ${(value as number / 1000000).toFixed(1)}M`;
              },
            },
          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#cbd5e1',
              font: {
                weight: 'bold',
              },
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
  }, [realizadoBrl, projetadoP50Brl, fireGatilhoBrl]);

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
        Tracking FIRE — Realizado vs Projeção
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        {/* Chart */}
        <div>
          <canvas ref={chartRef} style={{ maxHeight: '200px' }} />
        </div>

        {/* Status cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Realizado */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid #06b6d4',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
              Patrimônio Realizado
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#06b6d4' }}>
              {privacyMode ? 'R$••••' : fmtBrl(patrimonioAtualBrl)}
            </div>
          </div>

          {/* P50 Projetado */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #8b5cf6',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
              P50 Projetado
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#8b5cf6' }}>
              {privacyMode ? 'R$••••' : fmtBrl(projetadoP50Brl)}
            </div>
          </div>

          {/* Diferença */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: `${statusColor}15`,
              border: `1px solid ${statusColor}`,
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
              Diferença
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: statusColor, marginBottom: '2px' }}>
              {privacyMode ? '••' : `${diferencaPct.toFixed(1)}%`}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {status === 'ahead' && '✅ À frente da projeção'}
              {status === 'tracking' && '📊 Acompanhando projeção'}
              {status === 'behind' && '⚠️ Atrás da projeção'}
            </div>
          </div>
        </div>
      </div>

      {/* FIRE Gatilho progress */}
      <div style={{ borderTop: '1px solid rgba(71, 85, 105, 0.15)', paddingTop: '14px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
          Progresso para FIRE Gatilho
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
            fontSize: '0.75rem',
            color: '#94a3b8',
          }}
        >
          <span>Meta FIRE: {privacyMode ? 'R$••••' : fmtBrl(fireGatilhoBrl)}</span>
          <span>{privacyMode ? '••' : `${((patrimonioAtualBrl / fireGatilhoBrl) * 100).toFixed(1)}%`}</span>
        </div>

        <div
          style={{
            height: '12px',
            backgroundColor: 'rgba(71, 85, 105, 0.15)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, (patrimonioAtualBrl / fireGatilhoBrl) * 100)}%`,
              backgroundColor: (patrimonioAtualBrl / fireGatilhoBrl) >= 1 ? '#22c55e' : '#f59e0b',
              transition: 'width 0.5s',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TrackingFireChart;
