'use client';

import { fmtPrivacy } from '@/utils/privacyTransform';
import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { fmtPrivacy } from '@/utils/privacyTransform';
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
  swrdTarget, swrdCurrent,
  avgsTarget, avgsCurrent,
  avemTarget, avemCurrent,
  ipcaTarget, ipcaCurrent,
  hodl11Target, hodl11Current,
  lastRebalanceDate,
  driftThresholdPp = 3,
}) => {
  const { privacyMode } = useUiStore();

  const driftItems: DriftItem[] = [
    { ticker: 'SWRD', targetPercent: swrdTarget, currentPercent: swrdCurrent, driftPp: swrdCurrent - swrdTarget, driftDirection: (swrdCurrent - swrdTarget) > 0 ? 'over' : 'under', color: 'var(--accent)' },
    { ticker: 'AVGS', targetPercent: avgsTarget, currentPercent: avgsCurrent, driftPp: avgsCurrent - avgsTarget, driftDirection: (avgsCurrent - avgsTarget) > 0 ? 'over' : 'under', color: 'var(--cyan)' },
    { ticker: 'AVEM', targetPercent: avemTarget, currentPercent: avemCurrent, driftPp: avemCurrent - avemTarget, driftDirection: (avemCurrent - avemTarget) > 0 ? 'over' : 'under', color: 'var(--green)' },
    { ticker: 'IPCA+', targetPercent: ipcaTarget, currentPercent: ipcaCurrent, driftPp: ipcaCurrent - ipcaTarget, driftDirection: (ipcaCurrent - ipcaTarget) > 0 ? 'over' : 'under', color: 'var(--yellow)' },
    { ticker: 'Cripto', targetPercent: hodl11Target, currentPercent: hodl11Current, driftPp: hodl11Current - hodl11Target, driftDirection: (hodl11Current - hodl11Target) > 0 ? 'over' : 'under', color: 'rgba(168, 85, 247, 0.7)' },
  ];

  const maxDrift = Math.max(...driftItems.map(d => Math.abs(d.driftPp)));
  const needsRebalance = maxDrift > driftThresholdPp;
  const itemsOutOfTolerance = driftItems.filter(d => Math.abs(d.driftPp) > driftThresholdPp);

  const statusBg = needsRebalance ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)';
  const statusBorder = needsRebalance ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)';
  const statusColor = needsRebalance ? 'var(--yellow)' : 'var(--green)';

  const urgencyBg = itemsOutOfTolerance.length > 2 ? 'rgba(239,68,68,0.1)' : itemsOutOfTolerance.length > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)';
  const urgencyBorder = itemsOutOfTolerance.length > 2 ? 'rgba(239,68,68,0.25)' : itemsOutOfTolerance.length > 0 ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)';
  const urgencyColor = itemsOutOfTolerance.length > 2 ? 'var(--red)' : itemsOutOfTolerance.length > 0 ? 'var(--yellow)' : 'var(--green)';

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '16px' }}>
      <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Rebalancing Status — Desvios de Alocação
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Rebalancing signal */}
        <div style={{ padding: 'var(--space-3)', borderRadius: '4px', background: statusBg, border: `1px solid ${statusBorder}` }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Status de Rebalanceamento</div>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '4px', color: statusColor }}>
            {needsRebalance
              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} />Rebalancear Agora</span>
              : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><CheckCircle size={14} />Em Tolerância</span>}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
            Max desvio: {maxDrift.toFixed(1)}pp (limite: {driftThresholdPp}pp)
            {lastRebalanceDate && (
              <><br />Último rebalanceamento: {new Date(lastRebalanceDate).toLocaleDateString('pt-BR')}</>
            )}
          </div>
        </div>

        {/* Drift bars */}
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>Desvios por Ativo</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {driftItems.map(item => {
              const absDrift = Math.abs(item.driftPp);
              const barWidth = Math.min(absDrift * 5, 100);
              const isOut = absDrift > driftThresholdPp;

              // Threshold zones: 0–3pp = verde, 3–5pp = amarelo, >5pp = vermelho
              const zoneColor =
                absDrift > 5 ? 'var(--red)' :
                absDrift > 3 ? 'var(--yellow)' :
                'var(--green)';

              const zoneBg =
                absDrift > 5 ? 'rgba(248,81,73,0.75)' :
                absDrift > 3 ? 'rgba(202,138,4,0.75)' :
                'rgba(62,211,129,0.75)';

              return (
                <div key={item.ticker}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                    <span style={{ fontWeight: 600, color: item.color }}>{item.ticker}</span>
                    <span style={{ color: isOut ? zoneColor : 'var(--muted)', fontWeight: isOut ? 600 : 400 }}>
                      {item.currentPercent.toFixed(1)}% (alvo: {item.targetPercent.toFixed(1)}%)
                      {' '}
                      <span style={{ fontFamily: 'monospace' }}>
                        {item.driftPp >= 0 ? '+' : ''}{item.driftPp.toFixed(1)}pp
                      </span>
                    </span>
                  </div>

                  <div
                    style={{
                      height: '20px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden',
                      position: 'relative', display: 'flex', alignItems: 'center',
                      border: `1px solid ${isOut ? zoneColor : 'rgba(71, 85, 105, 0.3)'}`,
                    }}
                  >
                    {/* Zone backgrounds: verde (0-3pp) | amarelo (3-5pp) | vermelho (>5pp) */}
                    {/* Green zone: center ±3pp */}
                    <div style={{
                      position: 'absolute', top: 0, bottom: 0,
                      background: 'rgba(62,211,129,0.07)',
                      left: 'calc(50% - 15%)',
                      width: '30%',
                    }} />
                    {/* Yellow zone: ±3–5pp — left side */}
                    <div style={{
                      position: 'absolute', top: 0, bottom: 0,
                      background: 'rgba(202,138,4,0.07)',
                      left: 'calc(50% - 25%)',
                      width: '10%',
                    }} />
                    {/* Yellow zone: ±3–5pp — right side */}
                    <div style={{
                      position: 'absolute', top: 0, bottom: 0,
                      background: 'rgba(202,138,4,0.07)',
                      left: 'calc(50% + 15%)',
                      width: '10%',
                    }} />
                    {/* Red zone: >5pp — left tail */}
                    <div style={{
                      position: 'absolute', top: 0, bottom: 0,
                      background: 'rgba(248,81,73,0.07)',
                      left: 0,
                      width: 'calc(50% - 25%)',
                    }} />
                    {/* Red zone: >5pp — right tail */}
                    <div style={{
                      position: 'absolute', top: 0, bottom: 0,
                      background: 'rgba(248,81,73,0.07)',
                      left: 'calc(50% + 25%)',
                      right: 0,
                    }} />

                    {/* Center (target) line */}
                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'var(--muted)', opacity: 0.4 }} />

                    {/* Threshold markers at ±3pp and ±5pp */}
                    <div style={{ position: 'absolute', left: 'calc(50% - 15%)', top: 0, bottom: 0, width: '1px', background: 'rgba(62,211,129,0.4)' }} />
                    <div style={{ position: 'absolute', left: 'calc(50% + 15%)', top: 0, bottom: 0, width: '1px', background: 'rgba(62,211,129,0.4)' }} />
                    <div style={{ position: 'absolute', left: 'calc(50% - 25%)', top: 0, bottom: 0, width: '1px', background: 'rgba(202,138,4,0.4)' }} />
                    <div style={{ position: 'absolute', left: 'calc(50% + 25%)', top: 0, bottom: 0, width: '1px', background: 'rgba(202,138,4,0.4)' }} />

                    {/* Drift bar — color reflects zone, not ticker */}
                    <div
                      style={{
                        position: 'absolute', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'var(--text-xs)', fontWeight: 700, color: '#fff',
                        backgroundColor: zoneBg,
                        left: item.driftPp >= 0 ? '50%' : `calc(50% - ${barWidth}%)`,
                        width: `${barWidth}%`,
                        minWidth: absDrift > 0.3 ? '2px' : 0,
                      }}
                    >
                      {absDrift > 1.5 && `${item.driftPp >= 0 ? '+' : ''}${item.driftPp.toFixed(1)}`}
                    </div>
                  </div>

                  {/* Zone label */}
                  <div style={{ fontSize: 'var(--text-xs)', marginTop: '3px', color: zoneColor, fontWeight: isOut ? 600 : 400 }}>
                    {absDrift > 5
                      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--red)', flexShrink: 0 }} />Crítico</span>
                      : absDrift > 3
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--yellow)', flexShrink: 0 }} />Atenção</span>
                        : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--green)', flexShrink: 0 }} />OK</span>}
                    {' — '}
                    {item.driftPp > 0 ? 'acumulou' : 'deficitário'}
                    {isOut && ' · fora da tolerância'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div style={{ padding: 'var(--space-3)', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Desvio Máximo</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '4px', color: statusColor }}>{maxDrift.toFixed(2)}pp</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>vs. tolerância de {driftThresholdPp}pp</div>
          </div>

          <div style={{ padding: 'var(--space-3)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Fora de Tolerância</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--red)', marginBottom: '4px' }}>{itemsOutOfTolerance.length}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>de {driftItems.length} ativos</div>
          </div>

          <div style={{ padding: 'var(--space-3)', borderRadius: '4px', background: urgencyBg, border: `1px solid ${urgencyBorder}` }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Urgência</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '4px', color: urgencyColor }}>
              {itemsOutOfTolerance.length > 2
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><AlertCircle size={14} />CRÍTICA</span>
                : itemsOutOfTolerance.length > 0
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} />ALTA</span>
                  : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><CheckCircle size={14} />BAIXA</span>}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>Rebalancear hoje</div>
          </div>
        </div>

        {/* Recommendations */}
        {itemsOutOfTolerance.length > 0 && (
          <div style={{ padding: 'var(--space-3)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--yellow)', fontWeight: 600, marginBottom: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={13} />Ações Recomendadas:</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: 'var(--text-sm)', color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {itemsOutOfTolerance.map(item => (
                <li key={item.ticker}>
                  {item.driftPp > 0 ? 'Vender' : 'Comprar'} {item.ticker} ({Math.abs(item.driftPp).toFixed(1)}pp acima do alvo)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer note */}
        <div style={{ padding: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--muted)', background: 'var(--bg)', borderRadius: '4px' }}>
          <strong>📌 Nota:</strong> Rebalanceamento recomendado quando qualquer ativo desviar &gt;{driftThresholdPp}pp do alvo. Realizar trimestralmente ou quando gatilho disparar. Tax-aware: considerar IR ao executar vendas.
        </div>
      </div>
    </div>
  );
};

export default RebalancingStatus;
