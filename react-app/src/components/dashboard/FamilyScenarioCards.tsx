'use client';

import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtBrl, fmtPct } from '@/utils/formatters';
import { pfireColor } from '@/utils/fire';

interface ScenarioProfile {
  label: string;
  gasto_anual: number;
  descricao: string;
}

interface FamilyScenarioData {
  perfis: Record<string, ScenarioProfile>;
  cenarios: {
    base: Record<string, number>;
    fav: Record<string, number>;
    stress: Record<string, number>;
  };
  patrimonios?: number[];
  gastos?: number[];
}

interface FamilyScenarioCardsProps {
  data: FamilyScenarioData;
  patrimonioAtual?: number;
}

/** Returns nearest value from a sorted array */
function nearest(arr: number[], val: number): number {
  if (!arr.length) return val;
  return arr.reduce((prev, curr) =>
    Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
  );
}

/** Looks up P(FIRE) from the cenarios matrix for a given patrimônio + gasto */
function lookupPfire(
  cenarios: FamilyScenarioData['cenarios'],
  patrimonios: number[],
  gastos: number[],
  patrimonioAtual: number,
  gastoAnual: number
): { base: number; fav: number; stress: number } {
  const pat = nearest(patrimonios, patrimonioAtual);
  const gasto = nearest(gastos, gastoAnual);
  const key = `${pat}_${gasto}`;
  return {
    base:   Math.round((cenarios.base?.[key]   ?? 0) * 100),
    fav:    Math.round((cenarios.fav?.[key]    ?? 0) * 100),
    stress: Math.round((cenarios.stress?.[key] ?? 0) * 100),
  };
}

export function FamilyScenarioCards({
  data,
  patrimonioAtual = 0,
}: FamilyScenarioCardsProps) {
  const privacyMode = useUiStore(s => s.privacyMode);
  const [selectedPerfil, setSelectedPerfil] = useState<string>('atual');

  if (!data || !data.perfis) {
    return <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Family scenarios data unavailable</div>;
  }

  const perfis = data.perfis;
  const currentPerfil = perfis[selectedPerfil];

  // Default spending per family profile (matches carteira.md spending smile)
  const PERFIL_GASTO_DEFAULT: Record<string, number> = {
    atual:  250_000,
    casado: 270_000,
    filho:  300_000,
  };

  const patrimonios = data.patrimonios ?? [];
  const gastos = data.gastos ?? [];

  const getPfireForPerfil = (perfil: string): { base: number; fav: number; stress: number } => {
    const gastoAnual = perfis[perfil]?.gasto_anual ?? PERFIL_GASTO_DEFAULT[perfil] ?? 250_000;
    if (patrimonios.length && gastos.length && data.cenarios) {
      return lookupPfire(data.cenarios, patrimonios, gastos, patrimonioAtual, gastoAnual);
    }
    // Fallback: return zeros (data not loaded) — never hardcode P(FIRE) values
    return { base: 0, fav: 0, stress: 0 };
  };

  const pfireValues = getPfireForPerfil(selectedPerfil);

  const getPfireColor = pfireColor;

  const scenarios = [
    { label: 'Base', value: pfireValues.base, color: 'var(--accent)' },
    { label: 'Favorável', value: pfireValues.fav, color: 'var(--green)' },
    { label: 'Stress', value: pfireValues.stress, color: 'var(--red)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
        Family Scenarios — P(FIRE) Impact
      </h3>

      {/* Scenario Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
        {Object.entries(perfis).map(([key, perfil]) => {
          const isSelected = key === selectedPerfil;
          return (
            <button
              key={key}
              onClick={() => setSelectedPerfil(key)}
              style={{
                padding: 'var(--space-3)', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                border: isSelected ? '2px solid var(--accent)' : '2px solid var(--border)',
                background: isSelected ? 'rgba(59,130,246,0.1)' : 'var(--card)',
              }}
            >
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: '4px', color: isSelected ? 'var(--accent)' : 'var(--text)' }}>
                {perfil.label}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', textAlign: 'left' }}>
                {privacyMode ? '••••/ano' : fmtBrl(perfil.gasto_anual / 1000).replace('R$', '') + 'k/ano'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Scenario Details */}
      {currentPerfil && (
        <div style={{ background: 'var(--card)', borderLeft: '4px solid var(--accent)', borderRadius: '0 4px 4px 0', padding: 'var(--space-3)' }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            {currentPerfil.label}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', lineHeight: 1.5 }}>
            {currentPerfil.descricao}
          </div>
        </div>
      )}

      {/* P(FIRE) Scenarios Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
        {scenarios.map((sc, idx) => (
          <div key={idx} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-3)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
              {sc.label}
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: '8px', color: getPfireColor(sc.value) }}>
              {privacyMode ? '••%' : fmtPct(sc.value / 100, 0)}
            </div>
            <div style={{ height: '4px', background: 'var(--bg)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, sc.value)}%`,
                  height: '100%',
                  backgroundColor: sc.color,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
