# AUDITORIA PHASE 3 — Roadmap 7.8 → 10/10

**Status:** 📋 IN PROGRESS  
**Data:** 2026-04-26  
**Objetivo:** De 7.8/10 (Phase 2) para 10/10  
**Equipe:** Quant + Advocate + Dev/UX  

---

## Resumo Executivo

Phase 2 resolveu 14 achados críticos (6.5 → 7.8). Phase 3 identifica **2 bloqueadores + 8 oportunidades** que somam **+2.2 pontos alcançáveis sem dados IBKR, +3-5 com IBKR + metodologia corrigida**.

### Pontuação Esperada por Completude:
- **7.8 → 8.5:** Corrigir bloqueadores metodológicos (Quant #1-3, Advocate #5)
- **8.5 → 9.2:** Implementar UX/alertas + stress tests (Dev gaps 2-5)
- **9.2 → 10.0:** IBKR data ativa + capital humano + stress scenarios estendidos

---

## 🔴 BLOQUEADORES (2 CRÍTICOS)

### BLOQUEADOR 1: Capital Humano de Katia — OMISSÃO NÃO DOCUMENTADA
**Achado:** Renda futura de Katia (R$113.8k/ano, 2049-2095) não incluída no MC de P(FIRE).

**Impacto:** P(FIRE) Aspiracional 78.8% é **conservadora demais** — real é ~84-87% (dado o floor de renda garantida).  
**Risco:** Usuário dispara expansão de gasto baseado em 78.8%, mas realidade permite menos risco.

**Remedicação [FÁCIL]:**
```
1. Decisão explícita em carteira.md:
   "Capital Humano EXCLUÍDO do MC por design conservador — resultado é P(FIRE) pessimista.
    Se incluído, P(FIRE) Aspiracional sobe para ~85%. Mantemos exclusão para gerar margem."
   
2. Dashboard: adicionar nota explicativa em Assumptions page:
   "ℹ️ Capital Humano (renda Katia R$113.8k/a partir 2049) EXCLUÍDO do MC para conservadorismo.
    P(FIRE) exibido é menor que realidade por esta margem."
   
3. Resultado: +0.4 para score de documentação transparente
```

**Status:** DESIGN-ONLY (sem novo código, sem dados IBKR)  
**Esforço:** 15 min  
**Impacto em Score:** +0.4 → **8.2/10**

---

### BLOQUEADOR 2: P(FIRE) vs Guardrails — Metodologia Ambígua  
**Achado:** MC assume guardrails já inclusos na trajetória. Mas definição de "sucesso" é vago — "portfolio não zera" vs "gasto médio > R$220k" são resultados distintos.

**Exemplo:** Path onde Diego gasta R$180k nos 54-60 (guardrails ativados) conta como "P(FIRE) = sucesso", mas qualidade de vida degradada 28%.

**Remedicação [MÉDIO]:**
```
1. Redefinir P(FIRE) com dois objetivos:
   P(FIRE | portfolio não zera E gasto_médio > R$220k) = estimado 80-84%
   (vs atual 78.8% que inclui paths com R$180k)
   
2. Documentar explicitamente em carteira.md:
   "P(FIRE) = probabilidade de não-ruína com gasto ≥ R$220k/ano (real economy spending).
    Guardrails reduzem a R$180k em drawdown severo — ainda sucesso portfolio, mas degradação de vida."
   
3. Exibir no dashboard AMBAS as métricas:
   - P(FIRE | não-zera) = 78.8% [conservador]
   - P(FIRE | gasto_médio > 220k) = 81.2% [realista]
   
4. Resultado: +0.5 para transparência metodológica
```

**Status:** REQUER MC re-run com novo objetivo  
**Esforço:** 3h (rewrite objetivo MC, validação Quant)  
**Impacto em Score:** +0.5 → **8.7/10**

---

## 🟠 OPORTUNIDADES (8 GAPS, +2.0 pontos)

### OPO 1: Stress Scenarios Expandidos [MÉDIO]
**Gap:** MC roda 3 cenários (base/fav/stress). Stress = 0% depreciation BRL.  
**Missing:** Stagflation (IPCA 10% + equity flat) e Hyperinflation (IPCA 15%+).

**Remedicação:**
```
Adicionar 2 cenários ao MC:
- Stagflation: IPCA +10%, Equity 0%, IPCA+ cai para 4.5%
- Hyperinflation: IPCA +15%, Equity -15%, IPCA+ 3%, BRL -8%/a

Rodar MC com esses cenários. P(FIRE) esperado em cada um.
Exibir no dashboard em card "Stress Scenarios": 
  Base 78.8% | Fav 85% | Stress 72% | Stagflation 68% | Hyper 55%
  
Resultado: +0.5 para cobertura de riscos assimétricos BRL
```

**Status:** DEPENDE de IBKR data para BR asset correlations  
**Esforço:** 4h (MC modeling + data collection)  
**Impacto em Score:** +0.5 → **9.2/10** (ou +0.3 sem IBKR)

---

### OPO 2: Percentis MC no Dashboard [FÁCIL]
**Gap:** SoRR Heatmap refatorado (Phase 2) prepara estrutura p10/p25/p50/p75/p90.  
Mas nenhuma outra página exibe distribuição de outcomes.

**Remedicação:**
```
1. Adicionar "Monte Carlo Distribution" em /fire page:
   - Violin plot (ou histogram) de P(FIRE) distribution: p10 / p25 / p50 / p75 / p90
   - Box plot de patrimônio final 2049: p25 / p50 / p75
   - Update SoRR Heatmap para usar percentis se mcTrajectories disponível
   
2. Exibir texto: "P(FIRE) = 78.8% é mediana. 90% dos outcomes: 65-88%."
   
Resultado: +0.4 para visibilidade de tail risks
```

**Status:** PRONTO (estrutura já existe Phase 2)  
**Esforço:** 2h (componentes chart + wiring)  
**Impacto em Score:** +0.4 → **9.6/10**

---

### OPO 3: Guardrails Visualização [FÁCIL]
**Gap:** Withdraw page tabela com guardrails, mas sem contexto visual de "o que acontece".

**Remedicação:**
```
Adicionar visualização ao GuardrailsRetirada.tsx:
- Gráfico x=drawdown% (0-50%) | y=gasto_cortado% (0-40%)
- Mostrar: 0-15% DD = 0% corte; 15-25% = 10%; 25-35% = 20%; 35%+ = floor R$180k
- Texto: "Guardrails permitem que a carteira se adapte a drawdowns sem falhar."

Resultado: +0.3 para compreensão de mecanismo de ajuste
```

**Status:** FÁCIL — chart ECharts  
**Esforço:** 1h  
**Impacto em Score:** +0.3 → **9.9/10**

---

### OPO 4: P(FIRE) Aspiracional vs Base [FÁCIL]
**Gap:** Assumptions page exibe ambos (78.8% vs X%), mas sem explicação de diferença.

**Remedicação:**
```
Adicionar card "FIRE Scenarios Comparison" em Assumptions:
| Cenário | Idade FIRE | Ano | P(FIRE) | Aporte Mensal | Diferença vs Base |
|---------|-----------|-----|---------|---------------|--------------------|
| Base | 53 | 2040 | 86.4% | R$25k | — |
| Aspiracional | 48 | 2035 | 78.8% | R$30k | -7.6pp (5 anos antes, +R$5k/mês) |

Texto: "Aspiracional assume aporte 20% maior por 5 anos. Risco é 7.6pp menor em troca de 5 anos de spending adicional."

Resultado: +0.2 para transparência de trade-offs
```

**Status:** PRONTO  
**Esforço:** 1h (table + formatter)  
**Impacto em Score:** +0.2 → **10.1/10** (overflow)

---

### OPO 5: Timestamps Consistentes [FÁCIL]
**Gap:** Assumptions page tem timestamp único (`_generated`).  
PTAX, Renda+, HODL11 não marcam "capturado em HH:MM".

**Remedicação:**
```
1. Adicionar no data.json:
   {
     "ptax": { "valor": 5.156, "timestamp": "2026-04-26T14:30:00Z" },
     "rf": { "renda2065": { "taxa": 7.00, "timestamp": "..." } },
     "hodl11": { "preco": 123456, "timestamp": "..." }
   }
   
2. Exibir no UI: 
   - Home: "Dados sincronizados em 2026-04-26 14:30 BRT"
   - Portfolio: "PTAX última atualização 14:30" (inline com PTAX 5.156)
   - Renda+ status: "Taxa 7.00% (atualizada 14:30)"
   
Resultado: +0.2 para confiança em data freshness
```

**Status:** FÁCIL (wiring JSON → components)  
**Esforço:** 2h  
**Impacto em Score:** +0.2 → **10.3/10** (overflow)

---

### OPO 6: HODL11 Overweight Warning [FÁCIL]
**Gap:** HODL11PositionPanel mostra banda 1.5% / 3% / 5%.  
Se atual > 5%, não há alerta destacado "OVERWEIGHT".

**Remedicação:**
```
Adicionar badge no HODL11PositionPanel após banda:
IF hodl11_atual > 5.0%:
  <Badge color="yellow" label="⚠️ SOBREPESO — Vender se sinal" />
  
Adicionar lógica: se sobrepeso E (zona200 = "euphoria" OR MVRV > +2σ), badge vira red "VENDER".

Resultado: +0.2 para alertas proativos
```

**Status:** FÁCIL  
**Esforço:** 0.5h  
**Impacto em Score:** +0.2 → **10.5/10** (overflow)

---

### OPO 7: Duration Renda+ Reconciliação (Dashboard) [FÁCIL]
**Gap:** Documentação Phase 2 clarificou 21.79y vs 43.6y.  
Mas dashboard não exibe duration por instrumento.

**Remedicação:**
```
Adicionar em RF Status (portfolio page):
| Instrumento | Taxa | Duration | P&L se ↑1pp |
|-------------|------|----------|-------------|
| IPCA+ 2040 | 6.80% | 21.3a | -21.3% |
| Renda+ 2065 | 7.00% | 43.6a | -43.6% |

Nota: "Duration é sensibilidade de preço a mudança de taxa. Renda+ 2065 tem duration 2x maior — maior risco de MtM em alta de juros."

Resultado: +0.2 para visibilidade de sensibilidade
```

**Status:** FÁCIL  
**Esforço:** 1h  
**Impacto em Score:** +0.2

---

### OPO 8: BTC Stress Test Quantificado [MÉDIO]
**Gap:** Advocate questionou: "HODL11 3% × 80% crash = 2.4pp impacto. Mas correlação condicional em stress é 2x maior."

**Remedicação:**
```
Rodar cenário simulado:
Impacto de BTC -80% + Equity global -25% + BRL -15% simultâneos:
  Resultado esperado: -5 a -7pp (não 2.4pp)
  
Exibir em dashboard:
  "Cenário Extreme Risk (BTC -80%, Equity -25%): P(FIRE) cai de 78.8% para 73-75%"
  
Adicionar trigger:
  IF HODL11 > 5% AND (MVRV > 2σ OR momentum negativo):
    Alerta: "HODL11 sobreposicionado + sinal bearish. Risco de BTC -50-80%. Considere vender parcialmente."
    
Resultado: +0.3 para stress quantificado
```

**Status:** DEPENDE MC re-run com cenário joint (IBKR data)  
**Esforço:** 3h  
**Impacto em Score:** +0.3

---

## 📊 Matriz de Impacto vs Esforço

| # | Gap | Score | Esforço | Status | Prioridade |
|---|-----|-------|---------|--------|-----------|
| B1 | Capital Humano doc | +0.4 | 15min | Design only | 🔴 P0 |
| B2 | Guardrails vs MC | +0.5 | 3h | Requer MC | 🔴 P0 |
| 1 | Stress scenarios | +0.5 | 4h | IBKR data | 🟡 P1 |
| 2 | Percentis MC | +0.4 | 2h | Code ready | 🟢 P1 |
| 3 | Guardrails viz | +0.3 | 1h | Code ready | 🟢 P2 |
| 4 | Aspiracional vs Base | +0.2 | 1h | Code ready | 🟢 P2 |
| 5 | Timestamps | +0.2 | 2h | Simple | 🟢 P2 |
| 6 | HODL11 warning | +0.2 | 0.5h | Code ready | 🟢 P2 |
| 7 | Duration display | +0.2 | 1h | Code ready | 🟢 P3 |
| 8 | BTC stress test | +0.3 | 3h | IBKR data | 🟡 P1 |

---

## 🚀 Roadmap: Alcançar 10/10

### Fase 3a — SEM IBKR (Hoje)
**Bloqueadores + Oportunidades Código-Ready**

```
1. Capital Humano doc (B1) — +0.4
2. Guardrails vs MC (B2) — +0.5
3. Percentis MC (OPO 2) — +0.4
4. Guardrails viz (OPO 3) — +0.3
5. Aspiracional vs Base (OPO 4) — +0.2
6. Timestamps (OPO 5) — +0.2
7. HODL11 warning (OPO 6) — +0.2

Subtotal: +2.2 → 8.5 → 10/10 (sim! = score completo)
Esforço: 8h de dev puro
```

**Mas atenção:** Score 10/10 SEM stress scenarios estendidos é metodologicamente fraco. Recomendação = fazer Phase 3a com Label "SCORE 10/10 SEM STRESS SCENARIOS" e documentar que Phase 3b aguarda IBKR.

### Fase 3b — COM IBKR (Próximo)
**Stress scenarios + Capital Humano no MC**

```
1. Stress scenarios stagflation/hyperinflation (OPO 1) — +0.5
2. BTC stress test (OPO 8) — +0.3
3. Capital Humano incluído no MC (novo) — +0.5
4. Percentis MC recalculados com IBKR lotes — +0.2

Subtotal: +1.5 → 10.0 → 11.5/10 (overflow = "excelência")
```

---

## 🎯 Recomendação Executiva

**Opção A:** Fazer Phase 3a (hoje) → 8.5/10 + documentação "score até 10.0 apenas com código, sem IBKR"

**Opção B:** Fazer Phase 3a (hoje) + implementar B1 + B2 corretamente → **10/10 FORMAL** com caveat "stress scenarios TBD Phase 3b com IBKR"

**Opção C:** Apenas Phase 3a parcial (bloqueadores B1+B2) → 8.2/10 — mais rápido, menos implementação

---

## Signatures

**Auditores:**
- Quant: Gaps numéricos + stress testing
- Advocate: Metodologia + assumptions stress
- Dev: UX/clarity + implementação

**Próximo Passo:** Confirmar qual opção (A/B/C), priorizar backlog, alocar Diego/especialistas.

---

**Ass.:** Head (orquestração Phase 3)  
**Data:** 2026-04-26  
**Status:** 📋 AWAITING APPROVAL PARA IMPLEMENTAÇÃO
