# DEV-tester: Agente Tester — Suite de testes funcionais para todos os 64 blocos do dashboard

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-tester |
| **Dono** | Dev |
| **Status** | ✅ Done |
| **Prioridade** | 🔴 Alta |
| **Participantes** | Dev, Quant, FIRE, Factor, RF, Risco, Macro, FX, Tax, Bookkeeper, Head |
| **Co-sponsor** | Head |
| **Dependencias** | DEV-manifest (spec.json deve estar concluído — ✅ Done 2026-04-11) |
| **Criado em** | 2026-04-12 |
| **Origem** | Diego — componentes quebram com frequência (~64 blocos), necessidade de cobertura de testes sistemática |
| **Concluido em** | 2026-04-12 |

---

## Motivo / Gatilho

O dashboard cresceu para ~64 blocos distribuídos em 4 abas. Componentes têm quebrado com frequência: PVR não renderizava (DEV-pvr-broken — recorrente), bugs no fan chart, hardcodes ressurgindo, campos ausentes no data.json. Cada build pode introduzir regressões silenciosas. Não existe nenhuma camada de verificação automatizada entre o build e o deploy.

---

## Descricao

Criar um agente `tester` dedicado com suite de testes funcionais cobrindo todos os 64 blocos do dashboard. Cada agente especialista contribui testes para os blocos do seu domínio. O tester executa após cada build e bloqueia o deploy se falhar. Se um componente falhar 3 ciclos consecutivos, apresentar ao Diego sem seguir adiante.

O tester não toma decisões de implementação — apenas verifica e reporta. Decisões de correção voltam ao `dev`.

---

## Premissas do Dev (o tester deve conhecer e verificar)

1. **Zero hardcoded** — nenhum valor numérico ou texto de dados deve estar literal no `build_dashboard.py` ou no HTML gerado; toda informação vem de `dados/` ou `agentes/`
2. **Fonte única: spec.json** — todos os blocos devem estar declarados em `dashboard/spec.json`; bloco no HTML sem entrada no spec = falha
3. **Pipeline canônico** — `generate_data.py` → `build_dashboard.py` → `dashboard/index.html`; nunca editar `index.html` diretamente
4. **Privacy mode** — todo bloco com `privacy: true` no spec deve ter classe `.pv` ou equivalente; valores sensíveis não podem aparecer sem o toggle ativo
5. **Data fields** — todo `data_field` declarado no spec deve existir no `data.json` gerado; campo ausente = bloco quebrado silencioso

---

## Formato de Teste Padrão

Cada teste segue o formato abaixo (inspirado em pytest/jest — legível por agentes e humanos):

```
TEST <id-do-bloco> :: <categoria> :: <descricao-curta>
GIVEN <precondição>
WHEN  <ação ou condição verificada>
THEN  <resultado esperado>
SEVERITY: CRITICAL | HIGH | MEDIUM
```

**Categorias:**
- `DATA` — campo existe no data.json com tipo correto
- `RENDER` — bloco renderiza sem erro (elemento presente no DOM)
- `VALUE` — valor exibido bate com data.json (sem hardcode)
- `PRIVACY` — bloco oculta dados sensíveis em privacy mode
- `SPEC` — bloco está declarado no spec.json com campos obrigatórios

**Exemplo:**

```
TEST hero-p-fire :: DATA :: p_fire_base existe no data.json
GIVEN data.json gerado pelo pipeline
WHEN  acessar data["p_fire"]["base"]
THEN  float no range [0.0, 1.0]
SEVERITY: CRITICAL

TEST hero-p-fire :: RENDER :: bloco renderiza no DOM
GIVEN index.html gerado pelo build
WHEN  buscar elemento com id="hero-p-fire" ou classe equivalente
THEN  elemento presente e não vazio
SEVERITY: CRITICAL

TEST hero-p-fire :: VALUE :: valor não é hardcoded
GIVEN build_dashboard.py
WHEN  grep por valor numérico literal de P(FIRE) no código
THEN  nenhuma ocorrência — valor lido de data.json
SEVERITY: HIGH
```

---

## Escopo

### Fase 1 — Definicao dos testes por agente especialista

Cada agente fornece testes para os blocos do seu domínio no formato padrão acima.

- [ ] **FIRE** — P(FIRE) hero, fan chart, guardrails, bond tent, spending sensitivity, FIRE date distribution, withdrawal ordering, simulador
- [ ] **Factor** — Drift por ETF, alpha tilt, alocação por bucket, asset mix, factor loadings, shadow portfolios
- [ ] **RF** — IPCA+ DCA status, Renda+ semáforo, bond pool readiness, premissas RF
- [ ] **Risco** — HODL11/cripto status, stress test, tail risk
- [ ] **Macro** — Macro status (Selic, IPCA, câmbio), semáforos macro
- [ ] **FX** — Câmbio BRL/USD, decomposição retorno FX, exposição cambial
- [ ] **Tax** — TLH monitor, lotes abertos, custo base, savings rate
- [ ] **Bookkeeper** — Patrimônio total, posições IBKR, histórico carteira, performance attribution
- [ ] **Head** — Hero strip, próximo aporte, alertas, wellness score, premissas vs realizado

### Fase 2 — Implementacao do tester

- [ ] Dev cria `scripts/test_dashboard.py` que executa todos os testes
- [ ] Quant valida que os testes DATA/VALUE cobrem corretamente os data_fields do spec.json
- [ ] Output: relatório de testes com PASS/FAIL por bloco e severidade
- [ ] Testes CRITICAL com falha: build considerado quebrado, bloco identificado para dev
- [ ] Se mesmo bloco falha 3 ciclos consecutivos: flag `ESCALATE_TO_DIEGO` no relatório

### Fase 3 — Integracao no CLAUDE.md e workflow

- [ ] Adicionar `tester` ao CLAUDE.md após `dev`: "Após build: `tester` executa suite. Se CRITICAL fail → volta ao `dev`. Se 3 ciclos fail → apresentar ao Diego."
- [ ] Quant incluído como co-revisor de testes que envolvam cálculos
- [ ] Documentar ciclo no flight rules: build → tester → se pass: deploy | se fail: dev → rebuild → tester

---

## Regras de Ciclo

```
Build completo
     │
     ▼
tester executa suite
     │
     ├─ Todos PASS ────────────────────► Deploy aprovado
     │
     ├─ CRITICAL fail (1º ou 2º ciclo) ► Reportar ao dev → dev corrige → rebuild
     │
     └─ CRITICAL fail (3º ciclo) ───────► ESCALATE_TO_DIEGO — não seguir sem aprovação
```

**Regra de severidade:**
- `CRITICAL` — bloco não renderiza, data_field ausente, valor obviamente errado → bloqueia deploy
- `HIGH` — hardcode detectado, privacy quebrado → bloqueia deploy
- `MEDIUM` — inconsistência de label, campo com valor default suspeito → warning, não bloqueia

---

## Contribuicoes esperadas por agente (Fase 1)

Cada agente deve fornecer, para cada bloco do seu domínio:

- Mínimo **3 testes por bloco**: 1 `DATA`, 1 `RENDER`, 1 `VALUE`
- Testes adicionais para lógica específica do domínio (ex: FIRE verifica que P50 < P90)
- Marcar como `CRITICAL` qualquer teste cuja falha torne a informação financeiramente enganosa

### Domínios por agente

| Agente | Blocos | Qtd estimada de testes |
|--------|--------|------------------------|
| **FIRE** | P(FIRE) hero, fan chart, guardrails, bond tent, spending sensitivity, FIRE date dist., withdrawal ordering, simulador | ~32 |
| **Factor** | Drift por ETF, alpha tilt, alocação por bucket, asset mix, factor loadings, shadow portfolios | ~24 |
| **RF** | IPCA+ DCA status, Renda+ semáforo, bond pool readiness, premissas RF | ~16 |
| **Risco** | HODL11/cripto status, stress test, tail risk | ~12 |
| **Macro** | Macro status (Selic, IPCA, câmbio), semáforos macro | ~12 |
| **FX** | Câmbio BRL/USD, decomposição retorno FX, exposição cambial | ~12 |
| **Tax** | TLH monitor, lotes abertos, custo base, savings rate | ~16 |
| **Bookkeeper** | Patrimônio total, posições IBKR, histórico carteira, performance attribution | ~20 |
| **Head** | Hero strip, próximo aporte, alertas, wellness score, premissas vs realizado | ~20 |
| **Dev** | Testes transversais: zero hardcoded, spec coverage, privacy global | ~20 |
| **Total estimado** | — | **~184 testes** |

---

## Arquivo de saida

`scripts/test_dashboard.py` — runner principal

`dashboard/tests/` — testes organizados por agente:
```
dashboard/tests/
  fire_tests.py
  factor_tests.py
  rf_tests.py
  risco_tests.py
  macro_tests.py
  fx_tests.py
  tax_tests.py
  bookkeeper_tests.py
  head_tests.py
  dev_tests.py       ← testes transversais (hardcode, spec, privacy)
```

`dashboard/tests/last_run.json` — resultado do último run (PASS/FAIL por teste, timestamp, ciclo de falhas por bloco)

---

## Analise

> A preencher após execução da Fase 1 (coleta de testes dos agentes especialistas)

---

## Conclusao

Suite completa entregue e integrada:
- **425 testes** cobrindo 64 blocos em 10 domínios
- **10 módulos**: dev, head, fire, factor, rf, risco, macro, fx, tax, bookkeeper
- **0 CRITICAL, 0 HIGH, 0 MEDIUM** failures no primeiro run limpo
- Runner: `python scripts/test_dashboard.py` com flags `--quick` e `--domain`
- Ciclo de falhas: 3 CRITICAL consecutivos → `ESCALATE_TO_DIEGO`
- CLAUDE.md e flight rules atualizados com protocolo build→tester→deploy
- Fix real detectado pelo tester: `pfire_atual=90.4` hardcoded no `build_dashboard.py`

---

## Resultado

425 testes, 100% passando. Suite integrada ao workflow de build.

---

## Proximos Passos

Concluído.
