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
    { label: 'USA', value: usa, color: 'var(--accent)' },
    { label: 'Europe', value: europe, color: 'var(--purple)' },
    { label: 'Japan', value: japan, color: 'var(--red)' },
    { label: 'Other DM', value: otherDm, color: 'var(--yellow)' },
    { label: 'Emerging Markets', value: em, color: 'var(--green)' },
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
            labels: { color: 'var(--muted)', font: { size: 12 }, padding: 12, usePointStyle: true },
          },
          tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            titleColor: 'var(--muted)',
            bodyColor: 'var(--muted)',
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
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '16px' }}>
      <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Exposição Geográfica — Equity
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
          {/* Chart */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <canvas ref={chartRef} style={{ maxWidth: '250px', maxHeight: '250px' }} />
          </div>

          {/* Breakdown table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {calculations.map(region => (
              <div
                key={region.label}
                style={{
                  padding: 'var(--space-3)', borderRadius: '4px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  backgroundColor: `${region.color}15`,
                  borderLeft: `3px solid ${region.color}`,
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>{region.label}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
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
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', padding: 'var(--space-2)', background: 'var(--bg)', borderRadius: '4px' }}>
          <strong>Total Equity USD:</strong> {privacyMode ? 'USD ••••' : `USD ${(totalUsd / 1000).toFixed(1)}k`}
        </div>
      </div>
    </div>
  );
};

export default GeographicExposureChart;
