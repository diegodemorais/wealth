#!/usr/bin/env python3
"""
market_data.py — CLI unificado para dados de mercado e macro.

REGRA: Este script é o ponto de entrada obrigatório para dados financeiros.
Agentes NÃO devem usar WebSearch para dados que este script provê.

Uso:
    python3 scripts/market_data.py --macro-br        # Selic, IPCA, Focus, PTAX
    python3 scripts/market_data.py --macro-us        # Fed Funds, Treasury, VIX, CDS
    python3 scripts/market_data.py --tesouro         # Taxas IPCA+, Renda+, NTN-B ANBIMA
    python3 scripts/market_data.py --factors          # FF5 + AQR últimos 12 meses
    python3 scripts/market_data.py --etfs             # Preços SWRD, AVGS, AVEM, HODL11
    python3 scripts/market_data.py --all              # Tudo acima

Output: JSON para stdout (composável com jq e pipes).

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import argparse
import json
import os
import sys
from datetime import date, timedelta
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

sys.path.insert(0, str(Path(__file__).parent))

# fetch_with_retry — retry exponencial + cache (XX-system-audit Item 2)
try:
    from fetch_utils import fetch_with_retry as _fetch_with_retry
except ImportError:
    def _fetch_with_retry(fn, fallback=None, retries=3, cache_key=None, cache_ttl_h=4):
        try:
            return fn()
        except Exception:
            if fallback is not None:
                return fallback
            raise


def macro_br() -> dict:
    """Dados macro Brasil via python-bcb (fonte canônica)."""
    from fx_utils import get_ptax, get_selic_atual, get_ipca_12m
    from bcb import Expectativas

    ptax = get_ptax()
    selic = get_selic_atual()
    ipca_12m = get_ipca_12m()

    # Focus expectations
    focus = {}
    try:
        em = Expectativas()
        ep = em.get_endpoint("ExpectativasMercadoTop5Mensal")
        today = date.today().isoformat()
        # Selic fim 2026
        selic_focus = (
            ep.filter(ep.Indicador == "Selic", ep.DataReferencia == "12/2026")
            .filter(ep.Data >= (date.today() - timedelta(days=7)).isoformat())
            .select(ep.Mediana, ep.Data)
            .order_by("-Data")
            .limit(1)
            .collect()
        )
        if selic_focus:
            focus["selic_fim_2026"] = selic_focus[0].get("Mediana")

        # IPCA 2026
        ipca_focus = (
            ep.filter(ep.Indicador == "IPCA", ep.DataReferencia == "2026")
            .filter(ep.Data >= (date.today() - timedelta(days=7)).isoformat())
            .select(ep.Mediana, ep.Data)
            .order_by("-Data")
            .limit(1)
            .collect()
        )
        if ipca_focus:
            focus["ipca_2026"] = ipca_focus[0].get("Mediana")
    except Exception as e:
        focus["error"] = str(e)

    return {
        "ptax_brl_usd": round(ptax, 4),
        "selic_meta": selic,
        "ipca_12m": ipca_12m,
        "focus": focus,
        "date": date.today().isoformat(),
        "_source": "python-bcb (BCB API séries 1, 432, 13522 + Expectativas)",
    }


def macro_us() -> dict:
    """Dados macro US via fredapi + CDS Brasil via investiny."""
    result = {}

    # FRED data
    try:
        from fredapi import Fred
        api_key = os.getenv("FRED_API_KEY")
        if not api_key:
            return {"error": "FRED_API_KEY não configurada no .env"}

        fred = Fred(api_key=api_key)
        series = {
            "fed_funds": "DFF",
            "treasury_2y": "DGS2",
            "treasury_10y": "DGS10",
            "treasury_30y": "DGS30",
            "tips_10y_real": "DFII10",
            "vix": "VIXCLS",
        }
        for name, sid in series.items():
            try:
                s = fred.get_series(sid, observation_start=(date.today() - timedelta(days=10)).isoformat())
                val = s.dropna().iloc[-1] if len(s.dropna()) > 0 else None
                result[name] = round(float(val), 4) if val is not None else None
            except Exception:
                result[name] = None
    except ImportError:
        result["error_fred"] = "fredapi não instalado"

    # CDS Brazil 5Y via investiny (Investing.com)
    try:
        from investiny import historical_data
        today = date.today()
        from_dt = (today - timedelta(days=30)).strftime("%m/%d/%Y")
        to_dt = today.strftime("%m/%d/%Y")
        data = historical_data(investing_id="1116031", from_date=from_dt, to_date=to_dt)
        if data and "close" in data and data["close"]:
            result["cds_brazil_5y_bps"] = round(data["close"][-1], 1)
            result["cds_brazil_5y_date"] = data["date"][-1] if "date" in data else None
            result["cds_brazil_5y_gatilho"] = 400  # threshold from gatilhos.md
            result["cds_brazil_5y_status"] = "OK" if data["close"][-1] < 400 else "ALERTA"
        else:
            result["cds_brazil_5y_bps"] = None
    except Exception as e:
        result["cds_brazil_5y_bps"] = None
        result["cds_brazil_5y_error"] = str(e)[:60]

    result["date"] = date.today().isoformat()
    result["_source"] = "fredapi (FRED) + investiny (CDS Brazil)"
    return result


def tesouro() -> dict:
    """Taxas do Tesouro Direto e NTN-B via PYield (ANBIMA)."""
    try:
        import pyield as yd
        today = date.today()

        # ANBIMA NTN-B rates — fetch_with_retry para retry exponencial + cache 24h
        def _fetch_ntnb():
            result = yd.anbima.tpf(today, "NTN-B")
            if result is None:
                raise ValueError("pyield retornou None para NTN-B")
            return result

        ntnb_data = []
        try:
            ntnb = _fetch_with_retry(fn=_fetch_ntnb, fallback=None, retries=3,
                                     cache_key="anbima_ntnb", cache_ttl_h=24)
            if ntnb is not None:
                for row in ntnb.iter_rows(named=True):
                    venc = row.get("data_vencimento") or row.get("vencimento")
                    taxa = row.get("taxa_indicativa")
                    if venc and taxa:
                        ntnb_data.append({
                            "vencimento": str(venc),
                            "taxa_indicativa": round(float(taxa) * 100, 4),
                        })
        except Exception as e:
            ntnb_data = [{"error": str(e)}]

        # NTN-B Principal (Renda+)
        def _fetch_ntnbp():
            result = yd.anbima.tpf(today, "NTN-B Principal")
            if result is None:
                raise ValueError("pyield retornou None para NTN-B Principal")
            return result

        ntnbp_data = []
        try:
            ntnbp = _fetch_with_retry(fn=_fetch_ntnbp, fallback=None, retries=3,
                                      cache_key="anbima_ntnb_principal", cache_ttl_h=24)
            if ntnbp is not None:
                for row in ntnbp.iter_rows(named=True):
                    venc = row.get("data_vencimento") or row.get("vencimento")
                    taxa = row.get("taxa_indicativa")
                    if venc and taxa:
                        ntnbp_data.append({
                            "vencimento": str(venc),
                            "taxa_indicativa": round(float(taxa) * 100, 4),
                        })
        except Exception:
            pass

        return {
            "ntnb": ntnb_data,
            "ntnb_principal": ntnbp_data,
            "date": today.isoformat(),
            "_source": "pyield (ANBIMA via B3/BCB/Tesouro Nacional)",
        }
    except ImportError:
        return {"error": "pyield não instalado. pip install pyield"}


def factors() -> dict:
    """Fama-French 5 factors últimos 12 meses via getfactormodels."""
    try:
        from getfactormodels import FamaFrenchFactors
        ff = FamaFrenchFactors(model="5", frequency="m")
        ff.load()
        df = ff.to_pandas().tail(12)
        records = []
        for dt, row in df.iterrows():
            records.append({
                "date": str(dt.date()) if hasattr(dt, "date") else str(dt),
                **{col: round(float(row[col]), 6) for col in df.columns},
            })
        return {
            "ff5_monthly": records,
            "period": f"{records[0]['date']} → {records[-1]['date']}",
            "_source": "getfactormodels (Ken French Library)",
        }
    except ImportError:
        return {"error": "getfactormodels não instalado. pip install getfactormodels"}
    except Exception as e:
        return {"error": str(e)}


def factor_value_spread() -> dict:
    """Calcula proxy de value spread para AVGS usando AQR HML Devil Monthly.

    HML_AVGS(t) = 0.58 × HML_Devil_USA(t) + 0.42 × HML_Devil_GlobalExUS(t)
    SMB_AVGS(t) = 0.58 × SMB_US_KF(t) + 0.42 × SMB_DevExUS_KF(t)
    SV_proxy(t) = HML_AVGS(t) + SMB_AVGS(t)

    Pesos 0.58/0.42 vêm de proxies-canonicos.md (universo global SC).
    Percentis calculados sobre série pós-alinhamento (~1991–hoje).
    """
    import io
    import requests
    import pandas as pd
    from getfactormodels import FamaFrenchFactors

    # ─── 1. AQR HML Devil ────────────────────────────────────────────────────
    AQR_URL = (
        "https://www.aqr.com/-/media/AQR/Documents/Insights/Data-Sets/"
        "The-Devil-in-HMLs-Details-Factors-Monthly.xlsx"
    )
    try:
        r = requests.get(AQR_URL, timeout=60)
        r.raise_for_status()
    except requests.RequestException as e:
        raise RuntimeError(f"AQR HML Devil download failed: {e}") from e

    # Row 18 (0-indexed) = column headers; row 19+ = data
    df_raw = pd.read_excel(io.BytesIO(r.content), sheet_name="HML Devil", header=None)
    header_row = 18
    df_hml = df_raw.iloc[header_row:].copy()
    df_hml.columns = df_raw.iloc[header_row].tolist()
    df_hml = df_hml.iloc[1:].reset_index(drop=True)  # remove duplicated header row
    df_hml = df_hml.rename(columns={df_hml.columns[0]: "DATE"})

    df_hml["DATE"] = pd.to_datetime(df_hml["DATE"], errors="coerce")
    df_hml = df_hml.dropna(subset=["DATE"])
    df_hml = df_hml.set_index("DATE").sort_index()

    hml_usa = df_hml["USA"].astype(float)
    hml_exus = df_hml["Global Ex USA"].astype(float)

    # ─── 2. Ken French SMB — US and Developed ex-US ──────────────────────────
    ff_us = FamaFrenchFactors(model="5", frequency="m", region="us").load().to_pandas()
    ff_dev = FamaFrenchFactors(model="5", frequency="m", region="developed").load().to_pandas()

    # KF delivers in % with datetime.date index; normalize to Timestamp month-end
    def _to_month_end_ts(series: "pd.Series") -> "pd.Series":
        idx = pd.to_datetime(series.index) + pd.offsets.MonthEnd(0)
        return series.set_axis(idx)

    smb_us  = _to_month_end_ts(ff_us["SMB"].astype(float))  / 100.0
    smb_dev = _to_month_end_ts(ff_dev["SMB"].astype(float)) / 100.0

    # ─── 3. Alinha índice ao período de overlap (≥1991) ──────────────────────
    W_US, W_DEV = 0.58, 0.42  # proxies-canonicos.md — universo global SC
    common = hml_usa.index.intersection(hml_exus.index).intersection(smb_us.index).intersection(smb_dev.index)
    common = common[common >= pd.Timestamp("1991-01-01")]

    hml_comp = W_US * hml_usa.loc[common] + W_DEV * hml_exus.loc[common]
    smb_comp = W_US * smb_us.loc[common]  + W_DEV * smb_dev.loc[common]
    sv_proxy = hml_comp + smb_comp

    # ─── 4. Rolling 36-month sum → 3-month moving average ────────────────────
    hml_roll36 = hml_comp.rolling(36).sum()
    sv_roll36  = sv_proxy.rolling(36).sum()
    hml_3m_ma  = hml_roll36.rolling(3).mean()
    sv_3m_ma   = sv_roll36.rolling(3).mean()

    hml_valid = hml_3m_ma.dropna()
    sv_valid  = sv_3m_ma.dropna()

    hml_current = float(hml_valid.iloc[-1])
    sv_current  = float(sv_valid.iloc[-1])

    pct_hml = float((hml_valid < hml_current).mean() * 100)
    pct_sv  = float((sv_valid  < sv_current).mean()  * 100)

    # ─── 5. Status semáforo (based on SV proxy as primary metric) ────────────
    if pct_sv > 75:
        status, label = "wide", "Value Barato"
    elif pct_sv < 25:
        status, label = "compressed", "Value Comprimido"
    else:
        status, label = "neutral", "Neutro"

    last_date = hml_valid.index[-1].strftime("%Y-%m")
    hist_start = hml_valid.index[0].strftime("%Y-%m")

    return {
        "hml_composite_3m_pct": round(hml_current * 100, 4),
        "sv_proxy_3m_pct":      round(sv_current  * 100, 4),
        "percentile_hml": round(pct_hml, 1),
        "percentile_sv":  round(pct_sv,  1),
        "status":         status,
        "status_label":   label,
        "weights":        {"us": W_US, "dev_ex_us": W_DEV},
        "source_hml":     "AQR HML Devil Monthly",
        "source_smb":     "Ken French FF5 (US + Developed)",
        "history_start":  hist_start,
        "last_updated":   last_date,
        "note": (
            "HML timely (AQR). SMB via KF. Pesos = universo global SC "
            "(proxies-canonicos.md). Rolling 36m sum → 3m MA."
        ),
    }


def etfs() -> dict:
    """Preços de ETFs da carteira via yfinance."""
    try:
        import yfinance as yf
        tickers = {
            "SWRD": TICKER_SWRD_LSE,
            "AVGS": "AVGS.L",
            "AVEM": "AVEM.L",
            "HODL11": "HODL11.SA",
            "VWRA": TICKER_VWRA_LSE,
            "VIX": "^VIX",
            "DXY": "DX-Y.NYB",
            "GOLD": "GC=F",
            "OIL": "BZ=F",
        }
        result = {}
        for name, ticker in tickers.items():
            try:
                t = yf.Ticker(ticker)
                info = t.fast_info
                result[name] = {
                    "price": round(float(info.last_price), 4) if hasattr(info, "last_price") else None,
                    "currency": str(info.currency) if hasattr(info, "currency") else None,
                }
            except Exception:
                result[name] = {"price": None, "error": "unavailable"}

        result["date"] = date.today().isoformat()
        result["_source"] = "yfinance"
        return result
    except ImportError:
        return {"error": "yfinance não instalado. pip install yfinance"}


def main():
    parser = argparse.ArgumentParser(description="Market Data CLI — dados financeiros via libs Python")
    parser.add_argument("--macro-br", action="store_true", help="Selic, IPCA, Focus, PTAX")
    parser.add_argument("--macro-us", action="store_true", help="Fed Funds, Treasury, VIX, CDS")
    parser.add_argument("--tesouro", action="store_true", help="Taxas IPCA+, Renda+, NTN-B ANBIMA")
    parser.add_argument("--factors", action="store_true", help="FF5 últimos 12 meses")
    parser.add_argument("--etfs", action="store_true", help="Preços ETFs da carteira")
    parser.add_argument("--value-spread", action="store_true", help="Factor value spread AVGS (AQR HML Devil + KF SMB)")
    parser.add_argument("--all", action="store_true", help="Tudo acima")
    args = parser.parse_args()

    if not any(vars(args).values()):
        parser.print_help()
        sys.exit(0)

    output = {}
    if args.all or args.macro_br:
        output["macro_br"] = macro_br()
    if args.all or args.macro_us:
        output["macro_us"] = macro_us()
    if args.all or args.tesouro:
        output["tesouro"] = tesouro()
    if args.all or args.factors:
        output["factors"] = factors()
    if args.all or args.etfs:
        output["etfs"] = etfs()
    if args.all or args.value_spread:
        output["factor_value_spread"] = factor_value_spread()

    json.dump(output, sys.stdout, indent=2, ensure_ascii=False, default=str)
    print()


if __name__ == "__main__":
    main()
