# Dashboard Build & Test Pipeline

## Overview

The dashboard build pipeline assembles HTML partials, CSS, JavaScript, and JSON data into a single `index.html` file. Playwright-based tests verify component rendering.

## Build Process

### 1. Template Assembly (`_assemble_template()`)

Reads HTML partials from `dashboard/templates/` in sorted order and concatenates:

```
00-head.html           ← <!DOCTYPE>, <head>, style tag, script imports
01-nav.html            ← <body>, header, tab navigation
02-tab-hoje.html       ← Now tab content
03-tab-carteira.html   ← Portfolio tab
04-tab-perf.html       ← Performance tab
05-tab-fire.html       ← FIRE tab
06-tab-retiro.html     ← Retirement tab
07-tab-simuladores.html ← Simulators tab
08-tab-backtest.html   ← Backtest tab
09-footer.html         ← </footer>, closing divs
10-scripts.html        ← <script> with __DATA_PLACEHOLDER__
11-closing.html        ← </body>, </html>
```

**Key Points:**
- Files sorted alphabetically — numbering is critical
- `__DATA_PLACEHOLDER__` in 10-scripts.html replaced with `window.DATA = {...}`
- CSS injected from `dashboard/styles/` into `<style>` tag in 00-head.html
- JS modules concatenated from `dashboard/scripts/` and inserted in 10-scripts.html

### 2. CSS Assembly (`_assemble_css()`)

Reads all `.css` files from `dashboard/styles/` and injects into first `</style>` tag.

Priority:
1. `dashboard.css` (single source if exists)
2. Individual CSS files (fallback)

### 3. JavaScript Assembly (`_assemble_js()`)

Reads all `.js` files from `dashboard/scripts/` in alphabetical order:

```
01-preamble.js
02-data-wiring.js
03-utils.js
04-charts-portfolio.js
05-fire-projections.js
06-dashboard-render.js
07-init-tabs.js
```

### 4. Data Injection

Converts `dashboard/data.json` to JavaScript object:

```javascript
window.DATA = { /* entire data.json */ };
window.GENERATED_AT = new Date('2026-04-14T...');
window.VERSION = 'v2.181';
```

## Build Commands

```bash
# Standard build (no tests)
python3 scripts/build_dashboard.py

# Build with specific options
python3 scripts/build_dashboard.py --template dashboard/template.html --data dashboard/data.json

# Full pipeline (build + tests)
python3 scripts/build_dashboard.py && ./scripts/run_tests_playwright.sh
```

## Testing

### Component Test (Playwright)

Validates that 66 spec components render in browser:

```bash
# Run directly
node test_comprehensive_components.js

# Via shell wrapper
./scripts/run_tests_playwright.sh --component-only

# Via Python (with threshold)
python3 scripts/test_dashboard_playwright.py --component-only --threshold 75
```

**Pass Criteria:** ≥ 75% components rendering (52/66 currently)

**Output:** `dashboard/tests/comprehensive_component_test.json`

### Empty Component Detection

Identifies components with HTML but no rendered content:

```bash
# Run directly
node dashboard/tests/identify_empty_integrated.js

# Via shell wrapper
./scripts/run_tests_playwright.sh --empty-only
```

**Output:** `dashboard/tests/identify_empty_results.json`

## File Structure

```
dashboard/
├── index.html                    ← Generated (9,434 lines)
├── data.json                     ← Dashboard state (source of truth)
├── data.schema.json              ← Data validation schema
├── template.html                 ← Fallback (if templates/ missing)
├── version.json                  ← Version metadata
├── templates/
│   ├── 00-head.html
│   ├── 01-nav.html
│   ├── 02-tab-hoje.html ... 08-tab-backtest.html
│   ├── 09-footer.html
│   ├── 10-scripts.html
│   └── 11-closing.html
├── styles/
│   ├── dashboard.css             ← Preferred (single CSS file)
│   └── *.css                     ← Individual styles (fallback)
├── scripts/
│   ├── 01-preamble.js
│   ├── 02-data-wiring.js ... 07-init-tabs.js
│   ├── bootstrap.mjs             ← Copied to output
│   └── [other utilities]
├── tests/
│   ├── comprehensive_component_test.json
│   ├── identify_empty_results.json
│   ├── spec_html_mapping.json    ← 66 components mapped
│   └── [test scripts]
└── js/                           ← Generated copies of scripts
```

## Validation Pipeline

Before build completes:

1. ✅ **Schema Validation** — `data.json` vs `data.schema.json`
2. ✅ **HTML Structure Validation** — Balanced divs, proper nesting
3. ✅ **Template Sync Validation** — All 66 spec blocks mapped to HTML IDs
4. ✅ **CSS Assembly** — All stylesheets loaded
5. ✅ **JavaScript Assembly** — All modules concatenated
6. ✅ **Data Injection** — DATA object created
7. ⚠️ **Playwright Tests** (optional) — Component rendering ≥ 75%

Exit code 0 = all validations pass

## Current Status

**Build:** ✅ Working (assembled from 12 partials)  
**Size:** 225,568 chars, 9,434 lines  
**Schema:** ✅ Valid  
**HTML Structure:** ⚠️ Validator reports unbalanced divs (-16) — not blocking build  
**Components:** 52/66 (78.8%) rendering ✅

## Next Steps

1. Diagnose 14 EMPTY components (empty containers despite HTML present)
2. Fix 16 unclosed div warnings in validator
3. Automate tests in CI/CD pipeline (GitHub Actions)
4. Separate CSS into individual files in `dashboard/styles/`
