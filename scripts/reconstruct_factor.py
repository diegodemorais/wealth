#!/usr/bin/env python3
"""
reconstruct_factor.py — Calcula factor loadings (FF5+MOM) e rolling AVGS vs SWRD.

Computa:
  - factor_rolling:  rolling 12m return diff AVGS.L - SWRD.L
  - factor_signal:   YTD + since-launch excess return
  - factor_loadings: regressão OLS FF5+MOM por ETF da carteira

Output: dados/factor_snapshot.json

Fallback: se yfinance/Ken French falha, tenta preservar snapshot anterior.

Uso:
    python3 scripts/reconstruct_factor.py
"""

import io
import json
import math
import sys
import urllib.request
import zipfile
from datetime import date, datetime
from pathlib import Path

# Add scripts dir to path for imports
sys.path.insert(0, str(Path(__file__).parent))
from config import TICKER_SWRD_LSE, TICKER_VWRA_LSE, TICKER_AVGS_LSE, COLUMN_CLOSE, DATE_FORMAT_YM, FACTOR_MKT_RF, FACTOR_SMB, FACTOR_HML, FACTOR_RMW, FACTOR_CMA, FACTOR_MOM, FACTOR_RF

ROOT = Path(__file__).parent.parent
OUT  = ROOT / "dados" / "factor_snapshot.json"

FACTOR_UNDERPERF_THRESHOLD = -5  # pp — importado via config quando disponível
AVGS_LAUNCH_DATE = date(2024, 10, 14)
AVGS_LAUNCH_STR  = "2024-10-14"


def _load_cache() -> dict:
    """Lê snapshot anterior se existir."""
    try:
        return json.loads(OUT.read_text())
    except Exception:
        return {}


def _download_ff(url: str):
    """Baixa e parseia um arquivo CSV zip de Fama-French."""
    import pandas as pd
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    resp = urllib.request.urlopen(req, timeout=30)
    z = zipfile.ZipFile(io.BytesIO(resp.read()))
    csv_name = [n for n in z.namelist() if n.lower().endswith(".csv")][0]
    raw = z.read(csv_name).decode("utf-8")

    lines = raw.split("\n")
    data_lines, started = [], False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if started:
                break
            continue
        parts = stripped.split(",")
        if parts[0].strip().isdigit() and len(parts[0].strip()) == 6:
            started = True
            data_lines.append(stripped)
        elif started:
            break

    header_line = None
    for line in lines:
        stripped = line.strip()
        if FACTOR_MKT_RF in stripped or "Mkt_RF" in stripped:
            header_line = stripped
            break

    if header_line:
        cols = [c.strip() for c in header_line.split(",")[1:]]
    else:
        n_cols = len(data_lines[0].split(",")) - 1
        if n_cols == 6:
            cols = [FACTOR_MKT_RF, FACTOR_SMB, FACTOR_HML, FACTOR_RMW, FACTOR_CMA, "RF"]
        elif n_cols == 2:
            cols = ["WML", "RF"]
        else:
            cols = [f"F{i}" for i in range(n_cols)]

    df = pd.DataFrame([l.split(",") for l in data_lines], columns=["Date"] + cols)
    df["Date"] = pd.to_datetime(df["Date"].str.strip(), format="%Y%m")
    for c in cols:
        df[c] = pd.to_numeric(df[c].str.strip(), errors="coerce") / 100.0
    return df.set_index("Date")


def compute_factor_rolling(cache: dict) -> dict:
    """Rolling 12m return diff AVGS.L - SWRD.L."""
    THRESHOLD = FACTOR_UNDERPERF_THRESHOLD
    print("  ▶ factor rolling 12m AVGS vs SWRD ...")
    try:
        import yfinance as yf
        import pandas as pd

        tickers = [TICKER_AVGS_LSE, TICKER_SWRD_LSE]
        data = yf.download(tickers, start="2019-01-01", progress=False, auto_adjust=True)

        if isinstance(data.columns, pd.MultiIndex):
            close = data[COLUMN_CLOSE]
        else:
            close = data[[COLUMN_CLOSE]]

        monthly = close.resample("ME").last().dropna(how="all")

        dates, diffs = [], []
        for i in range(12, len(monthly)):
            row    = monthly.iloc[i]
            row_12 = monthly.iloc[i - 12]

            avgs_now = row.get(TICKER_AVGS_LSE)
            avgs_ago = row_12.get(TICKER_AVGS_LSE)
            swrd_now = row.get(TICKER_SWRD_LSE)
            swrd_ago = row_12.get(TICKER_SWRD_LSE)

            if any(v is None or (isinstance(v, float) and math.isnan(v))
                   for v in [avgs_now, avgs_ago, swrd_now, swrd_ago]):
                continue
            if avgs_ago == 0 or swrd_ago == 0:
                continue

            ret_avgs = (avgs_now / avgs_ago - 1) * 100
            ret_swrd = (swrd_now / swrd_ago - 1) * 100
            diffs.append(round(ret_avgs - ret_swrd, 2))
            dates.append(monthly.index[i].strftime(DATE_FORMAT_YM))

        result = {"dates": dates, "avgs_vs_swrd_12m": diffs, "threshold": THRESHOLD}
        print(f"    → {len(dates)} pts, latest: {diffs[-1] if diffs else 'N/A'}pp")
        return result

    except Exception as e:
        print(f"  ⚠️ factor rolling: {e} — usando cache")
        return cache.get("factor_rolling", {"dates": [], "avgs_vs_swrd_12m": [], "threshold": THRESHOLD})


def compute_factor_signal(cache: dict) -> dict | None:
    """YTD + since-launch excess return AVGS.L vs SWRD.L."""
    print("  ▶ factor signal (YTD + since launch) ...")
    try:
        import yfinance as yf

        today = date.today()
        ytd_start = f"{today.year}-01-01"

        tickers = yf.download(
            [TICKER_SWRD_LSE, TICKER_AVGS_LSE], start=AVGS_LAUNCH_STR,
            auto_adjust=True, progress=False
        )[COLUMN_CLOSE]

        ytd              = tickers[tickers.index >= ytd_start]
        swrd_ytd         = float((ytd[TICKER_SWRD_LSE].iloc[-1] / ytd[TICKER_SWRD_LSE].iloc[0] - 1) * 100)
        avgs_ytd         = float((ytd[TICKER_AVGS_LSE].iloc[-1] / ytd[TICKER_AVGS_LSE].iloc[0] - 1) * 100)
        swrd_launch      = float((tickers[TICKER_SWRD_LSE].iloc[-1] / tickers[TICKER_SWRD_LSE].iloc[0] - 1) * 100)
        avgs_launch_ret  = float((tickers[TICKER_AVGS_LSE].iloc[-1] / tickers[TICKER_AVGS_LSE].iloc[0] - 1) * 100)
        meses = (today - AVGS_LAUNCH_DATE).days / 30.44

        result = {
            "swrd_ytd_pct":           round(swrd_ytd, 2),
            "avgs_ytd_pct":           round(avgs_ytd, 2),
            "excess_ytd_pp":          round(avgs_ytd - swrd_ytd, 2),
            "swrd_since_launch_pct":  round(swrd_launch, 2),
            "avgs_since_launch_pct":  round(avgs_launch_ret, 2),
            "excess_since_launch_pp": round(avgs_launch_ret - swrd_launch, 2),
            "avgs_launch_date":       AVGS_LAUNCH_STR,
            "meses_desde_launch":     round(meses, 1),
            "fonte":  "yfinance · SWRD.L + AVGS.L · preços diários",
            "updated": str(today),
        }
        print(f"    → AVGS YTD {avgs_ytd:+.1f}% vs SWRD YTD {swrd_ytd:+.1f}% (excess: {avgs_ytd - swrd_ytd:+.1f}pp)")
        return result

    except Exception as e:
        print(f"  ⚠️ factor_signal: {e} — usando cache")
        return cache.get("factor_signal")


def compute_factor_loadings(cache: dict) -> dict:
    """FF5+MOM OLS regression por ETF da carteira."""
    print("  ▶ factor loadings (FF5 + MOM) ...")
    try:
        import pandas as pd
        import yfinance as yf
        import statsmodels.api as sm

        ff5 = _download_ff("https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/Developed_5_Factors_CSV.zip")
        mom = _download_ff("https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/Developed_Mom_Factor_CSV.zip")
        if "WML" in mom.columns:
            mom = mom.rename(columns={"WML": FACTOR_MOM})
        elif len(mom.columns) >= 1 and mom.columns[0] != FACTOR_MOM:
            mom = mom.rename(columns={mom.columns[0]: FACTOR_MOM})
        factors = ff5.join(mom[[FACTOR_MOM]], how="inner")

        etf_map = {
            TICKER_SWRD_LSE: "SWRD", TICKER_AVGS_LSE: "AVGS", "AVEM.L": "AVEM",
            "EIMI.L": "EIMI", "AVUV": "AVUV", "AVDV": "AVDV",
            "DGS": "DGS", "USSC.L": "USSC", "IWVL.L": "IWVL",
        }
        price_data = yf.download(list(etf_map.keys()), start="2019-07-01", progress=False, auto_adjust=True)

        prices = {}
        if isinstance(price_data.columns, pd.MultiIndex):
            close = price_data[COLUMN_CLOSE]
            for yf_tk, label in etf_map.items():
                if yf_tk in close.columns:
                    series = close[yf_tk].dropna()
                    if len(series) > 24:
                        prices[label] = series
        else:
            for yf_tk, label in etf_map.items():
                if "Close" in price_data.columns:
                    prices[label] = price_data[COLUMN_CLOSE].dropna()

        factor_cols = [f for f in [FACTOR_MKT_RF, FACTOR_SMB, FACTOR_HML, FACTOR_RMW, FACTOR_CMA, FACTOR_MOM] if f in factors.columns]
        loadings = {}

        for label, price_series in prices.items():
            try:
                monthly = price_series.resample("ME").last()
                ret = monthly.pct_change().dropna()
                ret.index = ret.index.to_period("M").to_timestamp()

                merged = pd.DataFrame({"ret": ret}).join(factors, how="inner")
                if len(merged) < 18:
                    continue

                merged["excess"] = merged["ret"] - merged["RF"]
                y = merged["excess"]
                X = merged[factor_cols]
                X_const = sm.add_constant(X)
                model = sm.OLS(y, X_const).fit(cov_type="HC1")

                loadings[label] = {
                    "alpha":    round(float(model.params["const"] * 12), 5),
                    "mkt_rf":   round(float(model.params.get(FACTOR_MKT_RF, 0)), 4),
                    "smb":      round(float(model.params.get(FACTOR_SMB, 0)), 4),
                    "hml":      round(float(model.params.get(FACTOR_HML, 0)), 4),
                    "rmw":      round(float(model.params.get(FACTOR_RMW, 0)), 4),
                    "cma":      round(float(model.params.get(FACTOR_CMA, 0)), 4),
                    "mom":      round(float(model.params.get(FACTOR_MOM, 0)), 4),
                    "r2":       round(float(model.rsquared), 4),
                    "n_months": int(model.nobs),
                    "t_stats": {
                        "alpha":  round(float(model.tvalues["const"]), 3),
                        "mkt_rf": round(float(model.tvalues.get(FACTOR_MKT_RF, 0)), 3),
                        "smb":    round(float(model.tvalues.get(FACTOR_SMB, 0)), 3),
                        "hml":    round(float(model.tvalues.get(FACTOR_HML, 0)), 3),
                        "rmw":    round(float(model.tvalues.get(FACTOR_RMW, 0)), 3),
                        "cma":    round(float(model.tvalues.get(FACTOR_CMA, 0)), 3),
                        "mom":    round(float(model.tvalues.get(FACTOR_MOM, 0)), 3),
                    },
                }
            except Exception as e:
                print(f"    ⚠️ {label}: {e}")
                continue

        print(f"    → {len(loadings)} ETFs: {list(loadings.keys())}")
        return loadings

    except Exception as e:
        print(f"  ⚠️ factor loadings: {e} — usando cache")
        return cache.get("factor_loadings", {})


def main(window_id: str = None):
    print("reconstruct_factor.py — factor snapshot")
    cache = _load_cache()

    factor_rolling  = compute_factor_rolling(cache)
    factor_signal   = compute_factor_signal(cache)
    factor_loadings = compute_factor_loadings(cache)

    snapshot = {
        "_generated": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "_window_id": window_id,  # DATA_PIPELINE_CENTRALIZATION: Invariant 1
        "factor_rolling":  factor_rolling,
        "factor_signal":   factor_signal,
        "factor_loadings": factor_loadings,
    }

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(snapshot, indent=2))
    print(f"\n✅ {OUT.relative_to(ROOT)}")
    print(f"   rolling: {len(factor_rolling.get('dates', []))} pts")
    print(f"   loadings: {len(factor_loadings)} ETFs")
    sig = factor_signal or {}
    print(f"   signal: AVGS YTD {sig.get('avgs_ytd_pct', 'N/A')}% | excess {sig.get('excess_ytd_pp', 'N/A')}pp")


if __name__ == "__main__":
    import argparse
    _ap = argparse.ArgumentParser()
    _ap.add_argument("--window-id", default=None, help="Pipeline run window ID for synchronization")
    _args = _ap.parse_args()
    main(window_id=_args.window_id)
