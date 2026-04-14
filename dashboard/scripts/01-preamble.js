// ═══════════════════════════════════════════════════════════════
// PREAMBLE — FOUC Guard + Type Definitions
// ═══════════════════════════════════════════════════════════════

// Prevent flash of unstyled content (FOUC): hide non-"hoje" tabs immediately
// This runs synchronously before DOM render
(() => {
  const style = document.createElement('style');
  style.textContent = `
    #aba-carteira, #aba-perf, #aba-fire, #aba-retiro, 
    #aba-simuladores, #aba-backtest { display: none !important; }
  `;
  document.head.appendChild(style);
})();

// @ts-check

/**
 * @typedef {Object} PfireScenario
 * @property {number} [base] P(FIRE) — base case
 * @property {number} [fav] P(FIRE) — favorable case
 * @property {number} [stress] P(FIRE) — stress case
 */

/**
 * @typedef {Object} MonteCarloScenario
 * @property {number} [pat_mediano] Patrimônio P50
 * @property {number} [pat_p10] Patrimônio P10
 * @property {number} [pat_p90] Patrimônio P90
 */

/**
 * @typedef {Object} DashboardData
 * @property {string} [_generated]
 * @property {Object} [premissas]
 * @property {Object} [pfire_base] P(FIRE) for age 53 scenario
 * @property {Object} [pfire_aspiracional] P(FIRE) for age 49 scenario
 * @property {Object} [scenario_comparison] Comparison table data
 * @property {Object} [patrimonio_timeline] Net worth history
 * @property {Object} [retornos] Performance returns
 * @property {Object} [fire_matrix] FIRE decision matrix
 */
