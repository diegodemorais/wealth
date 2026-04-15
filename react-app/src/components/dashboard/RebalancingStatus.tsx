'use client';

import React from 'react';
import { useUiStore } from '@/store/uiStore';

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
        Rebalancing Status — Desvios de Alocação
      </h2>

      {/* Rebalancing signal */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: needsRebalance ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          border: needsRebalance ? '1px solid #f59e0b40' : '1px solid #22c55e40',
          borderRadius: '6px',
          marginBottom: '14px',
        }}
      >
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
          Status de Rebalanceamento
        </div>
        <div
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: needsRebalance ? '#f59e0b' : '#22c55e',
          }}
        >
          {needsRebalance ? '⚠️ Rebalancear Agora' : '✅ Em Tolerância'}
        </div>
        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
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
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>
          Desvios por Ativo
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {driftItems.map(item => {
            const barWidth = Math.min(Math.abs(item.driftPp) * 5, 100);
            const isOut = Math.abs(item.driftPp) > driftThresholdPp;

            return (
              <div key={item.ticker}>
                {/* Label and values */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px',
                    fontSize: '0.75rem',
                  }}
                >
                  <span style={{ color: item.color, fontWeight: 600 }}>
                    {item.ticker}
                  </span>
                  <span style={{ color: '#94a3b8' }}>
                    {item.currentPercent.toFixed(1)}% (alvo: {item.targetPercent.toFixed(1)}%)
                  </span>
                </div>

                {/* Drift bar */}
                <div
                  style={{
                    height: '24px',
                    backgroundColor: 'rgba(71, 85, 105, 0.15)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    border: isOut ? `2px solid ${item.color}` : '1px solid rgba(71, 85, 105, 0.3)',
                  }}
                >
                  {/* Center (target) line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: 0,
                      bottom: 0,
                      width: '2px',
                      backgroundColor: '#64748b',
                      opacity: 0.5,
                    }}
                  />

                  {/* Tolerance zone (±3pp) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `calc(50% - ${driftThresholdPp * 5}%)`,
                      width: `${driftThresholdPp * 10}%`,
                      top: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(34, 197, 94, 0.05)',
                      border: '1px dashed rgba(34, 197, 94, 0.3)',
                    }}
                  />

                  {/* Drift bar */}
                  <div
                    style={{
                      position: 'absolute',
                      left: item.driftPp >= 0 ? '50%' : `calc(50% - ${barWidth}%)`,
                      width: `${barWidth}%`,
                      height: '100%',
                      backgroundColor: item.color,
                      opacity: 0.8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: 'white',
                    }}
                  >
                    {Math.abs(item.driftPp) > 0.5 && `${item.driftPp >= 0 ? '+' : ''}${item.driftPp.toFixed(1)}pp`}
                  </div>
                </div>

                {/* Status label */}
                <div
                  style={{
                    marginTop: '2px',
                    fontSize: '0.65rem',
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          marginBottom: '14px',
        }}
      >
        {/* Max deviation */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid #8b5cf640',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Desvio Máximo
          </div>
          <div
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: needsRebalance ? '#f59e0b' : '#22c55e',
            }}
          >
            {maxDrift.toFixed(2)}pp
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            vs. tolerância de {driftThresholdPp}pp
          </div>
        </div>

        {/* Assets out of tolerance */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef444440',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Fora de Tolerância
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>
            {itemsOutOfTolerance.length}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            de {driftItems.length} ativos
          </div>
        </div>

        {/* Rebalance urgency */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: itemsOutOfTolerance.length > 2
              ? 'rgba(239, 68, 68, 0.1)'
              : itemsOutOfTolerance.length > 0
                ? 'rgba(245, 158, 11, 0.1)'
                : 'rgba(34, 197, 94, 0.1)',
            border: itemsOutOfTolerance.length > 2
              ? '1px solid #ef444440'
              : itemsOutOfTolerance.length > 0
                ? '1px solid #f59e0b40'
                : '1px solid #22c55e40',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Urgência
          </div>
          <div
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: itemsOutOfTolerance.length > 2
                ? '#ef4444'
                : itemsOutOfTolerance.length > 0
                  ? '#f59e0b'
                  : '#22c55e',
            }}
          >
            {itemsOutOfTolerance.length > 2 ? '🚨 CRÍTICA' : itemsOutOfTolerance.length > 0 ? '⚠️ ALTA' : '✅ BAIXA'}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            Rebalancear hoje
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {itemsOutOfTolerance.length > 0 && (
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid #f59e0b40',
            borderRadius: '6px',
            marginBottom: '14px',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, marginBottom: '6px' }}>
            ⚠️ Ações Recomendadas:
          </div>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '0.7rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            {itemsOutOfTolerance.map(item => (
              <li key={item.ticker}>
                {item.driftPp > 0 ? 'Vender' : 'Comprar'} {item.ticker} ({Math.abs(item.driftPp).toFixed(1)}pp acima do alvo)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer note */}
      <div
        style={{
          marginTop: '12px',
          fontSize: '0.7rem',
          color: '#64748b',
          padding: '8px',
          backgroundColor: 'rgba(71, 85, 105, 0.08)',
          borderRadius: '4px',
        }}
      >
        <strong>📌 Nota:</strong> Rebalanceamento recomendado quando qualquer ativo desviar &gt;{driftThresholdPp}pp do alvo. Realizar trimestralmente ou quando gatilho disparar. Tax-aware: considerar IR ao executar vendas.
      </div>
    </div>
  );
};

export default RebalancingStatus;
