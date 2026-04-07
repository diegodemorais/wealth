# HD-mcp-financial-datasets: MCP Server Financial Datasets — ETF holdings e fundamentals

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-mcp-financial-datasets |
| **Dono** | Head |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | Head (lead), Factor |
| **Co-sponsor** | Factor |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repos/tools — github.com/financial-datasets/mcp-server |
| **Concluido em** | 2026-04-07 |

---

## Motivo / Gatilho

O `/etf-candidatos-scan` e `/justetf-scan` usam WebFetch para scraping de dados de ETFs. O MCP Financial Datasets expõe ETF holdings breakdown, income statements, financial metrics e SEC filings como tools MCP. Pode complementar a análise de ETFs com dados fundamentalistas estruturados.

---

## Descricao

Instalar e avaliar o MCP Financial Datasets para enriquecer análise de ETFs e factor investing.

---

## Escopo

- [x] Instalar/avaliar MCP server: Python, requer clone + API key paga
- [x] Mapear tools: 10 tools — todas para **ações individuais** (income statement, balance sheet, cash flow, stock price, news, crypto). **Zero tools de ETF holdings.**
- [x] Testar cobertura SWRD/AVGS/AVEM: **não aplicável** — API usa tickers US (AAPL, GOOGL). ETFs UCITS (LSE/Euronext) não são cobertos.
- [x] Comparar vs justETF: justETF é correto para UCITS. Este MCP não substitui nada.
- [x] Decisão: **Não adotar.** Não resolve o problema de ETF holdings UCITS.

---

## Veredicto

**Não aplicável para a carteira de Diego.**

- Tools são fundamentals de ações individuais, não ETF holdings
- Cobertura: mercado US (tickers americanos). UCITS SWRD/AVGS/AVEM não cobertos.
- Requer API key paga (financialdatasets.ai)
- justETF permanece como fonte para ETF UCITS data

**Alternativa futura:** Se precisar de ETF holdings UCITS estruturados, avaliar `justetf-api` ou `trackinsight.com` API.

---

## Raciocínio Original

**Argumento central:** Holdings breakdown de ETFs é útil para análise de overlap e factor exposure. Hoje dependemos de justETF scraping que pode quebrar.

**Por que falhou:** Premissa errada — o repo `financial-datasets/mcp-server` é para ações US, não ETFs UCITS. O nome induz erro.
