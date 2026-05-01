# HD-mcp-bcb: MCP Server BCB — dados macro Brasil estruturados

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-mcp-bcb |
| **Dono** | Head |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | Head (lead), Macro, RF, Bookkeeper |
| **Co-sponsor** | Macro |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repos/tools — github.com/SidneyBissoli/bcb-br-mcp |
| **Concluido em** | 2026-04-07 |

---

## Motivo / Gatilho

Hoje `/macro-bcb` e `/cambio` usam WebFetch raw para a API do BCB. O MCP Server BCB (`bcb-br-mcp`) expõe 150+ séries econômicas (Selic, IPCA, PTAX, PIB, expectativas Focus) como tools MCP nativos com busca inteligente e cálculo de variações. Instalação: `npx -y bcb-br-mcp`.

---

## Descricao

Instalar e avaliar o MCP Server BCB como substituto dos WebFetch ad hoc. Se funcionar bem, atualizar `/macro-bcb`, `/cambio` e check-in mensal para usar MCP em vez de raw API.

---

## Escopo

- [x] Instalar `bcb-br-mcp` via npx — instalado e disponível (`npm install bcb-br-mcp` ok, v1.2.1)
- [x] Mapear tools disponíveis: 8 tools — `bcb_indicadores_atuais`, `bcb_serie_ultimos`, `bcb_serie_valores`, `bcb_variacao`, `bcb_comparar`, `bcb_buscar_serie`, `bcb_series_populares`, `bcb_serie_metadados`
- [x] Testar 5 queries: (a) PTAX 5.2006, (b) Selic 14.65%, (c) IPCA 12m 3.81%, (d) Focus lag confirmado, (e) Selic 5 anos: 1826 pontos
- [x] Comparar vs WebFetch: MCP superior para Selic/IPCA/PTAX; WebFetch ainda necessário para Tesouro Direto
- [x] Atualizar `/macro-bcb`: MCP como primário para BCB series; Tesouro Direto mantém WebFetch; Focus via WebSearch
- [ ] Avaliar `ibge-br-mcp` — baixa prioridade, não bloqueia
- [ ] Bonus `financial-services-plugins` — baixa prioridade

---

## Raciocínio

**Argumento central:** MCP nativo > WebFetch raw. Dados estruturados com metadata, busca e variações calculadas. Elimina parsing manual de JSON do BCB.

**Prioridade Alta:** `/macro-bcb` é usado em toda análise de RF e ciclo de juros. Melhoria de infraestrutura com baixo esforço (npx install).

### Feedback agentes (2026-04-07)

**RF:** MCP BCB não cobre taxas indicativas ANBIMA (NTN-B 2040/2050/2065). Essas são o dado mais operacional para gatilhos de IPCA+. Sugestão: verificar se há série BCB equivalente ou criar issue separada para ANBIMA MCP.
