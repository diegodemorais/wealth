/**
 * dashboard.config.ts — Single source of truth for dashboard layout
 *
 * Defines:
 *   - TABS: tab order, routes, labels (consumed by Header + TabNav)
 *   - SECTIONS: per-tab sections with group, title, open/collapsed state
 *
 * To reorder tabs: edit TABS array order.
 * To reorder sections: edit SECTIONS[tab] array order — then match JSX order in the page.
 * To toggle open/collapsed: edit defaultOpen in SECTIONS[tab][n].
 * To rename a title: edit title in SECTIONS[tab][n].
 *
 * Page files read from secOpen() and secTitle() helpers — do NOT hardcode.
 */

// ─── Tab definitions ─────────────────────────────────────────────────────────

export interface TabDef {
  id: string;
  href: string;
  label: string;
}

export const TABS: TabDef[] = [
  { id: 'tab-now',         href: '/',            label: 'DASHBOARD' },
  { id: 'tab-portfolio',   href: '/portfolio',   label: 'PORTFOLIO' },
  { id: 'tab-performance', href: '/performance', label: 'PERFORMANCE' },
  { id: 'tab-fire',        href: '/fire',        label: 'FIRE' },
  { id: 'tab-withdraw',    href: '/withdraw',    label: 'RETIREMENT' },
  { id: 'tab-backtest',    href: '/backtest',     label: 'ANALYSIS' },
  { id: 'tab-assumptions', href: '/assumptions',  label: 'TOOLS' },
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
  /** SectionDivider group this section belongs to (matches SectionDivider label) */
  group?: string;
}

export const SECTIONS: Record<string, SectionDef[]> = {

  // ── DASHBOARD (/) ──────────────────────────────────────────────────────────
  now: [
    // Group: Indicadores
    { id: 'hero',              title: 'FIRE Hero — Status do Plano',                    defaultOpen: true,  collapsible: false, group: 'Indicadores' },
    { id: 'kpi-strip',         title: 'Indicadores Primários',                          defaultOpen: true,  collapsible: false, group: 'Indicadores' },
    // Group: Ação Imediata
    { id: 'macro',             title: 'Contexto Macro & DCA Status',                    defaultOpen: true,  collapsible: false, group: 'Ação Imediata' },
    { id: 'time-to-fire',      title: 'Time to FIRE',                                   defaultOpen: true,  collapsible: false, group: 'Ação Imediata' },
    { id: 'aporte-decision',   title: 'Próximo Aporte — Equity & Gatilhos RF',          defaultOpen: true,  collapsible: false, group: 'Ação Imediata' },
    { id: 'fire-progress',     title: 'Progresso FIRE + Aporte do Mês',                 defaultOpen: true,  collapsible: false, group: 'Ação Imediata' },
    // Group: Monitoramento
    { id: 'sankey',                title: 'Fluxo de Caixa — Receitas vs Gastos',            defaultOpen: false, collapsible: true, group: 'Monitoramento' },
    { id: 'wellness',              title: 'Financial Wellness Score (indicador secundário)', defaultOpen: false, collapsible: true, group: 'Monitoramento' },
    { id: 'rf-status',             title: 'RF Status — IPCA+ & Renda+ por Instrumento',     defaultOpen: false, collapsible: true, group: 'Monitoramento' },
    { id: 'patrimonio-liquido-ir', title: 'Patrimônio Líquido de IR',                       defaultOpen: false, collapsible: true, group: 'Monitoramento' },
    { id: 'rebalancing-status',    title: 'Rebalancing Status — Drift por Classe',          defaultOpen: false, collapsible: true, group: 'Monitoramento' },
  ],

  // ── PORTFOLIO (/portfolio) ─────────────────────────────────────────────────
  portfolio: [
    // Group: Visão Geral
    { id: 'alocacao',      title: 'Alocação — Por Classe de Ativo',           defaultOpen: true,  collapsible: false, group: 'Visão Geral' },
    { id: 'concentracao',  title: 'Concentração Geográfica',                  defaultOpen: true,  collapsible: false, group: 'Visão Geral' },
    // Group: Alocação & Drift
    { id: 'drift-intra-equity', title: 'Drift Intra-Equity — SWRD / AVGS / AVEM', defaultOpen: true, collapsible: true, group: 'Alocação & Drift' },
    { id: 'etf-region',    title: 'Composição por Região — ETFs da Carteira', defaultOpen: true,  collapsible: true,  group: 'Alocação & Drift' },
    { id: 'etf-factor',    title: 'Exposição Fatorial — ETFs da Carteira',    defaultOpen: true,  collapsible: true,  group: 'Alocação & Drift' },
    // Group: Holdings
    { id: 'holdings',      title: 'Posições — ETFs Internacionais (IBKR)',    defaultOpen: true,  collapsible: false, group: 'Holdings' },
    { id: 'etf-positions', title: 'Posições ETF — Tabela Detalhada',          defaultOpen: false, collapsible: true,  group: 'Holdings' },
    { id: 'custo-base',    title: 'Base de Custo — Equity por Bucket',        defaultOpen: false, collapsible: true,  group: 'Holdings' },
    // Group: Tax & Atividade
    { id: 'tax-ir',        title: 'IR Diferido — Alvo & Transitório',         defaultOpen: false, collapsible: true,  group: 'Tax & Atividade' },
    { id: 'tax-deferral',  title: 'Tax Deferral Clock — IR Diferido Total',   defaultOpen: false, collapsible: true,  group: 'Tax & Atividade' },
    { id: 'operacoes',     title: 'Últimas Operações',                        defaultOpen: false, collapsible: true,  group: 'Tax & Atividade' },
    // Group: Renda Fixa & Cripto
    { id: 'rf-crypto',     title: 'Renda Fixa + Cripto',                      defaultOpen: false, collapsible: true,  group: 'Renda Fixa & Cripto' },
    { id: 'real-yield',    title: 'Real Yield Gauge — NTN-Bs Líquido de IR',  defaultOpen: false, collapsible: true,  group: 'Renda Fixa & Cripto' },
    { id: 'crypto-band',   title: 'HODL11 — Banda Criptográfica',             defaultOpen: false, collapsible: true,  group: 'Renda Fixa & Cripto' },
  ],

  // ── PERFORMANCE (/performance) ─────────────────────────────────────────────
  performance: [
    // Group: Visão Geral
    { id: 'patrimonio',      title: 'Patrimônio — Evolução Histórica',                          defaultOpen: true,  collapsible: false, group: 'Visão Geral' },
    { id: 'attribution',     title: 'Performance Attribution — Decomposição do Patrimônio',     defaultOpen: true,  collapsible: false, group: 'Visão Geral' },
    { id: 'premissas',       title: 'Premissas vs Realizado — 5 Anos (2021-2026)',              defaultOpen: true,  collapsible: false, group: 'Visão Geral' },
    // Group: Alpha & Benchmark
    { id: 'alpha',           title: 'Alpha vs VWRA (benchmark) — Carteira Target por Período',  defaultOpen: true,  collapsible: false, group: 'Alpha & Benchmark' },
    { id: 'alpha-chart',     title: 'Alpha vs SWRD — Gráfico por Período',                     defaultOpen: false, collapsible: true,  group: 'Alpha & Benchmark' },
    // Group: Histórico
    { id: 'rolling-12m',     title: 'Rolling 12m — AVGS vs SWRD (retorno relativo)',            defaultOpen: false, collapsible: true,  group: 'Histórico' },
    { id: 'ir',              title: 'Information Ratio vs VWRA — Desde o Início + Rolling 36m', defaultOpen: false, collapsible: true,  group: 'Histórico' },
    // Group: Análise Técnica
    { id: 'heatmap',         title: 'Retornos Mensais — Heatmap',                               defaultOpen: false, collapsible: true,  group: 'Análise Técnica' },
    { id: 'rolling-metrics', title: 'Rolling Metrics — Sharpe / Sortino / Volatilidade',        defaultOpen: false, collapsible: true,  group: 'Análise Técnica' },
    { id: 'rolling-sharpe',  title: 'Rolling Sharpe — 12m (BRL vs CDI + USD vs T-Bill)',        defaultOpen: false, collapsible: true,  group: 'Análise Técnica' },
    { id: 'fee-analysis',    title: 'Fee Analysis — Custo de Complexidade (14 anos até FIRE)',   defaultOpen: false, collapsible: true,  group: 'Análise Técnica' },
  ],

  // ── FIRE (/fire) ───────────────────────────────────────────────────────────
  fire: [
    // Group: Readiness
    { id: 'floor-upside-fire',  title: 'Cobertura por Camadas — Floor vs Upside',                  defaultOpen: true,  collapsible: true,  group: 'Readiness' },
    { id: 'tracking',           title: 'Tracking FIRE — Realizado vs Projeção',                     defaultOpen: true,  collapsible: false, group: 'Readiness' },
    { id: 'aspiracional',       title: 'FIRE Aspiracional',                                          defaultOpen: true,  collapsible: false, group: 'Readiness' },
    { id: 'familia',            title: 'P(FIRE) — Cenários de Família',                             defaultOpen: true,  collapsible: false, group: 'Readiness' },
    { id: 'scenario-compare',   title: 'Cenário Base vs Cenário Aspiracional — Comparação Detalhada', defaultOpen: false, collapsible: true, group: 'Readiness' },
    // Group: Projeções
    { id: 'projecao',         title: 'Projeção de Patrimônio — P10 / P50 / P90',                    defaultOpen: true,  collapsible: false, group: 'Projeções' },
    { id: 'fire-matrix',      title: 'FIRE Matrix — P(Sucesso até 90a)',                            defaultOpen: true,  collapsible: true,  group: 'Projeções' },
    // Group: Contexto
    { id: 'balanco-holistico-fire', title: 'Balanço Holístico',                                     defaultOpen: false, collapsible: true,  group: 'Contexto' },
    { id: 'capital-humano',         title: 'Capital Humano',                                         defaultOpen: false, collapsible: true,  group: 'Contexto' },
    // Group: Cenários & Risco
    { id: 'tornado',                  title: 'Tornado de Sensibilidade (P(FIRE) ±10%)',             defaultOpen: false, collapsible: true,  group: 'Cenários & Risco' },
    { id: 'sequence-returns',         title: 'Sequence of Returns — Heatmap de Risco',              defaultOpen: false, collapsible: true,  group: 'Cenários & Risco' },
    { id: 'brl-fx',                   title: 'Sensibilidade Cambial — Equity USD em BRL',           defaultOpen: false, collapsible: true,  group: 'Cenários & Risco' },
    // Group: Eventos de Vida
    { id: 'eventos-vida',     title: 'Eventos de Vida — Impacto no Plano FIRE',                     defaultOpen: false, collapsible: true,  group: 'Eventos de Vida' },
    { id: 'glide-path',       title: 'Glide Path — Alocação por Idade',                             defaultOpen: true,  collapsible: true,  group: 'Eventos de Vida' },
  ],

  // ── RETIREMENT (/withdraw) ─────────────────────────────────────────────────
  withdraw: [
    // Group: Posso me aposentar?
    { id: 'swr-dashboard',       title: 'SWR Dashboard — Acumulação & FIRE Day',                    defaultOpen: true,  collapsible: true,  group: 'Posso me aposentar?' },
    { id: 'floor-upside',        title: 'Cobertura por Camadas — Floor vs Upside',                  defaultOpen: true,  collapsible: true,  group: 'Posso me aposentar?' },
    { id: 'guardrails',          title: 'Regras de Ajuste de Retirada — FIRE Day',                  defaultOpen: true,  collapsible: true,  group: 'Posso me aposentar?' },
    // Group: Quanto gastar?
    { id: 'spending-guardrails', title: 'Spending Guardrails — P(FIRE) × Custo de Vida',            defaultOpen: true,  collapsible: true,  group: 'Quanto gastar?' },
    { id: 'section-surplus-gap', title: 'Superávit / Déficit Anual — P10/P50/P90',                  defaultOpen: true,  collapsible: true,  group: 'Quanto gastar?' },
    { id: 'spending-breakdown-v2', title: 'Spending Breakdown — Detalhamento por Categoria',        defaultOpen: false, collapsible: true,  group: 'Quanto gastar?' },
    // Group: Proteção
    { id: 'bond-pool',               title: 'Bond Strategy — SoRR + Pool Readiness',                  defaultOpen: false, collapsible: true,  group: 'Proteção' },
    { id: 'sorr-heatmap',            title: 'Sequence of Returns — Heatmap de Risco',                 defaultOpen: false, collapsible: true,  group: 'Proteção' },
    { id: 'section-surviving-spouse', title: 'Cenário: Cônjuge Sobrevivente',                        defaultOpen: false, collapsible: true,  group: 'Proteção' },
    { id: 'fases',                   title: 'Renda na Aposentadoria — Fases Temporais',               defaultOpen: false, collapsible: true,  group: 'Proteção' },
    { id: 'section-ltc-sensitivity', title: 'LTC — Sensibilidade Cuidados de Longo Prazo',           defaultOpen: false, collapsible: true,  group: 'Proteção' },
    { id: 'bond-ladder',             title: 'Bond Ladder — Cronograma & Estrutura de Vencimentos',   defaultOpen: false, collapsible: true,  group: 'Proteção' },
  ],

  // ── BACKTEST (/backtest) ───────────────────────────────────────────────────
  backtest: [
    // Group: Backtest Principal
    // longo-prazo: merged section (BacktestHistoricoSection + ShadowPortfoliosSection → BacktestLongoSection)
    { id: 'longo-prazo',         title: 'Backtest — Target vs VWRA + Regime Histórico',      defaultOpen: true,  collapsible: true,  group: 'Backtest Principal' },
    // Group: Drawdown & Risco
    { id: 'drawdown-analysis',   title: 'Drawdown Analysis — Histórico, Crises & Recovery', defaultOpen: true,  collapsible: true,  group: 'Drawdown & Risco' },
    { id: 'drawdown-crises',     title: 'Crises Históricas — tabela detalhada',              defaultOpen: false, collapsible: true,  group: 'Drawdown & Risco' },
    { id: 'drawdown-recovery',   title: 'Recovery Table — eventos 2021–2026',                defaultOpen: false, collapsible: true,  group: 'Drawdown & Risco' },
    // Group: Deep Dive
    { id: 'cagr-decada',         title: 'CAGR por Década',                                   defaultOpen: true,  collapsible: true,  group: 'Deep Dive' },
    // Group: Bitcoin
    { id: 'btc-indicators',      title: 'Bitcoin On-Chain — Indicadores Históricos',         defaultOpen: false, collapsible: true,  group: 'Bitcoin' },
    // Group: Factor Analysis (moved from performance)
    { id: 'factor-waterfall',    title: 'Expected Return Waterfall — Decomposição Fatorial FF6',  defaultOpen: false, collapsible: true,  group: 'Factor Analysis' },
    { id: 'factor-regression',   title: 'Factor Regression — Carregamentos e R²',                 defaultOpen: false, collapsible: true,  group: 'Factor Analysis' },
    { id: 'factor-loadings',     title: 'Factor Loadings — Regressão Fama-French SF + Momentum',  defaultOpen: false, collapsible: true,  group: 'Factor Analysis' },
    { id: 'ff5-regression',      title: 'FF5 Regression — Tabela Completa',                       defaultOpen: false, collapsible: true,  group: 'Factor Analysis' },
    // Group: Drawdown & Risco (addition)
    { id: 'risk-return-scatter', title: 'Retorno vs. Risco por Classe de Ativos',                 defaultOpen: false, collapsible: true,  group: 'Drawdown & Risco' },
  ],

  // ── TOOLS (/assumptions) — absorves SIMULADORES + CHECKLIST ──────────────
  assumptions: [
    // Group: Changelog
    { id: 'dashboard-updates',             title: '📋 Changelog — Alterações do Dashboard', defaultOpen: true,  collapsible: true, group: 'Changelog' },
    // Group: Simuladores (moved from /simulators)
    { id: 'fire-sim',                      title: 'Simulador FIRE — Cenários de Aposentadoria',   defaultOpen: true,  collapsible: false, group: 'Simuladores' },
    { id: 'what-if',                       title: 'What-If — Sensibilidade de Variáveis',          defaultOpen: true,  collapsible: true,  group: 'Simuladores' },
    { id: 'cascade',                       title: 'Cascata de Aportes — DCA Mensal',               defaultOpen: true,  collapsible: false, group: 'Simuladores' },
    { id: 'stress',                        title: 'Stress Test — Monte Carlo (trajectórias reais)', defaultOpen: true,  collapsible: true,  group: 'Simuladores' },
    // Group: Decisões & Ações
    { id: 'assumptions-decisions',         title: 'Decisões & Ações',       defaultOpen: true,  collapsible: true, group: 'Decisões & Ações' },
    // Group: Onde Estou
    { id: 'assumptions-onde-estou',        title: 'Onde Estou',             defaultOpen: true,  collapsible: true, group: 'Onde Estou' },
    // Group: Alocação & Regras
    { id: 'assumptions-alocacao-regras',   title: 'Alocação & Regras',     defaultOpen: false, collapsible: true, group: 'Alocação & Regras' },
    // Group: Modelo & Referência
    { id: 'assumptions-modelo-referencia', title: 'Modelo & Referência',   defaultOpen: false, collapsible: true, group: 'Modelo & Referência' },
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

/** Get all groups for a tab (unique, in order of first appearance) */
export function tabGroups(tab: string): string[] {
  const sections = SECTIONS[tab] ?? [];
  const seen = new Set<string>();
  const groups: string[] = [];
  for (const s of sections) {
    if (s.group && !seen.has(s.group)) {
      seen.add(s.group);
      groups.push(s.group);
    }
  }
  return groups;
}
