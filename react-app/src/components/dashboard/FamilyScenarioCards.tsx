'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-4">
      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-200">
        Family Scenarios — P(FIRE) Impact
      </h3>

      {/* Scenario Selector — Auto-fit grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(perfis).map(([key, perfil]) => {
          const isSelected = key === selectedPerfil;
          return (
            <button
              key={key}
              onClick={() => setSelectedPerfil(key)}
              className={`p-3 border-2 rounded-lg transition cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700/25 bg-slate-900/30'
              }`}
            >
              <div className={`text-xs font-semibold mb-1 ${isSelected ? 'text-blue-500' : 'text-slate-200'}`}>
                {perfil.label}
              </div>
              <div className="text-xs text-slate-400 text-left">
                {privacyMode ? '••••/ano' : fmtBrl(perfil.gasto_anual / 1000).replace('R$', '') + 'k/ano'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Scenario Details */}
      {currentPerfil && (
        <Card className="bg-slate-900/30 border-l-4 border-l-blue-500">
          <CardContent className="p-3">
            <div className="text-xs font-semibold text-slate-200 mb-1">
              {currentPerfil.label}
            </div>
            <div className="text-xs text-slate-400 leading-relaxed">
              {currentPerfil.descricao}
            </div>
          </CardContent>
        </Card>
      )}

      {/* P(FIRE) Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((sc, idx) => (
          <Card key={idx} className="bg-slate-900/40 border-slate-700/25">
            <CardContent className="p-3">
              <div className="text-xs text-slate-400 mb-2 uppercase font-semibold">
                {sc.label}
              </div>
              <div className={`text-2xl font-bold mb-2`} style={{ color: getPfireColor(sc.value) }}>
                {privacyMode ? '••' : fmtPct(sc.value / 100, 0)}
              </div>
              <div className="h-1 bg-slate-700/15 rounded overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, sc.value)}%`,
                    backgroundColor: sc.color,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
