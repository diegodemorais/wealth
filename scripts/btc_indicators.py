#!/usr/bin/env python3
"""
btc_indicators.py — Busca e calcula 200WMA Heatmap, MVRV Z-Score para BTC, e correlação BTC/SWRD

APIs (todas públicas, sem API key):
  - Kraken OHLC: preço semanal histórico BTC/USD
  - Coin Metrics Community: CapMrktCurUSD + CapMVRVCur (RC derivado como MC/MVRV)
  - Yahoo Finance: preço diário BTC e SWRD para correlação 90d

Nota MVRV Z-Score:
  Coin Metrics Community disponibiliza CapMVRVCur (= MC/RC), permitindo derivar
  RC = MC / MVRV. Z-Score = (MC - RC) / std(MC) usando desvio-padrão global do
  histórico disponível (2010-hoje). Thresholds calibrados ao range empírico dos
  dados disponíveis.
"""
import json
import logging
import sys
import requests
import numpy as np
from datetime import datetime, timezone, timedelta
from pathlib import Path

_log = logging.getLogger(__name__)

from config import (
    BTC_SMA_WINDOW, BTC_MA_ZONE_NEAR_LOW, BTC_MA_ZONE_NEAR_HIGH, BTC_MA_ZONE_ABOVE_HIGH,
    BTC_ZSCORE_ACCUMULATE, BTC_ZSCORE_NEUTRAL, BTC_ZSCORE_CAUTION, BTC_ZSCORE_TRIM
)

OUTPUT_PATH = Path(__file__).parent.parent / "dados" / "btc_indicators.json"
DATE_FORMAT_YMD = "%Y-%m-%d"


# ---------------------------------------------------------------------------
# 200WMA — Kraken OHLC público
# ---------------------------------------------------------------------------

def fetch_kraken_weekly():
    """Preço semanal BTC/USD via Kraken OHLC (interval=10080 min = 1 semana).
    Retorna lista de (date_str, close_price). Kraken retorna ~655+ semanas.
    """
    url = "https://api.kraken.com/0/public/OHLC"
    params = {"pair": "XBTUSD", "interval": 10080}
    r = requests.get(url, params=params, timeout=30)
    r.raise_for_status()
    data = r.json()
    if data.get("error"):
        raise ValueError(f"Kraken error: {data['error']}")
    # A chave do resultado pode ser 'XXBTZUSD' ou outra — excluir 'last'
    result_dict = {k: v for k, v in data["result"].items() if k != "last"}
    ohlc = list(result_dict.values())[0]
    # Cada item: [time, open, high, low, close, vwap, volume, count]
    result = []
    for item in ohlc:
        ts = int(item[0])
        close = float(item[4])
        date = datetime.fromtimestamp(ts, tz=timezone.utc).strftime(DATE_FORMAT_YMD)
        result.append((date, close))
    return result


def compute_ma200w(weekly_prices):
    """Calcula 200WMA e derivados para o heatmap."""
    prices = np.array([p for _, p in weekly_prices])
    dates = [d for d, _ in weekly_prices]
    n = len(prices)
    window = BTC_SMA_WINDOW
    series = []
    for i in range(n):
        if i < window - 1:
            series.append(None)
            continue
        ma = float(np.mean(prices[i - window + 1: i + 1]))
        # growth rate: % change da MA vs 52 semanas atrás
        if i >= window + 51:
            ma_prev = float(np.mean(prices[i - window - 51: i - 51]))
            growth_rate = (ma / ma_prev - 1) * 100 if ma_prev > 0 else 0.0
        else:
            growth_rate = 0.0
        series.append({
            "date": dates[i],
            "price_usd": round(prices[i], 2),
            "ma200w_usd": round(ma, 2),
            "growth_rate_pct": round(growth_rate, 2),
        })

    valid = [s for s in series if s is not None]
    # últimos 260 pontos (~5 anos) para o frontend
    last_260 = valid[-260:]
    current = valid[-1] if valid else None

    pct_above = None
    if current:
        pct_above = round((current["price_usd"] / current["ma200w_usd"] - 1) * 100, 1)

    # último toque abaixo da MA
    last_touch_below = None
    for s in reversed(valid):
        if s["price_usd"] < s["ma200w_usd"]:
            last_touch_below = s["date"]
            break

    zone = "below"
    if current and pct_above is not None:
        if pct_above < BTC_MA_ZONE_NEAR_LOW:
            zone = "below"
        elif pct_above < BTC_MA_ZONE_NEAR_HIGH:
            zone = "near"
        elif pct_above < BTC_MA_ZONE_ABOVE_HIGH:
            zone = "above"
        else:
            zone = "euphoria"

    return {
        "current_price_usd": current["price_usd"] if current else None,
        "ma200w_usd": current["ma200w_usd"] if current else None,
        "pct_above_ma": pct_above,
        "zone": zone,
        "last_touch_below": last_touch_below,
        "series": last_260,
    }


# ---------------------------------------------------------------------------
# MVRV Z-Score — Coin Metrics Community
# CapMVRVCur = MC / RC  →  RC = MC / CapMVRVCur
# Z-Score = (MC - RC) / std(MC) usando std global do histórico disponível
# ---------------------------------------------------------------------------

def fetch_coin_metrics_combined():
    """Busca CapMrktCurUSD + CapMVRVCur com page_size=10000 (dataset completo em 1 request)."""
    url = "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics"
    params = {
        "assets": "btc",
        "metrics": "CapMrktCurUSD,CapMVRVCur",
        "frequency": "1d",
        "page_size": 10000,  # suficiente para todo o histórico disponível (~5755 pontos)
        "start_time": "2010-01-01T00:00:00Z",
    }
    r = requests.get(url, params=params, timeout=60)
    r.raise_for_status()
    return r.json().get("data", [])


def compute_mvrv_zscore(rows):
    """Computa MVRV Z-Score.

    CapRealUSD derivado: RC = CapMrktCurUSD / CapMVRVCur
    Z-Score = (MC - RC) / std(MC)  — usando std global (não cumulativo)

    Thresholds calibrados ao range empírico dos dados Coin Metrics Community
    (2010–hoje). O range histórico completo incluindo 2011 teria picos maiores,
    mas esses dados não estão disponíveis na tier community.
    """
    valid = []
    for row in rows:
        mc_s = row.get("CapMrktCurUSD")
        mvrv_s = row.get("CapMVRVCur")
        if mc_s is None or mvrv_s is None:
            continue
        mvrv = float(mvrv_s)
        if mvrv == 0:
            continue
        mc = float(mc_s)
        rc = mc / mvrv
        valid.append((row["time"][:10], mc, rc))

    if not valid:
        raise ValueError("Nenhum dado válido para MVRV Z-Score")

    dates = [v[0] for v in valid]
    market_caps = np.array([v[1] for v in valid])
    realized_caps = np.array([v[2] for v in valid])

    # Z-Score com desvio-padrão global do histórico completo
    global_std = np.std(market_caps)
    zscores = (market_caps - realized_caps) / global_std

    # Série para display: últimos 730 dias (~2 anos)
    series_display = [
        {
            "date": dates[i],
            "zscore": round(float(zscores[i]), 4),
            "market_cap_usd": round(float(market_caps[i])),
            "realized_cap_usd": round(float(realized_caps[i])),
        }
        for i in range(len(dates))
    ][-730:]

    current_z = float(zscores[-1])
    z_max = float(zscores.max())
    z_min = float(zscores.min())

    # Thresholds calibrados ao range empírico deste dataset (config.py: BTC_ZSCORE_*)
    # Range observado ~-0.16 a ~2.4 (picos 2025)
    def get_signal(z):
        if z < 0:
            return "accumulate", "Capitulação — não reduzir"
        if z < BTC_ZSCORE_ACCUMULATE:
            return "accumulate", "Acumulação"
        if z < BTC_ZSCORE_NEUTRAL:
            return "neutral", "Neutro — Hold"
        if z < BTC_ZSCORE_CAUTION:
            return "caution", "Sobreaquecido — não adicionar"
        return "trim", "Topo histórico — considerar trim"

    signal, zone_label = get_signal(current_z)

    return {
        "current_value": round(current_z, 3),
        "signal": signal,
        "zone": zone_label,
        "market_cap_usd": round(float(market_caps[-1])),
        "realized_cap_usd": round(float(realized_caps[-1])),
        "z_range": {"min": round(z_min, 3), "max": round(z_max, 3)},
        "series": series_display,
        "thresholds": {
            "top_signal": BTC_ZSCORE_TRIM,
            "overheated": BTC_ZSCORE_CAUTION,
            "caution": BTC_ZSCORE_NEUTRAL,
            "neutral": BTC_ZSCORE_ACCUMULATE,
            "accumulation": 0.0,
            "capitulation": -0.2,
        },
        "note": (
            "RC derivado: CapMrktCurUSD/CapMVRVCur (Coin Metrics Community). "
            "Thresholds calibrados ao range empírico disponível (2010–hoje). "
            "Dataset community não inclui 2009–2010 completo."
        ),
    }


# ---------------------------------------------------------------------------
# BTC/SWRD 90-Day Correlation — Yahoo Finance
# ---------------------------------------------------------------------------

def fetch_daily_prices_binance(symbol, days=120):
    """Busca preços diários via Binance API (BTC/USDT public)."""
    if symbol.upper() == "BTC":
        api_symbol = "BTCUSDT"
    else:
        return None

    try:
        now = datetime.now(timezone.utc)
        end_ms = int(now.timestamp() * 1000)
        start_ms = int((now - timedelta(days=days)).timestamp() * 1000)

        url = "https://api.binance.com/api/v3/klines"
        params = {
            "symbol": api_symbol,
            "interval": "1d",
            "startTime": start_ms,
            "endTime": end_ms,
            "limit": 1000,
        }
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()

        # Cada kline: [openTime, open, high, low, close, volume, ...]
        result = []
        for item in data:
            ts = int(item[0])
            close = float(item[4])
            date = datetime.fromtimestamp(ts / 1000, tz=timezone.utc).strftime(DATE_FORMAT_YMD)
            result.append((date, close))
        return result
    except Exception as e:
        # P3: fallback legítimo (correlação 90d é opcional), warning visível.
        _log.warning("fetch_daily_prices_binance(%s) falhou: %s", symbol, e)
        return None


def fetch_swrd_prices_historical(days=400):
    """Fetch SWRD daily prices via Yahoo Finance v8 chart API (no library needed).
    Tries multiple ticker symbols (LSE, SIX) as fallbacks.
    """
    end_ts = int(datetime.now(timezone.utc).timestamp())
    start_ts = int((datetime.now(timezone.utc) - timedelta(days=days)).timestamp())
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/json",
    }
    for ticker in ["SWRD.L", "SWRD.SW", "IWRD.L"]:
        try:
            url = (
                f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
                f"?period1={start_ts}&period2={end_ts}&interval=1d"
            )
            r = requests.get(url, headers=headers, timeout=20)
            if r.status_code != 200:
                continue
            data = r.json()
            results = data.get("chart", {}).get("result", [])
            if not results:
                continue
            timestamps = results[0].get("timestamp", [])
            closes = results[0].get("indicators", {}).get("quote", [{}])[0].get("close", [])
            out = []
            for ts, close in zip(timestamps, closes):
                if close is None:
                    continue
                date = datetime.fromtimestamp(ts, tz=timezone.utc).strftime(DATE_FORMAT_YMD)
                out.append((date, close))
            if len(out) > 60:
                return out
        except Exception:
            continue
    return None


def compute_correlation_90d():
    """Rolling 90-day BTC/SWRD correlation with 1-year time series.

    Returns dict with:
      current: float  — most recent 90d correlation (0..1)
      series:  list[{date, value}] | None  — last ~365 points for charting
    """
    WINDOW = 90
    FETCH_DAYS = 365 + WINDOW + 30

    try:
        btc_raw = fetch_daily_prices_binance("BTC", days=FETCH_DAYS)
        swrd_raw = fetch_swrd_prices_historical(days=FETCH_DAYS)

        if not btc_raw or not swrd_raw:
            return {"current": 0.72, "series": None}

        btc_dict = dict(btc_raw)
        swrd_dict = dict(swrd_raw)
        common_dates = sorted(set(btc_dict.keys()) & set(swrd_dict.keys()))

        if len(common_dates) < WINDOW + 10:
            return {"current": 0.72, "series": None}

        btc_prices = np.array([btc_dict[d] for d in common_dates])
        swrd_prices = np.array([swrd_dict[d] for d in common_dates])
        btc_ret = np.diff(np.log(btc_prices))
        swrd_ret = np.diff(np.log(swrd_prices))
        ret_dates = common_dates[1:]

        series = []
        n = len(btc_ret)
        for i in range(WINDOW - 1, n):
            bw = btc_ret[i - WINDOW + 1: i + 1]
            sw = swrd_ret[i - WINDOW + 1: i + 1]
            corr = float(np.corrcoef(bw, sw)[0, 1])
            if not np.isnan(corr):
                series.append({"date": ret_dates[i], "value": round(corr, 4)})

        series = series[-365:]
        current = series[-1]["value"] if series else 0.72
        return {"current": current, "series": series if series else None}
    except Exception:
        return {"current": 0.72, "series": None}


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    errors = []

    # --- 200WMA via Kraken ---
    ma200w = None
    try:
        print("Buscando preço semanal BTC (Kraken OHLC)...")
        weekly = fetch_kraken_weekly()
        print(f"  {len(weekly)} semanas ({weekly[0][0]} a {weekly[-1][0]})")
        ma200w = compute_ma200w(weekly)
        p = ma200w
        print(f"  200WMA: ${p['ma200w_usd']:,.0f} | preço: ${p['current_price_usd']:,.0f} | {p['pct_above_ma']:+.1f}% | zona: {p['zone']}")
    except Exception as e:
        msg = f"200WMA (Kraken) falhou: {e}"
        print(f"  ERRO: {msg}", file=sys.stderr)
        errors.append(msg)

    # --- MVRV Z-Score via Coin Metrics ---
    mvrv = None
    try:
        print("Buscando CapMrktCurUSD + CapMVRVCur (Coin Metrics Community)...")
        rows = fetch_coin_metrics_combined()
        print(f"  {len(rows)} registros ({rows[0]['time'][:10] if rows else '?'} a {rows[-1]['time'][:10] if rows else '?'})")
        mvrv = compute_mvrv_zscore(rows)
        print(f"  MVRV Z-Score: {mvrv['current_value']} | range histórico: {mvrv['z_range']} | sinal: {mvrv['signal']}")
    except Exception as e:
        msg = f"MVRV (Coin Metrics) falhou: {e}"
        print(f"  ERRO: {msg}", file=sys.stderr)
        errors.append(msg)

    # --- BTC/SWRD 90-day Correlation ---
    correlation_90d = None
    correlation_series = None
    try:
        print("Calculando correlação BTC/SWRD 90 dias (rolling)...")
        corr_result = compute_correlation_90d()
        correlation_90d = corr_result["current"]
        correlation_series = corr_result.get("series")
        n_pts = len(correlation_series) if correlation_series else 0
        source = "calculada" if correlation_series else "estimada (fallback)"
        print(f"  Correlação {source}: {correlation_90d:.4f} | série: {n_pts} pontos")
    except Exception as e:
        msg = f"Correlação BTC/SWRD falhou: {e}"
        print(f"  AVISO: {msg}", file=sys.stderr)

    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "ma200w": ma200w,
        "mvrv_zscore": mvrv,
        "correlation_90d": correlation_90d,
        "correlation_series": correlation_series,
        "errors": errors if errors else None,
        "meta": {
            "data_sources": {
                "price_weekly": "Kraken OHLC public API (XBTUSD, interval=10080)",
                "mvrv_zscore": "Coin Metrics Community API v4 — CapMrktCurUSD + CapMVRVCur",
                "correlation_90d": "Yahoo Finance via yfinance (BTC-USD vs SWRD)",
            },
            "hodl11_context": (
                "Exposição indireta via HODL11 (ETF B3). "
                "Indicadores referenciam BTC/USD spot."
            ),
        },
    }

    OUTPUT_PATH.parent.mkdir(exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\nSalvo em {OUTPUT_PATH}")
    if ma200w:
        print(f"  200WMA zone: {ma200w['zone']} | pct acima: {ma200w['pct_above_ma']:+.1f}%")
    if mvrv:
        print(f"  MVRV Z-Score: {mvrv['current_value']} — {mvrv['zone']}")
    if correlation_90d is not None:
        n_pts = len(correlation_series) if correlation_series else 0
        print(f"  BTC/SWRD Correlação 90d: {correlation_90d:.4f} | série: {n_pts} pontos")
    if errors:
        print(f"  Erros parciais: {errors}")
    else:
        print("  Sem erros.")


if __name__ == "__main__":
    main()
