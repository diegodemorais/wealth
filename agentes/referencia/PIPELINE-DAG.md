# Data Pipeline DAG (Directed Acyclic Graph)

## Overview

Data pipeline execution defined as an explicit DAG with dependencies, caching policies, and fallback behavior.

## Visual DAG

```
┌─────────────────────────────────────────────────────────────┐
│  Pipeline Window (ID: 2026-04-26T22:30:45Z)               │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌──────────────┐   ┌───────────────┐
            │              │   │               │
      Phase 1A (Quick)    Phase 1B (Expensive)
            │              │   │               │
            │              │   │               │
        ┌───┴────┬─────────┴┐  │               │
        │        │          │  │               │
    ┌───────┐┌──────┐┌─────────┐┌──────────────────┐
    │Macro  ││Factor││History  ││Fire Simulations  │
    │5min   ││10min ││3min     ││60+ min (expensive)
    │       ││      ││         ││                  │
    │PTAX   ││FF5   ││TWR      ││P(FIRE), Guardrails
    │Selic  ││MOM   ││Monthly  ││Bond Pool, Lumpy
    │IPCA   ││LOAD  ││Returns  ││                  │
    │Focus  ││      ││         ││                  │
    └───┬───┘└──┬───┘└────┬────┘└────┬─────────────┘
        │       │         │          │
        └───────┴─────────┴──────────┘
                    │
            All snapshots with
          _window_id == pipeline_id
                    │
            ┌───────┴────────┐
            │                │
        Phase 2: Aggregation (generate_data.py)
            │                │
        ┌──────────────────────────┐
        │ Compute derived metrics  │
        │ - Portfolio composition  │
        │ - Risk metrics           │
        │ - Tax computations       │
        │ - Guardrail bands        │
        │ - Withdrawal scenarios   │
        └───────────┬──────────────┘
                    │
                data.json (SSOT)
                    │
        ┌───────────┴────────────┐
        │                        │
    Phase 3: Validation       Phase 4: Distribution
        │                        │
    SSOT Checks             Symlinks to
    - Structure             react-app/public/
    - Consistency           - data.json (main)
    - Freshness             - data/data.json
    - No NaN/Inf
```

## Phases

### Phase 1A: Quick Snapshots (Parallel, ~20 min total)

Run **in parallel** if possible:

| Snapshot | Duration | Dependencies | Cached? | Fallback |
|----------|----------|--------------|---------|----------|
| `macro_snapshot.json` | 5 min | Market APIs (BCB) | 24h TTL | Last cached + warning |
| `factor_snapshot.json` | 10 min | yfinance, FF5 monthly | 24h TTL | Historical average |
| `tax_snapshot.json` | 2 min | Holdings, brokerage | 24h TTL | Last cached |
| `historico_carteira.csv` | 3 min | IBKR, broker history | 7d TTL | Partial history OK |

**Launch Condition**: All quick snapshots begin after window_id created

**Completion Condition**: All 4 finish before Phase 2

### Phase 1B: Expensive Snapshots (Sequential, 60+ min)

Runs **only if**:
- `regenerate_all=True`, OR
- Previous fire snapshot > 24h old, OR
- User explicitly requests with `--regenerate`

| Snapshot | Duration | Dependencies | Cached? |
|----------|----------|--------------|---------|
| `fire_matrix.json` | 30 min | Monte Carlo (fire_montecarlo.py) | 24h TTL |
| `fire_trilha.json` | Part of MC | Trajectory data | Linked to fire_matrix |
| `drawdown_history.json` | Part of MC | Drawdown stats | Linked to fire_matrix |
| `bond_pool_runway.json` | Part of MC | Bond pool projections | Linked to fire_matrix |
| `etf_composition.json` | 2 min | ETF holdings APIs | 7d TTL |
| `lumpy_events.json` | 2 min | Config (static) | N/A |

**Parallel Blocks**:
- `fire_matrix.json + trilha + drawdown + bond_pool` = 30 min (1 MC run generates all)
- `etf_composition.json` = 2 min (parallel with MC)
- `lumpy_events.json` = 2 min (depends on config only, always fresh)

**Skip Condition**: If `--only-quick` flag, skip entire Phase 1B

### Phase 2: Aggregation (Sequential, 5 min)

**Inputs**: All snapshots from Phase 1A + 1B (if run)

**Process**:
1. Load all 11 snapshots
2. Validate window_id consistency
3. Compute derived metrics:
   - Portfolio composition (% by asset class)
   - Risk metrics (volatility, Sharpe, etc)
   - Tax computations (IR diferido, DARF)
   - Guardrail bands (normal/caution/crisis)
   - Withdrawal scenarios (base/aspirational/stress)
4. Build data.json with all computed fields
5. Embed root-level `_generated` and `_window_id`

**Fallback**: If any snapshot missing
- Macro: Use PTAX from dashboard_state.json if missing
- Factor: Use historical 3-factor model if missing
- Tax: Use previous tax snapshot if missing
- Fire: Can regenerate if missing (expensive, but not optional)

### Phase 3: Validation (Sequential, 2 min)

**Checks**:
1. **Structure**: All required root fields in data.json
2. **Consistency**: 
   - posicoes sum ~= patrimonio total (within 5%)
   - P(FIRE) in range [0-1] or [0-100]
   - All dates are valid
3. **Freshness**: `_generated` within last 24h
4. **Finiteness**: No NaN/Inf in numeric fields

**Failure Behavior**:
- If validation fails: Exception, human investigation
- CI blocks merge if validation fails
- No silent degradation

### Phase 4: Distribution (Sequential, <1 min)

**Outputs**:
- `react-app/public/data.json` ← SSOT
- `dash/data.json` → `react-app/public/data.json` (symlink)
- `dashboard/data.json` → `react-app/public/data.json` (symlink)

**Symlinks Guarantee**: Single source of truth, no duplication

## Dependency Ordering (Critical)

### Must Complete Before Phase 2

```
Phase 1A (macro, factor, tax, history) → Phase 2
                    ↓
              Both required
                    ↓
           Phase 2 can start
```

### Must Complete Before Phase 3

```
Phase 2 (aggregation) → Phase 3 (validation)
```

### Can Skip (If Not Regenerating)

```
Phase 1B (fire simulations) - skipped if --only-quick
Phase 2 uses cached fire_matrix.json if available
```

## Caching Policy

### Time-Based (TTL)

| Snapshot | TTL | Rationale |
|----------|-----|-----------|
| macro_snapshot | 24h | Market moves daily |
| factor_snapshot | 24h | Factors update monthly |
| tax_snapshot | 24h | Tax status rarely changes |
| historico_carteira | 7d | Monthly data release |
| fire_matrix | 24h | Expensive, markets change daily |
| etf_composition | 7d | Holdings change monthly |
| lumpy_events | ∞ | Static config |

### Forced Regeneration Triggers

```python
# Regenerate if any:
- --regenerate-all flag
- Age > TTL
- Selic decision (new macro)
- Market shock (> 5% single-day move)
- User explicitly requests
```

### Cache Location

```
dados/
├── macro_snapshot.json (cached)
├── factor_snapshot.json (cached)
├── tax_snapshot.json (cached)
├── historico_carteira.csv (cached)
├── fire_matrix.json (cached, 60min regeneration)
├── fire_trilha.json (linked)
├── drawdown_history.json (linked)
├── bond_pool_runway.json (linked)
├── etf_composition.json (cached)
├── lumpy_events.json (static)
└── archive/
    ├── 2026-04-26/
    │   ├── macro_snapshot.json
    │   ├── fire_matrix.json
    │   └── ...
    ├── 2026-04-25/
    └── ...
```

## Window ID Flow

**Created at pipeline start**:
```
window_id = "2026-04-26T22:30:45Z"  # ISO timestamp
```

**Propagated to all snapshots**:
```
Phase 1A:
  macro_snapshot → _window_id: "2026-04-26T22:30:45Z"
  factor_snapshot → _window_id: "2026-04-26T22:30:45Z"
  tax_snapshot → _window_id: "2026-04-26T22:30:45Z"
  historico_carteira → _window_id: "2026-04-26T22:30:45Z"

Phase 1B:
  fire_matrix.json → _window_id: "2026-04-26T22:30:45Z"
  (all fire snapshots linked)

Phase 2:
  Validates: all snapshots have matching _window_id
  
Phase 3:
  data.json root → _window_id: "2026-04-26T22:30:45Z"
```

**Invariant**: All snapshots in one data.json have **identical** `_window_id`

Violation = architecture error (should never happen with DataPipelineEngine)

## Error Handling

### Missing Snapshot

```
Load Phase 2:
  If macro_snapshot missing:
    ✗ Check cache → stale, fail
    ✓ Use PTAX from dashboard_state.json (fallback)
    ✗ No fallback available → exception
```

### Stale Snapshot

```
Load Phase 2:
  If factor_snapshot age > 24h:
    ✗ Use cached historical average (fallback)
    ✓ Log warning: "Factor snapshot stale"
    ✓ CI warning (but doesn't block)
```

### Invalid Snapshot

```
Load Phase 2:
  If fire_matrix schema version mismatch:
    ✗ Fail immediately
    ✓ Reason: cannot merge incompatible versions
    ✓ Action: regenerate with --regenerate-all
```

### Validation Failure

```
Phase 3:
  If posicoes sum != patrimonio total:
    ✗ Fail immediately
    ✓ Reason: data integrity issue
    ✓ Action: investigate, fix input data
```

## Rollback Procedure

If data.json corrupted or contains bad data:

```bash
# List available archives
python scripts/snapshot_archive.py list

# Restore previous state
python scripts/snapshot_archive.py restore --date 2026-04-25

# Re-run pipeline
python scripts/data_pipeline_engine.py --regenerate-all
```

## CLI Usage

```bash
# Full pipeline (default: check cache, skip if fresh)
python scripts/data_pipeline_engine.py

# Force regenerate everything
python scripts/data_pipeline_engine.py --regenerate-all

# Skip expensive fire simulations
python scripts/data_pipeline_engine.py --only-quick

# Dry run (show what would happen)
python scripts/data_pipeline_engine.py --dry-run

# Debug logging
python scripts/data_pipeline_engine.py --log-level DEBUG

# Archive management
python scripts/snapshot_archive.py list
python scripts/snapshot_archive.py restore --date 2026-04-25
python scripts/snapshot_archive.py cleanup
```

---

**Last Updated**: 2026-04-27  
**Status**: Reference documentation for DATA_PIPELINE_CENTRALIZATION
