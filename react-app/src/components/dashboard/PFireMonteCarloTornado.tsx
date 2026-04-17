import React from 'react';
import { useUiStore } from '@/store/uiStore';
import { pfireColor } from '@/utils/fire';

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
  firePatrimonioAtual?: number;
  firePatrimonioGatilho?: number;
  /** When true, renders only the tornado chart (no scenario cards / progress bar) */
  tornadoOnly?: boolean;
}

const PFireMonteCarloTornado: React.FC<PFireMonteCarloTornadoProps> = ({
  pfireBase,
  pfireFav,
  pfireStress,
  tornadoData = [],
  firePatrimonioAtual,
  firePatrimonioGatilho,
  tornadoOnly = false,
}) => {
  const { privacyMode } = useUiStore();

  const getBadgeColor = pfireColor;

  const getBadgeBg = (value: number) => {
    const color = pfireColor(value);
    return `color-mix(in srgb, ${color} 12%, transparent)`;
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

  const patrimonioProgressPct = firePatrimonioAtual != null && firePatrimonioGatilho != null
    ? (firePatrimonioAtual / firePatrimonioGatilho * 100)
    : pfireBase;

  // Tornado-only mode: render just the chart without the outer card wrapper or scenario cards
  if (tornadoOnly) {
    if (sortedTornado.length === 0) {
      return <div className="text-xs text-muted py-2">Dados de sensitividade não disponíveis</div>;
    }
    return (
      <div>
        {sortedTornado.map((item, idx) => (
          <div key={idx} className="mb-2.5">
            <div className="text-xs text-muted mb-1">{item.label}</div>
            <div className="flex items-center gap-1">
              <div className="flex-1 flex justify-end">
                <div className="h-5 flex items-center justify-end px-1" style={{ width: `${(Math.abs(item.menos10) / maxDelta) * 100}%`, background: 'var(--red)', borderRadius: '3px 0 0 3px' }}>
                  {Math.abs(item.menos10) > 1 && <span className="text-xs font-bold text-white">{item.menos10.toFixed(1)}pp</span>}
                </div>
              </div>
              <div className="w-px h-6 bg-card2/50 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-5 flex items-center px-1" style={{ width: `${(Math.abs(item.mais10) / maxDelta) * 100}%`, background: 'var(--green)', borderRadius: '0 3px 3px 0' }}>
                  {Math.abs(item.mais10) > 1 && <span className="text-xs font-bold text-white">+{item.mais10.toFixed(1)}pp</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="bg-card border border-border/50 rounded p-4 mb-3.5">
      <h2 className="text-base font-semibold text-text mb-3 m-0">P(FIRE) — Monte Carlo + Tornado de Sensibilidade</h2>

      {/* Main layout: side-by-side when tornado data exists */}
      <div className={sortedTornado.length > 0 ? 'flex gap-5 mt-3' : 'mt-3'}>
        {/* LEFT — scenario cards + progress bar */}
        <div className={sortedTornado.length > 0 ? 'flex-shrink-0 w-64' : 'w-full'}>
          {/* Scenario cards */}
          <div className="flex flex-col gap-2">
            {scenarioCards.map(({ label, value }) => (
              <div
                key={label}
                className="rounded p-3 flex items-center justify-between border"
                style={{
                  background: getBadgeBg(value),
                  borderColor: getBadgeColor(value),
                }}
              >
                <div className="text-xs uppercase font-semibold text-muted tracking-widest">{label}</div>
                <div
                  className="text-xl font-black leading-none"
                  style={{ color: getBadgeColor(value) }}
                >
                  {privacyMode ? '••%' : `${value.toFixed(1)}%`}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>Progresso Patrimonial</span>
              <div className="flex items-center gap-2">
                {firePatrimonioAtual != null && firePatrimonioGatilho != null && !privacyMode && (
                  <span className="text-muted">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0, notation: 'compact' }).format(firePatrimonioAtual)}
                    {' / '}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0, notation: 'compact' }).format(firePatrimonioGatilho)}
                  </span>
                )}
                <span style={{ color: getBadgeColor(pfireBase), fontWeight: 700 }}>
                  {privacyMode ? '••%' : `${patrimonioProgressPct.toFixed(1)}%`}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-card2/40 rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm transition-all duration-500"
                style={{
                  width: `${Math.min(100, patrimonioProgressPct)}%`,
                  background: getBadgeColor(pfireBase),
                }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT — Tornado (always visible when data exists) */}
        {sortedTornado.length > 0 && (
          <div className="flex-1 border-l border-border/30 pl-5">
            <div className="text-sm font-semibold text-text mb-2">
              Tornado — Sensitividade ±10% de P(FIRE)
            </div>
            {sortedTornado.map((item, idx) => (
              <div key={idx} className="mb-2.5">
                <div className="text-xs text-muted mb-1">{item.label}</div>
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
                        <span className="text-xs font-bold text-white">
                          {item.menos10.toFixed(1)}pp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center divider */}
                  <div className="w-px h-6 bg-card2/50 flex-shrink-0" />

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
                        <span className="text-xs font-bold text-white">
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

        {/* No tornado data fallback */}
        {sortedTornado.length === 0 && (
          <div className="text-xs text-muted py-2 mt-2">
            Dados de sensitividade não disponíveis
          </div>
        )}
      </div>
    </section>
  );
};

export default PFireMonteCarloTornado;
