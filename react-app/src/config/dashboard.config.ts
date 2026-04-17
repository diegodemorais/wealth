/**
 * dashboard.config.ts — Single source of truth for dashboard layout
 *
 * Defines:
 *   - TABS: tab order, routes, labels (consumed by TabNav)
 *   - SECTIONS: section order, titles, open/collapsed state per tab (consumed by each page)
 *
 * To reorder tabs: edit TABS array order.
 * To reorder sections: edit SECTIONS[tab] array order — then match JSX order in the page.
 * To toggle open/collapsed: edit defaultOpen in SECTIONS[tab][n].
 * To rename a title: edit title in SECTIONS[tab][n].
 *
 * Page files DO NOT hardcode defaultOpen or titles for collapsible sections —
 * they read from secOpen() and secTitle() helpers below.
 */

// ─── Tab definitions ─────────────────────────────────────────────────────────

export interface TabDef {
  id: string;
  href: string;
  label: string;
}

export const TABS: TabDef[] = [
  { id: 'tab-now',         href: '/',            label: '🕐 Now' },
  { id: 'tab-portfolio',   href: '/portfolio',   label: '🎯 Portfolio' },
  { id: 'tab-performance', href: '/performance', label: '📈 Performance' },
  { id: 'tab-fire',        href: '/fire',        label: '🔥 FIRE' },
  { id: 'tab-withdraw',    href: '/withdraw',    label: '💸 Retirada' },
  { id: 'tab-backtest',    href: '/backtest',    label: '📊 Backtest' },
  { id: 'tab-simulators',  href: '/simulators',  label: '🧪 Simuladores' },
];

// ─── Section definitions ──────────────────────────────────────────────────────

export interface SectionDef {
  /** Unique id within the tab — must match the id passed to CollapsibleSection */
  id: string;
  /** Human-readable title (used in CollapsibleSection header and as documentation) */
  title: string;
  /** Whether the section starts expanded (only meaningful for collapsible: true) */
  defaultOpen: boolean;
  /** Whether this section is wrapped in a CollapsibleSection */
  collapsible: boolean;
}

export const SECTIONS: Record<string, SectionDef[]> = {

  // ── NOW (/page.tsx) ─────────────────────────────────────────────────────────
  now: [
    { id: 'hero',              title: 'FIRE Hero — Status do Plano',                    defaultOpen: true,  collapsible: false },
    { id: 'kpi-strip',         title: 'KPI Strip — P(FIRE) · Drift · Aporte · YTD',    defaultOpen: true,  collapsible: false },
    { id: 'semaforos',         title: 'Semáforos de Gatilho',                           defaultOpen: true,  collapsible: false },
    { id: 'aporte',            title: 'Aporte do Mês',                                  defaultOpen: true,  collapsible: false },
    { id: 'drift',             title: 'Drift da Carteira',                              defaultOpen: true,  collapsible: false },
    { id: 'tornado',           title: 'Tornado de Sensibilidade (P(FIRE) ±10%)',        defaultOpen: false, collapsible: true  },
    { id: 'time-to-fire',      title: 'Time to FIRE',                                  defaultOpen: true,  collapsible: false },
    { id: 'macro',             title: 'Mercado & Macro',                                defaultOpen: true,  collapsible: false },
    { id: 'wellness',          title: 'Financial Wellness Score (indicador secundário)', defaultOpen: false, collapsible: true  },
  ],

  // ── PORTFOLIO (/portfolio/page.tsx) ─────────────────────────────────────────
  portfolio: [
    { id: 'alocacao',      title: 'Alocação — Por Classe de Ativo',                  defaultOpen: true,  collapsible: false },
    { id: 'drift-equity',  title: 'Drift Intra-Equity — SWRD / AVGS / AVEM',         defaultOpen: true,  collapsible: false },
    { id: 'geo-exposure',  title: 'Exposição Geográfica — Equities',                 defaultOpen: true,  collapsible: false },
    { id: 'etf-region',    title: 'Composição por Região — ETFs da Carteira',        defaultOpen: false, collapsible: true  },
    { id: 'concentracao',  title: 'Concentração Geográfica',                         defaultOpen: true,  collapsible: false },
    { id: 'etf-factor',    title: 'Exposição Fatorial — ETFs da Carteira',           defaultOpen: true,  collapsible: true  },
    { id: 'holdings',      title: 'Posições — ETFs Internacionais (IBKR)',           defaultOpen: true,  collapsible: false },
    { id: 'custo-base',    title: 'Base de Custo e Alocação — Equity por Bucket',   defaultOpen: false, collapsible: true  },
    { id: 'tax-ir',        title: 'IR Diferido — Alvo & Transitório',                defaultOpen: false, collapsible: true  },
    { id: 'rf-crypto',     title: 'Renda Fixa + Cripto',                             defaultOpen: true,  collapsible: false },
    { id: 'operacoes',     title: 'Últimas Operações',                               defaultOpen: true,  collapsible: false },
  ],

  // ── PERFORMANCE (/performance/page.tsx) ─────────────────────────────────────
  performance: [
    { id: 'patrimonio',      title: 'Patrimônio — Evolução Histórica',                                defaultOpen: true,  collapsible: false },
    { id: 'attribution',     title: 'Performance Attribution — Decomposição do Patrimônio',           defaultOpen: true,  collapsible: false },
    { id: 'alpha',           title: 'Alpha vs VWRA (benchmark) — Carteira Target por Período',        defaultOpen: true,  collapsible: false },
    { id: 'premissas',       title: 'Premissas vs Realizado — 5 Anos (2021-2026)',                    defaultOpen: true,  collapsible: false },
    { id: 'rolling-12m',     title: 'Rolling 12m — AVGS vs SWRD (retorno relativo)',                  defaultOpen: false, collapsible: true  },
    { id: 'ir',              title: 'Information Ratio vs VWRA — Desde o Início + Rolling 36m',       defaultOpen: false, collapsible: true  },
    { id: 'factor-loadings', title: 'Factor Loadings — Regressão Fama-French SF + Momentum',         defaultOpen: false, collapsible: true  },
    { id: 'heatmap',         title: 'Retornos Mensais — Heatmap',                                    defaultOpen: false, collapsible: true  },
    { id: 'rolling-sharpe',  title: 'Rolling Sharpe — 12m (BRL vs CDI + USD vs T-Bill)',             defaultOpen: false, collapsible: true  },
    { id: 'fee-analysis',    title: 'Fee Analysis — Custo de Complexidade (14 anos até FIRE)',        defaultOpen: false, collapsible: true  },
  ],

  // ── FIRE (/fire/page.tsx) ────────────────────────────────────────────────────
  fire: [
    { id: 'tracking',         title: 'Tracking FIRE — Realizado vs Projeção',                          defaultOpen: true,  collapsible: false },
    { id: 'aspiracional',     title: 'FIRE Aspiracional',                                               defaultOpen: true,  collapsible: false },
    { id: 'projecao',         title: 'Projeção de Patrimônio — P10 / P50 / P90 (portfólio financeiro)', defaultOpen: true,  collapsible: false },
    { id: 'fire-matrix',      title: 'FIRE Matrix — P(Sucesso 30 anos)',                                defaultOpen: true,  collapsible: true  },
    { id: 'familia',          title: 'P(FIRE) — Cenários de Família',                                  defaultOpen: true,  collapsible: false },
    { id: 'eventos-vida',     title: 'Eventos de Vida — Impacto no Plano FIRE',                        defaultOpen: false, collapsible: true  },
    { id: 'scenario-compare', title: 'Cenário Base vs Cenário Aspiracional — Comparação Detalhada',    defaultOpen: false, collapsible: true  },
    { id: 'glide-path',       title: 'Glide Path — Alocação por Idade',                                defaultOpen: false, collapsible: true  },
  ],

  // ── WITHDRAW (/withdraw/page.tsx) ────────────────────────────────────────────
  withdraw: [
    { id: 'swr',                title: 'SWR no FIRE Day — Percentis P10 / P50 / P90',      defaultOpen: true,  collapsible: true  },
    { id: 'guardrails',         title: 'Guardrails de Saque — Gasto vs Limite por Ano',    defaultOpen: true,  collapsible: false },
    { id: 'spending-guardrails',title: 'Spending Guardrails — Ajuste Dinâmico de Gasto',  defaultOpen: true,  collapsible: false },
    { id: 'bond-pool',          title: 'Bond Pool — Proteção Sequência de Retornos',       defaultOpen: true,  collapsible: false },
    { id: 'sankey',             title: 'Cashflow — Fluxo Mensal de Retirada',              defaultOpen: true,  collapsible: false },
    { id: 'fases',              title: 'Fases de Renda — Projeção por Fonte',              defaultOpen: true,  collapsible: false },
    { id: 'spending-breakdown', title: 'Spending Breakdown — Detalhamento de Gastos',      defaultOpen: false, collapsible: true  },
  ],

  // ── BACKTEST (/backtest/page.tsx) ────────────────────────────────────────────
  backtest: [
    { id: 'backtest-historico',  title: 'Backtest Histórico — Target vs Benchmarks',    defaultOpen: true,  collapsible: false },
    { id: 'drawdown-historico',  title: 'Drawdown Histórico — Máximo por Período',      defaultOpen: true,  collapsible: false },
    { id: 'shadow',              title: 'Shadow Portfolio — Comparação vs Target',       defaultOpen: true,  collapsible: false },
    { id: 'longo-prazo',         title: 'Backtest Longo Prazo — Dados Acadêmicos',      defaultOpen: false, collapsible: true  },
  ],

  // ── SIMULADORES (/simulators/page.tsx) ──────────────────────────────────────
  simuladores: [
    { id: 'cascade',   title: 'Cascata de Aportes — DCA Mensal',                defaultOpen: true,  collapsible: false },
    { id: 'fire-sim',  title: 'Simulador FIRE — Cenários de Aposentadoria',     defaultOpen: true,  collapsible: false },
    { id: 'what-if',   title: 'What-If — Sensibilidade de Variáveis',           defaultOpen: false, collapsible: true  },
    { id: 'stress',    title: 'Stress Test — Monte Carlo (trajectórias reais)', defaultOpen: false, collapsible: true  },
  ],

};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Find a section definition by tab key and section id */
export function getSec(tab: string, id: string): SectionDef | undefined {
  return SECTIONS[tab]?.find(s => s.id === id);
}

/**
 * Get the defaultOpen value for a section.
 * @param fallback returned when the section id is not found in config (default: true)
 */
export function secOpen(tab: string, id: string, fallback = true): boolean {
  return getSec(tab, id)?.defaultOpen ?? fallback;
}

/** Get the canonical title for a section */
export function secTitle(tab: string, id: string, fallback = ''): string {
  return getSec(tab, id)?.title ?? fallback;
}
