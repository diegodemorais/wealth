import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';

interface FireProgressWellnessProps {
  firePercentage: number;
  firePatrimonioAtual: number;
  firePatrimonioGatilho: number;
  swrFireDay: number;
  wellnessScore: number;
  wellnessLabel: string;
  wellnessMetrics?: Array<{
    label: string;
    value: number;
    max: number;
    color: string;
    detail: string;
  }>;
}

const FireProgressWellness: React.FC<FireProgressWellnessProps> = ({
  firePercentage,
  firePatrimonioAtual,
  firePatrimonioGatilho,
  swrFireDay,
  wellnessScore,
  wellnessLabel,
  wellnessMetrics = [],
}) => {
  const [isWellnessOpen, setIsWellnessOpen] = useState(false);
  const { privacyMode } = useUiStore();

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const fmtPct = (val: number) => {
    return (val * 100).toFixed(1) + '%';
  };

  // Determinar cor do wellness
  const getWellnessColor = () => {
    if (wellnessScore >= 80) return '#22c55e'; // verde
    if (wellnessScore >= 60) return '#eab308'; // amarelo
    return '#ef4444'; // vermelho
  };

  const getWellnessLabel = () => {
    if (wellnessScore >= 80) return 'Excelente';
    if (wellnessScore >= 60) return 'Progredindo';
    if (wellnessScore >= 40) return 'Atenção';
    return 'Crítico';
  };

  const progressBarColor = firePercentage >= 0.8 ? '#22c55e' : firePercentage >= 0.6 ? '#eab308' : '#3b82f6';

  return (
    <>
      {/* FIRE Progress Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          marginBottom: '14px',
        }}
      >
        <div
          className="section"
          style={{
            padding: '12px 14px',
            border: '1px solid rgba(71, 85, 105, 0.25)',
            borderRadius: '8px',
          }}
        >
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 8px', padding: 0 }}>
            Progresso FIRE
          </h2>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div
              style={{
                fontSize: '2.2rem',
                fontWeight: 700,
                color: progressBarColor,
                marginBottom: '4px',
              }}
            >
              {privacyMode ? '••••' : (firePercentage * 100).toFixed(1) + '%'}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                marginBottom: '8px',
              }}
            >
              {privacyMode
                ? 'R$••••M / R$••••M'
                : `R$${(firePatrimonioAtual / 1e6).toFixed(2)}M / R$${(firePatrimonioGatilho / 1e6).toFixed(1)}M`}
            </div>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              marginTop: '8px',
              marginBottom: '12px',
              height: '6px',
              backgroundColor: 'rgba(71, 85, 105, 0.15)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: Math.min(100, firePercentage * 100) + '%',
                backgroundColor: progressBarColor,
                transition: 'width 0.5s',
              }}
            />
          </div>

          {/* SWR Info */}
          <div style={{ fontSize: '0.75rem', marginTop: '8px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '2px',
              }}
            >
              <span>SWR FIRE Day:</span>
              <span style={{ fontWeight: 600, color: '#06b6d4' }}>
                {privacyMode ? '••••' : fmtPct(swrFireDay)}
              </span>
            </div>
            <div
              style={{
                fontSize: '0.6rem',
                color: '#94a3b8',
                marginTop: '2px',
              }}
            >
              {privacyMode
                ? 'R$••••k / R$••••M'
                : `R$${(250000 / 1000).toFixed(0)}k / R$${(firePatrimonioGatilho / 1e6).toFixed(1)}M · Meta ≤ 3.0%`}
            </div>
          </div>
        </div>

        {/* Wellness Score Card */}
        <div
          className="section"
          style={{
            padding: '12px 14px',
            border: '1px solid rgba(71, 85, 105, 0.25)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onClick={() => setIsWellnessOpen(!isWellnessOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setIsWellnessOpen(!isWellnessOpen);
          }}
          role="button"
          tabIndex={0}
        >
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 8px', padding: 0 }}>
            Financial Wellness
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '6px' }}>
              {isWellnessOpen ? '▼' : '▶'}
            </span>
          </h2>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: getWellnessColor(),
                marginBottom: '2px',
              }}
            >
              {privacyMode ? '••' : Math.round(wellnessScore)}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
              }}
            >
              /100 · {getWellnessLabel()}
            </div>

            {/* Mini progress bar */}
            <div
              style={{
                marginTop: '6px',
                height: '6px',
                backgroundColor: 'rgba(71, 85, 105, 0.15)',
                borderRadius: '4px',
                width: '80px',
                margin: '6px auto',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: wellnessScore + '%',
                  backgroundColor: getWellnessColor(),
                  transition: 'width 0.5s',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Wellness Details (Collapsible) */}
      {isWellnessOpen && wellnessMetrics.length > 0 && (
        <div
          className="section"
          style={{
            padding: '12px 14px',
            border: '1px solid rgba(71, 85, 105, 0.25)',
            borderRadius: '8px',
            marginBottom: '14px',
          }}
        >
          <h3
            style={{
              fontSize: '0.8rem',
              color: '#94a3b8',
              textTransform: 'uppercase',
              margin: '0 0 8px',
              padding: 0,
              fontWeight: 600,
            }}
          >
            ⚠️ Métricas de Composição
          </h3>

          {wellnessMetrics.map((metric, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 60px 60px',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 2px',
                borderBottom: idx < wellnessMetrics.length - 1 ? '1px solid rgba(71, 85, 105, 0.12)' : 'none',
                fontSize: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{metric.label}</span>
              </div>
              <div
                style={{
                  height: '6px',
                  backgroundColor: 'rgba(71, 85, 105, 0.15)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: Math.min(100, (metric.value / metric.max) * 100) + '%',
                    backgroundColor: metric.color,
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <div style={{ textAlign: 'right', fontWeight: 600 }}>
                {metric.value}/{metric.max}
              </div>
              <div style={{ textAlign: 'right', color: '#94a3b8' }}>
                {metric.detail}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FireProgressWellness;
