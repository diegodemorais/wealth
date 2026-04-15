'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useUiStore } from '@/store/uiStore';

interface PerformancePeriod {
  period: string;
  targetReturn: number;
  swrdReturn: number;
}

interface AlphaVsSWRDChartProps {
  oneYear: { targetReturn: number; swrdReturn: number };
  threeYear: { targetReturn: number; swrdReturn: number };
  fiveYear: { targetReturn: number; swrdReturn: number };
  tenYear: { targetReturn: number; swrdReturn: number };
  alphaLiquidoPctYear: number;
}

const AlphaVsSWRDChart: React.FC<AlphaVsSWRDChartProps> = ({
  oneYear,
  threeYear,
  fiveYear,
  tenYear,
  alphaLiquidoPctYear,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { privacyMode } = useUiStore();

  const periods: PerformancePeriod[] = [
    { period: '1 ano', targetReturn: oneYear.targetReturn, swrdReturn: oneYear.swrdReturn },
    { period: '3 anos', targetReturn: threeYear.targetReturn, swrdReturn: threeYear.swrdReturn },
    { period: '5 anos', targetReturn: fiveYear.targetReturn, swrdReturn: fiveYear.swrdReturn },
    { period: '10 anos', targetReturn: tenYear.targetReturn, swrdReturn: tenYear.swrdReturn },
  ];

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
        labels: periods.map(p => p.period),
        datasets: [
          {
            label: 'Target (Total Alocação)',
            data: periods.map(p => p.targetReturn),
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.05)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#22c55e',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
          {
            label: 'SWRD (Global Large Cap)',
            data: periods.map(p => p.swrdReturn),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#3b82f6',
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
                return `${context.dataset.label}: ${(context.parsed.y).toFixed(2)}%`;
              },
            },
          },
        },
        scales: {
          y: {
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
  }, []);

  // Calculate alpha for each period
  const alphas = periods.map(p => ({
    period: p.period,
    alpha: p.targetReturn - p.swrdReturn,
  }));

  const avgAlpha = alphas.reduce((sum, a) => sum + a.alpha, 0) / alphas.length;

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
        Alpha vs SWRD — Performance Relativa
      </h2>

      {/* Chart */}
      <div style={{ marginBottom: '16px' }}>
        <canvas ref={chartRef} style={{ maxHeight: '300px' }} />
      </div>

      {/* Alpha breakdown */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>
          Alpha por Período (Target − SWRD)
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
          }}
        >
          {alphas.map(a => (
            <div
              key={a.period}
              style={{
                padding: '10px 12px',
                backgroundColor: a.alpha > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: a.alpha > 0 ? '1px solid #22c55e40' : '1px solid #ef444440',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>
                {a.period}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: a.alpha > 0 ? '#22c55e' : '#ef4444' }}>
                {a.alpha > 0 ? '+' : ''}{a.alpha.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Average alpha and liquid alpha */}
      <div style={{ borderTop: '1px solid rgba(71, 85, 105, 0.15)', paddingTop: '14px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>
          Sumário de Alpha
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
          }}
        >
          {/* Média de Alpha */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid #22c55e40',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
              Média Alpha
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22c55e' }}>
              {avgAlpha.toFixed(2)}%
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
              Períodos: 1y, 3y, 5y, 10y
            </div>
          </div>

          {/* Alpha Líquido (com haircut) */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #8b5cf640',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
              Alpha Líquido (Haircut 58%)
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#8b5cf6' }}>
              {(alphaLiquidoPctYear * 100).toFixed(2)}bps
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
              Retorno real anual após custos
            </div>
          </div>

          {/* Source info */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(71, 85, 105, 0.1)',
              border: '1px solid rgba(71, 85, 105, 0.4)',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
              Fonte
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4' }}>
              Target: SWRD+AVGS+AVEM <br />
              SWRD: Global Large Cap <br />
              Haircut: McLean & Pontiff 2016
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
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
        <strong>📌 Nota:</strong> Alpha positivo indica que a alocação Target supera o benchmark SWRD, graças à diversificação
        fatorial (AVGS value/quality, AVEM emerging value).
      </div>
    </div>
  );
};

export default AlphaVsSWRDChart;
