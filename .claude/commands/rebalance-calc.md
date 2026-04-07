# Rebalance Calc — Aporte Ótimo

Calcula distribuição ótima de um aporte para minimizar drift vs alvos.

O argumento `$ARGUMENTS` é o valor do aporte em R$. Se vazio, usar R$25.000 (default mensal).

## Dados

Leia `agentes/contexto/carteira.md` — posições atuais e alvos.

## Lógica de Cascade

Ordem de prioridade para alocação do aporte (aprovada HD-006):

1. **IPCA+ longo** — se taxa ≥ 6.0% E alocação atual < 15% do portfolio
2. **Renda+ 2065** — se taxa ≥ 6.5% E alocação atual < 5% do portfolio
3. **Equity IBKR** — 100% do restante, direcionado ao ativo com maior drift negativo (underweight)

Para verificar taxas IPCA+: usar WebSearch "taxa tesouro IPCA+ 2040 hoje" ou dados do último check-in.

## Cálculo Equity

Dado o valor disponível para equity:
1. Converter R$ → USD usando câmbio PTAX (WebSearch ou último registrado)
2. Calcular drift de cada ativo: `peso_atual - peso_alvo`
3. Alocar 100% ao ativo com maior underweight
4. Se drift de todos <2%, distribuir proporcional aos alvos (50/30/20)
5. Calcular quantidade de shares: `valor_usd / preço_share`

## Output

```
## Rebalance — R$ {valor} em {data}

### Cascade Check
| Destino | Taxa Atual | Piso | Aloc. Atual | Alvo | Decisão |
|---------|-----------|------|-------------|------|---------|
| IPCA+ longo | X% | 6.0% | X% | 15% | Aportar / Skip |
| Renda+ 2065 | X% | 6.5% | X% | 5% | Aportar / Skip |

### Alocação Equity
| ETF | Drift | Aporte USD | Shares | Preço Est. |
|-----|-------|-----------|--------|-----------|
| SWRD | -X% | $Y | Z | $P |

### Resumo
- Câmbio: R$ X
- Total equity: $ Y
- Próximo aporte sugerido: SWRD (ou quem tiver mais drift)
```

## Regras

- Nunca sugerir venda — rebalancear apenas via aportes
- Shares fracionárias OK (IBKR suporta)
- Se não souber preço atual, usar último registrado + "verificar antes de executar"
