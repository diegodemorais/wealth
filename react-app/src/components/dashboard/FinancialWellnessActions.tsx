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

  // Get color based on action priority
  const getPriorityColor = (priority?: string): string => {
    switch (priority) {
      case 'alta':
        return '#ef4444'; // red
      case 'media':
        return '#eab308'; // yellow
      case 'baixa':
        return '#22c55e'; // green
      default:
        return '#06b6d4'; // cyan
    }
  };

  // Get background color for priority badge
  const getPriorityBg = (priority?: string): string => {
    switch (priority) {
      case 'alta':
        return 'rgba(239, 68, 68, 0.15)';
      case 'media':
        return 'rgba(234, 179, 8, 0.15)';
      case 'baixa':
        return 'rgba(34, 197, 94, 0.15)';
      default:
        return 'rgba(6, 182, 212, 0.15)';
    }
  };

  // Display top 5 actions (or all if fewer)
  const displayedAcoes = topAcoes.slice(0, 5);

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
        Financial Wellness & Ações Prioritárias
      </h2>

      {/* Wellness Score Display */}
      <div style={{ textAlign: 'center', marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(6, 182, 212, 0.08)', borderRadius: '6px' }}>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>
          Wellness Score
        </div>
        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#06b6d4', marginBottom: '6px' }}>
          {privacyMode ? '••' : Math.round(wellnessScore)}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>
          {wellnessLabel}
        </div>

        {/* Wellness Bar */}
        <div
          style={{
            marginTop: '10px',
            height: '6px',
            backgroundColor: 'rgba(71, 85, 105, 0.15)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, wellnessScore)}%`,
              backgroundColor: wellnessScore >= 80 ? '#22c55e' : wellnessScore >= 60 ? '#eab308' : '#ef4444',
              transition: 'width 0.5s',
            }}
          />
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(71, 85, 105, 0.15)', margin: '14px 0' }} />

      {/* Actions Section */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
          onClick={() => setExpandActions(!expandActions)}
        >
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: '#cbd5e1' }}>
            Top 5 Ações ({displayedAcoes.length})
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {expandActions ? '▼' : '▶'}
          </span>
        </div>

        {(expandActions || displayedAcoes.length <= 3) && displayedAcoes.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            {displayedAcoes.map((acao, idx) => (
              <div
                key={idx}
                style={{
                  borderLeft: `4px solid ${getPriorityColor(acao.priority)}`,
                  backgroundColor: getPriorityBg(acao.priority),
                  padding: '10px 12px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  display: 'flex',
                  gap: '12px',
                }}
              >
                {/* Rank badge */}
                <div
                  style={{
                    minWidth: '32px',
                    height: '32px',
                    backgroundColor: getPriorityColor(acao.priority),
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>
                    {acao.rank}
                  </span>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    {acao.metric}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
                    {acao.action}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: '#64748b',
                      display: 'flex',
                      gap: '12px',
                    }}
                  >
                    <span>
                      Atual: <span style={{ fontWeight: 600, color: '#cbd5e1' }}>{acao.current_pts}pts</span>
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
          <div style={{ fontSize: '0.75rem', color: '#64748b', padding: '8px', textAlign: 'center' }}>
            Nenhuma ação prioritária identificada
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialWellnessActions;
