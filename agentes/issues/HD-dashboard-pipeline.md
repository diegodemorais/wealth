# HD-dashboard-pipeline: Refatoração do Pipeline e Arquitetura do Dashboard

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-dashboard-pipeline |
| **Dono** | Dev |
| **Status** | Doing |
| **Prioridade** | 🟡 Média |
| **Participantes** | Dev, Head |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-08 |
| **Origem** | Consulta DEV sobre modernização — análise revisada com lentes Kleppmann, Reis/Housley, Kimball, Knaflic, Lean Analytics |
| **Concluido em** | — |

---

## Motivo / Gatilho

Diego perguntou ao DEV se vale a pena migrar o dashboard para uma linguagem/framework mais moderno. DEV respondeu que não — mas identificou problemas reais de manutenibilidade que precisam ser endereçados. Com as novas referências canônicas (Kleppmann, Reis & Housley, Kimball, Knaflic), o diagnóstico foi revisado: o maior risco não está no JS do template, mas no **acoplamento implícito entre `generate_data.py` e `data.json` sem schema declarado**.

---

## Descrição

O pipeline atual funciona mas tem 3 problemas estruturais:

1. **Sem contrato de dados**: `data.json` não tem schema declarado. Quando `generate_data.py` muda um campo, o template quebra em runtime no browser sem stack trace útil. Kleppmann chama isso de "time bomb".

2. **`generate_data.py` monolítico**: 29k+ bytes misturando ingestão, transformação e serving. Reis & Housley: misturar essas três responsabilidades é a causa mais comum de pipelines impossíveis de testar e manter.

3. **JS monolítico no template**: 2.091 linhas em um único bloco, 50 funções declaradas, 30 renders no `init()`. Cresce por adição incremental sem refatoração.

Decisão confirmada: **não migrar de framework**. A arquitetura `Python → JSON → HTML estático` é o ativo principal e deve ser preservada.

---

## Escopo

### P1 — Contrato de dados (Kleppmann / Kimball)
- [ ] Criar `dashboard/data.schema.json` com JSON Schema declarando o shape de `DATA`
- [ ] Adicionar validação no `build_dashboard.py`: falha explícita no build se `data.json` não valida o schema
- [ ] Documentar campos obrigatórios vs opcionais

### P2 — Separação de camadas em `generate_data.py` (Reis & Housley)
- [ ] Identificar e separar: (a) funções de ingestão de fonte, (b) funções de transformação/cálculo, (c) montagem do objeto final `DATA`
- [ ] Extrair para módulos: `scripts/data_ingest.py`, `scripts/data_transform.py` (ou estrutura equivalente)
- [ ] `generate_data.py` vira orquestrador que chama os módulos

### P3 — Auditoria de relevância decisória (Knaflic / Lean Analytics)
- [ ] Para cada uma das 30+ seções do dashboard, responder: "que decisão isso informa?"
- [ ] Identificar seções candidatas a remoção ou ocultamento (modo avançado)
- [ ] Candidatos preliminares: `buildBollinger`, `buildFeeAnalysis` (frequência baixa), shadow portfolio retrospectivo

### P4 — Modularização JS + type checking (manutenibilidade)
- [ ] Adicionar `// @ts-check` + JSDoc types para o shape de `DATA` no topo do script
- [ ] Agrupar funções por domínio com separadores comentados (`// === FIRE ===`, `// === ALOCAÇÃO ===`)
- [ ] Avaliar extração para `dashboard/dashboard.js` separado

---

## Raciocínio

**Alternativas rejeitadas:**
- Migrar para React/Vue/Svelte/Astro: aumenta complexidade de manutenção, não reduz. Custo: semanas. Benefício: nenhum para 1 usuário, 1 deployment, 1 fonte de dados.
- Observable Framework: mais alinhado ao use case, mas lock-in + curva de aprendizado não justifica.

**Argumento central:**
O pipeline `Python → JSON → HTML estático` é sólido e deve ser preservado. A dor real está na ausência de contrato entre camadas (schema) e no monolito Python que mistura responsabilidades. A solução é cirúrgica: contrato explícito + separação de responsabilidades, sem mudar a stack.

**Incerteza reconhecida:**
A separação de `generate_data.py` em módulos pode revelar acoplamento implícito entre as funções que torna a separação mais complexa do que parece.

**Falsificação:**
Se após a separação em módulos o tempo de manutenção por feature nova não diminuir visivelmente, a abordagem está errada.

---

## Análise

### P1 — JSON Schema (concluído 2026-04-08)

`dashboard/data.schema.json` criado com JSON Schema draft-07. Cobre 100% dos campos do `data.json` atual (32 campos de primeiro nível + hierarquia completa). Durante a criação, foi identificado um problema real: `attribution.retornoUsd` e `attribution.cambio` podem ser `null` quando `_estimativa: true` — foi documentado no schema com type `["number","null"]` e description explicando o motivo.

`scripts/build_dashboard.py` atualizado com função `_validate_data()`:
- Usa `jsonschema` se disponível (validação completa com Draft7Validator)
- Fallback manual se não instalado (verifica apenas campos obrigatórios de primeiro nível)
- **Nunca bloqueia o build** — apenas imprime warnings. Decisão: campos novos adicionados no `generate_data.py` antes de atualizar o schema não devem parar o pipeline
- Output esperado quando OK: `✅ data.json validado contra data.schema.json — OK`
- Output quando problema: `⚠️ data.json tem N problema(s) de schema (build não bloqueado):`

### P2 — Auditoria de Relevância Decisória (Knaflic / Lean Analytics)

Tabela baseada em análise das 30+ funções `build*` / `render*` chamadas no `init()` e na estrutura HTML por aba:

| Seção | Função JS | Aba | Decisão que informa | Frequência de uso | Veredicto |
|-------|-----------|-----|--------------------|--------------------|-----------|
| Hero Strip | renderKPIs (hero) | Sempre visível | Patrimônio, P(FIRE), anos restantes — status one-glance | Toda visualização | **MANTER** |
| Próximas Ações | renderProximasAcoes | Sempre visível | O que fazer agora (aportes, execuções) | Toda visualização | **MANTER** |
| KPI Cards | renderKPIs | Status | CAGR, câmbio, wellness — saúde do sistema | Toda visualização | **MANTER** |
| Time to FIRE | buildFireGrid (inline) | Status | Anos até FIRE, progresso logarítmico | Toda visualização | **MANTER** |
| P(FIRE) + Tornado | buildScenarios + buildTornado | Status | Decisão central: atingir ou não a meta | Toda visualização | **MANTER** |
| Wellness Score | renderWellness | Status | Indicador composto — alerta sistêmico | Mensal | **MANTER** — mas já marcado como "indicador secundário" no HTML |
| Progresso FIRE / Savings Rate / TER | (inline no KPI grid) | Status | 3 métricas operacionais (poupança, custo, progresso) | Toda visualização | **MANTER** |
| Sensibilidade Spending | buildPfireFamilia | Status | Decisão de custo de vida na aposentadoria | Trimestral | **MANTER** |
| FIRE Buckets Donut | buildFireBuckets | Planejamento | Alocação estratégica atual vs alvo | Mensal | **MANTER** |
| Guardrails | buildGuardrails | Planejamento | Regras de corte no FIRE Day — referência permanente | Raramente (setup) | **AVALIAR** — valiosa, mas raramente consultada; candidata a accordion/collapsed por default |
| Fan Chart P10/P50/P90 | buildFanChart | Planejamento | Trajetórias patrimoniais — horizonte longo | Trimestral | **MANTER** — com disclaimer visível (já existe) |
| Retirement Income | buildIncomeChart + buildIncomeTable | Planejamento | Fases de renda na aposentadoria | Semestral | **MANTER** |
| Eventos de Vida | buildEventosVida | Planejamento | Gatilhos de recalibração do plano | Eventual (evento) | **MANTER** — útil quando eventos ocorrem |
| What-If Scenarios | updateWhatIf | Planejamento | Exploração de cenários deterministicos | Ocasional | **AVALIAR** — overlap com Fan Chart; mas sliders são interativos e distintos |
| Timeline | buildTimeline | Performance | Evolução patrimonial — visão histórica | Mensal | **MANTER** |
| Performance Attribution | buildAttribution | Performance | Decomposição crescimento: aportes vs retorno vs câmbio | Mensal | **MANTER** — mas atualmente oculto (attribution null) |
| Delta vs Benchmarks + IPCA+ | buildDeltaBar + renderIpcaProgress | Performance | Está o tilt valendo? Taxa IPCA+ vs piso? | Mensal | **MANTER** |
| Backtest Histórico | buildBacktest | Performance | Evidência histórica do factor tilt vs VWRA | Semestral | **MANTER** |
| Shadow Portfolios | buildShadowTable + buildShadowChart | Performance | Tracking vs VWRA e VWRA+IPCA+ | Trimestral | **MANTER** |
| **Bollinger Bands** | buildBollinger | Performance | Retornos mensais vs MA5±2σ — breakouts | Raramente | **AVALIAR / REMOVER** — não informa decisão de investimento (tática); volatilidade mensal do patrimônio não muda estratégia FIRE de longo prazo |
| Glide Path | buildGlidePath | Alocação | Evolução prevista da alocação por idade | Semestral | **MANTER** |
| Alocação Donuts | buildDonuts | Alocação | Alocação atual vs estrutura target | Mensal | **MANTER** |
| Posições ETFs | buildPosicoes | Alocação | Rastreabilidade de cada posição IBKR | Mensal | **MANTER** |
| Custo Base por Bucket | buildCustoBase | Alocação | Ganho não realizado e peso intra-equity | Mensal/TLH | **MANTER** |
| Calculadora Aporte | calcAporte / Contribution Slider | Alocação | Quanto aportar e onde (cascade) | Mensal (aporte) | **MANTER** |
| Mini-log Operações | buildMinilog | Alocação | Rastreio das últimas operações | Mensal | **MANTER** |
| TLH Monitor | buildTLH | Alocação | Ativos com perda ≥ gatilho — decisão de TLH | Eventual (crise) | **MANTER** |
| RF + Cripto Cards | buildRfCards | Planejamento | Taxas atuais dos títulos IPCA+ vs piso — decisão de DCA RF | Mensal | **MANTER** |
| **Fee Analysis** | buildFeeAnalysis | Performance | TER atual vs VWRA — custo do tilt em 14 anos | Raramente | **AVALIAR** — cálculo estático; muda pouco; útil na decisão de mudar ETF mas não rotineira |
| IPCA+ Progress | renderIpcaProgress | Performance | Taxa IPCA+ vs piso e alpha haircut | Mensal | **MANTER** |

**Candidatos à revisão (3 seções):**
1. **Bollinger Bands** — gráfico técnico de curto prazo que não informa decisão estratégica FIRE. Custo: manutenção de série temporal + cálculo MA5. Benefício: reconhecimento de padrão de retorno — baixo para estratégia buy-and-hold.
2. **Fee Analysis** — tabela estática útil em decisões de troca de ETF, mas não fornece nova informação a cada ciclo mensal. Candidata a "accordion colapsado por default" ou remoção.
3. **Guardrails** — essencial como referência, mas raramente consultada após setup. Candidata a accordion colapsado.

**Decisão P2:** documentação apenas. Nenhuma remoção executada nesta issue. Revisão de remoção/colapso deve ser issue separada com aprovação do Diego.

### P3 — Type Checking JSDoc (concluído 2026-04-08)

Adicionado ao `dashboard/template.html` (antes do `__DATA_PLACEHOLDER__`):
- `// @ts-check` no topo do bloco `<script>`
- Typedef completo `DashboardData` com 20+ tipos anotados: `Posicao`, `PfireScenario`, `RfTitulo`, `DriftItem`, `PortfolioMetrics`, `SpendingPhase` + tipo principal composto
- `/** @type {DashboardData} */` antes da declaração de `const DATA`

Impacto: editores VS Code, Cursor e similares agora oferecem autocomplete em `DATA.` e detectam erros de acesso a campos inexistentes sem nenhuma mudança arquitetural.

---

## Conclusão

P1, P2 e P3 executados. O maior gap de manutenibilidade do pipeline — ausência de contrato de dados entre `generate_data.py` e `template.html` — foi resolvido com o schema JSON. A validação já detectou (e documentou) um dado legítimo que o schema inicial não cobria (`attribution.retornoUsd = null` quando `_estimativa: true`), confirmando que o contrato é útil.

**Próxima issue recomendada:** P2 → separação de `generate_data.py` em módulos (ingestão / transformação / serving). Dependência: nenhuma.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Código** | `dashboard/data.schema.json` criado (JSON Schema draft-07, 340 linhas) |
| **Código** | `scripts/build_dashboard.py` — função `_validate_data()` adicionada (40 linhas) |
| **Código** | `dashboard/template.html` — `// @ts-check` + JSDoc typedef `DashboardData` (70 linhas) |
| **Conhecimento** | Auditoria de 30 seções: 3 candidatas à revisão (Bollinger, Fee Analysis, Guardrails) |
| **Processo** | Pipeline validado end-to-end: `data.json → schema check → build → index.html` |

---

## Próximos Passos

- [x] P1 — JSON Schema + validação no build
- [x] P2 — Auditoria de relevância (documentação)
- [x] P3 — `// @ts-check` + JSDoc types no template
- [ ] P2 — Separar domínios factor/macro/tax do `generate_data.py` (padrão CORE — baixa urgência)
- [x] Bollinger → já substituído por heatmap de retornos mensais (DEV-heatmap-rolling v1.105)
- [x] Fee Analysis → colapsado em accordion (v1.127)
- [x] Guardrails → manter visível (decisão: regra de execução pós-FIRE)
