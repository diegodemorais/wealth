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
    Nota: assume correlação zero entre ativos — proxy; RC formal exigiria matriz de covariância.
  - Duration Scenarios: MtM da Renda+ dado shift paralelo na curva.
"""

from __future__ import annotations
import math
from scipy.stats import norm  # type: ignore[import-untyped]


# ── Constantes de risco ───────────────────────────────────────────────────────

# Fallback para MODIFIED_DURATION: 46.24 anos (pyield ANBIMA-compliant, carteira.md 2026-04-25).
# Em runtime, lemos data["rf"]["renda2065"]["duration"]["modificada_anos"] se disponível.
MODIFIED_DURATION_FALLBACK = 46.24

BTC_PCT            = 0.029
VOL_EQUITY         = 0.168   # vol portfolio proxy (equity dominante)
VOL_BTC            = 0.75    # BTC vol anual histórica
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

# SoRR P(FIRE) ajustado (deltas estáticos baseados em análise MC — is_static_estimate)
# Valores derivados por heurística; Monte Carlo completo em fire_montecarlo.py é canônico.
_SORR_DELTAS = [
    {"crash_label": "Queda -20%", "crash_pct": -0.20, "delta_pfire": -0.041},
    {"crash_label": "Queda -30%", "crash_pct": -0.30, "delta_pfire": -0.083},
    {"crash_label": "Queda -40%", "crash_pct": -0.40, "delta_pfire": -0.161},
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


def _extract_equity_pct(data: dict) -> float:
    """Calcula equity_pct dinamicamente a partir de drift.atual (pesos correntes).

    drift[bucket].atual está em % (e.g. 35.4 = 35.4%). Soma SWRD+AVGS+AVEM.
    Fallback: data.allocation.equity_pct → constante carteira.md (0.79 = pesos-alvo equity).
    """
    drift = data.get("drift") or {}
    equity_buckets = ("SWRD", "AVGS", "AVEM")
    if all(b in drift for b in equity_buckets):
        return sum(drift[b]["atual"] for b in equity_buckets) / 100.0
    # Fallback: pesos-alvo da carteira.md (SWRD 39.5% + AVGS 23.7% + AVEM 15.8% = 79%)
    return data.get("allocation", {}).get("equity_pct", 0.79)  # type: ignore[return-value]


def _extract_modified_duration(data: dict) -> float:
    """Lê modified duration da Renda+ 2065 de data['rf']['renda2065']['duration'].

    Gerado dinamicamente por generate_data.py (calcular_duration_modificada_ntnb).
    Fallback: MODIFIED_DURATION_FALLBACK (46.24, pyield ANBIMA-compliant, carteira.md).
    """
    dur = (
        (data.get("rf") or {})
        .get("renda2065", {})
        .get("duration", {})
        .get("modificada_anos")
    )
    return float(dur) if dur is not None else MODIFIED_DURATION_FALLBACK


def _extract_renda_plus_pct(data: dict) -> float:
    """Calcula peso da Renda+ 2065 no portfolio total a partir de data."""
    renda_brl = (data.get("rf") or {}).get("renda2065", {}).get("valor")
    total_brl = (data.get("concentracao_brasil") or {}).get("total_portfolio_brl")
    if renda_brl and total_brl and total_brl > 0:
        return float(renda_brl) / float(total_brl)
    # Fallback: ~3.4% conforme carteira.md (R$117.832 / R$3.47M)
    return 0.034


def _compute_equity_drift_status(data: dict) -> dict:
    """Calcula semáforo de equity drift a partir de drift real no data.

    Thresholds: <5pp verde · 5–10pp amarelo · >=10pp vermelho.
    Se drift não disponível, retorna 'desconhecido'.
    """
    drift = data.get("drift") or {}
    if not drift:
        return {"value": None, "status": "desconhecido", "label": "Drift não disponível"}

    max_drift_pp = max(
        abs(v.get("atual", 0) - v.get("alvo", 0))
        for v in drift.values()
        if isinstance(v, dict)
    )
    max_drift_pp = round(max_drift_pp, 2)

    if max_drift_pp < 5.0:
        status = "verde"
    elif max_drift_pp < 10.0:
        status = "amarelo"
    else:
        status = "vermelho"

    return {
        "value":         max_drift_pp,
        "status":        status,
        "threshold_amarelo": 5.0,
        "threshold_vermelho": 10.0,
    }


def _compute_score(equity_pct: float, modified_duration: float, renda_plus_pct: float) -> tuple[float, dict[str, float]]:
    """Calcula risk score 0-10 e breakdown dos componentes."""
    score_base     = equity_pct * 10
    addon_btc      = BTC_PCT * (VOL_BTC / VOL_EQUITY - 1) * 0.5
    addon_duration = renda_plus_pct * (modified_duration / 46) * 0.5
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


def _compute_risk_contributions(equity_pct: float) -> list[dict]:
    """Contribuição ao risco por ativo (vol × peso, normalizado para 100%).

    Proxy sem correlação: RC formal exigiria matriz de covariância completa.
    """
    asset_weights = {
        "SWRD":   equity_pct * 0.50,
        "AVGS":   equity_pct * 0.30,
        "AVEM":   equity_pct * 0.20,
        "HODL11": BTC_PCT,
        "RF":     BR_RF_PCT,
    }
    contribs_raw: dict[str, float] = {
        asset: ASSET_VOLS[asset] * asset_weights.get(asset, 0.0)
        for asset in ASSET_VOLS
    }
    total = sum(contribs_raw.values())
    return [
        {
            "name": asset,
            "weight": round(asset_weights.get(asset, 0.0), 4),
            "risk_contribution_pct": round(contribs_raw[asset] / total if total > 0 else 0.0, 4),
        }
        for asset in ASSET_VOLS
    ]


def _compute_hhi(equity_pct: float) -> float:
    """Herfindahl-Hirschman Index de concentração."""
    weights = {
        "SWRD":   equity_pct * 0.50,
        "AVGS":   equity_pct * 0.30,
        "AVEM":   equity_pct * 0.20,
        "HODL11": BTC_PCT,
        "RF":     BR_RF_PCT,
    }
    return round(sum(w ** 2 for w in weights.values()), 4)


def _compute_duration_scenarios(
    portfolio_value: float | None,
    modified_duration: float,
    renda_plus_pct: float,
) -> list[dict]:
    """MtM da Renda+ para shift paralelo de -2pp, -1pp, +1pp e +2pp.

    Campos:
    - renda_plus_mtm_pct: variação % no preço do título (não % do portfolio)
    - renda_plus_mtm_portfolio_pct: impacto sobre o portfolio total (= mtm_pct × peso Renda+)
    - with_convexity_note: True — valores sem ajuste de convexidade (conservador)
    Negativo = queda de taxa = valorização (ganho MtM). Positivo = alta de taxa = perda.
    """
    scenarios = []
    for shift_pp in [-2, -1, 1, 2]:
        # Δprice% = -modified_duration × Δy (sem convexidade — valor conservador)
        mtm_pct = round(-modified_duration * (shift_pp / 100), 4)
        mtm_brl = round(portfolio_value * renda_plus_pct * mtm_pct, 2) if portfolio_value else None
        mtm_portfolio_pct = round(mtm_pct * renda_plus_pct, 6)
        scenarios.append({
            "shift_pp":                       shift_pp,
            "renda_plus_mtm_pct":             mtm_pct,
            "renda_plus_mtm_brl":             mtm_brl,
            "renda_plus_mtm_portfolio_pct":   mtm_portfolio_pct,
            "with_convexity_note":            True,
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


def _build_sorr_scenarios(sorr_base_pfire: float) -> list[dict]:
    """Constrói cenários SoRR aplicando deltas fixos sobre P(FIRE) base.

    is_static_estimate=True: deltas são heurísticos, não output direto do MC.
    Monte Carlo completo (fire_montecarlo.py) é canônico para análise precisa.
    """
    return [
        {
            "crash_label":        s["crash_label"],
            "crash_pct":          s["crash_pct"],
            "pfire_ajustado":     round(sorr_base_pfire / 100 + s["delta_pfire"], 4),
            "is_static_estimate": True,
        }
        for s in _SORR_DELTAS
    ]


def compute_risk_metrics(data: dict) -> dict:
    """Calcula todas as métricas de risco e retorna dict `risk`."""
    portfolio_value = _get_portfolio_value(data)
    sigma = VOL_EQUITY

    # Parâmetros dinâmicos extraídos do data (zero hardcoded financeiro)
    equity_pct       = _extract_equity_pct(data)
    modified_duration = _extract_modified_duration(data)
    renda_plus_pct   = _extract_renda_plus_pct(data)

    score, breakdown = _compute_score(equity_pct, modified_duration, renda_plus_pct)
    var_95, cvar_95 = _compute_var_cvar(sigma=sigma, mu=MU_PORTFOLIO)
    contribs = _compute_risk_contributions(equity_pct)
    hhi = _compute_hhi(equity_pct)
    duration_scenarios = _compute_duration_scenarios(portfolio_value, modified_duration, renda_plus_pct)

    # Max drawdown real — usa pico histórico absoluto via cummax desde início da série
    max_drawdown_real = _get_max_drawdown_real(data)

    # P(FIRE) base para SoRR (em %, de pfire_base.base gerado pelo MC)
    sorr_base_pfire = float((data.get("pfire_base") or {}).get("base", 86.4))

    # Semáforos de risco
    btc_pct_val = round(BTC_PCT, 4)
    btc_status = (
        "verde" if 0.015 <= btc_pct_val <= 0.05
        else "amarelo" if btc_pct_val < 0.015
        else "vermelho"
    )
    equity_drift_semaforo = _compute_equity_drift_status(data)

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
        "contribution_methodology": "vol×peso normalizado (proxy sem correlação — RC formal exigiria matriz de covariância)",
        "semaforos": {
            "equity_drift": equity_drift_semaforo,
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
        "duration_scenarios":   duration_scenarios,
        "sorr_scenarios":       _build_sorr_scenarios(sorr_base_pfire),
        "sorr_base_pfire":      sorr_base_pfire,
    }
