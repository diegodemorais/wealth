# Phase 1 — Quick Wins (Weeks 1-2)

## Tasks

### 1️⃣ TaxEngine Consolidation
- [ ] Create `scripts/tax_engine.py` with `TaxEngine` class
- [ ] Input validation: `TaxRequest.__post_init__`
- [ ] Output validation: `TaxResult.__post_init__`
- [ ] Unit tests (8 test cases)
- [ ] Update `scripts/generate_data.py` to use `TaxEngine`
- [ ] Update `scripts/reconstruct_tax.py` to use `TaxEngine`
- [ ] Prohibition test: grep catches `compute_tax_diferido` outside tax_engine.py
- [ ] Commit and test

**Files to change:**
- Create: `scripts/tax_engine.py`
- Update: `scripts/generate_data.py` (line ~1592, replace `compute_tax_diferido` call)
- Update: `scripts/reconstruct_tax.py` (line ~202, replace function call)
- Create: `scripts/tests/test_tax_engine.py`

### 2️⃣ BondPoolEngine Consolidation
- [ ] Identify implementations in `reconstruct_fire_data.py` and `generate_data.py`
- [ ] Create `scripts/bond_pool_engine.py` with canonical implementation
- [ ] Input validation: `BondPoolRequest.__post_init__`
- [ ] Output validation: `BondPoolResult.__post_init__`
- [ ] Unit tests (6+ test cases, include profile-dependent)
- [ ] Update both source files to use `BondPoolEngine`
- [ ] Prohibition test: grep catches inline pool calculations
- [ ] Commit and test

### 3️⃣ SWR Constants Verification
- [ ] Verify `SWR_GATILHO = 0.030` in `config.py` (already present ✅)
- [ ] Search for hardcoded SWR fallbacks (0.03, 0.035, 0.04) in codebase
- [ ] Consolidate any scattered values to use `config.SWR_GATILHO`
- [ ] Add grep prohibition test to prevent inline SWR fallbacks
- [ ] Commit and test

**Estimated effort:** 5-7 days (1 day Tax, 1 day Bond, 2-3 days testing + integration)

## Success Criteria

- [x] All Q1-Q12 answered (Team)
- [ ] TaxEngine.calculate() is single source of tax truth
- [ ] BondPoolEngine.calculate() is single source of pool truth
- [ ] SWR_FALLBACK only in config.py
- [ ] Unit tests passing (20+ tests total)
- [ ] Prohibition tests passing
- [ ] All 3 consolidations committed to phase-1-quick-wins
- [ ] Ready for Phase 2 (SWREngine + GuardrailEngine) next week
