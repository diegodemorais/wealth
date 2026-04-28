# HD-dashboard-gaps-tier3: Dashboard Gaps Tier 3 — Decisões Metodológicas Pendentes

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-dashboard-gaps-tier3 |
| **Dono** | Head + Time |
| **Status** | CONCLUÍDA — todos os 4 gaps encerrados (2026-04-28) |
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

### V: Projeção de Ativos Não-Financeiros ✓ RESOLVIDO 2026-04-28

**Decisões tomadas:**
- Apreciação: 0% real (Shiller, FIPE-ZAP deflacionado IPCA)
- Imóvel Pinheiros: vender em 2027 (mudança/casamento); equity líquido ~R$367k (IR 15% sobre ganho R$117k, custo RFB R$702.922)
- Terreno Nova Odessa: vender em 2031 (midpoint 2026-2037); equity líquido ~R$127.5k (IR 15%)
- FV@FIRE (4.85% real): imóvel ~R$590k + terreno ~R$169k = **~R$759k upside**
- Exibição: Assumptions tab — NOT incluído no P(FIRE) baseline

**Implementado:** seção "Ativos Não-Financeiros — Projeção de Venda" em Assumptions tab. Custo de aquisição RFB salvo em `reference_imovel_pinheiros.md`.

---

### W: Tracking Error Rolling AVGS vs SWRD ✓ RESOLVIDO 2026-04-28

**Decisões tomadas (Factor + Behavioral, 2026-04-28):**
- Janela: 12m (Factor — dados AVGS têm só 18m; 24m seria truncado)
- Threshold amarelo: -5pp/12m; vermelho: -10pp/12m
- Exibição: Portfolio tab (dado operacional vivo)
- Drought counter: integrado como label sobreposto no gráfico (não contador independente)

**Implementado:** gráfico ECharts linha rolling 12m com zonas de cor + drought counter. Estado atual: +16.18pp verde, drought = 0m. Novos params em carteira.md: `factor_underperf_threshold_red_pp = -10`.

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

Todos os 4 gaps do Tier 3 encerrados em 2026-04-28:

- **T:** Fechado sem implementação — bloqueio técnico (guardrails não separam saúde de lifestyle). Pré-requisito: FR-guardrails-categoria-elasticidade.
- **U:** Resolvido — AQR HML Devil + KF SMB (58/42). Widget semáforo implementado em Portfolio tab.
- **V:** Resolvido — projeção de venda imóvel (2027) e terreno (2031) com IR 15%, FV@FIRE ~R$759k. Exibido em Assumptions tab como upside.
- **W:** Resolvido — gráfico rolling 12m TE AVGS vs SWRD com zonas de cor e drought counter integrado em Portfolio tab.

---

## Resultado

Issue completa. Tier 3 encerrado.

---

## Próximos Passos

- [x] Gap T — fechado sem implementação (bloqueio: guardrails não separam saúde de lifestyle)
- [x] Gap U — **RESOLVIDO 2026-04-28**: widget semáforo value spread em Portfolio tab
- [x] Gap V — **RESOLVIDO 2026-04-28**: projeção venda imóvel + terreno em Assumptions tab
- [x] Gap W — **RESOLVIDO 2026-04-28**: gráfico rolling TE + drought counter em Portfolio tab
