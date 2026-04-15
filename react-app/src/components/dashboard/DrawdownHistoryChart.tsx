'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Drawdown History — Perdas Históricas
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chart */}
        <div className="mb-4">
          <canvas ref={chartRef} className="max-h-[300px]" />
        </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Max Drawdown */}
        <div className="p-3 bg-red-500/10 border border-red-500/25 rounded">
          <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
            Max Drawdown
          </div>
          <div className="text-lg font-bold text-red-500">
            {privacyMode ? '••' : maxDrawdown.toFixed(2)}%
          </div>
          <div className="text-xs text-slate-500">
            Worst case (histórico)
          </div>
        </div>

        {/* Current Drawdown */}
        <div
          className="p-3 border rounded"
          style={{
            backgroundColor: drawdownPct[drawdownPct.length - 1] > -10
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(245, 158, 11, 0.1)',
            borderColor: drawdownPct[drawdownPct.length - 1] > -10
              ? 'rgba(34, 197, 94, 0.25)'
              : 'rgba(245, 158, 11, 0.25)',
          }}
        >
          <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
            Drawdown Atual
          </div>
          <div
            className="text-lg font-bold mb-1"
            style={{
              color: drawdownPct[drawdownPct.length - 1] > -10 ? '#22c55e' : '#f59e0b',
            }}
          >
            {privacyMode ? '••' : (drawdownPct[drawdownPct.length - 1] || 0).toFixed(2)}%
          </div>
          <div className="text-xs text-slate-500">
            Posição presente
          </div>
        </div>

        {/* Recovery Assessment */}
        <div className="p-3 bg-violet-500/10 border border-violet-500/25 rounded">
          <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
            Status de Recuperação
          </div>
          <div className="text-lg font-bold text-violet-500 mb-1">
            {drawdownPct[drawdownPct.length - 1] > -5 ? '✅ ATH' : '⚠️ Recuperando'}
          </div>
          <div className="text-xs text-slate-500">
            vs. máximo histórico
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-xs text-slate-500 p-2 bg-slate-800/20 rounded">
        <strong>📌 Nota:</strong> Drawdown = queda máxima do pico anterior até o vale. Valores negativos indicam perda. Monitorar durante correções de mercado para manter disciplina.
      </div>
      </CardContent>
    </Card>
  );
};

export default DrawdownHistoryChart;
