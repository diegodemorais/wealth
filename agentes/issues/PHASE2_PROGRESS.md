# Phase 2 — SWREngine + GuardrailEngine (Weeks 3-4)

## Objective
Centralize Safe Withdrawal Rate (SWR) and spending guardrail calculations into guaranteed-invariant engines.

## Analysis Findings

### Current SWR Scattered Locations
1. **fire_montecarlo.py**:
   - SWR_FALLBACK = 0.035 (now in config, but logic scattered)
   - ctx.swr_inicial = SWR_FALLBACK or custo_vida_base / patrimonio_inicial
   - Used in withdrawal_pct_portfolio() and guyton_klinger()

2. **generate_data.py**:
   - compute_spending_guardrails(): derives guardrails from P(FIRE)
   - Uses SWR_GATILHO indirectly through zona calculation

3. **reconstruct_fire_data.py**:
   - gen_fire_swr_percentis(): calculates P10/P50/P90 SWR implicit in patrimonio

### Current Guardrails Scattered Locations
1. **fire_montecarlo.py**:
   - aplicar_guardrail(): applies cutoff based on drawdown
   - GUARDRAILS: [(dd_min, dd_max, corte, desc), ...]
   - withdrawal_guardrails(): uses guardrail for annual spending

2. **generate_data.py**:
   - compute_spending_guardrails(): derives zones based on P(FIRE)
   - Returns: zona, pfire_atual, upper/safe/lower guardrails

## Tasks

### 1️⃣ SWREngine Creation (Phase 2.1)
- [ ] Create `scripts/swr_engine.py`
  - SWRRequest: patrimonio_atual, custo_vida_base, swr_gatilho, swr_fallback
  - SWRResult: swr_atual, swr_status, pfire_atual, zona
  - SWREngine.calculate_current(): current SWR calculation
  - SWREngine.calculate_fire(): SWR at FIRE Day
  - SWREngine.calculate_status(): SWR vs threshold comparison
- [ ] Unit tests (8+ test cases)
  - Input validation
  - Current SWR calculation
  - FIRE SWR calculation
  - Status zones (verde/amarelo/vermelho)
  - Edge cases (zero patrimonio, missing custo_vida)

### 2️⃣ GuardrailEngine Creation (Phase 2.2)
- [ ] Create `scripts/guardrail_engine.py`
  - GuardrailRequest: pfire_base, spending_atual, guardrails_config
  - GuardrailResult: upper/safe/lower guardrails, zona, metadata
  - GuardrailEngine.calculate(): full guardrail calculation
  - GuardrailEngine.apply_drawdown_guardrail(): apply guardrail cutoff
- [ ] Unit tests (8+ test cases)
  - Input validation
  - Guardrail zone derivation
  - Drawdown-based cutoff
  - Edge cases

### 3️⃣ Refactor Data Pipeline (Phase 2.3)
- [ ] Update `scripts/fire_montecarlo.py`
  - Import SWREngine
  - Refactor withdrawal_pct_portfolio() to use SWREngine
  - Refactor applicable_guardrail() to use GuardrailEngine
- [ ] Update `scripts/generate_data.py`
  - Import SWREngine, GuardrailEngine
  - Refactor compute_spending_guardrails() to use GuardrailEngine
- [ ] Update `scripts/reconstruct_fire_data.py`
  - Import SWREngine
  - Refactor gen_fire_swr_percentis() to use SWREngine

### 4️⃣ Prohibition Tests (Phase 2.4)
- [ ] Create prohibition tests for SWREngine
  - No SWR calculation outside swr_engine.py
  - No inline custo_vida / patrimonio logic
  - All SWR results must use SWREngine
- [ ] Create prohibition tests for GuardrailEngine
  - No guardrail logic outside guardrail_engine.py
  - No hardcoded guardrail zones
  - All guardrail calculations must route through engine

## Success Criteria

- [ ] SWREngine.calculate() is single source of SWR truth
- [ ] GuardrailEngine.calculate() is single source of guardrail truth
- [ ] Unit tests passing (16+ tests)
- [ ] Prohibition tests passing (8+ tests)
- [ ] All consolidations committed to phase-2-swr-guardrails
- [ ] Ready for Phase 3 (WithdrawalEngine + FinalValidation)

## Estimated Effort
- 3-4 days (1 day SWR, 1 day Guardrail, 1-2 days testing + integration)

## Notes
- SWR engines support both current (pre-FIRE) and projection (FIRE Day) calculations
- Guardrail engine integrates with P(FIRE) thresholds from fire_montecarlo
- All engines follow guaranteed-invariant pattern (input/output validation)
- Phase 3 will consolidate WithdrawalEngine (all 6 strategies) and final validation
