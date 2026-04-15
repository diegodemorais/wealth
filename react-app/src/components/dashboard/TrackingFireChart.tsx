'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Tracking FIRE — Realizado vs Projeção
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Chart */}
        <div>
          <canvas ref={chartRef} style={{ maxHeight: '200px' }} />
        </div>

        {/* Status cards */}
        <div className="flex flex-col gap-2">
          {/* Realizado */}
          <div className="p-3 bg-cyan-500/10 border border-cyan-500 rounded">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Patrimônio Realizado
            </div>
            <div className="text-lg font-bold text-cyan-500">
              {privacyMode ? 'R$••••' : fmtBrl(patrimonioAtualBrl)}
            </div>
          </div>

          {/* P50 Projetado */}
          <div className="p-3 bg-violet-500/10 border border-violet-500 rounded">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              P50 Projetado
            </div>
            <div className="text-lg font-bold text-violet-500">
              {privacyMode ? 'R$••••' : fmtBrl(projetadoP50Brl)}
            </div>
          </div>

          {/* Diferença */}
          <div
            className="p-3 rounded"
            style={{
              backgroundColor: `${statusColor}15`,
              border: `1px solid ${statusColor}`,
            }}
          >
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Diferença
            </div>
            <div className="text-lg font-bold mb-1" style={{ color: statusColor }}>
              {privacyMode ? '••' : `${diferencaPct.toFixed(1)}%`}
            </div>
            <div className="text-xs text-slate-600">
              {status === 'ahead' && '✅ À frente da projeção'}
              {status === 'tracking' && '📊 Acompanhando projeção'}
              {status === 'behind' && '⚠️ Atrás da projeção'}
            </div>
          </div>
        </div>
      </div>

        {/* FIRE Gatilho progress */}
        <div className="border-t border-slate-700/15 pt-3">
          <div className="text-xs font-semibold text-slate-200 mb-2">
            Progresso para FIRE Gatilho
          </div>

          <div className="flex justify-between items-center mb-2 text-xs text-slate-400">
            <span>Meta FIRE: {privacyMode ? 'R$••••' : fmtBrl(fireGatilhoBrl)}</span>
            <span>{privacyMode ? '••' : `${((patrimonioAtualBrl / fireGatilhoBrl) * 100).toFixed(1)}%`}</span>
          </div>

          <div className="h-3 bg-slate-700/15 rounded overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (patrimonioAtualBrl / fireGatilhoBrl) * 100)}%`,
                backgroundColor: (patrimonioAtualBrl / fireGatilhoBrl) >= 1 ? '#22c55e' : '#f59e0b',
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackingFireChart;
