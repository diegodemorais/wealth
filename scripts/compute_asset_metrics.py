#!/usr/bin/env python3
"""
compute_asset_metrics.py — Enriquece data.posicoes[ticker] com metricas individuais.

Spec (HD-portfolio-buckets-view, Caminho A — extensao da HoldingsTable):
  Para cada ticker em data.posicoes (e tambem AVEM, mesmo sem posicao), calcula:
    - twr_ytd_pct: float | None  (TWR yfinance YTD; None se serie < 90d)
    - max_dd_itd_pct: float | None  (Max drawdown ITD desde abr/2021)
    - ter_all_in_pct: float  (TER+spread+swap+FX, hardcode em TER_ALL_IN)
    - series_short: bool  (True se serie disponivel < 90d)

Output: dict {ticker_str: {twr_ytd_pct, max_dd_itd_pct, ter_all_in_pct, series_short}}.
generate_data.py faz merge no dict posicoes (e adiciona AVEM se faltar).

NAO emite mais bloco bucket_assets[]; HoldingsTable consome posicoes[ticker]
diretamente, com agrupamento por bucket no frontend.

Memoria learning_avem_all_in_cost.md: TER all-in real verificado 2026-05-01.
"""

import json
import sys
from pathlib import Path
from typing import Dict, Optional

import pandas as pd

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from config import TICKERS_YF  # noqa: E402

# --- TER ALL-IN (verificado 2026-05-01, learning_avem_all_in_cost.md) ----------
# Inclui TER + spread + swap + FX implicit cost. Calcado em estudo Diego Mai/2026.
TER_ALL_IN: Dict[str, float] = {
    "SWRD":           0.38,
    "AVGS":           0.71,
    "AVEM":           1.18,
    "AVDV":           0.36,
    "AVUV":           0.25,
    "USSC":           0.30,
    "AVES":           0.36,
    "EIMI":           0.18,
    "DGS":            0.58,
    "IWVL":           0.30,
    "JPGL":           0.25,
    "HODL11":         0.20,   # 0.40 pos-ago/2026 (banda Bitcoin)
    "TD_IPCA_2040":   0.10,
    "TD_IPCA_2050":   0.10,
    "RENDA_PLUS_2065": 0.10,
}

# Tickers historicos (legacy/transitorios) — uso apenas informacional aqui.
LEGACY_TICKERS = {"AVDV", "AVUV", "USSC", "EIMI", "AVES", "DGS", "IWVL", "JPGL"}

# Threshold para "serie curta": precisa <90 dias uteis (~63 trading days)
SHORT_SERIES_DAYS = 63

YTD_START = pd.Timestamp("2026-01-01")


# ---------------------------------------------------------------------------
# Yfinance fetch (com fallback silencioso)
# ---------------------------------------------------------------------------

def _fetch_history(ticker_yf: str) -> pd.DataFrame:
    """Baixa serie historica do yfinance (period=max). Retorna df vazio em erro."""
    try:
        import yfinance as yf
        df = yf.download(ticker_yf, period="max", progress=False, auto_adjust=False)
        if df is None or df.empty:
            return pd.DataFrame()
        if isinstance(df, pd.Series):
            df = df.to_frame("Close")
        # Normalizar coluna Close (multi-index pode aparecer)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
        if "Close" not in df.columns:
            return pd.DataFrame()
        return df[["Close"]].dropna()
    except Exception as e:
        print(f"[compute_asset_metrics] yfinance falhou para {ticker_yf}: {e}",
              file=sys.stderr)
        return pd.DataFrame()


def _compute_twr_ytd(df: pd.DataFrame) -> Optional[float]:
    """TWR YTD pct (price-only, sem fluxos). None se YTD < 10 obs."""
    if df.empty:
        return None
    ytd = df[df.index >= YTD_START]
    if len(ytd) < 10:
        return None
    p0 = float(ytd.iloc[0]["Close"])
    p1 = float(ytd.iloc[-1]["Close"])
    if p0 <= 0:
        return None
    return (p1 / p0 - 1.0) * 100.0


def _compute_max_dd_itd(df: pd.DataFrame) -> Optional[float]:
    """Max drawdown ITD pct (negativo). None se serie < SHORT_SERIES_DAYS."""
    if df.empty or len(df) < SHORT_SERIES_DAYS:
        return None
    closes = df["Close"].astype(float)
    peak = closes.expanding().max()
    dd = (closes - peak) / peak
    mn = dd.min()
    if pd.isna(mn):
        return None
    return float(mn) * 100.0


def _series_is_short(df: pd.DataFrame) -> bool:
    return df.empty or len(df) < SHORT_SERIES_DAYS


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def compute_metrics_for_tickers(tickers: list) -> Dict[str, dict]:
    """Para cada ticker, retorna dict com 4 campos. Sempre inclui AVEM.

    Tickers sem mapping em TICKERS_YF retornam metricas None mas com TER all-in.
    """
    out: Dict[str, dict] = {}
    seen = set()
    for tk in list(tickers) + ["AVEM"]:  # garante AVEM
        if tk in seen:
            continue
        seen.add(tk)

        ter = TER_ALL_IN.get(tk, 0.0)
        ticker_yf = TICKERS_YF.get(tk)

        if not ticker_yf:
            out[tk] = {
                "twr_ytd_pct":    None,
                "max_dd_itd_pct": None,
                "ter_all_in_pct": ter,
                "series_short":   True,
            }
            continue

        df = _fetch_history(ticker_yf)
        out[tk] = {
            "twr_ytd_pct":    None if _series_is_short(df) else _compute_twr_ytd(df),
            "max_dd_itd_pct": None if _series_is_short(df) else _compute_max_dd_itd(df),
            "ter_all_in_pct": ter,
            "series_short":   _series_is_short(df),
        }
    return out


def enrich_posicoes(data: dict) -> dict:
    """Mutates data.posicoes in place: adds 4 fields per ticker, ensures AVEM exists.

    Returns the mutated `data` for convenience.
    """
    posicoes: dict = data.setdefault("posicoes", {})
    tickers_atuais = list(posicoes.keys())
    metrics = compute_metrics_for_tickers(tickers_atuais)

    for tk, m in metrics.items():
        pos = posicoes.get(tk)
        if pos is None:
            # Caso AVEM (alvo nao iniciado): cria entrada vazia.
            # qty/avg_cost/price = 0 (nao null) para nao quebrar testes
            # data-validation que exigem >=0 em campos numericos.
            posicoes[tk] = {
                "qty":            0,
                "avg_cost":       0,
                "status":         "alvo_nao_iniciado",
                "price":          0,
                "bucket":         tk,         # ticker == bucket nominal (AVEM)
                "ter":            0.35,       # TER bruto AVEM UCITS (factsheet)
                "ter_all_in_pct": m["ter_all_in_pct"],
                "twr_ytd_pct":    m["twr_ytd_pct"],
                "max_dd_itd_pct": m["max_dd_itd_pct"],
                "series_short":   m["series_short"],
            }
        else:
            pos["ter_all_in_pct"] = m["ter_all_in_pct"]
            pos["twr_ytd_pct"]    = m["twr_ytd_pct"]
            pos["max_dd_itd_pct"] = m["max_dd_itd_pct"]
            pos["series_short"]   = m["series_short"]

    return data


if __name__ == "__main__":
    # Standalone debug: enriquece data.json existente (sem reescrever)
    target = ROOT / "react-app" / "public" / "data.json"
    if not target.exists():
        target = ROOT / "dados" / "data.json"
    data = json.loads(target.read_text())
    enrich_posicoes(data)
    print(json.dumps(data["posicoes"], indent=2, default=str))
