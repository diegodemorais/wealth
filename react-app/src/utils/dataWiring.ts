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
  Object.values(data.posicoes || {}).forEach(p => {
    if (p && typeof p.qty === 'number' && typeof p.price === 'number') {
      totalEquityUsd += p.qty * p.price;
    }
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
  Object.entries(data.posicoes || {}).forEach(([k, p]) => {
    if (p && p.bucket && typeof p.qty === 'number' && typeof p.price === 'number') {
      bucketUsd[p.bucket] = (bucketUsd[p.bucket] || 0) + p.qty * p.price;
    }
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

  // P(FIRE) — probability of success from pfire_base (base scenario)
  const pfire = (data.pfire_base?.base ?? 90.4) / 100;

  // Build gatilhos array
  const gatilhos: any[] = [];
  const dcaIpca = data.dca_status?.ipca_longo;
  if (dcaIpca) {
    const taxa = dcaIpca.taxa_atual;
    const piso = dcaIpca.piso;
    const status = taxa != null && piso != null && taxa >= piso ? 'verde' : 'amarelo';
    const valorIpca2040 = data.rf?.ipca2040?.valor ?? 0;
    const valorIpca2029 = data.rf?.ipca2029?.valor ?? 0;
    const posicaoBrl = valorIpca2040 + valorIpca2029;
    const pctAtual = dcaIpca.pct_carteira_atual;
    const pctAlvo = dcaIpca.alvo_pct;
    const gapAlvo = dcaIpca.gap_alvo_pp;
    const ctx = taxa != null
      ? `taxa: ${taxa.toFixed(2)}% · piso ${piso.toFixed(1)}% · posição: R$${(posicaoBrl/1000).toFixed(0)}k` +
        (pctAtual != null ? ` (${pctAtual.toFixed(1)}% vs alvo ${pctAlvo.toFixed(1)}%, gap ${gapAlvo.toFixed(1)}pp)` : '')
      : undefined;
    gatilhos.push({
      nome: 'IPCA+ 2040 — DCA',
      tipo: 'taxa',
      status,
      valorPrimario: taxa != null ? `${taxa.toFixed(2)}% vs piso ${piso.toFixed(1)}%` : '--',
      contexto: ctx,
      acao: dcaIpca.ativo ? 'DCA ativo' : 'DCA pausado',
    });
  }

  const dg = data.rf?.renda2065?.distancia_gatilho;
  if (dg) {
    const valorRenda = data.rf?.renda2065?.valor ?? 0;
    const ctx = dg.taxa_atual != null
      ? `taxa: ${dg.taxa_atual.toFixed(2)}% · piso venda ${dg.piso_venda.toFixed(1)}% · gap ${dg.gap_pp.toFixed(2)}pp` +
        (valorRenda > 0 ? ` · posição R$${(valorRenda/1000).toFixed(0)}k` : '')
      : undefined;
    gatilhos.push({
      nome: 'Renda+ 2065 — Taxa',
      tipo: 'taxa',
      status: dg.status || 'verde',
      valorPrimario: dg.taxa_atual != null ? `${dg.taxa_atual.toFixed(2)}% (gatilho ≤${dg.piso_venda.toFixed(1)}%)` : '--',
      contexto: ctx,
      acao: dg.status === 'verde' ? 'Monitorar' : dg.status === 'amarelo' ? 'Atenção — próximo do piso' : 'Avaliar venda',
    });
  }

  const driftSwrd = data.drift?.SWRD;
  if (driftSwrd) {
    const gap = driftSwrd.alvo - driftSwrd.atual;
    const absGap = Math.abs(gap);
    const status = absGap <= 3 ? 'verde' : absGap <= 5 ? 'amarelo' : 'vermelho';
    const impactoR = totalBrl > 0 ? Math.abs((absGap / 100) * totalBrl) : null;
    const ctx = `atual: ${driftSwrd.atual.toFixed(1)}% · alvo ${driftSwrd.alvo.toFixed(1)}% · gap ${gap >= 0 ? '-' : '+'}${absGap.toFixed(1)}pp` +
      (impactoR != null ? ` · ~R$${(impactoR/1000).toFixed(0)}k para rebalancear` : '');
    gatilhos.push({
      nome: 'Equity SWRD — Drift',
      tipo: 'posicao',
      status,
      valorPrimario: `${driftSwrd.atual.toFixed(1)}% (alvo ${driftSwrd.alvo.toFixed(1)}%)`,
      contexto: ctx,
      acao: status === 'verde' ? 'OK' : 'Priorizar aporte SWRD',
    });
  }

  const banda = data.hodl11?.banda;
  if (banda) {
    const ctx = banda.atual_pct != null
      ? `atual: ${banda.atual_pct.toFixed(1)}% · alvo ${banda.alvo_pct.toFixed(0)}% · banda ${banda.min_pct.toFixed(1)}–${banda.max_pct.toFixed(1)}%`
      : undefined;
    gatilhos.push({
      nome: 'Crypto HODL11 — Banda',
      tipo: 'crypto',
      status: banda.status || 'verde',
      valorPrimario: banda.atual_pct != null ? `${banda.atual_pct.toFixed(1)}% (banda ${banda.min_pct.toFixed(1)}–${banda.max_pct.toFixed(1)}%)` : '--',
      contexto: ctx,
      acao: banda.status === 'verde' ? 'Dentro da banda' : banda.status === 'amarelo' ? 'Perto do limite' : 'Fora da banda',
    });
  }

  const driftEntries = Object.entries(data.drift || {}) as Array<[string, any]>;
  const maxDriftEntry = driftEntries
    .filter(([k]) => k !== 'Custo')
    .sort((a, b) => Math.abs((b[1] as any)?.atual - (b[1] as any)?.alvo) - Math.abs((a[1] as any)?.atual - (a[1] as any)?.alvo))[0];
  if (maxDriftEntry) {
    const [bucket, bDrift] = maxDriftEntry as [string, any];
    const bGap = bDrift.alvo - bDrift.atual;
    const bAbsGap = Math.abs(bGap);
    const status = bAbsGap <= 3 ? 'verde' : bAbsGap <= 5 ? 'amarelo' : 'vermelho';
    const impactoR = totalBrl > 0 ? Math.abs((bAbsGap / 100) * totalBrl) : null;
    const ctx = `atual: ${bDrift.atual.toFixed(1)}% · alvo ${bDrift.alvo.toFixed(1)}% · gap ${bGap >= 0 ? '-' : '+'}${bAbsGap.toFixed(1)}pp` +
      (impactoR != null ? ` · ~R$${(impactoR/1000).toFixed(0)}k` : '');
    gatilhos.push({
      nome: `Drift máximo (${bucket})`,
      tipo: 'posicao',
      status,
      valorPrimario: `${bAbsGap.toFixed(1)}pp`,
      contexto: ctx,
      acao: status === 'verde' ? 'OK' : 'Rebalancear via aporte',
    });
  }

  const statusIpca = gatilhos.length > 0 ? gatilhos[0].status : 'verde';
  const resumoGatilhos = `IPCA+ 2040: ${dcaIpca?.ativo ? 'DCA ativo' : 'DCA pausado'} · ${gatilhos.length} gatilhos monitorados`;

  // Compute wellness label from score
  const wellnessScoreRaw = Math.min(1, progPct / 100 * 1.2);
  const wellnessLabel =
    wellnessScoreRaw >= 0.80 ? 'Excelente' :
    wellnessScoreRaw >= 0.60 ? 'Progredindo' :
    wellnessScoreRaw >= 0.40 ? 'Atenção' :
    'Crítico';

  // Compute wellness metrics breakdown
  const firePercentageMetric = Math.min(1, progPct / 100);
  const equityAllocationMetric = totalEquityUsd * CAMBIO / totalBrl; // Already computed above
  const diversificationMetric =
    Object.keys(bucketUsd).filter(k => bucketUsd[k] > 0).length >= 3 ? 0.9 :
    Object.keys(bucketUsd).filter(k => bucketUsd[k] > 0).length === 2 ? 0.6 : 0.3;
  const costEfficiencyMetric = 1 - Math.min(1, (data.drift?.['Custo']?.atual ?? 0) / 100);
  const liquidityScore =
    (rfBrl + (data.hodl11?.valor ?? 0)) / totalBrl; // RF + crypto as liquid

  const wellnessMetrics = [
    {
      label: 'Progresso FIRE',
      value: Math.round(firePercentageMetric * 100),
      max: 100,
      color: firePercentageMetric >= 0.8 ? '#22c55e' : firePercentageMetric >= 0.6 ? '#eab308' : '#ef4444',
      detail: `${Math.round(firePercentageMetric * 100)}%`,
    },
    {
      label: 'Alocação Equity',
      value: Math.round(equityAllocationMetric * 100),
      max: 100,
      color: equityAllocationMetric >= 0.6 ? '#22c55e' : equityAllocationMetric >= 0.5 ? '#eab308' : '#ef4444',
      detail: `${Math.round(equityAllocationMetric * 100)}%`,
    },
    {
      label: 'Diversificação',
      value: Math.round(diversificationMetric * 100),
      max: 100,
      color: diversificationMetric >= 0.8 ? '#22c55e' : diversificationMetric >= 0.5 ? '#eab308' : '#ef4444',
      detail: `${Object.keys(bucketUsd).filter(k => bucketUsd[k] > 0).length} buckets`,
    },
    {
      label: 'Eficiência Custos',
      value: Math.round(costEfficiencyMetric * 100),
      max: 100,
      color: costEfficiencyMetric >= 0.95 ? '#22c55e' : costEfficiencyMetric >= 0.90 ? '#eab308' : '#ef4444',
      detail: `${(data.drift?.['Custo']?.atual ?? 0).toFixed(2)}% TER`,
    },
    {
      label: 'Liquidez',
      value: Math.round(liquidityScore * 100),
      max: 100,
      color: liquidityScore >= 0.3 ? '#22c55e' : liquidityScore >= 0.15 ? '#eab308' : '#ef4444',
      detail: `${Math.round(liquidityScore * 100)}%`,
    },
  ];

  // Compute aporte accumulated values
  const aporteMensal = data.premissas?.aporte_mensal ?? 0;
  const ultimoAporte = data.premissas?.ultimo_aporte_brl ?? 0;
  const ultimoAporteData = data.premissas?.ultimo_aporte_data ?? '';

  // Estimate accumulated values (simplified — actual implementation would parse minilog)
  const acumuladoMes = ultimoAporte * (ultimoAporteData.includes(today.toISOString().substring(0, 7)) ? 1 : 0) || aporteMensal;
  const acumuladoAno = data.aporte_mensal?.total_aporte_brl ?? aporteMensal * 12; // Approximate

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
    pfire, // Probability of FIRE success (0-1)

    // Wellness score (simple heuristic)
    wellnessScore: Math.min(1, progPct / 100 * 1.2),
    wellnessLabel,
    wellnessMetrics,
    wellnessStatus: progPct >= 80 ? 'excellent' : progPct >= 60 ? 'ok' : progPct >= 40 ? 'warning' : 'critical',

    // FIRE patrimonio
    firePatrimonioAtual: data.premissas.patrimonio_atual,
    firePatrimonioGatilho: PAT_GATILHO,

    // Aporte tracking
    aporteMensal,
    ultimoAporte,
    ultimoAporteData,
    acumuladoMes,
    acumuladoAno,

    // Allocation
    equityPercentage: totalEquityUsd * CAMBIO / totalBrl,
    rfPercentage: rfBrl / totalBrl,

    // Geographic diversification
    internationalPercentage: (geoUS + geoDM + geoEM) / totalEquityUsd,
    concentrationBrazil: ipcaTotalBrl / totalBrl,

    // Cost metrics
    costIndexBps: data.drift?.['Custo']?.atual ?? 0,
    trackingDifference: 0, // computed separately if needed

    // Gatilhos
    gatilhos,
    statusIpca,
    resumoGatilhos,

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
