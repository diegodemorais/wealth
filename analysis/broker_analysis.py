#!/usr/bin/env python3
"""
Broker Analysis — Multi-corretora (IBKR + XP + futuro Nubank)
Orquestra parsing de extratos e gera outputs padronizados em dados/<broker>/

Uso:
    python3 analysis/broker_analysis.py                # roda todos os brokers
    python3 analysis/broker_analysis.py --broker xp    # só XP
    python3 analysis/broker_analysis.py --broker ibkr  # só IBKR (delega ao ibkr_analysis.py)
"""

import json
import re
import subprocess
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).parent.parent
XP_PDF_DIR = ROOT / "analysis" / "raw" / "negociacoes xp"
XP_OUTPUT_DIR = ROOT / "dados" / "xp"
IBKR_SCRIPT = ROOT / "analysis" / "ibkr_analysis.py"


# ═══════════════════════════════════════════════════════════════════════════════
# XP PARSER — Notas de Corretagem PDF
# ═══════════════════════════════════════════════════════════════════════════════

# Mapeamento nome nota XP → ticker B3
XP_SYMBOL_MAP = {
    "INVESTO HODL": "HODL11",
    "IT NOW B5P2": "B5P211",
    "HASHDEX NCI": "HASH11",
    "BRADESCO": "BBDC4",
    "FII REC RECE": "RECR11",
    "FII CAPI SEC": "CPTS11",
    "FII KINEA IP": "KNIP11",
    "FII RBR PROP": "RBRP11",
    "FII RIZA TX": "RZTR11",
    "FII SUNOFOFI": "SNFF11",
}


def _extract_text(pdf_path: Path) -> str:
    """Extrai texto de PDF via pdftotext."""
    result = subprocess.run(
        ["pdftotext", str(pdf_path), "-"],
        capture_output=True, text=True, timeout=30
    )
    if result.returncode != 0:
        raise RuntimeError(f"pdftotext falhou: {result.stderr}")
    return result.stdout


def _parse_xp_nota(text: str) -> list[dict]:
    """
    Parseia texto de uma nota XP e retorna lista de operações.

    Layout pdftotext das notas XP:
    - Após "Preço / Ajuste": números INTEIROS = quantidades (pdftotext mistura colunas)
    - Números decimais soltos (##,##) entre Resumo e "Valor Operação" = preços unitários
    - Após "D/C": decimais grandes (###.###,##) = valores totais por operação
    - Preço derivado: valor / qty (mais confiável que parsear preço direto)
    """
    operations = []

    # Dividir por notas individuais
    notas = text.split("NOTA DE NEGOCIAÇÃO")
    if len(notas) < 2:
        return operations

    for nota_text in notas[1:]:
        # Extrair data do pregão
        date_match = re.search(r"(\d{2}/\d{2}/\d{4})\s*\n\s*\n\s*(?:RIO DE JANEIRO|SÃO PAULO)", nota_text)
        if not date_match:
            continue
        trade_date = datetime.strptime(date_match.group(1), "%d/%m/%Y").date()

        # Pular se é página CONTINUA... sem dados novos de operações
        if "CONTINUA..." in nota_text and "Valor Operação / Ajuste" not in nota_text:
            continue

        # ── C/V ──
        cv_section = nota_text.split("C/V Tipo mercado")
        if len(cv_section) < 2:
            continue
        after_cv = cv_section[1]

        # Bloco entre C/V e Especificação (ou Prazo)
        for sep in ["Especificação do título", "Prazo Especificação do título", "Prazo"]:
            if sep in after_cv:
                cv_block = after_cv.split(sep)[0]
                break
        else:
            cv_block = after_cv[:300]
        cvs = re.findall(r'\b(C|V)\b', cv_block)

        # ── Tickers / nomes ──
        spec_block = ""
        for sep in ["Especificação do título", "Prazo Especificação do título"]:
            if sep in after_cv:
                parts = after_cv.split(sep)[1]
                spec_block = parts.split("Resumo dos Negócios")[0] if "Resumo dos Negócios" in parts else parts[:800]
                break
        if not spec_block and "Prazo" in after_cv:
            parts = after_cv.split("Prazo")
            if len(parts) > 1:
                spec_block = parts[1].split("Resumo dos Negócios")[0] if "Resumo dos Negócios" in parts[1] else parts[1][:800]

        # Extrair nomes XP (preservar ordem de aparição)
        specs = []
        # Usar regex para encontrar cada ocorrência em ordem
        pattern_names = "|".join(re.escape(name) for name in sorted(XP_SYMBOL_MAP.keys(), key=len, reverse=True))
        for m in re.finditer(pattern_names, spec_block):
            specs.append(m.group(0))

        if not specs:
            # Fallback: tickers B3 direto
            reverse_map = {v: k for k, v in XP_SYMBOL_MAP.items()}
            for m in re.finditer(r'\b([A-Z]{4}\d{2})\b', spec_block):
                t = m.group(1)
                if t in reverse_map:
                    specs.append(reverse_map[t])

        # ── Quantidades (inteiros após "Preço / Ajuste") ──
        qtys = []
        if "Preço / Ajuste" in after_cv:
            qty_block = after_cv.split("Preço / Ajuste")[1]
            qty_block = qty_block.split("Resumo Financeiro")[0] if "Resumo Financeiro" in qty_block else qty_block.split("Resumo dos Negócios")[0] if "Resumo dos Negócios" in qty_block else qty_block[:300]
            qtys = [int(x) for x in re.findall(r'^(\d+)$', qty_block, re.MULTILINE)]

        # ── Valores totais (após "D/C" no bloco Valor Operação) ──
        valores = []
        dc_block = ""
        if "D/C" in after_cv:
            # Pegar o último bloco D/C (pode haver mais de um)
            dc_parts = after_cv.split("D/C")
            dc_block = dc_parts[-1]
            # Extrair decimais BR até encontrar padrão de resumo
            dc_block_clean = dc_block.split("Total Custos")[0] if "Total Custos" in dc_block else dc_block[:500]
            valores = _extract_decimal_numbers(dc_block_clean)

        # ── Montar operações (qty + valor → derivar preço) ──
        n = min(len(cvs), len(specs))
        if n == 0:
            continue

        for i in range(n):
            qty = qtys[i] if i < len(qtys) else None
            valor = valores[i] if i < len(valores) else None
            preco = round(valor / qty, 2) if qty and valor else None

            op = {
                "data": trade_date.isoformat(),
                "cv": "C" if cvs[i] == "C" else "V",
                "ativo_xp": specs[i],
                "ticker": XP_SYMBOL_MAP.get(specs[i], specs[i]),
                "qty": qty,
                "preco": preco,
                "valor": round(valor, 2) if valor else None,
            }
            operations.append(op)

    return operations


def _extract_numbers(text: str, integers_only: bool = False) -> list:
    """Extrai números de um bloco de texto."""
    if integers_only:
        return [int(x) for x in re.findall(r'\b(\d+)\b', text)]
    return [float(x.replace(",", ".")) for x in re.findall(r'[\d]+[,.]?[\d]*', text)]


def _extract_decimal_numbers(text: str) -> list[float]:
    """Extrai números decimais (formato BR: 1.234,56 ou simples: 78,30)."""
    numbers = []
    # Padrão: 29.519,10 ou 78,30 ou 3.915,00
    for match in re.finditer(r'(\d{1,3}(?:\.\d{3})*,\d{2})', text):
        val_str = match.group(1).replace(".", "").replace(",", ".")
        numbers.append(float(val_str))
    # Fallback: números simples com ponto decimal (formato US)
    if not numbers:
        for match in re.finditer(r'(\d+\.\d{2,4})', text):
            numbers.append(float(match.group(1)))
    return numbers


def parse_xp_pdfs() -> list[dict]:
    """Parseia todos os PDFs de notas XP e retorna lista consolidada de operações."""
    if not XP_PDF_DIR.exists():
        print(f"  ⚠ Diretório não encontrado: {XP_PDF_DIR}")
        return []

    pdfs = sorted(XP_PDF_DIR.glob("*.pdf"))
    if not pdfs:
        print(f"  ⚠ Nenhum PDF encontrado em {XP_PDF_DIR}")
        return []

    all_ops = []
    for pdf in pdfs:
        try:
            text = _extract_text(pdf)
            ops = _parse_xp_nota(text)
            print(f"  ✓ {pdf.name}: {len(ops)} operação(ões)")
            all_ops.extend(ops)
        except Exception as e:
            print(f"  ✗ {pdf.name}: {e}")

    return sorted(all_ops, key=lambda x: x["data"])


# ═══════════════════════════════════════════════════════════════════════════════
# XP ANÁLISE — Lotes, P&L, Avg Cost
# ═══════════════════════════════════════════════════════════════════════════════

# Dados avulsos — operações de outras corretoras cujo preço não consta nas notas XP
EXTERNAL_COST = {
    "HASH11": {"avg_cost_brl": 40.35, "nota": "PM da carteira viva (aba crypto), comprado fora da XP"},
}


def build_xp_lots(operations: list[dict]) -> tuple[dict, list[dict]]:
    """
    FIFO por ticker. Retorna (lotes_abertos, pnl_realizado).
    Para ativos com custo externo (HASH11), usa EXTERNAL_COST.
    """
    open_lots: dict[str, list] = defaultdict(list)
    realized = []

    for op in operations:
        ticker = op["ticker"]
        qty = op.get("qty")
        preco = op.get("preco")

        if qty is None or preco is None:
            continue

        if op["cv"] == "C":
            open_lots[ticker].append({
                "data": op["data"],
                "qty": qty,
                "custo_por_cota": preco,
            })
        elif op["cv"] == "V":
            sell_qty = qty
            sell_price = preco

            # Se não tem lotes abertos mas tem custo externo
            if not open_lots[ticker] and ticker in EXTERNAL_COST:
                ext = EXTERNAL_COST[ticker]
                open_lots[ticker].append({
                    "data": "externo",
                    "qty": sell_qty,
                    "custo_por_cota": ext["avg_cost_brl"],
                })

            remaining = sell_qty
            while remaining > 0 and open_lots[ticker]:
                lot = open_lots[ticker][0]
                matched = min(lot["qty"], remaining)
                gain = (sell_price - lot["custo_por_cota"]) * matched
                realized.append({
                    "data_venda": op["data"],
                    "ticker": ticker,
                    "qty": matched,
                    "custo_cota": round(lot["custo_por_cota"], 2),
                    "venda_cota": round(sell_price, 2),
                    "pnl_brl": round(gain, 2),
                    "data_compra": lot["data"],
                })
                lot["qty"] -= matched
                remaining -= matched
                if lot["qty"] <= 0:
                    open_lots[ticker].pop(0)

    return dict(open_lots), realized


def generate_xp_outputs(operations: list[dict], open_lots: dict, realized: list[dict]):
    """Gera JSONs em dados/xp/."""
    XP_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # ── lotes.json (posições abertas — schema compatível com ibkr/lotes.json)
    lotes_out = {}
    for ticker, lots in open_lots.items():
        active = [l for l in lots if l["qty"] > 0]
        if not active:
            continue
        total_qty = sum(l["qty"] for l in active)
        total_cost = sum(l["qty"] * l["custo_por_cota"] for l in active)
        avg = total_cost / total_qty if total_qty else 0
        lotes_out[ticker] = {
            "status": "alvo",
            "moeda": "BRL",
            "lotes": [{"data": l["data"], "qty": l["qty"],
                        "custo_por_cota": round(l["custo_por_cota"], 2)}
                       for l in active],
            "total_qty": round(total_qty, 4),
            "custo_total_brl": round(total_cost, 2),
            "avg_cost_brl": round(avg, 2),
        }

    lotes_path = XP_OUTPUT_DIR / "lotes.json"
    lotes_path.write_text(json.dumps(lotes_out, indent=2, ensure_ascii=False))
    print(f"  ✓ {lotes_path.relative_to(ROOT)}")

    # ── operacoes.json (todas as operações parseadas)
    ops_path = XP_OUTPUT_DIR / "operacoes.json"
    ops_path.write_text(json.dumps(operations, indent=2, ensure_ascii=False))
    print(f"  ✓ {ops_path.relative_to(ROOT)}")

    # ── realized_pnl.json
    pnl_by_ticker = defaultdict(float)
    for r in realized:
        pnl_by_ticker[r["ticker"]] += r["pnl_brl"]

    pnl_out = {
        "total_brl": round(sum(pnl_by_ticker.values()), 2),
        "por_ticker": {k: round(v, 2) for k, v in pnl_by_ticker.items()},
        "detalhado": realized,
    }
    pnl_path = XP_OUTPUT_DIR / "realized_pnl.json"
    pnl_path.write_text(json.dumps(pnl_out, indent=2, ensure_ascii=False))
    print(f"  ✓ {pnl_path.relative_to(ROOT)}")

    return lotes_out


# ═══════════════════════════════════════════════════════════════════════════════
# IBKR — delega ao script existente
# ═══════════════════════════════════════════════════════════════════════════════

def run_ibkr():
    """Executa ibkr_analysis.py existente."""
    if not IBKR_SCRIPT.exists():
        print(f"  ⚠ IBKR script não encontrado: {IBKR_SCRIPT}")
        return
    print(f"\n{'═' * 70}")
    print("IBKR — delegando a ibkr_analysis.py")
    print(f"{'═' * 70}\n")
    subprocess.run([sys.executable, str(IBKR_SCRIPT)], cwd=ROOT)


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def run_xp():
    """Parseia notas XP e gera outputs."""
    print(f"\n{'═' * 70}")
    print("XP INVESTIMENTOS — Notas de Corretagem")
    print(f"{'═' * 70}\n")

    operations = parse_xp_pdfs()

    if not operations:
        print("\n  Nenhuma operação extraída.")
        return

    print(f"\n  Total: {len(operations)} operações")
    print(f"  Período: {operations[0]['data']} → {operations[-1]['data']}")
    print(f"  Tickers: {', '.join(sorted(set(op['ticker'] for op in operations)))}")

    # Análise de lotes
    open_lots, realized = build_xp_lots(operations)

    # Posições abertas
    print(f"\n{'─' * 70}")
    print("POSIÇÕES ABERTAS")
    print(f"{'─' * 70}")
    for ticker, lots in open_lots.items():
        active = [l for l in lots if l["qty"] > 0]
        if not active:
            continue
        total_qty = sum(l["qty"] for l in active)
        total_cost = sum(l["qty"] * l["custo_por_cota"] for l in active)
        avg = total_cost / total_qty if total_qty else 0
        print(f"  {ticker}: {total_qty} cotas, avg R${avg:.2f}, custo total R${total_cost:,.2f}")
        for lot in active:
            print(f"    → {lot['data']}  {lot['qty']} cotas @ R${lot['custo_por_cota']:.2f}")

    # P&L realizado
    print(f"\n{'─' * 70}")
    print("P&L REALIZADO")
    print(f"{'─' * 70}")
    pnl_by_ticker = defaultdict(float)
    for r in realized:
        pnl_by_ticker[r["ticker"]] += r["pnl_brl"]
    for ticker, pnl in sorted(pnl_by_ticker.items(), key=lambda x: -abs(x[1])):
        flag = "✓ LUCRO" if pnl > 0 else "✗ PERDA"
        print(f"  {ticker:<10} {flag}  R${pnl:,.2f}")
    print(f"\n  Total P&L realizado: R${sum(pnl_by_ticker.values()):,.2f}")

    # Salvar outputs
    print(f"\n{'─' * 70}")
    print("SALVANDO OUTPUTS")
    print(f"{'─' * 70}")
    lotes_out = generate_xp_outputs(operations, open_lots, realized)

    # Resumo HODL11 para dashboard
    if "HODL11" in lotes_out:
        h = lotes_out["HODL11"]
        print(f"\n  📌 HODL11 avg cost: R${h['avg_cost_brl']:.2f} "
              f"({h['total_qty']} cotas, custo total R${h['custo_total_brl']:,.2f})")

    print(f"\n{'═' * 70}")
    print("XP ANÁLISE CONCLUÍDA")
    print(f"{'═' * 70}")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Broker Analysis — Multi-corretora")
    parser.add_argument("--broker", choices=["xp", "ibkr", "all"], default="all",
                        help="Qual corretora processar (default: all)")
    args = parser.parse_args()

    if args.broker in ("xp", "all"):
        run_xp()
    if args.broker in ("ibkr", "all"):
        run_ibkr()


if __name__ == "__main__":
    main()
