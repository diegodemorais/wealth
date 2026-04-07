# HD-python-bcb: Library python-bcb para dados do Banco Central

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-python-bcb |
| **Dono** | Head |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Head (lead), Macro, RF |
| **Co-sponsor** | Macro |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repos/tools — github.com/wilsonfreitas/python-bcb |
| **Concluido em** | — |

---

## Motivo / Gatilho

`python-bcb` é um wrapper Python para a API do BCB com módulos dedicados para PTAX, Selic, IPCA e expectativas de mercado (Focus). Funciona standalone (sem MCP). Pode ser integrado nos nossos scripts Python diretamente — complementar ao MCP BCB (HD-mcp-bcb) ou alternativa se MCP não funcionar bem.

---

## Descricao

Avaliar `python-bcb` como library Python para acesso a dados do BCB nos scripts existentes (portfolio_analytics, fire_montecarlo, etc.) e nos novos commands (/cambio, /macro-bcb).

---

## Escopo

- [ ] `pip install python-bcb` — testar import e API
- [ ] Testar módulos: Currency (PTAX), Selic, IPCA, Expectativas (Focus)
- [ ] Integrar em script de teste: PTAX histórico, Selic história, IPCA acumulado
- [ ] Comparar vs MCP BCB: qual abordagem é melhor para nosso caso?
- [ ] Se superior ao MCP em scripts Python: usar nos analytics. Se inferior: MCP para commands, python-bcb para scripts

---

## Raciocínio

**Argumento central:** Scripts Python (fire_montecarlo, portfolio_analytics) precisam de dados BCB programaticamente. `python-bcb` dá acesso direto em DataFrames pandas — mais natural que MCP para uso em scripts.

**Prioridade Média:** Complementar ao MCP BCB. Redundância intencional — MCP para commands interativos, python-bcb para scripts batch.
