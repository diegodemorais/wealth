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
| Transicao FIRE (base) | **2040 (53 anos)** | Iniciar fase de desacumulacao — data base confirmada 2026-04-02 | Aguardando 2040 |
| Transicao FIRE (aspiracional) | Patrimônio real >= R$13.4M E SWR <= 2.4% ANTES de 2040 | FIRE antecipado aos 50 (2037) | Monitorar a partir de 2034 |
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

**Premissas atuais (aprovadas 2026-04-02):**
- `SAUDE_BASE = 16.000` — Bradesco coletivo PJ, cotação real age 53 SP
- `SAUDE_INFLATOR = 0.027` — VCMH IESS real, 18 anos
- ANS faixa etária: multiplicadores discretos sobre base FIRE Day (faixa 3,0×)
  - age 54: × 1,33 | age 59: × 1,67 | age 64: × 2,00
- `SAUDE_DECAY = 0,50` após no-go (cuidado institucional já no no_go base)

**Custo saúde Diego por idade (novo modelo):**
| Idade | Saúde/ano |
|-------|-----------|
| 53 (FIRE) | R$16.000 |
| 59 | R$31.300 |
| 64 | R$42.900 |
| 70 | R$50.300 |

**Impacto no P(FIRE) solo:** base 86.9% → **87.2%**, stress 81.0% → **83.5%** (ganho maior no stress — menor carga nos anos críticos de SoRR)

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

## Historico de Consultas

| Data | Tema | Resultado |
|------|------|-----------|
| 2026-03 | Modelo de guardrails | Risk-based (Kitces & Fitzpatrick 2024), nao G-K |
| 2026-03 | Glidepath: rising ou declining? | Rising equity 82-90% aos 50, subindo para 90-95% |
| 2026-03 | Custo de vida meta | R$250k/ano confirmado |
| 2026-03-20 | FR-001 v4 (HD-006) | Retornos com fontes academicas + BRL: acum 5,84% / desacum 4,57%-5,00%. Pat R$10,96M. Limite R$384k/ano. IPCA+ 10% (nao 20%). |
