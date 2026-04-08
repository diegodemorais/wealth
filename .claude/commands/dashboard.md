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
const GENERATED_AT = new Date('...');
```

**Seletor de período — componente reutilizável**:

Implementar uma função `periodSelector(containerId, chartInstance, allLabels, allDatasets)` que:
1. Renderiza botões `[1m | 3m | ytd | 1y | 3y | 5y | all]` acima do canvas
2. Ao clicar, filtra `allLabels`/`allDatasets` para o período e chama `chart.update()`
3. Default: `all`
4. Estado ativo visualmente destacado (borda ou fundo)
5. `1m` = último mês, `ytd` = desde 01/01 do ano atual, `all` = todos os pontos

**Nota sobre granularidade**: dados em `historico_carteira.csv` são mensais. `1m` mostrará 1-2 pontos apenas. Isso é correto — não inventar dados diários. Se o filtro resultar em ≤ 2 pontos, mostrar tooltip "poucos dados para este período".

Seções (todas obrigatórias, nesta ordem):

1. **Próximas Ações** (TOPO): próximo aporte via cascade (pisos de `portfolio_analytics.py`), gatilhos ativos (`gatilhos.md`), drift alerts. Background amarelo.
   - Ordem dos gatilhos: **Equity primeiro** (threshold de patrimônio para mudar alocação equity), **IPCA+ segundo** (meta de alocação RF). Não inverter.

2. **Financial Wellness Score**: nota 0-100 calculada em JS (não hardcoded) com os pesos abaixo. Semáforo: ≥80 verde, 60-79 amarelo, <60 vermelho. **Posicionamento**: card secundário, menor que P(FIRE). Não deve ser o indicador de destaque — P(FIRE) é o KPI principal.

   | Métrica | Peso | Como calcular |
   |---------|------|---------------|
   | P(FIRE) base | 25% | `pfire.base ≥ 90% → 25pts; ≥ 85% → 18pts; ≥ 75% → 10pts; < 75% → 0pts` |
   | Drift máximo | 15% | `max_drift ≤ 5pp → 15pts; ≤ 10pp → 10pts; ≤ 15pp → 5pts; > 15pp → 0pts` |
   | Progresso FIRE | 15% | `(pat/gatilho) × 15` (linear até 100%) |
   | IPCA+ gap vs alvo | 10% | `gap ≤ 2pp → 10pts; ≤ 5pp → 7pts; ≤ 10pp → 3pts; > 10pp → 0pts` |
   | Savings rate | 10% | `aporte_anual/renda_est ≥ 35% → 10pts; ≥ 25% → 7pts; ≥ 15% → 3pts` |
   | TER vs benchmark | 5% | `TER_carteira ≤ TER_shadowA → 5pts; ≤ TER_shadowA + 0.1% → 3pts; else 0` |
   | TLH opps | 5% | `nenhuma oportunidade → 5pts; 1-2 → 3pts; 3+ → 0pts` |
   | Diversificação geo | 5% | `US ≤ 65% → 5pts; ≤ 75% → 3pts; > 75% → 0pts` |
   | Staleness | 5% | `≤ 7 dias → 5pts; ≤ 14 → 3pts; > 14 → 0pts` |
   | Execuções pendentes | 5% | `nenhuma → 5pts; 1 → 3pts; 2+ → 0pts` |

   Mostrar nota total + breakdown das 10 métricas com valores e cores individuais.

3. **KPI cards**: patrimônio total (R$), P(FIRE) base (card mais visualmente proeminente — destaque máximo), TWR real (sem aportes), delta A vs VWRA.
   - **TWR real**: calcular como `(CAGR_USD_backtest_R3)` do output de `backtest_portfolio.py --regime 3`, que representa retorno sem inflação de aportes. Exibir dois números: `TWR USD: X.X%/ano` e `TWR BRL: Y.Y%/ano` (TWR USD + contribuição cambial de `fx_utils.py`). Label obrigatório: "retorno real do investimento (sem aportes)".
   - **CAGR com aportes (18.x%)**: NÃO exibir nos KPI cards principais. Mover para seção 7 (Performance Attribution) como linha secundária com label "Crescimento patrimonial acumulado (inclui capital novo)". Nunca chamar de TWR.

4. **Time to FIRE**: countdown (X anos Y meses) + barra de progresso animada. Sub-cards: FIRE@53 (base, destacado) e FIRE@50 (aspiracional). Não duplicar com KPI "Anos p/ FIRE" — manter apenas aqui.

5. **KPI FIRE**: progresso % (`pat/gatilho`, **1 casa decimal** ex: `25.2%`), savings rate (aporte_anual/renda_est). **Remover SWR implícita hoje** — SWR durante acumulação não é comparável com meta no FIRE Day e gera alarme falso. Substituir por: "SWR no FIRE Day projetada: X%" onde X = `custo_vida_base / patrimonio_gatilho`.

6. **Net worth stacked area** com **period selector [1m | 3m | ytd | 1y | 3y | 5y | all]**:
   - Dados: TODAS as linhas de `historico_carteira.csv` → `timelineLabels`, `timelineValues`
   - Áreas: Equity (azul) + RF (verde) + Crypto (amarelo)
   - Split histórico: usar proporção atual como proxy para pontos sem breakdown — documentar em tooltip
   - O array JS deve espelhar o CSV linha a linha. Não reconstruir valores independentemente.

7. **Performance Attribution** (stacked bar horizontal): output de `fx_utils.py decompose_return()`. Verificar que a soma fecha com o crescimento real. Se não fechar, mostrar barra "Não atribuído" + nota "⚠️ Estimativa — reconciliar com fx_utils.py". Nunca esconder discrepância.

8. **Donut alocação + donut geográfico**. Geo: SWRD × 67% US + AVUV/USSC 100% US + AVDV 100% DM. Documentar premissa MSCI ~67% US no tooltip.

9. **Scenario Comparison** FIRE@50 vs FIRE@53: P(FIRE@50) vem do output de `--anos 11` (não do modelo antigo FR-spending-smile). Marcar FIRE@53 como escolhido. Se `--anos 11` não rodou, mostrar "⚠️ Recalcular".

10. **P(FIRE) + tornado + spending scenarios**:
    - P(FIRE) 3 cenários (ler `scorecard.md`)
    - Tornado: valores de `--tornado`. Se flag não rodou, mostrar placeholder "⚠️ Rodar `--tornado`" — nunca inventar barras
    - Spending scenarios: ler tabela de sensibilidade de `carteira.md` (inclui R$270k = 88.8%, não ~85%)
    - **Remover barra SWR atual** — substituir pela barra de progresso patrimonial (R$X / R$gatilho)

11. **Delta bar** (incluir IPCA+ longo) + progress bars. IPCA+ longo: `alvo_ipca_pct` de `checkin_mensal.py`.

12. **Glide path stacked area**: soma = 100%/ano. Pós-FIRE: ler tabela de alocação por idade de `carteira.md`. **Crypto**: ler valor da tabela (3% pre e pós-FIRE até ~70 anos) — não assumir 0% pós-FIRE.

13. **FIRE buckets donut**

14. **Fan chart P10/P50/P90**: usar pontos de ancoragem do MC (patrimônio atual + mediana em `scorecard.md`). Interpolar com crescimento exponencial (não linear) usando `r = PREMISSAS["retorno_equity_base"]`. Para bandas P10/P90: derivar do spread histórico de P(FIRE) entre cenários. Mostrar tooltip: "Baseado em MC endpoints — trajetórias individuais têm maior volatilidade". Adicionar linha vertical em 2037 (FIRE@50 aspiracional).

15. **Guardrails visuais**: ler `GUARDRAILS` list e `GASTO_PISO` de `fire_montecarlo.py`. Para cada linha: drawdown threshold, corte %, spending efetivo. O spending efetivo para a última linha deve ser `GASTO_PISO` (absoluto), não `custo_vida_base × (1 - corte%)`. Adicionar coluna "Patrimônio gatilho" = `patrimônio_atual × (1 - drawdown_threshold)`.

16. **Retirement Income Breakdown** (pós-FIRE): mostrar por fase temporal, não plano:
    - Anos 1-7 (53-60): bond pool (TD 2040 + IPCA+ curto) — sem tocar equity
    - Anos 8-12 (60-65): saques equity, sem INSS
    - Anos 12+ (65+): saques equity + INSS (`inss_anual` de PREMISSAS)
    - Spending: usar fases do spending smile (go-go/slow-go/no-go) de `carteira.md`, não gasto plano
    - Destacar que anos 1-7 dependem do bond pool existente

17. **Fee Analysis**: `TER_ponderado × patrimonio_medio × anos_ate_fire`. TER de `scorecard.md`. Comparar: carteira atual vs Shadow A (VWRA) vs Shadow C.

18. **Monthly Contribution Needed**: slider aporte → anos até FIRE. Computar dinamicamente.

19. **What-if Scenarios** (3 sliders): aporte, retorno equity, custo vida. Slider retorno: range 0%-10% (incluir cenários negativos/stress), label "retorno real anual". Mostrar "aproximação determinística — P(FIRE) real via MC" como nota.

20. **Sankey / Cash flow mensal**: se dados de renda disponíveis. Caso contrário, omitir seção (não inventar renda).

21. **Tabela posições**: qtde, PM, preço atual, ganho %, valor USD, valor BRL. Colunas PM e VarSem com `.hide-mobile`.

22. **Calculadora de aporte**: cascade obrigatório lendo pisos de `portfolio_analytics.py`.

23. **Shadows** (incluir Shadow C): retornos, deltas, tracking. Dados de `scorecard.md`.

24. **Bollinger Bands com period selector [3m | ytd | 1y | 3y | 5y | all]**:
    - Dados: retornos mensais limpos (ver seção 3 — apenas meses completos consecutivos)
    - Janela MA: 5 períodos
    - Sigma: desvio-padrão populacional (÷N, conforme Bollinger 1992)
    - Não plotar os primeiros 4 pontos (janela < 5 = degenerado): começar a série visual no ponto i=4
    - Default: `1y` (últimos 12 meses com dados)
    - Tooltip em cada ponto: data, retorno%, MA5, upper, lower

25. **TLH monitor**

26. **RF + crypto cards**

27. **Backtest histórico — Target vs Shadows** com **period selector [1y | 3y | 5y | 10y | 20y | all]**:
    - Dados: output de `backtest_portfolio.py` — série temporal de retorno acumulado por carteira
    - Carteiras: Target (50/30/20), Shadow A (VWRA), Shadow C
    - Chart: line chart com 3 séries, eixo Y = retorno acumulado % (base 100 na data inicial do período)
    - Default: `all` (período máximo disponível)
    - Abaixo do chart: tabela de métricas side-by-side

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
