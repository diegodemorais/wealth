// ═══════════════════════════════════════════════════════════════
// WELLNESS SCORE v2.0 — pesos/thresholds de DATA.wellness_config
// Fonte: agentes/referencia/wellness_config.json
// ═══════════════════════════════════════════════════════════════
export function calcWellness() {
  const cfg = DATA.wellness_config || {};
  const scores = [];
  let total = 0;

  function add(label, value, max, color, detail) {
    scores.push({ label, value, max, color, detail });
    total += value;
  }
  function col(pts, good, warn) {
    return pts >= good ? '#22c55e' : pts >= warn ? '#eab308' : '#ef4444';
  }

  // ── P(FIRE) base (35pts) ──────────────────────────────────────
  const pfM = (cfg.metrics || []).find(m => m.id === 'pfire') || {};
  const pfMax = pfM.max ?? 35;
  const pfGood = pfM.colors?.good ?? 28;
  const pfWarn = pfM.colors?.warn ?? 10;
  const pf = DATA.pfire_base.base;
  // interpolação linear por threshold step
  const pfThr = pfM.thresholds || [{min:95,pts:35},{min:90,pts:28},{min:85,pts:22},{min:75,pts:10},{min:0,pts:0}];
  let pfPts = 0;
  for (let i = 0; i < pfThr.length - 1; i++) {
    if (pf >= pfThr[i].min) {
      const lo = pfThr[i+1], hi = pfThr[i];
      pfPts = lo.pts + (pf - lo.min) / (hi.min - lo.min) * (hi.pts - lo.pts);
      break;
    }
  }
  pfPts = Math.min(pfMax, pfPts);
  add('P(FIRE) base', Math.round(pfPts), pfMax, col(pfPts, pfGood, pfWarn), `${pf}%`);

  // ── Savings rate (15pts) ──────────────────────────────────────
  const srM = (cfg.metrics || []).find(m => m.id === 'savings_rate') || {};
  const srMax = srM.max ?? 15;
  // SR = aporte / renda_estimada — definição padrão FIRE (renda_estimada = R$45k/mês de config.py)
  const _aporteSR = DATA.premissas.aporte_mensal;
  const _rendaEstimadaSR = DATA.premissas.renda_estimada ?? 45000;
  const sr = _aporteSR / _rendaEstimadaSR;
  const srPct = sr * 100; // ex: 54.6%
  const srThr = srM.thresholds || [{min_pct:50,pts:15},{min_pct:40,pts:10},{min_pct:25,pts:5},{min_pct:0,pts:0}];
  let srPts = 0;
  for (const t of srThr) { if (srPct >= t.min_pct) { srPts = t.pts; break; } }
  add('Savings rate', srPts, srMax, col(srPts, srM.colors?.good??15, srM.colors?.warn??5), `~${srPct.toFixed(1)}%`);

  // ── Drift máximo (15pts) ──────────────────────────────────────
  const drM = (cfg.metrics || []).find(m => m.id === 'drift') || {};
  const drMax = drM.max ?? 15;
  const maxDrift = Math.max(...Object.values(DATA.drift).map(d => Math.abs(d.atual - d.alvo)));
  const drThr = drM.thresholds || [{max_pp:5,pts:15},{max_pp:10,pts:10},{max_pp:15,pts:5},{max_pp:999,pts:0}];
  let driftPts = 0;
  for (const t of drThr) { if (maxDrift <= t.max_pp) { driftPts = t.pts; break; } }
  add('Drift máximo', driftPts, drMax, col(driftPts, drM.colors?.good??15, drM.colors?.warn??10), `${maxDrift.toFixed(1)}pp`);

  // ── IPCA+ gap vs alvo (10pts, DCA-aware) ─────────────────────
  const ipM = (cfg.metrics || []).find(m => m.id === 'ipca_gap') || {};
  const ipMax = ipM.max ?? 10;
  const ipcaGap = Math.abs(DATA.drift.IPCA.alvo - DATA.drift.IPCA.atual);
  const _taxaIpca = DATA.rf?.ipca2040?.taxa;
  const _pisoIpca = DATA.pisos?.pisoTaxaIpcaLongo ?? 6.0;
  const _dcaAtivo = _taxaIpca != null && _taxaIpca >= _pisoIpca && ipcaGap > 0;
  let ipcaPts;
  if (ipcaGap <= 2) ipcaPts = ipMax;
  else if (ipcaGap <= 5) ipcaPts = 7;
  else if (_dcaAtivo) ipcaPts = 5;
  else if (ipcaGap <= 10) ipcaPts = 3;
  else ipcaPts = 0;
  const _ipcaLabel = (_dcaAtivo && ipcaGap > 5) ? `−${ipcaGap.toFixed(1)}pp (DCA ✓)` : `−${ipcaGap.toFixed(1)}pp`;
  add('IPCA+ gap vs alvo', ipcaPts, ipMax, col(ipcaPts, ipM.colors?.good??7, ipM.colors?.warn??3), _ipcaLabel);

  // ── Fidelidade de execução (10pts) ───────────────────────────
  const exM = (cfg.metrics || []).find(m => m.id === 'execution_fidelity') || {};
  const exMax = exM.max ?? 10;
  // Fonte: minilog / aportes. Conta meses recentes com aporte >= 80% do target.
  const targetAporte = DATA.premissas.aporte_mensal;
  const minilog = DATA.minilog || [];
  const depositos = minilog.filter(op => op.tipo === 'Depósito' || op.tipo === 'Aporte');
  // Agrupa por mês (YYYY-MM) e soma valores
  const porMes = {};
  depositos.forEach(op => {
    const mes = (op.data || '').slice(0, 7);
    if (!mes) return;
    const val = parseFloat((op.valor || '0').replace(/[^0-9.]/g, '')) || 0;
    porMes[mes] = (porMes[mes] || 0) + val;
  });
  const mesesRecentes = Object.keys(porMes).sort().slice(-6);
  const mesesOk = mesesRecentes.filter(m => porMes[m] >= targetAporte * 0.8).length;
  // Se dados insuficientes (<3 meses), neutro (7pts)
  const exThr = exM.thresholds || [{min_months:6,pts:10},{min_months:5,pts:7},{min_months:4,pts:4},{min_months:0,pts:0}];
  let execPts = mesesRecentes.length < 3 ? 7 : 0;
  if (mesesRecentes.length >= 3) {
    for (const t of exThr) { if (mesesOk >= t.min_months) { execPts = t.pts; break; } }
  }
  const exLabel = mesesRecentes.length < 3 ? 'dados insuf.' : `${mesesOk}/${Math.min(6, mesesRecentes.length)} meses`;
  add('Execução aportes', execPts, exMax, col(execPts, exM.colors?.good??7, exM.colors?.warn??4), exLabel);

  // ── Fundo de emergência (5pts) ───────────────────────────────
  const emM = (cfg.metrics || []).find(m => m.id === 'emergency_fund') || {};
  const emMax = emM.max ?? 5;
  // custo_vida_mensal: config → fallback → premissas (fonte de verdade)
  const custoMensal = emM.custo_vida_mensal ?? Math.round(DATA.premissas.custo_vida_base / 12);
  // Reserva = IPCA+ 2029 (líquido de curto prazo)
  const reserva = DATA.rf?.ipca2029?.valor ?? 0;
  const mesesReserva = reserva / custoMensal;
  const emThr = emM.thresholds || [{min_months:6,pts:5},{min_months:3,pts:3},{min_months:0,pts:0}];
  let emPts = 0;
  for (const t of emThr) { if (mesesReserva >= t.min_months) { emPts = t.pts; break; } }
  add('Fundo emergência', emPts, emMax, col(emPts, emM.colors?.good??5, emM.colors?.warn??3), `${mesesReserva.toFixed(1)} meses`);

  // ── TER vs VWRA (5pts) ────────────────────────────────────────
  const terM = (cfg.metrics || []).find(m => m.id === 'ter') || {};
  const terMax = terM.max ?? 5;
  const benchTer = terM.benchmark_ter ?? 0.220;
  const currTer  = terM.current_ter  ?? 0.247;
  const terDelta = currTer - benchTer;
  const terThr = terM.thresholds || [{max_delta_pp:0,pts:5},{max_delta_pp:0.1,pts:3},{max_delta_pp:999,pts:0}];
  let terPts = 0;
  for (const t of terThr) { if (terDelta <= t.max_delta_pp) { terPts = t.pts; break; } }
  add('TER vs VWRA', terPts, terMax, col(terPts, terM.colors?.good??5, terM.colors?.warn??3), `+${(terDelta*100).toFixed(2)}bp`);

  // ── Proteção capital humano (5pts) ───────────────────────────
  const hcM = (cfg.metrics || []).find(m => m.id === 'human_capital') || {};
  const hcMax = hcM.max ?? 5;
  const hcStatus = hcM.status ?? 'solteiro_sem_dependentes';
  const hcThr = hcM.thresholds || [{status:'solteiro_sem_dependentes',pts:5}];
  const hcEntry = hcThr.find(t => t.status === hcStatus);
  const hcPts = hcEntry ? hcEntry.pts : 0;
  const hcLabel = hcStatus === 'solteiro_sem_dependentes' ? 'solteiro (ok)' :
                  hcStatus.includes('com_seguro') ? 'seguro ativo' : '⚠️ sem seguro';
  add('Proteção capital humano', hcPts, hcMax, col(hcPts, hcM.colors?.good??5, 1), hcLabel);

  return { total, scores };
}

export function wellnessActions(scores) {
  const actions = {
    'P(FIRE) base':             'Aumentar aporte mensal ou aguardar crescimento patrimonial',
    'Savings rate':             'Aumentar aporte mensal relativo à renda estimada',
    'Drift máximo':             'Rebalancear bucket mais distante do alvo no próximo aporte',
    'IPCA+ gap vs alvo':        'Continuar DCA em IPCA+ até atingir alvo de alocação',
    'Execução aportes':         'Verificar consistência dos aportes mensais — meses com gap',
    'Fundo emergência':         'Aumentar reserva em IPCA+ 2029 até 6 meses de custo de vida',
    'TER vs VWRA':              'Manter disciplina — custo de complexidade dentro da tolerância',
    'Proteção capital humano':  'Contratar seguro de vida/DI adequado ao casar',
  };
  return scores
    .map(s => ({ ...s, gap: s.max - s.value }))
    .filter(s => s.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3)
    .map(s => ({ label: s.label, gap: s.gap, action: actions[s.label] || 'Rever métrica' }));
}

// ═══════════════════════════════════════════════════════════════
// RENDER HELPERS
// ═══════════════════════════════════════════════════════════════
export function fmtBrl(v) { return 'R$ ' + (v/1000).toFixed(0) + 'k'; }
export function fmtBrl2(v) { return 'R$ ' + v.toLocaleString('pt-BR'); }
export function fmtUsd(v) { return '$ ' + (v/1000).toFixed(0) + 'k'; }
export function fmtPct(v, dec=1) { return v.toFixed(dec) + '%'; }
export function colorPct(v) { return v >= 0 ? '#22c55e' : '#ef4444'; }

// ═══════════════════════════════════════════════════════════════
// PERIOD SELECTOR HELPER
// ═══════════════════════════════════════════════════════════════
export function filterByPeriod(allLabels, allValues, period) {
  const now = new Date(DATA.date);
  let cutoff;
  if (period === 'all') return { labels: allLabels, values: allValues };
  if (period === '3m') cutoff = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  else if (period === '6m') cutoff = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  else if (period === 'ytd') cutoff = new Date(now.getFullYear(), 0, 1);
  else if (period === '1y') cutoff = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  else if (period === '3y') cutoff = new Date(now.getFullYear() - 3, now.getMonth(), 1);
  else if (period === '5y') cutoff = new Date(now.getFullYear() - 5, now.getMonth(), 1);
  const fLabels = [], fValues = [];
  allLabels.forEach((l, i) => {
    const d = new Date(l + '-01');
    if (d >= cutoff) { fLabels.push(l); fValues.push(allValues[i]); }
  });
  return { labels: fLabels, values: fValues };
}

// Helper: show inline "too few points" message and return true if chart should be skipped
export function checkMinPoints(canvasId, count, min) {
  const parent = document.getElementById(canvasId).parentElement;
  // Remove previous warning if any
  const prev = parent.querySelector('.too-few-warning');
  if (prev) prev.remove();
  if (count < min) {
    const warn = document.createElement('div');
    warn.className = 'too-few-warning';
    warn.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#94a3b8;font-size:.75rem;text-align:center;';
    warn.textContent = 'Poucos dados para este período — selecione um período maior';
    parent.appendChild(warn);
    return true;
  }
  return false;
}

export function setActivePeriodBtn(containerID, period) {
  document.querySelectorAll('#' + containerID + ' button').forEach(b => {
    b.classList.toggle('active', b.textContent.toLowerCase() === period);
  });
}

// ═══════════════════════════════════════════════════════════════
// CHART INSTANCES
// ═══════════════════════════════════════════════════════════════
export const charts = {};

// Formata label YYYY-MM → mmm/YY (ex: "2021-05" → "mai/21")
export const _MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
export function fmtMonthLabel(raw) {
  if (!raw || typeof raw !== 'string') return raw;
  const [y, m] = raw.split('-');
  return `${_MESES[(+m||1)-1]}/${y.slice(2)}`;
}
export function fmtMonthTick(val, _idx) {
  return fmtMonthLabel(this.getLabelForValue(val));
}

