/**
 * ═══════════════════════════════════════════════════════════════
 * 08-missing-builders.mjs — Stub Implementations (31 builders)
 * ═══════════════════════════════════════════════════════════════
 *
 * These are placeholder builders to fill empty components.
 * Each uses correct HTML IDs from spec_html_mapping.
 * Format: function buildX() { el.innerHTML = [...] }
 */

function _buildPlaceholder(elementId, title) {
  const el = document.getElementById(elementId);
  if (!el) {
    console.warn(`[stub-builder] Element not found: ${elementId}`);
    return;
  }
  el.innerHTML = `<div style="padding:20px;background:#f5f5f5;border-radius:6px;color:#888;text-align:center;font-size:.9rem;border:1px solid #ddd">
    <div style="font-weight:600;margin-bottom:8px">${title}</div>
    <div style="font-size:.85rem">Em desenvolvimento…</div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// HOJE Tab — using correct HTML IDs
// ─────────────────────────────────────────────────────────────

export function buildTornadoSensitivity() {
  _buildPlaceholder('tornadoChart', 'Sensibilidade Tornado');
}

export function buildIpcaDcaSemaforo() {
  _buildPlaceholder('kpiIpcaSemaforo', 'Status IPCA+ DCA');
}

export function buildRendaPlusSemaforo() {
  _buildPlaceholder('kpiRendaSemaforo', 'Status Renda+ 2065');
}

export function buildKpiGridPrimario() {
  _buildPlaceholder('kpiGridPrimario', 'KPI Grid Primário');
}

export function buildWellnessScore() {
  _buildPlaceholder('wellnessScore', 'Wellness Score');
}

// ─────────────────────────────────────────────────────────────
// PERF Tab
// ─────────────────────────────────────────────────────────────

export function buildEvolucaoCarteira() {
  _buildPlaceholder('timelineChart', 'Evolução Carteira');
}

export function buildFactorLoadingsChart() {
  _buildPlaceholder('factorLoadingsChart', 'Factor Loadings');
}

export function buildFactorRollingAvgs() {
  _buildPlaceholder('factorRollingBody', 'Factor Rolling 12m');
}

export function buildRetornoDecomposicao() {
  _buildPlaceholder('simRetorno', 'Decomposição Retorno');
}

export function buildFeeCustoComplexidade() {
  _buildPlaceholder('feeBody', 'Fee + Custo Complexidade');
}

export function buildHeatmapRetornos() {
  _buildPlaceholder('heatmapContainer', 'Heatmap Retornos');
}

export function buildInformationRatioChart() {
  _buildPlaceholder('rollingIRChart', 'Information Ratio');
}

// ─────────────────────────────────────────────────────────────
// BACKTEST Tab
// ─────────────────────────────────────────────────────────────

export function buildBacktestMetricas() {
  _buildPlaceholder('backtestChart', 'Métricas Backtest');
}

export function buildBacktestRegimeLongo() {
  _buildPlaceholder('backtestRegimeLongo', 'Backtest Regime Longo');
}

export function buildDrawdownHistoricoChart() {
  _buildPlaceholder('drawdownHistChart', 'Drawdown Histórico');
}

export function buildShadowPortfolios() {
  _buildPlaceholder('shadowChart', 'Shadow Portfolios');
}

// ─────────────────────────────────────────────────────────────
// FIRE Tab
// ─────────────────────────────────────────────────────────────

export function buildFireTrilha() {
  _buildPlaceholder('fireTrilha', 'FIRE Trilha');
}

export function buildGlidePathChart() {
  _buildPlaceholder('glideChart', 'Glide Path');
}

export function buildLumpyEventsChart() {
  _buildPlaceholder('lumpyEventsBody', 'Lumpy Events');
}

export function buildSimuladorFire() {
  _buildPlaceholder('simuladorFire', 'Simulador FIRE');
}

export function buildWhatIfCenarios() {
  _buildPlaceholder('whatIfCenarios', 'What-If Cenários');
}

// ─────────────────────────────────────────────────────────────
// CARTEIRA Tab
// ─────────────────────────────────────────────────────────────

export function buildCustoBaseBucket() {
  _buildPlaceholder('custoBaseBody', 'Custo Base por Bucket');
}

export function buildEtfComposicaoRegiao() {
  _buildPlaceholder('etfComposicaoRegiao', 'Composição ETF Região');
}

export function buildGeoDonut() {
  _buildPlaceholder('geoDonut', 'Geo Donut');
}

export function buildIntraEquityPesos() {
  _buildPlaceholder('intraEquityPesos', 'Pesos Intra-Equity');
}

export function buildMinilogChart() {
  _buildPlaceholder('minilogBody', 'Mini-log Operações');
}

export function buildPosicoesEtfsIbkr() {
  _buildPlaceholder('posicoesEtfsIbkr', 'Posições IBKR');
}

export function buildRfPosicoes() {
  _buildPlaceholder('rfPosicoes', 'Posições RF');
}

export function buildTlhMonitor() {
  _buildPlaceholder('tlhMonitor', 'TLH Monitor');
}

// ─────────────────────────────────────────────────────────────
// RETIRO Tab
// ─────────────────────────────────────────────────────────────

export function buildBondPoolRunwayChart() {
  _buildPlaceholder('bondPoolRunwayChart', 'Bond Pool Runway');
}

export function buildIncomeLifecycle() {
  _buildPlaceholder('incomeProjectionChart', 'Income Lifecycle');
}

export function buildSpendingBreakdownChart() {
  _buildPlaceholder('spendingChart', 'Spending Breakdown');
}

// ─────────────────────────────────────────────────────────────
// SIMULADORES Tab
// ─────────────────────────────────────────────────────────────

export function buildCalcAporteChart() {
  _buildPlaceholder('calcAporte', 'Calculadora Aporte');
}

export function buildStressTestMc() {
  _buildPlaceholder('stressShockSlider', 'Stress Test MC');
}
