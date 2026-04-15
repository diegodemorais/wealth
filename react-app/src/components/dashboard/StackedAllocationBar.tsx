import React from 'react';
import { useUiStore } from '@/store/uiStore';

interface StackedAllocationBarProps {
  equityBrl: number;
  ipcaBrl: number;
  rendaPlusBrl: number;
  cryptoBrl: number;
  totalBrl: number;
}

const StackedAllocationBar: React.FC<StackedAllocationBarProps> = ({
  equityBrl,
  ipcaBrl,
  rendaPlusBrl,
  cryptoBrl,
  totalBrl,
}) => {
  const { privacyMode } = useUiStore();

  const equityPct = totalBrl > 0 ? equityBrl / totalBrl : 0;
  const ipcaPct = totalBrl > 0 ? ipcaBrl / totalBrl : 0;
  const rendaPlusPct = totalBrl > 0 ? rendaPlusBrl / totalBrl : 0;
  const cryptoPct = totalBrl > 0 ? cryptoBrl / totalBrl : 0;

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const assets = [
    { label: 'Equity', value: equityBrl, pct: equityPct, color: '#3b82f6' }, // blue
    { label: 'IPCA+ Ladder', value: ipcaBrl, pct: ipcaPct, color: '#06b6d4' }, // cyan
    { label: 'Renda+ 2065', value: rendaPlusBrl, pct: rendaPlusPct, color: '#f59e0b' }, // amber
    { label: 'Crypto', value: cryptoBrl, pct: cryptoPct, color: '#8b5cf6' }, // violet
  ];

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
        Alocação Total do Portfólio
      </h2>

      {/* Stacked bar chart */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          height: '48px',
          borderRadius: '6px',
          overflow: 'hidden',
          backgroundColor: 'rgba(71, 85, 105, 0.1)',
          marginBottom: '14px',
        }}
      >
        {assets.map(asset => (
          asset.pct > 0 && (
            <div
              key={asset.label}
              style={{
                flex: asset.pct,
                backgroundColor: asset.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'white',
                minWidth: asset.pct > 0.05 ? 'auto' : '0px',
                position: 'relative',
                transition: 'all 0.3s',
              }}
              title={`${asset.label}: ${(asset.pct * 100).toFixed(1)}%`}
            >
              {asset.pct > 0.08 && `${(asset.pct * 100).toFixed(0)}%`}
            </div>
          )
        ))}
      </div>

      {/* Legend and breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        {assets.map(asset => (
          asset.value > 0 && (
            <div
              key={asset.label}
              style={{
                padding: '10px 12px',
                backgroundColor: `${asset.color}10`,
                border: `1px solid ${asset.color}40`,
                borderRadius: '6px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '4px',
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    backgroundColor: asset.color,
                  }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
                  {asset.label}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: asset.color, marginBottom: '2px' }}>
                {(asset.pct * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                {privacyMode ? 'R$••••' : fmtBrl(asset.value)}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Total */}
      <div
        style={{
          marginTop: '14px',
          padding: '10px 12px',
          backgroundColor: 'rgba(71, 85, 105, 0.1)',
          borderRadius: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderLeft: '4px solid #cbd5e1',
        }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
          Patrimônio Total
        </span>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
          {privacyMode ? 'R$••••' : fmtBrl(totalBrl)}
        </span>
      </div>
    </div>
  );
};

export default StackedAllocationBar;
