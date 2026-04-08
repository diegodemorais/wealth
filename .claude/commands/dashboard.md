# Dashboard — Gerar HTML da Carteira

Regenera `analysis/dashboard.html` — dashboard single-file com Chart.js, dark theme, responsivo.

## Fluxo

### 0. Pré-computação (rodar antes de gerar HTML)

Rodar em paralelo — os outputs alimentam as seções que dependem deles:

```bash
# Tornado real — OBRIGATÓRIO rodar com --anos 11 --tornado (não só --tornado)
~/claude/finance-tools/.venv/bin/python3 scripts/fire_montecarlo.py --anos 11 --tornado

# P(FIRE@50) atualizado com modelo atual
~/claude/finance-tools/.venv/bin/python3 scripts/fire_montecarlo.py --anos 11

# Backtest 20 anos Target vs Shadows
~/claude/finance-tools/.venv/bin/python3 scripts/backtest_portfolio.py

# Attribution Aportes/Retorno/Câmbio
~/claude/finance-tools/.venv/bin/python3 scripts/fx_utils.py
```

Extrair dos outputs:
- `--anos 11 --tornado`: sensibilidades reais por variável (pp de P(FIRE) por ±10% de cada input). Parsear CADA linha do output — nunca reusar valores de rodada anterior.
- `--anos 11`: P(FIRE@50) base/fav/stress. Parsear valores diretamente do output.
- `backtest_portfolio.py`: séries de retorno acumulado por carteira + métricas (CAGR USD e BRL, Sharpe, Sortino, MaxDD, Vol). Parsear do output — não usar valores pré-calculados em memória.
- `fx_utils.py`: decomposição Aportes + Retorno USD + Câmbio (deve somar ao crescimento real)

**REGRA ABSOLUTA**: Cada valor no objeto `DATA` do JS deve ter um comentário inline com a fonte exata — ex: `// fire_montecarlo.py --anos 11 linha "P(FIRE) base"`. Se não souber a fonte, o valor não entra. Se algum script falhar, marcar a seção como "⚠️ Estimativa — rodar [script]" em vez de inventar valores.

### 1. Codebase (ler em paralelo)

| Arquivo | Dados |
|---------|-------|
| `analysis/backtest_output/ibkr_lotes.json` | Qtde e custo base por ETF |
| `dados/historico_carteira.csv` | **Série completa** patrimônio mensal — usar TODAS as linhas |
| `agentes/metricas/scorecard.md` | P(FIRE), shadows, TER, tornado, deltas |
| `dados/holdings.md` | RF (IPCA+ 2029/2040, Renda+ 2065) e crypto (HODL11 qtde) |
| `scripts/fire_montecarlo.py` | PREMISSAS dict, GUARDRAILS list, GASTO_PISO |
| `agentes/contexto/carteira.md` | Tabela glide path por idade (pré e pós-FIRE), sensibilidade spending |
| `agentes/contexto/gatilhos.md` | Drift thresholds, gatilhos ativos |
| `scripts/checkin_mensal.py` | PESOS_TARGET (pesos alvo por bucket) |
| `scripts/ibkr_sync.py` | BUCKET_MAP (mapeamento ETF → bucket) |
| `scripts/portfolio_analytics.py` | PISO_TAXA_IPCA, PISO_TAXA_RENDA, ALVO_IPCA_PCT, ALVO_RENDA_PCT |

### 2. Web (3 buscas, não 5)

| Busca | Dados |
|-------|-------|
| `"SWRD.L AVGS.L AVEM.L AVUV AVDV EIMI.L AVES DGS USSC price today"` | Preços ETFs + câmbio |
| `"HODL11 cotação hoje"` + `"USD BRL câmbio hoje"` | HODL11 + câmbio |
| `"USD BRL historical weekly 2026"` | PTAX últimas semanas |

Se WebSearch falhar para algum preço, ler `analysis/dashboard.html` atual e extrair o valor anterior.

### 3. Computar

**Posições**: para cada ETF do lotes.json: `valor_usd = qty × preço_atual`, `ganho% = preço / avg_cost - 1`

**Buckets, targets, geo**: ler de `BUCKET_MAP` e `PESOS_TARGET` (não hardcodar).

**Timeline**: extrair TODAS as linhas do CSV → arrays `timelineLabels` e `timelineValues` espelhando o CSV exatamente. Não reconstruir independentemente. Para split histórico equity/RF/crypto: usar proporção atual para o último ponto e interpolar retroativamente com base nos registros disponíveis — documentar no tooltip que é estimativa para pontos históricos.

**Retornos mensais para Bollinger**:
- Iterar as linhas do CSV em ordem cronológica
- Calcular retorno apenas entre pares de datas consecutivas com gap ≤ 35 dias (meses completos)
- `ret[i] = (pat[i] / pat[i-1]) - 1` em percentual
- Não incluir períodos parciais (ex: se 2026-03 é 2026-03-20, o retorno desde 2025-12-31 não é mensal — excluir ou anotar)
- Resultado: array de retornos mensais limpos, um por mês completo

**Guardrails**: ler `GUARDRAILS` e `GASTO_PISO` de `fire_montecarlo.py` diretamente. Nunca recalcular nem hardcodar. O piso absoluto (`GASTO_PISO`) tem prioridade sobre qualquer cálculo percentual.

**Attribution**: usar output de `fx_utils.py`. Verificar que Aportes + Retorno USD + Câmbio = crescimento patrimonial real (±2%). Se não fechar, marcar como estimativa e mostrar o gap.

**P(FIRE@50)**: usar output de `fire_montecarlo.py --anos 11`. Não usar valor de FR-spending-smile (obsoleto).

**Tornado**: usar output de `fire_montecarlo.py --tornado`. Não estimar manualmente.

**Backtest**: usar output de `backtest_portfolio.py` — séries de retorno acumulado e métricas por carteira.

### 4. Gerar HTML

**Sobrescrever** `analysis/dashboard.html` com render completo. Estrutura obrigatória do JS:

```js
// TODOS os valores lidos dos arquivos — zero hardcoded
const DATA = {
  date: '...',          // date.today()
  cambio: ...,          // WebSearch
  totalBrl: ...,        // computar
  totalEquityUsd: ...,  // computar
  pfire: {base:..., fav:..., stress:...},  // scorecard.md
  premissas: {          // fire_montecarlo.py PREMISSAS dict
    patrimonio_gatilho: ...,
    custo_vida_base: ...,
    aporte_mensal: ...,
    idade_atual: ...,
    idade_fire_alvo: ...,
    swr_gatilho: ...,
    inss_anual: ...,
    inss_inicio_ano: ...,
  },
  guardrails: [...],    // fire_montecarlo.py GUARDRAILS list
  gasto_piso: ...,      // fire_montecarlo.py GASTO_PISO
  // ...
};
const GENERATED_AT = new Date('YYYY-MM-DDTHH:MM:SS-03:00'); // BRT (UTC-3) — preencher com datetime exato da geração
```

**Seletor de período — componente reutilizável**:

Implementar uma função `periodSelector(containerId, chartInstance, allLabels, allDatasets)` que:
1. Renderiza botões `[1m | 3m | ytd | 1y | 3y | 5y | all]` acima do canvas
2. Ao clicar, filtra `allLabels`/`allDatasets` para o período e chama `chart.update()`
3. Default: `all`
4. Estado ativo visualmente destacado (borda ou fundo)
5. `1m` = último mês, `ytd` = desde 01/01 do ano atual, `all` = todos os pontos

**Nota sobre granularidade**: dados em `historico_carteira.csv` são mensais. `1m` mostrará 1-2 pontos apenas. Isso é correto — não inventar dados diários. Se o filtro resultar em ≤ 2 pontos, mostrar tooltip "poucos dados para este período".

## Princípios de Design

- **Auto-explicativo**: zero identificadores internos visíveis. Nenhum "R3", "Regime 3", "backtest_portfolio.py", "scorecard.md", "S1", etc. Cada label deve fazer sentido para alguém que não conhece o codebase.
- **Períodos em vez de nomes**: sempre mostrar o intervalo de datas (ex: "ago/2019–abr/2026") em vez de nomes de regime.
- **Separação temporal**: seções de curto prazo (≤1 ano, operacional) visualmente distintas de longo prazo (FIRE, estratégico). Usar badge `[OPERACIONAL]` amarelo e `[ESTRATÉGICO]` azul nos títulos das seções.
- **Period selectors com dados mensais**: mínimo útil = 6 meses. Remover `1m` e `3m` de qualquer selector. Se período filtrado resultar em < 4 pontos, exibir mensagem "Poucos dados para este período" em vez do chart.
- **Benchmarks**: VWRA = "VWRA (mercado puro)", Shadow B = "IPCA+ longo (RF puro)", Shadow C = "VWRA + RF (60/40)". Nunca "Shadow A/B/C" em texto visível.

## Ordem das seções

```
BLOCO 1 — STATUS ATUAL (onde estou)
  1.  KPI cards principais
  2.  Time to FIRE + ritmo atual
  3.  Alocação atual (donuts)
  4.  Glide path (hoje → FIRE Day)        ← adjacente à alocação atual

BLOCO 2 — AÇÕES (o que fazer agora)
  5.  Próximas Ações + cascade com valores R$
  6.  Calculadora de aporte
  7.  Delta bar + drift

BLOCO 3 — PROJEÇÃO FIRE (onde vou chegar)
  8.  Time to FIRE cenários (FIRE@50 vs FIRE@53)
  9.  P(FIRE) + tornado + spending
  10. Fan chart
  11. Guardrails
  12. Retirement Income Breakdown
  13. FIRE buckets donut

BLOCO 4 — PERFORMANCE (como está indo)
  14. Net worth timeline
  15. Performance Attribution
  16. CAGR Backtest Target (USD/BRL)
  17. Bollinger Bands
  18. Backtest histórico Target vs VWRA
  19. Benchmarks (VWRA / IPCA+ / 60-40)

BLOCO 5 — ANÁLISE & GOVERNANÇA (deep dive)
  20. KPI FIRE (progresso, savings rate)
  21. Tabela posições
  22. TLH monitor + % transitórios
  23. RF + crypto cards
  24. Riscos estruturais monitorados
  25. What-if cenários (3 sliders unificados)
  26. Fee Analysis (colapsável)
  27. Financial Wellness Score (colapsável)
```

## Especificação de cada seção

**1. KPI cards**
- Patrimônio total (R$) — maior card
- P(FIRE) base — destaque máximo, cor semáforo
- CAGR Backtest Target (USD) — com subtexto: "[data início]–[data fim] · proxies UCITS · ≠ retorno real"
- Delta vs VWRA — período explícito (ex: "Q1 2026")

**2. Time to FIRE + ritmo atual**
- Countdown (X anos Y meses até FIRE@53)
- Barra de progresso patrimonial (escala log, com label "(escala logarítmica)")
- **Ritmo atual**: "Ao ritmo de R$Xk/mês + retorno histórico, chegaria em [ano]. [N meses] à frente/atrás do plano base." Calcular: projeção determinística simples `pat × (1+r)^t + aporte × ((1+r)^t-1)/r` resolvendo para t até atingir gatilho.

**3. Alocação atual (donuts)**
- Donut alocação por bucket (equity/RF/crypto)
- Donut geográfico (equity only)
- Nota abaixo: "Exposição total ao Brasil (incl. capital humano, imóvel, INSS, RF soberano): ~58.5% do patrimônio ampliado"

**4. Glide path** (adjacente à seção 3)
- Stacked bar 100% por idade/ano
- Ler tabela de `carteira.md`
- Soma = 100% em cada barra

**5. Próximas Ações**
- Background amarelo
- **Cascade com valores R$**: para aporte padrão de `aporte_mensal` de PREMISSAS, mostrar quanto vai para cada destino. Ex: "IPCA+ longo (janela ativa, 7.2% > 6.0%): R$5.000 → TD 2040 (80%) + TD 2050 (20%)" ou "Equity (janela RF inativa): R$25.000 → SWRD/AVGS/AVEM ao mais subpeso"
- Cascade ler de `otimizador_aporte` em `portfolio_analytics.py`: IPCA+ #1 (>=6.0%), Renda+ #2 (>=6.5%), equity default
- Gatilhos ativos de `gatilhos.md`
- Drift alerts

**6. Calculadora de aporte**
- Cascade dinâmico com slider de valor
- Ler pisos de `portfolio_analytics.py`

**7. Delta bar + drift**
- Drift por bucket vs target
- IPCA+ gap vs alvo (ler `ALVO_IPCA_PCT`)

**8. Scenario Comparison FIRE@50 vs FIRE@53**
- P(FIRE@50) do output de `--anos 11`
- P(FIRE) não deve se repetir em outras seções — apenas aqui e nos KPI cards

**9. P(FIRE) + tornado + spending**
- P(FIRE) 3 cenários
- Tornado de `--anos 11 --tornado`
- Spending scenarios de `carteira.md`

**10. Fan chart P10/P50/P90**
- Interpolação exponencial com r=`retorno_equity_base`
- Tooltip: "Trajetórias interpoladas com crescimento exponencial — não são simulações MC individuais"
- Linha vertical em 2037 (FIRE@50 aspiracional)

**11. Guardrails visuais**
- Ler `GUARDRAILS` e `GASTO_PISO` de `fire_montecarlo.py`
- Coluna "Patrimônio gatilho" = `patrimônio_atual × (1 - drawdown_threshold)`

**12. Retirement Income Breakdown**
- Por fase: anos 1-7 (bond pool), 8-12 (equity), 12+ (equity+INSS)
- Spending smile de `carteira.md`

**13. FIRE buckets donut**

**14. Net worth timeline**
- Stacked area: Equity + RF + Crypto
- **Period selector [6m | ytd | 1y | 3y | 5y | all]** (remover 1m e 3m)
- Dados de `historico_carteira.csv` — espelhar CSV linha a linha

**15. Performance Attribution**
- Output de `fx_utils.py`
- Adicionar linha secundária: "Crescimento patrimonial acumulado (inclui aportes): X%/ano" com tooltip explicando que inclui capital novo

**16. CAGR Backtest Target**
- Card com CAGR USD e BRL
- Subtexto: "[data_inicio]–[data_fim] · proxies UCITS · ≠ retorno real do portfolio"
- Período calculado dinamicamente das datas do backtest, não hardcoded
- Câmbio início = câmbio na data de início do backtest R3 (~R$3.79 em jul/2019)

**17. Bollinger Bands**
- **Period selector [6m | ytd | 1y | 3y | 5y | all]** (remover 3m)
- Default: `1y`
- Sigma populacional, MA5, primeiros 4 pontos omitidos

**18. Backtest histórico Target vs VWRA**
- **Period selector por ciclo**: `[Tudo (21a) | Desde 2009 (pós-crise) | Desde 2013 (pós-QE) | Desde 2020 (pós-COVID) | 5a | 3a]`
- Default: "Desde 2009" (ciclo completo moderno)
- Tooltip de cada botão mostra o intervalo exato de datas
- Tabela de métricas recomputa para o subperíodo
- Benchmark labels: "Target (50/30/20)", "VWRA (mercado puro)", "VWRA + RF (60/40)"

**19. Benchmarks (VWRA / IPCA+ / 60-40)**
- Retornos, deltas, tracking de `scorecard.md`
- Labels: "VWRA (mercado puro)", "IPCA+ longo (RF puro)", "VWRA + RF (60/40)"

**20. KPI FIRE**
- Progresso % (1 casa decimal)
- Savings rate
- SWR no FIRE Day projetada (não SWR hoje)
- Tracking Difference estimado: ~0.10% com tooltip "TER é o custo cobrado; TD é o custo real incluindo operacional e empréstimo de ações"

**21. Tabela posições**

**22. TLH monitor**
- Adicionar linha: "Total em ativos transitórios: R$Xk (Y% do portfolio) — diluição ao ritmo de R$25k/mês ≈ Z meses"

**23. RF + crypto cards**

**24. Riscos estruturais monitorados** (seção nova)
- Compliance UCITS: "Novos aportes obrigatoriamente em UCITS (evitar US-listed — estate tax)"
- US-listed remanescentes: valor atual + estate tax estimado
- Risco legislativo: "Lei 14.754/2023 (tributação 15% flat sobre ganhos nominais) — mudança afetaria todas as projeções"
- SoRR 2034: "A partir de 2034 (Diego 47 anos): monitorar sequence-of-returns risk. Considerar IPCA+ curto 3% como buffer pré-FIRE."

**25. What-if cenários** (sliders unificados — ex-S18+S19)
- Consolidar "Monthly Contribution Needed" e "What-if Scenarios" em uma única seção
- 3 sliders: aporte, retorno equity, custo vida
- Output: anos até FIRE + P(FIRE) aproximado

**26. Fee Analysis** (colapsável por default)
- TER × anos × patrimônio
- Comparar carteira vs VWRA vs 60/40

**27. Financial Wellness Score** (colapsável por default)
- Nota 0-100 com breakdown
- Não replicar P(FIRE) — já está nos KPI cards

    | Métrica | Target | Shadow A | Shadow C |
    |---------|--------|----------|----------|
    | CAGR | % | % | % |
    | Sharpe | | | |
    | Sortino | | | |
    | Max Drawdown | % | % | % |
    | Volatilidade | % | % | % |
    | Calmar | | | |

    Ao mudar período no selector, tanto o chart quanto a tabela de métricas atualizam (métricas do subperíodo selecionado).

**Runtime assertions + live fetch**:
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
// Attribution closure check
const attrSum = DATA.attribution.aportes + DATA.attribution.retornoUsd + DATA.attribution.cambio;
const crescReal = DATA.totalBrl - DATA.totalBrlInicio;
console.assert(Math.abs(attrSum - crescReal) / crescReal < 0.05,
  `Attribution não fecha: ${attrSum} vs ${crescReal}`);

// Privacy toggle — apenas 1 implementação (no final do body, não no head)
function togglePrivacy() {
  document.body.classList.toggle('private-mode');
  const on = document.body.classList.contains('private-mode');
  document.getElementById('privacyBtn').textContent = on ? '👁‍🗨' : '👁';
  localStorage.setItem('dashboard_private', on ? '1' : '0');
}
if (localStorage.getItem('dashboard_private') === '1') {
  document.body.classList.add('private-mode');
  document.getElementById('privacyBtn').textContent = '👁‍🗨';
}

// Live fetch PTAX (BCB Olinda — CORS ok)
async function fetchLive() {
  try {
    const r = await fetch(`https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@d)?@d='${new Date().toISOString().slice(0,10)}'&$format=json`);
    if (r.ok) {
      const j = await r.json();
      if (j.value?.length) {
        DATA.cambio = j.value[j.value.length-1].cotacaoVenda;
        document.querySelector('.header .meta').textContent =
          document.querySelector('.header .meta').textContent.replace(/USD\/BRL [\d.]+/, 'USD/BRL ' + DATA.cambio.toFixed(3));
      }
    }
  } catch(e) {}
}
fetchLive();
```

### 5. Validação anti-hardcode (OBRIGATÓRIA antes de salvar)

Antes de gravar o HTML final, executar este checklist. Se algum item falhar, corrigir antes de prosseguir:

```
CHECKLIST — Zero Hardcoded Values

[ ] P(FIRE) base/fav/stress → veio do output de `fire_montecarlo.py --anos 11` (não de scorecard.md estático)
[ ] Tornado (4 variáveis × 2 direções = 8 valores) → veio do output de `fire_montecarlo.py --anos 11 --tornado`
[ ] GASTO_PISO → veio de `fire_montecarlo.py` (leitura do arquivo Python, não estimado)
[ ] GUARDRAILS list → veio de `fire_montecarlo.py` (leitura do arquivo Python)
[ ] Patrimônio/posições → calculado de preços yfinance × qtde de ibkr_lotes.json
[ ] Backtest CAGR/Sharpe/MaxDD → calculado dinamicamente de séries retornadas por `backtest_portfolio.py`
[ ] TWR USD → CAGR do Target em USD de `backtest_portfolio.py --regime 3`
[ ] Tornado não reutiliza valores de sessão anterior (rodar script fresh)
[ ] drift.IPCA soma TODOS os títulos IPCA+ de holdings.md (2029 + 2040 + outros)
[ ] CAGR "com aportes" aparece SOMENTE em Attribution, nunca nos KPI cards principais
[ ] Progresso FIRE exibe 1 casa decimal (ex: 25.2%, não 25.17%)
[ ] Gatilhos: Equity listado antes de IPCA+ na seção Próximas Ações
[ ] Wellness Score: card menor/abaixo de P(FIRE) no layout
[ ] Cada valor em DATA{} tem comentário inline com fonte (arquivo + linha ou flag de script)
```

Se algum valor não puder ser obtido dos scripts (ex: script falhou), o campo deve exibir "⚠️ [fonte] indisponível — rodar /dashboard novamente" — nunca um número inventado.

Não commitar — Diego decide.

### 5. Deploy Netlify

```bash
bash scripts/deploy_netlify.sh
```

Token em `.netlify_token`. Site: `stunning-crepe-8aa19f`.

### 6. Output

```
Dashboard regenerado: analysis/dashboard.html
Data: DD/MM/AAAA | Patrimônio: R$ X.XXXk | Equity: $XXXk | Câmbio: R$ X.XX
P(FIRE): XX.X% | Cresc. patrimonial: XX.X% (inclui aportes) | Delta A: +X.Xpp
✅ Publicado: https://stunning-crepe-8aa19f.netlify.app (senha: diego2040)
```

## Toggle de Privacidade

Ícone de olho no header (direita). **Implementar apenas 1 vez** — no `<script>` no final do `<body>`, não no `<head>`.

```css
.private-mode .pv { visibility: hidden; }
.privacy-toggle { cursor: pointer; font-size: 1.3rem; opacity: 0.7; }
.privacy-toggle:hover { opacity: 1; }
```

**Ocultar (classe `pv`):** patrimônio R$/USD nos KPIs, valores absolutos nas tabelas, eixo Y do timeline e fan chart, cards RF, resultado da calculadora, sub-métricas do Wellness com valores absolutos.

**Sempre visível:** percentuais (P(FIRE), ganho%, delta%, progresso%), charts estruturais (donut, delta bar, glide path, Bollinger), Wellness Score 0-100, labels e títulos.

## Regras

- **O dashboard é OUTPUT — nunca editar o HTML diretamente.** Correções vão nesta skill. O HTML é sobrescrito a cada `/dashboard`.
- **Zero valores hardcoded.** Todos os valores (guardrails, premissas, pesos, pisos, taxas, percentuais) vêm de arquivos do codebase. Se o arquivo mudar, o dashboard reflete automaticamente.
- **Dados do DATA object, não inline.** Cada valor aparece 1x no JS.
- **Timeline = espelho do CSV.** Nunca reconstruir a série de patrimônio independentemente do CSV.
- **Bollinger = apenas meses completos.** Períodos parciais são excluídos da série.
- **Guardrails = GUARDRAILS + GASTO_PISO do fire_montecarlo.py.** O piso absoluto tem prioridade sobre cálculo percentual.
- **Tornado = output de `--tornado`.** Nunca estimativa manual.
- **P(FIRE@50) = output de `--anos 11`.** Nunca valor de modelo antigo.
- **Attribution deve fechar.** Soma dos componentes ≈ crescimento real (±5%). Mostrar gap explicitamente se não fechar.
- **Crypto no glide path = ler tabela de carteira.md.** Não assumir 0% pós-FIRE.
- **Wellness Score = calculado em JS** com os pesos da tabela acima. Nunca hardcoded.
- **Privacy toggle = 1 implementação** (fim do body). Não duplicar no head.
- **Sem HTML duplicado.** 1 `<html>`, 1 `<script>` principal, 1 `<footer>`.
- **Glide path soma 100%/ano.** Assertion no JS.
- **Staleness banner** se HTML > 7 dias.
- **DATA.date = data real da geração.**

## Referência: Onde Buscar Cada Dado

| Dado | Fonte | Nunca hardcodar |
|------|-------|-----------------|
| Posições (qtde, custo) | `analysis/backtest_output/ibkr_lotes.json` | |
| Pesos target | `scripts/checkin_mensal.py` → `PESOS_TARGET` | |
| Buckets | `scripts/ibkr_sync.py` → `BUCKET_MAP` | |
| Pisos cascade | `scripts/portfolio_analytics.py` → `PISO_TAXA_*`, `ALVO_*_PCT` | |
| P(FIRE) cenários | `agentes/metricas/scorecard.md` seção 1.1 | |
| P(FIRE@50) atualizado | `fire_montecarlo.py --anos 11` output | |
| Shadows | `agentes/metricas/scorecard.md` seção 1.2 | |
| Gatilho FIRE, SWR, premissas | `scripts/fire_montecarlo.py` → `PREMISSAS` dict | |
| Guardrails, piso absoluto | `scripts/fire_montecarlo.py` → `GUARDRAILS`, `GASTO_PISO` | |
| Tornado sensibilidades | `fire_montecarlo.py --tornado` output | |
| Glide path por idade | `agentes/contexto/carteira.md` tabela de alocação | |
| Spending smile fases | `agentes/contexto/carteira.md` seção spending | |
| Sensibilidade spending | `agentes/contexto/carteira.md` tabela sensibilidade | |
| Drift threshold | `agentes/contexto/gatilhos.md` | |
| RF (IPCA+, Renda+, HODL11) | `dados/holdings.md` | |
| Timeline patrimônio | `dados/historico_carteira.csv` (todas as linhas) | |
| Retornos mensais (Bollinger) | Calcular de `historico_carteira.csv` (pares consecutivos ≤35d) | |
| Attribution | `scripts/fx_utils.py decompose_return()` output | |
| Backtest séries + métricas | `scripts/backtest_portfolio.py` output | |
| Preços ETFs | WebSearch | |
| Câmbio | WebSearch + BCB Olinda live | |
| Geo breakdown | Computar: SWRD×67%US + AVUV/USSC×100%US + AVDV×100%DM (documentar premissa) | |

| Seção | Chart type |
|-------|-----------|
| Timeline patrimônio | Stacked area + period selector |
| Attribution | Stacked bar horizontal |
| Fan chart | Line + fill P10-P90 |
| Guardrails | Tabela colorida verde→vermelho |
| Geo | Doughnut |
| Bollinger | Line MA5±2σ + period selector |
| Backtest | Line multi-série + period selector + métricas table |
| Mobile | `@media(max-width:480px)` + `.hide-mobile` |
