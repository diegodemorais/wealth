// ═══════════════════════════════════════════════════════════════
// F3: EARLIEST FIRE DATE
// ═══════════════════════════════════════════════════════════════
function buildEarliestFire() {
  const el = document.getElementById('earliestFireCard');
  if (!el) return;
  const ef = DATA.earliest_fire;
  if (!ef) { el.innerHTML = '<span style="color:var(--muted)">Dados não disponíveis</span>'; return; }
  const statusColors = { aspiracional: 'var(--purple)', base: 'var(--accent)', abaixo_threshold: 'var(--red)' };
  const statusLabels = { aspiracional: 'FIRE Aspiracional', base: 'FIRE Base', abaixo_threshold: 'Abaixo do threshold 85%' };
  const color = statusColors[ef.status] || 'var(--accent)';
  const label = statusLabels[ef.status] || ef.status;
  const pfireColor = ef.pfire >= 90 ? 'var(--green)' : ef.pfire >= 85 ? 'var(--accent)' : 'var(--yellow)';
  const yearsLeft = ef.ano - (DATA.premissas.ano_atual || new Date().getFullYear());
  el.innerHTML = `
    <div class="earliest-fire-card">
      <div style="font-size:.65rem;color:${color};text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">${label}</div>
      <div style="font-size:2.8rem;font-weight:800;line-height:1;color:${color}" class="pv">${ef.ano}</div>
      <div style="font-size:1.1rem;font-weight:600;margin:4px 0" class="pv">idade ${ef.idade}</div>
      <div style="font-size:1.5rem;font-weight:700;color:${pfireColor};margin:6px 0" class="pv">P = ${ef.pfire}%</div>
      <div style="font-size:.75rem;color:var(--muted)">${yearsLeft} anos a partir de hoje</div>
    </div>
    <div class="dynamic-2col" style="margin-top:10px;font-size:.75rem;display:grid;grid-template-columns:1fr 1fr;gap:8px" class="responsive-grid">
      <div style="background:var(--card2);border-radius:6px;padding:8px;text-align:center">
        <div style="font-size:1rem;font-weight:700;color:var(--purple)" class="pv">${DATA.pfire_aspiracional.base}%</div>
        <div style="font-size:.65rem;color:var(--muted)">Cenário Aspiracional</div>
      </div>
      <div style="background:var(--card2);border-radius:6px;padding:8px;text-align:center">
        <div style="font-size:1rem;font-weight:700;color:var(--accent)" class="pv">${DATA.pfire_base.base}%</div>
        <div style="font-size:.65rem;color:var(--muted)">Cenário Base</div>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════
// F3b: SIMULADOR FIRE INTERATIVO (BOLDIN-style)
// ═══════════════════════════════════════════════════════════════
// ── Estado dos dois eixos de preset ────────────────────────────────────────
window._fireCond = 'solteiro';
window._fireMkt  = 'base';

// Condição de vida → aporte mensal + custo anual
// null = usa DATA.premissas (valores base aprovados)
const _FIRE_COND = {
  solteiro:  { aporte: null,  custo: null   },  // premissas base
  casamento: { aporte: 20000, custo: 270000 },  // carteira.md: custo R$270k, aporte −R$5k
  filho:     { aporte: 15000, custo: 300000 },  // MC Bloco A aprovado: R$300k, aporte −R$10k
};

// Cenário de mercado → retorno real equity
// null = usa DATA.premissas.retorno_equity_base
const _FIRE_MKT = {
  stress: 4.35,  // depreciação 0%, ponderado 50/30/20
  base:   null,  // 4.85% das premissas
  fav:    5.85,  // depreciação 1.5%, ponderado 50/30/20
};

function _applyFireAxes() {
  const p   = DATA.premissas;
  const cv  = _FIRE_COND[window._fireCond] || {};
  const aporte  = cv.aporte  ?? (p?.aporte_mensal        || 25000);
  const custo   = cv.custo   ?? (p?.custo_vida_base       || 250000);
  const retorno = _FIRE_MKT[window._fireMkt] ?? ((p?.retorno_equity_base || 0.0485) * 100);

  const sA = document.getElementById('simAporte');
  const sR = document.getElementById('simRetorno');
  const sC = document.getElementById('simCusto');
  if (sA) sA.value = Math.min(100000, Math.max(5000,   aporte));
  if (sR) sR.value = Math.min(10,     Math.max(0,      retorno));
  if (sC) sC.value = Math.min(500000, Math.max(150000, custo));
  updateFireSim();
}

window.setFireCond = function(cond) {
  // Se "Cenário Aspiracional" estava ativo, volta ao default
  if (window._aspiracionalMode) {
    window._aspiracionalMode = false;
    window._fireCond = 'solteiro';
    window._fireMkt = 'base';
    document.querySelectorAll('[id^="pcond-"],[id^="pmkt-"]').forEach(b => b.classList.remove('active', 'disabled'));
    document.getElementById('pcond-solteiro')?.classList.add('active');
    document.getElementById('pmkt-base')?.classList.add('active');
  } else {
    window._fireCond = cond;
    document.querySelectorAll('[id^="pcond-"]').forEach(b => b.classList.remove('active'));
    document.getElementById('pcond-' + cond)?.classList.add('active');
  }
  _applyFireAxes();
};

window.setFireMkt = function(mkt) {
  // Se "Cenário Aspiracional" estava ativo, volta ao default
  if (window._aspiracionalMode) {
    window._aspiracionalMode = false;
    window._fireCond = 'solteiro';
    window._fireMkt = 'base';
    document.querySelectorAll('[id^="pcond-"],[id^="pmkt-"]').forEach(b => b.classList.remove('active', 'disabled'));
    document.getElementById('pcond-solteiro')?.classList.add('active');
    document.getElementById('pmkt-base')?.classList.add('active');
  } else {
    window._fireMkt = mkt;
    document.querySelectorAll('[id^="pmkt-"]').forEach(b => b.classList.remove('active'));
    document.getElementById('pmkt-' + mkt)?.classList.add('active');
  }
  _applyFireAxes();
};

// Cenário Aspiracional — preset atômico (mesmo aporte base, retorno favorável, custo go-go)
// Marca modo aspiracional; botões Mercado/Condição ficam visualmente desabilitados mas clicáveis
window.setFirePresetAspiracional = function() {
  window._aspiracionalMode = true;
  document.querySelectorAll('[id^="pcond-"],[id^="pmkt-"]').forEach(b => {
    b.classList.remove('active');
    if (b.id !== 'pcond-aspiracional') b.classList.add('disabled');  // visual apenas (CSS opacity/pointer-events)
  });
  document.getElementById('pcond-aspiracional')?.classList.add('active');
  const p    = DATA.premissas;
  const goGo = DATA.spendingSmile?.go_go?.gasto ?? 242000;
  const sA   = document.getElementById('simAporte');
  const sR   = document.getElementById('simRetorno');
  const sC   = document.getElementById('simCusto');
  if (sA) sA.value = Math.min(100000, Math.max(5000, p?.aporte_mensal || 25000)); // mesmo aporte base
  if (sR) sR.value = 5.85;   // retorno favorável (cenário _MKT_VALS.fav)
  if (sC) sC.value = Math.min(500000, Math.max(150000, goGo));                    // custo go-go
  updateFireSim();
};

// Slider manual → desativa modo aspiracional e reabilita visual de todos controles
window._firePresetCustom = function() {
  window._aspiracionalMode = false;
  document.querySelectorAll('[id^="pcond-"],[id^="pmkt-"]').forEach(b => {
    b.classList.remove('active', 'disabled');
  });
};

window.updateFireSim = function() {
  const simA = document.getElementById('simAporte');
  const simR = document.getElementById('simRetorno');
  const simC = document.getElementById('simCusto');
  if (!simA || !simR || !simC) return;

  // Inicializar com valores de DATA na primeira chamada
  if (+simA.value === 25000 && DATA.premissas?.aporte_mensal) simA.value = DATA.premissas.aporte_mensal;
  if (+simR.value === 4.85  && DATA.premissas?.retorno_equity_base) simR.value = (DATA.premissas.retorno_equity_base * 100).toFixed(2);
  if (+simC.value === 250000 && DATA.premissas?.custo_vida_base) simC.value = DATA.premissas.custo_vida_base;

  const ap    = +simA.value;
  const r     = +simR.value / 100;
  const custo = +simC.value;

  document.getElementById('simAporteVal').textContent = `R$${(ap/1000).toFixed(0)}k/mês`;
  document.getElementById('simRetornoVal').textContent = (r*100).toFixed(2) + '%/ano real';
  document.getElementById('simCustoVal').textContent   = `R$${(custo/1000).toFixed(0)}k/ano`;

  const rm = r / 12;
  const idadeAtual = DATA.premissas.idade_atual;
  const patAtual   = DATA.premissas.patrimonio_atual;
  const swrMeta    = DATA.premissas.swr_gatilho ?? 0.030;
  const maxMonths  = (70 - idadeAtual) * 12;
  const horizonte  = 37; // anos de desacumulação (Cenário Base → ~90 anos)

  // Floors de renda que reduzem o que o portfólio precisa cobrir
  // INSS Diego: R$18k/ano × 60% (haircut reforma) = R$10.8k efetivo, a partir dos 65
  // Katia (casado/familia): INSS R$84.6k + PGBL R$29.2k = R$113.8k/ano, a partir dos 62 de Diego
  const cond = window._fireCond || 'solteiro';
  const floorINSS  = 10800;   // R$/ano Diego (haircut 40%)
  const floorKatia = 113800;  // R$/ano Katia (apenas casado/família)
  const idadeINSS  = 65;
  const idadeKatia = 62;      // ano 2049: Katia INSS+PGBL

  // custoEfetivo = custo ponderado pelo tempo em que cada floor está ativo
  // Calculado dinamicamente no loop conforme idade projetada do FIRE
  function _custoEfetivo(fireAge) {
    const anosAteINSS  = Math.max(0, idadeINSS  - fireAge);
    const anosAteKatia = Math.max(0, idadeKatia - fireAge);
    const redINSS  = floorINSS  * Math.max(0, horizonte - anosAteINSS)  / horizonte;
    const redKatia = (cond !== 'solteiro') ? floorKatia * Math.max(0, horizonte - anosAteKatia) / horizonte : 0;
    return custo - redINSS - redKatia;
  }

  // Iterar mensalmente até custo_efetivo / pat ≤ swrMeta
  let pat = patAtual;
  let m   = 0;
  while (m < maxMonths) {
    pat = pat * (1 + rm) + ap;
    m++;
    const fa = idadeAtual + m / 12;
    if (_custoEfetivo(fa) / pat <= swrMeta) break;
  }

  const fireAge  = idadeAtual + m / 12;
  const fireAno  = Math.round(new Date().getFullYear() + m / 12);
  const yrInt    = Math.floor(fireAge - idadeAtual);
  const moInt    = Math.round((fireAge - idadeAtual - yrInt) * 12);
  const reached  = m < maxMonths;
  const idadeFire53 = DATA.premissas.idade_cenario_base;
  const idadeFire50 = DATA.premissas.idade_cenario_aspiracional;
  const diffVs53 = idadeFire53 - fireAge;
  const custoEf  = _custoEfetivo(fireAge); // custo efetivo do portfólio no FIRE Day

  // Cor semáforo
  const cor = !reached ? '#ef4444' : diffVs53 > 1 ? '#22c55e' : diffVs53 > -0.5 ? '#3b82f6' : '#eab308';
  const zone = !reached ? 'Crítico' : diffVs53 > 2 ? 'Excelente — antes do plano' : diffVs53 > 0 ? 'Bom — antes de Cenário Base' : diffVs53 > -2 ? 'Regular — próximo ao plano' : 'Crítico — depois do plano';

  const _ano = document.getElementById('simFireAno');
  const _idade = document.getElementById('simFireIdade');
  const _pfire = document.getElementById('simFirePfire');
  const _diff  = document.getElementById('simFireDiff');
  if (_ano)   { _ano.textContent = reached ? fireAno : '>2061'; _ano.style.color = cor; }
  if (_idade) { _idade.textContent = reached ? `${Math.floor(fireAge)} anos` : '> 70 anos'; _idade.style.color = cor; }
  if (_pfire) {
    if (reached) {
      const swrBruta  = custo / pat * 100;
      const swrLiquid = custoEf / pat * 100;
      const ok = swrLiquid <= swrMeta * 100;
      const floorLabel = cond !== 'solteiro' ? 'INSS+Katia' : 'INSS';
      _pfire.textContent = `${ok ? '✅' : '⚠️'} SWR bruta ${swrBruta.toFixed(2)}% · líquida c/${floorLabel} ${swrLiquid.toFixed(2)}%`;
    } else {
      _pfire.textContent = '⚠️ Gatilho não atingido';
    }
    _pfire.style.color = cor;
  }
  if (_diff) {
    const diffStr = Math.abs(diffVs53) < 0.25 ? 'no prazo exato'
      : diffVs53 > 0 ? `${Math.floor(Math.abs(diffVs53))}a ${Math.round((Math.abs(diffVs53) % 1) * 12)}m mais cedo`
      : `${Math.floor(Math.abs(diffVs53))}a ${Math.round((Math.abs(diffVs53) % 1) * 12)}m mais tarde`;
    _diff.textContent = reached ? `${zone} · ${diffStr} vs FIRE@${idadeFire53}` : 'Aumentar aporte ou reduzir custo';
    _diff.style.color = cor;
  }

  // Cards fixos MC
  const _p50 = document.getElementById('simPfire50');
  const _p53 = document.getElementById('simPfire53');
  if (_p50) { _p50.textContent = `${DATA.pfire_aspiracional.base}%`; _p50.style.color = DATA.pfire_aspiracional.base >= 85 ? '#22c55e' : '#eab308'; }
  if (_p53) { _p53.textContent = `${DATA.pfire_base.base}%`; _p53.style.color = DATA.pfire_base.base >= 90 ? '#22c55e' : '#3b82f6'; }
  const _pat = document.getElementById('simPatFire');
  const patMeta = custo / swrMeta;
  if (_pat) { _pat.textContent = `R$${(pat/1e6).toFixed(2)}M`; _pat.style.color = pat >= patMeta ? '#22c55e' : '#eab308'; }

  // Timeline bar (idadeAtual..70 → hoje..projeção)
  const totalYears = 70 - idadeAtual;
  const pctFire = reached ? Math.min(99, (fireAge - idadeAtual) / totalYears * 100) : 100;
  const pin = document.getElementById('simTimelinePin');
  const bar = document.getElementById('simTimelineBar');
  const lbl = document.getElementById('simTimelineLabelFire');
  if (pin)  pin.style.left  = pctFire + '%';
  if (bar)  bar.style.width = pctFire + '%';
  if (lbl)  { lbl.textContent = reached ? `${fireAno} (${Math.floor(fireAge)}a)` : 'Não atingido'; lbl.style.left = pctFire + '%'; lbl.style.color = cor; }
  const _lblL = document.getElementById('simTimelineLabelL');
  if (_lblL) _lblL.textContent = `Hoje (${idadeAtual}a)`;
};

// ═══════════════════════════════════════════════════════════════
// F2: SPENDING GUARDRAILS
// ═══════════════════════════════════════════════════════════════
function buildSpendingGuardrails() {
  const el = document.getElementById('spendingGuardrailsViz');
  if (!el) return;
  const sg = DATA.spending_guardrails;
  if (!sg) { el.innerHTML = '<span style="color:var(--muted)">Dados não disponíveis</span>'; return; }
  if (document.body.classList.contains('private-mode')) {
    const zc = sg.zona === 'verde' ? 'var(--green)' : sg.zona === 'amarelo' ? 'var(--yellow)' : 'var(--red)';
    const zl = sg.zona === 'verde' ? '🟢 No caminho certo' : sg.zona === 'amarelo' ? '🟡 Atenção' : '🔴 Alerta';
    el.innerHTML = `<div style="display:flex;align-items:center;gap:12px"><div style="font-size:2rem;font-weight:800;color:${zc}">${sg.pfire_atual}%</div><div style="font-size:.85rem;font-weight:600;color:${zc}">${zl}</div></div><div style="text-align:center;padding:16px;color:var(--muted);font-size:.75rem;margin-top:8px">🔒 Valores ocultos em modo privado</div>`;
    return;
  }

  const zoneColor = sg.zona === 'verde' ? 'var(--green)' : sg.zona === 'amarelo' ? 'var(--yellow)' : 'var(--red)';
  const zoneLabel = sg.zona === 'verde' ? '🟢 No caminho certo' : sg.zona === 'amarelo' ? '🟡 Atenção' : '🔴 Alerta';

  // Escala visual: de 150k (lower bound visual) a 400k (upper bound visual)
  const minScale = 150000, maxScale = 400000;
  const scale = v => Math.max(0, Math.min(100, (v - minScale) / (maxScale - minScale) * 100));

  const upper = sg.upper_guardrail_spending;
  const atual = sg.spending_atual;
  const safe  = sg.safe_target_spending;
  const lower = sg.lower_guardrail_spending;

  // Posições na barra [0–100%]
  const posUpper = scale(upper);
  const posAtual = scale(atual);
  const posSafe  = scale(safe);
  const posLower = scale(lower);

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <div style="font-size:2rem;font-weight:800;color:${zoneColor}">${sg.pfire_atual}%</div>
      <div>
        <div style="font-size:.85rem;font-weight:600;color:${zoneColor}">${zoneLabel}</div>
        <div style="font-size:.7rem;color:var(--muted)">P(FIRE) atual · spending R$${(sg.spending_atual/1000).toFixed(0)}k/ano</div>
      </div>
    </div>
    <div style="position:relative;margin-bottom:36px">
      <!-- barra com zonas coloridas (overflow:hidden apenas aqui, para arredondar as zonas) -->
      <div style="position:relative;height:36px;border-radius:8px;overflow:hidden">
        <div style="position:absolute;left:0;width:${posUpper}%;height:100%;background:rgba(59,130,246,.15)"></div>
        <div style="position:absolute;left:${posUpper}%;width:${Math.max(2, posAtual-posUpper)}%;height:100%;background:rgba(34,197,94,.2)"></div>
        <div style="position:absolute;left:${posAtual}%;width:${posSafe-posAtual}%;height:100%;background:rgba(234,179,8,.15)"></div>
        <div style="position:absolute;left:${posSafe}%;width:${posLower-posSafe}%;height:100%;background:rgba(249,115,22,.15)"></div>
        <div style="position:absolute;left:${posLower}%;width:${100-posLower}%;height:100%;background:rgba(239,68,68,.2)"></div>
      </div>
      <!-- marcadores verticais e labels fora do overflow:hidden -->
      <div style="position:absolute;left:${posUpper}%;top:0;width:2px;height:36px;background:#3b82f6;z-index:2">
        <div style="position:absolute;top:40px;left:50%;transform:translateX(-50%);font-size:.55rem;color:#3b82f6;white-space:nowrap">~R$${(upper/1000).toFixed(0)}k (~95%)</div>
      </div>
      <div style="position:absolute;left:${posAtual}%;top:0;z-index:4;transform:translateX(-50%)">
        <div style="width:10px;height:10px;border-radius:50%;background:var(--green);
                    border:2px solid #0f172a;margin-top:13px;"></div>
        <div style="position:absolute;top:6px;left:calc(100% + 6px);
                    white-space:nowrap;font-size:.6rem;font-weight:700;color:var(--green);
                    line-height:1.2">
          R$${(atual/1000).toFixed(0)}k<br>${sg.pfire_atual}%
        </div>
      </div>
      <div style="position:absolute;left:${posSafe}%;top:0;width:2px;height:36px;background:var(--yellow);z-index:2">
        <div style="position:absolute;top:40px;left:50%;transform:translateX(-50%);font-size:.55rem;color:var(--yellow);white-space:nowrap">~R$${(safe/1000).toFixed(0)}k (~80%)</div>
      </div>
      <div style="position:absolute;left:${posLower}%;top:0;width:2px;height:36px;background:var(--red);z-index:2">
        <div style="position:absolute;top:40px;left:50%;transform:translateX(-50%);font-size:.55rem;color:var(--red);white-space:nowrap">~R$${(lower/1000).toFixed(0)}k (~70%)</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(80px, 1fr));gap:6px;margin-top:4px">
      <div style="background:rgba(59,130,246,.1);border-radius:6px;padding:6px;text-align:center">
        <div style="font-size:.7rem;font-weight:700;color:var(--accent)">~R$${(upper/1000).toFixed(0)}k</div>
        <div style="font-size:.55rem;color:var(--muted)">Conservador (P95)</div>
      </div>
      <div style="background:rgba(34,197,94,.1);border-radius:6px;padding:6px;text-align:center;border:1px solid rgba(34,197,94,.3)">
        <div style="font-size:.7rem;font-weight:700;color:var(--green)">R$${(atual/1000).toFixed(0)}k</div>
        <div style="font-size:.55rem;color:var(--muted)">Atual (${sg.pfire_atual}%)</div>
      </div>
      <div style="background:rgba(234,179,8,.1);border-radius:6px;padding:6px;text-align:center">
        <div style="font-size:.7rem;font-weight:700;color:var(--yellow)">~R$${(safe/1000).toFixed(0)}k</div>
        <div style="font-size:.55rem;color:var(--muted)">Sustentável (P80)</div>
      </div>
      <div style="background:rgba(239,68,68,.1);border-radius:6px;padding:6px;text-align:center">
        <div style="font-size:.7rem;font-weight:700;color:var(--red)">~R$${(lower/1000).toFixed(0)}k</div>
        <div style="font-size:.55rem;color:var(--muted)">Limite (P70)</div>
      </div>
    </div>
    <div style="font-size:.6rem;color:var(--muted);margin-top:8px">${sg.nota}</div>`;
}

// ═══════════════════════════════════════════════════════════════
// F4: SCENARIO COMPARISON TABLE
// ═══════════════════════════════════════════════════════════════
function buildScenarioComparison() {
  const el = document.getElementById('scenarioCompareBody');
  if (!el) return;
  const sc = DATA.scenario_comparison;
  if (!sc) { el.innerHTML = '<span style="color:var(--muted)">Dados não disponíveis</span>'; return; }

  const fmtPfire = v => v != null ? `<span class="pv" style="color:${v>=90?'var(--green)':v>=85?'var(--accent)':'var(--yellow)'};font-weight:700">${v}%</span>` : '<span style="color:var(--muted)">—</span>';
  const fmtPat = v => v != null ? `<span class="pv">R$${(v/1e6).toFixed(2)}M</span>` : '<span style="color:var(--muted)">n/d</span>';
  const fmtIdade = v => v != null ? `<span class="pv">${v} anos</span>` : '<span style="color:var(--muted)">—</span>';
  const fmtGasto = v => v != null ? `<span class="pv">R$${(v/1000).toFixed(0)}k</span>` : '<span style="color:var(--muted)">—</span>';
  const fmtSwr = v => v != null ? `<span class="pv" style="color:${v<=4?'var(--green)':v<=5?'var(--accent)':'var(--yellow)'};">${v.toFixed(2)}%</span>` : '<span style="color:var(--muted)">—</span>';

  const base = sc.base || {};
  const aspir = sc.aspiracional || {};

  const rows = [
    ['P(FIRE) Base',     fmtPfire(base.base),   fmtPfire(aspir.base)],
    ['P(FIRE) Favorável', fmtPfire(base.fav),   fmtPfire(aspir.fav)],
    ['P(FIRE) Stress',   fmtPfire(base.stress), fmtPfire(aspir.stress)],
    ['Patrimônio Mediano', fmtPat(base.pat_mediano), fmtPat(aspir.pat_mediano)],
    ['Patrimônio P10',   fmtPat(base.pat_p10),  fmtPat(aspir.pat_p10)],
    ['Patrimônio P90',   fmtPat(base.pat_p90),  fmtPat(aspir.pat_p90)],
    ['Idade (FIRE Day)',  fmtIdade(base.idade),   fmtIdade(aspir.idade)],
    ['Gasto por ano',    fmtGasto(base.gasto_anual), fmtGasto(aspir.gasto_anual)],
    ['SWR (%)',          fmtSwr(base.swr),      fmtSwr(aspir.swr)],
  ];

  el.innerHTML = `<table class="scenario-compare-table" style="width:100%">
    <thead><tr>
      <th style="text-align:left">Métrica</th>
      <th class="num" style="color:var(--accent)">Cenário Base ✅</th>
      <th class="num" style="color:var(--purple)">Cenário Aspiracional 🚀</th>
    </tr></thead>
    <tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td></tr>`).join('')}</tbody>
  </table>
  <div style="margin-top:8px;font-size:.7rem;color:var(--muted)">${sc.nota_scenarios_pat || ''}</div>`;
}

// ═══════════════════════════════════════════════════════════════
// F5: MUST / LIKE TO SPEND
// ═══════════════════════════════════════════════════════════════
function _fmtPeriodo(periodo) {
  // "2025-08 a 2026-03" → "Ago/2025 a Mar/2026"
  if (!periodo) return periodo;
  const MESES_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return periodo.replace(/(\d{4})-(\d{2})/g, (_, y, m) => `${MESES_PT[parseInt(m,10)-1]}/${y}`);
}

function buildSpendingBreakdown() {
  const el = document.getElementById('spendingBreakdownBody');
  if (!el) return;
  const sb = DATA.spending_breakdown;
  if (!sb) {
    el.innerHTML = '<div style="color:var(--muted);font-size:.8rem">Dados de gastos não disponíveis — importar CSV de gastos</div>';
    return;
  }

  const total = sb.total_mensal;
  const must  = sb.must_spend_mensal;
  const like  = sb.like_spend_mensal;
  const imp   = sb.imprevistos_mensal;
  const modelo = sb.modelo_fire_anual;

  const pMust = total > 0 ? must/total*100 : 0;
  const pLike = total > 0 ? like/total*100 : 0;
  const pImp  = total > 0 ? imp/total*100  : 0;

  const anual = sb.total_anual;
  const bufferAnual = modelo - anual;
  const bufferColor = bufferAnual >= 0 ? 'var(--green)' : 'var(--red)';
  const bufferIcon  = bufferAnual >= 0 ? '✅' : '⚠️';

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;margin-bottom:14px">
      <div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:8px;padding:12px;text-align:center">
        <div style="font-size:.6rem;color:var(--red);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Essenciais</div>
        <div class="pv" style="font-size:1.4rem;font-weight:700;color:var(--red)">R$${must.toLocaleString('pt-BR')}</div>
        <div style="font-size:.65rem;color:var(--muted)">/mês · ${pMust.toFixed(0)}% do total</div>
        <div class="spend-cat-bar" style="background:rgba(239,68,68,.5);width:${pMust.toFixed(0)}%"></div>
        <div style="font-size:.6rem;color:var(--muted);margin-top:4px">Inclui principal hipoteca (<span class="pv">R$1.517/mês</span> = equity)</div>
      </div>
      <div style="background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.25);border-radius:8px;padding:12px;text-align:center">
        <div style="font-size:.6rem;color:var(--accent);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Discricionários</div>
        <div class="pv" style="font-size:1.4rem;font-weight:700;color:var(--accent)">R$${like.toLocaleString('pt-BR')}</div>
        <div style="font-size:.65rem;color:var(--muted)">/mês · ${pLike.toFixed(0)}% do total</div>
        <div class="spend-cat-bar" style="background:rgba(59,130,246,.5);width:${pLike.toFixed(0)}%"></div>
        <div style="font-size:.6rem;color:var(--muted);margin-top:4px">Discricionários cortáveis</div>
      </div>
      <div style="background:rgba(234,179,8,.08);border:1px solid rgba(234,179,8,.25);border-radius:8px;padding:12px;text-align:center">
        <div style="font-size:.6rem;color:var(--yellow);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Imprevistos</div>
        <div class="pv" style="font-size:1.4rem;font-weight:700;color:var(--yellow)">R$${imp.toLocaleString('pt-BR')}</div>
        <div style="font-size:.65rem;color:var(--muted)">/mês · ${pImp.toFixed(0)}% do total</div>
        <div class="spend-cat-bar" style="background:rgba(234,179,8,.5);width:${Math.max(pImp,3).toFixed(0)}%"></div>
        <div style="font-size:.6rem;color:var(--muted);margin-top:4px">Gifts e pontuais</div>
      </div>
    </div>
    <div style="background:var(--card2);border-radius:8px;padding:12px;display:grid;grid-template-columns:repeat(auto-fit, minmax(120px, 1fr));gap:12px;text-align:center">
      <div>
        <div class="pv" style="font-size:1.1rem;font-weight:700">R$${total.toLocaleString('pt-BR')}/mês</div>
        <div class="pv" style="font-size:.65rem;color:var(--muted)">Total real · R$${(anual/1000).toFixed(0)}k/ano</div>
      </div>
      <div>
        <div class="pv" style="font-size:1.1rem;font-weight:700;color:var(--muted)">R$${(modelo/1000).toFixed(0)}k/ano</div>
        <div style="font-size:.65rem;color:var(--muted)">Modelo FIRE</div>
      </div>
      <div>
        <div class="pv" style="font-size:1.1rem;font-weight:700;color:${bufferColor}">${bufferIcon} R$${Math.abs(bufferAnual/1000).toFixed(0)}k/ano</div>
        <div style="font-size:.65rem;color:var(--muted)">${bufferAnual >= 0 ? 'Buffer vs. modelo' : 'Acima do modelo'}</div>
      </div>
    </div>
    <div style="font-size:.65rem;color:var(--muted);margin-top:6px">Período: ${_fmtPeriodo(sb.periodo)} (${sb.meses} meses)</div>`;

  const srcEl = document.getElementById('spendingBreakdownSrc');
  if (srcEl) srcEl.innerHTML = `All-Accounts CSV · Período: ${_fmtPeriodo(sb.periodo)} · Essenciais inclui principal da hipoteca (<span class="pv">R$1.517/mês</span> = reconstrói equity do imóvel)`;
}

// ═══════════════════════════════════════════════════════════════
// F6: LIFE EVENTS (enhanced)
// ═══════════════════════════════════════════════════════════════
function buildLifeEventsEnhanced() {
  const el = document.getElementById('lifeEventsEnhanced');
  if (!el) return;
  const evs = DATA.life_events_planejados || [];
  if (!evs.length) {
    el.innerHTML = '<span style="color:var(--muted);font-size:.8rem">Nenhum evento de vida planejado</span>';
    return;
  }
  const anoAtual = DATA.premissas.ano_atual || new Date().getFullYear();
  el.innerHTML = evs.map(ev => {
    const anosRestantes = ev.ano - anoAtual;
    const urgente = anosRestantes <= 2;
    const borderColor = urgente ? 'var(--yellow)' : 'var(--border)';
    // Impacto estimado em P(FIRE): não disponível sem rodar MC — mostrar placeholder
    return `<div style="display:grid;grid-template-columns:auto 1fr auto;gap:14px;padding:12px 0;border-bottom:1px solid rgba(71,85,105,.2);align-items:center">
      <div style="background:rgba(234,179,8,.15);border:1px solid ${borderColor};border-radius:8px;padding:8px 12px;text-align:center;min-width:60px">
        <div style="font-size:1.1rem;font-weight:700;color:var(--yellow)">${ev.ano}</div>
        <div style="font-size:.6rem;color:var(--muted)">idade ${ev.idade}</div>
      </div>
      <div>
        <div style="font-size:.9rem;font-weight:600">${ev.label}</div>
        <div style="font-size:.75rem;color:var(--accent);margin-top:2px">Impacto: <span class="pv">R$${(ev.valor_brl/1000).toFixed(0)}k</span> (gasto pontual)</div>
        <div style="font-size:.65rem;color:var(--muted);margin-top:2px">${urgente ? '⚠️ Próximo — ' : ''}Em ${anosRestantes} anos · Tipo: ${ev.tipo}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:.65rem;color:var(--muted);margin-bottom:2px">Impacto P(FIRE)</div>
        <div style="font-size:.75rem;color:var(--muted)" title="Requer MC dedicado para calcular impacto exato">—</div>
        <div style="font-size:.55rem;color:var(--muted)">—</div>
      </div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
// F1: LIFETIME INCOME PROJECTION CHART
// ═══════════════════════════════════════════════════════════════
function buildIncomeProjection() {
  const ctx = document.getElementById('incomeProjectionChart');
  if (!ctx) return;

  const p  = DATA.premissas;
  const sm = DATA.spendingSmile;
  if (!p || !sm) return;

  // ── Parâmetros ──────────────────────────────────────────────────
  const anoAtual      = new Date().getFullYear();
  const idadeAtual    = p.idade_atual       || 39;
  const idadeFireAlvo = p.idade_cenario_base   || 53;
  const inssInicio    = p.inss_inicio_ano   || 12;   // anos após FIRE → age 65
  const inssAnual     = p.inss_anual        || 18000;
  const custoBase     = p.custo_vida_base   || 250000;
  const rendaAtiva    = (p.renda_estimada ?? 45000) * 12; // R$/ano pré-FIRE (de DATA.premissas.renda_estimada)

  const anoFire = anoAtual + (idadeFireAlvo - idadeAtual);
  const anoInss = anoFire  + inssInicio;             // 2040 + 12 = 2052 → age 65
  const anoFim  = anoAtual + (90 - idadeAtual);      // até age 90

  // Spending smile: go_go / slow_go / no_go em anos após FIRE
  const goGoFim    = sm.go_go?.fim    ?? 15;
  const slowGoFim  = sm.slow_go?.fim  ?? 30;
  const goGoGasto  = sm.go_go?.gasto  ?? custoBase;
  const slowGoGasto= sm.slow_go?.gasto?? custoBase;
  const noGoGasto  = sm.no_go?.gasto  ?? custoBase;

  // ── Séries ──────────────────────────────────────────────────────
  const anos = [], labels = [];
  const renda_ativa = [], saque_portfolio = [], inss_arr = [], despesas = [];

  for (let ano = anoAtual; ano <= anoFim; ano++) {
    const anosAposFire = ano - anoFire;
    const preFire = ano < anoFire;

    // Spending smile — valores em R$ reais constantes 2026
    let gasto;
    if (preFire) {
      gasto = custoBase;
    } else if (anosAposFire < goGoFim) {
      gasto = goGoGasto;   // Go-Go (anos 0–14 após FIRE)
    } else if (anosAposFire < slowGoFim) {
      gasto = slowGoGasto; // Slow-Go (anos 15–29 após FIRE)
    } else {
      gasto = noGoGasto;   // No-Go (anos 30+)
    }

    const inssVal  = ano >= anoInss ? inssAnual : 0;
    const saqueVal = preFire ? 0 : Math.max(0, gasto - inssVal);

    anos.push(ano);
    labels.push(String(ano));
    renda_ativa.push(preFire ? rendaAtiva : 0);
    saque_portfolio.push(saqueVal);
    inss_arr.push(preFire ? 0 : inssVal);
    despesas.push(gasto);
  }

  // Milestones: FIRE, INSS
  const milestoneMap = { [anoFire]: `FIRE (age ${idadeFireAlvo})`, [anoInss]: 'INSS (age 65)' };

  if (charts.incomeProjection) { charts.incomeProjection.destroy(); charts.incomeProjection = null; }
  charts.incomeProjection = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Renda Ativa (pré-FIRE)',
          data: renda_ativa,
          backgroundColor: 'rgba(59,130,246,.65)',
          stack: 'renda',
          order: 2,
        },
        {
          label: 'Saque Portfólio (pós-FIRE)',
          data: saque_portfolio,
          backgroundColor: 'rgba(168,85,247,.6)',
          stack: 'renda',
          order: 2,
        },
        {
          label: `INSS (age 65+, R$${(inssAnual/1000).toFixed(0)}k/ano)`,
          data: inss_arr,
          backgroundColor: 'rgba(34,197,94,.65)',
          stack: 'renda',
          order: 2,
        },
        {
          label: 'Despesas — Spending Smile (R$ reais constante 2026)',
          data: despesas,
          type: 'line',
          borderColor: 'rgba(239,68,68,.85)',
          borderWidth: 2,
          borderDash: [],
          pointRadius: 0,
          fill: false,
          tension: 0.3,
          order: 1,
          stack: undefined,
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 10 } } },
        tooltip: {
          callbacks: {
            title: items => {
              if (!items.length) return '';
              const ano = parseInt(labels[items[0].dataIndex], 10);
              const ms = milestoneMap[ano];
              return labels[items[0].dataIndex] + (ms ? ` — ${ms}` : '');
            },
            label: c => {
              if (c.parsed.y === null || c.parsed.y === 0) return null;
              return ` ${c.dataset.label}: R$${(c.parsed.y/1000).toFixed(0)}k`;
            },
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: '#94a3b8', maxTicksLimit: 14, autoSkip: true, maxRotation: 0 },
          grid: { color: 'rgba(71,85,105,.2)' }
        },
        y: {
          stacked: true,
          ticks: { color: '#94a3b8', callback: v => 'R$' + (v/1000).toFixed(0) + 'k' },
          grid: { color: 'rgba(71,85,105,.2)' }
        }
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// F7: NET WORTH PROJECTION P10/P50/P90
// ═══════════════════════════════════════════════════════════════
function buildNetWorthProjection() {
  const nw = DATA.net_worth_projection;
  if (!nw) return;
  const ctx = document.getElementById('netWorthProjectionChart');
  if (!ctx) return;
  // Retry se canvas ainda tem 0 width (mobile: layout mais lento que double-RAF)
  if (ctx.offsetWidth === 0) { setTimeout(buildNetWorthProjection, 300); return; }

  // Focar no horizonte de acumulação até FIRE — cortar dados pós-FIRE (décadas irrelevantes)
  const _anoFire = nw.ano_fire || 2040;
  const _fireSlice = nw.anos.reduce((acc, a, i) => { if (a <= _anoFire) acc.push(i); return acc; }, []);
  const _anos  = _fireSlice.map(i => nw.anos[i]);
  const _p10   = _fireSlice.map(i => (nw.p10||[])[i]);
  const _p50   = _fireSlice.map(i => (nw.p50||[])[i]);
  const _p90   = _fireSlice.map(i => (nw.p90||[])[i]);

  const labels = _anos.map(a => {
    const idade = a - (DATA.premissas.ano_atual - DATA.premissas.idade_atual);
    return `${a} (${idade} anos)`;
  });
  const anoFireIdx = _anos.indexOf(_anoFire);
  const gatilho = DATA.premissas.patrimonio_gatilho;

  // Índice do ano atual
  const anoAtual = DATA.premissas.ano_atual;
  const aHojeIdx = _anos.indexOf(anoAtual);
  const patAtual = DATA.premissas.patrimonio_atual;

  // Y bounds dinâmicos: max com headroom, min zoom para que as linhas não fiquem coladas no fundo
  const _allNwVals = [..._p10, ..._p50, ..._p90].filter(v => v != null && isFinite(v) && v > 0);
  const _nwDataMax = _allNwVals.length ? Math.max(..._allNwVals) : 15e6;
  const _nwYMax = Math.min(_nwDataMax * 1.15, 30e6); // headroom 15%, cap em R$30M
  const _p10Pos = _p10.filter(v => v != null && v > 0);
  const _nwYMin = _p10Pos.length ? Math.floor(Math.min(..._p10Pos) * 0.75 / 1e6) * 1e6 : 0;


  // Destroy any existing chart — Chart.getChart() catches orphaned instances not tracked in charts.netWorth
  const _nwExisting = Chart.getChart(ctx);
  if (_nwExisting) _nwExisting.destroy();
  if (charts.netWorth) { try { charts.netWorth.destroy(); } catch(_e) {} charts.netWorth = null; }

  // Plugin inline para linha vertical "Hoje" e shading
  const verticalLinePlugin = {
    id: 'verticalTodayLine',
    afterDraw(chart) {
      if (aHojeIdx < 0) return;
      const { ctx: c, chartArea: { top, bottom }, scales: { x } } = chart;
      const xPos = x.getPixelForValue(aHojeIdx);
      c.save();
      // Linha vertical pontilhada
      c.beginPath();
      c.setLineDash([4, 4]);
      c.moveTo(xPos, top);
      c.lineTo(xPos, bottom);
      c.strokeStyle = 'rgba(255,255,255,.35)';
      c.lineWidth = 1.5;
      c.stroke();
      // Label "Hoje"
      c.setLineDash([]);
      c.fillStyle = 'rgba(255,255,255,.6)';
      c.font = '700 10px system-ui';
      c.textAlign = 'center';
      c.fillText('Hoje', xPos, top + 12);
      c.restore();
    }
  };

  charts.netWorth = new Chart(ctx, {
    type: 'line',
    plugins: [verticalLinePlugin],
    data: {
      labels,
      datasets: [
        {
          label: 'P90 (cenário favorável)',
          data: _p90,
          borderColor: 'rgba(34,197,94,.75)',
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0.3,
        },
        {
          label: 'P50 (mediana)',
          data: _p50,
          borderColor: '#3b82f6',
          borderWidth: 2.5,
          pointRadius: _anos.map((a, i) => {
            if (i === anoFireIdx) return 7;
            if (i === aHojeIdx) return 6;
            return 0;
          }),
          pointBackgroundColor: _anos.map((a, i) => {
            if (i === anoFireIdx) return '#3b82f6';
            if (i === aHojeIdx) return '#f1f5f9';
            return 'transparent';
          }),
          pointBorderColor: _anos.map((a, i) => i === aHojeIdx ? '#3b82f6' : 'transparent'),
          pointBorderWidth: _anos.map((a, i) => i === aHojeIdx ? 2 : 0),
          fill: '-1',
          backgroundColor: 'rgba(59,130,246,.08)',
          tension: 0.3,
        },
        {
          label: 'P10 (cenário stress)',
          data: _p10,
          borderColor: 'rgba(239,68,68,.7)',
          backgroundColor: 'rgba(239,68,68,.08)',
          borderWidth: 1.5,
          pointRadius: 0,
          fill: '-1',
          tension: 0.3,
        },
        {
          label: document.body.classList.contains('private-mode') ? 'Gatilho FIRE' : `Gatilho FIRE R$${(gatilho/1e6).toFixed(1)}M`,
          data: labels.map(() => gatilho),
          borderColor: 'rgba(234,179,8,.6)',
          borderWidth: 1.5,
          borderDash: [6, 3],
          pointRadius: 0,
          fill: false,
        },
        // Marcador ponto "Hoje" com patrimônio atual
        ...(aHojeIdx >= 0 && patAtual ? [{
          label: document.body.classList.contains('private-mode') ? 'Hoje' : `Hoje: R$${(patAtual/1e6).toFixed(3)}M`,
          data: _anos.map((a, i) => i === aHojeIdx ? patAtual : null),
          borderColor: 'transparent',
          backgroundColor: '#f1f5f9',
          pointRadius: _anos.map((a, i) => i === aHojeIdx ? 8 : 0),
          pointBackgroundColor: '#f1f5f9',
          pointBorderColor: '#3b82f6',
          pointBorderWidth: 2,
          fill: false,
          showLine: false,
        }] : []),
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 10 } } },
        tooltip: {
          callbacks: {
            title: items => {
              if (!items.length) return '';
              const ano = labels[items[0].dataIndex];
              const anoNum = parseInt(ano);
              if (anoNum === anoAtual) return ano + ' — Hoje';
              return ano + (anoNum === _anoFire ? ` — FIRE Day (age ${DATA.premissas.idade_cenario_base})` : '');
            },
            label: ctx => {
              if (ctx.parsed.y === null) return null;
              return ` ${ctx.dataset.label.split(' —')[0]}: R$${(ctx.parsed.y/1e6).toFixed(2)}M`;
            },
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8', maxTicksLimit: 12, autoSkip: true, maxRotation: 0 },
          grid: { color: 'rgba(71,85,105,.2)' }
        },
        y: {
          max: _nwYMax,
          min: _nwYMin,
          ticks: { color: '#94a3b8', callback: v => 'R$' + (v/1e6).toFixed(1) + 'M' },
          grid: { color: 'rgba(71,85,105,.2)' }
        }
      }
    }
  });

  const srcEl = document.getElementById('netWorthProjectionSrc');
  if (srcEl) {
    const mc = DATA.scenario_comparison?.fire53;
    srcEl.textContent = mc
      ? `MC endpoints: P50=R$${(mc.pat_mediano/1e6).toFixed(2)}M · P10=R$${(mc.pat_p10/1e6).toFixed(2)}M · P90=R$${(mc.pat_p90/1e6).toFixed(2)}M no FIRE Day ${nw.ano_fire}`
      : 'Monte Carlo · premissas do modelo';
  }
}

// ═══════════════════════════════════════════════════════════════
// F11: STRESS TEST
// ═══════════════════════════════════════════════════════════════

/**
 * Renderiza os 3 cards de cenário (Base / Favorável / Stress) no stressTestBody.
 * @param {object} vals  - { base, fav, stress } — cada um { pfire, badge }
 *   badge: 'precalc' | 'live' | 'pending'
 * @param {object} stData - DATA.stress_test (para exibir patrimônio pós-shock no card lateral)
 */
function _renderStressCards(vals, stData) {
  const el = document.getElementById('stressTestBody');
  if (!el) return;

  const badgeHtml = (b) => {
    if (b === 'precalc')  return `<span style="font-size:.6rem;background:rgba(71,85,105,.25);color:var(--muted);border-radius:4px;padding:2px 6px;font-weight:600">⚡ pré-calc.</span>`;
    if (b === 'live')     return `<span style="font-size:.6rem;background:rgba(59,130,246,.2);color:var(--accent);border-radius:4px;padding:2px 6px;font-weight:600">✅ simulado</span>`;
    return `<span style="font-size:.6rem;background:rgba(234,179,8,.15);color:var(--yellow);border-radius:4px;padding:2px 6px;font-weight:600">— aguardando</span>`;
  };

  const scenarioDesc = {
    'Base':      'Retorno histórico MSCI World (~5% real/ano) com volatilidade normal.',
    'Favorável': 'Bull market prolongado: retorno +2pp acima da base — mercado em expansão.',
    'Stress':    'Retorno −2pp abaixo da base — décadas de retorno comprimido pós-crise.',
  };

  const cardHtml = (label, icon, accent, v) => {
    const pfire = v.pfire;
    const badge = v.badge;
    const color = pfire == null ? 'var(--muted)' : pfire >= 85 ? 'var(--green)' : pfire >= 70 ? 'var(--yellow)' : 'var(--red)';
    const pfireDisp = pfire != null ? `${pfire}%` : '—';
    const desc = scenarioDesc[label] || '';
    return `
      <div style="background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:6px">
        <div style="font-size:.7rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">${icon} ${label}</div>
        <div style="font-size:2rem;font-weight:800;color:${color};line-height:1">${pfireDisp}</div>
        <div style="font-size:.65rem;color:var(--muted)">P(FIRE) Monte Carlo</div>
        ${badgeHtml(badge)}
        <div style="font-size:.6rem;color:var(--muted);margin-top:2px;max-width:160px;line-height:1.35">${desc}</div>
      </div>`;
  };

  const patAtualHoje = DATA.premissas.patrimonio_atual;
  // stData.pat_atual may be the projected portfolio at onset age (if onset > current age)
  const patBaseParaShock = (stData && stData.pat_atual) ? stData.pat_atual : patAtualHoje;
  const pct = stData ? stData.shock_pct : 40;
  const patShock = stData ? stData.pat_pos_shock : patAtualHoje * 0.60;
  const deltaM = (patBaseParaShock - patShock) / 1e6;
  const isProjected = stData && stData.pat_atual && Math.abs(stData.pat_atual - patAtualHoje) > 1000;

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">
      ${cardHtml('Base', '🔵', 'var(--accent)', vals.base)}
      ${cardHtml('Favorável', '🟢', 'var(--green)', vals.fav)}
      ${cardHtml('Stress', '🔴', 'var(--red)', vals.stress)}
    </div>
    <div style="margin-top:12px;font-size:.72rem;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:10px">
      <div style="display:flex;flex-wrap:wrap;gap:16px">
        ${isProjected
          ? `<div><span style="color:var(--muted)">Patrimônio hoje:</span> <strong class="pv">R$${(patAtualHoje/1e6).toFixed(2)}M</strong></div>
             <div><span style="color:var(--muted)">Projetado na idade do shock:</span> <strong class="pv">R$${(patBaseParaShock/1e6).toFixed(2)}M</strong></div>`
          : `<div><span style="color:var(--muted)">Patrimônio atual:</span> <strong class="pv">R$${(patAtualHoje/1e6).toFixed(2)}M</strong></div>`
        }
        <div><span style="color:var(--muted)">Shock aplicado:</span> <strong style="color:var(--red)">−${pct}%</strong></div>
        <div><span style="color:var(--muted)">Pós-shock:</span> <strong style="color:var(--red)" class="pv">R$${(patShock/1e6).toFixed(2)}M</strong></div>
        <div><span style="color:var(--red)">Perda bruta:</span> <strong style="color:var(--red)" class="pv">−R$${deltaM.toFixed(2)}M</strong></div>
      </div>
      ${stData && stData.descricao_shock ? `<div style="margin-top:6px;color:var(--muted)">${stData.descricao_shock}</div>` : ''}
    </div>`;
}

function buildStressTest() {
  const st = DATA.stress_test;

  // Atualizar patrimônio pós-shock no header (slider em -40%)
  const patAtual = DATA.premissas.patrimonio_atual;
  const patShockEl = document.getElementById('stressPatShock');
  if (patShockEl) {
    const ps = st ? st.pat_pos_shock : patAtual * 0.60;
    patShockEl.textContent = `R$${(ps / 1e6).toFixed(2)}M`;
  }

  if (!st) {
    const el = document.getElementById('stressTestBody');
    if (el) el.innerHTML = '<span style="color:var(--muted)">Dados não disponíveis</span>';
    return;
  }

  const hasPfire = st.pfire_pos_shock_base != null;

  _renderStressCards(
    {
      base:   { pfire: hasPfire ? st.pfire_pos_shock_base   : null, badge: hasPfire ? 'precalc' : 'pending' },
      fav:    { pfire: hasPfire ? st.pfire_pos_shock_fav    : null, badge: hasPfire ? 'precalc' : 'pending' },
      stress: { pfire: hasPfire ? st.pfire_pos_shock_stress : null, badge: hasPfire ? 'precalc' : 'pending' },
    },
    st
  );

  // Fan chart — rodar MC para gerar trajetórias percentis (cenário padrão -40%)
  const _p = DATA.premissas;
  const _retReal    = _p.retorno_equity_base || 0.0485;
  const _vol        = _p.volatilidade_equity || 0.168;
  const _spending   = _p.custo_vida_base     || 250000;
  const _aporte     = (_p.aporte_mensal      || 33000) * 12;
  const _fireAge    = _p.idade_cenario_base     || 53;
  const _idadeAtual = _p.idade_atual         || 39;
  const _onsetAge   = parseInt(document.getElementById('stressOnsetAge')?.value || _idadeAtual, 10);
  const _anosPreShock = Math.max(0, _onsetAge - _idadeAtual);
  const _anosAcumulo  = Math.max(0, _fireAge - _onsetAge);
  const _patShock   = st ? st.pat_pos_shock : patAtual * 0.60;
  const _shockPct   = st ? st.shock_pct : 40;

  // Trajetória P50 determinística de hoje até o shock (E[crescimento] com aportes)
  const _mu = Math.log(1 + _retReal) - 0.5 * _vol * _vol;
  const preShockP50 = [patAtual];
  let _pat = patAtual;
  for (let t = 0; t < _anosPreShock; t++) {
    _pat = _pat * Math.exp(_mu) + _aporte;
    preShockP50.push(_pat);
  }

  setTimeout(() => {
    try {
      const traj = runMCTrajectories(_patShock, _spending, _anosAcumulo, 40, _retReal, _vol, 500, _aporte);
      buildStressFanChart(traj, _onsetAge, _anosAcumulo, _shockPct, preShockP50, _idadeAtual);
    } catch(e) { console.error('[stress-fan-chart ERROR]', e); }
  }, 100); // 100ms: garante reflow completo após seção colapsível abrir (50ms era insuficiente em alguns browsers)
}

// ═══════════════════════════════════════════════════════════════
// F11: STRESS TEST INTERATIVO — MC em JS (Browser)
// ═══════════════════════════════════════════════════════════════

// Box-Muller para normal padrão
function _randNorm() {
  const u1 = Math.random(), u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Monte Carlo simplificado (log-normal) — roda 100% no browser.
 * @param {number} patrimonioInicial - patrimônio financeiro após shock (BRL)
 * @param {number} spendingAnual - gasto anual na aposentadoria (BRL)
 * @param {number} anosAcumulo - anos de acumulação até FIRE (com aportes)
 * @param {number} anosAposentadoria - anos de desacumulação
 * @param {number} retReal - retorno real anual esperado (ex: 0.0509)
 * @param {number} vol - volatilidade anual (ex: 0.14)
 * @param {number} nTrials - número de simulações (ex: 2000)
 * @param {number} aporteAnual - aporte anual durante acumulação (ex: 300000)
 * @returns {string} P(FIRE) em % com 1 decimal
 */
function runMC(patrimonioInicial, spendingAnual, anosAcumulo, anosAposentadoria, retReal, vol, nTrials, aporteAnual) {
  let sucessos = 0;
  const mu = Math.log(1 + retReal) - 0.5 * vol * vol;
  for (let i = 0; i < nTrials; i++) {
    let pat = patrimonioInicial;
    // Fase acumulação (com aportes anuais)
    for (let t = 0; t < anosAcumulo; t++) {
      const r = Math.exp(mu + vol * _randNorm());
      pat = pat * r + aporteAnual;
    }
    // Fase desacumulação
    let ok = true;
    for (let t = 0; t < anosAposentadoria; t++) {
      const r = Math.exp(mu + vol * _randNorm());
      pat = pat * r - spendingAnual;
      if (pat <= 0) { ok = false; break; }
    }
    if (ok) sucessos++;
  }
  return (sucessos / nTrials * 100).toFixed(1);
}

/**
 * Gera trajetórias percentis para o fan chart de stress.
 * Retorna { p5, p25, p50, p75, p95 } — arrays com (anosAcumulo + anosAposentadoria + 1) pontos.
 */
function runMCTrajectories(pat0, spendingAnual, anosAcumulo, anosAposentadoria, retReal, vol, nTrials, aporteAnual) {
  const nYears = anosAcumulo + anosAposentadoria;
  const mu = Math.log(1 + retReal) - 0.5 * vol * vol;
  // Pré-alocar: array de arrays por ano (mais eficiente para percentis)
  const byYear = Array.from({ length: nYears + 1 }, () => new Float64Array(nTrials));

  for (let i = 0; i < nTrials; i++) {
    let pat = pat0;
    byYear[0][i] = pat;
    for (let t = 0; t < anosAcumulo; t++) {
      pat = pat * Math.exp(mu + vol * _randNorm()) + aporteAnual;
      if (pat < 0) pat = 0;
      byYear[t + 1][i] = pat;
    }
    for (let t = 0; t < anosAposentadoria; t++) {
      if (pat <= 0) { byYear[anosAcumulo + t + 1][i] = 0; continue; }
      pat = pat * Math.exp(mu + vol * _randNorm()) - spendingAnual;
      if (pat < 0) pat = 0;
      byYear[anosAcumulo + t + 1][i] = pat;
    }
  }

  const pctile = (arr, p) => {
    const sorted = Float64Array.from(arr).sort();
    const idx = Math.max(0, Math.min(sorted.length - 1, Math.floor(p * sorted.length)));
    return sorted[idx];
  };

  const p5 = [], p25 = [], p50 = [], p75 = [], p95 = [];
  for (let t = 0; t <= nYears; t++) {
    p5.push(pctile(byYear[t], 0.05));
    p25.push(pctile(byYear[t], 0.25));
    p50.push(pctile(byYear[t], 0.50));
    p75.push(pctile(byYear[t], 0.75));
    p95.push(pctile(byYear[t], 0.95));
  }
  return { p5, p25, p50, p75, p95 };
}

/**
 * Constrói/atualiza o fan chart de stress com 3 fases:
 *   Fase 1 — linha P50 determinística de hoje até o shock (trajetória esperada)
 *   Fase 2 — marcador vertical do shock
 *   Fase 3 — cone de percentis pós-shock (P5/P25/P50/P75/P95)
 * @param {object} traj - { p5, p25, p50, p75, p95 } arrays pós-shock (length = anosAcumulo + 40 + 1)
 * @param {number} onsetAge - idade em que o shock ocorre
 * @param {number} anosAcumulo - anos de acumulação após o shock até FIRE
 * @param {number} shockPct - magnitude do shock (ex: 40 para −40%)
 * @param {number[]} [preShockP50] - patrimônio P50 determinístico de hoje até onsetAge (length = anosPreShock + 1)
 * @param {number} [idadeAtual] - idade atual (padrão: DATA.premissas.idade_atual)
 */
function buildStressFanChart(traj, onsetAge, anosAcumulo, shockPct, preShockP50, idadeAtual) {
  const _idadeAtual   = idadeAtual ?? (DATA.premissas?.idade_atual ?? 39);
  const anosPreShock  = Math.max(0, onsetAge - _idadeAtual);
  const shockIdx      = anosPreShock;
  const fireAge       = (DATA.premissas?.idade_cenario_base ?? 53);
  const nYearsPost    = traj.p50.length; // = anosAcumulo + 40 + 1
  const totalPoints   = anosPreShock + nYearsPost;
  const fireIdx       = shockIdx + anosAcumulo;
  const labels        = Array.from({ length: totalPoints }, (_, i) => _idadeAtual + i);
  const gatilho       = DATA.premissas?.patrimonio_gatilho;
  const M             = 1e6;

  const titleEl = document.getElementById('stressFanTitle');
  if (titleEl) {
    const shockLabel = anosPreShock > 0
      ? `Projeção: hoje → shock −${shockPct}% aos ${onsetAge} anos → cone até FIRE aos ${fireAge}`
      : `Projeção após shock de −${shockPct}% aos ${onsetAge} anos · FIRE aos ${fireAge}`;
    titleEl.textContent = shockLabel;
  }

  const ctx = document.getElementById('stressProjectionChart');
  if (!ctx) return;
  // Canvas em seção colapsível fechada → sair; _toggleBlock double-RAF reconstrói ao abrir
  if (ctx.offsetWidth === 0) return;

  // Destroy any existing chart — Chart.getChart() catches orphaned instances
  const _stressExisting = Chart.getChart(ctx);
  if (_stressExisting) _stressExisting.destroy();
  if (charts.stressProjection) { try { charts.stressProjection.destroy(); } catch(_e) {} charts.stressProjection = null; }

  // ── Fase 1: pre-shock P50 (índices 0..shockIdx inclusive, null depois) ──
  const preShockData = Array.from({ length: totalPoints }, (_, i) => {
    if (!preShockP50 || i > shockIdx) return null;
    const v = preShockP50[i];
    return v != null ? +(v / M).toFixed(3) : null;
  });

  // ── Fase 3: datasets pós-shock (null antes de shockIdx, valores de shockIdx em diante) ──
  const postShockData = arr => Array.from({ length: totalPoints }, (_, i) => {
    const postIdx = i - shockIdx;
    if (postIdx < 0 || postIdx >= arr.length) return null;
    return +(arr[postIdx] / M).toFixed(3);
  });

  charts.stressProjection = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        // Fase 1 — trajetória esperada pré-shock
        {
          label: 'Trajetória esperada',
          data: preShockData,
          borderColor: 'rgba(148,163,184,0.9)',
          borderWidth: 2,
          borderDash: [6, 3],
          pointRadius: 0,
          fill: false,
          tension: 0.3,
          spanGaps: false,
        },
        // Fase 3 — cone pós-shock: P5 → P25 → P50 → P75 → P95
        // fill: '-1' preenche entre este dataset e o anterior
        {
          label: 'P5',
          data: postShockData(traj.p5),
          borderColor: 'rgba(239,68,68,0.4)',
          borderWidth: 1,
          borderDash: [3, 3],
          pointRadius: 0,
          fill: false,
          tension: 0.3,
          spanGaps: false,
        },
        {
          label: 'P25',
          data: postShockData(traj.p25),
          borderColor: 'rgba(239,68,68,0)',
          borderWidth: 0,
          pointRadius: 0,
          fill: '-1',
          backgroundColor: 'rgba(239,68,68,0.12)',
          tension: 0.3,
          spanGaps: false,
        },
        {
          label: 'P50 (mediana)',
          data: postShockData(traj.p50),
          borderColor: '#94a3b8',
          borderWidth: 2,
          pointRadius: 0,
          fill: '-1',
          backgroundColor: 'rgba(59,130,246,0.08)',
          tension: 0.3,
          spanGaps: false,
        },
        {
          label: 'P75',
          data: postShockData(traj.p75),
          borderColor: 'rgba(34,197,94,0)',
          borderWidth: 0,
          pointRadius: 0,
          fill: '-1',
          backgroundColor: 'rgba(34,197,94,0.10)',
          tension: 0.3,
          spanGaps: false,
        },
        {
          label: 'P95',
          data: postShockData(traj.p95),
          borderColor: 'rgba(34,197,94,0.4)',
          borderWidth: 1,
          borderDash: [3, 3],
          pointRadius: 0,
          fill: '-1',
          backgroundColor: 'rgba(34,197,94,0.14)',
          tension: 0.3,
          spanGaps: false,
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#94a3b8', boxWidth: 10, font: { size: 10 } } },
        tooltip: {
          callbacks: {
            title: items => `Idade ${items[0].label}`,
            label: ctx => ctx.parsed.y != null ? ` ${ctx.dataset.label}: R$ ${ctx.parsed.y.toFixed(2)}M` : null,
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#94a3b8',
            maxTicksLimit: 12,
            callback: (v, i) => {
              const age = _idadeAtual + i;
              if (i === shockIdx) return `${age} (shock)`;
              if (i === fireIdx)  return `${age} (FIRE)`;
              return age;
            }
          },
          grid: { color: 'rgba(71,85,105,.3)' }
        },
        y: {
          ticks: { color: '#94a3b8', callback: v => 'R$' + v.toFixed(1) + 'M' },
          grid: { color: 'rgba(71,85,105,.3)' }
        }
      }
    },
    plugins: [{
      // Linhas verticais: shock (vermelho) e FIRE (verde) + linha horizontal gatilho
      id: 'stressMarkers',
      afterDraw(chart) {
        const { ctx: c, chartArea: ca, scales: { x, y } } = chart;
        if (!ca) return;
        c.save();
        const drawVLine = (idx, color, label) => {
          const xPx = x.getPixelForValue(idx);
          if (xPx < ca.left || xPx > ca.right) return;
          c.beginPath();
          c.setLineDash([4, 4]);
          c.strokeStyle = color;
          c.lineWidth = 1.5;
          c.moveTo(xPx, ca.top);
          c.lineTo(xPx, ca.bottom);
          c.stroke();
          c.fillStyle = color;
          c.font = 'bold 9px sans-serif';
          c.textAlign = 'center';
          c.fillText(label, xPx, ca.top + 10);
        };
        drawVLine(shockIdx, 'rgba(239,68,68,0.8)', `−${shockPct}%`);
        drawVLine(fireIdx,  'rgba(34,197,94,0.8)',  'FIRE');
        // Linha horizontal: gatilho
        if (gatilho) {
          const gatilhoM = gatilho / M;
          const yPx = y.getPixelForValue(gatilhoM);
          if (yPx >= ca.top && yPx <= ca.bottom) {
            c.beginPath();
            c.setLineDash([6, 3]);
            c.strokeStyle = 'rgba(234,179,8,0.6)';
            c.lineWidth = 1;
            c.moveTo(ca.left, yPx);
            c.lineTo(ca.right, yPx);
            c.stroke();
            c.fillStyle = 'rgba(234,179,8,0.8)';
            c.font = '9px sans-serif';
            c.textAlign = 'right';
            c.fillText(`Meta R$${gatilhoM.toFixed(1)}M`, ca.right - 4, yPx - 3);
          }
        }
        c.restore();
      }
    }]
  });
}

/**
 * Chamado pelo slider de shock do stress test.
 * Lógica UX:
 *   - Se slider = −40% e há dados pré-calc → exibe pré-calc, esconde botão
 *   - Se slider ≠ −40% → mostra botão "Simular ao vivo", cards ficam em 'pending'
 */
function onStressShockChange(val) {
  const pct = Math.abs(parseInt(val, 10)); // 0–70
  const labelEl = document.getElementById('stressShockLabel');
  const patShockEl = document.getElementById('stressPatShock');
  const simBtn = document.getElementById('stressSimBtn');

  const p = DATA.premissas;
  const patOriginal = p.patrimonio_atual;
  const idadeAtual = p.idade_atual || 39;
  const selectedAge = parseInt(document.getElementById('stressOnsetAge')?.value || idadeAtual, 10);

  // Project portfolio to onset age if onset > current age
  const mesesAteOnset = Math.max(0, (selectedAge - idadeAtual) * 12);
  let patNaIdade = patOriginal;
  if (mesesAteOnset > 0) {
    const rMensal = Math.pow(1 + (p.retorno_equity_base || 0.0485), 1/12) - 1;
    const aporteMensal = p.aporte_mensal || 33000;
    const fv = Math.pow(1 + rMensal, mesesAteOnset);
    patNaIdade = patOriginal * fv + aporteMensal * (fv - 1) / rMensal;
  }
  const patShock = patNaIdade * (1 - pct / 100);

  if (labelEl) labelEl.textContent = `−${pct}%`;
  if (patShockEl) patShockEl.textContent = `R$${(patShock / 1e6).toFixed(2)}M`;

  const st = DATA.stress_test;
  const hasPrecalc = st && st.pfire_pos_shock_base != null;
  const isDefaultShock = pct === (st ? st.shock_pct : 40);
  const isDefaultAge = selectedAge === idadeAtual;

  if (isDefaultShock && isDefaultAge && hasPrecalc) {
    buildStressTest();
  } else {
    // Auto-calculate: show pending briefly then run MC
    if (simBtn) simBtn.style.display = 'none';
    _renderStressCards(
      { base: { pfire: null, badge: 'pending' }, fav: { pfire: null, badge: 'pending' }, stress: { pfire: null, badge: 'pending' } },
      { shock_pct: pct, pat_pos_shock: patShock, pat_atual: patNaIdade }
    );
    clearTimeout(window._stressDebounce);
    window._stressDebounce = setTimeout(runStressSimulation, 250);
  }
}

/**
 * Executa MC simplificado para o shock atual e atualiza os 3 cards.
 * Chamado pelo botão "Simular ao vivo".
 */
function runStressSimulation() {
  const sliderEl = document.getElementById('stressShockSlider');
  const simBtn = document.getElementById('stressSimBtn');
  const pct = Math.abs(parseInt(sliderEl ? sliderEl.value : '-40', 10));

  if (simBtn) { simBtn.textContent = '⏳ Calculando…'; simBtn.disabled = true; }

  // Yield para o browser renderizar antes do MC (que bloqueia)
  setTimeout(() => {
    const p = DATA.premissas;
    const patOriginal = p.patrimonio_atual;
    const spendingAnual = p.custo_vida_base || 250000;
    const idadeAtual = p.idade_atual || 39;
    const idadeOnset = parseInt(document.getElementById('stressOnsetAge')?.value || idadeAtual, 10);
    const idadeFireAlvo = p.idade_cenario_base || 53;
    const retReal = p.retorno_equity_base || 0.0485;
    const vol = p.volatilidade_equity || 0.168;
    const aporteAnual = (p.aporte_mensal || 33000) * 12;
    const nTrials = 2000;

    // Project portfolio forward from current age to shock onset age before applying shock
    // Formula: pat_na_idade = patAtual * (1+r)^n + aporte * ((1+r)^n - 1) / r
    // Using monthly compounding: r_month = 0.407%/month (~5% real/year), n_months
    const mesesAteOnset = Math.max(0, (idadeOnset - idadeAtual) * 12);
    let patNaIdade = patOriginal;
    if (mesesAteOnset > 0) {
      const rMensal = Math.pow(1 + (p.retorno_equity_base || 0.0485), 1/12) - 1;
      const aporteMensal = p.aporte_mensal || 33000;
      const fv = Math.pow(1 + rMensal, mesesAteOnset);
      patNaIdade = patOriginal * fv + aporteMensal * (fv - 1) / rMensal;
    }

    const patShock = patNaIdade * (1 - pct / 100);
    // Anos de acumulação após o shock (desde a idade do shock até FIRE)
    const anosAcumulo = Math.max(0, idadeFireAlvo - idadeOnset);
    const anosAposentadoria = 40; // idade FIRE até 93

    // Cenário base
    const pfireBase = parseFloat(runMC(patShock, spendingAnual, anosAcumulo, anosAposentadoria, retReal, vol, nTrials, aporteAnual));
    // Cenário favorável: retorno +2pp
    const pfireFav = parseFloat(runMC(patShock, spendingAnual, anosAcumulo, anosAposentadoria, retReal + 0.02, vol, nTrials, aporteAnual));
    // Cenário stress: retorno −2pp
    const pfireStress = parseFloat(runMC(patShock, spendingAnual, anosAcumulo, anosAposentadoria, retReal - 0.02, vol, nTrials, aporteAnual));

    _renderStressCards(
      {
        base:   { pfire: pfireBase,   badge: 'live' },
        fav:    { pfire: pfireFav,    badge: 'live' },
        stress: { pfire: pfireStress, badge: 'live' },
      },
      { shock_pct: pct, pat_pos_shock: patShock, pat_atual: patNaIdade,
        descricao_shock: mesesAteOnset > 0
          ? `Patrimônio projetado até ${idadeOnset} anos (R$${(patNaIdade/1e6).toFixed(2)}M) → após shock de −${pct}%: R$${(patShock/1e6).toFixed(2)}M`
          : null }
    );

    // Trajetória P50 determinística de hoje até o shock (pré-shock)
    const _mu = Math.log(1 + retReal) - 0.5 * vol * vol;
    const preShockP50 = [patOriginal];
    let _pPat = patOriginal;
    for (let t = 0; t < Math.max(0, idadeOnset - idadeAtual); t++) {
      _pPat = _pPat * Math.exp(_mu) + aporteAnual;
      preShockP50.push(_pPat);
    }

    // Fan chart — trajetórias percentis (cenário base, 500 trials)
    const traj = runMCTrajectories(patShock, spendingAnual, anosAcumulo, anosAposentadoria, retReal, vol, 500, aporteAnual);
    buildStressFanChart(traj, idadeOnset, anosAcumulo, pct, preShockP50, idadeAtual);

    if (simBtn) { simBtn.textContent = '▶ Simular ao vivo'; simBtn.disabled = false; }
  }, 30);
}

