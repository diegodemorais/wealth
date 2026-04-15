import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';

interface TornadoData {
  label: string;
  variavel: string;
  mais10: number;
  menos10: number;
  delta: number;
}

interface PFireMonteCarloTornadoProps {
  pfireBase: number;
  pfireFav: number;
  pfireStress: number;
  tornadoData: TornadoData[];
}

const PFireMonteCarloTornado: React.FC<PFireMonteCarloTornadoProps> = ({
  pfireBase,
  pfireFav,
  pfireStress,
  tornadoData = [],
}) => {
  const [expandTornado, setExpandTornado] = useState(false);
  const { privacyMode } = useUiStore();

  // Get color for P(FIRE) badge
  const getBadgeColor = (value: number) => {
    if (value >= 90) return '#22c55e'; // green
    if (value >= 80) return '#eab308'; // yellow
    if (value >= 70) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  // Get background color for badge
  const getBadgeBg = (value: number) => {
    if (value >= 90) return 'rgba(34, 197, 94, 0.15)';
    if (value >= 80) return 'rgba(234, 179, 8, 0.15)';
    if (value >= 70) return 'rgba(249, 115, 22, 0.15)';
    return 'rgba(239, 68, 68, 0.15)';
  };

  // Sort tornado data by absolute delta (largest first) and limit to top 5
  const sortedTornado = [...tornadoData]
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 5);

  // Calculate max delta for scaling
  const maxDelta = Math.max(...sortedTornado.map(t => Math.abs(t.delta)), 10);

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
        P(FIRE) Monte Carlo + Sensitividade
      </h2>

      {/* P(FIRE) Badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {/* Base */}
        <div
          style={{
            padding: '12px',
            backgroundColor: getBadgeBg(pfireBase),
            border: `1px solid ${getBadgeColor(pfireBase)}`,
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Base
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: getBadgeColor(pfireBase) }}>
            {privacyMode ? '••' : `${pfireBase.toFixed(1)}`}%
          </div>
        </div>

        {/* Favorável */}
        <div
          style={{
            padding: '12px',
            backgroundColor: getBadgeBg(pfireFav),
            border: `1px solid ${getBadgeColor(pfireFav)}`,
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Favorável
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: getBadgeColor(pfireFav) }}>
            {privacyMode ? '••' : `${pfireFav.toFixed(1)}`}%
          </div>
        </div>

        {/* Stress */}
        <div
          style={{
            padding: '12px',
            backgroundColor: getBadgeBg(pfireStress),
            border: `1px solid ${getBadgeColor(pfireStress)}`,
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Stress
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: getBadgeColor(pfireStress) }}>
            {privacyMode ? '••' : `${pfireStress.toFixed(1)}`}%
          </div>
        </div>
      </div>

      {/* P(FIRE) Base Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
            P(FIRE) Base
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: getBadgeColor(pfireBase) }}>
            {privacyMode ? '••' : `${pfireBase.toFixed(1)}`}%
          </span>
        </div>
        <div
          style={{
            height: '8px',
            backgroundColor: 'rgba(71, 85, 105, 0.15)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, pfireBase)}%`,
              backgroundColor: getBadgeColor(pfireBase),
              transition: 'width 0.5s',
            }}
          />
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(71, 85, 105, 0.15)', margin: '14px 0' }} />

      {/* Tornado Chart Section */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
          onClick={() => setExpandTornado(!expandTornado)}
        >
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: '#cbd5e1' }}>
            Análise de Sensitividade
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {expandTornado ? '▼' : '▶'}
          </span>
        </div>

        {expandTornado && sortedTornado.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            {sortedTornado.map((item, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '12px',
                  paddingBottom: '12px',
                  borderBottom: idx < sortedTornado.length - 1 ? '1px solid rgba(71, 85, 105, 0.1)' : 'none',
                }}
              >
                {/* Label */}
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
                  {item.label}
                </div>

                {/* Bar chart (simple horizontal representation) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {/* Negative side */}
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <div
                      style={{
                        height: '20px',
                        width: `${(Math.abs(item.menos10) / maxDelta) * 100}%`,
                        backgroundColor: '#ef4444',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {Math.abs(item.menos10) > 1 && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'white' }}>
                          {item.menos10 > 0 ? '+' : ''}{item.menos10.toFixed(1)}pp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center line */}
                  <div style={{ width: '2px', height: '24px', backgroundColor: '#64748b' }} />

                  {/* Positive side */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        height: '20px',
                        width: `${(Math.abs(item.mais10) / maxDelta) * 100}%`,
                        backgroundColor: '#22c55e',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {Math.abs(item.mais10) > 1 && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'white' }}>
                          {item.mais10 > 0 ? '+' : ''}{item.mais10.toFixed(1)}pp
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delta summary */}
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: '#64748b',
                    textAlign: 'center',
                  }}
                >
                  Delta: {item.delta.toFixed(1)}pp
                </div>
              </div>
            ))}
          </div>
        )}

        {sortedTornado.length === 0 && (
          <div style={{ fontSize: '0.75rem', color: '#64748b', padding: '8px' }}>
            Dados de sensitividade não disponível
          </div>
        )}
      </div>
    </div>
  );
};

export default PFireMonteCarloTornado;
