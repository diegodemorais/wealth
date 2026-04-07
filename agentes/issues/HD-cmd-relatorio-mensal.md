# HD-cmd-relatorio-mensal: Command /relatorio-mensal — report consolidado

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-cmd-relatorio-mensal |
| **Dono** | Head |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | Head (lead), Bookkeeper, Factor, FIRE, Advocate |
| **Co-sponsor** | Bookkeeper |
| **Dependencias** | HD-cmd-portfolio-snapshot |
| **Criado em** | 2026-04-07 |
| **Origem** | Inspirado em client-report skill do anthropics/financial-services-plugins. Nosso check-in é interativo mas não gera documento exportável. |
| **Concluido em** | 2026-04-07 |

---

## Motivo / Gatilho

O check-in mensal (`/checkin-automatico`) gera output interativo na conversa, mas não um "documento" persistente. Para acompanhar evolução mês a mês, Diego precisa reler conversas antigas. Um relatório mensal estruturado em markdown (exportável para PDF) resolveria isso.

Inspiração: skill `client-report` da Anthropic gera relatório de 8-12 páginas com performance, alocação, commentary, atividade, e planning notes.

---

## Descricao

Criar `/relatorio-mensal` que gera relatório consolidado mensal em markdown, salvo em `analysis/relatorios/YYYY-MM.md`.

---

## Escopo

### Seções do relatório (inspiradas em client-report + nosso contexto)

- [ ] **1. Resumo executivo**: P(FIRE) atual, patrimônio total (BRL/USD), variação vs mês anterior
- [ ] **2. Performance**: retorno do mês por ativo, retorno acumulado YTD, benchmark vs VWRA
- [ ] **3. Alocação**: pesos atuais vs alvos, drift, ações de rebalanceamento necessárias
- [ ] **4. Atividade**: aportes do mês, compras realizadas, dividendos recebidos
- [ ] **5. Macro context**: Selic, IPCA, câmbio, taxa IPCA+ 2040 — snapshot do mês
- [ ] **6. Issues & decisões**: issues concluídas no mês, decisões registradas, gatilhos ativados
- [ ] **7. Próximos passos**: ações pendentes para o mês seguinte

### Implementação

- [ ] Criar `.claude/commands/relatorio-mensal.md`
- [ ] Definir formato (markdown com headers padronizados para facilitar diff entre meses)
- [ ] Auto-save em `analysis/relatorios/YYYY-MM.md`
- [ ] Integrar dados do snapshot, MC, macro-bcb, e issues board
- [ ] Testar com dados do mês atual

---

## Raciocínio

**Argumento central:** Documento persistente > conversa efêmera. Um relatório mensal estruturado permite: (a) comparar meses, (b) detectar tendências, (c) ter registro auditável de decisões, (d) compartilhar com cônjuge se necessário.

**Inspiração:** O `client-report` da Anthropic é focado em advisor→client (compliance, branding, PDF formal). O nosso é personal — mais conciso, markdown puro, foco em actionability.

**Prioridade Média:** O check-in mensal já cobre a função. Este command é upgrade de formato (documento vs conversa), não funcionalidade nova.

---

## Conclusao

Command `.claude/commands/relatorio-mensal.md` criado. Gera relatório mensal em `analysis/relatorios/YYYY-MM.md` com 7 seções: resumo executivo, performance, alocação, atividade, macro (via `/macro-bcb`), issues, próximos passos. Reutiliza MC recente (<7 dias) ou roda novo (3k sims).
