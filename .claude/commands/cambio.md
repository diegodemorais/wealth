# Câmbio — Dólar e Impacto na Carteira

Mostra câmbio BRL/USD atual com contexto histórico e impacto na carteira.

## Execução

```bash
~/claude/finance-tools/.venv/bin/python3 scripts/fx_utils.py
~/claude/finance-tools/.venv/bin/python3 scripts/fx_utils.py --history 30
```

Se script falhar: WebSearch "cotação dólar comercial hoje" e "PTAX BCB hoje".

Leia `agentes/contexto/carteira.md` para patrimônio em USD.

## Output

Incluir:
- **Câmbio atual**: PTAX BCB (referência IR + operacional)
- **Histórico**: últimos 30 dias, mín/máx/atual
- **Impacto carteira**: patrimônio IBKR convertido em BRL + comparação com média 12m
- **Contexto**: câmbio caro/barato/neutro vs histórico

## Nota

Câmbio operacional = dólar comercial. PTAX BCB = referência oficial (IR Lei 14.754).
Fonte canônica: `scripts/fx_utils.py` (python-bcb, séries BCB 1 + 432).
Todos os scripts da carteira importam PTAX de `fx_utils` — nunca reimplementar.

$ARGUMENTS
