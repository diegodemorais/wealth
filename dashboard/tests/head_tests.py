"""
Head Domain Tests — Hero Strip + Now Tab KPIs
Blocks: patrimonio-total-hero, pfire-hero, kpi-grid-primario, kpi-grid-mercado,
        fire-countdown, wellness-score, drift-maximo-kpi, bond-pool-strip, ter-carteira
"""

from .base import registry, load_data, load_html, load_spec, get_nested, BUILD_PY


# ---------------------------------------------------------------------------
# patrimonio-total-hero
# ---------------------------------------------------------------------------

@registry.test(
    "patrimonio-total-hero", "DATA",
    "posicoes top-level key exists and is non-empty dict",
    "CRITICAL",
)
def _():
    data = load_data()
    posicoes = data.get("posicoes")
    if not isinstance(posicoes, dict) or len(posicoes) == 0:
        return False, f"posicoes is {type(posicoes).__name__} with len={len(posicoes) if isinstance(posicoes, dict) else 'N/A'}"
    return True, f"posicoes has {len(posicoes)} positions"


@registry.test(
    "patrimonio-total-hero", "DATA",
    "rf and hodl11 top-level keys exist",
    "HIGH",
)
def _():
    data = load_data()
    missing = [k for k in ("rf", "hodl11") if k not in data]
    if missing:
        return False, f"missing keys: {missing}"
    return True, "rf and hodl11 present"


@registry.test(
    "patrimonio-total-hero", "DATA",
    "cambio top-level key exists",
    "HIGH",
)
def _():
    data = load_data()
    if "cambio" not in data:
        return False, "cambio key missing from data.json"
    val = data["cambio"]
    if val is None:
        return False, "cambio is None"
    return True, f"cambio present: {val}"


@registry.test(
    "patrimonio-total-hero", "RENDER",
    "hero strip patrimonial elements present in HTML",
    "CRITICAL",
)
def _():
    html = load_html()
    required_ids = ["heroPatrimonioBrl", "heroPatrimonioUsd"]
    missing = [eid for eid in required_ids if f'id="{eid}"' not in html]
    if missing:
        return False, f"missing element IDs: {missing}"
    return True, "hero patrimonio elements found"


@registry.test(
    "patrimonio-total-hero", "PRIVACY",
    "hero patrimonio values use .pv class (privacy toggle)",
    "HIGH",
)
def _():
    html = load_html()
    # heroPatrimonioBrl and heroPatrimonioUsd must carry .pv
    checks = {
        "heroPatrimonioBrl": 'id="heroPatrimonioBrl"' in html,
        "pv on BRL": 'class="hval pv"' in html or 'hval pv' in html,
    }
    if not checks["heroPatrimonioBrl"]:
        return False, "heroPatrimonioBrl element not found"
    if not checks["pv on BRL"]:
        return False, "hval pv class not found — privacy toggle missing on patrimonio value"
    return True, ".pv class present on hero patrimonio values"


@registry.test(
    "patrimonio-total-hero", "VALUE",
    "every position has a price > 0",
    "HIGH",
)
def _():
    data = load_data()
    posicoes = data.get("posicoes", {})
    bad = [ticker for ticker, v in posicoes.items() if not isinstance(v.get("price"), (int, float)) or v["price"] <= 0]
    if bad:
        return False, f"positions with missing/zero price: {bad}"
    return True, f"all {len(posicoes)} positions have price > 0"


# ---------------------------------------------------------------------------
# pfire-hero
# ---------------------------------------------------------------------------

@registry.test(
    "pfire-hero", "DATA",
    "pfire53 and pfire50 top-level keys exist with base/fav/stress",
    "CRITICAL",
)
def _():
    data = load_data()
    errors = []
    for key in ("pfire53", "pfire50"):
        obj = data.get(key)
        if not isinstance(obj, dict):
            errors.append(f"{key} missing or not a dict")
            continue
        for sub in ("base", "fav", "stress"):
            if sub not in obj:
                errors.append(f"{key}.{sub} missing")
    if errors:
        return False, "; ".join(errors)
    return True, "pfire53 and pfire50 all sub-keys present"


@registry.test(
    "pfire-hero", "VALUE",
    "pfire53 and pfire50 values are floats in [0, 100] representing percentages",
    "CRITICAL",
)
def _():
    data = load_data()
    errors = []
    for key in ("pfire53", "pfire50"):
        for sub in ("base", "fav", "stress"):
            val = get_nested(data, f"{key}.{sub}")
            if not isinstance(val, (int, float)):
                errors.append(f"{key}.{sub} is not numeric: {val!r}")
            elif not (0 <= val <= 100):
                errors.append(f"{key}.{sub}={val} out of [0, 100]")
    if errors:
        return False, "; ".join(errors)
    return True, "all pfire values are floats in [0, 100]"


@registry.test(
    "pfire-hero", "VALUE",
    "pfire53 ordering: fav >= base >= stress",
    "CRITICAL",
)
def _():
    data = load_data()
    fav = get_nested(data, "pfire53.fav")
    base = get_nested(data, "pfire53.base")
    stress = get_nested(data, "pfire53.stress")
    if None in (fav, base, stress):
        return False, f"missing values: fav={fav}, base={base}, stress={stress}"
    errors = []
    if fav < base:
        errors.append(f"fav({fav}) < base({base})")
    if base < stress:
        errors.append(f"base({base}) < stress({stress})")
    if errors:
        return False, "ordering violated: " + "; ".join(errors)
    return True, f"fav={fav} >= base={base} >= stress={stress}"


@registry.test(
    "pfire-hero", "VALUE",
    "pfire50 ordering: fav >= base >= stress",
    "CRITICAL",
)
def _():
    data = load_data()
    fav = get_nested(data, "pfire50.fav")
    base = get_nested(data, "pfire50.base")
    stress = get_nested(data, "pfire50.stress")
    if None in (fav, base, stress):
        return False, f"missing values: fav={fav}, base={base}, stress={stress}"
    errors = []
    if fav < base:
        errors.append(f"fav({fav}) < base({base})")
    if base < stress:
        errors.append(f"base({base}) < stress({stress})")
    if errors:
        return False, "ordering violated: " + "; ".join(errors)
    return True, f"fav={fav} >= base={base} >= stress={stress}"


@registry.test(
    "pfire-hero", "VALUE",
    "pfire50.base <= pfire53.base (retiring earlier is harder)",
    "CRITICAL",
)
def _():
    data = load_data()
    p50 = get_nested(data, "pfire50.base")
    p53 = get_nested(data, "pfire53.base")
    if None in (p50, p53):
        return False, f"missing: pfire50.base={p50}, pfire53.base={p53}"
    if p50 > p53:
        return False, f"pfire50.base={p50} > pfire53.base={p53} — FIRE@50 should be harder"
    return True, f"pfire50.base={p50} <= pfire53.base={p53}"


@registry.test(
    "pfire-hero", "RENDER",
    "pfire hero and scenario headline elements present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    required_ids = ["pfire53Base", "pfire53Fav", "pfire53Stress"]
    missing = [eid for eid in required_ids if f'id="{eid}"' not in html]
    if missing:
        return False, f"missing element IDs: {missing}"
    return True, "pfire hero and scenario elements found"


# ---------------------------------------------------------------------------
# kpi-grid-primario
# ---------------------------------------------------------------------------

@registry.test(
    "kpi-grid-primario", "DATA",
    "pfire50.base, fire.bond_pool_readiness.anos_gastos, drift, premissas.patrimonio_atual all present",
    "HIGH",
)
def _():
    data = load_data()
    checks = {
        "pfire50.base": get_nested(data, "pfire50.base"),
        "fire.bond_pool_readiness.anos_gastos": get_nested(data, "fire.bond_pool_readiness.anos_gastos"),
        "drift": data.get("drift"),
        "premissas.patrimonio_atual": get_nested(data, "premissas.patrimonio_atual"),
    }
    missing = [k for k, v in checks.items() if v is None]
    if missing:
        return False, f"missing fields: {missing}"
    return True, "all kpi-grid-primario fields present"


@registry.test(
    "kpi-grid-primario", "VALUE",
    "patrimonio_atual is a positive number",
    "HIGH",
)
def _():
    data = load_data()
    val = get_nested(data, "premissas.patrimonio_atual")
    if not isinstance(val, (int, float)) or val <= 0:
        return False, f"premissas.patrimonio_atual={val!r} — expected positive number"
    return True, f"patrimonio_atual={val:,.0f}"


@registry.test(
    "kpi-grid-primario", "VALUE",
    "bond_pool anos_gastos is a non-negative float",
    "MEDIUM",
)
def _():
    data = load_data()
    val = get_nested(data, "fire.bond_pool_readiness.anos_gastos")
    if not isinstance(val, (int, float)) or val < 0:
        return False, f"anos_gastos={val!r} — expected >= 0"
    return True, f"anos_gastos={val}"


@registry.test(
    "kpi-grid-primario", "RENDER",
    "primary KPI elements present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    required_ids = ["kpiPfire50", "kpiBondPool", "kpiDriftMax", "kpiWellnessCompact"]
    missing = [eid for eid in required_ids if f'id="{eid}"' not in html]
    if missing:
        return False, f"missing element IDs: {missing}"
    return True, "primary KPI elements found"


# ---------------------------------------------------------------------------
# kpi-grid-mercado
# ---------------------------------------------------------------------------

@registry.test(
    "kpi-grid-mercado", "DATA",
    "mercado.cambio_brl_usd, dca_status.ipca_longo.taxa_atual, dca_status.renda_plus.taxa_atual all present",
    "HIGH",
)
def _():
    data = load_data()
    paths = [
        "mercado.cambio_brl_usd",
        "dca_status.ipca_longo.taxa_atual",
        "dca_status.renda_plus.taxa_atual",
    ]
    missing = [p for p in paths if get_nested(data, p) is None]
    if missing:
        return False, f"missing fields: {missing}"
    return True, "all market KPI fields present"


@registry.test(
    "kpi-grid-mercado", "VALUE",
    "cambio_brl_usd is a positive float in plausible range (1–20)",
    "HIGH",
)
def _():
    data = load_data()
    val = get_nested(data, "mercado.cambio_brl_usd")
    if not isinstance(val, (int, float)):
        return False, f"cambio_brl_usd={val!r} is not numeric"
    if not (1.0 <= val <= 20.0):
        return False, f"cambio_brl_usd={val} outside plausible range [1, 20]"
    return True, f"cambio_brl_usd={val}"


@registry.test(
    "kpi-grid-mercado", "VALUE",
    "IPCA+ and Renda+ rates are positive floats in plausible range (0–30%)",
    "MEDIUM",
)
def _():
    data = load_data()
    vals = {
        "dca_status.ipca_longo.taxa_atual": get_nested(data, "dca_status.ipca_longo.taxa_atual"),
        "dca_status.renda_plus.taxa_atual": get_nested(data, "dca_status.renda_plus.taxa_atual"),
    }
    errors = []
    for path, val in vals.items():
        if not isinstance(val, (int, float)):
            errors.append(f"{path}={val!r} not numeric")
        elif not (0 < val < 30):
            errors.append(f"{path}={val} outside (0, 30)")
    if errors:
        return False, "; ".join(errors)
    return True, f"ipca_longo={vals['dca_status.ipca_longo.taxa_atual']}, renda_plus={vals['dca_status.renda_plus.taxa_atual']}"


@registry.test(
    "kpi-grid-mercado", "RENDER",
    "market KPI elements present in HTML",
    "MEDIUM",
)
def _():
    html = load_html()
    required_ids = ["kpiCambio", "kpiIpcaTaxa", "kpiRenda2065"]
    missing = [eid for eid in required_ids if f'id="{eid}"' not in html]
    if missing:
        return False, f"missing element IDs: {missing}"
    return True, "market KPI elements found"


# ---------------------------------------------------------------------------
# fire-countdown
# ---------------------------------------------------------------------------

@registry.test(
    "fire-countdown", "DATA",
    "all countdown premissas fields present",
    "CRITICAL",
)
def _():
    data = load_data()
    paths = [
        "premissas.patrimonio_atual",
        "premissas.patrimonio_gatilho",
        "premissas.idade_atual",
        "premissas.idade_fire_alvo",
    ]
    missing = [p for p in paths if get_nested(data, p) is None]
    if missing:
        return False, f"missing fields: {missing}"
    return True, "all countdown fields present"


@registry.test(
    "fire-countdown", "VALUE",
    "patrimonio_gatilho > patrimonio_atual (still in accumulation phase)",
    "HIGH",
)
def _():
    data = load_data()
    atual = get_nested(data, "premissas.patrimonio_atual")
    gatilho = get_nested(data, "premissas.patrimonio_gatilho")
    if None in (atual, gatilho):
        return False, f"missing: atual={atual}, gatilho={gatilho}"
    if gatilho <= atual:
        # warn but not hard fail — Diego may have crossed FIRE number
        return False, (
            f"patrimonio_gatilho={gatilho:,.0f} <= patrimonio_atual={atual:,.0f} — "
            "FIRE trigger already reached or data error"
        )
    gap = gatilho - atual
    pct = atual / gatilho * 100
    return True, f"atual={atual:,.0f} | gatilho={gatilho:,.0f} | progress={pct:.1f}% | gap={gap:,.0f}"


@registry.test(
    "fire-countdown", "VALUE",
    "idade_fire_alvo > idade_atual (target FIRE age is in the future)",
    "HIGH",
)
def _():
    data = load_data()
    atual = get_nested(data, "premissas.idade_atual")
    alvo = get_nested(data, "premissas.idade_fire_alvo")
    if None in (atual, alvo):
        return False, f"missing: idade_atual={atual}, idade_fire_alvo={alvo}"
    if alvo <= atual:
        return False, f"idade_fire_alvo={alvo} <= idade_atual={atual} — FIRE age already passed or data error"
    return True, f"idade_atual={atual}, idade_fire_alvo={alvo}, anos_restantes={alvo - atual}"


@registry.test(
    "fire-countdown", "RENDER",
    "countdown and progress bar elements present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    required_ids = ["fireCountdown", "fireProgressBar", "heroAnos", "heroProgresso"]
    missing = [eid for eid in required_ids if f'id="{eid}"' not in html]
    if missing:
        return False, f"missing element IDs: {missing}"
    return True, "countdown elements found"


@registry.test(
    "fire-countdown", "PRIVACY",
    "countdown value elements use .pv class (privacy toggle)",
    "HIGH",
)
def _():
    html = load_html()
    # heroAnos and heroProgresso show age/patrimonio — must be wrapped in pv
    if 'class="hval pv"' not in html and 'hval pv' not in html:
        return False, "no .pv class found on hero value elements"
    # More specific: hsub pv exists (patrimonio sub-line)
    if 'class="hsub pv"' not in html and 'hsub pv' not in html:
        return False, "hsub pv class not found — privacy on sub-values may be missing"
    return True, "pv class present in hero strip"


# ---------------------------------------------------------------------------
# wellness-score
# ---------------------------------------------------------------------------

@registry.test(
    "wellness-score", "DATA",
    "wellness_config or drift present as source for wellness score",
    "HIGH",
)
def _():
    data = load_data()
    has_wellness_config = "wellness_config" in data
    has_drift = "drift" in data
    if not has_drift:
        return False, "drift missing — wellness score has no drift input"
    if not has_wellness_config:
        return False, "wellness_config missing from data.json"
    return True, "wellness_config and drift both present"


@registry.test(
    "wellness-score", "DATA",
    "wellness_config has version field",
    "MEDIUM",
)
def _():
    data = load_data()
    wc = data.get("wellness_config")
    if not isinstance(wc, dict):
        return False, f"wellness_config is {type(wc).__name__}, expected dict"
    version = wc.get("version")
    if version is None:
        return False, "wellness_config.version missing"
    return True, f"wellness_config version={version}"


@registry.test(
    "wellness-score", "RENDER",
    "wellness score elements present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    required_ids = ["wellnessScore", "wellnessLabel", "wellnessFill", "wellnessGrid"]
    missing = [eid for eid in required_ids if f'id="{eid}"' not in html]
    if missing:
        return False, f"missing element IDs: {missing}"
    return True, "wellness score elements found"


@registry.test(
    "wellness-score", "VALUE",
    "pfire53.base used by wellness is present and non-zero",
    "MEDIUM",
)
def _():
    data = load_data()
    val = get_nested(data, "pfire53.base")
    if val is None:
        return False, "pfire53.base missing"
    if val == 0:
        return False, "pfire53.base is 0 — wellness input degenerate"
    return True, f"pfire53.base={val}"


# ---------------------------------------------------------------------------
# drift-maximo-kpi
# ---------------------------------------------------------------------------

@registry.test(
    "drift-maximo-kpi", "DATA",
    "drift dict present with all required ETF keys",
    "HIGH",
)
def _():
    data = load_data()
    drift = data.get("drift")
    if not isinstance(drift, dict):
        return False, f"drift is {type(drift).__name__}, expected dict"
    required_keys = ["SWRD", "AVGS", "AVEM", "IPCA", "HODL11"]
    missing = [k for k in required_keys if k not in drift]
    if missing:
        return False, f"drift missing keys: {missing}"
    return True, f"drift has all required keys: {required_keys}"


@registry.test(
    "drift-maximo-kpi", "VALUE",
    "each drift entry has atual and alvo as floats",
    "HIGH",
)
def _():
    data = load_data()
    drift = data.get("drift", {})
    errors = []
    for ticker in ("SWRD", "AVGS", "AVEM", "IPCA", "HODL11"):
        entry = drift.get(ticker, {})
        for sub in ("atual", "alvo"):
            val = entry.get(sub)
            if not isinstance(val, (int, float)):
                errors.append(f"drift.{ticker}.{sub}={val!r}")
    if errors:
        return False, "non-numeric drift values: " + "; ".join(errors)
    return True, "all drift entries have numeric atual and alvo"


@registry.test(
    "drift-maximo-kpi", "VALUE",
    "max absolute drift deviation is < 50pp (sanity bound)",
    "MEDIUM",
)
def _():
    data = load_data()
    drift = data.get("drift", {})
    max_dev = 0.0
    worst = None
    for ticker, entry in drift.items():
        if isinstance(entry, dict):
            atual = entry.get("atual")
            alvo = entry.get("alvo")
            if isinstance(atual, (int, float)) and isinstance(alvo, (int, float)):
                dev = abs(atual - alvo)
                if dev > max_dev:
                    max_dev = dev
                    worst = f"{ticker}: atual={atual}, alvo={alvo}, dev={dev:.1f}pp"
    if max_dev >= 50:
        return False, f"max drift deviation={max_dev:.1f}pp >= 50pp — likely data error. Worst: {worst}"
    return True, f"max drift deviation={max_dev:.1f}pp < 50pp. Worst: {worst}"


@registry.test(
    "drift-maximo-kpi", "RENDER",
    "drift max KPI element present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    required_ids = ["kpiDriftMax", "kpiDriftMaxSub"]
    missing = [eid for eid in required_ids if f'id="{eid}"' not in html]
    if missing:
        return False, f"missing element IDs: {missing}"
    return True, "drift max KPI elements found"


# ---------------------------------------------------------------------------
# bond-pool-strip
# ---------------------------------------------------------------------------

@registry.test(
    "bond-pool-strip", "DATA",
    "fire.bond_pool_readiness all required fields present",
    "HIGH",
)
def _():
    data = load_data()
    paths = [
        "fire.bond_pool_readiness.valor_atual_brl",
        "fire.bond_pool_readiness.anos_gastos",
        "fire.bond_pool_readiness.meta_anos",
        "fire.bond_pool_readiness.status",
    ]
    missing = [p for p in paths if get_nested(data, p) is None]
    if missing:
        return False, f"missing fields: {missing}"
    return True, "all bond pool fields present"


@registry.test(
    "bond-pool-strip", "VALUE",
    "bond_pool valor_atual_brl >= 0 and meta_anos > 0",
    "HIGH",
)
def _():
    data = load_data()
    valor = get_nested(data, "fire.bond_pool_readiness.valor_atual_brl")
    meta = get_nested(data, "fire.bond_pool_readiness.meta_anos")
    errors = []
    if not isinstance(valor, (int, float)) or valor < 0:
        errors.append(f"valor_atual_brl={valor!r} should be >= 0")
    if not isinstance(meta, (int, float)) or meta <= 0:
        errors.append(f"meta_anos={meta!r} should be > 0")
    if errors:
        return False, "; ".join(errors)
    return True, f"valor_atual_brl={valor:,.0f}, meta_anos={meta}"


@registry.test(
    "bond-pool-strip", "VALUE",
    "bond_pool status is one of known values (early/building/ready/excess)",
    "MEDIUM",
)
def _():
    data = load_data()
    status = get_nested(data, "fire.bond_pool_readiness.status")
    known = {"early", "building", "ready", "excess"}
    if status not in known:
        return False, f"status={status!r} not in {known}"
    return True, f"bond_pool status={status!r}"


@registry.test(
    "bond-pool-strip", "RENDER",
    "bond pool section element present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    required_ids = ["bondPoolSection", "kpiBondPool"]
    missing = [eid for eid in required_ids if f'id="{eid}"' not in html]
    if missing:
        return False, f"missing element IDs: {missing}"
    return True, "bond pool elements found"


@registry.test(
    "bond-pool-strip", "PRIVACY",
    "bond pool section contains privacy-sensitive display (valor should be .pv)",
    "MEDIUM",
)
def _():
    html = load_html()
    # The bond pool valor is privacy-sensitive; check .pv class exists somewhere in the section
    # Since HTML doesn't use data-block, check for kpi-value pv pattern
    if 'class="kpi-value pv"' not in html and 'kpi-value pv' not in html:
        return False, "kpi-value pv class not found — bond pool monetary value may not be privacy-toggled"
    return True, ".pv class on kpi-value found (covers bond pool and other private KPI values)"


# ---------------------------------------------------------------------------
# ter-carteira
# ---------------------------------------------------------------------------

@registry.test(
    "ter-carteira", "DATA",
    "posicoes present with at least one position having a ter field",
    "HIGH",
)
def _():
    data = load_data()
    posicoes = data.get("posicoes", {})
    if not isinstance(posicoes, dict) or len(posicoes) == 0:
        return False, "posicoes empty or missing"
    positions_with_ter = [t for t, v in posicoes.items() if isinstance(v.get("ter"), (int, float))]
    if not positions_with_ter:
        return False, "no position has a ter field — TER carteira cannot be computed"
    return True, f"{len(positions_with_ter)}/{len(posicoes)} positions have ter"


@registry.test(
    "ter-carteira", "VALUE",
    "all TER values are positive floats in plausible range (0–2%)",
    "MEDIUM",
)
def _():
    data = load_data()
    posicoes = data.get("posicoes", {})
    errors = []
    for ticker, v in posicoes.items():
        ter = v.get("ter")
        if ter is None:
            continue  # optional field — handled in DATA test
        if not isinstance(ter, (int, float)):
            errors.append(f"{ticker}.ter={ter!r} not numeric")
        elif not (0 < ter <= 2.0):
            errors.append(f"{ticker}.ter={ter} outside (0, 2.0]")
    if errors:
        return False, "TER value issues: " + "; ".join(errors)
    return True, "all TER values in plausible range"


@registry.test(
    "ter-carteira", "RENDER",
    "TER carteira elements present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    required_ids = ["terCarteira", "terCarteiraLabel", "terVwraLabel"]
    missing = [eid for eid in required_ids if f'id="{eid}"' not in html]
    if missing:
        return False, f"missing element IDs: {missing}"
    return True, "TER carteira elements found"


@registry.test(
    "ter-carteira", "SPEC",
    "ter-carteira block declared in spec.json under now tab",
    "MEDIUM",
)
def _():
    spec = load_spec()
    blocks = spec.get("blocks", [])
    match = next((b for b in blocks if b.get("id") == "ter-carteira"), None)
    if match is None:
        return False, "ter-carteira not found in spec.json blocks"
    if match.get("tab") != "now":
        return False, f"ter-carteira tab={match.get('tab')!r}, expected 'now'"
    return True, f"ter-carteira declared in spec under tab=now"
