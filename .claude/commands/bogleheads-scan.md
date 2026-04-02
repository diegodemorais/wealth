# Bogleheads Scan — Forum Intelligence

Voce e o Head (00) executando um scan de inteligencia no forum Bogleheads para a carteira de Diego.

## Método de Acesso

O forum Bogleheads usa phpBB sem API. Três opções de acesso (por ordem de confiabilidade):

1. **RSS Atom feed** (mais confiável para tópicos recentes):
   - Non-US Investing: `https://www.bogleheads.org/forum/feed.php?f=22&mode=topics`
   - Investing Theory: `https://www.bogleheads.org/forum/feed.php?f=10&mode=topics`
   - Personal Investments: `https://www.bogleheads.org/forum/feed.php?f=1&mode=topics`

2. **WebSearch**: `site:bogleheads.org [keywords]` — bom para threads específicas

3. **WebFetch direto**: frequentemente bloqueia (403/phpBB) — usar só como fallback

## Carteira de Diego (referencia)

ETFs ativos: SWRD (50%), AVGS (30%), AVEM (20%), HODL11 (3%), IPCA+ longo TD 2040/2050 (15%), Renda+ 2065 (tatico)
ETFs transitorios (nao comprar mais, diluir via aportes): AVUV, AVDV, AVES, DGS, USSC, IWVL
Perfil: investidor brasileiro, contas IBKR, FIRE aos 50, acumulacao ativa
Nota: JPGL foi eliminado da carteira em 2026-04-01 (target 0%). Nao recomprar sem gatilho explícito.

---

## Threads Fixas a Monitorar

Para threads fixas, usar WebSearch `site:bogleheads.org viewtopic.php?t={ID}` para confirmar posts novos desde o último scan.

| ID | Título | Relevância | Foco | Último Post Lido |
|----|--------|------------|------|-----------------|
| 443539 | The best accumulating global equity ETF | Alta | SWRD/SPPW/VWCE/SPYI/WEBN — tracking difference, TER, custo all-in MCW | ver Histórico abaixo |
| 409214 | International (Non-US) vs US Equities | Alta | Debate US vs ex-US, valuations, expected returns — 215+ páginas ativo | ver Histórico abaixo |
| 427201 | New insights on safe and perpetual withdrawal rates | Alta | SWR — updates e debates sobre withdrawal strategies | ver Histórico abaixo |

---

## Como Executar

### Passo 1: Threads fixas

Para cada thread da tabela acima, buscar posts novos desde o último scan registrado no Histórico:

```
WebSearch: site:bogleheads.org viewtopic.php?t={ID} [keywords relevantes da thread]
```

Se a thread retornar conteúdo, extrair insights principais. Se bloquear, registrar como "Indisponível" e continuar.

### Passo 2: Buscar tópicos recentes via RSS

Fazer WebFetch no feed RSS de Non-US Investing (f=22) primeiro, depois f=10 se relevante.

Parsear o XML Atom para extrair: título, URL, data. Filtrar por relevância antes de investigar mais.

### Passo 2b: Descoberta de Novos Lançamentos UCITS

Buscar novos ETFs UCITS que possam ser candidatos para monitoramento. Executar em paralelo com o Passo 2 (RSS) sempre que possível. Substituir `{mes}` e `{ano}` pelo mês e ano atuais.

**justETF — lançamentos recentes:**
```
WebSearch: site:justetf.com UCITS Ireland accumulating equity new {mes} {ano}
WebSearch: justETF "new ETF" OR "recently listed" Ireland accumulating equity {ano}
```

**ETF Stream — notícias da indústria:**
```
WebSearch: site:etfstream.com UCITS ETF launched Ireland {mes} {ano}
WebSearch: site:etfstream.com "new fund" OR "launches" UCITS accumulating {ano}
```

**Avantis Investors — página oficial UCITS:**
```
WebFetch: https://www.avantisinvestors.com/ucitsetf/
```
Comparar produtos listados com candidatos já em `agentes/referencia/etf-candidatos.md`. Qualquer produto Avantis UCITS não listado = candidato automático para avaliação.

**Dimensional, iShares, Vanguard, JPMorgan:**
```
WebSearch: Dimensional UCITS ETF new launch {ano}
WebSearch: iShares new UCITS ETF Ireland accumulating launched {ano}
WebSearch: Vanguard UCITS ETF new Ireland accumulating {ano}
WebSearch: JPMorgan UCITS ETF new launch Ireland {ano}
```

**Busca geral:**
```
WebSearch: "new UCITS ETF" launched Ireland accumulating equity {mes} {ano}
WebSearch: "UCITS ETF" launched {mes} {ano} factor OR "small cap" OR emerging OR multifactor
```

**Para cada produto novo identificado:**
1. Está em `agentes/referencia/etf-candidatos.md` (tabela resumo ou Descartados)? Se sim, skip.
2. Tem tese para a carteira? (factor tilt, cobertura que complementa SWRD/AVGS/AVEM, custo menor que equivalente)
3. Se relevante → adicionar ficha básica (ticker, ISIN, TER, classificação, tese 1 linha, fonte, data) e incluir na tabela resumo com status 🆕

---

### Passo 3: Filtrar por relevância

Priorizar tópicos que mencionem:
- ETFs ativos: SWRD, IWDA, VWRA, AVGS, AVEM
- ETFs candidatos (ver `agentes/referencia/etf-candidatos.md`): ACSW, AVWC, DDGC/DEGC, AVWS, XDEM
- Temas: factor investing, small cap value, emerging markets, multi-factor, UCITS, accumulating
- FIRE para non-US investors
- Tax efficiency, WHT, Ireland-domiciled ETFs, estate tax
- Tracking difference, TER, securities lending
- Qualquer debate sobre alocacao que seja relevante para carteira factor-tilted

Descartar: tópicos de países específicos sem relevância geral, questões básicas de iniciantes, ativos que Diego não tem e nunca terá.

### Passo 4: Deep-dive nos mais relevantes

Para cada tópico selecionado (max 5-8):
- WebSearch para acessar conteúdo
- Extrair os insights principais e consensus do forum

### Passo 5: Apresentar relatório

```
## Bogleheads Scan — {data}

### Resumo: O que mudou vs último scan
{1-3 bullets com novidades ou confirmações relevantes}

### Threads Fixas — Novidades

| Thread | Posts Novos | Insight Principal | Impacto |
|--------|-------------|-------------------|---------|

### Tópicos Recentes Relevantes

| # | Tópico | Forum | Data | Relevância | Insight Principal |
|---|--------|-------|------|------------|-------------------|

### Insights por Área

**Factor / ETFs UCITS**
- [bullet por insight com referência ao thread]

**FIRE / Desacumulação non-US**
- [bullet]

**Tax / WHT / Estate**
- [bullet]

**Macro / Mercado**
- [bullet]

### Impacto na Carteira de Diego

| Tópico | Impacto | Ação |
|--------|---------|------|
| ... | Confirma / Desafia / Neutro | Nenhuma / Investigar / Acionar issue |

### Próximos Scans
- Threads a monitorar para evolução
```

### Passo Final: Atualizar Histórico e ETF Candidatos

Sempre registrar o scan no Histórico abaixo com data, issues identificadas e resultado principal.

**Se scan identificou ETF novo potencialmente relevante**: verificar se já está em `agentes/referencia/etf-candidatos.md`. Se não estiver, adicionar uma ficha básica (ticker, ISIN, tese, fonte, data) e atualizar a tabela resumo. Não promover para carteira sem issue formal.

---

## Histórico de Scans

| Data | Issues Identificadas | Resultado |
|------|---------------------|-----------|
| 2026-03-23 | XX-004 | Carteira alinhada. SWR non-US = 3.5%. SWRD melhor all-in que IWDA (~10 bps/ano). JPGL confirmado. RSS feed identificado. Cash IBKR < $60k (mapeado em US-listed). |
| 2026-03-26 | — | Morningstar SWR 2026 = 3.9% (base case) — Diego usa 3.12-3.4%, muito mais conservador. International outperformando US (tariffs + USD fraco). Thread 443539 identificado como hub MCW Bogleheads. |
| 2026-04-02 | DDGT identificado (novo candidato) | JL Collins migrou para VT — confirma tese ex-US de Diego. AVGS/AVWS +33% no último ano. DDGT (Dimensional Global Targeted Value, TER 0.44%, AUM $148M) identificado como candidato novo. Debate "Losing faith in SCV" ativo mas sem gatilho de ação. SWR perpetual 3.4% confirmado. Vanguard pipeline 9 ETFs. |

---

## Frequência Recomendada

- **Mensal**: junto com revisão mensal da carteira
- **Sob demanda**: quando Diego perguntar sobre tópico específico
- **Após grandes eventos de mercado**: para capturar reação da comunidade
