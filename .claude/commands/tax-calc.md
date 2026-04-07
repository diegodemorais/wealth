# Tax Calc — IR sobre Venda de ETF

Calcula impacto tributário de venda de ETF internacional (Lei 14.754/2023).

O argumento `$ARGUMENTS` deve conter: ticker, quantidade de shares, preço de venda (USD), câmbio de venda (BRL/USD). Exemplo: `SWRD 100 $45.50 5.80`

Se incompleto, perguntar os dados faltantes.

## Dados

- Leia `agentes/contexto/carteira.md` para custo médio dos lotes
- Se disponível, leia `dados/tlh_lotes.json` para lotes detalhados

## Cálculo (Lei 14.754/2023)

```
1. Custo de aquisição BRL = shares × preço_compra_USD × câmbio_compra
2. Valor de venda BRL = shares × preço_venda_USD × câmbio_venda
3. Ganho nominal BRL = valor_venda - custo_aquisição
4. Se ganho > 0: IR = ganho × 15%
5. Se ganho ≤ 0: sem IR (prejuízo compensável com ganhos futuros exterior)
```

**Regras Lei 14.754/2023:**
- Alíquota: 15% flat sobre ganho nominal em BRL
- Sem isenção de R$35k/mês (revogada para investimentos exterior)
- Câmbio: PTAX de venda da data de liquidação (D+2), não da ordem
- Custo médio ponderado em BRL por ativo (obrigatório RFB)
- Prejuízos: compensáveis apenas com ganhos de mesma natureza (exterior)

## Output

```
## Tax Calc — Venda {ticker}

### Dados da Operação
| Campo | Valor |
|-------|-------|
| Ticker | {ticker} |
| Shares | {N} |
| Preço venda (USD) | $ X |
| Câmbio venda | R$ X |
| Preço compra médio (USD) | $ X |
| Câmbio compra médio | R$ X |

### Cálculo IR
| Etapa | Valor |
|-------|-------|
| Custo aquisição (BRL) | R$ X |
| Valor venda (BRL) | R$ X |
| **Ganho nominal (BRL)** | **R$ X** |
| **IR devido (15%)** | **R$ X** |
| Retorno líquido | R$ X |

### DARF
- Código: 6015 (ganho capital investimento exterior)
- Vencimento: último dia útil do mês seguinte à venda
- Valor: R$ X

### Notas
- Câmbio PTAX usar data de liquidação (D+2): {data}
- Prejuízo acumulado compensável: R$ X (se houver)
```

## Regras

- Nunca inventar preço ou câmbio — pedir ao Diego se não tiver
- Se venda gera prejuízo, calcular e registrar para compensação futura
- Alertar se venda é de ativo transitory (hold until usufruto recomendado)
