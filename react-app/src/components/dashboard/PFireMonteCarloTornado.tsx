import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          P(FIRE) Monte Carlo + Sensitividade
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* P(FIRE) Badges */}
        <div className="grid grid-cols-3 gap-3">
          {/* Base */}
          <div
            className="p-3 rounded border text-center"
            style={{
              backgroundColor: getBadgeBg(pfireBase),
              borderColor: getBadgeColor(pfireBase),
            }}
          >
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Base
            </div>
            <div className="text-xl font-bold" style={{ color: getBadgeColor(pfireBase) }}>
              {privacyMode ? '••' : `${pfireBase.toFixed(1)}`}%
            </div>
          </div>

          {/* Favorável */}
          <div
            className="p-3 rounded border text-center"
            style={{
              backgroundColor: getBadgeBg(pfireFav),
              borderColor: getBadgeColor(pfireFav),
            }}
          >
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Favorável
            </div>
            <div className="text-xl font-bold" style={{ color: getBadgeColor(pfireFav) }}>
              {privacyMode ? '••' : `${pfireFav.toFixed(1)}`}%
            </div>
          </div>

          {/* Stress */}
          <div
            className="p-3 rounded border text-center"
            style={{
              backgroundColor: getBadgeBg(pfireStress),
              borderColor: getBadgeColor(pfireStress),
            }}
          >
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Stress
            </div>
            <div className="text-xl font-bold" style={{ color: getBadgeColor(pfireStress) }}>
              {privacyMode ? '••' : `${pfireStress.toFixed(1)}`}%
            </div>
          </div>
        </div>

        {/* P(FIRE) Base Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-1 text-xs text-slate-400 font-medium">
            <span>P(FIRE) Base</span>
            <span style={{ color: getBadgeColor(pfireBase) }} className="font-semibold">
              {privacyMode ? '••' : `${pfireBase.toFixed(1)}`}%
            </span>
          </div>
          <div className="h-2 bg-slate-700/15 rounded overflow-hidden">
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
        <div className="border-t border-slate-700/15" />

        {/* Tornado Chart Section */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer mb-3 border-t border-slate-700/15 pt-3"
            onClick={() => setExpandTornado(!expandTornado)}
          >
            <h3 className="text-sm font-semibold text-slate-200 m-0">
              Análise de Sensitividade
            </h3>
            <span className="text-xs text-slate-400">
              {expandTornado ? '▼' : '▶'}
            </span>
          </div>

          {expandTornado && sortedTornado.length > 0 && (
            <div className="mt-3 space-y-3">
              {sortedTornado.map((item, idx) => (
                <div
                  key={idx}
                  className={`pb-3 ${idx < sortedTornado.length - 1 ? 'border-b border-slate-700/10' : ''}`}
                >
                  {/* Label */}
                  <div className="text-xs text-slate-400 mb-2">
                    {item.label}
                  </div>

                  {/* Bar chart (simple horizontal representation) */}
                  <div className="flex items-center gap-2 mb-2">
                    {/* Negative side */}
                    <div className="flex-1 flex justify-end">
                      <div
                        className="h-5 bg-red-500 rounded text-center flex items-center justify-center"
                        style={{
                          width: `${(Math.abs(item.menos10) / maxDelta) * 100}%`,
                        }}
                      >
                        {Math.abs(item.menos10) > 1 && (
                          <span className="text-xs font-semibold text-white">
                            {item.menos10 > 0 ? '+' : ''}{item.menos10.toFixed(1)}pp
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Center line */}
                    <div className="w-px h-6 bg-slate-600" />

                    {/* Positive side */}
                    <div className="flex-1">
                      <div
                        className="h-5 bg-green-500 rounded text-center flex items-center justify-center"
                        style={{
                          width: `${(Math.abs(item.mais10) / maxDelta) * 100}%`,
                        }}
                      >
                        {Math.abs(item.mais10) > 1 && (
                          <span className="text-xs font-semibold text-white">
                            {item.mais10 > 0 ? '+' : ''}{item.mais10.toFixed(1)}pp
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delta summary */}
                  <div className="text-xs text-slate-500 text-center">
                    Delta: {item.delta.toFixed(1)}pp
                  </div>
                </div>
              ))}
            </div>
          )}

          {sortedTornado.length === 0 && (
            <div className="text-xs text-slate-500 p-2 mt-3">
              Dados de sensitividade não disponível
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PFireMonteCarloTornado;
