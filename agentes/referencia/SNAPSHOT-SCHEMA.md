# Snapshot Schema Reference

Comprehensive schema documentation for all data pipeline snapshots.

## Overview

Each snapshot follows a standardized format with required metadata and domain-specific data:

```json
{
  "_schema_version": "1.0",
  "_generated": "2026-04-26T22:30:45Z",
  "_window_id": "2026-04-26T22:30:45Z",
  "_source": {
    "script": "reconstruct_macro.py:main at line 45",
    "cache_used": false,
    "data_version": "PTAX-2026-04-26, Focus-2026-04-24"
  },
  ...domain_specific_fields...
}
```

## Metadata Fields (All Snapshots)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_schema_version` | string | ✅ | Schema version (e.g., "1.0") for backward compatibility |
| `_generated` | ISO-8601 | ✅ | Timestamp when snapshot generated (UTC, ends with "Z") |
| `_window_id` | string | ✅ | Links to parent pipeline generation window (sync guarantee) |
| `_source` | object | ✅ | Audit trail with script name, cache usage, data version |

## Snapshot Definitions

### 1. MacroSnapshot (`macro_snapshot.json`)

Macroeconomic data: PTAX, Selic, IPCA, Focus inflation forecast.

**Schema Version**: 1.0

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ptax` | float | ❌ | USD/BRL exchange rate (e.g., 5.22) |
| `ptax_date` | string | ❌ | Date of PTAX quote (ISO format) |
| `selic_rate` | float | ❌ | Current Selic target rate (%) |
| `selic_date` | string | ❌ | Date of last Selic decision |
| `ipca_12m` | float | ❌ | IPCA last 12 months (%) |
| `ipca_date` | string | ❌ | Date of last IPCA reading |
| `focus_inflation` | float | ❌ | Market expectation for next 12 months IPCA (%) |
| `focus_date` | string | ❌ | Date of Focus survey |

**Example**:
```json
{
  "_schema_version": "1.0",
  "_generated": "2026-04-26T22:30:45Z",
  "_window_id": "2026-04-26T22:30:45Z",
  "_source": {...},
  "ptax": 5.2340,
  "ptax_date": "2026-04-25",
  "selic_rate": 10.5,
  "selic_date": "2026-04-21",
  "ipca_12m": 4.82,
  "ipca_date": "2026-03-31",
  "focus_inflation": 4.55,
  "focus_date": "2026-04-24"
}
```

### 2. FactorSnapshot (`factor_snapshot.json`)

Factor returns: Fama-French 5 + Momentum.

**Schema Version**: 1.0

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ff5_monthly` | object | ❌ | FF5 returns by month {YYYY-MM: return_pct, ...} |
| `ff5_latest_date` | string | ❌ | Most recent FF5 data date |
| `mom_monthly` | object | ❌ | Momentum returns by month {YYYY-MM: return_pct, ...} |
| `mom_latest_date` | string | ❌ | Most recent Momentum data date |
| `factor_loadings` | object | ❌ | Portfolio factor loadings {smb: 0.5, hml: 0.3, ...} |

**Example**:
```json
{
  "_schema_version": "1.0",
  "_generated": "2026-04-26T10:15:30Z",
  "_window_id": "2026-04-26T22:30:45Z",
  "_source": {...},
  "ff5_monthly": {
    "2026-03": 0.0234,
    "2026-02": -0.0156,
    "2026-01": 0.0523
  },
  "ff5_latest_date": "2026-03-31",
  "mom_monthly": {
    "2026-03": 0.0456,
    "2026-02": 0.0278
  },
  "mom_latest_date": "2026-03-31",
  "factor_loadings": {
    "smb": 0.15,
    "hml": -0.08,
    "rmw": 0.12,
    "cma": 0.05,
    "mom": 0.10
  }
}
```

### 3. TaxSnapshot (`tax_snapshot.json`)

Tax data: Deferred IR, realized gains/losses.

**Schema Version**: 1.0

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ir_diferido_total` | float | ❌ | Total deferred IR in BRL (não realizado) |
| `ir_by_etf` | object | ❌ | IR diferido by ETF {SWRD: 5000, AVGS: 3000, ...} |
| `realized_gains` | object | ❌ | Realized gains by ETF {SWRD: 10000, ...} |
| `realized_losses` | object | ❌ | Realized losses for TLH {AVGS: -2000, ...} |
| `darf_code` | string | ❌ | DARF code for tax reporting (e.g., "6015") |

**Example**:
```json
{
  "_schema_version": "1.0",
  "_generated": "2026-04-26T12:00:00Z",
  "_window_id": "2026-04-26T22:30:45Z",
  "_source": {...},
  "ir_diferido_total": 133000.50,
  "ir_by_etf": {
    "SWRD": 45000,
    "AVGS": 55000,
    "AVEM": 33000.50
  },
  "realized_gains": {
    "SWRD": 15000,
    "AVGS": 8000
  },
  "realized_losses": {
    "AVEM": 2000
  },
  "darf_code": "6015"
}
```

### 4. HistorySnapshot (`historico_carteira.csv`)

Portfolio historical performance: TWR by month/year.

**Format**: CSV with headers

| Column | Type | Description |
|--------|------|-------------|
| `date` | YYYY-MM | Month |
| `twr_nominal_brl` | float | TWR nominal return in BRL (%) |
| `twr_real_brl` | float | TWR real return (inflation-adjusted) (%) |
| `ipca` | float | IPCA inflation that month (%) |
| `cdi` | float | CDI rate that month (%) |

**Example**:
```
date,twr_nominal_brl,twr_real_brl,ipca,cdi
2026-03,2.34,0.89,1.45,0.98
2026-02,-1.56,-2.95,1.42,0.87
2026-01,5.23,2.84,2.39,1.05
```

### 5. FireSnapshot (`fire_matrix.json`)

Monte Carlo fire simulations: P(FIRE), guardrails, bond pool, wealth percentiles.

**Schema Version**: 1.0

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pfire_base` | float | ❌ | P(FIRE) base scenario (decimal 0-1) |
| `pfire_aspirational` | float | ❌ | P(FIRE) higher spending scenario |
| `pfire_stress` | float | ❌ | P(FIRE) lower returns scenario |
| `guardrail_bands` | object | ❌ | Guardrail zone definitions (Normal/Caution/Crisis) |
| `bond_pool_target_2040` | float | ❌ | Target bond pool by FIRE date (BRL) |
| `bond_pool_current` | float | ❌ | Current bond pool accumulated (BRL) |
| `patrimonio_p50` | float | ❌ | Median final wealth (BRL) |
| `patrimonio_p10` | float | ❌ | 10th percentile final wealth |
| `patrimonio_p90` | float | ❌ | 90th percentile final wealth |

**Example**:
```json
{
  "_schema_version": "1.0",
  "_generated": "2026-04-26T22:30:45Z",
  "_window_id": "2026-04-26T22:30:45Z",
  "_source": {...},
  "pfire_base": 0.864,
  "pfire_aspiracional": 0.924,
  "pfire_stress": 0.783,
  "guardrail_bands": {
    "normal": {"min": 0.80, "max": 1.20},
    "caution": {"min": 0.60, "max": 0.80},
    "crisis": {"max": 0.60}
  },
  "bond_pool_target_2040": 2100000,
  "bond_pool_current": 1850000,
  "patrimonio_p50": 11200000,
  "patrimonio_p10": 8500000,
  "patrimonio_p90": 14800000
}
```

## Validation Rules

### Schema Version Compatibility

- Current version: 1.0
- Upgrades allowed: additive only (new fields OK, removal breaking)
- Downgrades: not supported (fail fast)

### Mandatory Fields

All snapshots **must** have:
- `_schema_version`
- `_generated`
- `_window_id`
- `_source`

Missing = ValidationError

### Timestamp Format

- Format: ISO-8601 with UTC timezone
- Valid: `2026-04-26T22:30:45Z` or `2026-04-26T22:30:45+00:00`
- Invalid: `2026-04-26 22:30:45`, `2026-04-26T22:30:45` (no TZ)

### Window ID Consistency

**Critical Invariant**: All snapshots in one pipeline run **must** have identical `_window_id`.

Violation = Pipeline error, human investigation required.

## Snapshot Usage Guidelines

### Creating a Snapshot

```python
from snapshot_schemas import SnapshotMetadata, MacroSnapshot

metadata = SnapshotMetadata.create(
    schema_version="1.0",
    window_id=pipeline.get_window_id(),
    script="reconstruct_macro.py:fetch_macro_data at line 45",
    cache_used=False,
    data_version="PTAX-2026-04-26"
)

snapshot = MacroSnapshot(
    metadata=metadata,
    ptax=5.234,
    ptax_date="2026-04-25",
    selic_rate=10.5,
    selic_date="2026-04-21",
    ...
)

# Save to JSON
import json
with open("dados/macro_snapshot.json", "w") as f:
    json.dump(snapshot.to_dict(), f, indent=2)
```

### Validating a Snapshot

```python
from validators import SnapshotValidator

snapshot_validator = SnapshotValidator()
snapshot_validator.validate_metadata(
    "macro_snapshot",
    data=loaded_snapshot_dict,
    max_age_hours=24
)
```

### Accessing Snapshot Data

```python
from data_pipeline_engine import DataPipelineEngine

# Always access through engine, never direct JSON load
engine = DataPipelineEngine(config)
ssot = engine.run_full_pipeline()  # Gets fresh snapshots with validation

# Access via SSOT
macro = ssot.get("macro_snapshot", {})
ptax = macro.get("ptax")
```

## Migration Path (Schema Evolution)

If schema needs to change:

1. **Bump version** in snapshot_schemas.py (e.g., 1.0 → 1.1)
2. **Add new field** to dataclass (backward compatible only)
3. **Update validator** if field is required
4. **Run full regeneration** (all snapshots get new version)
5. **Document change** in CHANGELOG.md

---

**Last Updated**: 2026-04-27  
**Status**: Reference documentation for DATA_PIPELINE_CENTRALIZATION
