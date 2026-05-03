'use client';

// FactorAnalysisPanel — consolida 3 visões factor analysis em tab toggle
// (DEV-factor-views-tab-toggle 2026-05-02)
//
// Por quê: 3 painéis adjacentes ocupavam ~3× espaço vertical na aba Portfolio.
// Cada um responde pergunta diferente — não é duplicata. Tab toggle preserva
// todas, default "Comparativo" (visão mais usada).

import { useState } from 'react';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { FactorProfileChart, type FactorProfileData } from '@/components/charts/FactorProfileChart';
import { StyleBoxChart, type StyleBoxData } from '@/components/charts/StyleBoxChart';
import { FactorLoadings } from '@/components/portfolio/FactorLoadings';

type Tab = 'comparativo' | 'per-etf' | 'style-box';

interface FactorAnalysisPanelProps {
  factorLoadings: (FactorProfileData & StyleBoxData) | null | undefined;
}

const TABS: Array<{ id: Tab; label: string; testId: string }> = [
  { id: 'comparativo', label: 'Comparativo', testId: 'factor-tab-comparativo' },
  { id: 'per-etf', label: 'Per-ETF', testId: 'factor-tab-per-etf' },
  { id: 'style-box', label: 'Style Box', testId: 'factor-tab-style-box' },
];

export function FactorAnalysisPanel({ factorLoadings }: FactorAnalysisPanelProps) {
  const [tab, setTab] = useState<Tab>('comparativo');
  if (!factorLoadings) return null;

  const fl = factorLoadings;
  const hasSWRD = fl.SWRD != null;

  const titles: Record<Tab, string> = {
    comparativo: 'Factor Profile Comparativo — SWRD · AVGS · AVEM',
    'per-etf': 'Factor Loadings FF5 — por ETF (vs neutro=0)',
    'style-box': 'Style Box — Mercap × Estilo (Value · Blend · Growth)',
  };

  return (
    <div data-testid="factor-analysis-panel">
      <CollapsibleSection
        id="section-factor-analysis"
        title={secTitle('portfolio', 'factor-analysis', `Factor Analysis — ${titles[tab]}`)}
        defaultOpen={secOpen('portfolio', 'factor-analysis', false)}
      >
        <div style={{ padding: '0 16px 4px' }}>
          <div role="tablist" aria-label="Factor analysis views" style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
            {TABS.map((t) => {
              const active = tab === t.id;
              const disabled = t.id === 'style-box' && !hasSWRD;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`factor-tabpanel-${t.id}`}
                  data-testid={t.testId}
                  disabled={disabled}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: '8px 14px',
                    fontSize: 'var(--text-sm)',
                    fontWeight: active ? 700 : 500,
                    color: active ? 'var(--text)' : 'var(--muted)',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.4 : 1,
                    marginBottom: -1,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div role="tabpanel" id={`factor-tabpanel-${tab}`}>
          {tab === 'comparativo' && <FactorProfileChart data={fl} />}
          {tab === 'per-etf' && <FactorLoadings data={fl as Parameters<typeof FactorLoadings>[0]['data']} />}
          {tab === 'style-box' && hasSWRD && <StyleBoxChart data={fl} />}
        </div>
      </CollapsibleSection>
    </div>
  );
}
