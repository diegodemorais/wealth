'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
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
    return <div className="text-sm text-muted-foreground">Family scenarios data unavailable</div>;
  }

  const perfis = data.perfis;
  const currentPerfil = perfis[selectedPerfil];

  // Map perfil to base pfire value (simplified — in production would use fire_matrix)
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
    if (pfire >= 90) return '#22c55e'; // green
    if (pfire >= 70) return '#eab308'; // yellow
    if (pfire >= 50) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const scenarios = [
    { label: 'Base', value: pfireValues.base, color: '#3b82f6' },
    { label: 'Favorável', value: pfireValues.fav, color: '#10b981' },
    { label: 'Stress', value: pfireValues.stress, color: '#ef4444' },
  ];

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Title */}
      <h3 style={{
        fontSize: '0.95rem',
        fontWeight: '600',
        marginBottom: '16px',
        color: '#cbd5e1',
      }}>
        Family Scenarios — P(FIRE) Impact
      </h3>

      {/* Scenario Selector — Auto-fit grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {Object.entries(perfis).map(([key, perfil]) => {
          const isSelected = key === selectedPerfil;
          return (
            <button
              key={key}
              onClick={() => setSelectedPerfil(key)}
              style={{
                padding: '12px 14px',
                border: '2px solid',
                borderRadius: '8px',
                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(30, 41, 59, 0.3)',
                borderColor: isSelected ? '#3b82f6' : 'rgba(71, 85, 105, 0.25)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: isSelected ? '#3b82f6' : '#cbd5e1',
                marginBottom: '4px',
              }}>
                {perfil.label}
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: '#94a3b8',
                textAlign: 'left',
              }}>
                {privacyMode ? '••••/ano' : fmtBrl(perfil.gasto_anual / 1000).replace('R$', '') + 'k/ano'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Scenario Details */}
      {currentPerfil && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: 'rgba(30, 41, 59, 0.3)',
          borderRadius: '6px',
          borderLeft: '3px solid #3b82f6',
        }}>
          <div style={{
            fontSize: '0.8rem',
            color: '#cbd5e1',
            marginBottom: '4px',
            fontWeight: 500,
          }}>
            {currentPerfil.label}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            lineHeight: '1.4',
          }}>
            {currentPerfil.descricao}
          </div>
        </div>
      )}

      {/* P(FIRE) Scenarios Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
      }}>
        {scenarios.map((sc, idx) => (
          <div
            key={idx}
            style={{
              padding: '14px',
              backgroundColor: 'rgba(30, 41, 59, 0.4)',
              borderRadius: '8px',
              border: '1px solid rgba(71, 85, 105, 0.25)',
            }}
          >
            <div style={{
              fontSize: '0.7rem',
              color: '#94a3b8',
              marginBottom: '8px',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>
              {sc.label}
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: getPfireColor(sc.value),
              marginBottom: '4px',
            }}>
              {privacyMode ? '••' : fmtPct(sc.value / 100, 0)}
            </div>
            <div style={{
              height: '4px',
              backgroundColor: 'rgba(71, 85, 105, 0.15)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, sc.value)}%`,
                backgroundColor: sc.color,
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
