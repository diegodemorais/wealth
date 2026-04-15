import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';

interface CashFlowSankeyProps {
  aporteMensal: number;
  ipcaFlow: number;
  equityFlow: number;
  rendaPlusFlow: number;
  cryptoFlow: number;
}

const CashFlowSankey: React.FC<CashFlowSankeyProps> = ({
  aporteMensal,
  ipcaFlow,
  equityFlow,
  rendaPlusFlow,
  cryptoFlow,
}) => {
  const { privacyMode } = useUiStore();
  const [expandBreakdown, setExpandBreakdown] = useState(false);

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalFlow = ipcaFlow + equityFlow + rendaPlusFlow + cryptoFlow;
  const ipcaPct = totalFlow > 0 ? ipcaFlow / totalFlow : 0;
  const equityPct = totalFlow > 0 ? equityFlow / totalFlow : 0;
  const rendaPlusPct = totalFlow > 0 ? rendaPlusFlow / totalFlow : 0;
  const cryptoPct = totalFlow > 0 ? cryptoFlow / totalFlow : 0;

  const colors = {
    ipca: '#06b6d4',
    equity: '#3b82f6',
    rendaPlus: '#f59e0b',
    crypto: '#8b5cf6',
  };

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Fluxo de Caixa Anual — Aporte Distribuição
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Input card (Aporte) */}
        <div style={{ padding: '12px', background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
            Aporte Mensal
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>
            {privacyMode ? 'R$••••' : fmtBrl(aporteMensal)}
          </div>
        </div>

        {/* Flow visualization */}
        <div style={{ display: 'flex', gap: '2px', height: '32px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
          {[
            { pct: ipcaPct, color: colors.ipca },
            { pct: equityPct, color: colors.equity },
            { pct: rendaPlusPct, color: colors.rendaPlus },
            { pct: cryptoPct, color: colors.crypto },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                flex: item.pct,
                backgroundColor: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: item.pct > 0.08 ? 'auto' : '0px',
              }}
            >
              {item.pct > 0.08 && (
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'white' }}>
                  {(item.pct * 100).toFixed(0)}%
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Expandable breakdown */}
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', paddingTop: '16px', borderTop: '1px solid var(--border)' }}
          onClick={() => setExpandBreakdown(!expandBreakdown)}
        >
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            Destinos
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            {expandBreakdown ? '▼' : '▶'}
          </span>
        </div>

        {expandBreakdown && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'IPCA+ Ladder', sub: 'Renda fixa de longo prazo', value: ipcaFlow, pct: ipcaPct, color: colors.ipca },
              { label: 'Equity International', sub: 'SWRD / AVGS / AVEM', value: equityFlow, pct: equityPct, color: colors.equity },
              { label: 'Renda+ 2065', sub: 'Título prefixado tático', value: rendaPlusFlow, pct: rendaPlusPct, color: colors.rendaPlus },
              { label: 'Criptoativos', sub: 'Bitcoin via HODL11', value: cryptoFlow, pct: cryptoPct, color: colors.crypto },
            ].map(item => (
              <div
                key={item.label}
                style={{
                  padding: '12px',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: `${item.color}14`,
                  borderLeft: `4px solid ${item.color}`,
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{item.sub}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: item.color }}>
                    {privacyMode ? 'R$••••' : fmtBrl(item.value)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                    {(item.pct * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowSankey;
