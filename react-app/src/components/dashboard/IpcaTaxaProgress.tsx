'use client';

import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';

interface IpcaTaxaProgressProps {
  taxaAtual: number;
  ipca2040Valor: number;
  ipca2040AlvoPercent: number;
  ipca2040AtualPercent: number;
  ipca2050Valor: number;
  ipca2050AlvoPercent: number;
  ipca2050AtualPercent: number;
  ipcaTotalBrl: number;
  totalPortfolio: number;
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

  const ipca2040Gap = ipca2040AlvoPercent - ipca2040AtualPercent;
  const ipca2050Gap = ipca2050AlvoPercent - ipca2050AtualPercent;
  const ipcaTotalCurrentPercent = totalPortfolio > 0 ? (ipcaTotalBrl / totalPortfolio) * 100 : 0;
  const ipcaTotalAlvoPercent = ipca2040AlvoPercent + ipca2050AlvoPercent;
  const ipcaTotalGap = ipcaTotalAlvoPercent - ipcaTotalCurrentPercent;

  const isOnTarget = Math.abs(ipcaTotalGap) < 2;
  const totalBg = isOnTarget || ipcaTotalGap > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)';
  const totalBorder = isOnTarget || ipcaTotalGap > 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)';
  const totalColor = isOnTarget || ipcaTotalGap > 0 ? '#22c55e' : '#ef4444';

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        IPCA+ Taxa & Progresso
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Current Rate & Total Status */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Taxa IPCA+ Atual</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#06b6d4' }}>{taxaAtual.toFixed(2)}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Rendimento real anual</div>
          </div>

          <div style={{ padding: '12px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Total IPCA+</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#06b6d4' }}>{privacyMode ? 'R$••••' : fmtBrl(ipcaTotalBrl)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{ipcaTotalCurrentPercent.toFixed(1)}% da carteira</div>
          </div>

          <div style={{ padding: '12px', borderRadius: '4px', background: totalBg, border: `1px solid ${totalBorder}` }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Meta Total IPCA+</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', color: totalColor }}>{ipcaTotalAlvoPercent.toFixed(1)}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{ipcaTotalGap > 0 ? '+' : ''}{ipcaTotalGap.toFixed(1)}pp faltando</div>
          </div>
        </div>

        {/* Progress by maturity */}
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
            Progresso por Vencimento
          </div>

          {/* IPCA 2040 */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.75rem', color: 'var(--muted)' }}>
              <span>IPCA+ 2040</span>
              <span>{privacyMode ? '••' : `${ipca2040AtualPercent.toFixed(1)}% / ${ipca2040AlvoPercent.toFixed(1)}%`}</span>
            </div>
            <div style={{ height: '12px', background: 'var(--bg)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  position: 'absolute', top: 0, left: `${(ipca2040AlvoPercent / (ipca2040AlvoPercent + ipca2050AlvoPercent)) * 100}%`,
                  width: '1px', height: '100%', background: 'var(--muted)', opacity: 0.5, zIndex: 2,
                }}
              />
              <div
                style={{
                  height: '100%', transition: 'width 0.5s',
                  width: `${ipca2040AtualPercent > 0 ? (ipca2040AtualPercent / (ipca2040AlvoPercent + ipca2050AlvoPercent)) * 100 : 0}%`,
                  backgroundColor: ipca2040Gap <= 0 ? '#06b6d4' : '#f59e0b',
                }}
              />
            </div>
          </div>

          {/* IPCA 2050 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.75rem', color: 'var(--muted)' }}>
              <span>IPCA+ 2050</span>
              <span>{privacyMode ? '••' : `${ipca2050AtualPercent.toFixed(1)}% / ${ipca2050AlvoPercent.toFixed(1)}%`}</span>
            </div>
            <div style={{ height: '12px', background: 'var(--bg)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%', transition: 'width 0.5s',
                  width: `${ipca2050AtualPercent > 0 ? (ipca2050AtualPercent / (ipca2040AlvoPercent + ipca2050AlvoPercent)) * 100 : 0}%`,
                  backgroundColor: ipca2050Gap <= 0 ? '#8b5cf6' : '#f59e0b',
                }}
              />
            </div>
          </div>
        </div>

        {/* Expandable details */}
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', cursor: 'pointer', borderTop: '1px solid var(--border)', marginTop: '12px' }}
          onClick={() => setExpandDetails(!expandDetails)}
        >
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
            Detalhes da Alocação
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            {expandDetails ? '▼' : '▶'}
          </span>
        </div>

        {expandDetails && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>IPCA+ 2040</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#06b6d4', marginBottom: '4px' }}>{privacyMode ? 'R$••••' : fmtBrl(ipca2040Valor)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Alvo: {ipca2040AlvoPercent.toFixed(1)}%</div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>IPCA+ 2050</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#a78bfa', marginBottom: '4px' }}>{privacyMode ? 'R$••••' : fmtBrl(ipca2050Valor)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Alvo: {ipca2050AlvoPercent.toFixed(1)}%</div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Deficit Total</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f59e0b', marginBottom: '4px' }}>{ipcaTotalGap > 0 ? '+' : ''}{ipcaTotalGap.toFixed(1)}pp</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Ainda para alocar</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer note */}
        <div style={{ marginTop: '12px', fontSize: '0.7rem', color: 'var(--muted)', padding: '8px', background: 'var(--bg)', borderRadius: '2px' }}>
          <strong>📌 Nota:</strong> Progresso é a razão entre alocação atual e meta alvo. DCA ativo busca reduzir o deficit ao longo do tempo, respeitando gatilhos de taxa.
        </div>
      </div>
    </div>
  );
};

export default IpcaTaxaProgress;
