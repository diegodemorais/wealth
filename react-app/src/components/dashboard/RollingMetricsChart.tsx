'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useUiStore } from '@/store/uiStore';

interface RollingMetricsChartProps {
  dates: string[];
  sharpeBRL: number[];
  sharpeUSD: number[];
  sortino: number[];
  volatilidade: number[];
}

const RollingMetricsChart: React.FC<RollingMetricsChartProps> = ({
  dates,
  sharpeBRL,
  sharpeUSD,
  sortino,
  volatilidade,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { privacyMode } = useUiStore();
  const [activeMetric, setActiveMetric] = React.useState<'sharpe' | 'sortino' | 'volatilidade'>('sharpe');

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const displayDates = dates.slice(-120);
    let dataset1: number[] = [];
    let dataset2: number[] = [];
    let label1 = '';
    let label2 = '';
    let yMin = 0;
    let yMax = 3;

    if (activeMetric === 'sharpe') {
      dataset1 = sharpeBRL.slice(-120);
      dataset2 = sharpeUSD.slice(-120);
      label1 = 'Sharpe BRL';
      label2 = 'Sharpe USD';
      yMin = -1;
      yMax = 3;
    } else if (activeMetric === 'sortino') {
      dataset1 = sortino.slice(-120);
      dataset2 = [];
      label1 = 'Sortino Ratio';
      yMin = 0;
      yMax = 5;
    } else {
      dataset1 = volatilidade.slice(-120);
      dataset2 = [];
      label1 = 'Volatilidade (%)';
      yMin = 5;
      yMax = 25;
    }

    const datasets = [
      {
        label: label1,
        data: dataset1,
        borderColor: 'var(--accent)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointBackgroundColor: 'var(--accent)',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
      },
    ];

    if (dataset2.length > 0) {
      datasets.push({
        label: label2,
        data: dataset2,
        borderColor: 'var(--cyan)',
        backgroundColor: 'rgba(6, 182, 212, 0.05)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointBackgroundColor: 'var(--cyan)',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
      });
    }

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: { labels: displayDates, datasets: datasets as any },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top' as const,
            labels: { color: 'var(--muted)', font: { size: 12 }, padding: 12 },
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
                const suffix = activeMetric === 'volatilidade' ? '%' : '';
                return `${context.dataset.label}: ${(context.parsed.y).toFixed(2)}${suffix}`;
              },
            },
          },
        },
        scales: {
          y: {
            min: yMin, max: yMax,
            grid: { color: 'rgba(71, 85, 105, 0.1)' },
            ticks: {
              color: 'var(--muted)',
              callback: function (value) {
                if (activeMetric === 'volatilidade') return (value as number).toFixed(0) + '%';
                return (value as number).toFixed(2);
              },
            },
          },
          x: {
            grid: { display: false },
            ticks: { color: 'var(--muted)', maxRotation: 45, minRotation: 0 },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [activeMetric, dates, sharpeBRL, sharpeUSD, sortino, volatilidade]);

  const currentSharpe = sharpeBRL[sharpeBRL.length - 1] || 0;
  const currentSortino = sortino[sortino.length - 1] || 0;
  const currentVol = volatilidade[volatilidade.length - 1] || 0;

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '16px' }}>
      <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Rolling Metrics — Sharpe, Sortino &amp; Volatilidade
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Metric Toggle */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {['sharpe', 'sortino', 'volatilidade'].map(metric => (
            <button
              key={metric}
              onClick={() => setActiveMetric(metric as any)}
              style={{
                padding: '6px 12px', fontSize: 'var(--text-sm)', fontWeight: 500, borderRadius: '4px',
                cursor: 'pointer', border: 'none',
                background: activeMetric === metric ? 'var(--accent)' : 'rgba(71,85,105,0.2)',
                color: activeMetric === metric ? 'white' : 'var(--text)',
              }}
            >
              {metric === 'sharpe' ? 'Sharpe' : metric === 'sortino' ? 'Sortino' : 'Volatilidade'}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div>
          <canvas ref={chartRef} style={{ maxHeight: '300px' }} />
        </div>

        {/* Key metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
          <div style={{ padding: 'var(--space-3)', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Sharpe (BRL)</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: currentSharpe > 1 ? 'var(--green)' : currentSharpe > 0.5 ? 'var(--yellow)' : 'var(--red)' }}>
              {privacyMode ? '••' : currentSharpe.toFixed(2)}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>Retorno/risco</div>
          </div>

          <div style={{ padding: 'var(--space-3)', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Sortino Ratio</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: currentSortino > 1.5 ? 'var(--green)' : currentSortino > 0.75 ? 'var(--yellow)' : 'var(--red)' }}>
              {privacyMode ? '••' : currentSortino.toFixed(2)}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>Risco downside</div>
          </div>

          <div style={{ padding: 'var(--space-3)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Volatilidade</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'rgba(249, 115, 22, 0.8)' }}>
              {privacyMode ? '••' : currentVol.toFixed(2)}%
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>Desvio padrão</div>
          </div>
        </div>

        {/* Footer note */}
        <div style={{ padding: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--muted)', background: 'var(--bg)', borderRadius: '4px' }}>
          <strong>📌 Nota:</strong> Métricas calculadas em 12M rolling. Sharpe &gt; 1 indica bom retorno ajustado ao risco. Sortino penaliza apenas quedas. Volatilidade é desvio padrão mensal anualizado.
        </div>
      </div>
    </div>
  );
};

export default RollingMetricsChart;
