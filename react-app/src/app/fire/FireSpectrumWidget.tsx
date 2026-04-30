'use client';

import React from 'react';
import { FireSpectrumData, FireSpectrumBand } from '@/types/dashboard';
import { fmtPrivacy } from '@/utils/privacyTransform';

interface FireSpectrumWidgetProps {
  spectrum: FireSpectrumData;
  diegoTarget?: number;
  privacyMode: boolean;
}

const BAND_COLORS: Record<string, string> = {
  'Fat FIRE':     'var(--green)',
  'FIRE':         'var(--accent)',
  'Lean FIRE':    'var(--yellow)',
  'Barista FIRE': 'var(--red)',
};

const BAND_TESTIDS: Record<string, string> = {
  'Fat FIRE':     'fire-spectrum-band-fat',
  'FIRE':         'fire-spectrum-band-fire',
  'Lean FIRE':    'fire-spectrum-band-lean',
  'Barista FIRE': 'fire-spectrum-band-barista',
};

function BandRow({
  band,
  patrimonioAtual,
  privacyMode,
  isActive,
}: {
  band: FireSpectrumBand;
  patrimonioAtual: number;
  privacyMode: boolean;
  isActive: boolean;
}) {
  const color = BAND_COLORS[band.nome] ?? 'var(--accent)';
  const testId = BAND_TESTIDS[band.nome];

  return (
    <div
      data-testid={testId}
      style={{
        background: isActive
          ? `color-mix(in srgb, ${color} 10%, transparent)`
          : 'transparent',
        border: `1px solid ${isActive ? color : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        marginBottom: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
        {/* Name + badge */}
        <span style={{ fontWeight: 700, color, minWidth: 100 }}>{band.nome}</span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          {band.multiplo}x · SWR {band.swr_pct.toFixed(1)}%
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          Alvo: {fmtPrivacy(band.alvo_brl, privacyMode)}
        </span>
        {band.atingido && (
          <span
            style={{
              padding: '1px 8px',
              borderRadius: 10,
              background: `color-mix(in srgb, ${color} 20%, transparent)`,
              border: `1px solid ${color}`,
              color,
              fontWeight: 700,
              fontSize: 10,
            }}
          >
            ✓
          </span>
        )}
      </div>
      {/* Progress bar */}
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${band.pct_atual}%`,
            background: color,
            borderRadius: 3,
            transition: 'width 0.4s',
          }}
        />
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
        {privacyMode ? '••%' : `${band.pct_atual.toFixed(1)}%`} atingido
        {isActive && (
          <span
            style={{
              marginLeft: 8,
              color,
              fontWeight: 700,
            }}
          >
            ← posição atual
          </span>
        )}
      </div>
    </div>
  );
}

export function FireSpectrumWidget({ spectrum, diegoTarget, privacyMode }: FireSpectrumWidgetProps) {
  const targetK = diegoTarget ?? 10_000_000;
  const targetMultiple = Math.round(targetK / spectrum.custo_mensal);
  // SWR% = (custo_anual / FIRE_number) × 100 = (custo_mensal × 12 / FIRE_number) × 100 = 1200 / targetMultiple
  const targetSwr = (1200 / targetMultiple).toFixed(1);

  return (
    <div data-testid="fire-spectrum-widget" style={{ padding: '0 16px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 6,
              background: 'color-mix(in srgb, var(--muted) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--muted) 30%, transparent)',
              color: 'var(--muted)',
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: '.8px',
              textTransform: 'uppercase',
            }}
          >
            Referência
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            Custo mensal base: {fmtPrivacy(spectrum.custo_mensal, privacyMode)}/mês
            &nbsp;·&nbsp;
            Patrimônio atual: {fmtPrivacy(spectrum.patrimonio_atual, privacyMode)}
          </span>
        </div>
      </div>

      {/* 4 bands — rendered highest threshold first (Fat FIRE) */}
      {spectrum.bandas.map((band) => {
        const isActive =
          spectrum.banda_atual === band.nome.toLowerCase().replace(' ', '_') ||
          (spectrum.banda_atual === 'below_barista' && band.nome === 'Barista FIRE');
        return (
          <BandRow
            key={band.nome}
            band={band}
            patrimonioAtual={spectrum.patrimonio_atual}
            privacyMode={privacyMode}
            isActive={isActive}
          />
        );
      })}

      {/* Lean/Barista SWR disclaimer — Quant flag: unsustainable for 37y horizon */}
      <div
        style={{
          marginTop: 8,
          padding: '7px 12px',
          background: 'color-mix(in srgb, var(--yellow) 6%, transparent)',
          border: '1px solid color-mix(in srgb, var(--yellow) 25%, transparent)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 10,
          color: 'var(--muted)',
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: 'var(--yellow)' }}>⚠</strong>{' '}
        Lean FIRE (SWR 6%) and Barista FIRE (SWR 8%) are reference bands only —
        both exceed the safe withdrawal rate for a 37-year retirement horizon
        (Bengen 1994: 4.0% for 30 years; ~3.5% for 37 years per ERN 2018).
        Not recommended as withdrawal strategies for Diego's plan.
      </div>

      {/* Spending smile / healthcare footnote */}
      <div
        style={{
          marginTop: 8,
          fontSize: 10,
          color: 'var(--muted)',
          fontStyle: 'italic',
          lineHeight: 1.5,
        }}
      >
        Assume custo de vida constante em termos reais — não modela spending smile
        (Blanchett 2014) nem escalada de custos de saúde na velhice.
      </div>

      {/* Diego's model target note */}
      <div
        style={{
          marginTop: 8,
          padding: '8px 12px',
          background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          color: 'var(--muted)',
        }}
      >
        Diego's model target ({fmtPrivacy(targetK, privacyMode)}) = {targetMultiple}x = SWR {targetSwr}%
        — above Fat FIRE standard (400x / 3.0%)
      </div>
    </div>
  );
}
