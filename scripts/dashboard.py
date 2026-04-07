#!/usr/bin/env python3
"""
dashboard.py — Gera HTML dashboard single-file da carteira de Diego.

Uso:
    python3 scripts/dashboard.py
    python3 scripts/dashboard.py --cambio 5.15
    python3 scripts/dashboard.py --open

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import argparse
import json
import os
import subprocess
import sys
import webbrowser
from datetime import date, datetime, timedelta

import pandas as pd
import warnings
warnings.filterwarnings("ignore")

try:
    import yfinance as yf
except ImportError:
    yf = None

# ─── CONFIG ──────────────────────────────────────────────────────────────────

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)

LOTES_PATH = os.path.join(ROOT_DIR, "analysis", "backtest_output", "ibkr_lotes.json")
HISTORICO_PATH = os.path.join(ROOT_DIR, "dados", "historico_carteira.csv")
OUTPUT_PATH = os.path.join(ROOT_DIR, "analysis", "dashboard.html")

EQUITY_PCT = 0.79

# Buckets: ticker → {yf_ticker, target within equity, status}
BUCKETS = {
    "SWRD": {"etfs": {"SWRD": "SWRD.L"}, "target_eq": 0.50, "tipo": "alvo"},
    "AVGS": {"etfs": {"AVGS": "AVGS.L", "AVUV": "AVUV", "AVDV": "AVDV", "USSC": "USSC.L"}, "target_eq": 0.30, "tipo": "alvo+trans"},
    "AVEM": {"etfs": {"AVEM": "AVEM.L", "EIMI": "EIMI.L", "AVES": "AVES", "DGS": "DGS"}, "target_eq": 0.20, "tipo": "alvo+trans"},
}

# Posições não-equity (defaults da planilha 07/04/26, atualizáveis via CLI)
RF_DEFAULTS = {
    "IPCA+ 2029": {"valor_brl": 89095, "tipo": "Reserva", "cor": "#4CAF50"},
    "IPCA+ 2040": {"valor_brl": 33285, "tipo": "RF Longo", "cor": "#2196F3"},
    "Renda+ 2065": {"valor_brl": 112466, "tipo": "RF Tático", "cor": "#FF9800"},
    "HODL11": {"valor_brl": 100376, "tipo": "Crypto", "cor": "#9C27B0"},
}

# Scorecard (última atualização)
FIRE_DATA = {
    "base": 90.4, "favoravel": 94.1, "stress": 86.8,
    "patrimonio_mediano": 11_530_000, "gatilho": 13_400_000,
}

SHADOW_DATA = {
    "t0_date": "2026-03-20", "t0_pat": 3_479_239,
    "q1_atual": {"ret": 1.73, "pat": 3_492_284},
    "q1_target": {"ret": -1.11, "pat": 3_399_000},
    "q1_shadow_a": {"ret": -1.42, "pat": 3_387_800},
    "q1_shadow_b": {"ret": 2.30, "pat": 3_512_116},
}


# ─── DATA COLLECTION ────────────────────────────────────────────────────────

def load_lotes():
    """Lê ibkr_lotes.json → {ticker: {status, lotes: [{data, qty, custo_por_share}]}}"""
    with open(LOTES_PATH) as f:
        return json.load(f)


def fetch_prices(tickers_yf: list[str]) -> dict[str, float]:
    """Busca preços atuais via yfinance. Retorna {yf_ticker: price_usd}."""
    prices = {}
    if yf is None:
        return prices
    for t in tickers_yf:
        try:
            data = yf.download(t, period="5d", auto_adjust=True, progress=False)
            if not data.empty:
                prices[t] = float(data["Close"].dropna().iloc[-1])
        except Exception:
            pass
    return prices


def fetch_cambio() -> float:
    """Busca câmbio USD/BRL atual."""
    if yf is None:
        return 5.15
    try:
        fx = yf.download("USDBRL=X", period="5d", progress=False)["Close"].dropna()
        return float(fx.iloc[-1])
    except Exception:
        return 5.15


def compute_cagr() -> dict:
    """Calcula CAGR histórico do CSV."""
    try:
        df = pd.read_csv(HISTORICO_PATH)
        df["data"] = pd.to_datetime(df["data"])
        df = df.dropna(subset=["patrimonio_brl"]).sort_values("data")
        if len(df) < 2:
            return {"cagr": 0, "retorno": 0, "anos": 0, "pat_ini": 0, "pat_fim": 0}
        first, last = df.iloc[0], df.iloc[-1]
        anos = (last["data"] - first["data"]).days / 365.25
        if anos <= 0:
            return {"cagr": 0, "retorno": 0, "anos": 0, "pat_ini": 0, "pat_fim": 0}
        pat_ini = float(first["patrimonio_brl"])
        pat_fim = float(last["patrimonio_brl"])
        cagr = (pat_fim / pat_ini) ** (1 / anos) - 1
        retorno = pat_fim / pat_ini - 1
        return {"cagr": cagr, "retorno": retorno, "anos": anos,
                "pat_ini": pat_ini, "pat_fim": pat_fim,
                "data_ini": first["data"].strftime("%Y-%m-%d"),
                "data_fim": last["data"].strftime("%Y-%m-%d")}
    except Exception:
        return {"cagr": 0, "retorno": 0, "anos": 0, "pat_ini": 0, "pat_fim": 0}


def build_positions(lotes_data: dict, prices: dict, cambio: float) -> list[dict]:
    """Monta lista de posições com valor atual, custo, bucket."""
    positions = []
    ticker_to_yf = {}
    for bk, binfo in BUCKETS.items():
        for tk, yf_tk in binfo["etfs"].items():
            ticker_to_yf[tk] = (yf_tk, bk)

    for ticker, info in lotes_data.items():
        if ticker not in ticker_to_yf:
            continue
        yf_tk, bucket = ticker_to_yf[ticker]
        lotes = info.get("lotes", [])
        total_qty = sum(l.get("qty", 0) for l in lotes)
        total_cost_usd = sum(l.get("qty", 0) * l.get("custo_por_share", 0) for l in lotes)

        if total_qty == 0:
            continue

        avg_cost = total_cost_usd / total_qty if total_qty > 0 else 0
        price_usd = prices.get(yf_tk, avg_cost)  # fallback to cost
        value_usd = total_qty * price_usd
        cost_brl = total_cost_usd * cambio  # approx (ideally PTAX per lot)
        value_brl = value_usd * cambio
        gain_pct = (price_usd / avg_cost - 1) * 100 if avg_cost > 0 else 0

        is_alvo = ticker in [list(BUCKETS[b]["etfs"].keys())[0] for b in BUCKETS]

        positions.append({
            "ticker": ticker,
            "bucket": bucket,
            "qty": total_qty,
            "price_usd": price_usd,
            "avg_cost_usd": avg_cost,
            "value_usd": value_usd,
            "value_brl": value_brl,
            "cost_usd": total_cost_usd,
            "cost_brl": cost_brl,
            "gain_pct": gain_pct,
            "is_alvo": is_alvo,
            "status": "Alvo" if is_alvo else "Transitório",
        })

    return sorted(positions, key=lambda p: (p["bucket"], -p["is_alvo"], -p["value_usd"]))


def build_bucket_summary(positions: list[dict], cambio: float) -> list[dict]:
    """Agrega posições por bucket."""
    buckets = {}
    for p in positions:
        bk = p["bucket"]
        if bk not in buckets:
            buckets[bk] = {"bucket": bk, "value_usd": 0, "value_brl": 0,
                           "cost_usd": 0, "cost_brl": 0, "qty": 0, "n_etfs": 0}
        buckets[bk]["value_usd"] += p["value_usd"]
        buckets[bk]["value_brl"] += p["value_brl"]
        buckets[bk]["cost_usd"] += p["cost_usd"]
        buckets[bk]["cost_brl"] += p["cost_brl"]
        buckets[bk]["qty"] += p["qty"]
        buckets[bk]["n_etfs"] += 1

    total_equity_usd = sum(b["value_usd"] for b in buckets.values())

    result = []
    for bk_name in ["SWRD", "AVGS", "AVEM"]:
        bk = buckets.get(bk_name, {"value_usd": 0, "value_brl": 0, "cost_usd": 0,
                                     "cost_brl": 0, "qty": 0, "n_etfs": 0, "bucket": bk_name})
        target_eq = BUCKETS[bk_name]["target_eq"]
        pct_equity = (bk["value_usd"] / total_equity_usd * 100) if total_equity_usd > 0 else 0
        target_pct = target_eq * 100
        delta = pct_equity - target_pct
        gain = (bk["value_brl"] / bk["cost_brl"] - 1) * 100 if bk["cost_brl"] > 0 else 0
        bk.update({
            "pct_equity": pct_equity, "target_pct": target_pct,
            "delta": delta, "gain_pct": gain,
        })
        result.append(bk)

    return result, total_equity_usd


def collect_all(cambio_override: float = None) -> dict:
    """Coleta todos os dados para o dashboard."""
    print("📊 Coletando dados para o dashboard...")

    # 1. Lotes
    print("  Lendo ibkr_lotes.json...")
    lotes = load_lotes()

    # 2. Preços
    all_yf_tickers = []
    for binfo in BUCKETS.values():
        all_yf_tickers.extend(binfo["etfs"].values())
    all_yf_tickers = list(set(all_yf_tickers))

    print(f"  Buscando preços ({len(all_yf_tickers)} tickers)...")
    prices = fetch_prices(all_yf_tickers)

    # 3. Câmbio
    if cambio_override:
        cambio = cambio_override
        print(f"  Câmbio (override): R$ {cambio:.2f}")
    else:
        print("  Buscando câmbio USD/BRL...")
        cambio = fetch_cambio()
        print(f"  Câmbio: R$ {cambio:.4f}")

    # 4. Posições
    positions = build_positions(lotes, prices, cambio)
    bucket_summary, total_equity_usd = build_bucket_summary(positions, cambio)

    # 5. Portfolio total
    total_equity_brl = total_equity_usd * cambio
    total_rf_brl = sum(v["valor_brl"] for v in RF_DEFAULTS.values())
    total_portfolio_brl = total_equity_brl + total_rf_brl

    # 6. CAGR
    print("  Calculando CAGR histórico...")
    cagr = compute_cagr()

    # 7. Allocation donut data
    rf_structural = RF_DEFAULTS.get("IPCA+ 2040", {}).get("valor_brl", 0)
    rf_reserva = RF_DEFAULTS.get("IPCA+ 2029", {}).get("valor_brl", 0)
    rf_tatico = RF_DEFAULTS.get("Renda+ 2065", {}).get("valor_brl", 0)
    crypto = RF_DEFAULTS.get("HODL11", {}).get("valor_brl", 0)

    allocation = {
        "Equity": total_equity_brl,
        "IPCA+ Longo": rf_structural,
        "Reserva": rf_reserva,
        "Renda+ 2065": rf_tatico,
        "Crypto": crypto,
    }

    # 8. TLH data
    tlh_data = []
    for p in positions:
        if not p["is_alvo"] and p["qty"] > 0:
            tlh_data.append({
                "ticker": p["ticker"],
                "bucket": p["bucket"],
                "qty": p["qty"],
                "cost_usd": p["avg_cost_usd"],
                "price_usd": p["price_usd"],
                "gain_pct": p["gain_pct"],
                "value_usd": p["value_usd"],
                "value_brl": p["value_brl"],
            })

    print(f"  ✅ Portfolio: R$ {total_portfolio_brl:,.0f} | Equity: ${total_equity_usd:,.0f}")

    return {
        "date": date.today().strftime("%Y-%m-%d"),
        "cambio": cambio,
        "positions": positions,
        "bucket_summary": bucket_summary,
        "total_equity_usd": total_equity_usd,
        "total_equity_brl": total_equity_brl,
        "total_rf_brl": total_rf_brl,
        "total_portfolio_brl": total_portfolio_brl,
        "allocation": allocation,
        "cagr": cagr,
        "fire": FIRE_DATA,
        "shadows": SHADOW_DATA,
        "tlh": tlh_data,
        "rf": RF_DEFAULTS,
    }


# ─── HTML GENERATION ─────────────────────────────────────────────────────────

def generate_html(data: dict) -> str:
    """Gera HTML single-file com Chart.js."""

    # Prepare JSON data for JS
    allocation_labels = json.dumps(list(data["allocation"].keys()))
    allocation_values = json.dumps([round(v) for v in data["allocation"].values()])
    allocation_colors = json.dumps(["#1976D2", "#2196F3", "#4CAF50", "#FF9800", "#9C27B0"])

    bucket_labels = json.dumps([b["bucket"] for b in data["bucket_summary"]])
    bucket_deltas = json.dumps([round(b["delta"], 1) for b in data["bucket_summary"]])
    bucket_colors = json.dumps(["#4CAF50" if b["delta"] >= 0 else "#F44336"
                                for b in data["bucket_summary"]])

    # KPIs
    pat_brl = data["total_portfolio_brl"]
    cagr_pct = data["cagr"].get("cagr", 0) * 100
    fire_base = data["fire"]["base"]
    cambio = data["cambio"]
    delta_a = data["shadows"]["q1_atual"]["ret"] - data["shadows"]["q1_shadow_a"]["ret"]

    # Positions table rows
    pos_rows = ""
    for p in data["positions"]:
        gain_class = "positive" if p["gain_pct"] >= 0 else "negative"
        status_badge = "alvo" if p["is_alvo"] else "trans"
        pos_rows += f"""<tr>
            <td><span class="badge {status_badge}">{p['status']}</span></td>
            <td><strong>{p['ticker']}</strong></td>
            <td class="bucket-{p['bucket'].lower()}">{p['bucket']}</td>
            <td class="num">{p['qty']:,.2f}</td>
            <td class="num">${p['price_usd']:,.2f}</td>
            <td class="num">${p['value_usd']:,.0f}</td>
            <td class="num">R$ {p['value_brl']:,.0f}</td>
            <td class="num {gain_class}">{p['gain_pct']:+.1f}%</td>
        </tr>"""

    # Bucket summary rows
    bucket_rows = ""
    for b in data["bucket_summary"]:
        delta_class = "positive" if b["delta"] >= 0 else "negative"
        bucket_rows += f"""<tr>
            <td><strong>{b['bucket']}</strong></td>
            <td class="num">${b['value_usd']:,.0f}</td>
            <td class="num">R$ {b['value_brl']:,.0f}</td>
            <td class="num">{b['pct_equity']:.1f}%</td>
            <td class="num">{b['target_pct']:.0f}%</td>
            <td class="num {delta_class}">{b['delta']:+.1f}%</td>
            <td class="num {'positive' if b['gain_pct'] >= 0 else 'negative'}">{b['gain_pct']:+.1f}%</td>
        </tr>"""

    # TLH rows
    tlh_rows = ""
    for t in data["tlh"]:
        cls = "positive" if t["gain_pct"] >= 0 else "negative"
        signal = "🟢" if t["gain_pct"] >= 5 else ("🔴" if t["gain_pct"] <= -5 else "🟡")
        tlh_rows += f"""<tr>
            <td>{signal}</td>
            <td><strong>{t['ticker']}</strong></td>
            <td>{t['bucket']}</td>
            <td class="num">{t['qty']:,.2f}</td>
            <td class="num">${t['cost_usd']:,.2f}</td>
            <td class="num">${t['price_usd']:,.2f}</td>
            <td class="num {cls}">{t['gain_pct']:+.1f}%</td>
            <td class="num">${t['value_usd']:,.0f}</td>
        </tr>"""

    # Shadow table
    s = data["shadows"]

    # RF cards
    rf_cards = ""
    for nome, info in data["rf"].items():
        rf_cards += f"""<div class="rf-card">
            <div class="rf-label">{nome}</div>
            <div class="rf-value">R$ {info['valor_brl']:,.0f}</div>
            <div class="rf-tipo">{info['tipo']}</div>
        </div>"""

    # Aporte section — find most underweight bucket
    most_under = min(data["bucket_summary"], key=lambda b: b["delta"])
    aporte_target = most_under["bucket"]

    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carteira Diego — Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
    <style>
        :root {{
            --bg: #f8f9fa; --card: #ffffff; --text: #212529; --muted: #6c757d;
            --border: #dee2e6; --primary: #1976D2; --success: #4CAF50;
            --danger: #F44336; --warning: #FF9800; --purple: #9C27B0;
            --shadow: 0 1px 3px rgba(0,0,0,0.08);
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
               background: var(--bg); color: var(--text); line-height: 1.5; }}
        .container {{ max-width: 1400px; margin: 0 auto; padding: 16px; }}

        /* Header */
        .header {{ background: linear-gradient(135deg, #1a237e, #1976D2); color: white;
                   padding: 24px 32px; border-radius: 12px; margin-bottom: 20px;
                   display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }}
        .header h1 {{ font-size: 1.5rem; font-weight: 600; }}
        .header .meta {{ font-size: 0.85rem; opacity: 0.85; }}

        /* KPI Cards */
        .kpi-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                     gap: 16px; margin-bottom: 20px; }}
        .kpi {{ background: var(--card); border-radius: 10px; padding: 20px;
                box-shadow: var(--shadow); border-left: 4px solid var(--primary); }}
        .kpi-label {{ font-size: 0.8rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }}
        .kpi-value {{ font-size: 1.8rem; font-weight: 700; margin-top: 4px; }}
        .kpi-sub {{ font-size: 0.8rem; color: var(--muted); margin-top: 2px; }}
        .kpi.fire {{ border-left-color: var(--success); }}
        .kpi.cagr {{ border-left-color: var(--warning); }}
        .kpi.delta {{ border-left-color: var(--purple); }}

        /* Sections */
        .section {{ background: var(--card); border-radius: 10px; padding: 24px;
                    box-shadow: var(--shadow); margin-bottom: 20px; }}
        .section h2 {{ font-size: 1.1rem; font-weight: 600; margin-bottom: 16px;
                       padding-bottom: 8px; border-bottom: 2px solid var(--border); }}

        /* Grid layouts */
        .grid-2 {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }}
        .grid-3 {{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }}
        @media (max-width: 900px) {{ .grid-2, .grid-3 {{ grid-template-columns: 1fr; }} }}

        /* Charts */
        .chart-container {{ position: relative; max-height: 320px; }}

        /* Tables */
        table {{ width: 100%; border-collapse: collapse; font-size: 0.85rem; }}
        th {{ text-align: left; padding: 10px 8px; border-bottom: 2px solid var(--border);
              color: var(--muted); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }}
        td {{ padding: 8px; border-bottom: 1px solid var(--border); }}
        .num {{ text-align: right; font-variant-numeric: tabular-nums; }}
        .positive {{ color: var(--success); font-weight: 600; }}
        .negative {{ color: var(--danger); font-weight: 600; }}

        /* Badges */
        .badge {{ display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem;
                  font-weight: 600; text-transform: uppercase; }}
        .badge.alvo {{ background: #E3F2FD; color: #1565C0; }}
        .badge.trans {{ background: #FFF3E0; color: #E65100; }}

        /* Bucket colors */
        .bucket-swrd {{ color: #1976D2; font-weight: 600; }}
        .bucket-avgs {{ color: #388E3C; font-weight: 600; }}
        .bucket-avem {{ color: #F57C00; font-weight: 600; }}

        /* RF cards */
        .rf-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }}
        .rf-card {{ background: var(--bg); border-radius: 8px; padding: 14px; text-align: center; }}
        .rf-label {{ font-size: 0.75rem; color: var(--muted); font-weight: 600; }}
        .rf-value {{ font-size: 1.2rem; font-weight: 700; margin: 4px 0; }}
        .rf-tipo {{ font-size: 0.7rem; color: var(--muted); }}

        /* FIRE gauge */
        .fire-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center; }}
        .fire-scenario {{ background: var(--bg); border-radius: 10px; padding: 20px; }}
        .fire-scenario .label {{ font-size: 0.8rem; color: var(--muted); margin-bottom: 4px; }}
        .fire-scenario .value {{ font-size: 2.2rem; font-weight: 800; }}
        .fire-scenario .value.green {{ color: var(--success); }}
        .fire-scenario .value.yellow {{ color: var(--warning); }}
        .fire-scenario .bar {{ height: 6px; background: var(--border); border-radius: 3px; margin-top: 8px; }}
        .fire-scenario .bar-fill {{ height: 100%; border-radius: 3px; }}

        /* Aporte */
        .aporte-highlight {{ background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
                             border-radius: 10px; padding: 20px; text-align: center; }}
        .aporte-highlight .target {{ font-size: 1.5rem; font-weight: 700; color: var(--primary); }}
        .aporte-highlight .reason {{ font-size: 0.85rem; color: var(--muted); margin-top: 4px; }}

        /* Shadow table */
        .shadow-table th, .shadow-table td {{ text-align: center; }}
        .shadow-table td:first-child {{ text-align: left; }}

        /* Footer */
        .footer {{ text-align: center; padding: 16px; color: var(--muted); font-size: 0.75rem; }}
    </style>
</head>
<body>
<div class="container">

    <!-- Header -->
    <div class="header">
        <div>
            <h1>Carteira Diego</h1>
            <div class="meta">Atualizado: {data['date']} &bull; Câmbio: R$ {cambio:.2f}</div>
        </div>
        <div style="text-align: right;">
            <div style="font-size: 2rem; font-weight: 800;">R$ {pat_brl:,.0f}</div>
            <div class="meta">Patrimônio Total</div>
        </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
        <div class="kpi">
            <div class="kpi-label">Equity (USD)</div>
            <div class="kpi-value">${data['total_equity_usd']:,.0f}</div>
            <div class="kpi-sub">R$ {data['total_equity_brl']:,.0f} ({data['total_equity_brl']/pat_brl*100:.0f}%)</div>
        </div>
        <div class="kpi fire">
            <div class="kpi-label">P(FIRE) Base</div>
            <div class="kpi-value" style="color: var(--success);">{fire_base}%</div>
            <div class="kpi-sub">FIRE 53 | Fav {data['fire']['favoravel']}% | Stress {data['fire']['stress']}%</div>
        </div>
        <div class="kpi cagr">
            <div class="kpi-label">CAGR Histórico</div>
            <div class="kpi-value" style="color: var(--warning);">{cagr_pct:.1f}%</div>
            <div class="kpi-sub">Desde {data['cagr'].get('data_ini', '2021')} ({data['cagr'].get('anos', 0):.1f} anos)</div>
        </div>
        <div class="kpi delta">
            <div class="kpi-label">Delta vs VWRA (Q1)</div>
            <div class="kpi-value" style="color: var(--purple);">+{delta_a:.1f}pp</div>
            <div class="kpi-sub">Atual {s['q1_atual']['ret']:+.2f}% vs Shadow A {s['q1_shadow_a']['ret']:+.2f}%</div>
        </div>
    </div>

    <!-- Allocation + Buckets -->
    <div class="grid-2">
        <div class="section">
            <h2>Alocação por Classe</h2>
            <div class="chart-container">
                <canvas id="donutChart"></canvas>
            </div>
        </div>
        <div class="section">
            <h2>Delta vs Meta (Equity)</h2>
            <div class="chart-container">
                <canvas id="deltaChart"></canvas>
            </div>
            <table style="margin-top: 16px;">
                <thead><tr><th>Bucket</th><th class="num">USD</th><th class="num">BRL</th>
                    <th class="num">% Equity</th><th class="num">Meta</th><th class="num">Delta</th><th class="num">Ganho</th></tr></thead>
                <tbody>{bucket_rows}</tbody>
            </table>
        </div>
    </div>

    <!-- Positions Table -->
    <div class="section">
        <h2>Posições Detalhadas</h2>
        <table>
            <thead><tr><th>Status</th><th>Ticker</th><th>Bucket</th><th class="num">Qtde</th>
                <th class="num">Preço</th><th class="num">Valor USD</th><th class="num">Valor BRL</th>
                <th class="num">Ganho</th></tr></thead>
            <tbody>{pos_rows}</tbody>
        </table>
    </div>

    <!-- FIRE + Shadows -->
    <div class="grid-2">
        <div class="section">
            <h2>FIRE Status</h2>
            <div class="fire-grid">
                <div class="fire-scenario">
                    <div class="label">Base</div>
                    <div class="value green">{data['fire']['base']}%</div>
                    <div class="bar"><div class="bar-fill" style="width: {data['fire']['base']}%; background: var(--success);"></div></div>
                </div>
                <div class="fire-scenario">
                    <div class="label">Favorável</div>
                    <div class="value green">{data['fire']['favoravel']}%</div>
                    <div class="bar"><div class="bar-fill" style="width: {data['fire']['favoravel']}%; background: var(--success);"></div></div>
                </div>
                <div class="fire-scenario">
                    <div class="label">Stress</div>
                    <div class="value yellow">{data['fire']['stress']}%</div>
                    <div class="bar"><div class="bar-fill" style="width: {data['fire']['stress']}%; background: var(--warning);"></div></div>
                </div>
            </div>
            <div style="margin-top: 16px; font-size: 0.85rem; color: var(--muted);">
                Pat. mediano: R$ {data['fire']['patrimonio_mediano']:,.0f} &bull;
                Gatilho: R$ {data['fire']['gatilho']:,.0f}
            </div>
        </div>
        <div class="section">
            <h2>Shadow Portfolios (Q1 2026)</h2>
            <table class="shadow-table">
                <thead><tr><th>Portfolio</th><th>Retorno</th><th>Patrimônio</th></tr></thead>
                <tbody>
                    <tr><td><strong>Atual</strong></td><td class="positive">+{s['q1_atual']['ret']:.2f}%</td><td>R$ {s['q1_atual']['pat']:,.0f}</td></tr>
                    <tr><td>Target</td><td class="negative">{s['q1_target']['ret']:+.2f}%</td><td>R$ {s['q1_target']['pat']:,.0f}</td></tr>
                    <tr><td>Shadow A (VWRA)</td><td class="negative">{s['q1_shadow_a']['ret']:+.2f}%</td><td>R$ {s['q1_shadow_a']['pat']:,.0f}</td></tr>
                    <tr><td>Shadow B (IPCA+)</td><td class="positive">+{s['q1_shadow_b']['ret']:.2f}%</td><td>R$ {s['q1_shadow_b']['pat']:,.0f}</td></tr>
                </tbody>
            </table>
            <div style="margin-top: 12px; font-size: 0.8rem; color: var(--muted);">
                T0: {s['t0_date']} &bull; R$ {s['t0_pat']:,.0f}
            </div>
        </div>
    </div>

    <!-- Aporte + RF -->
    <div class="grid-2">
        <div class="section">
            <h2>Aporte do Mês</h2>
            <div class="aporte-highlight">
                <div class="target">→ {aporte_target}</div>
                <div class="reason">Maior underweight: {most_under['delta']:+.1f}% vs meta</div>
            </div>
            <div style="margin-top: 16px; font-size: 0.85rem;">
                <p>Aporte mensal: <strong>R$ 25.000</strong></p>
                <p>Equivalente: <strong>${25000/cambio:,.0f} USD</strong> @ R$ {cambio:.2f}</p>
                <p>IOF+Spread: R$ {25000*0.0135:.0f} (1.35%)</p>
            </div>
        </div>
        <div class="section">
            <h2>Renda Fixa + Crypto</h2>
            <div class="rf-grid">{rf_cards}</div>
            <div style="margin-top: 12px; font-size: 0.8rem; color: var(--muted);">
                Total: R$ {data['total_rf_brl']:,.0f} ({data['total_rf_brl']/pat_brl*100:.1f}% do portfolio)
            </div>
        </div>
    </div>

    <!-- TLH Monitor -->
    <div class="section">
        <h2>TLH Monitor — Transitórios</h2>
        <table>
            <thead><tr><th></th><th>Ticker</th><th>Bucket</th><th class="num">Qtde</th>
                <th class="num">PM (USD)</th><th class="num">Preço</th><th class="num">Ganho</th>
                <th class="num">Valor</th></tr></thead>
            <tbody>{tlh_rows}</tbody>
        </table>
        <div style="margin-top: 8px; font-size: 0.75rem; color: var(--muted);">
            🟢 Lucro ≥5% &bull; 🟡 ±5% &bull; 🔴 Perda ≥5% (oportunidade TLH)
        </div>
    </div>

    <div class="footer">
        Gerado por <code>scripts/dashboard.py</code> em {datetime.now().strftime('%Y-%m-%d %H:%M')}
        &bull; Dados: IBKR + yfinance + BCB
    </div>
</div>

<script>
// Donut Chart — Alocação
new Chart(document.getElementById('donutChart'), {{
    type: 'doughnut',
    data: {{
        labels: {allocation_labels},
        datasets: [{{ data: {allocation_values}, backgroundColor: {allocation_colors},
                      borderWidth: 0, hoverOffset: 8 }}]
    }},
    options: {{
        responsive: true, maintainAspectRatio: true,
        cutout: '55%',
        plugins: {{
            legend: {{ position: 'right', labels: {{ padding: 12, usePointStyle: true, font: {{ size: 12 }} }} }},
            tooltip: {{ callbacks: {{
                label: (ctx) => {{
                    const val = ctx.raw;
                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                    const pct = (val / total * 100).toFixed(1);
                    return `${{ctx.label}}: R$ ${{val.toLocaleString('pt-BR')}} (${{pct}}%)`;
                }}
            }} }}
        }}
    }}
}});

// Delta Bar Chart
new Chart(document.getElementById('deltaChart'), {{
    type: 'bar',
    data: {{
        labels: {bucket_labels},
        datasets: [{{
            data: {bucket_deltas},
            backgroundColor: {bucket_colors},
            borderRadius: 6, barThickness: 40
        }}]
    }},
    options: {{
        indexAxis: 'y', responsive: true, maintainAspectRatio: true,
        plugins: {{ legend: {{ display: false }},
                   tooltip: {{ callbacks: {{ label: (ctx) => `${{ctx.raw > 0 ? '+' : ''}}${{ctx.raw}}% vs meta` }} }} }},
        scales: {{
            x: {{ grid: {{ color: '#eee' }}, ticks: {{ callback: (v) => v + '%' }} }},
            y: {{ grid: {{ display: false }} }}
        }}
    }}
}});
</script>
</body>
</html>"""

    return html


# ─── MAIN ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Dashboard HTML — Carteira Diego")
    parser.add_argument("--cambio", type=float, default=None, help="Override câmbio USD/BRL")
    parser.add_argument("--output", type=str, default=OUTPUT_PATH, help="Caminho do HTML")
    parser.add_argument("--open", action="store_true", help="Abrir no browser após gerar")
    args = parser.parse_args()

    data = collect_all(cambio_override=args.cambio)
    html = generate_html(data)

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"\n✅ Dashboard salvo em: {args.output}")

    if args.open:
        webbrowser.open(f"file://{os.path.abspath(args.output)}")


if __name__ == "__main__":
    main()
