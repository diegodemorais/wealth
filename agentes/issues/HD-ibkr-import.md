# HD-ibkr-import: Tracking automático de posições via IBKR Flex Query

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-ibkr-import |
| **Dono** | Bookkeeper |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | Bookkeeper (lead), Head, Tax, Quant |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repositórios open-source — gap vs Ghostfolio/ibflex. Pesquisa: IBKR tem ibflex (Python, 103 stars). Nubank/XP sem tool viável (só CSV manual via B3). |
| **Concluido em** | — |

---

## Motivo / Gatilho

Nosso bookkeeper atualiza posições manualmente (Diego informa compra → registra). A library `ibflex` (Python) parseia Flex Query XML do Interactive Brokers em dataclasses tipados. Ghostfolio usa `ibflex` para sync automático. Gap identificado no scan (2026-04-07).

---

## Descricao

Automatizar import de posições, trades, dividendos e cash do IBKR usando Flex Queries + `ibflex`. Para ativos BR (Tesouro Direto, HODL11), avaliar CSV manual via B3 Investor Area.

---

## Escopo — Roteiro Padrão de Integração

- [ ] **1. Instalar e configurar**: `pip install ibflex`. Configurar Flex Query no IBKR Account Management (Open Positions, Trades, Cash, Dividends)
- [ ] **2. Mapear features**: listar todos os dados que Flex Query exporta — posições, custo médio, P&L, dividendos, withholding tax, cash balances, moeda
- [ ] **3. Avaliar o que temos**: comparar dados do Flex Query vs nosso `carteira.md` manual. O que o Flex Query nos dá que não temos?
- [ ] **4. Prova de conceito**: parsear um Flex Query real com `ibflex`. Gerar snapshot de posições no formato do bookkeeper
- [ ] **5. Automatizar**: criar script `ibkr_sync.py` que (a) puxa Flex Query via token, (b) parseia posições, (c) gera diff vs carteira.md, (d) alerta divergências
- [ ] **6. Avaliar ativos BR**: testar export CSV do B3 Investor Area para Tesouro Direto e HODL11. Parser viável?
- [ ] **7. Reportar ao time**: Bookkeeper, Tax e Quant avaliam. Dados suficientes para substituir input manual?
- [ ] **8. Sintetizar e decidir**: adotar como source of truth para posições IBKR? Frequência de sync (diária? semanal? mensal?)

---

## Raciocínio

**Argumento central:** Input manual é frágil e propenso a erros. IBKR já tem os dados estruturados via Flex Query. `ibflex` é uma library madura que parseia direto para Python. O custo de automação é baixo vs o risco de tracking manual incorreto.

**Incerteza reconhecida:** Flex Query requer configuração no IBKR (token + query ID). Se Diego não quiser configurar, a issue perde propósito. Dados BR (Nubank/XP) continuariam manuais.

**Pesquisa de integrações:**
- **IBKR**: `ibflex` (Python, 103 stars) — parseia Flex XML, client module puxa via API. Production-ready.
- **Nubank**: `pynubank` morto desde 2023 (bloqueio facial). Sem alternativa.
- **XP**: Sem tool open-source. Developer Portal é B2B.
- **B3 Investor Area**: CSV manual consolida todos os brokers BR. Sem API.
- **Ghostfolio**: Usa `ibflex` para sync IBKR. Referência de implementação.
