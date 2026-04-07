# HD-mcp-financial-datasets: MCP Server Financial Datasets — ETF holdings e fundamentals

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-mcp-financial-datasets |
| **Dono** | Head |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Head (lead), Factor |
| **Co-sponsor** | Factor |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repos/tools — github.com/financial-datasets/mcp-server |
| **Concluido em** | — |

---

## Motivo / Gatilho

O `/etf-candidatos-scan` e `/justetf-scan` usam WebFetch para scraping de dados de ETFs. O MCP Financial Datasets expõe ETF holdings breakdown, income statements, financial metrics e SEC filings como tools MCP. Pode complementar a análise de ETFs com dados fundamentalistas estruturados.

---

## Descricao

Instalar e avaliar o MCP Financial Datasets para enriquecer análise de ETFs e factor investing.

---

## Escopo

- [ ] Instalar MCP server Financial Datasets
- [ ] Mapear tools: ETF holdings, fundamentals, financial metrics
- [ ] Testar com SWRD, AVGS, AVEM — holdings breakdown disponível?
- [ ] Avaliar se dados são de ETFs UCITS ou só US-listed
- [ ] Comparar vs justETF scraping atual
- [ ] Decidir: adotar como complemento ou substituir algo?

---

## Raciocínio

**Argumento central:** Holdings breakdown de ETFs é útil para análise de overlap e factor exposure. Hoje dependemos de justETF scraping que pode quebrar.

**Prioridade Média:** Complementar. justETF funciona razoavelmente. Valor incremental depende de cobertura UCITS (pode ser só US-listed).
