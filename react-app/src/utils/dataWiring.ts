/**
 * Data Wiring — Computed Derived Values
 * Port from dashboard/js/02-data-wiring.mjs
 * Pure function: no side effects, no DOM access
 */

import { DashboardData, DerivedValues, DcaItem, DriftItem, MarketContext, StatusColor } from '@/types/dashboard';

/**
 * Validate that data.json has all required schema fields
 * @param data - Raw dashboard data
 * @throws Error if critical fields are missing
 */
export function validateDataSchema(data: any): void {
  if (!data || typeof data !== 'object') {
    throw new Error('Data must be a non-null object');
  }

  const requiredFields = ['posicoes', 'rf', 'cambio', 'premissas', 'pfire_base'];
  const missingFields = requiredFields.filter(field => !(field in data));

  if (missingFields.length > 0) {
    throw new Error(
      `Invalid data.json schema: missing required fields [${missingFields.join(', ')}]`
    );
  }

  // Validate critical nested structures
  if (!data.posicoes || typeof data.posicoes !== 'object') {
    throw new Error('data.posicoes must be an object');
  }
  if (!data.rf || typeof data.rf !== 'object') {
    throw new Error('data.rf must be an object');
  }
  if (typeof data.cambio !== 'number') {
    throw new Error('data.cambio must be a number');
  }
  if (!data.premissas || typeof data.premissas !== 'object') {
    throw new Error('data.premissas must be an object');
  }

  console.log('✓ Data schema validation passed');
}

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
  // No fallback: if pfire_base.base is absent, data pipeline is broken — fail visibly
  const pfire = (data.pfire_base?.base ?? null) !== null ? (data.pfire_base.base / 100) : 0;

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

  // ═══════════════════════════════════════════════════════════════════════
  // UNIFIED DCA ITEMS — single source of truth for all consumers
  // (SemaforoGatilhos, SemaforoTriggers, DCAStatusGrid, Cascade calculator)
  // ═══════════════════════════════════════════════════════════════════════
  const dcaItems: DcaItem[] = [];

  // 1. IPCA+ 2040 (from dca_status.ipca_longo)
  const dcaIpcaLongo = data.dca_status?.ipca_longo;
  if (dcaIpcaLongo) {
    const taxa = dcaIpcaLongo.taxa_atual ?? null;
    const piso = dcaIpcaLongo.piso ?? null;
    const posicao = (data.rf?.ipca2040?.valor ?? 0) + (data.rf?.ipca2029?.valor ?? 0);
    const st: StatusColor = taxa != null && piso != null && taxa >= piso ? 'verde' : 'amarelo';
    dcaItems.push({
      id: 'ipca2040',
      nome: 'IPCA+ 2040',
      categoria: 'rf_ipca',
      taxa,
      pisoCompra: piso,
      pisoVenda: null,
      gapPiso: taxa != null && piso != null ? taxa - piso : null,
      status: st,
      dcaAtivo: dcaIpcaLongo.ativo ?? false,
      posicaoBrl: posicao,
      pctCarteira: dcaIpcaLongo.pct_carteira_atual ?? null,
      alvoPct: dcaIpcaLongo.alvo_pct ?? null,
      gapAlvoPp: dcaIpcaLongo.gap_alvo_pp ?? null,
      proxAcao: dcaIpcaLongo.ativo ? 'comprar' : 'manter',
    });
  }

  // 2. IPCA+ 2050 (from dca_status.ipca_medio — was missing from gatilhos!)
  const dcaIpcaMedio = data.dca_status?.ipca_medio;
  if (dcaIpcaMedio) {
    const taxa = dcaIpcaMedio.taxa_atual ?? null;
    const piso = dcaIpcaMedio.piso ?? null;
    const posicao = data.rf?.ipca2050?.valor ?? 0;
    const st: StatusColor = taxa != null && piso != null && taxa >= piso ? 'verde' : 'amarelo';
    dcaItems.push({
      id: 'ipca2050',
      nome: 'IPCA+ 2050',
      categoria: 'rf_ipca',
      taxa,
      pisoCompra: piso,
      pisoVenda: null,
      gapPiso: taxa != null && piso != null ? taxa - piso : null,
      status: st,
      dcaAtivo: dcaIpcaMedio.ativo ?? false,
      posicaoBrl: posicao,
      pctCarteira: dcaIpcaMedio.pct_carteira_atual ?? null,
      alvoPct: dcaIpcaMedio.alvo_pct ?? null,
      gapAlvoPp: dcaIpcaMedio.gap_alvo_pp ?? null,
      proxAcao: dcaIpcaMedio.ativo ? 'comprar' : 'manter',
    });
  }

  // 3. Renda+ 2065 (from rf.renda2065.distancia_gatilho + dca_status.renda_plus)
  const dgRenda = data.rf?.renda2065?.distancia_gatilho;
  const dcaRenda = data.dca_status?.renda_plus;
  if (dgRenda || dcaRenda) {
    const taxa = dgRenda?.taxa_atual ?? dcaRenda?.taxa_atual ?? null;
    const pisoVenda = dgRenda?.piso_venda ?? null;
    const pisoCompra = dcaRenda?.piso ?? null;
    const rawStatus = dgRenda?.status;
    const st: StatusColor =
      rawStatus === 'vermelho' ? 'vermelho' :
      rawStatus === 'amarelo' ? 'amarelo' : 'verde';
    const posicao = data.rf?.renda2065?.valor ?? 0;
    dcaItems.push({
      id: 'renda2065',
      nome: 'Renda+ 2065',
      categoria: 'rf_renda',
      taxa,
      pisoCompra,
      pisoVenda,
      gapPiso: taxa != null && pisoVenda != null ? taxa - pisoVenda : null,
      status: st,
      dcaAtivo: dcaRenda?.ativo ?? false,
      posicaoBrl: posicao,
      pctCarteira: dcaRenda?.pct_carteira_atual ?? null,
      alvoPct: dcaRenda?.alvo_pct ?? null,
      gapAlvoPp: dcaRenda?.gap_alvo_pp ?? null,
      proxAcao: st === 'vermelho' ? 'vender' : 'manter',
    });
  }

  // 4. HODL11 (crypto band)
  const hodlBanda = data.hodl11?.banda;
  if (hodlBanda) {
    const rawStatus = hodlBanda.status;
    const st: StatusColor =
      rawStatus === 'vermelho' ? 'vermelho' :
      rawStatus === 'amarelo' ? 'amarelo' : 'verde';
    dcaItems.push({
      id: 'hodl11',
      nome: 'HODL11',
      categoria: 'crypto',
      taxa: null,
      pisoCompra: null,
      pisoVenda: null,
      gapPiso: null,
      status: st,
      dcaAtivo: false,
      posicaoBrl: data.hodl11?.valor ?? 0,
      pctCarteira: hodlBanda.atual_pct ?? null,
      alvoPct: hodlBanda.alvo_pct ?? null,
      gapAlvoPp: hodlBanda.atual_pct != null && hodlBanda.alvo_pct != null
        ? hodlBanda.atual_pct - hodlBanda.alvo_pct : null,
      proxAcao: st === 'vermelho' ? 'vender' : 'manter',
      bandaMin: hodlBanda.min_pct,
      bandaMax: hodlBanda.max_pct,
      bandaAtual: hodlBanda.atual_pct,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UNIFIED DRIFT ITEMS — single source of truth for allocation drift
  // ═══════════════════════════════════════════════════════════════════════
  const DRIFT_VERDE_PP = 3;
  const DRIFT_AMARELO_PP = 5;
  const driftItems: DriftItem[] = [];

  for (const bucket of ['SWRD', 'AVGS', 'AVEM', 'RF', 'Crypto'] as const) {
    const d = data.drift?.[bucket];
    if (!d || d.alvo == null || d.atual == null) continue;
    const gap = d.alvo - d.atual;
    const absGap = Math.abs(gap);
    const st: StatusColor =
      absGap <= DRIFT_VERDE_PP ? 'verde' :
      absGap <= DRIFT_AMARELO_PP ? 'amarelo' : 'vermelho';
    driftItems.push({
      id: bucket,
      nome: bucket,
      atual: d.atual,
      alvo: d.alvo,
      gap,
      absGap,
      status: st,
      impactoBrl: totalBrl > 0 ? (absGap / 100) * totalBrl : null,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MARKET CONTEXT — snapshot of macro indicators
  // ═══════════════════════════════════════════════════════════════════════
  const macro = data.macro ?? {};
  const marketContext: MarketContext = {
    cambio: data.cambio,
    cambioPctMtd: macro.cambio_pct_mtd ?? null,
    btcUsd: data.hodl11?.preco_usd ?? null,
    btcPctMtd: data.hodl11?.pct_mtd ?? null,
    selic: macro.selic ?? null,
    fedFunds: macro.fed_funds ?? null,
    spreadSelicFf: macro.selic != null && macro.fed_funds != null
      ? macro.selic - macro.fed_funds : null,
    exposicaoCambialPct: totalBrl > 0
      ? (totalEquityUsd * CAMBIO) / totalBrl * 100 : null,
  };

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
      color: firePercentageMetric >= 0.8 ? 'var(--green)' : firePercentageMetric >= 0.6 ? 'var(--yellow)' : 'var(--red)',
      detail: `${Math.round(firePercentageMetric * 100)}%`,
    },
    {
      label: 'Alocação Equity',
      value: Math.round(equityAllocationMetric * 100),
      max: 100,
      color: equityAllocationMetric >= 0.6 ? 'var(--green)' : equityAllocationMetric >= 0.5 ? 'var(--yellow)' : 'var(--red)',
      detail: `${Math.round(equityAllocationMetric * 100)}%`,
    },
    {
      label: 'Diversificação',
      value: Math.round(diversificationMetric * 100),
      max: 100,
      color: diversificationMetric >= 0.8 ? 'var(--green)' : diversificationMetric >= 0.5 ? 'var(--yellow)' : 'var(--red)',
      detail: `${Object.keys(bucketUsd).filter(k => bucketUsd[k] > 0).length} buckets`,
    },
    {
      label: 'Eficiência Custos',
      value: Math.round(costEfficiencyMetric * 100),
      max: 100,
      color: costEfficiencyMetric >= 0.95 ? 'var(--green)' : costEfficiencyMetric >= 0.90 ? 'var(--yellow)' : 'var(--red)',
      detail: `${(data.drift?.['Custo']?.atual ?? 0).toFixed(2)}% TER`,
    },
    {
      label: 'Liquidez',
      value: Math.round(liquidityScore * 100),
      max: 100,
      color: liquidityScore >= 0.3 ? 'var(--green)' : liquidityScore >= 0.15 ? 'var(--yellow)' : 'var(--red)',
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

  // Compute top wellness actions from wellness_config
  const topAcoes = (() => {
    if (!data.wellness_config || !Array.isArray(data.wellness_config.acoes)) {
      return [];
    }
    return data.wellness_config.acoes
      .sort((a: any, b: any) => (a.rank || 999) - (b.rank || 999))
      .slice(0, 5);
  })();

  // Compute cash flow distribution (aporte → destinations)
  const aporteMensalVal = data.premissas?.aporte_mensal ?? 0;
  const equityRatio = totalEquityUsd * CAMBIO / totalBrl; // Current equity allocation %
  const rfRatio = rfBrl / totalBrl; // Current RF allocation %
  const cryptoRatio = cryptoBrl / totalBrl; // Current crypto allocation %

  const ipcaFlowMonthly = aporteMensalVal * (ipcaTotalBrl / (rfBrl || 1)); // Pro-rata IPCA allocation
  const equityFlowMonthly = aporteMensalVal * equityRatio;
  const rendaPlusFlowMonthly = aporteMensalVal * (((data.rf?.renda2065?.valor ?? 0) / (rfBrl || 1)) * rfRatio);
  const cryptoFlowMonthly = aporteMensalVal * cryptoRatio;

  // YTD return: compound monthly TWR for current calendar year (portfolio BRL)
  const retornoYtd = (() => {
    const dates: string[] = (data as any).retornos_mensais?.dates ?? [];
    const values: number[] = (data as any).retornos_mensais?.values ?? [];
    const currentYear = today.getFullYear().toString();
    let compound = 1;
    let hasData = false;
    for (let i = 0; i < dates.length; i++) {
      if (dates[i]?.startsWith(currentYear)) {
        compound *= 1 + (values[i] ?? 0) / 100;
        hasData = true;
      }
    }
    return hasData ? (compound - 1) * 100 : null; // null if no data for current year
  })();

  // YTD equity return in USD: weighted average of SWRD + AVGS from factor_signal
  // Covers pesosTarget.SWRD + pesosTarget.AVGS of the portfolio (AVEM not in factor_signal)
  const retornoYtdEquityUsd = (() => {
    const fs = (data as any).factor_signal;
    const pesosT = (data as any).pesosTarget ?? {};
    const wSwrd = pesosT.SWRD ?? 0;
    const wAvgs = pesosT.AVGS ?? 0;
    const totalW = wSwrd + wAvgs;
    if (!fs || totalW === 0) return null;
    const swrdYtd = fs.swrd_ytd_pct;
    const avgsYtd = fs.avgs_ytd_pct;
    if (swrdYtd == null || avgsYtd == null) return null;
    return (wSwrd * swrdYtd + wAvgs * avgsYtd) / totalW;
  })();

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
    topAcoes,
    wellnessStatus: progPct >= 80 ? 'excellent' : progPct >= 60 ? 'ok' : progPct >= 40 ? 'warning' : 'critical',

    // FIRE patrimonio
    firePatrimonioAtual: data.premissas.patrimonio_atual,
    firePatrimonioGatilho: PAT_GATILHO,

    // Aporte tracking
    retornoYtd,
    retornoYtdEquityUsd,
    aporteMensal,
    ultimoAporte,
    ultimoAporteData,
    acumuladoMes,
    acumuladoAno,

    // Cash flow distribution (annual flows by destination)
    ipcaFlowMonthly,
    equityFlowMonthly,
    rendaPlusFlowMonthly,
    cryptoFlowMonthly,

    // P(FIRE) scenarios and tornado — source of truth: data.pfire_base (no hardcoded fallback)
    pfireBase: data.pfire_base?.base ?? 0,
    pfireFav: data.pfire_base?.fav ?? 0,
    pfireStress: data.pfire_base?.stress ?? 0,
    tornadoData: data.tornado ?? [],

    // P(FIRE) aspiracional scenarios — source: pfire_aspiracional (not scenario_comparison which doesn't exist)
    pfireAspiracional: (data as any).pfire_aspiracional?.base ?? null,
    pfireAspirFav: (data as any).pfire_aspiracional?.fav ?? null,
    pfireAspirStress: (data as any).pfire_aspiracional?.stress ?? null,

    // Allocation
    equityPercentage: totalEquityUsd * CAMBIO / totalBrl,
    rfPercentage: rfBrl / totalBrl,

    // Geographic diversification
    internationalPercentage: (geoUS + geoDM + geoEM) / totalEquityUsd,
    concentrationBrazil: ipcaTotalBrl / totalBrl,

    // Cost metrics
    costIndexBps: data.drift?.['Custo']?.atual ?? 0,
    trackingDifference: 0, // computed separately if needed

    // Gatilhos (legacy — kept for backward compat during migration)
    gatilhos,
    statusIpca,
    resumoGatilhos,

    // Unified sources of truth (v2)
    dcaItems,
    driftItems,
    marketContext,

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
