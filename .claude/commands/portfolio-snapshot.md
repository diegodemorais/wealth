# Portfolio Snapshot — Posições e Drift

Gera snapshot rápido da carteira com posições atuais, pesos vs alvos, e drift.

## Dados

Leia `agentes/contexto/carteira.md` — seções "Posições Atuais" e "Alvos".

## Output

Gere exatamente neste formato:

```
## Portfolio Snapshot — {data de hoje}

### Posições

| Ativo | Qtd | Preço | Valor USD | Valor BRL | Peso Atual | Alvo | Drift |
|-------|-----|-------|-----------|-----------|------------|------|-------|

### Resumo

| Métrica | Valor |
|---------|-------|
| Patrimônio IBKR (USD) | $ X |
| Patrimônio IBKR (BRL) | R$ X |
| Patrimônio RF BR (BRL) | R$ X |
| **Patrimônio Total (BRL)** | **R$ X** |
| Câmbio usado | X |
| Última atualização | YYYY-MM-DD |

### Drift vs Alvos (equity block)

| Ativo | Atual | Alvo | Drift | Ação |
|-------|-------|------|-------|------|
| SWRD | X% | 50% | +/-X% | Over/Under — aportar Y |
| AVGS | X% | 30% | +/-X% | ... |
| AVEM | X% | 20% | +/-X% | ... |

### Transitory Assets (hold until usufruto)
| Ativo | Valor | Nota |
```

## Regras

- Câmbio: usar PTAX do dia via WebSearch se possível, senão último registrado em carteira.md
- Drift: highlight se >5% (ação necessária) vs <5% (ok)
- Preços: usar últimos registrados em carteira.md (não buscar em tempo real)
- Se dados estiverem desatualizados (>7 dias), alertar
