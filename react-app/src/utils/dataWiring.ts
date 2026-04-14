/**
 * Data Wiring — Computed Derived Values
 * Port from dashboard/js/02-data-wiring.mjs
 * Pure function: no side effects, no DOM access
 */

import { DashboardData, DerivedValues } from '@/types/dashboard';

function _ymToDecimal(ym: string): number {
  const [y, m] = ym.split('-').map(Number);
  return y + (m - 1) / 12;
}

function _fmtYearMonth(ym: string): string {
  const [y, m] = ym.split('-');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return months[parseInt(m, 10) - 1] + '/' + y;
}

/**
 * Compute all derived values from raw dashboard data
 * @param data - Raw dashboard data (from data.json)
 * @returns Derived values for charts and KPIs
 */
export function computeDerivedValues(data: DashboardData): DerivedValues {
  // Normalize camelCase aliases
  const normalized = {
    ...data,
    dcaStatus: data.dca_status,
    etfComposition: data.etf_composition,
    fireTrilha: data.fire_trilha,
    fireSWRPercentis: data.fire_swr_percentis,
    fireMatrix: data.fire_matrix,
    lumpyEvents: data.lumpy_events,
    earliestFire: data.earliest_fire,
    rollingMetrics: data.rolling_sharpe,
    driftStatus: data.drift,
    gastoPiso: data.gasto_piso,
    bondPoolRunway: data.bond_pool_runway,
    spendingBreakdown: data.spending_breakdown,
    spendingGuardrails: data.spending_guardrails,
    rendaFixa: data.rf,
    cryptoStatus: { valor: data.hodl11?.valor, status: 'ativo' },
    cryptoPnl: data.hodl11,
    operacoes: data.minilog,
    montecarlo: data.fire_matrix,
    fireMetrics: { base: data.pfire_base, aspirational: data.pfire_aspiracional },
    backtestMetrics: data.backtest?.metrics || {},
    backtestData: data.backtest,
    patrimonioProjecao: data.timeline,
    stressTest: data.scenario_comparison || {},
    performanceAnalysis: {
      rolling: data.factor_rolling,
      loadings: data.factor_loadings,
      attribution: data.attribution,
    },
    exposicaoCambial: { cambio: data.cambio, posicoes: data.posicoes },
  };

  const CAMBIO = data.cambio;
  const PAT_GATILHO = data.premissas.patrimonio_gatilho;

  // Total equity USD
  let totalEquityUsd = 0;
  Object.values(data.posicoes).forEach(p => {
    totalEquityUsd += p.qty * p.price;
  });

  // Total BRL = equity + RF + crypto
  const rfBrl =
    (data.rf.ipca2029?.valor ?? 0) +
    (data.rf.ipca2040?.valor ?? 0) +
    (data.rf.ipca2050?.valor ?? 0) +
    (data.rf.renda2065?.valor ?? 0);

  const cryptoLegado = data.cryptoLegado ?? 3000;
  const cryptoBrl = (data.hodl11?.valor ?? 0) + cryptoLegado;
  const totalBrl = totalEquityUsd * CAMBIO + rfBrl + cryptoBrl;

  // IPCA total
  const ipcaTotalBrl =
    (data.rf.ipca2029?.valor ?? 0) +
    (data.rf.ipca2040?.valor ?? 0) +
    (data.rf.ipca2050?.valor ?? 0);

  // Bucket values USD
  const bucketUsd: Record<string, number> = { SWRD: 0, AVGS: 0, AVEM: 0, JPGL: 0 };
  Object.entries(data.posicoes).forEach(([k, p]) => {
    bucketUsd[p.bucket] = (bucketUsd[p.bucket] || 0) + p.qty * p.price;
  });

  // Geo breakdown
  const swrdUsd = data.posicoes.SWRD?.qty * data.posicoes.SWRD?.price || 0;
  const avuvUsd = data.posicoes.AVUV?.qty * data.posicoes.AVUV?.price || 0;
  const avdvUsd = data.posicoes.AVDV?.qty * data.posicoes.AVDV?.price || 0;
  const usscUsd = data.posicoes.USSC?.qty * data.posicoes.USSC?.price || 0;
  const avgsUsd = data.posicoes.AVGS?.qty * data.posicoes.AVGS?.price || 0;
  const avemUsd =
    (data.posicoes.EIMI?.qty * data.posicoes.EIMI?.price || 0) +
    (data.posicoes.AVES?.qty * data.posicoes.AVES?.price || 0) +
    (data.posicoes.DGS?.qty * data.posicoes.DGS?.price || 0);
  const iwvlUsd = data.posicoes.IWVL?.qty * data.posicoes.IWVL?.price || 0;

  const geoUS = swrdUsd * 0.67 + avuvUsd + usscUsd + avgsUsd * 0.58;
  const geoDM = swrdUsd * 0.33 + avdvUsd + avgsUsd * 0.42 + iwvlUsd;
  const geoEM = avemUsd;

  // CAGR historical series
  const timeline = data.timeline || { values: [totalBrl], labels: [] };
  const patInicio = timeline.values?.[0] ?? totalBrl;
  const patFim = timeline.values?.[timeline.values.length - 1] ?? totalBrl;
  const _tStart = timeline.labels?.length ? _ymToDecimal(timeline.labels[0]) : 2021.25;
  const _tEnd = timeline.labels?.length ? _ymToDecimal(timeline.labels[timeline.labels.length - 1]) : 2026.25;
  const anos = _tEnd - _tStart;
  const cagr = anos > 0 && patInicio > 0 ? (Math.pow(patFim / patInicio, 1 / anos) - 1) * 100 : 0;

  // Backtest metrics
  const TWR_USD = data.backtest?.metrics?.target?.cagr ?? 12.88;
  const _btDates = data.backtest?.dates || [];
  const _btFirstDate = _btDates[0];
  const _btLastDate = _btDates[_btDates.length - 1];
  const _btPeriodStr =
    _btFirstDate && _btLastDate ? _fmtYearMonth(_btFirstDate) + '–' + _fmtYearMonth(_btLastDate) : 'N/A';

  const cambioInicio = data.backtest?.cambioInicio ?? 3.79;
  const cambioFim = data.cambio;
  const anosCambio =
    _btDates && _btDates.length > 1 ? _ymToDecimal(_btDates[_btDates.length - 1]) - _ymToDecimal(_btDates[0]) : 6.75;
  const fx_contrib_anual = anosCambio > 0 ? (Math.pow(cambioFim / cambioInicio, 1 / anosCambio) - 1) * 100 : 0;
  const TWR_BRL = ((1 + TWR_USD / 100) * (1 + fx_contrib_anual / 100) - 1) * 100;

  // Progress FIRE
  const progPct = (data.premissas.patrimonio_atual / PAT_GATILHO) * 100;
  const swrFireDay = data.premissas.custo_vida_base / PAT_GATILHO;

  // Years to FIRE
  const today = new Date(data.date);
  const _anoFireAlvoGlobal = today.getFullYear() + (data.premissas.idade_cenario_base - data.premissas.idade_atual);
  const _anoFireAspir = today.getFullYear() + ((data.premissas.idade_cenario_aspiracional ?? 50) - data.premissas.idade_atual);
  const _anoFire = today.getFullYear() + (data.premissas.idade_cenario_base - data.premissas.idade_atual);

  const fireDate = new Date(`${_anoFire}-01-01`);
  const msLeft = fireDate.getTime() - today.getTime();
  const yearsLeft = msLeft / (1000 * 60 * 60 * 24 * 365.25);
  const yrInt = Math.floor(yearsLeft);
  const moInt = Math.round((yearsLeft - yrInt) * 12);

  return {
    // Core values
    networth: totalBrl,
    networthUsd: totalEquityUsd,
    monthlyIncome: data.premissas?.renda_mensal_liquida ?? 0,
    yearlyExpense: data.premissas?.custo_vida_base ?? 0,

    // FIRE tracking
    fireDate,
    fireMonthsAway: moInt + yrInt * 12,
    firePercentage: (progPct / 100),

    // Wellness score (simple heuristic)
    wellnessScore: Math.min(1, progPct / 100 * 1.2),
    wellnessStatus: progPct >= 80 ? 'excellent' : progPct >= 60 ? 'ok' : progPct >= 40 ? 'warning' : 'critical',

    // Allocation
    equityPercentage: totalEquityUsd * CAMBIO / totalBrl,
    rfPercentage: rfBrl / totalBrl,

    // Geographic diversification
    internationalPercentage: (geoUS + geoDM + geoEM) / totalEquityUsd,
    concentrationBrazil: ipcaTotalBrl / totalBrl,

    // Cost metrics
    costIndexBps: data.drift?.['Custo']?.atual ?? 0,
    trackingDifference: 0, // computed separately if needed

    // Enriched data for charts
    CAMBIO,
    PAT_GATILHO,
    totalEquityUsd,
    rfBrl,
    cryptoLegado,
    cryptoBrl,
    totalBrl,
    ipcaTotalBrl,
    bucketUsd,
    swrdUsd,
    avuvUsd,
    avdvUsd,
    usscUsd,
    avgsUsd,
    avemUsd,
    iwvlUsd,
    geoUS,
    geoDM,
    geoEM,
    patInicio,
    patFim,
    anos,
    cagr,
    TWR_USD,
    TWR_BRL,
    progPct,
    swrFireDay,
    today,
    _anoFireAlvoGlobal,
    _anoFireAspir,
    _anoFire,
    _btPeriodStr,
    cambioInicio,
    cambioFim,
    anosCambio,
    fx_contrib_anual,
    yearsLeft,
    yrInt,
    moInt,
  };
}
