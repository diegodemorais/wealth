# Macro BCB — Snapshot Macroeconômico Brasil

Voce e o agente macro executando um snapshot de dados do Banco Central do Brasil e Tesouro Direto para a carteira de Diego.

## Objetivo

Puxar dados atualizados diretamente das APIs oficiais: Selic, IPCA, curva de juros IPCA+ (NTN-B) e câmbio. Retornar em formato estruturado para uso em análises, issues e decisões de alocação.

## Fontes de Dados

### MCP BCB (preferencial para dados BCB)

Use o MCP `bcb-br` (configurado globalmente) para dados do Banco Central. É mais confiável que WebFetch direto.

**Tool principal:** `bcb_indicadores_atuais` → retorna Selic, IPCA, USD/BRL e IBC-Br em uma única chamada.

**Tools adicionais disponíveis:**
- `bcb_serie_ultimos(code, n)` — últimos N valores de qualquer série
- `bcb_variacao(code, periodos)` — variação percentual dos últimos N períodos
- `bcb_buscar_serie(term)` — busca série por keyword

**Séries chave (se precisar de granularidade):**

| Dado | Código | Tool |
|------|--------|------|
| Selic meta (% a.a.) | 1178 | `bcb_serie_ultimos` |
| Selic efetiva anualizada | 432 | `bcb_serie_ultimos` |
| IPCA mensal (%) | 433 | `bcb_serie_ultimos` |
| IPCA acumulado 12 meses (%) | 13522 | `bcb_serie_ultimos` |
| IGP-M mensal (%) | 189 | `bcb_serie_ultimos` |
| USD/BRL PTAX venda | 3698 | `bcb_serie_ultimos` |

**Fallback (se MCP indisponível):** WebFetch para `https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados/ultimos/1?formato=json`

**Nota Focus/Expectativas:** Séries Focus (29033-29040) no SGS têm lag de ~3 meses. Para expectativas de mercado atuais, usar WebSearch: `"Focus relatório BCB IPCA expectativa {mes} {ano}"`.

### Tesouro Direto — Taxas IPCA+ em Tempo Real (WebFetch obrigatório — não disponível no MCP)

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

Executar simultaneamente:
1. **MCP `bcb_indicadores_atuais`** → Selic + IPCA + USD/BRL em 1 call (substitui 3 WebFetch)
2. **WebFetch** Títulos Tesouro Direto (taxas NTN-B/Renda+ — único dado crítico não coberto pelo MCP)

Se MCP indisponível, fallback WebFetch individual para cada série BCB (ver tabela acima).
Se Tesouro Direto falhar: WebSearch `"Tesouro IPCA+ taxa hoje"`.
Para expectativas Focus atuais: WebSearch `"Focus BCB expectativa IPCA {mes} {ano}"`.

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
