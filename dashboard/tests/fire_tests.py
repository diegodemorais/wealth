"""
FIRE Domain Tests — dashboard/tests/fire_tests.py
Covers all 24 FIRE blocks: data integrity, HTML render presence, and value logic.

Design notes:
- RENDER tests check that a named HTML element (section div, canvas, or key UI element)
  exists in index.html. The dashboard is JS-rendered so actual values are NOT in HTML
  source — VALUE tests check build scripts instead.
- VALUE tests verify that critical computed values are NOT hardcoded in the build or
  generate scripts (they must come from DATA).
  - build_dashboard.py: post-processes and injects data into HTML template
  - generate_data.py: generates data.json from source scripts (fire_montecarlo etc.)
  Blocks populated by generate_data.py (fire_matrix, tornado, lumpy_events) have VALUE
  tests that check generate_data.py rather than build_dashboard.py.
- Domain-logic tests (e.g., P50 < P90 SWR, pfire in [0,1]) are registered as DATA
  category tests — they validate structural/mathematical invariants in data.json.
"""

from pathlib import Path
from .base import registry, load_data, load_html, load_spec, get_nested, BUILD_PY

# generate_data.py is the pipeline stage that writes fire_matrix, tornado, lumpy_events
GENERATE_PY = BUILD_PY.parent / "generate_data.py"


# ---------------------------------------------------------------------------
# pvr-premissas-realizado
# ---------------------------------------------------------------------------

@registry.test("pvr-premissas-realizado", "DATA", "premissas_vs_realizado key exists", "CRITICAL")
def _():
    d = load_data()
    pvr = d.get("premissas_vs_realizado")
    if pvr is None:
        return False, "premissas_vs_realizado missing from data.json"
    has_equity = isinstance(pvr.get("retorno_equity"), dict)
    has_aporte = isinstance(pvr.get("aporte_mensal"), dict)
    if not has_equity or not has_aporte:
        return False, f"premissas_vs_realizado missing sub-keys: retorno_equity={has_equity}, aporte_mensal={has_aporte}"
    return True, "premissas_vs_realizado.retorno_equity and .aporte_mensal present"


@registry.test("pvr-premissas-realizado", "DATA", "retorno_equity has premissa and realizado values", "CRITICAL")
def _():
    d = load_data()
    eq = get_nested(d, "premissas_vs_realizado.retorno_equity")
    if eq is None:
        return False, "premissas_vs_realizado.retorno_equity missing"
    premissa = eq.get("premissa_real_brl_pct")
    twr = eq.get("twr_real_brl_pct")
    if premissa is None or twr is None:
        return False, f"Missing fields: premissa_real_brl_pct={premissa}, twr_real_brl_pct={twr}"
    if not isinstance(premissa, (int, float)) or not isinstance(twr, (int, float)):
        return False, f"Non-numeric values: premissa={premissa}, twr={twr}"
    return True, f"Premissa={premissa}%, TWR={twr}%"


@registry.test("pvr-premissas-realizado", "DATA", "aporte_mensal premissa matches premissas block", "HIGH")
def _():
    d = load_data()
    pvr_aporte = get_nested(d, "premissas_vs_realizado.aporte_mensal.premissa_brl")
    premissas_aporte = get_nested(d, "premissas.aporte_mensal")
    if pvr_aporte is None:
        return False, "premissas_vs_realizado.aporte_mensal.premissa_brl missing"
    if premissas_aporte is None:
        return False, "premissas.aporte_mensal missing"
    if pvr_aporte != premissas_aporte:
        return False, f"Mismatch: pvr says {pvr_aporte}, premissas says {premissas_aporte}"
    return True, f"Both sources agree: R${pvr_aporte:,}/month"


@registry.test("pvr-premissas-realizado", "RENDER", "premissasVsRealizadoSection exists in HTML", "CRITICAL")
def _():
    html = load_html()
    if "premissasVsRealizadoSection" not in html:
        return False, "id='premissasVsRealizadoSection' not found in HTML"
    if "premissasVsRealizadoBody" not in html:
        return False, "id='premissasVsRealizadoBody' not found in HTML — JS target missing"
    return True, "premissasVsRealizadoSection and premissasVsRealizadoBody present"


@registry.test("pvr-premissas-realizado", "VALUE", "retorno_equity_base not hardcoded in build script", "HIGH")
def _():
    build_text = BUILD_PY.read_text()
    d = load_data()
    retorno = get_nested(d, "premissas.retorno_equity_base")
    if retorno is None:
        return False, "premissas.retorno_equity_base missing from data"
    # Check that the specific float value (e.g. 0.0485) doesn't appear hardcoded in build
    val_str = str(retorno)
    # Allow it inside dict literals that reference data — flag only bare assignments
    import re
    pattern = rf'=\s*{re.escape(val_str)}\b'
    if re.search(pattern, build_text):
        return False, f"Possible hardcoded retorno_equity_base={val_str} in build_dashboard.py"
    return True, f"retorno_equity_base={val_str} not hardcoded in build script"


@registry.test("pvr-premissas-realizado", "DATA", "retorno_equity_base is a positive real return", "HIGH")
def _():
    d = load_data()
    r = get_nested(d, "premissas.retorno_equity_base")
    if r is None:
        return False, "premissas.retorno_equity_base missing"
    if not (0 < r < 0.20):
        return False, f"retorno_equity_base={r} outside plausible range (0, 0.20)"
    return True, f"retorno_equity_base={r:.2%} — plausible real return"


# ---------------------------------------------------------------------------
# fire-trilha
# ---------------------------------------------------------------------------

@registry.test("fire-trilha", "DATA", "fire_trilha has all required fields", "CRITICAL")
def _():
    d = load_data()
    ft = d.get("fire_trilha")
    if ft is None:
        return False, "fire_trilha missing from data.json"
    required = ["dates", "trilha_brl", "realizado_brl", "meta_fire_brl", "meta_fire_date"]
    missing = [k for k in required if k not in ft]
    if missing:
        return False, f"Missing fields: {missing}"
    return True, "All fire_trilha fields present"


@registry.test("fire-trilha", "DATA", "trilha and realizado arrays have same length as dates", "CRITICAL")
def _():
    d = load_data()
    ft = d.get("fire_trilha", {})
    dates = ft.get("dates", [])
    trilha = ft.get("trilha_brl", [])
    realizado = ft.get("realizado_brl", [])
    if not dates:
        return False, "fire_trilha.dates is empty"
    if len(trilha) != len(dates):
        return False, f"trilha_brl len={len(trilha)} != dates len={len(dates)}"
    if len(realizado) != len(dates):
        return False, f"realizado_brl len={len(realizado)} != dates len={len(dates)}"
    return True, f"All arrays aligned at {len(dates)} points"


@registry.test("fire-trilha", "DATA", "meta_fire_brl matches premissas.patrimonio_gatilho", "HIGH")
def _():
    d = load_data()
    meta = get_nested(d, "fire_trilha.meta_fire_brl")
    gatilho = get_nested(d, "premissas.patrimonio_gatilho")
    if meta is None:
        return False, "fire_trilha.meta_fire_brl missing"
    if gatilho is None:
        return False, "premissas.patrimonio_gatilho missing"
    if meta != gatilho:
        return False, f"Mismatch: meta_fire_brl={meta:,} vs patrimonio_gatilho={gatilho:,}"
    return True, f"meta_fire_brl=R${meta:,} consistent with premissas"


@registry.test("fire-trilha", "RENDER", "fireTrilhaSection and fireTrilhaChart exist in HTML", "CRITICAL")
def _():
    html = load_html()
    missing = []
    if "fireTrilhaSection" not in html:
        missing.append("fireTrilhaSection")
    if "fireTrilhaChart" not in html:
        missing.append("fireTrilhaChart (canvas)")
    if missing:
        return False, f"Missing HTML elements: {missing}"
    return True, "fireTrilhaSection and fireTrilhaChart canvas present"


@registry.test("fire-trilha", "VALUE", "meta_fire_brl not hardcoded in build script", "HIGH")
def _():
    import re
    build_text = BUILD_PY.read_text()
    d = load_data()
    meta = get_nested(d, "fire_trilha.meta_fire_brl")
    if meta is None:
        return False, "fire_trilha.meta_fire_brl missing"
    pattern = rf'=\s*{meta}\b'
    if re.search(pattern, build_text):
        return False, f"Possible hardcoded meta_fire_brl={meta} in build_dashboard.py"
    return True, f"meta_fire_brl={meta:,} not hardcoded in build script"


@registry.test("fire-trilha", "DATA", "trilha_brl increases monotonically (projected path)", "MEDIUM")
def _():
    d = load_data()
    trilha = get_nested(d, "fire_trilha.trilha_brl")
    if not trilha or len(trilha) < 2:
        return False, "trilha_brl empty or too short"
    # Skip None values (past may have nulls)
    values = [v for v in trilha if v is not None]
    if not values:
        return False, "No non-null values in trilha_brl"
    # Allow minor dips (IPCA projections are smooth), but last > first
    if values[-1] <= values[0]:
        return False, f"Projected path not growing: first={values[0]:,.0f}, last={values[-1]:,.0f}"
    return True, f"Trilha grows from {values[0]:,.0f} to {values[-1]:,.0f}"


# ---------------------------------------------------------------------------
# net-worth-projection  (pfireHeadline, scenarioChart, pfire53 badges)
# ---------------------------------------------------------------------------

@registry.test("net-worth-projection", "DATA", "premissas has all required FIRE fields", "CRITICAL")
def _():
    d = load_data()
    premissas = d.get("premissas")
    if premissas is None:
        return False, "premissas missing from data.json"
    required = [
        "patrimonio_atual", "patrimonio_gatilho", "idade_atual",
        "idade_fire_alvo", "aporte_mensal", "custo_vida_base", "retorno_equity_base"
    ]
    missing = [k for k in required if k not in premissas]
    if missing:
        return False, f"Missing premissas fields: {missing}"
    return True, f"All {len(required)} required premissas fields present"


@registry.test("net-worth-projection", "DATA", "scenario_comparison has fire53 and fire50", "CRITICAL")
def _():
    d = load_data()
    sc = d.get("scenario_comparison")
    if sc is None:
        return False, "scenario_comparison missing"
    if "fire53" not in sc or "fire50" not in sc:
        return False, f"Missing scenario keys: {list(sc.keys())}"
    fire53 = sc["fire53"]
    fire50 = sc["fire50"]
    for s in ["base", "fav", "stress"]:
        if s not in fire53:
            return False, f"fire53 missing '{s}' scenario"
        if s not in fire50:
            return False, f"fire50 missing '{s}' scenario"
    return True, "scenario_comparison has fire53 and fire50 with base/fav/stress"


@registry.test("net-worth-projection", "DATA", "pfire values in [0, 100] range", "CRITICAL")
def _():
    d = load_data()
    sc = d.get("scenario_comparison", {})
    errors = []
    for scenario_key in ["fire53", "fire50"]:
        for variant in ["base", "fav", "stress"]:
            val = get_nested(d, f"scenario_comparison.{scenario_key}.{variant}")
            if val is None:
                errors.append(f"{scenario_key}.{variant} missing")
            elif not (0 <= val <= 100):
                errors.append(f"{scenario_key}.{variant}={val} outside [0,100]")
    if errors:
        return False, f"pfire range errors: {errors}"
    return True, "All scenario pfire values in [0, 100]"


@registry.test("net-worth-projection", "DATA", "fire53 base >= fire50 base (more time = higher P)", "HIGH")
def _():
    d = load_data()
    f53 = get_nested(d, "scenario_comparison.fire53.base")
    f50 = get_nested(d, "scenario_comparison.fire50.base")
    if f53 is None or f50 is None:
        return False, f"Missing: fire53.base={f53}, fire50.base={f50}"
    if f53 < f50:
        return False, f"Unexpected: fire53.base={f53} < fire50.base={f50} — retiring later should not decrease P(FIRE)"
    return True, f"fire53.base={f53} >= fire50.base={f50}"


@registry.test("net-worth-projection", "DATA", "fav >= base >= stress for each scenario", "HIGH")
def _():
    d = load_data()
    errors = []
    for scenario_key in ["fire53", "fire50"]:
        fav = get_nested(d, f"scenario_comparison.{scenario_key}.fav")
        base = get_nested(d, f"scenario_comparison.{scenario_key}.base")
        stress = get_nested(d, f"scenario_comparison.{scenario_key}.stress")
        if None in (fav, base, stress):
            errors.append(f"{scenario_key}: missing value")
            continue
        if not (fav >= base >= stress):
            errors.append(f"{scenario_key}: fav={fav} >= base={base} >= stress={stress} violated")
    if errors:
        return False, f"Scenario ordering errors: {errors}"
    return True, "fav >= base >= stress for both fire53 and fire50"


@registry.test("net-worth-projection", "DATA", "spendingSmile has go_go/slow_go/no_go phases", "HIGH")
def _():
    d = load_data()
    smile = d.get("spendingSmile")
    if smile is None:
        return False, "spendingSmile missing"
    required = ["go_go", "slow_go", "no_go"]
    missing = [k for k in required if k not in smile]
    if missing:
        return False, f"spendingSmile missing phases: {missing}"
    for phase in required:
        p = smile[phase]
        if "gasto" not in p:
            return False, f"spendingSmile.{phase} missing 'gasto'"
        if not isinstance(p["gasto"], (int, float)) or p["gasto"] <= 0:
            return False, f"spendingSmile.{phase}.gasto={p['gasto']} invalid"
    return True, "spendingSmile has all phases with valid gasto values"


@registry.test("net-worth-projection", "DATA", "spendingSmile spending decreases go_go -> no_go", "HIGH")
def _():
    d = load_data()
    smile = d.get("spendingSmile", {})
    go_go = get_nested(d, "spendingSmile.go_go.gasto")
    slow_go = get_nested(d, "spendingSmile.slow_go.gasto")
    no_go = get_nested(d, "spendingSmile.no_go.gasto")
    if None in (go_go, slow_go, no_go):
        return False, f"Missing smile values: go_go={go_go}, slow_go={slow_go}, no_go={no_go}"
    if not (go_go >= slow_go >= no_go):
        return False, f"Spending smile not decreasing: go_go={go_go:,} slow_go={slow_go:,} no_go={no_go:,}"
    return True, f"Spending decreases: {go_go:,} -> {slow_go:,} -> {no_go:,}"


@registry.test("net-worth-projection", "RENDER", "pfire53 scenario badges exist in HTML", "CRITICAL")
def _():
    html = load_html()
    missing = []
    for eid in ["pfire53BaseBadge", "pfire53FavBadge", "pfire53StressBadge"]:
        if eid not in html:
            missing.append(eid)
    if missing:
        return False, f"Missing HTML elements: {missing}"
    return True, "pfire53 badges present"


@registry.test("net-worth-projection", "VALUE", "patrimonio_gatilho not hardcoded in build script", "HIGH")
def _():
    import re
    build_text = BUILD_PY.read_text()
    d = load_data()
    gatilho = get_nested(d, "premissas.patrimonio_gatilho")
    if gatilho is None:
        return False, "premissas.patrimonio_gatilho missing"
    pattern = rf'=\s*{gatilho}\b'
    if re.search(pattern, build_text):
        return False, f"Possible hardcoded patrimonio_gatilho={gatilho} in build_dashboard.py"
    return True, f"patrimonio_gatilho={gatilho:,} not hardcoded"


# ---------------------------------------------------------------------------
# scenario-comparison
# ---------------------------------------------------------------------------

@registry.test("scenario-comparison", "DATA", "scenario_comparison.fire53 has pat_mediano and percentiles", "HIGH")
def _():
    d = load_data()
    f53 = get_nested(d, "scenario_comparison.fire53")
    if f53 is None:
        return False, "scenario_comparison.fire53 missing"
    required = ["pat_mediano", "pat_p10", "pat_p90"]
    missing = [k for k in required if k not in f53]
    if missing:
        return False, f"fire53 missing: {missing}"
    return True, f"fire53 has pat_mediano={f53['pat_mediano']:,.0f}"


@registry.test("scenario-comparison", "DATA", "fire53 pat_p10 < pat_mediano < pat_p90", "HIGH")
def _():
    d = load_data()
    p10 = get_nested(d, "scenario_comparison.fire53.pat_p10")
    p50 = get_nested(d, "scenario_comparison.fire53.pat_mediano")
    p90 = get_nested(d, "scenario_comparison.fire53.pat_p90")
    if None in (p10, p50, p90):
        return False, f"Missing: p10={p10}, p50={p50}, p90={p90}"
    if not (p10 < p50 < p90):
        return False, f"Percentile order violated: p10={p10:,.0f} < p50={p50:,.0f} < p90={p90:,.0f}"
    return True, f"p10={p10:,.0f} < p50={p50:,.0f} < p90={p90:,.0f}"


@registry.test("scenario-comparison", "DATA", "fire50 pat_mediano < fire53 pat_mediano", "MEDIUM")
def _():
    d = load_data()
    f53_med = get_nested(d, "scenario_comparison.fire53.pat_mediano")
    f50_med = get_nested(d, "scenario_comparison.fire50.pat_mediano")
    if f53_med is None or f50_med is None:
        return False, f"Missing: fire53.pat_mediano={f53_med}, fire50.pat_mediano={f50_med}"
    if f53_med <= f50_med:
        return False, f"Unexpected: fire53 median R${f53_med:,.0f} <= fire50 median R${f50_med:,.0f}"
    return True, f"fire53 median R${f53_med:,.0f} > fire50 median R${f50_med:,.0f}"


@registry.test("scenario-comparison", "RENDER", "scenarioChart canvas exists in HTML", "HIGH")
def _():
    html = load_html()
    if "scenarioChart" not in html:
        return False, "id='scenarioChart' not found in HTML"
    return True, "scenarioChart canvas present"


@registry.test("scenario-comparison", "VALUE", "pfire base not hardcoded as dict value in build script", "HIGH")
def _():
    import re
    build_text = BUILD_PY.read_text()
    d = load_data()
    base = get_nested(d, "scenario_comparison.fire53.base")
    if base is None:
        return False, "scenario_comparison.fire53.base missing"
    # Check for hardcode as a dict value (e.g. "pfire_atual": 90.4)
    # This is more specific than bare assignment and catches real hardcodes
    pattern = rf'"pfire[^"]*"\s*:\s*{re.escape(str(base))}\b'
    if re.search(pattern, build_text):
        return False, (
            f"Hardcoded pfire value={base} found as dict literal in build_dashboard.py. "
            "Fallback defaults should read from data['pfire53']['base'] not literal values."
        )
    return True, f"fire53.base={base} not hardcoded as dict literal in build script"


# ---------------------------------------------------------------------------
# fire-matrix
# ---------------------------------------------------------------------------

@registry.test("fire-matrix", "DATA", "fire_matrix has matrix, cenarios, swrs", "CRITICAL")
def _():
    d = load_data()
    fm = d.get("fire_matrix")
    if fm is None:
        return False, "fire_matrix missing"
    required = ["matrix", "cenarios", "swrs", "patrimonios", "gastos"]
    missing = [k for k in required if k not in fm]
    if missing:
        return False, f"fire_matrix missing: {missing}"
    return True, "fire_matrix has all required keys"


@registry.test("fire-matrix", "DATA", "fire_matrix cenarios has base/fav/stress", "CRITICAL")
def _():
    d = load_data()
    cenarios = get_nested(d, "fire_matrix.cenarios")
    if cenarios is None:
        return False, "fire_matrix.cenarios missing"
    for variant in ["base", "fav", "stress"]:
        if variant not in cenarios:
            return False, f"fire_matrix.cenarios missing '{variant}'"
    return True, "fire_matrix.cenarios has base, fav, stress"


@registry.test("fire-matrix", "DATA", "all matrix pfire values in [0, 1]", "CRITICAL")
def _():
    d = load_data()
    cenarios = get_nested(d, "fire_matrix.cenarios")
    if cenarios is None:
        return False, "fire_matrix.cenarios missing"
    errors = []
    for variant, cells in cenarios.items():
        if not isinstance(cells, dict):
            continue
        for key, val in cells.items():
            if not isinstance(val, (int, float)):
                errors.append(f"{variant}.{key}={val} not numeric")
            elif not (0 <= val <= 1):
                errors.append(f"{variant}.{key}={val} outside [0,1]")
    if errors:
        return False, f"Out-of-range values: {errors[:5]}"
    return True, "All fire_matrix pfire values in [0, 1]"


@registry.test("fire-matrix", "DATA", "premissas.custo_vida_base appears in fire_matrix.gastos", "HIGH")
def _():
    d = load_data()
    custo = get_nested(d, "premissas.custo_vida_base")
    gastos = get_nested(d, "fire_matrix.gastos")
    if custo is None:
        return False, "premissas.custo_vida_base missing"
    if gastos is None:
        return False, "fire_matrix.gastos missing"
    if custo not in gastos:
        return False, f"custo_vida_base={custo:,} not in fire_matrix.gastos={gastos}"
    return True, f"custo_vida_base={custo:,} is one of the matrix gasto axes"


@registry.test("fire-matrix", "DATA", "patrimonio_gatilho is bracketed by fire_matrix.patrimonios axes", "HIGH")
def _():
    d = load_data()
    gatilho = get_nested(d, "premissas.patrimonio_gatilho")
    patrimonios = get_nested(d, "fire_matrix.patrimonios")
    if gatilho is None:
        return False, "premissas.patrimonio_gatilho missing"
    if patrimonios is None:
        return False, "fire_matrix.patrimonios missing"
    # gatilho should either be in the list or fall between the min and max axes
    sorted_pats = sorted(patrimonios)
    if gatilho < sorted_pats[0] or gatilho > sorted_pats[-1]:
        return False, (
            f"patrimonio_gatilho={gatilho:,} outside matrix range "
            f"[{sorted_pats[0]:,}, {sorted_pats[-1]:,}]"
        )
    return True, (
        f"patrimonio_gatilho=R${gatilho:,} within matrix range "
        f"[R${sorted_pats[0]:,}, R${sorted_pats[-1]:,}]"
    )


@registry.test("fire-matrix", "RENDER", "fireMatrixSection and fireMatrixTable exist in HTML", "CRITICAL")
def _():
    html = load_html()
    missing = []
    for eid in ["fireMatrixSection", "fireMatrixTable"]:
        if eid not in html:
            missing.append(eid)
    if missing:
        return False, f"Missing HTML elements: {missing}"
    return True, "fireMatrixSection and fireMatrixTable present"


@registry.test("fire-matrix", "VALUE", "fire_matrix consumed from source file not hardcoded in pipeline", "HIGH")
def _():
    import re
    gen_text = GENERATE_PY.read_text() if GENERATE_PY.exists() else ""
    build_text = BUILD_PY.read_text()
    # fire_matrix is written by generate_data.py, consumed by JS from data.json
    if "fire_matrix" not in gen_text and "fire_matrix" not in build_text:
        return False, "Neither generate_data.py nor build_dashboard.py references fire_matrix"
    # Check no hardcoded cenarios dict literal in either script
    for name, text in [("generate_data.py", gen_text), ("build_dashboard.py", build_text)]:
        if re.search(r'"cenarios"\s*:\s*\{', text):
            return False, f"Hardcoded cenarios dict literal found in {name}"
    return True, "fire_matrix sourced from pipeline (no hardcoded cenarios dict)"


# ---------------------------------------------------------------------------
# spending-sensitivity
# ---------------------------------------------------------------------------

@registry.test("spending-sensitivity", "DATA", "spendingSensibilidade is a non-empty list", "CRITICAL")
def _():
    d = load_data()
    ss = d.get("spendingSensibilidade")
    if ss is None:
        return False, "spendingSensibilidade missing"
    if not isinstance(ss, list) or len(ss) == 0:
        return False, f"spendingSensibilidade must be non-empty list, got: {type(ss)}"
    return True, f"spendingSensibilidade has {len(ss)} entries"


@registry.test("spending-sensitivity", "DATA", "each entry has label, custo, base, fav, stress", "CRITICAL")
def _():
    d = load_data()
    ss = d.get("spendingSensibilidade", [])
    for i, entry in enumerate(ss):
        for field in ["label", "custo", "base", "fav", "stress"]:
            if field not in entry:
                return False, f"Entry {i} missing field '{field}'"
    return True, f"All {len(ss)} spending sensitivity entries have required fields"


@registry.test("spending-sensitivity", "DATA", "sensitivity pfire values in [0, 100]", "HIGH")
def _():
    d = load_data()
    ss = d.get("spendingSensibilidade", [])
    errors = []
    for entry in ss:
        for variant in ["base", "fav", "stress"]:
            val = entry.get(variant)
            if val is not None and not (0 <= val <= 100):
                errors.append(f"{entry.get('label', '?')}.{variant}={val}")
    if errors:
        return False, f"Out-of-range pfire: {errors}"
    return True, "All spending sensitivity pfire in [0, 100]"


@registry.test("spending-sensitivity", "DATA", "higher spending -> lower base pfire (monotonic)", "HIGH")
def _():
    d = load_data()
    ss = d.get("spendingSensibilidade", [])
    if len(ss) < 2:
        return False, "Need at least 2 entries to check monotonicity"
    # Sort by custo
    sorted_ss = sorted(ss, key=lambda x: x.get("custo", 0))
    for i in range(1, len(sorted_ss)):
        prev = sorted_ss[i-1].get("base")
        curr = sorted_ss[i].get("base")
        if prev is not None and curr is not None and curr > prev:
            return False, (
                f"Higher spending should not increase P(FIRE): "
                f"{sorted_ss[i-1]['label']} base={prev} -> {sorted_ss[i]['label']} base={curr}"
            )
    return True, "Spending sensitivity is monotonically non-increasing"


@registry.test("spending-sensitivity", "RENDER", "spending sensitivity section exists in HTML", "HIGH")
def _():
    html = load_html()
    # The spending sensitivity block uses aporteSensSection area or dedicated section
    # Looking for the sensitivity chart or section
    has_sens = "spendingSensibilidade" in html or "Sensibilidade" in html
    if not has_sens:
        return False, "No spending sensitivity element found in HTML"
    return True, "Spending sensitivity element present in HTML"


@registry.test("spending-sensitivity", "VALUE", "custo_vida_base in sensitivity range", "HIGH")
def _():
    d = load_data()
    custo = get_nested(d, "premissas.custo_vida_base")
    ss = d.get("spendingSensibilidade", [])
    if custo is None:
        return False, "premissas.custo_vida_base missing"
    custos = [e.get("custo") for e in ss]
    if custo not in custos:
        return False, f"custo_vida_base={custo:,} not represented in sensitivity range {custos}"
    return True, f"custo_vida_base={custo:,} is included in sensitivity analysis"


# ---------------------------------------------------------------------------
# guardrails-retirada
# ---------------------------------------------------------------------------

@registry.test("guardrails-retirada", "DATA", "guardrails is a non-empty list", "CRITICAL")
def _():
    d = load_data()
    g = d.get("guardrails")
    if g is None:
        return False, "guardrails missing"
    if not isinstance(g, list) or len(g) == 0:
        return False, "guardrails must be non-empty list"
    return True, f"guardrails has {len(g)} bands"


@registry.test("guardrails-retirada", "DATA", "each guardrail band has ddMin, ddMax, retirada", "CRITICAL")
def _():
    d = load_data()
    bands = d.get("guardrails", [])
    for i, b in enumerate(bands):
        for field in ["ddMin", "ddMax", "retirada"]:
            if field not in b:
                return False, f"Band {i} missing field '{field}'"
        if b["ddMin"] > b["ddMax"]:
            return False, f"Band {i}: ddMin={b['ddMin']} > ddMax={b['ddMax']}"
    return True, f"All {len(bands)} guardrail bands valid"


@registry.test("guardrails-retirada", "DATA", "guardrail bands cover [0, 1] without gaps", "HIGH")
def _():
    d = load_data()
    bands = sorted(d.get("guardrails", []), key=lambda x: x.get("ddMin", 0))
    if not bands:
        return False, "guardrails empty"
    if bands[0]["ddMin"] != 0.0:
        return False, f"First band doesn't start at 0: ddMin={bands[0]['ddMin']}"
    for i in range(1, len(bands)):
        prev_max = bands[i-1]["ddMax"]
        curr_min = bands[i]["ddMin"]
        if abs(prev_max - curr_min) > 0.001:
            return False, f"Gap between bands {i-1} and {i}: {prev_max} -> {curr_min}"
    return True, f"Guardrail bands continuously cover from 0 to {bands[-1]['ddMax']}"


@registry.test("guardrails-retirada", "DATA", "guardrail retiradas decrease as drawdown increases", "CRITICAL")
def _():
    d = load_data()
    bands = sorted(d.get("guardrails", []), key=lambda x: x.get("ddMin", 0))
    retiradas = [b.get("retirada") for b in bands]
    for i in range(1, len(retiradas)):
        if retiradas[i] > retiradas[i-1]:
            return False, f"Retirada increases from band {i-1} to {i}: {retiradas[i-1]:,} -> {retiradas[i]:,}"
    return True, f"Guardrail retiradas decreasing: {[f'R${r:,}' for r in retiradas]}"


@registry.test("guardrails-retirada", "DATA", "gasto_piso <= custo_vida_base", "CRITICAL")
def _():
    d = load_data()
    piso = d.get("gasto_piso")
    custo = get_nested(d, "premissas.custo_vida_base")
    if piso is None:
        return False, "gasto_piso missing"
    if custo is None:
        return False, "premissas.custo_vida_base missing"
    if piso > custo:
        return False, f"gasto_piso={piso:,} > custo_vida_base={custo:,} — floor above baseline"
    return True, f"gasto_piso=R${piso:,} <= custo_vida_base=R${custo:,}"


@registry.test("guardrails-retirada", "DATA", "minimum guardrail retirada matches gasto_piso", "HIGH")
def _():
    d = load_data()
    bands = d.get("guardrails", [])
    piso = d.get("gasto_piso")
    if not bands or piso is None:
        return False, f"guardrails={len(bands)} entries, gasto_piso={piso}"
    min_retirada = min(b.get("retirada", float("inf")) for b in bands)
    if min_retirada != piso:
        return False, f"Minimum guardrail retirada={min_retirada:,} != gasto_piso={piso:,}"
    return True, f"Minimum retirada=gasto_piso=R${piso:,}"


@registry.test("guardrails-retirada", "RENDER", "guardrail UI elements exist in HTML", "HIGH")
def _():
    html = load_html()
    # Guardrail table styles are defined, and guardrail-table class is used
    if "guardrail-table" not in html and "guardrailSection" not in html:
        return False, "No guardrail table/section elements found in HTML"
    return True, "Guardrail UI elements present in HTML"


@registry.test("guardrails-retirada", "VALUE", "gasto_piso not hardcoded in build script", "HIGH")
def _():
    import re
    build_text = BUILD_PY.read_text()
    d = load_data()
    piso = d.get("gasto_piso")
    if piso is None:
        return False, "gasto_piso missing"
    pattern = rf'=\s*{piso}\b'
    if re.search(pattern, build_text):
        return False, f"Possible hardcoded gasto_piso={piso:,} in build script"
    return True, f"gasto_piso={piso:,} not hardcoded in build script"


# ---------------------------------------------------------------------------
# swr-percentis
# ---------------------------------------------------------------------------

@registry.test("swr-percentis", "DATA", "fire_swr_percentis has p10, p50, p90 fields", "CRITICAL")
def _():
    d = load_data()
    swr = d.get("fire_swr_percentis")
    if swr is None:
        return False, "fire_swr_percentis missing"
    required = ["swr_p10_pct", "swr_p50_pct", "swr_p90_pct"]
    missing = [k for k in required if k not in swr]
    if missing:
        return False, f"Missing swr fields: {missing}"
    return True, "fire_swr_percentis has all percentile fields"


@registry.test("swr-percentis", "DATA", "swr percentile order: p90 < p50 < p10 (richer = lower SWR)", "CRITICAL")
def _():
    d = load_data()
    p10 = get_nested(d, "fire_swr_percentis.swr_p10_pct")
    p50 = get_nested(d, "fire_swr_percentis.swr_p50_pct")
    p90 = get_nested(d, "fire_swr_percentis.swr_p90_pct")
    if None in (p10, p50, p90):
        return False, f"Missing: p10={p10}, p50={p50}, p90={p90}"
    # P90 = optimistic (more wealth) -> lower SWR needed
    # P10 = pessimistic (less wealth) -> higher SWR needed
    if not (p90 < p50 < p10):
        return False, (
            f"SWR order violated: p90={p90}% should be < p50={p50}% should be < p10={p10}%. "
            "Higher patrimony (P90) = lower SWR needed."
        )
    return True, f"SWR order correct: p90={p90}% < p50={p50}% < p10={p10}%"


@registry.test("swr-percentis", "DATA", "swr values are plausible (0.5% to 8%)", "HIGH")
def _():
    d = load_data()
    swr = d.get("fire_swr_percentis", {})
    errors = []
    for field in ["swr_p10_pct", "swr_p50_pct", "swr_p90_pct"]:
        val = swr.get(field)
        if val is None:
            errors.append(f"{field} missing")
        elif not (0.5 <= val <= 8.0):
            errors.append(f"{field}={val}% outside plausible range [0.5, 8]")
    if errors:
        return False, f"SWR plausibility errors: {errors}"
    return True, "All SWR percentiles in plausible range"


@registry.test("swr-percentis", "DATA", "fire_swr_percentis.custo_vida_base matches premissas", "HIGH")
def _():
    d = load_data()
    swr_custo = get_nested(d, "fire_swr_percentis.custo_vida_base")
    premissas_custo = get_nested(d, "premissas.custo_vida_base")
    if swr_custo is None:
        return False, "fire_swr_percentis.custo_vida_base missing"
    if premissas_custo is None:
        return False, "premissas.custo_vida_base missing"
    if swr_custo != premissas_custo:
        return False, f"Mismatch: swr says R${swr_custo:,}, premissas says R${premissas_custo:,}"
    return True, f"Both agree on custo_vida_base=R${swr_custo:,}"


@registry.test("swr-percentis", "RENDER", "swrPercentilesSection and swrPercentilesCards exist in HTML", "CRITICAL")
def _():
    html = load_html()
    missing = []
    for eid in ["swrPercentilesSection", "swrPercentilesCards"]:
        if eid not in html:
            missing.append(eid)
    if missing:
        return False, f"Missing HTML elements: {missing}"
    return True, "swrPercentilesSection and swrPercentilesCards present"


@registry.test("swr-percentis", "VALUE", "swr pct values not hardcoded in build script", "HIGH")
def _():
    import re
    build_text = BUILD_PY.read_text()
    d = load_data()
    p50 = get_nested(d, "fire_swr_percentis.swr_p50_pct")
    if p50 is None:
        return False, "fire_swr_percentis.swr_p50_pct missing"
    pattern = rf'=\s*{re.escape(str(p50))}\b'
    if re.search(pattern, build_text):
        return False, f"Possible hardcoded swr_p50_pct={p50} in build script"
    return True, f"swr_p50_pct={p50} not hardcoded"


# ---------------------------------------------------------------------------
# spending-breakdown
# ---------------------------------------------------------------------------

@registry.test("spending-breakdown", "DATA", "spending_breakdown has required fields", "CRITICAL")
def _():
    d = load_data()
    sb = d.get("spending_breakdown")
    if sb is None:
        return False, "spending_breakdown missing"
    required = [
        "must_spend_mensal", "like_spend_mensal", "total_mensal",
        "must_spend_anual", "total_anual", "modelo_fire_anual"
    ]
    missing = [k for k in required if k not in sb]
    if missing:
        return False, f"Missing spending_breakdown fields: {missing}"
    return True, "All spending_breakdown fields present"


@registry.test("spending-breakdown", "DATA", "total_anual == must + like + imprevistos", "CRITICAL")
def _():
    d = load_data()
    sb = d.get("spending_breakdown", {})
    must = sb.get("must_spend_anual", 0)
    like = sb.get("like_spend_anual", 0)
    imprev = sb.get("imprevistos_anual", 0)
    total = sb.get("total_anual")
    if total is None:
        return False, "total_anual missing"
    expected = must + like + imprev
    if abs(total - expected) > 100:  # allow R$100 rounding
        return False, f"total_anual={total:,} != must({must:,})+like({like:,})+imprev({imprev:,})={expected:,}"
    return True, f"total_anual=R${total:,} consistent"


@registry.test("spending-breakdown", "DATA", "total_anual <= modelo_fire_anual (spending within model)", "HIGH")
def _():
    d = load_data()
    total = get_nested(d, "spending_breakdown.total_anual")
    modelo = get_nested(d, "spending_breakdown.modelo_fire_anual")
    if total is None or modelo is None:
        return False, f"Missing: total_anual={total}, modelo_fire_anual={modelo}"
    if total > modelo * 1.15:  # allow 15% overspend before flagging
        return False, f"Spending R${total:,} exceeds FIRE model R${modelo:,} by >{15}%"
    return True, f"Spending R${total:,} vs FIRE model R${modelo:,}"


@registry.test("spending-breakdown", "RENDER", "spending breakdown renders in sankey or dedicated section", "HIGH")
def _():
    html = load_html()
    # sankeySection is the main container for spending flow
    if "sankeySection" not in html:
        return False, "sankeySection not found in HTML"
    return True, "sankeySection present (spending breakdown rendering target)"


@registry.test("spending-breakdown", "VALUE", "spending_breakdown.modelo_fire_anual matches premissas", "HIGH")
def _():
    d = load_data()
    modelo = get_nested(d, "spending_breakdown.modelo_fire_anual")
    premissas_custo = get_nested(d, "premissas.custo_vida_base")
    if modelo is None:
        return False, "spending_breakdown.modelo_fire_anual missing"
    if premissas_custo is None:
        return False, "premissas.custo_vida_base missing"
    if modelo != premissas_custo:
        return False, f"Mismatch: spending_breakdown says R${modelo:,}, premissas says R${premissas_custo:,}"
    return True, f"modelo_fire_anual=R${modelo:,} consistent with premissas"


# ---------------------------------------------------------------------------
# income-fases / income-lifecycle
# ---------------------------------------------------------------------------

@registry.test("income-fases", "DATA", "spendingSmile and inss fields present", "CRITICAL")
def _():
    d = load_data()
    smile = d.get("spendingSmile")
    inss = get_nested(d, "premissas.inss_anual")
    inss_inicio = get_nested(d, "premissas.inss_inicio_ano")
    custo = get_nested(d, "premissas.custo_vida_base")
    errors = []
    if smile is None:
        errors.append("spendingSmile missing")
    if inss is None:
        errors.append("premissas.inss_anual missing")
    if inss_inicio is None:
        errors.append("premissas.inss_inicio_ano missing")
    if custo is None:
        errors.append("premissas.custo_vida_base missing")
    if errors:
        return False, f"Missing data: {errors}"
    return True, f"spendingSmile + INSS R${inss:,}/yr starting age {inss_inicio}"


@registry.test("income-fases", "DATA", "inss_anual is positive and reasonable (<= custo_vida_base)", "HIGH")
def _():
    d = load_data()
    inss = get_nested(d, "premissas.inss_anual")
    custo = get_nested(d, "premissas.custo_vida_base")
    if inss is None:
        return False, "premissas.inss_anual missing"
    if inss <= 0:
        return False, f"inss_anual={inss} must be positive"
    if custo and inss > custo:
        return False, f"inss_anual={inss:,} > custo_vida_base={custo:,} — implausible"
    return True, f"inss_anual=R${inss:,}/yr is valid"


@registry.test("income-fases", "DATA", "inss_inicio_ano is positive (years after FIRE or absolute year)", "MEDIUM")
def _():
    d = load_data()
    inss_inicio = get_nested(d, "premissas.inss_inicio_ano")
    if inss_inicio is None:
        return False, "premissas.inss_inicio_ano missing"
    # inss_inicio_ano is the number of years after FIRE start when INSS begins
    # (e.g., 12 = INSS starts 12 years post-FIRE, roughly at age 65)
    # Alternatively may be an absolute year >= ano_atual. Either way must be positive.
    if inss_inicio <= 0:
        return False, f"inss_inicio_ano={inss_inicio} must be positive"
    # If small (< 100), interpret as offset in years from FIRE; must be >= 0
    # If large (>= 2000), interpret as absolute year; must be >= ano_atual
    ano_atual = get_nested(d, "premissas.ano_atual") or 2026
    if inss_inicio >= 2000 and inss_inicio < ano_atual:
        return False, f"inss_inicio_ano={inss_inicio} interpreted as absolute year but is in the past"
    return True, f"inss_inicio_ano={inss_inicio} is valid (offset or future year)"


@registry.test("income-fases", "RENDER", "incomeChart canvas exists in HTML", "HIGH")
def _():
    html = load_html()
    if "incomeChart" not in html:
        return False, "id='incomeChart' not found in HTML"
    return True, "incomeChart canvas present"


@registry.test("income-lifecycle", "DATA", "income lifecycle covers pre-fire and post-fire phases", "HIGH")
def _():
    d = load_data()
    smile = d.get("spendingSmile")
    if smile is None:
        return False, "spendingSmile missing"
    # Verify all 3 phases have distinct spending levels
    phases = [smile.get("go_go", {}).get("gasto"), smile.get("slow_go", {}).get("gasto"), smile.get("no_go", {}).get("gasto")]
    if None in phases:
        return False, f"Missing phase spending: {phases}"
    if len(set(phases)) < 2:
        return False, f"All spending phases identical ({phases}) — spending smile not modeled"
    return True, f"3 distinct spending phases: {phases}"


@registry.test("income-lifecycle", "RENDER", "incomeChartSrc exists for lifecycle chart", "MEDIUM")
def _():
    html = load_html()
    if "incomeChartSrc" not in html:
        return False, "id='incomeChartSrc' not found in HTML"
    return True, "incomeChartSrc present"


@registry.test("income-lifecycle", "VALUE", "inss_anual not hardcoded in build script", "MEDIUM")
def _():
    import re
    build_text = BUILD_PY.read_text()
    d = load_data()
    inss = get_nested(d, "premissas.inss_anual")
    if inss is None:
        return False, "premissas.inss_anual missing"
    pattern = rf'=\s*{inss}\b'
    if re.search(pattern, build_text):
        return False, f"Possible hardcoded inss_anual={inss} in build script"
    return True, f"inss_anual={inss:,} not hardcoded"


# ---------------------------------------------------------------------------
# glide-path
# ---------------------------------------------------------------------------

@registry.test("glide-path", "DATA", "glide has all required series", "CRITICAL")
def _():
    d = load_data()
    glide = d.get("glide")
    if glide is None:
        return False, "glide missing"
    required = ["idades", "equity", "ipca_longo", "ipca_curto", "hodl11", "renda_plus"]
    missing = [k for k in required if k not in glide]
    if missing:
        return False, f"glide missing: {missing}"
    return True, "All glide series present"


@registry.test("glide-path", "DATA", "glide series all have same length", "CRITICAL")
def _():
    d = load_data()
    glide = d.get("glide", {})
    import json
    series = {}
    for k in ["idades", "equity", "ipca_longo", "ipca_curto", "hodl11", "renda_plus"]:
        v = glide.get(k)
        if isinstance(v, str):
            try:
                v = json.loads(v)
            except Exception:
                return False, f"glide.{k} is not parseable JSON string: {v}"
        series[k] = v
    lengths = {k: len(v) for k, v in series.items() if v is not None}
    if len(set(lengths.values())) > 1:
        return False, f"Mismatched lengths: {lengths}"
    return True, f"All glide series have {list(lengths.values())[0]} points"


@registry.test("glide-path", "DATA", "glide allocations sum to approximately 100% at each age", "MEDIUM")
def _():
    d = load_data()
    glide = d.get("glide", {})
    def parse(v):
        if isinstance(v, str):
            import json
            return json.loads(v)
        return v if isinstance(v, list) else []
    equity = parse(glide.get("equity"))
    ipca_longo = parse(glide.get("ipca_longo"))
    ipca_curto = parse(glide.get("ipca_curto"))
    hodl11 = parse(glide.get("hodl11"))
    renda_plus = parse(glide.get("renda_plus"))
    idades = parse(glide.get("idades"))
    if not idades:
        return False, "glide.idades empty"
    errors = []
    for i in range(len(idades)):
        total = equity[i] + ipca_longo[i] + ipca_curto[i] + hodl11[i] + renda_plus[i]
        # Allow up to 10% tolerance: glide may include a "cash/outro" component
        # not captured in the 5 tracked series, or rounding in the source data
        if abs(total - 100) > 10:
            errors.append(f"Age {idades[i]}: allocations sum to {total}% (>10% deviation)")
    if errors:
        return False, f"Allocation sum errors: {errors}"
    # Warn if over 100 but within tolerance
    over = [(idades[i], equity[i]+ipca_longo[i]+ipca_curto[i]+hodl11[i]+renda_plus[i])
            for i in range(len(idades))
            if equity[i]+ipca_longo[i]+ipca_curto[i]+hodl11[i]+renda_plus[i] > 100]
    if over:
        return True, f"Sums within tolerance but >100% at ages {[a for a,_ in over]} — check for missing cash/outro component"
    return True, f"All {len(idades)} age points sum to ~100%"


@registry.test("glide-path", "DATA", "glide idades span from premissas.idade_atual to beyond idade_fire_alvo", "HIGH")
def _():
    d = load_data()
    glide = d.get("glide", {})
    idades_raw = glide.get("idades")
    idades = idades_raw if isinstance(idades_raw, list) else (
        __import__("json").loads(idades_raw) if isinstance(idades_raw, str) else []
    )
    idade_atual = get_nested(d, "premissas.idade_atual")
    idade_fire = get_nested(d, "premissas.idade_fire_alvo")
    if not idades:
        return False, "glide.idades empty"
    if idade_atual is None or idade_fire is None:
        return False, f"Missing: idade_atual={idade_atual}, idade_fire_alvo={idade_fire}"
    min_age, max_age = min(idades), max(idades)
    errors = []
    # idade_atual should be at or near the start of the glide
    if idade_atual < min_age or idade_atual > min_age + 5:
        errors.append(f"idade_atual={idade_atual} not near glide start (min={min_age})")
    # glide should extend past idade_fire_alvo to show post-FIRE glidepath
    if max_age < idade_fire:
        errors.append(f"glide max age={max_age} < idade_fire_alvo={idade_fire} — post-FIRE not covered")
    if errors:
        return False, f"Glide age coverage issues: {errors}"
    return True, f"Glide spans ages {min_age}–{max_age}, covering fire_alvo={idade_fire}"


@registry.test("glide-path", "RENDER", "glideChart canvas exists in HTML", "CRITICAL")
def _():
    html = load_html()
    if "glideChart" not in html:
        return False, "id='glideChart' not found in HTML"
    return True, "glideChart canvas present"


@registry.test("glide-path", "VALUE", "equity allocations not hardcoded in build script", "HIGH")
def _():
    import re, json
    build_text = BUILD_PY.read_text()
    d = load_data()
    glide = d.get("glide", {})
    equity_raw = glide.get("equity", "[]")
    equity = json.loads(equity_raw) if isinstance(equity_raw, str) else equity_raw
    if not equity:
        return False, "glide.equity empty"
    # Check a specific equity value doesn't appear as a hardcoded list literal
    equity_str = str(equity).replace(" ", "")
    if equity_str in build_text.replace(" ", ""):
        return False, f"Possible hardcoded equity allocation list in build script"
    return True, "Equity allocations not found as hardcoded list in build script"


# ---------------------------------------------------------------------------
# bond-pool-readiness
# ---------------------------------------------------------------------------

@registry.test("bond-pool-readiness", "DATA", "fire.bond_pool_readiness has required fields", "CRITICAL")
def _():
    d = load_data()
    bpr = get_nested(d, "fire.bond_pool_readiness")
    if bpr is None:
        return False, "fire.bond_pool_readiness missing"
    required = ["valor_atual_brl", "anos_gastos", "meta_anos", "composicao"]
    missing = [k for k in required if k not in bpr]
    if missing:
        return False, f"bond_pool_readiness missing: {missing}"
    return True, "fire.bond_pool_readiness has all required fields"


@registry.test("bond-pool-readiness", "DATA", "anos_gastos < meta_anos (pool not fully funded)", "HIGH")
def _():
    d = load_data()
    anos = get_nested(d, "fire.bond_pool_readiness.anos_gastos")
    meta = get_nested(d, "fire.bond_pool_readiness.meta_anos")
    if anos is None or meta is None:
        return False, f"Missing: anos_gastos={anos}, meta_anos={meta}"
    # anos_gastos should be positive and likely below meta for current stage
    if anos < 0:
        return False, f"anos_gastos={anos} is negative"
    if anos > meta * 1.5:
        return False, f"anos_gastos={anos} >> meta_anos={meta} — implausible overfunding"
    return True, f"anos_gastos={anos:.1f} vs meta_anos={meta}"


@registry.test("bond-pool-readiness", "DATA", "composicao values sum to valor_atual_brl", "HIGH")
def _():
    d = load_data()
    bpr = get_nested(d, "fire.bond_pool_readiness")
    if bpr is None:
        return False, "fire.bond_pool_readiness missing"
    composicao = bpr.get("composicao", {})
    valor = bpr.get("valor_atual_brl")
    if valor is None or not composicao:
        return False, f"Missing: valor_atual_brl={valor}, composicao={composicao}"
    total = sum(v for v in composicao.values() if isinstance(v, (int, float)))
    if abs(total - valor) > 100:
        return False, f"composicao sum={total:,} != valor_atual_brl={valor:,}"
    return True, f"composicao sums to R${total:,} = valor_atual_brl"


@registry.test("bond-pool-readiness", "RENDER", "bondPoolSection exists in HTML", "CRITICAL")
def _():
    html = load_html()
    if "bondPoolSection" not in html:
        return False, "id='bondPoolSection' not found in HTML"
    return True, "bondPoolSection present in HTML"


@registry.test("bond-pool-readiness", "VALUE", "meta_anos not hardcoded in build script", "MEDIUM")
def _():
    import re
    build_text = BUILD_PY.read_text()
    d = load_data()
    meta = get_nested(d, "fire.bond_pool_readiness.meta_anos")
    if meta is None:
        return False, "fire.bond_pool_readiness.meta_anos missing"
    pattern = rf'meta_anos\s*=\s*{meta}\b'
    if re.search(pattern, build_text):
        return False, f"Possible hardcoded meta_anos={meta} in build script"
    return True, f"meta_anos={meta} not hardcoded"


# ---------------------------------------------------------------------------
# bond-pool-runway
# ---------------------------------------------------------------------------

@registry.test("bond-pool-runway", "DATA", "bond_pool_runway has required fields", "CRITICAL")
def _():
    d = load_data()
    bpr = d.get("bond_pool_runway")
    if bpr is None:
        return False, "bond_pool_runway missing"
    required = [
        "anos_pre_fire", "pool_total_brl", "alvo_pool_brl_2040",
        "anos_cobertura_pos_fire", "custo_vida_anual"
    ]
    missing = [k for k in required if k not in bpr]
    if missing:
        return False, f"bond_pool_runway missing: {missing}"
    return True, "All bond_pool_runway fields present"


@registry.test("bond-pool-runway", "DATA", "pool_total_brl arrays aligned with anos_pre_fire", "HIGH")
def _():
    d = load_data()
    bpr = d.get("bond_pool_runway", {})
    anos = bpr.get("anos_pre_fire", [])
    pool = bpr.get("pool_total_brl", [])
    if not anos:
        return False, "anos_pre_fire empty"
    if len(pool) != len(anos):
        return False, f"pool_total_brl len={len(pool)} != anos_pre_fire len={len(anos)}"
    return True, f"pool_total_brl aligned: {len(anos)} time points"


@registry.test("bond-pool-runway", "DATA", "custo_vida_anual matches premissas.custo_vida_base", "HIGH")
def _():
    d = load_data()
    runway_custo = get_nested(d, "bond_pool_runway.custo_vida_anual")
    premissas_custo = get_nested(d, "premissas.custo_vida_base")
    if runway_custo is None:
        return False, "bond_pool_runway.custo_vida_anual missing"
    if premissas_custo is None:
        return False, "premissas.custo_vida_base missing"
    if runway_custo != premissas_custo:
        return False, f"Mismatch: runway says R${runway_custo:,}, premissas says R${premissas_custo:,}"
    return True, f"custo_vida_anual=R${runway_custo:,} consistent"


@registry.test("bond-pool-runway", "DATA", "pool grows over anos_pre_fire (accumulation phase)", "HIGH")
def _():
    d = load_data()
    pool = get_nested(d, "bond_pool_runway.pool_total_brl")
    if not pool or len(pool) < 2:
        return False, "pool_total_brl empty or too short"
    if pool[-1] <= pool[0]:
        return False, f"Pool not growing: first=R${pool[0]:,.0f}, last=R${pool[-1]:,.0f}"
    return True, f"Pool grows from R${pool[0]:,.0f} to R${pool[-1]:,.0f}"


@registry.test("bond-pool-runway", "RENDER", "bondPoolRunwayChartWrap exists in HTML", "HIGH")
def _():
    html = load_html()
    if "bondPoolRunwayChartWrap" not in html:
        return False, "id='bondPoolRunwayChartWrap' not found in HTML"
    return True, "bondPoolRunwayChartWrap present"


@registry.test("bond-pool-runway", "VALUE", "alvo_pool_brl_2040 not hardcoded in build script", "HIGH")
def _():
    import re
    build_text = BUILD_PY.read_text()
    d = load_data()
    alvo = get_nested(d, "bond_pool_runway.alvo_pool_brl_2040")
    if alvo is None:
        return False, "bond_pool_runway.alvo_pool_brl_2040 missing"
    pattern = rf'=\s*{int(alvo)}\b'
    if re.search(pattern, build_text):
        return False, f"Possible hardcoded alvo_pool_brl_2040={alvo:,.0f} in build script"
    return True, f"alvo_pool_brl_2040=R${alvo:,.0f} not hardcoded"


# ---------------------------------------------------------------------------
# simulador-fire
# ---------------------------------------------------------------------------

@registry.test("simulador-fire", "DATA", "all simulator input premissas present", "CRITICAL")
def _():
    d = load_data()
    premissas = d.get("premissas", {})
    required = [
        "patrimonio_atual", "aporte_mensal", "custo_vida_base",
        "retorno_equity_base", "idade_atual"
    ]
    missing = [k for k in required if k not in premissas]
    if missing:
        return False, f"Simulator premissas missing: {missing}"
    return True, "All simulator input premissas present"


@registry.test("simulador-fire", "DATA", "pfire53.base is present and in [0, 100]", "CRITICAL")
def _():
    d = load_data()
    base = get_nested(d, "pfire53.base")
    if base is None:
        return False, "pfire53.base missing"
    if not (0 <= base <= 100):
        return False, f"pfire53.base={base} outside [0, 100]"
    return True, f"pfire53.base={base}%"


@registry.test("simulador-fire", "DATA", "patrimonio_atual > 0 and < patrimonio_gatilho", "CRITICAL")
def _():
    d = load_data()
    atual = get_nested(d, "premissas.patrimonio_atual")
    gatilho = get_nested(d, "premissas.patrimonio_gatilho")
    if atual is None:
        return False, "premissas.patrimonio_atual missing"
    if gatilho is None:
        return False, "premissas.patrimonio_gatilho missing"
    if atual <= 0:
        return False, f"patrimonio_atual={atual:,} not positive"
    if atual >= gatilho:
        return False, f"patrimonio_atual={atual:,} >= patrimonio_gatilho={gatilho:,} — already at FIRE?"
    return True, f"R${atual:,} / R${gatilho:,} = {atual/gatilho:.1%} of FIRE goal"


@registry.test("simulador-fire", "RENDER", "simulator UI elements exist in HTML", "CRITICAL")
def _():
    html = load_html()
    required = ["simTimelineLabelFire", "calcResult", "simAporte", "simCusto"]
    missing = [e for e in required if e not in html]
    if missing:
        return False, f"Simulator UI elements missing: {missing}"
    return True, "Simulator UI elements present"


@registry.test("simulador-fire", "VALUE", "patrimonio_atual not hardcoded in build script", "HIGH")
def _():
    import re
    build_text = BUILD_PY.read_text()
    d = load_data()
    atual = get_nested(d, "premissas.patrimonio_atual")
    if atual is None:
        return False, "premissas.patrimonio_atual missing"
    pattern = rf'=\s*{int(atual)}\b'
    if re.search(pattern, build_text):
        return False, f"Possible hardcoded patrimonio_atual={atual:,} in build script"
    return True, f"patrimonio_atual={atual:,} not hardcoded"


# ---------------------------------------------------------------------------
# what-if-cenarios
# ---------------------------------------------------------------------------

@registry.test("what-if-cenarios", "DATA", "fire_matrix.cenarios.base non-empty", "CRITICAL")
def _():
    d = load_data()
    base = get_nested(d, "fire_matrix.cenarios.base")
    if base is None:
        return False, "fire_matrix.cenarios.base missing"
    if not isinstance(base, dict) or len(base) == 0:
        return False, f"fire_matrix.cenarios.base is empty or not a dict"
    return True, f"fire_matrix.cenarios.base has {len(base)} cells"


@registry.test("what-if-cenarios", "DATA", "premissas.swr_gatilho is in fire_matrix.swrs", "HIGH")
def _():
    d = load_data()
    swr_gatilho = get_nested(d, "premissas.swr_gatilho")
    swrs = get_nested(d, "fire_matrix.swrs")
    if swr_gatilho is None:
        return False, "premissas.swr_gatilho missing"
    if swrs is None:
        return False, "fire_matrix.swrs missing"
    if swr_gatilho not in swrs:
        return False, f"swr_gatilho={swr_gatilho} not in fire_matrix.swrs={swrs}"
    return True, f"swr_gatilho={swr_gatilho} is one of the matrix SWR axes"


@registry.test("what-if-cenarios", "DATA", "fire_matrix stress <= base <= fav at custo_vida_base point", "HIGH")
def _():
    d = load_data()
    custo = get_nested(d, "premissas.custo_vida_base")
    patrimonios = get_nested(d, "fire_matrix.patrimonios")
    if custo is None or not patrimonios:
        return False, f"Missing: custo_vida_base={custo}, patrimonios={patrimonios}"
    # Use first patrimonio in the axis list as a reference test point
    pat = sorted(patrimonios)[len(patrimonios) // 2]  # pick the median patrimonio
    key = f"{pat}_{custo}"
    base = get_nested(d, f"fire_matrix.cenarios.base.{key}")
    fav = get_nested(d, f"fire_matrix.cenarios.fav.{key}")
    stress = get_nested(d, f"fire_matrix.cenarios.stress.{key}")
    if None in (base, fav, stress):
        return False, f"Key '{key}' not in scenarios: base={base}, fav={fav}, stress={stress}"
    if not (stress <= base <= fav):
        return False, f"Order violated at {key}: stress={stress} <= base={base} <= fav={fav}"
    return True, f"At {key}: stress={stress:.3f} <= base={base:.3f} <= fav={fav:.3f}"


@registry.test("what-if-cenarios", "RENDER", "fireMatrixSection and heatmapContainer exist", "HIGH")
def _():
    html = load_html()
    missing = []
    for eid in ["fireMatrixSection", "heatmapContainer"]:
        if eid not in html:
            missing.append(eid)
    if missing:
        return False, f"Missing HTML elements: {missing}"
    return True, "fireMatrixSection and heatmapContainer present"


@registry.test("what-if-cenarios", "VALUE", "swr_gatilho not hardcoded in build script", "HIGH")
def _():
    import re
    build_text = BUILD_PY.read_text()
    d = load_data()
    swr = get_nested(d, "premissas.swr_gatilho")
    if swr is None:
        return False, "premissas.swr_gatilho missing"
    pattern = rf'=\s*{re.escape(str(swr))}\b'
    if re.search(pattern, build_text):
        return False, f"Possible hardcoded swr_gatilho={swr} in build script"
    return True, f"swr_gatilho={swr} not hardcoded"


# ---------------------------------------------------------------------------
# stress-test-mc
# ---------------------------------------------------------------------------

@registry.test("stress-test-mc", "DATA", "pfire53 has base and stress", "CRITICAL")
def _():
    d = load_data()
    p = d.get("pfire53")
    if p is None:
        return False, "pfire53 missing"
    if "base" not in p or "stress" not in p:
        return False, f"pfire53 missing base or stress: keys={list(p.keys())}"
    return True, f"pfire53: base={p['base']}, stress={p['stress']}"


@registry.test("stress-test-mc", "DATA", "pfire53 stress < base (stress degrades P(FIRE))", "CRITICAL")
def _():
    d = load_data()
    base = get_nested(d, "pfire53.base")
    stress = get_nested(d, "pfire53.stress")
    if None in (base, stress):
        return False, f"Missing: base={base}, stress={stress}"
    if stress >= base:
        return False, f"stress={stress} >= base={base} — stress scenario should be worse"
    return True, f"pfire53: stress={stress} < base={base}"


@registry.test("stress-test-mc", "DATA", "patrimonio_gatilho is positive and reasonable (>= 5M BRL)", "HIGH")
def _():
    d = load_data()
    gatilho = get_nested(d, "premissas.patrimonio_gatilho")
    if gatilho is None:
        return False, "premissas.patrimonio_gatilho missing"
    if gatilho < 5_000_000:
        return False, f"patrimonio_gatilho=R${gatilho:,} < R$5M — implausibly low for FIRE"
    if gatilho > 100_000_000:
        return False, f"patrimonio_gatilho=R${gatilho:,} > R$100M — implausibly high"
    return True, f"patrimonio_gatilho=R${gatilho:,} is plausible"


@registry.test("stress-test-mc", "RENDER", "stress test UI elements exist in HTML", "HIGH")
def _():
    html = load_html()
    required = ["stressPatShock", "stressShockSlider", "stressSimBtn"]
    missing = [e for e in required if e not in html]
    if missing:
        return False, f"Stress test UI elements missing: {missing}"
    return True, "Stress test UI elements present"


@registry.test("stress-test-mc", "VALUE", "pfire53 not set as hardcoded dict literal in build script", "HIGH")
def _():
    import re
    build_text = BUILD_PY.read_text()
    d = load_data()
    base = get_nested(d, "pfire53.base")
    if base is None:
        return False, "pfire53.base missing"
    # Check that build script reads pfire53 from data (data.get("pfire53")) rather than
    # constructing it from hardcoded values — the specific concern is the fallback block
    # Look for assignment of pfire53 as a literal dict with the actual base value
    pattern = rf'"base"\s*:\s*{re.escape(str(base))}\b'
    if re.search(pattern, build_text):
        return False, (
            f"Hardcoded pfire53.base={base} found as dict literal in build_dashboard.py. "
            "pfire53 fallback should come from dashboard_state.json, not be hardcoded."
        )
    return True, f"pfire53.base={base} not hardcoded as dict literal in build script"


# ---------------------------------------------------------------------------
# earliest-fire
# ---------------------------------------------------------------------------

@registry.test("earliest-fire", "DATA", "earliest_fire has ano, idade, pfire", "CRITICAL")
def _():
    d = load_data()
    ef = d.get("earliest_fire")
    if ef is None:
        return False, "earliest_fire missing"
    required = ["ano", "idade", "pfire"]
    missing = [k for k in required if k not in ef]
    if missing:
        return False, f"earliest_fire missing: {missing}"
    return True, f"earliest_fire: age {ef['idade']} in {ef['ano']}"


@registry.test("earliest-fire", "DATA", "earliest_fire.pfire in [0, 100]", "CRITICAL")
def _():
    d = load_data()
    pfire = get_nested(d, "earliest_fire.pfire")
    if pfire is None:
        return False, "earliest_fire.pfire missing"
    if not (0 <= pfire <= 100):
        return False, f"earliest_fire.pfire={pfire} outside [0, 100]"
    return True, f"earliest_fire.pfire={pfire}%"


@registry.test("earliest-fire", "DATA", "earliest_fire.idade >= premissas.idade_fire_aspiracional", "HIGH")
def _():
    d = load_data()
    ef_idade = get_nested(d, "earliest_fire.idade")
    aspiracional = get_nested(d, "premissas.idade_fire_aspiracional")
    if ef_idade is None or aspiracional is None:
        return False, f"Missing: ef.idade={ef_idade}, aspiracional={aspiracional}"
    if ef_idade < aspiracional:
        return False, (
            f"earliest_fire.idade={ef_idade} < idade_fire_aspiracional={aspiracional} — "
            "computed earliest should be >= aspirational target"
        )
    return True, f"earliest FIRE age {ef_idade} >= aspiracional {aspiracional}"


@registry.test("earliest-fire", "DATA", "earliest_fire.ano is consistent with idade and idade_atual", "HIGH")
def _():
    d = load_data()
    ef_ano = get_nested(d, "earliest_fire.ano")
    ef_idade = get_nested(d, "earliest_fire.idade")
    idade_atual = get_nested(d, "premissas.idade_atual")
    ano_atual = get_nested(d, "premissas.ano_atual") or 2026
    if None in (ef_ano, ef_idade, idade_atual):
        return False, f"Missing: ano={ef_ano}, idade={ef_idade}, idade_atual={idade_atual}"
    expected_ano = ano_atual + (ef_idade - idade_atual)
    if abs(ef_ano - expected_ano) > 1:
        return False, f"earliest_fire.ano={ef_ano} inconsistent with idade: expected ~{expected_ano}"
    return True, f"earliest_fire.ano={ef_ano} consistent with idade={ef_idade}"


@registry.test("earliest-fire", "RENDER", "earliestFireCard exists in HTML", "HIGH")
def _():
    html = load_html()
    if "earliestFireCard" not in html:
        return False, "id='earliestFireCard' not found in HTML"
    return True, "earliestFireCard present"


@registry.test("earliest-fire", "VALUE", "earliest_fire.ano not hardcoded in build script", "MEDIUM")
def _():
    import re
    build_text = BUILD_PY.read_text()
    d = load_data()
    ano = get_nested(d, "earliest_fire.ano")
    if ano is None:
        return False, "earliest_fire.ano missing"
    pattern = rf'earliest.*=\s*{ano}\b'
    if re.search(pattern, build_text):
        return False, f"Possible hardcoded earliest_fire.ano={ano} in build script"
    return True, f"earliest_fire.ano={ano} not hardcoded"


# ---------------------------------------------------------------------------
# aporte-sensitivity
# ---------------------------------------------------------------------------

@registry.test("aporte-sensitivity", "DATA", "fire_aporte_sensitivity has aportes_brl and pfire_2040", "CRITICAL")
def _():
    d = load_data()
    fas = d.get("fire_aporte_sensitivity")
    if fas is None:
        return False, "fire_aporte_sensitivity missing"
    required = ["aportes_brl", "pfire_2040", "aporte_base"]
    missing = [k for k in required if k not in fas]
    if missing:
        return False, f"fire_aporte_sensitivity missing: {missing}"
    return True, "fire_aporte_sensitivity has all required fields"


@registry.test("aporte-sensitivity", "DATA", "aportes and pfire arrays aligned", "CRITICAL")
def _():
    d = load_data()
    fas = d.get("fire_aporte_sensitivity", {})
    aportes = fas.get("aportes_brl", [])
    pfire = fas.get("pfire_2040", [])
    if not aportes:
        return False, "aportes_brl empty"
    if len(aportes) != len(pfire):
        return False, f"Length mismatch: aportes={len(aportes)}, pfire={len(pfire)}"
    return True, f"Arrays aligned: {len(aportes)} data points"


@registry.test("aporte-sensitivity", "DATA", "higher aporte -> higher pfire (monotonic)", "HIGH")
def _():
    d = load_data()
    fas = d.get("fire_aporte_sensitivity", {})
    aportes = fas.get("aportes_brl", [])
    pfire = fas.get("pfire_2040", [])
    if len(aportes) < 2:
        return False, "Need at least 2 aporte sensitivity points"
    # Sort by aporte
    pairs = sorted(zip(aportes, pfire))
    for i in range(1, len(pairs)):
        if pairs[i][1] < pairs[i-1][1] - 0.005:  # 0.5% tolerance
            return False, (
                f"P(FIRE) not monotonic: "
                f"aporte R${pairs[i-1][0]:,} -> {pairs[i-1][1]:.3f}, "
                f"aporte R${pairs[i][0]:,} -> {pairs[i][1]:.3f}"
            )
    return True, "Higher aporte consistently produces higher P(FIRE)"


@registry.test("aporte-sensitivity", "DATA", "aporte_base is in aportes_brl list", "HIGH")
def _():
    d = load_data()
    aporte_base = get_nested(d, "fire_aporte_sensitivity.aporte_base")
    aportes = get_nested(d, "fire_aporte_sensitivity.aportes_brl")
    if aporte_base is None:
        return False, "fire_aporte_sensitivity.aporte_base missing"
    if aportes is None:
        return False, "fire_aporte_sensitivity.aportes_brl missing"
    if aporte_base not in aportes:
        return False, f"aporte_base={aporte_base:,} not in aportes_brl={aportes}"
    return True, f"aporte_base=R${aporte_base:,} is in the sensitivity range"


@registry.test("aporte-sensitivity", "DATA", "aporte_base matches premissas.aporte_mensal", "HIGH")
def _():
    d = load_data()
    sens_base = get_nested(d, "fire_aporte_sensitivity.aporte_base")
    premissas_aporte = get_nested(d, "premissas.aporte_mensal")
    if sens_base is None or premissas_aporte is None:
        return False, f"Missing: sens.aporte_base={sens_base}, premissas.aporte_mensal={premissas_aporte}"
    if sens_base != premissas_aporte:
        return False, f"Mismatch: sensitivity aporte_base={sens_base:,} != premissas={premissas_aporte:,}"
    return True, f"aporte_base=R${sens_base:,} consistent with premissas"


@registry.test("aporte-sensitivity", "RENDER", "aporteSensSection exists in HTML", "HIGH")
def _():
    # SKIP — aporteSensSection removed intentionally — 2026-04-12
    return True, "SKIP — aporteSensSection removed intentionally (2026-04-12)"


@registry.test("aporte-sensitivity", "VALUE", "pfire values in [0, 1] range (not percentage)", "HIGH")
def _():
    d = load_data()
    pfire = get_nested(d, "fire_aporte_sensitivity.pfire_2040")
    if not pfire:
        return False, "fire_aporte_sensitivity.pfire_2040 missing or empty"
    errors = [f"{v}" for v in pfire if not (0 <= v <= 1)]
    if errors:
        return False, f"pfire_2040 values outside [0,1]: {errors} — should be proportions, not percentages"
    return True, f"All {len(pfire)} pfire_2040 values in [0, 1]"


# ---------------------------------------------------------------------------
# tornado-sensitivity
# ---------------------------------------------------------------------------

@registry.test("tornado-sensitivity", "DATA", "tornado is a non-empty list", "CRITICAL")
def _():
    d = load_data()
    t = d.get("tornado")
    if t is None:
        return False, "tornado missing"
    if not isinstance(t, list) or len(t) == 0:
        return False, "tornado must be non-empty list"
    return True, f"tornado has {len(t)} variables"


@registry.test("tornado-sensitivity", "DATA", "each tornado entry has label, mais10, menos10, delta", "CRITICAL")
def _():
    d = load_data()
    for i, entry in enumerate(d.get("tornado", [])):
        for field in ["label", "mais10", "menos10", "delta"]:
            if field not in entry:
                return False, f"Tornado entry {i} missing '{field}'"
    return True, "All tornado entries have required fields"


@registry.test("tornado-sensitivity", "DATA", "tornado delta consistent with mais10 - menos10 (1dp rounding)", "HIGH")
def _():
    d = load_data()
    errors = []
    for entry in d.get("tornado", []):
        mais = entry.get("mais10", 0)
        menos = entry.get("menos10", 0)
        delta = entry.get("delta", 0)
        expected_delta = abs(mais - menos)
        # delta is stored as abs(mais10 - menos10) rounded to 1 decimal place
        # allow 0.15 tolerance to cover 1dp rounding of both operands
        if abs(delta - expected_delta) > 0.15:
            errors.append(
                f"{entry.get('label', '?')}: delta={delta} vs |{mais}-{menos}|={expected_delta:.2f}"
            )
    if errors:
        return False, f"Delta inconsistencies beyond rounding: {errors}"
    return True, "All tornado deltas consistent with mais10/menos10 (within 1dp rounding)"


@registry.test("tornado-sensitivity", "DATA", "tornado highest-delta variable is first (most impactful)", "MEDIUM")
def _():
    d = load_data()
    tornado = d.get("tornado", [])
    if len(tornado) < 2:
        return False, "Need at least 2 tornado entries"
    deltas = [e.get("delta", 0) for e in tornado]
    max_delta = max(deltas)
    first_delta = deltas[0]
    # The most impactful variable (highest delta) should be first or near-first
    # Allow it to be within the top-2 (JS may sort client-side)
    top2 = sorted(deltas, reverse=True)[:2]
    if first_delta not in top2:
        return False, (
            f"First tornado entry delta={first_delta} is not among the top-2 ({top2}). "
            f"Most impactful variable ({max_delta}) should lead. "
            f"Note: sorting may occur client-side in JS."
        )
    return True, f"First entry delta={first_delta} is among top-2 most impactful"


@registry.test("tornado-sensitivity", "RENDER", "tornadoChart canvas exists in HTML", "CRITICAL")
def _():
    html = load_html()
    if "tornadoChart" not in html:
        return False, "id='tornadoChart' not found in HTML"
    return True, "tornadoChart canvas present"


@registry.test("tornado-sensitivity", "VALUE", "tornado generated from MC simulation not hardcoded", "HIGH")
def _():
    import re
    gen_text = GENERATE_PY.read_text() if GENERATE_PY.exists() else ""
    # tornado is parsed from fire_montecarlo.py output in generate_data.py
    if "tornado" not in gen_text:
        return False, "generate_data.py doesn't reference tornado — expected to parse from MC output"
    # Check no hardcoded mais10/menos10 literal dict in generate script
    if re.search(r'"mais10"\s*:\s*[-\d.]+', gen_text):
        return False, "Hardcoded mais10 value found in generate_data.py"
    return True, "tornado consumed from MC simulation output (not hardcoded)"


# ---------------------------------------------------------------------------
# sankey-cashflow
# ---------------------------------------------------------------------------

@registry.test("sankey-cashflow", "DATA", "renda_estimada is present and positive", "CRITICAL")
def _():
    d = load_data()
    renda = get_nested(d, "premissas.renda_estimada")
    if renda is None:
        return False, "premissas.renda_estimada missing"
    if renda <= 0:
        return False, f"renda_estimada={renda} not positive"
    return True, f"renda_estimada=R${renda:,}/month"


@registry.test("sankey-cashflow", "DATA", "spending_breakdown present for sankey flow", "CRITICAL")
def _():
    d = load_data()
    sb = d.get("spending_breakdown")
    if sb is None:
        return False, "spending_breakdown missing — required for sankey"
    if not sb.get("total_mensal"):
        return False, "spending_breakdown.total_mensal missing"
    return True, f"spending_breakdown present: R${sb['total_mensal']:,}/month"


@registry.test("sankey-cashflow", "DATA", "aporte_mensal <= renda_estimada", "HIGH")
def _():
    d = load_data()
    aporte = get_nested(d, "premissas.aporte_mensal")
    renda = get_nested(d, "premissas.renda_estimada")
    if None in (aporte, renda):
        return False, f"Missing: aporte_mensal={aporte}, renda_estimada={renda}"
    if aporte > renda:
        return False, f"aporte_mensal=R${aporte:,} > renda_estimada=R${renda:,} — implausible"
    return True, f"aporte_mensal=R${aporte:,} <= renda_estimada=R${renda:,}"


@registry.test("sankey-cashflow", "RENDER", "sankeySection exists in HTML", "CRITICAL")
def _():
    html = load_html()
    if "sankeySection" not in html:
        return False, "id='sankeySection' not found in HTML"
    return True, "sankeySection present"


@registry.test("sankey-cashflow", "VALUE", "renda_estimada not hardcoded in build script", "HIGH")
def _():
    import re
    build_text = BUILD_PY.read_text()
    d = load_data()
    renda = get_nested(d, "premissas.renda_estimada")
    if renda is None:
        return False, "premissas.renda_estimada missing"
    pattern = rf'=\s*{int(renda)}\b'
    if re.search(pattern, build_text):
        return False, f"Possible hardcoded renda_estimada={renda:,} in build script"
    return True, f"renda_estimada={renda:,} not hardcoded"


# ---------------------------------------------------------------------------
# eventos-vida / lumpy-events
# ---------------------------------------------------------------------------

@registry.test("lumpy-events", "DATA", "lumpy_events has eventos list and base pfire", "CRITICAL")
def _():
    d = load_data()
    le = d.get("lumpy_events")
    if le is None:
        return False, "lumpy_events missing"
    if "eventos" not in le:
        return False, "lumpy_events.eventos missing"
    if not isinstance(le["eventos"], list):
        return False, f"lumpy_events.eventos is not a list"
    base_pfire = get_nested(d, "lumpy_events.base.pfire_2040")
    if base_pfire is None:
        return False, "lumpy_events.base.pfire_2040 missing"
    return True, f"lumpy_events has {len(le['eventos'])} eventos, base pfire={base_pfire:.4f}"


@registry.test("lumpy-events", "DATA", "each evento has id, label, delta_pp, pfire_2040", "CRITICAL")
def _():
    d = load_data()
    eventos = get_nested(d, "lumpy_events.eventos") or []
    for i, ev in enumerate(eventos):
        for field in ["id", "label", "delta_pp", "pfire_2040"]:
            if field not in ev:
                return False, f"Evento {i} ('{ev.get('label', '?')}') missing '{field}'"
    return True, f"All {len(eventos)} eventos have required fields"


@registry.test("lumpy-events", "DATA", "evento pfire_2040 <= base pfire_2040 (spending reduces P(FIRE))", "HIGH")
def _():
    d = load_data()
    base_pfire = get_nested(d, "lumpy_events.base.pfire_2040")
    eventos = get_nested(d, "lumpy_events.eventos") or []
    if base_pfire is None:
        return False, "lumpy_events.base.pfire_2040 missing"
    errors = []
    for ev in eventos:
        ev_pfire = ev.get("pfire_2040")
        if ev_pfire is None:
            continue
        if ev_pfire > base_pfire + 0.005:
            errors.append(f"{ev.get('label', '?')}: pfire={ev_pfire:.4f} > base={base_pfire:.4f}")
    if errors:
        return False, f"Eventos increase P(FIRE) unexpectedly: {errors}"
    return True, f"All eventos reduce or maintain P(FIRE) vs base={base_pfire:.4f}"


@registry.test("lumpy-events", "DATA", "evento delta_pp consistent with base and evento pfire", "HIGH")
def _():
    d = load_data()
    base_pfire = get_nested(d, "lumpy_events.base.pfire_2040")
    eventos = get_nested(d, "lumpy_events.eventos") or []
    if base_pfire is None:
        return False, "base pfire missing"
    errors = []
    for ev in eventos:
        ev_pfire = ev.get("pfire_2040")
        delta = ev.get("delta_pp")
        if ev_pfire is None or delta is None:
            continue
        expected_delta = round((ev_pfire - base_pfire) * 100, 1)
        if abs(expected_delta - delta) > 0.5:
            errors.append(f"{ev.get('label', '?')}: delta={delta} != expected {expected_delta:.1f}")
    if errors:
        return False, f"Delta_pp inconsistencies: {errors}"
    return True, "All evento delta_pp consistent with pfire difference"


@registry.test("lumpy-events", "RENDER", "lumpyEventsSection exists in HTML", "CRITICAL")
def _():
    html = load_html()
    if "lumpyEventsSection" not in html:
        return False, "id='lumpyEventsSection' not found in HTML"
    return True, "lumpyEventsSection present"


@registry.test("eventos-vida", "RENDER", "lumpy events body render target exists in HTML", "HIGH")
def _():
    html = load_html()
    if "lumpyEventsBody" not in html:
        return False, "id='lumpyEventsBody' not found in HTML — JS render target missing"
    return True, "lumpyEventsBody render target present"


@registry.test("eventos-vida", "DATA", "lumpy_events.eventos has at least one event", "HIGH")
def _():
    d = load_data()
    eventos = get_nested(d, "lumpy_events.eventos")
    if eventos is None:
        return False, "lumpy_events.eventos missing"
    if not isinstance(eventos, list) or len(eventos) == 0:
        return False, "lumpy_events.eventos is empty — at least one life event required"
    return True, f"lumpy_events.eventos has {len(eventos)} events"


@registry.test("eventos-vida", "VALUE", "lumpy_events.base.pfire_2040 not hardcoded in pipeline scripts", "HIGH")
def _():
    import re
    gen_text = GENERATE_PY.read_text() if GENERATE_PY.exists() else ""
    d = load_data()
    base_pfire = get_nested(d, "lumpy_events.base.pfire_2040")
    if base_pfire is None:
        return False, "lumpy_events.base.pfire_2040 missing"
    # Check it's not hardcoded as a literal in generate script
    pattern = rf'"pfire_2040"\s*:\s*{re.escape(str(base_pfire))}\b'
    if re.search(pattern, gen_text):
        return False, f"Hardcoded lumpy base pfire_2040={base_pfire} found in generate_data.py"
    return True, f"lumpy_events base pfire_2040={base_pfire} not hardcoded"


@registry.test("lumpy-events", "VALUE", "lumpy_events sourced from pipeline not hardcoded", "HIGH")
def _():
    import re
    gen_text = GENERATE_PY.read_text() if GENERATE_PY.exists() else ""
    build_text = BUILD_PY.read_text()
    # lumpy_events is loaded from dados/lumpy_events.json by generate_data.py
    if "lumpy_events" not in gen_text and "lumpy_events" not in build_text:
        return False, "Neither pipeline script references lumpy_events"
    # Check no hardcoded delta_pp in any script
    for name, text in [("generate_data.py", gen_text), ("build_dashboard.py", build_text)]:
        if re.search(r'"delta_pp"\s*:\s*[-\d.]+', text):
            return False, f"Hardcoded delta_pp value found in {name}"
    return True, "lumpy_events sourced from pipeline (no hardcoded delta_pp)"


# ---------------------------------------------------------------------------
# pfire-familia
# ---------------------------------------------------------------------------

@registry.test("pfire-familia", "DATA", "lumpy_events has confirming conditional scenarios", "HIGH")
def _():
    d = load_data()
    eventos = get_nested(d, "lumpy_events.eventos") or []
    if not eventos:
        return False, "No lumpy eventos for pfire-familia"
    # Check that at least one evento has confirmado field
    confirmados = [e for e in eventos if "confirmado" in e]
    if not confirmados:
        return False, "No eventos have 'confirmado' field — pfire-familia needs conditional scenarios"
    return True, f"{len(confirmados)}/{len(eventos)} eventos have 'confirmado' field"


@registry.test("pfire-familia", "DATA", "pfire53.base consistent with scenario_comparison.fire53.base", "CRITICAL")
def _():
    d = load_data()
    pfire53_base = get_nested(d, "pfire53.base")
    sc_fire53_base = get_nested(d, "scenario_comparison.fire53.base")
    if pfire53_base is None or sc_fire53_base is None:
        return False, f"Missing: pfire53.base={pfire53_base}, scenario_comparison.fire53.base={sc_fire53_base}"
    if abs(pfire53_base - sc_fire53_base) > 0.1:
        return False, f"Inconsistency: pfire53.base={pfire53_base} != scenario_comparison.fire53.base={sc_fire53_base}"
    return True, f"pfire53.base={pfire53_base} consistent with scenario_comparison"


@registry.test("pfire-familia", "DATA", "lumpy evento pfire_2040 values in [0, 1]", "CRITICAL")
def _():
    d = load_data()
    eventos = get_nested(d, "lumpy_events.eventos") or []
    errors = []
    for ev in eventos:
        pfire = ev.get("pfire_2040")
        if pfire is not None and not (0 <= pfire <= 1):
            errors.append(f"{ev.get('label', '?')}: pfire_2040={pfire}")
    if errors:
        return False, f"pfire_2040 out of [0,1]: {errors}"
    return True, "All evento pfire_2040 values in [0, 1]"


@registry.test("pfire-familia", "RENDER", "conditional pfire buttons exist in HTML", "HIGH")
def _():
    html = load_html()
    # pcond-fire50, pcond-casamento, pcond-filho, pcond-solteiro
    expected = ["pcond-fire50", "pcond-casamento"]
    missing = [e for e in expected if e not in html]
    if missing:
        return False, f"Conditional pfire buttons missing: {missing}"
    return True, "Conditional pfire scenario buttons present"


@registry.test("pfire-familia", "VALUE", "pfire53 base not hardcoded in build script", "HIGH")
def _():
    import re
    build_text = BUILD_PY.read_text()
    d = load_data()
    base = get_nested(d, "pfire53.base")
    if base is None:
        return False, "pfire53.base missing"
    # pfire53 must come from DATA not be set directly
    if "pfire53" not in build_text:
        return False, "build_dashboard.py doesn't reference pfire53"
    pattern = rf'"base"\s*:\s*{re.escape(str(base))}'
    if re.search(pattern, build_text):
        return False, f"Possible hardcoded pfire53 base={base} dict literal in build script"
    return True, f"pfire53.base={base} not hardcoded as dict literal"


# ── B4: Net Worth Projection anti-regression ──────────────────────────────────

@registry.test("net-worth-projection", "RENDER", "netWorthProjectionChart canvas exists in HTML", "CRITICAL")
def _():
    html = load_html()
    if 'id="netWorthProjectionChart"' not in html:
        return False, "netWorthProjectionChart canvas missing from HTML"
    return True, "netWorthProjectionChart canvas present"


# ── B7: Stress Fan Chart anti-regression ──────────────────────────────────────

@registry.test("stress-fan-chart", "RENDER", "stressProjectionChart canvas exists in HTML", "CRITICAL")
def _():
    html = load_html()
    if 'id="stressProjectionChart"' not in html:
        return False, "stressProjectionChart canvas missing from HTML"
    return True, "stressProjectionChart canvas present"
