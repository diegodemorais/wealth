# Testing Framework Reference

Complete testing and CI/CD documentation for the Wealth Dashboard.

---

## Quick Start

### Local Testing (Pre-commit)
```bash
npm run test:pre-commit
```

Runs:
- **Phase 1 Tests** (3): spec.json sync, schema completeness, privacy magnitude
- **Phase 2 Tests** (4): data pipeline (TWR, yfinance, RF MtM, export completeness)
- **Phase 3 Tests** (3): components (charts, imports, secOpen usage)
- **Data Validation**: data.json schema check

**Time:** 30–60 seconds
**Blocks commit:** Yes (unless `git commit --no-verify`)

---

## Test Phases Overview

### Phase 1: Foundation (Config & Data)
- `test_spec_config_sync` — spec.json ↔ config.ts ↔ pages synchronized
- `test_annual_returns_schema_complete` — All years have alpha_vs_vwra
- `test_privacy_magnitude_preserved` — Edge cases (<0.01, negative, >1M) preserve magnitude

**Run:** `pytest scripts/tests/test_*.py -k "spec_config or annual_returns or privacy" -v`

### Phase 2: Data Pipeline
- `test_modified_dietz_temporal` — Modified Dietz temporal weights
- `test_yfinance_end_of_month` — yfinance returns last day of month
- `test_rf_mtm_vs_cost` — RF uses MtM via ANBIMA/PYield
- `test_config_export_completeness` — All config.py fields in data.json

**Run:** `pytest scripts/tests/test_data_pipeline.py -v`

### Phase 3: Components & Charts
- `test_chart_hidden_tab_render` — ECharts in display:none containers
- `test_fmtprivacy_imports_valid` — 44 components use fmtPrivacy correctly
- `test_pages_use_secopen` — pages use secOpen(), not direct access

**Run:** `pytest scripts/tests/ -k "chart or fmtprivacy or secopen" -v`

### Phase 4: Cleanup & CI
- TypeScript: No @ts-ignore/@ts-expect-error pragmas
- Build: `npm run build` succeeds
- Pre-commit: `.git/hooks/pre-commit` executable

**Run:** `npm run build && git hook verify`

### Phase 5: Validation Tests (77 tests)
- `test_fire_validation.py` — SWR matrix validation
- `test_drawdown_validation.py` — Max drawdown extremes
- `test_bond_runway_validation.py` — Bond runway <1 year
- `test_spending_validation.py` — Spending ratio checks
- `test_attribution_validation.py` — Attribution sum to 100%
- `test_macro_timestamps_validation.py` — Macro data timestamps
- `test_trilha_percentis_validation.py` — P10/P50/P90 percentile paths

**Run:** `pytest scripts/tests/ -v` (all Phase 5+ tests)

### Phase 6: Maintenance Automation
- **Quarterly Audit** (`quarterly_audit.py`): Component count, spec.json drift, pragmas
- **Monthly Health Check** (`monthly_health_check.py`): Test suite, data validation, hook status
- **Bug-to-Test Workflow** (`bug_to_test.sh`): Bug intake and test generation

**Run:** `python3 scripts/maintenance/quarterly_audit.py` or monthly health check

### Phase 7: CI/CD Workflows
- **PR Tests** (test-on-pr.yml): 158 tests + bundle size check
- **Nightly Lighthouse** (lighthouse-nightly.yml): 8 pages, baseline comparison
- **A11y Check** (a11y-check.yml): WCAG 2.1 AA, critical violations blocking
- **Release Validation** (release-validation.yml): All phases + deploy gate

---

## Running Tests

### All Tests (Full Suite)
```bash
npm run test:pre-commit
```

### By Phase
```bash
# Phase 1 only
pytest scripts/tests/test_spec_config_sync.py -v

# Phase 2 only
pytest scripts/tests/test_data_pipeline.py -v

# Phase 5 (all validation)
pytest scripts/tests/ -v

# With coverage
pytest scripts/tests/ --cov=scripts --cov-report=html
```

### By Test Name
```bash
pytest scripts/tests/ -k "privacy" -v      # Privacy tests only
pytest scripts/tests/ -k "chart" -v        # Chart tests only
pytest scripts/tests/ -k "data" -v         # Data pipeline tests
```

### Verbose Output
```bash
pytest scripts/tests/ -vv --tb=short
```

---

## Data Validation

### Validate data.json
```bash
npm run validate-data
```

Checks:
- JSON parseable
- 6 required keys present: `annual_returns`, `fire_data`, `portfolio_history`, `spending_data`, `macro_data`, `factor_data`
- File size reasonable (not empty, not too large)

### Regenerate data.json
```bash
python3 scripts/generate_data.py
```

---

## Maintenance Scripts

### Quarterly Audit
```bash
python3 scripts/maintenance/quarterly_audit.py [--diff-weeks 13] [--output FILE]
```

Output:
- Component count and recent files
- spec.json changes (drift detection)
- Phase 1 test status
- @ts-ignore pragma count
- Recommendations

### Monthly Health Check
```bash
python3 scripts/maintenance/monthly_health_check.py [--output FILE] [--strict]
```

Output:
- Test suite status
- data.json validity
- Pre-commit hook status
- Git commit history

### Bug-to-Test Workflow
```bash
scripts/maintenance/bug_to_test.sh "Bug description" [--component ComponentName]
```

Generates:
- Bug ID (timestamp-based)
- Root cause analysis checklist
- Test template
- Commit message template
- Lesson learned template

Example:
```bash
./scripts/maintenance/bug_to_test.sh "Bug: fmtPrivacy shows R$3.5M as R$245 when value <0.01"
./scripts/maintenance/bug_to_test.sh "Chart not rendering in hidden tab" --component Dashboard
```

---

## CI/CD Workflows (GitHub Actions)

### PR Checks (test-on-pr.yml)
**Trigger:** On PR to `main`

**Steps:**
1. Checkout code
2. Setup Node.js + Python
3. Run `npm run test:pre-commit` (158 tests)
4. Validate data.json
5. Check bundle size (<5% increase)
6. Comment PR with results

**Status:** ✅ Required to merge

### Nightly Lighthouse (lighthouse-nightly.yml)
**Trigger:** Daily at 23:00 UTC (or manual)

**Steps:**
1. Build app
2. Run Lighthouse on 8 pages:
   - performance, portfolio, fire, withdraw
   - backtest, assumptions, discovery, simulators
3. Compare against baseline (allow ±5% variance)
4. Alert if score drops >10 points
5. Upload results to artifacts

**Status:** ℹ️ Informational (non-blocking)

### A11y Check (a11y-check.yml)
**Trigger:** On PR + main branch + weekly

**Steps:**
1. Run Phase 7 a11y tests
2. Check for NEW CRITICAL violations
3. Allow MAJOR/MINOR (tracked separately)
4. Comment PR with a11y report

**Status:** ✅ Critical violations block merge

### Release Validation (release-validation.yml)
**Trigger:** On git tag `v*`

**Steps:**
1. Run all 7 test phases (194 tests)
2. Validate data.json completeness
3. Build application
4. Generate release notes
5. Deploy to GitHub Pages (if all pass)

**Status:** ✅ All checks required for deployment

---

## Pre-commit Hook

The `.git/hooks/pre-commit` hook automatically runs tests before commit:

```bash
git commit -m "feature: add something"
# ↓ Tests run automatically
# ✅ All tests passed. Commit allowed.
# (or)
# ❌ Tests failed. Commit blocked.
```

### Bypass (Emergency Only)
```bash
git commit --no-verify
```

⚠️ Use sparingly. Monitoring detects bypasses.

---

## Common Scenarios

### After Modifying `scripts/reconstruct_history.py` or `scripts/generate_data.py`
```bash
npm run test:pre-commit
npm run validate-data
```

### After Editing React Components
```bash
npm run test:pre-commit       # Phase 3 tests check imports
npm run build                 # Verify TypeScript
```

### After Adding New Field to `config.py`
```bash
npm run validate-data         # Check export
npm run test:pre-commit       # Phase 1 tests validate sync
```

### After Editing `dashboard.config.ts`
```bash
pytest scripts/tests/ -k "spec_config" -v
```

### Before Creating a Pull Request
```bash
npm run test:pre-commit       # All tests must pass
npm run build                 # Verify build
npm run validate-data         # Verify data
```

### When Tests Fail
1. Run test locally: `npm run test:pre-commit`
2. Check error message carefully
3. If Phase 1 fails: Check config sync (spec.json ↔ config.ts)
4. If Phase 2 fails: Check data pipeline (generate_data.py, reconstruct_history.py)
5. If Phase 3 fails: Check component imports (privacy, secOpen)
6. Use `bug_to_test.sh` to document and test fix

---

## Documentation

- **Full Test Plan:** `agentes/issues/DEV-plan-testes-2026.md`
- **Spec V2 Reference:** `agentes/referencia/spec-v2-testes-completos.md`
- **Audit Report:** `agentes/referencia/plano-testes-auditoria-real.md`
- **Contributing Guide:** `CONTRIBUTING.md`
- **Maintenance Scripts:** `scripts/maintenance/`
- **GitHub Actions:** `.github/workflows/`

---

## Support

### Test Failures
1. Check test output for specific assertion
2. Review test code in `scripts/tests/`
3. Run with verbose output: `pytest ... -vv --tb=short`
4. Use `bug_to_test.sh` to document root cause

### Data Issues
1. Run `npm run validate-data`
2. Check `dados/data.json` is valid JSON
3. Regenerate: `python3 scripts/generate_data.py`
4. Verify with Phase 2 tests: `pytest scripts/tests/test_data_pipeline.py -v`

### Build Issues
1. Run `npm run build` locally
2. Check for TypeScript errors
3. Verify Node/npm versions
4. Clear cache: `rm -rf .next node_modules && npm install`

### Hook Issues
1. Verify hook exists: `ls -la .git/hooks/pre-commit`
2. Make executable: `chmod +x .git/hooks/pre-commit`
3. Check hook content: `cat .git/hooks/pre-commit`

---

## Summary

- **Local:** `npm run test:pre-commit` (30-60s, pre-commit gate)
- **Manual:** `pytest scripts/tests/ -v` (phase breakdown)
- **Maintenance:** `python3 scripts/maintenance/*.py` (quarterly/monthly/ad-hoc)
- **CI/CD:** GitHub Actions on PR, nightly, and release (automated gates)
- **Documentation:** TESTING.md, CONTRIBUTING.md, Spec V2, issue tracker

**Framework complete. Production-ready. 🚀**
