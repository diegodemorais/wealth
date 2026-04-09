# DEV-privacy-audit — Auditoria Completa de Privacidade do Dashboard

**Dono:** Head (coordena time + DEV implementação)
**Prioridade:** 🔴 Alta
**Criado em:** 2026-04-09
**Status:** Concluída — 2026-04-09 (4 fases implementadas, v1.104)

## Objetivo

Auditoria exaustiva de TUDO que é informação sensível no dashboard — não apenas valores monetários, mas qualquer dado que Diego não queira exposto ao mostrar a tela para terceiros. Inclui:

1. Valores patrimoniais (R$, USD, %)
2. Taxas de retorno e performance
3. P(FIRE) e planos pessoais (ano, idade)
4. Informações de RF (saldos, taxas, vencimentos)
5. Captions, labels, tooltips que revelam dados por contexto
6. Comportamentos de elementos que podem revelar dados mesmo sem valores visíveis (ex: comprimento de barra de progresso, posição de slider)
7. Qualquer texto que, em combinação, permita inferir patrimônio

## Escopo total

- **Todas as abas**: Status, Alocação, Performance, Planejamento, Projeções
- **Todos os tipos de elemento**: cards KPI, charts, tabelas, barras, sliders, tooltips, captions, src/nota lines, labels de eixo, títulos de seção
- **Comportamentos**: sliders (posição revela valor mesmo sem label), barras de progresso (comprimento revela %), gráficos (escala revela magnitude)

## Critério de sensibilidade

Qualquer elemento que permita a um observador próximo inferir:
- Patrimônio total ou parcial
- Renda atual
- Ano/idade de aposentadoria planejada
- Performance da carteira
- Posições específicas e tamanhos

## Time de análise

- **RF**: seções de renda fixa (taxas, saldos, bond pool)
- **FIRE**: seções de projeção (P(FIRE), guardrails, fan chart, simulador)
- **Factor**: seções de equity (posições, performance, backtest)
- **Tax**: IR diferido, estate tax exposure
- **Macro/FX**: câmbio, exposição internacional
- **Behavioral**: elementos que revelam "estado emocional" da carteira (stress/ok/favorável)
- **Advocate**: o que um observador esperto consegue inferir mesmo com proteção parcial
- **DEV**: implementação após consenso do time

## Processo

1. Cada agente mapeia os elementos sensíveis da sua área
2. Debate consenso: o que DEVE e o que PODE ser ocultado
3. DEV implementa: pode ser ocultação (blur/***), substituição por placeholder, alteração de comportamento (slider sem tooltip, barra sem escala), ou combinação

## Output esperado

Mapa completo: elemento → tipo de sensibilidade → proposta de ocultação → consenso (sim/não/parcial)

## Resultado

**Auditoria realizada em 2026-04-09 — RF + FIRE + Factor + Advocate**

---

### Diagnóstico Estrutural (Advocate)

**O privacy toggle atual é teatro de segurança.** O JSON completo está inline no HTML via `__DATA_PLACEHOLDER__`. View Source = acesso total a todos os dados. Nenhum toggle CSS resolve isso.

**Mas:** O dashboard é protegido por senha do Netlify. A proteção real é a senha. O toggle serve para apresentações presenciais (mostrar tela para terceiros sem revelar valores). Para esse caso de uso, o toggle precisa ser mais robusto.

---

### Mapa Completo de Elementos Sensíveis

#### CRÍTICO — Hardcoded no HTML (fora do `pv`)

| Elemento | Texto sensível | Localização |
|----------|---------------|-------------|
| Notas `.src` | `R$45k/mês × 12`, `R$25k`, `R$18k/ano INSS`, `R$1.517/mês hipoteca` | Múltiplas linhas hardcoded |
| Guardrails | `"teto R$350k"` | Hardcoded no HTML |
| Bond Pool meta | `R$ 1.750k` | Revela custo de vida × 7 anos |
| Cascade output | `aporte R$25k (≈ $4.854)` | Header do cascade |

**Defesa:** Envolver em `<span class="pv">` ou calcular dinamicamente.

#### ALTA — Gaps no toggle `pv` (elementos sem classe)

| # | ID/elemento | Dado exposto |
|---|------------|--------------|
| G1 | `#timelineChart` eixo Y | Patrimônio absoluto em R$ (ex: R$1.2M→R$3.4M) |
| G2-G4 | `#attrAportes`, `#attrRetorno`, `#attrCambio` | Attribution em valores absolutos R$ |
| G5 | `#attrChart` (bar chart) | Barras empilhadas em R$ |
| G6 | `#attrCagrVal` | CAGR patrimonial |
| G7 | `#attrGapMsg` | Gap de fechamento R$ |
| G8-G12 | `#fireProgressLabel/Start/End`, `#fireProgLabel`, `#pfirePatLabel` | Patrimônio atual e meta em labels |
| G14-G15 | Custo base: "Valor USD", "Custo USD" | Valores por bucket |
| G18 | `#heroSavingsSub` | "R$25k aporte / R$45k renda" |
| G19 | `#simPatFire` | Patrimônio projetado no FIRE Day |
| G20 | `#stressPatShock` | Patrimônio pós-shock |
| G21-G22 | `#netWorthProjectionChart`, `#netWorthProjectionSrc` | P10/P50/P90 em R$ |
| G24 | `#sankeyChart` | Sankey com valores absolutos |
| G25 | `#spendingBreakdownBody` valores | Gastos absolutos por categoria |
| G26-G27 | Tax IR: ganho BRL, IR estimado, total header | Valores tributários |
| G28-G29 | Bond Pool composição | Valores por título RF |
| G30 | `#hodl11Val`, `#hodl11Sub` | Valor e quantidade HODL11 |
| G31 | `#swrFireDaySub` | "R$250k / R$13.4M" |

#### MÉDIA — Inferência indireta (Advocate)

| Vetor | Combinação | Inferência |
|-------|-----------|------------|
| V3 | Barra progresso + gatilho hardcoded R$13.4M | `pat = 26% × 13.4M = R$3.5M` |
| V4 | Sliders com defaults reais (25k, 250k) | Aporte e custo de vida exatos |
| V6 | Savings Rate % visível + renda em texto | Aporte implícito |
| V10 | Valor USD por ETF individual (sem `.pv`) | Soma = patrimônio equity |
| V11 | "X anos até FIRE" + FIRE@53 | Idade de aposentadoria |
| V12 | Sankey com R$/ano | Renda, gastos, hipoteca explícitos |
| V13 | Cascade output (sem `.pv`) | Aporte mensal exato |

#### OK — Já protegido pelo toggle atual

- Patrimônio BRL/USD hero (`.pv`)
- Posições: Valor BRL por ETF (`.pv`)
- Total USD/BRL (`.pv`)
- TLH: Valor USD e IR (`.pv`)
- RF cards: valores (`.pv`)
- Bond Pool: valor atual e meta (`.pv`)

---

### Priorização de Implementação

#### Fase 1 — Quick wins: adicionar `class="pv"` (1-2h)

Elementos que só precisam de `.pv` na geração JS:
- G2-G7: attribution values e chart → `class="pv"` nos spans
- G8-G12: fire progress labels → `class="pv"` nos `textContent`
- G14-G15: custo base USD → `.pv` nas células
- G18: heroSavingsSub → `.pv`
- G19-G20: simPatFire, stressPatShock → `.pv`
- G22: netWorthProjectionSrc → `.pv`
- G25-G31: spending, tax IR, bond pool valores, HODL11, SWR sub → `.pv`
- Cascade header com R$ → `.pv`

#### Fase 2 — Hardcoded texts: envolver em spans `.pv` (1h)

Substituir literais em strings hardcoded por: `<span class="pv">R$45k</span>` etc.

#### Fase 3 — Charts com eixo Y absoluto (3-4h, mais complexo)

Em `private-mode`:
- Timeline, Fan Chart, Net Worth Projection: normalizar para base 100 ou ocultar eixo Y
- Attribution bar chart: converter para % do total
- Income Projection, Sankey: ocultar seção ou mostrar só %

#### Fase 4 — Sliders (1h)

Em `private-mode`: resetar sliders para centro do range (não usar `DATA.premissas` como default visual).

#### Não implementar (escopo incorreto)

- DATA via fetch autenticado → overengineering; senha Netlify é a proteção real
- Remover `senha: diego2040` do `carteira.md` → trivial, mas fora do escopo de privacidade do dashboard

---

## Implementação v2 — 2026-04-09 (v1.106)

Segunda rodada de gaps identificados por Diego após v1.104. 19 itens auditados:

| # | Elemento | Implementação | Versão |
|---|----------|---------------|--------|
| 1 | Calculadora de aporte — default 25k | Input numérico oculto (`visibility:hidden`) + slider para centro em private mode | v1.106 |
| 2 | Minilog — coluna Valor (montante) | `class="pv"` na td Valor; preço do ativo permanece visível | v1.106 |
| 3 | Base de custo — linha Total equity | `class="pv"` nas células valor e custo USD | v1.106 |
| 4 | Indicadores topo — heroProgressoSub | `class="pv"` no elemento HTML | v1.106 |
| 5 | KPI Origem equity IBKR — sub label | `class="pv"` em kpiOrigemPat e kpiOrigemPatSub | v1.106 |
| 6 | Decomposição crescimento — eixo X | Bug corrigido: era oculto Y (errado para bar horizontal); agora oculta X | v1.106 |
| 7 | Premissas vs realizado — aportes por ano | `class="pv"` no `<td>` de breakdown anual | v1.106 |
| 8 | Shadow portfolios — escala Y | **Não sensível**: base-100 normalizado, não revela R$ | — |
| 9 | Bond pool — valores atuais | `class="pv"` em valor atual, meta, IPCA+ 2040/2029, total, Renda+ | v1.106 |
| 10 | Guardrails — colunas Retirada e Gatilho | `class="pv"` nas tds retirStr e gatilhoStr | v1.106 |
| 11 | Renda na aposentadoria — gráfico+tabela | incomeChart adicionado a absCharts (Y oculto); colunas Fonte+Gasto com pv; src divs com pv | v1.106 |
| 12 | Eventos de vida — campo impacto | `class="pv"` na div de ev.impacto | v1.106 |
| 13 | Cenários família — label com valor | Span `R$Xk/ano` com pv; pfireFamiliaSrc com pv dinâmico | v1.106 |
| 14 | Simulador FIRE — sliders aporte e custo | Resetam para centro do range em private mode (Fase 4 original) | v1.106 |
| 15 | Spending guardrails — valores em cima e em baixo | Seção inteira oculta em private mode; mantém só P(FIRE)% e semáforo | v1.106 |
| 16 | Comparação FIRE 50 e 53 — patrimônios | `fmtPat()` envolve valores em `<span class="pv">` | v1.106 |
| 17 | Projeção patrimônio — label gatilho | Dataset label sem valor em private mode ("Gatilho FIRE" vs "Gatilho FIRE R$13.1M") | v1.106 |
| 18 | Stress test — bloco de rodapé | patrimônio atual, pós-shock e perda bruta com `class="pv"` | v1.106 |
| 19 | Sankey — rodapé | Já coberto: seção oculta + span pv no R$45k/mês | v1.104 |
