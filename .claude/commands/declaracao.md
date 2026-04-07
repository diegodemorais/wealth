# Declaração Anual — Checklist DIRPF Investimentos Internacionais

Checklist para declaração anual de IRPF com ETFs UCITS via IBKR.

O argumento `$ARGUMENTS` pode especificar o ano-base (ex: `2025` para declaração 2026). Se vazio, usar o ano anterior ao atual.

## Dados necessários (coleta prévia)

1. **IBKR**: Flex Query anual (1 Jan – 31 Dez do ano-base) contendo:
   - Open Positions (posições em 31/Dez)
   - Trades (todas as compras e vendas do ano)
   - Dividends (dividendos recebidos)
   - Interest (juros sobre cash)

2. **Câmbio**: PTAX BCB de **31/Dezembro** do ano-base (para conversão de posições)

3. **Lotes de compra**: `dados/tlh_lotes.json` com custo de cada lote em USD e câmbio de compra

## Seção 1 — Bens e Direitos (Ficha "Bens e Direitos")

### Código 99 — Outros bens e direitos (ETFs internacionais)

Para cada ETF em carteira na data 31/Dez do ano-base:

```
Código: 99 - Outros bens e direitos
Discriminação: "Fundos de investimento negociados em bolsa (ETF) no exterior.
  Ticker: [TICKER], [N] cotas, custodiados na Interactive Brokers LLC (EUA),
  conta [NÚMERO CONTA]. Custo médio ponderado: USD [CUSTO] / cota."
Valor situação anterior (31/Dez ano-1): R$ [VALOR EM BRL]
Valor situação atual (31/Dez ano-base): R$ [VALOR EM BRL]
```

**Conversão**: usar **PTAX venda do dia 31/Dez** do ano-base (ou último dia útil).
**Custo**: custo de aquisição (não valor de mercado) — soma dos lotes em carteira convertido pelo PTAX da compra.

### Dinheiro no exterior (cash IBKR)

```
Código: 62 - Depósito em conta corrente no exterior
Discriminação: "Disponibilidade em USD na Interactive Brokers LLC..."
Valor: R$ [saldo × PTAX 31/Dez]
```

## Seção 2 — Rendimentos Isentos (Dividendos)

ETFs UCITS de ações internacionais: dividendos geralmente **não se aplicam** (ETFs físicos de acumulação como SWRD, AVGS, AVEM reinvestem dividendos internamente — sem distribuição ao cotista).

Verificar no Flex Query se há dividendos (`DividendAccrual`, `CashDividend`). Se zero, nenhuma declaração necessária nesta seção.

## Seção 3 — Ganhos de Capital no Exterior (Lei 14.754/2023)

**Aplicável apenas se houve VENDAS no ano-base.**

Regras vigentes (Lei 14.754/2023):
- **Alíquota**: 15% flat sobre ganho nominal em BRL
- **Sem isenção** de R$35.000/mês (revogada para investimentos no exterior)
- **Base de cálculo**: ganho = valor venda (BRL via PTAX D+2) − custo médio (BRL via PTAX compra)
- **DARF**: código 6015, vencimento último dia útil do mês seguinte à venda
- **Prejuízos**: compensáveis apenas com ganhos da mesma natureza (exterior), sem prazo de prescrição

Para cada venda:
```
Data venda: [DATA]
Ativo: [TICKER]
Quantidade: [N] cotas
Valor venda: USD [X] × PTAX [Y] = R$ [Z]
Custo médio: R$ [A] (lotes FIFO × câmbio de compra)
Ganho nominal: R$ [Z - A]
IR (15%): R$ [IR]
DARF 6015: pago até [ULTIMO_DIA_UTIL_MES_SEGUINTE]
```

## Seção 4 — Rendimentos do Exterior (juros sobre cash)

Se IBKR pagou juros sobre saldo em USD (visible em Flex Query como `BrokerInterest`):
```
Ficha: Rendimentos Tributáveis Recebidos de PF/Exterior
Natureza: "Juros sobre disponibilidade mantida no exterior (Interactive Brokers)"
Valor: USD [X] × PTAX recebimento = R$ [Y]
IR: tabela progressiva (15–27.5%)
```

## Seção 5 — Variação Patrimonial (conferência)

A RFB cruzará as variações. Verificar consistência:
- Saldo IBKR 31/Dez (USD) × PTAX = Bens e Direitos declarados
- Ganhos/perdas do ano reconciliados com extratos

## Checklist final

- [ ] Flex Query anual IBKR baixado (Trades + Positions + Dividends)
- [ ] PTAX 31/Dez consultado em bcb.gov.br/acessoinformacao/legado/ptax
- [ ] Custo médio de cada ETF calculado por lote (FIFO) — `dados/tlh_lotes.json`
- [ ] Bens e Direitos preenchidos (código 99 por ETF + código 62 cash)
- [ ] Ganhos de capital: DARF 6015 pagos mensalmente ao longo do ano?
- [ ] Rendimentos de juros declarados (se houver)
- [ ] Verificar: variação patrimonial consistente

## Regras

- Câmbio para Bens e Direitos = PTAX 31/Dez (não comercial operacional)
- Câmbio para IR = PTAX da **data de liquidação (D+2)** da operação
- Dúvidas tributárias: consultar contador especializado em investimentos no exterior
- Usar `/tax-calc` para calcular IR de uma venda específica
