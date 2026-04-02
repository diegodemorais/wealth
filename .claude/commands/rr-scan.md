# RR Scan — Rational Reminder Forum Intelligence

Voce e o Head (00) executando um scan de inteligencia no forum Rational Reminder para a carteira de Diego.

## Acesso

Forum Discourse com API MCP configurada. Ferramentas disponíveis: `mcp__discourse__discourse_*`

Credenciais em memória: `reference_rational_reminder.md`

## Carteira de Diego (referencia)

ETFs ativos: SWRD (50%), AVGS (30%), AVEM (20%), HODL11 (3%), IPCA+ longo TD 2040/2050 (15%), Renda+ 2065 (tatico)
ETFs transitorios (nao comprar mais, diluir via aportes): AVUV, AVDV, AVES, DGS, USSC, IWVL
Perfil: investidor brasileiro, contas IBKR, FIRE aos 50, factor-tilted, acumulacao ativa
Nota: JPGL foi eliminado da carteira em 2026-04-01 (target 0%). Monitorado em `agentes/referencia/etf-candidatos.md` como reentrada condicional (status: 👁️).

---

## Usuários de Alta Qualidade (priorizar posts destes usuários ao ler threads)

- **glimz**: análises quantitativas de tracking difference, spreads, dados de NAV — muito detalhado
- **afstand**: criador do thread UCITS MCW, perspectiva holandesa, dados de TD históricos
- **Ben_Felix**: host do podcast, perspectiva teórica fatorial
- **ipparkos**: perguntas relevantes, sínteses úteis
- **django**: perspectiva prática, recomendações diretas

---

## Threads Fixas a Monitorar

Para cada thread ativa, leia os posts novos desde o **Último Post Lido** (ver coluna abaixo). Atualizar o número após cada scan.

| ID | Título | Relevância | Foco | Último Post Lido |
|----|--------|------------|------|-----------------|
| 31781 | UCITS MCW implementations – simple and low-cost solutions | Alta | SWRD, IWDA, VWCE, WEBN, SPYY — tracking difference all-in, spread, custo real | ver Histórico abaixo |
| 32396 | Avantis UCITS (EU) Discussion Thread | Alta | AVGS, AVEM, AVWC, AVWS, AVEU, AVPE, AVUS — hub principal Avantis UCITS | ver Histórico abaixo |
| 31258 | Search for an ideal UCITS (EU) factor portfolio (Part 2) | Alta | AVGS, AVEM, JPGL, DDGC, AVWC — comparação fatorial UCITS, novos produtos | ver Histórico abaixo |
| 34728 | Dimensional UCITS (EU) Discussion Thread | Alta | DDGC, DDUM, DDXM — factor loadings DFA UCITS, regressões vs Avantis | ver Histórico abaixo |
| 15439 | Investing in Managed Futures | Media | RK-003 — managed futures como diversificador (issue backlog) | ver Histórico abaixo |
| 13776 | Bitcoin / Crypto FUD | Media | HODL11, cripto — tese e gatilhos | ver Histórico abaixo |
| 2927 | How much Emerging Market? | Media | Alocação EM — debate size/conviction | ver Histórico abaixo |
| 13125 | 100% Small Cap Value portfolio | Media | SCV thesis — base teórica AVGS | ver Histórico abaixo |

> Thread 17774 (Avantis ETF Discussion) foi fechada em Mar/2022 e substituída por 32396 — removida do monitoramento ativo.

---

## Busca por Threads Novas

Após ler as threads fixas, buscar threads novas que possam ser relevantes.

### Queries de busca sugeridas

```
discourse_search: "AVGS UCITS" ou "Avantis global small cap"
discourse_search: "DDGC Dimensional" ou "Dimensional UCITS"
discourse_search: "FIRE non-US" ou "FIRE international withdrawal"
discourse_search: "AVEM emerging markets UCITS"
discourse_search: "tracking difference UCITS 2026"
discourse_search: "small cap value premium" (novos papers/debates)
discourse_search: "managed futures UCITS"
discourse_search: "sequence of returns risk"
discourse_search: "ACSW swap" ou "iShares MSCI World swap UCITS"
discourse_search: "JPGL" ou "JPMorgan Global Equity Multi-Factor" (reentrada condicional — monitorar dados de TD e factor loadings)
```

### Passo 2b: Descoberta de Novos Lançamentos UCITS via Web

Além das threads do forum, buscar lançamentos recentes via web. Executar em paralelo com as queries de busca acima. Substituir `{mes}` e `{ano}` pelo mês e ano atuais.

**Avantis Investors — página oficial UCITS (família mais relevante):**
```
WebFetch: https://www.avantisinvestors.com/ucitsetf/
```
Comparar produtos listados com candidatos já em `agentes/referencia/etf-candidatos.md`. Qualquer produto Avantis UCITS não listado = candidato automático para avaliação.

**Dimensional e outras famílias:**
```
WebSearch: Dimensional UCITS ETF new launch {ano}
WebSearch: iShares new UCITS ETF Ireland accumulating launched {ano}
WebSearch: Vanguard UCITS ETF new Ireland accumulating {ano}
WebSearch: JPMorgan UCITS ETF new launch Ireland {ano}
```

**Discovery geral:**
```
WebSearch: site:etfstream.com UCITS ETF launched Ireland {mes} {ano}
WebSearch: site:trackinsight.com new UCITS ETF Ireland accumulating {ano}
WebSearch: "new UCITS ETF" launched Ireland accumulating equity {mes} {ano}
WebSearch: "UCITS ETF" launched {mes} {ano} factor OR "small cap" OR emerging OR multifactor
```

**Para cada produto novo identificado:**
1. Está em `agentes/referencia/etf-candidatos.md` (tabela resumo ou Descartados)? Se sim, skip.
2. Tem tese para a carteira? (factor tilt, cobertura que complementa SWRD/AVGS/AVEM)
3. Se relevante → adicionar ficha básica e incluir na tabela resumo com status 🆕

### Critérios para incluir thread nova no scan

- Menciona ETFs ou estratégias presentes na carteira (AVGS, AVEM, SWRD)
- Menciona candidatos em monitoramento (ACSW, AVWC, DDGC/DEGC, AVWS, XDEM — ver `agentes/referencia/etf-candidatos.md`)
- Debate factor premium (value, momentum, quality, size) com dados recentes
- FIRE para investidores não-americanos
- Novos produtos UCITS que poderiam ser relevantes
- Papers acadêmicos recentes citados pela comunidade
- Qualquer coisa que desafie premissas da carteira atual

---

## Como Executar

### Passo 1: Threads fixas

Para cada thread da tabela acima, determinar o número do último post lido no Histórico de Scans:

```
discourse_read_topic: topic_id=XXXXX, start_post_number=[ultimo lido + 1], post_limit=50
```

Se tiver mais posts, continue paginando até cobrir todos os novos.

**Fallback se discourse API falhar**: Tentar novamente com `post_limit=20`. Se falhar novamente, registrar no relatório como "Indisponível — verificar na próxima sessão" e continuar com as outras threads.

### Passo 2: Buscar threads novas

Rodar as queries de busca. Para cada resultado promissor:
```
discourse_read_topic: topic_id=XXXXX, post_limit=20
```
Leia o suficiente para avaliar se é relevante. Se sim, inclua no relatório.

### Passo 3: Relatório

---

## Formato do Relatório

```
## RR Scan — {data}

### Resumo Executivo
{2-3 bullets: o que mudou, o que confirma, o que desafia}

### Threads Fixas — Novidades

| Thread | Posts Novos | Último Post | Insight Principal | Impacto na Carteira |
|--------|-------------|-------------|-------------------|---------------------|

### Threads Novas Identificadas

| ID | Título | Por que é Relevante | Insight Principal |
|----|--------|---------------------|-------------------|

### Insights por Área

**Factor / ETFs UCITS**
- [bullet com referência ao thread e post]

**FIRE / Desacumulação**
- [bullet]

**Mercado / Macro**
- [bullet]

**Novos Produtos / Oportunidades**
- [bullet]

### Impacto na Carteira de Diego

| Tema | Confirma / Desafia / Neutro | Ação Sugerida |
|------|---------------------------|---------------|

### Threads a Adicionar ao Monitoramento Fixo
{se encontrou thread nova que merece monitoramento contínuo — incluir ID e último post lido}

### Próximo Scan
- Data sugerida: [mensal, ou antes se houver evento relevante]
- Threads prioritárias: [se alguma estava muito ativa]
```

---

## Passo Final: Atualizar Histórico e ETF Candidatos

Após gerar o relatório, **sempre** atualizar a tabela "Histórico de Scans" abaixo com:
- Data do scan
- Threads cobertas
- Número do último post lido por thread
- Resultado principal (1 linha)

**Se scan identificou ETF novo potencialmente relevante**: verificar se já está em `agentes/referencia/etf-candidatos.md`. Se não estiver, adicionar ficha básica (ticker, ISIN, tese, fonte, data) e atualizar tabela resumo. Não promover para carteira sem issue formal.

**Se ETF candidato existente teve novidade** (novo dado de TD, AUM, gatilho próximo): atualizar o campo "Última atualização dos dados" e os dados relevantes na ficha correspondente.

---

## Histórico de Scans

| Data | Threads Cobertas | Posts Lidos Até | Resultado Principal |
|------|-----------------|-----------------|---------------------|
| 2026-03-23 | 31781 | 31781: post 150 | SWRD +26bps vs net benchmark (3y). SPYY e FWRA melhores all-world. WEBN tracking ruim primeiros meses. Swap S&P 500 outperforma físico ~25bps. |
| 2026-03-26 | 31781, 31258, 32396, 15439, 13776, 2927, 13125 | 31781: post 811 | Vanguard All-Cap UCITS lançando. BlackRock ACSW/ESWP (swaps) Mar 2026. Thread 32396 adicionado. FLXE pode ter EM factor loading > AVEM. Avantis lançou AVEU/AVPE/AVUS Fev 2026. Zero MF (sem UCITS). BTC ~$70k -26%/mês. |
| 2026-04-02 | 31781, 32396, 31258, 13776, 2927, 13125, 34728 (novo) | 31781: 821 / 32396: 1929 / 31258: 3729 / 13776: 4045 / 2927: 2560 / 13125: 1184 / 34728: 354 | DFA lançou DDUM+DDXM (mar/26, TER 0.15-0.20%). AVGS dominante confirmado. WEBN ~full replication. Thread 34728 adicionada. AVGS margem IBKR 15% confirmada (usar vs AVWS 100%). 15439 não lido (rate limit — prioridade próximo scan). |

---

## Frequência Recomendada

- **Mensal**: junto com revisão mensal da carteira
- **Após lançamento de novo ETF Avantis/Dimensional/candidato**: verificar reação da comunidade
- **Após paper relevante de factor investing**: buscar discussão no forum
