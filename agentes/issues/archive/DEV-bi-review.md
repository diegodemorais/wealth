# DEV-bi-review: Revisão BI externa — componentes, layout e dados do dashboard

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-bi-review |
| **Dono** | Dev |
| **Status** | Doing |
| **Prioridade** | 🟡 Média |
| **Participantes** | BI Specialist (temporário), Head, Quant |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-10 |
| **Origem** | Diego — pedido direto de olhar externo no dashboard |
| **Concluido em** | — |

---

## Motivo / Gatilho

Dashboard evoluiu muito (v1.135) com várias issues de dev acumuladas. Diego quer um olhar externo de BI para identificar o que pode melhorar em apresentação, layout, agrupamento e clareza de dados — antes de novas features.

---

## Descricao

Um analista de BI especialista (agente temporário) revisa o dashboard completo: todos os componentes, exibição de dados, layout, agrupamento e hierarquia visual. Se identificar sugestões de melhoria, elas são validadas por Head + Quant antes de serem apresentadas ao Diego.

---

## Escopo

- [ ] BI Specialist revisa todos os blocos do dashboard (template.html + data.json)
- [ ] Lista sugestões de melhoria com justificativa
- [ ] Head avalia relevância estratégica de cada sugestão
- [ ] Quant valida se os dados/cálculos sugeridos fazem sentido
- [ ] Apresentar ao Diego apenas o que Head + Quant aprovam

---

## Analise

> Preenchido durante execução da issue.

---

## Conclusao

Phase 1 completa: 13 correções implementadas pelo dev + tab restructure (Hoje/Carteira/Perf/FIRE → Now/Portfolio/Performance/FIRE). Todos os fixes validados pelo Quant. Bug de charts não carregando ao trocar de aba corrigido em v1.156. Dashboard chegou a v1.156.

---

## Resultado

- Nova estrutura de abas: Now | Portfolio | Performance | FIRE
- 13 correções de dados e apresentação aplicadas
- Fix CAGR backtest label (Alpha ITD): "CAGR backtest · desde 2021"
- Fix staleness dinâmico (new Date() ao invés de DATA.date)
- Fix savings rate toFixed(1)
- Fix lazy-init de 6 charts para evitar render com dimensão 0 na troca de abas
- Dashboard: v1.156

---

## Proximos Passos

- DEV-manifest (Phase 2) executada na sequência — spec.json gerado com 64 blocos
