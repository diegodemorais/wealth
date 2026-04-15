'use client';

import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtBrl, fmtPct } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      <Card className="bg-slate-900/30">
        <CardContent className="text-xs text-slate-400 text-center py-6">
          No life events scheduled
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-200 mb-4">
        Life Events — P(FIRE) Impact Analysis
      </h3>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.eventos.map(event => {
          const isExpanded = expandedId === event.id;
          const deltaColor = event.delta_pp > 0 ? 'text-red-500' : 'text-green-500';
          const statusColor = event.confirmado ? 'bg-green-500/20' : 'bg-yellow-500/20';
          const statusTextColor = event.confirmado ? 'text-green-500' : 'text-yellow-500';
          const dotColor = event.confirmado ? 'bg-green-500' : 'bg-yellow-500';

          return (
            <Card key={event.id} className="bg-slate-900/30 border-slate-700/25 overflow-hidden">
              {/* Header — Clickable */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : event.id)}
                className="w-full p-3 bg-transparent border-none cursor-pointer flex items-center justify-between gap-3 hover:bg-slate-800/20 transition"
              >
                {/* Content */}
                <div className="flex-1 text-left">
                  <div className="text-xs font-semibold text-slate-200 mb-1">
                    {event.label}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>
                      {event.confirmado ? '✓ Confirmado' : '○ Planejado'}
                    </span>
                    <span className={`w-1 h-1 rounded-full ${dotColor}`} />
                    <span>Ano {event.ano_inicio}</span>
                  </div>
                </div>

                {/* Delta Badge */}
                <div className="flex flex-col items-end gap-1">
                  <div className="text-xs text-slate-400 uppercase">
                    ΔP(FIRE)
                  </div>
                  <div className={`text-lg font-bold ${deltaColor}`}>
                    {privacyMode ? '••' : `${event.delta_pp > 0 ? '' : '+'}${event.delta_pp.toFixed(1)}pp`}
                  </div>
                </div>

                {/* Expand Arrow */}
                <div className="text-slate-400 text-xs">
                  {isExpanded ? '▼' : '▶'}
                </div>
              </button>

              {/* Details — Expandable */}
              {isExpanded && (
                <div className="border-t border-slate-700/15 p-3 bg-slate-900/50 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400 mb-1">
                      New Annual Spend
                    </div>
                    <div className="text-slate-200 font-semibold text-sm">
                      {privacyMode ? '••••' : fmtBrl(event.spending_novo)}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 mb-1">
                      P(FIRE) @ 2040
                    </div>
                    <div className="text-slate-200 font-semibold text-sm">
                      {privacyMode ? '••' : fmtPct(event.pfire_2040, 1)}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 mb-1">
                      Required Patrimonio
                    </div>
                    <div className="text-slate-200 font-semibold text-sm">
                      {privacyMode ? '••••' : fmtBrl(event.patrimonio_necessario)}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      {data.eventos.length > 0 && (
        <Card className="bg-slate-900/30 mt-4">
          <CardContent className="p-3 text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Impact Summary:</strong><br />
            {data.eventos.filter(e => e.confirmado).length > 0 && (
              <div className="mt-1">
                {data.eventos
                  .filter(e => e.confirmado)
                  .map(e => `${e.label}: ${e.delta_pp.toFixed(1)}pp`)
                  .join(' • ')}
              </div>
            )}
            {data.eventos.filter(e => !e.confirmado).length > 0 && (
              <div className="opacity-70 mt-1">
                Planned: {data.eventos
                  .filter(e => !e.confirmado)
                  .map(e => `${e.label}: ${e.delta_pp.toFixed(1)}pp`)
                  .join(' • ')}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
