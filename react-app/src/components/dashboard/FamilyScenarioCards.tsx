'use client';

import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtBrl, fmtPct } from '@/utils/formatters';

interface ScenarioProfile {
  label: string;
  gasto_anual: number;
  descricao: string;
}

interface FamilyScenarioData {
  perfis: Record<string, ScenarioProfile>;
  cenarios: Record<string, Record<string, number>>;
}

interface FamilyScenarioCardsProps {
  data: FamilyScenarioData;
  pfireBase?: number;
  pfireFav?: number;
  pfireStress?: number;
}

export function FamilyScenarioCards({
  data,
  pfireBase = 0,
  pfireFav = 0,
  pfireStress = 0,
}: FamilyScenarioCardsProps) {
  const privacyMode = useUiStore(s => s.privacyMode);
  const [selectedPerfil, setSelectedPerfil] = useState<string>('atual');

  if (!data || !data.perfis) {
    return <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Family scenarios data unavailable</div>;
  }

  const perfis = data.perfis;
  const currentPerfil = perfis[selectedPerfil];

  const getPfireForPerfil = (perfil: string): { base: number; fav: number; stress: number } => {
    const mapping: Record<string, { base: number; fav: number; stress: number }> = {
      atual: { base: pfireBase || 90, fav: pfireFav || 94, stress: pfireStress || 87 },
      casado: { base: 85, fav: 89, stress: 81 },
      filho: { base: 78, fav: 83, stress: 74 },
    };
    return mapping[perfil] || mapping.atual;
  };

  const pfireValues = getPfireForPerfil(selectedPerfil);

  const getPfireColor = (pfire: number): string => {
    if (pfire >= 90) return 'var(--green)';
    if (pfire >= 70) return 'var(--yellow)';
    if (pfire >= 50) return 'var(--yellow)';
    return 'var(--red)';
  };

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
              {privacyMode ? '••' : fmtPct(sc.value / 100, 0)}
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
