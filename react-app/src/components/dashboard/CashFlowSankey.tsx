import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';

interface CashFlowSankeyProps {
  aporteMensal: number;
  ipcaFlow: number; // R$ flowing to IPCA+
  equityFlow: number; // R$ flowing to Equity
  rendaPlusFlow: number; // R$ flowing to Renda+
  cryptoFlow: number; // R$ flowing to Crypto
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
    ipca: '#06b6d4', // cyan
    equity: '#3b82f6', // blue
    rendaPlus: '#f59e0b', // amber
    crypto: '#8b5cf6', // violet
  };

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
        Fluxo de Caixa Anual — Aporte Distribuição
      </h2>

      {/* Input card (Aporte) */}
      <div
        style={{
          padding: '12px',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '2px solid #22c55e',
          borderRadius: '6px',
          textAlign: 'center',
          marginBottom: '14px',
        }}
      >
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
          Aporte Mensal
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#22c55e' }}>
          {privacyMode ? 'R$••••' : fmtBrl(aporteMensal)}
        </div>
      </div>

      {/* Flow visualization: horizontal distribution */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            gap: '4px',
            height: '32px',
            borderRadius: '4px',
            overflow: 'hidden',
            backgroundColor: 'rgba(71, 85, 105, 0.1)',
          }}
        >
          {/* IPCA+ bar */}
          <div
            style={{
              flex: ipcaPct,
              backgroundColor: colors.ipca,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'white',
              minWidth: ipcaPct > 0.08 ? 'auto' : '0px',
            }}
          >
            {ipcaPct > 0.08 ? `${(ipcaPct * 100).toFixed(0)}%` : ''}
          </div>

          {/* Equity bar */}
          <div
            style={{
              flex: equityPct,
              backgroundColor: colors.equity,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'white',
              minWidth: equityPct > 0.08 ? 'auto' : '0px',
            }}
          >
            {equityPct > 0.08 ? `${(equityPct * 100).toFixed(0)}%` : ''}
          </div>

          {/* Renda+ bar */}
          <div
            style={{
              flex: rendaPlusPct,
              backgroundColor: colors.rendaPlus,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'white',
              minWidth: rendaPlusPct > 0.08 ? 'auto' : '0px',
            }}
          >
            {rendaPlusPct > 0.08 ? `${(rendaPlusPct * 100).toFixed(0)}%` : ''}
          </div>

          {/* Crypto bar */}
          <div
            style={{
              flex: cryptoPct,
              backgroundColor: colors.crypto,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'white',
              minWidth: cryptoPct > 0.08 ? 'auto' : '0px',
            }}
          >
            {cryptoPct > 0.08 ? `${(cryptoPct * 100).toFixed(0)}%` : ''}
          </div>
        </div>
      </div>

      {/* Expandable breakdown */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          marginBottom: '8px',
        }}
        onClick={() => setExpandBreakdown(!expandBreakdown)}
      >
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: '#cbd5e1' }}>
          Destinos
        </h3>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {expandBreakdown ? '▼' : '▶'}
        </span>
      </div>

      {expandBreakdown && (
        <div style={{ marginTop: '12px' }}>
          {/* IPCA+ row */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              borderLeft: `4px solid ${colors.ipca}`,
              borderRadius: '4px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
                IPCA+ Ladder
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Renda fixa de longo prazo
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: colors.ipca }}>
                {privacyMode ? 'R$••••' : fmtBrl(ipcaFlow)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {(ipcaPct * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Equity row */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              borderLeft: `4px solid ${colors.equity}`,
              borderRadius: '4px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
                Equity International
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                SWRD / AVGS / AVEM
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: colors.equity }}>
                {privacyMode ? 'R$••••' : fmtBrl(equityFlow)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {(equityPct * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Renda+ row */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              borderLeft: `4px solid ${colors.rendaPlus}`,
              borderRadius: '4px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
                Renda+ 2065
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Título prefixado tático
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: colors.rendaPlus }}>
                {privacyMode ? 'R$••••' : fmtBrl(rendaPlusFlow)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {(rendaPlusPct * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Crypto row */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(139, 92, 246, 0.08)',
              borderLeft: `4px solid ${colors.crypto}`,
              borderRadius: '4px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
                Criptoativos
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Bitcoin via HODL11
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: colors.crypto }}>
                {privacyMode ? 'R$••••' : fmtBrl(cryptoFlow)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {(cryptoPct * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowSankey;
