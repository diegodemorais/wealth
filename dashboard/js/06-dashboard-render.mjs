// ═══════════════════════════════════════════════════════════════
// F8: SANKEY CASH FLOW
// ═══════════════════════════════════════════════════════════════
export function buildSankey() {
  const sk = DATA.sankey_data;
  if (!sk) return;
  const ctx = document.getElementById('sankeyChart');
  if (!ctx) return;

  // Atualizar nota
  const notaEl = document.getElementById('sankeyNota');
  if (notaEl) notaEl.textContent = sk.nota || '';

  const fmt = v => 'R$' + (v/1000).toFixed(0) + 'k';
  const pct = v => (v / sk.renda_total * 100).toFixed(0) + '%';

  // Nomes dos nós (fixos, sem valor embutido — valor aparece no label)
  const N_RENDA   = 'Renda';
  const N_INVEST  = 'Investimentos';
  const N_GASTOS  = 'Gastos';
  const N_IMP     = sk.impostos_estimado ? 'Impostos*' : 'Impostos';
  const N_HIP     = 'Hipoteca';
  const N_MUST    = 'Essenciais';
  const N_LIKE    = 'Discricionários';
  const N_IMPRV   = 'Imprevistos';

  // Estrutura 2 níveis: Renda → {Investimentos, Gastos} → subcategorias
  const flowData = [
    // Nível 1
    { from: N_RENDA,  to: N_INVEST, flow: sk.investimentos },
    { from: N_RENDA,  to: N_GASTOS, flow: sk.gastos_totais },
    // Nível 2
    { from: N_GASTOS, to: N_IMP,   flow: sk.impostos },
    { from: N_GASTOS, to: N_HIP,   flow: sk.hipoteca },
    { from: N_GASTOS, to: N_MUST,  flow: sk.must_outros },
    { from: N_GASTOS, to: N_LIKE,  flow: sk.like_spend },
    { from: N_GASTOS, to: N_IMPRV, flow: sk.imprevistos },
  ];

  // Cores por nó — Gastos usa cinza neutro para não confundir com sub-nós
  const NODE_COLORS = {
    [N_RENDA]:  '#3b82f6',  // azul
    [N_INVEST]: '#22c55e',  // verde
    [N_GASTOS]: '#475569',  // cinza-escuro neutro (era laranja, confundia com sub-nós)
    [N_IMP]:    '#ef4444',  // vermelho
    [N_HIP]:    '#f59e0b',  // âmbar
    [N_MUST]:   '#dc2626',  // vermelho-escuro
    [N_LIKE]:   '#8b5cf6',  // roxo
    [N_IMPRV]:  '#64748b',  // cinza (pequeno — absorvido visualmente em Must Spend)
  };

  if (charts.sankey) { charts.sankey.destroy(); charts.sankey = null; }
  try {
    charts.sankey = new Chart(ctx, {
      type: 'sankey',
      data: {
        datasets: [{
          label: 'Fluxo de Caixa Anual',
          data: flowData,
          colorFrom: (c) => NODE_COLORS[c.dataset.data[c.dataIndex].from] || '#64748b',
          colorTo:   (c) => NODE_COLORS[c.dataset.data[c.dataIndex].to]   || '#64748b',
          colorMode: 'gradient',
          size: 'min',
          // Espaçamento entre nós — aumentado para respiração visual
          nodePadding: 24,
          borderWidth: 0,
          // Labels em branco para legibilidade sobre fundos escuros
          color: '#e2e8f0',
          font: { size: 11 },
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => {
                const d = c.dataset.data[c.dataIndex];
                return ` ${d.from} → ${d.to}: ${fmt(d.flow)} (${pct(d.flow)})`;
              }
            }
          },
          // Label dos nós com valor + % da renda
          sankeyNodeLabel: {
            enabled: true,
            color: '#e2e8f0',
            font: { size: 11 },
            formatter: (node) => {
              const val = typeof node.value !== 'undefined' ? node.value : 0;
              return `${node.label} ${fmt(val)} (${pct(val)})`;
            }
          }
        }
      }
    });
  } catch(e) {
    ctx.parentElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:.8rem;text-align:center;padding:20px">
      ⚠️ Sankey indisponível (plugin não carregado)<br>
      <span style="font-size:.7rem;margin-top:4px">
        Renda: ${fmt(sk.renda_total)} →
        Investimentos: ${fmt(sk.investimentos)} (${pct(sk.investimentos)}) |
        Gastos: ${fmt(sk.gastos_totais)} (${pct(sk.gastos_totais)})<br>
        Impostos: ${fmt(sk.impostos)} · Hipoteca: ${fmt(sk.hipoteca)} ·
        Must: ${fmt(sk.must_outros)} · Like: ${fmt(sk.like_spend)} · Imprevistos: ${fmt(sk.imprevistos)}
      </span>
    </div>`;
  }
}

// ═══════════════════════════════════════════════════════════════
// F10: WELLNESS EXTRAS (3 novas métricas)
// ═══════════════════════════════════════════════════════════════
export function buildWellnessExtras() {
  // Adicionar as 3 métricas ao grid de wellness existente
  const grid = document.getElementById('wellnessGrid');
  if (!grid) return;
  const we = DATA.wellness_extras;
  if (!we) return;

  // Métricas extras integradas no grid principal (sem separador — padrão Boldin)

  const metricasCfg = [
    {
      key: 'cash_flow_12m',
      icon: we.cash_flow_12m.status === 'green' ? '✅' : we.cash_flow_12m.status === 'yellow' ? '⚠️' : '❌',
      label: 'Cash Flow 12m',
      color: we.cash_flow_12m.status === 'green' ? '#22c55e' : we.cash_flow_12m.status === 'yellow' ? '#eab308' : '#ef4444',
      detail: `R$${(Math.abs(we.cash_flow_12m.value)/1000).toFixed(0)}k ${we.cash_flow_12m.value>=0?'positivo':'negativo'}`,
      pct: we.cash_flow_12m.value >= 0 ? 100 : 0,
    },
    {
      key: 'fire_anos_restantes',
      icon: we.fire_anos_restantes.status === 'green' ? '✅' : we.fire_anos_restantes.status === 'yellow' ? '⚠️' : '❌',
      label: `Anos até FIRE@${DATA.premissas.idade_cenario_aspiracional}`,
      color: we.fire_anos_restantes.status === 'green' ? '#22c55e' : we.fire_anos_restantes.status === 'yellow' ? '#eab308' : '#ef4444',
      detail: `${we.fire_anos_restantes.value} anos`,
      pct: Math.max(0, Math.min(100, (17 - we.fire_anos_restantes.value) / 17 * 100)),
    },
    {
      key: 'hipoteca_pct_renda',
      icon: we.hipoteca_pct_renda.status === 'green' ? '✅' : we.hipoteca_pct_renda.status === 'yellow' ? '⚠️' : '❌',
      label: 'Hipoteca % Renda',
      color: we.hipoteca_pct_renda.status === 'green' ? '#22c55e' : we.hipoteca_pct_renda.status === 'yellow' ? '#eab308' : '#ef4444',
      detail: `${we.hipoteca_pct_renda.value}% (Boldin)`,
      pct: Math.max(0, Math.min(100, (40 - we.hipoteca_pct_renda.value) / 40 * 100)),
    },
  ];

  metricasCfg.forEach(m => {
    const div = document.createElement('div');
    div.style.cssText = 'display:grid;grid-template-columns:1.4rem 11rem 1fr 4.5rem 3rem;align-items:center;gap:8px;padding:6px 2px;border-bottom:1px solid rgba(71,85,105,.12)';
    div.innerHTML = `
      <span style="font-size:.82rem;line-height:1">${m.icon}</span>
      <span style="font-size:.75rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.label}</span>
      <div style="height:6px;background:rgba(71,85,105,.25);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${m.pct.toFixed(0)}%;background:${m.color};border-radius:3px;transition:width .4s"></div>
      </div>
      <span style="font-size:.68rem;color:var(--muted);white-space:nowrap;text-align:right">${m.detail}</span>
      <strong style="font-size:.72rem;color:${m.color};white-space:nowrap;text-align:right">+</strong>`;
    grid.appendChild(div);
  });
}

// ═══════════════════════════════════════════════════════════════
// RENDER KPIs + WELLNESS
// ═══════════════════════════════════════════════════════════════
export function renderKPIs() {
  try {
    // Debug — log variables available
    if (window.addDebugLog) {
      window.addDebugLog('renderKPIs: Starting...');
      window.addDebugLog(`  yrInt=${typeof yrInt}, moInt=${typeof moInt}, totalBrl=${typeof totalBrl}`);
    }

    // Hero strip — BRL primário, USD secundário
    document.getElementById('heroPatrimonioBrl').textContent = `R$${(totalBrl/1e6).toFixed(2)}M`;
    document.getElementById('heroPatrimonioUsd').textContent = `$${(totalEquityUsd/1000).toFixed(0)}k em USD`;

    if (window.addDebugLog) window.addDebugLog('✓ Hero patrimônio renderizado');

    const heroPf = document.getElementById('heroPfire');
    const _pfStress = DATA.pfire_base.stress ?? DATA.pfire_base.base;
    const _pfFav = DATA.pfire_base.fav ?? DATA.pfire_base.base;
    if (heroPf) {
      heroPf.textContent = `${Math.round(_pfStress)}–${Math.round(_pfFav)}%`;
      heroPf.style.color = DATA.pfire_base.base >= 90 ? '#22c55e' : DATA.pfire_base.base >= 80 ? '#eab308' : '#ef4444';
      const _heroPfSub = document.getElementById('heroPfireSub');
      if (_heroPfSub) _heroPfSub.textContent = `base ${DATA.pfire_base.base}% · @50: ${DATA.pfire_aspiracional.base}% · MC 10k`;
    }

    // Debug antes de renderizar anos
    if (window.addDebugLog) window.addDebugLog(`  yrInt=${yrInt}, moInt=${moInt}`);

    document.getElementById('heroAnos').textContent = `${yrInt}a ${moInt}m`;
    // Anos sub: Base/Aspir — usar vars module-level
    const _anoFireAlvo = _anoFireAlvoGlobal;
    const _heroAnosSub = document.getElementById('heroAnosSub');
    if (_heroAnosSub) {
      const _idAlvo  = DATA.premissas?.idade_cenario_base          || 53;
      const _idAspir = DATA.premissas?.idade_cenario_aspiracional  || 50;
      _heroAnosSub.textContent = `Base: ${_anoFireAlvo} (${_idAlvo}a) · Aspir: ${_anoFireAspir} (${_idAspir}a)`;
    }

    if (window.addDebugLog) window.addDebugLog('✓ Hero anos renderizado');
  const heroProgEl = document.getElementById('heroProgresso');
  heroProgEl.textContent = fmtPct(progPct);
  heroProgEl.style.color = progPct >= 50 ? '#22c55e' : '#eab308';
  // Progresso sub: gatilho de DATA
  const _heroProgressoSub = document.getElementById('heroProgressoSub');
  if (_heroProgressoSub) _heroProgressoSub.textContent = `vs gatilho R$${(PAT_GATILHO/1e6).toFixed(1)}M`;
  const _aporteHero = DATA.premissas.aporte_mensal;
  const _rendaHero = DATA.premissas.renda_estimada ?? 45000;
  const srHero = _aporteHero / _rendaHero;
  const heroSrEl = document.getElementById('heroSavings');
  if (heroSrEl) {
    heroSrEl.textContent = fmtPct(srHero * 100);
    heroSrEl.style.color = srHero >= 0.5 ? '#22c55e' : srHero >= 0.4 ? '#eab308' : '#ef4444';
    const heroSrSubEl = document.getElementById('heroSavingsSub');
    if (heroSrSubEl) heroSrSubEl.textContent = `R$${(_aporteHero/1000).toFixed(0)}k aporte / R$${(_rendaHero/1000).toFixed(0)}k renda`;
  }

  // KPI 1: P(Cenário Aspiracional) — fonte: DATA.pfire_aspiracional.base
  (function() {
    const el    = document.getElementById('kpiPfire50');
    const subEl = document.getElementById('kpiPfire50Sub');
    if (!el) return;
    const p = DATA.pfire_aspiracional?.base;
    if (p != null) {
      el.textContent = p.toFixed(1) + '%';
      el.style.color = p >= 80 ? '#22c55e' : p >= 60 ? '#eab308' : '#ef4444';
      if (subEl) subEl.textContent = `fav ${(DATA.pfire_aspiracional?.fav ?? p).toFixed(0)}% · stress ${(DATA.pfire_aspiracional?.stress ?? p).toFixed(0)}%`;
    }
  })();

  // KPI 2: IPCA+ 2040 taxa + badge DCA ativo/pausado + semáforo
  const _kpiIpca = DATA.rf?.ipca2040?.taxa;
  const _kpiPisoIpca = DATA.pisos?.pisoTaxaIpcaLongo;
  const _kpiIpcaEl = document.getElementById('kpiIpcaTaxa');
  const _kpiIpcaSubEl = document.getElementById('kpiIpcaSub');
  const _kpiIpcaSem = document.getElementById('kpiIpcaSemaforo');
  if (_kpiIpcaEl && _kpiIpca != null && _kpiPisoIpca != null) {
    const _dcaAtivo = _kpiIpca >= _kpiPisoIpca;
    _kpiIpcaEl.textContent = _kpiIpca.toFixed(2) + '%';
    _kpiIpcaEl.style.color = _dcaAtivo ? '#22c55e' : '#eab308';
    if (_kpiIpcaSubEl) _kpiIpcaSubEl.textContent = `piso ${_kpiPisoIpca.toFixed(1)}% · ${_dcaAtivo ? '✓ DCA ativo' : '⚠ pausar DCA'}`;
    if (_kpiIpcaSem) _kpiIpcaSem.style.background = _dcaAtivo ? '#22c55e' : '#eab308';
  } else {
    if (_kpiIpcaEl) _kpiIpcaEl.textContent = '—';
    if (_kpiIpcaSubEl) _kpiIpcaSubEl.textContent = 'aguardando dados';
  }

  // KPI 3: Renda+ 2065 taxa + badge compra/manter/venda + semáforo
  (function() {
    const el    = document.getElementById('kpiRenda2065');
    const subEl = document.getElementById('kpiRenda2065Sub');
    const sem   = document.getElementById('kpiRendaSemaforo');
    if (!el) return;
    const taxa      = DATA.rf?.renda2065?.taxa;
    const pisoCompra = DATA.pisos?.pisoTaxaRendaPlus;
    const pisoVenda  = DATA.pisos?.pisoVendaRendaPlus;
    if (taxa != null && pisoCompra != null && pisoVenda != null) {
      el.textContent = taxa.toFixed(2) + '%';
      if (taxa >= pisoCompra) {
        el.style.color = '#22c55e';
        if (subEl) subEl.textContent = `✓ compra ≥${pisoCompra.toFixed(1)}%`;
        if (sem) sem.style.background = '#22c55e';
      } else if (taxa >= pisoVenda) {
        el.style.color = '#eab308';
        if (subEl) subEl.textContent = `⚠ manter ${pisoVenda.toFixed(1)}–${pisoCompra.toFixed(1)}%`;
        if (sem) sem.style.background = '#eab308';
      } else {
        el.style.color = '#ef4444';
        if (subEl) subEl.textContent = `✕ vender ≤${pisoVenda.toFixed(1)}%`;
        if (sem) sem.style.background = '#ef4444';
      }
    } else {
      el.textContent = '—'; if (subEl) subEl.textContent = 'aguardando dados';
    }
  })();

  // KPI 4: Bond Pool Runway — fonte: DATA.fire.bond_pool_readiness
  (function() {
    const el    = document.getElementById('kpiBondPool');
    const subEl = document.getElementById('kpiBondPoolSub');
    if (!el) return;
    const bp = DATA.fire?.bond_pool_readiness;
    const anos = bp?.anos_gastos;
    const meta  = bp?.meta_anos ?? 7;
    if (anos != null) {
      el.textContent = anos.toFixed(1) + 'a';
      el.style.color = anos >= meta ? '#22c55e' : anos >= meta * 0.5 ? '#eab308' : '#ef4444';
      if (subEl) subEl.textContent = `meta ${meta}a · ${(anos / meta * 100).toFixed(0)}% construído`;
    } else {
      el.textContent = '—'; if (subEl) subEl.textContent = `meta ${meta}a`;
    }
  })();

  // KPI Drift Máximo (#4 — primário)
  (function() {
    const el    = document.getElementById('kpiDriftMax');
    const subEl = document.getElementById('kpiDriftMaxSub');
    if (!el) return;
    const maxDrift = Math.max(...Object.values(DATA.drift).map(d => Math.abs(d.atual - d.alvo)));
    const maxBucket = Object.entries(DATA.drift).reduce((best, [k, d]) => {
      const gap = Math.abs(d.atual - d.alvo);
      return gap > (best ? Math.abs(DATA.drift[best].atual - DATA.drift[best].alvo) : -1) ? k : best;
    }, null);
    el.textContent = maxDrift.toFixed(1) + 'pp';
    el.style.color = maxDrift <= 5 ? '#22c55e' : maxDrift <= 10 ? '#eab308' : '#ef4444';
    if (subEl && maxBucket) {
      const mb = DATA.drift[maxBucket];
      const sign = (mb.atual - mb.alvo) >= 0 ? '+' : '';
      subEl.textContent = `${maxBucket} ${sign}${(mb.atual - mb.alvo).toFixed(1)}pp vs alvo`;
    }
  })();


  // KPI 5: Alpha ITD vs SWRD — backtest (source: backtest.metrics) (#13)
  (function() {
    const el    = document.getElementById('kpiDelta');
    const subEl = document.getElementById('kpiDeltaSub');
    if (!el) return;
    const btTarget  = DATA.backtest?.metrics?.target?.cagr;
    const btShadowA = DATA.backtest?.metrics?.shadowA?.cagr;
    const sh = DATA.shadows;
    if (btTarget != null && btShadowA != null) {
      const delta = btTarget - btShadowA;
      el.textContent = (delta >= 0 ? '+' : '') + delta.toFixed(2) + 'pp';
      el.style.color = delta >= 0 ? '#22c55e' : '#ef4444';
      // #13: sub-label com período e método
      if (subEl) subEl.innerHTML = `CAGR backtest · desde 2021 · ${btTarget.toFixed(1)}% vs SWRD ${btShadowA.toFixed(1)}%`;
    } else if (sh?.delta_vwra != null) {
      const delta = sh.delta_vwra;
      el.textContent = (delta >= 0 ? '+' : '') + delta.toFixed(2) + 'pp';
      el.style.color = delta >= 0 ? '#22c55e' : '#ef4444';
      if (subEl) subEl.textContent = `CAGR backtest · ${sh.periodo || 'período parcial'}`;
    } else {
      el.textContent = '—'; if (subEl) subEl.textContent = 'CAGR backtest · tracking em andamento';
    }
  })();

  // KPI 7: Factor Signal — excess return AVGS vs SWRD (YTD)
  (function() {
    const el    = document.getElementById('kpiFactorSignal');
    const subEl = document.getElementById('kpiFactorSignalSub');
    if (!el) return;
    const fs = DATA.factor_signal;
    if (!fs) { el.textContent = '—'; if (subEl) subEl.textContent = 'aguardando dados'; return; }
    const ex = fs.excess_ytd_pp;
    el.textContent = (ex >= 0 ? '+' : '') + ex.toFixed(1) + 'pp YTD';
    el.style.color = ex >= 0 ? '#22c55e' : '#ef4444';
    if (subEl) {
      const exL = fs.excess_since_launch_pp;
      const mo  = Math.round(fs.meses_desde_launch);
      subEl.textContent = `since oct/24 (${mo}m): ${(exL >= 0 ? '+' : '') + exL.toFixed(1)}pp · ⚠️ período curto`;
    }
  })();

  // KPI 8: Aporte do Mês — realizado vs meta
  (function() {
    const el    = document.getElementById('kpiOrigemPat');
    const subEl = document.getElementById('kpiOrigemPatSub');
    if (!el) return;
    const p      = DATA.premissas ?? {};
    const meta   = p.aporte_mensal;
    const real   = p.ultimo_aporte_brl;
    const mesRef = p.ultimo_aporte_data ?? '';
    if (!meta && !real) { el.textContent = '—'; if (subEl) subEl.textContent = 'sem dados'; return; }
    if (real != null) {
      const delta    = real - (meta ?? 0);
      const deltaFmt = (delta >= 0 ? '+' : '') + 'R$' + Math.round(Math.abs(delta) / 1000) + 'k';
      const color    = delta >= 0 ? '#22c55e' : '#f97316';
      el.innerHTML   = `R$${(real / 1000).toFixed(0)}k <span style="color:${color};font-size:.75em">${delta >= 0 ? '▲' : '▼'} ${deltaFmt}</span>`;
      el.style.color = '';
      if (subEl) {
        const metaStr = meta ? ` · meta R$${(meta/1000).toFixed(0)}k` : '';
        subEl.textContent = `${mesRef}${metaStr}`;
      }
    } else if (meta) {
      el.innerHTML   = `R$${(meta / 1000).toFixed(0)}k`;
      el.style.color = '';
      if (subEl) subEl.textContent = 'meta mensal (sem dado real)';
    }
  })();

  // KPI row 2: mercado snapshot (Dólar, BTC, IPCA+ taxa, Renda+ taxa) + MtD
  (function() {
    const m = DATA.mercado ?? {};

    // Helper: seta + variação MtD
    // delta: número (% ou pp) | mode: 'pct' | 'pp' | up_good: bool (seta verde se sobe)
    function _mtdBadge(delta, mode, up_good) {
      if (delta == null) return '';
      const up    = delta > 0;
      const zero  = Math.abs(delta) < 0.005;
      const arrow = zero ? '→' : (up ? '↑' : '↓');
      const good  = zero ? null : (up === up_good);
      const color = good == null ? '#94a3b8' : (good ? '#22c55e' : '#ef4444');
      const str   = mode === 'pp'
        ? (delta > 0 ? '+' : '') + delta.toFixed(2) + 'pp'
        : (delta > 0 ? '+' : '') + delta.toFixed(1) + '%';
      return `<span style="color:${color};font-size:.7em;margin-left:3px">${arrow} ${str} MtD</span>`;
    }

    // Dólar BRL
    (function() {
      const el    = document.getElementById('kpiCambio');
      const subEl = document.querySelector('#kpiCambio + .kpi-sub, #kpiCambio ~ .kpi-sub');
      if (!el) return;
      const fx = m.cambio_brl_usd ?? DATA.cambio;
      el.innerHTML = (fx != null ? 'R$' + fx.toFixed(3) : '—') + _mtdBadge(m.cambio_mtd_pct, 'pct', false);
    })();

    // Bitcoin USD
    (function() {
      const el = document.getElementById('kpiBtcUsd');
      if (!el) return;
      const btc = m.btc_usd ?? DATA.macro?.bitcoin_usd;
      el.innerHTML = (btc != null ? '$' + Math.round(btc).toLocaleString('pt-BR') : '—') + _mtdBadge(m.btc_mtd_pct, 'pct', true);
    })();

    // IPCA+ 2040 — taxa de mercado + badge DCA + MtD
    (function() {
      const el    = document.getElementById('kpiIpcaMercado');
      const subEl = document.getElementById('kpiIpcaMercadoSub');
      if (!el) return;
      const taxa = DATA.rf?.ipca2040?.taxa;
      if (taxa == null) { el.textContent = '—'; return; }
      el.innerHTML = taxa.toFixed(2) + '%' + _mtdBadge(m.ipca2040_mtd_pp, 'pp', true);
      if (subEl) {
        const piso  = DATA.pisos?.pisoTaxaIpcaLongo ?? 6.0;
        const ativo = taxa >= piso;
        subEl.textContent = (ativo ? '● DCA ativo' : '● pausado') + ' (piso ' + piso.toFixed(1) + '%)';
        subEl.style.color = ativo ? '#22c55e' : '#ef4444';
      }
    })();

    // Renda+ 2065 — taxa de mercado + badge compra/manter/venda + MtD
    (function() {
      const el    = document.getElementById('kpiRendaMercado');
      const subEl = document.getElementById('kpiRendaMercadoSub');
      if (!el) return;
      const taxa = DATA.rf?.renda2065?.taxa;
      if (taxa == null) { el.textContent = '—'; return; }
      el.innerHTML = taxa.toFixed(2) + '%' + _mtdBadge(m.renda2065_mtd_pp, 'pp', true);
      if (subEl) {
        const pisoC = DATA.pisos?.pisoTaxaRendaPlus  ?? 6.5;
        const pisoV = DATA.pisos?.pisoVendaRendaPlus ?? 6.0;
        let label, color;
        if (taxa >= pisoC)      { label = '● compra (>' + pisoC.toFixed(1) + '%)'; color = '#22c55e'; }
        else if (taxa >= pisoV) { label = '● manter (' + pisoV.toFixed(1) + '–' + pisoC.toFixed(1) + '%)'; color = '#eab308'; }
        else                    { label = '● venda (<' + pisoV.toFixed(1) + '%)'; color = '#ef4444'; }
        subEl.textContent = label;
        subEl.style.color = color;
      }
    })();
  })();

  // Fire scenario grid — 6 cards (3 estados × 2 idades)
  (function buildFireGrid() {
    const grid = document.getElementById('fireScenarioGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const ss = DATA.spendingSensibilidade || [];
    const base53 = DATA.pfire_base.base, base50 = DATA.pfire_aspiracional.base;
    const casado53 = ss[1]?.base ?? null;
    const filho53  = ss[2]?.base ?? null;
    const deltaCasado = casado53 - base53;
    const deltaFilho  = filho53  - base53;
    const casado50 = Math.max(0, Math.round((base50 + deltaCasado) * 10) / 10);
    const filho50  = Math.max(0, Math.round((base50 + deltaFilho)  * 10) / 10);
    const _anoAtual = DATA.premissas.ano_atual ?? new Date().getFullYear();
    const _idadeAtual = DATA.premissas.idade_atual;
    const _idadeFire53 = DATA.premissas.idade_cenario_base;
    const _idadeFire50 = DATA.premissas.idade_cenario_aspiracional;
    const ano53 = _anoAtual + (_idadeFire53 - _idadeAtual);
    const ano50 = _anoAtual + (_idadeFire50 - _idadeAtual);
    const _priv = document.body.classList.contains('private-mode');
    const tagCasado = ss[1] ? (_priv ? 'Casado' : `R$${(ss[1].custo/1000).toFixed(0)}k/ano`) : 'Casado';
    const tagFilho  = ss[2] ? (_priv ? 'c/ Filho' : `R$${(ss[2].custo/1000).toFixed(0)}k/ano`) : 'c/ Filho';
    const grupos = [
      { label: 'Solteiro', icon: '🧑', color: '#3b82f6',
        cards: [
          { age: _idadeFire50, p: base50,  tag: '🚀 Aspiracional', year: ano50, chosen: false },
          { age: _idadeFire53, p: base53,  tag: '✅ Escolhida',    year: ano53, chosen: true },
        ]},
      { label: 'Casado',   icon: '💍', color: '#8b5cf6',
        cards: [
          { age: _idadeFire50, p: casado50, tag: 'Aprox.',     year: ano50, chosen: false },
          { age: _idadeFire53, p: casado53, tag: tagCasado,    year: ano53, chosen: false },
        ]},
      { label: 'c/ Filho', icon: '👨‍👩‍👧', color: '#06b6d4',
        cards: [
          { age: _idadeFire50, p: filho50,  tag: 'Aprox.',     year: ano50, chosen: false },
          { age: _idadeFire53, p: filho53,  tag: tagFilho,     year: ano53, chosen: false },
        ]},
    ];
    grupos.forEach(g => {
      const col = document.createElement('div');
      col.style.cssText = 'display:flex;flex-direction:column;gap:8px';
      const header = document.createElement('div');
      header.style.cssText = `font-size:.65rem;font-weight:700;color:${g.color};text-transform:uppercase;letter-spacing:.5px;text-align:center;padding:2px 0`;
      header.textContent = `${g.icon} ${g.label}`;
      col.appendChild(header);
      g.cards.forEach(c => {
        const pColor = c.p >= 90 ? '#22c55e' : c.p >= 80 ? '#eab308' : '#ef4444';
        const card = document.createElement('div');
        card.className = 'scenario-card' + (c.chosen ? ' chosen' : '');
        card.style.cssText = 'text-align:center;padding:10px 8px';
        card.innerHTML = `
          <div style="font-size:.6rem;color:${c.chosen ? 'var(--accent)' : 'var(--muted)'};margin-bottom:3px">${c.tag}</div>
          <div style="font-size:1.3rem;font-weight:700">FIRE ${c.age}</div>
          <div style="font-size:.9rem;font-weight:600;color:${pColor};margin:2px 0">P = ${c.p}%</div>
          <div style="font-size:.6rem;color:var(--muted)">${c.year}</div>
        `;
        col.appendChild(card);
      });
      grid.appendChild(col);
    });
  })();
  const _idadeFireAlvo = DATA.premissas.idade_cenario_base;
  document.getElementById('fireCountdown').textContent = `${yrInt} anos ${moInt} meses · ${_anoFire} (${_idadeFireAlvo} anos)`;
  const patInicio = DATA.timeline?.values?.[0] || DATA.premissas.patrimonio_inicial || DATA.premissas.patrimonio_atual;
  const fbPct = Math.min(100, (Math.log(totalBrl/patInicio) / Math.log(PAT_GATILHO/patInicio)) * 100);
  document.getElementById('fireProgressBar').style.width = fbPct + '%';
  document.getElementById('fireProgressLabel').textContent = `Atual R$${(totalBrl/1e6).toFixed(2)}M`;
  // Extremidades da barra: start = primeiro ponto da série, end = gatilho
  const _fpStart = document.getElementById('fireProgressStart');
  const _fpEnd   = document.getElementById('fireProgressEnd');
  if (_fpStart && DATA.timeline.labels.length) {
    const _startYm = DATA.timeline.labels[0];
    const _startVal = DATA.timeline.values[0];
    _fpStart.textContent = `${fmtMonthLabel(_startYm)} (R$${(_startVal/1e6).toFixed(1)}M)`;
  }
  if (_fpEnd) _fpEnd.textContent = `${_anoFireAlvo} (R$${(PAT_GATILHO/1e6).toFixed(1)}M)`;
  document.getElementById('fireProgPct').textContent = fmtPct(progPct);
  const _gatilhoStr = `R$${(PAT_GATILHO/1e6).toFixed(1)}M`;
  document.getElementById('fireProgLabel').textContent = `R$${(DATA.premissas.patrimonio_atual/1e6).toFixed(2)}M / ${_gatilhoStr}`;
  document.getElementById('fireProgFill').style.width = Math.min(100, progPct) + '%';
  document.getElementById('pfirePatLabel').textContent = `R$${(DATA.premissas.patrimonio_atual/1e6).toFixed(2)}M / ${_gatilhoStr}`;
  document.getElementById('pfirePatPct').textContent = fmtPct(progPct);
  document.getElementById('pfirePatFill').style.width = Math.min(100, progPct) + '%';
  // P(Cenário Base) cenários — 3 cards com badges coloridos
  function _pfireBadgeStyle(v) {
    if (v == null) return 'background:rgba(71,85,105,.3);color:var(--muted)';
    if (v >= 90) return 'background:rgba(34,197,94,.25);color:var(--green)';
    if (v >= 85) return 'background:rgba(59,130,246,.25);color:var(--accent)';
    if (v >= 75) return 'background:rgba(234,179,8,.25);color:var(--yellow)';
    return 'background:rgba(239,68,68,.25);color:var(--red)';
  }
  function _pfireColor(v) {
    if (v == null) return 'var(--muted)';
    if (v >= 90) return '#22c55e';
    if (v >= 85) return '#3b82f6';
    if (v >= 75) return '#eab308';
    return '#ef4444';
  }
  const _p53Base = document.getElementById('pfire_baseBase');
  const _p53Fav  = document.getElementById('pfire_baseFav');
  const _p53St   = document.getElementById('pfire_baseStress');
  if (_p53Base) { _p53Base.textContent = `${DATA.pfire_base.base ?? '—'}%`; _p53Base.style.color = _pfireColor(DATA.pfire_base.base); }
  if (_p53Fav)  { _p53Fav.textContent  = `${DATA.pfire_base.fav  ?? '—'}%`; _p53Fav.style.color  = _pfireColor(DATA.pfire_base.fav); }
  if (_p53St)   { _p53St.textContent   = `${DATA.pfire_base.stress ?? '—'}%`; _p53St.style.color = _pfireColor(DATA.pfire_base.stress); }
  const _b53Base = document.getElementById('pfire_baseBaseBadge'); if (_b53Base) { _b53Base.style.cssText += ';' + _pfireBadgeStyle(DATA.pfire_base.base); _b53Base.textContent = 'Base'; }
  const _b53Fav  = document.getElementById('pfire_baseFavBadge');  if (_b53Fav)  { _b53Fav.style.cssText  += ';' + _pfireBadgeStyle(DATA.pfire_base.fav);  _b53Fav.textContent  = 'Favorável'; }
  const _b53St   = document.getElementById('pfire_baseStressBadge'); if (_b53St) { _b53St.style.cssText   += ';' + _pfireBadgeStyle(DATA.pfire_base.stress); _b53St.textContent = 'Stress'; }
  // FIRE meta label
  const _pfMeta = document.getElementById('pfirePatMeta');
  if (_pfMeta) _pfMeta.textContent = `Meta: patrimônio ≥ ${_gatilhoStr} E SWR ≤ ${((DATA.premissas.swr_gatilho ?? 0.024)*100).toFixed(1)}%`;
  // SWR no FIRE Day
  const swrFireDay = DATA.fire_swr_percentis?.swr_p50 ?? 0.0217;
  const _swrEl = document.getElementById('swrFireDayVal');
  const _swrSubEl = document.getElementById('swrFireDaySub');
  if (_swrEl) { _swrEl.textContent = fmtPct(swrFireDay * 100, 2); }
  if (_swrSubEl) _swrSubEl.textContent = `R$${(DATA.premissas.custo_vida_base/1000).toFixed(0)}k / ${_gatilhoStr} · Meta ≤ ${((DATA.premissas.swr_gatilho ?? 0.024)*100).toFixed(1)}%`;
  const _aporteKPI = DATA.premissas.aporte_mensal;
  const _rendaEstimadaKPI = DATA.premissas.renda_estimada ?? 45000;
  const sr = _aporteKPI / _rendaEstimadaKPI;
  // Card "Aporte do Mês" — mostra valor BRL do aporte
  const _srEl = document.getElementById('savingsRate');
  if (_srEl && _aporteKPI != null) {
    _srEl.textContent = `R$${(_aporteKPI/1000).toFixed(0)}k`;
    _srEl.style.color = '#22c55e';
  }
  document.getElementById('savingsRateFill').style.width = Math.min(100, sr * 2 * 100) + '%'; // 50% = full bar
  const srSubEl = document.getElementById('savingsRateSub');
  if (srSubEl) srSubEl.textContent = `${fmtPct(sr*100)} savings rate · renda est. R$${(_rendaEstimadaKPI/1000).toFixed(0)}k/mês`;
  const srNoteEl = document.getElementById('savingsRateNote');
  if (srNoteEl) srNoteEl.textContent = `≥50% excelente · ≥40% ok · ≥25% atenção`;

  // TER — lê de wellness_config
  const _terCfgKPI = (DATA.wellness_config?.metrics || []).find(m => m.id === 'ter') || {};
  const _ct = _terCfgKPI.current_ter ?? 0.247;
  const _bt = _terCfgKPI.benchmark_ter ?? 0.220;
  const _delta = (_ct - _bt) * 100; // em bps
  const _terEl = document.getElementById('terCarteira');
  if (_terEl) _terEl.textContent = `${_ct.toFixed(3)}%`;
  const _tcL = document.getElementById('terCarteiraLabel'); if (_tcL) _tcL.textContent = `${_ct.toFixed(3)}%`;
  const _tvL = document.getElementById('terVwraLabel');    if (_tvL) _tvL.textContent = `${_bt.toFixed(3)}%`;
  const _tdL = document.getElementById('terDeltaLabel');
  const _alphaAnual = (_terCfgKPI.alpha_anual ?? 0.00160) * 100;
  if (_tdL) _tdL.textContent = `Delta +${_delta.toFixed(1)}bps vs VWRA · Alpha ~${_alphaAnual.toFixed(2)}%/ano`;
  // Barras relativas: maior (carteira) = 100% visual, vwra = proporcional
  const _tcF = document.getElementById('terCarteiraFill'); if (_tcF) _tcF.style.width = '100%';
  const _tvF = document.getElementById('terVwraFill');    if (_tvF) _tvF.style.width = `${(_bt/_ct*100).toFixed(0)}%`;

  // IPCA+ taxa vs piso
  const _taxaIpcaKPI = DATA.rf?.ipca2040?.taxa;
  const _pisoIpcaKPI = DATA.pisos?.pisoTaxaIpcaLongo ?? 6.0;
  const _ipcaTVP = document.getElementById('ipcaTaxaVsPiso');
  if (_ipcaTVP && _taxaIpcaKPI) _ipcaTVP.textContent = `${_taxaIpcaKPI.toFixed(2)}% vs ${_pisoIpcaKPI.toFixed(1)}%`;
  const _ipcaSt = document.getElementById('ipcaTaxaStatus');
  if (_ipcaSt) _ipcaSt.textContent = _taxaIpcaKPI >= _pisoIpcaKPI
    ? `Alvo IPCA+: ≥${_pisoIpcaKPI}% · Atual: acima — janela DCA ativa`
    : `Alvo IPCA+: ≥${_pisoIpcaKPI}% · Atual: abaixo do piso`;
  const _ipcaFill = document.getElementById('ipcaTaxaFill');
  if (_ipcaFill && _taxaIpcaKPI) _ipcaFill.style.width = Math.min(100, _taxaIpcaKPI / (_pisoIpcaKPI * 1.5) * 100) + '%';
  } catch (e) {
    if (window.addDebugLog) window.addDebugLog(`❌ renderKPIs ERROR: ${e.message}`);
    console.error('[renderKPIs] Error:', e);
  }
}

// ── Próximas Ações (gerado dinamicamente) ─────────────────────
export function renderProximasAcoes() {
  const el = document.getElementById('proximasAcoesBody');
  if (!el) return;
  const pisoIpca  = DATA.pisos?.pisoTaxaIpcaLongo ?? 6.0;
  const pisoRenda = DATA.pisos?.pisoTaxaRendaPlus  ?? 6.5;
  const taxaIpca  = DATA.rf?.ipca2040?.taxa;
  const taxaRenda = DATA.rf?.renda2065?.taxa;
  const ipcaGap   = DATA.drift?.IPCA ? (DATA.drift.IPCA.alvo - DATA.drift.IPCA.atual) : null;
  const ipca_active  = taxaIpca  != null && taxaIpca  >= pisoIpca  && ipcaGap > 0;
  const renda_active = taxaRenda != null && taxaRenda >= pisoRenda;
  // Bucket equity mais subpeso
  const eqBuckets = ['SWRD','AVGS','AVEM']
    .map(k => ({ k, gap: (DATA.drift[k]?.alvo ?? 0) - (DATA.drift[k]?.atual ?? 0) }))
    .sort((a,b) => b.gap - a.gap);
  const topBucket = eqBuckets[0];
  let html = '';
  let n = 1;
  if (ipca_active) {
    html += `<div class="prio"><span class="prio-num">${n++}.</span> <strong>IPCA+ longo DCA ativo</strong> — taxa ~${taxaIpca.toFixed(2)}% ≥ piso ${pisoIpca.toFixed(1)}% → <em>janela ativa, prioridade máxima</em>. Gap −${ipcaGap.toFixed(1)}pp vs alvo ${DATA.drift.IPCA.alvo}%. Comprar TD 2040 (80%) + TD 2050 (20%). <span style="color:var(--muted);font-size:.75em">IPCA+ tem prioridade enquanto taxa ≥ ${pisoIpca.toFixed(1)}% (janela ativa)</span></div>`;
  }
  if (renda_active) {
    html += `<div class="prio"><span class="prio-num">${n++}.</span> <strong>Renda+ 2065 DCA</strong> — taxa ~${taxaRenda.toFixed(2)}% ≥ piso ${pisoRenda.toFixed(1)}% → segunda prioridade cascade. Gap vs alvo: manter posição atual, aumentar se oportunidade.</div>`;
  }
  if (topBucket && topBucket.gap > 0) {
    html += `<div class="prio"><span class="prio-num">${n++}.</span> <strong>Equity → ${topBucket.k}.L</strong> — underweight −${topBucket.gap.toFixed(1)}pp. Caso IPCA+ e Renda+ já atingidos ou taxa abaixo dos pisos: aportar ${topBucket.k} (equity mais subpeso).</div>`;
  }
  html += `<div class="prio-warn">🔔 <strong>Gatilho:</strong> AVGS underperformance — verificar rolling 12m vs SWRD trimestralmente.</div>`;
  // Evento de vida iminente (de DATA.eventos_vida)
  const evs = DATA.eventos_vida || [];
  evs.forEach(ev => {
    if (ev.status === 'planejado') {
      html += `<div class="prio-warn">📋 <strong>${ev.evento} iminente (${ev.data_est})</strong> — ${ev.acoes.slice(0,2).join(' · ')}</div>`;
    }
  });
  if (!html) {
    // Tudo verde — mensagem positiva e visual verde
    const box = document.getElementById('proximasAcoes');
    if (box) {
      box.style.background = 'rgba(34,197,94,.08)';
      box.style.borderColor = 'rgba(34,197,94,.3)';
      const h2 = box.querySelector('h2');
      if (h2) { h2.style.color = 'var(--green)'; h2.textContent = '✅ Próximas Ações'; }
    }
    el.innerHTML = '<div style="color:var(--green);font-size:.85rem;text-align:center;padding:8px 0">Nenhuma ação necessária — carteira alinhada com o plano. Próxima revisão no check-in mensal.</div>';
  } else {
    el.innerHTML = html;
  }
}

// ── RF Cards (gerado dinamicamente) ───────────────────────────
export function buildRfCards() {
  const el = document.getElementById('rfCardsGrid');
  if (!el) return;
  const rf = DATA.rf || {};
  const pisoRenda = DATA.pisos?.pisoTaxaRendaPlus ?? 6.5;
  const pisoIpca  = DATA.pisos?.pisoTaxaIpcaLongo ?? 6.0;

  const thStyle = 'padding:6px 10px;font-size:.65rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap';
  const tdStyle = 'padding:7px 10px;font-size:.75rem;color:var(--text);white-space:nowrap';
  const tdMuted = 'padding:7px 10px;font-size:.72rem;color:var(--muted);white-space:nowrap';

  const tipoBadge = t => {
    if (!t) return '';
    const colors = { reserva: '#3b82f6', estrutural: '#22c55e', tatico: '#f97316' };
    return `<span style="font-size:.58rem;background:${colors[t]||'#64748b'}22;color:${colors[t]||'#94a3b8'};border:1px solid ${colors[t]||'#64748b'}44;border-radius:3px;padding:1px 5px;margin-left:5px;vertical-align:middle">${t}</span>`;
  };

  const pnlCell = (val, custo, tdSt) => {
    if (val == null || custo == null || custo === 0) return `<td style="${tdSt};text-align:right;color:var(--muted)">—</td>`;
    const pnl = val - custo;
    const pct = (pnl / custo * 100);
    const color = pnl >= 0 ? 'var(--green)' : 'var(--red)';
    const sign = pnl >= 0 ? '+' : '';
    return `<td style="${tdSt};text-align:right;color:${color}">${sign}${(pnl/1000).toFixed(1)}k<br><span style="font-size:.65rem">${sign}${pct.toFixed(1)}%</span></td>`;
  };

  // ── RF Rows ──
  const rfRows = [
    {
      label: 'IPCA+ 2029', tipo: rf.ipca2029?.tipo || 'reserva', custod: 'Nubank',
      val: rf.ipca2029?.valor, custo: rf.ipca2029?.custo_base_brl,
      taxa: rf.ipca2029?.taxa, piso: pisoIpca, venc: '2029',
      nota: rf.ipca2029?.notas || 'Reserva emergência',
      status: null, statusColor: null,
    },
    {
      label: 'IPCA+ 2040', tipo: rf.ipca2040?.tipo || 'estrutural', custod: 'XP',
      val: rf.ipca2040?.valor, custo: rf.ipca2040?.custo_base_brl,
      taxa: rf.ipca2040?.taxa, piso: pisoIpca, venc: '2040',
      nota: rf.ipca2040?.notas || 'DCA ativo · HTM (80%)',
      status: rf.ipca2040?.taxa != null ? (rf.ipca2040.taxa >= pisoIpca ? 'verde' : 'amarelo') : null,
      statusColor: rf.ipca2040?.taxa != null ? (rf.ipca2040.taxa >= pisoIpca ? 'var(--green)' : 'var(--yellow)') : null,
    },
    {
      label: 'IPCA+ 2050', tipo: rf.ipca2050?.tipo || 'estrutural', custod: 'XP',
      val: rf.ipca2050?.valor, custo: rf.ipca2050?.custo_base_brl,
      taxa: rf.ipca2050?.taxa, piso: pisoIpca, venc: '2050',
      nota: rf.ipca2050?.notas || 'DCA ativo · HTM (20%)',
      status: rf.ipca2050?.taxa != null ? (rf.ipca2050.taxa >= pisoIpca ? 'verde' : 'amarelo') : null,
      statusColor: rf.ipca2050?.taxa != null ? (rf.ipca2050.taxa >= pisoIpca ? 'var(--green)' : 'var(--yellow)') : null,
    },
    {
      label: 'Renda+ 2065', tipo: rf.renda2065?.tipo || 'tatico', custod: 'Nubank',
      val: rf.renda2065?.valor, custo: rf.renda2065?.custo_base_brl,
      taxa: rf.renda2065?.taxa, piso: pisoRenda, venc: '2065',
      nota: (() => {
        const dg = rf.renda2065?.distancia_gatilho;
        if (dg?.gap_pp != null) return `Gap gatilho: ${dg.gap_pp.toFixed(2)}pp`;
        return rf.renda2065?.notas || `Gatilho ≤${pisoRenda.toFixed(1)}%`;
      })(),
      status: rf.renda2065?.distancia_gatilho?.status || null,
      statusColor: (() => {
        const s = rf.renda2065?.distancia_gatilho?.status;
        return s === 'verde' ? 'var(--green)' : s === 'amarelo' ? 'var(--yellow)' : s ? 'var(--red)' : null;
      })(),
    },
  ];

  let html = `<table style="width:100%;border-collapse:collapse;margin-bottom:14px">
    <thead><tr style="border-bottom:1px solid rgba(71,85,105,.3)">
      <th style="${thStyle};text-align:left">Instrumento</th>
      <th style="${thStyle};text-align:right">Valor</th>
      <th style="${thStyle};text-align:right">P&amp;L</th>
      <th style="${thStyle};text-align:right">Taxa IPCA+</th>
      <th style="${thStyle};text-align:right">Venc.</th>
      <th style="${thStyle};text-align:left">Nota</th>
      <th style="${thStyle};text-align:center">Status</th>
    </tr></thead><tbody>`;

  rfRows.forEach((r, i) => {
    const bg = i % 2 === 0 ? 'background:var(--card2)' : '';
    const valStr = r.val != null ? `R$ ${(r.val/1000).toFixed(1)}k` : '—';
    const taxaColor = r.taxa != null && r.piso != null && r.taxa >= r.piso ? 'color:var(--green)' : r.taxa != null ? 'color:var(--yellow)' : '';
    const taxaStr = r.taxa != null ? `${r.taxa.toFixed(2)}%` : '—';
    const statusDot = r.status
      ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${r.statusColor}"></span>`
      : '—';
    html += `<tr style="${bg}">
      <td style="${tdStyle};font-weight:700">${r.label}${tipoBadge(r.tipo)}</td>
      <td style="${tdStyle};text-align:right" class="pv">${valStr}</td>
      ${pnlCell(r.val, r.custo, tdStyle)}
      <td style="${tdStyle};text-align:right;${taxaColor}">${taxaStr}</td>
      <td style="${tdMuted};text-align:right">${r.venc}</td>
      <td style="${tdMuted};font-size:.7rem">${r.nota}</td>
      <td style="${tdStyle};text-align:center">${statusDot}</td>
    </tr>`;
  });
  html += `</tbody></table>`;

  // Renda+ 2065 duration detail (compact)
  const dur = rf.renda2065?.duration;
  const mtm = rf.renda2065?.mtm_impact_1pp;
  if (dur || mtm != null) {
    html += `<div style="font-size:.65rem;color:var(--muted);display:flex;gap:16px;flex-wrap:wrap;padding:6px 10px;background:var(--card2);border-radius:6px;margin-bottom:14px">
      <span style="font-weight:700;color:var(--text)">Renda+ 2065</span>`;
    if (dur?.macaulay_anos != null) html += `<span>Duration Macaulay: <strong>${dur.macaulay_anos.toFixed(1)} anos</strong></span>`;
    if (dur?.modificada_anos != null) html += `<span>Modificada: <strong>${dur.modificada_anos.toFixed(1)} anos</strong></span>`;
    if (mtm != null) html += `<span>MtM +1pp: <strong style="color:var(--red)">${mtm.toFixed(1)}%</strong></span>`;
    html += `</div>`;
  }

  // ── HODL11 com banda e P&L ──
  const _banda = DATA.hodl11?.banda;
  const _pnlBrl = DATA.hodl11?.pnl_brl;
  const _pnlPct = DATA.hodl11?.pnl_pct;
  const _pm = DATA.hodl11?.preco_medio;

  let hodlBandHtml = '';
  if (_banda?.min_pct != null) {
    const barMax = Math.max(_banda.max_pct + 1, (_banda.atual_pct || 0) + 0.5);
    const markerPct = (_banda.atual_pct / barMax * 100).toFixed(1);
    const minPct    = (_banda.min_pct  / barMax * 100).toFixed(1);
    const alvoPct   = (_banda.alvo_pct / barMax * 100).toFixed(1);
    const maxPct    = (_banda.max_pct  / barMax * 100).toFixed(1);
    hodlBandHtml = `<div style="position:relative;height:14px;border-radius:4px;margin:8px 0;overflow:visible;background:linear-gradient(90deg,rgba(239,68,68,.2) 0%,rgba(239,68,68,.2) ${minPct}%,rgba(34,197,94,.2) ${minPct}%,rgba(34,197,94,.2) ${maxPct}%,rgba(239,68,68,.2) ${maxPct}%)">
      <div class="hodl-band-marker" style="left:${markerPct}%"></div>
      <div class="hodl-band-label" style="left:${minPct}%">${_banda.min_pct}%</div>
      <div class="hodl-band-label" style="left:${alvoPct}%">alvo ${_banda.alvo_pct}%</div>
      <div class="hodl-band-label" style="left:${maxPct}%">${_banda.max_pct}%</div>
    </div>
    <div style="font-size:.6rem;color:var(--muted);text-align:center">Alocação atual: ${_banda.atual_pct != null ? _banda.atual_pct.toFixed(1) + '%' : '--'} · <span style="color:${_banda.status === 'verde' ? 'var(--green)' : _banda.status === 'amarelo' ? 'var(--yellow)' : 'var(--red)'}">${_banda.status || '--'}</span></div>`;
  }

  const hodlPnlHtml = _pnlBrl != null ? (() => {
    const color = _pnlBrl >= 0 ? 'var(--green)' : 'var(--red)';
    const sign = _pnlBrl >= 0 ? '+' : '';
    return `<div style="margin-top:6px;font-size:.72rem;color:${color}" class="pv">
      P&amp;L: <strong>${sign}R$ ${(_pnlBrl/1000).toFixed(1)}k (${sign}${_pnlPct?.toFixed(1)}%)</strong>
      ${_pm ? `<span style="color:var(--muted);font-size:.65rem"> · PM R$${_pm.toFixed(2)}</span>` : ''}
    </div>`;
  })() : '';

  // Cripto: HODL11 + Legado
  const _legadoVal = DATA.cryptoLegado ?? 3000;
  html += `<div style="display:grid;grid-template-columns:2fr 1fr;gap:10px">
    <div style="background:var(--card2);border-radius:8px;padding:12px">
      <div style="font-size:.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">HODL11 <span style="font-weight:400;text-transform:none;font-size:.6rem">· BTC wrapper · B3</span></div>
      <div class="pv" id="hodl11Val" style="font-size:1.1rem;font-weight:700">—</div>
      <div class="pv" id="hodl11Sub" style="font-size:.7rem;color:var(--muted);margin-top:2px">— cotas</div>
      ${hodlPnlHtml}
      <div style="font-size:.65rem;color:var(--muted);margin-top:6px">Alvo ${((DATA.pisos?.cripto_pct ?? 0.03)*100).toFixed(0)}% · Banda 1.5%–5%</div>
      ${hodlBandHtml}
    </div>
    <div style="background:var(--card2);border-radius:8px;padding:12px">
      <div style="font-size:.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Crypto Legado</div>
      <div class="pv" style="font-size:1.1rem;font-weight:700">~R$ ${(_legadoVal/1000).toFixed(0)}k</div>
      <div style="font-size:.7rem;color:var(--muted);margin-top:2px">BTC · ETH · BNB · ADA</div>
      <div style="font-size:.65rem;color:var(--muted);margin-top:4px">Não mexer</div>
    </div>
  </div>`;

  el.innerHTML = html;
  renderHodl11();
}

// ── Shadow Table (gerado dinamicamente) ───────────────────────
export function buildShadowTable() {
  const tbody = document.getElementById('shadowTableBody');
  if (!tbody) return;
  const sh = DATA.shadows || {};
  const _terCfg = (DATA.wellness_config?.metrics || []).find(m => m.id === 'ter') || {};
  const benchTer = _terCfg.benchmark_ter ?? 0.220;
  const shadowCTer = _terCfg.shadow_c_ter ?? 0.207;
  const deltaVwra  = sh.delta_vwra  ?? null;
  const deltaIpca  = sh.delta_ipca  ?? null;
  const _trackingLabel = DATA.date ? new Date(DATA.date).toLocaleDateString('pt-BR', {month:'short', year:'numeric'}) : 'Abr/2026';
  const rows = [
    {
      name: 'VWRA (benchmark)', comp: '100% VWRA.L', ter: benchTer,
      delta: deltaVwra, badge: '<span class="badge badge-alvo">Primário</span>',
      deltaNote: deltaVwra !== null ? `(${_trackingLabel})` : `desde ${_trackingLabel}`,
      invertColor: true, // positivo = carteira > VWRA = verde para carteira
    },
    {
      name: 'IPCA+ longo (RF puro)', comp: '100% IPCA+ 2040', ter: DATA.shadows?.ipca_ter ?? 0.200,
      delta: deltaIpca, badge: '<span class="badge" style="background:rgba(168,85,247,.2);color:var(--purple)">RF bench</span>',
      deltaNote: deltaIpca !== null ? `(${_trackingLabel})` : `desde ${_trackingLabel}`,
      invertColor: false, // negativo = IPCA+ bateu carteira = ruim
    },
    {
      name: 'VWRA + RF (60/40)',
      comp: `${((DATA.premissas.patrimonio_atual > 0 ? 79 : 79))}% VWRA + ${((DATA.pisos?.ipca_longo_pct ?? 15))}% IPCA+ + ${((DATA.pisos?.cripto_pct ?? 0.03)*100).toFixed(0)}% HODL11`,
      ter: shadowCTer,
      delta: sh.delta_shadow_c ?? null,
      badge: '<span class="badge badge-trans">Tracking</span>',
      deltaNote: `desde ${_trackingLabel}`,
      invertColor: true,
    },
  ];
  tbody.innerHTML = rows.map(r => {
    let deltaCell;
    if (r.delta !== null && r.delta !== undefined) {
      const isGood = r.invertColor ? r.delta >= 0 : r.delta <= 0;
      const cls = isGood ? 'pos' : 'neg';
      deltaCell = `<td class="num ${cls}">${r.delta >= 0 ? '+' : ''}${r.delta.toFixed(2)}pp <span style="font-size:.65rem;color:var(--muted)">${r.deltaNote}</span></td>`;
    } else {
      deltaCell = `<td class="num" style="font-size:.72rem">Tracking desde ${_trackingLabel}</td>`;
    }
    return `<tr>
      <td><strong>${r.name}</strong></td><td>${r.comp}</td>
      <td class="num">${(r.ter * 100).toFixed(3)}%</td>
      ${deltaCell}
      <td>${r.badge}</td>
    </tr>`;
  }).join('');
}

// ── Income Table (gerado dinamicamente) ───────────────────────
export function buildIncomeTable() {
  const tbody = document.getElementById('incomeTableBody');
  if (!tbody) return;
  const sm = DATA.spendingSmile || {};
  const inss = DATA.premissas.inss_anual ?? 18000;
  const inssInicio = DATA.premissas.inss_inicio_ano ?? 12; // anos após FIRE = age 65
  const ageAlvo = DATA.premissas.idade_cenario_base ?? 53;
  // Saúde por fase
  const sBase   = DATA.saude_base ?? 18000;
  const vcmh    = DATA.premissas?.saude_inflator ?? 0.027;
  const sDecay  = DATA.premissas?.saude_decay ?? 0.50;
  const saudeGoGo  = sBase;                                              // ano 0 (FIRE Day)
  const saudeSlowGo = sBase * Math.pow(1 + vcmh, sm.slow_go?.inicio ?? 15); // ano 15
  const saudeNoGo   = sBase * Math.pow(1 + vcmh, sm.no_go?.inicio  ?? 30) * sDecay; // ano 30 × decay
  const fmtSaude = v => 'R$' + Math.round(v / 1000) + 'k/ano';
  // Fases: Go-Go, Slow-Go, No-Go
  const fases = [
    {
      label: '🟢 Go-Go', color: 'var(--accent)',
      idadeStr: `${ageAlvo}–${ageAlvo+15} (anos 1–15)`,
      fonte: `Bond pool: TD 2040 vence no FIRE Day`,
      gasto: sm.go_go?.gasto,
      saude: saudeGoGo,
      obs: 'Equity intacto · alta mobilidade · viagens',
    },
    {
      label: '🟡 Slow-Go', color: 'var(--yellow)',
      idadeStr: `${ageAlvo+15}–${ageAlvo+30} (anos 15–30)`,
      fonte: `Equity saques + INSS R$${(inss/1000).toFixed(0)}k/ano (a partir dos ${inssInicio})`,
      gasto: sm.slow_go?.gasto,
      saude: saudeSlowGo,
      obs: 'Gasto declina · saúde começa a crescer',
    },
    {
      label: '🔴 No-Go', color: 'var(--red)',
      idadeStr: `${ageAlvo+30}+ (anos 30+)`,
      fonte: `Equity saques + INSS R$${(inss/1000).toFixed(0)}k/ano`,
      gasto: sm.no_go?.gasto,
      saude: saudeNoGo,
      obs: 'Saúde domina · lifestyle crescente',
    },
  ];
  tbody.innerHTML = fases.map(f => `<tr>
    <td><strong style="color:${f.color}">${f.label}</strong></td>
    <td>${f.idadeStr}</td>
    <td class="pv">${f.fonte}</td>
    <td class="num pv"><strong>${f.gasto != null ? 'R$' + (f.gasto/1000).toFixed(0) + 'k/ano' : '—'}</strong></td>
    <td class="num pv" style="color:var(--muted);font-size:.75rem">${fmtSaude(f.saude)}</td>
    <td style="font-size:.7rem;color:var(--muted)">${f.obs}</td>
  </tr>`).join('');
  // Atualizar src
  const _src = document.getElementById('incomeSrc');
  if (_src) _src.innerHTML = `Spending smile: gasto lifestyle declina com idade. Saúde: <span class="pv">R$${((DATA.saude_base ?? 18000)/1000).toFixed(0)}k/ano</span> base. INSS: <span class="pv">R$${(inss/1000).toFixed(0)}k/ano</span> conservador. Bond pool provê liquidez imediata no FIRE Day sem tocar equity.`;
  const _chartSrc = document.getElementById('incomeChartSrc');
  if (_chartSrc) {
    const gg = sm.go_go?.gasto, sg = sm.slow_go?.gasto, ng = sm.no_go?.gasto;
    _chartSrc.innerHTML = `Spending smile: Go-Go <span class="pv">R$${gg != null ? (gg/1000).toFixed(0)+'k' : '—'}</span> / Slow-Go <span class="pv">R$${sg != null ? (sg/1000).toFixed(0)+'k' : '—'}</span> / No-Go <span class="pv">R$${ng != null ? (ng/1000).toFixed(0)+'k' : '—'}</span> (ex-saúde). INSS: <span class="pv">R$${(inss/1000).toFixed(0)}k/ano</span> conservador.`;
  }
}

// ── IPCA Progress Bar (gerado dinamicamente) ──────────────────
export function renderIpcaProgress() {
  const ipcaAtual = DATA.drift?.IPCA?.atual ?? 0;
  const ipcaAlvo  = DATA.drift?.IPCA?.alvo  ?? 15;
  const ipcaGap   = ipcaAlvo - ipcaAtual;
  const taxaIpca  = DATA.rf?.ipca2040?.taxa;
  const pisoIpca  = DATA.pisos?.pisoTaxaIpcaLongo ?? 6.0;
  const dcaAtivo  = taxaIpca != null && taxaIpca >= pisoIpca && ipcaGap > 0;
  const _terCfg2  = (DATA.wellness_config?.metrics || []).find(m => m.id === 'ter') || {};
  const _alpha    = (_terCfg2.alpha_anual ?? 0.00160) * 100;
  // Title
  const _title = document.getElementById('ipcaProgressTitle');
  if (_title) _title.textContent = `IPCA+ Longo — Progresso vs Alvo ${ipcaAlvo}%`;
  // Label
  const _lbl = document.getElementById('ipcaProgressLabel');
  if (_lbl) _lbl.textContent = `~${ipcaAtual.toFixed(1)}% atual vs ${ipcaAlvo}% alvo`;
  // Fill bar (scaled to alvo)
  const _fill = document.getElementById('ipcaProgressFill');
  if (_fill) {
    _fill.style.width = Math.min(100, ipcaAtual / ipcaAlvo * 100) + '%';
    _fill.style.background = ipcaAtual >= ipcaAlvo ? 'var(--green)' : ipcaGap > 10 ? 'var(--red)' : 'var(--yellow)';
  }
  // Target marker
  const _tgt = document.getElementById('ipcaProgressTarget');
  if (_tgt) _tgt.style.left = Math.min(99, ipcaAlvo) + '%';
  // Gap text
  const _gap = document.getElementById('ipcaProgressGap');
  if (_gap) _gap.textContent = `Gap: −${ipcaGap.toFixed(1)}pp · ${dcaAtivo ? 'DCA ativo taxa ~' + taxaIpca.toFixed(2) + '%' : 'DCA pausado'}`;
  // Alpha label
  const _alphaLbl = document.getElementById('alphaLiquidoLabel');
  if (_alphaLbl) _alphaLbl.textContent = `~${_alpha.toFixed(2)}%/ano`;
  // Alpha fill (visual: 0.16% sobre escala 0-0.5%)
  const _alphaFill = document.getElementById('alphaLiquidoFill');
  if (_alphaFill) _alphaFill.style.width = Math.min(100, _alpha / 0.5 * 100) + '%';
  // Guardrail src
  const _gSrc = document.getElementById('guardrailsSrc');
  if (_gSrc) {
    const _pisoVal = DATA.gasto_piso ?? null;
    _gSrc.textContent = `Fonte: guardrails · Piso de retirada${_pisoVal ? ` = R$${(_pisoVal/1000).toFixed(0)}k` : ''} · simulação Monte Carlo`;
  }
  // Fan chart src
  const _fanSrc = document.getElementById('fanChartSrc');
  const _retBase = DATA.premissas?.retorno_equity_base;
  if (_fanSrc) _fanSrc.textContent = `Baseado em endpoints do Monte Carlo. Crescimento exponencial r=${_retBase != null ? (_retBase*100).toFixed(2) + '%' : '—'}/ano (base). Linha vertical: ${_anoFireAspir ?? '—'} (Cenário Aspiracional).`;
  // Fire scenario note
  const _scenNote = document.getElementById('fireScenarioNote');
  const ss = DATA.spendingSensibilidade || [];
  if (_scenNote && ss.length >= 3) {
    const c1 = ss[1]?.custo, c2 = ss[2]?.custo;
    _scenNote.textContent = `Casado = R$${c1 ? (c1/1000).toFixed(0)+'k' : '—'}/ano · Filho = R$${c2 ? (c2/1000).toFixed(0)+'k' : '—'}/ano · @50 aproximado via delta de spending`;
  }
}

export function renderWellness() {
  const { total, scores } = calcWellness();
  const label = total >= 80 ? 'Excelente' : total >= 60 ? 'Progredindo' : total >= 40 ? 'Atenção' : 'Crítico';
  const wColor = total >= 80 ? '#22c55e' : total >= 60 ? '#eab308' : '#ef4444';
  const el = document.getElementById('wellnessScore');
  el.textContent = Math.round(total);
  el.style.color = wColor;
  document.getElementById('wellnessLabel').textContent = `/100 · ${label}`;
  // Compact KPI card
  const kwEl = document.getElementById('kpiWellnessCompact');
  if (kwEl) { kwEl.textContent = `${Math.round(total)}/100`; kwEl.style.color = wColor; }
  const kwSub = document.getElementById('kpiWellnessSub');
  if (kwSub) kwSub.textContent = label;
  document.getElementById('wellnessFill').style.width = total + '%';
  document.getElementById('wellnessFill').style.background = total >= 80 ? '#22c55e' : total >= 60 ? '#eab308' : '#ef4444';
  // Ordenar: primeiro os com gap > 0 (oportunidade de melhora), depois os ok — ambos por max desc
  const withGap = [...scores].filter(s => s.value < s.max).sort((a,b) => b.max - a.max);
  const atMax   = [...scores].filter(s => s.value >= s.max).sort((a,b) => b.max - a.max);
  const sorted = [...withGap, ...atMax];
  const grid = document.getElementById('wellnessGrid');
  grid.innerHTML = '';
  if (withGap.length > 0) {
    const hdr = document.createElement('div');
    hdr.style.cssText = 'font-size:.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;padding:2px 0 4px';
    hdr.textContent = '⚠️ Oportunidade de melhora';
    grid.appendChild(hdr);
  }
  sorted.forEach((s, i) => {
    const pts = +s.value;
    const pct = pts / s.max * 100;
    const isOk = pts >= s.max;
    const icon = isOk ? '✅' : pts >= s.max * 0.6 ? '⚠️' : '❌';
    // Separador visual entre grupos
    if (i === withGap.length && withGap.length > 0 && atMax.length > 0) {
      const sep = document.createElement('div');
      sep.style.cssText = 'font-size:.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;padding:8px 0 2px';
      sep.textContent = '✅ Sem ação necessária';
      grid.appendChild(sep);
    }
    const div = document.createElement('div');
    div.style.cssText = 'display:grid;grid-template-columns:1.4rem 11rem 1fr 4.5rem 3rem;align-items:center;gap:8px;padding:6px 2px;border-bottom:1px solid rgba(71,85,105,.12)';
    div.innerHTML = `
      <span style="font-size:.82rem;line-height:1">${icon}</span>
      <span style="font-size:.75rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.label}</span>
      <div style="height:6px;background:rgba(71,85,105,.25);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${pct.toFixed(0)}%;background:${s.color};border-radius:3px;transition:width .4s"></div>
      </div>
      <span style="font-size:.68rem;color:var(--muted);white-space:nowrap;text-align:right">${s.detail}</span>
      <strong style="font-size:.72rem;color:${s.color};white-space:nowrap;text-align:right">${Math.round(pts)}/${s.max}</strong>`;
    grid.appendChild(div);
  });

  // Top ações para subir o score
  const actions = wellnessActions(scores);
  const actDiv = document.getElementById('wellnessActions');
  if (actDiv && actions.length) {
    actDiv.innerHTML = `<div style="font-size:.7rem;color:var(--muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">Top ações para subir o score</div>` +
      actions.map((a, i) => `<div style="display:flex;gap:8px;padding:4px 0;border-bottom:1px solid rgba(71,85,105,.15);font-size:.75rem">
        <span style="color:var(--yellow);font-weight:700;min-width:16px">${i+1}.</span>
        <div><strong>${a.label}</strong> <span style="color:var(--muted)">(+${a.gap}pts potencial)</span><br>
        <span style="color:var(--muted)">${a.action}</span></div>
      </div>`).join('');
  }
}

