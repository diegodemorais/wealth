'use client';

import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';

interface IpcaTaxaProgressProps {
  taxaAtual: number; // Current IPCA+ yield
  ipca2040Valor: number; // Value in IPCA 2040 bond
  ipca2040AlvoPercent: number; // Target % of portfolio
  ipca2040AtualPercent: number; // Current % of portfolio
  ipca2050Valor: number; // Value in IPCA 2050 bond
  ipca2050AlvoPercent: number; // Target % of portfolio
  ipca2050AtualPercent: number; // Current % of portfolio
  ipcaTotalBrl: number; // Total IPCA+ value
  totalPortfolio: number; // Total portfolio value
}

const IpcaTaxaProgress: React.FC<IpcaTaxaProgressProps> = ({
  taxaAtual,
  ipca2040Valor,
  ipca2040AlvoPercent,
  ipca2040AtualPercent,
  ipca2050Valor,
  ipca2050AlvoPercent,
  ipca2050AtualPercent,
  ipcaTotalBrl,
  totalPortfolio,
}) => {
  const { privacyMode } = useUiStore();
  const [expandDetails, setExpandDetails] = useState(false);

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Calculate progress towards targets
  const ipca2040Gap = ipca2040AlvoPercent - ipca2040AtualPercent;
  const ipca2050Gap = ipca2050AlvoPercent - ipca2050AtualPercent;
  const ipcaTotalCurrentPercent = totalPortfolio > 0 ? (ipcaTotalBrl / totalPortfolio) * 100 : 0;
  const ipcaTotalAlvoPercent = ipca2040AlvoPercent + ipca2050AlvoPercent;
  const ipcaTotalGap = ipcaTotalAlvoPercent - ipcaTotalCurrentPercent;

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
        IPCA+ Taxa & Progresso
      </h2>

      {/* Current Rate & Total Status */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {/* Taxa Atual */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid #06b6d4',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Taxa IPCA+ Atual
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#06b6d4' }}>
            {taxaAtual.toFixed(2)}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            Rendimento real anual
          </div>
        </div>

        {/* Total IPCA+ Valor */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid #06b6d4',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Total IPCA+
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#06b6d4' }}>
            {privacyMode ? 'R$••••' : fmtBrl(ipcaTotalBrl)}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            {ipcaTotalCurrentPercent.toFixed(1)}% da carteira
          </div>
        </div>

        {/* Total IPCA+ Progress */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor:
              Math.abs(ipcaTotalGap) < 2
                ? 'rgba(34, 197, 94, 0.1)'
                : ipcaTotalGap > 0
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
            border:
              Math.abs(ipcaTotalGap) < 2
                ? '1px solid #22c55e40'
                : ipcaTotalGap > 0
                  ? '1px solid #22c55e40'
                  : '1px solid #ef444440',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Meta Total IPCA+
          </div>
          <div
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color:
                Math.abs(ipcaTotalGap) < 2
                  ? '#22c55e'
                  : ipcaTotalGap > 0
                    ? '#22c55e'
                    : '#ef4444',
              marginBottom: '2px',
            }}
          >
            {ipcaTotalAlvoPercent.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            {ipcaTotalGap > 0 ? '+' : ''}{ipcaTotalGap.toFixed(1)}pp faltando
          </div>
        </div>
      </div>

      {/* Progress by maturity */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>
          Progresso por Vencimento
        </div>

        {/* IPCA 2040 */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
              fontSize: '0.75rem',
              color: '#94a3b8',
            }}
          >
            <span>IPCA+ 2040</span>
            <span>{privacyMode ? '••' : `${ipca2040AtualPercent.toFixed(1)}% / ${ipca2040AlvoPercent.toFixed(1)}%`}</span>
          </div>
          <div
            style={{
              height: '12px',
              backgroundColor: 'rgba(71, 85, 105, 0.15)',
              borderRadius: '6px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Target line (dashed) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: `${(ipca2040AlvoPercent / (ipca2040AlvoPercent + ipca2050AlvoPercent)) * 100}%`,
                width: '1px',
                height: '100%',
                backgroundColor: '#94a3b8',
                opacity: 0.5,
                zIndex: 2,
              }}
            />
            {/* Progress bar */}
            <div
              style={{
                height: '100%',
                width: `${ipca2040AtualPercent > 0 ? (ipca2040AtualPercent / (ipca2040AlvoPercent + ipca2050AlvoPercent)) * 100 : 0}%`,
                backgroundColor: ipca2040Gap <= 0 ? '#06b6d4' : '#f59e0b',
                transition: 'width 0.5s',
              }}
            />
          </div>
        </div>

        {/* IPCA 2050 */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
              fontSize: '0.75rem',
              color: '#94a3b8',
            }}
          >
            <span>IPCA+ 2050</span>
            <span>{privacyMode ? '••' : `${ipca2050AtualPercent.toFixed(1)}% / ${ipca2050AlvoPercent.toFixed(1)}%`}</span>
          </div>
          <div
            style={{
              height: '12px',
              backgroundColor: 'rgba(71, 85, 105, 0.15)',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${ipca2050AtualPercent > 0 ? (ipca2050AtualPercent / (ipca2040AlvoPercent + ipca2050AlvoPercent)) * 100 : 0}%`,
                backgroundColor: ipca2050Gap <= 0 ? '#8b5cf6' : '#f59e0b',
                transition: 'width 0.5s',
              }}
            />
          </div>
        </div>
      </div>

      {/* Expandable details */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          paddingTop: '14px',
          borderTop: '1px solid rgba(71, 85, 105, 0.15)',
        }}
        onClick={() => setExpandDetails(!expandDetails)}
      >
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: '#cbd5e1' }}>
          Detalhes da Alocação
        </h3>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {expandDetails ? '▼' : '▶'}
        </span>
      </div>

      {expandDetails && (
        <div style={{ marginTop: '12px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
            }}
          >
            {/* IPCA 2040 Details */}
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid #06b6d440',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                IPCA+ 2040
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#06b6d4', marginBottom: '2px' }}>
                {privacyMode ? 'R$••••' : fmtBrl(ipca2040Valor)}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                Alvo: {ipca2040AlvoPercent.toFixed(1)}%
              </div>
            </div>

            {/* IPCA 2050 Details */}
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid #8b5cf640',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                IPCA+ 2050
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '2px' }}>
                {privacyMode ? 'R$••••' : fmtBrl(ipca2050Valor)}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                Alvo: {ipca2050AlvoPercent.toFixed(1)}%
              </div>
            </div>

            {/* Gap Analysis */}
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(71, 85, 105, 0.1)',
                border: '1px solid rgba(71, 85, 105, 0.4)',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                Deficit Total
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b', marginBottom: '2px' }}>
                {ipcaTotalGap > 0 ? '+' : ''}{ipcaTotalGap.toFixed(1)}pp
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                Ainda para alocar
              </div>
            </div>
          </div>
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
        <strong>📌 Nota:</strong> Progresso é a razão entre alocação atual e meta alvo. DCA ativo busca reduzir o deficit ao longo do tempo, respeitando gatilhos de taxa.
      </div>
    </div>
  );
};

export default IpcaTaxaProgress;
