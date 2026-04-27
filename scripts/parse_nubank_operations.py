#!/usr/bin/env python3
"""
parse_nubank_operations.py — Extrai operações de Tesouro Direto de operacoes.md

Lê agentes/contexto/operacoes.md, extrai operações de Tesouro Direto/Renda+
e gera dados/nubank/operacoes_td.json para alimentar reconstruct_history.py
e RF em data.json.

Uso:
    python3 scripts/parse_nubank_operations.py
"""

import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).parent.parent
OPERACOES_MD = ROOT / "agentes" / "contexto" / "operacoes.md"
OUTPUT_DIR = ROOT / "dados" / "nubank"
OUTPUT_FILE = OUTPUT_DIR / "operacoes_td.json"


def parse_operacoes_md():
    """Parseia operacoes.md e extrai operações de Tesouro Direto."""
    if not OPERACOES_MD.exists():
        print(f"❌ {OPERACOES_MD} não encontrado")
        return []

    try:
        content = OPERACOES_MD.read_text(encoding="utf-8")
    except Exception as e:
        print(f"❌ Erro ao ler {OPERACOES_MD}: {e}")
        return []

    operacoes = []

    # Padrão de tabela Markdown: | data | tipo | titulo | valor | taxa | ...
    # Exemplo linha:
    # | 2026-04-10 | Compra | Tesouro IPCA+ 2040 | R$ 46.498,08 | IPCA+ 7,10% | ...
    lines = content.split("\n")

    in_table = False
    for line in lines:
        # Detectar seção de tabela (linhas que começam com |)
        if line.strip().startswith("|"):
            # Pular header e separator
            if "Data" in line or "---" in line or line.count("|") < 4:
                in_table = True
                continue

            if not in_table:
                continue

            # Parser da linha
            cells = [c.strip() for c in line.split("|")[1:-1]]  # remove primeiras e últimas células vazias

            if len(cells) < 5:
                continue

            data = cells[0]
            tipo = cells[1].lower()
            ativo = cells[2]
            valor_str = cells[3]
            preco_str = cells[4]
            obs = cells[-1] if len(cells) > 5 else ""

            # Validar formato de data
            if not re.match(r"^\d{4}-\d{2}-\d{2}$", data):
                continue

            # Normalizar tipo
            if "compra" in tipo:
                tipo_norm = "aplicacao"
            elif "venda" in tipo or "resgate" in tipo:
                tipo_norm = "resgate"
            else:
                continue

            # Extrair valor em BRL
            valor_match = re.search(r"R?\$?\s*([\d.,]+)", valor_str.replace(".", "").replace(",", "."))
            if not valor_match:
                continue
            valor_brl = float(valor_match.group(1))

            # Extrair taxa (ex: "IPCA+ 7,10%" ou "7.10%")
            taxa = None
            taxa_match = re.search(r"(\d+[.,]\d+)\s*%", preco_str)
            if taxa_match:
                taxa = float(taxa_match.group(1).replace(",", "."))

            # Normalizar nome do título
            titulo = ativo.strip()

            # Filtrar só títulos de Tesouro Direto (IPCA+, Renda+, Selic, etc)
            if any(x in titulo for x in ["IPCA", "Renda", "Selic", "Prefixado", "IGPM"]):
                op = {
                    "data": data,
                    "tipo": tipo_norm,
                    "titulo": titulo,
                    "valor_brl": valor_brl,
                    "taxa": taxa,
                    "nota": obs
                }
                operacoes.append(op)
                print(f"  ✓ {data} {tipo_norm:10} {titulo:25} R$ {valor_brl:12,.2f}")

    return operacoes


def save_operacoes_json(operacoes):
    """Salva operações em dados/nubank/operacoes_td.json."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    data = {
        "_generated": datetime.now().isoformat(timespec="seconds"),
        "_source": "agentes/contexto/operacoes.md",
        "operacoes": operacoes,
    }

    OUTPUT_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    print(f"\n✅ {OUTPUT_FILE.relative_to(ROOT)}")
    print(f"   {len(operacoes)} operações salvas")


if __name__ == "__main__":
    print("parse_nubank_operations.py — Extraindo operações de Tesouro Direto")
    print()
    operacoes = parse_operacoes_md()
    if operacoes:
        save_operacoes_json(operacoes)
    else:
        print("⚠️  Nenhuma operação encontrada em operacoes.md")
