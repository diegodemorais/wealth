# Tax Calc — IR sobre Venda de ETF

Calcula impacto tributário de venda de ETF internacional (Lei 14.754/2023).

O argumento `$ARGUMENTS` deve conter: ticker, quantidade, preço venda (USD), câmbio venda. Exemplo: `SWRD 100 $45.50 5.80`

Se incompleto, perguntar os dados faltantes.

## Dados

- `agentes/contexto/carteira.md` para custo médio
- `dados/tlh_lotes.json` para lotes detalhados (se existir)

## Regras Lei 14.754/2023

- **Alíquota**: 15% flat sobre ganho nominal em BRL
- **Sem isenção R$35k/mês** (revogada para investimentos exterior)
- **Câmbio**: PTAX venda da **data de liquidação (D+2)**, não da ordem
- **Custo médio**: ponderado em BRL por ativo (obrigatório RFB)
- **Prejuízos**: compensáveis apenas com ganhos de mesma natureza (exterior)
- **DARF**: código 6015, vencimento último dia útil do mês seguinte

## Output

Incluir:
- **Dados da operação**: ticker, shares, preços, câmbios (compra e venda)
- **Cálculo IR**: custo aquisição BRL, valor venda BRL, ganho nominal, IR 15%, retorno líquido
- **DARF**: código, vencimento, valor
- **Notas**: data de liquidação D+2, prejuízo acumulado se houver

## Regras

- Nunca inventar preço ou câmbio — pedir ao Diego se não tiver
- Se ganho ≤ 0: sem IR, registrar prejuízo para compensação futura
- Alertar se venda é de ativo transitory (hold until usufruto recomendado)
