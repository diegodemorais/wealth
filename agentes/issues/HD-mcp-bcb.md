# HD-mcp-bcb: MCP Server BCB — dados macro Brasil estruturados

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-mcp-bcb |
| **Dono** | Head |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | Head (lead), Macro, RF, Bookkeeper |
| **Co-sponsor** | Macro |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repos/tools — github.com/SidneyBissoli/bcb-br-mcp |
| **Concluido em** | — |

---

## Motivo / Gatilho

Hoje `/macro-bcb` e `/cambio` usam WebFetch raw para a API do BCB. O MCP Server BCB (`bcb-br-mcp`) expõe 150+ séries econômicas (Selic, IPCA, PTAX, PIB, expectativas Focus) como tools MCP nativos com busca inteligente e cálculo de variações. Instalação: `npx -y bcb-br-mcp`.

---

## Descricao

Instalar e avaliar o MCP Server BCB como substituto dos WebFetch ad hoc. Se funcionar bem, atualizar `/macro-bcb`, `/cambio` e check-in mensal para usar MCP em vez de raw API.

---

## Escopo

- [ ] Instalar `bcb-br-mcp` via npx no ambiente local
- [ ] Mapear tools disponíveis: quais séries? PTAX? Selic? IPCA? Expectativas Focus?
- [ ] Testar 5 queries práticas: (a) PTAX hoje, (b) Selic atual, (c) IPCA acumulado 12m, (d) expectativa IPCA 2026, (e) histórico Selic 5 anos
- [ ] Comparar qualidade/velocidade vs WebFetch atual
- [ ] Atualizar `/macro-bcb` para usar MCP se superior
- [ ] Avaliar companion IBGE MCP (`ibge-br-mcp`) para dados demográficos
- [ ] Bonus: verificar módulo Wealth Management do `anthropics/financial-services-plugins` (7.3k stars) — focado em IB/equity research, mas WM pode ter algo útil

---

## Raciocínio

**Argumento central:** MCP nativo > WebFetch raw. Dados estruturados com metadata, busca e variações calculadas. Elimina parsing manual de JSON do BCB.

**Prioridade Alta:** `/macro-bcb` é usado em toda análise de RF e ciclo de juros. Melhoria de infraestrutura com baixo esforço (npx install).

### Feedback agentes (2026-04-07)

**RF:** MCP BCB não cobre taxas indicativas ANBIMA (NTN-B 2040/2050/2065). Essas são o dado mais operacional para gatilhos de IPCA+. Sugestão: verificar se há série BCB equivalente ou criar issue separada para ANBIMA MCP.
