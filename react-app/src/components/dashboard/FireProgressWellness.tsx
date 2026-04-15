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
    <section className="section">
      <h2>Progresso FIRE</h2>

      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <div style={{ fontSize: '2.8rem', fontWeight: 800, color: progressBarColor, lineHeight: 1 }}>
          {privacyMode ? '••••' : (firePercentage * 100).toFixed(1) + '%'}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '6px' }}>
          {privacyMode
            ? 'R$••••M / R$••••M'
            : `R$${(firePatrimonioAtual / 1e6).toFixed(2)}M / R$${(firePatrimonioGatilho / 1e6).toFixed(1)}M`}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', background: 'var(--card2)', borderRadius: '2px', overflow: 'hidden', margin: '10px 0' }}>
        <div style={{
          width: Math.min(100, firePercentage * 100) + '%',
          height: '100%',
          background: progressBarColor,
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* SWR Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', marginTop: '8px' }}>
        <span style={{ color: 'var(--muted)' }}>SWR no FIRE Day projetada:</span>
        <span style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: '0.85rem' }}>
          {privacyMode ? '••••' : (swrFireDay * 100).toFixed(2) + '%'}
        </span>
      </div>
      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '4px' }}>
        {privacyMode
          ? 'R$••••k / R$••••M · Meta ≤ 3.0%'
          : `R$250k / R$${(firePatrimonioGatilho / 1e6).toFixed(1)}M · Meta ≤ 3.0%`}
      </div>
    </section>
  );
};

export default FireProgressWellness;
