# FR-fire2040: Meta FIRE 2040 — alinhamento com TD 2040, bond tent natural, estrutura pós-vencimento

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-fire2040 |
| **Dono** | 04 FIRE |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | 00 Head, 03 RF, 10 Advocate, 11 Quant |
| **Dependencias** | FR-spending-smile (spending smile adotado — premissas herdadas) |
| **Criado em** | 2026-03-27 |
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

## Escopo (quando executado)

- [ ] Rodar MC com bond tent explícito: sub-pool R$1.6M determinístico anos 1–5, restante estocástico — isolar efeito bond tent vs patrimônio maior
- [ ] Verificar VCMH 2024/2025 no IESS — confirmar ou ajustar premissa +7% real
- [ ] Formalizar guardrails revisados para FIRE 53
- [ ] Definir split do buffer pós-2040: % Selic/CDB curto vs % novo TD IPCA+
- [ ] Avaliar IMAB5 (IMA-B 5 anos) como alternativa ao IMAB11 para buffer com proteção IPCA+ e duration curta
- [ ] Advocate: stress-test do argumento bond tent — funciona se taxas subirem muito antes de 2040?
- [ ] Decisão formal: 2040 como meta primária ou manter 2037 com 2040 como "meta stretch"?

---

## Notas para Execução

- Arquivos de scripts: `dados/monte_carlo_fire_age_sweep.py`, `dados/monte_carlo_spending_smile_v3_corrigido.py`
- Decisão de quando FIRE não precisa ser tomada agora — revisitar aos 48–49
- IMAB11 acessa via B3 (não IBKR). Para buffer real, TD Selic ou CDB são mais simples operacionalmente
- TD 2050 já na carteira: não mexer. É a âncora estrutural pós-2040
