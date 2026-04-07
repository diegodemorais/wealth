# Portfolio Snapshot — Posições e Drift

Gera snapshot da carteira: posições, pesos vs alvos, drift, patrimônio total.

Leia `agentes/contexto/carteira.md` — seções "Posições Atuais" e "Alvos".

## Câmbio

Câmbio para valuation operacional: **dólar comercial do dia** (ex: Google Finance). PTAX BCB é exclusivo para cálculo de IR — não usar aqui. Se não conseguir câmbio do dia, usar último registrado em carteira.md e alertar.

## Staleness check

Se a data de última atualização em carteira.md for >7 dias atrás, tentar primeiro:
```bash
python3 scripts/ibkr_sync.py --cambio <cambio_atual> 2>/dev/null
```
Se ibkr_sync não disponível: alertar "Dados desatualizados — última atualização em {data}. Rodar `/checkin-manual` para atualizar."

## Output

Incluir:
- **Posições**: cada ativo com qtd, preço, valor USD, valor BRL, peso atual, alvo, drift
- **Resumo**: patrimônio IBKR (USD e BRL), RF BR, total BRL, câmbio usado, data
- **Drift vs Alvos** (equity block): SWRD/AVGS/AVEM com drift e ação sugerida (over/under)
- **Transitory Assets**: ativos legacy com valor e nota "hold until usufruto"

## Regras

- Drift >5%: ação necessária (highlight)
- Drift <5%: ok
- Preços: últimos registrados em carteira.md (não buscar em tempo real)
