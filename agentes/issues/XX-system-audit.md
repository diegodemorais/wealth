# XX-system-audit: Auditoria Sistêmica Completa — Pipeline, Scripts, Dashboard, Arquitetura

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | XX-system-audit |
| **Dono** | Head + Integrator |
| **Status** | Doing |
| **Prioridade** | Alta |
| **Participantes** | Integrator (lead técnico), Arquiteto (Plan), Dev, Head |
| **Co-sponsor** | Integrator (conduziu auditoria de cobertura que revelou 12+ problemas estruturais) |
| **Dependencias** | — |
| **Criado em** | 2026-05-01 |
| **Origem** | Proativo — auditoria pipeline-coverage.md revelou problemas estruturais; Diego solicitou revisão ampliada |
| **Concluido em** | — |

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
- [ ] Mapear DAG real do pipeline: todos os scripts, suas dependências, inputs, outputs
- [ ] Classificar cada script: obrigatório (bloqueia) / condicional (enriquece) / legado (pode remover)
- [ ] Avaliar: faz sentido ter schema Pydantic para `data.json` no lado Python? TypeScript interface central no React?
- [ ] Identificar duplicidade de lógica entre `generate_data.py`, `reconstruct_fire_data.py`, `fire_montecarlo.py`
- [ ] Mapear consultas externas: quais têm retry? quais têm cache? quais têm fallback explícito?

### Fase 2 — Fixes estruturais P1 (Dev + Integrator)
- [ ] **drawdown_history.crises[1].drawdown_max=0.0** — investigar bug em `reconstruct_fire_data.py`
- [ ] **pfire_cenarios_estendidos zeros** — diagnosticar e corrigir `compute_extended_mc_scenarios()`
- [ ] **`cambio` sem assertion** — adicionar assert + log explícito quando fallback usado
- [ ] **`risk.semaforos.renda_plus_taxa.value=null`** — injetar taxa Renda+ no semáforo
- [ ] **`shadows` todos null** — entender se existe script; criar ou documentar gap

### Fase 3 — Schema e contratos (Arquiteto → Dev)
- [ ] Decidir: Pydantic model para saída do pipeline? TypeScript interface central? ou spec.json é suficiente?
- [ ] Se schema: implementar validação na saída de `generate_data.py`
- [ ] Adicionar assertions para campos críticos sem assert: `pfire_aspiracional`, `pfire_base`, `cambio`, `drawdown_history`, `shadows`
- [ ] Revisar `dashboard/spec.json`: está completo e atualizado?

### Fase 4 — Observabilidade e runbook (Integrator + Dev)
- [ ] Criar runbook de execução do pipeline (ordem canônica, o que fazer em falha de cada step)
- [ ] Melhorar output do pipeline: separar 🔴 crítico / 🟡 degradado / ✅ ok
- [ ] Tratar consultas externas uniformemente: wrapper com retry, cache TTL, fallback explícito
- [ ] Documentar TTL de cache para cada fonte externa

### Fase 5 — Limpeza (Dev)
- [ ] Identificar scripts legados que podem ser removidos ou arquivados
- [ ] Verificar funções duplicadas entre scripts Python
- [ ] Checar imports não-utilizados e dead code em `generate_data.py`
- [ ] `mercado.renda2065_mtd_pp=null` — seed de início de mês incompleto
- [ ] `spendingSensibilidade=[]` — entender e corrigir

### Fase 6 — Atualizar artefatos do Integrator
- [ ] Atualizar `pipeline-coverage.md` com status pós-fixes
- [ ] Atualizar `dependency-map.md` com DAG formal e runbook resumido
- [ ] Commitar e pushar tudo

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

> A preencher conforme o trabalho avança.

### Achados da auditoria inicial (pipeline-coverage.md, 2026-05-01)

**Campos com problemas estruturais confirmados:**

| Campo | Problema | Severidade | Status |
|-------|---------|-----------|--------|
| `drawdown_history.crises[1].drawdown_max` | = 0.0 — bug reconstruct_fire_data.py | P1 | Em investigação |
| `pfire_cenarios_estendidos.stagflation` | retorno_equity_base = 0.0 | P1 | Em investigação |
| `pfire_cenarios_estendidos.hyperinflation` | p_sucesso_pct = 0.0 | P1 | Em investigação |
| `shadows.*` | Todos null — nenhum script calcula shadows | P2 | Gap estrutural |
| `cambio` | Sem assertion, fallback silencioso | P2 | Pendente |
| `risk.semaforos.renda_plus_taxa.value` | null — taxa não injetada | P2 | Pendente |
| `spendingSensibilidade` | [] — state.spending.scenarios vazio | P3 | Pendente |
| `mercado.renda2065_mtd_pp` | null — seed incompleto | P3 | Pendente |
| 83 campos top-level | Sem assertion | Estrutural | Pendente decisão schema |

---

## Conclusão

> A preencher ao finalizar.

---

## Resultado

> A preencher ao finalizar.

---

## Próximos Passos

> A preencher conforme conclusão.
