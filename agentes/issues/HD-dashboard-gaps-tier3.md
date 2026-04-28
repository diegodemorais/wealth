# HD-dashboard-gaps-tier3: Dashboard Gaps Tier 3 — Decisões Metodológicas Pendentes

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-dashboard-gaps-tier3 |
| **Dono** | Head + Time |
| **Status** | Em andamento (T e U fechados; V/W pendentes) |
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

### T: P(FIRE Quality) — Métrica Separada do Headline ✗ FECHADO

**Status:** Fechado sem implementação — bloqueio metodológico. Data: 2026-04-28.

**Decisões tomadas:**
- Piso: R$200k lifestyle (ex-saúde), dinâmico com spending smile
- Tolerância: max 3 anos consecutivos abaixo do piso
- Denominador: N total (10k trajetórias)
- Gasto: lifestyle bruto proporcional (gasto_bruto × lifestyle_ratio)

**Bloqueio identificado:** o modelo de guardrails corta saúde e lifestyle proporcionalmente no mesmo valor (`gasto_bruto`). Para calcular "gasto_lifestyle" corretamente, seria necessário que os guardrails protegessem saúde (categoria inelástica) e só cortassem lifestyle. Sem essa separação, a extração `gasto_lifestyle = gasto_bruto × lifestyle_ratio` resulta em P(quality) = 29.5% — implausível vs literatura (esperado 75-85% para SWR 2.4%).

**Por que não implementar opção simplificada (B):** P(gasto_bruto >= R$220k) é métrica sem benchmark na literatura, arbitrária, e gera confusão vs headline P(FIRE) = 86.1%.

**Pré-requisito para reabrir:** separar saúde de lifestyle nos guardrails (FR-guardrails-categoria-elasticidade). Após isso, recalcular P(quality) com modelo correto.

**Referência:** debate completo em sessão 2026-04-28. Quant: 2 bugs corrigidos. FIRE + Head: 2-0 por C (fechar).

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

- [x] Gap T — fechado sem implementação (bloqueio: guardrails não separam saúde de lifestyle)
- [x] Gap U (valuation spreads) — **RESOLVIDO 2026-04-28**: AQR HML Devil Monthly (URL pública sem auth). Proxy AVGS = HML 58/42 + KF SMB. Widget semáforo implementado em Portfolio tab. Status atual: P42 neutro.
- [ ] Gap V (imóvel) — aguarda input de Diego sobre intenção futura com imóvel e terreno
- [ ] Gap W (tracking error) — pode ser discutido junto com Gap H (factor drought) do Tier 1
