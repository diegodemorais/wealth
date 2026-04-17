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

  const diferenca = patrimonioAtualBrl - projetadoP50Brl;
  const diferencaPct = projetadoP50Brl > 0 ? (diferenca / projetadoP50Brl) * 100 : 0;
  const statusColor = diferenca > 0 ? 'var(--success)' : diferenca < -100000 ? 'var(--destructive)' : 'var(--yellow)';
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
            backgroundColor: ['var(--cyan)', 'var(--purple)', 'var(--warning)'],
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
            titleColor: 'var(--muted)',
            bodyColor: 'var(--muted)',
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
              color: 'var(--muted)',
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
              color: 'var(--muted)',
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
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '16px' }}>
      <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Tracking FIRE — Realizado vs Projeção
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', marginBottom: '16px' }}>
          {/* Chart */}
          <div>
            <canvas ref={chartRef} style={{ maxHeight: '200px' }} />
          </div>

          {/* Status cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {/* Realizado */}
            <div style={{ padding: 'var(--space-3)', background: 'rgba(6,182,212,0.1)', border: '1px solid var(--cyan)', borderRadius: '4px' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                Patrimônio Realizado
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--cyan)' }}>
                {privacyMode ? 'R$••••' : fmtBrl(patrimonioAtualBrl)}
              </div>
            </div>

            {/* P50 Projetado */}
            <div style={{ padding: 'var(--space-3)', background: 'rgba(139,92,246,0.1)', border: '1px solid var(--purple)', borderRadius: '4px' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                P50 Projetado
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--purple)' }}>
                {privacyMode ? 'R$••••' : fmtBrl(projetadoP50Brl)}
              </div>
            </div>

            {/* Diferença */}
            <div
              style={{
                padding: 'var(--space-3)',
                borderRadius: '4px',
                backgroundColor: `${statusColor}15`,
                border: `1px solid ${statusColor}`,
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                Diferença
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: statusColor, marginBottom: '4px' }}>
                {privacyMode ? '••%' : `${diferencaPct.toFixed(1)}%`}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                {status === 'ahead' && '✅ À frente da projeção'}
                {status === 'tracking' && '📊 Acompanhando projeção'}
                {status === 'behind' && '⚠️ Atrás da projeção'}
              </div>
            </div>
          </div>
        </div>

        {/* FIRE Gatilho progress */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
            Progresso para FIRE Gatilho
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
            <span>Meta FIRE: {privacyMode ? 'R$••••' : fmtBrl(fireGatilhoBrl)}</span>
            <span>{privacyMode ? '••%' : `${((patrimonioAtualBrl / fireGatilhoBrl) * 100).toFixed(1)}%`}</span>
          </div>

          <div style={{ height: '12px', background: 'rgba(71,85,105,0.15)', borderRadius: '6px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, (patrimonioAtualBrl / fireGatilhoBrl) * 100)}%`,
                height: '100%',
                transition: 'all 0.5s',
                backgroundColor: (patrimonioAtualBrl / fireGatilhoBrl) >= 1 ? 'var(--success)' : 'var(--warning)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingFireChart;
