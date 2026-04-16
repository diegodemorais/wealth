import React from 'react';
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
}) => {
  const { privacyMode } = useUiStore();

  const progressBarColor =
    firePercentage >= 0.8 ? 'var(--green)' :
    firePercentage >= 0.6 ? 'var(--yellow)' :
    'var(--accent)';

  return (
    <section className="bg-card border border-border/50 rounded-lg p-4 mb-3.5">
      <h2 className="text-base font-semibold text-text mb-3 m-0">Progresso FIRE</h2>

      <div className="text-center py-2 px-0">
        <div
          className="text-4xl font-black leading-none"
          style={{ color: progressBarColor }}
        >
          {privacyMode ? '••••' : (firePercentage * 100).toFixed(1) + '%'}
        </div>
        <div className="text-xs text-muted mt-1.5">
          {privacyMode
            ? 'R$••••M / R$••••M'
            : `R$${(firePatrimonioAtual / 1e6).toFixed(2)}M / R$${(firePatrimonioGatilho / 1e6).toFixed(1)}M`}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-700/40 rounded-sm overflow-hidden my-2.5">
        <div
          className="h-full rounded-sm transition-all duration-500"
          style={{
            width: Math.min(100, firePercentage * 100) + '%',
            background: progressBarColor,
          }}
        />
      </div>

      {/* SWR Info */}
      <div className="flex justify-between items-center text-xs mt-2">
        <span className="text-muted">SWR no FIRE Day projetada:</span>
        <span className="text-cyan-400 font-bold text-sm">
          {privacyMode ? '••••' : (swrFireDay * 100).toFixed(2) + '%'}
        </span>
      </div>
      <div className="text-xs text-muted mt-1">
        {privacyMode
          ? 'R$••••k / R$••••M · Meta ≤ 3.0%'
          : `R$250k / R$${(firePatrimonioGatilho / 1e6).toFixed(1)}M · Meta ≤ 3.0%`}
      </div>
    </section>
  );
};

export default FireProgressWellness;
