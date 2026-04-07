# Relatório Mensal — Report Consolidado

Gera relatório mensal em markdown, salvo em `analysis/relatorios/YYYY-MM.md`.

## Dados (ler em paralelo)

- `agentes/contexto/carteira.md` (posições e premissas)
- `agentes/memoria/00-head.md` (decisões do mês)
- `agentes/issues/README.md` (issues concluídas)

## Execução

Rodar em paralelo:
1. MC para P(FIRE): verificar se `agentes/memoria/04-fire.md` tem resultado <7 dias. Se sim, reusar. Se não:
```bash
python3 scripts/fire_montecarlo.py --n-sim 3000
```
2. Dados macro: usar `/macro-bcb` (não WebSearch ad hoc) para Selic, IPCA, PTAX, IPCA+ 2040
3. Posições IBKR (se disponível):
```bash
python3 scripts/ibkr_sync.py --cambio <PTAX>
```
4. Decomposição FX (retorno BRL vs USD, eficiência cambial):
```bash
python3 scripts/fx_utils.py
```

## Seções do Relatório

1. **Resumo Executivo**: patrimônio total (Δ vs mês anterior), P(FIRE 53/50), aportes do mês, status
2. **Performance**: retorno mês e YTD por ativo, benchmark vs VWRA
3. **Alocação e Drift**: pesos atuais vs alvos
4. **Atividade**: aportes, dividendos, rebalanceamentos
5. **Macro**: Selic, IPCA 12m, PTAX, IPCA+ 2040 (via `/macro-bcb`)
6. **Issues e Decisões**: concluídas, em andamento, decisões registradas
7. **Próximos Passos**: ações para o mês seguinte

## Regras

- Salvar em `analysis/relatorios/YYYY-MM.md`
- Comparar com relatório do mês anterior se existir (`analysis/relatorios/`)
- Dados indisponíveis: marcar "—" e listar como pendência
- Formato consistente entre meses (facilita diff)
