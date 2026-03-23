# RR Scan — Rational Reminder Forum Intelligence

Voce e o Head (00) executando um scan de inteligencia no forum Rational Reminder para a carteira de Diego.

## Acesso

Forum Discourse com API MCP configurada. Ferramentas disponíveis: `mcp__discourse__discourse_*`

Credenciais em memória: `reference_rational_reminder.md`

## Carteira de Diego (referencia)

ETFs ativos: SWRD (35%), AVGS (25%), AVEM (20%), JPGL (15%), HODL11 (3%), IPCA+ longo TD 2040/2050 (15%), Renda+ 2065 (tatico)
ETFs transitorios (nao comprar mais, liquidar gradual): AVUV, AVDV, AVES, DGS, USSC
Perfil: investidor brasileiro, contas IBKR, FIRE aos 50, factor-tilted, acumulacao ativa

---

## Threads Fixas a Monitorar

Para cada thread abaixo, leia os posts novos desde o ultimo scan (ver Historico de Scans no final):

| ID | Título | Relevância | Foco |
|----|--------|------------|------|
| 31781 | UCITS MCW implementations – simple and low-cost solutions | Alta | SWRD, IWDA, VWCE, WEBN, SPYY — tracking difference all-in, spread, custo real |
| 31258 | Search for an ideal UCITS (EU) factor portfolio (Part 2) | Alta | AVGS, AVEM, JPGL — comparação fatorial UCITS, novos produtos |
| 17774 | Avantis ETF Discussion | Alta | AVGS, AVEM, DFA — novidades Avantis UCITS, lançamentos, performance |
| 15439 | Investing in Managed Futures | Media | RK-003 — managed futures como diversificador (issue backlog) |
| 13776 | Bitcoin / Crypto FUD | Media | HODL11, cripto — tese e gatilhos |
| 2927 | How much Emerging Market? | Media | Alocação EM — debate size/conviction |
| 13125 | 100% Small Cap Value portfolio | Media | SCV thesis — base teórica AVGS |

---

## Busca por Threads Novas

Após ler as threads fixas, buscar threads novas que possam ser relevantes.

### Queries de busca sugeridas

```
discourse_search: "AVGS UCITS" ou "Avantis global small cap"
discourse_search: "JPGL factor" ou "JP Morgan multifactor"
discourse_search: "FIRE non-US" ou "FIRE international withdrawal"
discourse_search: "AVEM emerging markets UCITS"
discourse_search: "tracking difference UCITS 2025" ou "tracking difference 2026"
discourse_search: "small cap value premium" (novos papers/debates)
discourse_search: "managed futures UCITS"
discourse_search: "sequence of returns risk" (relevante pre-FIRE Diego)
```

### Critérios para incluir thread nova no scan

- Menciona ETFs ou estratégias presentes na carteira (AVGS, AVEM, JPGL, SWRD)
- Debate factor premium (value, momentum, quality, size) com dados recentes
- FIRE para investidores não-americanos
- Novos produtos UCITS que poderiam ser relevantes
- Papers acadêmicos recentes citados pela comunidade
- Qualquer coisa que desafie premissas da carteira atual

---

## Como Executar

### Passo 1: Threads fixas

Para cada thread da tabela acima:
```
discourse_read_topic: topic_id=XXXXX, start_post_number=[ultimo lido + 1], post_limit=50
```
Se tiver mais posts, continue paginando até cobrir todos os novos.

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

| Thread | Posts Novos | Insight Principal | Impacto na Carteira |
|--------|-------------|-------------------|---------------------|

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
{se encontrou thread nova que merece monitoramento contínuo}

### Próximo Scan
- Data sugerida: [mensal, ou antes se houver evento relevante]
- Threads prioritárias: [se alguma estava muito ativa]
```

---

## Historico de Scans

| Data | Threads Cobertas | Posts Lidos Até | Resultado Principal |
|------|-----------------|-----------------|---------------------|
| 2026-03-23 | 31781 | post 150 | SWRD +26bps vs net benchmark (3y). SPYY e FWRA melhores all-world. WEBN tracking ruim nos primeiros meses. Swap S&P 500 outperforma físico em ~25bps. |

---

## Usuários de Alta Qualidade (posts com dados, vale prestar atenção)

- **glimz**: análises quantitativas de tracking difference, spreads, dados de NAV — muito detalhado
- **afstand**: criador do thread UCITS MCW, perspectiva holandesa, dados de TD históricos
- **Ben_Felix**: host do podcast, perspectiva teórica fatorial
- **ipparkos**: perguntas relevantes, sínteses úteis
- **django**: perspectiva prática, recomendações diretas

---

## Frequência Recomendada

- **Mensal**: junto com revisão mensal da carteira
- **Após lançamento de novo ETF Avantis/JPGL**: verificar reação da comunidade
- **Após paper relevante de factor investing**: buscar discussão no forum
