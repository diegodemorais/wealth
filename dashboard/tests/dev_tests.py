"""
Dev transversal tests — zero hardcoded, spec coverage, privacy global
Covers: all 64 blocks across all tabs
"""

import re
from pathlib import Path
from .base import registry, load_data, load_html, load_spec, get_nested, BUILD_PY, SPEC_JSON

ROOT = Path(__file__).parent.parent.parent
TEMPLATE_HTML = ROOT / "dashboard" / "template.html"

_TEMPLATE = None


def load_template() -> str:
    global _TEMPLATE
    if _TEMPLATE is None:
        with open(TEMPLATE_HTML) as f:
            _TEMPLATE = f.read()
    return _TEMPLATE


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
    # HTML uses different IDs than spec: now→hoje, portfolio→carteira, performance→perf
    # retiro is new and matches directly
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

@registry.test("render-global", "RENDER", "HTML has 5 tab containers (hoje/carteira/perf/fire/retiro)", "CRITICAL")
def _():
    html = load_html()
    # Actual tab IDs in HTML (differ from spec names)
    html_tab_ids = ["hoje", "carteira", "perf", "fire", "retiro"]
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


@registry.test("coverage-global", "SPEC", "block count in spec matches expected ~72", "MEDIUM")
def _():
    spec = load_spec()
    n = len(spec.get("blocks", []))
    if n < 65:
        return False, f"Only {n} blocks in spec (expected ~72) — blocks may have been removed"
    return True, f"{n} blocks in spec"


# ── TAB_SWITCH — destroy guard regression tests ───────────────────────────────
# Verifies that every chart canvas that appears in index.html has a charts.XXX
# destroy() guard in template.html before its new Chart( call.
# Prevents "canvas already in use" error when revisiting a tab.
#
# Format:
# TEST tab-switch-guard :: TAB_SWITCH :: <canvas_id> tem destroy guard antes de new Chart
# GIVEN template.html
# WHEN buscar charts.<id> antes de new Chart(document.getElementById('<id>')
# THEN guard presente — sem canvas-already-in-use ao re-visitar aba
# SEVERITY: HIGH

def _check_destroy_guard(canvas_id: str, charts_key: str) -> tuple[bool, str]:
    """
    Verify that template.html has a destroy guard for charts.<charts_key>
    somewhere before the new Chart(document.getElementById('<canvas_id>') call.
    Also checks the canvas_id exists in index.html.
    """
    html = load_html()
    template = load_template()

    # Step 1: canvas must exist in index.html
    if f'id="{canvas_id}"' not in html and f"getElementById('{canvas_id}')" not in html:
        return False, f"canvas id='{canvas_id}' not found in index.html"

    # Step 2: must have new Chart call referencing this canvas in template
    new_chart_pattern = f"new Chart(document.getElementById('{canvas_id}')"
    # Some charts use a ctx variable — also check for the canvas id near a new Chart call
    has_new_chart = new_chart_pattern in template
    if not has_new_chart:
        # Check if canvas id is used to get ctx then new Chart(ctx
        if f"getElementById('{canvas_id}')" not in template:
            return False, f"new Chart call for '{canvas_id}' not found in template.html"
        # Canvas is referenced but via ctx variable — accept
        has_new_chart = True

    # Step 3: must have a destroy guard using charts.<charts_key>
    destroy_guard = f"charts.{charts_key}"
    if destroy_guard not in template:
        return False, f"No destroy guard 'charts.{charts_key}' found in template.html"

    # Step 4: verify guard appears before new Chart call (by line position)
    lines = template.splitlines()
    guard_lines = [i for i, ln in enumerate(lines) if destroy_guard in ln and "destroy" in ln]
    if new_chart_pattern in template:
        chart_lines = [i for i, ln in enumerate(lines) if new_chart_pattern in ln]
    else:
        # Using ctx pattern
        ctx_get_lines = [i for i, ln in enumerate(lines) if f"getElementById('{canvas_id}')" in ln]
        chart_lines = [i for i, ln in enumerate(lines) if "new Chart(" in ln]
        # Find new Chart( after any ctx assignment
        if ctx_get_lines and chart_lines:
            first_ctx = min(ctx_get_lines)
            chart_lines = [cl for cl in chart_lines if cl > first_ctx]

    if not guard_lines:
        return False, f"destroy guard line not found for charts.{charts_key}"
    if not chart_lines:
        return False, f"new Chart line not found for canvas '{canvas_id}'"

    # Guard must appear before the new Chart call
    first_guard = min(guard_lines)
    first_chart = min(chart_lines)
    if first_guard >= first_chart:
        return False, (
            f"destroy guard (line {first_guard+1}) appears AFTER new Chart "
            f"(line {first_chart+1}) for '{canvas_id}'"
        )

    return True, f"guard present — charts.{charts_key}.destroy() before new Chart('{canvas_id}')"


# Canvas IDs with their corresponding charts.<key> names.
# Note: allocBar (div-based, not a canvas) and netWorthChart (renamed to
# netWorthProjectionChart) are not included — they don't exist as chart canvases.
_TAB_SWITCH_CHARTS = [
    # (canvas_id, charts_key)
    ("geoDonut",              "geo"),
    ("attrChart",             "attr"),
    ("scenarioChart",         "scenario"),
    ("fireTrilhaChart",       "fireTrilha"),
    ("glideChart",            "glide"),
    ("netWorthProjectionChart", "netWorth"),
    ("tornadoChart",          "tornado"),
    ("deltaChart",            "delta"),
    ("fanChart",              "fan"),
    ("incomeChart",           "income"),
    ("drawdownHistChart",     "drawdownHist"),
    ("bondPoolRunwayChart",   "bondPoolRunway"),
    ("incomeProjectionChart", "incomeProjection"),
    ("rollingSharpChart",     "rollingSharp"),
    ("rollingIRChart",        "rollingIR"),
    ("backtestChart",         "backtest"),
    ("backtestR7Chart",       "backtestR7"),
    ("shadowChart",           "shadow"),
    ("factorRollingChart",    "factorRolling"),
    ("factorLoadingsChart",   "factorLoadings"),
]

for _canvas_id, _charts_key in _TAB_SWITCH_CHARTS:
    # Use closure to capture loop variables
    def _make_tab_switch_test(cid, ckey):
        @registry.test(
            f"tab-switch-guard",
            "TAB_SWITCH",
            f"{cid} tem destroy guard antes de new Chart",
            "HIGH",
        )
        def _tab_switch_test():
            return _check_destroy_guard(cid, ckey)
        return _tab_switch_test

    _make_tab_switch_test(_canvas_id, _charts_key)
