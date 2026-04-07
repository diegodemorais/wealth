# Rebalance Calc — Aporte Ótimo

Calcula distribuição ótima de um aporte para minimizar drift vs alvos.

O argumento `$ARGUMENTS` é o valor do aporte em R$. Se vazio, usar R$25.000 (default mensal).

Leia `agentes/contexto/carteira.md` — posições atuais e alvos.

## Staleness check

Se carteira.md >7 dias desatualizado, alertar antes de calcular.

## Lógica de Cascade (HD-006)

Este é o **source of truth** para lógica de aporte. `/checkin-automatico` e `/checkin-manual` devem referenciar este command para decisões de alocação.

Ordem de prioridade:
1. **IPCA+ longo** — se taxa ≥ 6.0% E alocação atual < 15% do portfolio
2. **Renda+ 2065** — se taxa ≥ 6.5% E alocação atual < 5% do portfolio
3. **Equity IBKR** — 100% do restante, ao ativo com maior underweight

Para verificar taxas: WebSearch "taxa tesouro IPCA+ 2040 hoje" ou último check-in.

## Cálculo Equity

1. Converter R$ → USD usando **dólar comercial do dia** (não PTAX — PTAX é só para IR)
2. Calcular drift: `peso_atual - peso_alvo`
3. Alocar 100% ao ativo com maior underweight
4. Se drift de todos <2%, distribuir proporcional 50/30/20
5. Calcular shares: `valor_usd / preço_share` (fracionário OK — IBKR suporta)

## Output

Incluir:
- **Cascade Check**: tabela com taxa atual, piso, alocação, decisão por destino
- **Alocação Equity**: ETF, drift, aporte USD, shares, preço estimado
- **Resumo**: câmbio usado, total equity, próximo aporte sugerido

## Regras

- Nunca sugerir venda — rebalancear apenas via aportes
- Se não souber preço atual, usar último registrado + "verificar antes de executar"
