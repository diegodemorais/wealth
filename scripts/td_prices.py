#!/usr/bin/env python3
"""
Tesouro Direto — Preços e Taxas dos títulos de Diego.

Fonte: Tesouro Transparente (CSV público, atualizado diariamente D+0).
URL: https://www.tesourotransparente.gov.br/ckan/dataset/taxas-dos-titulos-ofertados-pelo-tesouro-direto

Uso:
    python3 scripts/td_prices.py                  # lê CSV local, mostra preços
    python3 scripts/td_prices.py --update         # baixa CSV atualizado + mostra
    python3 scripts/td_prices.py --json           # output JSON para pipeline
    python3 scripts/td_prices.py --history 2025   # histórico mensal de PU
"""

import csv
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).parent.parent
CSV_PATH = ROOT / "analysis" / "raw" / "PrecoTaxaTesouroDireto.csv"
OUTPUT_PATH = ROOT / "dados" / "td_precos.json"

TD_URL = (
    "https://www.tesourotransparente.gov.br/ckan/dataset/"
    "df56aa42-484a-4a59-8184-7676580c81e3/resource/"
    "796d2059-14e9-44e3-80c9-2d9e30b405c1/download/"
    "precotaxatesourodireto.csv"
)

# Mapeamento: nome interno → (tipo no CSV, vencimento no CSV)
# RendA+ 2065 = nome comercial; vencimento formal = 15/12/2064
TITULOS_DIEGO = {
    "ipca2029": ("Tesouro IPCA+", "15/05/2029"),
    "ipca2040": ("Tesouro IPCA+", "15/08/2040"),
    "ipca2050": ("Tesouro IPCA+", "15/08/2050"),
    "renda2065": ("Tesouro Renda+ Aposentadoria Extra", "15/12/2064"),
}

# Excluir títulos com juros semestrais (Diego tem os sem cupom)
EXCLUIR = ["Juros Semestrais"]


def update_csv():
    """Baixa CSV atualizado do Tesouro Transparente."""
    print(f"Baixando CSV do Tesouro Transparente...")
    CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        ["curl", "-sL", TD_URL, "-o", str(CSV_PATH)],
        capture_output=True, text=True, timeout=60
    )
    if result.returncode != 0:
        print(f"ERRO: {result.stderr}")
        return False
    lines = sum(1 for _ in open(CSV_PATH, encoding="latin-1"))
    print(f"✓ {CSV_PATH.relative_to(ROOT)} ({lines:,} linhas)")
    return True


def parse_csv(csv_path: Path = None) -> dict:
    """
    Parseia CSV do Tesouro Transparente.
    Retorna {titulo_key: {data, pu_venda, pu_compra, taxa_compra, taxa_venda, ...}}
    para o registro mais recente de cada título.
    """
    path = csv_path or CSV_PATH
    if not path.exists():
        print(f"CSV não encontrado: {path}")
        print(f"Rode: python3 scripts/td_prices.py --update")
        return {}

    latest = {}
    with open(path, encoding="latin-1") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            tipo = row["Tipo Titulo"].strip()

            # Excluir juros semestrais
            if any(ex in tipo for ex in EXCLUIR):
                continue

            venc = row["Data Vencimento"].strip()

            # Match com títulos de Diego
            key = None
            for k, (t, v) in TITULOS_DIEGO.items():
                if t in tipo and v == venc:
                    key = k
                    break
            if not key:
                continue

            data_str = row["Data Base"].strip()
            try:
                dt = datetime.strptime(data_str, "%d/%m/%Y")
            except ValueError:
                continue

            def parse_br(s):
                s = s.strip().replace(".", "").replace(",", ".")
                return float(s) if s else None

            entry = {
                "data": dt.strftime("%Y-%m-%d"),
                "data_br": data_str,
                "dt": dt,
                "titulo_csv": tipo,
                "vencimento": venc,
                "pu_venda": parse_br(row.get("PU Venda Manha", "")),
                "pu_compra": parse_br(row.get("PU Compra Manha", "")),
                "pu_base": parse_br(row.get("PU Base Manha", "")),
                "taxa_compra": parse_br(row.get("Taxa Compra Manha", "")),
                "taxa_venda": parse_br(row.get("Taxa Venda Manha", "")),
            }

            if key not in latest or dt > latest[key]["dt"]:
                latest[key] = entry

    # Remover dt (não serializável)
    for v in latest.values():
        del v["dt"]

    return latest


def parse_history(csv_path: Path = None, year: int = None) -> dict:
    """Retorna histórico mensal de PU por título."""
    path = csv_path or CSV_PATH
    if not path.exists():
        return {}

    history = {k: {} for k in TITULOS_DIEGO}

    with open(path, encoding="latin-1") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            tipo = row["Tipo Titulo"].strip()
            if any(ex in tipo for ex in EXCLUIR):
                continue
            venc = row["Data Vencimento"].strip()

            key = None
            for k, (t, v) in TITULOS_DIEGO.items():
                if t in tipo and v == venc:
                    key = k
                    break
            if not key:
                continue

            data_str = row["Data Base"].strip()
            try:
                dt = datetime.strptime(data_str, "%d/%m/%Y")
            except ValueError:
                continue

            if year and dt.year != year:
                continue

            month = dt.strftime("%Y-%m")
            def parse_br(s):
                s = s.strip().replace(".", "").replace(",", ".")
                return float(s) if s else None

            pu = parse_br(row.get("PU Venda Manha", ""))
            taxa = parse_br(row.get("Taxa Compra Manha", ""))

            if pu and (month not in history[key] or dt > datetime.strptime(history[key][month]["data"], "%Y-%m-%d")):
                history[key][month] = {
                    "data": dt.strftime("%Y-%m-%d"),
                    "pu_venda": pu,
                    "taxa": taxa,
                }

    return {k: dict(sorted(v.items())) for k, v in history.items() if v}


def save_json(precos: dict):
    """Salva preços em dados/td_precos.json."""
    output = {
        "_generated": datetime.now().isoformat(timespec="seconds"),
        "_source": "Tesouro Transparente (CSV público)",
        "_url": TD_URL,
        "titulos": precos,
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(output, indent=2, ensure_ascii=False))
    print(f"\n✓ {OUTPUT_PATH.relative_to(ROOT)}")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Tesouro Direto — Preços e Taxas")
    parser.add_argument("--update", action="store_true", help="Baixar CSV atualizado")
    parser.add_argument("--json", action="store_true", help="Salvar em dados/td_precos.json")
    parser.add_argument("--history", type=int, metavar="ANO", help="Mostrar histórico mensal do ano")
    args = parser.parse_args()

    if args.update:
        if not update_csv():
            sys.exit(1)

    if args.history:
        history = parse_history(year=args.history)
        for titulo, months in history.items():
            print(f"\n{titulo}:")
            for month, data in months.items():
                print(f"  {month}: PU R${data['pu_venda']:,.2f} | taxa {data['taxa']:.2f}%")
        return

    precos = parse_csv()
    if not precos:
        print("Nenhum preço encontrado. Rode com --update para baixar o CSV.")
        sys.exit(1)

    print(f"\n{'='*60}")
    print("TESOURO DIRETO — Preços Atuais (Tesouro Transparente)")
    print(f"{'='*60}")

    for key in ["ipca2029", "ipca2040", "renda2065"]:
        p = precos.get(key)
        if p:
            print(f"\n  {key} ({p['titulo_csv']}, venc {p['vencimento']})")
            print(f"    Data:  {p['data']}")
            print(f"    PU:    venda R${p['pu_venda']:,.2f} | compra R${p['pu_compra']:,.2f}")
            print(f"    Taxa:  compra {p['taxa_compra']:.2f}% | venda {p['taxa_venda']:.2f}%")
        else:
            print(f"\n  {key}: NÃO ENCONTRADO")

    if args.json:
        save_json(precos)

    print(f"\n{'='*60}")


if __name__ == "__main__":
    main()
