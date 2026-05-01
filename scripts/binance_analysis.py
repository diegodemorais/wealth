#!/usr/bin/env python3
"""
binance_analysis.py — Valoriza posições Binance com preços ao vivo.

Lê: dados/binance/saldo.json  (quantidades por coin, extraídas do extrato PDF)
Gera: dados/binance/posicoes.json  (valor total USD + BRL, por coin)

Uso:
  python3 scripts/binance_analysis.py
  python3 scripts/binance_analysis.py --saldo dados/binance/saldo.json
"""

import argparse
import json
import math
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).parent.parent
SALDO_PATH = ROOT / "dados" / "binance" / "saldo.json"
OUT_PATH   = ROOT / "dados" / "binance" / "posicoes.json"

# Mapeamento coin → ticker yfinance (USDT pairs)
TICKERS = {
    "BTC":   "BTC-USD",
    "ETH":   "ETH-USD",
    "BNB":   "BNB-USD",
    "ADA":   "ADA-USD",
    "ENA":   "ENA-USD",
    "PENGU": "PENGU-USD",
    "ETHFI": "ETHFI-USD",
    "LISTA": "LISTA-USD",
    "TON":   "TON-USD",
    "MATIC": "MATIC-USD",
    "SOL":   "SOL-USD",
    "DOT":   "DOT-USD",
    "LINK":  "LINK-USD",
    "AVAX":  "AVAX-USD",
    "ATOM":  "ATOM-USD",
}

def get_cambio() -> float:
    try:
        sys.path.insert(0, str(ROOT / "scripts"))
        from fx_utils import get_ptax_today
        return get_ptax_today()
    except Exception:
        pass
    try:
        import requests
        sys.path.insert(0, str(ROOT / "scripts"))
        from fetch_utils import fetch_with_retry
        url = (
            "https://olinda.bcb.gov.br/olinda/servio/PTAX/versao/v1/odata/"
            "CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao=%27"
            f"{date.today().strftime('%m-%d-%Y')}%27&$format=json"
        )
        def _fetch_ptax():
            resp = requests.get(url, timeout=5)
            resp.raise_for_status()
            return resp.json()
        payload = fetch_with_retry(
            fn=_fetch_ptax,
            cache_key=f"binance_ptax_{date.today().isoformat()}",
            cache_ttl_h=4,
            retries=3,
        )
        v = payload["value"][0]["cotacaoVenda"]
        return float(v)
    except Exception:
        return 5.80  # fallback conservador


def fetch_prices(coins: list[str]) -> dict[str, float]:
    """Retorna {coin: preco_usd}. Usa yfinance."""
    prices: dict[str, float] = {}
    tickers_needed = [TICKERS[c] for c in coins if c in TICKERS]
    if not tickers_needed:
        return prices
    try:
        import yfinance as yf
        sys.path.insert(0, str(ROOT / "scripts"))
        from fetch_utils import fetch_with_retry
        data = fetch_with_retry(
            fn=lambda: yf.download(tickers_needed, period="1d", auto_adjust=True, progress=False),
            retries=3,
        )
        close = data["Close"] if "Close" in data else data
        for coin in coins:
            tkr = TICKERS.get(coin)
            if not tkr:
                continue
            try:
                if len(tickers_needed) == 1:
                    val = float(close.iloc[-1])
                else:
                    val = float(close[tkr].iloc[-1])
                if not math.isnan(val) and val > 0:
                    prices[coin] = val
            except Exception:
                pass
    except Exception as e:
        print(f"  ⚠️ yfinance erro: {e}")
    return prices


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--saldo", default=str(SALDO_PATH))
    parser.add_argument("--out",   default=str(OUT_PATH))
    args = parser.parse_args()

    saldo_path = Path(args.saldo)
    out_path   = Path(args.out)

    if not saldo_path.exists():
        print(f"❌ saldo não encontrado: {saldo_path}")
        sys.exit(1)

    saldo = json.loads(saldo_path.read_text())
    balances: dict = saldo.get("balances", {})
    coins = list(balances.keys())

    print(f"  ▶ binance_analysis: {len(coins)} coins — buscando preços via yfinance ...")
    prices = fetch_prices(coins)

    cambio = get_cambio()
    print(f"  → câmbio BRL/USD: {cambio:.4f}")

    holdings = []
    total_usd = 0.0

    for coin, bal in balances.items():
        qty_total = bal.get("spot", 0.0) + bal.get("earn", 0.0)
        if qty_total <= 0:
            continue
        price_usd = prices.get(coin)
        if price_usd is None:
            print(f"  ⚠️ preço não encontrado para {coin} — ignorando")
            continue
        value_usd = qty_total * price_usd
        value_brl = value_usd * cambio
        total_usd += value_usd
        holdings.append({
            "coin":      coin,
            "qty":       round(qty_total, 8),
            "qty_spot":  round(bal.get("spot", 0.0), 8),
            "qty_earn":  round(bal.get("earn", 0.0), 8),
            "price_usd": round(price_usd, 6),
            "value_usd": round(value_usd, 2),
            "value_brl": round(value_brl, 2),
        })

    holdings.sort(key=lambda x: x["value_usd"], reverse=True)
    total_brl = total_usd * cambio

    out = {
        "_generated":    str(date.today()),
        "_saldo_source": saldo.get("_report_date", "?"),
        "_cambio":       round(cambio, 4),
        "total_usd":     round(total_usd, 2),
        "total_brl":     round(total_brl, 2),
        "holdings":      holdings,
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False))

    print(f"  ✓ binance posicoes: {len(holdings)} coins | "
          f"total ${total_usd:.2f} USD | R${total_brl:.0f} BRL")
    print(f"  ✓ salvo → {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
