# Bogleheads Scan — Forum Intelligence

Voce e o Head (00) executando um scan de inteligencia no forum Bogleheads para a carteira de Diego.

## Metodo de Acesso

O forum Bogleheads usa phpBB sem API. Acesso mais eficiente via **Atom RSS feed**:

| URL | Conteudo |
|-----|----------|
| `https://www.bogleheads.org/forum/feed.php?f=22&mode=topics` | Non-US Investing — topicos recentes (mais relevante) |
| `https://www.bogleheads.org/forum/feed.php?f=10&mode=topics` | Investing Theory, News & General |
| `https://www.bogleheads.org/forum/feed.php?f=1&mode=topics` | Personal Investments |
| `https://www.bogleheads.org/forum/feed.php?mode=topics` | Todos os foruns — topicos recentes |

Para threads especificos: WebSearch `site:bogleheads.org [keywords]`
WebFetch direto no forum bloqueia (403/phpBB) — usar RSS ou WebSearch.

## Carteira de Diego (referencia)

ETFs ativos: SWRD (35%), AVGS (25%), AVEM (20%), JPGL (15%), HODL11 (3%), IPCA+ longo TD 2040/2050 (15%), Renda+ 2065 (tatico)
ETFs transitorios (nao comprar mais, liquidar em anos): AVUV, AVDV, AVES, DGS, USSC
Perfil: investidor brasileiro, contas IBKR, FIRE aos 50, acumulacao ativa

## Como Executar

## Threads Fixos a Monitorar

Para cada thread abaixo, buscar posts novos desde o ultimo scan (ver Historico de Scans):

| ID | Título | Relevância | Foco |
|----|--------|------------|------|
| 443539 | The best accumulating global equity ETF in 2024 | Alta | SWRD/SPPW/VWCE/SPYI/WEBN — tracking difference, TER, custo all-in MCW |
| 409214 | International (Non-US) versus US Equities (The "Arguments") | Alta | Debate US vs ex-US, valuations, expected returns — thread ativo 215+ paginas |
| 427201 | New insights on safe and perpetual withdrawal rates | Alta | SWR — updates e debates sobre withdrawal strategies |

Acesso: `WebSearch site:bogleheads.org/forum viewtopic.php?t={ID}` ou RSS.

---

### Passo 1: Buscar topicos recentes

Faça WebFetch nas URLs RSS acima (comecar pelo f=22 Non-US Investing).
Parsear o Atom XML para extrair:
- Titulo dos topicos
- URL de cada topico
- Data de criacao

### Passo 2: Filtrar por relevancia

Priorizar topicos que mencionem:
- ETFs relevantes: SWRD, IWDA, VWRA, AVGS, AVEM, JPGL, AVUV, AVDV, AVES
- Temas: factor investing, small cap value, emerging markets, multi-factor, UCITS, accumulating
- FIRE para non-US investors
- Tax efficiency, WHT, Ireland-domiciled ETFs, estate tax
- Tracking difference, TER, securities lending
- Qualquer debate sobre alocacao que seja relevante para carteira factor-tilted

Descartar: topicos de paises especificos sem relevancia geral, questions basicas de iniciantes, ativos que Diego nao tem e nunca tera.

### Passo 3: Deep-dive nos mais relevantes

Para cada topico selecionado (max 5-8):
- WebSearch `site:bogleheads.org [titulo ou keywords do topico]` para confirmar acesso
- Ou tentar WebFetch direto na URL do topico (algumas paginas carregam)
- Extrair os insights principais e consensus do forum

### Passo 4: Apresentar relatorio

Formato de saida:

```
## Bogleheads Scan — {data}

### Resumo: O que mudou vs ultimo scan
{1-3 bullets com novidades ou confirmacoes relevantes}

### Topicos Relevantes

| # | Topico | Forum | Data | Relevancia | Insight Principal |
|---|--------|-------|------|------------|-------------------|

### Insights por Area

**Factor / ETFs UCITS**
- [bullet por insight com referencia ao thread]

**FIRE / Desacumulacao non-US**
- [bullet]

**Tax / WHT / Estate**
- [bullet]

**Macro / Mercado**
- [bullet]

### Impacto na Carteira de Diego

| Topico | Impacto | Acao |
|--------|---------|------|
| ... | Confirma / Desafia / Neutro | Nenhuma / Investigar / Acionar issue |

### Proximos Scans
- Topicos a monitorar para evolucao
```

## Frequencia Recomendada

- **Mensal**: junto com revisao mensal da carteira
- **Sob demanda**: quando Diego perguntar sobre topic especifico no forum
- **Apos grandes eventos de mercado**: para capturar reacao da comunidade

## Historico de Scans

| Data | Issues Identificados | Resultado |
|------|---------------------|-----------|
| 2026-03-23 | XX-004 | Carteira alinhada. SWR non-US = 3.5%. SWRD melhor all-in que IWDA (~10 bps/ano). JPGL confirmado. RSS feed identificado. Cash IBKR < $60k (ja mapeado em US-listed). |
| 2026-03-26 | — | Morningstar SWR 2026 = 3.9% (base case) — Diego usa 3.12-3.4%, muito mais conservador. International outperformando US (tariffs + USD fraco). Thread 443539 identificado como hub MCW Bogleheads. |
