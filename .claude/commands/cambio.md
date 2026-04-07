# Câmbio — PTAX e Impacto na Carteira

Mostra câmbio BRL/USD atual com contexto histórico e impacto na carteira.

## Execução

1. Buscar PTAX do dia via BCB API:

```bash
python3 -c "
from bcb import currency
import datetime
ptax = currency.get('USD', start=datetime.date.today() - datetime.timedelta(days=5), end=datetime.date.today())
print(ptax.tail())
"
```

Se `python-bcb` não estiver instalado, usar WebSearch: "PTAX dólar hoje BCB"

2. Buscar histórico para contexto: média 30d, 90d, 365d
3. Ler `agentes/contexto/carteira.md` para patrimônio em USD

## Output

```
## Câmbio BRL/USD — {data}

### PTAX
| Métrica | Valor |
|---------|-------|
| PTAX compra | R$ X |
| PTAX venda | R$ X |
| Média 30 dias | R$ X |
| Média 90 dias | R$ X |
| Média 12 meses | R$ X |
| Variação 30d | +/- X% |

### Impacto na Carteira
| Métrica | Valor |
|---------|-------|
| Patrimônio IBKR (USD) | $ X |
| Patrimônio IBKR (BRL hoje) | R$ X |
| Se câmbio fosse média 12m | R$ X (Δ R$ X) |

### Contexto
- Câmbio atual vs média 12m: {acima/abaixo} da média em X%
- {Comentário breve: "Dólar caro/barato/neutro vs histórico recente"}
```
