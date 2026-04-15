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
        Exposição Geográfica — Equity
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          alignItems: 'start',
        }}
      >
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
      <div
        style={{
          marginTop: '14px',
          fontSize: '0.7rem',
          color: '#64748b',
          padding: '8px',
          backgroundColor: 'rgba(71, 85, 105, 0.08)',
          borderRadius: '4px',
        }}
      >
        <strong>Total Equity USD:</strong> {privacyMode ? 'USD ••••' : `USD ${(totalUsd / 1000).toFixed(1)}k`}
      </div>
    </div>
  );
};

export default GeographicExposureChart;
