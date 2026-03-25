# HD-simplicity: VWRA + IPCA+ é suficiente?

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-simplicity |
| **Dono** | 10 Advocate |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 10 Advocate (lead), 02 Factor, 04 FIRE, 11 Behavioral, 12 Quant, 13 Fact-Checker |
| **Dependencias** | — |
| **Criado em** | 2026-03-24 |
| **Origem** | Meta-debate echo chamber 2026-03-24 |
| **Concluido em** | 2026-03-25 |

---

## Motivo / Gatilho

Issue criada explicitamente para questionar a meta-estratégia — não stress-testar dentro dela.

O alpha real de factor tilt sobre VWRA foi calculado em 0.15-0.25%/ano (FI-crowdedness, FR-equity-equivalent). Isso é R$5-9k/ano sobre R$3.5M. Em troca: 4 ETFs + 7 ativos transitórios + regras complexas + tail risk de quant unwind. A pergunta nunca foi feita formalmente: **a complexidade se justifica?**

---

## Regra deste issue (burden of proof invertido)

O **Advocate defende VWRA + IPCA+ como tese positiva completa**, não como stress-test da carteira atual. A carteira atual precisa se justificar frente à alternativa simples, não o contrário.

**Evidência que mudaria ≥20% da alocação:** Se alpha real pós-haircut e pós-TER for ≤0.10%/ano ajustado por complexidade e tail risk, a conclusão racional é simplificar.

---

## Análise

### Reconciliação numérica (Quant + Fact-Checker)

O haircut de 35-40% aplicado em issues anteriores não está diretamente em McLean & Pontiff 2016 (JF). O paper reporta 26% out-of-sample e 58% pós-publicação via arbitragem. Usando o haircut correto de 58%:

`Alpha líquido = 0.56% × (1 – 0.58) – 0.073% TER = 0.163%`

O range 0.15–0.25% anteriormente calculado em FR-equity-equivalent está correto mas sua origem era haircut interpolado. Com McLean & Pontiff aplicado corretamente, o alpha real converge para ~0.16% — borda inferior do range. O range 0.22–0.29% calculado pelo Quant com haircut 37.5% estava superestimado.

**Haircut correto para uso futuro: 58% (McLean & Pontiff post-publication decay).** O valor 35-40% não deve ser reutilizado sem nota explícita.

### Delta quantitativo entre as duas carteiras

| Métrica | Carteira atual | Carteira simples | Delta |
|---------|---------------|-----------------|-------|
| Retorno ponderado real BRL | 5.80% | 5.35% | +46 bps |
| Patrimônio projetado aos 50 | R$10.90M | R$10.52M | +R$381k |
| P(FIRE com R$250k) | ~91% | ~89-90% | +1-2 pp |
| Delta em anos de FIRE | — | — | 5-6 meses |
| Delta se factor premium = 0% | R$9k | — | Converge a zero |

Os 46 bps e 5-6 meses são materiais: o objetivo de R$250k/ano é o baseline conservador. Spending real maior e FIRE antecipado são objetivos explícitos — cada bps adicional de retorno esperado tem valor real.

### Principais findings

**1. Complexidade como red herring (Behavioral)**
O custo de complexity bias é ~0.0-0.1%/ano — irrelevante dado o perfil rules-based de Diego. O risco real é **tracking error regret em AVGS**: quando small value underperformar SWRD por 3-5 anos (P ≈ 35-45%), o custo comportamental esperado de abandono no trough é ~0.4-0.7%/ano — superior ao alpha esperado de AVGS isoladamente (0.10% ponderado).

**2. Precommitment validado por histórico (Behavioral + Diego)**
Diego mantém ~R$800k em small cap value via AVUV ($58.5k) + AVDV ($94.1k) há anos, sem abandono em qualquer período de stress. A migração para AVGS UCITS é continuidade regulatória (estate tax), não nova exposição. O precommitment é real, não teórico.

**3. AVGS como elo mais fraco (Factor, Advocate, Behavioral — consenso)**
AVGS contribui 0.10% ponderado de alpha mas carrega: TER 0.39% (mais caro do trio), Max DD estimado -60%+ em crise (vs -40% SWRD), maior risco de tracking error regret. Porém com precommitment validado, a posição se justifica.

**4. AVEM e JPGL com case mais sólido (Factor)**
AVEM: único vetor de exposição a Emerging Markets (SWRD = 0% EM). Research Affiliates projeta EM 9.0% real vs DM 3.4%. JPGL: TER 0.19%, multi-factor diversifica risco de fator individual. Alpha ponderado dos dois: ~0.12% com custo comportamental menor que AVGS.

**5. Custo fiscal de simplificar**
IR 15% sobre lucro nos ETFs factor caso Diego decida migrar para SWRD: **R$75-155k**. Esse custo torna simplificação imediata irracional independente da conclusão estratégica. Alternativa eventual: simplificar gradualmente na fase de desacumulação.

**6. Irrefalsifiabilidade da tese factor (Advocate)**
A tese factor não é refutável em nenhum resultado de 12 meses — qualquer underperformance tem narrativa de "espere mais". Isso é red flag epistemológico. A tese simplicity (SWRD) é mais falsificável: underperformance >2% anualizado por 5+ anos rolling feriria a tese. A assimetria epistemológica não é motivo para simplificar agora, mas deve ser monitorada.

**7. IPCA+ HTM como âncora comportamental (Behavioral)**
Valor comportamental estimado: 0.2-0.4%/ano em alpha preservado (redução de vendas em pânico no bloco equity). O precommitment HTM elimina MtM anxiety, tracking error e confirmation bias loop. Deve ser mantido independente de qualquer decisão sobre factor tilts.

---

## Conclusão

A carteira simples (SWRD + IPCA+ + Cripto) é racionalmente defensável e quase equivalente em P(FIRE). A carteira atual é marginalmente superior em expectativa (+46 bps, +R$381k, +5-6 meses de FIRE antecipado), com margem genuinamente valiosa dado que o objetivo de R$250k é baseline conservador.

A carteira atual está justificada. O alpha real de ~0.16% é pequeno mas real, o precommitment de small value está validado por histórico (AVUV+AVDV em escala por anos), e o custo fiscal de simplificar agora (R$75-155k) torna migração imediata irracional.

**Gatilho de reavaliação de AVGS**: se underperformance de small value vs SWRD atingir 3 anos consecutivos — revisão comportamental obrigatória para verificar se é mudança de tese vs recency bias. Não agir automaticamente.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | Carteira atual mantida. Nenhuma mudança de pesos. |
| **Estratégia** | AVGS permanece no alvo. Precommitment validado por histórico: Diego mantém ~R$800k em small cap value (AVUV+AVDV) há anos sem abandono. Migração para AVGS UCITS é continuidade, não nova exposição. Gatilho de revisão comportamental: underperformance de small value vs SWRD por 3 anos consecutivos. |
| **Conhecimento** | (1) Haircut correto: 58% (McLean & Pontiff pós-publicação), não 35-40%. Alpha líquido real: ~0.16%. (2) Alpha ~0.16% = +R$381k / 5-6 meses de FIRE antecipado — materialmente valioso. (3) Tracking error regret de AVGS é o risco comportamental dominante — precommitment validado por histórico real de AVUV+AVDV. (4) IPCA+ HTM tem valor comportamental de 0.2-0.4%/ano além do retorno financeiro. (5) Custo fiscal de simplificar agora: R$75-155k — torna migração imediata irracional. |
| **Memória** | (1) Premissa "não precisa de rentabilidade adicional" proibida — objetivo R$250k é baseline conservador, Diego quer spending maior e FIRE antecipado. (2) Haircut fatorial: usar 58% (McLean & Pontiff post-publication), não 35-40%. (3) Precommitment AVGS validado por histórico real. |
