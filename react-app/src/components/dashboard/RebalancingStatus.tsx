'use client';

import React from 'react';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DriftItem {
  ticker: string;
  targetPercent: number;
  currentPercent: number;
  driftPp: number;
  driftDirection: 'over' | 'under';
  color: string;
}

interface RebalancingStatusProps {
  swrdTarget: number;
  swrdCurrent: number;
  avgsTarget: number;
  avgsCurrent: number;
  avemTarget: number;
  avemCurrent: number;
  ipcaTarget: number;
  ipcaCurrent: number;
  hodl11Target: number;
  hodl11Current: number;
  lastRebalanceDate?: string;
  driftThresholdPp?: number;
}

const RebalancingStatus: React.FC<RebalancingStatusProps> = ({
  swrdTarget,
  swrdCurrent,
  avgsTarget,
  avgsCurrent,
  avemTarget,
  avemCurrent,
  ipcaTarget,
  ipcaCurrent,
  hodl11Target,
  hodl11Current,
  lastRebalanceDate,
  driftThresholdPp = 3,
}) => {
  const { privacyMode } = useUiStore();

  // Calculate drifts
  const driftItems: DriftItem[] = [
    {
      ticker: 'SWRD',
      targetPercent: swrdTarget,
      currentPercent: swrdCurrent,
      driftPp: swrdCurrent - swrdTarget,
      driftDirection: (swrdCurrent - swrdTarget) > 0 ? 'over' : 'under',
      color: '#3b82f6',
    },
    {
      ticker: 'AVGS',
      targetPercent: avgsTarget,
      currentPercent: avgsCurrent,
      driftPp: avgsCurrent - avgsTarget,
      driftDirection: (avgsCurrent - avgsTarget) > 0 ? 'over' : 'under',
      color: '#06b6d4',
    },
    {
      ticker: 'AVEM',
      targetPercent: avemTarget,
      currentPercent: avemCurrent,
      driftPp: avemCurrent - avemTarget,
      driftDirection: (avemCurrent - avemTarget) > 0 ? 'over' : 'under',
      color: '#10b981',
    },
    {
      ticker: 'IPCA+',
      targetPercent: ipcaTarget,
      currentPercent: ipcaCurrent,
      driftPp: ipcaCurrent - ipcaTarget,
      driftDirection: (ipcaCurrent - ipcaTarget) > 0 ? 'over' : 'under',
      color: '#f59e0b',
    },
    {
      ticker: 'HODL11',
      targetPercent: hodl11Target,
      currentPercent: hodl11Current,
      driftPp: hodl11Current - hodl11Target,
      driftDirection: (hodl11Current - hodl11Target) > 0 ? 'over' : 'under',
      color: '#a78bfa',
    },
  ];

  // Calculate max drift
  const maxDrift = Math.max(...driftItems.map(d => Math.abs(d.driftPp)));
  const needsRebalance = maxDrift > driftThresholdPp;
  const itemsOutOfTolerance = driftItems.filter(d => Math.abs(d.driftPp) > driftThresholdPp);

  // Color helpers
  const statusBg = needsRebalance ? 'bg-amber-500/10' : 'bg-green-500/10';
  const statusBorder = needsRebalance ? 'border-amber-500/25' : 'border-green-500/25';
  const statusText = needsRebalance ? 'text-amber-500' : 'text-green-500';

  const urgencyBg = itemsOutOfTolerance.length > 2
    ? 'bg-red-500/10'
    : itemsOutOfTolerance.length > 0
      ? 'bg-amber-500/10'
      : 'bg-green-500/10';
  const urgencyBorder = itemsOutOfTolerance.length > 2
    ? 'border-red-500/25'
    : itemsOutOfTolerance.length > 0
      ? 'border-amber-500/25'
      : 'border-green-500/25';
  const urgencyText = itemsOutOfTolerance.length > 2
    ? 'text-red-500'
    : itemsOutOfTolerance.length > 0
      ? 'text-amber-500'
      : 'text-green-500';

  return (
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Rebalancing Status — Desvios de Alocação
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Rebalancing signal */}
        <div className={`p-3 rounded border ${statusBg} ${statusBorder}`}>
          <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
            Status de Rebalanceamento
          </div>
          <div className={`text-base font-bold mb-1 ${statusText}`}>
            {needsRebalance ? '⚠️ Rebalancear Agora' : '✅ Em Tolerância'}
          </div>
          <div className="text-xs text-slate-400">
            Max desvio: {maxDrift.toFixed(1)}pp (limite: {driftThresholdPp}pp)
            {lastRebalanceDate && (
              <>
                <br />
                Último rebalanceamento: {new Date(lastRebalanceDate).toLocaleDateString('pt-BR')}
              </>
            )}
          </div>
        </div>

        {/* Drift bars */}
        <div>
          <div className="text-sm font-semibold text-slate-200 mb-3">
            Desvios por Ativo
          </div>

          <div className="flex flex-col gap-3">
            {driftItems.map(item => {
              const barWidth = Math.min(Math.abs(item.driftPp) * 5, 100);
              const isOut = Math.abs(item.driftPp) > driftThresholdPp;

              return (
                <div key={item.ticker}>
                  {/* Label and values */}
                  <div className="flex justify-between items-center mb-1 text-xs text-slate-400">
                    <span style={{ color: item.color, fontWeight: 600 }}>
                      {item.ticker}
                    </span>
                    <span>
                      {item.currentPercent.toFixed(1)}% (alvo: {item.targetPercent.toFixed(1)}%)
                    </span>
                  </div>

                  {/* Drift bar */}
                  <div
                    className="h-6 bg-slate-700/15 rounded overflow-hidden relative flex items-center"
                    style={{ border: isOut ? `2px solid ${item.color}` : '1px solid rgba(71, 85, 105, 0.3)' }}
                  >
                    {/* Center (target) line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600 opacity-50" />

                    {/* Tolerance zone (±3pp) */}
                    <div
                      className="absolute top-0 bottom-0 bg-green-500/5 border border-dashed border-green-500/30"
                      style={{
                        left: `calc(50% - ${driftThresholdPp * 5}%)`,
                        width: `${driftThresholdPp * 10}%`,
                      }}
                    />

                    {/* Drift bar */}
                    <div
                      className="absolute h-full flex items-center justify-center text-xs font-semibold text-white"
                      style={{
                        backgroundColor: item.color,
                        opacity: 0.8,
                        left: item.driftPp >= 0 ? '50%' : `calc(50% - ${barWidth}%)`,
                        width: `${barWidth}%`,
                      }}
                    >
                      {Math.abs(item.driftPp) > 0.5 && `${item.driftPp >= 0 ? '+' : ''}${item.driftPp.toFixed(1)}pp`}
                    </div>
                  </div>

                  {/* Status label */}
                  <div
                    className="text-xs mt-1"
                    style={{
                      color: isOut ? item.color : '#94a3b8',
                      fontWeight: isOut ? 600 : 400,
                    }}
                  >
                    {item.driftPp > 0 ? '↑ Acumulou' : '↓ Deficitário'}
                    {isOut && ' [FORA DE TOLERÂNCIA]'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Max deviation */}
          <div className="p-3 bg-violet-500/10 border border-violet-500/25 rounded">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Desvio Máximo
            </div>
            <div className={`text-base font-bold mb-1 ${statusText}`}>
              {maxDrift.toFixed(2)}pp
            </div>
            <div className="text-xs text-slate-500">
              vs. tolerância de {driftThresholdPp}pp
            </div>
          </div>

          {/* Assets out of tolerance */}
          <div className="p-3 bg-red-500/10 border border-red-500/25 rounded">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Fora de Tolerância
            </div>
            <div className="text-base font-bold text-red-500 mb-1">
              {itemsOutOfTolerance.length}
            </div>
            <div className="text-xs text-slate-500">
              de {driftItems.length} ativos
            </div>
          </div>

          {/* Rebalance urgency */}
          <div className={`p-3 rounded border ${urgencyBg} ${urgencyBorder}`}>
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Urgência
            </div>
            <div className={`text-base font-bold mb-1 ${urgencyText}`}>
              {itemsOutOfTolerance.length > 2 ? '🚨 CRÍTICA' : itemsOutOfTolerance.length > 0 ? '⚠️ ALTA' : '✅ BAIXA'}
            </div>
            <div className="text-xs text-slate-500">
              Rebalancear hoje
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {itemsOutOfTolerance.length > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded">
            <div className="text-xs text-amber-500 font-semibold mb-2">
              ⚠️ Ações Recomendadas:
            </div>
            <ul className="m-0 pl-5 text-xs text-slate-200 space-y-1">
              {itemsOutOfTolerance.map(item => (
                <li key={item.ticker}>
                  {item.driftPp > 0 ? 'Vender' : 'Comprar'} {item.ticker} ({Math.abs(item.driftPp).toFixed(1)}pp acima do alvo)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-3 p-2 text-xs text-slate-500 bg-slate-700/5 rounded">
          <strong>📌 Nota:</strong> Rebalanceamento recomendado quando qualquer ativo desviar &gt;{driftThresholdPp}pp do alvo. Realizar trimestralmente ou quando gatilho disparar. Tax-aware: considerar IR ao executar vendas.
        </div>
      </CardContent>
    </Card>
  );
};

export default RebalancingStatus;
