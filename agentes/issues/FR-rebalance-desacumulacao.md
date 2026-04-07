# FR-rebalance-desacumulacao: Regras de rebalanceamento pós-FIRE

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-rebalance-desacumulacao |
| **Dono** | FIRE |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | FIRE (lead), Factor, Head |
| **Co-sponsor** | Factor |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Agent review — FIRE identificou gap: equity sobe de 79% para ~97% quando bond pool é consumido. Sem regra formal de quando/como rebalancear. |
| **Concluido em** | 2026-04-07 |

---

## Descricao

Definir regras formais de rebalanceamento na fase de desacumulação: quando equity sobe de 79% (com bond pool) para ~97% (bond pool consumido), qual é o glidepath? Rising equity tent (Kitces)? Rebalanceamento periódico? Threshold-based?

---

## Escopo

- [x] Mapear literature: Kitces rising equity glidepath, Pfau bond tent, ERN glidepath
- [x] Definir regras: frequência, thresholds, mecânica
- [x] Testar no MC: impacto das regras de rebalanceamento no P(FIRE)
- [x] Documentar decisão

---

## Análise FIRE — Proposta de Rebalanceamento Pós-FIRE

### 1. Literatura: Evidências Principais

**Kitces & Pfau (2014) — Rising Equity Glidepath**: Portfolio ótimo na desacumulação começa conservador e sobe equity ao longo do tempo. Gastar do bond pool primeiro É o rebalanceamento — não precisa de trades adicionais. A mecânica natural já segue o rising glidepath.

**ERN/Karsten — SWR Part 39 (2020)**: Frequência de rebalanceamento tem impacto quase nulo no SWR (~0.01pp mensal vs semestral). O "timing alpha" existe na média mas é inconsistente. Buffer de 5 anos em bonds/cash é crítico nos primeiros anos (Part 28).

**Vanguard — "The Rebalancing Edge" (2024)**: Threshold-based (200bps drift, destino 175bps) supera calendar-based em 5-21 bps/ano. Estudo foca em TDFs (acumulação) — na desacumulação, saques já forçam ajustes.

**Cederburg, Anarkulova & O'Doherty (2023)**: 100% equity rebalanceado mensalmente domina TDFs em P(sucesso), consumo e bequest em horizontes 30+ anos. Contra: depende de horizonte longo e ausência de pânico.

**Blanchett & Morningstar**: Spending flexível (guardrails, VPW) substitui parte do benefício do rebalanceamento mecânico.

---

### 2. Regra Aprovada: Opção D — Glidepath + Spending-Based

**Mecânica trimestral (R$62.5k/quarter):**
1. Identificar qual bloco está mais overweight vs target da década corrente
2. Sacar desse bloco
3. Se múltiplos ETFs equity overweight → sacar do maior drift absoluto
4. Se todos underweight (mercado caiu) → sacar do IPCA+ curto (buffer SoRR) enquanto disponível

### Target por Fase

| Fase | Equity | IPCA+ longo | IPCA+ curto | Cripto |
|------|--------|-------------|-------------|--------|
| Anos 1-7 (50-57) | 79% | 15% (consumindo) | 3% (consumindo) | 3% |
| Anos 7+ (57-90) | 94% | 0% (venceu) | 0% (consumido) | 3%* |

*Cripto: manter 3% via drift natural. Não rebalancear ativamente para cripto.

### Target Intra-Equity (fixo)

| ETF | Target dentro do equity |
|-----|------------------------|
| SWRD | 50% |
| AVGS | 30% |
| AVEM | 20% |

### Safety Valve: Drift >10pp Individual

1. Aumentar saques desse ativo nos próximos 2-4 quarters (spending-based forçado)
2. Se spending não corrige em 4 quarters → avaliar venda TLH (lotes com prejuízo)
3. Se não há lotes com prejuízo → aceitar drift temporário (custo IR 15% > risco do drift)

### Regras Adicionais

- **Sem trades tributáveis para rebalancear**: Nunca vender ETF com lucro para rebalancear. Benefício (~0-21 bps/ano) não justifica o custo de 15% sobre ganho nominal BRL (inclui ganho fantasma cambial)
- **Frequência de monitoramento**: Trimestral (alinhado com saques) + revisão anual em janeiro
- **Transição bond pool (FIRE Day 2040)**: TD 2040 vence → manter em caixa/Selic → gastar ao longo dos anos 1-7. NÃO reinvestir em equity de uma vez — desfaria o bond tent
- **Pós-bond pool**: Equity sobe naturalmente para ~94%. Rebalanceamento apenas entre SWRD/AVGS/AVEM via spending + cripto

---

### 3. Quantificação

| Fonte | Comparação | Delta P(sucesso) |
|-------|-----------|-----------------|
| ERN Part 39 (2020) | Mensal vs trimestral vs semestral | ~0.01pp (desprezível) |
| Vanguard (2024) | Threshold 200bps vs calendar | 5-21 bps/ano retorno |
| Kitces/Pfau (2014) | Rising glidepath vs flat 60/40 | +2-5pp P(sucesso) em 30 anos |

**Conclusão quantitativa**: Impacto do método de rebalanceamento < 0.5pp no P(FIRE). O valor da regra é operacional e comportamental, não estatístico. O que importa: (1) não desfazer o bond tent, (2) não vender equity em drawdown, (3) seguir o glidepath.

---

### 4. Resumo da Decisão

| Item | Regra |
|------|-------|
| **Método** | Spending-based: sacar do ativo mais overweight a cada trimestre |
| **Frequência** | Trimestral (saques) + revisão anual em janeiro |
| **Glidepath** | 79% equity (anos 1-7) → 94% equity (anos 7+) via consumo natural do bond pool |
| **Target intra-equity** | SWRD 50% / AVGS 30% / AVEM 20% (fixo) |
| **Safety valve** | Drift >10pp → spending forçado → TLH → aceitar drift |
| **Trades tributáveis** | Nunca para rebalancear. Só TLH oportunístico |
| **Transição bond pool** | TD 2040 vence → caixa/Selic → gastar anos 1-7 |
| **Impacto P(FIRE)** | <0.5pp vs qualquer alternativa |

---

## Conclusao

Regras de rebalanceamento pós-FIRE definidas. Método: **Opção D — Glidepath + Spending-Based**. Gastar trimestralmente do ativo mais overweight. Safety valve de 10pp para drift excessivo. Nunca vender ETF com lucro para rebalancear (IR 15% > benefício do rebalanceamento). Transição bond pool (FIRE Day): manter em caixa/Selic e gastar nos anos 1-7.

Literatura base: Kitces/Pfau (2014), ERN Part 39 (2020), Vanguard (2024), Cederburg (2023).
