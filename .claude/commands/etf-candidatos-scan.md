# ETF Candidatos — Scan Mensal

Voce e o agente factor executando o scan mensal de ETF candidatos em monitoramento. Verifica atualizações de dados (AUM, TD, IBKR, lançamentos) para todos os candidatos em `agentes/referencia/etf-candidatos.md` e decide se algum atingiu gatilho de promoção.

## Objetivo

Para cada ETF na tabela resumo de `etf-candidatos.md`, verificar se:
1. Houve atualização de dados relevante (AUM, TD, disponibilidade IBKR)
2. Algum candidato atingiu o gatilho de consideração (promover para issue)
3. Algum candidato deve ser descartado (AUM muito baixo, fechamento, tese invalidada)
4. Algum candidato aguardando lançamento foi lançado

---

## Como Executar

### Passo 0: Descoberta de Novos ETFs UCITS

Buscar novos lançamentos em **todos os canais abaixo em paralelo** (WebSearch simultâneos). Substituir `{mes}` e `{ano}` pelo mês e ano atuais.

**justETF — lançamentos recentes (Irlanda, Acc, equity):**
```
WebSearch: site:justetf.com UCITS Ireland accumulating equity new {mes} {ano}
WebSearch: justETF "new ETF" OR "recently listed" Ireland accumulating equity {ano}
```

**ETF Stream — notícias da indústria:**
```
WebSearch: site:etfstream.com UCITS ETF launched Ireland {mes} {ano}
WebSearch: site:etfstream.com "new fund" OR "launches" UCITS accumulating {ano}
```

**Avantis Investors — página oficial UCITS (família mais relevante):**
```
WebFetch: https://www.avantisinvestors.com/ucitsetf/
```
Comparar produtos listados com candidatos já em `etf-candidatos.md`. Qualquer produto Avantis UCITS não listado = candidato automático para avaliação.

**Dimensional Fund Advisors — UCITS:**
```
WebSearch: Dimensional UCITS ETF new launch {ano}
WebSearch: site:dimensional.com UCITS ETF Ireland {ano}
```

**iShares (BlackRock) — novos ETFs Irlanda:**
```
WebSearch: iShares new UCITS ETF Ireland accumulating launched {ano}
```

**Vanguard — novos UCITS:**
```
WebSearch: Vanguard UCITS ETF new Ireland accumulating {ano}
```

**JPMorgan Asset Management — novos ETFs:**
```
WebSearch: JPMorgan UCITS ETF new launch Ireland {ano}
```

**TrackInsight — discovery geral:**
```
WebSearch: site:trackinsight.com new UCITS ETF Ireland accumulating {ano}
```

**Busca geral:**
```
WebSearch: "new UCITS ETF" launched Ireland accumulating equity {mes} {ano}
WebSearch: "UCITS ETF" launched {mes} {ano} factor OR "small cap" OR emerging OR multifactor
```

**Para cada produto novo identificado:**
1. Está em `agentes/referencia/etf-candidatos.md` (tabela resumo ou Descartados)? Se sim, skip.
2. Pertence a família relevante (Avantis, Dimensional, iShares, Vanguard, JPMorgan)?
3. Tem tese para a carteira? (factor tilt, cobertura que complementa SWRD/AVGS/AVEM, custo menor que equivalente)
4. Se relevante → adicionar ficha básica (ticker, ISIN, TER, classificação, tese 1 linha, fonte, data) e incluir na tabela resumo com status 🆕

---

### Passo 1: Ler estado atual

```
Ler: agentes/referencia/etf-candidatos.md (tabela resumo + todas as fichas)
```

Identificar para cada candidato:
- Status atual (⏳ aguardando / 🆕 novo / 🔍 em avaliação / 👁️ reentrada condicional)
- Gatilho de consideração definido na ficha
- Dados pendentes de verificação (coluna "Dados a verificar")
- Frequência de monitoramento declarada na ficha

Pular candidatos cuja frequência é semestral SE o último scan foi há < 5 meses.

### Passo 2: Verificar dados por ETF

Para cada candidato com dados pendentes ou revisão mensal, executar WebFetch/WebSearch em paralelo:

**Dados AUM e TD (via justETF):**
```
WebFetch: https://www.justetf.com/en/etf-profile.html?isin={ISIN}
```
Extrair: AUM atual, TER, data de lançamento (se aguardando).

**Dados TD (via trackingdifferences.com):**
```
WebFetch: https://www.trackingdifferences.com/ETF/ISIN/{ISIN}
```
Extrair: TD anual, TE, spread.

**Disponibilidade IBKR (se não confirmada):**
```
WebSearch: IBKR "Interactive Brokers" "{ticker}" UCITS LSE
```

**Candidatos aguardando lançamento:**
```
WebSearch: "{nome do fundo}" UCITS ETF launched OR "new ETF" {mes} {ano}
WebSearch: site:justetf.com "{nome}" UCITS
```

**AUM crítico (FLXE — risco de fechamento):**
```
WebFetch: https://www.justetf.com/en/etf-profile.html?isin=IE00BF2B0K52
```
Flag se AUM < €30M → mover para Descartados.

### Passo 3: Verificar gatilhos de promoção

Para cada candidato, comparar dados atualizados com o gatilho declarado na ficha:

| Candidato | Gatilho resumido | Dados atuais | Status |
|-----------|-----------------|-------------|--------|
| ACSW | TD rolling 12m + AUM >€500M + spread | TD=? AUM=? | ✓/⚠️/❌ |
| AVWC | AUM + factor loadings + IBKR | AUM=? | — |
| DDGC/DEGC | TD + AUM + IBKR + factor loadings | TD=? | — |
| AVWS | Lançado + ISIN confirmado + AUM >€100M | — | — |
| FLXE | AUM >€150M + TD + factor loadings | AUM=? | ⚠️ |
| XDEM | TD vs AVGS + fator loadings | TD=? | — |
| JPGL | Gatilho específico reentrada (ver ficha) | — | 👁️ |
| Vanguard Global SC | Lançado + TER ≤0.15% + Acc + IBKR | — | ⏳ |
| Vanguard All-World All-Cap | Lançado + Acc + IBKR | — | ⏳ |

Se gatilho atingido → flag para issue formal. **Não promover diretamente** — gatilho ativado não é promoção automática, é sinal para debate.

### Passo 4: Relatório

```
## ETF Candidatos Scan — {data}

### Resumo
{1-3 bullets: o que mudou vs scan anterior}

### Status por Candidato

| Ticker | AUM | TD | IBKR | Gatilho | Status | Ação |
|--------|-----|----|------|---------|--------|------|
| ACSW | €Xm | X.XX% | Sim/Não | X/3 critérios | 🔍 | Monitorar |
| AVWC | ... | | | | | |
| DDGC/DEGC | ... | | | | | |
| AVWS | — | — | — | Não lançado | ⏳ | Aguardar |
| FLXE | €Xm | X.XX% | Sim | 0/3 ⚠️ AUM baixo | 🔍 | ⚠️ Risco fechamento |
| XDEM | ... | | | | | |
| JPGL | — | — | — | Reentrada: X/3 | 👁️ | — |
| Vanguard SC | — | — | — | Não lançado | ⏳ | Aguardar |
| Vanguard All-Cap | — | — | — | Não lançado | ⏳ | Aguardar |

### Gatilhos Ativados (requerem issue formal)
{Se nenhum: "Nenhum candidato atingiu gatilho de promoção neste scan."}
{Se algum: ticket + critérios atingidos + ação sugerida}

### Candidatos a Descartar
{Se algum: motivo (AUM < €30M, tese invalidada, fechamento confirmado)}
{Se nenhum: "Nenhum candidato a descartar."}

### Novos Candidatos Identificados
{Se bogleheads-scan ou rr-scan identificaram algo novo neste mês: listar aqui para avaliação}
{Se nenhum: "—"}
```

### Passo 5: Atualizar etf-candidatos.md

Para cada candidato com dados novos:
1. Atualizar campo "Última atualização dos dados" na ficha
2. Atualizar AUM, TD, spread se mudaram
3. Se candidato lançado: preencher ISIN, TER, data de lançamento
4. Se descartado: mover ficha para seção "## Candidatos Descartados" e atualizar status na tabela resumo (❌)
5. Se gatilho ativado: atualizar "Próxima Revisão" para o mês seguinte (acompanhar de perto)

**Em sessão interativa**: mostrar mudanças e aguardar aprovação de Diego antes de editar.
**Em modo /loop**: editar diretamente com mudanças factuais (AUM, TD). Gatilhos e descartes: sempre aguardar aprovação.

---

## Regras

- Dados de AUM e TD são factuais — atualizar sem aprovação em modo autônomo
- Gatilho ativado ≠ promoção automática — sempre criar issue e debater
- FLXE AUM < €30M = descarte automático proposto (reportar ao Diego)
- Não adicionar candidatos ao etf-candidatos.md sem justificativa mínima (fonte, tese, por que relevante)
- Se justETF bloquear WebFetch, usar WebSearch: `site:justetf.com "{ticker}" UCITS`
- Sempre registrar data da verificação no campo "Última atualização dos dados"

## Frequência Recomendada

- **Mensal**: como parte da revisão mensal da carteira
- **Sempre após /rr-scan ou /bogleheads-scan**: para incorporar ETFs novos identificados
- **Após lançamento confirmado de candidato aguardando**: rodar imediatamente com foco nesse ETF
