| Campo | Valor |
|-------|-------|
| ID | DEV-drawdown-extended |
| Título | Drawdown chart estendido — 21+ anos com VWRA/proxies e seletores de período |
| Dono | Dev |
| Status | 🔴 Doing |
| Prioridade | 🟡 Média |
| Criada | 2026-04-23 |
| Participantes | Dev (lead), Quant (validação) |

## Motivo

Drawdown atual (Backtest → Drawdown & Risco) mostra apenas 2021-2026 (período IBKR real). Falta contexto de crises históricas (2008 GFC -55%, 2020 COVID -34%). Dados de backtest 21+ anos já existem em `backtest_portfolio.py`.

## Escopo

- [ ] Usar dados do backtest longo (Target vs VWRA) para drawdown estendido
- [ ] Seletores de período: "Carteira real (2021+)" / "Backtest 21 anos" / "Tudo"
- [ ] Mostrar drawdown de Target (50/30/20) E VWRA como benchmark
- [ ] KPIs: Max Drawdown, Drawdown Atual, Recovery Time por período
- [ ] Quant valida: drawdown calculado corretamente (pico-a-vale rolling)
- [ ] Testes automatizados
