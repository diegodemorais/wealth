# Contributing to Wealth Dashboard

## Before You Commit

All code changes must pass local validation before being committed.

### Local Testing Workflow

**Pre-commit validation** (runs automatically before commit):
```bash
npm run test:pre-commit
```

This runs:
1. **Phase 1 Tests** (React): Config sync, schema completeness, privacy magnitude
2. **Phase 2 Tests** (Python): TWR pipeline, data export, data pipeline completeness
3. **Phase 3 Tests** (React): Charts in hidden tabs, privacy imports, secOpen usage
4. **Data Validation**: `npm run validate-data` checks data.json schema

**Manual full build**:
```bash
npm run build
```

Validates TypeScript, bundles, and ensures no broken imports.

**Data validation only**:
```bash
npm run validate-data
```

Checks data.json for critical fields, size, and completeness.

## Test Organization

### Phase 1: Foundation (Config & Data)
- `test_spec_config_sync` — spec.json ↔ dashboard.config.ts ↔ pages synchronized
- `test_annual_returns_schema` — all years have required fields (alpha_vs_vwra)
- `test_privacy_magnitude` — edge cases (<0.01, negative, >1M) preserve magnitude

### Phase 2: Data Pipeline
- `test_modified_dietz_temporal` — Modified Dietz temporal weights correct
- `test_yfinance_end_of_month` — yfinance returns last day of month (28/29/31)
- `test_rf_mtm_vs_cost` — RF uses MtM via ANBIMA/PYield, not cost basis
- `test_config_export_completeness` — all config.py fields exported to data.json

### Phase 3: Components & Charts
- `test_chart_hidden_tab_render` — ECharts render in display:none containers
- `test_fmtprivacy_imports` — 44 dashboard components use fmtPrivacy correctly
- `test_pages_use_secopen` — pages use secOpen accessor, no direct portfolio access

## When Modifying Code

**Touching `scripts/reconstruct_history.py` or `scripts/generate_data.py`?**
- Run Phase 2 tests: `python3 -m pytest scripts/tests/ -v`
- Run data validation: `npm run validate-data`

**Touching React components or pages?**
- Commit blocks until Phase 3 tests pass
- Tests check charts render, privacy transforms, accessor usage

**Adding new field to config.py?**
- Run validate-data immediately
- Ensure field is exported to data.json
- Phase 3 tests will catch missing imports

**Editing dashboard.config.ts?**
- Phase 1 test validates sync with spec.json and pages
- Can't commit if sync is broken

## Pre-commit Hook

A git pre-commit hook automatically blocks commits if tests fail:

```bash
git commit -m "feature: add something"
# Tests run automatically
# If tests fail: ❌ Tests failed. Commit blocked.
# If tests pass: ✅ All tests passed. Commit allowed.
```

### Bypass (Emergency Only)

If you need to bypass for an emergency:
```bash
git commit --no-verify
```

⚠️ Use sparingly — bypassing tests risks broken deployments.

## TypeScript & Linting

No `@ts-expect-error` or `@ts-ignore` pragmas allowed unless documented with issue link. Type errors must be fixed, not suppressed.

## References

- **Test Plan:** `agentes/issues/DEV-plan-testes-2026.md`
- **Audit Report:** `agentes/referencia/plano-testes-auditoria-real.md`
- **Full Spec:** `agentes/referencia/plano-testes-executavel.md`
