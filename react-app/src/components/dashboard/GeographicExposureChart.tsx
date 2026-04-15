'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GeographicExposureChartProps {
  usa: number;
  europe: number;
  japan: number;
  otherDm: number;
  em: number;
  totalUsd: number;
}

const GeographicExposureChart: React.FC<GeographicExposureChartProps> = ({
  usa,
  europe,
  japan,
  otherDm,
  em,
  totalUsd,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { privacyMode } = useUiStore();

  const regions = [
    { label: 'USA', value: usa, color: '#3b82f6' }, // blue
    { label: 'Europe', value: europe, color: '#8b5cf6' }, // violet
    { label: 'Japan', value: japan, color: '#ec4899' }, // pink
    { label: 'Other DM', value: otherDm, color: '#f59e0b' }, // amber
    { label: 'Emerging Markets', value: em, color: '#10b981' }, // emerald
  ];

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: regions.map(r => r.label),
        datasets: [
          {
            data: regions.map(r => r.value),
            backgroundColor: regions.map(r => r.color),
            borderColor: 'rgba(15, 23, 42, 1)',
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom' as const,
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
            titleFont: {
              size: 12,
              weight: 'bold',
            },
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((context.parsed as number) / total) * 100;
                return `${(percentage).toFixed(1)}% USD`;
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
  }, []);

  const totalValue = usa + europe + japan + otherDm + em;
  const calculations = regions.map(r => ({
    ...r,
    pct: totalValue > 0 ? (r.value / totalValue) * 100 : 0,
  }));

  return (
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Exposição Geográfica — Equity
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 items-start">
          {/* Chart */}
          <div className="flex justify-center">
            <canvas ref={chartRef} style={{ maxWidth: '250px', maxHeight: '250px' }} />
          </div>

          {/* Breakdown table */}
          <div className="space-y-2">
          {calculations.map(region => (
            <div
              key={region.label}
              style={{
                padding: '10px 12px',
                backgroundColor: `${region.color}15`,
                borderLeft: `3px solid ${region.color}`,
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
                  {region.label}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                  {privacyMode ? 'USD ••••' : `USD ${(region.value / 1000).toFixed(1)}k`}
                </div>
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: region.color,
                }}
              >
                {region.pct.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
        </div>

        {/* Summary */}
        <div className="text-xs text-slate-500 p-2 bg-slate-800/20 rounded mt-4">
          <strong>Total Equity USD:</strong> {privacyMode ? 'USD ••••' : `USD ${(totalUsd / 1000).toFixed(1)}k`}
        </div>
      </CardContent>
    </Card>
  );
};

export default GeographicExposureChart;
