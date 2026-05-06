# HD-agent-patterns-2026 — Padrões de Agentes: Feedback Loop + State Tracking + Two-LLM Split

| Campo | Valor |
|-------|-------|
| **Status** | Doing |
| **Dono** | Head |
| **Prioridade** | 🟡 Média |
| **Aberta** | 2026-05-05 |

---

## Contexto

Análise do repositório TradingAgents (TauricResearch) revelou 3 padrões de arquitetura de sistemas multi-agente com ROI positivo para o sistema de Diego. Todos implementáveis **sem reescrever o sistema**, sem LangGraph, sem Pydantic — apenas disciplina de formato e configuração.

---

## P1 — Feedback loop de decisões com reflexão pós-outcome

### Problema

`agentes/metricas/previsoes.md` registra decisões (PRVs) mas o ciclo `update_with_outcome` é manual e episódico. PRV-001 aberta em março/2026 sem atualização em >5 semanas. Sem fechamento sistemático de loop, a calibração dos agentes é avaliada subjetivamente nas retros, não com dado real.

### Implementação

**Fase 1 — Enriquecer formato de PRV (30 min)**

Cada PRV em `agentes/metricas/previsoes.md` ganha dois campos obrigatórios:

```
**Data de revisão programada:** YYYY-MM-DD (tipicamente 3-6 meses após abertura)
**Status:** `aberta` | `em revisão` | `fechada`
```

**Fase 2 — Formato de fechamento (30 min)**

Ao fechar uma PRV, o Head adiciona bloco de outcome:

```markdown
### Outcome (preenchido na data de revisão)

| Campo | Valor |
|-------|-------|
| Resultado real | [o que aconteceu] |
| Previsão estava correta? | Sim / Parcialmente / Não |
| Raciocínio original estava correto? | Sim / Parcialmente / Não |
| Reflexão | [2-4 frases — o que o sistema aprendeu] |
| Impacto nos perfis dos agentes | [qual agente deve incorporar o aprendizado] |
```

**Fase 3 — Item fixo na retro mensal (15 min)**

Adicionar em `agentes/referencia/revisoes-periodicas.md` checklist item:

```
- [ ] PRVs com `data_revisao_programada` vencida: ler cada uma, preencher outcome, fechar ou prorrogar
- [ ] Calibração: quantas PRVs fechadas no período? Acurácia (corretas / total)?
```

**Fase 4 — Aplicar retroativamente às PRVs existentes (30 min)**

Ler `agentes/metricas/previsoes.md`, adicionar `data_revisao_programada` em cada PRV aberta.

### O que NÃO fazer

- Não automatizar `update_with_outcome` — o valor vem da reflexão humana + agente, não da automação
- Não implementar RAG ou busca por similaridade — volume de decisões de Diego (10-15/ano) não justifica antes de 2031
- Não injetar memória de PRVs automaticamente no contexto de cada debate — custo de tokens sem benefício proporcional

### Critério de Done

- [ ] Formato de PRV atualizado em `previsoes.md` com `data_revisao_programada` e `status`
- [ ] PRVs existentes com datas de revisão preenchidas
- [ ] Bloco de outcome definido no formato canônico
- [ ] Item de revisão de PRVs adicionado ao checklist da retro mensal em `revisoes-periodicas.md`
- [ ] PRV-001 encerrada ou prorrogada com justificativa

---

## P2 — State tracking de debates (posição por lado, por round)

### Problema

Debates formais (protocolo R1-R4) não registram posição por agente por round. Flips de posição só são detectados quando Diego os aponta manualmente. No debate FI-equity-redistribuicao, o Advocate flipou de A para B após Diego propor B — sycophancy detectada por Diego, não pelo sistema.

### Implementação

**Template de estado de debate** — adicionado ao final de toda issue que usar protocolo R1-R4:

```markdown
## Estado do Debate (preenchido pelo Head após R4)

| Agente | Prior (antes do debate) | R2 (após 1º counter) | Final (R4) | Flip? | Evidência nova entre R2→R4? |
|--------|------------------------|----------------------|------------|-------|------------------------------|
| Factor | A | A | A | — | — |
| RF | B | B | A | ✅ | Não → flag sycophancy |
| Advocate | A | A | B | ✅ | Sim: dado X introduzido em R3 |
| CIO | — | — | A | — | Sintetizador |

**Flip rate neste debate:** X de Y agentes fliparam sem evidência nova
**Flag de sycophancy:** [Sim/Não — quais agentes]
```

**Regra de preenchimento:**

- Preenchido **após R4**, nunca durante o debate (preserva fluidez)
- Somente em debates **intra-issue** (não injeta histórico cross-debate no contexto)
- Somente em debates formais que usam R1-R4 explicitamente
- Para debates exploratórios (sem posição prévia clara), omitir a tabela

**Atualizar `agentes/referencia/protocolos-decisao.md`:**

Adicionar ao protocolo D8 (Disagreement Floor) e D11 (Sycophancy Canaries):

```
D8-addendum: Após R4, Head preenche tabela de estado de debate na issue.
Flip sem evidência nova = sycophancy flag obrigatório.

D11-addendum: Flip rate calculável a partir das tabelas de estado.
Meta: <20% de flips sem evidência nova por trimestre.
```

### O que NÃO fazer

- Não injetar histórico completo de R1-R3 no contexto do sintetizador (custo +4.000 tokens/debate sem benefício adicional sobre o histórico ao vivo que o Head já tem)
- Não aplicar template em issues exploratórias ou em debates informais
- Não criar prior numérico obrigatório em issues sem posição quantificável

### Critério de Done

- [ ] Template de estado de debate definido em `agentes/referencia/debate-estruturado.md`
- [ ] D8 e D11 em `protocolos-decisao.md` atualizados com addendum
- [ ] Template aplicado retroativamente na última issue com debate R1-R4 (para validar o formato)
- [ ] Próximo debate formal usa o template

---

## P3 — Two-LLM split (Haiku para coleta, Sonnet para síntese)

### Problema

Todos os agentes do sistema usam o mesmo modelo por padrão. Agentes de coleta de dados e pesquisa inicial não precisam de raciocínio complexo — usar Sonnet/Opus para eles é desperdício de custo e latência.

### Implementação

**Regra canônica:**

| Modelo | Quando usar |
|--------|-------------|
| **Haiku** | Coleta de dados, pesquisa inicial, fact-checking de claims simples, bookkeeper (registros), transcrição, lookups |
| **Sonnet** | Análise, debates R1-R2, síntese intermediária, agentes especializados (factor, rf, fire, tax, macro, behavioral) |
| **Opus** | Síntese final (Head, CIO), decisões >5% portfolio, debates complexos R3-R4, stress-test estrutural (Advocate) |

**Agentes por modelo:**

| Agente | Modelo recomendado | Justificativa |
|--------|-------------------|---------------|
| bookkeeper | Haiku | Registro e lookup de dados — sem raciocínio complexo |
| fact-checker | Haiku (initial) → Sonnet (se ambíguo) | Verificação factual simples é Haiku; interpretação é Sonnet |
| transcrever | Haiku | Transcrição direta |
| market_data scripts | — | Scripts Python, não LLM |
| macro (snapshot) | Haiku | Coleta de dados macro |
| macro (análise) | Sonnet | Interpretação e cenário |
| factor | Sonnet | Análise de fatores requer literatura e raciocínio |
| rf | Sonnet | Cálculos de duration e marcação a mercado |
| fire | Sonnet | Projeção e Monte Carlo |
| tax | Sonnet | Cálculo tributário com nuance |
| behavioral | Sonnet | Detecção de vieses requer contexto |
| risco | Sonnet | Análise de gatilhos e posições |
| wealth | Sonnet | Estrutura patrimonial |
| quant | Sonnet | Validação numérica |
| outside-view | Sonnet | Perspectiva externa |
| advocate | Opus | Stress-test deve usar o modelo mais capaz |
| cio | Opus | Síntese cross-domain requer capacidade máxima |
| Head | Opus | Orquestrador principal |

**Como aplicar:**

Ao spawnar agentes via `Agent tool`, adicionar parâmetro `model`:
```
Agent(subagent_type="bookkeeper", model="haiku", ...)
Agent(subagent_type="fact-checker", model="haiku", ...)  # escalar para sonnet se necessário
Agent(subagent_type="factor", model="sonnet", ...)
Agent(subagent_type="advocate", model="opus", ...)
```

Atualizar `agentes/perfis/` de cada agente com campo `modelo_padrao` na seção de identidade.

### Estimativa de impacto

Haiku custa ~20× menos que Opus e ~5× menos que Sonnet. Se 30-40% das chamadas migram para Haiku (bookkeeper, fact-checker, coleta), redução estimada de custo por sessão: **30-40%**.

### Critério de Done

- [ ] Tabela de modelo por agente documentada em `agentes/referencia/protocolos-decisao.md` (nova seção "Protocolo de modelo LLM")
- [ ] Perfis dos agentes atualizados com `modelo_padrao` na seção 1 (Identidade)
- [ ] Head aplica o split nas próximas 3 sessões com debates formais e reporta resultado (custo e qualidade)

---

## Critério de Done Global

- [ ] P1 implementado (feedback loop)
- [ ] P2 implementado (state tracking)
- [ ] P3 implementado (two-LLM split)
- [ ] Retro seguinte valida se os 3 padrões foram aplicados na prática
