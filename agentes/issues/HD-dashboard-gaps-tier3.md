# HD-dashboard-gaps-tier3: Dashboard Gaps Tier 3 — Decisões Metodológicas Pendentes

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-dashboard-gaps-tier3 |
| **Dono** | Head + Time |
| **Status** | Backlog |
| **Prioridade** | Baixa |
| **Participantes** | Factor, RF, FIRE, Macro, Quant, Fact-Checker |
| **Co-sponsor** | Dev (implementação após decisão) |
| **Dependencias** | HD-dashboard-gaps-tier1, HD-dashboard-gaps-tier2 |
| **Criado em** | 2026-04-27 |
| **Origem** | Audit 7 agentes pós-HD-risco-portfolio — Tier 3 = requer debate metodológico ou dados externos antes de implementar |

---

## Motivo / Gatilho

Continuação do audit de 23 gaps. Tier 3 = 4 gaps que têm decisão metodológica pendente ou requerem dados externos que não estão no pipeline. Cada um precisa de debate específico antes de poder ser especificado para Dev.

Critério Tier 3: metodologia controversa, dados externos não disponíveis, ou tradeoff de interpretação que exige decisão explícita.

---

## Escopo

### T: P(FIRE Quality) — Métrica Separada do Headline

**Problema:** P(FIRE) headline = 86.4% inclui cenários onde Diego tecnicamente não depleta o portfolio mas gasta abaixo de R$220k/ano — "sucesso técnico, insucesso real".

**Decisão pendente:**
- [ ] Definir qual threshold de gasto define "FIRE quality" (R$220k? R$200k? 80% dos gastos-alvo?)
- [ ] Definir se exibir junto ao headline P(FIRE) ou em seção separada
- [ ] Decidir se inclui variabilidade temporal (pode cair abaixo do threshold temporariamente?)

**Debate necessário:** FIRE agent + Quant. Após decisão, pipeline simples e React trivial.

**Valor estimado pós-debate:** P(FIRE quality R$220k) ≈ 80-84% — diferença de 2-6pp vs headline.

---

### U: Factor Valuation Spreads — AVGS vs Histórico

**Problema:** Factor premium varia com valuation spreads. Se value/SCV está "barato" (spread acima da média histórica), expected return é maior. Se "caro", menor.

**Decisão pendente:**
- [ ] Definir fonte para valuation spreads históricos (Research Affiliates AAI? AQR? Ken French data library?)
- [ ] Definir frequência de atualização (mensal? trimestral?)
- [ ] Definir onde exibir (Portfolio tab? Assumptions tab?)

**Debate necessário:** Factor agent + Fact-Checker (verificar se dados são públicos e confiáveis).

**Valor:** Quando spreads estão wide = confirma tese AVGS. Quando compressed = sinal de atenção.

---

### V: Projeção de Ativos Não-Financeiros

**Problema:** Imóvel (equity R$298k) e terreno (R$150k) somam R$448k mas são tratados como estáticos. Eles devem crescer, depreciar ou manter valor em termos reais?

**Decisão pendente:**
- [ ] Definir premissa de apreciação imobiliária real (IGPM? 0% real? -1% real?)
- [ ] Imóvel tem hipoteca SAC até 2051 — como modelar o equity crescente?
- [ ] Terreno: intenção é vender ou manter? Quando?
- [ ] Deve aparecer na projeção FIRE como ativo ou separado?

**Debate necessário:** FIRE agent + Patrimonial agent + Diego (intenção com o imóvel e terreno).

**Valor:** R$448k em imóveis = 13% do patrimônio financeiro atual — materialmente relevante para FIRE number.

---

### W: Tracking Error Rolling AVGS vs SWRD

**Problema:** Tracking error de AVGS (SCV tilt) vs SWRD (market cap) é a métrica de "pain index" de factor investing. Quando tracking error está alto por muito tempo, investidores abandonam a estratégia — exatamente quando não deveriam.

**Decisão pendente:**
- [ ] Definir janela: 12 meses, 24 meses ou rolling ambos?
- [ ] Threshold de atenção: ex. -3pp acumulado em 24m = amarelo; -5pp = vermelho
- [ ] Onde exibir (Portfolio tab? Assumptions?)
- [ ] Integrar com factor drought counter (Gap H do Tier 1)?

**Debate necessário:** Factor agent + Behavioral agent (risco comportamental de abandono).

**Valor:** Alerta precoce de risco de abandono de estratégia no pior momento.

---

## Raciocínio

**Argumento central:** Tier 3 não é baixa prioridade por ser menos importante, mas porque a decisão metodológica deve vir antes da implementação. Implementar sem decisão = hardcoded arbitrário que vai ser questionado depois.

**Alternativas rejeitadas:** Implementar com premissas default sem debate — cria falsa precisão. Estas métricas são visíveis e serão questionadas.

**Incerteza reconhecida:** Gap V (imóvel) pode exigir decisão de Diego sobre intenção futura — difícil modelar sem input.

**Falsificação:** Se debate produz consenso claro, move para Tier 2 (sprint de implementação). Se debate é inconclusivo, issue permanece em backlog até evento externo (ex: Diego decide vender terreno).

---

## Análise

> A preencher conforme debates individuais acontecem.

---

## Conclusão

> A preencher ao finalizar (cada gap pode ter conclusão independente).

---

## Resultado

> A preencher ao finalizar.

---

## Próximos Passos

- [ ] Iniciar debate Gap T (P(FIRE quality)) — menor controvérsia, maior impacto imediato
- [ ] Gap W (tracking error) pode ser discutido junto com Gap H (factor drought) do Tier 1
- [ ] Gap V (imóvel) aguarda input de Diego sobre intenção futura
- [ ] Gap U (valuation spreads) aguarda verificação de fonte pública via Fact-Checker
