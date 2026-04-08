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
2. **KPI cards**: patrimônio, P(FIRE) (ler `scorecard.md`), **crescimento patrimonial** (NÃO "CAGR" — inclui aportes), delta A (ler `scorecard.md`)
3. **KPI FIRE**: anos p/ FIRE (ler `PREMISSAS["idade_fire_alvo"] - PREMISSAS["idade_atual"]` de `fire_montecarlo.py`), progresso % (`pat / PREMISSAS["patrimonio_gatilho"]`), SWR implícita (`PREMISSAS["custo_vida_base"] / pat`), TWR estimado
4. **Timeline patrimônio** (do CSV, todos os meses sem gaps)
5. **Performance Attribution** (stacked bar): decompor crescimento em Aportes (~R$1.5M) + Retorno USD (~R$700k) + Câmbio (~-R$160k). Ref: `fx_utils.py decompose_return()`
6. **Donut alocação + donut geográfico** (`doughnutOpts()` helper — não repetir config 3x). Geo: EUA ~44% / Dev ex-US ~30% / EM ~26%
7. **P(FIRE) + tornado + spending gauge**: P(FIRE) 3 cenários (ler `scorecard.md`) + tornado (⚠️ Estimativa se manual) + tabela spending scenarios (ler `scorecard.md` tabela P(FIRE) para diferentes custos de vida) + barra SWR atual vs meta (`PREMISSAS["custo_vida_base"] / pat` vs `PREMISSAS["swr_gatilho"]`)
8. **Delta bar** (**incluir IPCA+ longo**) + progress bars (SWRD/AVGS/AVEM/IPCA+)
9. **Glide path stacked area** (soma=100%/ano; pós-FIRE=rising equity conforme tabela de alocação por idade em `agentes/contexto/carteira.md`)
10. **FIRE buckets donut**
11. **Fan chart P10/P50/P90** (projeção patrimônio até FIRE. Gatilho: `PREMISSAS["patrimonio_gatilho"]`. P10/P50/P90: ler `scorecard.md` seção P(FIRE))
12. **Guardrails visuais** (ler `fire_montecarlo.py` → `GUARDRAILS` array + `GASTO_PISO`. Cores verde→vermelho)
13. **Tabela posições** (var semanal se disponível; colunas PM e VarSem com classe `hide-mobile`)
14. **Calculadora de aporte** (JS interativa). **Cascade obrigatório** — ler pisos e alvos de `scripts/portfolio_analytics.py` (`PISO_TAXA_IPCA_LONGO`, `PISO_TAXA_RENDA_PLUS`, `ALVO_IPCA_LONGO_PCT`) e `scripts/checkin_mensal.py` (`PESOS_TARGET`). Lógica: (1º) IPCA+ longo se taxa ≥ piso E gap > 0 → 100% do aporte; (2º) Renda+ se taxa ≥ piso E gap > 0; (3º) Equity → bucket mais subpeso. Mostrar qual etapa do cascade está ativa e por quê. Taxas atuais vêm do WebSearch ou holdings.md.
15. **Shadows** (**incluir Shadow C**: 79% VWRA + IPCA+ + crypto)
16. **Bollinger Bands sobre retorno acumulado** (NÃO sobre câmbio). MA5 ± 2σ aplicado sobre retorno mensal acumulado (TWR proxy) da carteira. Fonte: `historico_carteira.csv` — computar retorno mensal = `pat[i]/pat[i-1] - 1`, acumular. Bollinger identifica meses fora da banda (oportunidade/alerta). Se dados insuficientes (<12 meses), usar retorno do equity (SWRD.L) como proxy.
17. **TLH monitor**
18. **RF + crypto cards**

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

**Filosofia: placeholders + live fetch.**
- `DATA` object contém TODOS os valores (preços ETFs, câmbio, HODL11, PTAX) com os últimos valores conhecidos da execução do `/dashboard`.
- JS tenta buscar câmbio/PTAX ao vivo do BCB Olinda (API pública, CORS ok).
- Se conseguir, atualiza os valores exibidos.
- Se falhar (offline, CORS, etc.), usa placeholders silenciosamente.
- Preços de ETFs (Yahoo) e HODL11 (B3) **não** têm API CORS — ficam fixos nos placeholders. Atualizar via `/dashboard`.

Não commitar — Diego decide.

### 5. Output

```
Dashboard regenerado: analysis/dashboard.html
Data: DD/MM/AAAA | Patrimônio: R$ X.XXXk | Equity: $XXXk | Câmbio: R$ X.XX
P(FIRE): XX.X% | Cresc. patrimonial: XX.X% (inclui aportes) | Delta A: +X.Xpp
```

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
