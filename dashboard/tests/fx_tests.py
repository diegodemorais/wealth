"""
FX (Câmbio) Domain Tests
Blocks: cambio-mercado | exposicao-cambial
Tab: now

Tests verify:
- cambio and mercado.cambio_brl_usd are present, numeric, and consistent
- mercado.cambio_mtd_pct is a plausible float
- macro.exposicao_cambial_pct is in [0, 100]
- concentracao_brasil.brasil_pct is in [0, 100]
- HTML renders FX-related content for both blocks
- Spec defines both blocks with correct data_fields
"""

from .base import registry, load_data, load_html, load_spec, get_nested, BUILD_PY

CAMBIO_MIN = 3.0
CAMBIO_MAX = 15.0
CAMBIO_CONSISTENCY_TOLERANCE = 0.01   # R$ — same source, must be identical or within rounding
MTD_MIN = -20.0
MTD_MAX = 20.0


# ---------------------------------------------------------------------------
# Block: cambio-mercado
# ---------------------------------------------------------------------------

@registry.test(
    block_id="cambio-mercado",
    category="DATA",
    description="cambio top-level key exists and is a positive number",
    severity="CRITICAL",
)
def _cambio_toplevel_exists():
    data = load_data()
    val = data.get("cambio")
    if val is None:
        return False, "data['cambio'] is missing"
    if not isinstance(val, (int, float)):
        return False, f"data['cambio'] is not numeric: {type(val).__name__}"
    if val <= 0:
        return False, f"data['cambio'] <= 0: {val}"
    return True, f"cambio = {val}"


@registry.test(
    block_id="cambio-mercado",
    category="DATA",
    description="mercado.cambio_brl_usd exists and is a positive number",
    severity="CRITICAL",
)
def _mercado_cambio_brl_usd_exists():
    data = load_data()
    val = get_nested(data, "mercado.cambio_brl_usd")
    if val is None:
        return False, "mercado.cambio_brl_usd is missing"
    if not isinstance(val, (int, float)):
        return False, f"mercado.cambio_brl_usd is not numeric: {type(val).__name__}"
    if val <= 0:
        return False, f"mercado.cambio_brl_usd <= 0: {val}"
    return True, f"mercado.cambio_brl_usd = {val}"


@registry.test(
    block_id="cambio-mercado",
    category="VALUE",
    description="cambio and mercado.cambio_brl_usd are consistent (same source, delta <= tolerance)",
    severity="CRITICAL",
)
def _cambio_consistency():
    data = load_data()
    top = data.get("cambio")
    nested = get_nested(data, "mercado.cambio_brl_usd")
    if top is None:
        return False, "data['cambio'] is missing — cannot compare"
    if nested is None:
        return False, "mercado.cambio_brl_usd is missing — cannot compare"
    if not isinstance(top, (int, float)) or not isinstance(nested, (int, float)):
        return False, f"One or both values are not numeric: top={top!r}, nested={nested!r}"
    delta = abs(top - nested)
    if delta > CAMBIO_CONSISTENCY_TOLERANCE:
        return False, (
            f"cambio inconsistency: top-level={top}, mercado.cambio_brl_usd={nested}, "
            f"delta={delta:.4f} > tolerance={CAMBIO_CONSISTENCY_TOLERANCE}. "
            "All BRL/USD conversions may be wrong."
        )
    return True, f"cambio top={top}, mercado={nested}, delta={delta:.4f}"


@registry.test(
    block_id="cambio-mercado",
    category="VALUE",
    description=f"cambio is within plausible BRL/USD range [{CAMBIO_MIN}, {CAMBIO_MAX}]",
    severity="CRITICAL",
)
def _cambio_plausible_range():
    data = load_data()
    val = data.get("cambio")
    if val is None or not isinstance(val, (int, float)):
        return False, f"cambio is missing or non-numeric: {val!r}"
    if not (CAMBIO_MIN <= val <= CAMBIO_MAX):
        return False, (
            f"cambio={val} outside plausible range [{CAMBIO_MIN}, {CAMBIO_MAX}]. "
            "Likely stale data or unit error — all portfolio BRL totals would be wrong."
        )
    return True, f"cambio={val} within [{CAMBIO_MIN}, {CAMBIO_MAX}]"


@registry.test(
    block_id="cambio-mercado",
    category="VALUE",
    description=f"mercado.cambio_mtd_pct is a float in plausible range [{MTD_MIN}, {MTD_MAX}]",
    severity="HIGH",
)
def _cambio_mtd_pct_plausible():
    data = load_data()
    val = get_nested(data, "mercado.cambio_mtd_pct")
    if val is None:
        return False, "mercado.cambio_mtd_pct is missing"
    if not isinstance(val, (int, float)):
        return False, f"mercado.cambio_mtd_pct is not numeric: {type(val).__name__}"
    if not (MTD_MIN <= val <= MTD_MAX):
        return False, (
            f"cambio_mtd_pct={val} outside plausible range [{MTD_MIN}, {MTD_MAX}]"
        )
    return True, f"cambio_mtd_pct={val}%"


@registry.test(
    block_id="cambio-mercado",
    category="RENDER",
    description="HTML references cambio_brl_usd rendering logic",
    severity="HIGH",
)
def _cambio_mercado_render_html():
    html = load_html()
    # The build injects DATA.cambio and mercado.cambio_brl_usd into the rendered page.
    # Both must appear as inline JSON data and as JS references.
    checks = [
        ("cambio_brl_usd", "mercado.cambio_brl_usd JSON key"),
        ("cambio_mtd_pct", "cambio_mtd_pct JSON key"),
        ("DATA.cambio", "JS reference to DATA.cambio"),
    ]
    missing = [label for token, label in checks if token not in html]
    if missing:
        return False, f"HTML missing: {', '.join(missing)}"
    return True, "All cambio-mercado render anchors present"


@registry.test(
    block_id="cambio-mercado",
    category="SPEC",
    description="spec.json defines cambio-mercado with required data_fields",
    severity="MEDIUM",
)
def _cambio_mercado_spec():
    spec = load_spec()
    blocks = {b["id"]: b for b in spec.get("blocks", [])}
    if "cambio-mercado" not in blocks:
        return False, "cambio-mercado block not found in spec.json"
    block = blocks["cambio-mercado"]
    required_fields = {"cambio", "mercado.cambio_brl_usd", "mercado.cambio_mtd_pct"}
    actual_fields = set(block.get("data_fields", []))
    missing = required_fields - actual_fields
    if missing:
        return False, f"cambio-mercado spec missing data_fields: {missing}"
    return True, f"cambio-mercado spec OK, fields={actual_fields}"


# ---------------------------------------------------------------------------
# Block: exposicao-cambial
# ---------------------------------------------------------------------------

@registry.test(
    block_id="exposicao-cambial",
    category="DATA",
    description="macro.exposicao_cambial_pct exists and is a number",
    severity="CRITICAL",
)
def _exposicao_cambial_pct_exists():
    data = load_data()
    val = get_nested(data, "macro.exposicao_cambial_pct")
    if val is None:
        return False, "macro.exposicao_cambial_pct is missing"
    if not isinstance(val, (int, float)):
        return False, f"macro.exposicao_cambial_pct is not numeric: {type(val).__name__}"
    return True, f"macro.exposicao_cambial_pct = {val}"


@registry.test(
    block_id="exposicao-cambial",
    category="DATA",
    description="concentracao_brasil.brasil_pct exists and is a number",
    severity="HIGH",
)
def _brasil_pct_exists():
    data = load_data()
    val = get_nested(data, "concentracao_brasil.brasil_pct")
    if val is None:
        return False, "concentracao_brasil.brasil_pct is missing"
    if not isinstance(val, (int, float)):
        return False, f"concentracao_brasil.brasil_pct is not numeric: {type(val).__name__}"
    return True, f"concentracao_brasil.brasil_pct = {val}"


@registry.test(
    block_id="exposicao-cambial",
    category="DATA",
    description="concentracao_brasil.total_portfolio_brl exists and is a positive number",
    severity="HIGH",
)
def _total_portfolio_brl_exists():
    data = load_data()
    val = get_nested(data, "concentracao_brasil.total_portfolio_brl")
    if val is None:
        return False, "concentracao_brasil.total_portfolio_brl is missing"
    if not isinstance(val, (int, float)):
        return False, f"concentracao_brasil.total_portfolio_brl is not numeric: {type(val).__name__}"
    if val <= 0:
        return False, f"concentracao_brasil.total_portfolio_brl <= 0: {val}"
    return True, f"total_portfolio_brl = R${val:,.0f}"


@registry.test(
    block_id="exposicao-cambial",
    category="VALUE",
    description="macro.exposicao_cambial_pct is in [0, 100]",
    severity="CRITICAL",
)
def _exposicao_cambial_pct_range():
    data = load_data()
    val = get_nested(data, "macro.exposicao_cambial_pct")
    if val is None or not isinstance(val, (int, float)):
        return False, f"macro.exposicao_cambial_pct is missing or non-numeric: {val!r}"
    if not (0.0 <= val <= 100.0):
        return False, f"exposicao_cambial_pct={val} outside [0, 100]"
    return True, f"exposicao_cambial_pct={val}%"


@registry.test(
    block_id="exposicao-cambial",
    category="VALUE",
    description="concentracao_brasil.brasil_pct is in [0, 100]",
    severity="HIGH",
)
def _brasil_pct_range():
    data = load_data()
    val = get_nested(data, "concentracao_brasil.brasil_pct")
    if val is None or not isinstance(val, (int, float)):
        return False, f"concentracao_brasil.brasil_pct is missing or non-numeric: {val!r}"
    if not (0.0 <= val <= 100.0):
        return False, f"brasil_pct={val} outside [0, 100]"
    return True, f"brasil_pct={val}%"


@registry.test(
    block_id="exposicao-cambial",
    category="VALUE",
    description="exposicao_cambial_pct + brasil_pct approximately sum to 100 (asset-liability consistency)",
    severity="HIGH",
)
def _exposicao_brasil_sum():
    """
    exposicao_cambial_pct represents the USD-exposed share of the portfolio.
    brasil_pct represents the BRL-concentrated share.
    They should be approximate complements (sum ~100%), accounting for possible
    rounding differences or overlapping classification.
    Tolerance: 5pp — beyond that signals a structural data inconsistency.
    """
    data = load_data()
    usd_pct = get_nested(data, "macro.exposicao_cambial_pct")
    brl_pct = get_nested(data, "concentracao_brasil.brasil_pct")
    if usd_pct is None or brl_pct is None:
        return False, f"Missing fields: exposicao_cambial_pct={usd_pct!r}, brasil_pct={brl_pct!r}"
    if not isinstance(usd_pct, (int, float)) or not isinstance(brl_pct, (int, float)):
        return False, "One or both fields are non-numeric"
    total = usd_pct + brl_pct
    tolerance = 5.0
    if abs(total - 100.0) > tolerance:
        return False, (
            f"exposicao_cambial_pct({usd_pct}) + brasil_pct({brl_pct}) = {total:.1f}, "
            f"expected ~100 (tolerance {tolerance}pp). "
            "Possible classification overlap or stale data."
        )
    return True, f"USD {usd_pct}% + BRL {brl_pct}% = {total:.1f}% (within {tolerance}pp of 100)"


@registry.test(
    block_id="exposicao-cambial",
    category="RENDER",
    description="HTML references exposicao_cambial_pct and brasil_pct rendering logic",
    severity="HIGH",
)
def _exposicao_cambial_render_html():
    html = load_html()
    checks = [
        ("exposicao_cambial_pct", "exposicao_cambial_pct JSON key or JS reference"),
        ("brasil_pct", "brasil_pct JSON key or JS reference"),
    ]
    missing = [label for token, label in checks if token not in html]
    if missing:
        return False, f"HTML missing: {', '.join(missing)}"
    return True, "All exposicao-cambial render anchors present"


@registry.test(
    block_id="exposicao-cambial",
    category="SPEC",
    description="spec.json defines exposicao-cambial with required data_fields",
    severity="MEDIUM",
)
def _exposicao_cambial_spec():
    spec = load_spec()
    blocks = {b["id"]: b for b in spec.get("blocks", [])}
    if "exposicao-cambial" not in blocks:
        return False, "exposicao-cambial block not found in spec.json"
    block = blocks["exposicao-cambial"]
    required_fields = {
        "macro.exposicao_cambial_pct",
        "concentracao_brasil.brasil_pct",
        "concentracao_brasil.total_portfolio_brl",
        "cambio",
    }
    actual_fields = set(block.get("data_fields", []))
    missing = required_fields - actual_fields
    if missing:
        return False, f"exposicao-cambial spec missing data_fields: {missing}"
    return True, f"exposicao-cambial spec OK, fields={actual_fields}"
