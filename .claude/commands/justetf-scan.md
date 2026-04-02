# justETF Scan — Discovery e Comparação de ETFs UCITS

Voce e o agente factor executando discovery e comparação de ETFs UCITS via justETF para a carteira de Diego.

## Objetivo

Descobrir novos ETFs UCITS relevantes, comparar alternativas aos ETFs atuais, e verificar dados fundamentais (AUM, TER, domicílio, dividendos). Complementa o `/tracking-difference` — justETF é para descoberta e triagem; trackingdifferences.com é para custo real de replicação.

## ETFs Ativos da Carteira (referência)

| ETF | ISIN | Papel |
|-----|------|-------|
| SWRD | IE00BFY0GT14 | Core equity global (50%) |
| AVGS | IE0003R87OG3 | SCV global (30%) — fundo ATIVO (Avantis) |
| AVEM | IE000K975W13 | EM multi-factor (20%) — fundo ATIVO (Avantis) |

## ETF Candidatos em Monitoramento (ver fichas completas em `agentes/referencia/etf-candidatos.md`)

| ETF | ISIN | Status | Dados a verificar |
|-----|------|--------|-------------------|
| ACSW | IE000Y7K9659 | Lançado mar/2026 | TD rolling, AUM, spread |
| AVWC | IE000QCKBCT8 | Dados insuficientes | AUM, factor loadings, IBKR |
| DDGC/DEGC | IE000BYXM682 | Lançado nov/2025 | TD, AUM, IBKR, factor loadings |
| AVWS | IE0003R87OG3* | Verificar ISIN | *Pode ser mesmo ISIN que AVGS |
| XDEM | IE00BZ0PKT83 | Em avaliação | TD vs AVGS semiannual |

Ao executar scan, verificar se candidatos têm dados novos e atualizar `etf-candidatos.md` se necessário.

## Casos de Uso

### A) Perfil de ETF específico

Para verificar dados de um ETF conhecido:

```
WebFetch: https://www.justetf.com/en/etf-profile.html?isin={ISIN}
```

Extrair: nome, índice replicado, TER, AUM, domicílio (Irlanda/Luxemburgo), política de dividendos (acumulação/distribuição), método de replicação (físico/swap), data de lançamento, bolsas listadas.

### B) Busca por categoria / índice

Para encontrar ETFs que replicam um índice ou exposição específica:

```
WebSearch: site:justetf.com "MSCI World" UCITS accumulating OR
WebSearch: site:justetf.com "emerging markets" "multi-factor" UCITS
WebFetch: https://www.justetf.com/en/find-etf.html?groupField=index&index={nome_indice}
```

### C) Comparação de alternativas

Para comparar ETF atual com alternativas:

1. Buscar ETFs com mesmo índice ou exposição similar via WebSearch
2. Para cada candidato, fazer WebFetch do perfil
3. Comparar: TER, AUM, domicílio, método, data lançamento
4. Complementar com `/tracking-difference` para TD real de cada um

### D) Scan de novos produtos UCITS

Para identificar ETFs lançados recentemente que podem ser relevantes:

```
WebSearch: site:justetf.com "Avantis" UCITS {ano}
WebSearch: site:justetf.com "new ETF" UCITS factor {ano}
WebSearch: justetf new UCITS ETF factor small cap value {ano}
```

## Critérios de Qualidade para Triagem

Um ETF merece análise aprofundada se atender:
- **AUM mínimo**: €300M+ (liquidez adequada para IBKR)
- **TER**: ≤ 0,25% para ETFs de índice amplo; ≤ 0,40% para factor/EM
- **Domicílio**: Irlanda (preferência — tratado fiscal com EUA) ou Luxemburgo
- **Política**: Acumulação (sem evento tributável no Brasil)
- **Método**: Físico preferível para fator loading real; swap aceitável para índices amplos
- **Idade**: 3+ anos (TD histórico mais confiável)

## Como Executar

### Passo 1: Entender o objetivo do scan

Definir o caso de uso (A, B, C ou D) a partir da conversa. Se não estiver claro, perguntar.

### Passo 2: Buscar dados

Executar WebFetch/WebSearch conforme o caso de uso. Para comparações, buscar em paralelo.

### Passo 3: Filtrar por critérios de qualidade

Aplicar os critérios acima. Descartar ETFs que não atendem AUM mínimo ou têm menos de 3 anos.

### Passo 4: Complementar com tracking difference (se necessário)

Se o objetivo é substituir um ETF atual ou avaliar custo real, acionar `/tracking-difference` com os candidatos que passaram na triagem.

---

## Formato do Relatório

### Para perfil único:
```
## justETF — {ETF ticker} ({ISIN})

| Campo | Valor |
|-------|-------|
| Nome completo | ... |
| Índice | ... |
| TER | X,XX% |
| AUM | €X.XB |
| Domicílio | Irlanda / Luxemburgo |
| Política de dividendos | Acumulação / Distribuição |
| Método de replicação | Físico / Swap |
| Data de lançamento | MM/AAAA |
| Bolsas | LSE, Xetra, Euronext... |

**Avaliação**: Atende critérios de qualidade? SIM/NÃO — motivo
**Próximo passo**: Verificar TD em /tracking-difference
```

### Para comparação / discovery:
```
## justETF Scan — {objetivo} — {data}

### ETFs Encontrados

| ETF | ISIN | TER | AUM | Domicílio | Método | Lançamento | Passa triagem? |
|-----|------|-----|-----|-----------|--------|-----------|----------------|

### Recomendação de Análise Aprofundada

{ETFs que passaram na triagem e merecem verificação de TD}

### Novos Produtos Relevantes (se scan D)

| ETF | ISIN | Exposição | Por que relevante para a carteira |
|-----|------|-----------|----------------------------------|
```

## Regras

- Sempre registrar ISIN — é o identificador definitivo (ticker varia por bolsa)
- Não recomendar substituição sem TD real de `/tracking-difference`
- AUM abaixo de €100M: não considerar (risco de fechamento)
- Acumulação é obrigatório para carteira de Diego (sem evento tributável)
- Frequência: sob demanda — ao avaliar novo ETF, alternativa, ou após RR Scan identificar produto novo
- **ETF novo que passou triagem**: verificar se já está em `agentes/referencia/etf-candidatos.md`. Se não estiver, adicionar ficha básica (ticker, ISIN, tese, fonte, data). Não promover para carteira sem issue formal.

## Histórico de Scans

| Data | Objetivo | ETFs Analisados | Resultado Principal |
|------|----------|----------------|---------------------|
