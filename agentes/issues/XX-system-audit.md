# XX-system-audit: Auditoria Sistêmica Completa — Pipeline, Scripts, Dashboard, Arquitetura

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | XX-system-audit |
| **Dono** | Head + Integrator |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | Integrator (lead técnico), Arquiteto (Plan), Dev, Head |
| **Co-sponsor** | Integrator (conduziu auditoria de cobertura que revelou 12+ problemas estruturais) |
| **Dependencias** | — |
| **Criado em** | 2026-05-01 |
| **Origem** | Proativo — auditoria pipeline-coverage.md revelou problemas estruturais; Diego solicitou revisão ampliada |
| **Concluido em** | 2026-05-01 |

---

## Motivo / Gatilho

O Integrator conduziu auditoria completa de cobertura (pipeline-coverage.md, 2026-05-01) e identificou:
- 83 dos 102 campos em data.json sem assertions — quebra silenciosa
- Campos null estruturais: `shadows` (nunca calculados), `pfire_cenarios_estendidos` com zeros, drawdown COVID = 0%
- Scripts externos sem orquestração clara: quais são obrigatórios? quais são opcionais? qual é a ordem correta?
- Duplicidade de lógica entre `generate_data.py`, `reconstruct_fire_data.py`, `fire_montecarlo.py`
- Consultas externas (yfinance, pyield, bcb, fredapi) sem tratamento uniforme de falha
- `--skip-scripts` removido hoje por ser fundamentalmente quebrado — indica problema arquitetural mais profundo
- Dashboard consome campos de formas ad-hoc: sem schema formal, contratos implícitos

Diego pediu revisão ampla: scripts adicionais, consultas externas, opcionais vs obrigatórios, fontes da verdade, duplicidade, pipeline, ordem, dashboard, schema. E implementar o que for encontrado.

---

## Descrição

Auditoria arquitetural completa do sistema de dados e dashboard, cobrindo:

1. **Pipeline e orquestração** — qual é a ordem canônica de execução? quais scripts são obrigatórios vs opcionais? existe um DAG explícito? o que acontece quando um step falha?
2. **Scripts externos e consultas** — yfinance, pyield, BCB, IBKR Flex: tratamento uniforme de falha? retry? cache TTL? fallback explícito?
3. **Fontes da verdade** — `carteira.md` → `carteira_params.json` → `config.py` → `generate_data.py`: a cadeia está limpa? há duplicidade de parâmetros?
4. **Schema formal** — data.json cresce organicamente sem contrato. Faz sentido um schema JSON (Pydantic? TypeScript interface central?) que seja a fonte de verdade bilateral (Python escreve, React consome)?
5. **Assertions e observabilidade** — 83/102 campos sem assert. Quais deveriam ter assert obrigatório? Quais deveriam ser warnings? Como fazer o pipeline comunicar claramente o que está degradado vs crítico?
6. **Duplicidade** — lógica de cálculo duplicada entre scripts? campos escritos em dois lugares? funções equivalentes em Python e TS sem sync?
7. **Dashboard** — seções que raramente são visitadas? componentes sem data-testid? campos consumidos de forma frágil (optional chaining sem fallback)?
8. **Processos** — como o pipeline deve ser rodado? existe runbook? o que fazer quando um script externo fica indisponível?

---

## Escopo

### Fase 1 — Diagnóstico arquitetural (Arquiteto + Integrator)
- [x] Mapear DAG real do pipeline: todos os scripts, suas dependências, inputs, outputs → `scripts/RUNBOOK.md`
- [x] Classificar cada script: obrigatório (bloqueia) / condicional (enriquece) / legado (pode remover) → Seção 3 do RUNBOOK.md
- [x] Avaliar: faz sentido ter schema Pydantic para `data.json` no lado Python? → **Veredicto: assertions seletivas** (spec.json suficiente + assertions incrementais)
- [x] Identificar duplicidade de lógica entre `generate_data.py`, `reconstruct_fire_data.py`, `fire_montecarlo.py` → Sem duplicidade crítica; `fire_montecarlo.py` é importado diretamente; `reconstruct_fire_data.py` gera snapshots JSON distintos
- [x] Mapear consultas externas: quais têm retry? quais têm cache? quais têm fallback explícito? → Documentado na Seção 6 do RUNBOOK.md; **GAP: sem retry unificado**

### Fase 2 — Fixes estruturais P1 (Dev + Integrator)
- [x] **drawdown_history.crises[1].drawdown_max=0.0** — CORRIGIDO 2026-05-01 (Integrator): uso de TWR via `patrimonio_var`
- [x] **pfire_cenarios_estendidos zeros** — VÁLIDO 2026-05-01: 0.0% é correto para hyperinflation (MC 1000 sims confirma)
- [x] **`cambio` sem assertion** — CORRIGIDO 2026-05-01 (Integrator): `assert cambio > 0` + logs explícitos
- [x] **`risk.semaforos.renda_plus_taxa.value=null`** — CORRIGIDO 2026-05-01 (Integrator): `_extract_renda_plus_taxa()` em risk_metrics.py
- [x] **`shadows` todos null** — MAPEADO 2026-05-01: GAP estrutural documentado; fallback implementado usando período mais recente do state

### Fase 3 — Schema e contratos (Arquiteto → Dev)
- [x] Decidir: Pydantic model para saída do pipeline? → **Veredicto: spec.json suficiente + assertions seletivas**
- [x] Adicionar assertions para campos críticos: `pfire_aspiracional`, `pfire_base`, `cambio`, `drawdown_history` — todos adicionados
- [x] Assertions adicionais: `premissas.fire_year_base` (isinstance int), warnings etf_composition/p_quality_aspiracional/macro/pfire_range
- [x] Revisar `dashboard/spec.json` → spec.json existe em `dashboard/spec.json` (1526 linhas, última revisão 2026-04-29). Completo e atualizado.

### Fase 4 — Observabilidade e runbook (Integrator + Dev)
- [x] Criar runbook de execução do pipeline → `scripts/RUNBOOK.md` criado (456 linhas)
- [x] Melhorar output do pipeline → warnings explícitos adicionados para gaps; padronização completa 🔴/🟡/✅/⊘ deixada como TODO BAIXA prioridade
- [x] Documentar TTL de cache para cada fonte externa → Seção 6 do RUNBOOK.md
- [ ] Tratar consultas externas uniformemente com retry unificado → Documentado como TODO no RUNBOOK.md; não implementado (MÉDIO prioridade)

### Fase 5 — Integrações (Plan/Integrator)
- [x] Inventariar todas as integrações externas: yfinance (20+ chamadas diretas em 12 scripts), pyield (3 locais diretos), python-bcb (7 scripts — maioria via fx_utils), FRED CSV (2 scripts inline), fredapi (market_data.py), IBKR Flex (ibkr_lotes.py), Binance API (btc_indicators.py), Google Sheets (fetch_historico_sheets.py), Ken French (3 scripts)
- [x] Verificar retry/timeout/cache/fallback por integração → auditoria completa: **zero** retry exponencial em qualquer integração; timeouts em urllib direto apenas (5–30s); caches sem TTL explícito (yfinance, pyield, Ken French)
- [x] Avaliar camada de abstração → `fx_utils.py` (boa), `ibkr_lotes.py` (boa); yfinance sem wrapper central (20+ chamadas ad-hoc); pyield com 3 padrões distintos de fallback
- [x] **P1 Fix: `fx_utils.get_ptax()` fallback silencioso** — CORRIGIDO 2026-05-01: log explícito `⚠️ BCB indisponível — usando fallback HARDCODED=5.20` em stderr
- [x] **P1 Fix: `fetch_historico_sheets.py` sys.exit(1)** — CORRIGIDO 2026-05-01: `SheetsFetchError` substituiu sys.exit; main() usa cache local quando Sheets inacessível (pipeline não interrompido)
- [x] Criar `scripts/integration_health.py` → 9 integrações cobertas (OK/DEGRADED/DOWN/SKIP), latência, cache staleness; CLI com `--json`, `--fix`, `--integration`
- [x] Documentar Seção 10 no `scripts/RUNBOOK.md` → mapa completo, avaliação retry/TTL, "O que fazer quando cada uma cai", estrutura recomendada com gaps P1/P2/P3

### Fase 5b — Limpeza (Dev)
- [x] Identificar e arquivar scripts legados → 9 scripts movidos para `scripts/archive/`
- [x] Verificar duplicidade entre scripts → Sem duplicidade crítica; `withdrawal_engine.py` é importado por `fire_montecarlo.py` (correto)
- [x] `spendingSensibilidade=[]` — MAPEADO: nenhum script popula `state.spending.scenarios`; TODO documentado em generate_data.py
- [x] `mercado.renda2065_mtd_pp=null` — CORRIGIDO 2026-05-01 (Integrator): regex atualizado para ler tabela markdown

### Fase 6 — Atualizar artefatos do Integrator
- [x] Atualizar `pipeline-coverage.md` com DAG, classificação de scripts, achados da auditoria (Seção 8)
- [x] Atualizar `dependency-map.md` com referência ao RUNBOOK.md
- [x] Commitar e pushar tudo (Fases 1–5b)
- [x] Commitar e pushar Fase 5 — Integrações (integration_health.py, RUNBOOK.md Seção 10, fixes P1)

---

## Raciocínio

**Alternativas rejeitadas:**
- *Continuar como está (ad-hoc)*: 83 campos sem assert criam risco crescente de dados silenciosamente errados no dashboard. Cada novo campo adicionado aumenta a dívida técnica.
- *Schema rígido imediato (Pydantic completo)*: overhead alto; risco de over-engineering. Melhor avaliação incremental: assert onde dói, schema onde há contrato bilateral claro.

**Argumento central:**
O sistema cresceu organicamente e agora tem complexidade suficiente para justificar formalização: DAG explícito, contratos de schema, observabilidade estruturada. O custo de não fazer isso é silencioso (dados errados que ninguém detecta) e cresce com cada nova feature.

**Incerteza reconhecida:**
Schema formal (Pydantic) pode ser over-engineering para um sistema com 1 consumidor. A aposta é que o valor de detecção precoce de erros supera o custo de manutenção do schema.

**Falsificação:**
Se o pipeline continuar estável por 6 meses sem novos bugs de null/zero silenciosos detectados, o schema formal seria questionável. O problema real pode ser resolvido só com assertions direcionadas.

---

## Análise

### Achados do diagnóstico arquitetural (XX-system-audit, 2026-05-01)

#### Classificação de Scripts (50 scripts em scripts/)

- **CORE** (12 scripts): fire_montecarlo, pfire_engine, pfire_transformer, tax_engine, bond_pool_engine, guardrail_engine, swr_engine, risk_metrics, config, reconstruct_fire_data, backtest_portfolio, reconstruct_realized_pnl
- **AUXILIAR** (12 scripts): parse_carteira, reconstruct_history, reconstruct_factor, reconstruct_macro, reconstruct_tax, fx_utils, ibkr_lotes, ibkr_sync, spending_analysis, fetch_historico_sheets, market_data, withdrawal_engine
- **STANDALONE** (8 scripts): checkin_mensal, portfolio_analytics, multi_llm_query, factor_regression, resampled_frontier, brfiresim, btc_indicators, tlh_monitor
- **TESTE** (7 scripts + 34 arquivos tests/): validate_data, validate_schema, validators, snapshot_schemas, ci_check_carteira_params, detect_hardcoding, + tests/*.py
- **UTILITÁRIO** (7 scripts): pipeline_archive, snapshot_archive, sync_spec, data_pipeline_engine, parse_nubank_operations, binance_analysis, check_gatilhos
- **ARQUIVO** (9 scripts movidos): binance_parse_pdf, fire_glide_path_scenarios, parse_issues, historico_patrimonio, ibkr_posicoes_sync, load_ibkr_posicoes, p4_patch_generator, p4_suggestion_engine, validate_changelog_registration

#### Consultas Externas — Status de Retry/Cache/Fallback

Nenhuma consulta externa tem retry unificado. Cada fonte tem try/except ad-hoc:
- **yfinance**: try/except sem retry; câmbio tem `CAMBIO_FALLBACK` em config.py; factor rolling tem `factor_cache.json` sem TTL
- **pyield/ANBIMA**: try/except sem retry; cache em `ntnb_history_cache.json` sem TTL
- **python-bcb**: try/except sem retry; sem cache; fallback para valores hardcoded de config.py
- **IBKR Flex**: manual; `lotes.json` é o cache sem TTL
- **fredapi**: try/except sem retry; `FED_FUNDS_SNAPSHOT` em config.py como fallback

#### Duplicidade de Lógica

Sem duplicidade crítica. Separação limpa:
- `fire_montecarlo.py` → simulação MC e P(FIRE) — importado diretamente por generate_data.py
- `reconstruct_fire_data.py` → snapshots JSON pré-computados (fire_matrix, drawdown_history, etc.) — subprocess
- `generate_data.py` → agregação e injeção de todos os campos em data.json

#### Decisão de Schema (Fase 3)

**Veredicto: assertions seletivas**. Pydantic seria over-engineering para sistema com 1 consumidor e contratos já documentados em `spec.json`. A estratégia é: assert onde a falha seria silenciosa e grave; warning onde a falha é documentada e esperada.

### Problemas estruturais — Status Final

| Campo | Problema | Severidade | Status |
|-------|---------|-----------|--------|
| `drawdown_history.crises[1].drawdown_max` | = 0.0 — bug reconstruct_fire_data.py | P1 | ✅ CORRIGIDO: TWR via patrimonio_var |
| `pfire_cenarios_estendidos.hyperinflation` | p_sucesso_pct = 0.0 | P1 | ✅ VÁLIDO: 0.0% matematicamente correto |
| `cambio` | Sem assertion, fallback silencioso | P2 | ✅ CORRIGIDO: assert >0 + logs |
| `risk.semaforos.renda_plus_taxa.value` | null — taxa não injetada | P2 | ✅ CORRIGIDO: _extract_renda_plus_taxa() |
| `mercado.renda2065_mtd_pp` | null — seed incompleto | P3 | ✅ CORRIGIDO: regex holdings.md |
| `shadows.*` | Todos null — gap estrutural | P2 | ⚠️ PARCIAL: fallback usa período mais recente; chave q1_2026 nunca criada |
| `spendingSensibilidade` | [] — nenhum script popula state.spending.scenarios | P3 | ⚠️ DOCUMENTADO: TODO em generate_data.py, gap no RUNBOOK.md |
| `fire.p_quality_aspiracional` | null — --by_profile não calcula aspiracional | P2 | ⚠️ DOCUMENTADO: warning adicionado |
| `fire.pat_mediano_fire50` | chave stale | MÉDIO | ⚠️ DOCUMENTADO: MC escreve pat_mediano_aspiracional |
| 83 campos top-level | Sem assertion | Estrutural | ✅ DECISÃO: spec.json + assertions seletivas suficiente |

---

## Conclusão

**Schema:** Assertions seletivas são suficientes. Spec.json (`dashboard/spec.json`, 1526 linhas) cobre o contrato bilateral Python→React. Pydantic não justificado com 1 consumidor.

**Pipeline:** DAG explícito criado (`scripts/RUNBOOK.md`). Scripts classificados em 6 categorias. 9 scripts legados arquivados. Consultas externas documentadas com seus TTLs, fallbacks e gaps de retry.

**Gaps estruturais remanescentes (não resolvidos nesta sessão, backlog):**
1. `shadows`: necessita de `reconstruct_shadows.py` que agregue retornos mensais em períodos trimestrais — estimativa 1-2h de implementação
2. `spendingSensibilidade`: necessita de ~3 chamadas adicionais ao PFireEngine para 3 níveis de gasto — estimativa 30min de implementação
3. Retry unificado para consultas externas: `fetch_with_retry()` documentado mas não implementado — estimativa 2h com testes

**Observabilidade:** Pipeline já tem logging estruturado (⚠️/✓/✅/❌). Padronização completa para 🔴/🟡/✅/⊘ identificada como baixa prioridade (impacto funcional zero).

---

## Resultado

**Implementado nesta sessão (2026-05-01):**

1. **9 scripts legados arquivados** em `scripts/archive/` (Fase 2.1)
2. **`scripts/RUNBOOK.md`** criado com DAG completo, classificação de scripts, guia de falha por fonte, gaps documentados (Fase 2.4)
3. **`generate_data.py` melhorado**:
   - Shadows: fallback implementado usando período mais recente do state; gap documentado com TODO (Fase 2.5)
   - SpendingSensibilidade: warning explícito adicionado; gap documentado com TODO (Fase 2.6)
   - Assertions adicionais: `premissas.fire_year_base` (isinstance int); warnings para etf_composition.SWRD.aum_eur, fire.p_quality_aspiracional, macro.selic_meta, pfire range [40-100%] (Fase 3)
4. **`agentes/referencia/pipeline-coverage.md`** atualizado com Seção 8: classificação de scripts, DAG resumido, decisão de schema, gaps estruturais confirmados
5. **`agentes/referencia/dependency-map.md`** atualizado com referência ao RUNBOOK.md

**Não implementado (backlog):**
- `fetch_with_retry()` unificado para consultas externas
- `reconstruct_shadows.py` para shadows trimestrais
- Cálculo inline de `spendingSensibilidade` com 3 níveis de gasto
- Padronização completa de emoji de observabilidade (🔴/🟡/✅/⊘)
- `fire.p_quality_aspiracional` (requer mudança em fire_montecarlo.py --by_profile)

---

## Próximos Passos

1. **Curto prazo (próximo sprint):** `spendingSensibilidade` — ~30min, alto impacto no dashboard
2. **Médio prazo:** `shadows` via `reconstruct_shadows.py` — ~1-2h
3. **Backlog:** `fetch_with_retry()`, `fire.p_quality_aspiracional`
