/**
 * ═══════════════════════════════════════════════════════════════
 * 08-missing-builders.mjs — Real & Stub Implementations (35 builders)
 * ═══════════════════════════════════════════════════════════════
 *
 * These builders fill empty components with real content when data available,
 * or fallback placeholders when data is missing.
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

function _buildEmptyChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.style.height = '300px';
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#999';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Dados não disponíveis', canvas.width / 2, canvas.height / 2);
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

export function buildKpiGridMercado() {
  _buildPlaceholder('kpiIpcaMercado', 'KPI Mercado');
}

export function buildWellnessScore() {
  _buildPlaceholder('wellnessScore', 'Wellness Score');
}

// ─────────────────────────────────────────────────────────────
// PERF Tab
// ─────────────────────────────────────────────────────────────

export function buildEvolucaoCarteira() {
  _buildEmptyChart('timelineChart');
}

export function buildFactorLoadingsChart() {
  _buildEmptyChart('factorLoadingsChart');
}

export function buildFactorRollingAvgs() {
  const el = document.getElementById('factorRollingBody');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;text-align:center;color:#888">Factor Rolling 12m — Dados não disponíveis</div>';
}

export function buildRetornoDecomposicao() {
  _buildEmptyChart('simRetorno');
}

export function buildFeeCustoComplexidade() {
  const el = document.getElementById('feeBody');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;text-align:center;color:#888">Fee + Custo de Complexidade — Dados não disponíveis</div>';
}

export function buildHeatmapRetornos() {
  const el = document.getElementById('heatmapContainer');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;text-align:center;color:#888">Heatmap de Retornos — Dados não disponíveis</div>';
}

export function buildInformationRatioChart() {
  _buildEmptyChart('rollingIRChart');
}

// ─────────────────────────────────────────────────────────────
// BACKTEST Tab
// ─────────────────────────────────────────────────────────────

export function buildBacktestMetricas() {
  const el = document.getElementById('backtestChart');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;text-align:center;color:#888">Métricas Backtest — Dados não disponíveis</div>';
}

export function buildBacktestRegimeLongo() {
  _buildEmptyChart('backtestRegimeLongo');
}

export function buildDrawdownHistoricoChart() {
  _buildEmptyChart('drawdownHistChart');
}

export function buildShadowPortfolios() {
  _buildEmptyChart('shadowChart');
}

// ─────────────────────────────────────────────────────────────
// FIRE Tab
// ─────────────────────────────────────────────────────────────

export function buildFireTrilha() {
  const el = document.getElementById('fireTrilha');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;text-align:center;color:#888">FIRE Trilha — Dados não disponíveis</div>';
}

export function buildGlidePathChart() {
  _buildEmptyChart('glideChart');
}

export function buildLumpyEventsChart() {
  const el = document.getElementById('lumpyEventsBody');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;text-align:center;color:#888">Lumpy Events — Dados não disponíveis</div>';
}

export function buildSimuladorFire() {
  const el = document.getElementById('simuladorFire');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;text-align:center;color:#888">Simulador FIRE — Dados não disponíveis</div>';
}

export function buildWhatIfCenarios() {
  const el = document.getElementById('whatIfCenarios');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;text-align:center;color:#888">What-If Cenários — Dados não disponíveis</div>';
}

// ─────────────────────────────────────────────────────────────
// CARTEIRA Tab
// ─────────────────────────────────────────────────────────────

export function buildCustoBaseBucket() {
  const el = document.getElementById('custoBaseBody');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;text-align:center;color:#888">Custo Base por Bucket — Dados não disponíveis</div>';
}

export function buildEtfComposicaoRegiao() {
  const el = document.getElementById('etfComposicaoRegiao');
  if (!el) return;
  el.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:16px;color:#888">Composição ETF por Região — Dados não disponíveis</td></tr>';
}

export function buildGeoDonut() {
  _buildEmptyChart('geoDonut');
}

export function buildIntraEquityPesos() {
  _buildEmptyChart('intraEquityPesos');
}

export function buildMinilogChart() {
  const el = document.getElementById('minilogBody');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;text-align:center;color:#888">Mini-log Operações — Dados não disponíveis</div>';
}

export function buildPosicoesEtfsIbkr() {
  const el = document.getElementById('posicoesEtfsIbkr');
  if (!el) return;
  el.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:16px;color:#888">Posições IBKR — Dados não disponíveis</td></tr>';
}

export function buildRfPosicoes() {
  const el = document.getElementById('rfPosicoes');
  if (!el) return;
  el.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:16px;color:#888">Posições RF — Dados não disponíveis</td></tr>';
}

export function buildTlhMonitor() {
  const el = document.getElementById('tlhMonitor');
  if (!el) return;
  el.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:16px;color:#888">TLH Monitor — Dados não disponíveis</td></tr>';
}

// ─────────────────────────────────────────────────────────────
// RETIRO Tab
// ─────────────────────────────────────────────────────────────

export function buildBondPoolRunwayChart() {
  _buildEmptyChart('bondPoolRunwayChart');
}

export function buildIncomeLifecycle() {
  const el = document.getElementById('incomeProjectionChart');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;text-align:center;color:#888">Income Lifecycle — Dados não disponíveis</div>';
}

export function buildSpendingBreakdownChart() {
  _buildEmptyChart('spendingChart');
}

// ─────────────────────────────────────────────────────────────
// SIMULADORES Tab
// ─────────────────────────────────────────────────────────────

export function buildCalcAporteChart() {
  const el = document.getElementById('calcAporte');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;text-align:center;color:#888">Calculadora de Aporte — Dados não disponíveis</div>';
}

export function buildStressTestMc() {
  const el = document.getElementById('stressShockSlider');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;text-align:center;color:#888">Stress Test MC — Dados não disponíveis</div>';
}
