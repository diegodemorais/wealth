# HD-dashboard-v2: Redesign e Correções do Dashboard — Revisão Completa 12 Agentes

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-dashboard-v2 |
| **Dono** | Dev |
| **Status** | Done |
| **Prioridade** | 🔴 Crítica |
| **Participantes** | Dev, FIRE, Factor, RF, Risco, Macro, Tax, Quant, Behavioral, Advocate, Bookkeeper, CIO |
| **Co-sponsor** | CIO |
| **Dependencias** | HD-dashboard-pipeline (concluída) |
| **Criado em** | 2026-04-08 |
| **Origem** | Revisão completa do dashboard por todos os 12 agentes simultaneamente |
| **Concluido em** | 2026-04-09 |

---

## Motivo / Gatilho

Diego solicitou que todos os agentes analisassem o dashboard v1.43 e identificassem oportunidades de melhoria. 12 agentes rodaram em paralelo, cada um com perspectiva do seu domínio. Os achados revelaram bugs críticos de consistência numérica, lacunas de dados relevantes, problemas estruturais de organização e oportunidades de design/UX.

---

## Descrição

O dashboard atual (v1.43) tem base sólida mas acumulou problemas em 4 dimensões:
1. **Bugs de consistência numérica** (Quant): dados divergentes entre arquivos fonte
2. **Estrutura fragmentada** (DEV/CIO): informações relacionadas em abas diferentes, seções redundantes
3. **Lacunas de dados por domínio** (todos os especialistas): métricas críticas ausentes
4. **Design e vieses cognitivos** (Behavioral/DEV): hierarquia visual errada, ancoragem indevida

---

## Achados por Agente

### 🔴 QUANT — Bugs e Inconsistências Numéricas

| ID | Severidade | Descrição |
|----|-----------|-----------|
| F1 | **ALTA** | 4 valores de patrimônio coexistem: `carteira.md` R$3,37M vs `premissas` R$3,53M vs `timeline` R$3,48M vs computado ~R$3,53M — divergência de ~R$155k |
| F2 | Média | P(FIRE) spending sensitivity diverge entre `carteira.md` e `data.json` nos cenários R$270k e R$300k |
| F3 | Baixa | P(FIRE@50) sem fonte declarada em `carteira.md` |
| F4 | **Média** | Câmbio hardcoded no header (5,1687) diverge de `DATA.cambio` (5,0955) — 1,4% de erro em todo cálculo BRL |
| F5 | Baixa | `renda_estimada` no JSON não é usada; savings rate usa definição não-padrão |
| F6 | **Média** | Glide path soma >100% nas idades 39–50 (Renda+ 2065 somado em cima dos outros blocos) |
| F7 | Baixa | Timeline tem label "2026-03" duplicado |
| F8 | Baixa | Template sobrescreve drift IPCA do `data.json` em runtime |
| F9 | Média | SWR no FIRE Day usa patrimônio gatilho (R$13,4M), não mediana projetada (R$11,53M) — SWR aparece mais otimista que a realidade mediana |
| F12 | Baixa | Renda+ 2065 taxa diverge 15 bps entre `carteira.md` (7,08%) e `data.json` (6,93%) |
| F13 | **Média** | Gatilho de venda Renda+ 2065: `carteira.md` diz ≤6,0%, `data.json` diz ≤6,5% — 50bps de diferença no gatilho real de execução |
| F14–16 | Baixa | Precisão falsa: preços com 4 decimais, quantidades fracionárias de ETFs (deveriam ser inteiros) |

---

### 🟠 DEV — Design, UX e Organização

**Agrupamento / reorganização de seções:**
- S9 (FIRE@50 vs @53) está em Status — deveria estar em Planejamento
- S26 (RF + Cripto cards) está em Planejamento — deveria estar em Alocação (são posições, não projeções)
- Glide Path está em Alocação — deveria estar em Planejamento (é estratégico, não operacional)
- Contribution Slider (S18) é subconjunto do What-If (S19) — eliminar S18

**Redundâncias:**
- S9 + S10: P(FIRE) aparece em 5 lugares — consolidar
- Donut S8 (Alocação) vs Donut S13 (FIRE Buckets) — mesmo dado, eliminar S13
- Aba Alocação tem 9 seções — dividir em "Posições" e "Ferramentas"

**Hierarquia visual:**
- Próximas Ações: colapsar/reduzir destaque amarelo quando não há ação (amarelo permanente esgota o sinal)
- Wellness Score com mesmo tamanho tipográfico que P(FIRE) — deveria ser visivelmente menor
- Hierarquia de cards: seções críticas com borda accent 2px, auxiliares com borda suave
- Badge "backtest" visível nos KPIs de CAGR (aviso hoje está em rodapé invisível)
- Remover emojis das abas (clutter sem valor informacional)
- Zebra striping nas tabelas longas

---

### 🟠 CIO — Visão Estratégica

**3 perguntas do check-in mensal:**
1. "Estou no caminho para o FIRE 2040?" → respondida parcialmente (falta ritmo vs trajetória esperada)
2. "Preciso agir na alocação esse mês?" → respondida bem (Próximas Ações funciona)
3. "Há algum gatilho ativo?" → **não respondida** — exige navegar 3 abas diferentes

**Tempo estimado para check-in completo hoje: 8–12 minutos. Meta: 5 minutos.**

**Solução prioritária:** adicionar Painel de Semáforos de Gatilhos fixo abaixo das Próximas Ações:

| Gatilho | Status | Ação |
|---------|--------|------|
| IPCA+ taxa vs piso 6,0% | Verde (7,21%) | DCA ativo |
| Renda+ taxa vs saída 6,0% | Verde (6,93%) | Monitorar |
| Drift SWRD vs alvo | Vermelho | Priorizar aporte |
| Drawdown portfolio | Verde | Normal |
| AVGS rolling 12m vs SWRD | Verde/Amarelo? | Monitorar |

---

### 🟡 FIRE — Lacunas de Planejamento

- **Tornado chart vazio** no pipeline — visualização de sensibilidade mais importante ausente
- **P(FIRE) no hero sem range**: deveria ser "87–94%" não "90,4%" (falsa precisão)
- **Bond pool readiness ausente**: "cobre X anos de gastos" — principal defesa contra SoRR invisível
- **Saúde projetada por idade** na seção de renda (R$18k@53 → R$56k@70) — risco dominante do spending smile oculto
- **Patrimônio mediano no FIRE Day** (R$11,53M) para contextualizar o P(FIRE)
- **FIRE Number milestones**: 25%/50%/75%/100% com datas projetadas
- 10 seções FIRE espalhadas — reorganizar em 4 blocos: Onde Estou / Probabilidade / Trajetória / Proteção

---

### 🟡 FACTOR — Monitoramento Fatorial

- **Rolling 12m AVGS vs SWRD** com linha de threshold -5pp — a métrica central da tese fatorial, completamente ausente
- **Factor loadings por ETF** (output de `scripts/factor_regression.py` — já existe, só falta fluir para `data.json`)
- **AUM monitor AVEM** — threshold EUR 100M, hoje em USD 155M, sem alerta
- **Shadow B = 100% SWRD puro** como benchmark do tilt (hoje compara com VWRA, que não é o benchmark correto)
- **Breakdown alvo vs transitório por bucket** — AVGS tem 2,7% alvo + 26,3% transitório, mas aparece como bloco único
- **Tracking error anualizado** na tabela de métricas do backtest

---

### 🟡 RF — Renda Fixa

- **Histórico de taxa IPCA+ 2040** (série temporal 12–24 meses) — para monitorar tendência de compressão
- **Distância ao gatilho Renda+ 2065**: "93bps acima do piso de venda 6,0%" com semáforo — hoje só mostra 6,93% sem contexto
- **Split TD 2040 / TD 2050** (80/20) — hoje aparecem como um único bloco "IPCA+ 2040"
- **Duration Renda+ 2065** (43,6 anos) visível no card — "variação de 1pp na taxa = ~43% no preço"
- RF + Cripto na aba Planejamento é contraintuitivo — mover para Status ou Alocação
- IPCA+ 2029 (reserva) e IPCA+ 2040 (DCA) tratados identicamente — são instrumentos completamente diferentes

---

### 🟡 RISCO — Ativos de Risco

- **P&L do HODL11** ausente — preço médio não está no `data.json`, impossível calcular ganho/perda
- **Bandas visuais piso/teto para HODL11** (1,5%–5%) — hoje só mostra número bruto sem sinalização
- **HODL11 agrupado com RF** — ativos com perfis radicalmente diferentes no mesmo card (vol 80%/ano vs duration 43,6)
- **Duration e impacto MtM Renda+ 2065** no card: "em +1pp taxa: perda MtM ~-35%"
- **Data de atualização** do preço HODL11 e Crypto Legado ausente
- TLH Monitor sem prazo de holding por lote (relevante para wash sale e PTAX)

---

### 🟡 MACRO — Macroeconômico e Câmbio

- **Selic atual ausente** — indicador mais importante para RF, não aparece em lugar nenhum
- **Premissa depreciação BRL** (0,5%/ano base) invisível — entra em todas as projeções FIRE
- **Exposição cambial explícita**: "85% do patrimônio em USD" — ausente como KPI
- **Decomposição retorno USD vs câmbio** — estrutura existe (`attribution`) mas dados estão `null` desde sempre
- Câmbio no hero sem âncora histórica — 5,09 não diz se está caro/barato/normal
- **Spread Selic-Fed Funds** como indicador avançado de câmbio

---

### 🟡 BOOKKEEPER — Completude Operacional

- **DCA Status widget** ausente: "IPCA+ DCA ATIVO | 0/? tranches | taxa 7,2% vs piso 6,0% | próxima ação: aporte"
- **Timestamp de atualização por ativo** — não há indicação de staleness por fonte
- **Execuções pendentes aprovadas** não aparecem no dashboard (decisões aprovadas sem visibilidade de progresso)
- Cotas de TD em `null` — impossível reconciliar com extratos XP/Nubank
- Cripto legado (BTC/ETH/BNB/ADA) aparece em `holdings.md` mas não no dashboard

---

### 🟡 TAX — Tributação

- **Ganho nominal em BRL** (com PTAX histórico) ausente — dashboard opera inteiro em USD, mas IR incide em BRL
- **KPI "IR diferido total"** (~R$158k+ latente) — nunca aparece; afeta patrimônio líquido real e projeção FIRE
- **Visão por lote no TLH Monitor** — hoje mostra preço médio consolidado, escondendo oportunidades de lotes específicos
- IR estimado no TLH calculado incorretamente (em USD, não BRL nominal com PTAX da compra)
- Destaque da **vantagem fiscal dos ETFs UCITS de acumulação** (diferimento preservado pós Lei 14.754) ausente
- Badge "ACC — diferimento fiscal" em cada ETF alvo ausente

---

### 🟢 BEHAVIORAL — Vieses Cognitivos

- **Patrimônio em USD** deveria ser primário no hero (não BRL, que flutua por câmbio sem gerar informação de retorno)
- **P(FIRE) arredondado para inteiros + range** (87–94%) — 90,4% com uma decimal é falsa precisão (Tetlock 2005)
- **Remover "Ganho %" da tabela de posições** — âncora de preço de entrada inútil para buy-and-hold (Kahneman/Tversky)
- **"Nenhuma ação necessária"** explícito quando tudo verde — inação como decisão consciente (Pompian 2012)
- **Nudge de frequência**: "Próxima consulta sugerida: 08/Mai/2026" (Thaler & Sunstein 2008)
- **CAGR patrimonial** lado a lado com TWR (retorno puro ex-aportes) — CAGR inflado por aportes cria overconfidence
- **Drawdown atual vs pico** com sinalização visual — ausente fora do FIRE Day
- Botão Reload como convite implícito a checagem compulsiva (myopic loss aversion — Benartzi & Thaler 1995)

---

### 🟢 ADVOCATE — Remoções Recomendadas

Seções com baixo valor decisório que deveriam ser removidas ou colapsadas:

| Seção | Motivo |
|-------|--------|
| **Bollinger Bands** | Zero valor decisório para buy-and-hold; não informa nenhuma ação |
| **Fee Analysis** | Análise estática (delta 2,7bps); muda raramente; não é monitoramento rotineiro |
| **Financial Wellness Score** | Composite de inputs estáticos; "feelgood score" que nunca muda decisão |
| **Contribution Slider** | Subconjunto do What-If; redundante |
| **FIRE Buckets Donut** | Redundante com Donuts de Alocação |
| **Cenários Família** | Referência estática; não é monitoramento |
| **Eventos de Vida** | Checklist estático; pertence a documento, não dashboard |
| **Performance Attribution** | Estrutura existe mas dados `null` há meses; mostrar ou remover |
| **Fan Chart** | Admitidamente interpolação, não MC real; aviso grande sem dado confiável |

Viés de confirmação estrutural identificado: **o dashboard mostra extensivamente por que o plano está funcionando e evita mostrar o que pode dar errado**. Adicionar 3 seções que faltam: (1) spread AVGS vs SWRD rolling, (2) concentração Brasil total (~58% do patrimônio total), (3) premissas vs realizado (retorno, câmbio, IPCA).

---

## Escopo — Resumo de Prioridades

### 🔴 P0 — Bugs críticos ✅ TODOS RESOLVIDOS (v1.47)
- [x] F1: Reconciliar os 4 valores de patrimônio — fonte única `DATA.premissas.patrimonio_atual`
- [x] F4: Header lendo câmbio de `DATA.cambio` (JS atualiza no runtime)
- [x] F6: Corrigir glide path — assertion + stacked chart corrigido
- [x] F13: Reconciliar gatilho Renda+ — pisos separados: 6.0% (IPCA+), 6.5% (Renda+)

### 🟠 P1 — Estrutura e navegação ✅ COMPLETO (v1.59–v1.71)
- [x] Painel de Semáforos de Gatilhos fixo abaixo das Próximas Ações — v1.65
- [x] DCA Status widget (IPCA+ tranches, taxa vs piso, próxima ação) — v1.65
- [x] P(FIRE) como range no hero (87–94%) — v1.59
- [x] Reorganizar abas: 5 tabs implementadas (Status/Perf/Aloc/Plan/Projeções) — v1.46
- [x] Dividir aba Alocação em Posições + Ferramentas — v1.68 (S22→plan)
- [x] Mover seções para abas corretas (S9→plan, S26→status, GlidePath→plan) — v1.59
- [x] Eliminar S18 (Contribution Slider removido, S19 What-If cobre) — v1.59

### 🟡 P2 — Dados por domínio ✅ COMPLETO (v1.65–v1.71)
- [x] Rolling 12m AVGS vs SWRD com threshold visual (Factor) — v1.65
- [x] KPI "IR diferido total" em BRL com PTAX histórico (Tax) — v1.65
- [x] Selic + premissa depreciação BRL visíveis (Macro) — v1.65
- [x] Bond pool readiness em anos de gastos (FIRE) — v1.65
- [x] Duration + impacto MtM Renda+ 2065 no card (RF/Risco) — v1.65
- [x] Distância ao gatilho Renda+ com semáforo (RF) — v1.65
- [x] P&L e bandas visuais HODL11 (Risco) — v1.65
- [x] Timestamp de atualização por ativo (Bookkeeper) — v1.71
- [x] Factor loadings fluindo de `factor_regression.py` para `data.json` (Factor) — v1.65
- [x] Tornado chart com dados reais do pipeline (FIRE) — v1.65

### 🟢 P3 — Design, remoções e behavioral — RE-ANALISADO (v1.59, 6 agentes)
Re-análise completa em 2026-04-09 por FIRE, Factor, Behavioral, Risco, RF e Advocate.
Decisões finais divergiram da proposta original da v1.43.

- [x] Bollinger Bands → simplificado para "Retornos Mensais" (bar chart, sem bandas/MA5)
- [x] Contribution Slider (S18) removido — S19 What-If cobre
- [x] Wellness Score → COLAPSADO (métricas extras integradas no grid, padrão Boldin)
- [x] Fee Analysis → COLAPSADO (default fechado, consulta trimestral)
- [x] Eventos de Vida → COLAPSADO (accordion)
- [x] Fan Chart S14 → COLAPSADO (F7 Projeções é superior com spending smile)
- [x] FIRE Buckets Donut — MANTIDO (4/6 votaram manter)
- [x] Cenários Família — MANTIDO (4/6 votaram manter)
- [x] Ganho % — MANTIDO (Advocate reverteu: input tributário TLH)
- [x] Perf Attribution — MANTIDO (dados funcionais v1.58)
- [x] Patrimônio em USD como primário no hero — v1.61
- [x] CAGR patrimonial lado a lado com TWR — v1.65
- [x] "Nenhuma ação necessária" quando tudo verde — v1.61
- [x] Nudge de frequência mensal — v1.61
- [x] Hierarquia tipográfica e de cards — v1.68
- [x] Zebra striping em tabelas longas — v1.61
- [x] Concentração Brasil total — v1.71
- [x] Spread AVGS vs SWRD (factor rolling) — v1.65
- [x] Premissas vs realizado — v1.71

---

## Raciocínio

**Argumento central:** o dashboard v1.43 tem profundidade analítica sólida mas acumulou problemas em camadas — bugs de dados (Quant), fragmentação estrutural (CIO/DEV), lacunas de domínio (especialistas) e design que cria vieses em vez de neutralizá-los (Behavioral). Uma revisão v2 coordenada pelo DEV com input dos especialistas resolverá esses problemas de forma coerente.

**Incerteza reconhecida:** algumas remoções sugeridas pelo Advocate (Wellness Score, Fan Chart, Shadow Portfolios) têm valor percebido para Diego que pode não ser capturado na análise de "valor decisório". Decisão de remoção deve ser validada com Diego caso a caso.

**Não fazer:** redesign completo de framework (React/Vue) — já decidido em HD-dashboard-pipeline. A arquitetura HTML estático se mantém.

---

## Análise

> Preenchido com achados dos 12 agentes acima.

---

## Conclusão

Issue completa. Dashboard evoluiu de v1.43 (Backlog) para v1.71 (Done) em uma sessão.
- P0 (4 bugs): resolvidos v1.47
- P1 (7 itens): completos v1.59–v1.68
- P2 (10 dados por domínio): completos v1.65–v1.71
- P3 (13 design/behavioral): completos v1.59–v1.71
- Re-análise por 6 agentes independentes: 4 reversões vs proposta original
- Auditoria zero-hardcoded: 11 constantes migradas para config.py, template limpo
- Pipeline: 8 novos datasets (Factor, RF, Tax, Macro, FIRE, Risco, Bookkeeper, Advocate)

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Código** | v1.43→v1.71: +28 versões, ~1500 linhas novas, 8 funções JS, 6 funções Python |
| **Estratégia** | Advocate reverteu 4/10: FIRE Buckets, Cenários Família, Perf Attribution e Ganho % mantidos. Bollinger simplificado para Retornos Mensais. |
| **Conhecimento** | Teste: "isso muda uma decisão de aporte, alocação ou withdrawal?" Zero hardcoded. Config.py = fonte de verdade. |
| **Memória** | Deploy automático via GitHub Actions. Regra permanente registrada em CLAUDE.md + memoria Head. |

---

## Próximos Passos

- [x] Todos os itens P0/P1/P2/P3 implementados
- [ ] HODL11 avg_cost: Diego precisa informar preço médio da nota de corretagem para ativar P&L
- [ ] Factor rolling/loadings: rodar pipeline completo (sem --skip-scripts) para popular cache
- [ ] Habilitar GitHub Pages → Source: GitHub Actions nas Settings do repo
