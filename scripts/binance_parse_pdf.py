#!/usr/bin/env python3
"""
binance_parse_pdf.py — Extrai saldos do Account Statement PDF da Binance.

Lê: analysis/raw/<arquivo>.pdf  (mais recente com "binance" no nome, ou via --pdf)
Gera: dados/binance/saldo.json  (spot + earn por coin)

Uso:
  python3 scripts/binance_parse_pdf.py
  python3 scripts/binance_parse_pdf.py --pdf analysis/raw/binance_saldo.pdf
  python3 scripts/binance_parse_pdf.py --dry-run
"""

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT     = Path(__file__).parent.parent
RAW_DIR  = ROOT / "analysis" / "raw"
OUT_PATH = ROOT / "dados" / "binance" / "saldo.json"

IGNORE_COINS = {"USDT", "USDC", "BUSD", "BRL", "EUR", "GBP", "FDUSD"}

SPOT_MARKER = "Spot Top 10 Holdings"
EARN_MARKER = "Earn Top 10 Holdings"

# Símbolo: all-caps, termina antes do primeiro CamelCase (ex: BTCBitcoin → BTC)
SYMBOL_RE = re.compile(r"([A-Z]{2,10})(?=[A-Z][a-z]|\s)")

# Linha de holding: SYMBOL CoinName <qty_segment> / <change>
# Nome pode ter espaço antes (ETH Ethereum) ou não (BTCBitcoin), e '.' (ether.fi)
ROW_RE = re.compile(
    r"([A-Z]{2,10})(?=[A-Z][a-z]|\s)"   # 1: símbolo
    r"[A-Za-z\s.]+?"                     # nome do coin (lazy, para na 1ª sequência de dígitos)
    r"(?=\d)"                            # lookahead: começa o qty
    r"([\d.]+(?:\s+[\d.,]+)?)"          # 2: qty block (espaçado ou concatenado)
    r"\s*/",                            # terminador
    re.MULTILINE,
)


def extract_qty(qty_block: str) -> float:
    """
    Extrai a quantidade ATUAL de um bloco que pode ser:
      - espaçado: "0.205195 0.000000"  → retorna 0.205195
      - concatenado: "0.0043540.004351" → retorna 0.004354 (half-split)
    """
    parts = qty_block.strip().split()
    if len(parts) >= 2:
        # Espaçado: primeiro token é o valor atual
        try:
            return float(parts[0])
        except ValueError:
            pass

    # Concatenado: tenta half-split (Binance usa mesma precisão para ambos os números)
    raw = parts[0] if parts else qty_block.strip()
    if len(raw) % 2 == 0:
        half = len(raw) // 2
        try:
            return float(raw[:half])
        except ValueError:
            pass

    # Fallback: primeiro número válido (pode ser levemente errado para earn concatenado)
    m = re.match(r"(\d+\.\d+)", raw)
    return float(m.group(1)) if m else 0.0


def parse_holdings_section(text: str) -> dict[str, float]:
    """Extrai {COIN: qty} de um bloco de texto (Spot ou Earn)."""
    result: dict[str, float] = {}
    for m in ROW_RE.finditer(text):
        symbol = m.group(1)
        if symbol in IGNORE_COINS:
            continue
        qty = extract_qty(m.group(2))
        if qty > 0:
            result[symbol] = qty
    return result


def extract_balances(pdf_path: Path) -> tuple[dict, dict, str]:
    import pdfplumber

    spot: dict[str, float] = {}
    earn: dict[str, float] = {}
    report_date = str(date.today())
    first_page_text = ""

    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            if i == 0:
                first_page_text = text
            if SPOT_MARKER in text:
                spot = parse_holdings_section(text)
            if EARN_MARKER in text:
                earn = parse_holdings_section(text)

    m = re.search(r"(\d{4}/\d{2}/\d{2})", first_page_text)
    if m:
        report_date = m.group(1).replace("/", "-")

    return spot, earn, report_date


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", help="Caminho do PDF (default: mais recente com 'binance' em analysis/raw/)")
    parser.add_argument("--out", default=str(OUT_PATH))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.pdf:
        pdf_path = Path(args.pdf)
    else:
        pdfs = sorted(
            (p for p in RAW_DIR.glob("*.pdf") if "binance" in p.name.lower()),
            key=lambda p: p.stat().st_mtime, reverse=True,
        ) if RAW_DIR.exists() else []
        pdf_path = pdfs[0] if pdfs else None

    if not pdf_path or not pdf_path.exists():
        print(f"❌ PDF não encontrado em {RAW_DIR}/")
        print("   Coloque o extrato lá ou use --pdf <caminho>")
        sys.exit(1)

    print(f"  ▶ binance_parse_pdf: {pdf_path.name}")
    spot, earn, report_date = extract_balances(pdf_path)

    if not spot and not earn:
        print("❌ Nenhum saldo encontrado — estrutura do PDF pode ter mudado.")
        sys.exit(1)

    all_coins = sorted(set(spot) | set(earn))
    balances = {
        coin: {
            "spot": round(spot.get(coin, 0.0), 8),
            "earn": round(earn.get(coin, 0.0), 8),
        }
        for coin in all_coins
        if spot.get(coin, 0.0) > 0 or earn.get(coin, 0.0) > 0
    }

    print(f"  → data do extrato: {report_date}")
    print(f"  → {len(balances)} coins:")
    for coin, b in balances.items():
        print(f"      {coin:8s}  spot={b['spot']:.8f}  earn={b['earn']:.8f}")

    out_data = {
        "_source":      pdf_path.name,
        "_report_date": report_date,
        "_nota":        "Gerado por binance_parse_pdf.py. Atualizar ao receber novo extrato.",
        "balances":     balances,
    }

    if args.dry_run:
        print("\n[dry-run] saldo.json seria:")
        print(json.dumps(out_data, indent=2, ensure_ascii=False))
        return

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out_data, indent=2, ensure_ascii=False))
    print(f"  ✓ salvo → {out_path.relative_to(ROOT)}")
    print()
    print("  Próximo passo:")
    print("    python3 scripts/binance_analysis.py  # valoriza com preços ao vivo")


if __name__ == "__main__":
    main()
