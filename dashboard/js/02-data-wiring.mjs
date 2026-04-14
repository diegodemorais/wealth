// ═══════════════════════════════════════════════════════════════
// DATA WIRING — Computed Values & Derived Globals
// ═══════════════════════════════════════════════════════════════

// Helper functions (private)
function _ymToDecimal(ym) {
  const [y, m] = ym.split('-').map(Number);
  return y + (m - 1) / 12;
}

function _fmtYearMonth(ym) {
  // ym = "YYYY-MM" → "mmm/AAAA" em pt-BR abreviado
  const [y, m] = ym.split('-');
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return months[parseInt(m,10)-1] + '/' + y;
}

/**
 * Initialize data wiring: compute all derived values from DATA.
 * Must be called AFTER DATA is injected into window.
 *
 * @param {Object} DATA - Dashboard data object (window.DATA)
 * @returns {Object} All computed constants
 */
export function initDataWiring(DATA) {
  // ═══════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════
  const CAMBIO = DATA.cambio;
  const PAT_GATILHO = DATA.premissas.patrimonio_gatilho;

  // Total equity USD
  let totalEquityUsd = 0;
  Object.values(DATA.posicoes).forEach(p => { totalEquityUsd += p.qty * p.price; });

  // Total BRL = equity + RF + crypto
  const rfBrl = (DATA.rf.ipca2029?.valor ?? 0) + (DATA.rf.ipca2040?.valor ?? 0) + (DATA.rf.ipca2050?.valor ?? 0) + (DATA.rf.renda2065?.valor ?? 0);
  // cryptoBrl: hodl11 + crypto legado (valor estimado guardado em DATA.cryptoLegado se disponível)
  const cryptoLegado = DATA.cryptoLegado ?? 3000; // fallback 3k se não disponível
  const cryptoBrl = DATA.hodl11.valor + cryptoLegado;
  const totalBrl = totalEquityUsd * CAMBIO + rfBrl + cryptoBrl;

  // C3 — IPCA drift: somar TODOS os títulos IPCA+ (2029 reserva + 2040 DCA + 2050 DCA)
  const ipcaTotalBrl = (DATA.rf.ipca2029?.valor ?? 0) + (DATA.rf.ipca2040?.valor ?? 0) + (DATA.rf.ipca2050?.valor ?? 0);
  DATA.drift['IPCA'].atual = +(ipcaTotalBrl / totalBrl * 100).toFixed(1);

  // Bucket values
  const bucketUsd = { SWRD: 0, AVGS: 0, AVEM: 0, JPGL: 0 };
  Object.entries(DATA.posicoes).forEach(([k, p]) => {
    bucketUsd[p.bucket] = (bucketUsd[p.bucket] || 0) + p.qty * p.price;
  });

  // Geo breakdown: SWRD×67% US + AVUV/USSC 100% US + AVDV 100% DM
  const swrdUsd = DATA.posicoes.SWRD.qty * DATA.posicoes.SWRD.price;
  const avuvUsd = DATA.posicoes.AVUV.qty * DATA.posicoes.AVUV.price;
  const avdvUsd = DATA.posicoes.AVDV.qty * DATA.posicoes.AVDV.price;
  const usscUsd = DATA.posicoes.USSC.qty * DATA.posicoes.USSC.price;
  const avgsUsd = DATA.posicoes.AVGS.qty * DATA.posicoes.AVGS.price;
  const avemUsd = (DATA.posicoes.EIMI.qty * DATA.posicoes.EIMI.price) + (DATA.posicoes.AVES.qty * DATA.posicoes.AVES.price) + (DATA.posicoes.DGS.qty * DATA.posicoes.DGS.price);
  const iwvlUsd = DATA.posicoes.IWVL.qty * DATA.posicoes.IWVL.price;
  const geoUS = swrdUsd * 0.67 + avuvUsd + usscUsd + avgsUsd * 0.58; // AVGS ~58% US (AVUV/AVDV blend)
  const geoDM = swrdUsd * 0.33 + avdvUsd + avgsUsd * 0.42 + iwvlUsd;
  const geoEM = avemUsd;

  // CAGR da série histórica completa (inclui aportes — usado para attribution apenas, D2)
  const patInicio = DATA.timeline.values[0];
  const patFim = DATA.timeline.values[DATA.timeline.values.length - 1];
  // Calcular anos a partir das datas reais da série (não hardcoded)
  const _tStart = DATA.timeline.labels.length ? _ymToDecimal(DATA.timeline.labels[0]) : 2021.25;
  const _tEnd   = DATA.timeline.labels.length ? _ymToDecimal(DATA.timeline.labels[DATA.timeline.labels.length-1]) : 2026.25;
  const anos = _tEnd - _tStart;
  const cagr = anos > 0 && patInicio > 0 ? (Math.pow(patFim / patInicio, 1/anos) - 1) * 100 : 0;

  // D1 — CAGR Backtest Target (não é TWR real — sem fluxos reais de aportes/retiradas)
  // CAGR_USD: derivado de DATA.backtest.metrics.target.cagr (backtest_portfolio.py)
  const TWR_USD = DATA.backtest?.metrics?.target?.cagr ?? 12.88;
  // Período do backtest R3 — derivado dinamicamente das datas reais da série
  const _btDates = DATA.backtest.dates;
  const _btFirstDate = _btDates[0]; // ex: "2019-08"
  const _btLastDate  = _btDates[_btDates.length - 1]; // ex: "2026-04"
  const _btPeriodStr = _fmtYearMonth(_btFirstDate) + '–' + _fmtYearMonth(_btLastDate);
  // CAGR_BRL: CAGR_USD + contribuição cambial estimada desde início do backtest R3
  // cambioInicio vem de DATA (configurado no backtest_portfolio.py) ou fallback para estimativa
  const cambioInicio = DATA.backtest?.cambioInicio ?? 3.79; // câmbio no início do período do backtest
  const cambioFim = DATA.cambio;
  // anosCambio derivado das datas reais do backtest
  const anosCambio = _btDates && _btDates.length > 1
    ? _ymToDecimal(_btDates[_btDates.length-1]) - _ymToDecimal(_btDates[0])
    : 6.75;
  const fx_contrib_anual = anosCambio > 0 ? (Math.pow(cambioFim / cambioInicio, 1 / anosCambio) - 1) * 100 : 0;
  // CAGR_BRL = (1 + CAGR_USD/100) * (1 + fx_contrib/100) - 1, em %/ano
  const TWR_BRL = ((1 + TWR_USD/100) * (1 + fx_contrib_anual/100) - 1) * 100;

  // Progress FIRE
  const progPct = (DATA.premissas.patrimonio_atual / PAT_GATILHO) * 100;

  // SWR no FIRE Day projetada
  const swrFireDay = DATA.premissas.custo_vida_base / PAT_GATILHO;

  // Years to FIRE — data derivada de premissas (idade_cenario_base + idade_atual + ano atual)
  const today = new Date(DATA.date);
  // Anos FIRE alvo e aspiracional (module-level, usados por múltiplas funções)
  const _anoFireAlvoGlobal = today.getFullYear() + (DATA.premissas.idade_cenario_base - DATA.premissas.idade_atual);
  const _anoFireAspir = today.getFullYear() + ((DATA.premissas.idade_cenario_aspiracional ?? 50) - DATA.premissas.idade_atual);

  // Update DOM footer elements (side effects)
  const _footerDate = document.getElementById('footerDate');
  if (_footerDate && DATA.date) {
    const _d = new Date(DATA.date);
    _footerDate.textContent = `${String(_d.getDate()).padStart(2,'0')}/${String(_d.getMonth()+1).padStart(2,'0')}/${_d.getFullYear()}`;
  }

  // Nudge de frequência mensal — próxima consulta sugerida +30 dias
  const _nudgeEl = document.getElementById('footerNudge');
  if (_nudgeEl && DATA.date) {
    const _nd = new Date(DATA.date);
    _nd.setDate(_nd.getDate() + 30);
    const _meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    _nudgeEl.textContent = `Próxima consulta sugerida: ${String(_nd.getDate()).padStart(2,'0')}/${_meses[_nd.getMonth()]}/${_nd.getFullYear()}`;
  }

  const _anoFire = today.getFullYear() + (DATA.premissas.idade_cenario_base - DATA.premissas.idade_atual);
  const fireDate = new Date(`${_anoFire}-01-01`);
  const msLeft = fireDate - today;
  const yearsLeft = msLeft / (1000 * 60 * 60 * 24 * 365.25);
  const yrInt = Math.floor(yearsLeft);
  const moInt = Math.round((yearsLeft - yrInt) * 12);
  if (window.addDebugLog) window.addDebugLog(`[02-data-wiring] yrInt=${yrInt}, moInt=${moInt}, yearsLeft=${yearsLeft.toFixed(2)}`);

  // Return all computed constants
  return {
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
    fireDate,
    msLeft,
    yearsLeft,
    yrInt,
    moInt,
    _ymToDecimal,
    _btPeriodStr,
    cambioInicio,
    cambioFim,
    anosCambio,
    fx_contrib_anual,
  };
}
