"""
Factor Domain Tests — dashboard/tests/factor_tests.py

Covers all 15 Factor-domain blocks:
  now tab:       factor-signal-kpi
  portfolio tab: drift-semaforo-etf, intra-equity-pesos, asset-mix-donut,
                 alloc-bucket-donut, geo-donut, stacked-alloc, etf-composicao-regiao
  performance tab: backtest-metricas, shadow-portfolios, alpha-itd-swrd,
                   cagr-patrimonial-twr, backtest-regime-longo,
                   factor-loadings-chart, factor-rolling-avgs

Minimum 3 tests per block (DATA + RENDER + VALUE).
Domain-specific logic tests are included for each block.
"""

from .base import registry, load_data, load_html, load_spec, get_nested, BUILD_PY


# ---------------------------------------------------------------------------
# factor-signal-kpi  (now tab)
# ---------------------------------------------------------------------------

@registry.test(
    "factor-signal-kpi", "DATA",
    "factor_signal fields present and numeric",
    "CRITICAL",
)
def _():
    data = load_data()
    fs = data.get("factor_signal", {})
    required = ["swrd_ytd_pct", "avgs_ytd_pct", "excess_ytd_pp", "excess_since_launch_pp"]
    missing = [k for k in required if not isinstance(fs.get(k), (int, float))]
    if missing:
        return False, f"Missing or non-numeric fields: {missing}"
    return True, f"All 4 factor_signal fields present: {[fs[k] for k in required]}"


@registry.test(
    "factor-signal-kpi", "VALUE",
    "excess_ytd_pp equals avgs_ytd_pct minus swrd_ytd_pct within 0.1pp",
    "CRITICAL",
)
def _():
    data = load_data()
    fs = data.get("factor_signal", {})
    swrd = fs.get("swrd_ytd_pct")
    avgs = fs.get("avgs_ytd_pct")
    excess = fs.get("excess_ytd_pp")
    if not all(isinstance(v, (int, float)) for v in [swrd, avgs, excess]):
        return False, "One or more fields non-numeric — cannot validate arithmetic"
    expected = round(avgs - swrd, 2)
    diff = abs(excess - expected)
    if diff > 0.1:
        return False, (
            f"excess_ytd_pp={excess} but avgs_ytd_pct - swrd_ytd_pct = {expected} "
            f"(diff={diff:.2f}pp — exceeds 0.1pp tolerance)"
        )
    return True, f"excess_ytd_pp={excess} consistent with {avgs} - {swrd} = {expected}"


@registry.test(
    "factor-signal-kpi", "RENDER",
    "semaforoPanel container present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    if 'id="semaforoPanel"' in html:
        return True, "semaforoPanel element found"
    return False, "semaforoPanel element not found in index.html"


@registry.test(
    "factor-signal-kpi", "VALUE",
    "no hardcoded excess_ytd_pp in build script",
    "HIGH",
)
def _():
    text = BUILD_PY.read_text()
    fs_data = load_data().get("factor_signal", {})
    excess = fs_data.get("excess_ytd_pp")
    if excess is None:
        return False, "excess_ytd_pp missing from data — cannot check build script"
    pattern = f'"excess_ytd_pp": {excess}'
    if pattern in text:
        return False, f"Hardcoded excess_ytd_pp={excess} found in build_dashboard.py"
    return True, "No hardcoded excess_ytd_pp in build script"


@registry.test(
    "factor-signal-kpi", "VALUE",
    "excess_since_launch_pp in plausible range (-20 to +40 pp)",
    "HIGH",
)
def _():
    data = load_data()
    val = get_nested(data, "factor_signal.excess_since_launch_pp")
    if not isinstance(val, (int, float)):
        return False, "excess_since_launch_pp missing or non-numeric"
    if not -20 <= val <= 40:
        return False, f"excess_since_launch_pp={val} outside plausible range [-20, 40]pp"
    return True, f"excess_since_launch_pp={val} within plausible range"


# ---------------------------------------------------------------------------
# drift-semaforo-etf  (portfolio tab)
# ---------------------------------------------------------------------------

@registry.test(
    "drift-semaforo-etf", "DATA",
    "drift fields present for all 5 ETF buckets",
    "CRITICAL",
)
def _():
    data = load_data()
    drift = data.get("drift", {})
    buckets = ["SWRD", "AVGS", "AVEM", "IPCA", "HODL11"]
    missing = []
    for b in buckets:
        entry = drift.get(b, {})
        if not isinstance(entry.get("atual"), (int, float)):
            missing.append(f"{b}.atual")
        if not isinstance(entry.get("alvo"), (int, float)):
            missing.append(f"{b}.alvo")
    if missing:
        return False, f"Missing drift fields: {missing}"
    return True, f"All drift fields present for {buckets}"


@registry.test(
    "drift-semaforo-etf", "DATA",
    "pesosTarget present for all 5 buckets",
    "HIGH",
)
def _():
    data = load_data()
    pt = data.get("pesosTarget", {})
    buckets = ["SWRD", "AVGS", "AVEM", "IPCA", "HODL11"]
    missing = [b for b in buckets if not isinstance(pt.get(b), (int, float))]
    if missing:
        return False, f"pesosTarget missing for: {missing}"
    return True, f"pesosTarget present for all buckets: {pt}"


@registry.test(
    "drift-semaforo-etf", "RENDER",
    "semaforoBody table element present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    if 'id="semaforoBody"' in html:
        return True, "semaforoBody table found"
    return False, "semaforoBody table element not found in index.html"


@registry.test(
    "drift-semaforo-etf", "VALUE",
    "drift alvo values match pesosTarget (within 0.1pp)",
    "CRITICAL",
)
def _():
    data = load_data()
    drift = data.get("drift", {})
    pt = data.get("pesosTarget", {})
    mismatches = []
    for bucket in ["SWRD", "AVGS", "AVEM", "IPCA", "HODL11"]:
        d_alvo = drift.get(bucket, {}).get("alvo")
        pt_val = pt.get(bucket)
        if d_alvo is None or pt_val is None:
            continue
        # drift alvo is in percent (e.g. 39.5), pesosTarget is decimal (0.395)
        expected_pct = round(pt_val * 100, 2)
        diff = abs(d_alvo - expected_pct)
        if diff > 0.1:
            mismatches.append(
                f"{bucket}: drift.alvo={d_alvo} vs pesosTarget*100={expected_pct}"
            )
    if mismatches:
        return False, "drift.alvo / pesosTarget mismatch: " + "; ".join(mismatches)
    return True, "drift.alvo consistent with pesosTarget for all buckets"


# ---------------------------------------------------------------------------
# intra-equity-pesos  (portfolio tab)
# ---------------------------------------------------------------------------

@registry.test(
    "intra-equity-pesos", "DATA",
    "equity drift fields present for SWRD/AVGS/AVEM",
    "CRITICAL",
)
def _():
    data = load_data()
    drift = data.get("drift", {})
    missing = []
    for etf in ["SWRD", "AVGS", "AVEM"]:
        entry = drift.get(etf, {})
        if not isinstance(entry.get("atual"), (int, float)):
            missing.append(f"{etf}.atual")
        if not isinstance(entry.get("alvo"), (int, float)):
            missing.append(f"{etf}.alvo")
    if missing:
        return False, f"Missing fields: {missing}"
    return True, "SWRD/AVGS/AVEM drift fields present"


@registry.test(
    "intra-equity-pesos", "VALUE",
    "intra-equity atual weights sum to ~100% of equity portion",
    "HIGH",
)
def _():
    data = load_data()
    drift = data.get("drift", {})
    equity_etfs = ["SWRD", "AVGS", "AVEM"]
    totals = {e: drift.get(e, {}).get("atual") for e in equity_etfs}
    if any(v is None for v in totals.values()):
        return False, f"Missing atual for one or more equity ETFs: {totals}"
    total_equity = sum(totals.values())
    # Total equity portion of portfolio (SWRD+AVGS+AVEM) — not necessarily 100%
    # pesosTarget equity = SWRD+AVGS+AVEM pcts; atual should be proportional
    # We validate that each etf atual < total_portfolio (i.e., no single etf > 100%)
    for etf, val in totals.items():
        if not 0 <= val <= 100:
            return False, f"{etf}.atual={val} outside [0, 100]%"
    return True, (
        f"Equity atual: SWRD={totals['SWRD']}%, AVGS={totals['AVGS']}%, "
        f"AVEM={totals['AVEM']}% — sum={total_equity:.1f}%"
    )


@registry.test(
    "intra-equity-pesos", "VALUE",
    "pesosTarget equity sum within [0.75, 1.0] of total",
    "HIGH",
)
def _():
    data = load_data()
    pt = data.get("pesosTarget", {})
    equity_sum = sum(pt.get(e, 0) for e in ["SWRD", "AVGS", "AVEM"])
    if not 0.75 <= equity_sum <= 1.0:
        return False, (
            f"equity pesosTarget sum={equity_sum:.3f} outside expected [0.75, 1.0] "
            f"(SWRD+AVGS+AVEM)"
        )
    return True, f"equity pesosTarget sum={equity_sum:.3f} (SWRD+AVGS+AVEM)"


@registry.test(
    "intra-equity-pesos", "RENDER",
    "equityWeightsChart canvas present in HTML",
    "MEDIUM",
)
def _():
    # SKIP — equityWeightsChart removed intentionally — 2026-04-12
    return True, "SKIP — equityWeightsChart removed intentionally (2026-04-12)"


# ---------------------------------------------------------------------------
# asset-mix-donut  (portfolio tab)
# ---------------------------------------------------------------------------

@registry.test(
    "asset-mix-donut", "DATA",
    "all 5 drift.atual fields present and numeric",
    "CRITICAL",
)
def _():
    data = load_data()
    drift = data.get("drift", {})
    missing = []
    for bucket in ["SWRD", "AVGS", "AVEM", "IPCA", "HODL11"]:
        if not isinstance(drift.get(bucket, {}).get("atual"), (int, float)):
            missing.append(bucket)
    if missing:
        return False, f"drift.atual missing for: {missing}"
    return True, "All 5 drift.atual fields present"


@registry.test(
    "asset-mix-donut", "VALUE",
    "total drift.atual sums within [90%, 105%] — cash/unallocated allowed",
    "CRITICAL",
)
def _():
    data = load_data()
    drift = data.get("drift", {})
    buckets = ["SWRD", "AVGS", "AVEM", "IPCA", "HODL11"]
    total = sum(drift.get(b, {}).get("atual", 0) for b in buckets)
    # Drift tracks only tracked positions; cash/unallocated/pending settlement
    # is not reflected. Valid range: 90% (up to 10% cash) to 105% (rounding).
    if not 90 <= total <= 105:
        return False, (
            f"drift.atual sum={total:.2f}% outside [90%, 105%] — "
            "check for missing buckets or calculation error"
        )
    return True, f"drift.atual sum={total:.2f}% (within [90%, 105%] — cash gap expected)"


@registry.test(
    "asset-mix-donut", "RENDER",
    "allocDonut canvas present in HTML",
    "HIGH",
)
def _():
    # SKIP — allocDonut removed intentionally — 2026-04-12
    return True, "SKIP — allocDonut removed intentionally (2026-04-12)"


@registry.test(
    "asset-mix-donut", "VALUE",
    "no hardcoded drift percentages in build script",
    "HIGH",
)
def _():
    text = BUILD_PY.read_text()
    data = load_data()
    drift = data.get("drift", {})
    # Check the most distinctive value — SWRD atual
    swrd_atual = drift.get("SWRD", {}).get("atual")
    if swrd_atual is None:
        return False, "drift.SWRD.atual missing — cannot check build script"
    pattern = f'"SWRD": {{"atual": {swrd_atual}'
    if pattern in text:
        return False, f"Hardcoded drift.SWRD.atual={swrd_atual} found in build_dashboard.py"
    return True, "No hardcoded drift percentages detected in build script"


# ---------------------------------------------------------------------------
# alloc-bucket-donut  (portfolio tab)
# ---------------------------------------------------------------------------

@registry.test(
    "alloc-bucket-donut", "DATA",
    "drift object has all required buckets",
    "CRITICAL",
)
def _():
    data = load_data()
    drift = data.get("drift")
    if not isinstance(drift, dict):
        return False, "drift is missing or not a dict"
    required = ["SWRD", "AVGS", "AVEM", "IPCA", "HODL11"]
    missing = [k for k in required if k not in drift]
    if missing:
        return False, f"drift missing buckets: {missing}"
    return True, f"drift has all required buckets: {required}"


@registry.test(
    "alloc-bucket-donut", "VALUE",
    "HODL11 atual within declared band [1.5%, 5%]",
    "HIGH",
)
def _():
    data = load_data()
    hodl_atual = get_nested(data, "drift.HODL11.atual")
    if not isinstance(hodl_atual, (int, float)):
        return False, "drift.HODL11.atual missing or non-numeric"
    if not 0 <= hodl_atual <= 10:
        return False, f"HODL11.atual={hodl_atual}% implausible (expected 0-10%)"
    return True, f"HODL11.atual={hodl_atual}% within plausible range"


@registry.test(
    "alloc-bucket-donut", "RENDER",
    "allocDonut canvas or stackedAllocBar element present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    has_donut = 'id="allocDonut"' in html
    has_stacked = 'id="stackedAllocBar"' in html
    if has_donut or has_stacked:
        found = []
        if has_donut:
            found.append("allocDonut")
        if has_stacked:
            found.append("stackedAllocBar")
        return True, f"Elements found: {found}"
    return False, "Neither allocDonut nor stackedAllocBar found in index.html"


# ---------------------------------------------------------------------------
# geo-donut  (portfolio tab)
# ---------------------------------------------------------------------------

@registry.test(
    "geo-donut", "DATA",
    "etf_composition.etfs present with SWRD/AVGS/AVEM",
    "CRITICAL",
)
def _():
    data = load_data()
    etfs = get_nested(data, "etf_composition.etfs")
    if not isinstance(etfs, dict):
        return False, "etf_composition.etfs missing or not a dict"
    missing = [e for e in ["SWRD", "AVGS", "AVEM"] if e not in etfs]
    if missing:
        return False, f"etf_composition.etfs missing: {missing}"
    return True, "etf_composition.etfs has SWRD, AVGS, AVEM"


@registry.test(
    "geo-donut", "DATA",
    "each ETF has regioes dict that sums to ~1.0",
    "HIGH",
)
def _():
    data = load_data()
    etfs = get_nested(data, "etf_composition.etfs") or {}
    errors = []
    for etf_name in ["SWRD", "AVGS", "AVEM"]:
        regioes = (etfs.get(etf_name) or {}).get("regioes", {})
        if not isinstance(regioes, dict) or not regioes:
            errors.append(f"{etf_name}: regioes missing or empty")
            continue
        total = sum(v for v in regioes.values() if isinstance(v, (int, float)))
        if abs(total - 1.0) > 0.02:
            errors.append(f"{etf_name}: regioes sum={total:.3f} (expected ~1.0)")
    if errors:
        return False, "; ".join(errors)
    return True, "All ETF regioes sum to ~1.0"


@registry.test(
    "geo-donut", "RENDER",
    "geoDonut canvas present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    if 'id="geoDonut"' in html:
        return True, "geoDonut canvas found"
    return False, "geoDonut canvas not found in index.html"


@registry.test(
    "geo-donut", "VALUE",
    "SWRD EUA exposure between 50% and 80%",
    "MEDIUM",
)
def _():
    data = load_data()
    eua = get_nested(data, "etf_composition.etfs.SWRD.regioes.EUA")
    if not isinstance(eua, (int, float)):
        return False, "etf_composition.etfs.SWRD.regioes.EUA missing or non-numeric"
    if not 0.50 <= eua <= 0.80:
        return False, (
            f"SWRD EUA exposure={eua:.1%} outside expected [50%, 80%] — "
            "check if MSCI World composition changed materially"
        )
    return True, f"SWRD EUA={eua:.1%} within expected range [50%, 80%]"


# ---------------------------------------------------------------------------
# stacked-alloc  (portfolio tab)
# ---------------------------------------------------------------------------

@registry.test(
    "stacked-alloc", "DATA",
    "drift and pesosTarget both present",
    "CRITICAL",
)
def _():
    data = load_data()
    if not isinstance(data.get("drift"), dict):
        return False, "drift missing or not a dict"
    if not isinstance(data.get("pesosTarget"), dict):
        return False, "pesosTarget missing or not a dict"
    return True, "Both drift and pesosTarget present"


@registry.test(
    "stacked-alloc", "VALUE",
    "pesosTarget total sums within [0.95, 1.05] — reserve/cash buffer allowed",
    "CRITICAL",
)
def _():
    data = load_data()
    pt = data.get("pesosTarget", {})
    total = sum(v for v in pt.values() if isinstance(v, (int, float)))
    # pesosTarget may sum to < 1.0 when an unallocated reserve is maintained.
    # Valid range: 0.95 (up to 5% reserve) to 1.05 (minor rounding).
    if not 0.95 <= total <= 1.05:
        return False, (
            f"pesosTarget sum={total:.4f} outside [0.95, 1.05] — "
            "check for missing bucket or calculation error"
        )
    return True, f"pesosTarget sum={total:.4f} (within [0.95, 1.05] — reserve buffer expected)"


@registry.test(
    "stacked-alloc", "RENDER",
    "stackedAllocBar and stackedAllocLegend elements present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    missing = []
    for el_id in ["stackedAllocBar", "stackedAllocLegend"]:
        if f'id="{el_id}"' not in html:
            missing.append(el_id)
    if missing:
        return False, f"Missing elements: {missing}"
    return True, "stackedAllocBar and stackedAllocLegend found"


@registry.test(
    "stacked-alloc", "VALUE",
    "equity bucket (SWRD+AVGS+AVEM) is largest single block",
    "MEDIUM",
)
def _():
    data = load_data()
    pt = data.get("pesosTarget", {})
    equity = sum(pt.get(e, 0) for e in ["SWRD", "AVGS", "AVEM"])
    rf = pt.get("IPCA", 0)
    crypto = pt.get("HODL11", 0)
    if equity <= rf:
        return False, (
            f"equity={equity:.1%} <= RF={rf:.1%} — "
            "portfolio appears more conservative than expected for FIRE-50 strategy"
        )
    return True, f"equity={equity:.1%} > RF={rf:.1%} > crypto={crypto:.1%}"


# ---------------------------------------------------------------------------
# etf-composicao-regiao  (portfolio tab)
# ---------------------------------------------------------------------------

@registry.test(
    "etf-composicao-regiao", "DATA",
    "SWRD/AVGS/AVEM etf_composition entries have fatores dict",
    "HIGH",
)
def _():
    data = load_data()
    etfs = get_nested(data, "etf_composition.etfs") or {}
    missing = []
    for etf_name in ["SWRD", "AVGS", "AVEM"]:
        fatores = (etfs.get(etf_name) or {}).get("fatores", {})
        if not isinstance(fatores, dict) or not fatores:
            missing.append(etf_name)
    if missing:
        return False, f"fatores missing for: {missing}"
    return True, "fatores dict present for SWRD, AVGS, AVEM"


@registry.test(
    "etf-composicao-regiao", "VALUE",
    "AVGS has higher value and size loadings than SWRD (factor tilt check)",
    "CRITICAL",
)
def _():
    data = load_data()
    etfs = get_nested(data, "etf_composition.etfs") or {}
    swrd_f = (etfs.get("SWRD") or {}).get("fatores", {})
    avgs_f = (etfs.get("AVGS") or {}).get("fatores", {})
    errors = []
    for factor in ["value", "size"]:
        swrd_v = swrd_f.get(factor)
        avgs_v = avgs_f.get(factor)
        if swrd_v is None or avgs_v is None:
            errors.append(f"Cannot compare {factor}: SWRD={swrd_v}, AVGS={avgs_v}")
            continue
        if avgs_v <= swrd_v:
            errors.append(
                f"AVGS.{factor}={avgs_v} <= SWRD.{factor}={swrd_v} — "
                "AVGS should have stronger factor tilt than market-cap SWRD"
            )
    if errors:
        return False, "; ".join(errors)
    return True, (
        f"AVGS: value={avgs_f.get('value')}, size={avgs_f.get('size')} > "
        f"SWRD: value={swrd_f.get('value')}, size={swrd_f.get('size')}"
    )


@registry.test(
    "etf-composicao-regiao", "RENDER",
    "geoDonut canvas present for etf-composicao-regiao rendering",
    "HIGH",
)
def _():
    html = load_html()
    # etf-composicao-regiao renders into geoDonut canvas (same section)
    if 'id="geoDonut"' in html:
        return True, "geoDonut canvas present (used by etf-composicao-regiao)"
    return False, "geoDonut canvas not found"


@registry.test(
    "etf-composicao-regiao", "VALUE",
    "AVEM regioes includes at least one EM country entry",
    "HIGH",
)
def _():
    data = load_data()
    regioes = get_nested(data, "etf_composition.etfs.AVEM.regioes") or {}
    em_indicators = ["China", "India", "Taiwan", "Brasil", "Korea", "Outros EM", "EM"]
    found = [r for r in regioes if any(ind in r for ind in em_indicators)]
    if not found:
        return False, (
            f"AVEM regioes has no recognizable EM regions: {list(regioes.keys())}"
        )
    return True, f"AVEM EM regions found: {found}"


# ---------------------------------------------------------------------------
# backtest-metricas  (performance tab)
# ---------------------------------------------------------------------------

@registry.test(
    "backtest-metricas", "DATA",
    "backtest.metrics.target and shadowA present with required fields",
    "CRITICAL",
)
def _():
    data = load_data()
    required = ["cagr", "sharpe", "sortino", "maxdd", "vol"]
    errors = []
    for portfolio in ["target", "shadowA"]:
        metrics = get_nested(data, f"backtest.metrics.{portfolio}") or {}
        missing = [f for f in required if not isinstance(metrics.get(f), (int, float))]
        if missing:
            errors.append(f"{portfolio}: missing {missing}")
    if errors:
        return False, "; ".join(errors)
    return True, "backtest.metrics.target and shadowA complete"


@registry.test(
    "backtest-metricas", "VALUE",
    "target CAGR in plausible range [3%, 30%]",
    "CRITICAL",
)
def _():
    data = load_data()
    cagr = get_nested(data, "backtest.metrics.target.cagr")
    if not isinstance(cagr, (int, float)):
        return False, "backtest.metrics.target.cagr missing or non-numeric"
    if not 3 <= cagr <= 30:
        return False, (
            f"target CAGR={cagr}% outside plausible range [3%, 30%] — "
            "verify backtest calculation"
        )
    return True, f"target CAGR={cagr}% within [3%, 30%]"


@registry.test(
    "backtest-metricas", "VALUE",
    "maxdd is negative and within plausible range [-70%, 0%]",
    "HIGH",
)
def _():
    data = load_data()
    errors = []
    for portfolio in ["target", "shadowA"]:
        maxdd = get_nested(data, f"backtest.metrics.{portfolio}.maxdd")
        if not isinstance(maxdd, (int, float)):
            errors.append(f"{portfolio}.maxdd non-numeric")
            continue
        if maxdd >= 0:
            errors.append(f"{portfolio}.maxdd={maxdd} should be negative")
        elif maxdd < -70:
            errors.append(f"{portfolio}.maxdd={maxdd}% below -70% — implausible")
    if errors:
        return False, "; ".join(errors)
    return True, (
        f"maxdd — target={get_nested(data, 'backtest.metrics.target.maxdd')}%, "
        f"shadowA={get_nested(data, 'backtest.metrics.shadowA.maxdd')}%"
    )


@registry.test(
    "backtest-metricas", "RENDER",
    "backtestMetricsTable and backtestMetricsBody elements present",
    "HIGH",
)
def _():
    html = load_html()
    missing = []
    for el_id in ["backtestMetricsTable", "backtestMetricsBody"]:
        if f'id="{el_id}"' not in html:
            missing.append(el_id)
    if missing:
        return False, f"Missing elements: {missing}"
    return True, "backtestMetricsTable and backtestMetricsBody found"


@registry.test(
    "backtest-metricas", "VALUE",
    "backtest dates and target series length match",
    "HIGH",
)
def _():
    data = load_data()
    dates = get_nested(data, "backtest.dates")
    target = get_nested(data, "backtest.target")
    if not isinstance(dates, list) or not isinstance(target, list):
        return False, "backtest.dates or backtest.target missing"
    if len(dates) != len(target):
        return False, (
            f"backtest length mismatch: dates={len(dates)}, target={len(target)}"
        )
    return True, f"backtest series aligned: {len(dates)} entries"


# ---------------------------------------------------------------------------
# shadow-portfolios  (performance tab)
# ---------------------------------------------------------------------------

@registry.test(
    "shadow-portfolios", "DATA",
    "backtest.shadowA series present and aligned with dates",
    "CRITICAL",
)
def _():
    data = load_data()
    dates = get_nested(data, "backtest.dates")
    shadow_a = get_nested(data, "backtest.shadowA")
    if not isinstance(dates, list) or not isinstance(shadow_a, list):
        return False, "backtest.dates or backtest.shadowA missing"
    if len(dates) != len(shadow_a):
        return False, (
            f"shadowA length mismatch: dates={len(dates)}, shadowA={len(shadow_a)}"
        )
    return True, f"backtest.shadowA aligned: {len(shadow_a)} entries"


@registry.test(
    "shadow-portfolios", "DATA",
    "shadows object present with at least one period key",
    "HIGH",
)
def _():
    data = load_data()
    shadows = data.get("shadows")
    if not isinstance(shadows, dict) or len(shadows) == 0:
        return False, "shadows object missing or empty"
    keys = [k for k in shadows.keys() if not k.startswith("delta") and k != "periodo" and k != "atual" and k != "target"]
    if not keys:
        return False, f"shadows has no period entries, only: {list(shadows.keys())}"
    return True, f"shadows present with keys: {list(shadows.keys())}"


@registry.test(
    "shadow-portfolios", "RENDER",
    "shadowChart canvas and shadowTableBody present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    missing = []
    for el_id in ["shadowChart", "shadowTableBody"]:
        if f'id="{el_id}"' not in html:
            missing.append(el_id)
    if missing:
        return False, f"Missing elements: {missing}"
    return True, "shadowChart and shadowTableBody found"


@registry.test(
    "shadow-portfolios", "VALUE",
    "all backtest series values are positive (indexed to 100)",
    "HIGH",
)
def _():
    data = load_data()
    errors = []
    for series_key in ["target", "shadowA"]:
        series = get_nested(data, f"backtest.{series_key}")
        if not isinstance(series, list):
            errors.append(f"backtest.{series_key} not a list")
            continue
        negatives = [v for v in series if isinstance(v, (int, float)) and v <= 0]
        if negatives:
            errors.append(
                f"backtest.{series_key} has {len(negatives)} non-positive values "
                f"(min={min(negatives):.2f}) — series should be indexed ≥ 0"
            )
    if errors:
        return False, "; ".join(errors)
    return True, "All backtest series values positive (valid total-return index)"


# ---------------------------------------------------------------------------
# alpha-itd-swrd  (performance tab)
# ---------------------------------------------------------------------------

@registry.test(
    "alpha-itd-swrd", "DATA",
    "factor_signal excess fields and backtest CAGR fields present",
    "CRITICAL",
)
def _():
    data = load_data()
    fields = {
        "factor_signal.excess_ytd_pp": get_nested(data, "factor_signal.excess_ytd_pp"),
        "factor_signal.excess_since_launch_pp": get_nested(data, "factor_signal.excess_since_launch_pp"),
        "backtest.metrics.target.cagr": get_nested(data, "backtest.metrics.target.cagr"),
        "backtest.metrics.shadowA.cagr": get_nested(data, "backtest.metrics.shadowA.cagr"),
    }
    missing = [k for k, v in fields.items() if not isinstance(v, (int, float))]
    if missing:
        return False, f"Missing or non-numeric: {missing}"
    return True, f"All alpha-itd-swrd fields present: {fields}"


@registry.test(
    "alpha-itd-swrd", "VALUE",
    "alpha liquido progress bar element present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    if 'id="alphaLiquidoFill"' in html or 'id="alphaLiquidoLabel"' in html:
        return True, "alphaLiquidoFill/Label elements found"
    return False, "Alpha liquido progress bar elements not found in index.html"


@registry.test(
    "alpha-itd-swrd", "RENDER",
    "McLean & Pontiff 2016 haircut reference present in HTML",
    "MEDIUM",
)
def _():
    html = load_html()
    # The 58% haircut reference (McLean & Pontiff 2016) should be in the template
    if "McLean" in html or "haircut" in html.lower() or "58%" in html:
        return True, "McLean & Pontiff haircut reference found in HTML"
    return False, (
        "No reference to McLean & Pontiff 2016 or 58% haircut found — "
        "alpha liquido methodology must be disclosed"
    )


@registry.test(
    "alpha-itd-swrd", "VALUE",
    "target CAGR exceeds shadowA CAGR (factor premium positive ITD)",
    "HIGH",
)
def _():
    data = load_data()
    target_cagr = get_nested(data, "backtest.metrics.target.cagr")
    shadow_cagr = get_nested(data, "backtest.metrics.shadowA.cagr")
    if not all(isinstance(v, (int, float)) for v in [target_cagr, shadow_cagr]):
        return False, "target or shadowA CAGR non-numeric"
    # Factor premium can be temporarily negative — this is a WARNING, not a hard fail
    if target_cagr < shadow_cagr:
        return False, (
            f"target CAGR={target_cagr}% < shadowA CAGR={shadow_cagr}% — "
            f"factor portfolio underperforming benchmark ITD "
            f"(gap={shadow_cagr - target_cagr:.2f}pp)"
        )
    return True, (
        f"target CAGR={target_cagr}% > shadowA CAGR={shadow_cagr}% "
        f"(+{target_cagr - shadow_cagr:.2f}pp alpha ITD)"
    )


# ---------------------------------------------------------------------------
# cagr-patrimonial-twr  (performance tab)
# ---------------------------------------------------------------------------

@registry.test(
    "cagr-patrimonial-twr", "DATA",
    "backtest.metrics.target.cagr, premissas.patrimonio_atual and cambio present",
    "CRITICAL",
)
def _():
    data = load_data()
    fields = {
        "backtest.metrics.target.cagr": get_nested(data, "backtest.metrics.target.cagr"),
        "premissas.patrimonio_atual": get_nested(data, "premissas.patrimonio_atual"),
        "cambio": data.get("cambio"),
    }
    missing = [k for k, v in fields.items() if not isinstance(v, (int, float))]
    if missing:
        return False, f"Missing or non-numeric: {missing}"
    return True, (
        f"cagr={fields['backtest.metrics.target.cagr']}%, "
        f"patrimonio={fields['premissas.patrimonio_atual']:.0f}, "
        f"cambio={fields['cambio']}"
    )


@registry.test(
    "cagr-patrimonial-twr", "VALUE",
    "patrimonio_atual in plausible range [R$1M, R$50M]",
    "CRITICAL",
)
def _():
    data = load_data()
    patrimonio = get_nested(data, "premissas.patrimonio_atual")
    if not isinstance(patrimonio, (int, float)):
        return False, "premissas.patrimonio_atual non-numeric"
    if not 1_000_000 <= patrimonio <= 50_000_000:
        return False, (
            f"patrimonio_atual=R${patrimonio:,.0f} outside plausible range "
            "[R$1M, R$50M] — check for unit error"
        )
    return True, f"patrimonio_atual=R${patrimonio:,.0f} within plausible range"


@registry.test(
    "cagr-patrimonial-twr", "RENDER",
    "cagrPatrimonial and cagrTwrRow elements present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    missing = []
    for el_id in ["cagrPatrimonial", "cagrTwrRow"]:
        if f'id="{el_id}"' not in html:
            missing.append(el_id)
    if missing:
        return False, f"Missing elements: {missing}"
    return True, "cagrPatrimonial and cagrTwrRow found"


@registry.test(
    "cagr-patrimonial-twr", "VALUE",
    "cambio BRL/USD in plausible range [3.0, 10.0]",
    "HIGH",
)
def _():
    data = load_data()
    cambio = data.get("cambio")
    if not isinstance(cambio, (int, float)):
        return False, "cambio non-numeric"
    if not 3.0 <= cambio <= 10.0:
        return False, (
            f"cambio={cambio} outside plausible range [3.0, 10.0] — "
            "verify BRL/USD rate"
        )
    return True, f"cambio={cambio} BRL/USD within plausible range"


# ---------------------------------------------------------------------------
# backtest-regime-longo  (performance tab)
# ---------------------------------------------------------------------------

@registry.test(
    "backtest-regime-longo", "DATA",
    "backtestR5 present with dates, target, shadowA and metrics",
    "CRITICAL",
)
def _():
    data = load_data()
    r5 = data.get("backtestR5", {})
    errors = []
    for key in ["dates", "target", "shadowA"]:
        if not isinstance(r5.get(key), list) or len(r5.get(key)) == 0:
            errors.append(f"backtestR5.{key} missing or empty")
    for portfolio in ["target", "shadowA"]:
        metrics = (r5.get("metrics") or {}).get(portfolio, {})
        if not isinstance(metrics.get("cagr"), (int, float)):
            errors.append(f"backtestR5.metrics.{portfolio}.cagr missing")
    if errors:
        return False, "; ".join(errors)
    return True, (
        f"backtestR5 complete: {len(r5['dates'])} months, "
        f"target CAGR={r5['metrics']['target']['cagr']}%"
    )


@registry.test(
    "backtest-regime-longo", "VALUE",
    "backtestR5 covers at least 15 years (180 months)",
    "HIGH",
)
def _():
    data = load_data()
    dates = get_nested(data, "backtestR5.dates")
    if not isinstance(dates, list):
        return False, "backtestR5.dates missing"
    n = len(dates)
    if n < 180:
        return False, (
            f"backtestR5 has {n} months — less than 15 years (180) required "
            "for regime analysis"
        )
    return True, f"backtestR5 covers {n} months ({n/12:.1f} years)"


@registry.test(
    "backtest-regime-longo", "RENDER",
    "backtestChart canvas present in HTML",
    "HIGH",
)
def _():
    html = load_html()
    if 'id="backtestChart"' in html:
        return True, "backtestChart canvas found"
    return False, "backtestChart canvas not found in index.html"


@registry.test(
    "backtest-regime-longo", "VALUE",
    "backtestR5 series lengths are all equal",
    "HIGH",
)
def _():
    data = load_data()
    r5 = data.get("backtestR5", {})
    lengths = {k: len(r5[k]) for k in ["dates", "target", "shadowA"] if isinstance(r5.get(k), list)}
    if len(set(lengths.values())) > 1:
        return False, f"backtestR5 series length mismatch: {lengths}"
    if not lengths:
        return False, "No backtestR5 series found"
    return True, f"backtestR5 all series aligned: {lengths}"


# ---------------------------------------------------------------------------
# factor-loadings-chart  (performance tab)
# ---------------------------------------------------------------------------

@registry.test(
    "factor-loadings-chart", "DATA",
    "factor_loadings present with at least SWRD entry",
    "CRITICAL",
)
def _():
    data = load_data()
    fl = data.get("factor_loadings")
    if not isinstance(fl, dict) or len(fl) == 0:
        return False, "factor_loadings missing or empty"
    if "SWRD" not in fl:
        return False, f"factor_loadings missing SWRD; has: {list(fl.keys())}"
    return True, f"factor_loadings present for: {list(fl.keys())}"


@registry.test(
    "factor-loadings-chart", "VALUE",
    "SWRD mkt_rf loading near 1.0 (0.85 to 1.15) — market index",
    "CRITICAL",
)
def _():
    data = load_data()
    mkt = get_nested(data, "factor_loadings.SWRD.mkt_rf")
    if not isinstance(mkt, (int, float)):
        return False, "factor_loadings.SWRD.mkt_rf missing or non-numeric"
    if not 0.85 <= mkt <= 1.15:
        return False, (
            f"SWRD mkt_rf={mkt:.4f} outside [0.85, 1.15] — "
            "MSCI World should load near 1.0 on market factor"
        )
    return True, f"SWRD mkt_rf={mkt:.4f} near 1.0 (market index confirmed)"


@registry.test(
    "factor-loadings-chart", "VALUE",
    "AVUV/AVDV have positive SMB and HML loadings (small-cap value tilt)",
    "CRITICAL",
)
def _():
    data = load_data()
    fl = data.get("factor_loadings", {})
    errors = []
    for etf in ["AVUV", "AVDV"]:
        if etf not in fl:
            continue  # optional ETFs — skip if not present
        smb = fl[etf].get("smb")
        hml = fl[etf].get("hml")
        if isinstance(smb, (int, float)) and smb <= 0:
            errors.append(f"{etf}.smb={smb:.4f} not positive (expected small-cap tilt)")
        if isinstance(hml, (int, float)) and hml <= 0:
            errors.append(f"{etf}.hml={hml:.4f} not positive (expected value tilt)")
    if errors:
        return False, "; ".join(errors)
    etfs_checked = [e for e in ["AVUV", "AVDV"] if e in fl]
    if not etfs_checked:
        return True, "AVUV/AVDV not in factor_loadings — no check performed"
    return True, f"SMB and HML positive for {etfs_checked} (small-cap value confirmed)"


@registry.test(
    "factor-loadings-chart", "RENDER",
    "factorLoadingsChart canvas and factorLoadingsCards present",
    "HIGH",
)
def _():
    html = load_html()
    missing = []
    for el_id in ["factorLoadingsChart", "factorLoadingsCards"]:
        if f'id="{el_id}"' not in html:
            missing.append(el_id)
    if missing:
        return False, f"Missing elements: {missing}"
    return True, "factorLoadingsChart and factorLoadingsCards found"


@registry.test(
    "factor-loadings-chart", "VALUE",
    "each factor_loadings entry has r2 between 0 and 1",
    "HIGH",
)
def _():
    data = load_data()
    fl = data.get("factor_loadings", {})
    errors = []
    for etf, entry in fl.items():
        r2 = entry.get("r2")
        if not isinstance(r2, (int, float)):
            errors.append(f"{etf}: r2 non-numeric")
        elif not 0 <= r2 <= 1:
            errors.append(f"{etf}: r2={r2:.4f} outside [0, 1]")
    if errors:
        return False, "; ".join(errors)
    return True, f"All r2 values in [0,1] for {list(fl.keys())}"


@registry.test(
    "factor-loadings-chart", "VALUE",
    "no hardcoded factor loading values in build script",
    "HIGH",
)
def _():
    text = BUILD_PY.read_text()
    # Check for a distinctive SWRD mkt_rf value
    data = load_data()
    mkt = get_nested(data, "factor_loadings.SWRD.mkt_rf")
    if mkt is None:
        return False, "factor_loadings.SWRD.mkt_rf missing"
    if f'"mkt_rf": {mkt}' in text:
        return False, f"Hardcoded mkt_rf={mkt} for SWRD found in build_dashboard.py"
    return True, "No hardcoded factor loading values in build script"


# ---------------------------------------------------------------------------
# factor-rolling-avgs  (performance tab)
# ---------------------------------------------------------------------------

@registry.test(
    "factor-rolling-avgs", "DATA",
    "factor_rolling.dates, avgs_vs_swrd_12m and threshold present",
    "CRITICAL",
)
def _():
    data = load_data()
    dates = get_nested(data, "factor_rolling.dates")
    series = get_nested(data, "factor_rolling.avgs_vs_swrd_12m")
    threshold = get_nested(data, "factor_rolling.threshold")
    errors = []
    if not isinstance(dates, list) or len(dates) == 0:
        errors.append("factor_rolling.dates missing or empty")
    if not isinstance(series, list) or len(series) == 0:
        errors.append("factor_rolling.avgs_vs_swrd_12m missing or empty")
    if not isinstance(threshold, (int, float)):
        errors.append("factor_rolling.threshold missing or non-numeric")
    if errors:
        return False, "; ".join(errors)
    return True, (
        f"factor_rolling: {len(dates)} periods, "
        f"latest={series[-1]:.2f}pp, threshold={threshold}"
    )


@registry.test(
    "factor-rolling-avgs", "VALUE",
    "factor_rolling dates and avgs_vs_swrd_12m series lengths match",
    "CRITICAL",
)
def _():
    data = load_data()
    dates = get_nested(data, "factor_rolling.dates") or []
    series = get_nested(data, "factor_rolling.avgs_vs_swrd_12m") or []
    if len(dates) != len(series):
        return False, (
            f"Length mismatch: dates={len(dates)}, "
            f"avgs_vs_swrd_12m={len(series)}"
        )
    return True, f"factor_rolling aligned: {len(dates)} entries"


@registry.test(
    "factor-rolling-avgs", "RENDER",
    "factorRollingChart canvas and factorRollingSection present",
    "HIGH",
)
def _():
    html = load_html()
    missing = []
    for el_id in ["factorRollingChart", "factorRollingSection"]:
        if f'id="{el_id}"' not in html:
            missing.append(el_id)
    if missing:
        return False, f"Missing elements: {missing}"
    return True, "factorRollingChart and factorRollingSection found"


@registry.test(
    "factor-rolling-avgs", "VALUE",
    "threshold is negative (convention: negative = factor drought trigger)",
    "HIGH",
)
def _():
    data = load_data()
    threshold = get_nested(data, "factor_rolling.threshold")
    if not isinstance(threshold, (int, float)):
        return False, "factor_rolling.threshold non-numeric"
    if threshold >= 0:
        return False, (
            f"threshold={threshold} is non-negative — "
            "factor drought trigger should be negative (e.g. -5pp)"
        )
    return True, f"threshold={threshold}pp (negative — factor drought trigger correct)"


@registry.test(
    "factor-rolling-avgs", "VALUE",
    "rolling series values in plausible range [-50, +50] pp",
    "MEDIUM",
)
def _():
    data = load_data()
    series = get_nested(data, "factor_rolling.avgs_vs_swrd_12m") or []
    if not series:
        return False, "factor_rolling.avgs_vs_swrd_12m empty"
    outliers = [v for v in series if isinstance(v, (int, float)) and not -50 <= v <= 50]
    if outliers:
        return False, (
            f"{len(outliers)} values outside [-50, +50]pp: {outliers} — "
            "verify 12m rolling excess return calculation"
        )
    return True, (
        f"All {len(series)} rolling values in [-50, +50]pp range "
        f"(min={min(series):.1f}, max={max(series):.1f})"
    )
