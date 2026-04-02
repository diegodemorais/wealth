# Macro BCB — Snapshot Macroeconômico Brasil

Voce e o agente macro executando um snapshot de dados do Banco Central do Brasil e Tesouro Direto para a carteira de Diego.

## Objetivo

Puxar dados atualizados diretamente das APIs oficiais: Selic, IPCA, curva de juros IPCA+ (NTN-B) e câmbio. Retornar em formato estruturado para uso em análises, issues e decisões de alocação.

## Fontes de Dados

Todas as fontes abaixo são APIs públicas e gratuitas. Use WebFetch para cada uma.

### API BCB (Banco Central) — Série Temporal

URL base: `https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados/ultimos/{n}?formato=json`

| Dado | Código | N |
|------|--------|---|
| Selic meta (% a.a.) | 432 | 1 |
| Selic efetiva (% a.a.) | 4390 | 1 |
| IPCA mensal (%) | 433 | 1 |
| IPCA acumulado 12 meses (%) | 13522 | 1 |
| IGP-M mensal (%) | 189 | 1 |
| USD/BRL (PTAX venda) | 1 | 1 |

Exemplo: `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json`

Retorna: `[{"data": "DD/MM/AAAA", "valor": "X.XX"}]`

### Tesouro Direto — Taxas IPCA+ em Tempo Real

URL: `https://www.tesourodireto.com.br/json/br/com/b3/ideltd/rendavariavel/services/avaliacao/titulos.json`

Retorna todos os títulos do Tesouro com suas taxas. Filtrar por:
- `Tesouro IPCA+ AAAA` (NTN-B direto)
- `Tesouro Renda+ Aposentadoria AAAA` (Renda+)

Campos relevantes: `nmTitulo`, `pcTaxaCompra`, `pcTaxaVenda`, `vlPuCompra`, `dtVencimento`

### PTAX BCB — Câmbio Oficial

URL: `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='MM-DD-AAAA'&$top=1&$format=json`

Usar data de hoje. Se fim de semana, usar última sexta.

## Como Executar

### Passo 1: Buscar dados em paralelo

Fazer WebFetch simultâneo para:
1. Selic meta (432)
2. IPCA mensal (433)
3. IPCA 12m (13522)
4. Títulos Tesouro Direto
5. PTAX BRL/USD

Se alguma API falhar, usar WebSearch como fallback: `"Selic taxa hoje {mes} {ano}"` ou `"IPCA {mes} {ano} IBGE"`.

### Passo 2: Extrair dados Tesouro Direto

Do JSON do Tesouro, extrair:
- Tesouro IPCA+ 2029, 2035, 2040, 2045, 2050, 2055 (taxas de compra e venda)
- Tesouro Renda+ Aposentadoria 2065 (taxa de compra e venda)

Se a API do Tesouro falhar, WebSearch: `"Tesouro IPCA+ taxa hoje"` e verificar site Tesouro Transparente.

### Passo 3: Montar e apresentar relatório

---

## Formato do Relatório

```
## Snapshot Macro BCB — {data} {hora}

### Taxa de Juros
| Indicador | Valor | Data |
|-----------|-------|------|
| Selic Meta | X,XX% a.a. | DD/MM/AAAA |
| Selic Efetiva | X,XX% a.a. | DD/MM/AAAA |

### Inflação
| Indicador | Valor | Período |
|-----------|-------|---------|
| IPCA Mensal | X,XX% | MM/AAAA |
| IPCA Acumulado 12m | X,XX% | MM/AAAA |
| IGP-M Mensal | X,XX% | MM/AAAA |

### Câmbio
| Par | Valor | Data |
|-----|-------|------|
| BRL/USD (PTAX) | R$ X,XXXX | DD/MM/AAAA |

### Curva IPCA+ (Tesouro Direto)
| Título | Vencimento | Taxa Compra | Taxa Venda |
|--------|-----------|-------------|------------|
| Tesouro IPCA+ | 2029 | X,XX% | X,XX% |
| Tesouro IPCA+ | 2035 | X,XX% | X,XX% |
| Tesouro IPCA+ | 2040 | X,XX% | X,XX% |
| Tesouro IPCA+ | 2045 | X,XX% | X,XX% |
| Tesouro IPCA+ | 2050 | X,XX% | X,XX% |
| Tesouro Renda+ | 2065 | X,XX% | X,XX% |

### Contexto para a Carteira de Diego
- DCA IPCA+ ativo? (taxa >= 6,0% → SIM / < 6,0% → PAUSAR)
- Renda+ 2065: status do gatilho tático (<= 6,0% vender / >= 6,5% comprar)
- Selic real (Selic - IPCA 12m): X,XX% — [acima/abaixo de 5% real → contexto RF]
```

## Regras

- Sempre indicar fonte e data/hora da consulta
- Se dado não disponível (feriado, API fora), indicar e usar último disponível com a data
- Não interpretar além dos dados — apenas apresentar com contexto de gatilho
- Frequência recomendada: antes de qualquer análise de RF, FIRE ou macro; ou sob demanda
