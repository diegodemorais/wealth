/**
 * periods.ts — Fonte única de verdade para seletores de período do dashboard.
 *
 * GRUPO SHORT — dados reais do portfólio (série começa em abr/2021).
 *   Componentes: TimelineChart (performance), AllocationHistoricoSection (backtest).
 *
 * GRUPO LONG — backtest/benchmark histórico (série R7 desde jan/1995).
 *   Componentes: BacktestLongoSection (R7), RiskReturnScatter.
 *
 * Regra: NUNCA definir arrays de períodos localmente nos componentes.
 * Sempre importar SHORT_PERIODS ou LONG_PERIODS daqui.
 */

import { yearsFrom } from '@/utils/time';

// ── Aliases de tipos para os keys ─────────────────────────────────────────────

/** Keys válidos do grupo SHORT */
export type ShortPeriodKey = '1m' | '3m' | 'ytd' | '1y' | '3y' | '5y';

/** Keys válidos do grupo LONG */
export type LongPeriodKey =
  | '1m' | '3m' | 'ytd' | '1y' | '3y' | '5y'
  | 'since2020' | 'since2013' | 'since2009' | 'since2003'
  | 'all';

// ── Tipo canônico (genérico para preservar key union) ─────────────────────────

export interface PeriodDef<K extends string = string> {
  /** Chave usada como valor de estado e passada ao gráfico */
  key: K;
  /** Label curto exibido no botão (ex: "1m", "YTD", "Pós-COVID (6a)") */
  label: string;
  /** Tooltip explicativo exibido no title do botão */
  title: string;
}

// ── Helpers internos ──────────────────────────────────────────────────────────

function _today(): Date {
  return new Date();
}

/** Label dinâmico para períodos históricos longos — anos calculados em runtime */
function _longLabel(baseLabel: string, startISO: string): string {
  return `${baseLabel} (${yearsFrom(startISO, _today())}a)`;
}

function _longTitle(baseTitle: string, startISO: string): string {
  const yrs = yearsFrom(startISO, _today());
  return `${baseTitle} (${yrs} anos)`;
}

// ── GRUPO SHORT ───────────────────────────────────────────────────────────────
// Para gráficos com dados reais do portfólio — série começa abr/2021.
// Ordem: crescente do intervalo mais curto ao mais longo.

export const SHORT_PERIODS: Array<PeriodDef<ShortPeriodKey>> = [
  { key: '1m',  label: '1m',  title: 'Último mês' },
  { key: '3m',  label: '3m',  title: 'Últimos 3 meses' },
  { key: 'ytd', label: 'YTD', title: 'Ano corrente (desde jan)' },
  { key: '1y',  label: '1a',  title: 'Últimos 12 meses' },
  { key: '3y',  label: '3a',  title: 'Últimos 3 anos' },
  { key: '5y',  label: '5a',  title: 'Últimos 5 anos' },
];

// ── GRUPO LONG ────────────────────────────────────────────────────────────────
// Para gráficos de backtest/benchmark com série R7 desde jan/1995.
// Ordem: crescente do intervalo mais curto ao mais longo.
// Anos dos períodos históricos calculados dinamicamente via yearsFrom().

export const LONG_PERIODS: Array<PeriodDef<LongPeriodKey>> = [
  { key: '1m',        label: '1m',                                                           title: 'Último mês' },
  { key: '3m',        label: '3m',                                                           title: 'Últimos 3 meses' },
  { key: 'ytd',       label: 'YTD',                                                          title: 'Ano corrente (desde jan)' },
  { key: '1y',        label: '1a',                                                            title: 'Últimos 12 meses' },
  { key: '3y',        label: '3a',                                                            title: 'Últimos 3 anos' },
  { key: '5y',        label: '5a',                                                            title: 'Últimos 5 anos' },
  { key: 'since2020', label: _longLabel('Pós-COVID', '2020-01-01'),                           title: _longTitle('jan/2020→hoje · desde o fundo de março 2020', '2020-01-01') },
  { key: 'since2013', label: _longLabel('Pós-Euro',  '2013-01-01'),                           title: _longTitle('jan/2013→hoje · pós-crise da dívida europeia', '2013-01-01') },
  { key: 'since2009', label: _longLabel('Pós-GFC',   '2009-01-01'),                           title: _longTitle('jan/2009→hoje · desde o fundo da crise de 2008', '2009-01-01') },
  { key: 'since2003', label: _longLabel('Pós-.com',  '2002-10-01'),                           title: _longTitle('out/2002→hoje · pós-fundo da bolha .com', '2002-10-01') },
  { key: 'all',       label: 'All (R7)',                                                      title: 'Série completa R7 — desde jan/1995' },
];
