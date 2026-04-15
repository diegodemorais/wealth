'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Glide Path — Evolução de Alocação até FIRE
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chart */}
        <div>
          <canvas ref={chartRef} style={{ maxHeight: '300px' }} />
        </div>

        {/* Current vs Target */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Current Position */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded">
            <div className="text-xs text-slate-400 mb-2 uppercase font-semibold">
              Posição Atual (Idade {currentAge})
            </div>
            <div className="mb-2">
              <div className="text-xs text-slate-500 mb-1">
                Equity
              </div>
              <div className="text-base font-bold text-blue-400">
                {currentEquityPercent.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">
                RF
              </div>
              <div className="text-base font-bold text-amber-400">
                {currentRfPercent.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Target at Retirement */}
          <div className="p-3 bg-green-500/10 border border-green-500/25 rounded">
            <div className="text-xs text-slate-400 mb-2 uppercase font-semibold">
              Meta FIRE (Idade {retirementAge})
            </div>
            <div className="mb-2">
              <div className="text-xs text-slate-500 mb-1">
                Equity
              </div>
              <div className="text-base font-bold text-blue-400">
                {retirementEquityPercent.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">
                RF
              </div>
              <div className="text-base font-bold text-amber-400">
                {retirementRfPercent.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Migration Distance */}
          <div className="p-3 bg-violet-500/10 border border-violet-500/25 rounded">
            <div className="text-xs text-slate-400 mb-2 uppercase font-semibold">
              Distância a Migrar
            </div>
            <div className="mb-2">
              <div className="text-xs text-slate-500 mb-1">
                Equity
              </div>
              <div className="text-base font-bold" style={{ color: retirementEquityPercent < currentEquityPercent ? '#ef4444' : '#22c55e' }}>
                {retirementEquityPercent < currentEquityPercent ? '−' : '+'}
                {Math.abs(retirementEquityPercent - currentEquityPercent).toFixed(1)}pp
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">
                Taxa Anual
              </div>
              <div className="text-base font-bold text-violet-400">
                {yearsToRetirement > 0 ? (Math.abs(retirementEquityPercent - currentEquityPercent) / yearsToRetirement).toFixed(2) : '—'}pp/a
              </div>
            </div>
          </div>
        </div>

        {/* Timeline summary */}
        <div className="pt-4 border-t border-slate-700/15">
          <div className="text-sm font-semibold text-slate-200 mb-3">
            Timeline (cada {Math.max(1, Math.floor(yearsToRetirement / 5))} anos)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {glidePathPoints
              .filter((p, idx) => idx === 0 || idx === glidePathPoints.length - 1 || idx % Math.max(1, Math.floor(yearsToRetirement / 5)) === 0)
              .map(p => (
                <div
                  key={p.year}
                  className="p-3 bg-slate-700/10 border border-slate-700/30 rounded text-xs"
                >
                  <div className="text-slate-400 mb-1 font-semibold">
                    {p.label} (idade {p.age})
                  </div>
                  <div className="text-blue-400 mb-1">
                    {p.equityPercent.toFixed(0)}% Equity
                  </div>
                  <div className="text-amber-400">
                    {p.rfPercent.toFixed(0)}% RF
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-3 p-2 text-xs text-slate-500 bg-slate-700/5 rounded">
          <strong>📌 Nota:</strong> Glide path assume redução linear de equity até a idade de aposentadoria. Revisit anualmente ou em eventos de rebalanço.
        </div>
      </CardContent>
    </Card>
  );
};

export default GlidePath;
