# FR-withdrawal-rate-chart: Withdrawal Rate ao Longo do Tempo + INSS Floor

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-withdrawal-rate-chart |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | 🟡 Média |
| **Participantes** | Dev (implementação), FIRE (spec) |
| **Criado em** | 2026-05-01 |
| **Origem** | HD-projection-lab-audit — gap P2 (Withdrawal Rate visualization no PL) |
| **Concluido em** | — |

---

## Contexto

O SWR de Diego é calculado como número no FIRE Day (R$250k / patrimônio ≈ 3.0% @R$8.3M). Mas a taxa de retirada evolui ao longo do tempo: em cenários ruins sobe acima de 4%; em bons cai. Quando o INSS de Diego e Katia entram (2049, 2052), a pressão de saque cai drasticamente.

Essa visualização é canônica no trabalho de Karsten Müller (ERN) e essencial para comunicar resiliência do plano: "o INSS reduz o SWR efetivo de 3.0% para ~1.8% a partir de 2052."

---

## Escopo

### Pipeline (`fire_montecarlo.py`)

Serializar por ano (2040–2090):
- `withdrawal_rate_timeline.years[]`
- `withdrawal_rate_timeline.p50[]` — SWR efetivo mediana (retirada/patrimônio P50)
- `withdrawal_rate_timeline.p25[]` — cenário favorável
- `withdrawal_rate_timeline.p75[]` — cenário desfavorável
- `withdrawal_rate_timeline.inss_floor_pct[]` — INSS como % do gasto base (R$250k)

**Cálculo do INSS floor:**
- Diego INSS: R$18k–20k/ano real a partir de 2052 (aos 65)
- Katia INSS: R$113.8k/ano real a partir de 2049 (aos 67)
- Floor % = INSS total / gasto_vida_base × 100

### Dashboard (React/ECharts)

**Componente:** `WithdrawalRateChart` na aba FIRE ou WITHDRAW, seção `withdrawal-rate-timeline`

**Visualização:**
- ECharts `line`
- Eixo X: 2040–2090
- Eixo Y: % (taxa de retirada efetiva)
- Linhas: P25/P50/P75 da taxa de retirada
- Linha de referência: 4% SWR (limiar clássico de atenção)
- Área sombreada: INSS floor como % do gasto (começa em 0%, escala até ~45% em 2052)
- Marcadores verticais: 2049 (INSS Katia), 2052 (INSS Diego)
- Tooltip: "Em 2052, INSS cobre ~45% dos gastos → SWR efetivo cai de 3.0% para 1.7%"
- Sem privacy mode no eixo Y (% não é monetário), mas os R$ no tooltip sim

---

## Critério de Aceite

- [ ] Pipeline serializa withdrawal rate por percentil (P25/P50/P75) por ano
- [ ] Pipeline serializa INSS floor % por ano
- [ ] Componente renderiza sem erro
- [ ] Linha de referência em 4% SWR visível
- [ ] Marcadores 2049 e 2052 corretos
- [ ] Tooltip mostra INSS floor em R$ e em % (privacy: R$ mascarado)
- [ ] `data-testid` em `wr-p50-2040` e `wr-inss-floor-2052`
- [ ] Assertion em `e2e/semantic-smoke.spec.ts`

---

## Referências

- Karsten Müller (ERN): "The Ultimate Guide to Safe Withdrawal Rates" — SWR ao longo do tempo como visualização canônica
- `agentes/contexto/carteira.md` § INSS (valores de Diego e Katia)
- `agentes/issues/TX-inss-beneficio` (estimativas aprovadas de INSS)
- `agentes/issues/HD-projection-lab-audit.md` § Withdrawal Rate ao Longo do Tempo
