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
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))


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
    """Dados macro US via fredapi."""
    try:
        from fredapi import Fred
        import os
        api_key = os.getenv("FRED_API_KEY")
        if not api_key:
            return {"error": "FRED_API_KEY não configurada no .env. Obter em https://fred.stlouisfed.org/docs/api/api_key.html"}

        fred = Fred(api_key=api_key)
        series = {
            "fed_funds": "FEDFUNDS",
            "treasury_2y": "DGS2",
            "treasury_10y": "DGS10",
            "treasury_30y": "DGS30",
            "tips_10y_real": "DFII10",
            "vix": "VIXCLS",
            "cds_brazil_5y": "BRAZILCDSB",
        }
        result = {}
        for name, sid in series.items():
            try:
                s = fred.get_series(sid, observation_start=(date.today() - timedelta(days=10)).isoformat())
                val = s.dropna().iloc[-1] if len(s.dropna()) > 0 else None
                result[name] = round(float(val), 4) if val is not None else None
            except Exception:
                result[name] = None

        result["date"] = date.today().isoformat()
        result["_source"] = "fredapi (FRED API)"
        return result
    except ImportError:
        return {"error": "fredapi não instalado. pip install fredapi"}


def tesouro() -> dict:
    """Taxas do Tesouro Direto e NTN-B via PYield (ANBIMA)."""
    try:
        import pyield as yd
        today = date.today()

        # ANBIMA NTN-B rates
        ntnb_data = []
        try:
            ntnb = yd.anbima.tpf(today, "NTN-B")
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
        ntnbp_data = []
        try:
            ntnbp = yd.anbima.tpf(today, "NTN-B Principal")
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


def etfs() -> dict:
    """Preços de ETFs da carteira via yfinance."""
    try:
        import yfinance as yf
        tickers = {
            "SWRD": "SWRD.L",
            "AVGS": "AVGS.L",
            "AVEM": "AVEM.L",
            "HODL11": "HODL11.SA",
            "VWRA": "VWRA.L",
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

    json.dump(output, sys.stdout, indent=2, ensure_ascii=False, default=str)
    print()


if __name__ == "__main__":
    main()
