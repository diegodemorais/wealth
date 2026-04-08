#!/usr/bin/env python3
"""
ibkr_sync.py — Sync automático de posições IBKR via Flex Query

Uso:
    python3 scripts/ibkr_sync.py                  # posições atuais + diff vs carteira.md
    python3 scripts/ibkr_sync.py --trades         # últimos trades (30 dias)
    python3 scripts/ibkr_sync.py --save           # salva snapshot em data/ibkr_snapshot.json

Configuração (.env):
    IBKR_TOKEN=<Flex Web Service token>
    IBKR_QUERY_POSITIONS=<Query ID — Open Positions>
    IBKR_QUERY_TRADES=<Query ID — Trades (opcional)>

Como obter token e query ID:
    1. IBKR Account Management → Reports → Flex Queries → Create Query
       - Selecionar: Open Positions, Trades (opcional)
       - Format: XML
       - Anotar o Query ID
    2. IBKR Account Management → Settings → Account Settings
       - Flex Web Service → gerar token (Read-Only)
    3. Adicionar ao .env:
       IBKR_TOKEN=xxxxxxxx
       IBKR_QUERY_POSITIONS=yyyyyyyy

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import json
import os
import sys
import argparse
import xml.etree.ElementTree as ET
from datetime import datetime, date, timedelta
from pathlib import Path

from dotenv import load_dotenv
from ibflex import client

import sys as _sys
_sys.path.insert(0, str(Path(__file__).parent))
from config import EQUITY_WEIGHTS as TARGET_EQUITY, BUCKET_MAP

load_dotenv(Path(__file__).parent.parent / ".env")

# ── Configuração ──────────────────────────────────────────────────────────────

CAMBIO_REF = 5.20        # fallback; idealmente buscar do BCB

# Mapa símbolo IBKR → nome canônico (para exibição)
SYMBOL_MAP = {k: k for k in BUCKET_MAP}
SYMBOL_MAP["WRDUSWUSD"] = "WRDUSW"

DATA_DIR  = Path(__file__).parent.parent / "data"
SNAP_PATH = DATA_DIR / "ibkr_snapshot.json"

SEP = "─" * 62


# ── Fetch ─────────────────────────────────────────────────────────────────────

def fetch_raw(token: str, query_id: str) -> bytes:
    """Puxa Flex Query do IBKR. Usa ndcdyn (resolve) em vez de gdcdyn (bloqueado)."""
    print(f"  Conectando ao IBKR Flex Web Service...")
    client.REQUEST_URL = "https://ndcdyn.interactivebrokers.com/Universal/servlet/FlexStatementService.SendRequest"
    client.STMT_URL    = "https://ndcdyn.interactivebrokers.com/Universal/servlet/FlexStatementService.GetStatement"
    return client.download(token=token, query_id=query_id)


def fetch_raw_file(xml_path: str) -> bytes:
    """Lê XML baixado manualmente."""
    print(f"  Parseando arquivo local: {xml_path}")
    with open(xml_path, "rb") as f:
        return f.read()


# ── Parser XML direto (ibflex não suporta subCategory) ────────────────────────

def _float(val: str) -> float:
    try:
        return float(val) if val else 0.0
    except ValueError:
        return 0.0


def extract_positions(raw: bytes) -> list[dict]:
    """Extrai OpenPositions do XML via ElementTree (evita limitações do ibflex)."""
    root = ET.fromstring(raw)
    positions = []
    for pos in root.iter("OpenPosition"):
        if pos.get("levelOfDetail") != "SUMMARY":
            continue
        sym_ibkr = pos.get("symbol", "")
        symbol   = SYMBOL_MAP.get(sym_ibkr, sym_ibkr)
        cost_usd = _float(pos.get("costBasisMoney"))
        pnl_usd  = _float(pos.get("fifoPnlUnrealized"))
        positions.append({
            "symbol":      symbol,
            "symbol_ibkr": sym_ibkr,
            "qty":         _float(pos.get("position")),
            "price_usd":   _float(pos.get("markPrice")),
            "value_usd":   _float(pos.get("positionValue")),
            "cost_usd":    cost_usd,
            "pnl_usd":     pnl_usd,
            "pnl_pct":     (pnl_usd / cost_usd * 100) if cost_usd else 0.0,
            "currency":    pos.get("currency", "USD"),
            "exchange":    pos.get("listingExchange", ""),
            "isin":        pos.get("isin", ""),
            "report_date": pos.get("reportDate", ""),
        })
    return positions


def extract_trades(raw: bytes, days: int = 30) -> list[dict]:
    """Extrai Trades do XML via ElementTree."""
    cutoff = date.today() - timedelta(days=days)
    root   = ET.fromstring(raw)
    trades = []
    for t in root.iter("Trade"):
        if t.get("levelOfDetail") != "EXECUTION":
            continue
        td_str = t.get("tradeDate", "")
        try:
            td = datetime.strptime(td_str, "%Y%m%d").date()
        except ValueError:
            continue
        if td < cutoff:
            continue
        sym_ibkr = t.get("symbol", "")
        trades.append({
            "date":       str(td),
            "symbol":     SYMBOL_MAP.get(sym_ibkr, sym_ibkr),
            "buySell":    t.get("buySell", "?"),
            "qty":        _float(t.get("quantity")),
            "price":      _float(t.get("tradePrice")),
            "net_cash":   _float(t.get("netCash")),
            "commission": _float(t.get("ibCommission")),
            "currency":   t.get("currency", "USD"),
            "exchange":   t.get("exchange", ""),
            "pnl":        _float(t.get("fifoPnlRealized")),
        })
    return sorted(trades, key=lambda x: x["date"], reverse=True)


# ── Análise de posições ───────────────────────────────────────────────────────

def analyze_positions(positions: list[dict], cambio: float) -> None:
    """Imprime snapshot + drift vs target.

    Buckets: transitórios são agrupados no ETF target equivalente.
    AVGS bucket = AVGS + AVUV + AVDV + USSC + ZPRX
    AVEM bucket = AVEM + EIMI + AVES + DGS + EMVL
    JPGL bucket = JPGL + IWVL + IWQU (target 0%, legado)
    """

    # Acumula valor por bucket
    buckets: dict[str, float] = {}
    bucket_detail: dict[str, list[dict]] = {}
    outros: dict[str, float] = {}

    for p in positions:
        sym   = p["symbol"]
        bkt   = BUCKET_MAP.get(sym)
        if bkt:
            buckets[bkt] = buckets.get(bkt, 0) + p["value_usd"]
            bucket_detail.setdefault(bkt, []).append(p)
        else:
            outros[sym] = outros.get(sym, 0) + p["value_usd"]

    # Total equity = todos os buckets (incl. JPGL que é 0% target)
    total_equity_usd = sum(buckets.values())
    total_usd        = total_equity_usd + sum(outros.values())
    total_brl        = total_usd * cambio

    print(f"\n{SEP}")
    print(f"  SNAPSHOT IBKR — {date.today()}")
    print(f"  Total USD: ${total_usd:,.0f}  |  Total BRL: R${total_brl:,.0f}  |  Câmbio: {cambio:.2f}")
    print(SEP)

    # ── Buckets target ──
    print(f"\n  {'Bucket':<8} {'USD (bucket)':>14} {'BRL':>13} {'% equity':>10} {'Target':>8} {'Drift':>8}")
    print("  " + "─" * 68)
    for bkt, target_pct in {**TARGET_EQUITY, "JPGL": 0.0}.items():
        val = buckets.get(bkt, 0)
        pct = val / total_equity_usd if total_equity_usd else 0
        drift = pct - target_pct
        if bkt == "JPGL":
            flag = "✅" if val == 0 else "⚠️ "
        else:
            flag = "✅" if abs(drift) <= 0.03 else ("⬆️ " if drift > 0 else "⬇️ ")
        print(f"  {flag} {bkt:<6}  ${val:>12,.0f}  R${val*cambio:>11,.0f} {pct:>9.1%}  {target_pct:>7.1%}  {drift:>+7.1%}")

        # Detalhe dos ETFs dentro do bucket
        for p in sorted(bucket_detail.get(bkt, []), key=lambda x: -x["value_usd"]):
            sym_label = p["symbol_ibkr"] if p["symbol_ibkr"] != p["symbol"] else p["symbol"]
            is_ucits = p["exchange"] in ("LSEETF", "LSE", "LSEAIM")
            tag = " [UCITS]" if is_ucits else " [US]"
            print(f"           {sym_label:<8}{tag:<8}  ${p['value_usd']:>8,.0f}  ({p['value_usd']/total_equity_usd:.1%})  P&L: {p['pnl_pct']:>+.1f}%")

    # ── Outros ──
    if outros:
        print(f"\n  Outros ativos IBKR (não mapeados):")
        for s, val in sorted(outros.items(), key=lambda x: -x[1]):
            print(f"       {s:<10}  ${val:>8,.0f}  R${val*cambio:>8,.0f}")

    # ── Alertas ──
    print(f"\n  Alertas de drift (tolerância ±3pp):")
    alertas = 0
    for bkt, target_pct in TARGET_EQUITY.items():
        val  = buckets.get(bkt, 0)
        pct  = val / total_equity_usd if total_equity_usd else 0
        drift = pct - target_pct
        if abs(drift) > 0.03:
            alertas += 1
            dir_str = "OVERWEIGHT" if drift > 0 else "UNDERWEIGHT"
            print(f"  ⚠️   {bkt}: {dir_str} {drift:+.1%} (atual {pct:.1%} vs target {target_pct:.1%})")
    jpgl_val = buckets.get("JPGL", 0)
    if jpgl_val > 0:
        alertas += 1
        print(f"  ⚠️   JPGL bucket: R${jpgl_val*cambio:,.0f} ainda presente (target 0% — diluir via aportes)")
    if not alertas:
        print(f"  ✅  Sem drifts relevantes (todos dentro de ±3pp do target).")


def print_trades(trades: list[dict]) -> None:
    print(f"\n{SEP}")
    print(f"  TRADES RECENTES (últimos 30 dias)")
    print(SEP)
    if not trades:
        print("  Nenhum trade no período.")
        return
    print(f"  {'Data':<12} {'B/S':<5} {'ETF':<8} {'Qtd':>8} {'Preço':>9} {'Net Cash':>12} {'P&L':>10}")
    print("  " + "─" * 70)
    for t in trades:
        bs = "BUY" if "BUY" in t["buySell"].upper() else "SELL"
        flag = "🟢" if bs == "BUY" else "🔴"
        pnl_str = f"${t['pnl']:>+,.0f}" if t["pnl"] else "   —"
        print(f"  {flag} {t['date']:<10}  {bs:<5} {t['symbol']:<8} {t['qty']:>7.2f}  ${t['price']:>7.2f}  ${t['net_cash']:>9,.0f}  {pnl_str:>9}")


# ── Save snapshot ─────────────────────────────────────────────────────────────

def save_snapshot(positions: list[dict], cambio: float) -> None:
    snapshot = {
        "date":      str(date.today()),
        "cambio":    cambio,
        "positions": positions,
    }
    SNAP_PATH.parent.mkdir(exist_ok=True)
    with open(SNAP_PATH, "w") as f:
        json.dump(snapshot, f, indent=2, default=str)
    print(f"\n  💾 Snapshot salvo em: data/ibkr_snapshot.json")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser_args = argparse.ArgumentParser(description="IBKR Flex Query Sync")
    parser_args.add_argument("--trades", action="store_true", help="Mostrar trades recentes (30 dias)")
    parser_args.add_argument("--save",   action="store_true", help="Salvar snapshot em data/ibkr_snapshot.json")
    parser_args.add_argument("--cambio", type=float, default=CAMBIO_REF, help=f"Câmbio BRL/USD (default: {CAMBIO_REF})")
    parser_args.add_argument("--file",   type=str,   default=None, help="Parsear XML local (workaround se Flex Web Service inacessível)")
    args = parser_args.parse_args()

    token    = os.getenv("IBKR_TOKEN")
    query_id = os.getenv("IBKR_QUERY_POSITIONS")

    if not args.file and (not token or not query_id):
        print("\n❌  Configuração incompleta no .env:")
        print("    IBKR_TOKEN e IBKR_QUERY_POSITIONS são obrigatórios.\n")
        print("  Como configurar:")
        print("  1. IBKR Account Management → Reports → Flex Queries")
        print("     → New Query → selecionar 'Open Positions' + 'Trades'")
        print("     → Format: XML → salvar → anotar o Query ID")
        print("  2. Settings → Account Settings → Flex Web Service → Create Token")
        print("  3. Adicionar ao .env:")
        print("     IBKR_TOKEN=xxxxxxxx")
        print("     IBKR_QUERY_POSITIONS=yyyyyyyy")
        print("\n  Alternativa (sem API): baixar XML manualmente no portal IBKR e usar:")
        print("     python3 scripts/ibkr_sync.py --file caminho/para/arquivo.xml")
        sys.exit(1)

    try:
        if args.file:
            raw = fetch_raw_file(args.file)
        else:
            raw = fetch_raw(token, query_id)
        positions = extract_positions(raw)

        if not positions:
            print("  ⚠️  Nenhuma posição encontrada. Verificar configuração da Flex Query.")
            sys.exit(1)

        analyze_positions(positions, args.cambio)

        if args.trades:
            trades = extract_trades(raw)
            print_trades(trades)

        if args.save:
            save_snapshot(positions, args.cambio)

        print(f"\n{SEP}\n")

    except Exception as e:
        print(f"\n❌  Erro ao conectar ao IBKR: {e}")
        print("    Verificar token, query ID e conectividade.\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
