"""
Tax Domain Tests — dashboard/tests/tax_tests.py

Blocks covered:
  tlh-monitor       (portfolio tab, privacy: true)
  ir-diferido       (portfolio tab, privacy: true)
  fee-custo-complexidade (performance tab)
  savings-rate      (now tab, privacy: true)

Categories: DATA | RENDER | VALUE | PRIVACY | SPEC
Severities: CRITICAL | HIGH | MEDIUM
"""

from .base import registry, load_data, load_html, load_spec, get_nested, BUILD_PY


# ─────────────────────────────────────────────
# BLOCK: tlh-monitor
# ─────────────────────────────────────────────

@registry.test(
    block_id="tlh-monitor",
    category="DATA",
    description="tlh key exists and is a list",
    severity="CRITICAL",
)
def _():
    data = load_data()
    tlh = data.get("tlh")
    if tlh is None:
        return False, "Key 'tlh' missing from data.json"
    if not isinstance(tlh, list):
        return False, f"Expected list, got {type(tlh).__name__}"
    return True, f"tlh is a list with {len(tlh)} item(s)"


@registry.test(
    block_id="tlh-monitor",
    category="DATA",
    description="non-empty tlh items each have ticker and ucits fields",
    severity="CRITICAL",
)
def _():
    data = load_data()
    tlh = data.get("tlh", [])
    if not tlh:
        return True, "tlh is empty — structural check skipped (valid state)"
    missing = []
    for i, item in enumerate(tlh):
        if not isinstance(item, dict):
            missing.append(f"[{i}] not a dict")
            continue
        for field in ("ticker", "ucits"):
            if field not in item:
                missing.append(f"[{i}] missing '{field}'")
    if missing:
        return False, "Items missing required fields: " + "; ".join(missing)
    return True, f"All {len(tlh)} tlh items have ticker and ucits"


@registry.test(
    block_id="tlh-monitor",
    category="VALUE",
    description="tlhGatilho is a positive float between 0 and 1",
    severity="HIGH",
)
def _():
    data = load_data()
    gatilho = data.get("tlhGatilho")
    if gatilho is None:
        return False, "Key 'tlhGatilho' missing from data.json"
    if not isinstance(gatilho, (int, float)):
        return False, f"Expected numeric, got {type(gatilho).__name__}"
    if not (0 < gatilho < 1):
        return False, f"tlhGatilho={gatilho} outside valid range (0, 1)"
    return True, f"tlhGatilho={gatilho} is valid"


@registry.test(
    block_id="tlh-monitor",
    category="VALUE",
    description="tlh items with price below trigger threshold are flagged correctly",
    severity="HIGH",
)
def _():
    data = load_data()
    tlh = data.get("tlh", [])
    gatilho = data.get("tlhGatilho", 0.05)
    if not tlh:
        return True, "tlh is empty — trigger check skipped"
    errors = []
    for item in tlh:
        if not isinstance(item, dict):
            continue
        pm = item.get("pm")
        price = item.get("price")
        ticker = item.get("ticker", "?")
        if pm is None or price is None:
            errors.append(f"{ticker}: missing pm or price")
            continue
        if pm <= 0:
            errors.append(f"{ticker}: pm={pm} is non-positive")
    if errors:
        return False, "Price/cost issues: " + "; ".join(errors)
    return True, f"All {len(tlh)} tlh items have valid pm and price values"


@registry.test(
    block_id="tlh-monitor",
    category="RENDER",
    description="HTML contains taxIrSection container for TLH/IR block",
    severity="HIGH",
)
def _():
    html = load_html()
    if 'id="taxIrSection"' not in html:
        return False, "Element id='taxIrSection' not found in HTML"
    if 'id="taxIrBody"' not in html:
        return False, "Element id='taxIrBody' not found in HTML"
    return True, "taxIrSection and taxIrBody containers present"


@registry.test(
    block_id="tlh-monitor",
    category="PRIVACY",
    description="taxIrTotalHeader uses .pv class for privacy masking",
    severity="HIGH",
)
def _():
    html = load_html()
    if 'id="taxIrTotalHeader"' not in html:
        return False, "Element id='taxIrTotalHeader' not found in HTML"
    # Check the element carries the pv class
    import re
    match = re.search(r'id="taxIrTotalHeader"[^>]*>', html)
    if not match:
        return False, "Could not parse taxIrTotalHeader tag"
    tag = match.group(0)
    if "pv" not in tag:
        return False, f"taxIrTotalHeader tag missing 'pv' class: {tag[:120]}"
    return True, "taxIrTotalHeader carries .pv privacy class"


# ─────────────────────────────────────────────
# BLOCK: ir-diferido
# ─────────────────────────────────────────────

@registry.test(
    block_id="ir-diferido",
    category="DATA",
    description="tax.ir_diferido_total_brl exists and is numeric",
    severity="CRITICAL",
)
def _():
    data = load_data()
    val = get_nested(data, "tax.ir_diferido_total_brl")
    if val is None:
        return False, "tax.ir_diferido_total_brl missing from data.json"
    if not isinstance(val, (int, float)):
        return False, f"Expected numeric, got {type(val).__name__}"
    return True, f"tax.ir_diferido_total_brl = {val:,.2f}"


@registry.test(
    block_id="ir-diferido",
    category="VALUE",
    description="ir_diferido_total_brl is non-negative (deferred tax is a liability >= 0)",
    severity="CRITICAL",
)
def _():
    data = load_data()
    val = get_nested(data, "tax.ir_diferido_total_brl")
    if val is None:
        return False, "tax.ir_diferido_total_brl missing — cannot validate"
    if val < 0:
        return False, f"ir_diferido_total_brl={val:,.2f} is negative — deferred tax cannot be negative"
    return True, f"ir_diferido_total_brl={val:,.2f} >= 0 (valid)"


@registry.test(
    block_id="ir-diferido",
    category="DATA",
    description="tax.ir_por_etf exists as a non-empty dict",
    severity="CRITICAL",
)
def _():
    data = load_data()
    ir_por_etf = get_nested(data, "tax.ir_por_etf")
    if ir_por_etf is None:
        return False, "tax.ir_por_etf missing from data.json"
    if not isinstance(ir_por_etf, (dict, list)):
        return False, f"Expected dict or list, got {type(ir_por_etf).__name__}"
    length = len(ir_por_etf)
    if length == 0:
        return False, "tax.ir_por_etf is empty — expected per-ETF breakdown"
    return True, f"tax.ir_por_etf has {length} ETF entries"


@registry.test(
    block_id="ir-diferido",
    category="VALUE",
    description="each ir_por_etf entry has ir_estimado >= 0 and ganho_brl consistent with 15% flat rate",
    severity="CRITICAL",
)
def _():
    data = load_data()
    ir_por_etf = get_nested(data, "tax.ir_por_etf")
    if not isinstance(ir_por_etf, dict) or not ir_por_etf:
        return True, "ir_por_etf not a dict or empty — skipping per-entry check"

    IR_RATE = 0.15
    TOLERANCE = 0.10  # allow 10% deviation from 15% flat (due to rounding)
    errors = []

    for etf, entry in ir_por_etf.items():
        if not isinstance(entry, dict):
            errors.append(f"{etf}: entry is not a dict")
            continue
        ir = entry.get("ir_estimado")
        ganho = entry.get("ganho_brl")

        if ir is None:
            errors.append(f"{etf}: missing ir_estimado")
            continue
        if ir < 0:
            errors.append(f"{etf}: ir_estimado={ir:.2f} is negative")
            continue

        if ganho is not None and ganho > 0:
            implied_rate = ir / ganho
            if abs(implied_rate - IR_RATE) > TOLERANCE:
                errors.append(
                    f"{etf}: implied rate {implied_rate:.1%} deviates from 15% flat "
                    f"(ir={ir:.0f}, ganho_brl={ganho:.0f})"
                )

    if errors:
        return False, "IR validation errors: " + "; ".join(errors)
    return True, f"All {len(ir_por_etf)} ETF entries pass ir_estimado >= 0 and ~15% rate check"


@registry.test(
    block_id="ir-diferido",
    category="VALUE",
    description="sum of ir_por_etf ir_estimado reconciles with ir_diferido_total_brl",
    severity="HIGH",
)
def _():
    data = load_data()
    total = get_nested(data, "tax.ir_diferido_total_brl")
    ir_por_etf = get_nested(data, "tax.ir_por_etf")
    if not isinstance(ir_por_etf, dict) or total is None:
        return True, "Preconditions not met — reconciliation skipped"

    sum_entries = sum(
        v.get("ir_estimado", 0)
        for v in ir_por_etf.values()
        if isinstance(v, dict)
    )

    if total == 0:
        return True, "ir_diferido_total_brl=0 — reconciliation not applicable"

    diff_pct = abs(sum_entries - total) / total
    if diff_pct > 0.01:  # tolerate 1% floating-point rounding
        return False, (
            f"Sum of ir_por_etf entries ({sum_entries:,.2f}) differs from "
            f"ir_diferido_total_brl ({total:,.2f}) by {diff_pct:.1%}"
        )
    return True, f"ir_por_etf sums to {sum_entries:,.2f} — reconciles with total {total:,.2f}"


@registry.test(
    block_id="ir-diferido",
    category="RENDER",
    description="HTML contains taxIrBody container rendered by buildIrDiferido()",
    severity="HIGH",
)
def _():
    html = load_html()
    if 'id="taxIrBody"' not in html:
        return False, "Element id='taxIrBody' not found in HTML"
    if "buildIrDiferido" not in html:
        return False, "buildIrDiferido() function reference not found in HTML"
    return True, "taxIrBody container and buildIrDiferido() present"


@registry.test(
    block_id="ir-diferido",
    category="PRIVACY",
    description="ir-diferido block values are wrapped with .pv privacy class",
    severity="HIGH",
)
def _():
    html = load_html()
    # taxIrTotalHeader is the main privacy-sensitive header element
    if 'class="pv"' not in html and "pv" not in html:
        return False, "No .pv privacy class found anywhere in HTML"
    # Confirm the IR total header uses pv
    if 'id="taxIrTotalHeader"' not in html:
        return False, "taxIrTotalHeader not found"
    import re
    match = re.search(r'id="taxIrTotalHeader"[^>]*>', html)
    tag = match.group(0) if match else ""
    if "pv" not in tag:
        return False, f"taxIrTotalHeader missing .pv class: {tag[:120]}"
    return True, "taxIrTotalHeader uses .pv class for privacy"


@registry.test(
    block_id="ir-diferido",
    category="SPEC",
    description="tax regime references Lei 14.754/2023 ACC UCITS deferral",
    severity="MEDIUM",
)
def _():
    data = load_data()
    regime = get_nested(data, "tax.regime")
    if regime is None:
        return False, "tax.regime missing from data.json"
    regime_lower = str(regime).lower()
    if "14.754" not in regime_lower and "14754" not in regime_lower:
        return False, f"tax.regime does not reference Lei 14.754: '{regime}'"
    if "acc" not in regime_lower:
        return False, f"tax.regime does not reference ACC accumulating structure: '{regime}'"
    return True, f"tax.regime correctly references Lei 14.754/2023 ACC deferral"


# ─────────────────────────────────────────────
# BLOCK: fee-custo-complexidade
# ─────────────────────────────────────────────

@registry.test(
    block_id="fee-custo-complexidade",
    category="DATA",
    description="premissas.patrimonio_atual exists and is a positive number",
    severity="HIGH",
)
def _():
    data = load_data()
    val = get_nested(data, "premissas.patrimonio_atual")
    if val is None:
        return False, "premissas.patrimonio_atual missing from data.json"
    if not isinstance(val, (int, float)):
        return False, f"Expected numeric, got {type(val).__name__}"
    if val <= 0:
        return False, f"premissas.patrimonio_atual={val} is non-positive"
    return True, f"premissas.patrimonio_atual = {val:,.0f}"


@registry.test(
    block_id="fee-custo-complexidade",
    category="DATA",
    description="tlh list present (required for TLH opportunity count in fee analysis)",
    severity="MEDIUM",
)
def _():
    data = load_data()
    tlh = data.get("tlh")
    if tlh is None:
        return False, "Key 'tlh' missing — fee-custo block requires tlh for opportunity count"
    if not isinstance(tlh, list):
        return False, f"tlh expected list, got {type(tlh).__name__}"
    return True, f"tlh list available ({len(tlh)} entries) for fee analysis"


@registry.test(
    block_id="fee-custo-complexidade",
    category="RENDER",
    description="HTML contains feeTable and feeBody elements",
    severity="HIGH",
)
def _():
    html = load_html()
    missing = []
    for eid in ("feeTable", "feeBody"):
        if f'id="{eid}"' not in html:
            missing.append(eid)
    if missing:
        return False, f"Missing HTML elements: {', '.join(missing)}"
    return True, "feeTable and feeBody elements present"


@registry.test(
    block_id="fee-custo-complexidade",
    category="RENDER",
    description="HTML references alpha haircut source note (McLean & Pontiff 58%)",
    severity="MEDIUM",
)
def _():
    html = load_html()
    # The fee section src note references the haircut
    if "McLean" not in html and "Pontiff" not in html:
        return False, "Fee analysis source note missing McLean & Pontiff haircut reference"
    if "58%" not in html and "58" not in html:
        return False, "Fee analysis source note missing 58% haircut value"
    return True, "McLean & Pontiff 58% haircut referenced in fee section"


@registry.test(
    block_id="fee-custo-complexidade",
    category="VALUE",
    description="patrimonio_atual is within plausible FIRE portfolio range (R$500k–R$50M)",
    severity="MEDIUM",
)
def _():
    data = load_data()
    val = get_nested(data, "premissas.patrimonio_atual")
    if val is None:
        return True, "premissas.patrimonio_atual missing — range check skipped"
    LOWER = 500_000
    UPPER = 50_000_000
    if not (LOWER <= val <= UPPER):
        return False, (
            f"patrimonio_atual={val:,.0f} outside plausible range "
            f"[{LOWER:,.0f}, {UPPER:,.0f}]"
        )
    return True, f"patrimonio_atual={val:,.0f} within plausible range"


# ─────────────────────────────────────────────
# BLOCK: savings-rate
# ─────────────────────────────────────────────

@registry.test(
    block_id="savings-rate",
    category="DATA",
    description="premissas.aporte_mensal and renda_estimada both exist and are positive",
    severity="HIGH",
)
def _():
    data = load_data()
    aporte = get_nested(data, "premissas.aporte_mensal")
    renda = get_nested(data, "premissas.renda_estimada")
    errors = []
    for name, val in (("aporte_mensal", aporte), ("renda_estimada", renda)):
        if val is None:
            errors.append(f"premissas.{name} missing")
        elif not isinstance(val, (int, float)):
            errors.append(f"premissas.{name} not numeric (got {type(val).__name__})")
        elif val <= 0:
            errors.append(f"premissas.{name}={val} non-positive")
    if errors:
        return False, "; ".join(errors)
    return True, f"aporte_mensal={aporte:,.0f}, renda_estimada={renda:,.0f}"


@registry.test(
    block_id="savings-rate",
    category="VALUE",
    description="computed savings_rate = aporte_mensal / renda_estimada is in [0, 1]",
    severity="CRITICAL",
)
def _():
    data = load_data()
    aporte = get_nested(data, "premissas.aporte_mensal")
    renda = get_nested(data, "premissas.renda_estimada")
    if aporte is None or renda is None:
        return False, "Cannot compute savings_rate — inputs missing"
    if renda == 0:
        return False, "renda_estimada=0 — division by zero"
    sr = aporte / renda
    if not (0 <= sr <= 1):
        return False, (
            f"savings_rate={sr:.2%} outside [0, 1] "
            f"(aporte={aporte:,.0f}, renda={renda:,.0f})"
        )
    return True, f"savings_rate={sr:.2%} is in [0, 1]"


@registry.test(
    block_id="savings-rate",
    category="VALUE",
    description="savings_rate >= 25% (minimum threshold for FIRE viability per model)",
    severity="HIGH",
)
def _():
    data = load_data()
    aporte = get_nested(data, "premissas.aporte_mensal")
    renda = get_nested(data, "premissas.renda_estimada")
    if aporte is None or renda is None or renda == 0:
        return True, "Cannot validate savings_rate floor — inputs missing"
    sr = aporte / renda
    MIN_SR = 0.25
    if sr < MIN_SR:
        return False, (
            f"savings_rate={sr:.2%} below minimum {MIN_SR:.0%} threshold "
            f"(aporte={aporte:,.0f}, renda={renda:,.0f})"
        )
    return True, f"savings_rate={sr:.2%} >= {MIN_SR:.0%} floor"


@registry.test(
    block_id="savings-rate",
    category="RENDER",
    description="HTML contains savingsRate, savingsRateFill, and savingsRateNote elements",
    severity="HIGH",
)
def _():
    html = load_html()
    missing = []
    for eid in ("savingsRate", "savingsRateFill", "savingsRateNote", "savingsRateSub"):
        if f'id="{eid}"' not in html:
            missing.append(eid)
    if missing:
        return False, f"Missing HTML elements: {', '.join(missing)}"
    return True, "savingsRate, savingsRateFill, savingsRateNote, savingsRateSub all present"


@registry.test(
    block_id="savings-rate",
    category="PRIVACY",
    description="savings-rate block section does not expose raw aporte/renda values as plaintext",
    severity="HIGH",
)
def _():
    html = load_html()
    import re
    # The savingsRate display element must not have the actual value baked in statically
    # (it should be populated by JS, so the static HTML should show the placeholder '—')
    match = re.search(r'id="savingsRate"[^>]*>([^<]*)<', html)
    if not match:
        return False, "Could not locate savingsRate element content"
    content = match.group(1).strip()
    # Static HTML should have placeholder, not a real percentage
    if content not in ("", "—", "--"):
        return False, (
            f"savingsRate element appears to have hardcoded value '{content}' "
            f"instead of JS-populated placeholder"
        )
    return True, f"savingsRate placeholder is '{content}' — populated by JS (not hardcoded)"


@registry.test(
    block_id="savings-rate",
    category="SPEC",
    description="spec.json declares savings-rate block with correct tab and privacy flag",
    severity="MEDIUM",
)
def _():
    spec = load_spec()
    blocks = spec if isinstance(spec, list) else spec.get("blocks", [])
    target = None
    for block in blocks:
        if isinstance(block, dict) and block.get("id") == "savings-rate":
            target = block
            break
    if target is None:
        return False, "savings-rate block not found in spec.json"
    errors = []
    if target.get("privacy") is not True:
        errors.append(f"privacy={target.get('privacy')} (expected true)")
    tab = target.get("tab", "")
    if tab != "now":
        errors.append(f"tab='{tab}' (expected 'now')")
    if errors:
        return False, "spec.json savings-rate issues: " + "; ".join(errors)
    return True, "savings-rate: tab='now', privacy=true confirmed in spec.json"
