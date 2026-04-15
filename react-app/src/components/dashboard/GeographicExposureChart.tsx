'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useUiStore } from '@/store/uiStore';

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
    { label: 'USA', value: usa, color: '#3b82f6' },
    { label: 'Europe', value: europe, color: '#8b5cf6' },
    { label: 'Japan', value: japan, color: '#ec4899' },
    { label: 'Other DM', value: otherDm, color: '#f59e0b' },
    { label: 'Emerging Markets', value: em, color: '#10b981' },
  ];

  useEffect(() => {
    if (!chartRef.current) return;

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
            labels: { color: '#cbd5e1', font: { size: 12 }, padding: 12, usePointStyle: true },
          },
          tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            titleColor: '#cbd5e1',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(71, 85, 105, 0.5)',
            borderWidth: 1,
            padding: 8,
            titleFont: { size: 12, weight: 'bold' },
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
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Exposição Geográfica — Equity
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
          {/* Chart */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <canvas ref={chartRef} style={{ maxWidth: '250px', maxHeight: '250px' }} />
          </div>

          {/* Breakdown table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {calculations.map(region => (
              <div
                key={region.label}
                style={{
                  padding: '12px', borderRadius: '4px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  backgroundColor: `${region.color}15`,
                  borderLeft: `3px solid ${region.color}`,
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>{region.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {privacyMode ? 'USD ••••' : `USD ${(region.value / 1000).toFixed(1)}k`}
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: region.color }}>
                  {region.pct.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', padding: '8px', background: 'var(--bg)', borderRadius: '4px' }}>
          <strong>Total Equity USD:</strong> {privacyMode ? 'USD ••••' : `USD ${(totalUsd / 1000).toFixed(1)}k`}
        </div>
      </div>
    </div>
  );
};

export default GeographicExposureChart;
