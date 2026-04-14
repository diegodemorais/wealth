# Template Partials Validation Protocol

## Overview

The dashboard template is being split into partials for ARCH-003 (Template Componentization). This protocol validates that partials are complete and contain the expected content.

## Test Execution

### Run validation script:
```bash
python3 scripts/validate_partials.py
```

### Included in full test suite:
```bash
./scripts/quick_dashboard_test.sh
```

This runs as step 2.5 before component render status testing.

## What Gets Validated

### 1. File Structure
- All 12 partials exist and are readable
- Files have reasonable size (not empty)

### 2. HTML Integrity
- Opening and closing tags are balanced
- No orphaned closing tags
- Valid nesting

### 3. Content Presence
- Headings (h1-h3) count
- Canvas elements for charts
- Table elements
- Overall content size

### 4. Tab Attribution
- `data-in-tab` attributes are present
- Values match tab names (hoje, carteira, perf, fire, retiro, simuladores, backtest)

### 5. Content Coverage
Per-tab validation against expected elements:

| Tab | Expected Elements |
|-----|-------------------|
| hoje | tornadoChart, sankey, bondPool, backtestChart |
| carteira | donuts, stackedAlloc, posicoes |
| perf | timeline, attrib, rolling, heatmap |
| fire | trackingFireChart, scenarioCompareBody, fireMatrix, netWorthProjectionChart |
| retiro | bondPool, guardrails, incomeChart, swrPercentiles |
| simuladores | scenarios, stressProjection, simuladorFire |
| backtest | backtest, shadowChart, backtestR7 |

## Interpretation

### Status Codes

- ✓ **OK**: Partial has content and valid HTML
- ⚠️ **Warning**: Partial has issues but might work (e.g., HTML errors caught by browser)
- ✗ **Critical**: Partial is missing or completely empty

### Coverage Targets

- **100%**: All expected elements present
- **50-99%**: Partial presence — content might be in wrong partial or missing
- **<50%**: Critical gap — dashboard will show empty sections

## Common Issues

### Empty Partials (03-06, 08-11)
**Problem**: Only structural `<div>` containers, no actual content

**Cause**: Content was never extracted from template.html

**Fix**: Manually extract and place content into correct partial, ensuring:
1. Each heading, canvas, table is present
2. `data-in-tab` attribute is set correctly
3. Section IDs match expected element names

### HTML Errors in 01-nav, 02-tab-hoje
**Problem**: Mismatched or unclosed tags

**Cause**: Partial extraction didn't preserve HTML balance

**Fix**: 
1. Validate against HTML5 parser
2. Close tags properly
3. Test in browser (browser auto-correction masks some issues)

### Wrong Content in Wrong Partial
**Problem**: Element exists but in wrong partial/tab

**Cause**: Content boundaries were unclear during extraction

**Fix**: Review template.html original structure, move content to correct partial

## Build Integration

When partials exist in `dashboard/templates/`:

1. Build assembles partials in alphabetical order
2. Missing content → empty sections in output
3. If build HTML validation fails → fallback to template.html

To use fallback:
```bash
# Rename partials directory
mv dashboard/templates dashboard/templates.incomplete

# Rebuild
python3 scripts/build_dashboard.py
```

## Workflow

1. **Fix partials** (add missing content)
2. **Run validation**:
   ```bash
   python3 scripts/validate_partials.py
   ```
3. **Check results** — should show 100% coverage for all tabs
4. **Rebuild dashboard**:
   ```bash
   python3 scripts/build_dashboard.py
   ```
5. **Run full test suite**:
   ```bash
   ./scripts/quick_dashboard_test.sh
   ```
6. **If tests pass** → partials are complete

## Future Improvements

- [ ] Auto-extract partials from template.html
- [ ] Implement Jinja2 templating for proper componentization
- [ ] Add Git pre-commit hook to validate partials
- [ ] Create visual diff tool to highlight missing content

---

**Last Updated**: 2026-04-14  
**Protocol Owner**: dev  
**Test Status**: Active (validation script deployed)
