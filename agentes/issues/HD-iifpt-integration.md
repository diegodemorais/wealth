# HD-iifpt-integration: Aplicação do Framework IIFPT à Carteira de Diego

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-iifpt-integration |
| **Dono** | Head |
| **Status** | Em andamento (Dim 1 ✅, Dim 2-5 pendentes) |
| **Prioridade** | 🟡 Média |
| **Participantes** | Head (coordenação), FIRE, Tax, RF, Risco, Quant |
| **Criado em** | 2026-04-30 |
| **Origem** | Análise do paper IIFPT (Kothakota, SSRN 6030356, Dez 2025) |
| **Concluido em** | — |

---

## Contexto

O paper *Interdependent Integrative Financial Planning Theory* (Kothakota, SSRN 6030356, Dez 2025) propõe um framework matemático para planejamento financeiro integrado com 13 teoremas formais. A análise completa está registrada na sessão de 2026-04-30.

**Premissa de aplicação:** O artigo é a referência canônica para todas as decisões desta issue. Antes de qualquer implementação ou alteração, consultar o paper para verificar qual formulação matemática se aplica. Quando a realidade brasileira (Lei 14.754, Renda+, Simples Nacional, capital humano concentrado em empresa) divergir do framework americano, documentar explicitamente a adaptação e o racional.

**Referência:** `analysis/articles/ssrn-6030356.pdf`

---

## Arquitetura central do framework

Quatro camadas (resumo operacional):

| Tier | Componente | Pergunta |
|------|-----------|----------|
| 1 | Structural Tensor **S** | O que está estruturalmente acoplado? (lei tributária, atuária, portfólio) |
| 2a | Priority Matrix **Λ** | O que Diego se importa? (pesos w_k, soma = 1) |
| 2b | Discount Matrix **B(t)** | Quando importa? (β_k domain-specific, evolui com eventos de vida) |
| 3 | Γ_B = B^{-1/2} · T_eff · B^{-1/2} | Síntese: acoplamentos filtrados por prioridades e urgência |

Seis domínios: Cash Flow (CF), Retirement (Ret), Tax, Estate (Est), Risk Management (RM), Investment (Inv).

---

## Dimensão 1 — Priority Matrix Λ ✅ CONCLUÍDA (2026-04-30)

**Resultado:** `agentes/contexto/priority_matrix.json` criado. Λ calibrado: Inv 0.35 / Ret 0.25 / Tax 0.18 / CF 0.10 / RM 0.07 / Est 0.05.
**Método:** Blended RP + AHP (4 comparações forçadas + 2 clarificações). Tax = piso defensivo. RM = risco disability (quasi-CLT, sem cobertura). Est = deferral intencional pré-casamento.
**Regime:** r2_mid_career. Transição r3 ~2034. Trigger: patrimônio ≥ R$9M ou P(FIRE) ≥ 90% por 2 anos.

---

### Objetivo original
Calibrar os pesos w_k formalmente a partir de Diego, usando os métodos do paper (§9.4).

### Roteiro de entrevista (a conduzir com Diego)

**Bloco A — Direct Ranking (Method 1 do paper)**
1. Ordene os 6 domínios por importância pessoal hoje: CF, Ret, Tax, Est, RM, Inv.
2. O que te mantém acordado à noite em relação a finanças? (revela w dominante)
3. Se precisasse cortar 20% do esforço total de planejamento, qual domínio cortaria?

**Bloco B — Urgência / Discount Rates (Discount Matrix B(t))**
4. Para cada domínio: você quer resolver isso nos próximos 2 anos, 10 anos, ou "eventual"?
   - CF: urgente / moderado / paciente?
   - Ret: urgente / moderado / paciente?
   - RM (seguro, disability): urgente / moderado / paciente?
   - Tax (Lei 14.754, DARF): urgente / moderado / paciente?
   - Est (sucessão, testamento): urgente / moderado / paciente?
   - Inv: urgente / moderado / paciente?

**Bloco C — Prioridade × Urgência (valida separação Λ vs B(t))**
5. Tem domínio que você considera importante mas pode esperar? (alto w, baixo β)
6. Tem domínio que não te importa muito mas precisa resolver agora? (baixo w, alto β)

**Bloco D — Regime de vida**
7. Você está em: acumulação acelerada / pré-FIRE / outra fase?
8. Quando antecipa a transição para pré-FIRE (regime r3 do paper)? Estima ~2034?
9. Algum evento nos próximos 2 anos que pode mudar prioridades? (casamento, filho, saúde)

### Λ estimado atual (implícito — a validar com Diego)
| Domínio | w estimado | Comentário |
|---------|-----------|------------|
| Retirement | 0.45 | FIRE-50 é o norte |
| Investment | 0.30 | Instrumento principal |
| Tax | 0.10 | Lei 14.754 ativo |
| Cash Flow | 0.10 | Empresa + salário gerencia |
| Risk Management | 0.05 | Gap — subendereçado |
| Estate | 0.00 | Não endereçado |

---

## Dimensão 2 — Gaps Estratégicos

### Gap G1 — Risk Management (w_RM ≈ 0.05) **[CRÍTICO]**

**Fundamento no paper:** Theorem 7.4 (Stochastic Separability) demonstra que separabilidade é destruída por correlação entre β_k. Um evento de saúde ou perda de renda eleva β_CF, β_RM e β_Ret simultaneamente — exatamente o cenário de Marcus Jones (§8.4), que viu seu integration premium subir 34% pós-choque.

**Situação de Diego:** Capital humano R$3.65M (47% do patrimônio total) concentrado em empresa própria. Se empresa vai mal:
- β_CF ↑ imediato (sem renda para aportes)
- β_Ret ↑ (FIRE 2040 em risco)
- β_RM ↑ (disability sem cobertura)

**Ação a investigar:** Seguro de vida e disability insurance para empresa/empresário. Verificar com Patrimonial o que existe e o que falta. Quantificar o custo vs. o integration premium da cobertura.

**Adaptação BR:** Mercado de seguro de vida/disability no Brasil tem produtos distintos dos EUA (ILIT, GRAT não se aplicam). Avaliar produtos locais: DI (Doença Grave + Invalidez) + PGBL dentro da empresa.

---

### Gap G2 — Tax × Investment Coupling (forte, parcialmente endereçado)

**Fundamento no paper:** Appendix C classifica Tax ↔ Investment como Strong (S > 0.5). Sub-domain elements relevantes para Diego:
- Tax-Loss Harvesting → já rastreado
- Asset Location Optimization → IBKR vs. Brasil (Lei 14.754)
- Income Bracket Management → AGI control (DARF timing)

**Situação de Diego:** Lei 14.754/2023 cria coupling explícito que o framework americano não tem. DARF timing no IPCA+ Renda+ é o equivalente brasileiro de "income bracket management".

**Ação a investigar:** Modelar explicitamente o DARF timing como variável de otimização — quando realizar ganhos e quando diferir. Conectar ao regime Renda+ e ao calendário de aportes.

---

### Gap G3 — Regime Transition Anticipation (T7.6)

**Fundamento no paper:** Theorem 7.6 (Temporal Coupling) — ações ótimas hoje dependem do expected future priority path. Corollary 7.6.1 inclui β(t) futuro. Antecipação de regime tem valor positivo (Theorem 7.11).

**Situação de Diego:** Transição de r2 (Mid-career) para r3 (Pre-retirement) em ~2034 implica:
- β_Ret ↑ (urgência aposentadoria aumenta)
- β_CF ↑ (planejamento de fluxo de caixa pós-FIRE)
- β_Inv ↑ (glide path começa)

**Ação a investigar:** Definir formalmente o trigger de entrada em regime r3 (patrimônio? data? P(FIRE)?) e o que muda na estratégia quando ocorre. Isso se conecta ao FR-glide-path existente.

---

### Gap G4 — Estate Planning (w_Est ≈ 0.00)

**Fundamento no paper:** Theorem 7.2 (Priority Filtering) — com w_Est = 0, acoplamentos de estate não afetam estratégia. Matematicamente correto se essa for a preferência real.

**Ação:** Validar com Diego se w_Est = 0 é intencional ou negligência. Se intencional, documentar formalmente. Com casamento iminente, w_Est pode subir — o framework prevê exatamente essa dinâmica (Definition 4.9: Life-Cycle Priority Dynamics, β_Est > 0 com envelhecimento).

**Adaptação BR:** Estate tax americano (40% acima de $13.6M) não se aplica ao Brasil. No entanto: inventário, ITCMD, e proteção patrimonial para offshore são análogos brasileiros relevantes que o paper não cobre diretamente.

---

## Dimensão 3 — Novos Dados a Capturar

### D1 — Priority Matrix Λ como dado persistente

**Onde:** `dados/priority_matrix.json` (novo arquivo) ou campo em `carteira.md`

**Estrutura proposta:**
```json
{
  "priority_matrix": {
    "version": "2026-04-30",
    "method": "direct_ranking + interview",
    "weights": {
      "cf": 0.10,
      "ret": 0.45,
      "tax": 0.10,
      "est": 0.00,
      "rm": 0.05,
      "inv": 0.30
    },
    "notes": "w_est=0 intencional, rever após casamento"
  }
}
```

**Quando atualizar:** Após eventos sistêmicos (casamento, filho, saúde, mudança de empresa).

---

### D2 — Regime de Vida Atual

**Onde:** `agentes/contexto/carteira.md` — novo campo `regime_vida`

**Valores possíveis (baseados em Table 6.1 do paper, adaptados para BR):**
- r2_mid_career: acumulação acelerada, empresa sólida
- r3_pre_retirement: ~2034, β_Ret ↑, glide path ativo
- r4_early_retirement: FIRE atingido
- r6_health_crisis: trigger emergencial

**Dado a rastrear:** Data estimada de transição para r3 e gatilho formal.

---

### D3 — Domain Coverage Score

**O que é:** Para cada domínio, indicar se existe análise ativa, dado monitorado, e issue aberta.

**Estrutura:**
```
CF:  ✅ monitorado (gastos auditados HD-009, empresa income)
Ret: ✅ ativo (MC FIRE, P(FIRE), glide path)
Tax: ✅ ativo (Lei 14.754, DARF, TLH)
Est: ❌ zero cobertura
RM:  ⚠️  gap (sem disability/seguro sistematizado)
Inv: ✅ ativo (factor investing, SWRD/AVGS/AVEM)
```

---

### D4 — Coupling Intensity Reference (Appendix C do paper)

**O que é:** Tabela de referência dos acoplamentos por domínio para consulta interna.

**Onde guardar:** `agentes/referencia/iifpt-coupling-reference.md`

**Conteúdo:** Tabela completa do Appendix C com adaptações brasileiras anotadas (Lei 14.754, PGBL, INSS, Renda+, hipoteca SAC).

---

## Dimensão 4 — Dashboard

### DC1 — Domain Coverage Radar

**O que é:** Hexágono mostrando cobertura ativa nos 6 domínios IIFPT.

**Dados:** domain_coverage de D3 (acima). Cada domínio: 0 (sem cobertura) / 0.5 (parcial) / 1.0 (ativo).

**Onde no dashboard:** Tab NOW, seção de contexto ou wellness.

**Referência no paper:** §9.3 — "financial planners provide value by developing client relationship to understand potential structural changes, shifting priorities, and urgency."

---

### DC2 — Regime Indicator

**O que é:** Badge ou card mostrando regime atual (r2 mid-career) e data estimada de transição para r3.

**Dados:** `regime_vida` de D2.

**Onde:** Tab NOW, junto com o KpiHero ou wellness block.

---

### DC3 — Priority-Filtered FIRE Progress

**O que é:** Exibir P(FIRE) e patrimônio com nota sobre quais domínios estão influenciando a estimativa. Hoje o FIRE cálculo é quase exclusivamente Inv + Ret — o radar de cobertura deixaria visível que RM e Est estão fora.

**Nota:** Não implementar o tensor completo (impraticável sem calibração). O valor aqui é a *visibilidade* dos gaps, não a matemática completa.

---

### DC4 — Life Event Shock Impact (opcional / fase 2)

**O que é:** Simulador de choque: se Diego perde renda amanhã, o que muda em β_k e no P(FIRE)?

**Referência no paper:** §8.4 Marcus Jones — saúde dispara integration premium +34%. Table 4.4: systemic life events com domains afetados e direções.

**Adaptações BR:** Eventos mais relevantes para Diego:
- Perda de renda da empresa
- Casamento (prioridades mudam)
- Evento de saúde
- Mudança tributária (Lei 14.754 alterada)

---

## Dimensão 5 — Core / Arquitetura

### CC1 — `priority_matrix.json` no pipeline

**Ação:** `agentes/contexto/priority_matrix.json` criado (config manual, não gerado). Incluir no snapshot de `generate_data.py` e expor em `data.json` como campo `priority_matrix`.

**Invariante:** Λ é dado elicitado de Diego — nunca inferido pelo pipeline, nunca sobrescrito automaticamente.

---

### CC2 — Coupling Reference Table em `config.py`

**Ação:** Adicionar constante `IIFPT_COUPLING_INTENSITY` em `scripts/config.py` com a tabela de Appendix C adaptada para BR.

**Uso:** Referência para agentes ao avaliar se decisões em domínio A afetam domínio B.

---

### CC3 — `regime_vida` em `carteira.md`

**Ação:** Adicionar campo `regime_vida` com valor atual e data de última revisão. Documentar condições de transição para r3.

---

### CC4 — Integration Premium Estimativa para Diego

**O que calcular:** Estimativa simplificada do Π^det para a situação de Diego, usando:
- Δd = diferença entre estados ótimos integrado vs. separado
- |Γ| = norma do coupling matrix para os domínios com w_k > 0

**Referência:** Theorem 7.8 — V*_int - Σ w_k V*_sep ≥ ½ Δd^T |Γ| Δd

**Expectativa:** Lower bound que o americano (sem estate planning, estrutura mais simples). Estimativa Head: 2-5% NW vs. 5.9-11.6% nos casos americanos.

**Nota sobre calibração:** Os casos do paper (§8) são calibrados para EUA — GRATs, ILITs, estate tax, Roth conversions. Para Diego, os coupling mais fortes são Tax×Inv (Lei 14.754) e CF×Ret (empresa como aporte). O premium real é menor em absoluto mas a metodologia é válida.

---

## Restrições e Adaptações Brasileiras

| Conceito do Paper | Análogo Brasileiro | Notas |
|------------------|-------------------|-------|
| Estate Tax (40% > $13.6M) | ITCMD + inventário | Diego abaixo do limiar US; estate planning menor prioridade |
| Roth Conversion | Migração PGBL/tributação | Diferente — PGBL é contribuição dedutivelí, sem equivalente Roth exato |
| Social Security | INSS | Benefit estimado R$14-28k/ano real; análise em TX-inss-beneficio |
| Tax-Loss Harvesting | TLH sem wash sale BR | Mais simples — sem restrição de 30 dias |
| Disability Insurance | DI / invalidez parcial | Mercado BR menos desenvolvido para empresa |
| Human Capital | Empresa própria + salário | Concentrado — risco maior do que empregado diversificado |
| Life-Stage Regimes r1-r7 | Adaptados (sem Social Security aos 62-70) | r3 pre-retirement ainda relevante |

---

## Conclusao

> A preencher após implementação.
