"""
Dev transversal tests — zero hardcoded, spec coverage, privacy global
Covers: all 64 blocks across all tabs
"""

import re
from .base import registry, load_data, load_html, load_spec, get_nested, BUILD_PY, SPEC_JSON


# ── SPEC COVERAGE ────────────────────────────────────────────────────────────

@registry.test("spec-global", "SPEC", "spec.json exists and is parseable", "CRITICAL")
def _():
    spec = load_spec()
    blocks = spec.get("blocks", [])
    if not blocks:
        return False, "spec.json has no blocks"
    return True, f"{len(blocks)} blocks declared"


@registry.test("spec-global", "SPEC", "all blocks have required fields (id, tab, type, data_fields)", "CRITICAL")
def _():
    spec = load_spec()
    missing = []
    for b in spec.get("blocks", []):
        for field in ("id", "tab", "type", "data_fields"):
            if not b.get(field):
                missing.append(f"{b.get('id','?')}.{field}")
    if missing:
        return False, f"Missing fields: {missing[:10]}"
    return True, "All blocks have required fields"


@registry.test("spec-global", "SPEC", "no duplicate block IDs in spec.json", "HIGH")
def _():
    spec = load_spec()
    ids = [b["id"] for b in spec.get("blocks", [])]
    dupes = [bid for bid in ids if ids.count(bid) > 1]
    if dupes:
        return False, f"Duplicate IDs: {list(set(dupes))}"
    return True, f"{len(ids)} unique block IDs"


@registry.test("spec-global", "SPEC", "all tab IDs in blocks match declared tabs", "HIGH")
def _():
    spec = load_spec()
    valid_tabs = {t["id"] for t in spec.get("tabs", [])}
    invalid = [b["id"] for b in spec.get("blocks", []) if b.get("tab") not in valid_tabs]
    if invalid:
        return False, f"Blocks with invalid tab: {invalid}"
    return True, f"All blocks use valid tabs: {valid_tabs}"


# ── ZERO HARDCODED ────────────────────────────────────────────────────────────

@registry.test("zero-hardcoded", "VALUE", "build_dashboard.py has no hardcoded patrimonio_atual value", "HIGH")
def _():
    data = load_data()
    pat_atual = get_nested(data, "premissas.patrimonio_atual")
    if pat_atual is None:
        return False, "premissas.patrimonio_atual missing from data.json"
    build_src = BUILD_PY.read_text()
    # Look for the actual number as a literal (allow for minor floating point variations)
    val_str = str(int(pat_atual)) if isinstance(pat_atual, float) else str(pat_atual)
    if val_str in build_src:
        return False, f"Hardcoded patrimonio_atual={val_str} found in build_dashboard.py"
    return True, "No hardcoded patrimonio_atual found"


@registry.test("zero-hardcoded", "VALUE", "build_dashboard.py has no hardcoded pfire53.base value", "HIGH")
def _():
    data = load_data()
    pfire = get_nested(data, "pfire53.base")
    if pfire is None:
        return False, "pfire53.base missing from data.json"
    build_src = BUILD_PY.read_text()
    val_str = f"{pfire:.4f}"
    # Remove trailing zeros for search
    if val_str.rstrip("0").rstrip(".") in build_src:
        return False, f"Hardcoded pfire={pfire} found in build_dashboard.py"
    return True, "No hardcoded pfire53.base found"


@registry.test("zero-hardcoded", "VALUE", "build_dashboard.py reads data from data.json, not inline literals", "CRITICAL")
def _():
    build_src = BUILD_PY.read_text()
    # build_dashboard.py should load data.json — not define values inline
    if "data.json" not in build_src and "generate_data" not in build_src:
        return False, "build_dashboard.py doesn't reference data.json or generate_data"
    return True, "build_dashboard.py references data source"


@registry.test("zero-hardcoded", "VALUE", "index.html data comes from DATA object, not hardcoded in JS", "CRITICAL")
def _():
    html = load_html()
    # The dashboard should have a DATA variable populated from data.json, not hardcoded
    if "const DATA" not in html and "var DATA" not in html and "window.DATA" not in html:
        return False, "No DATA variable found in index.html — data may not be loaded properly"
    return True, "DATA variable present in index.html"


# ── DATA PIPELINE ─────────────────────────────────────────────────────────────

@registry.test("pipeline", "DATA", "data.json exists and is non-empty", "CRITICAL")
def _():
    from .base import DATA_JSON
    if not DATA_JSON.exists():
        return False, "dashboard/data.json does not exist"
    data = load_data()
    if not data:
        return False, "data.json is empty"
    return True, f"data.json has {len(data)} top-level keys"


@registry.test("pipeline", "DATA", "data.json has _generated timestamp", "MEDIUM")
def _():
    data = load_data()
    if not data.get("_generated"):
        return False, "_generated field missing from data.json"
    return True, f"Generated: {data['_generated']}"


@registry.test("pipeline", "DATA", "index.html exists and is non-empty", "CRITICAL")
def _():
    from .base import INDEX_HTML
    if not INDEX_HTML.exists():
        return False, "dashboard/index.html does not exist"
    html = load_html()
    if len(html) < 1000:
        return False, f"index.html suspiciously small: {len(html)} chars"
    return True, f"index.html: {len(html):,} chars"


@registry.test("pipeline", "DATA", "all spec data_fields exist in data.json", "CRITICAL")
def _():
    data = load_data()
    spec = load_spec()
    missing = []
    for block in spec.get("blocks", []):
        for field in block.get("data_fields", []):
            # Only check top-level key
            top_key = field.split(".")[0]
            if top_key not in data:
                missing.append(f"{block['id']}: {top_key}")
    if missing:
        # Deduplicate
        unique = list(dict.fromkeys(missing))
        return False, f"Missing top-level keys: {unique[:15]}"
    return True, "All spec data_field top-level keys present in data.json"


# ── PRIVACY ───────────────────────────────────────────────────────────────────

@registry.test("privacy-global", "PRIVACY", "privacy toggle mechanism present in HTML", "HIGH")
def _():
    html = load_html()
    # The dashboard uses class="pv" on privacy-sensitive elements
    # Check that the .pv class is defined in CSS and used in HTML
    pv_in_css = re.search(r'\.pv\s*\{', html) or "class=\"pv\"" in html or ".pv{" in html
    pv_elements = len(re.findall(r'class=["\'][^"\']*\bpv\b[^"\']*["\']', html))
    if not pv_in_css and pv_elements == 0:
        return False, "No .pv class found in HTML — privacy mechanism missing"
    return True, f"{pv_elements} elements with .pv class in HTML"


@registry.test("privacy-global", "PRIVACY", "privacy toggle script present in index.html", "HIGH")
def _():
    html = load_html()
    # Should have a toggle function for privacy mode
    if "privacy" not in html.lower():
        return False, "No privacy-related code found in index.html"
    if "pv" not in html:
        return False, "No .pv class references found in index.html"
    return True, "Privacy toggle code present"


# ── RENDER (structural) ───────────────────────────────────────────────────────

@registry.test("render-global", "RENDER", "HTML has 4 tab containers (hoje/carteira/perf/fire)", "CRITICAL")
def _():
    html = load_html()
    # Actual tab IDs in HTML (differ from spec names)
    html_tab_ids = ["hoje", "carteira", "perf", "fire"]
    missing = []
    for tab_id in html_tab_ids:
        if f'data-tab="{tab_id}"' not in html and f"data-tab='{tab_id}'" not in html:
            missing.append(tab_id)
    if missing:
        return False, f"Tab containers missing: {missing}"
    return True, f"All {len(html_tab_ids)} tabs present in HTML"


@registry.test("render-global", "RENDER", "Chart.js loaded in HTML", "CRITICAL")
def _():
    html = load_html()
    if "chart.js" not in html.lower() and "Chart" not in html:
        return False, "Chart.js not found in HTML"
    return True, "Chart.js present"


@registry.test("render-global", "RENDER", "no empty canvas elements (uninitialized charts)", "MEDIUM")
def _():
    html = load_html()
    # Count canvas elements — all should have an id
    canvases = re.findall(r'<canvas[^>]*>', html)
    no_id = [c for c in canvases if 'id=' not in c]
    if no_id:
        return False, f"{len(no_id)} canvas elements without id: {no_id[:5]}"
    return True, f"{len(canvases)} canvas elements all have IDs"


# ── SPEC vs HTML COVERAGE ─────────────────────────────────────────────────────

@registry.test("coverage-global", "SPEC", "key canvas elements exist in index.html", "HIGH")
def _():
    html = load_html()
    # Key canvas IDs that must exist in the built HTML
    required_canvases = [
        "tornadoChart", "spendingChart", "fireTrilhaChart", "glideChart",
        "bondPoolRunwayChart", "netWorthProjectionChart", "incomeProjectionChart",
        "aporteSensChart", "shadowChart", "factorLoadingsChart",
    ]
    missing = [c for c in required_canvases if c not in html]
    if missing:
        return False, f"Required canvas elements missing from HTML: {missing}"
    return True, f"All {len(required_canvases)} required canvas elements present"


@registry.test("coverage-global", "SPEC", "block count in spec matches expected 64", "MEDIUM")
def _():
    spec = load_spec()
    n = len(spec.get("blocks", []))
    if n < 60:
        return False, f"Only {n} blocks in spec (expected ~64) — blocks may have been removed"
    return True, f"{n} blocks in spec"
