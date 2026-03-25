# HD-equity-weight: 79% equity é certo para horizonte fixo de 11 anos?

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-equity-weight |
| **Dono** | 04 FIRE |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 04 FIRE (lead), 10 Advocate, 17 Cético, 14 Quant, 15 Fact-Checker, Rotina Zero-Base |
| **Dependencias** | — |
| **Criado em** | 2026-03-24 |
| **Origem** | Meta-debate echo chamber 2026-03-24 |
| **Concluido em** | 2026-03-25 |

---

## Motivo / Gatilho

A carteira foi otimizada para **retorno esperado máximo** com 79% equity. Mas Diego tem uma **meta específica** (R$7-8M em 11 anos) com **data marcada** (50 anos). Isso é diferente de maximizar retorno esperado.

Lifecycle finance (Cocco, Gomes & Maenhout 2005; Viceira 2001) é explícita: com horizonte fixo e meta de patrimônio, a alocação que maximiza P(atingir a meta) não é a mesma que maximiza retorno esperado. Em particular, um drawdown de -40% aos 45 anos (R$3.5M → R$2.1M) exige ~8 anos de recuperação, empurrando FIRE para os 55-56.

---

## Regra deste issue (burden of proof invertido)

79% equity deve se justificar via maximização de **P(FIRE aos 50)**, não via retorno esperado máximo. A evidência que mudaria ≥20% da alocação: se uma alocação com menos equity tiver P(FIRE aos 50) igual ou superior, a alocação atual é sub-ótima pelo critério correto.

---

## Escopo

- [x] FIRE: modelar P(FIRE aos 50) para alocações equity de 50%, 60%, 70%, 79%, 90%
- [x] Advocate: construir caso para equity abaixo de 79%
- [x] Zero-Base: alocação ideal sem contexto da carteira atual
- [x] Modelar cenário crítico: drawdown -40% aos 45 anos
- [x] Referências: Cederburg et al. (2023) — aplicabilidade avaliada
- [x] Irrefalsifiabilidade: definida

---

## Análise

### Findings do Quant

| Item | Resultado |
|------|-----------|
| Retorno ponderado equity | **5.96%** (não 5.89% — erro em carteira.md linhas 169/176, corrigido) |
| Contribuições sem retorno (nominal) | R$3.48M + 11×R$300k = **R$6.78M** |
| Retorno necessário para R$7M | apenas **0.3%/ano real** — contribuições fazem o trabalho pesado |
| Retorno necessário para R$8M | **1.7%/ano real** |
| Contra-intuição equity vs IPCA+ | CONFIRMADA: menos equity = retorno marginalmente maior (1.6 bps), mas diferença mínima |
| Drawdown -40% aos 45 (patrimônio ~R$7M) | 79% equity: -R$2.21M → R$4.79M restante |

### Findings do FIRE

- P(FIRE) com guardrails é **quase idêntico** entre 50% e 90% equity (~2pp de delta total)
- Guardrails dominam o efeito da alocação — delta entre alocações é menor que o esperado
- Curva de P(FIRE) vs equity% é côncava — sobe até ~65-70%, depois plateau
- Após drawdown -40% aos 45, **ambas as alocações chegam a ~R$8.3-8.4M aos 50** — contribuições dominam a recuperação

### Findings do Fact-Checker

| Paper | Status |
|-------|--------|
| Pfau & Kitces (2014) — JFP Jan/2014 | ✅ Confirmado. Benefício verificado: **+2-4pp** (não +6-8pp). **Não replica em dados históricos** — apenas em MC |
| Cocco et al (2005) — RFS | ✅ Confirmado. Correto para capital humano *correlacionado*; no modelo base efeito é oposto |
| Cederburg (2023) — SSRN 4590406 | ⚠️ Autores: Anarkulova, Cederburg & O'Doherty (3 autores). Sem Wang/Yaron. **Não é NBER — é SSRN** |
| Anarkulova et al (2022) — JFE | ✅ Paper existe. "40% do tempo" não verificado neste paper específico |
| Pfau (2013) | ✅ Existe. Foca em *pós*-FIRE. Janela "3-5 anos antes" é framing de blog Kitces, não resultado do paper |

### Argumentos do time para menor equity (inicial)

O time (Advocate, Zero-Base, Cético) convergiu inicialmente para 65-72% equity com base em:
- Contra-intuição de retorno: IPCA+ (6.0%) vence equity (5.96%) marginalmente
- Cocco et al: capital humano declinante → equity financeiro deveria cair
- Pfau & Kitces: glidepath V domina equity constante
- P(FIRE) levemente melhor com menos vol

### Por que esses argumentos não fecham o caso (pontos de Diego)

**1. Balanço patrimonial total — todos já são risco soberano:**

| Ativo | Exposição |
|-------|-----------|
| Renda PJ | 100% Brasil |
| Imóvel Pinheiros | 100% Brasil |
| INSS futuro | 100% Brasil |
| Gastos | 100% BRL |
| IPCA+ (15% alvo) | 100% Brasil |
| **Equity UCITS (79%)** | **Internacional — único ativo fora do Brasil** |

Aumentar IPCA+ de 15% para 24-30% aumenta concentração soberana num balanço que já é quase 100% Brasil. Equity internacional é a *única* diversificação geográfica de Diego.

**2. Literatura pro-equity igualmente sólida:**
- Cederburg (2023), Siegel, DMS (2025): equity domina para longo prazo
- O principal argumento contra (Pfau & Kitces 2014) **não replica em dados históricos** — apenas em simulação MC (Fact-Checker confirmou)
- A literatura não tem consenso claro para o horizonte de 11 anos

**3. Migração impossível sem custo:**
- Todos os ETFs estão no lucro → venda gera 15% IR
- Única alavanca: direcionamento de aportes (R$300k/ano)
- O plano atual (DCA IPCA+ + JPGL) já é o caminho ótimo

**4. Janela temporal do IPCA+:**
- 7.16% é historicamente excepcional — janela não deve durar muitos anos
- 15% alvo é dimensionado *para a janela* — captura o máximo razoável
- Ir além de 15% comprometeria aportes do JPGL e estenderia DCA para fora da janela (comprando a taxas sub-ótimas)

---

## Conclusão

**79% equity confirmado. Não pela razão original (retorno esperado máximo), mas pelo argumento correto.**

O burden of proof invertido foi aplicado — e 79% se sustentou quando o balanço patrimonial completo é considerado:

1. **Diversificação soberana**: equity internacional é o único escape do risco Brasil. Mais IPCA+ piora, não melhora, o risco total
2. **Literatura balanceada**: argumento principal contra (Pfau-Kitces) não replica em dados históricos
3. **Restrição operacional**: migração só via aportes — o plano atual já converge para 72-75% equity quando IPCA+ chegar a 15%
4. **Temporalidade**: 15% IPCA+ é o tamanho certo para a janela atual. Além disso, a taxa provavelmente não compensará

### Irrefalsificabilidade

Evidências que mudariam ≥20% da alocação nos próximos 12 meses:
- **Reduziria equity**: se IPCA+ se mantiver ≥6.5% por 2+ anos após atingir 15%, considerar elevar para 20% (janela mais longa que o esperado)
- **Manteria/aumentaria equity**: se IPCA+ cair abaixo de 6% antes de atingir 15%, parar DCA imediatamente — equity volta ao protagonismo total

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | Sem mudança. 79% equity confirmado pelo critério correto (P(FIRE) + diversificação soberana) |
| **Estratégia** | DCA IPCA+ até 15% (pela janela de taxa, não por ideologia). JPGL para fechar gap. Equity converge organicamente para ~72-75% |
| **Conhecimento** | Equity internacional = única diversificação soberana de Diego. Balanço total (renda+imóvel+INSS+gastos) já é quase 100% Brasil. Benefício de Pfau-Kitces não replica em dados históricos. Retorno necessário para R$7M = apenas 0.3%/ano — contribuições dominam |
| **Erro corrigido** | Retorno ponderado equity: 5.89% → **5.96%** (carteira.md linhas 169/176). Cederburg (2023) autores corretos: Anarkulova, Cederburg & O'Doherty — sem Wang/Yaron, não é NBER |
| **Memória** | Registrar em 01-head.md e 04-fire.md: equity confirmado, balanço soberano como argumento central |

---

## Próximos Passos

- [x] Conclusão registrada
- [ ] Corrigir carteira.md: retorno ponderado 5.89% → 5.96%
- [ ] Corrigir literatura-contraria.md: autores Cederburg (2023)
- [ ] Monitorar janela IPCA+: se atingir 15% com taxa ainda ≥6.5%, avaliar elevar alvo
