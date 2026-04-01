# FI-equity-redistribuicao: 20% liberados do JPGL — para onde redistribuir?

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-equity-redistribuicao |
| **Dono** | 02 Factor |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 02 Factor, 16 Zero-Based, 04 FIRE, 10 Advocate, 14 Quant, 15 Fact-Checker, 06 Risco, 12 Behavioral |
| **Co-sponsor** | 04 FIRE |
| **Dependencias** | FI-jpgl-zerobased (concluída 2026-04-01) |
| **Criado em** | 2026-04-01 |
| **Origem** | FI-jpgl-zerobased — JPGL eliminado (0%), liberando 20% do equity block para redistribuição |
| **Concluido em** | 2026-04-01 |

---

## Motivo / Gatilho

FI-jpgl-zerobased (2026-04-01) concluiu que JPGL não deve ser adicionado. Target = 0%. Com isso, **20% do bloco equity ficaram sem alocação definida**.

A decisão de redistribuição é separada da decisão sobre JPGL — esta issue existe para responder especificamente: dado o perfil de Diego e o universo UCITS disponível, como alocar esses 20% dentro do equity block?

---

## Descrição

**Pergunta central:** "Dos 20% do equity liberados do JPGL, qual é a melhor redistribuição dentro do bloco equity?"

Equity block atual (pós-FI-jpgl-zerobased):
- SWRD: 35%
- AVGS: 25%
- AVEM: 20%
- JPGL: **0%** (eliminado)
- **Pendente redistribuição: 20%**

Alternativas a analisar (sem pré-julgamento):
1. **SWRD +20%** (35% → 55%): simplificação máxima, market-cap weight puro, TER mínimo
2. **AVGS +20%** (25% → 45%): máximo factor tilt, mas tail risk elevado
3. **AVEM +20%** (20% → 40%): máxima diversificação geográfica, value spreads atrativos
4. **AVGS +10% + AVEM +10%** (35%/30%): split equilibrado
5. **SWRD +10% + AVGS +10%** (45%/35%): mais neutro com tilt moderado
6. **SWRD +10% + AVEM +10%** (45%/30%): neutro + diversificação geográfica
7. **Split três vias** (ex: SWRD+7%, AVGS+7%, AVEM+6%): diversificação da decisão
8. **Zero-Based choice**: sem contexto da carteira atual, o que um analista independente alocaria?

---

## Escopo

- [ ] Zero-Based: análise sem contexto da carteira atual — dado 10% para alocar em equity UCITS, onde colocaria?
- [ ] Factor: comparação de factor loadings e expected returns entre as opções
- [ ] FIRE: impacto de cada opção em P(FIRE) e SWR — qual maximiza P(meta)?
- [ ] Advocate: stress-test adversarial — qual opção falha mais feio?
- [ ] Risco: perfil de drawdown e correlação de cada opção com o portfolio atual
- [ ] Behavioral: qual opção tem menor risco comportamental de abandonar em drawdown?
- [ ] Quant: validar cálculos de retorno esperado ponderado para cada cenário
- [ ] Fact-Checker: verificar claims acadêmicos sobre EM premium e small-value vs market-cap
- [ ] Veredicto ponderado (Zero-Based peso 4x)
- [ ] Atualizar carteira.md com nova alocação

---

## Raciocínio

**Argumento central:** a decisão de redistribuição não é óbvia. SWRD é a resposta "safe default" (market-cap weight, maior AUM, menor TER). AVGS é a resposta de maior conviction fatorial. AVEM é a resposta de diversificação geográfica. A pergunta correta não é "qual é mais seguro" — é "qual maximiza P(FIRE 50) dado o perfil de Diego."

**Incerteza reconhecida:**
- Factor premiums têm variância alta em janelas curtas — a decisão deve otimizar para P(meta), não para retorno esperado máximo
- AVGS já tem tail risk aceito explicitamente (XX-lacunas-estrategicas, 2026-04-01): +10pp de AVGS implica aceitar mais tail risk; +20pp seria muito além do limite
- AVEM: revertendo em 2026 (+14.83% YTD), value spreads no 90th+ percentile — mas concentração em EM já em 20%
- SWRD: âncora market-cap, menor TER (0.12%), menor tracking error — opção "safe default" mas menor expected return

**Falsificação:**
- Se Zero-Based independente recomendar a mesma opção que o time prefere → confirma
- Se Zero-Based recomendar opção diferente → debate real

**Restrição operacional:** todos os ativos estão no lucro — não se vende para rebalancear. A redistribuição acontece via direcionamento de aportes futuros para os ETFs sub-alocados. A decisão de hoje define o destino dos próximos aportes de equity.

---

## Análise

### Retornos calculados por opção (BRL base, dep. 0.5%)

| Opção | SWRD | AVGS | AVEM | Retorno |
|-------|------|------|------|---------|
| A — Time | 40% | 35% | 25% | **5.935%** |
| B — Diego | 50% | 30% | 20% | **5.850%** |
| Original (com JPGL) | 35% | 25% | 20%+JPGL20% | 5.855% |

Spread A vs B: **8.5bps** — dentro do ruído estatístico (Advocate: spread total entre todas as opções = 17.5bps < erro de estimativa dos premiums).

### Comparação com referências externas

| Referência | Neutro (SWRD-like) | Factor tilt | EM |
|---|---|---|---|
| Ben Felix (int'l) | ~70-75% | ~15% SCV | ~10% |
| RR mediana | ~60-70% | ~15-20% | ~10-15% |
| Opção A (Time) | 40% | 35% | 25% |
| Opção B (Diego) | 50% | 30% | 20% |

### Debate — 3 fases concluídas

**Fase 1 (posições independentes):**
- Zero-Based: Opção 2 (AVGS 45%) — máximo factor tilt
- Factor: Opção 4 (AVGS 35%/AVEM 30%) — spread equilibrado
- FIRE: Opção 4 (AVGS 35%/AVEM 30%)
- Advocate: Opção 5 (SWRD 45%/AVGS 35%/AVEM 20%) — mais robusto

**Fase 2 (debate Zero-Based vs Factor/FIRE):**
- Zero-Based revisou: convergiu para Opção 4 (AVGS 45% sem stress test formal = inaceitável)
- Factor: propôs variante SWRD 40%/AVGS 35%/AVEM 25%
- Consenso emergente: AVGS 35% unânime. Debate residual: AVEM 25% vs 30%

**Fase 3 (consenso AVEM):**
- FIRE: AVEM 25% — SoRR, decade lost EM caberia inteiro no horizonte de 11 anos
- Advocate: AVEM 25% — correlação sobe para 0.90+ em stress, risco comportamental R$1M em EM

**Resultado fases 1-3:** Time propôs **Opção A: SWRD 40% / AVGS 35% / AVEM 25%**

**Contraposição Diego:** SWRD 50% / AVGS 30% / AVEM 20% (Opção B)
- Alinha com design original 50/50 neutro/fatorial
- Mais próximo de Ben Felix
- Spread de 8.5bps = irrelevante
- AVEM volta ao peso original (20%)

**Debate adicional (Factor + Advocate):**
- Factor: voto B — "50/50 é o Schelling point, behaviorally mais robusto, custo é 8.5bps que não se distingue de zero"
- Advocate: voto B — "menos atacável, restaura AVEM ao peso original, consistência interna"

### Voto Final — CONCLUÍDO (2026-04-01)

7 agentes votaram. **Unanimidade absoluta: 100% Opção B.**

| Agente | Peso | Voto | Argumento central |
|--------|------|------|-------------------|
| Zero-Based | 4x | **B** | 8.5bps = ruído; B é o ponto mais defensável entre os extremos; design 50/30/20 é o que um analista independente alocaria |
| Factor | 3x | **B** | 50/50 é o Schelling point, behaviorally mais robusto; 8.5bps não se distingue de zero |
| FIRE | 2x | **B** | SoRR: AVGS 35% aumenta drawdown early-FIRE sem ganho real de retorno; B reduz exposição sem sacrifício mensurável |
| Risco | 1x | **B** | AVGS 35% empurra portfolio para -45-50% BRL em crash 2008-style; tail risk aceito em 25%, não em 35% |
| Advocate | 1x | **B** | Menos atacável, restaura AVEM ao peso original, consistência interna |
| Behavioral | 1x | **B** | Ownership effect: Diego propôs B → mantém em drawdown; hindsight bias de "eu sabia que 35% era demais" é evitado |
| Macro | 0.5x | **B** | EM sob pressão em 2026 (dólar forte, Fed restritivo, fiscal BR deteriorante); +14.83% YTD = reversão técnica, não ciclo secular |
| **Score** | **13.5x** | **B — unânime** | |

---

## Conclusão

**Veredicto: Opção B — SWRD 50% / AVGS 30% / AVEM 20%**
**Unanimidade: 7/7 agentes, 13.5x/13.5x ponderado.**

Convergência por caminhos independentes: Factor (design), FIRE (SoRR), Risco (tail risk), Behavioral (ownership), Macro (ciclo EM), Advocate (consistência), Zero-Based (princípio de design). Não é groupthink — é consenso real.

### Veredicto Ponderado — CONCLUÍDO (2026-04-01)

| Agente | Peso | Voto | Justificativa |
|--------|------|------|---------------|
| Zero-Based | 4x | **B** | 8.5bps = ruído; design 50/30/20 defensável; B preserva arquitetura original |
| Factor | 3x | **B** | 50/50 = Schelling point; custo 8.5bps = zero estatístico |
| FIRE | 2x | **B** | SoRR: AVGS 35% aumenta drawdown early-FIRE sem ganho real |
| Risco | 1x | **B** | AVGS 35% → -45-50% BRL em crash; tail risk aceito em 25%, não 35% |
| Advocate | 1x | **B** | Menos atacável, consistência interna, restaura AVEM ao peso original |
| Behavioral | 1x | **B** | Ownership effect + hindsight bias prevention; B mais robusto comportamentalmente |
| Macro | 0.5x | **B** | EM sob pressão 2026; +14.83% YTD = reversão técnica, não ciclo secular |
| **Score ponderado** | **13.5x** | **B — 100% unânime** | |

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | SWRD 50% / AVGS 30% / AVEM 20% (equity block, via aportes futuros) |
| **Estratégia** | Design 50/50 neutro/fatorial preservado. 50% SWRD absorve os 20% liberados do JPGL. Via aportes — sem vendas. |
| **Conhecimento** | Spread de 8.5bps entre A e B está dentro do ruído estatístico dos factor premiums (~200-300bps de erro padrão). Quando as opções são financeiramente equivalentes, a variável determinante é execução comportamental. |
| **Memória** | project_fi_equity_redistribuicao.md → atualizar status CONCLUÍDO |

### Retorno Ponderado do Portfolio (equity block, Opção B aprovada)

| Cenário | Cálculo | Retorno Ponderado |
|---------|---------|-------------------|
| Base (dep. 0.5%) | 50%×5.4% + 30%×6.5% + 20%×6.0% | **5.85%** |
| Favorável (dep. 1.5%) | 50%×6.4% + 30%×7.5% + 20%×7.0% | **6.85%** |
| Stress (dep. 0%) | 50%×4.9% + 30%×6.0% + 20%×5.5% | **5.35%** |

---

## Próximos Passos

- [x] Lançar todos os agentes em paralelo (Zero-Based obrigatório)
- [x] Debate estruturado multi-fase (3 rodadas concluídas)
- [x] Coletar votos finais dos 7 agentes
- [x] Consolidar veredicto ponderado — B unânime
- [x] Atualizar carteira.md com novo target (SWRD 50% / AVGS 30% / AVEM 20%)
- [x] Recalcular retorno ponderado do equity block
- [x] Commitar
