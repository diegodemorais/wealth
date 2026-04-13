# DEV-now-dashboard-review: Revisão Completa Aba NOW — Indicadores Repetidos, TIME TO FIRE Mal Estruturado

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-now-dashboard-review |
| **Dono** | Dev |
| **Status** | Refinamento |
| **Prioridade** | 🔴 Alta |
| **Participantes** | FIRE, Advocate, Bookkeeper |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-13 |
| **Origem** | Diagnóstico Diego — aba NOW com indicadores repetidos e TIME TO FIRE confuso |
| **Concluido em** | — |

---

## Motivo / Gatilho

Diego flaggeou 3 problemas na aba NOW: (1) informações repetidas em 2 locais, (2) TIME TO FIRE com 9 cards confusos, (3) DRIFT máximo sem destaque. Layout atual não comunica status de forma clara.

---

## Problema Identificado

A aba **NOW** (visão gerencial do dashboard) apresenta:
1. **Indicadores repetidos** — mesmas informações em locais diferentes sem contexto claro
2. **Organização ineficiente** — painéis não agrupados por função/insight
3. **TIME TO FIRE deficiente** — bloco principal não comunica status de forma clara
4. **Falta de contexto** — alguns KPIs não têm suporte visual ou narrativa clara

### Painéis Atuais (Aba NOW)

**Seção 1: KPIs Primários**
- PATRIMÔNIO TOTAL: R$3.54M
- ANOS ATÉ FIRE: 13a9m
- PROGRESSO FIRE: 42.5%

**Seção 2: Indicadores Principais**
- P(FIRE|≤50): 85.4% (fav 91%, stress 81%)
- DRIFT MÁXIMO: 10.4pp (IPCA+ −10.4pp vs alvo)
- APORTE DO MÊS: R$78k

**Seção 3: Contexto de Mercado**
- DÓLAR: R$5.021 (−2.6% MtD)
- BITCOIN: $72.926 (+1.5% MtD)
- IPCA+ 2040: 7.07%
- RENDA+ 2065: 6.80%

**Seção 4: TIME TO FIRE** ← **PRINCIPAL PROBLEMA**
- Grande bloco com "13 anos 9 meses · 2040 (53 anos)"
- Progress bar visual (logarítmica, diz o texto)
- 3 cenários (SOLTEIRO, CASADO, C/ FILHO) com 2 targets cada (FIRE 50 e FIRE 53)
- P(success) por cenário/target: ex SOLTEIRO P=85.4%, CASADO P=83.8%, FILHO P=80.8%
- Sub-targets com gasto anual: ex "R$770k/ano", "R$300k/ano"

**Problemas no TIME TO FIRE:**
- 9 cards (3 cenários × 3 targets = confuso visualmente)
- Repetição: "FIRE 50" aparece 3 vezes, "FIRE 53" aparece 3 vezes
- Falta contexto: qual cenário é recomendado? qual Diego deve monitorar?
- Targets FIRE 50/53 misturados — sem clareza de qual é o PRIMARY
- Sub-targets com gasto esperado deveriam estar numa tabela de referência, não aqui
- Prob success poderia estar lado a lado com sensibilidade (tornado), não em card separado

**Seção 5: Semáforos de Gatilhos**
- "IPCA+ 2040: DCA pausado - 4 gatilhos monitorados"

**Seção 6: PROGRESSO FIRE + APORTE DO MÊS**
- Duplica KPIs da Seção 2 em layout diferente
- Progress bar + "SWR no FIRE Day projetada: 3.00%" (redundante com aba FIRE)

**Seção 7: P(FIRE) — Monte Carlo + Tornado**
- Cenários: Base 90.4%, Favorável 94.1%, Stress 86.8%
- Tornado: sensibilidade a ±10% nos 4 maiores drivers
- Progresso Patrimonial (R$3.54M / R$8.3M)

---

## Problemas Resumidos

| Problema | Evidência | Impacto |
|----------|-----------|--------|
| **Repetição** | PROGRESSO FIRE em 2 seções diferentes | Poluição visual, confusão de prioridades |
| **TIME TO FIRE confuso** | 9 cards com targets misturados, P(success) isolada | Diego não sabe rapidamente: "Estou no caminho?" |
| **Falta de contexto** | Subsídios (R$770k, R$300k) aparecem em card mas não em sumário | Usuário não entende cenários alternativos |
| **DRIFT não destaca** | 10.4pp em card pequeno, sem relação visual com TIME TO FIRE | Não sabe se é crítico agora ou futuro |
| **SWR projetada redundante** | Mesma info na aba FIRE | Ocupação desnecessária de espaço |
| **Tornado isolada** | Gráfico no final, sem narrative | Diego não lê, não aplica à decisão |

---

## Sugestões Iniciais (Debate Necessário)

### A. Reorganizar TIME TO FIRE

**Opção 1 — Simplificar para cenário PRIMARY + alternativas**
```
┌─ TIME TO FIRE ─────────────────────────────┐
│ PRIMARY: Casado (P=83.8%)                   │
│ 13a9m até FIRE 50 · 2040 (53 anos)          │
│ Progress bar visual                         │
│ Alternativas: Solteiro (85.4%), C/ Filho (80.8%)  │
│ ────────────────────────────────────────────│
│ SENSIBILIDADE: ±10% patrimônio = ±1.2 anos │
│ (Maior driver: aporte mensal → +0.3a p/ R$5k↑)    │
└────────────────────────────────────────────┘
```

**Opção 2 — Tabela compacta com 3 cenários**
```
Cenário      | Alvo   | Target  | Data | P(success) | Gasto
─────────────┼────────┼─────────┼──────┼────────────┼────────
Solteiro     | 50 anos| FIRE 50 | 2037 | 85.4%      | R$220k
Casado (✓)   | 50 anos| FIRE 50 | 2037 | 83.8%      | R$270k
C/ Filho     | 50 anos| FIRE 50 | 2037 | 80.8%      | R$300k
...
```

### B. Reduzir duplicação

- Remover "PROGRESSO FIRE" da Seção 6 (já em Seção 2 + aba FIRE dedicada)
- Manter "APORTE DO MÊS" em destaque (acionável, recente)
- Mergir P(FIRE) scenario results (Base/Fav/Stress) com TIME TO FIRE como tooltip/expandível

### C. Destacar DRIFT máximo

- Se DRIFT > 5pp: alertar com cor (amarelo/vermelho)
- Explicitar: "IPCA+ 10.4pp underweight — ativa cascata ao próximo aporte"
- Ligar visualmente ao DCA STATUS e CASCADE CALCULATOR

### D. Reorganizar seções

**Proposta:**
```
ROW 1: KPIs Primários (PATRIMÔNIO, ANOS ATÉ FIRE, PROGRESSO FIRE)
ROW 2: Indicadores críticos (P(FIRE|≤50), DRIFT MÁXIMO, APORTE DO MÊS)
ROW 3: TIME TO FIRE (simplificado + contexto de cenários)
ROW 4: Sensibilidade (Tornado + narrativa: "maior driver = aporte mensal")
ROW 5: Contexto de Mercado (DÓLAR, BTC, IPCA+, RENDA+ — mas menor destaque)
ROW 6: Semáforos de Gatilhos (monitorados, acionáveis)
```

---

## Referências de Ferramentas

Agentes: passar para análise/contextualização:

### BOLDIN (Brasil)
- **O que é**: Dashboard de análise macroeconômica + taxa de câmbio + ativos brasileiros
- **Usar para**: DRIFT monitorado em real-time, alertas de câmbio, análise de taxas
- **Ref**: https://www.boldin.com.br (ou app)

### Research Affiliates — Asset Allocation Interactive (AAI)
- **O que é**: Expected returns por asset class, atualiza mensal
- **Usar para**: Validar premissas de rentabilidade (vs MC hardcoded)
- **Ref**: https://www.researchifficates.org/our-research/

### Morningstar X-Ray
- **O que é**: Decomposição de portfólios, factor exposure, ESG
- **Usar para**: Auditoria de factor exposure (AVGS vs SWRD), tail risk
- **Ref**: https://www.morningstar.com/x-ray

### Vanguard Investment Analysis Dashboard
- **O que é**: Asset allocation guidance, CME FedWatch integration
- **Usar para**: Scenario analysis, macro correlation
- **Ref**: https://vgfunds.vanguard.com/advisors/

### AQR Insights (Blog + Papers)
- **O que é**: Factor research, market regime analysis
- **Usar para**: Validação de tail risk, tornado drivers
- **Ref**: https://www.aqr.com/insights

### FactSet + Capital IQ
- **O que é**: Professional data terminals (caro, mas acesso a earnings, comps)
- **Usar para**: Due diligence em holdings específicas (ex: AVGS manager track record)
- **Ref**: Por subscrição corporativa

---

## Questões para o Time

### FIRE (análise de cenários)
- Qual cenário (Solteiro/Casado/C/Filho) deve ser o PRIMARY na aba NOW?
- Deve TIME TO FIRE mostrar FIRE 50 E 53 lado a lado, ou priorizar 50?
- Como comunicar sensibilidade (±1.2 anos) sem sobrecarregar o card principal?

### Dev (implementação)
- Qual layout é mais legível — tabela compacta ou cards simplificados?
- Tornado deve ser sempre visível na NOW ou doar para aba FIRE?
- CONTEXTO DE MERCADO (DÓLAR, BTC) deve estar na NOW ou em aba dedicada?

### Advocate (stress-test)
- Em cenário STRESS, TIME TO FIRE muda para "15a3m" — como avisar Diego sem criar pânico?
- DRIFT 10.4pp é aceitável agora ou deveria triggar ação imediata?

### Bookkeeper (dados)
- APORTE DO MÊS está sincronizado com cascata de aportes?
- P(FIRE) recalcula daily ou semanal? Mostrar timestamp da última atualização?

---

# DEBATE COMPLETO — RESPOSTAS DOS AGENTES

## 1. FIRE — Estrutura Recomendada para TIME TO FIRE

**Veredicto**: FIRE 53 é o target PRIMARY. FIRE 50 é aspiracional (possível em 2034 deterministicamente, P(success) 85.4%).

**Cenário Primary**: "Atual (Solteiro)" até evento de casamento (gatilho ~Jun 2026).

**Recomendação de layout**:
- 1 card primary em destaque: FIRE 53 · 2040 · 14 anos · P(90.4% base, range 86.8%–94.1%)
- Badge abaixo: "FIRE 50 — aspiracional, threshold em 2034 se SWR ≤ 3.0%"
- Tabs colapsáveis: [Casado] [C/Filho] com P(success) reduzido (88.8%, 85.8%)
- Mini-tabela sensibilidade: [R$20k/87.1%] [R$25k/89.9%] [R$30k/91.8%] com destaque no atual

**Premissas FIRE**:
- P(FIRE) atualizado: 2026-04-13T08:41:44 (seed=42, MC 10k sims)
- Guardrails: spending entre R$180k–R$300k via spending_smile
- Falsificabilidade: P(stress) < 75% = plano em risco (critério oficial em carteira.md)

---

## 2. DEV — Proposta de Layout e Arquitetura

**Recomendação**: **Opção C Híbrida** — implementar rápido (simplificação NOW) + preparar para modular (tabs de perfil).

**Layout FIRE 50/53 — Mockup**:
```
┌─ TIME TO FIRE ─────────────────────────────┐
│ FIRE 53: 2040 (14 anos)                    │
│ Atual (Solteiro) • R$250k/ano              │
│ P(sucesso): 90.4% [base] | 86.8–94.1% [range]│
│ Status: ✅ VERDE (on-track)                 │
│                                             │
│ Aspiracional: FIRE 50 em 2034 (P=85.4%)   │
│ Sensibilidade: [R$20k: 87.1%] [R$25k: 89.9%] [R$30k: 91.8%] │
│ [> Cenários Alternados] [> Tornado Drivers]│
└─────────────────────────────────────────────┘
```

**Duplicações Removidas**:
1. PROGRESSO FIRE: consolidar ROW 4 + ROW 6 em 1 card
2. APORTE DO MÊS: mover de ROW 5 para colapsável em DCA Status
3. CONTEXTO DE MERCADO: reduzir 4 cards para 1 linha compacta (💵 R$5.021 | ₿ $72.926 | IPCA+ 6.07%)

**Testes Impactados**: 3 testes falham em SMART mode (rápido fix: 15–20 min)

**Esforço Total**: 6–8h (Opção A + C) ou 10–12h (Opção B modular completa)

**Bloqueadores Técnicos**: 2 campos faltando em dados (ver Bookkeeper abaixo)

---

## 3. ADVOCATE — Stress-Test dos Cenários Críticos

**Veredictos por Cenário**:

| Cenário | Status | Risco | Mitigação Crítica |
|---------|--------|-------|------------------|
| Drawdown 30% + MC desatualizado | REVISÃO | ALTO | Recalcular MC com patrimônio corrente; timestamp obrigatório |
| Casamento (spending ↑ R$250k→R$270k) | REVISÃO | MÉDIO | Separar degradação por mercado de mudança por evento planejado |
| Recessão (aporte R$25k→R$10k) | REVISÃO | ALTO | Estender tabela sensibilidade para R$10k–R$40k |
| **FIRE 50 em 2034** | **VETO** | ALTO | Lógica condicional: if SWR ≤ 3.0% AND ano ≥ 2034 → "FIRE 50 disponível agora" |
| Múltiplos alertas simultâneos | REVISÃO | MÉDIO | Taxonomia: AGIR AGORA / MONITORAR / CONTEXTO com critérios objetivos |
| Ruído de simulação MC | PASS | BAIXO | Verificar seed=42 fixo em pipeline (se sim, problema inexistente) |

**Vetos Bloqueantes**:
1. ✗ FIRE 50 não pode exibir "aspiracional" quando SWR_current ≤ 3.0% — é factualmente errado

**Guardrails Recomendados**:
- G1: Timestamp de patrimônio em todo P(success)
- G2: Linha de falsificabilidade visível (P(stress) < 75% = em risco)
- G3: Separação visual dado vs interpretação
- G4: Versão do MC exibida (Bloco A, 2026-04-06)
- G5: Checklist de evento de vida ao mudar tab

---

## 4. BOOKKEEPER — Auditoria Técnica e Sincronização

**Status Geral**: Pipeline ~85% pronto, **2 bloqueantes críticos** impedem renderização completa.

### Bloqueantes

**#1: fire_matrix.json não tem P(FIRE) por perfil** ✗
- Sintoma: Tabs [Atual] [Casado] [C/Filho] não conseguem ler P(FIRE) dos perfis
- Solução: Refactor `reconstruct_fire_data.py` para rodar MC 4 vezes (1 por perfil)
- Tempo: 2–3h | Risco: MÉDIO

**#2: swr_current não está em data.json** ✗
- Sintoma: Bloco "FIRE 50 disponível" não consegue checar `if SWR_current ≤ 3.0%`
- Solução: 1 linha em `generate_data.py` — `swr_current = patrimonio / (gasto / 4%)`
- Tempo: 15 min | Risco: BAIXO
- **Critério**: Se SWR ≤ 3.0%, FIRE 50 é viável; se > 3.5%, "aspiracional"

**#3: Flag "MC desatualizado"** (nice-to-have)
- Sintoma: Dashboard não avisa quando patrimônio caiu > 15% do pico E MC > 7 dias antigo
- Tempo: 30 min

### Frequência de Recalculate

| Métrica | Arquivo | Frequência | Lag | Status |
|---------|---------|-----------|-----|--------|
| P(FIRE@53) base | `dashboard_state.json` | MANUAL | T+0 | ✓ PRONTO |
| Range [stress→fav] | `fire_matrix.json` | MANUAL | T+0 | ✓ PRONTO |
| Sensibilidade aporte | `fire_aporte_sensitivity.json` | MANUAL | T+0 | ✓ PRONTO |
| **swr_current** | `data.json` | — | — | ✗ FALTA |
| **P(FIRE) perfis** | `fire_matrix.json` | — | — | ✗ FALTA |
| **MC desatualizado** | `data.json.flags` | — | — | ✗ FALTA (nice) |

**Timestamp**: Todos os P(success) devem incluir `_generated` (2026-04-13T08:41:44)

---

# PRÓXIMOS PASSOS (SEQUÊNCIA ORDENADA)

## Fase 1: Unblock (4h, DEV + BOOKKEEPER)
1. **Bookkeeper**: Implementar `swr_current` em `generate_data.py` (15 min)
2. **Bookkeeper**: Refactor `reconstruct_fire_data.py` para P(FIRE) por perfil (2–3h)
3. **Dev**: Atualizar `build_dashboard.py` para injeta R dados novos (30 min)
4. **Dev**: Rodar testes SMART para validar (15 min)

## Fase 2: Implementation (6–8h, DEV)
1. **Dev**: Refatorar TIME TO FIRE section (template.html, 2–3h)
2. **Dev**: Reduzir CONTEXTO DE MERCADO para 1 linha compacta (1h)
3. **Dev**: Consolidar PROGRESSO FIRE (removendo duplicação, 1h)
4. **Dev**: Adicionar Tornado colapsável em TIME TO FIRE (1h)
5. **Dev**: Tabs [Atual] [Casado] [C/Filho] com condicional SWR (1–2h)
6. **QA**: Rodar test_dashboard.py (15–20 min)

## Fase 3: Validation (2h, Diego)
1. **Diego**: Revisar novo layout em local (`python3 scripts/test_dashboard.py --smart`)
2. **Diego**: Testar tabs de perfil (clicar, verificar P(FIRE) muda)
3. **Diego**: Validar que FIRE 50 não aparece como "aspiracional" se SWR ≤ 3.0%

## Fase 4: Commit & Deploy
1. **Dev**: Commit com explicação de changes + bloqueantes resolvidos
2. **Dev**: Git push → GitHub Actions → deploy automático

---

## Referência de Imagens

User passou 3 screenshots:
- [Image #13]: Versão atual completa (todos os 7 ROWs)
- [Image #14]: Aba NOW — detalhe de KPIs primários e contexto
- [Image #15]: TIME TO FIRE — 9 cards confusos (problema raiz)
