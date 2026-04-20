'use client';

import React from 'react';
import { useUiStore } from '@/store/uiStore';

interface CenarioData {
  btc_target_usd: number;
  upside_factor: number;
  valor_fire_brl: number;
}

interface BtcFIREProjectionCardProps {
  hodl11BrlAtual: number;
  btcAtualUsd: number;
  cenarios: {
    bear: CenarioData;
    base: CenarioData;
    bull: CenarioData;
  };
}

function fmtUsd(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
  return `$${val.toFixed(0)}`;
}

function fmtBrl(val: number): string {
  if (val >= 1_000_000) return `R$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `R$${(val / 1_000).toFixed(0)}k`;
  return `R$${val.toFixed(0)}`;
}

const CENARIO_CONFIGS = {
  bear: {
    label: 'Bear',
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.08)',
    borderColor: 'rgba(239,68,68,0.25)',
  },
  base: {
    label: 'Base',
    color: '#3b82f6',
    bgColor: 'rgba(59,130,246,0.10)',
    borderColor: 'rgba(59,130,246,0.30)',
  },
  bull: {
    label: 'Bull',
    color: '#22c55e',
    bgColor: 'rgba(34,197,94,0.08)',
    borderColor: 'rgba(34,197,94,0.25)',
  },
} as const;

type CenarioKey = keyof typeof CENARIO_CONFIGS;

export function BtcFIREProjectionCard({
  hodl11BrlAtual,
  btcAtualUsd,
  cenarios,
}: BtcFIREProjectionCardProps) {
  const { privacyMode } = useUiStore();

  return (
    <div style={{ padding: '0 16px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
          HODL11 — Projeção FIRE Day
        </h3>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)' }}>
          3 cenários BTC/USD no FIRE Day 2040
        </p>
      </div>

      {/* Posição atual */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: '10px 14px',
        marginBottom: 12,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
      }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Posição atual</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>HODL11 </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              {privacyMode ? '••••' : fmtBrl(hodl11BrlAtual)}
            </span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>BTC atual </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              {fmtUsd(btcAtualUsd)}
            </span>
          </div>
        </div>
      </div>

      {/* 3 cenários */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ marginBottom: 12 }}>
        {(['bear', 'base', 'bull'] as CenarioKey[]).map((key) => {
          const cfg = CENARIO_CONFIGS[key];
          const c = cenarios[key];
          return (
            <div
              key={key}
              style={{
                background: cfg.bgColor,
                border: `1px solid ${cfg.borderColor}`,
                borderRadius: 8,
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtUsd(c.btc_target_usd)}</span>
              </div>
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Upside</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: cfg.color }}>
                  {c.upside_factor.toFixed(1)}×
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Valor FIRE Day</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                  {privacyMode ? '••••' : fmtBrl(c.valor_fire_brl)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nota */}
      <p style={{ margin: 0, fontSize: 10, color: 'var(--muted)', fontStyle: 'italic' }}>
        Projeção linear. Não considera aportes adicionais nem rebalanceamentos. Horizonte: FIRE Day 2040.
      </p>
    </div>
  );
}

export default BtcFIREProjectionCard;
