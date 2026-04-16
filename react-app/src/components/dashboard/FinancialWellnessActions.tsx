import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';

interface WellnessAction {
  rank: number;
  metric: string;
  potential_pts: number;
  current_pts: number;
  action: string;
  priority?: 'alta' | 'media' | 'baixa';
}

interface FinancialWellnessActionsProps {
  wellnessScore: number;
  wellnessLabel: string;
  topAcoes: WellnessAction[];
}

const FinancialWellnessActions: React.FC<FinancialWellnessActionsProps> = ({
  wellnessScore,
  wellnessLabel,
  topAcoes = [],
}) => {
  const [expandActions, setExpandActions] = useState(false);
  const { privacyMode } = useUiStore();

  const getPriorityColor = (priority?: string): string => {
    switch (priority) {
      case 'alta': return 'var(--red)';
      case 'media': return 'var(--yellow)';
      case 'baixa': return 'var(--green)';
      default: return 'var(--cyan)';
    }
  };

  const getPriorityBg = (priority?: string): string => {
    switch (priority) {
      case 'alta': return 'rgba(239, 68, 68, 0.15)';
      case 'media': return 'rgba(234, 179, 8, 0.15)';
      case 'baixa': return 'rgba(34, 197, 94, 0.15)';
      default: return 'rgba(6, 182, 212, 0.15)';
    }
  };

  const displayedAcoes = topAcoes.slice(0, 5);

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '16px' }}>
      <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Financial Wellness & Ações Prioritárias
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Wellness Score Display */}
        <div style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'rgba(6,182,212,0.1)', borderRadius: '4px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
            Wellness Score
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--cyan)', marginBottom: '4px' }}>
            {privacyMode ? '••' : Math.round(wellnessScore)}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 500, marginBottom: '12px' }}>
            {wellnessLabel}
          </div>

          {/* Wellness Bar */}
          <div style={{ height: '4px', background: 'var(--bg)', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, wellnessScore)}%`,
                height: '100%',
                backgroundColor: wellnessScore >= 80 ? 'var(--green)' : wellnessScore >= 60 ? 'var(--yellow)' : 'var(--red)',
                transition: 'width 0.5s',
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)' }} />

        {/* Actions Section */}
        <div>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '12px' }}
            onClick={() => setExpandActions(!expandActions)}
          >
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
              Top 5 Ações ({displayedAcoes.length})
            </h3>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
              {expandActions ? '▼' : '▶'}
            </span>
          </div>

          {(expandActions || displayedAcoes.length <= 3) && displayedAcoes.length > 0 && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {displayedAcoes.map((acao, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: '4px',
                    borderLeft: `4px solid ${getPriorityColor(acao.priority)}`,
                    backgroundColor: getPriorityBg(acao.priority),
                  }}
                >
                  {/* Rank badge */}
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '50%', flexShrink: 0, width: '32px', height: '32px',
                      backgroundColor: getPriorityColor(acao.priority),
                    }}
                  >
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 900, color: 'white' }}>
                      {acao.rank}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                      {acao.metric}
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: '8px' }}>
                      {acao.action}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                      <span>
                        Atual: <span style={{ fontWeight: 600, color: 'var(--text)' }}>{acao.current_pts}pts</span>
                      </span>
                      <span>
                        Potencial: <span style={{ fontWeight: 600, color: getPriorityColor(acao.priority) }}>{acao.potential_pts}pts</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {displayedAcoes.length === 0 && (
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', padding: 'var(--space-2)', textAlign: 'center' }}>
              Nenhuma ação prioritária identificada
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialWellnessActions;
