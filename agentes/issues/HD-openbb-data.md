# HD-openbb-data: OpenBB como data platform para o time

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-openbb-data |
| **Dono** | Head |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Head (lead), Macro, RF, Factor |
| **Co-sponsor** | Macro |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repositórios open-source — gap vs OpenBB (65k stars) |
| **Concluido em** | — |

---

## Motivo / Gatilho

Usamos WebSearch ad hoc para dados de mercado (taxas IPCA+, Selic, cotações, macro). OpenBB (65k stars) é uma plataforma de dados financeiros com 600+ comandos e suporte a MCP server para AI agents. Poderia substituir nossos WebSearches por dados estruturados. Gap identificado no scan (2026-04-07).

---

## Descricao

Avaliar OpenBB como data platform unificada. Verificar se os dados que precisamos (macro Brasil, taxas IPCA+, ETF prices, factor returns) estão disponíveis e se a integração via MCP ou Python API é prática.

---

## Escopo — Roteiro Padrão de Integração

- [ ] **1. Instalar e configurar**: instalar OpenBB SDK/Platform. Testar API keys necessárias
- [ ] **2. Mapear features**: listar dados disponíveis relevantes para nós — macro (Selic, IPCA, câmbio), equity (ETF prices, returns), fixed income (taxas Tesouro), factor returns
- [ ] **3. Avaliar o que temos**: mapear cada WebSearch que fazemos hoje e verificar se OpenBB tem o dado equivalente com melhor qualidade/estrutura
- [ ] **4. Prova de conceito**: testar 5 queries práticas: (a) taxa IPCA+ 2040 hoje, (b) preço SWRD último mês, (c) Selic atual, (d) câmbio BRL/USD, (e) factor returns Fama-French
- [ ] **5. Avaliar MCP server**: OpenBB tem MCP server? Se sim, integrar com nosso Claude Code setup para acesso direto pelos agentes
- [ ] **6. Reportar ao time**: Macro e RF avaliam qualidade dos dados BR. Factor avalia dados de ETF/fatores
- [ ] **7. Sintetizar e decidir**: adotar como fonte de dados primária? Criar commands dedicados? Manter WebSearch?

---

## Raciocínio

**Argumento central:** Dados estruturados > WebSearch ad hoc. OpenBB é a plataforma open-source mais madura (65k stars, 220+ contributors). Se os dados BR estiverem disponíveis, elimina uma fonte de friction significativa.

**Incerteza reconhecida:** Cobertura de dados do mercado brasileiro pode ser fraca (ANBIMA, Tesouro Direto). Se os dados BR forem insuficientes, o valor cai significativamente dado que 21% do portfolio é renda fixa BR.
