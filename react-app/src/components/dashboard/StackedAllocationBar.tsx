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
    { label: 'Equity', value: equityBrl, pct: equityPct, color: 'var(--accent)' },
    { label: 'IPCA+ Ladder', value: ipcaBrl, pct: ipcaPct, color: 'var(--cyan)' },
    { label: 'Renda+ 2065', value: rendaPlusBrl, pct: rendaPlusPct, color: 'var(--yellow)' },
    { label: 'Crypto', value: cryptoBrl, pct: cryptoPct, color: 'var(--purple)' },
  ];

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '16px' }}>
      <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Alocação Total do Portfólio
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Stacked bar chart */}
        <div style={{ display: 'flex', gap: '4px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: 'rgba(71,85,105,0.15)', marginBottom: '16px' }}>
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
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'white',
                  minWidth: asset.pct > 0.05 ? 'auto' : '0px',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
          {assets.map(asset => (
            asset.value > 0 && (
              <div
                key={asset.label}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: '4px',
                  backgroundColor: `${asset.color}10`,
                  border: `1px solid ${asset.color}40`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: asset.color }} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>
                    {asset.label}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: asset.color, marginBottom: '4px' }}>
                  {(asset.pct * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                  {privacyMode ? 'R$••••' : fmtBrl(asset.value)}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Total */}
        <div style={{ marginTop: '12px', padding: 'var(--space-3)', background: 'rgba(71,85,105,0.1)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--text)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>
            Patrimônio Total
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>
            {privacyMode ? 'R$••••' : fmtBrl(totalBrl)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StackedAllocationBar;
