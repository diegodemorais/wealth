# Relatório Mensal — Report Consolidado

Gera relatório mensal estruturado em markdown, salvo em `analysis/relatorios/YYYY-MM.md`.

## Dados

Leia em paralelo:
- `agentes/contexto/carteira.md` (posições e premissas)
- `agentes/memoria/00-head.md` (decisões do mês)
- `agentes/issues/README.md` (issues concluídas no período)

## Execução

1. Rodar MC rápido para P(FIRE) atualizado:
```bash
python3 scripts/fire_montecarlo.py --n-sim 3000
```

2. Buscar dados macro via WebSearch: Selic, IPCA 12m, PTAX, taxa IPCA+ 2040

## Seções do Relatório

```markdown
# Relatório Mensal — {Mês/Ano}

## 1. Resumo Executivo
- Patrimônio total: R$ X (Δ +/-X% vs mês anterior)
- P(FIRE 53): X% | P(FIRE 50): X%
- Aportes do mês: R$ X
- Status: {On track / Atenção / Revisar}

## 2. Performance
| Ativo | Retorno Mês | Retorno YTD | Peso |
|-------|-------------|-------------|------|

Benchmark: VWRA {retorno mês}% / {YTD}%

## 3. Alocação e Drift
| Ativo | Atual | Alvo | Drift |
|-------|-------|------|-------|

## 4. Atividade do Mês
- Aportes: {lista de compras}
- Dividendos: {se houver}
- Rebalanceamentos: {se houver}

## 5. Macro
| Indicador | Valor | Variação |
|-----------|-------|----------|
| Selic | X% | — |
| IPCA 12m | X% | — |
| PTAX | R$ X | +/-X% |
| IPCA+ 2040 | X% | — |

## 6. Issues e Decisões
### Concluídas
{lista de issues fechadas no mês com resultado em 1 linha}

### Em andamento
{lista de issues doing}

### Decisões registradas
{decisões relevantes do mês}

## 7. Próximos Passos
- [ ] {ações para o mês seguinte}
```

## Regras

- Salvar em `analysis/relatorios/YYYY-MM.md`
- Comparar com relatório do mês anterior se existir
- Dados que não conseguir obter: marcar como "—" e listar como pendência
- Manter formato consistente entre meses para facilitar diff
