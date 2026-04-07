# Câmbio — Dólar e Impacto na Carteira

Mostra câmbio BRL/USD atual com contexto histórico e impacto na carteira.

## Execução

Tentar python-bcb primeiro, fallback para WebSearch:

```bash
python3 -c "
from bcb import currency
import datetime
end = datetime.date.today()
start = end - datetime.timedelta(days=365)
ptax = currency.get('USD', start=start, end=end)
print('=== PTAX HISTORICO ===')
print(ptax.tail(10))
print(f'\nHoje: {ptax.iloc[-1]:.4f}')
print(f'Media 30d: {ptax.tail(22).mean():.4f}')
print(f'Media 90d: {ptax.tail(66).mean():.4f}')
print(f'Media 12m: {ptax.mean():.4f}')
" 2>&1 || echo "python-bcb falhou — usar WebSearch"
```

Se script falhar: WebSearch "cotação dólar comercial hoje" e "PTAX BCB hoje".

Leia `agentes/contexto/carteira.md` para patrimônio em USD.

## Output

Incluir:
- **Câmbio atual**: dólar comercial (operacional) e PTAX (referência IR)
- **Histórico**: média 30d, 90d, 12m + variação 30d
- **Impacto carteira**: patrimônio IBKR convertido em BRL + comparação com média 12m
- **Contexto**: câmbio caro/barato/neutro vs histórico

## Nota

Câmbio operacional (conversão, aportes) = **dólar comercial**. PTAX BCB = usado apenas para cálculo de IR (Lei 14.754). Ambos são reportados aqui para referência.
