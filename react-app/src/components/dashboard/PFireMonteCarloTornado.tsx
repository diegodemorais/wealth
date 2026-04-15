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

  const getBadgeColor = (value: number) => {
    if (value >= 90) return 'var(--green)';
    if (value >= 80) return 'var(--yellow)';
    if (value >= 70) return 'var(--orange)';
    return 'var(--red)';
  };

  const getBadgeBg = (value: number) => {
    if (value >= 90) return 'rgba(34, 197, 94, 0.12)';
    if (value >= 80) return 'rgba(234, 179, 8, 0.12)';
    if (value >= 70) return 'rgba(249, 115, 22, 0.12)';
    return 'rgba(239, 68, 68, 0.12)';
  };

  const sortedTornado = [...tornadoData]
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 5);

  const maxDelta = Math.max(...sortedTornado.map(t => Math.abs(t.delta)), 10);

  const scenarioCards = [
    { label: 'Base', value: pfireBase },
    { label: 'Favorável', value: pfireFav },
    { label: 'Stress', value: pfireStress },
  ];

  return (
    <section className="section">
      <h2>P(FIRE) — Monte Carlo + Tornado de Sensibilidade</h2>

      {/* Scenario cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '12px' }}>
        {scenarioCards.map(({ label, value }) => (
          <div key={label} style={{
            background: getBadgeBg(value),
            border: `1px solid ${getBadgeColor(value)}`,
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>
              {label}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: getBadgeColor(value), lineHeight: 1 }}>
              {privacyMode ? '••' : value.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      {/* P(FIRE) Base progress bar */}
      <div style={{ marginTop: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '4px' }}>
          <span>Progresso Patrimonial</span>
          <span style={{ color: getBadgeColor(pfireBase), fontWeight: 700 }}>
            {privacyMode ? '••' : pfireBase.toFixed(1)}%
          </span>
        </div>
        <div style={{ height: '6px', background: 'var(--card2)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, pfireBase)}%`,
            height: '100%',
            background: getBadgeColor(pfireBase),
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Tornado section (collapsible) */}
      <div style={{ marginTop: '14px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
        <div
          onClick={() => setExpandTornado(!expandTornado)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            Tornado — Sensitividade ±10% de P(FIRE)
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            {expandTornado ? '▼' : '▶'}
          </span>
        </div>

        {expandTornado && sortedTornado.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.6rem', color: 'var(--muted)', marginBottom: '10px' }}>
              <span>
                <span style={{ display: 'inline-block', width: '10px', height: '8px', background: 'var(--red)', borderRadius: '2px', marginRight: '4px' }} />
                -10%
              </span>
              <span>
                <span style={{ display: 'inline-block', width: '10px', height: '8px', background: 'var(--green)', borderRadius: '2px', marginRight: '4px' }} />
                +10%
              </span>
            </div>

            {sortedTornado.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {/* Negative side */}
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      height: '18px',
                      width: `${(Math.abs(item.menos10) / maxDelta) * 100}%`,
                      background: 'var(--red)',
                      borderRadius: '3px 0 0 3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '4px',
                    }}>
                      {Math.abs(item.menos10) > 1 && (
                        <span style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 700 }}>
                          {item.menos10.toFixed(1)}pp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center */}
                  <div style={{ width: '1px', height: '24px', background: 'var(--border)', flexShrink: 0 }} />

                  {/* Positive side */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      height: '18px',
                      width: `${(Math.abs(item.mais10) / maxDelta) * 100}%`,
                      background: 'var(--green)',
                      borderRadius: '0 3px 3px 0',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '4px',
                    }}>
                      {Math.abs(item.mais10) > 1 && (
                        <span style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 700 }}>
                          +{item.mais10.toFixed(1)}pp
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {expandTornado && sortedTornado.length === 0 && (
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', padding: '8px 0', marginTop: '8px' }}>
            Dados de sensitividade não disponíveis
          </div>
        )}
      </div>
    </section>
  );
};

export default PFireMonteCarloTornado;
