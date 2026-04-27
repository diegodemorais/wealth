# 🎯 DATA_PIPELINE_CENTRALIZATION — Data Snapshot Orchestration & Invariants

**Issue**: `agentes/issues/DATA_PIPELINE_CENTRALIZATION.md`  
**Dono**: Head (with Dev + Quant)  
**Status**: 🔄 Em progresso (Invariants 3+5 implementados, 1+2+4+6+7 pendentes)  
**Prioridade**: 🔴 Alta  
**Criado em**: 2026-04-26  
**Atualizado em**: 2026-04-27  
**Dependências**: CENTRALIZATION_COMPLETE (shares invariant pattern)  
**Paralelo com**: CENTRALIZATION_COMPLETE (Phase 5+)

## Decisões Head (2026-04-27)

| Q | Decisão | Racional |
|---|---------|----------|
| Q1 Frequência | D — Hybrid (quick hourly, MC semanal) | CLI por enquanto; sem scheduler |
| Q2 Fire trigger | B — Time-based 24h cache + `--force-regen` flag | Simpler is better |
| Q3 Schema | B — Additive only | Sem breaking changes |
| Q4 CLI vs scheduling | A — CLI only | Sem backend disponível |
| Q5 React | A — Static | Sem backend API |
| Q6 Testing | Integration + snapshot validation | CI catches schema breaks |
| Q7 Scope | A — Core only (metadata + validation) | 2-3 semanas |
| Q8 Parallel | Standalone | Sem dependência de CENTRALIZATION_COMPLETE |
| Q9 Risk | A — Non-invasive | Apenas metadata; sem lógica changes |

## Implementado (2026-04-27)

- ✅ **Invariant 3 (Rastreabilidade)**: `_pipeline_run` UUID + `_snapshots_metadata` em data.json
  - Cada snapshot mostra: `{file, mtime, age_h, _generated}`
  - Warn automático quando snapshot >48h antigo
- ✅ **Invariant 5 (Output Validation)**: `_validate_ssot_basic()` ao final de `main()`
  - Checks: `pfire_base.source`, snapshot staleness, patrimônio holístico > 0, timestamps keys

## Pendente

- [ ] Invariant 1 (Sync): `_window_id` em reconstruct_*.py scripts — requer tocar cada script
- [ ] Invariant 2 (Dep ordering): PIPELINE_PHASES DAG — informativo, não enforcement
- [ ] Invariant 4 (Input validation): `SnapshotValidator.validate_snapshot()` com fail-fast
- [ ] Invariant 6 (Prohibition tests): grep-based QA — complexo, muitas exceções a whitelist
- [ ] Invariant 7 (Archive): 7-day rollback — nice-to-have, baixa prioridade

---

## 🎯 Objetivo

Centralize and guarantee consistency of data pipeline (Phase 1-2 snapshot generation and aggregation) using **guaranteed invariants** pattern from P(FIRE) centralization.

**Current Problem:**
```
Phase 1 (Parallel, unsynchronized):
  - reconstruct_macro.py → macro_snapshot.json (PTAX, Selic, IPCA Focus)
  - reconstruct_factor.py → factor_snapshot.json (FF5+MOM regressions)
  - reconstruct_tax.py → tax_snapshot.json (IR diferido calculations)
  - reconstruct_history.py → historico_carteira.csv (TWR pipeline)
  - reconstruct_fire_data.py → 7 snapshots (MC, guardrails, bond pool, etc)
  ❌ No dependency ordering, no timestamp sync, no version tracking

Phase 2 (Sequential aggregation):
  - generate_data.py reads all 11+ snapshots with fallback to cache
  ❌ Graceful degradation masks staleness
  ❌ Silent failures if snapshot not regenerated
  ❌ No guarantee all inputs are from same generation window
  
Distribution (Symlinks, correct):
  - dash/data.json → react-app/public/data.json (SSOT)
  - dashboard/data.json → react-app/public/data.json (SSOT)
  ✅ Symlinks prevent duplication (false alarm on "confusion")
  ❌ But no guarantee SSOT data is internally consistent
```

**Solution: DataPipelineEngine**

Centralize pipeline orchestration with:
1. **Synchronization Guarantee** — All snapshots from same generation window
2. **Explicit Dependency Ordering** — Define exact execution sequence
3. **Rastreability** — Each snapshot embeds `_generated` timestamp + schema version
4. **Input Validation** — Fail fast if snapshot missing/invalid
5. **Output Validation** — Verify SSOT completeness and cross-field consistency
6. **Prohibition Tests** — Grep QA prevents snapshot use outside DataPipelineEngine
7. **Cleanup Policy** — Archive old snapshots, maintain rollback capability

---

## 📊 Current Pipeline Architecture

### Phase 1: Parallel Snapshot Generation (Independent)

```
reconstruct_macro.py (5 min)
  → dados/macro_snapshot.json
  → {ptax, selic, ipca, focus_inflation, generated}

reconstruct_factor.py (10 min)
  → dados/factor_snapshot.json
  → {ff5_monthly, mom_monthly, generated}

reconstruct_tax.py (2 min)
  → dados/tax_snapshot.json
  → {ir_diferido_total, ir_by_etf, generated}

reconstruct_history.py (3 min)
  → dados/historico_carteira.csv
  → {monthly_twr, dates, generated}

reconstruct_fire_data.py (60+ min, expensive Monte Carlo)
  → dados/fire_matrix.json
  → dados/fire_trilha.json
  → dados/drawdown_history.json
  → dados/bond_pool_runway.json
  → dados/etf_composition.json
  → dados/lumpy_events.json
  → {all with _generated timestamp}
```

**Problem**: No ordering, no sync window, no guarantee of temporal coherence.

### Phase 2: Sequential Aggregation (Single Orchestrator)

```
generate_data.py reads:
  - config.py (constants)
  - dashboard_state.json (live positions, PTAX)
  - holdings.md (bond yields)
  - historico_carteira.csv (historical TWR)
  - All 11 snapshots (with fallback to cache if missing)

Computes:
  - Derived metrics (portfolio composition, risk)
  - Optional: Full MC run (if missing or stale)
  - Tax computations (realized + deferred)
  - Guardrail bands
  - Withdrawal scenarios

Outputs:
  → react-app/public/data.json (SINGLE SOURCE OF TRUTH)
     {60+ top-level fields, _generated timestamp at root}
```

**Problem**: 
- Only root-level `_generated` tracked; individual snapshot times unknown
- Fallback to cache masks when snapshots became stale
- No guarantee macro + factor + tax snapshots are temporally aligned
- No version control for snapshot schemas

### Distribution Layer (Correct)

```
✅ dash/data.json → react-app/public/data.json (symlink)
✅ dashboard/data.json → react-app/public/data.json (symlink)
✅ react-app/public/data/data.json → ../data.json (symlink)

Note: NOT duplication. All are symlinks to SINGLE FILE.
Confusion was false alarm — no 2 different data.json files exist.
```

---

## 🏗️ Proposed Solution: Guaranteed Invariants Pattern

### Invariant 1: Synchronization Guarantee

**Requirement**: All snapshots in one data.json MUST be from same generation window.

```python
# DataPipelineEngine orchestrates phases in this order:

class DataPipelineEngine:
    @staticmethod
    def run_full_pipeline(regenerate_all=False):
        """Guaranteed sync: all snapshots from same window"""
        
        start_time = datetime.now()
        window_id = start_time.isoformat()  # e.g., "2026-04-26T22:30:45.123456"
        
        # Phase 1A: Independent snapshots (run in parallel if needed, all tagged with same window)
        macro = reconstruct_macro.run(window_id=window_id)  # → _generated, _window_id
        factor = reconstruct_factor.run(window_id=window_id)  # → _generated, _window_id
        tax = reconstruct_tax.run(window_id=window_id)  # → _generated, _window_id
        history = reconstruct_history.run(window_id=window_id)  # → _generated, _window_id
        
        # Phase 1B: Expensive simulation (only if regenerate_all or cached >24h)
        fire_data = reconstruct_fire_data.run(window_id=window_id)  # → 7 files, all with _window_id
        
        # Phase 2: Aggregation with synchronized inputs
        ssot = generate_data.run(
            macro=macro,
            factor=factor,
            tax=tax,
            history=history,
            fire_data=fire_data,
            window_id=window_id  # ← Guarantee: all inputs from SAME window
        )
        
        # Result invariant: data.json["_window_id"] == window_id
        return ssot
```

**Enforcement**: 
```python
# test_data_pipeline_synchronization.py
def test_synchronization_invariant():
    """CI blocks merge if snapshots diverge"""
    data = load_data_json()
    window = data['_window_id']
    
    # All snapshots must have matching window_id
    assert data['macro_snapshot']['_window_id'] == window
    assert data['factor_snapshot']['_window_id'] == window
    assert data['tax_snapshot']['_window_id'] == window
    # ... etc for all 11 snapshots
```

---

### Invariant 2: Explicit Dependency Ordering

**Requirement**: Define exact execution sequence to prevent deadlocks and ordering bugs.

```python
# Dependency DAG (explicit)
PIPELINE_PHASES = {
    "phase_1_independent": {
        "macro": {"duration_min": 5, "deps": ["config.py", "market data"]},
        "factor": {"duration_min": 10, "deps": ["config.py", "yfinance"]},
        "tax": {"duration_min": 2, "deps": ["config.py", "holdings.md"]},
        "history": {"duration_min": 3, "deps": ["config.py", "IBKR data"]},
    },
    "phase_1_conditional": {
        "fire_data": {
            "duration_min": 60,
            "deps": ["macro", "tax", "history"],
            "regenerate_if": ["missing", "stale_>24h", "force_regenerate"],
        },
    },
    "phase_2_aggregation": {
        "generate_data": {
            "duration_min": 5,
            "deps": ["macro", "factor", "tax", "history", "fire_data", "dashboard_state.json"],
            "output": "react-app/public/data.json",
        },
    },
}
```

**Guarantee**: 
- Cannot run Phase 2 without Phase 1 complete
- fire_data only regenerates if explicitly needed
- All dependencies documented in code
- CI validates DAG consistency

---

### Invariant 3: Rastreability (Version Control)

**Requirement**: Each snapshot embeds generation info for audit trail.

```python
# Each snapshot follows this schema:

macro_snapshot = {
    "_schema_version": "1.0",  # Bump if format changes
    "_generated": "2026-04-26T22:30:45.123456Z",  # ISO 8601
    "_window_id": "2026-04-26T22:30:45.123456",  # Links to parent pipeline
    "_source": {  # Audit trail
        "script": "reconstruct_macro.py:line-number",
        "data_version": "PTAX-2026-04-26, Selic decision 2026-04-24",
        "cache_used": False,  # Did we load from cache or regenerate?
    },
    # ... rest of data
}
```

**Guarantee**: User can ask "Where did this number come from?" → answer in `_source`.

---

### Invariant 4: Input Validation (Fail Fast)

**Requirement**: Detect missing/stale snapshots immediately.

```python
class SnapshotValidator:
    @staticmethod
    def validate_snapshot(name: str, data: dict, max_age_hours: int = 24):
        """Fail fast if snapshot missing/invalid/stale"""
        
        # Check required fields
        assert "_generated" in data, f"{name} missing _generated timestamp"
        assert "_schema_version" in data, f"{name} missing schema version"
        
        # Check freshness
        generated = datetime.fromisoformat(data["_generated"])
        age_hours = (datetime.now() - generated).total_seconds() / 3600
        if age_hours > max_age_hours:
            raise StaleSnapshotError(
                f"{name} is {age_hours:.1f}h old, max {max_age_hours}h. "
                f"Run: python scripts/reconstruct_{name}.py"
            )
        
        # Check schema version compatibility
        expected = EXPECTED_SCHEMAS[name]
        if data["_schema_version"] != expected:
            raise SchemaVersionError(
                f"{name} schema {data['_schema_version']} != expected {expected}"
            )
```

**Guarantee**: No silent fallback to stale data — exception forces explicit regeneration.

---

### Invariant 5: Output Validation (SSOT Consistency)

**Requirement**: Verify `data.json` internally consistent after aggregation.

```python
class DataJsonValidator:
    @staticmethod
    def validate_ssot(data: dict):
        """Guarantee SSOT is complete and consistent"""
        
        # Invariant 1: All required top-level fields present
        required = ['_generated', '_window_id', 'patrimonio', 'posicoes', 'pfire_base', 
                    'macro_snapshot', 'factor_snapshot', 'tax_snapshot', ...]
        for field in required:
            assert field in data, f"Missing critical field: {field}"
        
        # Invariant 2: Cross-field consistency
        total_patrimonio = sum(pos['valor'] for pos in data['posicoes'])
        assert abs(total_patrimonio - data['patrimonio']['total']) < 1, \
            f"Patrimonio mismatch: sum={total_patrimonio}, root={data['patrimonio']['total']}"
        
        # Invariant 3: P(FIRE) is from canonical source
        assert data['pfire_base']['source'] in ['mc', 'heuristic', 'fallback'], \
            f"Unknown P(FIRE) source: {data['pfire_base']['source']}"
        
        # Invariant 4: All snapshots have matching window_id
        assert data['macro_snapshot']['_window_id'] == data['_window_id']
        assert data['factor_snapshot']['_window_id'] == data['_window_id']
        # ... etc
        
        # Invariant 5: No NaN, Inf, or invalid numbers
        import math
        def check_finite(obj, path=""):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    check_finite(v, f"{path}.{k}")
            elif isinstance(obj, list):
                for i, v in enumerate(obj):
                    check_finite(v, f"{path}[{i}]")
            elif isinstance(obj, float):
                assert math.isfinite(obj), f"Non-finite number at {path}: {obj}"
        
        check_finite(data)
```

**Guarantee**: data.json is mathematically sound, not just parseable JSON.

---

### Invariant 6: Prohibition Tests (Grep-Based QA)

**Requirement**: Impossible to use snapshots outside DataPipelineEngine.

```bash
# test_data_pipeline_prohibitions.py
# CI fails if finds these patterns:

❌ grep: "load.*macro_snapshot" (outside DataPipelineEngine)
❌ grep: "json.load.*factor_snapshot" (outside aggregation)
❌ grep: "fire_matrix\[" inline (outside fire_data module)
❌ grep: "import.*reconstruct_macro" in React files
❌ grep: "import.*reconstruct_" in production code (only in __main__)

# If violations found:
pytest scripts/tests/test_data_pipeline_prohibitions.py
→ FAIL: "Found 2 direct snapshot loads outside DataPipelineEngine"
→ CI blocks merge
```

**Enforcement**:
```python
def test_no_direct_snapshot_usage():
    """Prohibit loading snapshots outside DataPipelineEngine"""
    
    # Find all .py files except DataPipelineEngine
    violations = subprocess.run(
        ['grep', '-r', '--include=*.py', 
         'json.load.*macro_snapshot\|load.*factor_snapshot\|import reconstruct_',
         'scripts/', 'react-app/'],
        capture_output=True
    ).stdout.decode().split('\n')
    
    # Filter exceptions
    violations = [
        v for v in violations
        if 'data_pipeline_engine.py' not in v  # Engine itself exempt
        and '__main__' not in v  # CLI entry point exempt
        and '# pragma: no-cover' not in v
    ]
    
    assert len(violations) == 0, \
        f"Snapshots loaded outside DataPipelineEngine:\n" + '\n'.join(violations)
```

---

### Invariant 7: Cleanup Policy (Rollback Safety)

**Requirement**: Archive old snapshots, maintain 7-day rollback window.

```python
class SnapshotArchive:
    ARCHIVE_DIR = "dados/archive"
    RETENTION_DAYS = 7
    
    @staticmethod
    def archive_old_snapshots(dry_run=False):
        """Move snapshots older than RETENTION_DAYS to archive/"""
        
        cutoff = datetime.now() - timedelta(days=RETENTION_DAYS)
        
        for snapshot_file in glob.glob("dados/*.json"):
            if not os.path.exists(snapshot_file):
                continue
                
            generated = load_json(snapshot_file).get('_generated')
            if not generated:
                continue
            
            gen_time = datetime.fromisoformat(generated)
            if gen_time < cutoff:
                archive_path = f"{SnapshotArchive.ARCHIVE_DIR}/{gen_time.date()}/{Path(snapshot_file).name}"
                os.makedirs(os.path.dirname(archive_path), exist_ok=True)
                
                if dry_run:
                    print(f"Would archive: {snapshot_file} → {archive_path}")
                else:
                    shutil.move(snapshot_file, archive_path)
                    print(f"Archived: {snapshot_file}")

    @staticmethod
    def rollback_to_date(target_date: str):
        """Restore snapshots from archive (e.g., 'rollback_to_date("2026-04-19")')"""
        archive_path = f"{SnapshotArchive.ARCHIVE_DIR}/{target_date}"
        if not os.path.exists(archive_path):
            raise FileNotFoundError(f"No archive for {target_date}")
        
        for snapshot in glob.glob(f"{archive_path}/*.json"):
            dest = f"dados/{Path(snapshot).name}"
            shutil.copy(snapshot, dest)
            print(f"Restored: {dest}")
```

**Guarantee**: Can rollback to clean state if current pipeline poisoned.

---

## ❓ CRITICAL TEAM QUESTIONS

### 🔵 For QUANT (Math/Semantics)

#### Q1: Snapshot Regeneration Frequency
```
Currently: Each snapshot regenerates independently on demand, no schedule.
Impact: Some snapshots stale (24h+), others fresh (1h), creating misalignment.

CHOOSE ONE:

□ A) All-or-nothing — Regenerate all 11 snapshots together every run
    Pro: Guaranteed sync, simpler semantics
    Con: Slower (waits for slowest, MC 60min)

□ B) Scheduled — Fire/macro/tax regenerate hourly, history/factors daily, MC weekly
    Pro: Balances freshness and cost
    Con: Complex scheduling, still potential misalignment

□ C) On-demand with cache — Current approach, smart cache invalidation
    Pro: Fastest, minimal CPU
    Con: Staleness hard to detect, can diverge

□ D) Hybrid — Quick snapshots (macro/tax/history) every 1h, expensive (fire/factor) weekly
    Pro: Good balance
    Con: Two-tier complexity
```

#### Q2: Fire Data Regeneration Trigger
```
Currently: reconstruct_fire_data.py (Monte Carlo) only runs if stale >24h or explicit flag.
Impact: Expensive to run (60+ min), wasteful if markets unchanged.

CHOOSE ONE (or multiple):

□ A) Always regenerate — Every pipeline run includes full MC
    Risk: 60 min per run, only run 1x/day
    Benefit: Always fresh

□ B) Time-based (current) — 24h cache, explicit regenerate flag
    Risk: Stale data if market moves but hasn't hit 24h
    Benefit: Fast, low CPU

□ C) Market-based trigger — Regenerate if PTAX changed >2%, Selic decision fired, etc
    Risk: Complex logic, edge cases
    Benefit: Responsive to actual market changes

□ D) User-controlled — Default cached, frontend "Refresh" button for on-demand
    Risk: User confusion on staleness
    Benefit: User agency
```

#### Q3: Snapshot Schema Evolution
```
Currently: No schema versioning. If we add field, old snapshots fail.
Impact: Can't gradually migrate, must regenerate everything.

CHOOSE ONE:

□ A) Strict schema — All snapshots MUST match current schema exactly
    Pro: No silent data loss
    Con: Can't evolve without regenerating all

□ B) Additive only — Can add new fields, remove never (backward compatible)
    Pro: Can evolve gradually
    Con: Dead fields accumulate

□ C) Versioned — Each snapshot declares _schema_version, upgrade on load
    Pro: Can support multiple versions
    Con: More complex

□ D) No strict schema — Load whatever's there, add fallbacks
    Pro: Most flexible
    Con: Risk of missing data going unnoticed
```

---

### 🟢 For DEV (Architecture/Implementation)

#### Q4: CLI vs Background Scheduling
```
Currently: Scripts called manually via CLI (python reconstruct_*.py).
Impact: No automated refresh, dashboard may show stale data.

CHOOSE ONE:

□ A) CLI only — Keep manual. Operator runs python generate_data.py on demand
    Pro: Simple, clear control
    Con: Risk of manual error, easy to forget

□ B) APScheduler background — Run pipelines on schedule in background daemon
    Pro: Automated, consistent
    Con: Requires process management, harder to debug

□ C) Cron jobs — Use system cron to trigger pipelines hourly/daily
    Pro: Standard, OS-managed
    Con: Less flexible, harder to monitor

□ D) Cloud scheduler (AWS/GCP) — External service manages timing
    Pro: Scales, reliable
    Con: Adds external dependency
```

#### Q5: React Snapshot Consumption
```
Currently: React reads react-app/public/data.json as static file on build.
Impact: Dashboards show snapshot from build time, not current state.

QUESTION: Should React fetch data dynamically instead?

□ A) Keep static — Build includes data.json snapshot, serves from CDN
    Pro: Fast, no runtime dependency
    Con: Data stale until rebuild

□ B) Dynamic fetch — React fetches data.json at runtime from server
    Pro: Always fresh
    Con: Slower load, requires backend API

□ C) Hybrid — Static fallback (for offline), fetch on demand if available
    Pro: Best of both
    Con: More complex state management

□ D) Add refresh endpoint — GET /api/data/refresh triggers full pipeline
    Pro: On-demand freshness
    Con: Blocks user if MC takes 60 min
```

#### Q6: Testing Strategy
```
Currently: No tests for pipeline orchestration, only individual scripts.
Impact: Easy to break pipeline without knowing (e.g., rename snapshot file).

QUESTIONS:

1. How to test Phase 1 (parallel scripts)?
   □ Unit tests for each script alone
   □ Integration tests orchestrating all together
   □ Both

2. How to test Phase 2 (aggregation)?
   □ Snapshot validation + SSOT validation
   □ End-to-end (synthetic data → SSOT)
   □ Both

3. Regression testing for data.json schema?
   □ Jest snapshot tests (keep last 10 versions)
   □ JSON Schema validation (DTOs)
   □ Both

4. What makes a pipeline run "successful"?
   □ All snapshots have matching _window_id
   □ SSOT passes all validators
   □ React builds without errors
   □ Dashboard loads without console errors
   □ All of the above
```

---

### 💜 For HEAD (Strategic)

#### Q7: Scope & Timeline
```
CORE (must include, 2-3 weeks):
- DataPipelineEngine orchestration
- Snapshot versioning (_window_id, _schema_version)
- Input/output validation
- Prohibition tests
- 7-day archive + rollback

OPTIONAL (nice-to-have, +1 week):
- Dynamic React fetch (B from Q5)
- APScheduler background runner (B from Q4)
- Advanced market-triggered regeneration (C from Q2)

DECISION:

□ A) Core only (2-3 weeks, essential)
□ B) Core + React dynamic (3-4 weeks)
□ C) Core + scheduling + React (4-5 weeks, full automation)
□ D) All (5+ weeks, overscoped)
```

#### Q8: Parallel vs Sequential with CENTRALIZATION_COMPLETE
```
CENTRALIZATION_COMPLETE focuses on: TaxEngine, BondPoolEngine, SWREngine, GuardrailEngine, WithdrawalEngine
This issue focuses on: Data pipeline orchestration

Can we run them in parallel?

□ A) Sequential — Finish CENTRALIZATION_COMPLETE first (8 weeks), then DATA_PIPELINE (3 weeks)
    Pro: Team focused, low distraction
    Con: Slow, late benefit

□ B) Parallel — 2 devs on core engines, 1 dev on pipeline (simultaneous 8 weeks)
    Pro: Faster overall
    Con: Higher coordination overhead, shared codebase edits

□ C) Phased — Phase 1 (Tax+Bond engines, 2 weeks) + Phase 2 (SWR+Guardrails+Pipeline, 4 weeks)
    Pro: Early momentum, incremental delivery
    Con: Context switching, rework risk
```

#### Q9: Risk Tolerance on Snapshot Changes
```
DECISION: How aggressively to modify snapshot generation?

□ A) Non-invasive — Add _window_id/_schema_version fields, no logic changes
    Risk: Low (only metadata)
    Timeline: 1-2 weeks

□ B) Moderate — Refactor reconstruct_*.py to follow DataPipelineEngine API
    Risk: Medium (may break scripts)
    Timeline: 3-4 weeks

□ C) Aggressive — Rewrite all scripts to follow strict pattern, enforce validation
    Risk: High (large refactor)
    Timeline: 5+ weeks

Choose based on: Confidence in test coverage of snapshot generation?
```

---

## 🔄 How to Respond

### Option 1: Async (Write answers in markdown)
Reply with answers in this format:
```
## Q1: Snapshot Regeneration Frequency
☑ D) Hybrid — Quick snapshots hourly, expensive weekly

## Q2: Fire Data Regeneration Trigger
☑ C) Market-based trigger

[etc...]
```

### Option 2: Sync (1-hour meeting)
Schedule 1 hour with Quant, Dev, Head:
- 10 min: Quant questions (Q1-Q3)
- 10 min: Dev questions (Q4-Q6)
- 15 min: Head decisions (Q7-Q9)
- 25 min: Debate / tradeoffs

---

## 📋 What Happens After

Once answers received:

1. **Head synthesizes decisions** → Create implementation plan
2. **Dev creates sub-issues** → One per phase (Phase1Metadata, Phase2Validation, Prohibition, Archive, etc)
3. **Phase 1: Metadata (Week 1)** → Add _window_id, _schema_version to all snapshots
4. **Phase 2: Validation (Week 2)** → Implement validators, prohibition tests
5. **Phase 3: Orchestration (Week 3)** → Build DataPipelineEngine, integrate with generate_data.py
6. **Phase 4+: Optionals** → Scheduling, React dynamic fetch (if approved)

---

## ✅ Preview: What Centralization Solves

### Current State (Before):
```
Snapshots scattered across 5 scripts, no sync guarantee:
  - reconstruct_macro.py runs 1h ago
  - reconstruct_fire_data.py cached 24h ago
  - reconstruct_tax.py just ran
  → SSOT data.json has MIXED timestamps
  → User sees "2026-04-26T22:30 Macro, 2026-04-25T18:00 Fire, 2026-04-26T22:45 Tax"
  → Risk: Inconsistent portfolio state (fire plan based on old wealth!)

No cleanup:
  - dados/ accumulates old snapshots
  - No version control
  - Can't rollback if corrupted
  - Hard to debug "which data was used?"

No coordination with SSOT:
  - data.json doesn't know which snapshots it used
  - Operator confused: "Is this data fresh?"
  - No audit trail for compliance
```

### After Centralization (with Invariants):
```
✅ DataPipelineEngine orchestrates all snapshots
   All snapshots in one data.json have same _window_id
   Impossible to have misaligned timestamps

✅ Mandatory versioning
   Each snapshot embeds _generated, _schema_version, _source
   User can ask "where did this number come from?"

✅ Validation gates
   Input validation: fail fast if snapshot missing
   Output validation: SSOT internally consistent
   CI blocks merge if validators fail

✅ Prohibition tests
   Can't load snapshots directly — must use DataPipelineEngine
   Grep tests prevent accidental bypass

✅ Rollback safety
   7-day archive maintains clean snapshots
   "rollback_to_date('2026-04-19')" restores known-good state
   Operators have confidence in data integrity

✅ GUARANTEED: Impossible to have stale/divergent data
   Not testable: ARCHITECTURALLY PREVENTED
   Not bypassable: CENTRALIZED through single engine
```

---

## 📅 Timeline & Deadline

**Discuss by**: End of week (Fri EOD 2026-04-26)  
**Decision window**: Mon-Tue 2026-04-28-29  
**Start implementation**: Wed 2026-04-30 (if approved)  
**Estimated completion**: 2026-05-17 (for core) to 2026-05-24 (if optionals included)

Runs in parallel with CENTRALIZATION_COMPLETE phases 5+ (coordination point: both use same invariant pattern).

---

**Reference**: 
- `GUARANTEED_INVARIANTS.md` — Pattern template
- `CENTRALIZATION_COMPLETE.md` — Parallel issue (core calculation engines)
- `CENTRALIZATION_PRIORITY_TRIAGE.md` — Context on what needs centralizing
