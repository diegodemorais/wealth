"""
Risco Domain Tests — HODL11 / Stress Cenarios / Stress Test MC
Blocks: hodl11-status | stress-cenarios | stress-test-mc
Categories: DATA | RENDER | VALUE | PRIVACY | SPEC
Severities: CRITICAL | HIGH | MEDIUM
"""

from .base import registry, load_data, load_html, load_spec, get_nested, BUILD_PY


# ─────────────────────────────────────────────────────────────────────────────
# BLOCK: hodl11-status
# Tab: now
# Data fields: hodl11.qty, hodl11.preco, hodl11.valor,
#              hodl11.banda.min_pct, hodl11.banda.alvo_pct, hodl11.banda.max_pct,
#              hodl11.banda.atual_pct, hodl11.banda.status
# privacy: true
# ─────────────────────────────────────────────────────────────────────────────

@registry.test(
    "hodl11-status",
    "DATA",
    "hodl11 top-level key exists and is a dict",
    "CRITICAL",
)
def _hodl11_key_exists():
    data = load_data()
    hodl11 = data.get("hodl11")
    if not isinstance(hodl11, dict):
        return False, f"hodl11 is {type(hodl11).__name__}, expected dict"
    return True, "hodl11 key present and is dict"


@registry.test(
    "hodl11-status",
    "DATA",
    "hodl11 required fields present and non-null",
    "CRITICAL",
)
def _hodl11_required_fields():
    data = load_data()
    required = ["qty", "preco", "valor"]
    missing = []
    null_fields = []
    for field in required:
        val = get_nested(data, f"hodl11.{field}")
        if val is None:
            missing.append(field)
        elif not isinstance(val, (int, float)):
            null_fields.append(f"{field}={val!r}")
    if missing:
        return False, f"Missing hodl11 fields: {missing}"
    if null_fields:
        return False, f"Non-numeric hodl11 fields: {null_fields}"
    return True, "qty, preco, valor all present and numeric"


@registry.test(
    "hodl11-status",
    "DATA",
    "hodl11.banda sub-fields present and non-null",
    "CRITICAL",
)
def _hodl11_banda_fields():
    data = load_data()
    banda_fields = [
        "hodl11.banda.min_pct",
        "hodl11.banda.alvo_pct",
        "hodl11.banda.max_pct",
        "hodl11.banda.atual_pct",
        "hodl11.banda.status",
    ]
    missing = []
    for path in banda_fields:
        if get_nested(data, path) is None:
            missing.append(path)
    if missing:
        return False, f"Missing banda fields: {missing}"
    return True, "All hodl11.banda fields present"


@registry.test(
    "hodl11-status",
    "VALUE",
    "hodl11.banda.atual_pct in valid range [0, 100]",
    "CRITICAL",
)
def _hodl11_atual_pct_range():
    data = load_data()
    atual = get_nested(data, "hodl11.banda.atual_pct")
    if not isinstance(atual, (int, float)):
        return False, f"hodl11.banda.atual_pct is not numeric: {atual!r}"
    if not (0 <= atual <= 100):
        return False, f"hodl11.banda.atual_pct={atual} outside [0, 100]"
    return True, f"hodl11.banda.atual_pct={atual}% in valid range"


@registry.test(
    "hodl11-status",
    "VALUE",
    "hodl11.banda ordering: min_pct < alvo_pct < max_pct",
    "CRITICAL",
)
def _hodl11_banda_ordering():
    data = load_data()
    mn = get_nested(data, "hodl11.banda.min_pct")
    alvo = get_nested(data, "hodl11.banda.alvo_pct")
    mx = get_nested(data, "hodl11.banda.max_pct")
    if not all(isinstance(v, (int, float)) for v in [mn, alvo, mx]):
        return False, f"Non-numeric banda values: min={mn}, alvo={alvo}, max={mx}"
    if not (mn < alvo < mx):
        return False, f"Band ordering violated: min={mn} < alvo={alvo} < max={mx} is False"
    return True, f"Band ordering OK: {mn}% < {alvo}% < {mx}%"


@registry.test(
    "hodl11-status",
    "VALUE",
    "hodl11.valor ≈ hodl11.qty * hodl11.preco (within 1%)",
    "HIGH",
)
def _hodl11_valor_consistency():
    data = load_data()
    qty = get_nested(data, "hodl11.qty")
    preco = get_nested(data, "hodl11.preco")
    valor = get_nested(data, "hodl11.valor")
    if not all(isinstance(v, (int, float)) for v in [qty, preco, valor]):
        return False, f"Non-numeric: qty={qty}, preco={preco}, valor={valor}"
    expected = qty * preco
    if expected == 0:
        return False, "Expected valor is zero (qty or preco is zero)"
    diff_pct = abs(valor - expected) / expected * 100
    if diff_pct > 1.0:
        return False, f"valor={valor} deviates {diff_pct:.2f}% from qty*preco={expected:.2f} (threshold: 1%)"
    return True, f"hodl11.valor={valor:.2f} ≈ qty*preco={expected:.2f} (diff {diff_pct:.2f}%)"


@registry.test(
    "hodl11-status",
    "VALUE",
    "hodl11.banda.status is a recognized semaforo value",
    "HIGH",
)
def _hodl11_status_valid():
    data = load_data()
    status = get_nested(data, "hodl11.banda.status")
    valid = {"verde", "amarelo", "vermelho"}
    if status not in valid:
        return False, f"hodl11.banda.status={status!r} not in {valid}"
    return True, f"hodl11.banda.status={status!r} is valid"


@registry.test(
    "hodl11-status",
    "RENDER",
    "HTML contains hodl11Val element (hodl11 value display)",
    "CRITICAL",
)
def _hodl11_render_val_element():
    html = load_html()
    if 'id="hodl11Val"' not in html:
        return False, 'Element id="hodl11Val" not found in HTML'
    return True, 'id="hodl11Val" present in HTML'


@registry.test(
    "hodl11-status",
    "RENDER",
    "HTML contains hodl11Sub element (qty/cotas display)",
    "HIGH",
)
def _hodl11_render_sub_element():
    html = load_html()
    if 'id="hodl11Sub"' not in html:
        return False, 'Element id="hodl11Sub" not found in HTML'
    return True, 'id="hodl11Sub" present in HTML'


@registry.test(
    "hodl11-status",
    "RENDER",
    "HTML contains hodl-band-marker class (band visualization)",
    "HIGH",
)
def _hodl11_render_band_marker():
    html = load_html()
    if "hodl-band-marker" not in html:
        return False, "Class 'hodl-band-marker' not found in HTML"
    return True, "'hodl-band-marker' present in HTML"


@registry.test(
    "hodl11-status",
    "PRIVACY",
    "hodl11Val element has pv class (privacy wrapper)",
    "CRITICAL",
)
def _hodl11_privacy_val():
    html = load_html()
    # hodl11Val must carry the pv class for privacy mode to mask the value
    if 'id="hodl11Val"' not in html:
        return False, 'Element id="hodl11Val" not found — cannot verify privacy'
    # Find the element and check for pv class in the same tag
    import re
    match = re.search(r'<[^>]+id="hodl11Val"[^>]*>', html)
    if not match:
        return False, 'Could not parse tag with id="hodl11Val"'
    tag = match.group()
    if "pv" not in tag:
        return False, f"hodl11Val tag missing pv class: {tag!r}"
    return True, "hodl11Val has pv class for privacy masking"


@registry.test(
    "hodl11-status",
    "PRIVACY",
    "hodl11Sub element has pv class (qty/price privacy wrapper)",
    "HIGH",
)
def _hodl11_privacy_sub():
    html = load_html()
    import re
    match = re.search(r'<[^>]+id="hodl11Sub"[^>]*>', html)
    if not match:
        return False, 'Element id="hodl11Sub" not found — cannot verify privacy'
    tag = match.group()
    if "pv" not in tag:
        return False, f"hodl11Sub tag missing pv class: {tag!r}"
    return True, "hodl11Sub has pv class for privacy masking"


@registry.test(
    "hodl11-status",
    "SPEC",
    "spec.json declares hodl11-status as privacy: true",
    "HIGH",
)
def _hodl11_spec_privacy():
    spec = load_spec()
    blocks = spec.get("blocks", [])
    block = next((b for b in blocks if b.get("id") == "hodl11-status"), None)
    if block is None:
        return False, "Block 'hodl11-status' not found in spec.json"
    if not block.get("privacy"):
        return False, f"hodl11-status privacy flag is {block.get('privacy')!r}, expected True"
    return True, "hodl11-status has privacy: true in spec.json"


@registry.test(
    "hodl11-status",
    "SPEC",
    "spec.json hodl11-status data_fields match expected set",
    "MEDIUM",
)
def _hodl11_spec_data_fields():
    spec = load_spec()
    blocks = spec.get("blocks", [])
    block = next((b for b in blocks if b.get("id") == "hodl11-status"), None)
    if block is None:
        return False, "Block 'hodl11-status' not found in spec.json"
    expected = {
        "hodl11.qty",
        "hodl11.preco",
        "hodl11.valor",
        "hodl11.banda.min_pct",
        "hodl11.banda.alvo_pct",
        "hodl11.banda.max_pct",
        "hodl11.banda.atual_pct",
        "hodl11.banda.status",
    }
    actual = set(block.get("data_fields", []))
    missing = expected - actual
    extra = actual - expected
    if missing:
        return False, f"hodl11-status missing data_fields in spec: {sorted(missing)}"
    if extra:
        return False, f"hodl11-status has undocumented data_fields: {sorted(extra)}"
    return True, "hodl11-status data_fields match spec exactly"


# ─────────────────────────────────────────────────────────────────────────────
# BLOCK: stress-cenarios
# Tab: now
# Data fields: tornado
# privacy: false
# ─────────────────────────────────────────────────────────────────────────────

@registry.test(
    "stress-cenarios",
    "DATA",
    "tornado key exists and is a non-empty list",
    "CRITICAL",
)
def _tornado_key_exists():
    data = load_data()
    tornado = data.get("tornado")
    if not isinstance(tornado, list):
        return False, f"tornado is {type(tornado).__name__}, expected list"
    if len(tornado) == 0:
        return False, "tornado list is empty — no stress scenarios to display"
    return True, f"tornado is a list with {len(tornado)} entries"


@registry.test(
    "stress-cenarios",
    "DATA",
    "tornado entries have required fields: label, mais10, menos10, delta",
    "CRITICAL",
)
def _tornado_entry_fields():
    data = load_data()
    tornado = data.get("tornado", [])
    required = ["label", "mais10", "menos10", "delta"]
    bad_entries = []
    for i, entry in enumerate(tornado):
        if not isinstance(entry, dict):
            bad_entries.append(f"entry[{i}] is not a dict")
            continue
        missing = [f for f in required if f not in entry or entry[f] is None]
        if missing:
            bad_entries.append(f"entry[{i}] ({entry.get('label', '?')!r}) missing: {missing}")
    if bad_entries:
        return False, f"tornado entry issues: {bad_entries}"
    return True, f"All {len(tornado)} tornado entries have required fields"


@registry.test(
    "stress-cenarios",
    "VALUE",
    "tornado delta ≈ abs(mais10 - menos10) for each entry",
    "HIGH",
)
def _tornado_delta_consistency():
    data = load_data()
    tornado = data.get("tornado", [])
    bad = []
    for entry in tornado:
        if not isinstance(entry, dict):
            continue
        mais10 = entry.get("mais10")
        menos10 = entry.get("menos10")
        delta = entry.get("delta")
        if not all(isinstance(v, (int, float)) for v in [mais10, menos10, delta]):
            continue
        expected_delta = abs(mais10 - menos10)
        if abs(delta - expected_delta) > 0.5:
            bad.append(f"{entry.get('label', '?')!r}: delta={delta}, |mais10-menos10|={expected_delta:.2f}")
    if bad:
        return False, f"tornado delta inconsistencies: {bad}"
    return True, f"tornado delta consistent with |mais10 - menos10| for all entries"


@registry.test(
    "stress-cenarios",
    "VALUE",
    "tornado has at least 1 entry with delta > 0 (non-trivial sensitivity)",
    "HIGH",
)
def _tornado_non_trivial():
    data = load_data()
    tornado = data.get("tornado", [])
    significant = [e for e in tornado if isinstance(e, dict) and isinstance(e.get("delta"), (int, float)) and e["delta"] > 0]
    if not significant:
        return False, "No tornado entry has delta > 0 — all sensitivities are zero"
    return True, f"{len(significant)}/{len(tornado)} tornado entries have non-zero delta"


@registry.test(
    "stress-cenarios",
    "RENDER",
    "HTML contains tornadoChart canvas element",
    "CRITICAL",
)
def _tornado_render_canvas():
    html = load_html()
    if 'id="tornadoChart"' not in html:
        return False, 'Canvas id="tornadoChart" not found in HTML'
    return True, 'id="tornadoChart" canvas element present in HTML'


@registry.test(
    "stress-cenarios",
    "RENDER",
    "HTML contains Tornado section label text",
    "MEDIUM",
)
def _tornado_render_label():
    html = load_html()
    if "Tornado" not in html:
        return False, "'Tornado' label text not found in HTML"
    return True, "'Tornado' label present in HTML"


@registry.test(
    "stress-cenarios",
    "SPEC",
    "spec.json declares stress-cenarios with tornado data_field",
    "MEDIUM",
)
def _stress_cenarios_spec():
    spec = load_spec()
    blocks = spec.get("blocks", [])
    block = next((b for b in blocks if b.get("id") == "stress-cenarios"), None)
    if block is None:
        return False, "Block 'stress-cenarios' not found in spec.json"
    fields = block.get("data_fields", [])
    if "tornado" not in fields:
        return False, f"'tornado' not in stress-cenarios data_fields: {fields}"
    return True, "stress-cenarios has 'tornado' in data_fields"


# ─────────────────────────────────────────────────────────────────────────────
# BLOCK: stress-test-mc
# Tab: fire
# Data fields: premissas.patrimonio_atual, pfire_base.base, pfire_base.stress,
#              premissas.patrimonio_gatilho
# privacy: true
# ─────────────────────────────────────────────────────────────────────────────

@registry.test(
    "stress-test-mc",
    "DATA",
    "pfire_base key exists with base, fav, stress fields",
    "CRITICAL",
)
def _pfire_base_key_exists():
    data = load_data()
    pfire_base = data.get("pfire_base")
    if not isinstance(pfire_base, dict):
        return False, f"pfire_base is {type(pfire_base).__name__}, expected dict"
    required = ["base", "stress"]
    missing = [f for f in required if pfire_base.get(f) is None]
    if missing:
        return False, f"pfire_base missing fields: {missing}"
    return True, f"pfire_base present with base={pfire_base['base']}, stress={pfire_base['stress']}"


@registry.test(
    "stress-test-mc",
    "DATA",
    "premissas.patrimonio_atual and premissas.patrimonio_gatilho present and positive",
    "CRITICAL",
)
def _premissas_patrimonio_present():
    data = load_data()
    pat_atual = get_nested(data, "premissas.patrimonio_atual")
    pat_gatilho = get_nested(data, "premissas.patrimonio_gatilho")
    issues = []
    if not isinstance(pat_atual, (int, float)) or pat_atual <= 0:
        issues.append(f"patrimonio_atual={pat_atual!r} (expected positive numeric)")
    if not isinstance(pat_gatilho, (int, float)) or pat_gatilho <= 0:
        issues.append(f"patrimonio_gatilho={pat_gatilho!r} (expected positive numeric)")
    if issues:
        return False, "; ".join(issues)
    return True, f"patrimonio_atual={pat_atual:,.0f}, patrimonio_gatilho={pat_gatilho:,.0f}"


@registry.test(
    "stress-test-mc",
    "VALUE",
    "pfire_base.stress < pfire_base.base (stress scenario is worse than base)",
    "CRITICAL",
)
def _pfire_base_stress_lt_base():
    data = load_data()
    base = get_nested(data, "pfire_base.base")
    stress = get_nested(data, "pfire_base.stress")
    if not all(isinstance(v, (int, float)) for v in [base, stress]):
        return False, f"Non-numeric pfire_base values: base={base!r}, stress={stress!r}"
    if stress >= base:
        return False, (
            f"pfire_base.stress={stress} >= pfire_base.base={base} "
            "— stress scenario must be worse (lower) than base"
        )
    return True, f"pfire_base.stress={stress}% < pfire_base.base={base}% (stress is correctly worse)"


@registry.test(
    "stress-test-mc",
    "VALUE",
    "pfire_base.base and pfire_base.stress are in plausible P(FIRE) range [0, 100]",
    "HIGH",
)
def _pfire_base_range():
    data = load_data()
    values = {
        "base": get_nested(data, "pfire_base.base"),
        "stress": get_nested(data, "pfire_base.stress"),
    }
    bad = []
    for key, val in values.items():
        if not isinstance(val, (int, float)):
            bad.append(f"{key}={val!r} not numeric")
        elif not (0 <= val <= 100):
            bad.append(f"{key}={val} outside [0, 100]")
    if bad:
        return False, f"pfire_base out-of-range: {bad}"
    return True, f"pfire_base base={values['base']}%, stress={values['stress']}% both in [0, 100]"


@registry.test(
    "stress-test-mc",
    "VALUE",
    "premissas.patrimonio_gatilho > premissas.patrimonio_atual (FIRE target ahead)",
    "HIGH",
)
def _patrimonio_gatilho_ahead():
    data = load_data()
    atual = get_nested(data, "premissas.patrimonio_atual")
    gatilho = get_nested(data, "premissas.patrimonio_gatilho")
    if not all(isinstance(v, (int, float)) for v in [atual, gatilho]):
        return False, f"Non-numeric patrimonio: atual={atual!r}, gatilho={gatilho!r}"
    if gatilho <= atual:
        return False, (
            f"patrimonio_gatilho={gatilho:,.0f} <= patrimonio_atual={atual:,.0f} "
            "— FIRE target should be ahead of current wealth"
        )
    gap = gatilho - atual
    return True, f"FIRE gap = R$ {gap:,.0f} (gatilho {gatilho:,.0f} > atual {atual:,.0f})"


@registry.test(
    "stress-test-mc",
    "RENDER",
    "HTML contains stressShockSlider input element",
    "CRITICAL",
)
def _stress_mc_render_slider():
    html = load_html()
    if 'id="stressShockSlider"' not in html:
        return False, 'Element id="stressShockSlider" not found in HTML'
    return True, 'id="stressShockSlider" present in HTML'


@registry.test(
    "stress-test-mc",
    "RENDER",
    "HTML contains pfire_baseBaseBadge and pfire_baseStressBadge elements",
    "CRITICAL",
)
def _stress_mc_render_badges():
    html = load_html()
    missing = []
    for elem_id in ["pfire_baseBaseBadge", "pfire_baseStressBadge"]:
        if f'id="{elem_id}"' not in html:
            missing.append(elem_id)
    if missing:
        return False, f"Missing HTML elements: {missing}"
    return True, "pfire_baseBaseBadge and pfire_baseStressBadge present in HTML"


@registry.test(
    "stress-test-mc",
    "RENDER",
    "HTML contains stressShockLabel element (shock percentage display)",
    "HIGH",
)
def _stress_mc_render_shock_label():
    html = load_html()
    if 'id="stressShockLabel"' not in html:
        return False, 'Element id="stressShockLabel" not found in HTML'
    return True, 'id="stressShockLabel" present in HTML'


@registry.test(
    "stress-test-mc",
    "PRIVACY",
    "HTML stress-test-mc block contains pv class elements (value privacy)",
    "HIGH",
)
def _stress_mc_privacy():
    html = load_html()
    # The stress-test-mc block is privacy: true; pv class must appear in that region.
    # We verify it appears anywhere near pfire_base rendering or stressShockSlider.
    import re
    # Find stressShockSlider position, then scan nearby region for pv
    idx = html.find('stressShockSlider')
    if idx == -1:
        return False, "stressShockSlider not found — cannot locate stress-test-mc block"
    region = html[max(0, idx - 3000):idx + 3000]
    if 'class="' not in region or "pv" not in region:
        return False, "No element with pv class found in stress-test-mc block region"
    # Confirm at least one tag with pv in this region
    pv_tags = re.findall(r'class="[^"]*\bpv\b[^"]*"', region)
    if not pv_tags:
        return False, "No pv-class element found near stress-test-mc block"
    return True, f"Found {len(pv_tags)} pv-class element(s) in stress-test-mc region"


@registry.test(
    "stress-test-mc",
    "SPEC",
    "spec.json declares stress-test-mc with all required data_fields",
    "MEDIUM",
)
def _stress_mc_spec_fields():
    spec = load_spec()
    blocks = spec.get("blocks", [])
    block = next((b for b in blocks if b.get("id") == "stress-test-mc"), None)
    if block is None:
        return False, "Block 'stress-test-mc' not found in spec.json"
    expected = {
        "premissas.patrimonio_atual",
        "pfire_base.base",
        "pfire_base.stress",
        "premissas.patrimonio_gatilho",
    }
    actual = set(block.get("data_fields", []))
    missing = expected - actual
    extra = actual - expected
    if missing:
        return False, f"stress-test-mc missing data_fields: {sorted(missing)}"
    if extra:
        return False, f"stress-test-mc has undocumented data_fields: {sorted(extra)}"
    return True, "stress-test-mc data_fields match spec exactly"


@registry.test(
    "stress-test-mc",
    "SPEC",
    "spec.json declares stress-test-mc as privacy: true",
    "HIGH",
)
def _stress_mc_spec_privacy():
    spec = load_spec()
    blocks = spec.get("blocks", [])
    block = next((b for b in blocks if b.get("id") == "stress-test-mc"), None)
    if block is None:
        return False, "Block 'stress-test-mc' not found in spec.json"
    if not block.get("privacy"):
        return False, f"stress-test-mc privacy flag is {block.get('privacy')!r}, expected True"
    return True, "stress-test-mc has privacy: true in spec.json"
