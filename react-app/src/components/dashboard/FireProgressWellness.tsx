import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="space-y-4">
      {/* FIRE Progress & Wellness Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FIRE Progress Card */}
        <Card className="bg-slate-900/40 border-slate-700/25">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold text-slate-200 mb-3">
              Progresso FIRE
            </h2>
            <div className="text-center mb-3">
              <div className="text-2xl font-bold mb-1" style={{ color: progressBarColor }}>
                {privacyMode ? '••••' : (firePercentage * 100).toFixed(1) + '%'}
              </div>
              <div className="text-xs text-slate-400">
                {privacyMode
                  ? 'R$••••M / R$••••M'
                  : `R$${(firePatrimonioAtual / 1e6).toFixed(2)}M / R$${(firePatrimonioGatilho / 1e6).toFixed(1)}M`}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-700/15 rounded overflow-hidden mb-3">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: Math.min(100, firePercentage * 100) + '%',
                  backgroundColor: progressBarColor,
                }}
              />
            </div>

            {/* SWR Info */}
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">SWR FIRE Day:</span>
                <span className="font-semibold text-cyan-400">
                  {privacyMode ? '••••' : fmtPct(swrFireDay)}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {privacyMode
                  ? 'R$••••k / R$••••M'
                  : `R$${(250000 / 1000).toFixed(0)}k / R$${(firePatrimonioGatilho / 1e6).toFixed(1)}M · Meta ≤ 3.0%`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wellness Score Card */}
        <Card
          className="bg-slate-900/40 border-slate-700/25 cursor-pointer transition-all hover:border-slate-600/50"
          onClick={() => setIsWellnessOpen(!isWellnessOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setIsWellnessOpen(!isWellnessOpen);
          }}
          role="button"
          tabIndex={0}
        >
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center justify-between">
              Financial Wellness
              <span className="text-xs text-slate-400">
                {isWellnessOpen ? '▼' : '▶'}
              </span>
            </h2>

            <div className="text-center">
              <div className="text-2xl font-bold mb-1" style={{ color: getWellnessColor() }}>
                {privacyMode ? '••' : Math.round(wellnessScore)}
              </div>
              <div className="text-xs text-slate-400 mb-2">
                /100 · {getWellnessLabel()}
              </div>

              {/* Mini progress bar */}
              <div className="h-1 bg-slate-700/15 rounded overflow-hidden w-20 mx-auto">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: wellnessScore + '%',
                    backgroundColor: getWellnessColor(),
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wellness Details (Collapsible) */}
      {isWellnessOpen && wellnessMetrics.length > 0 && (
        <Card className="bg-slate-900/40 border-slate-700/25">
          <CardContent className="p-4">
            <h3 className="text-xs text-slate-400 uppercase font-semibold mb-3">
              ⚠️ Métricas de Composição
            </h3>

            <div className="space-y-3">
              {wellnessMetrics.map((metric, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{metric.label}</span>
                    <span className="text-slate-400 font-semibold">
                      {metric.value}/{metric.max}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-700/15 rounded overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: Math.min(100, (metric.value / metric.max) * 100) + '%',
                        backgroundColor: metric.color,
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    {metric.detail}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FireProgressWellness;
