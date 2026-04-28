"""
risk_metrics.py — Calcula métricas de risco do portfolio e retorna dict `risk`.

Integração: chamado por generate_data.py antes do save.
    from scripts.risk_metrics import compute_risk_metrics
    data["risk"] = compute_risk_metrics(data)

Metodologia:
  - Risk Score: fórmula paramétrica (0-10) baseada em peso equity, BTC addon,
    duration addon, concentração BR, e desconto por diversificação.
  - VaR/CVaR: paramétrico normal 95% 1 ano (não histórico).
  - Risk Contribution: volatilidade implícita × peso, normalizado para 100%.
  - Duration Scenarios: MtM da Renda+ dado shift paralelo na curva.
"""

from __future__ import annotations
import json
import math
from pathlib import Path
from scipy.stats import norm  # type: ignore[import-untyped]


# ── Constantes de risco ───────────────────────────────────────────────────────

EQUITY_PCT         = 0.79
BTC_PCT            = 0.029
VOL_EQUITY         = 0.168   # vol portfolio proxy (equity dominante)
VOL_BTC            = 0.75    # BTC vol anual histórica
MODIFIED_DURATION  = 43.25   # Renda+ 2065 modified duration
RENDA_PLUS_PCT     = 0.027
BR_RF_PCT          = 0.10    # concentração RF Brasil

MU_PORTFOLIO       = 0.097   # expected return portfolio (premissa)
DISCOUNT_DIVERSIF  = -0.30   # desconto por diversificação geográfica

# Volatilidades implícitas por ativo (anual)
ASSET_VOLS = {
    "SWRD":   0.14,
    "AVGS":   0.19,
    "AVEM":   0.18,
    "HODL11": 0.75,
    "RF":     0.05,
}

# Pesos dos ativos no portfolio total
ASSET_WEIGHTS = {
    "SWRD":   EQUITY_PCT * 0.50,
    "AVGS":   EQUITY_PCT * 0.30,
    "AVEM":   EQUITY_PCT * 0.20,
    "HODL11": BTC_PCT,
    "RF":     BR_RF_PCT,
}

# SoRR P(FIRE) ajustado (valores estáticos baseados em análise MC)
SORR_SCENARIOS = [
    {"crash_label": "Queda -20%", "crash_pct": -0.20, "pfire_ajustado": 0.82},
    {"crash_label": "Queda -30%", "crash_pct": -0.30, "pfire_ajustado": 0.76},
    {"crash_label": "Queda -40%", "crash_pct": -0.40, "pfire_ajustado": 0.68},
]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _score_label(score: float) -> str:
    """Retorna label semântico do risk score."""
    if score < 5.0:
        return "Conservador"
    if score < 6.5:
        return "Moderado"
    if score < 7.5:
        return "Moderado-Agressivo"
    if score < 9.0:
        return "Agressivo-Moderado"
    return "Agressivo"


def _compute_score() -> tuple[float, dict[str, float]]:
    """Calcula risk score 0-10 e breakdown dos componentes."""
    score_base     = EQUITY_PCT * 10
    addon_btc      = BTC_PCT * (VOL_BTC / VOL_EQUITY - 1) * 0.5
    addon_duration = RENDA_PLUS_PCT * (MODIFIED_DURATION / 46) * 0.5
    addon_conc_br  = max(0.0, BR_RF_PCT - 0.20) * 3
    discount       = DISCOUNT_DIVERSIF

    raw = score_base + addon_btc + addon_duration + addon_conc_br + discount
    score = min(10.0, max(0.0, raw))

    breakdown = {
        "base_equity":           round(score_base, 4),
        "addon_btc":             round(addon_btc, 4),
        "addon_duration":        round(addon_duration, 4),
        "addon_conc_br":         round(addon_conc_br, 4),
        "discount_diversificacao": round(discount, 4),
    }
    return round(score, 2), breakdown


def _compute_var_cvar(sigma: float, mu: float) -> tuple[float, float]:
    """VaR e CVaR paramétrico normal 95% 1 ano (retornos como % do portfolio)."""
    z = 1.645
    var_95  = -(mu - z * sigma)
    cvar_95 = -(mu - sigma * float(norm.pdf(z)) / 0.05)
    return round(var_95, 4), round(cvar_95, 4)


def _compute_risk_contributions() -> list[dict]:
    """Contribuição ao risco por ativo (vol × peso, normalizado para 100%)."""
    contribs_raw: dict[str, float] = {}
    for asset, vol in ASSET_VOLS.items():
        w = ASSET_WEIGHTS.get(asset, 0.0)
        contribs_raw[asset] = vol * w

    total = sum(contribs_raw.values())
    result = []
    for asset in ASSET_VOLS:
        w = ASSET_WEIGHTS.get(asset, 0.0)
        contrib_pct = contribs_raw[asset] / total if total > 0 else 0.0
        result.append({
            "name": asset,
            "weight": round(w, 4),
            "risk_contribution_pct": round(contrib_pct, 4),
        })
    return result


def _compute_hhi(weights: dict[str, float]) -> float:
    """Herfindahl-Hirschman Index de concentração."""
    return round(sum(w ** 2 for w in weights.values()), 4)


def _compute_duration_scenarios(portfolio_value: float | None) -> list[dict]:
    """MtM da Renda+ para shift paralelo de +1pp e +2pp.

    Convenção: mtm_pct = -modified_duration × shift (e.g. -43.25 × 0.01 = -0.4325 para +1pp)
    Representa a variação % no preço do título (não % do portfolio).
    """
    scenarios = []
    for shift_pp in [1, 2]:
        # Δprice% = -modified_duration × Δy (Δy = shift_pp / 100)
        mtm_pct = round(-MODIFIED_DURATION * (shift_pp / 100), 4)
        # R$ = posição renda+ no portfolio × mtm_pct
        mtm_brl = round(portfolio_value * RENDA_PLUS_PCT * mtm_pct, 2) if portfolio_value else None
        scenarios.append({
            "shift_pp": shift_pp,
            "renda_plus_mtm_pct": mtm_pct,
            "renda_plus_mtm_brl": mtm_brl,
        })
    return scenarios


def _get_portfolio_value(data: dict) -> float | None:
    """Extrai patrimônio financeiro do data dict."""
    ph = data.get("patrimonio_holistico") or {}
    val = ph.get("financeiro_brl")
    if val is not None:
        return float(val)
    prem = data.get("premissas") or {}
    val2 = prem.get("patrimonio_atual")
    if val2 is not None:
        return float(val2)
    return None


# ── Função pública ─────────────────────────────────────────────────────────────

def _get_max_drawdown_real(data: dict) -> float | None:
    """
    Extrai max drawdown histórico absoluto de drawdown_history.
    A série usa cummax desde o primeiro ponto do histórico — é o drawdown real.
    Fallback: backtest maxdd da série longa (pico absoluto 1994-2026).
    """
    # Fonte primária: drawdown_history (historico_carteira.csv cummax)
    dh = data.get("drawdown_history") or {}
    max_dd = dh.get("max_drawdown")
    if max_dd is not None:
        return float(max_dd)

    # Fallback: backtest metrics (série longa, mais conservador)
    bt = data.get("backtest") or {}
    metrics = (bt.get("metrics") or {}).get("target") or {}
    maxdd_bt = metrics.get("maxdd")
    if maxdd_bt is not None:
        # backtest retorna em % (negativo), normalizar para decimal negativo
        return float(maxdd_bt) / 100.0 if abs(float(maxdd_bt)) > 1 else float(maxdd_bt)

    return None


def compute_risk_metrics(data: dict) -> dict:
    """Calcula todas as métricas de risco e retorna dict `risk`."""
    portfolio_value = _get_portfolio_value(data)
    sigma = VOL_EQUITY

    score, breakdown = _compute_score()
    var_95, cvar_95 = _compute_var_cvar(sigma=sigma, mu=MU_PORTFOLIO)
    contribs = _compute_risk_contributions()
    hhi = _compute_hhi(ASSET_WEIGHTS)
    duration_scenarios = _compute_duration_scenarios(portfolio_value)

    # Max drawdown real — usa pico histórico absoluto via cummax desde início da série
    max_drawdown_real = _get_max_drawdown_real(data)

    # Semáforos de risco
    btc_pct_val = round(BTC_PCT, 4)
    btc_status = (
        "verde" if 0.015 <= btc_pct_val <= 0.05
        else "amarelo" if btc_pct_val < 0.015
        else "vermelho"
    )

    return {
        "score":               score,
        "label":               _score_label(score),
        "score_breakdown":     breakdown,
        "vol_portfolio":       round(sigma, 4),
        "var_95_pct":          round(var_95, 4),
        "cvar_95_pct":         round(cvar_95, 4),
        "hhi":                 hhi,
        "calmar_ratio":        None,  # requer série de retornos histórica
        "max_drawdown_real":   max_drawdown_real,
        "contribution_by_asset": contribs,
        "semaforos": {
            "equity_drift": {
                "value":  None,
                "status": "verde",
                "label":  "Calculado no portfolio",
            },
            "btc_pct": {
                "value":         btc_pct_val,
                "status":        btc_status,
                "threshold_min": 0.015,
                "threshold_max": 0.05,
            },
            "renda_plus_taxa": {
                "value":  None,
                "status": "verde",
                "label":  "Ver gatilhos",
            },
        },
        "duration_scenarios": duration_scenarios,
        "sorr_scenarios":     SORR_SCENARIOS,
    }
