'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Alpha vs SWRD — Performance Relativa
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chart */}
        <div>
          <canvas ref={chartRef} style={{ maxHeight: '300px' }} />
        </div>

        {/* Alpha breakdown */}
        <div>
          <div className="text-sm font-semibold text-slate-200 mb-3">
            Alpha por Período (Target − SWRD)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {alphas.map(a => (
              <div
                key={a.period}
                className="p-3 rounded"
                style={{
                  backgroundColor: a.alpha > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  borderColor: a.alpha > 0 ? '#22c55e40' : '#ef444440',
                  borderWidth: '1px',
                }}
              >
                <div className="text-xs text-slate-400 mb-1">
                  {a.period}
                </div>
                <div className="text-base font-bold" style={{ color: a.alpha > 0 ? '#22c55e' : '#ef4444' }}>
                  {a.alpha > 0 ? '+' : ''}{a.alpha.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average alpha and liquid alpha */}
        <div className="pt-4 border-t border-slate-700/15">
          <div className="text-sm font-semibold text-slate-200 mb-3">
            Sumário de Alpha
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Média de Alpha */}
            <div className="p-3 bg-green-500/10 border border-green-500/25 rounded">
              <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
                Média Alpha
              </div>
              <div className="text-lg font-bold text-green-500">
                {avgAlpha.toFixed(2)}%
              </div>
              <div className="text-xs text-slate-500">
                Períodos: 1y, 3y, 5y, 10y
              </div>
            </div>

            {/* Alpha Líquido (com haircut) */}
            <div className="p-3 bg-violet-500/10 border border-violet-500/25 rounded">
              <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
                Alpha Líquido (Haircut 58%)
              </div>
              <div className="text-lg font-bold text-violet-400">
                {(alphaLiquidoPctYear * 100).toFixed(2)}bps
              </div>
              <div className="text-xs text-slate-500">
                Retorno real anual após custos
              </div>
            </div>

            {/* Source info */}
            <div className="p-3 bg-slate-700/10 border border-slate-700/40 rounded">
              <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
                Fonte
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                Target: SWRD+AVGS+AVEM <br />
                SWRD: Global Large Cap <br />
                Haircut: McLean & Pontiff 2016
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-3 p-2 text-xs text-slate-500 bg-slate-700/5 rounded">
          <strong>📌 Nota:</strong> Alpha positivo indica que a alocação Target supera o benchmark SWRD, graças à diversificação
          fatorial (AVGS value/quality, AVEM emerging value).
        </div>
      </CardContent>
    </Card>
  );
};

export default AlphaVsSWRDChart;
