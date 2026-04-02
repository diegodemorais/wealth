# Tracking Difference Scan — ETFs da Carteira

Voce e o agente factor executando um scan de tracking difference dos ETFs da carteira de Diego via trackingdifferences.com.

## Objetivo

Buscar tracking difference (TD), tracking error (TE), TER e spread dos ETFs UCITS ativos na carteira. TD é o custo real de replicação — mais importante que TER para comparar ETFs.

## ETFs da Carteira (alvo principal)

| ETF | ISIN | Papel |
|-----|------|-------|
| SWRD | IE00BFY0GT14 | Core equity global (50%) |
| AVGS | IE00077FRP95 | SCV global (30%) |
| AVEM | IE0003F1AAE9 | EM multi-factor (20%) |

ETFs transitórios (monitorar mas não priorizar): AVUV, AVDV, AVES, DGS, USSC

## Como Executar

### Passo 1: Buscar dados por ETF

Para cada ETF alvo, usar WebFetch ou WebSearch:

**Opção A — WebFetch direto (preferida):**
```
https://www.trackingdifferences.com/ETF/ISIN/{isin}
```
Exemplo para SWRD: `https://www.trackingdifferences.com/ETF/ISIN/IE00BFY0GT14`

**Opção B — WebSearch fallback:**
```
site:trackingdifferences.com "SWRD" OR "IE00BFY0GT14"
site:trackingdifferences.com "AVGS" OR "IE00077FRP95"
site:trackingdifferences.com "AVEM" OR "IE0003F1AAE9"
```

### Passo 2: Extrair métricas chave

Para cada ETF, extrair:
- **Tracking Difference (TD) anual**: custo real de replicação vs benchmark. Negativo = bom (supera benchmark). Positivo = drag.
- **Tracking Error (TE)**: volatilidade do TD — quanto oscila ao redor da média
- **TER**: taxa declarada pelo fundo
- **Spread médio**: custo de transação
- **Benchmark**: índice replicado
- **Método de replicação**: físico ou swap

### Passo 3: Buscar alternativas comparáveis (se solicitado ou se TD alto)

Se TD de algum ETF da carteira estiver > 0,30% positivo (drag relevante), buscar alternativas:

Para SWRD: comparar com IWDA (IE00B4L5Y983), VWCE (IE00BK5BQT80), FWRA (IE0007G78AC4)
Para AVEM: comparar com FLXE (IE00BKBF6H24), VFEM (IE00B3Z3FS74)
Para AVGS: sem alternativa direta com mesmo fator — registrar como único

WebSearch: `site:trackingdifferences.com "IWDA"` etc.

### Passo 4: Consultar justETF para dados complementares (opcional)

Se trackingdifferences.com não retornar dados suficientes:
```
https://www.justetf.com/en/etf-profile.html?isin={isin}
```

Campos adicionais: AUM, domicílio, distribuição de dividendos, histórico de lançamento.

---

## Formato do Relatório

```
## Tracking Difference Scan — {data}

### ETFs Ativos da Carteira

| ETF | Benchmark | TD (1y) | TE | TER | Spread | Método | Avaliação |
|-----|-----------|---------|----|-----|--------|--------|-----------|
| SWRD | MSCI World | X,XX% | X,XX% | X,XX% | X bps | Físico | ✓/⚠️/❌ |
| AVGS | [índice] | X,XX% | X,XX% | X,XX% | X bps | Físico | ✓/⚠️/❌ |
| AVEM | [índice] | X,XX% | X,XX% | X,XX% | X bps | Físico | ✓/⚠️/❌ |

**Legenda**: ✓ TD ≤ 0% (supera benchmark) | ⚠️ TD 0-0,30% (aceitável) | ❌ TD > 0,30% (investigar alternativa)

### Comparação com Alternativas (apenas se ❌ ou sob demanda)

| ETF Alternativa | TD (1y) | TER | Spread | vs Carteira |
|----------------|---------|-----|--------|-------------|

### Insights

- **Melhor custo total (all-in)**: [ETF] com TD X,XX% + spread X bps
- **Pior custo**: [ETF] — motivo
- **Mudança vs scan anterior**: [se houver histórico]

### Recomendação
{Apenas se TD revelar algo acionável — troca de ETF, ou confirmação de que atual é ótimo}

### Fontes
- trackingdifferences.com (consultado {data})
- justETF.com (complementar, se usado)
```

---

## Histórico de Scans

| Data | ETFs Cobertos | TD SWRD | TD AVGS | TD AVEM | Insight Principal |
|------|--------------|---------|---------|---------|-------------------|

## Frequência Recomendada

- **Trimestral**: junto com revisão trimestral
- **Ao avaliar novo ETF**: antes de qualquer decisão de compra
- **Após lançamento de ETF alternativo**: comparar TD
- **Não usar em**: decisões de trade day-to-day (TD é dado anual)
