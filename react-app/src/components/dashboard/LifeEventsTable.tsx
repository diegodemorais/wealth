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
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)' }}>
        No life events scheduled
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', margin: 0 }}>
        Life Events — P(FIRE) Impact Analysis
      </h3>

      {/* Events List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {data.eventos.map(event => {
          const isExpanded = expandedId === event.id;
          const deltaColor = event.delta_pp > 0 ? '#ef4444' : '#22c55e';
          const dotColor = event.confirmado ? '#22c55e' : '#eab308';

          return (
            <div key={event.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              {/* Header — Clickable */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : event.id)}
                style={{
                  width: '100%', padding: '12px', background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                }}
              >
                {/* Content */}
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                    {event.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{event.confirmado ? '✓ Confirmado' : '○ Planejado'}</span>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dotColor, display: 'inline-block' }} />
                    <span>Ano {event.ano_inicio}</span>
                  </div>
                </div>

                {/* Delta Badge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase' }}>ΔP(FIRE)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: deltaColor }}>
                    {privacyMode ? '••' : `${event.delta_pp > 0 ? '' : '+'}${event.delta_pp.toFixed(1)}pp`}
                  </div>
                </div>

                {/* Expand Arrow */}
                <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                  {isExpanded ? '▼' : '▶'}
                </div>
              </button>

              {/* Details — Expandable */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '12px', background: 'var(--bg)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px', fontSize: '0.75rem' }}>
                  <div>
                    <div style={{ color: 'var(--muted)', marginBottom: '4px' }}>New Annual Spend</div>
                    <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.875rem' }}>
                      {privacyMode ? '••••' : fmtBrl(event.spending_novo)}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--muted)', marginBottom: '4px' }}>P(FIRE) @ 2040</div>
                    <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.875rem' }}>
                      {privacyMode ? '••' : fmtPct(event.pfire_2040, 1)}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--muted)', marginBottom: '4px' }}>Required Patrimonio</div>
                    <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.875rem' }}>
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
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '12px', fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6, marginTop: '16px' }}>
          <strong style={{ color: 'var(--text)' }}>Impact Summary:</strong><br />
          {data.eventos.filter(e => e.confirmado).length > 0 && (
            <div style={{ marginTop: '4px' }}>
              {data.eventos
                .filter(e => e.confirmado)
                .map(e => `${e.label}: ${e.delta_pp.toFixed(1)}pp`)
                .join(' • ')}
            </div>
          )}
          {data.eventos.filter(e => !e.confirmado).length > 0 && (
            <div style={{ opacity: 0.7, marginTop: '4px' }}>
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
