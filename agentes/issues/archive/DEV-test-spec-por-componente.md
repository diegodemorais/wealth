| Campo | Valor |
|-------|-------|
| **ID** | DEV-test-spec-por-componente |
| **Título** | Especificação de Testes por Componente — Regras de Negócio + Sistemas Internos |
| **Dono** | Dev (coordenação) |
| **Status** | 🟢 EM EXECUÇÃO (análise paralela de agentes) |
| **Prioridade** | 🔴 Alta |
| **Criado em** | 2026-04-24 |
| **Tipo** | Implementação |

---

## Motivo

Testes atuais cobrem invariantes mecânicas (não-NaN, ranges, sincronização) mas não as **regras de negócio reais** que cada componente deve respeitar. Exemplo:
- `ReverseFire.tsx` testa se aporte é calculado, não se é **suficiente** para FIRE na idade alvo
- `PerformanceChart.tsx` testa renderização, não se as **atribuições são econômicas**
- Scripts Python validam estrutura de dados, não se os **valores são realistas**

Objetivo: ter planos de teste **completos** que especifiquem:
1. **Regras de negócio** de cada componente/página/script
2. **Critérios de aceitação** numéricos e lógicos
3. **Fases de implementação** organizadas por especialista
4. **Sistema interno** (pipes, fontes de verdade, skills, scripts)

---

## Escopo

### Fase 1: Análise Paralela (Hoje)

**Cada especialista analisa sua área:**

| Especialista | Responsabilidade |
|--------------|------------------|
| **Fire** | Páginas/componentes FIRE: `ReverseFire`, `StressChart`, `P(FIRE)`, guardrails, SWR, drawings, drawdown |
| **Quant** | Cálculos: `ReverseFire.tsx`, `fire.ts`, `montecarlo.ts`, `dataWiring.ts`, formatadores, aporte-logic |
| **Factor** | ETFs: `EtfComposition`, `AllocationChart`, SWRD/AVGS/AVEM/JPGL, rebalance, drift |
| **RF** | Renda Fixa: `BondChart`, `RfAllocation`, IPCA+ ladder, duration, MtM, Selic |
| **FX** | Cambio: `FxChart`, `ExposicaoCambial`, hedge, PTAX, correlações |
| **Macro** | Macro: `MacroPanel`, `Timeline`, Selic, IPCA, Focus, cenários |
| **Head** | Sistemas internos: pipes, pre-commit, GitHub Actions, `CLAUDE.md`, scripts de manutenção |

**Cada um entrega:**
- ✅ Lista de componentes/páginas/scripts da sua área
- ✅ Regras de negócio (1-5 por componente)
- ✅ Dados de teste realistas (ex: patrimônio 3.47M, gasto 250k)
- ✅ Critérios numéricos/lógicos (tolerâncias, ranges, invariantes)
- ✅ Plano de testes em fases (Phase 1, 2, 3)

### Fase 2: Consolidação Head + QA (Após Análise)

**Head:**
- Consolida especificações em `DEV-test-spec-v3.md`
- Organiza **fases de implementação** (Quant → Fire → Factor → RF → FX → Macro → Internos)
- Define **prioridade** por impacto (crítica → alta → média)
- Mapeia **dependências** (ex: Fire precisa de Quant antes)

**QA:**
- Recebe plano consolidado
- Implementa **fase por fase** (testes em paralelo)
- Reporta status de cobertura

### Fase 3: Validação Quant (Final)

**Quant valida:**
- ✅ Especificações contra realidade (dados, fórmulas, invariantes)
- ✅ Cobertura de implementação vs. plano
- ✅ Testes passam e fazem sentido econômico

---

## Critério de Sucesso

- ✅ Especificações de testes para **100% dos componentes** (38 React + 15 scripts Python)
- ✅ Cada teste tem **regra de negócio documentada** (não apenas "testa se não-NaN")
- ✅ Todos os testes usam **dados realistas de Diego** (patrimônio, gasto, retorno)
- ✅ **Cobertura de sistema interno**: pipes, pre-commit, CI/CD, skills, fontes de verdade
- ✅ Implementação em **fases organizadas** (Quant → Fire → Factor → ... → Internos)
- ✅ **100% testes passing** após cada fase
- ✅ **Quant valida** spec e implementação ao final

---

## Referências

- `agentes/referencia/spec-v2-testes-completos.md` (1247 linhas — todos os componentes mapeados)
- `agentes/issues/DEV-plan-testes-2026.md` (testes anteriores — Phase 1-4)
- Commit 324abad3: 155 testes passando (baseline)

---

## Próximas Ações

1. **[HOJE]** Agentes especializados analisam suas áreas em paralelo
2. **[AMANHÃ]** Head consolida, QA implementa Phase 1
3. **[SEMANA]** Todas fases completas, Quant valida
