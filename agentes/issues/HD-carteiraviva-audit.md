# HD-carteiraviva-audit: Auditoria profunda Carteira Viva (Sheets) + roadmap website

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-carteiraviva-audit |
| **Dono** | Head |
| **Status** | Done |
| **Prioridade** | 🟡 Média |
| **Participantes** | Head (lead), Bookkeeper, Factor, FIRE, Quant |
| **Co-sponsor** | Bookkeeper |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Pedido Diego — entender tudo o que existe na planilha Carteira Viva (Google Sheets), identificar gaps vs codebase wealth/, e avaliar viabilidade de website com todos os recursos. |
| **Concluido em** | 2026-04-07 |

---

## Motivo / Gatilho

A planilha "Carteira Viva" é o histórico operacional manual da carteira. O codebase `wealth/` evoluiu muito nas últimas semanas (20+ issues concluídas) mas nunca foi feita uma comparação sistemática entre os dois. Podem existir dados históricos, técnicas (TWR, indicadores, visualizações) ou estruturas na planilha que ainda não estão aqui.

Além disso, a planilha tem limitações (colaboração, versão, UI). Um website baseado no codebase wealth/ poderia substituí-la com vantagens.

---

## Escopo

- [x] Ler e mapear todas as abas da planilha (estrutura, fórmulas, dados)
- [x] Identificar dados históricos únicos que não existem no codebase
- [x] Identificar técnicas e indicadores (TWR, benchmarks, visualizações)
- [x] Mapear incompatibilidades entre planilha e codebase (PM, preços, pesos)
- [x] Avaliar viabilidade e arquitetura de website (stack, dados, deploy)
- [x] Produzir relatório executivo com gaps priorizados e roadmap

---

## Análise

Relatório completo: `analysis/carteiraviva_audit.md`

### Resultado

10 achados priorizados. **7 ações executadas, 3 falsos positivos descartados** (confirmados por Diego).

| # | Ação | Status |
|---|------|--------|
| A1 | Pesos 50/30/20 em `checkin_mensal.py` + `backtest_fatorial.py` | ✅ Done |
| A2 | `shadow-portfolio.md` Target atualizado | ✅ Done |
| A3 | `holdings.md` com dados planilha 07/04/26 | ✅ Done |
| A4 | `historico_carteira.csv` +2 pontos (2021 e 2025) | ✅ Done |
| A5 | Aporte R$25k confirmado (R$28k era variação pontual) | ✅ Falso positivo |
| A6 | `scorecard.md` TER 0.247%, previsão JPGL cancelada | ✅ Done |
| A7 | Planilha 43/26/17 = inclui RF, 50/30/20 equity está correto | ✅ Falso positivo |
| A8 | `custo_base_brl_por_bucket()` implementado (`--custo-base`) | ✅ Done |
| A9 | `calcular_cagr_historico()` implementado (CAGR desde 2021) | ✅ Done |
| A10 | Dado não era EBITDA de negócio | ✅ Falso positivo |

### Novas capacidades no codebase

1. **Custo base BRL consolidado por bucket** — `python3 scripts/checkin_mensal.py --custo-base analysis/backtest_output/ibkr_lotes.json`
2. **CAGR histórico desde 2021** — calculado automaticamente no output do checkin mensal
