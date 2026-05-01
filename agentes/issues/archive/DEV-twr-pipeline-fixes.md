| Campo | Valor |
|-------|-------|
| ID | DEV-twr-pipeline-fixes |
| Título | Fix pipeline TWR/CAGR — RF MtM, preços fim-de-mês, Modified Dietz |
| Dono | Dev |
| Status | ✅ Concluída |
| Prioridade | 🔴 Alta |
| Criada | 2026-04-23 |
| Concluída | 2026-04-23 |
| Participantes | Dev (lead), Quant (validação) |
| Origem | Auditoria Quant opus do reconstruct_history.py |

## 3 Problemas corrigidos

### P4 — RF MtM via PYield ✅
NTN-B (IPCA+) agora valorizado pela PU ANBIMA via PYield. Renda+ 2065 mantido a custo (NTN-B Princ indisponível no tpf). 51 lookups bem-sucedidos.

### P1 — Preços fim-de-mês ✅
yfinance `interval="1d"` + `.resample("ME").last()`. Preços agora representam último dia útil do mês.

### P3 — Modified Dietz com peso temporal ✅
`w_i = (dias_no_mês - dia_do_aporte) / dias_no_mês`. Aportes preservam data exata. Impacto ~0.5-1% acumulado.

## Resultados pós-fix
- 61 meses (abr/2021 → abr/2026)
- TWR nominal BRL CAGR: 13.26%
- TWR real BRL: 6.95% (IPCA CAGR 5.90%)
- Max DD: -21.71%
- IR vs VWRA: 0.084 (TE 15.1%, AR 1.27%/ano)
