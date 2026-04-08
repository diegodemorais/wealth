# Dashboard — Gerar HTML da Carteira

Regenera `analysis/dashboard.html` — dashboard single-file com Chart.js, dark theme, responsivo.

## Fluxo

### 1. Codebase (ler em paralelo)

| Arquivo | Dados |
|---------|-------|
| `analysis/backtest_output/ibkr_lotes.json` | Qtde e custo base por ETF |
| `dados/historico_carteira.csv` | Série patrimônio mensal (timeline + CAGR) |
| `agentes/metricas/scorecard.md` | P(FIRE), shadows, TER, tornado, deltas |
| `dados/holdings.md` | RF (IPCA+ 2029/2040, Renda+ 2065) e crypto (HODL11 qtde) |

Não ler `shadow-portfolio.md` separadamente — os dados relevantes estão no scorecard.

### 2. Web (3 buscas, não 5)

| Busca | Dados |
|-------|-------|
| `"SWRD.L AVGS.L AVEM.L AVUV AVDV EIMI.L AVES DGS USSC price today"` | Preços ETFs + câmbio (geralmente nos resultados) |
| `"HODL11 cotação hoje"` + `"USD BRL câmbio hoje"` | HODL11 + câmbio (1 busca pode cobrir ambos) |
| `"USD BRL historical weekly 2026"` + `"PTAX semanal"` | PTAX últimos 3 meses (~15 pontos para Bollinger) |

Se WebSearch falhar para algum preço, ler `analysis/dashboard.html` atual e extrair o valor anterior.

### 3. Computar

Para cada ETF do lotes.json: `valor_usd = qty × preço_atual`, `ganho% = preço / avg_cost - 1`

Buckets, targets e geo breakdown: **ler de `scripts/ibkr_sync.py` (BUCKET_MAP) e `scripts/checkin_mensal.py` (PESOS_TARGET)**. Não hardcodar aqui — se mudarem lá, refletem automaticamente.

### 4. Gerar HTML

**Sobrescrever** `analysis/dashboard.html` com render completo. Estrutura obrigatória do JS:

```js
// Constantes centralizadas (NÃO duplicar valores inline)
// TODOS os valores computados dos arquivos do codebase, não hardcoded
const DATA = {
  date: '...', // date.today()
  cambio: ..., // WebSearch
  totalBrl: ..., // computar
  totalEquityUsd: ..., // computar de ibkr_lotes.json + preços
  pfire: {...}, // ler scorecard.md
  // ... todos os dados aqui
};
const GENERATED_AT = new Date('...');
```

Seções (todas obrigatórias, nesta ordem):

1. **Próximas Ações** (TOPO): próximo aporte sugerido via cascade (ler pisos de `portfolio_analytics.py`), gatilhos ativos (ler `agentes/contexto/gatilhos.md`), drift alerts (threshold de `gatilhos.md`). Background amarelo.
2. **Financial Wellness Score**: nota 0-100 agregando ~10 métricas: P(FIRE) base (peso 25%), drift máximo (15%), SWR implícita vs meta (15%), IPCA+ gap vs alvo (10%), savings rate (10%), TER vs benchmark (5%), TLH oportunidades (5%), diversificação geo (5%), staleness dados (5%), execuções pendentes (5%). Semáforo: ≥80 verde, 60-79 amarelo, <60 vermelho. Mostrar nota + breakdown das 10 métricas com cores individuais.
3. **KPI cards**: patrimônio, P(FIRE) (ler `scorecard.md`), **crescimento patrimonial** (NÃO "CAGR" — inclui aportes), delta A (ler `scorecard.md`)
4. **Time to FIRE**: countdown visual (X anos Y meses) com barra de progresso animada (`pat_atual / PREMISSAS["patrimonio_gatilho"]`). Mostrar: "Aporte de R$X/mês a mais acelera FIRE em Y meses" (computar: `(gatilho - pat) / (aporte_extra * 12)` simplificado). Dois sub-cards: FIRE@50 (aspiracional) e FIRE@53 (safe harbor).
5. **KPI FIRE**: progresso % (`pat / PREMISSAS["patrimonio_gatilho"]`), SWR implícita (`PREMISSAS["custo_vida_base"] / pat`), TWR estimado, savings rate (`PREMISSAS["aporte_mensal"] * 12 / renda_estimada` — se renda não disponível, mostrar aporte anual absoluto)
6. **Net worth stacked area** (timeline patrimônio com breakdown por classe): eixo X = meses do CSV, eixo Y = R$. Áreas empilhadas: Equity (azul) + RF (verde) + Crypto (amarelo). Se breakdown mensal não disponível no CSV, usar proporção atual e interpolar. Substitui o line chart simples.
7. **Performance Attribution** (stacked bar): decompor crescimento em Aportes + Retorno USD + Câmbio. Ref: `fx_utils.py decompose_return()`. Computar, não hardcodar.
8. **Donut alocação + donut geográfico** (`doughnutOpts()` helper). Geo: computar de EQUITY_WEIGHTS + MSCI World ~67% US.
9. **Scenario Comparison** (2 colunas side-by-side): FIRE@50 vs FIRE@53. Para cada: P(FIRE), patrimônio mediano, SWR, anos restantes. Dados: ler `scorecard.md` (ambos cenários existem). Highlight visual no cenário escolhido (53).
10. **P(FIRE) + tornado + spending gauge**: P(FIRE) 3 cenários (ler `scorecard.md`) + tornado (⚠️ Estimativa se manual) + tabela spending scenarios (ler `scorecard.md`) + barra SWR atual vs meta
11. **Delta bar** (**incluir IPCA+ longo**) + progress bars (SWRD/AVGS/AVEM/IPCA+)
12. **Glide path stacked area** (soma=100%/ano; pós-FIRE=rising equity conforme `carteira.md`)
13. **FIRE buckets donut**
14. **Fan chart P10/P50/P90** (projeção patrimônio até FIRE. Gatilho: `PREMISSAS["patrimonio_gatilho"]`. P10/P50/P90: ler `scorecard.md`)
15. **Guardrails visuais** (ler `fire_montecarlo.py` → `GUARDRAILS` + `GASTO_PISO`. Cores verde→vermelho)
16. **Retirement Income Breakdown** (pós-FIRE): stacked bar ou tabela mostrando fontes de renda por ano: saques equity + INSS (`PREMISSAS["inss_anual"]` a partir de `PREMISSAS["inss_inicio_ano"]`) + Renda+ 2065 (se ainda existir). Mostrar que INSS cobre ~7% do spending.
17. **Fee Analysis**: custo TER acumulado até FIRE. Cálculo: `TER_ponderado × patrimonio_medio × anos_ate_fire`. Ler TER de `scorecard.md` seção 1.3. Mostrar em R$ e como % do patrimônio final. Comparar: TER da carteira vs TER Shadow A (VWRA) vs TER Shadow C.
18. **Monthly Contribution Needed**: "Para atingir gatilho em N anos, precisa aportar R$X/mês". Computar: `(gatilho - pat_futuro_sem_aporte) / (N * 12)` onde `pat_futuro = pat * (1+r)^N`. Mostrar slider: se aporte = R$25k → FIRE em 14 anos. Se R$35k → FIRE em 12 anos.
19. **What-if Scenarios** (JS interativo): 3 sliders — (a) aporte mensal R$15k-50k, (b) retorno equity 3%-7%, (c) custo vida R$200k-350k. Ao mover, recalcula e atualiza: P(FIRE) estimado, anos até FIRE, patrimônio projetado. Fórmula simplificada: `pat_fire = pat * (1+r)^N + aporte_anual * ((1+r)^N - 1) / r`. Não precisa de MC — aproximação suficiente para exploração interativa.
20. **Sankey Diagram** (cash flow mensal): Renda → [Gastos R$X | Aporte R$Y | IR/INSS R$Z]. Se dados de renda não disponíveis, usar estimativa ou omitir seção. Lib sugerida: Chart.js não suporta Sankey nativamente — usar D3-sankey ou simplificar como stacked bar horizontal (Renda dividida em fatias).
21. **Tabela posições** (var semanal se disponível; colunas PM e VarSem com classe `hide-mobile`)
22. **Calculadora de aporte** (JS interativa). **Cascade obrigatório** — ler pisos e alvos de `scripts/portfolio_analytics.py` e `scripts/checkin_mensal.py`. Lógica: (1º) IPCA+ longo se taxa ≥ piso E gap > 0; (2º) Renda+ se taxa ≥ piso E gap > 0; (3º) Equity → bucket mais subpeso.
23. **Shadows** (**incluir Shadow C**)
24. **Bollinger Bands sobre retorno mensal** (MA5 ± 2σ de `historico_carteira.csv`)
25. **TLH monitor**
26. **RF + crypto cards**

**Runtime assertions + live fetch** (incluir no JS):
```js
// Staleness banner
if (Date.now() - GENERATED_AT > 7*86400000) {
  document.querySelector('.header').insertAdjacentHTML('beforeend',
    '<div style="background:#ef4444;color:white;padding:6px;border-radius:6px;margin-top:8px;font-size:.8rem">⚠️ Dashboard desatualizado — rodar /dashboard</div>');
}
// Glide path sum check
glideLabels.forEach((_,i) => {
  const sum = Object.values(glideData).reduce((s,d) => s+d[i], 0);
  console.assert(Math.abs(sum-100) < 0.5, `Glide path ano ${i}: soma ${sum}% ≠ 100%`);
});

// Live fetch: câmbio + PTAX via BCB Olinda (CORS público)
// Preços ETFs e HODL11 NÃO têm API CORS — ficam como placeholders no DATA
async function fetchLive() {
  try {
    // Câmbio PTAX do dia
    const hoje = new Date().toISOString().slice(0,10).replace(/-/g,"'");
    const r = await fetch(`https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@d)?@d='${new Date().toISOString().slice(0,10)}'&$format=json`);
    if (r.ok) {
      const j = await r.json();
      if (j.value?.length) {
        const ptax = j.value[j.value.length-1].cotacaoVenda;
        DATA.cambio = ptax;
        // Atualizar KPI e header com novo câmbio
        document.querySelector('.header .meta').textContent =
          document.querySelector('.header .meta').textContent.replace(/USD\/BRL [\d.]+/, 'USD/BRL ' + ptax.toFixed(3));
      }
    }
  } catch(e) { console.log('BCB fetch failed, using placeholder'); }
}
fetchLive();
```

**Filosofia: dashboard_state.json + live fetch.**
- Scripts Python (`ibkr_sync`, `checkin_mensal`, `fire_montecarlo`) atualizam `dados/dashboard_state.json` quando rodam (0 tokens Claude).
- HTML faz `fetch('dashboard_state.json')` ao abrir — se encontrar, usa dados frescos.
- Se fetch falhar (offline, CORS), usa o `DATA` inline como fallback.
- BCB PTAX busca ao vivo via `fetchPTAX()` (API pública, CORS ok).
- **Resultado: dashboard atualiza sem rodar `/dashboard`.** `/dashboard` só para mudanças estruturais (nova seção, novo chart).

**Atualização automática via scripts Python:**
```python
# Em qualquer script, após computar dados:
from config import update_dashboard_state
update_dashboard_state("posicoes", {...}, generator="ibkr_sync.py")
update_dashboard_state("fire", {...}, generator="fire_montecarlo.py")
update_dashboard_state("shadows", {...}, generator="checkin_mensal.py")
```
- Cada script atualiza SUA seção sem sobrescrever as outras.
- `dados/dashboard_state.json` também copiado para `analysis/dashboard_state.json` (mesmo dir do HTML).

**Runtime no HTML:**
```js
loadDashboardState()  // fetch JSON, merge com DATA inline
  .then(() => fetchPTAX())  // buscar câmbio ao vivo do BCB
```

Não commitar — Diego decide.

### 5. Deploy Netlify

Após gerar o HTML, publicar automaticamente:

```bash
bash scripts/deploy_netlify.sh
```

Token em `.netlify_token` (gitignored). Site: `stunning-crepe-8aa19f`.

### 6. Output

```
Dashboard regenerado: analysis/dashboard.html
Data: DD/MM/AAAA | Patrimônio: R$ X.XXXk | Equity: $XXXk | Câmbio: R$ X.XX
P(FIRE): XX.X% | Cresc. patrimonial: XX.X% (inclui aportes) | Delta A: +X.Xpp
✅ Publicado: https://stunning-crepe-8aa19f.netlify.app (senha: diego2040)
```

## Toggle de Privacidade

Ícone de olho no header (direita). Dois estados:

**Olho aberto 👁 (padrão):** mostra tudo — R$, USD, cotas, patrimônio.

**Olho fechado 👁‍🗨:** oculta valores absolutos, mantém percentuais e estrutura.

Implementação obrigatória:
```css
.private-mode .pv { visibility: hidden; }  /* não display:none — mantém layout */
.privacy-toggle { cursor: pointer; font-size: 1.3rem; opacity: 0.7; }
.privacy-toggle:hover { opacity: 1; }
```

```js
// No header, botão toggle
<span class="privacy-toggle" onclick="togglePrivacy()" id="privacyBtn">👁</span>

function togglePrivacy() {
  document.body.classList.toggle('private-mode');
  const on = document.body.classList.contains('private-mode');
  document.getElementById('privacyBtn').textContent = on ? '👁‍🗨' : '👁';
  localStorage.setItem('dashboard_private', on ? '1' : '0');
}
// Restaurar preferência
if (localStorage.getItem('dashboard_private') === '1') {
  document.body.classList.add('private-mode');
  document.getElementById('privacyBtn').textContent = '👁‍🗨';
}
```

**O que recebe classe `pv` (ocultar no modo privado):**
- Patrimônio total (R$, USD) nos KPIs
- Valores absolutos nas tabelas (R$, USD, cotas)
- Eixo Y do timeline e fan chart (valores R$)
- Cards RF (R$ valor)
- Calculadora resultado (R$, cotas)
- Wellness Score sub-métricas com valores absolutos

**O que permanece visível (sempre):**
- Percentuais: P(FIRE), ganho%, delta%, SWR%, progresso%, savings rate%
- Charts estruturais: donut (%), delta bar (pp), glide path (%), Bollinger (%)
- Wellness Score nota (0-100)
- Labels e títulos das seções
- Cenário comparison (% e anos, sem R$)

**Persistir no `localStorage`** para lembrar entre sessões.

## Regras

- **O dashboard é OUTPUT gerado — nunca editar o HTML diretamente.** Correções e melhorias vão nesta skill. O HTML é sobrescrito a cada `/dashboard`.
- **Commits: skill + HTML sempre juntos.** Se alterar a skill, regenerar e commitar ambos no mesmo commit.
- **Crescimento patrimonial ≠ retorno de investimento.** NUNCA apresentar como "CAGR" ou "retorno" sem disclaimer "(inclui aportes)". Valor do aporte: `PREMISSAS["aporte_mensal"] * 12`. TWR estimado separado.
- **Dados do DATA object, não inline.** Cada valor aparece 1 vez no JS. HTML referencia via Chart.js ou `textContent`. CAGR no DATA deve ser igual ao KPI exibido.
- **doughnutOpts() helper.** Configs de doughnut chart extraídas em função reutilizável.
- **Bollinger = MA5 ± 2σ.** Não MA20.
- **Glide path soma 100% em cada ano.** Pós-FIRE = rising equity conforme tabela em `agentes/contexto/carteira.md`. Assertion no JS.
- **Shadow C obrigatório.** Pesos de `agentes/metricas/shadow-portfolio.md`.
- **IPCA+ longo no delta bar.** Alvo de `checkin_mensal.py PESOS_TARGET["IPCA"]`.
- **Staleness banner.** Se HTML > 7 dias, mostrar alerta vermelho no header.
- **Progresso FIRE** = `patrimonio_total / PREMISSAS["patrimonio_gatilho"]`. Computar, não hardcodar.
- **Sem HTML duplicado.** O arquivo final deve ter 1 `<html>`, 1 `<script>`, 1 `<footer>`. Validar antes de salvar.
- **DATA.date = data real da geração.** Usar `date.today()` no header e no JS. Devem ser iguais.
- **Zero valores hardcoded.** Todos os valores, regras, pisos, alvos e gatilhos devem vir de arquivos do codebase (scripts .py, agentes/*.md, dados/*.csv). A skill define ONDE buscar, não OS VALORES.

## Referência: Onde Buscar Cada Dado

**Regra: a skill define ONDE buscar, não OS VALORES.**

| Dado | Fonte (codebase) | Nunca hardcodar |
|------|------------------|-----------------|
| Posições (qtde, custo) | `analysis/backtest_output/ibkr_lotes.json` | |
| Pesos target | `scripts/checkin_mensal.py` → `PESOS_TARGET` | |
| Buckets (transitórios) | `scripts/ibkr_sync.py` → `BUCKET_MAP` | |
| Pisos cascade (IPCA+, Renda+) | `scripts/portfolio_analytics.py` → `PISO_TAXA_*`, `ALVO_*_PCT` | |
| P(FIRE) cenários | `agentes/metricas/scorecard.md` → seção 1.1 | |
| Shadows (retornos, deltas) | `agentes/metricas/scorecard.md` → seção 1.2 | |
| Gatilho FIRE (R$, SWR) | `scripts/fire_montecarlo.py` → `PREMISSAS["patrimonio_gatilho"]`, `PREMISSAS["swr_gatilho"]` | |
| Custo de vida base | `scripts/fire_montecarlo.py` → `PREMISSAS["custo_vida_base"]` | |
| Aporte mensal | `scripts/fire_montecarlo.py` → `PREMISSAS["aporte_mensal"]` | |
| Idade atual / FIRE alvo | `scripts/fire_montecarlo.py` → `PREMISSAS["idade_atual"]`, `PREMISSAS["idade_fire_alvo"]` | |
| Equity % | `scripts/fire_montecarlo.py` → `PREMISSAS["pct_equity"]` | |
| Guardrails (DD/cortes) | `scripts/fire_montecarlo.py` → `GUARDRAILS`, `GASTO_PISO` | |
| Glide path pós-FIRE | `agentes/contexto/carteira.md` → tabela alocação por idade | |
| Drift threshold | `agentes/contexto/gatilhos.md` | |
| RF (IPCA+, Renda+, HODL11) | `dados/holdings.md` | |
| Timeline patrimônio | `dados/historico_carteira.csv` | |
| Preços ETFs | WebSearch (placeholder no DATA se offline) | |
| Câmbio | WebSearch + BCB Olinda live fetch | |
| Geo breakdown | Computar: MSCI World ~67% US (nota: premissa, documentar) | |

| Seção visual | Chart type |
|-------------|-----------|
| Attribution | Stacked bar horizontal (computar via `fx_utils.py`) |
| Spending | Tabela + progress bar |
| Fan chart | Line + fill between P10-P90 |
| Guardrails | Tabela colorida (verde→vermelho) |
| Geo | Doughnut |
| Bollinger | Line MA5±2σ sobre retorno mensal |
| Mobile | `@media(max-width:480px)` + `.hide-mobile` em PM/VarSem |
