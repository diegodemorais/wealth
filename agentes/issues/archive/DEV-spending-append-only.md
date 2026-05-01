---
ID: DEV-spending-append-only
Titulo: Spending summary append-only — fluxo mensal eficiente
Dono: Dev
Prioridade: 🟡 Média
Dependências: DEV-pipeline-append-only (helpers já existem em `scripts/append_only.py`)
Origem: registro abril/2026 — bookkeeper rodou pipeline completo (~7min) quando deveria ser <1min de append. Diego: "vai ser todo mês, tem que funcionar certo e eficiente".
---

## Contexto

`dados/spending_summary.json` é regenerado do zero a cada execução do pipeline de gastos (lê CSV inteiro, recalcula 9 meses de breakdown, escreve overwrite). Isso viola o princípio append-only estabelecido em **DEV-pipeline-append-only**: meses fechados são determinísticos, não devem ser recomputados.

**Sintoma observado (1 maio 2026):**
- Bookkeeper processou abril em ~7 min
- Mesmo após o trabalho, `spending_summary.json` ficou com período `2025-08 a 2026-03` (abril não foi apendado — pipeline atual não está sequer correto)
- `react-app/public/data.json` mudou 390 linhas (provavelmente recálculo geral, não só campo de spending)

## Princípios (do contrato append-only existente em `scripts/CLAUDE.md`)

- **P1 (versionamento):** `_meta.metodologia_version` no JSON; bump exige rebuild explícito
- **P2 (período fechado):** mês fechado (anterior ao corrente) é imutável
- **P3 (helper canônico):** usar `scripts/append_only.py` (`load_or_init`, `merge_append`, `write_with_meta`, `is_period_closed`)
- **P4 (flag --rebuild):** força regeneração mesmo com versão igual
- **P5 (validação):** rebuild → append → append produz output bit-for-bit idêntico (excluindo `_meta`)

## Escopo

### Backend

**1. Identificar pipeline atual**
- `scripts/spending_analysis.py` (provável) ou onde quer que `spending_summary.json` seja gerado
- Mapear todos os campos: `monthly_breakdown[]`, agregados (`must_spend_mensal`, `like_spend_mensal`, etc.), `periodo`, `meses`, `updated_at`, `fonte`

**2. Refatorar para append-only**
- `METODOLOGIA_VERSION_SPENDING = "spending-actual-v1"`
- `load_or_init` → decide append vs rebuild
- Append: ler CSV (Actual Budget export), filtrar apenas meses **> last_period_appended**, calcular breakdown só dos novos meses, fazer `merge_append` no `monthly_breakdown[]`
- Mês corrente sempre recalcula (pode ser parcial até o ciclo de fatura fechar)
- Agregados (`must_spend_mensal`, `total_anual`, etc.) **sempre recalculados** sobre o `monthly_breakdown` final — são derivados, não dados de período fechado
- Flag `--rebuild` mantida

**3. Lógica de "mês corrente vs fechado"**
- Mês corrente = mês de hoje OU mês anterior se ciclo de fatura ainda não fechou (cartão Nubank fecha ~dia 14, débito vai até 28-30)
- **Decisão Head:** considerar mês "fechado" se hoje está no **dia 5 do mês seguinte ou depois** (dá margem pra cartão cair). Antes do dia 5 do mês seguinte, mês ainda é "corrente" e pode receber transações novas → recalcula.
- Documentar regra no código com comentário

**4. Regenerar campos do `data.json`**
- O `generate_data.py` lê `spending_summary.json` para popular campos do dashboard. Garantir que após append, esses campos refletem o spending atualizado **sem rebuild geral** (só o ramo de spending).
- Se `generate_data.py` regenera tudo do zero por design (segue o padrão da maioria), aceitar — append em `spending_summary.json` é o ganho principal. Mas se houver caminho rápido para regenerar só os campos derivados de spending, preferir.

### Validação

- **Idempotency E2E:** rodar `spending_analysis.py` 2× consecutivas após append — segunda execução não modifica `monthly_breakdown` exceto `_meta.last_appended_at`
- **Equivalência:** rebuild → append produz `monthly_breakdown` bit-for-bit idêntico (excluindo `_meta`)
- **Tempo:** append (mês novo) deve rodar em **< 30 segundos** (vs 7min atual). Reportar tempo medido.
- **Validation:** `./scripts/quick_dashboard_test.sh` end-to-end verde

### Backfill abril/2026

- Após refatoração: rodar pipeline novo para apendar abril/2026 ao `spending_summary.json` atual (que está em 2025-08 a 2026-03)
- CSV: `analysis/raw/All-Accounts-Abril26.csv` (1496 linhas, mais completo que o `_03abril26.csv`)
- Resultado esperado: `spending_summary.json` cobre 2025-08 a 2026-04, agregados atualizados, `_meta` populado, fonte = `All-Accounts-Abril26.csv`

### Documentação

- Atualizar `scripts/CLAUDE.md` seção "Append-only contract" — adicionar `spending_summary.json` à lista de artefatos cobertos
- Atualizar memória `reference_actual_budget.md` se houver mudança no fluxo de import (ex: nome canônico do CSV)
- Documentar comando canônico para rotina mensal:
  ```
  ~/claude/finance-tools/.venv/bin/python3 scripts/spending_analysis.py --csv analysis/raw/All-Accounts-{Mês}{Ano}.csv
  ```

## Critérios de aceite

- [ ] `dados/spending_summary.json` ganha bloco `_meta` com `metodologia_version=spending-actual-v1` e `last_period_appended`
- [ ] `scripts/spending_analysis.py` (ou equivalente) usa helpers de `scripts/append_only.py`
- [ ] Mês fechado nunca é recomputado; mês corrente é recalculado
- [ ] Flag `--rebuild` força regeneração total
- [ ] Append (mês novo) roda em < 30s
- [ ] Idempotency: 2× consecutivas não modificam histórico
- [ ] Equivalência rebuild ↔ append validada bit-for-bit (test em `scripts/test_pipeline_idempotency.py` cobre `spending_summary.json`)
- [ ] Backfill abril/2026 aplicado, `spending_summary.json` cobre 2025-08 a 2026-04
- [ ] `data.json` reflete spending atualizado (campos do dashboard ficam corretos para abril)
- [ ] `quick_dashboard_test.sh` end-to-end verde
- [ ] `scripts/CLAUDE.md` atualizado
- [ ] Changelog atualizado se houver mudança visível no dashboard

## Especialistas a envolver

- **Dev** — implementação
- **Bookkeeper** — validar que o JSON novo bate com expectativa do consumidor downstream (data.json) e que números de abril/2026 reproduzem o relatório anterior (R$25.399 total, top categorias)

## Conclusão

> A preencher após implementação.
