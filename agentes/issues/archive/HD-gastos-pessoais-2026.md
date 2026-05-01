# HD-gastos-pessoais-2026: Análise de gastos pessoais ago/2025–mar/2026

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-gastos-pessoais-2026 |
| **Dono** | Head |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | Head (lead), Bookkeeper, FIRE, Behavioral |
| **Dependencias** | — |
| **Criado em** | 2026-04-03 |
| **Origem** | Diego: análise dos gastos reais pré-família com dados All-Accounts_03abril26.csv |
| **Concluido em** | 2026-04-03 |

---

## Motivo / Gatilho

Diego disponibilizou extrato de gastos pessoais (ago/2025–mar/2026) para análise. Contexto: casamento iminente (~2026-2027), filho previsto ~2028. Objetivo: entender baseline real vs modelo FIRE (R$250k/ano) e identificar riscos prospectivos.

---

## Dados — Tabela Resumida

| Categoria | Ago'25 | Set'25 | Out'25 | Nov'25 | Dez'25 | Jan'26 | Fev'26 | Mar'26 | Média |
|-----------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| Essenciais | -12.318 | -12.171 | -11.537 | -13.109 | -11.079 | -18.069 | -13.885 | -15.899 | -13.508 |
| — Taxes & Fees | -4.381 | -4.090 | -3.923 | -3.842 | -4.257 | -4.778 | -3.847 | -4.391 | -4.189 |
| — Mortgage | -3.017 | -3.016 | -2.868 | -2.867 | -2.638 | -2.637 | -2.636 | -2.806 | -2.811 |
| — Housing & Utilities | -2.172 | -1.479 | -1.896 | -1.972 | -1.842 | -2.035 | -6.901 | -1.731 | -2.504 |
| — Transportation | -1.256 | -1.205 | -1.167 | -1.631 | -1.424 | -6.135 | 0 | -3.581 | -2.050 |
| — Foods & Groceries | -999 | -1.889 | -1.181 | -2.295 | -416 | -1.482 | 0 | -1.488 | -1.219 |
| — Insurance | -490 | -490 | -500 | -500 | -500 | -1.000 | -500 | -1.900 | -735 |
| Opcionais | -2.859 | -5.160 | -4.857 | -6.332 | -6.274 | -3.518 | -1.306 | -3.959 | -4.034 |
| — Health & Self-care | -806 | -2.939 | -735 | -2.921 | -926 | -962 | -218 | -1.376 | -1.235 |
| — Dining Out | -723 | -1.096 | -491 | -1.243 | -2.274 | -1.100 | -90 | -1.282 | -1.037 |
| — Alcohol & Stuff | -563 | -325 | -996 | -632 | -1.426 | -955 | 0 | -245 | -643 |
| — Travel & Holidays | -370 | 0 | -380 | -1.098 | -578 | -352 | -662 | -341 | -348 |
| — Leisure & Subscriptions | -395 | -799 | -332 | -436 | -92 | -95 | -19 | -185 | -294 |
| — Technology | 0 | 0 | -1.921 | 0 | 0 | -52 | 0 | 0 | -247 |
| — Clothing & Footwear | 0 | 0 | 0 | 0 | -975 | 0 | -316 | -528 | -227 |
| Imprevistos (Gifts) | 0 | -150 | -489 | -1.297 | -151 | -744 | 0 | -71 | -238 |
| **TOTAL** | **-15.177** | **-17.482** | **-16.884** | **-20.738** | **-17.505** | **-22.332** | **-15.192** | **-19.930** | **-18.155** |

> **Nota:** Fev e Mar têm desencaixe de datas no CSV — analisar Fev+Mar juntos quando relevante.

---

## Findings

### Baseline confirmado

- **Gasto real anualizado: R$217.860/ano** (média R$18.155/mês)
- **Gasto estrutural base: ~R$182k/ano** (excluindo tributos anuais concentrados)
- Tributos anuais concentrados (IPVA, IPTU): ~R$8.4k em Jan+Fev — pagamentos confirmados em dia
- **vs modelo FIRE (R$250k/ano): -R$32.140 (-12,9%)** — gap necessário, não sobra

### Anomalias explicadas

| Mês | Categoria | Valor | Causa |
|-----|-----------|-------|-------|
| Jan/26 | Transportation (+R$3.5k acima da média) | R$6.135 | DGFIN R$3.335 (IPVA) — anual |
| Fev/26 | Housing (+R$5k acima da média) | R$6.901 | Sec. Municipal R$5.105 (IPTU) — anual |

### Gastos recorrentes fixos identificados

| Conceito | Valor/mês |
|----------|-----------|
| Mortgage (principal + fees) | ~R$2.806 |
| Contabilizei (2 PJs) | ~R$390 |
| Telefone Vivo | ~R$138 |
| Energia Enel | ~R$200-230 |
| Insurance (variável) | ~R$500-1.900 |
| Academia + saúde recorrente | ~R$200-400 |
| Streamings (Apple, Amazon, Netflix) | ~R$80-110 |

### Análise FIRE

| Cenário | Custo/ano | P(FIRE 2040) estimado |
|---------|-----------|----------------------|
| Base atual (modelo) | R$250k | 86.9% |
| Real atual (solteiro) | R$218k | ~89-90% |
| Pós-casamento (~2026-27) | R$270k | ~84-85% |
| Pós-casamento + filho + escola (~2031+) | R$300k | ~79-81% |

**Recomendação FIRE:** manter R$250k como cenário base. O gap de R$32k é buffer para eventos de vida. R$300k deve ser modelado formalmente antes do casamento. → Issue `FR-spending-modelo-familia`.

### Análise Behavioral

- Sazonalidade Nov-Dez (festas): normal, previsível — incorporar buffer sazonal
- Health & self-care alta variância (R$218–R$2.939): present bias potencial — verificar se piso está subindo YoY
- Dining + Alcohol R$1.680/mês: baseline estável, mas marco de referência pré-casamento
- Fev/26 opcionais mínimos (R$1.306): sinal positivo — opcionais cedem antes do aporte
- **Planning fallacy**: portfólio tem stress-test em 3 cenários; gastos têm um número único (R$250k). Gastos precisam de distribuição de probabilidade → `FR-spending-modelo-familia`

---

## Ações Geradas

| # | Ação | Issue | Status |
|---|------|-------|--------|
| 1 | Modelar R$300k no Monte Carlo + stress-test de gastos | `FR-spending-modelo-familia` | Backlog |
| 2 | Confirmar tributos Jan/Fev em dia | Diego | ✅ Confirmado (2026-04-03) |
| 3 | Seguro de vida urgente pré-casamento | `TX-seguro-vida` | Backlog (já existe) |

---

## Resultado

**Gastos controlados.** R$218k/ano real confirma HD-009 (R$215k/ano auditado em 2026-03-23). Baseline pré-família registrado. Dois picos (Jan/Fev) explicados por tributos anuais — não são desvios comportamentais. Buffer de R$32k é necessário e insuficiente para absorver casamento + filho. Modelagem formal de R$300k pendente em `FR-spending-modelo-familia`.
