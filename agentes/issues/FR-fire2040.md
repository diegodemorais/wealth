# FR-fire2040: Meta FIRE 2040 — alinhamento com TD 2040, bond tent natural, estrutura pós-vencimento

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-fire2040 |
| **Dono** | 04 FIRE |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | 00 Head, 03 RF, 10 Advocate, 11 Quant |
| **Dependencias** | FR-spending-smile (spending smile adotado — premissas herdadas) |
| **Criado em** | 2026-03-27 |
| **Concluido em** | 2026-03-27 |
| **Origem** | Conversa — Diego perguntou sobre alinhar aposentadoria com vencimento do IPCA+ 2040 |

---

## Motivo / Gatilho

O age sweep (FR-spending-smile) mostrou que FIRE 53 (2040) tem P=86.9% vs FIRE 50 (2037) com P=78.5%. Além do patrimônio maior, há um insight estrutural: o TD IPCA+ 2040 vence no exato momento do FIRE, gerando ~R$1.6M real em caixa — um bond tent natural de ~5 anos sem necessidade de gestão ativa.

Questão central: faz sentido formalizar 2040 como meta de FIRE? E se sim, como estruturar o buffer e a alocação RF pós-vencimento?

---

## Descricao

Avaliar FIRE 2040 (53 anos) como cenário de referência formal, considerando:
1. P(sucesso) superior (+8.4pp vs FIRE 50)
2. Bond tent natural do TD 2040 (vence no FIRE, ~R$1.6M real)
3. Estrutura do buffer pós-vencimento: caixa vs IPCA ETF vs novo TD
4. Revisão dos guardrails com SWR 2.38%
5. Trade-off: 3 anos a mais de trabalho vs Go-Go perdido

---

## Analise Preliminar (2026-03-27)

### Dados do age sweep

| Métrica | FIRE 50 (2037) | FIRE 53 (2040) | Delta |
|---------|----------------|----------------|-------|
| Patrimônio mediano | R$10.6M | R$13.4M | +R$2.8M |
| SWR | 3.00% | 2.38% | -0.62pp |
| P(sucesso) com guardrails | 78.5% | 86.9% | **+8.4pp** |
| P sem guardrails | 66.0% | 78.3% | +12.3pp |
| Bear -30% ano 1 | 61.7% | 72.8% | +11.1pp |

### Bond tent natural

- TD 2040 = 12% do portfolio mediano (~R$13.4M em 2040) = **~R$1.6M real** no vencimento
- Cobertura: ~5 anos de gasto (R$318k/ano) **sem vender equity**
- Resolve SoRR estruturalmente: equity não precisa ser vendido nos anos críticos 53–58
- Pfau (2013/2018): bond tent de 2–3 anos → +2–4pp P(sucesso). Diego terá 5 anos → estimativa +3–5pp isolado do patrimônio maior

**Decomposição estimada dos +8.4pp:**
- ~4–6pp: patrimônio maior (R$10.6M → R$13.4M)
- ~2–4pp: bond tent natural (5 anos de buffer HTM)

### Estrutura buffer pós-vencimento (análise RF Agent)

| Opção | Instrumento | Pros | Contras |
|-------|-------------|------|---------|
| A ✅ | Selic/CDB curto | Liquidez total, sem MtM, certeza | Sem proteção IPCA real |
| B ⚠️ | IMAB11 (ETF IMA-B) | Liquidez diária, exposição IPCA+ | Duration flutuante ~8–10 anos, MtM, sem vencimento fixo |
| C | Novo TD 2045–2050 | HTM, taxa travada, previsível | Trava capital 5–10 anos adicionais |

**Recomendação preliminar RF Agent:** Opção A para os anos 53–58 (buffer SoRR). O IMAB11 introduz volatilidade de MtM no momento exato em que o buffer deve ser certo — contradiz o propósito.

**TD 2050 já na carteira** (20% do IPCA+ longo): mantém como âncora estrutural. Não reinvestir o vencimento do 2040 em TD 2050 — funções diferentes.

### IMAB11: características verificadas

- TER: ~0.20%/ano (Itaú Asset — verificar prospecto atualizado)
- Composição: 100% NTN-B (todos os vencimentos), IMA-B ANBIMA
- Duration média: ~8–10 anos
- Liquidez: B3, D+1, volume diário baixo (dezenas de milhões BRL)
- Sem HTM possível: índice nunca vence
- IR: 15% sobre ganho de capital (mesmo regime ETF RF)
- Plataforma: B3 (Nubank/XP). IBKR não acessa B3.

### Guardrails com SWR 2.38%

Guardrails atuais foram calibrados para FIRE 50 com SWR 3.00%. Com SWR 2.38%, podem ser mais generosos:

| Drawdown | Atual (FIRE 50) | Proposto (FIRE 53) | Racional |
|----------|-----------------|--------------------|---------|
| 0–15% | R$250k | R$280k (Go-Go pleno) | SWR 2.38% suporta Go-Go sem comprometer |
| 15–25% | R$225k | R$250k | Buffer absorve primeiros 5 anos |
| 25–35% | R$200k | R$225k | Proporcionalmente igual |
| >35% | R$180k (piso) | R$200k | Saúde crescente justifica piso maior |

*Thresholds (15%/25%/35%) não mudam. Valores de corte se tornam mais generosos.*

### Trade-off Go-Go perdido

| Métrica | Valor |
|---------|-------|
| Go-Go nominal perdido (3 anos × R$280k) | R$840k |
| Gasto real enquanto trabalha (~R$200k/ano) | R$600k |
| **Custo líquido real** | **~R$240k** |
| Patrimônio adicional | +R$2.8M (mediano) |
| Renda perpétua adicional (a 2.38% SWR) | +R$66k/ano |
| Redução de risco de ruína | -8.4pp (base), -12.2pp (bear) |

**Interpretação (FIRE Agent):** O custo real não é R$840k — é ~R$240k líquido porque Diego continua gastando enquanto trabalha. O trade-off real é existencial: anos de Go-Go saudável vs segurança estrutural. A decisão não precisa ser tomada agora — revisitar aos 48–49 com dados atualizados.

### Sobre o VCMH

IESS publica VCMH anual em iess.org.br. O +7%/ano real usado no modelo cap/decay é referência histórica; verificar dado mais recente em iess.org.br > Publicações > VCMH. Reajuste ANS 2024 para planos individuais: +6,06% nominal (regulado). A premissa cap/decay é conservadora e compatível com a tendência histórica.

---

## Analise — MC Bond Tent Explícito (2026-03-27)

Script: `dados/monte_carlo_fire2040_bondtent.py` | 10k trajetórias | t-dist df=5 | seeds 42/200

### Saúde base ajustada por FIRE age
- FIRE 50: R$18k × 1.07^11 = **R$37,887**
- FIRE 53: R$18k × 1.07^14 = **R$46,414** (+22.5%)

### P(sucesso): decomposição patrimônio vs bond tent

| Modelo | P(sucesso) | Bear -30% ano 1 | Δ vs FIRE 50 |
|--------|-----------|----------------|-------------|
| FIRE 50 — single pool (referência) | 78.8% | 62.0% | — |
| FIRE 53 — single pool (só patrimônio) | 86.5% | 73.2% | +7.6pp |
| **FIRE 53 — bond tent 12%** | **86.9%** | **75.1%** | **+8.0pp** |

**Decomposição do ganho +8.0pp:**
- Patrimônio maior: **+7.6pp (95%)**
- Bond tent isolado: **+0.4pp (5%)**

No bear -30%: bond tent adiciona +1.8pp sobre o single pool.

### Sensibilidade ao tamanho do bond tent

| Tent | Valor | Anos cobertura | P(base) | Bear -30% |
|------|-------|---------------|---------|----------|
| 0% | R$0 | — | 86.5% | 73.2% |
| 6% | R$801k | 2.5 anos | 86.7% | 73.9% |
| **12%** | **R$1.6M** | **5.0 anos** | **86.9%** | **75.1%** |
| 20% | R$2.7M | 8.4 anos | 87.2% | 76.5% |

Retorno marginal decrescente: dobrar o tent de 12% para 20% → +0.3pp.

### Cenários completos FIRE 53 bond tent

| Cenário | Base | Favorável | Stress |
|---------|------|-----------|--------|
| FIRE 53 bond tent 12% | 86.9% | 93.7% | 81.0% |
| FIRE 50 single pool (ref) | 78.8% | 88.4% | 72.1% |

### Projeção: quando atingir o gatilho (R$13.4M real 2026)

| Percentil | Ano | Idade |
|-----------|-----|-------|
| P90 (ótimo) | 2035 | 48 anos |
| P75 (favorável) | 2037 | 50 anos |
| **P50 (mediana)** | **2041** | **54 anos** |
| P25 (adverso) | 2045 | 58 anos |
| P10 (severo) | >2046 | 60+ anos |

Probabilidade cumulativa de atingir gatilho até 2040 (53 anos): **49.3%**

### Stress-test Advocate — 4 premissas

| Premissa | Veredicto | Risco principal |
|----------|-----------|----------------|
| Bond tent protege SoRR | Parcialmente sustentada | Risco comportamental sem guardrail de fonte |
| TD 2040 = R$1.6M (12%) | **Vulnerável** | Se taxas < 6.0%, DCA pausa → tent pode encolher para 1-3 anos |
| FIRE 2040 melhor que 2037 | **Fraca como prescrição** | Anchoring; custo existencial dos 3 anos Go-Go não capturado |
| 15% IPCA+ executável | **Vulnerável** | Cenário base de queda de taxas impede atingir alvo |

### VCMH — dado novo

**Dado:** VCMH IESS (12m até Jun/2023): **15.1% nominal, ~11.7% real** (IPCA 3.2%)
Modelo usa +7% real. Período inclui recuperação pós-COVID. VCMH estrutural estimado 8-9% real.
Se 9%: P(sucesso) ~1.5-2pp menor → para P real de 85%, modelo deve mostrar ~87%.

---

## Conclusao

**O que os números revelam:** O bond tent natural do TD 2040 adiciona +0.4pp base e +1.8pp no bear. Os 95% restantes do ganho vêm do patrimônio maior (3 anos de acumulação = +R$2.8M). A narrativa "alinhar com 2040" é real, mas o driver é o patrimônio — não o timing.

**O que muda agora:**
1. **Guardrail de fonte** (única mudança acionável): nos anos 1–5 do FIRE, saques vêm do bond pool (TD 2040 vencido / caixa), não do equity. Regra mecânica — sem ela o bond tent não protege comportamentalmente.
2. **VCMH**: monitorar anualmente. Se média 3 anos > 9% real → recalibrar saúde no MC.

**O que não muda:** alocação, guardrails de drawdown, IPCA+ 15%, meta FIRE 50.

**Framing correto:** FIRE 50 é a meta primária. 2040 é o safe harbor — não uma data, uma rede de segurança. Não se deve esperar 2040 se o gatilho de patrimônio for cruzado antes.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | Nenhuma mudança |
| **Estratégia** | Gatilho formal de FIRE: patrimônio real ≥ R$13.4M (2026) e SWR ≤ 2.4%. Safe harbor: 2040. Guardrail de fonte: anos 1-5 sacar do bond pool antes do equity. |
| **Conhecimento** | Bond tent = 5% do ganho (+0.4pp base, +1.8pp bear). Driver real = patrimônio. VCMH real recente ~11.7% — modelo subestima saúde nos primeiros anos. TD 2040 como 12% do portfolio é cenário otimista (depende de taxas ≥ 6.0%). |
| **Monitorar** | (1) SWR + patrimônio real anual a partir de 2034. (2) VCMH IESS anual. (3) TD 2040 como % do portfolio vs meta 12%. |

---

## Escopo (quando executado)

- [x] Rodar MC com bond tent explícito — concluído. Bond tent = +0.4pp base / +1.8pp bear.
- [x] Verificar VCMH 2024/2025 — VCMH real ~11.7% (Jun/2023). Modelo usa 7% real. Monitorar.
- [x] Guardrails revisados para FIRE 53 — formalizados (ver carteira.md e gatilhos.md)
- [x] Advocate stress-test — 4 premissas analisadas. Bond tent vulnerável a path dependence de taxas.
- [x] Decisão: 2040 é safe harbor, não meta. FIRE 50 é a meta primária. Gatilho = patrimônio.

---

## Notas para Execução

- Arquivos de scripts: `dados/monte_carlo_fire_age_sweep.py`, `dados/monte_carlo_spending_smile_v3_corrigido.py`
- Decisão de quando FIRE não precisa ser tomada agora — revisitar aos 48–49
- IMAB11 acessa via B3 (não IBKR). Para buffer real, TD Selic ou CDB são mais simples operacionalmente
- TD 2050 já na carteira: não mexer. É a âncora estrutural pós-2040
