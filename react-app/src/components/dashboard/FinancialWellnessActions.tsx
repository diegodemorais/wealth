import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Financial Wellness & Ações Prioritárias
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Wellness Score Display */}
        <div className="text-center p-3 bg-cyan-500/10 rounded">
          <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
            Wellness Score
          </div>
          <div className="text-4xl font-black text-cyan-500 mb-1">
            {privacyMode ? '••' : Math.round(wellnessScore)}
          </div>
          <div className="text-xs text-slate-200 font-medium mb-3">
            {wellnessLabel}
          </div>

          {/* Wellness Bar */}
          <div className="h-1 bg-slate-700/15 rounded overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${Math.min(100, wellnessScore)}%`,
                backgroundColor: wellnessScore >= 80 ? '#22c55e' : wellnessScore >= 60 ? '#eab308' : '#ef4444',
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/15" />

      {/* Actions Section */}
      <div>
        <div
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => setExpandActions(!expandActions)}
        >
          <h3 className="text-sm font-semibold text-slate-200">
            Top 5 Ações ({displayedAcoes.length})
          </h3>
          <span className="text-xs text-slate-400">
            {expandActions ? '▼' : '▶'}
          </span>
        </div>

        {(expandActions || displayedAcoes.length <= 3) && displayedAcoes.length > 0 && (
          <div className="mt-3">
            {displayedAcoes.map((acao, idx) => (
              <div
                key={idx}
                className="flex gap-3 mb-3 p-3 rounded-sm"
                style={{
                  borderLeft: `4px solid ${getPriorityColor(acao.priority)}`,
                  backgroundColor: getPriorityBg(acao.priority),
                }}
              >
                {/* Rank badge */}
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0 w-8 h-8"
                  style={{
                    backgroundColor: getPriorityColor(acao.priority),
                  }}
                >
                  <span className="text-xs font-black text-white">
                    {acao.rank}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-200 mb-1">
                    {acao.metric}
                  </div>
                  <div className="text-xs text-slate-400 mb-2">
                    {acao.action}
                  </div>
                  <div className="flex gap-3 text-xs text-slate-500">
                    <span>
                      Atual: <span className="font-semibold text-slate-200">{acao.current_pts}pts</span>
                    </span>
                    <span>
                      Potencial: <span className="font-semibold" style={{ color: getPriorityColor(acao.priority) }}>{acao.potential_pts}pts</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {displayedAcoes.length === 0 && (
          <div className="text-xs text-slate-500 p-2 text-center">
            Nenhuma ação prioritária identificada
          </div>
        )}
      </div>
    </CardContent>
    </Card>
  );
};

export default FinancialWellnessActions;
