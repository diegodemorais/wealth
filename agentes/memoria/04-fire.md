# Memoria: Analista de Aposentadoria & FIRE

> Somente decisoes confirmadas por Diego sao registradas aqui.

---

## Decisoes Confirmadas

| Data | Decisao | Racional | Agentes Consultados |
|------|---------|----------|---------------------|
| 2026-03 | Guardrails baseados em risco, nao Guyton-Klinger | Cortes de 3-32% vs 28-54% | 01 Head |
| 2026-03 | Rising equity glidepath: 82-90% aos 50, subindo para 90-95% | Cederburg + Pfau | 02 Factor |
| 2026-03 | Custo de vida meta: R$250k/ano | Base para calculos de SWR | — |
| 2026-03-22 | Selic substituido por IPCA+ curto 3% aos 50 | SoRR buffer com ~2 anos duration, melhor protecao inflacionaria que Selic. MtM baixo | 03 Fixed Income |
| 2026-03-22 | Glidepath revisado: IPCA+ longo 15% + curto 3% | Equity 79% na acumulacao. IPCA+ longo e o bond tent natural (TD 2040 vence aos 53). IPCA+ curto comprado perto dos 50 como buffer de sequencia | 03 RF, 10 Advocate |
| 2026-03-25 | FR-glide-path: sem glide path formal aprovado | Protecao SoRR via estrutura existente: 15% IPCA+ longo (HTM, trade de retorno condicional >= 6.0%, buffer anos 50-53) + 3% IPCA+ curto (buffer SoRR anos 1-2 pos-FIRE). INSS disponivel aos ~65 como floor parcial — periodo critico 50-65 coberto pelo IPCA+. Cederburg (2023) inaplicavel ao periodo 50-65 (sem INSS). Pfau (2013) e Cocco et al (2005) mais aderentes para essa janela. Gatilho de revisao: se taxa IPCA+ fechar abaixo de 6.0% antes de atingir 15%, abrir debate sobre alternativa de protecao SoRR | 04 FIRE, 10 Advocate, 08 Macro, 17 Cetico |
| 2026-04-07 | **Withdrawal strategy confirmada: GUARDRAILS** (FR-withdrawal-engine) | 4 alternativas testadas (constant, pct_portfolio, VPW, Guyton-Klinger) + GK Hybrid. Todas descartadas. Guardrails dominam em previsibilidade (vol R$41k vs GK R$189k). Delta GK vs guardrails: +1.1pp P(FIRE) — dentro do IC estatístico. GK Hybrid (teto R$350k): P10=R$162k viola piso essencial R$180k. Placar final: 2/2 GUARDRAILS. Script: `fire_montecarlo.py --compare-strategies` | FIRE, Advocate |
| 2026-04-07 | **Rebalanceamento pós-FIRE: Opção D — Glidepath + Spending-Based** (FR-rebalance-desacumulacao) | Mecânica trimestral: sacar do ativo mais overweight vs target da fase. Safety valve: drift >10pp → spending forçado → TLH → aceitar drift. NUNCA vender ETF com lucro para rebalancear (IR 15% > benefício). Transição bond pool: TD 2040 vence → caixa/Selic → gastar anos 1-7. Target: 79% equity (anos 1-7) → 94% (anos 7+). Intra-equity fixo: SWRD 50% / AVGS 30% / AVEM 20% | FIRE, Factor |

---

## Premissas Pessoais (impactam projecoes)

- **Estado civil**: Solteiro, namorada (casamento iminente ~2026-2027). Filho previsto ~2028.
- **Moradia**: Sao Paulo, Pinheiros
- **BASELINE**: R$250k/ano atual (solteiro). Com filho ~2028: recalibrar para R$270-300k+ (educacao, saude, moradia maior). Impacto estimado: +1 a 2 anos no FIRE date ou aumento target patrimonial ~R$1M.
- **ATENCAO**: Reavaliar SWR, patrimonio-alvo e FIRE date ao casar ou ter filho. Nao assumir R$250k estatico.

---

## Gatilhos Ativos

| Gatilho | Condicao | Acao | Status |
|---------|----------|------|--------|
| Transicao FIRE (Cenário Base) | **2040 (53 anos)** | Iniciar fase de desacumulacao — data base confirmada 2026-04-02, aporte R$25k/mês, P(success) 90.4% | Aguardando 2040 |
| Transicao FIRE (Cenário Aspiracional) | SWR <= 3.0% ANTES de 2040 (= R$250k/3.0% = R$8.33M equivalente, revisado 2026-04-13) + aporte R$30k/mês | FIRE antecipado aos 49 (2035), P(success) 85% | Monitorar a partir de 2033 |
| Hard stop | 2040 | Nao trabalhar alem disso independente de P(FIRE) | Aguardando |
| Bond tent | Anos 1-5 pos-FIRE | Sacar do bond pool (TD 2040 / caixa) antes do equity — guardrail de fonte mecanico | Ativar no FIRE |
| VCMH | Media 3 anos IESS > 9% real | Recalibrar spending smile (saude base + inflator) na retro anual | Monitorar anualmente |
| TD 2040 tamanho | < 6% do portfolio em jan/2037 | Avaliar alternativa de buffer SoRR | Monitorar anualmente a partir de 2032 |

---

## Analises Concluidas

| Data | Issue | Resultado Principal |
|------|-------|---------------------|
| 2026-03-20 | FR-001 v4 (HD-006 intermediario) | Retornos corrigidos com fontes academicas (DMS 2024) + BRL 3 cenarios: acum 5,84% (tax drag 0%), desacum 4,57%-5,00%. Pat ~R$10,96M aos 50. SWR R$250k: 2,28%. SWR R$350k: 3,19%. Limite seguro: R$384k/ano |
| 2026-03-22 | HD-006 final: alocacao revisada | Equity 79%, IPCA+ longo 15%, IPCA+ curto 3%, Cripto 3%. Selic removido. IPCA+ a 7.16% vence equity all-in por 150 bps. Projecoes de FR-001 serao recalculadas com nova alocacao |
| 2026-03-22 | FR-003 Monte Carlo | MC 10k trajetorias, t-dist df=5. Pat mediano R$10.56M. SR R$250k: 91% (guard), R$350k: 87%. Decada perdida: 31-43%. Bond tent: +0.1pp |
| 2026-03-27 | FR-spending-smile | Spending smile cap/decay + saude corrigida (R$18k x 1.07^11 = R$37.887 no FIRE). P(FIRE 50) = 80.8% base / 89.9% favoravel / 74.3% stress. Bear -30% ano 1 = risco dominante (-15.6pp). INSS = impacto irrelevante (0.2pp). Script: monte_carlo_spending_smile_v3_corrigido.py |
| 2026-03-27 | FR-fire2040 age sweep | FIRE 50-60: P=78.8% a 95.5%. Valor marginal: +2.4pp/ano (anos 1-5), +1.0pp/ano (6-10). FIRE 55 = primeiro limiar 90%. Guardrails valem +12.5pp no FIRE 50. Script: monte_carlo_fire_age_sweep.py |
| 2026-03-27 | FR-fire2040 bond tent | FIRE 53 bond tent 12%: P=86.9% base / 93.7% favoravel / 81.0% stress. Bond tent = +0.4pp base / +1.8pp bear (5% do ganho total — 95% vem do patrimonio maior). Patrimonio mediano FIRE 53: R$13.4M. Script: monte_carlo_fire2040_bondtent.py |
| 2026-03-22 | FIRE-002 v2 Plano B (corrigido) | Perda renda = aposentadoria forcada (gastos imediatos). Perda 42: SWR 4.92%, sobrevive no deterministico (R$2M aos 90) mas vulneravel a vol. Perda 45+: robusto. Threshold auto-sustentavel: pat R$5.47M. Cenarios combinados (perda + ret adverso) falham — human capital hedge de R$5-8k/mes salva todos. Nenhuma acao preventiva agora |

## Dados Empíricos — Spending Smile e Saúde (2026-04-01)

### Spending Smile Internacional (fontes validadas)

| Fonte | Formato | Queda go-go → no-go | Detalhe |
|-------|---------|--------------------|---------|
| **Blanchett (2014)** | Curva em U | -26% trough (age 84) | -1%/ano go-go, -2%/ano slow-go. Trough real -26% aos 84. Rebound final. |
| **JPMorgan Guide** | Smile moderado | -27% vs pico | Despesas não-discricionárias sobem, total cai |
| **BLS CEX (EUA)** | Quasi-U | -30% (55-74 vs 75+) | Saúde dobra como % do total aos 75+ |
| **EBRI/Banerjee** | Queda consistente | -1,5%/ano real | HRS data, 2001-2009 |

### Saúde Brasil — Dados ANS e IPCAM (2026-04-01)

**ANS Faixas Etárias (RN 63/2003 — limite máximo):**
| Faixa | Multiplicador máximo |
|-------|---------------------|
| 0-18 | 1,0× (base) |
| 19-23 | 1,5× |
| 24-28 | 1,5× |
| 29-33 | 2,0× |
| 34-38 | 2,0× |
| 39-43 | 2,5× |
| 44-48 | 3,0× |
| 49-53 | 3,0× |
| 54-58 | 4,0× |
| **59-63** | **5,0×** |
| **64+** | **6,0× (cap máximo)** |

**Salto crítico**: dos 58 para 59 anos = +116-138% no prêmio base. Diego (53 anos no FIRE) está na faixa 3×. Cruzamentos: 54 → 4×, 59 → 5×, 64 → 6×.

**VCMH (Variação de Custo Médico Hospitalar — IESS):**
- Média 18 anos: VCMH supera IPCA em **+2,7%/ano**
- 2024: VCMH +11,3% vs IPCA ~4,8% → diferencial +6,5pp (acima da média)
- IPCA Saúde IBGE: apenas +0,74%/yr real (só preço). VCMH correto: inclui frequência de uso.
- Implicação: inflator saúde no modelo = **VCMH 2,7%/ano real** + saltos discretos ANS

### Modelo de Saúde Aprovado (2026-04-02) — fire_montecarlo.py

**Premissas anteriores (FR-spending-smile 2026-03-27):** R$37,9k base (R$18k × 1,07^11) + 7%/ano. INCORRETO: usava plano individual + confundia VCMH com projector.

**Premissas atuais (recalibradas 2026-04-23, FR-healthcare-recalibracao):**
- `SAUDE_BASE = 24.000` — coletivo por adesão intermediário SP (Bradesco/SulAmérica apto R$1.3-1.7k/mês, R$2k com buffer). Pesquisa web 23/04: planos individuais puros extintos desde ~2003, veículo é coletivo por adesão via associação
- `SAUDE_INFLATOR = 0.050` — VCMH IESS real 5.0%/ano (média 18a=2.7%, recente 5a=7-10%, 5% = horizonte 40 anos). VCMH nominal 12-15% vs IPCA 4.5% = 7.5-10.5% real. 5% é conservador para planejamento
- ANS faixa etária: multiplicadores discretos sobre base FIRE Day (faixa 3,0×)
  - age 54: × 1,33 | age 59: × 1,67 | age 64: × 2,00
- `SAUDE_DECAY = 0,50` após no-go (cuidado institucional já no no_go base)

**Custo saúde Diego por idade (modelo atual — SAUDE_BASE R$18k):**
| Idade | Saúde/ano |
|-------|-----------|
| 53 (FIRE) | R$18.000 |
| 59 | R$35.200 |
| 64 | R$48.300 |
| 70 | R$56.600 |

**Impacto do modelo de saúde (HD-multimodel-premissas Bloco A, 2026-04-06):** SAUDE_BASE R$16k→R$18k: −0.4pp. P(FIRE): 90.4%/94.1%/86.8%.

**Correções HD-mc-audit (2026-04-06) — dois bugs simultâneos:**
1. IR 15% na desacumulação modelado: −4.4pp
2. Double-count de saúde no SPENDING_SMILE corrigido: +4.4pp (SPENDING_SMILE = lifestyle ex-saúde: R$242k/R$200k/R$187k — era R$280k/R$225k/R$285k embeddando saúde antiga R$37.9k)

Os dois erros se cancelaram. Após correções adicionais (INSS + vol bond pool): P(FIRE): 90,8%/94,6%/87,4% (HD-mc-audit). Após SAUDE_BASE R$18k (Bloco A): **P(FIRE) oficial: 90,4% base / 94,1% favorável / 86,8% stress** (`fire_montecarlo.py` 2026-04-06).

Correções HD-mc-audit completas:
- Double-count saúde: +4.4pp
- IR desacumulação: −4.4pp
- INSS R$18k/ano a partir do ano 12 (age 65): +~2pp
- Vol reduzida no bond pool 13.3% (anos 0-6): +~1.5pp

**Risco residual:** plano empresarial depende de CNPJ ativo. Se Diego encerrar a PJ pós-FIRE, custo sobe ~40% (plano individual). Não modelado explicitamente.

**IMA-B 2024**: -2,44% (marcação a mercado adversa). IMA-B5+: -4,2%. Confirma: HTM é estratégia correta para IPCA+ — não sair por MtM.

---

## Conhecimento Validado — Spending Smile Brasil (2026-03-27)

**Pergunta:** O spending smile de Blanchett (2014) se aplica ao Brasil?

**Evidencia internacional:** Confirmado em EUA, UK, Australia, Italia (RIIG NZ 2024). NAO confirmado em Espanha e Japao. Padrao nao e universal.

**Brasil especifico:** Nenhum estudo longitudinal brasileiro equivalente ao Blanchett. POF/IBGE e cross-section. Sem dado para confirmar ou refutar diretamente.

**Componentes do modelo atual:**

| Componente | Status | Fonte |
|-----------|--------|-------|
| Inflator 7% real inicial | Confirmado — consistente com VCMH/IESS historico (7-9% real) | IESS serie historica |
| Decay para floor 3% real | Possivelmente otimista — frequencia de uso sobe com idade apos 60 | Interpretacao |
| Perna esquerda (declinio discricionaries) | Plausivel — mecanismo universal (mobilidade, viagem) | Inferencia de replicacoes |
| Longa permanencia (ILPI/home care) | **Gap nao modelado** — coberto parcialmente pelo lifestyle_ex_saude No-Go | Custos SP 2026: R$72-216k/ano |

**Risco especifico Diego (solteiro, sem filhos):** Probabilidade de dependencia acima da media brasileira (taxa BR ~0.4%). Home care 24h = R$144-216k/ano. Modelo aguenta realocando lifestyle_ex_saude (~R$247k No-Go disponivel).

**O que NAO muda:** modelo atual valido como primeira aproximacao. Nenhuma acao imediata.

**Sensitivity test futuro (retro anual):** testar floor 4% vs 3% real no decay. Impacto estimado: -0.5 a -1pp P(FIRE).

---

## Regras Operacionais

### Consultado em toda decisão de RF com vencimento
FIRE deve participar de qualquer decisão de renda fixa que envolva vencimento de título. Vencimentos devem ser alinhados com lifecycle events (FIRE date, bond tent, decisões estruturais). Diego ensinou isso ao questionar o IPCA+ 2032. (Aprendizado retro 2026-03-19)

---

## Analises Concluidas — Parte 2 (2026-04-07)

| Data | Issue | Resultado Principal |
|------|-------|---------------------|
| 2026-04-07 | FR-withdrawal-engine | Guardrails confirmados. 5 estratégias comparadas. Delta máximo 10.8pp. Guardrails = melhor equilíbrio P(FIRE) × estabilidade de renda. Minority Report: reabrir se P(FIRE) R$300k+drought < 75% |
| 2026-04-07 | FI-portfolio-optimization | 50/30/20 confirmado. Michaud Resampled: IC [0%–100%] (indistinguível). Factor drought: −6.7pp. Sem base para mudar. Minority Report: reabrir se AVGS underperformar SWRD por 5 anos |
| 2026-04-07 | FR-rebalance-desacumulacao | Opção D aprovada: spending-based trimestral, glidepath natural, sem trades tributáveis. Safety valve 10pp drift |

## Historico de Consultas

| Data | Tema | Resultado |
|------|------|-----------|
| 2026-03 | Modelo de guardrails | Risk-based (Kitces & Fitzpatrick 2024), nao G-K |
| 2026-03 | Glidepath: rising ou declining? | Rising equity 82-90% aos 50, subindo para 90-95% |
| 2026-03 | Custo de vida meta | R$250k/ano confirmado |
| 2026-03-20 | FR-001 v4 (HD-006) | Retornos com fontes academicas + BRL: acum 5,84% / desacum 4,57%-5,00%. Pat R$10,96M. Limite R$384k/ano. IPCA+ 10% (nao 20%). |
| 2026-04-07 | FR-withdrawal-engine | 5 estratégias testadas (10k sims). Guardrails 90.4%, GK 91.0%, GK Hybrid 91.0%. Guardrails aprovados: vol R$41k vs GK R$189k |
| 2026-04-07 | FR-rebalance-desacumulacao | Opção D: spending-based trimestral aprovada. Safety valve 10pp. Nunca venda com lucro para rebalancear |

---

## Auto-Crítica Datada (extraído do perfil em 2026-05-01)

### Erros conhecidos (retro 2026-03-19)
- Nao recalculou Monte Carlo com IPCA+ 10% (delta imaterial, mas deveria ter calculado)
- Deveria ter aberto issue proativamente para atualizar projecoes

### Erros conhecidos (retro 2026-03-27)
- VCMH 7% aceito sem questionar — Diego teve que puxar a sensibilidade com dado real
- Guardrails nos scripts (R$220k, R$180k) nao alinhados com carteira.md aprovada — model risk silencioso

### Retro 2026-04-22 (nota: 8.0/10 — melhor agente analítico)
- **Bem:** SWR revisado com 3 fontes (ERN/Pfau/Blanchett). Filho-drawdown proativo. IR desacumulação modelado.
- **Mal:** Double-count saúde no MC não detectado — pego na auditoria.
- **Cross-feedback recebido:** Advocate: "double-count/IR cancelaram por coincidência" → ACEITA monitorar.
