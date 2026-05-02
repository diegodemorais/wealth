---
ID: DEV-perfis-overhaul
Titulo: Overhaul completo dos 19 perfis — best practices + aprendizados + padronização
Dono: Dev (+ revisão Head em sign-off final)
Prioridade: 🟡 Média
Dependências: —
Origem: auditoria dupla 2026-05-01 (best practices Claude Code + vs aprendizados)
---

## Contexto

Auditoria dupla revelou:

**Best practices (score médio 7.1/10):**
- 16/20 perfis sem Output format prescritivo
- 17/20 sem Inputs esperados
- 14/20 sem "When NOT to invoke"
- 20/20 sem `<example>` blocks
- 11 perfis com Cross-Feedback retro embedado (deveria estar em `agentes/retros/`)
- 14 perfis com Auto-Crítica datada (deveria estar em `agentes/memoria/`)

**Vs aprendizados:**
- 17/19 perfis não referenciam aprendizados da sessão 2026-05-01
- 2 perfis com referências quebradas (20-dev cita scripts/arquivos removidos: `template.html`, `build_dashboard.py`, Chart.js, `index.html`)
- 15/19 perfis estão datados de abril/22 ou anterior

**Stubs órfãos em `.claude/agents/`:**
- `fx.md`, `oportunidades.md`, `patrimonial.md` (perfis absorvidos em 08/06/05) — risco de invocação fantasma
- `head-bkp.md` (backup obsoleto)

## Top 3 exemplares (replicar como template)

- **22-tester (101/120)** — escopo cirúrgico, "O que NÃO faz" delimitando vs Validador/QA/Dev
- **14-quant (103/120)** — mandato + boundaries claros
- **16-zerobased (100/120)** — único com Inputs esperados explícitos + Output template literal

## Top 5 problemáticos

1. **20-dev.md** — referências quebradas críticas + 10+ feedbacks ausentes
2. **02-factor.md** — AVEM 1.43% não refletido, sem decisão 50/30/20 mantida
3. **01-cio.md** — duplicações no Mapa de Relacionamento, mandato confuso, sem rebalance friction
4. **18-outside-view.md** — perfil minúsculo (67 linhas), sem gatilho "mudança arquitetural"
5. **13-bookkeeper.md** — pipeline antigo, falta data_provenance + analise_gastos_metodo

## Plano em 4 fases (sequenciais)

### Fase 1 — Limpeza urgente (~30 min)

1. **Deletar stubs órfãos** em `.claude/agents/`:
   - `fx.md`, `oportunidades.md`, `patrimonial.md`, `head-bkp.md`
2. **Marcar `archive/17-skeptic.md`** com `deprecated: true` no frontmatter (já tem banner mas não tem flag YAML)
3. **Fix referências quebradas em `20-dev.md`**:
   - `template.html` → não existe mais, substituir por React app
   - `build_dashboard.py` → removido (`df64a1e1`), substituir por `npm run build` em `react-app/`
   - `dashboard/index.html` → removido (gerado em `dash/` gitignored)
   - Chart.js → ECharts (migração registrada na retro 2026-04-22)
   - Atualizar "Mapa do Projeto" e seção "Anti-padrões"

### Fase 2 — Top 5 problemáticos (~2h)

Refatorar inline (preservando conteúdo válido) os 5 perfis críticos:

**20-dev.md:**
- Fix Fase 1 (refs quebradas)
- Adicionar referências a `feedback_dashboard_test_protocol`, `feedback_data_provenance`, `feedback_dev_recebe_spec`, `feedback_versao_build`, `feedback_privacy_transformar`, `feedback_tailwind_v4`, `feedback_index_sempre`, `feedback_scenario_badge`, `feedback_changelog_now_route`
- Output format + When NOT + Inputs

**02-factor.md:**
- Adicionar `learning_avem_all_in_cost.md` (AVEM 1.43% all-in)
- `feedback_factor_proativo.md` (Ken French/NBER/SSRN proativos)
- `feedback_quantificar_threshold_decisao.md`
- `learning_rebalance_friction.md`
- `feedback_premissa_rentabilidade.md`
- Citar haircut 58% McLean&Pontiff explicitamente
- Decisão maio/2026 50/30/20 mantida

**01-cio.md:**
- Remover duplicações no Mapa de Relacionamento (05-Wealth ×2, 06-Tactical ×2)
- Remover bloco "Operacional & Custódia" que descreve Head, não CIO
- Adicionar `learning_rebalance_friction`, `feedback_quantificar_threshold_decisao`, `feedback_pfire_kpi_sprint`, `feedback_outside_view_arquitetura`
- Decisão maio/2026 50/30/20 mantida

**18-outside-view.md:**
- Expandir mandato com `feedback_outside_view_arquitetura.md` (gatilho "mudança arquitetural")
- Adicionar Output format + Inputs + When NOT
- Crescer de 67 linhas para ~120-150 (alinhado com média)

**13-bookkeeper.md:**
- Remover referências a pipeline template-based antigo
- Adicionar `feedback_data_provenance`, `feedback_impacto_movimentacao`, `learning_analise_gastos_metodo`, `project_aporte_tracking`, `feedback_bookkeeper_atualiza_dados`
- Verificar se `evolucao.md` e `operacoes.md` ainda existem (ajustar refs)

### Fase 3 — Padronização sistêmica (~2-3h)

1. **Criar `agentes/perfis/_TEMPLATE.md`** com estrutura canônica de 12 seções:
   - Identity · Mandate · When to invoke · When NOT · Inputs · Output format · Expertise & References · Boundaries · Calibration · Workflow · Anti-patterns · Tool affordances

2. **Extrair Cross-Feedback dos 11 perfis** para `agentes/retros/cross-feedback-2026-03-20.md`:
   - Manter no perfil apenas link/referência: "Cross-feedback retros: ver `agentes/retros/`"

3. **Extrair Auto-Crítica datada dos 14 perfis** para `agentes/memoria/NN-x.md`:
   - Cada agente já tem (ou deveria ter) memória própria em `agentes/memoria/`
   - Mover blocos "Erros conhecidos (retro YYYY-MM-DD)" para lá
   - Remover notas X/10 do perfil (telemetria, não prompt)

4. **Adicionar Output format prescritivo** aos 16 perfis que não têm:
   - Template literal pronto + length budget explícito (ex: "máx 300 palavras + 1 tabela")

5. **Adicionar Inputs esperados** aos 17 perfis que não têm

6. **Adicionar "When NOT to invoke"** aos 14 perfis que não têm

7. **Adicionar 1 `<example>` block canônico** a cada perfil (Q&A típico)

### Fase 4 — Consolidar aprendizados nos perfis relevantes (~1h)

Distribuir aprendizados da sessão 2026-05-01:

| Aprendizado | Perfis a referenciar |
|-------------|----------------------|
| `learning_avem_all_in_cost` | Factor, CIO, Tax |
| `learning_rebalance_friction` | CIO, Factor, Tax, FIRE |
| `learning_analise_gastos_metodo` | Bookkeeper, Behavioral |
| `feedback_quantificar_threshold_decisao` | Factor, CIO, FIRE |
| `feedback_pfire_kpi_sprint` | Head, CIO, FIRE |
| `feedback_outside_view_arquitetura` | Head, CIO, Outside-View |
| `feedback_factor_proativo` | Factor |
| `feedback_paper_validation_completa` | Fact-Checker |

Cada referência inclui: nome do arquivo + 1 linha de TL;DR + quando aplicar.

Atualizar timestamps de "última revisão" em todos os perfis tocados.

## Critérios de aceite

- [ ] Fase 1: 4 stubs órfãos deletados, skeptic marcado deprecated, 20-dev sem ref quebrada
- [ ] Fase 2: 5 perfis críticos atualizados com aprendizados + duplicações removidas
- [ ] Fase 3: `_TEMPLATE.md` criado, cross-feedback extraído (11 perfis), auto-crítica datada extraída (14 perfis), Output/Inputs/WhenNOT em todos
- [ ] Fase 4: 8 aprendizados distribuídos pelos perfis relevantes
- [ ] **Tamanho dos perfis:** todos entre 80-180 linhas (00-head é o outlier — pode reduzir movendo manual operacional para `agentes/referencia/head-runbook.md`)
- [ ] Score médio de auditoria sobe de 7.1 → 8.5+ (re-auditar pode ser opcional pra esta sessão)
- [ ] Sem regressão: nenhum aprendizado perdido (cross-feedback, auto-crítica vão pra outros arquivos, não somem)

## Restrições

- **Preservar conteúdo válido** — não deletar referências canônicas (papers, fontes, regras estruturais)
- **Cross-feedback movido pra `agentes/retros/`** — não somem, só não inflam mais o prompt
- **Memórias do projeto continuam em `~/.claude/projects/.../memory/`** — perfis apenas referenciam por nome
- **Aprendizados são REFERENCIADOS, não duplicados** — bullet com nome do arquivo + TL;DR de 1 linha. Conteúdo completo continua na memória
- **Tamanho:** perfis entre 80-180 linhas (atualmente 00-head tem 372)

## Especialistas a envolver

- **Dev** — implementação completa
- **Head** — sign-off final no overhaul (validar que nenhum aprendizado crítico foi perdido)
- **Validador funcional** = todos os agentes (cada agente revisa seu próprio perfil pós-overhaul)

## Reportar

1. Hashes commits + push outputs (granular por fase)
2. Lista dos arquivos criados (`_TEMPLATE.md`, `agentes/retros/cross-feedback-2026-03-20.md`, atualizações em `agentes/memoria/NN-x.md`)
3. Tamanho de cada perfil ANTES vs DEPOIS
4. Confirmação que todos os aprendizados foram distribuídos
5. Gaps deferidos (se houver — perfis que ficaram fora do escopo)
6. Eventual issue de follow-up (ex: `00-head.md` precisa runbook separado)

## Conclusão

> A preencher após implementação.
