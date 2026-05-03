#!/usr/bin/env python3
"""
reconstruct_allocation_series.py — Shadow portfolios em ALOCAÇÃO TOTAL (rebase 100).

Reconstrói séries históricas mensais (rebase 100) de 5 portfolios em escopo de
alocação total da carteira de Diego. Output: dados/allocation_series.json.

Spec: agentes/issues/DEV-shadow-allocation-series.md (Fase 1)
Decisões aprovadas (Head + CIO + Diego, 2026-05-03):
  - "Atual com Legados": TWR mensal real desde 2021-04 (acumulado_pct rebase 100)
  - Target alocação-total: 79% equity (SWRD 50/AVGS 30/AVEM 20) + 15% IPCA+ +
                           3% HODL11 + 3% Renda+ 2065
  - Pré-2024-12 (1ª compra UCITS): proxies acadêmicos do Regime 5/6
                                   (DFSVX/DISVX/DFEMX para AVGS/AVEM)
  - Renda+ 2065 pré-2023 (não existia): proxy IPCA+ 2040
  - Shadow A = 100% VWRA (BRL); Shadow B = 100% IPCA+ 2040;
    Shadow C = 79% VWRA + 15% IPCA+ + 3% HODL11 + 3% Renda+ (benchmark justo)

Uso:
    python3 scripts/reconstruct_allocation_series.py
    python3 scripts/reconstruct_allocation_series.py --rebuild
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Optional

import pandas as pd
import yfinance as yf

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from append_only import write_with_meta, load_or_init  # noqa: E402
from fetch_utils import fetch_with_retry  # noqa: E402

# ── Append-only methodology version ──────────────────────────────────────────
METODOLOGIA_VERSION = "alloc-v1"

# ── Paths ────────────────────────────────────────────────────────────────────
RETORNOS_PATH = ROOT / "dados" / "retornos_mensais.json"
CARTEIRA_PARAMS_PATH = ROOT / "dados" / "carteira_params.json"
OUT_PATH = ROOT / "dados" / "allocation_series.json"

# ── Constantes ───────────────────────────────────────────────────────────────
START_MONTH = "2021-04"  # Mês 0 (rebase 100). 2021-05 é o primeiro mês com retorno.
RENDA_PLUS_LAUNCH = "2023-01"  # Tesouro Renda+ 2065 lançado Jan/2023.
UCITS_FIRST_BUY = "2024-12"  # 1ª compra UCITS (SWRD/AVGS/AVEM em LSE)

# Proxies acadêmicos (Regime 7) para construir target pré-UCITS
PROXY_TICKERS = {
    "swrd": "URTH",     # MSCI World NR (alternativa: IVV — usaremos URTH para coerência com SWRD)
    "avgs_a": "DFSVX",  # DFA US Small Value
    "avgs_b": "DISVX",  # DFA Intl Small Value
    "avem":   "DFEMX",  # DFA Emerging Markets
    "vwra":   "ACWI",   # MSCI ACWI (alternativa para VWRA pré-2019)
}
AVGS_DFSVX_W = 0.58
AVGS_DISVX_W = 0.42

# Tickers UCITS reais (a partir de 2024-12)
TICKER_SWRD = "SWRD.L"
TICKER_AVGS = "AVGS.L"
TICKER_AVEM = "AVEM.L"
TICKER_VWRA = "VWRA.L"
TICKER_HODL11 = "HODL11.SA"
TICKER_BTC = "BTC-USD"

# Cache TTL (horas) — IPCA não muda retroativamente, FX/equity podem mudar
CACHE_TTL_IPCA_H = 24 * 30   # 30 dias
CACHE_TTL_PRICE_H = 24       # 1 dia
CACHE_TTL_PTAX_H = 24 * 7    # 7 dias (histórico não muda)


# ═══════════════════════════════════════════════════════════════════════════════
# 1. Helpers — datas e índice mensal
# ═══════════════════════════════════════════════════════════════════════════════

def _ym(d: pd.Timestamp | date | str) -> str:
    """Normaliza para 'YYYY-MM'."""
    if isinstance(d, str):
        return d[:7]
    if isinstance(d, pd.Timestamp):
        return d.strftime("%Y-%m")
    return d.strftime("%Y-%m")


def _month_range(start_ym: str, end_ym: str) -> list[str]:
    """Retorna lista de YYYY-MM de start a end (inclusive), passo mensal."""
    s = datetime.strptime(start_ym + "-01", "%Y-%m-%d").date()
    e = datetime.strptime(end_ym + "-01", "%Y-%m-%d").date()
    out: list[str] = []
    cur = s
    while cur <= e:
        out.append(cur.strftime("%Y-%m"))
        # próximo mês
        if cur.month == 12:
            cur = cur.replace(year=cur.year + 1, month=1)
        else:
            cur = cur.replace(month=cur.month + 1)
    return out


def _compound_to_index(returns_pct: list[Optional[float]]) -> list[float]:
    """De retornos mensais (em %) → índice rebase 100 (acumulado)."""
    idx = [100.0]
    for r in returns_pct:
        if r is None:
            # Manter última observação se faltar dado mensal (forward-fill conservador)
            idx.append(idx[-1])
        else:
            idx.append(round(idx[-1] * (1 + r / 100.0), 4))
    return idx


# ═══════════════════════════════════════════════════════════════════════════════
# 2. Atual com Legados — rebase 100 desde 2021-04 a partir de acumulado_pct
# ═══════════════════════════════════════════════════════════════════════════════

def load_atual_series() -> tuple[list[str], list[float]]:
    """Lê retornos_mensais.json (TWR Modified Dietz já calculado) e retorna
    (dates, valores_rebase_100) começando em 2021-04 = 100.0.

    `acumulado_pct[i]` representa o cumulativo (em %) até `dates[i]` desde a base.
    A base é 2021-04 (último valor antes do primeiro retorno mensal: 2021-05).

    Retorno: lista de YYYY-MM (incluindo 2021-04 como mês 0) e valores em base 100.
    """
    raw = json.loads(RETORNOS_PATH.read_text())
    dates_in = raw.get("dates") or []
    acumulado = raw.get("acumulado_pct") or []
    if len(dates_in) != len(acumulado) or not dates_in:
        raise ValueError("retornos_mensais.json sem dates/acumulado_pct válidos")

    # Mês 0 (base): START_MONTH com valor 100.0
    out_dates = [START_MONTH] + list(dates_in)
    out_values = [100.0]
    for v in acumulado:
        if v is None:
            out_values.append(out_values[-1])
        else:
            out_values.append(round(100.0 * (1 + float(v) / 100.0), 4))
    return out_dates, out_values


# ═══════════════════════════════════════════════════════════════════════════════
# 3. IPCA mensal histórico (BCB SGS 433)
# ═══════════════════════════════════════════════════════════════════════════════

def _fetch_bcb_ipca_raw(start_ym: str) -> list[dict]:
    """Fetch direto IPCA mensal da BCB SGS 433 (formato JSON)."""
    import urllib.request as _ur
    s = datetime.strptime(start_ym + "-01", "%Y-%m-%d").date()
    e = date.today()
    url = (
        "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados"
        f"?formato=json&dataInicial={s.strftime('%d/%m/%Y')}"
        f"&dataFinal={e.strftime('%d/%m/%Y')}"
    )
    with _ur.urlopen(url, timeout=15) as resp:
        return json.loads(resp.read().decode())


def fetch_ipca_mensal_history(start_ym: str = START_MONTH) -> dict[str, float]:
    """Retorna dict {YYYY-MM: ipca_mensal_pct} desde start_ym.

    BCB SGS 433 (IPCA mensal). Cache 30d (IPCA não muda retroativamente).
    """
    raw = fetch_with_retry(
        fn=lambda: _fetch_bcb_ipca_raw(start_ym),
        fallback=[],
        retries=3,
        cache_key=f"ipca_433_{start_ym}",
        cache_ttl_h=CACHE_TTL_IPCA_H,
    )
    out: dict[str, float] = {}
    for row in raw or []:
        try:
            dt = datetime.strptime(row["data"].strip(), "%d/%m/%Y").date()
            out[dt.strftime("%Y-%m")] = float(row["valor"])
        except (KeyError, ValueError):
            continue
    return out


# ═══════════════════════════════════════════════════════════════════════════════
# 4. Helpers yfinance — preços mensais → retornos mensais BRL
# ═══════════════════════════════════════════════════════════════════════════════

def _download_monthly_close(ticker: str, start_ym: str) -> pd.Series:
    """Baixa série de fechamento mensal (último dia útil do mês) via yfinance.
    Retorna pd.Series indexada por timestamp do último dia do mês.
    """
    start_date = (datetime.strptime(start_ym + "-01", "%Y-%m-%d").date()
                  - timedelta(days=10)).isoformat()
    raw = fetch_with_retry(
        fn=lambda: yf.download(ticker, start=start_date, auto_adjust=True, progress=False),
        retries=3,
        cache_key=None,  # yfinance tem seu próprio cache; preços recentes mudam
    )
    if raw is None or raw.empty:
        return pd.Series(dtype=float, name=ticker)
    if isinstance(raw.columns, pd.MultiIndex):
        close = raw["Close"].squeeze()
    else:
        close = raw["Close"]
    monthly = close.resample("ME").last()
    monthly.name = ticker
    return monthly


def _monthly_returns_brl(ticker: str, start_ym: str, ptax_monthly: pd.Series,
                         is_brl: bool = False) -> dict[str, float]:
    """Retorna {YYYY-MM: retorno_brl_pct} para um ticker USD-listado convertido a BRL via PTAX.

    Args:
        ticker: símbolo yfinance
        start_ym: 'YYYY-MM' para começar
        ptax_monthly: série mensal PTAX (USD/BRL ask, último dia útil do mês)
        is_brl: True se o ticker já é em BRL (ex HODL11.SA) — ignora ptax
    """
    close = _download_monthly_close(ticker, start_ym)
    if close.empty:
        return {}
    out: dict[str, float] = {}
    # alinhar por YYYY-MM
    by_ym_close: dict[str, float] = {}
    for ts, val in close.items():
        if pd.isna(val):
            continue
        by_ym_close[ts.strftime("%Y-%m")] = float(val)
    by_ym_ptax: dict[str, float] = {}
    for ts, val in ptax_monthly.items():
        if pd.isna(val):
            continue
        by_ym_ptax[ts.strftime("%Y-%m")] = float(val)

    months = sorted(by_ym_close.keys())
    for i in range(1, len(months)):
        prev_m, cur_m = months[i - 1], months[i]
        if cur_m < start_ym:
            continue
        p_prev = by_ym_close[prev_m]
        p_cur = by_ym_close[cur_m]
        if p_prev <= 0:
            continue
        # Retorno em moeda local
        r_local = p_cur / p_prev - 1.0
        if is_brl:
            r_brl = r_local
        else:
            fx_prev = by_ym_ptax.get(prev_m)
            fx_cur = by_ym_ptax.get(cur_m)
            # Sem PTAX em qualquer dos dois meses: skip (evita cliff espúrio
            # em mês corrente sem fechamento PTAX disponível).
            if fx_prev is None or fx_cur is None or fx_prev <= 0:
                continue
            r_fx = fx_cur / fx_prev - 1.0
            r_brl = (1 + r_local) * (1 + r_fx) - 1.0
        out[cur_m] = round(r_brl * 100.0, 6)
    return out


def _ptax_monthly_series(start_ym: str) -> pd.Series:
    """Série mensal PTAX (USD/BRL) desde start_ym. Cache 7 dias.

    Cache armazena lista de [iso_date, value] (JSON-serializable). Reconstroi
    pd.Series ao ler.
    """
    def _fetch():
        from bcb import currency
        s = (datetime.strptime(start_ym + "-01", "%Y-%m-%d").date()
             - timedelta(days=10)).isoformat()
        e = date.today().isoformat()
        df = currency.get(["USD"], start=s, end=e, side="ask")
        # Serializar como lista de pares [iso_date, value] (JSON-friendly)
        return [[ts.isoformat(), float(v)] for ts, v in df["USD"].dropna().items()]

    raw = fetch_with_retry(
        fn=_fetch,
        fallback=None,
        retries=3,
        cache_key=f"ptax_daily_{start_ym}",
        cache_ttl_h=CACHE_TTL_PTAX_H,
    )
    if not raw:
        return pd.Series(dtype=float, name="PTAX")
    # Reconstruir pd.Series a partir de lista [[iso, val], ...]
    idx = pd.to_datetime([row[0] for row in raw])
    vals = [row[1] for row in raw]
    ser = pd.Series(vals, index=idx, name="PTAX")
    monthly = ser.resample("ME").last()
    return monthly


# ═══════════════════════════════════════════════════════════════════════════════
# 5. Construtores de séries de retorno mensal por componente
# ═══════════════════════════════════════════════════════════════════════════════

def _build_swrd_returns_brl(months: list[str], ptax: pd.Series) -> dict[str, float]:
    """Retornos mensais BRL para SWRD (proxy URTH pré-UCITS, SWRD.L pós-UCITS)."""
    proxy = _monthly_returns_brl(PROXY_TICKERS["swrd"], START_MONTH, ptax)
    real = _monthly_returns_brl(TICKER_SWRD, UCITS_FIRST_BUY, ptax)
    out: dict[str, float] = {}
    for m in months:
        if m >= UCITS_FIRST_BUY and m in real:
            out[m] = real[m]
        elif m in proxy:
            out[m] = proxy[m]
    return out


def _build_avgs_returns_brl(months: list[str], ptax: pd.Series) -> dict[str, float]:
    """Retornos mensais BRL para AVGS (blend DFSVX 58% + DISVX 42% pré-UCITS)."""
    a = _monthly_returns_brl(PROXY_TICKERS["avgs_a"], START_MONTH, ptax)
    b = _monthly_returns_brl(PROXY_TICKERS["avgs_b"], START_MONTH, ptax)
    real = _monthly_returns_brl(TICKER_AVGS, UCITS_FIRST_BUY, ptax)
    out: dict[str, float] = {}
    for m in months:
        if m >= UCITS_FIRST_BUY and m in real:
            out[m] = real[m]
            continue
        ra = a.get(m)
        rb = b.get(m)
        if ra is not None and rb is not None:
            out[m] = round(AVGS_DFSVX_W * ra + AVGS_DISVX_W * rb, 6)
        elif ra is not None:
            out[m] = ra  # solo DFSVX se DISVX faltar
    return out


def _build_avem_returns_brl(months: list[str], ptax: pd.Series) -> dict[str, float]:
    """Retornos mensais BRL para AVEM (proxy DFEMX pré-UCITS, AVEM.L pós-UCITS)."""
    proxy = _monthly_returns_brl(PROXY_TICKERS["avem"], START_MONTH, ptax)
    real = _monthly_returns_brl(TICKER_AVEM, UCITS_FIRST_BUY, ptax)
    out: dict[str, float] = {}
    for m in months:
        if m >= UCITS_FIRST_BUY and m in real:
            out[m] = real[m]
        elif m in proxy:
            out[m] = proxy[m]
    return out


def _build_vwra_returns_brl(months: list[str], ptax: pd.Series) -> dict[str, float]:
    """Retornos mensais BRL para VWRA (proxy ACWI antes do início VWRA.L)."""
    real = _monthly_returns_brl(TICKER_VWRA, START_MONTH, ptax)
    proxy = _monthly_returns_brl(PROXY_TICKERS["vwra"], START_MONTH, ptax)
    out: dict[str, float] = {}
    for m in months:
        if m in real:
            out[m] = real[m]
        elif m in proxy:
            out[m] = proxy[m]
    return out


def _build_hodl11_returns_brl(months: list[str], ptax: pd.Series) -> dict[str, float]:
    """Retornos mensais BRL para HODL11.SA. Pré-listing: usa BTC-USD × PTAX como proxy."""
    btc_brl = _monthly_returns_brl(TICKER_BTC, START_MONTH, ptax)
    real = _monthly_returns_brl(TICKER_HODL11, START_MONTH, ptax, is_brl=True)
    out: dict[str, float] = {}
    for m in months:
        if m in real:
            out[m] = real[m]
        elif m in btc_brl:
            out[m] = btc_brl[m]
    return out


def _build_ipca_plus_2040_returns(months: list[str], ipca_history: dict[str, float],
                                  taxa_real_anual: float) -> dict[str, float]:
    """Retornos mensais para IPCA+ 2040 HTM carry: (1 + IPCA_mensal) * (1 + taxa_real_mensal) - 1.

    Args:
        months: lista de YYYY-MM
        ipca_history: dict {YYYY-MM: ipca_mensal_pct}
        taxa_real_anual: ex 0.074 (7.4% real líquido) ou 0.0716 (7.16% bruto)

    Retorno em % (não decimal).
    """
    taxa_mensal = (1 + taxa_real_anual) ** (1 / 12) - 1
    out: dict[str, float] = {}
    for m in months:
        ipca_pct = ipca_history.get(m)
        if ipca_pct is None:
            continue
        r = (1 + ipca_pct / 100.0) * (1 + taxa_mensal) - 1
        out[m] = round(r * 100.0, 6)
    return out


def _build_renda_plus_2065_returns(months: list[str], ipca_history: dict[str, float],
                                   taxa_real_anual: float, fallback_ipca40: dict[str, float]
                                   ) -> dict[str, float]:
    """Renda+ 2065 retornos mensais. Pré-2023-01: fallback IPCA+ 2040.

    Args:
        months: lista de YYYY-MM
        ipca_history: dict IPCA mensal
        taxa_real_anual: taxa Renda+ 2065 (ex 0.0696)
        fallback_ipca40: série IPCA+ 2040 para mêsê pré-launch
    """
    taxa_mensal = (1 + taxa_real_anual) ** (1 / 12) - 1
    out: dict[str, float] = {}
    for m in months:
        if m < RENDA_PLUS_LAUNCH:
            # proxy IPCA+ 2040
            v = fallback_ipca40.get(m)
            if v is not None:
                out[m] = v
            continue
        ipca_pct = ipca_history.get(m)
        if ipca_pct is None:
            continue
        r = (1 + ipca_pct / 100.0) * (1 + taxa_mensal) - 1
        out[m] = round(r * 100.0, 6)
    return out


# ═══════════════════════════════════════════════════════════════════════════════
# 6. Construtores de portfolio (índice rebase 100)
# ═══════════════════════════════════════════════════════════════════════════════

def build_target_alocacao_total(
    months: list[str],
    swrd_ret: dict[str, float],
    avgs_ret: dict[str, float],
    avem_ret: dict[str, float],
    ipca_ret: dict[str, float],
    hodl_ret: dict[str, float],
    renda_ret: dict[str, float],
    weights: dict,
) -> list[float]:
    """Target alocação total: 79% (50% SWRD + 30% AVGS + 20% AVEM) +
    15% IPCA+ + 3% HODL11 + 3% Renda+. Retorna índice rebase 100.

    months[0] é o mês 0 (base 100); months[1+] tem retornos mensais.
    """
    eq_pct = weights["equity_pct"]
    eq_swrd = weights["equity_weight_swrd"]
    eq_avgs = weights["equity_weight_avgs"]
    eq_avem = weights["equity_weight_avem"]
    ipca_w = weights["ipca_longo_pct"]
    hodl_w = weights["cripto_pct"]
    renda_w = weights["renda_plus_pct"]

    rets: list[Optional[float]] = []
    for m in months[1:]:
        rs = swrd_ret.get(m)
        ra = avgs_ret.get(m)
        re_ = avem_ret.get(m)
        ri = ipca_ret.get(m)
        rh = hodl_ret.get(m)
        rr = renda_ret.get(m)
        if any(x is None for x in (rs, ra, re_, ri, rh, rr)):
            rets.append(None)
            continue
        # Equity blend
        r_eq = eq_swrd * rs + eq_avgs * ra + eq_avem * re_
        # Total
        r = (eq_pct * r_eq + ipca_w * ri + hodl_w * rh + renda_w * rr)
        rets.append(round(r, 6))
    return _compound_to_index(rets)


def build_shadow_a(months: list[str], vwra_ret: dict[str, float]) -> list[float]:
    """Shadow A: 100% VWRA (BRL)."""
    rets = [vwra_ret.get(m) for m in months[1:]]
    return _compound_to_index(rets)


def build_shadow_b(months: list[str], ipca_ret: dict[str, float]) -> list[float]:
    """Shadow B: 100% IPCA+ 2040."""
    rets = [ipca_ret.get(m) for m in months[1:]]
    return _compound_to_index(rets)


def build_shadow_c(
    months: list[str],
    vwra_ret: dict[str, float],
    ipca_ret: dict[str, float],
    hodl_ret: dict[str, float],
    renda_ret: dict[str, float],
    weights: dict,
) -> list[float]:
    """Shadow C: 79% VWRA + 15% IPCA+ + 3% HODL11 + 3% Renda+ (benchmark justo)."""
    eq_pct = weights["equity_pct"]
    ipca_w = weights["ipca_longo_pct"]
    hodl_w = weights["cripto_pct"]
    renda_w = weights["renda_plus_pct"]
    rets: list[Optional[float]] = []
    for m in months[1:]:
        rv = vwra_ret.get(m)
        ri = ipca_ret.get(m)
        rh = hodl_ret.get(m)
        rr = renda_ret.get(m)
        if any(x is None for x in (rv, ri, rh, rr)):
            rets.append(None)
            continue
        r = eq_pct * rv + ipca_w * ri + hodl_w * rh + renda_w * rr
        rets.append(round(r, 6))
    return _compound_to_index(rets)


# ═══════════════════════════════════════════════════════════════════════════════
# 7. Main
# ═══════════════════════════════════════════════════════════════════════════════

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--rebuild", action="store_true",
                    help="Força regeneração mesmo com versão igual.")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    _, needs_rebuild = load_or_init(OUT_PATH, METODOLOGIA_VERSION,
                                    rebuild_flag=args.rebuild)
    if not needs_rebuild and not args.rebuild:
        # Período fechado já registrado e versão igual: usar artefato existente.
        # Para alocação histórica, sempre regenerar é OK (idempotente). Aqui mantemos
        # o contrato P3: se versão bate, não recomputa (rápido).
        print(f"  ⊘ {OUT_PATH.name}: versão {METODOLOGIA_VERSION} já presente — pulando")
        return 0

    print(f"▶ reconstruct_allocation_series.py (version={METODOLOGIA_VERSION})")
    print(f"  Output: {OUT_PATH.relative_to(ROOT)}")

    # ── Atual com Legados (fonte canônica: retornos_mensais.json) ────────────
    atual_dates, atual_values = load_atual_series()
    print(f"  ✓ Atual com Legados: {len(atual_dates)} meses ({atual_dates[0]} → {atual_dates[-1]})")

    # Lista canônica de meses (a partir de Atual). Todas as outras séries devem
    # alinhar nesse índice — preencher faltas com forward-fill.
    months = atual_dates

    # ── Carteira params (pesos canônicos) ───────────────────────────────────
    weights = json.loads(CARTEIRA_PARAMS_PATH.read_text())
    target_alloc = weights.get("target_alocacao_total")
    if not target_alloc:
        # Fallback: derivar do top-level params (compat retroativa)
        target_alloc = {
            "equity": weights["equity_pct"],
            "ipca_plus_2040": weights["ipca_longo_pct"],
            "hodl11": weights["cripto_pct"],
            "renda_plus_2065": weights["renda_plus_pct"],
        }
    # weights dict simplificado para os builders
    weights_simple = {
        "equity_pct": weights["equity_pct"],
        "equity_weight_swrd": weights["equity_weight_swrd"],
        "equity_weight_avgs": weights["equity_weight_avgs"],
        "equity_weight_avem": weights["equity_weight_avem"],
        "ipca_longo_pct": weights["ipca_longo_pct"],
        "cripto_pct": weights["cripto_pct"],
        "renda_plus_pct": weights["renda_plus_pct"],
    }

    # ── PTAX mensal e IPCA mensal (fontes externas) ─────────────────────────
    print("  ▶ Buscando PTAX mensal (BCB)...")
    ptax = _ptax_monthly_series(START_MONTH)
    if ptax.empty:
        print("  ❌ PTAX indisponível — abortando")
        return 1
    print(f"    ✓ PTAX: {len(ptax)} meses")

    print("  ▶ Buscando IPCA mensal (BCB SGS 433)...")
    ipca_hist = fetch_ipca_mensal_history(START_MONTH)
    if not ipca_hist:
        print("  ❌ IPCA indisponível — abortando")
        return 1
    print(f"    ✓ IPCA: {len(ipca_hist)} meses")

    # ── Retornos mensais por componente ─────────────────────────────────────
    print("  ▶ Equity components (yfinance)...")
    swrd_ret = _build_swrd_returns_brl(months, ptax)
    avgs_ret = _build_avgs_returns_brl(months, ptax)
    avem_ret = _build_avem_returns_brl(months, ptax)
    vwra_ret = _build_vwra_returns_brl(months, ptax)
    print(f"    SWRD: {len(swrd_ret)} | AVGS: {len(avgs_ret)} | AVEM: {len(avem_ret)} | VWRA: {len(vwra_ret)}")

    print("  ▶ HODL11 / BTC...")
    hodl_ret = _build_hodl11_returns_brl(months, ptax)
    print(f"    HODL11: {len(hodl_ret)}")

    # IPCA+ 2040 (taxa real anual = 7.4% bruto - custódia 0.2%)
    ipca40_taxa = float(weights.get("ipca_plus_taxa_anual", 0.074)) - float(weights.get("ipca_plus_custodia", 0.002))
    ipca_plus_ret = _build_ipca_plus_2040_returns(months, ipca_hist, ipca40_taxa)
    # Renda+ 2065 (taxa default 6.96% ao ano)
    renda_taxa = float(weights.get("renda_plus_taxa_default", 6.96)) / 100.0
    renda_ret = _build_renda_plus_2065_returns(months, ipca_hist, renda_taxa, ipca_plus_ret)
    print(f"    IPCA+ 2040: {len(ipca_plus_ret)} | Renda+ 2065: {len(renda_ret)}")

    # ── Construir séries (rebase 100) ───────────────────────────────────────
    target = build_target_alocacao_total(
        months, swrd_ret, avgs_ret, avem_ret,
        ipca_plus_ret, hodl_ret, renda_ret,
        weights_simple,
    )
    shadow_a = build_shadow_a(months, vwra_ret)
    shadow_b = build_shadow_b(months, ipca_plus_ret)
    shadow_c = build_shadow_c(months, vwra_ret, ipca_plus_ret, hodl_ret, renda_ret, weights_simple)

    # Sanity: todas têm mesmo len
    assert len(target) == len(shadow_a) == len(shadow_b) == len(shadow_c) == len(atual_values), \
        f"len mismatch: target={len(target)} a={len(shadow_a)} b={len(shadow_b)} c={len(shadow_c)} atual={len(atual_values)}"

    # ── Persistir ───────────────────────────────────────────────────────────
    payload = {
        "dates": months,
        "atual_com_legados": atual_values,
        "target_alocacao_total": target,
        "shadow_a": shadow_a,
        "shadow_b": shadow_b,
        "shadow_c": shadow_c,
        "weights": target_alloc,
        "_provenance": {
            "atual_com_legados": "TWR Modified Dietz mensal (retornos_mensais.json:acumulado_pct) "
                                 "rebase 100 a partir de 2021-04. Inclui COE+empréstimo XP net e "
                                 "IPCA+ 2029 reserva (patrimônio real).",
            "target_pre_2024_12": "Proxy acadêmico (Regime 5/6): URTH para SWRD, "
                                  "DFSVX 58% + DISVX 42% para AVGS, DFEMX para AVEM. "
                                  "Frontend marca tracejado fino até 2024-12 (1ª compra UCITS).",
            "renda_plus_pre_2023": "Proxy IPCA+ 2040 (Renda+ 2065 lançado em 2023-01).",
            "ipca_plus_2040_taxa": (
                f"taxa real líquida = {ipca40_taxa*100:.2f}% a.a. "
                f"(bruto {weights.get('ipca_plus_taxa_anual', 0.074)*100:.2f}% - "
                f"custódia {weights.get('ipca_plus_custodia', 0.002)*100:.2f}%)"
            ),
            "renda_plus_2065_taxa": (
                f"taxa real {weights.get('renda_plus_taxa_default', 6.96):.2f}% a.a. — "
                "snapshot Tesouro Renda+ (carteira_params.json)"
            ),
            "hodl11_pre_listing": "Proxy BTC-USD × PTAX para meses pré-listing HODL11.SA.",
            "fontes": [
                "BCB SGS 433 (IPCA mensal)",
                "BCB PTAX ask (USD/BRL)",
                "yfinance (SWRD.L/AVGS.L/AVEM.L/VWRA.L/URTH/DFSVX/DISVX/DFEMX/HODL11.SA/BTC-USD)",
                "dados/retornos_mensais.json (Atual com Legados — TWR Modified Dietz)",
                "dados/carteira_params.json (pesos canônicos)",
            ],
        },
    }
    last_ym = months[-1]
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    write_with_meta(
        OUT_PATH,
        payload,
        version=METODOLOGIA_VERSION,
        last_period=last_ym,
        rebuild_reason="cli-flag" if args.rebuild else "missing-or-version-mismatch",
    )
    print(f"\n✅ {OUT_PATH.relative_to(ROOT)}")
    print(f"   {len(months)} meses ({months[0]} → {months[-1]})")
    print(f"   Atual={atual_values[-1]:.2f} Target={target[-1]:.2f} "
          f"A={shadow_a[-1]:.2f} B={shadow_b[-1]:.2f} C={shadow_c[-1]:.2f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
