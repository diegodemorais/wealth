"""
RF (Renda Fixa) domain tests for the dashboard tester suite.

Blocks covered:
  - ipca-dca-semaforo  (now tab)
  - renda-plus-semaforo (now tab)
  - rf-posicoes        (portfolio tab)
  - duration-renda-plus (portfolio tab)

GIVEN/WHEN/THEN pattern; severities: CRITICAL | HIGH | MEDIUM
Categories: DATA | RENDER | VALUE | PRIVACY | SPEC
"""

import re
from .base import registry, load_data, load_html, load_spec, get_nested, BUILD_PY


# ─────────────────────────────────────────────────────────────────────────────
# BLOCK: ipca-dca-semaforo
# ─────────────────────────────────────────────────────────────────────────────

@registry.test(
    block_id="ipca-dca-semaforo",
    category="DATA",
    description="dca_status.ipca_longo required fields are present and non-null",
    severity="CRITICAL",
)
def _():
    """
    GIVEN data.json is loaded
    WHEN dca_status.ipca_longo is accessed
    THEN taxa_atual, piso, ativo, proxima_acao are all present and non-null
    """
    data = load_data()
    required = [
        "dca_status.ipca_longo.taxa_atual",
        "dca_status.ipca_longo.piso",
        "dca_status.ipca_longo.ativo",
        "dca_status.ipca_longo.proxima_acao",
    ]
    missing = [f for f in required if get_nested(data, f) is None]
    if missing:
        return False, f"Missing or null fields: {missing}"
    return True, "All required ipca_longo fields present"


@registry.test(
    block_id="ipca-dca-semaforo",
    category="DATA",
    description="pisos.pisoTaxaIpcaLongo matches dca_status.ipca_longo.piso",
    severity="CRITICAL",
)
def _():
    """
    GIVEN data.json is loaded
    WHEN pisos.pisoTaxaIpcaLongo and dca_status.ipca_longo.piso are read
    THEN they must be equal — single source of truth, no drift between fields
    """
    data = load_data()
    piso_pisos = get_nested(data, "pisos.pisoTaxaIpcaLongo")
    piso_dca = get_nested(data, "dca_status.ipca_longo.piso")
    if piso_pisos is None or piso_dca is None:
        return False, f"Missing values: pisos={piso_pisos}, dca_piso={piso_dca}"
    if piso_pisos != piso_dca:
        return False, f"Piso mismatch: pisos.pisoTaxaIpcaLongo={piso_pisos} != dca_status.ipca_longo.piso={piso_dca}"
    return True, f"Piso consistent at {piso_pisos}%"


@registry.test(
    block_id="ipca-dca-semaforo",
    category="VALUE",
    description="taxa_atual IPCA+ is within sanity range (0, 30)",
    severity="CRITICAL",
)
def _():
    """
    GIVEN dca_status.ipca_longo.taxa_atual is read from data.json
    WHEN the value is checked
    THEN it must be in the range (0, 30) — a real yield outside this range
         signals a data pipeline error (e.g. percentage expressed as decimal,
         stale data, or a field-name mismatch)
    """
    data = load_data()
    taxa = get_nested(data, "dca_status.ipca_longo.taxa_atual")
    if taxa is None:
        return False, "taxa_atual is None"
    if not (0 < taxa < 30):
        return False, f"taxa_atual={taxa} outside sanity range (0, 30)"
    return True, f"taxa_atual={taxa}% within sanity range"


@registry.test(
    block_id="ipca-dca-semaforo",
    category="VALUE",
    description="DCA ativo flag is consistent with taxa_atual vs piso comparison",
    severity="CRITICAL",
)
def _():
    """
    GIVEN taxa_atual and piso are read from dca_status.ipca_longo
    WHEN taxa_atual > piso
    THEN ativo must be True — otherwise the semaforo shows the wrong signal
         and DCA decisions downstream are misleading
    """
    data = load_data()
    taxa = get_nested(data, "dca_status.ipca_longo.taxa_atual")
    piso = get_nested(data, "dca_status.ipca_longo.piso")
    ativo = get_nested(data, "dca_status.ipca_longo.ativo")
    if taxa is None or piso is None or ativo is None:
        return False, f"Missing values: taxa={taxa}, piso={piso}, ativo={ativo}"
    if taxa > piso and ativo is not True:
        return False, (
            f"taxa_atual={taxa} > piso={piso} but ativo={ativo} — "
            "semaforo should show DCA ativo"
        )
    if taxa < piso and ativo is not False:
        return False, (
            f"taxa_atual={taxa} < piso={piso} but ativo={ativo} — "
            "semaforo should show DCA pausado"
        )
    return True, f"ativo={ativo} consistent with taxa={taxa} vs piso={piso}"


@registry.test(
    block_id="ipca-dca-semaforo",
    category="RENDER",
    description="dcaSection and dcaGrid containers exist in HTML",
    severity="HIGH",
)
def _():
    """
    GIVEN the built index.html is loaded
    WHEN RF DCA section elements are searched
    THEN id='dcaSection' and id='dcaGrid' must be present — these are the
         mount points that buildDcaStatus() populates at runtime
    """
    html = load_html()
    missing = []
    for element_id in ("dcaSection", "dcaGrid"):
        if f'id="{element_id}"' not in html:
            missing.append(element_id)
    if missing:
        return False, f"Missing HTML elements: {missing}"
    return True, "dcaSection and dcaGrid containers found in HTML"


@registry.test(
    block_id="ipca-dca-semaforo",
    category="RENDER",
    description="buildDcaStatus JS function exists in HTML",
    severity="HIGH",
)
def _():
    """
    GIVEN the built index.html is loaded
    WHEN the JS source is searched
    THEN buildDcaStatus function definition must be present — absence means
         the DCA semaforo block will never render
    """
    html = load_html()
    if "buildDcaStatus" not in html:
        return False, "buildDcaStatus function not found in HTML"
    return True, "buildDcaStatus function found in HTML"


@registry.test(
    block_id="ipca-dca-semaforo",
    category="VALUE",
    description="BUILD_PY does not hardcode specific taxa_atual IPCA+ values",
    severity="HIGH",
)
def _():
    """
    GIVEN scripts/build_dashboard.py is read
    WHEN the file is searched for specific known IPCA+ rate values
    THEN hardcoded taxa values (e.g. 7.07, 7.16) must not appear — all rates
         must flow through data.json from the pipeline, not from the build script
    """
    content = BUILD_PY.read_text()
    # Known historical IPCA+ taxa values that should live in data only
    suspicious = re.findall(r'\b(7\.07|7\.16|7\.58|6\.8[0-9]?)\b', content)
    if suspicious:
        return False, f"Hardcoded IPCA+ taxa found in build script: {set(suspicious)}"
    return True, "No hardcoded IPCA+ taxa values found in build script"


@registry.test(
    block_id="ipca-dca-semaforo",
    category="SPEC",
    description="ipca-dca-semaforo block exists in spec.json with required data_fields",
    severity="MEDIUM",
)
def _():
    """
    GIVEN spec.json is loaded
    WHEN ipca-dca-semaforo block is located
    THEN it must define all five required data_fields from the RF domain spec
    """
    spec = load_spec()
    blocks = {b["id"]: b for b in spec.get("blocks", [])}
    if "ipca-dca-semaforo" not in blocks:
        return False, "Block 'ipca-dca-semaforo' not found in spec.json"
    expected_fields = {
        "dca_status.ipca_longo.taxa_atual",
        "dca_status.ipca_longo.piso",
        "dca_status.ipca_longo.ativo",
        "dca_status.ipca_longo.proxima_acao",
        "pisos.pisoTaxaIpcaLongo",
    }
    actual_fields = set(blocks["ipca-dca-semaforo"].get("data_fields", []))
    missing = expected_fields - actual_fields
    if missing:
        return False, f"Missing data_fields in spec: {missing}"
    return True, "All required data_fields present in ipca-dca-semaforo spec"


# ─────────────────────────────────────────────────────────────────────────────
# BLOCK: renda-plus-semaforo
# ─────────────────────────────────────────────────────────────────────────────

@registry.test(
    block_id="renda-plus-semaforo",
    category="DATA",
    description="dca_status.renda_plus required fields are present and non-null",
    severity="CRITICAL",
)
def _():
    """
    GIVEN data.json is loaded
    WHEN dca_status.renda_plus is accessed
    THEN taxa_atual, piso_venda, gap_pp, proxima_acao are all present and non-null
    """
    data = load_data()
    required = [
        "dca_status.renda_plus.taxa_atual",
        "dca_status.renda_plus.piso_venda",
        "dca_status.renda_plus.gap_pp",
        "dca_status.renda_plus.proxima_acao",
    ]
    missing = [f for f in required if get_nested(data, f) is None]
    if missing:
        return False, f"Missing or null fields: {missing}"
    return True, "All required renda_plus fields present"


@registry.test(
    block_id="renda-plus-semaforo",
    category="DATA",
    description="pisos.pisoVendaRendaPlus matches dca_status.renda_plus.piso_venda",
    severity="CRITICAL",
)
def _():
    """
    GIVEN data.json is loaded
    WHEN pisos.pisoVendaRendaPlus and dca_status.renda_plus.piso_venda are read
    THEN they must be equal — drift here means the sell trigger shown on the
         semaforo differs from the operational floor in the pisos block
    """
    data = load_data()
    piso_pisos = get_nested(data, "pisos.pisoVendaRendaPlus")
    piso_dca = get_nested(data, "dca_status.renda_plus.piso_venda")
    if piso_pisos is None or piso_dca is None:
        return False, f"Missing values: pisos={piso_pisos}, dca_piso_venda={piso_dca}"
    if piso_pisos != piso_dca:
        return False, (
            f"Piso venda mismatch: pisos.pisoVendaRendaPlus={piso_pisos} "
            f"!= dca_status.renda_plus.piso_venda={piso_dca}"
        )
    return True, f"Piso venda consistent at {piso_pisos}%"


@registry.test(
    block_id="renda-plus-semaforo",
    category="VALUE",
    description="gap_pp equals taxa_atual minus piso_compra for Renda+",
    severity="CRITICAL",
)
def _():
    """
    GIVEN taxa_atual and piso_compra are read from dca_status.renda_plus
    WHEN gap_pp is compared to the computed difference
    THEN gap_pp must equal taxa_atual - piso_compra (within 0.015pp tolerance).

    Note: dca_status.renda_plus.gap_pp is the distance to the BUY floor
    (piso_compra = 6.5%), not the sell floor. The sell-floor distance lives
    separately in rf.renda2065.distancia_gatilho.gap_pp.
    """
    data = load_data()
    taxa = get_nested(data, "dca_status.renda_plus.taxa_atual")
    piso_compra = get_nested(data, "dca_status.renda_plus.piso_compra")
    gap = get_nested(data, "dca_status.renda_plus.gap_pp")
    if taxa is None or piso_compra is None or gap is None:
        return False, f"Missing values: taxa={taxa}, piso_compra={piso_compra}, gap_pp={gap}"
    expected_gap = round(taxa - piso_compra, 2)
    if abs(gap - expected_gap) > 0.015:
        return False, (
            f"gap_pp={gap} does not match taxa_atual - piso_compra = "
            f"{taxa} - {piso_compra} = {expected_gap}"
        )
    return True, f"gap_pp={gap} matches {taxa} - {piso_compra} = {expected_gap}"


@registry.test(
    block_id="renda-plus-semaforo",
    category="VALUE",
    description="distancia_gatilho gap_pp equals taxa_atual minus piso_venda",
    severity="CRITICAL",
)
def _():
    """
    GIVEN rf.renda2065.distancia_gatilho fields are read
    WHEN gap_pp is compared to taxa_atual - piso_venda
    THEN they must agree within 0.015pp — this is the sell-trigger distance
         shown on the semaforo. Inconsistency here means the dashboard could
         show the wrong color/urgency for the exit signal.
    """
    data = load_data()
    taxa = get_nested(data, "rf.renda2065.distancia_gatilho.taxa_atual")
    piso_venda = get_nested(data, "rf.renda2065.distancia_gatilho.piso_venda")
    gap = get_nested(data, "rf.renda2065.distancia_gatilho.gap_pp")
    if taxa is None or piso_venda is None or gap is None:
        return False, f"Missing distancia_gatilho: taxa={taxa}, piso_venda={piso_venda}, gap_pp={gap}"
    expected_gap = round(taxa - piso_venda, 2)
    if abs(gap - expected_gap) > 0.015:
        return False, (
            f"distancia_gatilho.gap_pp={gap} does not match "
            f"taxa_atual - piso_venda = {taxa} - {piso_venda} = {expected_gap}"
        )
    return True, f"distancia_gatilho gap_pp={gap} matches {taxa} - {piso_venda} = {expected_gap}"


@registry.test(
    block_id="renda-plus-semaforo",
    category="VALUE",
    description="taxa_atual Renda+ is within sanity range (0, 30)",
    severity="CRITICAL",
)
def _():
    """
    GIVEN dca_status.renda_plus.taxa_atual is read from data.json
    WHEN the value is checked
    THEN it must be in the range (0, 30) — same pipeline-error guard as IPCA+
    """
    data = load_data()
    taxa = get_nested(data, "dca_status.renda_plus.taxa_atual")
    if taxa is None:
        return False, "taxa_atual is None"
    if not (0 < taxa < 30):
        return False, f"taxa_atual={taxa} outside sanity range (0, 30)"
    return True, f"taxa_atual={taxa}% within sanity range"


@registry.test(
    block_id="renda-plus-semaforo",
    category="RENDER",
    description="ipcaTaxaStatus and ipcaProgressLabel elements exist in HTML",
    severity="HIGH",
)
def _():
    """
    GIVEN the built index.html is loaded
    WHEN HTML is searched for Renda+/DCA display elements
    THEN ipcaTaxaStatus and ipcaProgressLabel must be present — these are the
         DOM nodes that the DCA status builder writes semaforo text into
    """
    html = load_html()
    missing = []
    for element_id in ("ipcaTaxaStatus", "ipcaProgressLabel"):
        if f'id="{element_id}"' not in html:
            missing.append(element_id)
    if missing:
        return False, f"Missing HTML elements: {missing}"
    return True, "ipcaTaxaStatus and ipcaProgressLabel found in HTML"


@registry.test(
    block_id="renda-plus-semaforo",
    category="SPEC",
    description="renda-plus-semaforo block exists in spec.json with required data_fields",
    severity="MEDIUM",
)
def _():
    """
    GIVEN spec.json is loaded
    WHEN renda-plus-semaforo block is located
    THEN it must define all five required data_fields
    """
    spec = load_spec()
    blocks = {b["id"]: b for b in spec.get("blocks", [])}
    if "renda-plus-semaforo" not in blocks:
        return False, "Block 'renda-plus-semaforo' not found in spec.json"
    expected_fields = {
        "dca_status.renda_plus.taxa_atual",
        "dca_status.renda_plus.piso_venda",
        "dca_status.renda_plus.gap_pp",
        "dca_status.renda_plus.proxima_acao",
        "pisos.pisoVendaRendaPlus",
    }
    actual_fields = set(blocks["renda-plus-semaforo"].get("data_fields", []))
    missing = expected_fields - actual_fields
    if missing:
        return False, f"Missing data_fields in spec: {missing}"
    return True, "All required data_fields present in renda-plus-semaforo spec"


# ─────────────────────────────────────────────────────────────────────────────
# BLOCK: rf-posicoes
# ─────────────────────────────────────────────────────────────────────────────

@registry.test(
    block_id="rf-posicoes",
    category="DATA",
    description="rf.ipca2029, rf.ipca2040 and rf.renda2065 have non-null valor and taxa",
    severity="CRITICAL",
)
def _():
    """
    GIVEN data.json is loaded
    WHEN the three RF positions are accessed
    THEN valor and taxa must be present and non-null for each — absence means
         the positions table will render zeros or dashes, silently misstating
         the RF inventory
    """
    data = load_data()
    required = [
        "rf.ipca2029.valor",
        "rf.ipca2029.taxa",
        "rf.ipca2040.valor",
        "rf.ipca2040.taxa",
        "rf.renda2065.valor",
        "rf.renda2065.taxa",
    ]
    missing = [f for f in required if get_nested(data, f) is None]
    if missing:
        return False, f"Missing or null RF position fields: {missing}"
    return True, "All RF position valor/taxa fields present"


@registry.test(
    block_id="rf-posicoes",
    category="DATA",
    description="rf_total_brl matches sum of individual RF positions",
    severity="CRITICAL",
)
def _():
    """
    GIVEN data.json is loaded
    WHEN concentracao_brasil.composicao.rf_total_brl is compared to the sum
         of rf.ipca2029.valor + rf.ipca2040.valor + rf.renda2065.valor
    THEN the difference must be within R$1 (rounding) — a mismatch means
         the concentracao chart and the positions table show inconsistent totals
    """
    data = load_data()
    total = get_nested(data, "concentracao_brasil.composicao.rf_total_brl")
    v2029 = get_nested(data, "rf.ipca2029.valor")
    v2040 = get_nested(data, "rf.ipca2040.valor")
    v2050 = get_nested(data, "rf.ipca2050.valor") or 0  # opcional — pode não existir
    v2065 = get_nested(data, "rf.renda2065.valor")
    if any(v is None for v in (total, v2029, v2040, v2065)):
        return False, f"Missing values: total={total}, 2029={v2029}, 2040={v2040}, 2065={v2065}"
    computed = v2029 + v2040 + v2050 + v2065
    diff = abs(total - computed)
    if diff > 1:
        return False, (
            f"rf_total_brl={total} != sum of positions={computed:.2f} "
            f"(diff={diff:.2f})"
        )
    return True, f"rf_total_brl={total} consistent with sum={computed:.2f}"


@registry.test(
    block_id="rf-posicoes",
    category="VALUE",
    description="All RF taxa values are within sanity range (0, 30)",
    severity="CRITICAL",
)
def _():
    """
    GIVEN rf.ipca2029.taxa, rf.ipca2040.taxa, rf.renda2065.taxa are read
    WHEN each value is checked
    THEN all must be in the range (0, 30) — guards against decimal/percentage
         confusion in the data pipeline (e.g. 0.0716 instead of 7.16)
    """
    data = load_data()
    taxa_fields = {
        "rf.ipca2029.taxa": get_nested(data, "rf.ipca2029.taxa"),
        "rf.ipca2040.taxa": get_nested(data, "rf.ipca2040.taxa"),
        "rf.renda2065.taxa": get_nested(data, "rf.renda2065.taxa"),
    }
    out_of_range = {k: v for k, v in taxa_fields.items() if v is not None and not (0 < v < 30)}
    null_fields = [k for k, v in taxa_fields.items() if v is None]
    if null_fields:
        return False, f"Null taxa fields: {null_fields}"
    if out_of_range:
        return False, f"Taxa values outside sanity range (0, 30): {out_of_range}"
    return True, f"All RF taxa within range: { {k: v for k, v in taxa_fields.items()} }"


@registry.test(
    block_id="rf-posicoes",
    category="VALUE",
    description="All RF valor values are positive",
    severity="HIGH",
)
def _():
    """
    GIVEN rf position valor fields are read
    WHEN each value is checked
    THEN all must be > 0 — a zero or negative valor suggests a data entry error
         or a position that should have been removed from the inventory
    """
    data = load_data()
    valor_fields = {
        "rf.ipca2029.valor": get_nested(data, "rf.ipca2029.valor"),
        "rf.ipca2040.valor": get_nested(data, "rf.ipca2040.valor"),
        "rf.renda2065.valor": get_nested(data, "rf.renda2065.valor"),
    }
    non_positive = {k: v for k, v in valor_fields.items() if v is not None and v <= 0}
    if non_positive:
        return False, f"Non-positive valor values: {non_positive}"
    return True, "All RF valor values are positive"


@registry.test(
    block_id="rf-posicoes",
    category="RENDER",
    description="rfCardsGrid container and buildRfCards function exist in HTML",
    severity="HIGH",
)
def _():
    """
    GIVEN the built index.html is loaded
    WHEN RF portfolio section elements are searched
    THEN id='rfCardsGrid' must be present as the mount point for the RF
         positions table, and buildRfCards must exist as its render function
    """
    html = load_html()
    missing = []
    if 'id="rfCardsGrid"' not in html:
        missing.append("rfCardsGrid (container)")
    if "buildRfCards" not in html:
        missing.append("buildRfCards (function)")
    if missing:
        return False, f"Missing HTML elements/functions: {missing}"
    return True, "rfCardsGrid container and buildRfCards function found in HTML"


@registry.test(
    block_id="rf-posicoes",
    category="PRIVACY",
    description="rf-posicoes block is marked privacy=true in spec.json",
    severity="HIGH",
)
def _():
    """
    GIVEN spec.json is loaded
    WHEN the rf-posicoes block privacy field is checked
    THEN privacy must be True — this block contains absolute BRL position values
         and must be hidden in privacy mode
    """
    spec = load_spec()
    blocks = {b["id"]: b for b in spec.get("blocks", [])}
    if "rf-posicoes" not in blocks:
        return False, "Block 'rf-posicoes' not found in spec.json"
    privacy = blocks["rf-posicoes"].get("privacy")
    if privacy is not True:
        return False, f"rf-posicoes privacy={privacy}, expected True"
    return True, "rf-posicoes correctly marked privacy=True"


@registry.test(
    block_id="rf-posicoes",
    category="SPEC",
    description="rf-posicoes block exists in spec.json with required data_fields",
    severity="MEDIUM",
)
def _():
    """
    GIVEN spec.json is loaded
    WHEN rf-posicoes block is located
    THEN it must define all seven required data_fields
    """
    spec = load_spec()
    blocks = {b["id"]: b for b in spec.get("blocks", [])}
    if "rf-posicoes" not in blocks:
        return False, "Block 'rf-posicoes' not found in spec.json"
    expected_fields = {
        "rf.ipca2029.valor",
        "rf.ipca2029.taxa",
        "rf.ipca2040.valor",
        "rf.ipca2040.taxa",
        "rf.renda2065.valor",
        "rf.renda2065.taxa",
        "concentracao_brasil.composicao.rf_total_brl",
    }
    actual_fields = set(blocks["rf-posicoes"].get("data_fields", []))
    missing = expected_fields - actual_fields
    if missing:
        return False, f"Missing data_fields in spec: {missing}"
    return True, "All required data_fields present in rf-posicoes spec"


# ─────────────────────────────────────────────────────────────────────────────
# BLOCK: duration-renda-plus
# ─────────────────────────────────────────────────────────────────────────────

@registry.test(
    block_id="duration-renda-plus",
    category="DATA",
    description="rf.renda2065 duration and MtM fields are present and non-null",
    severity="CRITICAL",
)
def _():
    """
    GIVEN data.json is loaded
    WHEN rf.renda2065 duration sub-fields and mtm_impact_1pp are accessed
    THEN macaulay_anos, modificada_anos and mtm_impact_1pp must all be non-null
         — without these the duration card renders blank, removing the MtM risk
         signal for the tactical position
    """
    data = load_data()
    required = [
        "rf.renda2065.duration.macaulay_anos",
        "rf.renda2065.duration.modificada_anos",
        "rf.renda2065.mtm_impact_1pp",
    ]
    missing = [f for f in required if get_nested(data, f) is None]
    if missing:
        return False, f"Missing or null duration/MtM fields: {missing}"
    return True, "All duration and MtM fields present"


@registry.test(
    block_id="duration-renda-plus",
    category="VALUE",
    description="Modified duration < Macaulay duration for Renda+ 2065",
    severity="CRITICAL",
)
def _():
    """
    GIVEN macaulay_anos and modificada_anos are read from rf.renda2065.duration
    WHEN the two values are compared
    THEN modificada_anos must be strictly less than macaulay_anos — this is a
         mathematical identity for coupon-bearing bonds: D_mod = D_mac / (1 + y/k).
         Violation signals a calculation error in the duration methodology.
    """
    data = load_data()
    macaulay = get_nested(data, "rf.renda2065.duration.macaulay_anos")
    modificada = get_nested(data, "rf.renda2065.duration.modificada_anos")
    if macaulay is None or modificada is None:
        return False, f"Missing values: macaulay={macaulay}, modificada={modificada}"
    if modificada >= macaulay:
        return False, (
            f"modificada_anos={modificada} >= macaulay_anos={macaulay} — "
            "violates bond duration identity D_mod < D_mac"
        )
    return True, f"Duration identity holds: modificada={modificada} < macaulay={macaulay}"


@registry.test(
    block_id="duration-renda-plus",
    category="VALUE",
    description="mtm_impact_1pp is negative (bond price falls when rate rises)",
    severity="CRITICAL",
)
def _():
    """
    GIVEN rf.renda2065.mtm_impact_1pp is read from data.json
    WHEN the value is checked
    THEN it must be negative — for a long-duration fixed-income bond, a +1pp
         rise in yield reduces price. A positive value means the MtM impact
         sign convention is inverted, producing a misleading risk signal.
    """
    data = load_data()
    mtm = get_nested(data, "rf.renda2065.mtm_impact_1pp")
    if mtm is None:
        return False, "mtm_impact_1pp is None"
    if mtm >= 0:
        return False, (
            f"mtm_impact_1pp={mtm} is non-negative — expected negative "
            "(bond price falls when yield rises)"
        )
    return True, f"mtm_impact_1pp={mtm}% is negative as expected"


@registry.test(
    block_id="duration-renda-plus",
    category="VALUE",
    description="mtm_impact_1pp magnitude is approximately equal to modified duration",
    severity="HIGH",
)
def _():
    """
    GIVEN mtm_impact_1pp and modificada_anos are read
    WHEN abs(mtm_impact_1pp) is compared to modificada_anos
    THEN they should be approximately equal within 1 year/pp tolerance —
         the standard approximation is: price change (%) ≈ -D_mod × Δy.
         For Δy = 1pp, this gives price change ≈ -D_mod. Large deviation
         indicates a computation inconsistency in the pipeline.
    """
    data = load_data()
    mtm = get_nested(data, "rf.renda2065.mtm_impact_1pp")
    modificada = get_nested(data, "rf.renda2065.duration.modificada_anos")
    if mtm is None or modificada is None:
        return False, f"Missing values: mtm={mtm}, modificada={modificada}"
    diff = abs(abs(mtm) - modificada)
    if diff > 1.0:
        return False, (
            f"abs(mtm_impact_1pp)={abs(mtm)} differs from "
            f"modificada_anos={modificada} by {diff:.2f} — exceeds 1.0 tolerance"
        )
    return True, (
        f"MtM approximation holds: |mtm|={abs(mtm)} ≈ D_mod={modificada} "
        f"(diff={diff:.2f})"
    )


@registry.test(
    block_id="duration-renda-plus",
    category="VALUE",
    description="Macaulay duration is plausible for a 2065 maturity bond",
    severity="HIGH",
)
def _():
    """
    GIVEN rf.renda2065.duration.macaulay_anos is read
    WHEN the value is checked against a plausible range
    THEN macaulay_anos must be between 15 and 45 years — the Renda+ 2065 bond
         matures in ~39 years from 2026. A duration outside this range indicates
         a data entry error or wrong bond maturity.
    """
    data = load_data()
    macaulay = get_nested(data, "rf.renda2065.duration.macaulay_anos")
    if macaulay is None:
        return False, "macaulay_anos is None"
    if not (15 <= macaulay <= 45):
        return False, (
            f"macaulay_anos={macaulay} outside plausible range [15, 45] "
            "for Renda+ 2065 maturity"
        )
    return True, f"macaulay_anos={macaulay} within plausible range [15, 45]"


@registry.test(
    block_id="duration-renda-plus",
    category="RENDER",
    description="duration-block CSS class and rfCardsGrid container exist in HTML",
    severity="HIGH",
)
def _():
    """
    GIVEN the built index.html is loaded
    WHEN HTML is searched for duration display elements
    THEN the duration-block CSS class and rfCardsGrid container must be present —
         buildRfCards() injects duration-block markup into rfCardsGrid for the
         Renda+ 2065 card
    """
    html = load_html()
    missing = []
    if "duration-block" not in html:
        missing.append("duration-block (CSS class)")
    if 'id="rfCardsGrid"' not in html:
        missing.append("rfCardsGrid (container)")
    if missing:
        return False, f"Missing HTML elements: {missing}"
    return True, "duration-block class and rfCardsGrid container found in HTML"


@registry.test(
    block_id="duration-renda-plus",
    category="PRIVACY",
    description="duration-renda-plus block is marked privacy=true in spec.json",
    severity="HIGH",
)
def _():
    """
    GIVEN spec.json is loaded
    WHEN the duration-renda-plus block privacy field is checked
    THEN privacy must be True — this block shows absolute position value
         and must be hidden in privacy mode
    """
    spec = load_spec()
    blocks = {b["id"]: b for b in spec.get("blocks", [])}
    if "duration-renda-plus" not in blocks:
        return False, "Block 'duration-renda-plus' not found in spec.json"
    privacy = blocks["duration-renda-plus"].get("privacy")
    if privacy is not True:
        return False, f"duration-renda-plus privacy={privacy}, expected True"
    return True, "duration-renda-plus correctly marked privacy=True"


@registry.test(
    block_id="duration-renda-plus",
    category="SPEC",
    description="duration-renda-plus block exists in spec.json with required data_fields",
    severity="MEDIUM",
)
def _():
    """
    GIVEN spec.json is loaded
    WHEN duration-renda-plus block is located
    THEN it must define all five required data_fields
    """
    spec = load_spec()
    blocks = {b["id"]: b for b in spec.get("blocks", [])}
    if "duration-renda-plus" not in blocks:
        return False, "Block 'duration-renda-plus' not found in spec.json"
    expected_fields = {
        "rf.renda2065.duration.macaulay_anos",
        "rf.renda2065.duration.modificada_anos",
        "rf.renda2065.mtm_impact_1pp",
        "rf.renda2065.taxa",
        "rf.renda2065.valor",
    }
    actual_fields = set(blocks["duration-renda-plus"].get("data_fields", []))
    missing = expected_fields - actual_fields
    if missing:
        return False, f"Missing data_fields in spec: {missing}"
    return True, "All required data_fields present in duration-renda-plus spec"
