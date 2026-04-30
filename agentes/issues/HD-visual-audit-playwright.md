# HD-visual-audit-playwright: Auditoria Visual Aba por Aba — Screenshots + Análise de Especialistas

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-visual-audit-playwright |
| **Dono** | Head |
| **Status** | Em Execução |
| **Prioridade** | Alta |
| **Participantes** | Dev (Playwright), Factor, RF, FIRE, Risco, FX, Macro, Bookkeeper |
| **Criado em** | 2026-04-30 |
| **Origem** | Solicitação pós-auditoria de QA e Arquitetura |
| **Concluido em** | — |

---

## Objetivo

Tirar screenshots de cada aba do dashboard com Playwright — expandindo todos os CollapsibleSections — e passar para os agentes especialistas analisarem o conteúdo buscando:
- Coisas que podem **melhorar** (clareza, completude, precisão)
- Coisas que **faltam** (dados relevantes não exibidos)
- Coisas que podem ser **alteradas** (layout, priorização, framing)

---

## Abas a auditar

| Aba | Rota | Agentes |
|-----|------|---------|
| NOW (Dashboard) | `/` | Head, Bookkeeper, Factor, FIRE |
| Portfolio | `/portfolio` | Factor, FX, Tax |
| Performance | `/performance` | Factor, Quant |
| FIRE | `/fire` | FIRE, RF, Risco |
| Withdraw | `/withdraw` | FIRE, RF |
| Simulators | `/simulators` | FIRE, Risco |
| Backtest | `/backtest` | Factor, Quant |

---

## Protocolo de Execução

### Fase 1 — Screenshots (Dev/Playwright)
1. Navegar para cada aba
2. Clicar em todos os `<CollapsibleSection>` fechados para expandir
3. Aguardar render completo (sem privacyMode)
4. Full-page screenshot salvo em `/tmp/audit-screenshots/{aba}.png`

### Fase 2 — Análise (Especialistas em paralelo)
Cada agente especialista recebe as screenshots relevantes e responde com findings estruturados:
- **Melhoria**: o que poderia ser aprimorado
- **Falta**: dado/métrica/visualização que deveria estar mas não está
- **Alteração**: algo presente que deveria ser diferente (layout, label, cálculo)

### Fase 3 — Síntese (Head)
Consolidar todos os findings em relatório único com priorização.

---

## Findings

> A preencher após execução.

---

## Conclusao

> A preencher após síntese dos especialistas.
