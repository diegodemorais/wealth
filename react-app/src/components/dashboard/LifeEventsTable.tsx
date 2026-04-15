'use client';

import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtBrl, fmtPct } from '@/utils/formatters';

interface LifeEvent {
  id: string;
  label: string;
  spending_novo: number;
  ano_inicio: number;
  confirmado: boolean;
  pfire_2040: number;
  delta_pp: number;
  patrimonio_necessario: number;
}

interface LifeEventsData {
  eventos: LifeEvent[];
}

interface LifeEventsTableProps {
  data?: LifeEventsData;
}

export function LifeEventsTable({ data }: LifeEventsTableProps) {
  const privacyMode = useUiStore(s => s.privacyMode);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!data || !data.eventos || data.eventos.length === 0) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: 'rgba(30, 41, 59, 0.3)',
        borderRadius: '8px',
        color: '#94a3b8',
        fontSize: '0.8rem',
      }}>
        No life events scheduled
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Title */}
      <h3 style={{
        fontSize: '0.95rem',
        fontWeight: '600',
        marginBottom: '16px',
        color: '#cbd5e1',
      }}>
        Life Events — P(FIRE) Impact Analysis
      </h3>

      {/* Events List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '12px',
      }}>
        {data.eventos.map(event => {
          const isExpanded = expandedId === event.id;
          const deltaColor = event.delta_pp > 0 ? '#ef4444' : '#22c55e'; // red if delta positive (bad), green if negative (good)

          return (
            <div
              key={event.id}
              style={{
                border: '1px solid rgba(71, 85, 105, 0.25)',
                borderRadius: '8px',
                backgroundColor: 'rgba(30, 41, 59, 0.3)',
                overflow: 'hidden',
              }}
            >
              {/* Header — Clickable */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : event.id)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                {/* Content */}
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    marginBottom: '4px',
                  }}>
                    {event.label}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span>
                      {event.confirmado ? '✓ Confirmado' : '○ Planejado'}
                    </span>
                    <span style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: event.confirmado ? '#22c55e' : '#eab308',
                    }} />
                    <span>Ano {event.ano_inicio}</span>
                  </div>
                </div>

                {/* Delta Badge */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '4px',
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                  }}>
                    ΔP(FIRE)
                  </div>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: deltaColor,
                  }}>
                    {privacyMode ? '••' : `${event.delta_pp > 0 ? '' : '+'}${event.delta_pp.toFixed(1)}pp`}
                  </div>
                </div>

                {/* Expand Arrow */}
                <div style={{
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                }}>
                  {isExpanded ? '▼' : '▶'}
                </div>
              </button>

              {/* Details — Expandable */}
              {isExpanded && (
                <div style={{
                  borderTop: '1px solid rgba(71, 85, 105, 0.15)',
                  padding: '12px 14px',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '12px',
                  fontSize: '0.75rem',
                }}>
                  <div>
                    <div style={{ color: '#94a3b8', marginBottom: '4px' }}>
                      New Annual Spend
                    </div>
                    <div style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.9rem' }}>
                      {privacyMode ? '••••' : fmtBrl(event.spending_novo)}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#94a3b8', marginBottom: '4px' }}>
                      P(FIRE) @ 2040
                    </div>
                    <div style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.9rem' }}>
                      {privacyMode ? '••' : fmtPct(event.pfire_2040, 1)}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#94a3b8', marginBottom: '4px' }}>
                      Required Patrimonio
                    </div>
                    <div style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.9rem' }}>
                      {privacyMode ? '••••' : fmtBrl(event.patrimonio_necessario)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {data.eventos.length > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '12px 14px',
          backgroundColor: 'rgba(30, 41, 59, 0.3)',
          borderRadius: '6px',
          fontSize: '0.75rem',
          color: '#94a3b8',
          lineHeight: '1.6',
        }}>
          <strong style={{ color: '#cbd5e1' }}>Impact Summary:</strong><br />
          {data.eventos.filter(e => e.confirmado).length > 0 && (
            <div>
              {data.eventos
                .filter(e => e.confirmado)
                .map(e => `${e.label}: ${e.delta_pp.toFixed(1)}pp`)
                .join(' • ')}
            </div>
          )}
          {data.eventos.filter(e => !e.confirmado).length > 0 && (
            <div style={{ opacity: 0.7 }}>
              Planned: {data.eventos
                .filter(e => !e.confirmado)
                .map(e => `${e.label}: ${e.delta_pp.toFixed(1)}pp`)
                .join(' • ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
