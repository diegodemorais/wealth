// ═══════════════════════════════════════════════════════════════
// NOTES — Function references accessed from window at runtime
// ═══════════════════════════════════════════════════════════════
// Functions are NOT destructured at module load time because bootstrap.mjs
// populates window AFTER importing this module. Instead, functions are accessed
// via window.* inside _initTabCharts() at runtime, when bootstrap has finished setup.

// ═══════════════════════════════════════════════════════════════
// RUNTIME ASSERTIONS
// ═══════════════════════════════════════════════════════════════
// Staleness banner
if (Date.now() - GENERATED_AT > 7*86400000) {
  document.querySelector('.header').insertAdjacentHTML('beforeend',
    '<div style="background:#ef4444;color:white;padding:6px;border-radius:6px;margin-top:8px;font-size:.8rem">⚠️ Dashboard desatualizado — rebuild necessário</div>');
}
// Attribution closure check (quando disponível)
if (DATA.attribution && DATA.attribution.retornoUsd != null && DATA.attribution.cambio != null) {
  const attrSum = DATA.attribution.aportes + DATA.attribution.retornoUsd + DATA.attribution.cambio;
  const crescReal = DATA.attribution.crescReal;
  if (crescReal > 0) {
    console.assert(Math.abs(attrSum - crescReal) / crescReal < 0.05,
      `Attribution não fecha: ${attrSum} vs ${crescReal} — gap ${((Math.abs(attrSum-crescReal)/crescReal)*100).toFixed(1)}%`);
  }
}

// ═══════════════════════════════════════════════════════════════
// LIVE FETCH PTAX
// ═══════════════════════════════════════════════════════════════
async function fetchLive() {
  try {
    const today = new Date().toISOString().slice(0,10).replace(/-/g,'/');
    const r = await fetch(`https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@d)?@d=%27${today}%27&$format=json`);
    if (r.ok) {
      const j = await r.json();
      if (j.value && j.value.length) {
        const ptax = j.value[j.value.length-1].cotacaoVenda;
        DATA.cambio = ptax;
      }
    }
  } catch(e) {}
}
fetchLive();

// Render generation timestamp + version in header
(function() {
  const el = document.getElementById('headerGenerated');
  if (!el) return;
  const opts = { timeZone: 'America/Sao_Paulo', day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' };
  const formatted = GENERATED_AT.toLocaleString('pt-BR', opts).replace(',', '');
  const ver = (typeof VERSION !== 'undefined') ? '[v' + VERSION + '] ' : '';
  el.textContent = ver + 'Gerado em ' + formatted + ' BRT';
})();

// ═══════════════════════════════════════════════════════════════
// PRIVACY TOGGLE — única implementação (fim do body)
// ═══════════════════════════════════════════════════════════════
// ── Fase 3: ocultar escala Y de charts com valores absolutos ──
export function _applyPrivacyCharts(isPrivate) {
  // Charts com eixo Y em R$ absoluto — ocultar ticks em modo privado
  const absCharts = ['timeline', 'fan', 'netWorth', 'income', 'incomeProjection', 'stressProjection', 'bondPoolRunway'];
  absCharts.forEach(name => {
    const c = charts[name];
    if (!c) return;
    try {
      const sc = c.options.scales;
      if (sc?.y) {
        sc.y.ticks = sc.y.ticks || {};
        sc.y.ticks.display = !isPrivate;
        if (sc.y.title) sc.y.title.display = !isPrivate;
      }
      // Tooltip: em privado, desabilitar para charts com valores absolutos
      if (c.options.plugins?.tooltip) {
        c.options.plugins.tooltip.enabled = !isPrivate;
      }
      c.update('none');
    } catch(e) { /* chart ainda não inicializado */ }
  });
  // Attribution bar: é horizontal (indexAxis:'y'), então X é o eixo de valores em R$
  if (charts.attr) {
    try {
      const sc = charts.attr.options.scales;
      if (sc?.x) { sc.x.ticks = sc.x.ticks || {}; sc.x.ticks.display = !isPrivate; }
      if (charts.attr.options.plugins?.tooltip) charts.attr.options.plugins.tooltip.enabled = !isPrivate;
      charts.attr.update('none');
    } catch(e) {}
  }
  // Income chart: Y axis mostra R$k — ocultar em privado
  if (charts.income) {
    try {
      const sc = charts.income.options.scales;
      if (sc?.y) { sc.y.ticks = sc.y.ticks || {}; sc.y.ticks.display = !isPrivate; }
      if (charts.income.options.plugins?.tooltip) charts.income.options.plugins.tooltip.enabled = !isPrivate;
      charts.income.update('none');
    } catch(e) {}
  }
  // TrackingFire chart: Y axis mostra R$M — ocultar em privado
  if (charts.trackingFire) {
    try {
      const sc = charts.trackingFire.options.scales;
      if (sc?.y) { sc.y.ticks = sc.y.ticks || {}; sc.y.ticks.display = !isPrivate; }
      charts.trackingFire.update('none');
    } catch(e) {}
  }
  // Sankey: ocultar seção inteira em modo privado (fluxos em R$/ano revelam renda)
  const _sankeyWrap = document.getElementById('sankeySection');
  if (_sankeyWrap) _sankeyWrap.style.display = isPrivate ? 'none' : '';
  // Heatmap: re-renderizar com/sem spans .pv (a função lê o estado do body)
  if (document.getElementById('heatmapContainer')?.innerHTML) buildRetornoHeatmap();
  // Spending guardrails: re-renderizar (função checa privacy internamente)
  if (document.getElementById('spendingGuardrailsViz')?.innerHTML) buildSpendingGuardrails();
  // Fire scenario grid: re-renderizar (função lê privacy state no momento do render)
  if (document.getElementById('fireScenarioGrid')?.children.length) buildScenarios();
  // Sliders (Fase 4): em private mode, resetar para centro do range — posição revela valor
  const _sliders = [
    { id: 'simAporte',       numId: 'simAporteVal' },
    { id: 'simRetorno',      numId: 'simRetornoVal' },
    { id: 'simCusto',        numId: 'simCustoVal' },
    { id: 'wiCusto',         numId: 'wiCustoVal' },
    { id: 'stressShockSlider', numId: 'stressShockLabel' },
  ];
  _sliders.forEach(({ id, numId }) => {
    const sl = document.getElementById(id);
    if (!sl) return;
    const lbl = document.getElementById(numId);
    if (isPrivate) {
      const mid = Math.round((+sl.min + +sl.max) / 2 / +sl.step) * +sl.step;
      sl.dataset.pvOriginal = sl.value;
      sl.value = mid;
      // label já tem class="pv" → CSS exibe ••••; apenas preservar conteúdo original
      if (lbl) lbl.dataset.pvOriginal = lbl.textContent;
    } else {
      if (sl.dataset.pvOriginal !== undefined) {
        sl.value = sl.dataset.pvOriginal;
        delete sl.dataset.pvOriginal;
      }
      if (lbl && lbl.dataset.pvOriginal !== undefined) {
        lbl.textContent = lbl.dataset.pvOriginal;
        delete lbl.dataset.pvOriginal;
      }
    }
  });
  // Calculadora de aporte: em private mode, substituir valor por placeholder no input
  const _calcNum = document.getElementById('calcAporteNum');
  if (_calcNum) {
    if (isPrivate) {
      _calcNum.dataset.pvOriginal = _calcNum.value;
      _calcNum.value = '••••';
      _calcNum.disabled = true;
      _calcNum.style.color = 'var(--muted)';
      _calcNum.style.letterSpacing = '2px';
    } else {
      if (_calcNum.dataset.pvOriginal !== undefined) {
        _calcNum.value = _calcNum.dataset.pvOriginal;
        delete _calcNum.dataset.pvOriginal;
      }
      _calcNum.disabled = false;
      _calcNum.style.color = '';
      _calcNum.style.letterSpacing = '';
    }
  }
  const _calcSlider = document.getElementById('calcAporte');
  if (_calcSlider && isPrivate) {
    _calcSlider.value = Math.round((+_calcSlider.min + +_calcSlider.max) / 2);
  }
}

export function toggleEruda() {
  if (window.eruda && window.eruda._isInit) {
    window.eruda.show();
    return;
  }
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/eruda';
  s.onload = () => { eruda.init(); eruda.show(); };
  document.head.appendChild(s);
}
export function togglePrivacy() {
  document.body.classList.toggle('private-mode');
  const on = document.body.classList.contains('private-mode');
  document.getElementById('privacyBtn').innerHTML = on
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;opacity:.7"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;opacity:.7"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  localStorage.setItem('dashboard_private', on ? '1' : '0');
  _applyPrivacyCharts(on);
}
if (localStorage.getItem('dashboard_private') === '1') {
  document.body.classList.add('private-mode');
  document.getElementById('privacyBtn').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;opacity:.7"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  _applyPrivacyCharts(true);
}

// ── Tab system com lazy initialization ───────────────────────
const _tabInitialized = {};
export function _initTabCharts(tab) {
  // Use window.* to access functions that are set up by bootstrap.mjs
  // This avoids issues with destructuring from window before bootstrap populates it
  const w = window;
  const tabFns = {
    hoje:     [w.buildTimestamps, w.buildTornado, w.buildSankey,
               w.buildTornadoSensitivity, w.buildIpcaDcaSemaforo, w.buildRendaPlusSemaforo,
               w.buildKpiGridPrimario, w.buildKpiGridMercado, w.buildWellnessScore],
    perf:     [function() { w.buildTimeline('all'); }, w.buildAttribution, w.buildDeltaBar,
               w.renderIpcaProgress, w.buildRetornoHeatmap, w.buildRollingSharp, w.buildInformationRatio,
               function() { w.buildBacktest('since2009'); }, w.buildCagrVsTwr,
               w.buildFactorRolling, w.buildFactorLoadings, w.buildFactorLoadingsChart, w.buildRetornoDecomposicao,
               w.buildShadowTable, function() { w.buildShadowChart('since2009'); }, w.buildFeeAnalysis,
               w.buildDrawdownHistory, w.buildBacktestR7, w.buildPremissasVsRealizado],
    backtest: [function() { w.buildBacktest('since2009'); }, w.buildShadowTable,
               function() { w.buildShadowChart('since2009'); }, w.buildBacktestR7, w.buildDrawdownHistory,
               w.buildBacktestRegimeLongo],
    carteira: [w.buildDonuts, w.buildStackedAlloc, w.buildPosicoes, w.buildCustoBase, w.buildIrDiferido, w.buildRfCards, w.renderHodl11, w.buildEtfComposition, w.buildMinilog,
               w.buildEtfComposicaoRegiao, w.buildIntraEquityPesos, w.buildMinilogChart, w.buildPosicoesEtfsIbkr, w.buildRfPosicoes, w.buildTlhMonitor],
    fire:     [w.buildTrackingFire, w.buildScenarioComparison, w.buildScenarios,
               w.buildFireMatrix, w.buildLumpyEvents, w.buildGlidePath,
               w.buildNetWorthProjection,
               () => { w._applyFireAxes(); }, w.buildEarliestFire,
               w.buildEventosVida, w.buildPfireFamilia,
               () => { if (w.updateWhatIf) w.updateWhatIf(); },
               w.buildFireTrilha, w.buildSimuladorFire, w.buildWhatIfCenarios],
    retiro:   [w.buildGuardrails, w.buildIncomeChart, w.buildIncomeTable,
               w.buildSpendingGuardrails, w.buildSwrPercentiles,
               w.buildSpendingBreakdown, w.buildIncomeProjection,
               w.buildBondPool, w.buildBondPoolRunway,
               w.buildIncomeLifecycle],
    simuladores: [() => { w._applyFireAxes(); }, w.buildScenarios, w.buildStressTest,
                  function() {
                    const wiC = document.getElementById('wiCusto');
                    if (wiC && DATA.premissas?.custo_vida_base) wiC.value = DATA.premissas.custo_vida_base;
                    if (!window._wiPreset) window._wiPreset = 'base';
                    updateWhatIf();
                  },
                  w.buildCalcAporteChart, w.buildStressTestMc],
  };
  const fns = tabFns[tab] || [];
  fns.forEach(fn => { try { fn(); } catch(e) { console.error('[chart-init ERROR]', fn.name || tab, e.message, e); } });
}
// Collapse toggle with chart lazy-resize: after opening, resize all Chart.js instances
// inside the block. If a chart was rendered with zero dimensions (canvas was hidden),
// Chart.js resize() alone won't fix it — we need to also rebuild it via its named builder.
const _chartBuilders = {
  glideChart:            () => window.buildGlidePath?.(),
  deltaChart:            () => window.buildDeltaBar?.(),
  trackingFireChart:     () => window.buildTrackingFire?.(),
  tornadoChart:          () => window.buildTornado?.(),
  timelineChart:         () => { window.buildTimeline?.('all'); },
  attrChart:             () => window.buildAttribution?.(),
  rollingSharpChart:     () => window.buildRollingSharp?.(),
  rollingIRChart:        () => window.buildInformationRatio?.(),
  drawdownHistChart:     () => window.buildDrawdownHistory?.(),
  backtestChart:         () => { window.buildBacktest?.('since2009'); },
  backtestR7Chart:       () => window.buildBacktestR7?.(),
  shadowChart:           () => { window.buildShadowChart?.('since2009'); },
  factorRollingChart:    () => window.buildFactorRolling?.(),
  factorLoadingsChart:   () => window.buildFactorLoadings?.(),
  incomeChart:           () => window.buildIncomeChart?.(),
  incomeProjectionChart: () => window.buildIncomeProjection?.(),
  sankeyChart:           () => window.buildSankey?.(),
  bondPoolRunwayChart:   () => window.buildBondPoolRunway?.(),
  netWorthProjectionChart: () => window.buildNetWorthProjection?.(),
  stressProjectionChart:   () => window.buildStressTest?.(),
};
window._toggleBlock = function(el) {
  const wasOpen = el.classList.contains('open');
  el.classList.toggle('open');
  if (!wasOpen) {
    // Opening: double-RAF garante reflow completo após display:block antes de ler offsetWidth
    // Single RAF não garante layout flush quando CSS muda de display:none → display:block.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      // Force synchronous reflow so offsetWidth/offsetHeight are accurate in builders.
      // Double-RAF garante que o browser processou o CSS display change, mas em alguns
      // browsers o layout computed ainda pode estar pendente — getBoundingClientRect()
      // força flush síncrono do layout antes de chamar os builders.
      void el.getBoundingClientRect();
      el.querySelectorAll('canvas').forEach(canvas => {
        const builder = _chartBuilders[canvas.id];
        if (builder) {
          // Always rebuild when opening — handles charts built at zero dimensions
          // inside collapsed sections (Chart.js may get 0x0 from display:none canvas)
          try { builder(); } catch(e) { console.warn('[toggle-rebuild]', canvas.id, e); }
        } else {
          const chart = Object.values(charts).find(c => c && c.canvas === canvas);
          if (chart) chart.resize();
        }
      });
    }));
  }
};

export function switchTab(name) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('[data-in-tab]').forEach(el => {
    el.classList.toggle('tab-hidden', el.dataset.inTab !== name);
  });
  // Lazy init: inicializar charts da aba apenas na primeira abertura
  // Double-RAF: primeiro frame remove tab-hidden; segundo frame garante reflow completo
  // antes de ler offsetWidth nos builders (single RAF não garante layout flush após display change).
  if (!_tabInitialized[name]) {
    _tabInitialized[name] = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      _initTabCharts(name);
      // Aplicar privacy após lazy init (charts inexistentes no page load)
      if (document.body.classList.contains('private-mode')) _applyPrivacyCharts(true);
      // Force responsive grid override after tab content is built
      forceResponsiveGrids();
      // Ensure all Chart.js instances in this tab are rendered
      // (some charts may not render pixels on constructor alone)
      // Use setTimeout to ensure update() happens after all other RAF callbacks
      setTimeout(() => {
        Object.values(charts).forEach(c => {
          if (c && typeof c.update === 'function') {
            try { c.update('none'); } catch(e) { /* ignore */ }
          }
        });
      }, 0);
    }));
  }
  requestAnimationFrame(() => {
    // Only act on charts in the active tab — resizing hidden-tab canvases (display:none)
    // corrupts Chart.js internal dimensions and breaks re-render on next tab switch.
    const tabCanvases = new Set(
      Array.from(document.querySelectorAll('[data-in-tab="' + name + '"] canvas'))
    );
    Object.values(charts).forEach(c => {
      if (!c || typeof c.resize !== 'function' || !tabCanvases.has(c.canvas)) return;
      if (c.canvas.closest('.collapsible:not(.open)')) return; // skip collapsed
      if (c.canvas.offsetWidth > 0 && c.canvas.offsetHeight > 0) {
        c.resize();
      } else {
        // Open section but zero canvas — rebuild
        const builder = _chartBuilders[c.canvas.id];
        if (builder) { try { builder(); } catch(e) { console.warn('[tab-rebuild]', c.canvas.id, e); } }
      }
    });
    // Ensure charts are rendered after resize (update() needed for pixel data on some Chart.js configs)
    setTimeout(() => {
      Object.values(charts).forEach(c => {
        if (c && typeof c.update === 'function' && tabCanvases.has(c.canvas)) {
          try { c.update('none'); } catch(e) { /* ignore */ }
        }
      });
    }, 0);
  });
  try { localStorage.setItem('dash_tab', name); } catch(e) {}
}

// ═══════════════════════════════════════════════════════════════
// P1/P2: SEMÁFORO PANEL
// ═══════════════════════════════════════════════════════════════
export function toggleSemaforoPanel() {
  const panel = document.getElementById('semaforoPanel');
  const body  = document.getElementById('semaforoCollapseBody');
  if (!panel || !body) return;
  const opening = !panel.classList.contains('open');
  panel.classList.toggle('open', opening);
  body.style.display = opening ? 'block' : 'none';
}

export function buildSemaforoPanel() {
  const el = document.getElementById('semaforoBody');
  if (!el) return;

  function dot(status) {
    const cls = status === 'verde' ? 'semaforo-verde' : status === 'amarelo' ? 'semaforo-amarelo' : 'semaforo-vermelho';
    return '<span class="semaforo-dot ' + cls + '"></span>';
  }

  // ctx: linha de contexto secondary (taxa vs posição)
  function mkRow(gatilho, tipo, status, valorPrimario, ctx, acao) {
    const tipoBadge = tipo === 'taxa'
      ? '<span style="font-size:.55rem;background:rgba(6,182,212,.15);color:var(--cyan);padding:1px 5px;border-radius:4px;margin-left:4px">taxa</span>'
      : tipo === 'posicao'
        ? '<span style="font-size:.55rem;background:rgba(168,85,247,.15);color:var(--purple);padding:1px 5px;border-radius:4px;margin-left:4px">posição</span>'
        : tipo === 'crypto'
          ? '<span style="font-size:.55rem;background:rgba(234,179,8,.15);color:var(--yellow);padding:1px 5px;border-radius:4px;margin-left:4px">crypto</span>'
          : '';
    const ctxHtml = ctx
      ? '<div style="font-size:.65rem;color:var(--muted);margin-top:2px;font-variant-numeric:tabular-nums">' + ctx + '</div>'
      : '';
    return '<tr>' +
      '<td>' + gatilho + tipoBadge + ctxHtml + '</td>' +
      '<td>' + dot(status) + '<span style="font-size:.75rem">' + status + '</span></td>' +
      '<td style="font-variant-numeric:tabular-nums;font-size:.78rem">' + valorPrimario + '</td>' +
      '<td style="font-size:.75rem">' + acao + '</td>' +
      '</tr>';
  }

  const rows = [];
  const rowMeta = []; // para mini summary quando colapsado

  // 1. IPCA+ DCA status — TIPO: taxa
  const dcaIpca = DATA.dca_status?.ipca_longo;
  if (dcaIpca) {
    const taxa = dcaIpca.taxa_atual;
    const piso = dcaIpca.piso;
    const status = (taxa != null && piso != null && taxa >= piso) ? 'verde' : 'amarelo';
    const valorIpca2040 = DATA.rf?.ipca2040?.valor;
    const valorIpca2029 = DATA.rf?.ipca2029?.valor;
    const posicaoBrl = valorIpca2040 != null ? (valorIpca2040 + (valorIpca2029 || 0)) : null;
    const pctAtual = dcaIpca.pct_carteira_atual;
    const pctAlvo  = dcaIpca.alvo_pct;
    const gapAlvo  = dcaIpca.gap_alvo_pp;
    const ctx = taxa != null
      ? 'taxa: ' + taxa.toFixed(2) + '% · piso ' + piso.toFixed(1) + '% · posição: ' +
        (posicaoBrl != null ? 'R$' + (posicaoBrl/1000).toFixed(0) + 'k' : '--') +
        (pctAtual != null ? ' (' + pctAtual.toFixed(1) + '% vs alvo ' + pctAlvo.toFixed(1) + '%, gap ' + gapAlvo.toFixed(1) + 'pp)' : '')
      : null;
    rows.push(mkRow(
      'IPCA+ 2040 — DCA',
      'taxa',
      status,
      taxa != null ? taxa.toFixed(2) + '% vs piso ' + piso.toFixed(1) + '%' : '--',
      ctx,
      dcaIpca.ativo ? 'DCA ativo' : 'DCA pausado'
    ));
  }

  // 2. Renda+ distância gatilho — TIPO: taxa
  const dg = DATA.rf?.renda2065?.distancia_gatilho;
  if (dg) {
    const valorRenda = DATA.rf?.renda2065?.valor;
    const ctx = dg.taxa_atual != null
      ? 'taxa: ' + dg.taxa_atual.toFixed(2) + '% · piso venda ' + dg.piso_venda.toFixed(1) + '% · gap ' + dg.gap_pp.toFixed(2) + 'pp' +
        (valorRenda != null ? ' · posição R$' + (valorRenda/1000).toFixed(0) + 'k' : '')
      : null;
    rows.push(mkRow(
      'Renda+ 2065 — Taxa',
      'taxa',
      dg.status || 'verde',
      dg.taxa_atual != null ? dg.taxa_atual.toFixed(2) + '% (gatilho ≤' + dg.piso_venda.toFixed(1) + '%)' : '--',
      ctx,
      dg.status === 'verde' ? 'Monitorar' : dg.status === 'amarelo' ? 'Atenção — próximo do piso' : 'Avaliar venda'
    ));
  }

  // 3. Drift SWRD vs alvo — TIPO: posição
  const driftSwrd = DATA.drift?.SWRD;
  if (driftSwrd) {
    const gap = driftSwrd.alvo - driftSwrd.atual; // positivo = subpeso
    const absGap = Math.abs(gap);
    const status = absGap <= 3 ? 'verde' : absGap <= 5 ? 'amarelo' : 'vermelho';
    const impactoR = totalBrl > 0 ? Math.abs(gap / 100 * totalBrl) : null;
    const ctx = 'atual: ' + driftSwrd.atual.toFixed(1) + '% · alvo ' + driftSwrd.alvo.toFixed(1) + '% · gap ' +
      (gap >= 0 ? '-' : '+') + absGap.toFixed(1) + 'pp' +
      (impactoR != null ? ' · ~R$' + (impactoR/1000).toFixed(0) + 'k para rebalancear' : '');
    rows.push(mkRow(
      'Equity SWRD — Drift',
      'posicao',
      status,
      driftSwrd.atual.toFixed(1) + '% (alvo ' + driftSwrd.alvo.toFixed(1) + '%)',
      ctx,
      status === 'verde' ? 'OK' : 'Priorizar aporte SWRD'
    ));
  }

  // 4. HODL11 banda — TIPO: crypto
  const banda = DATA.hodl11?.banda;
  if (banda) {
    const ctx = banda.atual_pct != null
      ? 'atual: ' + banda.atual_pct.toFixed(1) + '% · alvo ' + banda.alvo_pct.toFixed(0) + '% · banda ' + banda.min_pct.toFixed(1) + '–' + banda.max_pct.toFixed(1) + '%'
      : null;
    rows.push(mkRow(
      'Crypto HODL11 — Banda',
      'crypto',
      banda.status || 'verde',
      banda.atual_pct != null ? banda.atual_pct.toFixed(1) + '% (banda ' + banda.min_pct.toFixed(1) + '–' + banda.max_pct.toFixed(1) + '%)' : '--',
      ctx,
      banda.status === 'verde' ? 'Dentro da banda' : banda.status === 'amarelo' ? 'Perto do limite' : 'Fora da banda'
    ));
  }

  // 5. Drift máximo global — TIPO: posição
  const _driftEntries = Object.entries(DATA.drift || {});
  const maxDriftEntry = _driftEntries.sort((a,b) => Math.abs(b[1].atual - b[1].alvo) - Math.abs(a[1].atual - a[1].alvo))[0];
  if (maxDriftEntry) {
    const [bucket, bDrift] = maxDriftEntry;
    const bGap = bDrift.alvo - bDrift.atual;
    const bAbsGap = Math.abs(bGap);
    const status = bAbsGap <= 3 ? 'verde' : bAbsGap <= 5 ? 'amarelo' : 'vermelho';
    const impactoR = totalBrl > 0 ? Math.abs(bAbsGap / 100 * totalBrl) : null;
    const ctx = 'atual: ' + bDrift.atual.toFixed(1) + '% · alvo ' + bDrift.alvo.toFixed(1) + '% · gap ' +
      (bGap >= 0 ? '-' : '+') + bAbsGap.toFixed(1) + 'pp' +
      (impactoR != null ? ' · ~R$' + (impactoR/1000).toFixed(0) + 'k' : '');
    rows.push(mkRow(
      'Drift máximo (' + bucket + ')',
      'posicao',
      status,
      bAbsGap.toFixed(1) + 'pp',
      ctx,
      status === 'verde' ? 'OK' : 'Rebalancear via aporte'
    ));
  }

  el.innerHTML = '<thead><tr><th>Gatilho</th><th>Status</th><th>Valor</th><th>Ação</th></tr></thead><tbody>' +
    rows.join('') + '</tbody>';

  // Mini-resumo para estado colapsado (1ª linha = IPCA+ DCA)
  const _sumEl = document.getElementById('semaforoSummary');
  if (_sumEl && rows.length > 0) {
    const _d1 = DATA.dca_status?.ipca_longo;
    const _st1 = (_d1?.taxa_atual != null && _d1?.piso != null && _d1.taxa_atual >= _d1.piso) ? 'verde' : 'amarelo';
    const _c1  = _st1 === 'verde' ? '#22c55e' : '#eab308';
    const _txt1 = _d1?.ativo ? 'DCA ativo' : 'DCA pausado';
    _sumEl.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${_c1};margin-right:5px;vertical-align:middle"></span>` +
      `IPCA+ 2040: ${_txt1} · ${rows.length} gatilhos monitorados`;
  }
}

// ═══════════════════════════════════════════════════════════════
// P2: MACRO CARDS
// ═══════════════════════════════════════════════════════════════
export function buildMacroCards() {
  const el = document.getElementById('macroStrip');
  if (!el) return;
  const m = DATA.macro;
  if (!m) { document.getElementById('macroSection').style.display = 'none'; return; }

  const rf = DATA.rf || {};
  const cards = [
    {
      label: 'IPCA+ 2040',
      sub: 'piso 6.0%',
      value: rf.ipca2040?.taxa != null ? rf.ipca2040.taxa.toFixed(2) + '%' : '--',
      color: (rf.ipca2040?.taxa ?? 0) >= 6.0 ? 'color:var(--green)' : '',
    },
    {
      label: 'BRL/USD',
      sub: 'PTAX BCB',
      value: m.cambio != null ? 'R$ ' + m.cambio.toFixed(2) : (DATA.cambio != null ? 'R$ ' + DATA.cambio.toFixed(2) : '--'),
      color: '',
    },
    {
      label: 'Renda+ 2065',
      sub: 'gatilho ≤6.0%',
      value: rf.renda2065?.taxa != null ? rf.renda2065.taxa.toFixed(2) + '%' : '--',
      color: (rf.renda2065?.taxa ?? 99) <= 6.0 ? 'color:var(--red)' : (rf.renda2065?.taxa ?? 99) <= 6.5 ? 'color:var(--yellow)' : '',
    },
    {
      label: 'Spread SELIC-FED',
      sub: 'pp',
      value: m.spread_selic_ff != null ? m.spread_selic_ff.toFixed(2) + 'pp' : '--',
      color: m.spread_selic_ff > 10 ? 'color:var(--yellow)' : '',
    },
    {
      label: 'Exp. Cambial',
      sub: '%',
      value: m.exposicao_cambial_pct != null ? m.exposicao_cambial_pct.toFixed(1) + '%' : '--',
      color: m.exposicao_cambial_pct > 85 ? 'color:var(--yellow)' : '',
    },
    {
      label: 'SELIC',
      sub: '%a.a.',
      value: m.selic_meta != null ? m.selic_meta.toFixed(2) + '%' : '--',
      color: '',
    },
  ];

  el.innerHTML = cards.map(c =>
    '<div class="macro-kpi"><div class="mv" style="' + c.color + '">' + c.value + '</div>' +
    '<div class="ml">' + c.label + '</div>' +
    (c.sub ? '<div style="font-size:.55rem;color:var(--muted)">' + c.sub + '</div>' : '') +
    '</div>'
  ).join('');
}

// ═══════════════════════════════════════════════════════════════
// P2: DCA STATUS
// ═══════════════════════════════════════════════════════════════
export function buildDcaStatus() {
  const el = document.getElementById('dcaGrid');
  if (!el) return;
  const dca = DATA.dca_status;
  if (!dca) { document.getElementById('dcaSection').style.display = 'none'; return; }

  // #10: Indicador de prioridade de aporte — ativo mais underweight vs target
  (function() {
    const prioEl = document.getElementById('dcaAportePriority');
    if (!prioEl || !DATA.drift) return;
    let maxGap = -Infinity, maxBucket = null;
    Object.entries(DATA.drift).forEach(([bucket, d]) => {
      const gap = d.alvo - d.atual; // positivo = underweight
      if (gap > maxGap) { maxGap = gap; maxBucket = bucket; }
    });
    if (maxBucket && maxGap > 0) {
      prioEl.innerHTML = `Próximo aporte → <strong>${maxBucket}</strong> <span style="color:var(--muted);font-size:.68rem">(${maxGap.toFixed(1)}pp gap)</span>`;
      prioEl.style.borderColor = 'rgba(34,197,94,.4)';
      prioEl.style.background = 'rgba(34,197,94,.08)';
      prioEl.style.color = 'var(--green)';
    } else if (maxBucket) {
      prioEl.innerHTML = `Carteira em equilíbrio — <strong>${maxBucket}</strong> mais próximo do alvo`;
    }
  })();

  function renderCard(key, d) {
    if (!d) return '';
    const paused = !d.ativo;
    const statusDot = d.ativo ? '<span style="color:var(--green);font-weight:700">ATIVO</span>' : '<span style="color:var(--muted);font-weight:700">PAUSADO</span>';
    return '<div class="dca-card' + (paused ? ' paused' : '') + '">' +
      '<div class="dca-title">' + (d.instrumento || key) + ' ' + statusDot + '</div>' +
      '<div class="dca-row"><span>Taxa atual</span><span class="dca-val">' + (d.taxa_atual != null ? d.taxa_atual.toFixed(2) + '%' : '--') + '</span></div>' +
      (d.piso != null ? '<div class="dca-row"><span>Piso compra</span><span class="dca-val">' + d.piso.toFixed(1) + '%</span></div>' : '') +
      (d.piso_compra != null ? '<div class="dca-row"><span>Piso compra</span><span class="dca-val">' + d.piso_compra.toFixed(1) + '%</span></div>' : '') +
      (d.piso_venda != null ? '<div class="dca-row"><span>Piso venda</span><span class="dca-val">' + d.piso_venda.toFixed(1) + '%</span></div>' : '') +
      (d.gap_pp != null ? '<div class="dca-row"><span>Gap vs piso</span><span class="dca-val" style="color:' + (d.gap_pp > 0.5 ? 'var(--green)' : 'var(--yellow)') + '">' + d.gap_pp.toFixed(2) + 'pp</span></div>' : '') +
      '<div class="dca-row"><span>% carteira</span><span class="dca-val">' + (d.pct_carteira_atual != null ? d.pct_carteira_atual.toFixed(1) + '%' : '--') + ' / ' + (d.alvo_pct != null ? d.alvo_pct.toFixed(0) + '%' : '--') + '</span></div>' +
      '<div style="margin-top:6px;font-size:.68rem;color:var(--muted);border-top:1px solid rgba(71,85,105,.2);padding-top:4px">' + (d.proxima_acao || '--') + '</div>' +
    '</div>';
  }

  el.innerHTML = renderCard('ipca2040', dca.ipca2040) + renderCard('ipca2050', dca.ipca2050) + renderCard('renda_plus', dca.renda_plus);
}

// ═══════════════════════════════════════════════════════════════
// P2: BOND POOL READINESS
// ═══════════════════════════════════════════════════════════════
export function buildBondPool() {
  const el = document.getElementById('bondPoolBody');
  if (!el) return;
  const bp = DATA.fire?.bond_pool_readiness;
  if (!bp) { document.getElementById('bondPoolSection').style.display = 'none'; return; }

  const pct = bp.meta_anos > 0 ? Math.min(100, (bp.anos_gastos / bp.meta_anos) * 100) : 0;
  const statusColor = bp.status === 'early' ? 'var(--yellow)' : bp.status === 'ok' ? 'var(--green)' : 'var(--red)';
  const statusLabel = bp.status === 'early' ? 'Em construção' : bp.status === 'ok' ? 'Adequado' : bp.status || '--';

  // Meta em R$ = meta_anos × gasto_anual
  const gastoAnual = DATA.premissas?.custo_vida_base ?? 0;
  const metaBrl = bp.meta_anos * gastoAnual;

  // Ativos que compõem (ou devem compor) o bond pool
  const rf = DATA.rf || {};
  const ipca2040Brl = rf.ipca2040?.valor ?? 0;
  const ipca2050Brl = rf.ipca2050?.valor ?? 0;
  const ipca2029Brl = rf.ipca2029?.valor ?? 0;
  const renda2065Brl = rf.renda2065?.valor ?? 0;
  const bondTotal = ipca2040Brl + ipca2050Brl + ipca2029Brl;
  const pctMeta = metaBrl > 0 ? Math.min(100, bondTotal / metaBrl * 100) : 0;

  // Taxa atual para decidir estratégia ativa
  const taxaIpca = rf.ipca2040?.taxa ?? 0;
  const pisoIpca = DATA.pisos?.pisoTaxaIpcaLongo ?? 6.0;
  const janelaAtiva = taxaIpca >= pisoIpca;

  // Anos até Cenário Base (estratégia B: 3 anos antes)
  const idadeAtual = DATA.premissas?.idade_atual ?? 39;
  const idadeFire = DATA.premissas?.idade_cenario_base ?? 53;
  const anosParaFire = idadeFire - idadeAtual;
  const estratBAtiva = anosParaFire <= 3;

  el.innerHTML =
    // Barra de progresso principal
    '<div class="bond-pool-card">' +
      '<div class="bp-title">Bond Pool — ' + (bp.anos_gastos != null ? bp.anos_gastos.toFixed(1) : '--') + ' / ' + bp.meta_anos + ' anos de gastos</div>' +
      '<div class="bond-pool-bar"><div class="bond-pool-fill" style="width:' + pct.toFixed(0) + '%"></div></div>' +
      '<div class="dynamic-2col" style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px;font-size:.75rem">' +
        '<div class="bp-row"><span>Valor atual</span><span class="bp-val pv">R$ ' + (bp.valor_atual_brl != null ? (bp.valor_atual_brl/1000).toFixed(0) + 'k' : '--') + '</span></div>' +
        '<div class="bp-row"><span>Meta (' + bp.meta_anos + ' anos)</span><span class="bp-val pv">R$ ' + (metaBrl/1000).toFixed(0) + 'k</span></div>' +
        '<div class="bp-row"><span>Cobertura atual</span><span class="bp-val">' + (bp.anos_gastos != null ? bp.anos_gastos.toFixed(1) : '--') + ' anos</span></div>' +
        '<div class="bp-row"><span>Status</span><span class="bp-val" style="color:' + statusColor + '">' + statusLabel + '</span></div>' +
      '</div>' +
    '</div>' +

    // Ativos atuais do bond pool
    '<div style="margin-top:10px">' +
      '<div style="font-size:.68rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Composição atual</div>' +
      '<table style="width:100%;font-size:.75rem;border-collapse:collapse">' +
        '<tr style="border-bottom:1px solid rgba(71,85,105,.25)">' +
          '<td style="padding:4px 4px;font-weight:600">IPCA+ 2040</td>' +
          '<td style="text-align:right;padding:4px 4px;color:var(--green)" class="pv">R$ ' + (ipca2040Brl/1000).toFixed(0) + 'k</td>' +
          '<td style="text-align:right;padding:4px 4px;color:var(--muted)">' + (metaBrl > 0 ? (ipca2040Brl/metaBrl*100).toFixed(0) + '% da meta' : '--') + '</td>' +
        '</tr>' +
        '<tr style="border-bottom:1px solid rgba(71,85,105,.25)">' +
          '<td style="padding:4px 4px;font-weight:600">IPCA+ 2050</td>' +
          '<td style="text-align:right;padding:4px 4px;color:var(--green)" class="pv">R$ ' + (ipca2050Brl/1000).toFixed(0) + 'k</td>' +
          '<td style="text-align:right;padding:4px 4px;color:var(--muted)">' + (metaBrl > 0 ? (ipca2050Brl/metaBrl*100).toFixed(0) + '% da meta' : '--') + '</td>' +
        '</tr>' +
        '<tr style="border-bottom:1px solid rgba(71,85,105,.25)">' +
          '<td style="padding:4px 4px;font-weight:600">IPCA+ 2029</td>' +
          '<td style="text-align:right;padding:4px 4px;color:var(--green)" class="pv">R$ ' + (ipca2029Brl/1000).toFixed(0) + 'k</td>' +
          '<td style="text-align:right;padding:4px 4px;color:var(--muted)">' + (metaBrl > 0 ? (ipca2029Brl/metaBrl*100).toFixed(0) + '% da meta' : '--') + '</td>' +
        '</tr>' +
        '<tr style="border-bottom:2px solid var(--border);font-weight:700">' +
          '<td style="padding:4px 4px">Total bond pool</td>' +
          '<td style="text-align:right;padding:4px 4px;color:var(--accent)" class="pv">R$ ' + (bondTotal/1000).toFixed(0) + 'k</td>' +
          '<td style="text-align:right;padding:4px 4px;color:var(--accent)">' + pctMeta.toFixed(0) + '% da meta</td>' +
        '</tr>' +
      '</table>' +
      (renda2065Brl > 0 ? '<div style="margin-top:4px;font-size:.68rem;color:var(--muted)">⚠️ Renda+ 2065 (<span class="pv">R$ ' + (renda2065Brl/1000).toFixed(0) + 'k</span>) não conta para bond pool — vencimento pós-FIRE, não provê liquidez pré-aposentadoria.</div>' : '') +
    '</div>' +

    // Estratégias
    '<div class="dynamic-2col" style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
      // Estratégia A
      '<div style="padding:10px;border-radius:8px;border-left:3px solid ' + (janelaAtiva ? 'var(--green)' : 'var(--muted)') + ';background:rgba(34,197,94,' + (janelaAtiva ? '.07' : '.02') + ')">' +
        '<div style="font-size:.65rem;font-weight:700;color:' + (janelaAtiva ? 'var(--green)' : 'var(--muted)') + ';text-transform:uppercase;margin-bottom:4px">' +
          (janelaAtiva ? '🟢 Estratégia A — Janela ATIVA' : '🔘 Estratégia A — Janela fechada') +
        '</div>' +
        '<div style="font-size:.72rem;color:var(--text);line-height:1.4">Aportes em IPCA+ longo enquanto taxa ≥ ' + pisoIpca.toFixed(1) + '%.<br>Taxa atual: <strong style="color:' + (janelaAtiva ? 'var(--green)' : 'var(--muted)') + '">' + taxaIpca.toFixed(2) + '%</strong></div>' +
      '</div>' +
      // Estratégia B
      '<div style="padding:10px;border-radius:8px;border-left:3px solid ' + (estratBAtiva ? 'var(--yellow)' : 'var(--muted)') + ';background:rgba(234,179,8,' + (estratBAtiva ? '.07' : '.02') + ')">' +
        '<div style="font-size:.65rem;font-weight:700;color:' + (estratBAtiva ? 'var(--yellow)' : 'var(--muted)') + ';text-transform:uppercase;margin-bottom:4px">' +
          (estratBAtiva ? '🟡 Estratégia B — ATIVAR AGORA' : '⏳ Estratégia B — ' + anosParaFire + ' anos para FIRE') +
        '</div>' +
        '<div style="font-size:.72rem;color:var(--text);line-height:1.4">Nos 3 anos pré-FIRE: aportar em IPCA+ curto (~2 anos) independente da taxa.<br>Protege SoRR dos primeiros anos.</div>' +
      '</div>' +
    '</div>';
}

// ═══════════════════════════════════════════════════════════════
// HD-perplexity-review: R1 — FIRE MATRIX
// ═══════════════════════════════════════════════════════════════
// _FM_PERFIS — carregado dinamicamente de DATA.fire_matrix.perfis
// Fallback se fire_matrix.perfis não existir
let _FM_PERFIS = {
  atual:   { gasto: null,    patAlvo: null,       label: 'Atual' },
  solteiro:{ gasto: 220000,  patAlvo: null,       label: 'Solteiro Minimalista' },
  casado:  { gasto: 270000,  patAlvo: null,       label: 'Casado' },
  filho:   { gasto: 300000,  patAlvo: null,       label: 'Casado + Filho' },
};

// Sobrescreve com dados do fire_matrix se disponível
if (DATA?.fire_matrix?.perfis) {
  const fperfis = DATA.fire_matrix.perfis;
  _FM_PERFIS.atual = {
    gasto: fperfis.atual?.gasto_anual || null,
    patAlvo: null,
    label: fperfis.atual?.label || 'Atual'
  };
  _FM_PERFIS.solteiro = {
    gasto: fperfis.solteiro?.gasto_anual || 220000,
    patAlvo: null,
    label: fperfis.solteiro?.label || 'Solteiro Minimalista'
  };
  _FM_PERFIS.casado = {
    gasto: fperfis.casado?.gasto_anual || 270000,
    patAlvo: null,
    label: fperfis.casado?.label || 'Casado'
  };
  _FM_PERFIS.filho = {
    gasto: fperfis.filho?.gasto_anual || 300000,
    patAlvo: null,
    label: fperfis.filho?.label || 'Casado + Filho'
  };
}

window._fireMatrixCenario = 'base';
window._fireMatrixPerfil  = 'atual';

window.setFireMatrixCenario = function(c) {
  window._fireMatrixCenario = c;
  setActivePeriodBtn('fireMatrixBtns', c);
  _renderFireMatrix();
};

window.setFireMatrixPerfil = function(p) {
  window._fireMatrixPerfil = p;
  setActivePeriodBtn('fireMatrixPerfilBtns', p);
  _renderFireMatrix();
};

// Interpola a idade provável para atingir um dado patrimônio
// Âncoras: (idade_atual, pat_atual) → (50, pat_p50@50) → (53, pat_p50@53) + extrapolação
export function _fmEstimateAge(pat) {
  const p  = DATA.premissas;
  const f0 = DATA.pfire_aspiracional;
  const f1 = DATA.pfire_base;
  if (!p || !f0 || !f1) return null;

  const anchors = [
    { age: p.idade_atual,              pat: p.patrimonio_atual },
    { age: p.idade_cenario_aspiracional,  pat: f0.pat_mediano },
    { age: p.idade_cenario_base,          pat: f1.pat_mediano },
  ].filter(a => a.pat != null);

  if (anchors.length < 2) return null;

  // Interpola/extrapola entre os segmentos
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i], b = anchors[i + 1];
    if (pat <= b.pat) {
      const t = (pat - a.pat) / (b.pat - a.pat);
      return Math.round(a.age + t * (b.age - a.age));
    }
  }
  // Extrapolação acima da última âncora
  const a = anchors[anchors.length - 2], b = anchors[anchors.length - 1];
  const slope = (b.age - a.age) / (b.pat - a.pat);
  return Math.round(b.age + slope * (pat - b.pat));
}

export function _fmCellColor(pct) {
  if (pct == null) return 'transparent';
  if (pct >= 95) {
    const t = Math.min(1, (pct - 95) / 5);
    return 'rgba(34,197,94,' + (0.15 + t * 0.25).toFixed(2) + ')';
  } else if (pct >= 88) {
    const t = (pct - 88) / 7;
    return 'rgba(234,179,8,' + (0.15 + (1 - t) * 0.2).toFixed(2) + ')';
  } else {
    const t = Math.min(1, (88 - pct) / 15);
    return 'rgba(239,68,68,' + (0.15 + t * 0.25).toFixed(2) + ')';
  }
}

export function _fmTextColor(pct) {
  if (pct == null) return 'var(--muted)';
  if (pct >= 95) return 'var(--green)';
  if (pct >= 88) return 'var(--yellow)';
  return 'var(--red)';
}

export function _renderFireMatrix() {
  const el = document.getElementById('fireMatrixTable');
  if (!el) return;
  const d = DATA.fire_matrix;
  if (!d || !d.cenarios || !d.patrimonios || !d.gastos) return;
  const cenario = window._fireMatrixCenario || 'base';
  const matrix = d.cenarios[cenario];
  if (!matrix) return;

  const pats   = d.patrimonios;
  const gastos = d.gastos;

  // Perfil: resolve gasto-alvo e patrimônio-alvo
  const perfil     = _FM_PERFIS[window._fireMatrixPerfil || 'atual'];
  const p50        = DATA.pfire_base?.pat_mediano;
  const gastoBase  = DATA.premissas?.custo_vida_base || 250000;

  // Gasto marcado: perfil.gasto (se definido) ou gasto base atual
  const gastoAlvo  = perfil.gasto ?? gastoBase;
  let youGasto = null;
  { let minD = Infinity; gastos.forEach(g => { const dd = Math.abs(g - gastoAlvo); if (dd < minD) { minD = dd; youGasto = g; } }); }

  // Patrimônio marcado: perfil.patAlvo (se definido) ou P50 MC
  const patAlvo    = perfil.patAlvo ?? p50;
  let youPat = null;
  if (patAlvo) {
    let minD = Infinity;
    pats.forEach(p => { const dd = Math.abs(p - patAlvo); if (dd < minD) { minD = dd; youPat = p; } });
  }

  const fmtGasto = v => 'R$' + (v / 1000).toFixed(0) + 'k';
  const fmtPat   = v => 'R$' + (v / 1e6).toFixed(0) + 'M';

  // Header: destaque na coluna do perfil
  let html = '<table class="fire-matrix-table"><thead><tr><th>Patrimônio</th>';
  gastos.forEach(g => {
    const isCol = (g === youGasto);
    html += '<th' + (isCol ? ' style="color:var(--accent);border-bottom:2px solid var(--accent)"' : '') + '>'
          + '<span class="pv">' + fmtGasto(g) + '</span>' + (isCol ? ' ★' : '') + '</th>';
  });
  html += '</tr></thead><tbody>';

  pats.forEach(pat => {
    const isAlvoRow = (pat === youPat);
    const rowStyle  = isAlvoRow ? ' style="outline:1px solid var(--accent);outline-offset:-1px"' : '';
    const age       = _fmEstimateAge(pat);
    const ageLabel  = age != null ? '<span style="font-size:.58rem;color:var(--muted);margin-left:3px">~' + age + 'a</span>' : '';
    html += '<tr' + rowStyle + '><td><span class="pv">' + fmtPat(pat) + '</span>' + ageLabel + (isAlvoRow ? ' →' : '') + '</td>';
    gastos.forEach(g => {
      const key = pat + '_' + g;
      const val = matrix[key];
      const pct = val != null ? parseFloat((val * 100).toFixed(1)) : null;
      const bg  = _fmCellColor(pct);
      const tc  = _fmTextColor(pct);
      const swr = (g / pat * 100).toFixed(1) + '%';
      const tip = pct != null ? ('P(FIRE)=' + pct + '% | SWR=' + swr) : '';
      html += '<td style="background:' + bg + ';color:' + tc + '" title="' + tip + '">'
            + (pct != null ? pct.toFixed(1) + '%' : '--') + '</td>';
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  el.innerHTML = html;
}

export function buildFireMatrix() {
  const sec = document.getElementById('fireMatrixSection');
  const el  = document.getElementById('fireMatrixTable');
  if (!el || !sec) return;
  const d = DATA.fire_matrix;
  if (!d || !d.cenarios || !d.patrimonios || !d.gastos) { sec.style.display = 'none'; return; }
  _renderFireMatrix();
}

// ═══════════════════════════════════════════════════════════════
// HD-perplexity-review: R2 — SWR PERCENTIS
// ═══════════════════════════════════════════════════════════════
export function buildSwrPercentiles() {
  const el = document.getElementById('swrPercentilesCards');
  const sec = document.getElementById('swrPercentilesSection');
  if (!el || !sec) return;
  const d = DATA.fire_swr_percentis;
  if (!d) { sec.style.display = 'none'; return; }

  // Populate scenario note
  const noteEl = document.getElementById('swrScenarioNote');
  if (noteEl) {
    const ageAlvo   = DATA.premissas?.idade_cenario_base ?? 53;
    const fireYear  = (DATA.premissas?.ano_nascimento ?? 1987) + ageAlvo;
    const gastoBase = d.custo_vida_base ? 'R$' + (d.custo_vida_base / 1000).toFixed(0) + 'k/ano' : '—';
    const mcDate    = d.mc_date || '';
    noteEl.textContent = `Solo Diego · FIRE ${ageAlvo} (${fireYear}) · Gasto base ${gastoBase} · MC 10k sims${mcDate ? ' · ' + mcDate : ''}`;
  }

  const fmtBrl = v => v != null ? 'R$' + (v / 1e6).toFixed(2) + 'M' : '--';
  const fmtSwr = v => v != null ? v.toFixed(2) + '%' : '--';

  const cards = [
    { key: 'p10', label: 'P10 — Pessimista', swr: d.swr_p10_pct, pat: d.patrimonio_p10_2040, desc: 'Poucos recursos → SWR alta (mais exigência do portfólio)', cls: 'p10' },
    { key: 'p50', label: 'P50 — Mediana', swr: d.swr_p50_pct, pat: d.patrimonio_p50_2040, desc: 'Cenário base (trajetória mediana do MC)', cls: 'p50' },
    { key: 'p90', label: 'P90 — Otimista', swr: d.swr_p90_pct, pat: d.patrimonio_p90_2040, desc: 'Maior patrimônio → SWR baixa (carteira confortável)', cls: 'p90' },
  ];

  el.innerHTML = cards.map(c =>
    '<div class="swr-pct-card ' + c.cls + '">' +
      '<div class="spl">' + c.label + '</div>' +
      '<div class="spv pv">' + fmtSwr(c.swr) + '</div>' +
      '<div class="spsub pv">' + fmtBrl(c.pat) + ' em 2040</div>' +
      '<div style="font-size:.6rem;color:var(--muted);margin-top:4px;line-height:1.4">' + c.desc + '</div>' +
    '</div>'
  ).join('');
}

// buildAporteSensitivity — removido (seção R3 descontinuada)

// ═══════════════════════════════════════════════════════════════
// HD-perplexity-review: R4 — MACRO STATUS BADGE
// ═══════════════════════════════════════════════════════════════
export function renderMacroStatus() {
  const el = document.getElementById('macroStatusBadge');
  if (!el) return;
  const status = DATA.fire?.plano_status?.status || DATA.macro?.plano_status?.status || DATA.fire?.plano_status || DATA.macro?.plano_status;
  if (!status) { el.style.display = 'none'; return; }

  let cls, icon, label;
  if (status === 'PERMANECE') {
    cls = 'macro-status-green'; icon = '✓'; label = 'Plano no Caminho';
  } else if (status === 'MONITORAR') {
    cls = 'macro-status-yellow'; icon = '⚠'; label = 'Monitorar';
  } else {
    cls = 'macro-status-red'; icon = '✕'; label = 'Revisar Plano';
  }

  el.innerHTML = '<span class="macro-status-badge ' + cls + '">' + icon + ' ' + label + '</span>';
}

// ═══════════════════════════════════════════════════════════════
// R5 — TRACKING FIRE: Realizado vs Projeção vs Meta
// ═══════════════════════════════════════════════════════════════
export function buildTrackingFire() {
  const el = document.getElementById('trackingFireChart');
  const sec = document.getElementById('trackingFireSection');
  if (!el || !sec) return;
  const d = DATA.fire_trilha;
  if (!d || !d.dates || !d.realizado_brl || !d.trilha_brl) { sec.style.display = 'none'; return; }
  if (el.offsetWidth === 0) { setTimeout(buildTrackingFire, 300); return; }

  const dates    = d.dates;
  const realizado = d.realizado_brl;
  const trilha    = d.trilha_brl;
  const meta      = Number(d.meta_fire_brl ?? DATA.premissas?.patrimonio_gatilho ?? 13.4e6);

  // Escala: 0 até max(dados, meta) × 1.1, cap em 1.5× meta
  const _allPos = [...realizado, ...trilha].filter(v => v != null && isFinite(v) && v > 0);
  const _dataMax = _allPos.length ? Math.max(..._allPos) : meta;
  const _yMax    = Math.max(Math.min(_dataMax * 1.1, meta * 1.5), meta * 1.1);

  // Destroy instâncias existentes
  const _ex = Chart.getChart(el);
  if (_ex) _ex.destroy();
  if (charts.trackingFire) { try { charts.trackingFire.destroy(); } catch (_e) {} charts.trackingFire = null; }

  const ctx = el.getContext('2d');

  // Plugin único: desenha TODAS as linhas via getPixelForValue (bypassa o dataset renderer do Chart.js)
  // Usa a mesma API que desenha a linha de meta — garantidamente correta.
  const _drawPlugin = {
    id: 'trackingFireDraw',
    afterDraw: function(chart) {
      const { ctx: c, scales, chartArea } = chart;
      if (!scales.y || !scales.x || !chartArea) return;
      const n = dates.length;

      // Linha Projeção (trilha_brl completa — azul claro tracejado)
      c.save();
      c.strokeStyle = 'rgba(96,165,250,.75)';
      c.lineWidth = 1.5;
      c.setLineDash([6, 3]);
      c.beginPath();
      let started = false;
      for (let i = 0; i < n; i++) {
        const v = trilha[i];
        if (v == null || !isFinite(v)) { started = false; continue; }
        const xPx = scales.x.getPixelForValue(i);
        const yPx = scales.y.getPixelForValue(v);
        if (!started) { c.moveTo(xPx, yPx); started = true; } else { c.lineTo(xPx, yPx); }
      }
      c.stroke();
      c.setLineDash([]);

      // Linha Realizado (azul sólido — só onde não é null)
      c.strokeStyle = 'rgba(59,130,246,1)';
      c.lineWidth = 2.5;
      c.beginPath();
      started = false;
      for (let i = 0; i < n; i++) {
        const v = realizado[i];
        if (v == null) { started = false; continue; }
        const xPx = scales.x.getPixelForValue(i);
        const yPx = scales.y.getPixelForValue(v);
        if (!started) { c.moveTo(xPx, yPx); started = true; } else { c.lineTo(xPx, yPx); }
      }
      c.stroke();

      c.restore();
    }
  };

  // Projeção e Realizado: datasets vazios (rendering via _drawPlugin — dataset renderer quebrado para grandes valores BRL)
  // Meta: dataset normal com valor constante (linha horizontal — funciona com renderer padrão)
  charts.trackingFire = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        { label: 'Projeção',   data: [], borderColor: 'rgba(96,165,250,.75)', borderWidth: 1.5, borderDash: [6,3] },
        { label: 'Realizado',  data: [], borderColor: 'rgba(59,130,246,1)',   borderWidth: 2.5 },
        { label: 'Meta FIRE',  data: Array(dates.length).fill(meta), borderColor: 'rgba(34,197,94,1)', borderWidth: 2, borderDash: [6,4], pointRadius: 0, tension: 0 },
      ],
    },
    plugins: [_drawPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: true, labels: { color: '#94a3b8', font: { size: 10 }, usePointStyle: false } },
        tooltip: { enabled: false },
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8', font: { size: 9 }, maxTicksLimit: 8 },
          grid: { color: 'rgba(71,85,105,.15)' }
        },
        y: {
          type: 'linear',
          min: 0,
          max: _yMax,
          ticks: { color: '#94a3b8', font: { size: 9 }, callback: function(v) { return 'R$' + (v / 1e6).toFixed(1) + 'M'; } },
          grid: { color: 'rgba(71,85,105,.15)' }
        }
      }
    }
  });

  const srcEl = document.getElementById('trackingFireSrc');
  if (srcEl) {
    const r = d.retorno_anual_premissa ? (d.retorno_anual_premissa * 100).toFixed(2) + '%/ano' : '';
    const a = d.aporte_mensal_premissa ? '<span class="pv">R$' + (d.aporte_mensal_premissa / 1000).toFixed(0) + 'k/mês</span>' : '';
    const m = d.meta_fire_date ? 'Meta <span class="pv">R$' + (meta / 1e6).toFixed(1) + 'M</span> em ' + d.meta_fire_date : '';
    srcEl.innerHTML = [r, a, m].filter(Boolean).join(' · ');
  }
}

// ═══════════════════════════════════════════════════════════════
// HD-perplexity-review: N1 — DRAWDOWN HISTORY
// ═══════════════════════════════════════════════════════════════
export function buildDrawdownHistory() {
  const el = document.getElementById('drawdownHistChart');
  const sec = document.getElementById('drawdownHistSection');
  if (!el || !sec) return;
  const d = DATA.drawdown_history;
  if (!d || !d.dates || !d.drawdown_pct) { sec.style.display = 'none'; return; }

  const dates = d.dates;
  const vals = d.drawdown_pct;

  if (charts.drawdownHist) { charts.drawdownHist.destroy(); charts.drawdownHist = null; }
  const ctx = el.getContext('2d');
  charts.drawdownHist = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: 'Drawdown %',
        data: vals,
        backgroundColor: vals.map(v => v < -10 ? 'rgba(239,68,68,.7)' : v < -5 ? 'rgba(239,68,68,.45)' : 'rgba(239,68,68,.25)'),
        borderColor: vals.map(v => v < -10 ? 'rgba(239,68,68,.9)' : 'rgba(239,68,68,.4)'),
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ' Drawdown: ' + ctx.parsed.y.toFixed(1) + '%' } },
      },
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 8 }, maxTicksLimit: 10 }, grid: { color: 'rgba(71,85,105,.1)' } },
        y: {
          ticks: { color: '#94a3b8', font: { size: 9 }, callback: v => v + '%' },
          grid: { color: 'rgba(71,85,105,.15)' },
          max: 2,
        }
      }
    }
  });

  // Eventos de drawdown (top N com duração e recuperação)
  const crisesEl = document.getElementById('drawdownCrisesTable');
  const evts = d.events || d.crises;
  if (crisesEl && evts && evts.length > 0) {
    const th = s => '<th style="padding:4px 8px;border-bottom:2px solid var(--border);color:var(--muted);font-size:.6rem;text-transform:uppercase;text-align:' + (s||'center') + '">';
    let html = '<table style="width:100%;font-size:.72rem;border-collapse:collapse;margin-top:8px">';
    html += '<thead><tr>' + th('left') + 'Evento</th>' + th() + 'Início</th>' + th() + 'Fundo</th>' + th() + 'Recuperação</th>' + th('right') + 'Profund.</th>' + th('right') + 'Dur.</th>' + th('right') + 'Recup.</th></tr></thead><tbody>';
    evts.forEach((e, i) => {
      const end   = e.end    || (e.recovered === false ? '<span style="color:var(--yellow)">em aberto</span>' : '--');
      const dur   = e.duration_months != null ? (e.duration_months > 0 ? e.duration_months + 'm' : '<1m') : '--';
      const recup = e.recovery_months != null ? e.recovery_months + 'm' : '—';
      const depth = e.depth_pct != null ? e.depth_pct.toFixed(1) + '%' : (e.drawdown_max != null ? e.drawdown_max.toFixed(1) + '%' : '--');
      const start = e.start  || e.inicio || '--';
      const trough = e.trough || e.fim   || '--';
      const name  = e.name || ('#' + (i+1));
      const td = (v, align, extra) => '<td style="padding:4px 8px;border-bottom:1px solid rgba(71,85,105,.2);text-align:' + (align||'center') + ';' + (extra||'') + '">' + v + '</td>';
      html += '<tr>' + td(name,'left','font-weight:500') + td(start) + td(trough) + td(end) +
        td(depth, 'right', 'color:var(--red);font-weight:600') + td(dur,'right') + td(recup,'right') + '</tr>';
    });
    html += '</tbody></table>';
    crisesEl.innerHTML = html;
  }

  // Nota metodologia
  const notaEl = document.getElementById('drawdownHistNota');
  if (notaEl && d.nota_metodologia) {
    notaEl.textContent = d.nota_metodologia + (d.max_drawdown != null ? ' · Max drawdown: ' + d.max_drawdown.toFixed(1) + '%' : '');
  }
}

// ═══════════════════════════════════════════════════════════════
// HD-perplexity-review: N2 — ETF COMPOSITION
// ═══════════════════════════════════════════════════════════════
export function buildEtfComposition() {
  const regEl = document.getElementById('etfRegionTable');
  const vemEl = document.getElementById('etfVemTable');
  const facEl = document.getElementById('etfFactorTable');
  const sec = document.getElementById('etfCompSection');
  if (!regEl || !facEl || !sec) return;
  const d = DATA.etf_composition;
  if (!d || !d.etfs) { sec.style.display = 'none'; return; }

  const allTickers = Object.keys(d.etfs);
  // Separate VEM into its own table to keep the main region table narrow
  const VEM_TICKER = 'AVEM';
  const mainTickers = allTickers.filter(t => t !== VEM_TICKER);
  const vemTicker = allTickers.find(t => t === VEM_TICKER);

  const factorLabels = { market: 'Market', value: 'Value', size: 'Size', quality: 'Quality' };
  const factorColors = { market: '#3b82f6', value: '#f97316', size: '#a855f7', quality: '#22c55e' };

  // Collect all unique regions and factors across main ETFs (excluding VEM)
  const allRegions = [];
  const allFactors = [];
  mainTickers.forEach(t => {
    const etf = d.etfs[t];
    if (etf.regioes) Object.keys(etf.regioes).forEach(r => { if (!allRegions.includes(r)) allRegions.push(r); });
    if (etf.fatores) Object.keys(etf.fatores).forEach(f => { if (!allFactors.includes(f)) allFactors.push(f); });
  });

  const thStyle = 'padding:6px 10px;font-size:.65rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px;text-align:right;white-space:nowrap';
  const thFirstStyle = 'padding:6px 10px;font-size:.65rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px;text-align:left;white-space:nowrap';
  const tdStyle = 'padding:5px 10px;font-size:.75rem;text-align:right;white-space:nowrap';
  const tdFirstStyle = 'padding:5px 10px;font-size:.72rem;font-weight:700;text-align:left;white-space:nowrap;min-width:90px';
  const tableStyle = 'width:100%;border-collapse:collapse';
  const trEvenStyle = 'background:var(--card2)';

  // Abreviações de regiões para exibição compacta nos headers
  const regionAbbr = { 'Outros DM': 'Out.DM', 'Outros EM': 'Out.EM', 'Outros': 'Outros' };
  const regionLabel = r => regionAbbr[r] || r;

  // Célula ETF: ticker em negrito + nome abaixo em muted pequeno
  const etfCell = (ticker, nome) =>
    `<td style="${tdFirstStyle}"><span style="font-size:.75rem;font-weight:700">${ticker}</span><br>` +
    `<span style="font-size:.6rem;color:var(--muted);font-weight:400">${nome || ''}</span></td>`;

  // ── Tabela 1: Por Região (sem VEM) ──
  let regHtml = '<div style="font-size:.68rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Por Região</div>';
  regHtml += '<table style="' + tableStyle + '"><thead><tr>';
  regHtml += '<th style="' + thFirstStyle + '">ETF</th>';
  allRegions.forEach(r => { regHtml += '<th style="' + thStyle + '">' + regionLabel(r) + '</th>'; });
  regHtml += '</tr></thead><tbody>';
  mainTickers.forEach((t, i) => {
    const etf = d.etfs[t];
    regHtml += '<tr' + (i % 2 === 0 ? ' style="' + trEvenStyle + '"' : '') + '>';
    regHtml += etfCell(t, etf.nome);
    allRegions.forEach(r => {
      const v = etf.regioes && etf.regioes[r] != null ? Math.round(etf.regioes[r] * 100) : 0;
      const color = v >= 50 ? '#3b82f6' : v >= 20 ? '#22c55e' : v > 0 ? '#94a3b8' : 'var(--muted)';
      regHtml += '<td style="' + tdStyle + ';color:' + color + '">' + (v > 0 ? v + '%' : '—') + '</td>';
    });
    regHtml += '</tr>';
  });
  regHtml += '</tbody></table>';
  regEl.innerHTML = regHtml;

  // ── Tabela VEM (separada) ──
  if (vemEl) {
    if (vemTicker && d.etfs[vemTicker]) {
      const vemEtf = d.etfs[vemTicker];
      const vemRegions = vemEtf.regioes ? Object.keys(vemEtf.regioes) : [];
      let vemHtml = '<div style="font-size:.68rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">VEM — Por Região</div>';
      vemHtml += '<table style="' + tableStyle + '"><thead><tr>';
      vemHtml += '<th style="' + thFirstStyle + '">ETF</th>';
      vemRegions.forEach(r => { vemHtml += '<th style="' + thStyle + '">' + regionLabel(r) + '</th>'; });
      vemHtml += '</tr></thead><tbody>';
      vemHtml += '<tr style="' + trEvenStyle + '">';
      vemHtml += etfCell(vemTicker, vemEtf.nome);
      vemRegions.forEach(r => {
        const v = vemEtf.regioes[r] != null ? Math.round(vemEtf.regioes[r] * 100) : 0;
        const color = v >= 50 ? '#3b82f6' : v >= 20 ? '#22c55e' : v > 0 ? '#94a3b8' : 'var(--muted)';
        vemHtml += '<td style="' + tdStyle + ';color:' + color + '">' + (v > 0 ? v + '%' : '—') + '</td>';
      });
      vemHtml += '</tr></tbody></table>';
      vemEl.innerHTML = vemHtml;
    } else {
      vemEl.innerHTML = '';
    }
  }

  // ── Tabela 2: Por Fator (todos os ETFs, incluindo VEM) ──
  const allFactorsFull = [];
  allTickers.forEach(t => {
    const etf = d.etfs[t];
    if (etf.fatores) Object.keys(etf.fatores).forEach(f => { if (!allFactorsFull.includes(f)) allFactorsFull.push(f); });
  });
  let facHtml = '<div style="font-size:.68rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Exposição Fatorial</div>';
  facHtml += '<table style="' + tableStyle + '"><thead><tr>';
  facHtml += '<th style="' + thFirstStyle + '">ETF</th>';
  allFactorsFull.forEach(f => { facHtml += '<th style="' + thStyle + ';color:' + (factorColors[f] || '#94a3b8') + '">' + (factorLabels[f] || f) + '</th>'; });
  facHtml += '</tr></thead><tbody>';
  allTickers.forEach((t, i) => {
    const etf = d.etfs[t];
    facHtml += '<tr' + (i % 2 === 0 ? ' style="' + trEvenStyle + '"' : '') + '>';
    facHtml += etfCell(t, etf.nome);
    allFactorsFull.forEach(f => {
      const v = etf.fatores && etf.fatores[f] != null ? Math.round(etf.fatores[f] * 100) : 0;
      const color = factorColors[f] || '#94a3b8';
      facHtml += '<td style="' + tdStyle + ';color:' + (v > 0 ? color : 'var(--muted)') + '">' + (v > 0 ? v + '%' : '—') + '</td>';
    });
    facHtml += '</tr>';
  });
  facHtml += '</tbody></table>';
  facEl.innerHTML = facHtml;
}

// ═══════════════════════════════════════════════════════════════
// HD-perplexity-review: N3 — BOND POOL RUNWAY CHART
// ═══════════════════════════════════════════════════════════════
export function buildBondPoolRunway() {
  const el = document.getElementById('bondPoolRunwayChart');
  const wrap = document.getElementById('bondPoolRunwayChartWrap');
  if (!el || !wrap) return;
  const d = DATA.bond_pool_runway;
  if (!d || !d.anos_cobertura_pos_fire || !d.pool_disponivel_pos_fire) return;

  const anos = d.anos_cobertura_pos_fire;
  const pool = d.pool_disponivel_pos_fire;

  wrap.style.display = 'block';

  if (charts.bondPoolRunway) { charts.bondPoolRunway.destroy(); charts.bondPoolRunway = null; }
  const ctx = el.getContext('2d');
  charts.bondPoolRunway = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: anos.map(a => 'Ano ' + a),
      datasets: [{
        label: 'Pool disponível (R$)',
        data: pool,
        backgroundColor: pool.map(v => v >= 0 ? 'rgba(34,197,94,.5)' : 'rgba(239,68,68,.5)'),
        borderColor: pool.map(v => v >= 0 ? 'rgba(34,197,94,.8)' : 'rgba(239,68,68,.8)'),
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ' R$' + (ctx.parsed.y / 1000).toFixed(0) + 'k' } },
      },
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { color: 'rgba(71,85,105,.1)' } },
        y: {
          ticks: { color: '#94a3b8', font: { size: 9 }, callback: v => 'R$' + (v / 1000).toFixed(0) + 'k' },
          grid: { color: 'rgba(71,85,105,.15)' },
        }
      }
    }
  });

  const notaEl = document.getElementById('bondPoolRunwayNota');
  if (notaEl && d.metodologia_runway) {
    notaEl.textContent = d.metodologia_runway + (d.nota_pool_projetado ? ' · ' + d.nota_pool_projetado : '');
  }
}

// ═══════════════════════════════════════════════════════════════
// HD-perplexity-review: N4 — LUMPY EVENTS
// ═══════════════════════════════════════════════════════════════
export function buildLumpyEvents() {
  const el = document.getElementById('lumpyEventsBody');
  if (!el) return;
  const d = DATA.lumpy_events;
  if (!d || !d.eventos) {
    el.innerHTML = '<div style="padding:20px;text-align:center;color:#888">Lumpy Events — Dados não disponíveis</div>';
    return;
  }

  const basePfire = d.base?.pfire_2040;
  const baseSpending = d.base?.spending_brl;

  let html = '';
  if (basePfire != null) {
    html += '<div style="margin-bottom:10px;padding:8px 12px;background:rgba(34,197,94,.08);border-radius:6px;border-left:3px solid var(--green);font-size:.78rem">' +
      '<strong>Base:</strong> Spending <span class="pv">R$' + (baseSpending / 1000).toFixed(0) + 'k/ano</span> → P(Cenário Base) = <strong>' + (basePfire * 100).toFixed(1) + '%</strong>' +
    '</div>';
  }

  html += '<table class="lumpy-table"><thead><tr>' +
    '<th>Evento</th><th>Spending novo</th><th>Início</th><th>Confirmado</th><th style="text-align:right">P(FIRE)</th><th style="text-align:right">Delta</th>' +
    '</tr></thead><tbody>';

  d.eventos.forEach(e => {
    const delta = e.delta_pp;
    const deltaColor = delta < 0 ? 'var(--red)' : 'var(--green)';
    const confirmado = e.confirmado ? '<span style="color:var(--yellow)">Sim</span>' : '<span style="color:var(--muted)">Não</span>';
    html += '<tr>' +
      '<td><strong>' + (e.label || e.id) + '</strong></td>' +
      '<td class="pv">R$' + ((e.spending_novo || 0) / 1000).toFixed(0) + 'k/ano</td>' +
      '<td>' + (e.ano_inicio || '--') + '</td>' +
      '<td>' + confirmado + '</td>' +
      '<td style="text-align:right;font-weight:600">' + (e.pfire_2040 != null ? (e.pfire_2040 * 100).toFixed(1) + '%' : '--') + '</td>' +
      '<td style="text-align:right;font-weight:700;color:' + deltaColor + '">' + (delta != null ? (delta > 0 ? '+' : '') + delta.toFixed(1) + 'pp' : '--') + '</td>' +
    '</tr>';
  });

  html += '</tbody></table>';
  el.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════
// P2: TIMESTAMPS / STALENESS BADGES (footer)
// ═══════════════════════════════════════════════════════════════
export function buildTimestamps() {
  const el = document.getElementById('timestampsBar');
  if (!el) return;
  const ts = DATA.timestamps;
  if (!ts) { el.style.display = 'none'; return; }

  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const hoje = DATA.date ? new Date(DATA.date) : new Date();
  const staleMs = 7 * 24 * 60 * 60 * 1000; // 7 dias

  const labels = {
    posicoes_ibkr: 'IBKR',
    precos_yfinance: 'Cotações',
    historico_csv: 'Histórico',
    holdings_md: 'Holdings',
    fire_mc: 'FIRE MC',
    geral: 'Geral'
  };

  el.innerHTML = Object.entries(ts).map(function(entry) {
    var key = entry[0], val = entry[1];
    var label = labels[key] || key;
    if (val == null) {
      return '<span class="ts-badge stale"><span class="ts-dot ts-dot-stale"></span>' + label + ': --</span>';
    }
    var d = new Date(val);
    var diff = hoje - d;
    var isStale = diff > staleMs;
    var formatted = String(d.getDate()).padStart(2, '0') + '/' + meses[d.getMonth()];
    return '<span class="ts-badge' + (isStale ? ' stale' : '') + '"><span class="ts-dot ' + (isStale ? 'ts-dot-stale' : 'ts-dot-ok') + '"></span>' + label + ': ' + formatted + '</span>';
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
// P2: CONCENTRAÇÃO BRASIL (macro section)
// ═══════════════════════════════════════════════════════════════
export function buildBrasilConcentracao() {
  var el = document.getElementById('brasilConcentracao');
  if (!el) return;
  var cb = DATA.concentracao_brasil;
  if (!cb) { el.style.display = 'none'; return; }

  var pct = cb.brasil_pct != null ? cb.brasil_pct.toFixed(1) + '%' : '--';
  var comp = cb.composicao || {};

  function fmtBrl(v) {
    if (v == null) return '--';
    return 'R$ ' + (v / 1000).toFixed(0) + 'k';
  }

  var rows = '';
  if (comp.hodl11_brl != null) rows += '<div class="brasil-row"><span>HODL11 (BTC wrapper)</span><span class="br-val pv">' + fmtBrl(comp.hodl11_brl) + '</span></div>';
  if (comp.rf_total_brl != null) {
    rows += '<div class="brasil-row"><span>Renda Fixa BR</span><span class="br-val pv">' + fmtBrl(comp.rf_total_brl) + '</span></div>';
    if (comp.rf_detalhe) {
      Object.entries(comp.rf_detalhe).forEach(function(entry) {
        var k = entry[0], v = entry[1];
        if (v != null && v > 0) rows += '<div class="brasil-row" style="padding-left:12px;color:var(--muted)"><span>' + k + '</span><span class="br-val pv">' + fmtBrl(v) + '</span></div>';
      });
    }
  }
  if (comp.crypto_legado_brl != null) rows += '<div class="brasil-row"><span>Crypto legado (spot)</span><span class="br-val pv">' + fmtBrl(comp.crypto_legado_brl) + '</span></div>';

  var totalBr = cb.total_brasil_brl != null ? fmtBrl(cb.total_brasil_brl) : '--';
  var nota = cb.nota || '';

  el.innerHTML =
    '<div class="brasil-card">' +
      '<div class="brasil-header">' +
        '<div><span class="brasil-lbl">Exposição Brasil</span></div>' +
        '<div class="brasil-pct">' + pct + '</div>' +
      '</div>' +
      rows +
      '<div class="brasil-row" style="margin-top:4px;border-top:1px solid rgba(71,85,105,.3);padding-top:4px;font-weight:700"><span>Total Brasil</span><span class="br-val pv">' + totalBr + '</span></div>' +
      (nota ? '<div style="margin-top:6px;font-size:.6rem;color:var(--muted);line-height:1.4">' + nota + '</div>' : '') +
    '</div>';
}

// ═══════════════════════════════════════════════════════════════
// P2: PREMISSAS VS REALIZADO (plan tab)
// ═══════════════════════════════════════════════════════════════
export function buildPremissasVsRealizado() {
  var el = document.getElementById('premissasVsRealizadoBody');
  if (!el) return;
  var pvr = DATA.premissas_vs_realizado;
  if (!pvr) { document.getElementById('premissasVsRealizadoSection').style.display = 'none'; return; }

  var cards = '';

  // Período visível no bloco
  var periodo = 'Período: 2021-04-13 a 2026-04-28 (60 meses / 5 anos)';

  // Card 1 — Retorno Equity (TWR real BRL)
  var re = pvr.retorno_equity;
  if (re) {
    var deltaREq = (re.twr_real_brl_pct != null && re.premissa_real_brl_pct != null)
      ? (re.twr_real_brl_pct - re.premissa_real_brl_pct) : null;
    var mainColorRE = re.twr_real_brl_pct != null
      ? (re.twr_real_brl_pct > re.premissa_real_brl_pct ? 'var(--green)' : 'var(--muted)')
      : '';
    var mainRE = re.twr_real_brl_pct != null ? re.twr_real_brl_pct.toFixed(2) + '%' : '--';
    var premRE = re.premissa_real_brl_pct != null ? re.premissa_real_brl_pct.toFixed(2) + '%' : '--';
    var deltaREStr = deltaREq != null ? (deltaREq >= 0 ? '+' : '') + deltaREq.toFixed(2) + 'pp' : 'n/a';
    cards += '<div class="kpi-card">' +
      '<div class="kpi-label">Retorno Equity</div>' +
      '<div class="kpi-label-sub">TWR real BRL CAGR</div>' +
      '<div class="kpi-main pv" style="color:' + mainColorRE + '">' + mainRE + '</div>' +
      '<div style="font-size:.7rem;color:var(--muted);margin-top:8px">' +
      'Realizado vs Premissa<br/>' +
      '<strong>' + mainRE + '</strong> vs <strong>' + premRE + '</strong><br/>' +
      'Delta: <strong>' + deltaREStr + '</strong>' +
      '</div>' +
      '</div>';
  }

  // Card 2 — Aporte Mensal
  var am = pvr.aporte_mensal;
  if (am) {
    var deltaAmSign = am.delta_pct != null && am.delta_pct >= 0 ? 'var(--green)' : 'var(--muted)';
    var mainAM = am.realizado_media_brl != null ? 'R$ ' + (am.realizado_media_brl / 1000).toFixed(1) + 'k' : '--';
    var premAM = am.premissa_brl != null ? 'R$ ' + (am.premissa_brl / 1000).toFixed(0) + 'k' : '--';
    var deltaAMStr = am.delta_pct != null ? (am.delta_pct > 0 ? '+' : '') + am.delta_pct.toFixed(0) + '%' : '--';
    var totalAporte = am.total_aporte_brl != null ? 'R$ ' + (am.total_aporte_brl / 1e6).toFixed(2) + 'M' : '--';
    cards += '<div class="kpi-card">' +
      '<div class="kpi-label">Aporte Mensal</div>' +
      '<div class="kpi-label-sub">Média 5 anos</div>' +
      '<div class="kpi-main pv" style="color:' + deltaAmSign + '">' + mainAM + '</div>' +
      '<div style="font-size:.7rem;color:var(--muted);margin-top:8px">' +
      'Realizado vs Premissa: ' + mainAM + ' vs ' + premAM + '<br/>' +
      'Execução: ' + deltaAMStr + '<br/>' +
      'Total 5a: ' + totalAporte +
      '</div>' +
      '</div>';
  }

  // Card 3 — Volatilidade Anualizada
  var vol = pvr.volatilidade;
  if (vol) {
    var volColor = vol.realizado_anualizado_pct > vol.premissa_pct ? 'var(--yellow)' : 'var(--muted)';
    var volReal = vol.realizado_anualizado_pct != null ? vol.realizado_anualizado_pct.toFixed(1) + '%' : '--';
    var volPrem = vol.premissa_pct != null ? vol.premissa_pct.toFixed(1) + '%' : '--';
    cards += '<div class="kpi-card">' +
      '<div class="kpi-label">Volatilidade</div>' +
      '<div class="kpi-label-sub">Anualizada</div>' +
      '<div class="kpi-main pv" style="color:' + volColor + '">' + volReal + '</div>' +
      '<div style="font-size:.7rem;color:var(--muted);margin-top:8px">' +
      'Realizado vs Premissa<br/>' +
      '<strong>' + volReal + '</strong> vs <strong>' + volPrem + '</strong><br/>' +
      'Acima esperado (EM + bonds + cripto)' +
      '</div>' +
      '</div>';
  }

  // Card 4 — Max Drawdown
  var dd = pvr.max_drawdown;
  if (dd) {
    var ddColor = dd.status === 'Na expectativa' ? 'var(--green)' : 'var(--yellow)';
    var ddReal = dd.realizado_pct != null ? dd.realizado_pct.toFixed(1) + '%' : '--';
    var ddPrem = dd.premissa_pct != null ? dd.premissa_pct.toFixed(1) + '%' : '--';
    cards += '<div class="kpi-card">' +
      '<div class="kpi-label">Max Drawdown</div>' +
      '<div class="kpi-label-sub">Stress Test</div>' +
      '<div class="kpi-main pv" style="color:' + ddColor + '">' + ddReal + '</div>' +
      '<div style="font-size:.7rem;color:var(--muted);margin-top:8px">' +
      'Realizado vs Premissa<br/>' +
      '<strong>' + ddReal + '</strong> vs <strong>' + ddPrem + '</strong> (' + dd.percentil_fire_mc + ')<br/>' +
      'Status: <strong>' + dd.status + '</strong>' +
      '</div>' +
      '</div>';
  }

  // Card 5 — Savings Rate
  var sr = pvr.savings_rate;
  if (sr) {
    var srColor = 'var(--green)';
    var srAcum = sr.acumulado_5anos_pct != null ? sr.acumulado_5anos_pct.toFixed(0) + '%' : '--';
    var mesesNeg = sr.meses_negativos != null ? sr.meses_negativos + '/' + sr.total_meses : '--';
    var percNeg = sr.percentual_meses_negativos != null ? sr.percentual_meses_negativos.toFixed(0) + '%' : '--';
    cards += '<div class="kpi-card">' +
      '<div class="kpi-label">Savings Rate</div>' +
      '<div class="kpi-label-sub">Acumulado 5 anos</div>' +
      '<div class="kpi-main pv" style="color:' + srColor + '">' + srAcum + '</div>' +
      '<div style="font-size:.7rem;color:var(--muted);margin-top:8px">' +
      'Aporte cumulativo sobre patrimônio inicial<br/>' +
      'Meses c/ aporte: ' + mesesNeg + ' (' + percNeg + ' negativos/zero)<br/>' +
      'Execução forte' +
      '</div>' +
      '</div>';
  }

  // Renderizar com grid responsivo (5 cards)
  el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:12px">' + cards + '</div>' +
    '<div style="font-size:.75rem;color:var(--muted);margin-top:12px">' + periodo + '</div>';
}

// ═══════════════════════════════════════════════════════════════
// P2: TAX IR DIFERIDO
// ═══════════════════════════════════════════════════════════════
export function buildTaxIR() { buildIrDiferido(); } // alias — lógica migrada para buildIrDiferido()

// ═══════════════════════════════════════════════════════════════
// P2: FACTOR ROLLING 12M AVGS vs SWRD
// ═══════════════════════════════════════════════════════════════
export function buildFactorRolling() {
  const sec = document.getElementById('factorRollingSection');
  const body = document.getElementById('factorRollingBody');
  if (!sec || !body) return;
  const fr = DATA.factor_rolling;
  if (!fr || !fr.dates || fr.dates.length === 0) {
    body.innerHTML = '<div class="factor-no-data">Dados de rolling 12m ainda não disponíveis. Atualizar dashboard para gerar.</div>';
    return;
  }

  const threshold = fr.threshold ?? -5;
  body.innerHTML = '<div class="chart-box"><canvas id="factorRollingChart"></canvas></div>';

  if (charts.factorRolling) { charts.factorRolling.destroy(); charts.factorRolling = null; }
  charts.factorRolling = new Chart(document.getElementById('factorRollingChart'), {
    type: 'line',
    data: {
      labels: fr.dates,
      datasets: [
        {
          label: 'AVGS vs SWRD 12m (pp)',
          data: fr.avgs_vs_swrd_12m,
          borderColor: '#8b5cf6',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.3
        },
        {
          label: 'Threshold ' + threshold + 'pp',
          data: fr.dates.map(() => threshold),
          borderColor: '#ef4444',
          borderWidth: 1.5,
          borderDash: [6, 3],
          pointRadius: 0,
          fill: false
        },
        {
          label: '0 (par)',
          data: fr.dates.map(() => 0),
          borderColor: 'rgba(148,163,184,.3)',
          borderWidth: 1,
          borderDash: [3, 3],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } },
        tooltip: {
          callbacks: {
            title: items => items.length ? fmtMonthLabel(items[0].label) : '',
            label: ctx => { if (ctx.parsed.y == null || isNaN(ctx.parsed.y)) return null; return ' ' + ctx.dataset.label.split(' (')[0] + ': ' + (ctx.parsed.y > 0 ? '+' : '') + ctx.parsed.y.toFixed(2) + 'pp'; }
          }
        }
      },
      scales: {
        x: { ticks: { color: '#94a3b8', maxTicksLimit: 8, callback: fmtMonthTick }, grid: { color: 'rgba(71,85,105,.2)' } },
        y: { ticks: { color: '#94a3b8', callback: v => (v > 0 ? '+' : '') + v + 'pp' }, grid: { color: 'rgba(71,85,105,.2)' } }
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// P2: FACTOR LOADINGS — Grouped Horizontal Bar Chart
// ═══════════════════════════════════════════════════════════════

// Factor view state
window._factorView = 'all';

// Dynamic factor views (built from available factors)
let _FL_VIEWS = {};

// Factor metadata: key → {label, viewKey}
const FACTOR_META = {
  mkt_rf:  { label: 'Mkt-RF',  viewKey: 'market' },
  smb:     { label: 'SMB',     viewKey: 'small' },
  hml:     { label: 'HML',     viewKey: 'value' },
  rmw:     { label: 'RMW',     viewKey: 'profitability' },
  cma:     { label: 'CMA',     viewKey: 'investment' },
  mom:     { label: 'Mom',     viewKey: 'momentum' },
};

// Build dynamic views from available factors
export function _buildFactorViews(availableFactors) {
  const views = {};

  // "All" view includes all available factors
  if (availableFactors.length > 0) {
    const allLabels = availableFactors.map(f => FACTOR_META[f]?.label || f);
    views.all = { factors: availableFactors, labels: allLabels };
  }

  // Individual views for each available factor
  availableFactors.forEach(factor => {
    const meta = FACTOR_META[factor];
    if (meta) {
      views[meta.viewKey] = {
        factors: [factor],
        labels: [meta.label]
      };
    }
  });

  return views;
}

// Get available factors from data (non-null across at least one ticker)
export function _getAvailableFactors() {
  const fl = DATA.factor_loadings;
  if (!fl || Object.keys(fl).length === 0) return [];

  const factorKeys = Object.keys(FACTOR_META);
  const tickers = Object.keys(fl);

  // Factor is "available" if at least one ticker has a non-null value
  return factorKeys.filter(factor => {
    return tickers.some(ticker => fl[ticker][factor] != null);
  });
}

window.setFactorView = function(view) {
  if (!_FL_VIEWS[view]) return; // Safety check
  window._factorView = view;
  setActivePeriodBtn('factorLoadingsBtns', view);
  _renderFactorChart();
};

export function buildFactorLoadings() {
  const cardsEl = document.getElementById('factorLoadingsCards');
  const btnsEl = document.getElementById('factorLoadingsBtns');
  const sec = document.getElementById('factorLoadingsSection');
  if (!cardsEl || !btnsEl || !sec) return;
  const fl = DATA.factor_loadings;
  if (!fl || Object.keys(fl).length === 0) {
    cardsEl.innerHTML = '<div class="factor-no-data">Factor loadings ainda não disponíveis. Atualizar dashboard para gerar.</div>';
    return;
  }

  const TICKER_COLORS = {
    SWRD: '#60a5fa', EIMI: '#f59e0b', AVUV: '#34d399',
    AVDV: '#a78bfa', DGS:  '#fb923c', USSC: '#f472b6', IWVL: '#94a3b8',
  };

  const tickers = Object.keys(fl).sort();

  // ── A) Detect available factors & build views ──────────────────
  const availableFactors = _getAvailableFactors();
  _FL_VIEWS = _buildFactorViews(availableFactors);

  // Reset to 'all' if current view is no longer available
  if (!_FL_VIEWS[window._factorView]) {
    window._factorView = 'all';
  }

  // ── B) Build buttons dynamically ───────────────────────────────
  if (availableFactors.length > 0) {
    const buttons = [];
    // "Todos" button (always first)
    buttons.push(`<button onclick="setFactorView('all')" class="active">Todos</button>`);
    // Individual factor buttons
    availableFactors.forEach(factor => {
      const meta = FACTOR_META[factor];
      if (meta) {
        const isActive = window._factorView === meta.viewKey ? 'active' : '';
        buttons.push(`<button onclick="setFactorView('${meta.viewKey}')" class="${isActive}">${meta.label}</button>`);
      }
    });
    btnsEl.innerHTML = buttons.join('');
  }

  // ── C) Cards row ───────────────────────────────────────────────
  cardsEl.innerHTML = tickers.map(ticker => {
    const vals  = fl[ticker];
    const r2    = vals.r2 ?? null;
    const r2pct = r2 != null ? (r2 * 100).toFixed(1) + '%' : '--';
    const nm    = vals.n_months != null ? vals.n_months + 'm' : '--';
    const color = TICKER_COLORS[ticker] || '#94a3b8';
    const r2color = r2 == null ? 'var(--muted)' : r2 >= 0.90 ? 'var(--green)' : r2 >= 0.80 ? 'var(--yellow)' : 'var(--red)';
    const r2warn  = r2 != null && r2 < 0.80 ? ' <span title="Modelo FF5 DM explica pouco este ETF — limitação metodológica para EM/SC globais" style="cursor:help">⚠️</span>' : '';
    return `<div style="background:rgba(51,65,85,.4);border-radius:6px;padding:6px 10px;font-size:.7rem;border-left:3px solid ${color}">
    <strong style="color:${color}">${ticker}</strong>
    <div>R² <span style="color:${r2color}">${r2pct}</span>${r2warn} · <span style="color:var(--muted)">${nm}</span></div>
  </div>`;
  }).join('');

  // ── D) Render chart (uses current view) ───────────────────────
  _renderFactorChart();
}

export function _renderFactorChart() {
  const fl = DATA.factor_loadings;
  const canvas = document.getElementById('factorLoadingsChart');
  if (!canvas) return;
  if (!fl) {
    const ctx = canvas.getContext('2d');
    canvas.style.height = '300px';
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#999';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Factor Loadings — Dados não disponíveis', canvas.width / 2, canvas.height / 2);
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const TICKER_COLORS = {
    SWRD: '#60a5fa', EIMI: '#f59e0b', AVUV: '#34d399',
    AVDV: '#a78bfa', DGS:  '#fb923c', USSC: '#f472b6', IWVL: '#94a3b8',
  };

  const view    = _FL_VIEWS[window._factorView] || _FL_VIEWS.all;
  const factors = view.factors;
  const labels  = view.labels;
  const tickers = Object.keys(fl).sort();

  const datasets = tickers.map(ticker => {
    const vals  = fl[ticker];
    const color = TICKER_COLORS[ticker] || '#94a3b8';
    const ts    = vals.t_stats || {};
    const [rr, gg, bb] = [parseInt(color.slice(1,3),16), parseInt(color.slice(3,5),16), parseInt(color.slice(5,7),16)];
    const bgColors = factors.map(f => {
      const t = ts[f];
      return (t != null && Math.abs(t) > 2)
        ? `rgba(${rr},${gg},${bb},0.85)`
        : `rgba(${rr},${gg},${bb},0.30)`;
    });
    return {
      label: ticker,
      data: factors.map(f => vals[f] != null ? +vals[f].toFixed(4) : null),
      backgroundColor: bgColors,
      borderColor: color,
      borderWidth: 1,
      borderRadius: 3,
    };
  });

  // Height: ~60px per factor row
  const chartH = Math.max(180, factors.length * 55 + 80);
  ctx.parentElement.style.height = chartH + 'px';

  if (charts.factorLoadings) { charts.factorLoadings.destroy(); charts.factorLoadings = null; }
  charts.factorLoadings = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 12 } },
        tooltip: {
          callbacks: {
            label: c => {
              const ticker = c.dataset.label;
              const factor = factors[c.dataIndex];
              const t = (DATA.factor_loadings[ticker]?.t_stats || {})[factor];
              const tStr = t != null ? ` (t=${t.toFixed(2)})` : '';
              return `${ticker}: ${c.parsed.x != null ? c.parsed.x.toFixed(3) : '--'}${tStr}`;
            }
          }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(148,163,184,.15)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
        y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } }
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// P3: CAGR PATRIMONIAL vs TWR
// ═══════════════════════════════════════════════════════════════
export function buildCagrVsTwr() {
  const cagrEl = document.getElementById('cagrPatrimonial');
  const twrEl = document.getElementById('twrPure');
  if (cagrEl && cagr) {
    cagrEl.textContent = cagr.toFixed(1) + '%/ano';
    cagrEl.style.color = '#eab308'; // yellow — includes contributions
  }
  if (twrEl && TWR_USD) {
    twrEl.textContent = TWR_USD.toFixed(1) + '%/ano';
    twrEl.style.color = '#22c55e';
  }
}

// ═══════════════════════════════════════════════════════════════
// INIT — lazy tab loading
// Apenas funções globais (não ligadas a nenhuma aba específica) e a tab inicial.
// ═══════════════════════════════════════════════════════════════
export function init() {
  if (window.addDebugLog) window.addDebugLog('init() called');
  try {
    // Atualiza label dinâmico da idade atual no seletor de stress test
    (function() {
      const idadeAtual = DATA.premissas?.idade_atual || 39;
      const opt = document.getElementById('stressOnsetAgeToday');
      if (opt) { opt.value = String(idadeAtual); opt.textContent = `${idadeAtual} anos (hoje)`; }
    })();

    // Funções globais (header, hero, semáforo — sempre visíveis)
    if (window.addDebugLog) window.addDebugLog('→ renderKPIs()');
    window.renderKPIs?.();
    if (window.addDebugLog) window.addDebugLog('→ renderWellness()');
    window.renderWellness?.();
    if (window.addDebugLog) window.addDebugLog('→ buildWellnessExtras()');
    window.buildWellnessExtras?.();
    if (window.addDebugLog) window.addDebugLog('→ other build funcs');
    renderMacroStatus();  // defined locally in this file
    buildBrasilConcentracao();  // defined locally in this file
    buildMacroCards();  // defined locally in this file
    buildDcaStatus();  // defined locally in this file
    buildSemaforoPanel();  // defined locally in this file
    window.buildFanChart?.();
  // Fan chart: link P10/P50/P90 ao P(FIRE) MC
  (function() {
    const el = document.getElementById('fanPfireNote');
    if (el && DATA.pfire_aspiracional?.base != null) {
      el.textContent = `P10/P50/P90 são aproximações de trajetória; P(Cenário Aspiracional) = ${DATA.pfire_aspiracional.base}% calculado direto nas 10k simulações MC.`;
    }
  })();
  // updateContrib() — removed pending definition

  // Ativar tab inicial (hoje) — aciona lazy init para a aba hoje
  // Restaurar última tab se disponível; senão, hoje
  // Mapear tabs antigas para novas (caso localStorage tenha tab antiga)
  const _tabMap = { status: 'hoje', aloc: 'carteira', plan: 'fire', projecao: 'fire' };
  let _startTab = 'hoje';
  try {
    const t = localStorage.getItem('dash_tab');
    if (t) _startTab = _tabMap[t] || t;
  } catch(e) {}
  switchTab(_startTab);
  if (window.addDebugLog) window.addDebugLog('✓ init() complete');
  } catch (e) {
    if (window.addDebugLog) window.addDebugLog(`❌ init() ERROR: ${e.message}`);
    console.error('[init] Error:', e);
  }
}

// Force responsive grid override for inline styles at 768px breakpoint
(function() {
  window.forceResponsiveGrids = function forceResponsiveGrids() {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      console.log('[forceResponsiveGrids] window.innerWidth=' + window.innerWidth + ' > 768, skipping');
      return;
    }

    console.log('[forceResponsiveGrids] Running on window.innerWidth=' + window.innerWidth);

    // Selectors with inline grid-template-columns that resist CSS rules
    const selectors = [
      '#r7RiskGrid',
      '.what-if-output',
      '.dynamic-2col'
    ];

    selectors.forEach(sel => {
      const els = document.querySelectorAll(sel);
      console.log('[forceResponsiveGrids] Selector "' + sel + '" found ' + els.length + ' elements');
      els.forEach(el => {
        const style = el.getAttribute('style');
        if (style && (style.includes('grid-template-columns:1fr 1fr') || style.includes('grid-template-columns:repeat(2'))) {
          console.log('[forceResponsiveGrids] Fixing ' + sel + ' style');
          // Remove the inline grid-template-columns and let CSS handle it
          const newStyle = style
            .replace(/grid-template-columns:\s*1fr\s+1fr/gi, 'grid-template-columns: 1fr !important')
            .replace(/grid-template-columns:\s*repeat\(\s*2\s*,/gi, 'grid-template-columns: repeat(1,');
          el.setAttribute('style', newStyle);
        }
      });
    });
  };

  // Run on load
  window.forceResponsiveGrids();

  // Run on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(window.forceResponsiveGrids, 250);
  });
})();
