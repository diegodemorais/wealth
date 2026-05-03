---
ID: HD-dashboard-review-completa
Titulo: Revisão completa do dashboard — UI/UX/BI + wealth/investimento (todas as 7 abas)
Dono: Head (coordena) + Dev (executa) + agentes especialistas
Prioridade: 🟡 Média
Dependências: —
Origem: pedido de Diego (2026-05-01) — "juntar informações, deixar mais fluido, melhorar textos. Tanto em BI/UI/UX como no negócio mesmo"
---

## Contexto

Após 14+ issues fechadas nesta sessão (privacy fix, drawdown cliff, FIRE sliders, EF v1+v2, sector exposure, top-5 MSCI, append-only spending, etc.), o dashboard cresceu organicamente. Está hora de revisar com olho crítico:

- **Fluidez:** informação está organizada na ordem certa? Hierarquia visual ajuda ou atrapalha?
- **Junção:** existem informações redundantes ou separadas que deveriam estar juntas?
- **Textos:** copy explicativa ainda faz sentido? Está clara, sem jargão excessivo, sem ambiguidade?
- **Wealth/investimento:** o que o dashboard mostra reflete a tese atual? Decisões implícitas estão explícitas? Tem coisas que sobram (ruído) ou faltam (gaps)?

## Escopo — 7 abas

1. **NOW** (rota `/`) — KPI hero + DCA status + sankey + monthly heatmap + privacy
2. **PORTFOLIO** — composição, holdings, factor exposure, sector exposure, overlap, top-5, efficient frontier, IIFPT
3. **PERFORMANCE** — drawdown, rolling Sharpe, retornos mensais, fan chart, decomposição
4. **FIRE** — P(FIRE) matrix, MC base/fav/stress, glide path, simuladores
5. **WITHDRAW** — bond pool, withdrawal rate, guardrails, INSS floor, spending timeline
6. **ANALYSIS** — backtest periods, risk-return scatter, drawdown extended, sequence of returns risk
7. **TOOLS** — assumptions, premissas, simulators (cascade, what-if, reverse FIRE, FloorUpsideFire)

## Plano em 3 fases

### Fase 1 — Discovery (agentes em paralelo, ~30-60 min cada)

4 agentes em paralelo, cada um com lente própria, cobre as 7 abas:

#### Agent A — Dev (modo Frontend) — BI / UI / UX
Lente: cognitive load, hierarquia visual, fluidez de leitura, espaçamento, mobile, textos/copy.
Output esperado: por aba, listar **achados priorizados** (P0 obviedade quebrada / P1 melhoria de fluxo / P2 polish):
- Componentes redundantes ou que deveriam ser fundidos
- Ordem dos blocos (qual deveria vir antes/depois)
- Textos confusos, jargão sem explicação, copy stale
- Hierarquia visual (KPI hero → detalhe → drill-down)
- Cognitive overload (aba pesada demais? quebrar em sub-seções?)
- Mobile responsiveness (memória `feedback_verificacao_visual` — Diego frequentemente remoto)
- Privacy mode UX (mascaramento OK em todas as abas?)

#### Agent B — CIO + Factor + FIRE consolidados — Wealth/investimento
Lente: o que o dashboard mostra reflete a estratégia atual? Decisões implícitas estão explícitas?
Output esperado: por aba:
- **Decisões estratégicas que deveriam estar visíveis** (ex: "carteira atual está dentro do IC — não rebalancear" deveria ter banner permanente em EF chart)
- **Insights novos** que apareceram nesta sessão e ainda não estão no dashboard (ex: AVEM all-in 1.43%, sector tilt Financials > Tech, Sharpe líquido 0.001 vs bruto 0.038)
- **Ruído** — métricas que confundem mais que informam (ex: P(FIRE) por perfil — todas relevantes ou alguns são especulativos demais?)
- **Gaps** — informação que falta pra Diego tomar decisão informada (ex: regime de value spread, custos all-in por ETF)
- **Banners de alerta** — onde precisa anti-ancoragem (Max Sharpe), anti-pânico (drawdown), anti-FOMO (BTC YTD)

#### Agent C — Tester + QA exploratory — Sessão mensal de QA
Lente: aproveitar a revisão pra fazer a sessão mensal de QA prevista no perfil 23.
Output esperado:
- **Exploratory testing** — clicar em todos os botões/sliders/toggles em ambiente real (Playwright headed). Procurar comportamento inesperado.
- **Privacy regression** — toggle privacy on em cada aba, listar elementos que vazam R$/USD literal
- **Cross-tab navigation** — links/anchors entre abas funcionam? Histórico do navegador ok?
- **Cobertura de testes** — gaps identificados, propor regression tests
- **Bugs latentes** — qualquer coisa que rode silenciosa (similar ao FIRE hooks violation que rodou 3 dias)

#### Agent D — Quant — Sanity dos números
Lente: ranges, formatação, plausibilidade.
Output esperado: por aba:
- Números fora de range plausível (similar ao drawdown −91% que escapou)
- Formatação inconsistente (R$ vs $, decimal vs vírgula, % vs pp, "k" vs "mil")
- Unidades misturadas (USD nominal misturado com BRL real?)
- Propor checks adicionais pro Tester gate (release_gate_sanity.py)

### Fase 2 — Síntese (Head, ~30 min)

Head consolida os 4 outputs em um plano único:
- **Quick wins** — fácil + alto impacto (até 1h cada)
- **Médios** — esforço razoável + alto impacto (1-3h cada)
- **Grandes** — refactor de aba inteira (3+h)
- **Deferidos** — vale registrar mas não agora

Validar com Diego antes de seguir.

### Fase 3 — Execução em ondas (Dev, faseado)

- **Onda 1:** quick wins (todos juntos, 1 commit por aba)
- **Onda 2:** médios (1 issue por melhoria, granular)
- **Onda 3:** grandes (issue própria, conforme prioridade)

Cada onda passa pelo gate (Tester) antes de push.

## Critérios de aceite

- [ ] 4 agentes geraram relatório estruturado por aba (Discovery)
- [ ] Head consolidou em plano com ondas (Síntese)
- [ ] Diego aprovou plano (Decisão)
- [ ] Onda 1 (quick wins) executada — 1 commit por aba relevante
- [ ] Onda 2 (médios) virou issues granulares no backlog
- [ ] Onda 3 (grandes) virou issues no backlog se aplicável
- [ ] Suite full verde no final
- [ ] QA mensal log atualizado (`agentes/memoria/23-qa.md`) — esta sessão conta como a primeira

## Especialistas a envolver (síntese)

- **Dev** (Frontend mode + Integrado mode) — implementador
- **CIO + Factor + FIRE** — wealth review
- **Tester + QA** — exploratory + sanity
- **Quant** — números
- **Behavioral** — banners anti-ancoragem (CIO já vai trazer)
- **Tax** — sob demanda se Onda 2/3 mexer em cálculos de IR

## Reportar (relatório consolidado de cada fase)

**Fase 1:** 4 outputs separados (1 por agente)
**Fase 2:** plano consolidado em tabela com priorização
**Fase 3:** após cada onda, hash + push + suite green

## Memórias críticas

- `feedback_qualidade_sobre_velocidade.md` — pecar pelo excesso
- `feedback_dashboard_test_protocol.md` — Playwright OBRIGATÓRIO
- `feedback_privacy_transformar.md` — privacy mascarar, não esconder
- `feedback_verificacao_visual.md` — Diego remoto, não abrir browser local
- `learning_avem_all_in_cost`, `learning_rebalance_friction` — insights que devem aparecer
- Perfil `23-qa.md` — workflow da sessão mensal

## Conclusão (2026-05-03)

Revisão completa entregue em 3 ondas + menores ao longo de 2 dias (2026-05-02/03).

### Onda 1 — fixes mecânicos (concluída 2026-05-02)

5 commits: `5978bd07` (Sortino cap [-10,10]), `adf57e12` (pfire fav>base assertion), `e390eff5` (rolling rf_brl Selic 14.50%), `92ed6d0f` (ScenarioBadge usa activeScenarioCfg em 8 linhas FIRE), `4ce549a1` (quick wins UI: dividers, hex literais, naming TOOLS, emoji 🏦).

### Onda 2 — banners + AllInCostTable (concluída 2026-05-03)

3 commits granulares:
- `fea36f93` — `<DiagnosticBanner />` reutilizável + 3 wirings (Markowitz NOW+Portfolio EF, P(FIRE) NOW+FIRE, TD 2040 Withdraw)
- `26544a34` — `<AllInCostTable />` na PORTFOLIO com Annual Reports 2025 verificados (SWRD 0.38%, AVGS 0.707%, AVEM 1.184%, drag agregado 0.511%/ano vs TER 0.201%)
- `82cb221b` — AlphaVsSWRDChart threshold -5pp/-10pp (markLines)

### Onda 3 — parcial (concluída 2026-05-03)

- `3007d173` + `08753946` — Dedupe BalancoHolistico (NOW → only FIRE, testid relocado, e2e movido)
- 3.1 FIRE sliders E2E **já existia** — `e2e/fire-simulator-sliders.spec.ts` (5 cenários × 4 perfis × Stress/Base/Fav/Aspiracional)
- 3.2 Privacy regression mensal **já existia** — `e2e/privacy-regression.spec.ts` itera 7 abas com asserções `BRL_LEAK`/`USD_LEAK`
- 2.8 TOOLS split — já consolidado em reorg anterior (7-tab); `/simulators` redireciona pra `/assumptions`

### Menores P1/P2 (concluída 2026-05-03)

- `8bedc339` — IIFPT título acadêmico legível, CDS legend semáforo emoji, sublabel "FIRE 49 anos", backtest-r7 IDs
- `07bebc4d` — AllInCostTable copy cleanup (no-op `*100/100` removido)

### Deferred — viraram 3 issues follow-up no Backlog

- **`DEV-now-refactor`** — NOW page.tsx 1053→500 linhas (4 sub-componentes; alto risco sem E2E ampliada)
- **`DEV-factor-views-tab-toggle`** — Consolidar 3 factor views em PORTFOLIO via tab toggle (Diego decisão 2026-05-03: tab toggle, não side-by-side)
- **`DEV-metriccard-tooltip-api`** — MetricCard tooltip API + popover primitive

### Build final

Dashboard **v1.314.11** (auto-deploy bumpa 1.316.x). Release gate verde em cada push: TS noEmit + build + Pipeline E2E + Vitest 793 passed/32 skipped + Sanity 25 checks (16 ranges + 8 anti-cliff + 1 cross-field) + versão bumped.

### Sessão mensal de QA (perfil 23) — primeira

Esta revisão conta como a primeira sessão mensal de QA conforme perfil 23. Tester (perfil 22) executou release gate em todos os pushes; QA (perfil 23) fez exploratory testing via 4 agentes audit (Dev/CIO/Tester/Quant) na Fase 1 de Discovery.

Próxima QA mensal: jun/2026.
