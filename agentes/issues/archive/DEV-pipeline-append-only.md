---
ID: DEV-pipeline-append-only
Titulo: Pipeline append-only — séries históricas determinísticas
Dono: Dev
Prioridade: 🟡 Média
Dependências: —
Origem: auditoria pós DEV-pipeline-gaps-p2 (2026-05-01)
---

## Contexto

Auditoria revelou que 6 outputs em `dados/` são séries históricas determinísticas sendo **regeneradas do zero a cada execução**, em vez de append-only. Isso vai contra o princípio explicitado por Diego:

> "Dados antigos que são estáticos não precisam ser recalculados. Pra gerá-los de novo é só quando mudar alguma estrutura ou precisar corrigir algo. Senão, é append only, com as informações novas."

O padrão correto **já existe** no codebase (`ntnb_history_cache.json` em `generate_data.py:4051+`):

```python
if key not in cache:
    cache[key] = fetch_new_period(key)
# else: já temos, não toca
```

Falta propagar.

## Os 6 violadores

| Arquivo | Script | Linha | Tamanho | Cobertura |
|---------|--------|-------|---------|-----------|
| `historico_carteira.csv` | `reconstruct_history.py` | 820 | 5.5KB | TWR mensal 2021-2026 |
| `retornos_mensais.json` | `reconstruct_history.py` | 1351 | 7.7KB | Modified Dietz mensal |
| `rolling_metrics.json` | `reconstruct_history.py` | 1522 | 6.5KB | Rolling Sharpe/Sortino/vol 12-mo |
| `drawdown_history.json` | `reconstruct_fire_data.py` | 327 | 2.2KB | Peak-to-trough mensal |
| `fire_trilha.json` | `reconstruct_fire_data.py` | 226 | 22KB | Trilha esperada vs realizado |
| `tlh_lotes.json` | `ibkr_lotes.py` | 542 | 115KB | Lotes FIFO IBKR 5 anos |

**Caso especial:** `backtest_r7.json` tem guard `if not exists()` (não regenera), mas sem versionamento de metodologia — silenciosamente desatualizado se backtest mudar.

## Princípios da refatoração

### P1. Metadata canônica em cada artefato append-only

Cada JSON ganha bloco `_meta`:

```json
{
  "_meta": {
    "metodologia_version": "twr-md-v1",
    "schema_version": "1.0",
    "last_period_appended": "2026-04",
    "last_appended_at": "2026-05-01T15:00:00-03:00",
    "rebuild_reason": null
  },
  "data": [...]
}
```

`metodologia_version` é o gate: se valor no arquivo ≠ valor no script, **rebuild forçado**. Caso contrário, append.

### P2. Append-only por janela temporal fechada

Para séries mensais: meses já fechados (anteriores ao mês corrente) são imutáveis. Re-cálculo permitido apenas para o mês corrente.

Para séries diárias (futuro): dias fechados são imutáveis.

Para lotes FIFO (`tlh_lotes.json`): lotes com `data_venda IS NOT NULL` (realizados, IR já incidiu) são imutáveis. Open lots podem ser reconstruídos sobre realizados acumulados a cada nova compra/venda.

### P3. Padrão de implementação

Helper compartilhado em `scripts/append_only.py`:

```python
def load_or_init(path: Path, current_version: str) -> tuple[dict, bool]:
    """Retorna (artefato_existente, needs_rebuild).
    Se versão diverge ou arquivo não existe: needs_rebuild=True, artefato={}.
    """
    ...

def write_with_meta(path: Path, data: dict, version: str, last_period: str):
    """Escreve com _meta atualizado."""
    ...
```

Cada script gerador:
1. `load_or_init(path, METODOLOGIA_VERSION)` → decide append vs rebuild
2. Append: calcula apenas períodos novos (`> last_period_appended`)
3. Rebuild: regenera tudo, registra `rebuild_reason` no `_meta`

### P4. Flag `--rebuild` em cada script

CLI flag `--rebuild` força regeneração mesmo com versão igual. Útil para correção manual sem precisar bumpar versão.

### P5. Validação de equivalência

Para cada um dos 6: antes do refator, snapshot do output atual. Após refator com `--rebuild`, output deve ser **bit-for-bit idêntico** (excluindo `_meta`). Caso contrário, refator quebrou semântica.

## Plano de execução

### Fase 1 — Foundation (sem refatorar nada ainda)
1. Criar `scripts/append_only.py` com helpers (`load_or_init`, `write_with_meta`)
2. Criar `scripts/test_append_only.py` com testes unitários do helper
3. Adicionar bumper `metodologia_version` em `scripts/CLAUDE.md`

### Fase 2 — Refatoração por arquivo (1 PR-equivalente cada, validado por equivalência)
Ordem por complexidade crescente:

**Lote A — Mensais simples (M-Dietz):**
1. `retornos_mensais.json` (`reconstruct_history.py:1351`)
2. `historico_carteira.csv` (`reconstruct_history.py:820`)
3. `rolling_metrics.json` (`reconstruct_history.py:1522`)

**Lote B — FIRE-related:**
4. `drawdown_history.json` (`reconstruct_fire_data.py:327`)
5. `fire_trilha.json` (`reconstruct_fire_data.py:226`)

**Lote C — Lotes FIFO (caso especial):**
6. `tlh_lotes.json` (`ibkr_lotes.py:542`) — separar realizados (append) de open lots (snapshot reconstruído)

### Fase 3 — Backtest_r7 versionamento
7. Adicionar `_meta.metodologia_version` ao `backtest_r7.json`. Se versão atual de `backtest_portfolio.py --r7` ≠ versão no arquivo, log warning ou auto-rebuild.

### Fase 4 — Documentação e testes E2E
8. Atualizar `scripts/CLAUDE.md` com seção "Append-only contract"
9. Teste E2E: rodar pipeline 2× seguidas → segunda execução **não deve modificar** os 6 arquivos exceto `_meta.last_appended_at`
10. Atualizar memória `feedback_data_provenance.md` se necessário

## Especialistas a envolver

- **Dev** — implementação (todas as fases)
- **Bookkeeper** — verificar que nenhum consumidor downstream quebra (data.json schema, dashboard reads)
- **FIRE** — validar semântica de `fire_trilha.json` e `drawdown_history.json` (Lote B)
- **Tax** — validar `tlh_lotes.json` (Lote C) — implicação direta em IR realizado/diferido

## Critérios de aceite

- [ ] `scripts/append_only.py` criado com helpers + testes unitários verdes
- [ ] 6 arquivos refatorados, cada um com `_meta.metodologia_version` e comportamento append validado
- [ ] Cada arquivo passa teste de equivalência: rebuild produz output idêntico ao pré-refator
- [ ] Cada script tem flag `--rebuild` funcional
- [ ] `backtest_r7.json` tem versionamento de metodologia
- [ ] Pipeline rodando 2× consecutivas não modifica meses fechados (testado E2E)
- [ ] `scripts/CLAUDE.md` atualizado com contrato append-only
- [ ] `./scripts/quick_dashboard_test.sh` end-to-end verde
- [ ] Changelog atualizado

## Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Quebrar dados em produção | Validação de equivalência bit-for-bit antes de cada commit |
| Drift acumulado se append for sutilmente diferente de rebuild | Teste E2E periódico que faz `--rebuild` e compara com estado append |
| Bookkeeper/FIRE/Tax descobrirem semântica diferente | Envolver no review do Lote relevante antes de fechar |
| Lotes FIFO complexo (IBKR) | Lote C é o último; pode virar sub-issue se ficar muito grande |

## Conclusão

> A preencher após implementação.
