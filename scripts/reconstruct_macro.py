#!/usr/bin/env python3
"""
reconstruct_macro.py — Fetch macro data (Selic, Fed Funds, Bitcoin, câmbio).

Fontes:
  - Selic:     python-bcb SGS série 432
  - Fed Funds: FRED FEDFUNDS CSV (público, sem API key)
  - Bitcoin:   yfinance BTC-USD
  - Câmbio:    lido do dashboard_state.json (já calculado por get_posicoes_precos)

Output: dados/macro_snapshot.json

Fallback: se APIs falham, tenta preservar snapshot anterior.

Uso:
    python3 scripts/reconstruct_macro.py
"""

import json
import math
import sys
import urllib.request
from datetime import date, datetime
from pathlib import Path

ROOT       = Path(__file__).parent.parent
OUT        = ROOT / "dados" / "macro_snapshot.json"
STATE_PATH = ROOT / "dados" / "dashboard_state.json"

sys.path.insert(0, str(ROOT / "scripts"))


def _load_cache() -> dict:
    try:
        return json.loads(OUT.read_text())
    except Exception:
        return {}


def _load_state() -> dict:
    try:
        return json.loads(STATE_PATH.read_text())
    except Exception:
        return {}


def _get_selic(cache: dict, state: dict) -> float | None:
    # 1. python-bcb
    try:
        sys.path.insert(0, str(ROOT / "scripts"))
        from fx_utils import get_selic_atual
        val = get_selic_atual()
        if not math.isnan(val):
            print(f"    → Selic BCB: {val}%")
            return round(val, 2)
    except Exception:
        pass

    # 2. state cache
    selic = state.get("macro", {}).get("selic_meta")
    if selic is not None:
        print(f"    → Selic state cache: {selic}%")
        return selic

    # 3. snapshot anterior
    selic = cache.get("selic_meta")
    if selic is not None:
        print(f"    → Selic snapshot cache: {selic}%")
        return selic

    print("    ⚠️ Selic indisponível")
    return None


def _get_fed_funds(cache: dict, state: dict) -> float | None:
    # 1. FRED CSV
    try:
        url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=FEDFUNDS"
        with urllib.request.urlopen(url, timeout=8) as resp:
            lines = resp.read().decode("utf-8").strip().splitlines()
        for line in reversed(lines):
            line = line.strip()
            if line and not line.startswith("DATE"):
                parts = line.split(",")
                if len(parts) == 2:
                    try:
                        val = round(float(parts[1]), 2)
                        print(f"    → Fed Funds FRED: {val}%")
                        return val
                    except ValueError:
                        continue
    except Exception:
        pass

    # 2. state cache
    ff = state.get("macro", {}).get("fed_funds")
    if ff is not None:
        print(f"    → Fed Funds state cache: {ff}%")
        return ff

    # 3. snapshot anterior
    ff = cache.get("fed_funds")
    if ff is not None:
        print(f"    → Fed Funds snapshot cache: {ff}%")
        return ff

    print("    ⚠️ Fed Funds indisponível")
    return None


def _get_bitcoin(cache: dict) -> float | None:
    try:
        import yfinance as yf
        btc_data = yf.download("BTC-USD", period="2d", progress=False, auto_adjust=True)
        if btc_data is not None and not btc_data.empty:
            close = btc_data["Close"] if "Close" in btc_data.columns else btc_data.iloc[:, 0]
            last = close.dropna()
            if len(last):
                val = round(float(last.iloc[-1]), 2)
                print(f"    → BTC-USD yfinance: ${val:,.0f}")
                return val
    except Exception as e:
        print(f"    ⚠️ bitcoin yfinance: {e}")

    val = cache.get("bitcoin_usd")
    if val is not None:
        print(f"    → BTC-USD cache: ${val:,.0f}")
    return val


def main():
    print("reconstruct_macro.py — macro snapshot")
    cache = _load_cache()
    state = _load_state()

    print("  ▶ Selic ...")
    selic_meta = _get_selic(cache, state)

    print("  ▶ Fed Funds ...")
    fed_funds = _get_fed_funds(cache, state)

    spread = round(selic_meta - fed_funds, 2) if selic_meta is not None and fed_funds is not None else None

    print("  ▶ Bitcoin ...")
    bitcoin_usd = _get_bitcoin(cache)

    # Câmbio e exposição cambial vêm do state (calculados em get_posicoes_precos)
    pat = state.get("patrimonio", {})
    cambio               = pat.get("cambio")
    equity_usd           = pat.get("equity_usd", 0)
    total_brl            = pat.get("total_brl", 0)
    exposicao_cambial_pct = None
    if cambio and total_brl and total_brl > 0:
        equity_brl = equity_usd * cambio
        exposicao_cambial_pct = round(equity_brl / total_brl * 100, 1)

    # Premissa de depreciação BRL — importar do config
    depreciacao_brl_premissa = None
    try:
        from config import DEPRECIACAO_BRL_BASE
        depreciacao_brl_premissa = DEPRECIACAO_BRL_BASE
    except Exception:
        depreciacao_brl_premissa = cache.get("depreciacao_brl_premissa", 0.005)

    snapshot = {
        "_generated":              datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "selic_meta":              selic_meta,
        "fed_funds":               fed_funds,
        "spread_selic_ff":         spread,
        "depreciacao_brl_premissa": depreciacao_brl_premissa,
        "exposicao_cambial_pct":   exposicao_cambial_pct,
        "bitcoin_usd":             bitcoin_usd,
        # cambio é injetado pelo generate_data.py no momento da montagem do DATA
    }

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(snapshot, indent=2))
    print(f"\n✅ {OUT.relative_to(ROOT)}")
    print(f"   Selic: {selic_meta}% | Fed Funds: {fed_funds}% | Spread: {spread}pp")
    print(f"   BTC: ${bitcoin_usd:,.0f}" if bitcoin_usd else "   BTC: N/A")
    print(f"   Exp. USD: {exposicao_cambial_pct}%")


if __name__ == "__main__":
    main()
