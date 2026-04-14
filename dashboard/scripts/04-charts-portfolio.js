// ── S6: Timeline ──────────────────────────────────────────────
function buildTimeline(period) {
  if (charts.timeline) { charts.timeline.destroy(); charts.timeline = null; }

  const ta = DATA.timeline_attribution;
  if (ta && ta.dates && ta.aportes && ta.dates.length >= 2) {
    // Filtrar ta.dates pelo período selecionado (mesma lógica de filterByPeriod)
    const now = new Date();
    let cutoff = null;
    if (period === '6m') { cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 6); }
    else if (period === 'ytd') { cutoff = new Date(now.getFullYear(), 0, 1); }
    else if (period === '1y') { cutoff = new Date(now); cutoff.setFullYear(cutoff.getFullYear() - 1); }
    else if (period === '3y') { cutoff = new Date(now); cutoff.setFullYear(cutoff.getFullYear() - 3); }
    else if (period === '5y') { cutoff = new Date(now); cutoff.setFullYear(cutoff.getFullYear() - 5); }

    let taDates = ta.dates, taAp = ta.aportes, taEq = ta.equity_usd, taCambio = ta.cambio, taRF = ta.rf;
    if (cutoff) {
      const filtered = ta.dates.reduce((acc, d, i) => {
        if (new Date(d + '-01') >= cutoff) acc.push(i);
        return acc;
      }, []);
      if (filtered.length >= 2) {
        taDates  = filtered.map(i => ta.dates[i]);
        taAp     = filtered.map(i => ta.aportes[i]);
        taEq     = filtered.map(i => ta.equity_usd[i]);
        taCambio = filtered.map(i => ta.cambio[i]);
        taRF     = filtered.map(i => ta.rf[i]);
      }
    }

    const sparseNote = document.getElementById('timelineSparseNote');
    if (sparseNote) sparseNote.textContent = taDates.length < 6 ? `⚠️ ${taDates.length} pontos disponíveis — dados mensais com lacunas em 2026` : '';

    if (checkMinPoints('timelineChart', taDates.length, 2)) return;
    charts.timeline = new Chart(document.getElementById('timelineChart'), {
      type: 'line',
      data: {
        labels: taDates,
        datasets: [
          { label: 'Aportes',           data: taAp,      fill: true, backgroundColor: 'rgba(59,130,246,.35)', borderColor: 'rgba(59,130,246,.8)', borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
          { label: 'Rentabilidade USD', data: taEq,      fill: true, backgroundColor: 'rgba(34,197,94,.3)',   borderColor: 'rgba(34,197,94,.8)',  borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
          { label: 'Câmbio (FX)',       data: taCambio,  fill: true, backgroundColor: 'rgba(239,68,68,.25)',  borderColor: 'rgba(239,68,68,.8)',  borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
          { label: 'Renda Fixa (RF)',   data: taRF,      fill: true, backgroundColor: 'rgba(168,85,247,.25)', borderColor: 'rgba(168,85,247,.8)', borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: '#94a3b8', boxWidth: 12 } },
          tooltip: {
            callbacks: {
              title: items => items.length ? fmtMonthLabel(items[0].label) : '',
              label: ctx => ` ${ctx.dataset.label}: R$ ${(ctx.parsed.y/1000).toFixed(0)}k`,
              footer: items => {
                if (items.length) {
                  const total = items.reduce((s,i) => s + i.parsed.y, 0);
                  return [`Total acumulado: R$ ${(total/1000).toFixed(0)}k`];
                }
              }
            }
          }
        },
        scales: {
          x: { stacked: true, ticks: { color: '#94a3b8', maxTicksLimit: 8, callback: fmtMonthTick }, grid: { color: 'rgba(71,85,105,.3)' } },
          y: { stacked: true, ticks: { color: '#94a3b8', callback: v => 'R$' + (v/1000).toFixed(0)+'k' }, grid: { color: 'rgba(71,85,105,.3)' } }
        }
      }
    });
  } else {
    // Fallback: total simples sem decomposição
    const { labels, values } = filterByPeriod(DATA.timeline.labels, DATA.timeline.values, period);
    const sparseNote = document.getElementById('timelineSparseNote');
    if (sparseNote) sparseNote.textContent = labels.length < 6 ? `⚠️ ${labels.length} pontos disponíveis — dados mensais com lacunas em 2026` : '';
    if (checkMinPoints('timelineChart', labels.length, 2)) return;
    charts.timeline = new Chart(document.getElementById('timelineChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Patrimônio Total', data: values, fill: true, backgroundColor: 'rgba(59,130,246,.25)', borderColor: '#3b82f6', tension: 0.3, pointRadius: 1, borderWidth: 1.5 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: '#94a3b8', boxWidth: 12 } },
          tooltip: {
            callbacks: {
              title: items => items.length ? fmtMonthLabel(items[0].label) : '',
              label: ctx => ` ${ctx.dataset.label}: R$ ${(ctx.parsed.y/1000).toFixed(0)}k`,
            }
          }
        },
        scales: {
          x: { ticks: { color: '#94a3b8', maxTicksLimit: 8, callback: fmtMonthTick }, grid: { color: 'rgba(71,85,105,.3)' } },
          y: { ticks: { color: '#94a3b8', callback: v => 'R$' + (v/1000).toFixed(0)+'k' }, grid: { color: 'rgba(71,85,105,.3)' } }
        }
      }
    });
  }
}
window.setTimelinePeriod = function(p) {
  setActivePeriodBtn('timelinePeriodBtns', p);
  buildTimeline(p);
};

// ── S7: Attribution ───────────────────────────────────────────
function buildAttribution() {
  const a = DATA.attribution;
  if (!a || a.retornoUsd === null || a.retornoUsd === undefined) {
    const sec = document.getElementById('attrSection');
    if (sec) sec.innerHTML = `<div style="padding:12px;text-align:center;color:var(--muted);font-size:.8rem">
      📊 <strong>Performance Attribution indisponível</strong><br>
      <span style="font-size:.7rem">Rode generate_data.py para habilitar esta seção.</span>
    </div>`;
    return;
  }

  // Período desde o início
  const periodoEl = document.getElementById('attrPeriodo');
  if (periodoEl && a._inicio) periodoEl.textContent = `(desde ${a._inicio})`;

  document.getElementById('attrCagrVal').textContent = cagr.toFixed(1) + '%';
  document.getElementById('attrAportes').textContent = fmtBrl(a.aportes);
  document.getElementById('attrRetorno').textContent = fmtBrl(a.retornoUsd);
  document.getElementById('attrCambio').textContent  = fmtBrl(a.cambio);

  // crescReal = pat_atual; attrSum = aportes + retornoUsd + cambio ≈ pat_atual
  const attrSum = a.aportes + a.retornoUsd + a.cambio;
  const gap = Math.abs(attrSum - a.crescReal);
  const gapPct = a.crescReal > 0 ? gap / a.crescReal : 0;
  const msg = document.getElementById('attrGapMsg');
  if (gapPct > 0.03) {
    msg.textContent = `⚠️ Gap: R$ ${(gap/1000).toFixed(0)}k (${(gapPct*100).toFixed(1)}%) — aproximação da decomposição`;
    msg.style.color = '#eab308';
  } else {
    const aportePct = a.crescReal > 0 ? (a.aportes / a.crescReal * 100).toFixed(0) : 0;
    const retornoPct = a.crescReal > 0 ? (a.retornoUsd / a.crescReal * 100).toFixed(0) : 0;
    msg.textContent = `${aportePct}% aportes · ${retornoPct}% retorno USD · resto RF+câmbio`;
    msg.style.color = '#94a3b8';
  }

  const attrTotal = Math.abs(a.aportes) + Math.abs(a.retornoUsd) + Math.abs(a.cambio);
  const attrLabelPlugin = {
    id: 'attrSegmentLabels',
    afterDatasetsDraw(chart) {
      const ctx = chart.ctx;
      chart.data.datasets.forEach((dataset, dsIdx) => {
        const meta = chart.getDatasetMeta(dsIdx);
        meta.data.forEach((bar, barIdx) => {
          const val = dataset.data[barIdx];
          if (!val) return;
          const pct = attrTotal > 0 ? Math.abs(val) / attrTotal * 100 : 0;
          if (pct < 5) return;
          const { x, y, base, width } = bar.getProps(['x', 'y', 'base', 'width'], true);
          const midY = (y + base) / 2;
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(pct.toFixed(0) + '%', x, midY);
          ctx.restore();
        });
      });
    }
  };

  // Mostrar FX/RF cards se disponíveis
  const fxRfRow = document.getElementById('attrFxRfRow');
  if (a.fx != null && a.rf != null && fxRfRow) {
    fxRfRow.style.display = 'grid';
    document.getElementById('attrFx').textContent = fmtBrl(a.fx);
    document.getElementById('attrRf').textContent = fmtBrl(a.rf);
  }

  if (charts.attr) { charts.attr.destroy(); charts.attr = null; }

  // Doughnut com 6 fatias (buckets ou fallback com zeros)
  const pb = (a.por_bucket && a.fx != null) ? a.por_bucket : {};
  const doughnutLabels = ['Aportes', 'SWRD (Blend)', 'Factor Small Value', 'Emergentes', 'RF Local', 'Câmbio'];
  const doughnutValues = [
    a.aportes,
    pb['SWRD']  || 0,
    pb['AVGS']  || 0,
    pb['AVEM']  || 0,
    a.rf        || 0,
    a.fx        || 0,
  ];
  const doughnutColors = [
    'rgba(59,130,246,.7)',
    'rgba(34,197,94,.7)',
    'rgba(168,85,247,.7)',
    'rgba(234,179,8,.7)',
    'rgba(20,184,166,.7)',
    'rgba(249,115,22,.7)',
  ];
  const doughnutTotal = doughnutValues.reduce((s, v) => s + Math.abs(v), 0);

  const attrArcLabelPlugin = {
    id: 'attrArcLabels',
    afterDraw(chart) {
      const ctx = chart.ctx;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((arc, index) => {
          const val = Math.abs(dataset.data[index]);
          if (!val) return;
          const pct = doughnutTotal > 0 ? val / doughnutTotal * 100 : 0;
          if (pct < 5) return;
          const midAngle = (arc.startAngle + arc.endAngle) / 2;
          const r = (arc.innerRadius + arc.outerRadius) / 2;
          const x = arc.x + r * Math.cos(midAngle);
          const y = arc.y + r * Math.sin(midAngle);
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(pct.toFixed(0) + '%', x, y);
          ctx.restore();
        });
      });
    }
  };

  charts.attr = new Chart(document.getElementById('attrChart'), {
    type: 'doughnut',
    data: {
      labels: doughnutLabels,
      datasets: [{
        data: doughnutValues,
        backgroundColor: doughnutColors,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,.2)',
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12 } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const val = ctx.parsed;
              const pct = doughnutTotal > 0 ? (Math.abs(val) / doughnutTotal * 100).toFixed(1) : 0;
              return ` ${ctx.label}: R$ ${(val/1e6).toFixed(2)}M (${pct}%)`;
            }
          }
        }
      }
    },
    plugins: [attrArcLabelPlugin]
  });
}

// ── S8: Geo Donut ────────────────────────────────────────────
function buildDonuts() {
  const geoTot = geoUS + geoDM + geoEM;
  const geoData = [geoUS, geoDM, geoEM].map(v => Math.round(v / geoTot * 100));

  const geoLabelPlugin = {
    id: 'geoArcLabels',
    afterDraw(chart) {
      const ctx = chart.ctx;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((arc, index) => {
          const val = dataset.data[index];
          if (!val || val < 4) return;
          const midAngle = (arc.startAngle + arc.endAngle) / 2;
          const r = (arc.innerRadius + arc.outerRadius) / 2;
          const x = arc.x + r * Math.cos(midAngle);
          const y = arc.y + r * Math.sin(midAngle);
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(val + '%', x, y);
          ctx.restore();
        });
      });
    }
  };

  if (charts.geo) { charts.geo.destroy(); charts.geo = null; }
  charts.geo = new Chart(document.getElementById('geoDonut'), {
    type: 'doughnut',
    data: {
      labels: ['US', 'DM ex-US', 'EM'],
      datasets: [{ data: geoData, backgroundColor: ['#3b82f6','#22c55e','#f97316'], borderWidth: 1, borderColor: '#1e293b' }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94a3b8' } } }, cutout: '60%' },
    plugins: [geoLabelPlugin]
  });
}

// ── S9: Scenario + Spending ───────────────────────────────────
function buildScenarios() {
  if (charts.scenario) { charts.scenario.destroy(); charts.scenario = null; }
  charts.scenario = new Chart(document.getElementById('scenarioChart'), {
    type: 'bar',
    data: {
      labels: ['Base', 'Favorável', 'Stress'],
      datasets: [
        { label: 'Cenário Base ✅', data: [DATA.pfire_base.base, DATA.pfire_base.fav, DATA.pfire_base.stress], backgroundColor: ['rgba(59,130,246,.7)','rgba(34,197,94,.7)','rgba(234,179,8,.7)'] },
        { label: 'Cenário Aspiracional 🚀', data: [DATA.pfire_aspiracional.base, DATA.pfire_aspiracional.fav, DATA.pfire_aspiracional.stress], backgroundColor: ['rgba(168,85,247,.5)','rgba(168,85,247,.7)','rgba(168,85,247,.4)'] },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8' } } },
      scales: {
        y: { min: 70, max: 100, ticks: { color: '#94a3b8', callback: v => v+'%' }, grid: { color: 'rgba(71,85,105,.3)' } },
        x: { ticks: { color: '#94a3b8' } }
      }
    }
  });

}

// ── S10: Tornado ─────────────────────────────────────────────
// #5: Variáveis acionáveis pelo Diego (por palavra-chave no label)
function _isTornadoAcionavel(label) {
  const acionaveis = ['aporte', 'custo de vida', 'gasto', 'spending'];
  return acionaveis.some(k => label.toLowerCase().includes(k));
}

function buildTornado() {
  if (charts.tornado) { charts.tornado.destroy(); charts.tornado = null; }
  const t = DATA.tornado;
  if (!t || !t.length) return;
  const canvas = document.getElementById('tornadoChart');
  if (!canvas) return;

  // Labels com prefixo ícone para distinguir acionável vs exógeno
  const labels = t.map(x => (_isTornadoAcionavel(x.variavel) ? '✦ ' : '◇ ') + x.variavel);

  // Cores: acionáveis = verde/vermelho mais saturado; exógenos = mais apagados
  function barColor(val, isAcionavel) {
    if (val >= 0) return isAcionavel ? 'rgba(34,197,94,.9)' : 'rgba(34,197,94,.45)';
    return isAcionavel ? 'rgba(239,68,68,.9)' : 'rgba(239,68,68,.45)';
  }

  // Legenda customizada: renderizada abaixo do chart
  const parentEl = canvas.parentElement;
  const existingLegend = parentEl ? parentEl.querySelector('.tornado-legend') : null;
  if (existingLegend) existingLegend.remove();
  if (parentEl) {
    const leg = document.createElement('div');
    leg.className = 'tornado-legend';
    leg.style.cssText = 'display:flex;gap:12px;font-size:.62rem;color:var(--muted);margin-top:6px;flex-wrap:wrap';
    leg.innerHTML = '<span>✦ <span style="color:var(--green)">Acionável</span> (aporte/custo)</span><span>◇ <span style="color:var(--muted)">Exógeno</span> (mercado/volatilidade)</span>';
    parentEl.appendChild(leg);
  }

  charts.tornado = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: '+10%', data: t.map(x => x.mais10), backgroundColor: t.map(x => barColor(x.mais10, _isTornadoAcionavel(x.variavel))) },
        { label: '-10%', data: t.map(x => x.menos10), backgroundColor: t.map(x => barColor(x.menos10, _isTornadoAcionavel(x.variavel))) },
      ]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.x > 0 ? '+' : ''}${ctx.parsed.x}pp P(FIRE)` } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8', callback: v => (v>0?'+':'')+v+'pp' }, grid: { color: 'rgba(71,85,105,.3)' } },
        y: { ticks: { color: '#94a3b8', font: { size: 10 } } }
      }
    }
  });
  // Force resize after layout is complete (chart may render with 0 dimensions on first paint)
  setTimeout(() => { if (charts.tornado) charts.tornado.resize(); }, 100);
}

// ── S11: Delta bar ────────────────────────────────────────────
function buildDeltaBar() {
  // Deltas vêm de DATA.shadows se disponível; fallback para null (em tracking)
  const sh = DATA.shadows || {};
  const deltaVwra = sh.delta_vwra ?? (DATA.backtest?.metrics ? (DATA.backtest.metrics.target?.cagr ?? null) - (DATA.backtest.metrics.shadowA?.cagr ?? null) : null);
  const deltaIpca = sh.delta_ipca ?? null;
  const delta6040 = sh.delta_shadow_c ?? null;
  const rawData = [deltaVwra, deltaIpca, delta6040];
  // Substituir null por 1.0 placeholder (1pp) para garantir que a barra renderiza com estilo "em tracking"
  const deltaData = rawData.map(v => v ?? 1.0);  // placeholder de 1pp para visibilidade mínima
  const isTracking = rawData.map(v => v === null);
  if (charts.delta) { charts.delta.destroy(); charts.delta = null; }
  charts.delta = new Chart(document.getElementById('deltaChart'), {
    type: 'bar',
    data: {
      labels: ['vs VWRA\n(benchmark)', 'vs IPCA+\n(RF puro)', 'vs 60/40\n(VWRA+RF+Crypto)'],
      datasets: [{
        label: 'Delta (pp)',
        data: deltaData,
        backgroundColor: rawData.map((v, i) => isTracking[i] ? 'rgba(94,94,94,.35)' : v >= 0 ? 'rgba(34,197,94,.7)' : 'rgba(239,68,68,.6)'),
        borderColor: rawData.map((v, i) => isTracking[i] ? 'rgba(94,94,94,.6)' : 'transparent'),
        borderWidth: rawData.map((v, i) => isTracking[i] ? 1 : 0),
        borderDash: [4, 4],
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => isTracking[ctx.dataIndex] ? ' Em tracking (dados insuficientes)' : ` ${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y.toFixed(2)}pp` } }
      },
      scales: {
        y: { ticks: { color: '#94a3b8', callback: v => (v>0?'+':'')+v+'pp' }, grid: { color: 'rgba(71,85,105,.3)' } },
        x: { ticks: { color: '#94a3b8', font:{size:10} } }
      }
    }
  });
}

// ── S7: Barras Empilhadas — Alocação ─────────────────────────
function buildStackedAlloc() {
  // Barra por classe de ativo
  const barEl = document.getElementById('stackedAllocBar');
  const legEl = document.getElementById('stackedAllocLegend');
  if (!barEl || !legEl) return;

  const eqBrl = totalEquityUsd * CAMBIO;
  const _ipca2040Brl  = DATA.rf?.ipca2040?.valor ?? 0;
  const _renda2065Brl = DATA.rf?.renda2065?.valor ?? 0;
  const _ipca2029Brl  = DATA.rf?.ipca2029?.valor ?? 0;

  const segments = [
    { label: 'Equity', val: eqBrl, color: '#3b82f6' },
    { label: 'IPCA+ 2040', val: _ipca2040Brl, color: '#22c55e' },
    { label: 'IPCA+ 2029', val: _ipca2029Brl, color: '#06b6d4' },
    { label: 'Renda+ 2065', val: _renda2065Brl, color: '#f97316' },
    { label: 'Crypto', val: cryptoBrl, color: '#eab308' },
  ].filter(s => s.val > 0);
  const total = segments.reduce((s, x) => s + x.val, 0);

  barEl.innerHTML = segments.map(s => {
    const pct = total > 0 ? (s.val / total * 100) : 0;
    return `<div title="${s.label}: ${pct.toFixed(1)}%" style="width:${pct.toFixed(2)}%;background:${s.color};transition:width .3s;position:relative;overflow:hidden">
      ${pct > 8 ? `<span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:.58rem;font-weight:700;color:white;white-space:nowrap">${pct.toFixed(0)}%</span>` : ''}
    </div>`;
  }).join('');

  legEl.innerHTML = segments.map(s => {
    const pct = total > 0 ? (s.val / total * 100) : 0;
    return `<span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:2px;background:${s.color};flex-shrink:0"></span>${s.label} ${pct.toFixed(1)}%</span>`;
  }).join('');

  // Intra-equity barras duplas: atual vs alvo
  const eqEl = document.getElementById('stackedEquityBar');
  if (!eqEl) return;
  const EQUITY_BUCKETS = ['SWRD', 'AVGS', 'AVEM'];
  const bucketColors = { SWRD: '#3b82f6', AVGS: '#8b5cf6', AVEM: '#06b6d4' };
  const totalEquityTarget = EQUITY_BUCKETS.reduce((s, k) => s + (DATA.pesosTarget[k] || 0), 0);
  const bucketVals = {};
  EQUITY_BUCKETS.forEach(b => { bucketVals[b] = 0; });
  Object.values(DATA.posicoes).forEach(p => {
    if (bucketVals[p.bucket] !== undefined) bucketVals[p.bucket] += p.qty * p.price;
  });
  const totalEquityUsdActual = Object.values(bucketVals).reduce((s, v) => s + v, 0);
  eqEl.innerHTML = EQUITY_BUCKETS.map(b => {
    const pctAtual = totalEquityUsdActual > 0 ? (bucketVals[b] / totalEquityUsdActual * 100) : 0;
    const pctAlvo = totalEquityTarget > 0 ? (DATA.pesosTarget[b] / totalEquityTarget * 100) : 0;
    const delta = pctAtual - pctAlvo;
    const deltaColor = Math.abs(delta) <= 2 ? '#22c55e' : Math.abs(delta) <= 5 ? '#eab308' : '#ef4444';
    return `<div style="margin-bottom:4px">
      <div style="display:flex;justify-content:space-between;font-size:.68rem;margin-bottom:2px">
        <span style="font-weight:700;color:${bucketColors[b]}">${b}</span>
        <span style="color:${deltaColor}">${pctAtual.toFixed(1)}% atual · ${pctAlvo.toFixed(0)}% alvo · <strong>${delta >= 0 ? '+' : ''}${delta.toFixed(1)}pp</strong></span>
      </div>
      <div style="position:relative;height:14px;background:var(--card2);border-radius:4px;overflow:visible">
        <div style="position:absolute;left:0;top:0;height:100%;width:${Math.min(100,pctAtual).toFixed(2)}%;background:${bucketColors[b]};border-radius:4px;opacity:.8"></div>
        <div style="position:absolute;top:-3px;width:2px;height:20px;background:var(--text);border-radius:1px;left:${Math.min(100,pctAlvo).toFixed(2)}%;z-index:2" title="Alvo: ${pctAlvo.toFixed(0)}%"></div>
      </div>
    </div>`;
  }).join('');
}

// ── S12: Glide Path ───────────────────────────────────────────
function buildGlidePath() {
  const g = DATA.glide;
  const sec = document.getElementById('glideSection') || document.getElementById('glidepathSection');
  if (!g || !g.idades || !g.equity || !g.ipca_longo) {
    if (sec) sec.style.display = 'none';
    return;
  }
  const _anoAtual = today.getFullYear();
  const _idadeAtual = DATA.premissas.idade_atual;
  const labels = g.idades.map(a => [String(_anoAtual + (a - _idadeAtual)), `(${a} anos)`]);
  // Assertion: soma = 100%/ano
  g.idades.forEach((_, i) => {
    const s = g.ipca_longo[i] + g.ipca_curto[i] + g.equity[i] + g.hodl11[i] + g.renda_plus[i];
    console.assert(Math.abs(s - 100) < 0.5, `Glide path idade ${g.idades[i]}: soma ${s}% ≠ 100%`);
  });

  const _glideCanvas = document.getElementById('glideChart');
  if (!_glideCanvas) return;
  // Canvas em seção colapsível fechada → sair; _toggleBlock double-RAF reconstrói ao abrir
  if (_glideCanvas.offsetWidth === 0) return;


  // Destroy any existing chart — Chart.getChart() catches orphaned instances not tracked in charts.glide
  const _glideExisting = Chart.getChart(_glideCanvas);
  if (_glideExisting) _glideExisting.destroy();
  if (charts.glide) { try { charts.glide.destroy(); } catch(_e) {} charts.glide = null; }
  charts.glide = new Chart(_glideCanvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Equity Total',    data: g.equity,     fill: true, backgroundColor: 'rgba(59,130,246,.65)', borderColor: 'rgba(59,130,246,.9)',   borderWidth: 1.5, pointRadius: 3, tension: 0.3 },
        { label: 'IPCA+ Longo',     data: g.ipca_longo, fill: true, backgroundColor: 'rgba(34,197,94,.55)',  borderColor: 'rgba(34,197,94,.9)',    borderWidth: 1.5, pointRadius: 3, tension: 0.3 },
        { label: 'IPCA+ Curto',     data: g.ipca_curto, fill: true, backgroundColor: 'rgba(6,182,212,.5)',   borderColor: 'rgba(6,182,212,.9)',    borderWidth: 1.5, pointRadius: 3, tension: 0.3 },
        { label: 'Crypto (HODL11)', data: g.hodl11,     fill: true, backgroundColor: 'rgba(234,179,8,.55)',  borderColor: 'rgba(234,179,8,.9)',    borderWidth: 1.5, pointRadius: 3, tension: 0.3 },
        { label: 'Renda+ 2065',     data: g.renda_plus, fill: true, backgroundColor: 'rgba(249,115,22,.55)', borderColor: 'rgba(249,115,22,.9)',   borderWidth: 1.5, pointRadius: 3, tension: 0.3 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } },
        tooltip: {
          mode: 'index', intersect: false,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` }
        }
      },
      scales: {
        x: { stacked: true, ticks: { color: '#94a3b8', maxRotation: 0 } },
        y: { stacked: true, min: 0, max: 100, ticks: { color: '#94a3b8', callback: v => v+'%' }, grid: { color: 'rgba(71,85,105,.3)' } }
      }
    }
  });
}


// ── S14: Fan Chart ────────────────────────────────────────────
function buildFanChart() {
  // S14 foi removido (superado por F7 Net Worth Projection) — retornar se canvas não existe
  if (!document.getElementById('fanChart')) return;
  const r = DATA.premissas.retorno_equity_base;
  const pat0 = DATA.premissas.patrimonio_atual;
  // startYear: ano atual + fração do mês atual; endYear: FIRE_alvo + 30 anos de retiradas
  const startYear = today.getFullYear() + today.getMonth() / 12;
  const endYear = today.getFullYear() + (DATA.premissas.idade_cenario_base - DATA.premissas.idade_atual) + 30;
  const labels = [], p10 = [], p50 = [], p90 = [];
  // Labels com ano + idade para contexto temporal duplo
  const _idadeBase = DATA.premissas.idade_atual;
  const _anoBase = today.getFullYear();
  const _aporteAnual = (DATA.premissas.aporte_mensal ?? 25000) * 12; // R$/ano — inclui aportes na projeção
  // Âncoras MC para P10/P90 no Cenário Base — calibra spread vs heurística
  const _tFire53 = (DATA.premissas.idade_cenario_base ?? 53) - (DATA.premissas.idade_atual ?? 39);
  const _mc53 = DATA.scenario_comparison?.fire53;
  // med(t_fire53) com aportes: usado para derivar ratio_10/ratio_90 do MC
  const _medFire53 = r > 0
    ? pat0 * Math.pow(1+r, _tFire53) + _aporteAnual * (Math.pow(1+r, _tFire53) - 1) / r
    : pat0 + _aporteAnual * _tFire53;
  const _ratio10 = _mc53?.pat_p10  ? (_mc53.pat_p10  / _medFire53) : 0.593;
  const _ratio90 = _mc53?.pat_p90  ? (_mc53.pat_p90  / _medFire53) : 1.641;
  for (let yr = Math.ceil(startYear); yr <= endYear; yr++) {
    const t = yr - startYear;
    // P50: pat0*(1+r)^t + aporte_anual * ((1+r)^t - 1) / r  (inclui aportes reais)
    const med = r > 0
      ? pat0 * Math.pow(1+r, t) + _aporteAnual * (Math.pow(1+r, t) - 1) / r
      : pat0 + _aporteAnual * t;
    const _idade = _idadeBase + (yr - _anoBase);
    labels.push([String(yr), `(${_idade} anos)`]);
    p50.push(Math.round(med));
    // P10/P90: spread calibrado pelo MC no Cenário Base, escalado por sqrt(t/t_fire53)
    const _frac = _tFire53 > 0 ? Math.sqrt(Math.min(t, _tFire53) / _tFire53) : 0;
    p10.push(Math.round(med * (1 - (1 - _ratio10) * _frac)));
    p90.push(Math.round(med * (1 + (_ratio90 - 1) * _frac)));
  }
  // FIRE day markers
  const _anoFire50 = _anoBase + (DATA.premissas.idade_cenario_aspiracional ?? 50) - _idadeBase;
  const _anoFire53 = _anoBase + (DATA.premissas.idade_cenario_base ?? 53) - _idadeBase;
  const fire50Idx = labels.findIndex(l => +(Array.isArray(l) ? l[0] : l) >= _anoFire50);
  const fire53Idx = labels.findIndex(l => +(Array.isArray(l) ? l[0] : l) >= _anoFire53);

  // Gatilho crossing: primeiro índice em que P90 / P50 >= PAT_GATILHO
  let gIdx90 = -1, gIdx50 = -1;
  for (let i = 0; i < p90.length; i++) {
    if (gIdx90 < 0 && p90[i] >= PAT_GATILHO) gIdx90 = i;
    if (gIdx50 < 0 && p50[i] >= PAT_GATILHO) gIdx50 = i;
  }

  // Arrays de pointRadius/cor: 0 em todos, destaque nos cruzamentos
  const p90Radii = p90.map((_, i) => i === gIdx90 ? 8 : 0);
  const p50Radii = p50.map((_, i) => i === gIdx50 ? 8 : 0);
  const p90PointBg = p90.map((_, i) => i === gIdx90 ? '#22c55e' : 'transparent');
  const p50PointBg = p50.map((_, i) => i === gIdx50 ? '#3b82f6' : 'transparent');
  const p90PointBorder = p90.map((_, i) => i === gIdx90 ? '#fff' : 'transparent');
  const p50PointBorder = p50.map((_, i) => i === gIdx50 ? '#fff' : 'transparent');

  // Label para legenda com ano/idade do cruzamento
  const _labelForIdx = idx => {
    if (idx < 0) return '';
    const l = labels[idx];
    return ` — gatilho ${Array.isArray(l) ? l[0] : l}${Array.isArray(l) ? ' ' + l[1] : ''}`;
  };

  if (charts.fan) { charts.fan.destroy(); charts.fan = null; }
  charts.fan = new Chart(document.getElementById('fanChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: `P90${_labelForIdx(gIdx90)}`, data: p90, fill: false, borderColor: 'rgba(34,197,94,.3)', borderWidth: 1,
          pointRadius: p90Radii, pointBackgroundColor: p90PointBg, pointBorderColor: p90PointBorder, pointBorderWidth: 1.5, tension: 0.3 },
        { label: `P50 (mediana)${_labelForIdx(gIdx50)}`, data: p50, fill: false, borderColor: '#3b82f6', borderWidth: 2,
          pointRadius: p50Radii, pointBackgroundColor: p50PointBg, pointBorderColor: p50PointBorder, pointBorderWidth: 1.5, tension: 0.3 },
        { label: 'P10', data: p10, fill: '-2', borderColor: 'rgba(239,68,68,.3)', borderWidth: 1, pointRadius: 0, tension: 0.3, backgroundColor: 'rgba(59,130,246,.08)' },
        { label: `Gatilho R$${(PAT_GATILHO/1e6).toFixed(1)}M`, data: labels.map(() => PAT_GATILHO), borderColor: 'rgba(234,179,8,.6)', borderWidth: 1, borderDash: [6,3], pointRadius: 0 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = ` ${ctx.dataset.label.split(' —')[0]}: R$ ${(ctx.parsed.y/1000000).toFixed(2)}M`;
              const i = ctx.dataIndex;
              if (ctx.datasetIndex === 0 && i === gIdx90) return v + ' ← 🎯 P90 atinge gatilho';
              if (ctx.datasetIndex === 1 && i === gIdx50) return v + ' ← 🎯 P50 atinge gatilho';
              return v;
            },
            footer: () => ['⚠️ Trajetórias individuais têm maior volatilidade', 'Baseado em MC endpoints + interpolação exponencial']
          }
        },
        annotation: {}
      },
      scales: {
        x: { ticks: { color: '#94a3b8', maxTicksLimit: 14, autoSkip: true, maxRotation: 0 }, grid: { color: 'rgba(71,85,105,.2)' } },
        y: { ticks: { color: '#94a3b8', callback: v => 'R$' + (v/1000000).toFixed(1)+'M' }, grid: { color: 'rgba(71,85,105,.2)' } }
      }
    }
  });
}

// ── S15: Guardrails ────────────────────────────────────────────
function buildGuardrails() {
  const patAtual = DATA.premissas.patrimonio_atual;
  const tbody = document.getElementById('guardrailsBody');
  const colors = ['rgba(34,197,94,.1)', 'rgba(234,179,8,.1)', 'rgba(249,115,22,.1)', 'rgba(239,68,68,.15)'];
  const icons = ['🟢', '🟡', '🟠', '🔴'];

  // Determinar nível atual: percorrer em ordem crescente de gravidade
  const patMax = Math.max(...DATA.guardrails.map((_, j) =>
    DATA.guardrails.slice(0, j + 1).reduce((acc, g) => acc, patAtual)));
  // Simples: não há drawdown ativo → nível 0 é atual
  const ddAtual = 0; // placeholder — sem ATH no data.json; row 0 = atual por padrão
  const nivelAtual = 0;

  DATA.guardrails.forEach((g, i) => {
    const tr = document.createElement('tr');
    tr.style.background = colors[i];
    if (i === nivelAtual) tr.style.outline = '2px solid rgba(34,197,94,.5)';
    const ddStr = g.ddMax === 1.00 ? `>${(g.ddMin*100).toFixed(0)}%` : `${(g.ddMin*100).toFixed(0)}–${(g.ddMax*100).toFixed(0)}%`;
    const corteStr = g.corte === 0 ? '—' : `${(g.corte*100).toFixed(0)}%`;
    const retirStr = i === DATA.guardrails.length - 1 ? `R$ ${g.retirada.toLocaleString('pt-BR')} (GASTO_PISO)` : `R$ ${g.retirada.toLocaleString('pt-BR')}`;
    // Gatilho = patrimônio que ativa ESTE nível (ddMin = queda mínima para entrar)
    const gatilhoStr = g.ddMin === 0
      ? `<strong style="color:#22c55e">ATUAL ✓</strong>`
      : `R$ ${(patAtual * (1 - g.ddMin) / 1000).toFixed(0)}k (−${(g.ddMin*100).toFixed(0)}%)`;
    tr.innerHTML = `<td>${icons[i]} ${ddStr}</td><td>${corteStr}</td><td class="num pv">${retirStr}</td><td class="num pv">${gatilhoStr}</td><td>${g.desc}</td>`;
    tbody.appendChild(tr);
  });
}

// ── S16: Income chart ─────────────────────────────────────────
function buildIncomeChart() {
  // #8: gráfico removido (duplica F1/Ciclo de Vida) — canvas oculto, skip
  const incCanvas = document.getElementById('incomeChart');
  if (!incCanvas || incCanvas.style.display === 'none') return;
  const sm = DATA.spendingSmile;
  const saude = DATA.saude_base;
  if (charts.income) { charts.income.destroy(); charts.income = null; }
  charts.income = new Chart(document.getElementById('incomeChart'), {
    type: 'bar',
    data: {
      labels: (function() { const a = DATA.premissas?.idade_cenario_base ?? 53; return [`Go-Go (${a}–${a+15})`, `Slow-Go (${a+15}–${a+30})`, `No-Go (${a+30}+)`]; })(),
      datasets: [
        { label: 'Lifestyle ex-saúde', data: [sm.go_go.gasto, sm.slow_go.gasto, sm.no_go.gasto], backgroundColor: 'rgba(59,130,246,.7)' },
        { label: 'Saúde (SAUDE_BASE+inflator)', data: [saude, saude * 1.3, saude * 2.0], backgroundColor: 'rgba(239,68,68,.5)' },
        { label: 'INSS (a partir dos 65)', data: [0, -DATA.premissas.inss_anual, -DATA.premissas.inss_anual], backgroundColor: 'rgba(34,197,94,.6)' },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8', font:{size:10} } } },
      scales: {
        y: { ticks: { color: '#94a3b8', callback: v => 'R$' + (v/1000).toFixed(0)+'k' }, grid: { color: 'rgba(71,85,105,.3)' } },
        x: { ticks: { color: '#94a3b8' } }
      }
    }
  });
}

// ── S17: Fee Analysis ─────────────────────────────────────────
function buildFeeAnalysis() {
  const _terCfg = (DATA.wellness_config?.metrics || []).find(m => m.id === 'ter') || {};
  const _currTer   = _terCfg.current_ter   ?? 0.247;
  const _benchTer  = _terCfg.benchmark_ter ?? 0.220;
  const _shadowCTer = _terCfg.shadow_c_ter ?? 0.207;
  const pat = DATA.premissas.patrimonio_atual;
  const anos = DATA.premissas.idade_cenario_base - DATA.premissas.idade_atual;
  const ALPHA_ANNUAL = _terCfg.alpha_anual ?? 0.00160;

  const portfolios = [
    { label: 'Carteira atual', ter: _currTer, isBaseline: false },
    { label: 'Shadow A — VWRA', ter: _benchTer, isBaseline: true },
    { label: 'Shadow C — VWRA+IPCA+', ter: _shadowCTer, isBaseline: true },
  ];

  const tbody = document.getElementById('feeBody');
  portfolios.forEach((p, i) => {
    const custo = p.ter/100 * pat * anos;
    const custoVwra = _benchTer/100 * pat * anos;
    const alpha = p.isBaseline ? null : ALPHA_ANNUAL * pat * anos;
    const extraCost = custo - custoVwra; // positive = costs more than VWRA
    const net = alpha != null ? alpha - extraCost : -(custo - custoVwra);

    const terColor = p.isBaseline ? '#94a3b8' : (p.ter > _benchTer ? '#eab308' : '#22c55e');
    const netColor = net > 0 ? '#22c55e' : '#ef4444';
    const netStr = p.isBaseline && i === 1 ? '<span style="color:var(--muted)">baseline</span>'
                 : `<span style="color:${netColor}">${net > 0 ? '+' : ''}${fmtBrl(net)}</span>`;
    const alphaStr = alpha != null ? `<span style="color:var(--green)">${fmtBrl(alpha)}</span>` : '<span style="color:var(--muted)">—</span>';

    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid rgba(71,85,105,.3)';
    if (i === 0) tr.style.fontWeight = '600';
    tr.innerHTML = `
      <td style="padding:7px 8px">${p.label}</td>
      <td class="num" style="padding:7px 8px;color:${terColor}">${p.ter.toFixed(3)}%</td>
      <td class="num pv" style="padding:7px 8px">${fmtBrl(custo)}</td>
      <td class="num pv" style="padding:7px 8px">${alphaStr}</td>
      <td class="num pv" style="padding:7px 8px">${netStr}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ── S18: Contribution Slider ──────────────────────────────────
window.updateContrib = function() {
  // Inicializar slider com aporte de DATA se ainda não foi alterado
  const slider = document.getElementById('contribSlider');
  if (!slider) return; // UI do simulador de aporte não está presente
  if (+slider.value === 25000 && DATA.premissas?.aporte_mensal) {
    slider.value = DATA.premissas.aporte_mensal;
  }
  const ap = +slider.value;
  const valEl = document.getElementById('contribVal');
  const resEl = document.getElementById('contribResult');
  if (valEl) valEl.textContent = 'R$' + ap.toLocaleString('pt-BR');
  const r = DATA.premissas.retorno_equity_base / 12;
  const pat = DATA.premissas.patrimonio_atual;
  const meta = PAT_GATILHO;
  let n = 0, p = pat;
  while (p < meta && n < 600) { p = p * (1 + r) + ap; n++; }
  const anos = n / 12;
  const _contribAnoFire = today.getFullYear() + (anos | 0) + (anos % 1 > 0.5 ? 1 : 0);
  if (resEl) {
    resEl.textContent = n < 600 ? `${anos.toFixed(1)} anos (${_contribAnoFire})` : '> 50 anos';
    resEl.style.color = n < 600 ? '#22c55e' : '#ef4444';
  }
};

// ── S19: What-If ──────────────────────────────────────────────
// Stress = retornos ruins → SWR mais conservador (menor) → patNecessario maior
// Fav    = retornos bons  → pode retirar mais         → patNecessario menor
const SWR_BY_PRESET = { stress: 0.020, base: 0.024, fav: 0.030 };

function interpolateFireMatrix(gastoAnual, swrTarget) {
  const fm = DATA.fire_matrix;
  if (!fm) return null;

  // New format: patrimônio × gasto
  if (fm.cenarios && fm.patrimonios && fm.gastos) {
    // Cenário vem do preset selecionado (base/fav/stress) — mapeia direto às colunas da matriz
    const cenario = window._wiPreset || window._fireMatrixCenario || 'base';
    const matrix = fm.cenarios[cenario];
    if (!matrix) return null;
    const pats  = fm.patrimonios;
    const gastos = fm.gastos;
    // P(sucesso) usa patrimônio alvo no FIRE day (gatilho), não gasto/SWR
    // Usar gasto/SWR como patrimônio fazia P subir ao aumentar o gasto — incorreto.
    const patrimonioRef = DATA.premissas?.patrimonio_gatilho
                       ?? pats[Math.floor(pats.length / 2)];

    const g = Math.max(gastos[0], Math.min(gastos[gastos.length-1], gastoAnual));
    const p = Math.max(pats[0],  Math.min(pats[pats.length-1],  patrimonioRef));

    let gi = gastos.findIndex(v => v >= g); if (gi <= 0) gi = 1;
    let pi = pats.findIndex(v => v >= p);   if (pi <= 0) pi = 1;

    const g0 = gastos[gi-1], g1 = gastos[gi];
    const p0 = pats[pi-1],   p1 = pats[pi];

    const fmtKey = (pt, ga) => String(pt) + '_' + Math.round(ga);
    const p00 = matrix[fmtKey(p0, g0)] ?? null;
    const p01 = matrix[fmtKey(p0, g1)] ?? null;
    const p10 = matrix[fmtKey(p1, g0)] ?? null;
    const p11 = matrix[fmtKey(p1, g1)] ?? null;
    if (p00 == null || p01 == null || p10 == null || p11 == null) return null;

    const tg = (g - g0) / (g1 - g0);
    const tp = (p - p0) / (p1 - p0);
    return p00*(1-tg)*(1-tp) + p01*tg*(1-tp) + p10*(1-tg)*tp + p11*tg*tp;
  }

  // Legacy format: SWR × gasto
  const gastos = fm.gastos;
  const swrs   = fm.swrs;
  const matrix = fm.matrix;
  if (!gastos || !swrs || !matrix) return null;

  const g = Math.max(gastos[0], Math.min(gastos[gastos.length-1], gastoAnual));
  const s = Math.max(swrs[0],   Math.min(swrs[swrs.length-1],     swrTarget));

  let gi = gastos.findIndex(v => v >= g); if (gi <= 0) gi = 1;
  let si = swrs.findIndex(v => v >= s);   if (si <= 0) si = 1;

  const g0 = gastos[gi-1], g1 = gastos[gi];
  const s0 = swrs[si-1],   s1 = swrs[si];

  const fmtKey = (sw, ga) => String(sw) + '_' + Math.round(ga);
  const p00 = matrix[fmtKey(s0, g0)] ?? null;
  const p01 = matrix[fmtKey(s0, g1)] ?? null;
  const p10 = matrix[fmtKey(s1, g0)] ?? null;
  const p11 = matrix[fmtKey(s1, g1)] ?? null;
  if (p00 == null || p01 == null || p10 == null || p11 == null) return null;

  const tg = (g - g0) / (g1 - g0);
  const ts = (s - s0) / (s1 - s0);
  return p00*(1-tg)*(1-ts) + p01*tg*(1-ts) + p10*(1-tg)*ts + p11*tg*ts;
}

window.setWiPreset = function(p) {
  window._wiPreset = p;
  document.querySelectorAll('.wi-preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === p));
  updateWhatIf();
};

window.updateWhatIf = function() {
  const wiC = document.getElementById('wiCusto');
  if (wiC && +wiC.value === 250000 && DATA.premissas?.custo_vida_base) wiC.value = DATA.premissas.custo_vida_base;
  const gasto = +wiC.value;
  const preset = window._wiPreset || 'base';
  const swr = SWR_BY_PRESET[preset];

  document.getElementById('wiCustoVal').textContent = 'R$ ' + (gasto/1000).toFixed(0) + 'k/ano';

  const pSuccesso = interpolateFireMatrix(gasto, swr);
  const patNecessario = gasto / swr;

  const pPct = pSuccesso != null ? (pSuccesso * 100).toFixed(1) : '--';
  const cor = pSuccesso == null ? 'var(--muted)' : pSuccesso >= 0.90 ? 'var(--green)' : pSuccesso >= 0.80 ? 'var(--yellow)' : 'var(--red)';
  document.getElementById('wiPsucesso').textContent = pPct + (pSuccesso != null ? '%' : '');
  document.getElementById('wiPsucesso').style.color = cor;

  document.getElementById('wiPatNecessario').textContent = 'R$ ' + (patNecessario/1e6).toFixed(2) + 'M';
  document.getElementById('wiSWRLabel').textContent = 'SWR ' + (swr*100).toFixed(1) + '%';
  const gastoLimite = (DATA.premissas?.patrimonio_gatilho || 13400000) * swr;
  const pctLimite = (gasto / gastoLimite * 100).toFixed(0);
  const pctEl = document.getElementById('wiPctLimite');
  if (pctEl) pctEl.textContent = pctLimite + '% do limite (' + (gastoLimite/1000).toFixed(0) + 'k/ano)';

  // Compute ETA to reach patNecessario from current patrimônio + aportes
  const etaEl = document.getElementById('wiFireEta');
  if (etaEl) {
    const _rMes = Math.pow(1 + (DATA.premissas?.retorno_equity_base || 0.0485), 1/12) - 1;
    const _aporte = DATA.premissas?.aporte_mensal || 33000;
    const _patAtual = DATA.premissas?.patrimonio_atual || 0;
    const _anoAtual = DATA.premissas?.ano_atual || 2026;
    const _idadeAtual = DATA.premissas?.idade_atual || 39;
    let _pat = _patAtual, _n = 0;
    while (_pat < patNecessario && _n < 600) {
      _pat = _pat * (1 + _rMes) + _aporte;
      _n++;
    }
    if (_n >= 600) {
      etaEl.textContent = 'Meta > 50 anos';
    } else {
      const _anoAlvo = _anoAtual + Math.floor(_n / 12);
      const _idadeAlvo = _idadeAtual + Math.floor(_n / 12);
      etaEl.textContent = `FIRE em ${_anoAlvo} — ${_idadeAlvo} anos`;
    }
  }
};

// ── S21: Posições ─────────────────────────────────────────────
function buildPosicoes() {
  // #11: Badge de staleness IBKR — compara posicoes_ibkr com data de hoje
  (function() {
    const badgeEl = document.getElementById('ibkrStalenessBadge');
    if (!badgeEl) return;
    const ibkrDateStr = DATA.timestamps?.posicoes_ibkr;
    if (!ibkrDateStr) { badgeEl.textContent = ''; return; }
    const ibkrDate = new Date(ibkrDateStr + 'T00:00:00');
    const today = new Date();
    const diffDays = Math.round((today - ibkrDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 3) {
      badgeEl.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:9999px;font-size:.6rem;font-weight:700;background:rgba(234,179,8,.2);color:var(--yellow);border:1px solid rgba(234,179,8,.3)">⚠ dados de ${diffDays} dias atrás</span>`;
    } else {
      badgeEl.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:9999px;font-size:.6rem;font-weight:600;background:rgba(34,197,94,.12);color:var(--green)">${ibkrDateStr}</span>`;
    }
  })();
  const tbody = document.getElementById('posBody');
  let totUsd = 0, totBrl = 0;
  const bucketColors = { SWRD: '#3b82f6', AVGS: '#8b5cf6', AVEM: '#06b6d4', JPGL: '#f97316' };
  Object.entries(DATA.posicoes).forEach(([ticker, p]) => {
    const valUsd = p.qty * p.price;
    const valBrl = valUsd * CAMBIO;
    const pm = p.avg_cost ?? p.pm;
    const gain = (p.price / pm - 1) * 100;
    totUsd += valUsd; totBrl += valBrl;
    const tr = document.createElement('tr');
    const statusBadge = p.status === 'alvo' ? '<span class="badge badge-alvo">alvo</span>' : '<span class="badge badge-trans">transit.</span>';
    const accBadge = (DATA.tax?.badges?.[ticker]) ? '<span class="badge-acc">ACC</span>' : '';
    const gainStr = `${gain >= 0 ? '+' : ''}${gain.toFixed(1)}%`;
    tr.innerHTML = `
      <td><strong>${ticker}</strong>${accBadge}</td>
      <td><span style="color:${bucketColors[p.bucket] || '#94a3b8'};font-size:.7rem">${p.bucket}</span></td>
      <td>${statusBadge}</td>
      <td class="num hide-mobile">$${pm.toFixed(2)}</td>
      <td class="num">$${p.price.toFixed(2)}</td>
      <td class="num ${gain >= 0 ? 'pos' : 'neg'}">${gainStr}</td>
      <td class="num pv">$${(valUsd/1000).toFixed(1)}k</td>
      <td class="num pv">R$${(valBrl/1000).toFixed(0)}k</td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('totalUsd').textContent = `$${(totUsd/1000).toFixed(0)}k`;
  document.getElementById('totalBrl').textContent = `R$${(totBrl/1000).toFixed(0)}k`;
}

// ── S21b2: Custo Base por Bucket ──────────────────────────────
function buildCustoBase() {
  const tbody = document.getElementById('custoBaseBody');
  if (!tbody) return;
  // Deriva buckets equity e metas intra-equity de DATA.pesosTarget
  const EQUITY_BUCKETS = ['SWRD', 'AVGS', 'AVEM'];
  const totalEquityTarget = EQUITY_BUCKETS.reduce((s, k) => s + (DATA.pesosTarget[k] || 0), 0);
  const buckets = {};
  EQUITY_BUCKETS.forEach(k => {
    buckets[k] = { meta: totalEquityTarget > 0 ? Math.round(DATA.pesosTarget[k] / totalEquityTarget * 100) : 0 };
  });
  const acc = {};
  EQUITY_BUCKETS.forEach(b => { acc[b] = { valor: 0, custo: 0 }; });
  // Usa DATA.posicoes[ticker].bucket diretamente — sem bucketMap hardcoded
  Object.entries(DATA.posicoes).forEach(([, p]) => {
    const b = p.bucket;
    if (!acc[b]) return;
    acc[b].valor += p.qty * p.price;
    acc[b].custo += p.qty * (p.avg_cost ?? p.pm ?? p.price);
  });
  const totalValor = Object.values(acc).reduce((s, v) => s + v.valor, 0);
  const colors = { SWRD: '#3b82f6', AVGS: '#8b5cf6', AVEM: '#06b6d4' };
  let totValor = 0, totCusto = 0;
  Object.entries(buckets).forEach(([b, cfg]) => {
    const { valor, custo } = acc[b];
    totValor += valor; totCusto += custo;
    const gain = custo > 0 ? (valor / custo - 1) * 100 : 0;
    const peso = totalValor > 0 ? valor / totalValor * 100 : 0;
    const delta = peso - cfg.meta;
    const gainColor = gain >= 0 ? '#22c55e' : '#ef4444';
    const deltaColor = Math.abs(delta) <= 2 ? '#22c55e' : Math.abs(delta) <= 5 ? '#eab308' : '#ef4444';
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid rgba(71,85,105,.3)';
    tr.innerHTML = `
      <td style="padding:7px 8px"><strong style="color:${colors[b]}">${b}</strong></td>
      <td class="num pv" style="padding:7px 8px">$${(valor/1000).toFixed(0)}k</td>
      <td class="num pv" style="padding:7px 8px;color:var(--muted)">$${(custo/1000).toFixed(0)}k</td>
      <td class="num" style="padding:7px 8px;color:${gainColor}">${gain >= 0 ? '+' : ''}${gain.toFixed(1)}%</td>
      <td class="num" style="padding:7px 8px">${peso.toFixed(1)}%</td>
      <td class="num" style="padding:7px 8px;color:var(--muted)">${cfg.meta}%</td>
      <td class="num" style="padding:7px 8px;color:${deltaColor}">${delta >= 0 ? '+' : ''}${delta.toFixed(1)}pp</td>
    `;
    tbody.appendChild(tr);
  });
  // Total row
  const totGain = totCusto > 0 ? (totValor / totCusto - 1) * 100 : 0;
  const totTr = document.createElement('tr');
  totTr.style.borderTop = '1px solid var(--border)';
  totTr.style.fontWeight = '600';
  totTr.innerHTML = `
    <td style="padding:7px 8px">Total equity</td>
    <td class="num pv" style="padding:7px 8px">$${(totValor/1000).toFixed(0)}k</td>
    <td class="num pv" style="padding:7px 8px;color:var(--muted)">$${(totCusto/1000).toFixed(0)}k</td>
    <td class="num" style="padding:7px 8px;color:${totGain >= 0 ? '#22c55e' : '#ef4444'}">${totGain >= 0 ? '+' : ''}${totGain.toFixed(1)}%</td>
    <td class="num" style="padding:7px 8px">—</td><td class="num" style="padding:7px 8px;color:var(--muted)">—</td><td class="num" style="padding:7px 8px">—</td>
  `;
  tbody.appendChild(totTr);
}

// ── S21c: Eventos de Vida ─────────────────────────────────────
function buildEventosVida() {
  const el = document.getElementById('eventosVidaBody');
  if (!el) return;
  const evs = DATA.eventos_vida || [];
  if (!evs.length) { el.innerHTML = '<span style="color:var(--muted);font-size:.8rem">Nenhum evento registrado</span>'; return; }
  el.innerHTML = evs.map(ev => `
    <div class="evento-row">
      <div class="evento-badge">📅</div>
      <div style="flex:1">
        <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">
          <strong style="font-size:.85rem">${ev.evento}</strong>
          <span style="font-size:.7rem;color:var(--yellow)">${ev.data_est}</span>
          <span style="font-size:.65rem;padding:1px 6px;border-radius:9999px;background:rgba(234,179,8,.15);color:var(--yellow)">${ev.status}</span>
        </div>
        <div style="font-size:.78rem;color:var(--accent);margin-top:3px" class="pv">💸 ${ev.impacto}</div>
        <div style="font-size:.7rem;color:var(--muted);margin-top:4px">${ev.acoes.map(a => `▸ ${a}`).join(' · ')}</div>
      </div>
    </div>`).join('');
}

// ── S21d: P(FIRE) Cenários Família ───────────────────────────
function buildPfireFamilia() {
  const el = document.getElementById('pfireFamiliaBody');
  if (!el) return;
  const ss = DATA.spendingSensibilidade || [];
  if (!ss.length) { el.innerHTML = '<span style="color:var(--muted);font-size:.8rem">Sem dados de sensibilidade — atualizar dashboard</span>'; return; }
  // Labels mapeados para contexto de família
  const labelMap = {
    'R$250k': 'Solteiro / FIRE Day', 'Solteiro/FIRE Day': 'Solteiro / FIRE Day',
    'R$270k': 'Pós-casamento', 'Pós-casamento': 'Pós-casamento',
    'R$300k': 'Casamento + filho', 'Casamento+filho': 'Casamento + filho',
  };
  const icons = {'Solteiro / FIRE Day': '🧑', 'Pós-casamento': '💍', 'Casamento + filho': '👨‍👩‍👧'};
  const base = ss.find(s => s.base && (s.label.includes('250') || s.label.includes('Solteiro')))?.base ?? ss[0]?.base ?? 90;
  // Update src with actual base cost
  const _pfSrc = document.getElementById('pfireFamiliaSrc');
  const _baseScen = ss.find(s => s.label.includes('250') || s.label.includes('Solteiro'));
  if (_pfSrc && _baseScen?.custo) { _pfSrc.textContent = `Base: Monte Carlo 10k simulações · custo de vida base R$${(_baseScen.custo/1000).toFixed(0)}k/ano · Sensibilidade ao custo de vida`; _pfSrc.className = 'src pv'; }
  // Zonas: Excelente ≥90%, Bom 80-90%, Regular 70-80%, Crítico <70%
  function _zoneLabel(v) {
    if (v == null) return { label: '—', color: 'var(--muted)', bg: 'rgba(71,85,105,.15)' };
    if (v >= 90) return { label: 'Excelente', color: '#22c55e', bg: 'rgba(34,197,94,.15)' };
    if (v >= 80) return { label: 'Bom',       color: '#3b82f6', bg: 'rgba(59,130,246,.15)' };
    if (v >= 70) return { label: 'Regular',   color: '#eab308', bg: 'rgba(234,179,8,.15)' };
    return             { label: 'Crítico',    color: '#ef4444', bg: 'rgba(239,68,68,.15)' };
  }
  // Zona bar: marcadores visuais nas faixas 70/80/90
  const zoneBar = `<div style="position:relative;height:22px;border-radius:6px;overflow:hidden;background:var(--card2)">
    <div style="position:absolute;left:0;width:70%;height:100%;background:rgba(239,68,68,.25)"></div>
    <div style="position:absolute;left:70%;width:10%;height:100%;background:rgba(234,179,8,.3)"></div>
    <div style="position:absolute;left:80%;width:10%;height:100%;background:rgba(59,130,246,.3)"></div>
    <div style="position:absolute;left:90%;width:10%;height:100%;background:rgba(34,197,94,.3)"></div>
    <div style="position:absolute;left:70%;top:0;width:1px;height:100%;background:rgba(234,179,8,.6)"></div>
    <div style="position:absolute;left:80%;top:0;width:1px;height:100%;background:rgba(59,130,246,.6)"></div>
    <div style="position:absolute;left:90%;top:0;width:1px;height:100%;background:rgba(34,197,94,.6)"></div>
    <div style="position:absolute;bottom:-1px;left:70%;font-size:.45rem;color:rgba(234,179,8,.8);transform:translateX(-50%)">70</div>
    <div style="position:absolute;bottom:-1px;left:80%;font-size:.45rem;color:rgba(59,130,246,.8);transform:translateX(-50%)">80</div>
    <div style="position:absolute;bottom:-1px;left:90%;font-size:.45rem;color:rgba(34,197,94,.8);transform:translateX(-50%)">90%</div>
    <POINT>
  </div>`;

  el.innerHTML = ss.map(s => {
    const label = labelMap[s.label] || s.label;
    const icon = icons[label] || '📊';
    const pf = s.base ?? s.pfire;
    const delta = pf != null ? (pf - base) : null;
    const zone = _zoneLabel(pf);
    const deltaStr = delta !== null && delta !== 0
      ? `<span style="font-size:.65rem;color:${delta < 0 ? '#ef4444' : '#22c55e'}">${delta > 0 ? '+' : ''}${delta.toFixed(1)}pp</span>`
      : '';
    const posX = Math.min(99, pf ?? 0);
    const pointHtml = `<div style="position:absolute;left:${posX}%;top:50%;width:12px;height:12px;border-radius:50%;background:${zone.color};border:2px solid white;transform:translate(-50%,-50%);z-index:2"></div>`;
    const bar = zoneBar.replace('<POINT>', pointHtml);
    return `<div style="margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:1rem">${icon}</span>
        <span style="font-size:.85rem;font-weight:600">${label}</span>
        <span style="font-size:1rem;font-weight:700;color:${zone.color}">${pf != null ? pf + '%' : '—'}</span>
        <span style="font-size:.65rem;font-weight:600;background:${zone.bg};color:${zone.color};padding:1px 5px;border-radius:4px">${zone.label}</span>
        ${deltaStr}
        <span style="font-size:.65rem;color:var(--muted);margin-left:auto" class="pv">R$${s.custo != null ? (s.custo/1000).toFixed(0)+'k' : '—'}/ano</span>
      </div>
      ${bar}
    </div>`;
  }).join('');
}

// ── S21b: Mini-log ────────────────────────────────────────────
function buildMinilog() {
  const el = document.getElementById('minilogBody');
  if (!el) return;
  const ops = DATA.minilog || [];
  if (!ops.length) { el.innerHTML = '<span style="color:var(--muted)">Sem operações recentes</span>'; return; }
  el.innerHTML = `<table style="width:100%;border-collapse:collapse">
  <thead><tr style="font-size:.7rem;color:var(--muted)">
    <th style="text-align:left;padding:4px 8px">Data</th>
    <th style="text-align:left;padding:4px 8px">Tipo</th>
    <th style="text-align:left;padding:4px 8px">Ativo</th>
    <th style="text-align:left;padding:4px 8px">Corretora</th>
    <th style="text-align:right;padding:4px 8px">Valor</th>
  </tr></thead>
  <tbody>` +
  ops.map(op => `<tr style="border-top:1px solid rgba(71,85,105,.2)">
    <td style="padding:4px 8px;color:var(--muted)">${op.data}</td>
    <td style="padding:4px 8px">${op.tipo}</td>
    <td style="padding:4px 8px"><strong>${op.ativo}</strong></td>
    <td style="padding:4px 8px;color:var(--muted)">${op.corretora ?? 'IBKR'}</td>
    <td style="padding:4px 8px;text-align:right;color:var(--accent)" class="pv">${op.valor}</td>
  </tr>`).join('') +
  `</tbody></table>`;
}

// ── S22: Calculadora Cascade ──────────────────────────────────
window.calcAporte = function() {
  const _apNum = document.getElementById('calcAporteNum');
  const _apEl  = document.getElementById('calcAporte');
  // Inicializar com DATA.premissas se primeiro uso
  if (_apNum && +_apNum.value === 25000 && DATA.premissas?.aporte_mensal) {
    _apNum.value = DATA.premissas.aporte_mensal;
    if (_apEl) _apEl.value = Math.round(DATA.premissas.aporte_mensal / 1000);
  }

  const ap  = Math.max(0, +(_apNum?.value ?? 25000));  // R$ direto do input numérico
  const fx  = DATA.cambio ?? 5.16;                      // câmbio informativo — PTAX BCB
  const apUsd = ap / fx;
  const _lblAp = document.getElementById('calcAporteLabel');
  const _lblFx = document.getElementById('calcCambioLabel');
  if (_lblAp) _lblAp.textContent = `R$ ${ap >= 1000 ? (ap/1000).toFixed(0)+'k' : ap}`;
  if (_lblFx) _lblFx.textContent = `R$ ${fx.toFixed(2)}`;
  const div = document.getElementById('calcResult');

  const pisoIpca  = DATA.pisos?.pisoTaxaIpcaLongo ?? 6.0;
  const pisoRenda = DATA.pisos?.pisoTaxaRendaPlus  ?? 6.5;
  const taxaIpca  = DATA.rf?.ipca2040?.taxa;
  const taxaRenda = DATA.rf?.renda2065?.taxa;
  const ipcaGapPp = (DATA.drift?.IPCA?.alvo ?? 15) - (DATA.drift?.IPCA?.atual ?? 0);

  // R$ máximo que IPCA+ pode absorver para fechar o gap para o alvo
  const pat = DATA.premissas?.patrimonio_atual ?? 0;
  const apIpcaMax = ipcaGapPp > 0 ? Math.max(0, (ipcaGapPp / 100) * pat) : 0;

  // Renda+ gap: alvo_pct - pct_atual (negativo = underweight, positivo = overweight)
  const rendaAlvoPct = DATA.dca_status?.renda_plus?.alvo_pct ?? 3.0;
  const rendaPctAtual = DATA.dca_status?.renda_plus?.pct_carteira_atual ?? 0;
  const rendaGapPp = rendaAlvoPct - rendaPctAtual;  // negativo = need more, positivo = too much

  // R$ máximo que Renda+ pode absorver para fechar o gap para o alvo
  const apRendaMax = rendaGapPp > 0 ? Math.max(0, (rendaGapPp / 100) * pat) : 0;

  const ipca_active  = taxaIpca  != null && taxaIpca  >= pisoIpca  && ipcaGapPp > 0;
  const renda_active = taxaRenda != null && taxaRenda >= pisoRenda && rendaGapPp > 0;

  const equityBuckets = ['SWRD','AVGS','AVEM']
    .map(k => ({ k, gap: (DATA.drift?.[k]?.alvo ?? 0) - (DATA.drift?.[k]?.atual ?? 0) }))
    .sort((a,b) => b.gap - a.gap);
  const topBucket = equityBuckets[0];

  // Cascade com overflow: calcula quanto vai para cada nível
  let rows = '';
  let restante = ap;
  let nivelNum = 1;

  function fmtK(v) { return v >= 1000 ? `R$${(v/1000).toFixed(1)}k` : `R$${v.toFixed(0)}`; }

  if (ipca_active) {
    const paraIpca = Math.min(restante, apIpcaMax);
    const overflow = restante - paraIpca;
    rows += `<div class="prio"><span class="prio-num">${nivelNum++}.</span>
      <strong>IPCA+ longo</strong> — ${taxaIpca?.toFixed(2)}% ≥ piso ${pisoIpca}% · janela ativa<br>
      <span style="font-size:.75rem;color:var(--muted)">→ <strong>${fmtK(paraIpca)}</strong> (TD 2040 80% + TD 2050 20%)
      · gap restante: −${Math.max(0, ipcaGapPp - paraIpca/pat*100).toFixed(1)}pp</span></div>`;
    restante = overflow;
    if (overflow > 0) {
      rows += `<div style="font-size:.7rem;color:var(--yellow);padding:2px 0 4px 12px">↳ Gap IPCA+ preenchido — excedente ${fmtK(overflow)} segue para próximo nível</div>`;
    } else {
      rows += `<div style="font-size:.7rem;color:var(--muted);padding:2px 0 4px 12px">▸ Renda+ e Equity aguardam IPCA+ atingir alvo de ${DATA.drift?.IPCA?.alvo}%</div>`;
    }
  } else if (taxaIpca != null) {
    rows += `<div style="font-size:.7rem;color:var(--muted);padding:2px 0 4px 8px">▸ IPCA+ (${taxaIpca?.toFixed(2)}% < piso ${pisoIpca}%) — pausado</div>`;
  }

  if (restante > 0 && renda_active) {
    const paraRenda = Math.min(restante, apRendaMax);
    const overflowRenda = restante - paraRenda;
    const rendaGapAposAporte = rendaGapPp - paraRenda/pat*100;
    rows += `<div class="prio"><span class="prio-num">${nivelNum++}.</span>
      <strong>Renda+ 2065</strong> — ${taxaRenda?.toFixed(2)}% ≥ piso ${pisoRenda}% · janela ativa<br>
      <span style="font-size:.75rem;color:var(--muted)">→ <strong>${fmtK(paraRenda)}</strong> em Renda+ 2065
      · gap restante: ${Math.max(0, rendaGapAposAporte).toFixed(1)}pp</span></div>`;
    restante = overflowRenda;
    if (overflowRenda > 0) {
      rows += `<div style="font-size:.7rem;color:var(--yellow);padding:2px 0 4px 12px">↳ Gap Renda+ preenchido — excedente ${fmtK(overflowRenda)} segue para próximo nível</div>`;
    }
  } else if (restante > 0 && taxaRenda != null && !renda_active) {
    rows += `<div style="font-size:.7rem;color:var(--muted);padding:2px 0 4px 8px">▸ Renda+ (${taxaRenda?.toFixed(2)}% < piso ${pisoRenda}%) — pausado</div>`;
  }

  if (restante > 0 && topBucket) {
    const topGapAposAporte = topBucket.gap - restante/fx/pat*100;
    rows += `<div class="prio"><span class="prio-num">${nivelNum++}.</span>
      <strong>Equity — ${topBucket.k}.L</strong> — mais subpeso (−${Math.abs(topBucket.gap).toFixed(1)}pp)<br>
      <span style="font-size:.75rem;color:var(--muted)">→ <strong>${fmtK(restante)}</strong> ($${(restante/fx).toFixed(0)}) em ${topBucket.k}.L
      · gap restante: −${Math.abs(topGapAposAporte).toFixed(1)}pp</span></div>`;
    equityBuckets.slice(1).forEach(b => {
      rows += `<div style="font-size:.7rem;color:var(--muted);padding:1px 0 1px 12px">▸ ${b.k}: drift ${b.gap > 0 ? '−' : '+'}${Math.abs(b.gap).toFixed(1)}pp</div>`;
    });
  }

  div.innerHTML = `
    <div style="background:var(--card2);border-radius:8px;padding:12px" class="pv">
      <div style="font-weight:600;margin-bottom:8px">Cascade — aporte ${fmtK(ap)} (≈ $${apUsd.toFixed(0)})</div>
      ${rows}
      <div style="font-size:.65rem;color:var(--muted);margin-top:8px;border-top:1px solid rgba(71,85,105,.3);padding-top:6px">
        Câmbio: R$${fx} · Piso IPCA+ ≥ ${pisoIpca.toFixed(1)}% · Piso Renda+ ≥ ${pisoRenda.toFixed(1)}%
        · Overflow: excedente acima do gap flui para próximo nível
      </div>
    </div>`;
};

// ── S24: Retornos Mensais — Heatmap ──────────────────────────
function buildRetornoHeatmap() {
  const allL = DATA.retornos_mensais?.dates || [];
  const allV = DATA.retornos_mensais?.values || [];
  const container = document.getElementById('heatmapContainer');
  if (!container || !allL.length) return;

  const isPrivate = document.body.classList.contains('private-mode');

  // Agrupar por {ano: {mes(0-11): valor}}
  const byYear = {};
  allL.forEach((lbl, i) => {
    const parts = lbl.split('-');
    const yr = parseInt(parts[0]);
    const mo = parseInt(parts[1]) - 1;
    if (!byYear[yr]) byYear[yr] = {};
    byYear[yr][mo] = allV[i];
  });
  const years = Object.keys(byYear).map(Number).sort();
  const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  const retColor = v => {
    if (v === undefined || v === null) return 'rgba(71,85,105,0.2)';
    const c = Math.max(-8, Math.min(8, v));
    return c >= 0
      ? `rgba(34,197,94,${0.15 + (c/8)*0.65})`
      : `rgba(239,68,68,${0.15 + (-c/8)*0.65})`;
  };
  const textCol = v => v !== undefined && Math.abs(v) > 3 ? '#fff' : '#94a3b8';
  const pvWrap = (txt) => `<span class="pv">${txt}</span>`;
  const fmtCell = (v) => {
    if (v === undefined) return '—';
    const s = (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
    return isPrivate ? pvWrap(s) : s;
  };
  const fmtAccum = (pct) => {
    const s = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
    return isPrivate ? pvWrap(s) : s;
  };

  let html = `<table style="border-collapse:separate;border-spacing:2px;width:100%;font-size:.72rem">
    <thead><tr>
      <th style="color:var(--muted);padding:4px 8px;text-align:left;font-weight:400">Ano</th>
      ${MONTHS.map(m => `<th style="color:var(--muted);padding:4px 2px;text-align:center;font-weight:400;min-width:44px">${m}</th>`).join('')}
      <th style="color:var(--muted);padding:4px 8px;text-align:center;font-weight:400">Acum.</th>
    </tr></thead><tbody>`;

  years.forEach(yr => {
    const row = byYear[yr];
    const monthVals = Object.values(row);
    const yearPct = (monthVals.reduce((acc, v) => acc * (1 + v/100), 1) - 1) * 100;

    html += `<tr><td style="color:var(--muted);padding:4px 8px;font-weight:600">${yr}</td>`;
    for (let m = 0; m < 12; m++) {
      const v = row[m];
      const bg = retColor(v);
      const color = textCol(v);
      const tip = v !== undefined ? (v>=0?'+':'') + v.toFixed(2) + '%' : '—';
      html += `<td style="background:${bg};color:${color};padding:5px 2px;text-align:center;border-radius:3px" title="${isPrivate ? '***' : tip}">${fmtCell(v)}</td>`;
    }
    const acumBg = retColor(yearPct);
    const acumColor = textCol(yearPct);
    html += `<td style="background:${acumBg};color:${acumColor};padding:5px 8px;text-align:center;border-radius:3px;font-weight:600">${fmtAccum(yearPct)}</td></tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;

  // Stats cards
  const statsDiv = document.getElementById('monthlyRetStats');
  if (statsDiv && allV.length) {
    const avg = allV.reduce((a,b) => a+b, 0) / allV.length;
    const std = Math.sqrt(allV.reduce((s,v) => s+(v-avg)**2, 0) / allV.length);
    const pctPos = allV.filter(v => v > 0).length / allV.length * 100;
    const best = Math.max(...allV);
    const worst = Math.min(...allV);
    const bestL = allL[allV.indexOf(best)];
    const worstL = allL[allV.indexOf(worst)];
    const ss = 'background:var(--card2);border-radius:8px;padding:8px;text-align:center';
    const mu = 'font-size:.6rem;color:var(--muted);margin-bottom:2px';
    const big = (v, c) => `<div style="font-size:1rem;font-weight:700;color:${c}">${v}</div>`;
    const pv = isPrivate ? ' class="pv"' : '';
    statsDiv.innerHTML = `
      <div style="${ss}"><div style="${mu}">Retorno médio/mês</div>
        <div${pv}>${big((avg>=0?'+':'')+avg.toFixed(2)+'%', avg>=0?'var(--green)':'var(--red)')}</div></div>
      <div style="${ss}"><div style="${mu}">Volatilidade (σ)</div>
        ${big(std.toFixed(2)+'%', '#94a3b8')}</div>
      <div style="${ss}"><div style="${mu}">% meses positivos</div>
        ${big(pctPos.toFixed(0)+'%', pctPos>=50?'var(--green)':'var(--yellow)')}</div>
      <div style="${ss}"><div style="${mu}">Melhor mês</div>
        <div${pv}>${big('+'+best.toFixed(2)+'%', 'var(--green)')}</div>
        <div style="font-size:.6rem;color:var(--muted);margin-top:2px">${fmtMonthLabel(bestL)}</div></div>
      <div style="${ss}"><div style="${mu}">Pior mês</div>
        <div${pv}>${big(worst.toFixed(2)+'%', 'var(--red)')}</div>
        <div style="font-size:.6rem;color:var(--muted);margin-top:2px">${fmtMonthLabel(worstL)}</div></div>`;
  }
}

// ── S24b: Rolling Sharpe 12m (pre-computed server-side) ──────
function buildRollingSharp() {
  const rs = DATA.rolling_sharpe || {};
  const labels = rs.dates || [];
  const sharpesBrl = rs.values || [];
  const sharpesUsd = rs.values_usd || [];

  if (!sharpesBrl.length) {
    checkMinPoints('rollingSharpChart', 0, 13);
    return;
  }

  if (charts.rollingSharp) { charts.rollingSharp.destroy(); charts.rollingSharp = null; }

  const colorFor = v => v >= 1 ? 'rgba(34,197,94,.85)' : v >= 0 ? 'rgba(250,204,21,.8)' : 'rgba(248,113,113,.85)';
  const ptColors = sharpesBrl.map(colorFor);

  const datasets = [
    {
      label: 'Sharpe BRL vs CDI',
      data: sharpesBrl,
      segment: { borderColor: ctx => colorFor(ctx.p1.parsed.y) },
      borderWidth: 1.5,
      pointBackgroundColor: ptColors,
      pointBorderWidth: 0,
      pointRadius: 1.5,
      fill: false,
      tension: 0.3,
    },
  ];

  // Sharpe USD vs T-Bill (linha secundária)
  if (sharpesUsd.length) {
    datasets.push({
      label: 'Sharpe USD vs T-Bill',
      data: sharpesUsd,
      borderColor: 'rgba(96,165,250,.5)',
      borderWidth: 1.2,
      borderDash: [5,3],
      pointRadius: 0,
      fill: false,
      tension: 0.3,
    });
  }

  datasets.push(
    {
      label: 'Sharpe=1',
      data: labels.map(() => 1),
      borderColor: 'rgba(255,255,255,.2)',
      borderWidth: 1,
      borderDash: [4,3],
      pointRadius: 0,
      fill: false,
    },
    {
      label: 'Zero',
      data: labels.map(() => 0),
      borderColor: 'rgba(239,68,68,.3)',
      borderWidth: 1,
      borderDash: [2,2],
      pointRadius: 0,
      fill: false,
    }
  );

  charts.rollingSharp = new Chart(document.getElementById('rollingSharpChart'), {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 10 } }, position: 'top' },
        tooltip: {
          callbacks: {
            title: items => items.length ? fmtMonthLabel(items[0].label) : '',
            label: ctx => {
              const lbl = ctx.dataset.label;
              if (ctx.parsed.y === null || ctx.parsed.y === undefined) return '';
              if (lbl.startsWith('Sharpe')) return ` ${lbl}: ${ctx.parsed.y.toFixed(2)}`;
              return '';
            },
          }
        }
      },
      scales: {
        x: { ticks: { color: '#94a3b8', maxTicksLimit: 12, callback: fmtMonthTick }, grid: { color: 'rgba(71,85,105,.3)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(71,85,105,.3)' } }
      }
    }
  });
}

// ── S24c: Information Ratio vs VWRA ──────────────────────────
function buildInformationRatio() {
  const ir = DATA.rolling_sharpe?.information_ratio;
  if (!ir) return;

  // ── Cards ITD ──
  const itd = ir.itd || {};
  const cardsEl = document.getElementById('irITDCards');
  if (cardsEl) {
    const irVal  = itd.ir   != null ? (itd.ir >= 0 ? '+' : '') + itd.ir.toFixed(4) : '—';
    const teVal  = itd.tracking_error_pct != null ? itd.tracking_error_pct.toFixed(2) + '%' : '—';
    const arVal  = itd.active_return_anual_pct != null ? (itd.active_return_anual_pct >= 0 ? '+' : '') + itd.active_return_anual_pct.toFixed(2) + '%/ano' : '—';
    const nMeses = itd.n_meses != null ? itd.n_meses + 'm' : '';
    const bench  = ir.benchmark || 'VWRA.L';
    const base   = ir.base || 'USD';
    const subtitle = `vs ${bench} (${base}${nMeses ? ', ' + nMeses : ''})`;
    const irColor = itd.ir >= 0 ? 'var(--green)' : 'var(--red)';
    const arColor = (itd.active_return_anual_pct || 0) >= 0 ? 'var(--green)' : 'var(--red)';
    cardsEl.innerHTML = `
      <div style="background:var(--card2);border-radius:8px;padding:12px;text-align:center;border:1px solid var(--border)">
        <div style="font-size:.6rem;color:var(--muted);margin-bottom:4px">Information Ratio (Desde o Início)</div>
        <div style="font-size:1.6rem;font-weight:700;color:${irColor}">${irVal}</div>
        <div style="font-size:.55rem;color:var(--muted);margin-top:2px">${subtitle}</div>
      </div>
      <div style="background:var(--card2);border-radius:8px;padding:12px;text-align:center;border:1px solid var(--border)">
        <div style="font-size:.6rem;color:var(--muted);margin-bottom:4px">Tracking Error (Desde o Início)</div>
        <div style="font-size:1.6rem;font-weight:700;color:var(--yellow)">${teVal}</div>
        <div style="font-size:.55rem;color:var(--muted);margin-top:2px">anualizado (p.p.)</div>
      </div>
      <div style="background:var(--card2);border-radius:8px;padding:12px;text-align:center;border:1px solid var(--border)">
        <div style="font-size:.6rem;color:var(--muted);margin-bottom:4px">Active Return (Desde o Início)</div>
        <div style="font-size:1.6rem;font-weight:700;color:${arColor}">${arVal}</div>
        <div style="font-size:.55rem;color:var(--muted);margin-top:2px">retorno ativo anualizado</div>
      </div>`;
  }

  // ── Gráfico rolling 36m ──
  const r36 = ir.rolling_36m || {};
  const labels = r36.dates || [];
  const values = r36.values || [];
  const nota   = r36.nota || '';

  // Atualizar nota de robustez
  const notaEl = document.getElementById('rollingIRNota');
  if (notaEl && nota) {
    notaEl.innerHTML += `<br><span style="color:var(--yellow);font-size:.7rem">⚠ ${nota}</span>`;
  }

  if (!values.length) {
    checkMinPoints('rollingIRChart', 0, 13);
    return;
  }

  if (charts.rollingIR) { charts.rollingIR.destroy(); charts.rollingIR = null; }

  const colorFor = v => v >= 0 ? 'rgba(34,197,94,.85)' : 'rgba(248,113,113,.85)';
  const ptColors = values.map(colorFor);

  charts.rollingIR = new Chart(document.getElementById('rollingIRChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'IR 36m vs VWRA',
          data: values,
          segment: { borderColor: ctx => colorFor(ctx.p1.parsed.y) },
          borderWidth: 1.5,
          pointBackgroundColor: ptColors,
          pointBorderWidth: 0,
          pointRadius: 2,
          fill: false,
          tension: 0.3,
        },
        {
          label: 'IR=0',
          data: labels.map(() => 0),
          borderColor: 'rgba(239,68,68,.35)',
          borderWidth: 1,
          borderDash: [4,3],
          pointRadius: 0,
          fill: false,
        },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 10 } }, position: 'top' },
        tooltip: {
          callbacks: {
            title: items => items.length ? fmtMonthLabel(items[0].label) : '',
            label: ctx => {
              if (ctx.dataset.label === 'IR=0') return '';
              if (ctx.parsed.y == null) return '';
              return ` IR 36m: ${ctx.parsed.y.toFixed(3)}`;
            },
          }
        }
      },
      scales: {
        x: { ticks: { color: '#94a3b8', maxTicksLimit: 12, callback: fmtMonthTick }, grid: { color: 'rgba(71,85,105,.3)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(71,85,105,.3)' } }
      }
    }
  });
}

// ── IR Diferido + TLH Monitor (merged) ───────────────────────
function buildTLH() { buildIrDiferido(); } // alias para compatibilidade tabFns
function buildIrDiferido() {
  const el = document.getElementById('taxIrBody');
  if (!el) return;
  const tax = DATA.tax;
  if (!tax) { const s = document.getElementById('taxIrSection'); if (s) s.style.display = 'none'; return; }

  const etfs   = tax.ir_por_etf || {};
  const tlhGatilho = DATA.tlhGatilho ?? 0.05;
  const _irAliq    = DATA.pisos?.ir_aliquota ?? 0.15;

  // Mapa ticker → info TLH (transitórios)
  const tlhMap = {};
  (DATA.tlh || []).forEach(t => { tlhMap[t.ticker] = t; });
  const transitorioTickers = new Set(Object.keys(tlhMap));

  // Separar alvo vs transitório
  const alvo = [], trans = [];
  Object.entries(etfs).forEach(([ticker, e]) => {
    (transitorioTickers.has(ticker) ? trans : alvo).push([ticker, e]);
  });
  // Ordenar por IR estimado desc
  const sortIr = arr => arr.sort((a, b) => (b[1].ir_estimado || 0) - (a[1].ir_estimado || 0));
  sortIr(alvo); sortIr(trans);

  const TH = `<th style="padding:5px 8px;text-align:right;font-size:.6rem;color:var(--muted);text-transform:uppercase;border-bottom:2px solid var(--border)">`;
  const THL = `<th style="padding:5px 8px;text-align:left;font-size:.6rem;color:var(--muted);text-transform:uppercase;border-bottom:2px solid var(--border)">`;

  function renderGroup(entries, isTransitorio) {
    if (!entries.length) return '';
    const label = isTransitorio ? '🔄 Transitório — diluir via aportes' : '🎯 Alvo';
    let h = `<tr><td colspan="${isTransitorio ? 6 : 5}" style="padding:8px 8px 4px;font-size:.65rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;background:rgba(71,85,105,.08)">${label}</td></tr>`;
    let totalGanho = 0, totalIr = 0;
    entries.forEach(([ticker, e]) => {
      const ganho  = e.ganho_brl   || 0;
      const ir     = e.ir_estimado || 0;
      totalGanho  += ganho;
      totalIr     += ir;
      const pct    = e.custo_total_brl > 0 ? (ganho / e.custo_total_brl * 100) : null;
      const pctStr = pct != null ? `<span style="color:${pct >= 0 ? 'var(--green)' : 'var(--red)'};font-size:.68rem">${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%</span>` : '';
      const irColor = ir > 0 ? 'var(--yellow)' : (ganho < 0 ? 'var(--green)' : 'var(--muted)');
      const irStr  = ir > 0 ? `<span class="pv" style="color:var(--yellow)">R$${(ir/1000).toFixed(1)}k</span>`
                            : (ganho < 0 ? `<span style="color:var(--green);font-size:.68rem">−R$${(Math.abs(ganho)*_irAliq/1000).toFixed(1)}k</span>` : '<span style="color:var(--muted)">—</span>');

      let tlhCell = '';
      if (isTransitorio) {
        const t = tlhMap[ticker];
        const isTLH = t && (t.price / t.pm - 1) <= -tlhGatilho;
        tlhCell = `<td style="padding:5px 8px;font-size:.65rem;color:var(--muted)">${t ? t.ucits : '—'}${isTLH ? ' <span style="color:var(--red)">⚠️ TLH</span>' : ''}</td>`;
      }
      h += `<tr style="border-bottom:1px solid rgba(71,85,105,.15)">
        <td style="padding:5px 8px;font-weight:600">${ticker}</td>
        <td style="padding:5px 8px;text-align:right;font-variant-numeric:tabular-nums">${pctStr}</td>
        <td class="pv" style="padding:5px 8px;text-align:right;color:${ganho >= 0 ? 'var(--green)' : 'var(--red)'};font-variant-numeric:tabular-nums">R$${(ganho/1000).toFixed(0)}k</td>
        <td style="padding:5px 8px;text-align:right">${irStr}</td>
        <td style="padding:5px 8px;text-align:right;color:var(--muted);font-size:.68rem">${e.ptax_compra_medio != null ? e.ptax_compra_medio.toFixed(4) : '—'}</td>
        ${tlhCell}
      </tr>`;
    });
    // Subtotal
    h += `<tr style="border-top:1px solid rgba(71,85,105,.3);font-weight:700;font-size:.75rem">
      <td style="padding:5px 8px;color:var(--muted)">Subtotal</td>
      <td></td>
      <td class="pv" style="padding:5px 8px;text-align:right;color:${totalGanho >= 0 ? 'var(--green)' : 'var(--red)'}">R$${(totalGanho/1000).toFixed(0)}k</td>
      <td class="pv" style="padding:5px 8px;text-align:right;color:var(--yellow)">R$${(totalIr/1000).toFixed(1)}k</td>
      <td></td>${isTransitorio ? '<td></td>' : ''}
    </tr>`;
    return h;
  }

  // Colunas: 5 para alvo, 6 para transitório (+UCITS alvo)
  const hasTransit = trans.length > 0;
  const cols = hasTransit ? 6 : 5;
  let html = `<table style="width:100%;border-collapse:collapse;font-size:.78rem">
    <thead><tr>
      ${THL}ETF</th>${TH}Ganho%</th>${TH}Ganho BRL</th>${TH}IR Est.</th>${TH}PTAX médio</th>${hasTransit ? TH + 'UCITS alvo</th>' : ''}
    </tr></thead><tbody>`;
  html += renderGroup(alvo, false);
  if (hasTransit) html += renderGroup(trans, true);

  // Total geral
  const totalIR = tax.ir_diferido_total_brl || 0;
  html += `<tr style="border-top:2px solid var(--border);font-weight:700">
    <td style="padding:6px 8px">Total</td>
    <td></td><td></td>
    <td class="pv" style="padding:6px 8px;text-align:right;color:var(--yellow)">R$${(totalIR/1000).toFixed(0)}k</td>
    <td></td>${hasTransit ? '<td></td>' : ''}
  </tr>`;
  html += '</tbody></table>';

  const hdr = document.getElementById('taxIrTotalHeader');
  if (hdr) hdr.textContent = `— R$${(totalIR/1000).toFixed(0)}k latente`;
  el.innerHTML = html;
}

// ── S26: HODL11 ───────────────────────────────────────────────
function renderHodl11() {
  const val = DATA.hodl11.qty * DATA.hodl11.preco;
  document.getElementById('hodl11Val').textContent = `R$ ${(val/1000).toFixed(0)}k`;
  document.getElementById('hodl11Sub').textContent = `${DATA.hodl11.qty.toLocaleString('pt-BR')} cotas · B3 · R$${DATA.hodl11.preco.toFixed(2)}/cota`;
}

// ── S27: Backtest ─────────────────────────────────────────────
// Cycle start dates for backtest period selectors
const BACKTEST_CYCLES = {
  'all':       { cutDate: '2005-01', label: 'jan/2005–abr/2026 (21 anos)', useR5: true  },
  'since2009': { cutDate: '2009-01', label: 'jan/2009–abr/2026 (17 anos)', useR5: true  },
  'since2013': { cutDate: '2013-01', label: 'jan/2013–abr/2026 (13 anos)', useR5: true  },
  'since2020': { cutDate: '2020-01', label: 'jan/2020–abr/2026 (6 anos)',  useR5: false },
  '5y':        { cutDate: '2021-01', label: 'jan/2021–abr/2026 (5 anos)',  useR5: false },
  '3y':        { cutDate: '2023-01', label: 'jan/2023–abr/2026 (3 anos)',  useR5: false },
  'r7':        { cutDate: '1995-01', label: 'jan/1995–atual (31 anos)',     useR7: true  },
};

function buildBacktest(period) {
  // Injetar nota_proxy do data.json (substitui texto hardcoded)
  const _notaEl = document.getElementById('backtestNotaProxy');
  if (_notaEl) _notaEl.textContent = DATA.backtest?.nota_proxy || '';

  const cycle = BACKTEST_CYCLES[period] || BACKTEST_CYCLES['since2009'];

  // R7: usar cumulative_returns do backtest_r7 diretamente
  if (cycle.useR7 && DATA.backtest_r7?.cumulative_returns) {
    const cr = DATA.backtest_r7.cumulative_returns;
    const base_t = cr.target[0];
    const base_b = cr.bench[0];
    const dates   = cr.dates.map(d => d.slice(0, 7)); // YYYY-MM-DD → YYYY-MM
    const target  = cr.target.map(v => +(v / base_t * 100).toFixed(2));
    const bench   = cr.bench.map(v  => +(v / base_b * 100).toFixed(2));
    if (charts.backtest) { charts.backtest.destroy(); charts.backtest = null; }
    charts.backtest = new Chart(document.getElementById('backtestChart'), {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          { label: 'Target (50/30/20)', data: target, borderColor: '#3b82f6', borderWidth: 2, pointRadius: 0, fill: false, tension: 0.2 },
          { label: 'Benchmark (ACWI)', data: bench,  borderColor: '#94a3b8', borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.2, borderDash: [4,2] },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8' } },
          tooltip: { callbacks: { title: items => items.length ? fmtMonthLabel(items[0].label) : '', label: ctx => { if (ctx.parsed.y == null || isNaN(ctx.parsed.y)) return null; return ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}`; } } }
        },
        scales: {
          x: { ticks: { color: '#94a3b8', maxTicksLimit: 10, callback: fmtMonthTick }, grid: { color: 'rgba(71,85,105,.2)' } },
          y: { ticks: { color: '#94a3b8', callback: v => v.toFixed(0) }, grid: { color: 'rgba(71,85,105,.2)' } }
        }
      }
    });
    // Show metrics from pre-computed R7 data
    const mg = DATA.backtest_r7.metricas_globais;
    const tbody = document.querySelector('#backtestMetricsTable tbody');
    if (tbody && mg) {
      const rows = [
        ['CAGR', mg.cagr_target_pct?.toFixed(2) + '%', mg.cagr_bench_pct?.toFixed(2) + '%', (mg.alpha_pp >= 0 ? '+' : '') + mg.alpha_pp?.toFixed(2) + 'pp'],
        ['Sharpe', mg.sharpe_target?.toFixed(2), mg.sharpe_bench?.toFixed(2), (mg.sharpe_target - mg.sharpe_bench >= 0 ? '+' : '') + (mg.sharpe_target - mg.sharpe_bench).toFixed(2)],
        ['Sortino', mg.sortino_target?.toFixed(2), '—', '—'],
        ['Max DD', mg.max_dd_target_pct?.toFixed(1) + '%', mg.max_dd_bench_pct?.toFixed(1) + '%', ((mg.max_dd_target_pct - mg.max_dd_bench_pct) >= 0 ? '+' : '') + (mg.max_dd_target_pct - mg.max_dd_bench_pct).toFixed(1) + 'pp'],
      ];
      tbody.innerHTML = rows.map(r => {
        const isGood = parseFloat(r[3]) >= 0;
        return `<tr><td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td><td class="num ${r[3] !== '—' ? (isGood ? 'pos' : 'neg') : ''}">${r[3]}</td></tr>`;
      }).join('');
    }
    // Hide nota proxy (not applicable for R7)
    if (_notaEl) _notaEl.textContent = 'Regime 7 — proxies acadêmicos (DFA + Ken French). Série longa ' + (DATA.backtest_r7.periodo?.start?.slice(0,7) || '1995-01') + ' → ' + (DATA.backtest_r7.periodo?.end?.slice(0,7) || 'atual') + '.';
    return;
  }

  const useR5 = cycle.useR5;
  const allDates = useR5 ? DATA.backtestR5.dates : DATA.backtest.dates;
  const allTarget = useR5 ? DATA.backtestR5.target : DATA.backtest.target;
  const allShadowA = useR5 ? DATA.backtestR5.shadowA : DATA.backtest.shadowA;

  // Find cut index by cycle start date
  const cutDate = new Date(cycle.cutDate + '-01');
  let cutIdx = allDates.findIndex(d => new Date(d + '-01') >= cutDate);
  if (cutIdx < 0) cutIdx = 0;

  const dates = allDates.slice(cutIdx);
  // Reindex base 100 at start of period
  const tBase = allTarget[cutIdx];
  const sBase = allShadowA[cutIdx];
  const target = allTarget.slice(cutIdx).map(v => +(v / tBase * 100).toFixed(2));
  const shadowA = allShadowA.slice(cutIdx).map(v => +(v / sBase * 100).toFixed(2));

  if (charts.backtest) { charts.backtest.destroy(); charts.backtest = null; }
  charts.backtest = new Chart(document.getElementById('backtestChart'), {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        { label: 'Target (50/30/20)', data: target, borderColor: '#3b82f6', borderWidth: 2, pointRadius: 0, fill: false, tension: 0.2 },
        { label: 'VWRA', data: shadowA, borderColor: '#94a3b8', borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.2, borderDash: [4,2] },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } },
        tooltip: { callbacks: { title: items => items.length ? fmtMonthLabel(items[0].label) : '', label: ctx => { if (ctx.parsed.y == null || isNaN(ctx.parsed.y)) return null; return ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}`; } } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8', maxTicksLimit: 10, callback: fmtMonthTick }, grid: { color: 'rgba(71,85,105,.2)' } },
        y: { ticks: { color: '#94a3b8', callback: v => v.toFixed(0) }, grid: { color: 'rgba(71,85,105,.2)' } }
      }
    }
  });

  // Compute metrics for sub-period
  function computeMetrics(arr) {
    const n = arr.length;
    if (n < 2) return null;
    const rets = [];
    for (let i = 1; i < n; i++) rets.push((arr[i] - arr[i-1]) / arr[i-1]);
    const avgRet = rets.reduce((s,r) => s+r, 0) / rets.length;
    const cagr = (Math.pow(arr[n-1] / arr[0], 12 / (n - 1)) - 1) * 100; // M1: (n-1) períodos entre n pontos
    const vol = Math.sqrt(rets.reduce((s,r) => s + (r - avgRet)**2, 0) / (rets.length - 1)) * Math.sqrt(12) * 100; // M2: sigma amostral ÷(N-1)
    // RF rate: taxa IPCA+ 2029 se disponível (proxy de RF BRL); fallback 4% histórico
    const _rfRate = DATA.rf?.ipca2029?.taxa ?? DATA.pisos?.pisoTaxaIpcaLongo ?? 4;
    const sharpe = vol > 0 ? (cagr - _rfRate) / vol : 0;
    const negRets = rets.filter(r => r < 0);
    const downDev = negRets.length > 0 ? Math.sqrt(negRets.reduce((s,r) => s+r**2, 0) / negRets.length) * Math.sqrt(12) * 100 : 0.01;
    const sortino = downDev > 0 ? (cagr - _rfRate) / downDev : 0;
    let maxDD = 0, peak = arr[0];
    arr.forEach(v => { if (v > peak) peak = v; const dd = (v - peak) / peak * 100; if (dd < maxDD) maxDD = dd; });
    return { cagr, vol, sharpe, sortino, maxDD };
  }
  const tArr = allTarget.slice(cutIdx);
  const sArr = allShadowA.slice(cutIdx);
  const tm = computeMetrics(tArr);
  const sm = computeMetrics(sArr);

  // Update cycle label note
  const r5note = document.getElementById('backtestR5Note');
  if (r5note) {
    const proxyNote = useR5 ? ' · proxies US-listed (pré-2019)' : ' · proxies UCITS (pós-2019)';
    r5note.textContent = '📅 Período: ' + cycle.label + proxyNote;
    r5note.style.display = 'block';
  }

  const tbody = document.getElementById('backtestMetricsBody');
  tbody.innerHTML = '';
  if (tm && sm) {
    const rows = [
      ['CAGR', tm.cagr.toFixed(2)+'%', sm.cagr.toFixed(2)+'%', (tm.cagr - sm.cagr).toFixed(2)+'pp'],
      ['Sharpe', tm.sharpe.toFixed(2), sm.sharpe.toFixed(2), (tm.sharpe - sm.sharpe).toFixed(2)],
      ['Sortino', tm.sortino.toFixed(2), sm.sortino.toFixed(2), (tm.sortino - sm.sortino).toFixed(2)],
      ['Max Drawdown', tm.maxDD.toFixed(2)+'%', sm.maxDD.toFixed(2)+'%', (tm.maxDD - sm.maxDD).toFixed(2)+'pp'],
      ['Volatilidade', tm.vol.toFixed(2)+'%', sm.vol.toFixed(2)+'%', (tm.vol - sm.vol).toFixed(2)+'pp'],
    ];
    rows.forEach(r => {
      const tr = document.createElement('tr');
      const delta = +r[3];
      const isGood = r[0] === 'Max Drawdown' || r[0] === 'Volatilidade' ? delta <= 0 : delta >= 0;
      tr.innerHTML = `<td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td><td class="num ${isGood ? 'pos' : 'neg'}">${delta > 0 ? '+' : ''}${r[3]}</td>`;
      tbody.appendChild(tr);
    });
  }
}
window.setBacktestPeriod = function(p) {
  // For backtest, match by onclick attribute since button text differs from period key
  document.querySelectorAll('#backtestPeriodBtns button').forEach(b => {
    b.classList.toggle('active', b.getAttribute('onclick') === `setBacktestPeriod('${p}')`);
  });
  buildBacktest(p);
};

// ── S27b: Backtest R7 Section ─────────────────────────────────
function buildBacktestR7() {
  const r7 = DATA.backtest_r7;
  if (!r7) return;

  // Métricas globais — cards
  const mg = r7.metricas_globais;
  const metricas = [
    { label: 'CAGR Target',    value: mg.cagr_target_pct?.toFixed(1) + '%', color: 'green' },
    { label: 'CAGR Benchmark', value: mg.cagr_bench_pct?.toFixed(1) + '%',  color: '' },
    { label: 'Alpha',          value: (mg.alpha_pp >= 0 ? '+' : '') + mg.alpha_pp?.toFixed(2) + 'pp', color: mg.alpha_pp >= 0 ? 'green' : 'red' },
    { label: 'Sharpe Target',  value: mg.sharpe_target?.toFixed(2), color: '' },
    { label: 'Sortino Target', value: mg.sortino_target?.toFixed(2), color: '' },
    { label: 'Max DD',         value: mg.max_dd_target_pct?.toFixed(1) + '%', color: 'red' },
  ];
  const grid = document.getElementById('r7MetricsGrid');
  if (grid) grid.innerHTML = metricas.map(m => `
    <div style="background:var(--card2);border-radius:8px;padding:10px;text-align:center">
      <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase;margin-bottom:4px">${m.label}</div>
      <div style="font-size:1.1rem;font-weight:700;color:${m.color === 'green' ? 'var(--green)' : m.color === 'red' ? 'var(--red)' : 'var(--text)'}">${m.value ?? '—'}</div>
    </div>`).join('');

  // Win Rate
  const wr = r7.win_rates;
  const wrEl = document.getElementById('r7WinRateSection');
  if (wrEl) wrEl.innerHTML = `
    <div style="font-size:.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:6px">Win Rate — Target vs Benchmark</div>
    <div class="dynamic-2col" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div style="background:var(--card2);border-radius:8px;padding:12px;text-align:center;min-width:0">
        <div style="font-size:.6rem;color:var(--muted);margin-bottom:4px">Janelas 10 anos (120m)</div>
        <div style="font-size:1.4rem;font-weight:700;color:${wr['120m_pct'] >= 60 ? 'var(--green)' : 'var(--yellow)'}">${wr['120m_pct'] != null ? wr['120m_pct'].toFixed(1) + '%' : '—'}</div>
        <div style="font-size:.65rem;color:var(--muted)">${wr['120m_target_wins'] ?? '—'} de ${wr['120m_janelas_total'] ?? '—'} janelas</div>
      </div>
      <div style="background:var(--card2);border-radius:8px;padding:12px;text-align:center">
        <div style="font-size:.6rem;color:var(--muted);margin-bottom:4px">Janelas 20 anos (240m)</div>
        <div style="font-size:1.4rem;font-weight:700;color:${wr['240m_pct'] >= 70 ? 'var(--green)' : 'var(--yellow)'}">${wr['240m_pct'] != null ? wr['240m_pct'].toFixed(1) + '%' : '—'}</div>
        <div style="font-size:.65rem;color:var(--muted)">${wr['240m_target_wins'] ?? '—'} de ${wr['240m_janelas_total'] ?? '—'} janelas</div>
      </div>
    </div>`;

  // Factor Drought + Drawdown Recovery
  const fd = r7.factor_drought;
  const dr = r7.drawdown_recovery;
  const riskEl = document.getElementById('r7RiskGrid');
  if (riskEl) riskEl.innerHTML = `
    <div style="background:var(--card2);border-radius:8px;padding:12px">
      <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase;margin-bottom:4px">Factor Drought Máximo</div>
      <div style="font-size:1.3rem;font-weight:700;color:var(--yellow)">${fd?.max_meses ?? '—'} meses</div>
      <div style="font-size:.65rem;color:var(--muted);margin-top:4px">Rolling ${fd?.window_meses ?? 36}m · gatilho: 60m</div>
    </div>
    <div style="background:var(--card2);border-radius:8px;padding:12px">
      <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase;margin-bottom:4px">Recovery Pior Caso</div>
      <div style="font-size:1.3rem;font-weight:700;color:${dr?.max_meses <= 84 ? 'var(--green)' : 'var(--red)'}">${dr?.max_meses ?? '—'} meses</div>
      <div style="font-size:.65rem;color:var(--muted);margin-top:4px">P90: ${dr?.p90_meses ?? '—'}m · Bond pool: 84m ✓</div>
    </div>`;

  // CAGR por Década
  const decades = r7.cagr_por_decada;
  const decEl = document.getElementById('r7DecadesTable');
  if (decEl && decades?.length) {
    decEl.innerHTML = `
      <div style="font-size:.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:6px">CAGR por Década</div>
      <table style="width:100%;border-collapse:collapse;font-size:.78rem">
        <thead><tr>
          <th style="text-align:left;padding:5px 8px;border-bottom:2px solid var(--border);color:var(--muted);font-size:.6rem;text-transform:uppercase">Período</th>
          <th style="text-align:right;padding:5px 8px;border-bottom:2px solid var(--border);color:var(--muted);font-size:.6rem;text-transform:uppercase">Target</th>
          <th style="text-align:right;padding:5px 8px;border-bottom:2px solid var(--border);color:var(--muted);font-size:.6rem;text-transform:uppercase">Benchmark</th>
          <th style="text-align:right;padding:5px 8px;border-bottom:2px solid var(--border);color:var(--muted);font-size:.6rem;text-transform:uppercase">Alpha</th>
        </tr></thead>
        <tbody>${decades.map(d => `<tr>
          <td style="padding:5px 8px;border-bottom:1px solid rgba(71,85,105,.2)">${d.Decada}</td>
          <td style="padding:5px 8px;border-bottom:1px solid rgba(71,85,105,.2);text-align:right;font-weight:600">${(d.Target*100).toFixed(1)}%</td>
          <td style="padding:5px 8px;border-bottom:1px solid rgba(71,85,105,.2);text-align:right">${(d.Benchmark*100).toFixed(1)}%</td>
          <td style="padding:5px 8px;border-bottom:1px solid rgba(71,85,105,.2);text-align:right;color:${d.Delta >= 0 ? 'var(--green)' : 'var(--red)'};font-weight:600">${d.Delta >= 0 ? '+' : ''}${(d.Delta*100).toFixed(2)}pp</td>
        </tr>`).join('')}</tbody>
      </table>`;
  }

  // Chart retorno acumulado
  const cr = r7.cumulative_returns;
  if (cr?.dates?.length) {
    const base_t = cr.target[0];
    const base_b = cr.bench[0];
    const tVals = cr.target.map(v => +(v / base_t * 100).toFixed(2));
    const bVals = cr.bench.map(v  => +(v / base_b * 100).toFixed(2));
    const dates = cr.dates.map(d => d.slice(0, 7));
    if (charts.backtestR7) { charts.backtestR7.destroy(); charts.backtestR7 = null; }
    charts.backtestR7 = new Chart(document.getElementById('backtestR7Chart'), {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          { label: 'Target (50/30/20)', data: tVals, borderColor: '#3b82f6', borderWidth: 1.5, pointRadius: 0, fill: false },
          { label: 'Benchmark (ACWI)', data: bVals, borderColor: '#94a3b8', borderWidth: 1, borderDash: [4,2], pointRadius: 0, fill: false },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: { size: 10 }, color: '#94a3b8' } },
          tooltip: { mode: 'index', intersect: false, callbacks: { title: items => items.length ? fmtMonthLabel(items[0].label) : '' } }
        },
        scales: {
          x: { ticks: { maxTicksLimit: 10, font: { size: 9 }, color: '#94a3b8', callback: fmtMonthTick }, grid: { color: 'rgba(71,85,105,.2)' } },
          y: { ticks: { font: { size: 9 }, color: '#94a3b8', callback: v => v + '%' }, grid: { color: 'rgba(71,85,105,.2)' } }
        }
      }
    });
  }

  // Factor regression details
  const fr = r7.factor_regression;
  const frEl = document.getElementById('r7RegressionDetails');
  if (frEl && fr) {
    const chow = fr.chow;
    frEl.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:.75rem">
        <tbody>
          <tr><td style="padding:4px 8px;color:var(--muted)">Alpha anualizado</td><td style="padding:4px 8px;font-weight:600;color:${fr.alpha_ann_pct >= 0 ? 'var(--green)' : 'var(--red)'}">${fr.alpha_ann_pct != null ? (fr.alpha_ann_pct >= 0 ? '+' : '') + fr.alpha_ann_pct.toFixed(2) + '%/ano' : '—'}</td><td style="padding:4px 8px;color:var(--muted)">t-stat: ${fr.alpha_t?.toFixed(2) ?? '—'} · p: ${fr.alpha_p?.toFixed(3) ?? '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:var(--muted)">R²</td><td style="padding:4px 8px;font-weight:600">${fr.r2?.toFixed(3) ?? '—'}</td><td style="padding:4px 8px;color:var(--muted)">${fr.n_meses ?? '—'} meses</td></tr>
          ${chow && !chow.error ? `<tr><td style="padding:4px 8px;color:var(--muted)">Chow test</td><td style="padding:4px 8px;font-weight:600;color:${chow.p > 0.05 ? 'var(--green)' : 'var(--red)'}">${chow.conclusao ?? '—'}</td><td style="padding:4px 8px;color:var(--muted)">F=${chow.F?.toFixed(2)}, p=${chow.p?.toFixed(3)}</td></tr>` : ''}
          ${fr.betas ? Object.entries(fr.betas).map(([k,v]) => `<tr><td style="padding:4px 8px;color:var(--muted)">β ${k}</td><td style="padding:4px 8px">${v.toFixed(3)}</td><td></td></tr>`).join('') : ''}
        </tbody>
      </table>`;
  }
}

// ── S23: Shadow Chart ─────────────────────────────────────────
function buildShadowChart(period) {
  setActivePeriodBtn('shadowPeriodBtns', period);
  document.querySelectorAll('#shadowPeriodBtns button').forEach(b => {
    b.classList.toggle('active', b.getAttribute('onclick') === `buildShadowChart('${period}')`);
  });

  // Usar R5 (19a, 2004+) para períodos históricos longos
  const useR5 = ['all','since2009','since2013'].includes(period) && DATA.backtestR5;
  const allDates  = useR5 ? DATA.backtestR5.dates  : DATA.backtest.dates;
  const allTarget = useR5 ? DATA.backtestR5.target  : DATA.backtest.target;
  const allShadowA = useR5 ? DATA.backtestR5.shadowA : DATA.backtest.shadowA;

  // Seletores de corte por ciclo (mesma lógica do backtest)
  const cycleStarts = { 'since2009':'2009-01','since2013':'2013-01','since2020':'2020-01' };
  let cutIdx = 0;
  if (period === 'all') { cutIdx = 0; }
  else if (cycleStarts[period]) {
    cutIdx = allDates.findIndex(d => d >= cycleStarts[period]);
    if (cutIdx < 0) cutIdx = 0;
  } else {
    const yrs = period === '5y' ? 5 : period === '3y' ? 3 : 0;
    const cutDate = allDates[allDates.length - 1].slice(0,4) - yrs;
    cutIdx = allDates.findIndex(d => +d.slice(0,4) >= cutDate);
    if (cutIdx < 0) cutIdx = 0;
  }

  const dates   = allDates.slice(cutIdx);
  const tBase   = allTarget[cutIdx], sBase = allShadowA[cutIdx];
  const target  = allTarget.slice(cutIdx).map(v => +(v / tBase * 100).toFixed(2));
  const shadowA = allShadowA.slice(cutIdx).map(v => +(v / sBase * 100).toFixed(2));

  // Métricas simples do subperíodo
  const n = target.length;
  const tCagr = (Math.pow(target[n-1]/100, 12/n) - 1) * 100;
  const sCagr = (Math.pow(shadowA[n-1]/100, 12/n) - 1) * 100;
  const tMeta = n > 0 ? `CAGR ${tCagr.toFixed(1)}%` : '—';
  const sMeta = n > 0 ? `CAGR ${sCagr.toFixed(1)}%` : '—';
  const delta = tCagr - sCagr;

  const metricsDiv = document.getElementById('shadowMetrics');
  metricsDiv.innerHTML = [
    `<div style="background:var(--card2);padding:8px;border-radius:6px"><div style="color:var(--muted);font-size:.65rem">Target (50/30/20)</div><strong>${tMeta}</strong></div>`,
    `<div style="background:var(--card2);padding:8px;border-radius:6px"><div style="color:var(--muted);font-size:.65rem">VWRA (benchmark)</div><strong>${sMeta}</strong></div>`,
    `<div style="background:var(--card2);padding:8px;border-radius:6px"><div style="color:var(--muted);font-size:.65rem">Delta Target vs VWRA</div><strong style="color:${delta>=0?'#22c55e':'#ef4444'}">${delta>=0?'+':''}${delta.toFixed(2)}pp/a</strong></div>`,
  ].join('');

  if (charts.shadow) { charts.shadow.destroy(); charts.shadow = null; }
  charts.shadow = new Chart(document.getElementById('shadowChart'), {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        { label: 'Target (50/30/20)', data: target, borderColor: '#3b82f6', borderWidth: 2, pointRadius: 0, fill: false, tension: 0.2 },
        { label: 'VWRA (benchmark)', data: shadowA, borderColor: '#94a3b8', borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.2, borderDash: [4,2] },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font:{size:10} } },
        tooltip: { callbacks: { title: items => items.length ? fmtMonthLabel(items[0].label) : '', label: ctx => { if (ctx.parsed.y == null || isNaN(ctx.parsed.y)) return null; return ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} (base 100)`; } } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8', maxTicksLimit: 8, autoSkip: true, callback: fmtMonthTick }, grid: { color: 'rgba(71,85,105,.3)' } },
        y: { ticks: { color: '#94a3b8', callback: v => v.toFixed(0) }, grid: { color: 'rgba(71,85,105,.3)' } }
      }
    }
  });
}

