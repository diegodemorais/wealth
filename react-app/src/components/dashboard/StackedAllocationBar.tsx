'use client';

import React, { useState, useRef } from 'react';
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
  const [hovered, setHovered] = useState<{ label: string; x: number } | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const equityPct   = totalBrl > 0 ? equityBrl    / totalBrl : 0;
  const ipcaPct     = totalBrl > 0 ? ipcaBrl      / totalBrl : 0;
  const rendaPlusPct = totalBrl > 0 ? rendaPlusBrl / totalBrl : 0;
  const cryptoPct   = totalBrl > 0 ? cryptoBrl    / totalBrl : 0;

  const fmtBrl = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const assets = [
    { label: 'Equity',       value: equityBrl,    pct: equityPct,    color: 'var(--accent)' },
    { label: 'IPCA+ Ladder', value: ipcaBrl,      pct: ipcaPct,      color: 'var(--cyan)' },
    { label: 'Renda+ 2065',  value: rendaPlusBrl, pct: rendaPlusPct, color: 'var(--yellow)' },
    { label: 'Crypto',       value: cryptoBrl,    pct: cryptoPct,    color: 'var(--purple)' },
  ].filter(a => a.pct > 0);

  const hoveredAsset = hovered ? assets.find(a => a.label === hovered.label) : null;

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '16px' }}>
      <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Alocação Total do Portfólio
      </h2>

      {/* Stacked bar with hover tooltip */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <div
          ref={barRef}
          style={{ display: 'flex', gap: '3px', height: '48px', borderRadius: '6px', overflow: 'hidden' }}
        >
          {assets.map((asset, idx) => {
            const isHovered = hovered?.label === asset.label;
            const pctLabel = `${(asset.pct * 100).toFixed(1)}%`;
            const showLabelInside = asset.pct >= 0.04; // ≥4% has room for label
            return (
              <div
                key={asset.label}
                style={{
                  flex: asset.pct,
                  backgroundColor: asset.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: asset.pct > 0.1 ? '13px' : '10px',
                  fontWeight: 700,
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'filter .15s',
                  filter: isHovered ? 'brightness(1.35)' : 'brightness(1)',
                  minWidth: asset.pct > 0.02 ? '4px' : '0',
                  borderRadius: idx === 0 ? '6px 0 0 6px' : idx === assets.length - 1 ? '0 6px 6px 0' : '0',
                }}
                onMouseEnter={(e) => {
                  const bar = barRef.current;
                  if (bar) {
                    const barRect = bar.getBoundingClientRect();
                    const elRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const x = elRect.left - barRect.left + elRect.width / 2;
                    setHovered({ label: asset.label, x });
                  }
                }}
                onMouseLeave={() => setHovered(null)}
              >
                {showLabelInside && pctLabel}
              </div>
            );
          })}
        </div>

        {/* Floating tooltip above bar */}
        {hoveredAsset && hovered && (
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 10px)',
              left: hovered.x,
              transform: 'translateX(-50%)',
              background: '#0d1117',
              border: `1px solid ${hoveredAsset.color}`,
              borderRadius: '7px',
              padding: '8px 14px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 50,
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ fontWeight: 700, color: hoveredAsset.color, fontSize: '.8rem', marginBottom: '2px' }}>
              {hoveredAsset.label}
            </div>
            <div style={{ color: '#e6edf3', fontSize: '.75rem' }}>
              {(hoveredAsset.pct * 100).toFixed(1)}%
              {!privacyMode && ` · ${fmtBrl(hoveredAsset.value)}`}
            </div>
            {/* Arrow */}
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${hoveredAsset.color}`,
            }} />
          </div>
        )}
      </div>

      {/* Legend cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
        {assets.map(asset => (
          <div
            key={asset.label}
            style={{
              padding: 'var(--space-3)',
              borderRadius: '6px',
              backgroundColor: `color-mix(in srgb, ${asset.color} 8%, transparent)`,
              border: `1px solid color-mix(in srgb, ${asset.color} 30%, transparent)`,
              transition: 'border-color .15s',
              cursor: 'default',
            }}
            onMouseEnter={() => {
              const bar = barRef.current;
              if (bar) {
                const barRect = bar.getBoundingClientRect();
                const idx = assets.findIndex(a => a.label === asset.label);
                let x = 0;
                for (let i = 0; i < idx; i++) x += assets[i].pct * barRect.width;
                x += asset.pct * barRect.width / 2;
                setHovered({ label: asset.label, x });
              }
            }}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: asset.color, flexShrink: 0 }} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>{asset.label}</span>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: asset.color, marginBottom: '3px' }}>
              {(asset.pct * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
              {privacyMode ? 'R$••••' : fmtBrl(asset.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{ marginTop: '14px', padding: 'var(--space-3) var(--space-4)', background: 'rgba(71,85,105,0.08)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid var(--border)' }}>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>Patrimônio Total</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
          {privacyMode ? 'R$••••' : fmtBrl(totalBrl)}
        </span>
      </div>
    </div>
  );
};

export default StackedAllocationBar;
