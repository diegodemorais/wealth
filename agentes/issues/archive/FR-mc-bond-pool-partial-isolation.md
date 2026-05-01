# FR-mc-bond-pool-partial-isolation — Bond Pool Partial Isolation no MC FIRE

**Status:** Done
**Concluído em:** 2026-04-29
**Dono:** Dev
**Derivada de:** FR-mc-bond-pool-isolation (2026-04-29)

---

## Problema

O `fire_montecarlo.py` implementava bond pool isolation binário: ativo somente quando
`ipca_longo_atual_brl >= 80%` do target (~R$416k). Com a posição atual em R$124k (~24% completo),
a isolation estava desligada e P(quality) usava proxy (vol=13.3%, guardrails ativos em todos os anos).

Isso é financeiramente incorreto: se o bucket cobre 24% do gasto, então 24% do gasto nos anos 0-6
vem do bucket (sem guardrail, vol=0) e 76% vem de equity (com guardrail).

---

## Solução

Isolation **gradual/proporcional**: se o bucket cobre fração `f` do target, então:

- `vol_ano = vol_equity * (1 - f)` nos anos 0-6 (vol reduz proporcionalmente)
- `gasto_from_bucket = f * gasto_lifestyle_target` (sem guardrail)
- `gasto_from_equity = WithdrawalEngine.calculate(remaining_target)` (com guardrail)
- `gasto_lifestyle = gasto_from_bucket + gasto_from_equity`

O campo `enabled` passa a ser `True` sempre que `completion_fraction > 0` (partial isolation ativo).
O campo `fully_enabled` é `True` somente quando `>= threshold` (80% do target).

---

## Arquivos Alterados

### `scripts/fire_montecarlo.py`
- `compute_bond_pool_status`: `enabled = completion_fraction > 0` (era binário pelo threshold)
- `PREMISSAS["bond_pool_completion_fraction"]` adicionado ao módulo-level
- `simular_trajetoria_com_trajeto`: parcial já implementado (propagação proporcional de vol + gasto)
- `simular_trajetoria`: idem
- `compute_p_quality`: corrigido para usar `vol * (1 - f)` em vez de `vol = 0.0` no pool phase;
  gasto proporcional (bucket + equity com guardrail)
- `rodar_monte_carlo`: propaga `bond_pool_completion_fraction` para `simular_trajetoria`
- `rodar_monte_carlo_com_trajetorias`: idem para `simular_trajetoria_com_trajeto`
- `main()`: exporta `bond_pool_fully_enabled` e `bond_pool_completion_fraction` para dashboard

### `scripts/generate_data.py`
- Seção fire: adiciona `bond_pool_fully_enabled` e `bond_pool_completion_fraction`

### `scripts/tests/test_bond_pool_isolation.py`
- `test_below_threshold_not_enabled`: removido assert `not enabled` (agora enabled=True se posição > 0);
  mantidos `underestimation_warning` e `not fully_enabled`
- `test_at_threshold_enabled` / `test_above_threshold_enabled`: verificam `fully_enabled`
- `test_current_state_not_enabled` → renomeado para `test_current_state_partial_isolation_active`:
  verifica `bond_pool_isolation=True` e `fully_enabled=False`
- Novo: `test_partial_isolation_between_proxy_and_full` — verifica que P(quality) partial
  está entre proxy (0%) e full (100%)

### `react-app/src/app/fire/page.tsx`
- Badge distingue 3 estados:
  - Verde (`fully_enabled`): "Bond pool completo — P(quality) real"
  - Amarelo (`enabled` mas não `fully_enabled`): "Bond pool XX% — partial isolation ativo"
  - Cinza (sem posição): "Bond pool 0% — P(quality) proxy"
- `bondPoolFullyEnabled` adicionado como variável separada

### `react-app/src/config/version.ts`
- v1.160.2 → v1.161.0

### `react-app/src/config/changelog.ts`
- Entrada para v1.161.0

---

## Resultado

Estado atual (24% completo):
- `enabled=True` (partial isolation ativo)
- `fully_enabled=False`
- `completion_fraction=0.24`
- vol nos anos 0-6: `0.168 * (1 - 0.24) = 12.77%` (antes: 13.3% proxy ou 0% se fully enabled)
- 24% do gasto lifestyle sem guardrail, 76% com guardrail

Testes: 18/18 passando (`test_bond_pool_isolation.py`)

---

## Impacto em P(quality)

P(quality) com partial isolation (f=0.24) fica entre proxy (f=0) e full (f=1.0):
- proxy ≤ partial ≤ full (verificado pelo novo teste)
- Delta esperado pequeno: ~1-2pp de melhora vs proxy (proporção à cobertura de 24%)
