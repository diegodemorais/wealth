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
            borderColor: 'var(--success)',
            backgroundColor: 'rgba(34, 197, 94, 0.05)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: 'var(--success)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
          {
            label: 'SWRD (Global Large Cap)',
            data: periods.map(p => p.swrdReturn),
            borderColor: 'var(--primary)',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: 'var(--primary)',
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
              color: 'var(--muted)',
              font: { size: 12 },
              padding: 12,
              usePointStyle: true,
            },
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
                return `${context.dataset.label}: ${(context.parsed.y).toFixed(2)}%`;
              },
            },
          },
        },
        scales: {
          y: {
            grid: { color: 'rgba(71, 85, 105, 0.1)' },
            ticks: {
              color: 'var(--muted)',
              callback: function (value) {
                return (value as number).toFixed(0) + '%';
              },
            },
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
  }, []);

  const alphas = periods.map(p => ({
    period: p.period,
    alpha: p.targetReturn - p.swrdReturn,
  }));

  const avgAlpha = alphas.reduce((sum, a) => sum + a.alpha, 0) / alphas.length;

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-5">
      <h2 className="text-sm font-semibold text-text mb-4 mt-0">
        Alpha vs SWRD — Performance Relativa
      </h2>

      <div className="flex flex-col gap-4">
        {/* Chart */}
        <div>
          <canvas ref={chartRef} style={{ maxHeight: '300px' }} />
        </div>

        {/* Alpha breakdown */}
        <div>
          <div className="text-sm font-semibold text-text mb-3">
            Alpha por Período (Target − SWRD)
          </div>

          <div className="grid grid-cols-auto-fit gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
            {alphas.map(a => (
              <div
                key={a.period}
                className={`p-3 rounded border ${a.alpha > 0 ? 'bg-green-900/10 border-green-600/25' : 'bg-red-900/10 border-red-600/25'}`}
              >
                <div className="text-xs text-muted mb-1">
                  {a.period}
                </div>
                <div className={`text-base font-bold ${a.alpha > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {a.alpha > 0 ? '+' : ''}{a.alpha.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="pt-4 border-t border-border">
          <div className="text-sm font-semibold text-text mb-3">
            Sumário de Alpha
          </div>

          <div className="grid grid-cols-auto-fit gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            <div className="p-3 rounded border bg-green-900/10 border-green-600/25">
              <div className="text-xs text-muted mb-1 uppercase font-semibold">
                Média Alpha
              </div>
              <div className="text-lg font-bold text-green-400">
                {avgAlpha.toFixed(2)}%
              </div>
              <div className="text-xs text-muted">
                Períodos: 1y, 3y, 5y, 10y
              </div>
            </div>

            <div className="p-3 rounded border bg-violet-900/10 border-violet-600/25">
              <div className="text-xs text-muted mb-1 uppercase font-semibold">
                Alpha Líquido (Haircut 58%)
              </div>
              <div className="text-lg font-bold text-violet-300">
                {(alphaLiquidoPctYear * 100).toFixed(2)}bps
              </div>
              <div className="text-xs text-muted">
                Retorno real anual após custos
              </div>
            </div>

            <div className="p-3 rounded border bg-secondary/20 border-border">
              <div className="text-xs text-muted mb-1 uppercase font-semibold">
                Fonte
              </div>
              <div className="text-xs text-text leading-relaxed">
                Target: SWRD+AVGS+AVEM<br />
                SWRD: Global Large Cap<br />
                Haircut: McLean &amp; Pontiff 2016
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="p-3 text-xs text-muted bg-secondary/20 rounded">
          <strong>Nota:</strong> Alpha positivo indica que a alocação Target supera o benchmark SWRD, graças à diversificação
          fatorial (AVGS value/quality, AVEM emerging value).
        </div>
      </div>
    </div>
  );
};

export default AlphaVsSWRDChart;
