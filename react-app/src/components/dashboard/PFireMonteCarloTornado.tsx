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
    <section className="bg-card border border-border/50 rounded-lg p-4 mb-3.5">
      <h2 className="text-base font-semibold text-text mb-3 m-0">P(FIRE) — Monte Carlo + Tornado de Sensibilidade</h2>

      {/* Scenario cards */}
      <div className="grid grid-cols-3 gap-2.5 mt-3">
        {scenarioCards.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg p-3 text-center border"
            style={{
              background: getBadgeBg(value),
              borderColor: getBadgeColor(value),
            }}
          >
            <div className="text-xs uppercase font-semibold text-muted mb-1 tracking-widest">
              {label}
            </div>
            <div
              className="text-xl font-black leading-none"
              style={{ color: getBadgeColor(value) }}
            >
              {privacyMode ? '••' : value.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      {/* P(FIRE) Base progress bar */}
      <div className="mt-3.5">
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>Progresso Patrimonial</span>
          <span style={{ color: getBadgeColor(pfireBase), fontWeight: 700 }}>
            {privacyMode ? '••' : pfireBase.toFixed(1)}%
          </span>
        </div>
        <div className="h-1.5 bg-slate-700/40 rounded-sm overflow-hidden">
          <div
            className="h-full rounded-sm transition-all duration-500"
            style={{
              width: `${Math.min(100, pfireBase)}%`,
              background: getBadgeColor(pfireBase),
            }}
          />
        </div>
      </div>

      {/* Tornado section (collapsible) */}
      <div className="mt-3.5 border-t border-border/50 pt-3">
        <button
          onClick={() => setExpandTornado(!expandTornado)}
          className="flex justify-between items-center w-full cursor-pointer text-text hover:text-slate-300 transition-colors"
        >
          <span className="text-sm font-semibold">
            Tornado — Sensitividade ±10% de P(FIRE)
          </span>
          <span className="text-xs text-muted">
            {expandTornado ? '▼' : '▶'}
          </span>
        </button>

        {expandTornado && sortedTornado.length > 0 && (
          <div className="mt-3">
            {/* Legend */}
            <div className="flex gap-4 text-xs text-muted mb-2.5">
              <span>
                <span className="inline-block w-2.5 h-2 bg-red-500 rounded mr-1" />
                -10%
              </span>
              <span>
                <span className="inline-block w-2.5 h-2 bg-green-500 rounded mr-1" />
                +10%
              </span>
            </div>

            {sortedTornado.map((item, idx) => (
              <div key={idx} className="mb-2.5">
                <div className="text-xs text-muted mb-1">
                  {item.label}
                </div>
                <div className="flex items-center gap-1">
                  {/* Negative side */}
                  <div className="flex-1 flex justify-end">
                    <div
                      className="h-5 flex items-center justify-end px-1"
                      style={{
                        width: `${(Math.abs(item.menos10) / maxDelta) * 100}%`,
                        background: 'var(--red)',
                        borderRadius: '3px 0 0 3px',
                      }}
                    >
                      {Math.abs(item.menos10) > 1 && (
                        <span className="text-xs font-bold text-text">
                          {item.menos10.toFixed(1)}pp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center */}
                  <div
                    className="w-px h-6 bg-slate-700/50 flex-shrink-0"
                  />

                  {/* Positive side */}
                  <div className="flex-1">
                    <div
                      className="h-5 flex items-center px-1"
                      style={{
                        width: `${(Math.abs(item.mais10) / maxDelta) * 100}%`,
                        background: 'var(--green)',
                        borderRadius: '0 3px 3px 0',
                      }}
                    >
                      {Math.abs(item.mais10) > 1 && (
                        <span className="text-xs font-bold text-text">
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
          <div className="text-xs text-muted py-2 mt-2">
            Dados de sensitividade não disponíveis
          </div>
        )}
      </div>
    </section>
  );
};

export default PFireMonteCarloTornado;
