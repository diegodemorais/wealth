// ═══════════════════════════════════════════════════════════════
// BOOTSTRAP — ES6 Module Orchestration
// ═══════════════════════════════════════════════════════════════

import { initFouc } from './js/01-preamble.mjs';
import { initDataWiring } from './js/02-data-wiring.mjs';
import * as utils from './js/03-utils.mjs';
import * as chartsPortfolio from './js/04-charts-portfolio.mjs';
import * as fireProj from './js/05-fire-projections.mjs';
import * as dashboardRender from './js/06-dashboard-render.mjs';
import * as initTabs from './js/07-init-tabs.mjs';

// ═══════════════════════════════════════════════════════════════
// PHASE 1: FOUC Guard (synchronous, before DOM render)
// ═══════════════════════════════════════════════════════════════
console.log('[BOOTSTRAP] Phase 1: FOUC Guard');
if (window.addDebugLog) window.addDebugLog('Phase 1: FOUC Guard');
initFouc();
console.log('[BOOTSTRAP] Phase 1 complete');
if (window.addDebugLog) window.addDebugLog('✓ Phase 1 complete');

// ═══════════════════════════════════════════════════════════════
// PHASE 2: Data Wiring (assumes window.DATA is already injected)
// ═══════════════════════════════════════════════════════════════
console.log('[BOOTSTRAP] Phase 2: Data Wiring — checking window.DATA...');
if (window.addDebugLog) window.addDebugLog(`Phase 2: DATA=${typeof window.DATA}`);
if (!window.DATA) {
  console.error('Bootstrap: window.DATA not found. Ensure DATA is injected before this module loads.');
  if (window.addDebugLog) window.addDebugLog('❌ Phase 2 FAILED: window.DATA missing');
} else {
  console.log('[BOOTSTRAP] Phase 2: DATA found, initializing data wiring...');
  if (window.addDebugLog) window.addDebugLog('✓ DATA found, calling initDataWiring()');
  // Initialize data wiring (computes all derived values)
  let dataDerived;
  try {
    dataDerived = initDataWiring(window.DATA);
    console.log('[BOOTSTRAP] Phase 2: Data wiring complete, exposing to window...');
    if (window.addDebugLog) window.addDebugLog(`✓ initDataWiring() returned ${Object.keys(dataDerived).length} keys`);
  } catch (e) {
    console.error('[BOOTSTRAP] Phase 2 ERROR in initDataWiring:', e.message, e.stack);
    if (window.addDebugLog) window.addDebugLog(`❌ initDataWiring() ERROR: ${e.message}`);
    throw e;
  }

  // Expose to window for backward compatibility (legacy code expects globals)
  Object.assign(window, {
    // From 02-data-wiring
    CAMBIO: dataDerived.CAMBIO,
    PAT_GATILHO: dataDerived.PAT_GATILHO,
    totalEquityUsd: dataDerived.totalEquityUsd,
    totalBrl: dataDerived.totalBrl,
    bucketUsd: dataDerived.bucketUsd,
    geoUS: dataDerived.geoUS,
    geoDM: dataDerived.geoDM,
    geoEM: dataDerived.geoEM,
    cagr: dataDerived.cagr,
    TWR_USD: dataDerived.TWR_USD,
    TWR_BRL: dataDerived.TWR_BRL,
    progPct: dataDerived.progPct,
    today: dataDerived.today,
    yrInt: dataDerived.yrInt,
    moInt: dataDerived.moInt,
    _anoFireAlvoGlobal: dataDerived._anoFireAlvoGlobal,
    _anoFireAspir: dataDerived._anoFireAspir,
    _ymToDecimal: dataDerived._ymToDecimal,

    // From 03-utils
    calcWellness: utils.calcWellness,
    wellnessActions: utils.wellnessActions,
    fmtBrl: utils.fmtBrl,
    fmtBrl2: utils.fmtBrl2,
    fmtUsd: utils.fmtUsd,
    fmtPct: utils.fmtPct,
    colorPct: utils.colorPct,
    filterByPeriod: utils.filterByPeriod,
    checkMinPoints: utils.checkMinPoints,
    setActivePeriodBtn: utils.setActivePeriodBtn,
    fmtMonthLabel: utils.fmtMonthLabel,
    fmtMonthTick: utils.fmtMonthTick,
    charts: utils.charts,

    // From 04-charts-portfolio (main builders)
    buildTimeline: chartsPortfolio.buildTimeline,
    buildAttribution: chartsPortfolio.buildAttribution,
    buildDonuts: chartsPortfolio.buildDonuts,
    buildFanChart: chartsPortfolio.buildFanChart,
    buildBacktest: chartsPortfolio.buildBacktest,
    buildGlidePath: chartsPortfolio.buildGlidePath,
    buildRollingStats: chartsPortfolio.buildRollingStats,
    buildHeatmap: chartsPortfolio.buildHeatmap,
    buildScatterPlot: chartsPortfolio.buildScatterPlot,
    buildPerformanceTable: chartsPortfolio.buildPerformanceTable,
    buildWealthChart: chartsPortfolio.buildWealthChart,
    buildRollingCorrelation: chartsPortfolio.buildRollingCorrelation,
    buildFactorLoadings: chartsPortfolio.buildFactorLoadings,
    buildTrackingFire: chartsPortfolio.buildTrackingFire,

    // From 05-fire-projections (FIRE/MC)
    buildEarliestFire: fireProj.buildEarliestFire,
    buildNetWorthProjection: fireProj.buildNetWorthProjection,
    buildStressTest: fireProj.buildStressTest,
    buildStressFanChart: fireProj.buildStressFanChart,
    runMC: fireProj.runMC,
    runMCTrajectories: fireProj.runMCTrajectories,

    // From 06-dashboard-render
    renderKPIs: dashboardRender.renderKPIs,
    renderWellness: dashboardRender.renderWellness,
    renderProximasAcoes: dashboardRender.renderProximasAcoes,
    renderIpcaProgress: dashboardRender.renderIpcaProgress,
    buildSankey: dashboardRender.buildSankey,
    buildWellnessExtras: dashboardRender.buildWellnessExtras,
    buildRfCards: dashboardRender.buildRfCards,
    buildShadowTable: dashboardRender.buildShadowTable,
    buildIncomeTable: dashboardRender.buildIncomeTable,

    // From 07-init-tabs
    renderMacroStatus: initTabs.renderMacroStatus,
    buildBrasilConcentracao: initTabs.buildBrasilConcentracao,
    buildMacroCards: initTabs.buildMacroCards,
    buildDcaStatus: initTabs.buildDcaStatus,
    buildSemaforoPanel: initTabs.buildSemaforoPanel,
    _initTabCharts: initTabs._initTabCharts,
    switchTab: initTabs.switchTab,
    _applyPrivacyCharts: initTabs._applyPrivacyCharts,
    init: initTabs.init,
    GENERATED_AT: initTabs.GENERATED_AT,
    VERSION: initTabs.VERSION,
  });
  const fnCount = Object.keys(window).filter(k => k.startsWith('build') || k === 'renderKPIs').length;
  console.log('[BOOTSTRAP] Phase 2 complete — window object populated with', fnCount, 'functions');
  if (window.addDebugLog) window.addDebugLog(`✓ Phase 2 complete: ${fnCount} functions exposed`);
}

// ═══════════════════════════════════════════════════════════════
// PHASE 3: DOM Ready — Run initialization
// ═══════════════════════════════════════════════════════════════
console.log('[BOOTSTRAP] Phase 3: DOM Ready — document.readyState =', document.readyState);
if (window.addDebugLog) window.addDebugLog(`Phase 3: DOM ready=${document.readyState}, init=${typeof window.init}`);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[BOOTSTRAP] Phase 3: DOMContentLoaded fired, calling window.init()');
    if (window.addDebugLog) window.addDebugLog('Phase 3: DOMContentLoaded, calling init()');
    if (window.init) {
      try {
        window.init();
        if (window.addDebugLog) window.addDebugLog('✓ Phase 3 complete: init() succeeded');
      } catch (e) {
        if (window.addDebugLog) window.addDebugLog(`❌ Phase 3 ERROR: init() threw: ${e.message}`);
      }
    }
    else {
      console.error('[BOOTSTRAP] Phase 3 ERROR: window.init not found!');
      if (window.addDebugLog) window.addDebugLog('❌ Phase 3 ERROR: window.init not found');
    }
  });
} else {
  // DOM already loaded (script was deferred)
  console.log('[BOOTSTRAP] Phase 3: DOM already loaded, calling window.init()');
  if (window.addDebugLog) window.addDebugLog('Phase 3: DOM already loaded, calling init()');
  if (window.init) {
    try {
      window.init();
      if (window.addDebugLog) window.addDebugLog('✓ Phase 3 complete: init() succeeded');
    } catch (e) {
      if (window.addDebugLog) window.addDebugLog(`❌ Phase 3 ERROR: init() threw: ${e.message}`);
    }
  }
  else {
    console.error('[BOOTSTRAP] Phase 3 ERROR: window.init not found!');
    if (window.addDebugLog) window.addDebugLog('❌ Phase 3 ERROR: window.init not found');
  }
}

// ═══════════════════════════════════════════════════════════════
// PHASE 4: Export for other modules (if needed)
// ═══════════════════════════════════════════════════════════════
console.log('[BOOTSTRAP] Phase 4: Exports available for other modules');

// Log all loaded functions for debugging
const loadedFunctions = [
  'renderKPIs', 'buildSankey', 'buildWellnessExtras', 'buildRfCards', 'buildShadowTable', 'buildIncomeTable',
  'buildTimeline', 'buildAttribution', 'buildDonuts', 'buildFanChart', 'buildBacktest', 'buildGlidePath',
  'buildRollingStats', 'buildHeatmap', 'buildScatterPlot', 'buildPerformanceTable', 'buildWealthChart',
  'buildRollingCorrelation', 'buildFactorLoadings', 'buildTrackingFire',
  'buildEarliestFire', 'buildNetWorthProjection', 'buildStressTest', 'buildStressFanChart', 'runMC', 'runMCTrajectories'
];
const actualFunctions = loadedFunctions.filter(name => typeof window[name] === 'function');
console.log('[BOOTSTRAP] Phase 4 complete — loaded', actualFunctions.length, 'functions:', actualFunctions.slice(0, 5).join(', '), '...');

export {
  initFouc,
  initDataWiring,
  utils,
  chartsPortfolio,
  fireProj,
  dashboardRender,
  initTabs,
};
