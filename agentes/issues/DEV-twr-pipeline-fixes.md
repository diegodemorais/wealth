| Campo | Valor |
|-------|-------|
| ID | DEV-twr-pipeline-fixes |
| Título | Fix pipeline TWR/CAGR — RF MtM, preços fim-de-mês, Modified Dietz |
| Dono | Dev |
| Status | 🟡 Backlog |
| Prioridade | 🔴 Alta |
| Criada | 2026-04-23 |
| Participantes | Dev (lead), Quant (validação) |
| Origem | Auditoria Quant opus do reconstruct_history.py |

## 3 Problemas identificados

### P4 — RF usa custo em vez de MtM (🔴 Alto)
`build_nubank_rf_by_month()` soma valor aplicado acumulado, não mark-to-market. RF contribui zero retorno ao TWR. Patrimônio subestimado ~R$15-25k.
**Fix**: Usar PYield (já instalado) para calcular VNA × cotação ANBIMA por título/mês.

### P1 — yfinance monthly = início do mês (🟡 Médio)
`interval="1mo"` retorna preço do primeiro dia útil, não último. Mismatch com snapshot de posição (fim do mês).
**Fix**: Baixar `interval="1d"` + resample `.resample("ME").last()`.

### P3 — Modified Dietz sem peso temporal (🟡 Médio)
Aportes tratados como fim-do-mês (não renderam). Datas exatas disponíveis nos JSONs mas não usadas. ~0.5-1% acumulado em 5 anos.
**Fix**: Implementar peso temporal `w_i = dias_restantes / dias_totais`.

## Escopo
- [ ] P4: Substituir custo acumulado RF por MtM via PYield
- [ ] P1: Mudar fetch de preços para diário + resample fim-de-mês
- [ ] P3: Modified Dietz com peso temporal intra-mês
- [ ] Quant: re-validar TWR/CAGR após fixes
- [ ] Rerodar reconstruct_history.py e comparar antes/depois
