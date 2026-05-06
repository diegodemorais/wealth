#!/usr/bin/env python3
# scripts/patrimonio_check.py
# Verifica drift de patrimônio: carteira.md vs data.json (pipeline)
# Uso: python3 scripts/patrimonio_check.py [--update]
# Exit 0: OK ou aviso. Exit 1: drift > R$100k (gate de integridade)

import argparse
import json
import re
import sys
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_JSON = ROOT / "react-app" / "public" / "data.json"
CARTEIRA_MD = ROOT / "agentes" / "contexto" / "carteira.md"

DRIFT_THRESHOLD = 100_000
STALE_DAYS = 7


def format_brl(value: float) -> str:
    """Format value as R$ X.XXX.XXX (Brazilian dot-separated thousands)."""
    # Use comma as thousands sep then swap: 3705611 -> "3,705,611" -> "3.705.611"
    formatted = f"{value:,.0f}".replace(",", ".")
    return f"R$ {formatted}"


def load_pipeline_value() -> tuple[float, str]:
    """
    Returns (financeiro_brl, generated_date_str).
    generated_date_str is YYYY-MM-DD extracted from _generated or _meta.generated.
    Raises SystemExit on error.
    """
    if not DATA_JSON.exists():
        print(f"ERRO: {DATA_JSON} não encontrado.")
        print("       Rode: ~/claude/finance-tools/.venv/bin/python3 scripts/generate_data.py")
        sys.exit(1)

    try:
        with DATA_JSON.open() as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"ERRO: {DATA_JSON} é JSON inválido: {e}")
        sys.exit(1)

    # Resolve financeiro_brl
    ph = data.get("patrimonio_holistico")
    if ph is None:
        print("ERRO: campo 'patrimonio_holistico' ausente em data.json")
        sys.exit(1)
    financeiro_brl = ph.get("financeiro_brl")
    if financeiro_brl is None:
        print("ERRO: campo 'patrimonio_holistico.financeiro_brl' ausente em data.json")
        sys.exit(1)
    try:
        financeiro_brl = float(financeiro_brl)
    except (TypeError, ValueError):
        print(f"ERRO: 'patrimonio_holistico.financeiro_brl' não é numérico: {financeiro_brl!r}")
        sys.exit(1)

    # Resolve generated date: try _meta.generated first, then _generated top-level
    generated_raw = None
    meta = data.get("_meta")
    if isinstance(meta, dict):
        generated_raw = meta.get("generated")
    if generated_raw is None:
        generated_raw = data.get("_generated")
    if generated_raw is None:
        print("ERRO: campo '_meta.generated' ou '_generated' ausente em data.json")
        sys.exit(1)

    # Accept both YYYY-MM-DD and ISO datetime strings
    generated_date_str = str(generated_raw)[:10]  # take YYYY-MM-DD prefix

    return financeiro_brl, generated_date_str


def load_carteira_value() -> float:
    """
    Parses the 'Patrimonio total' line from carteira.md.
    Accepts formats:
      > Patrimonio total: R$ 3.705.611
      > Patrimonio total: R$ 3.705.611 (nota opcional)
    Returns float. Raises SystemExit on error.
    """
    if not CARTEIRA_MD.exists():
        print(f"ERRO: {CARTEIRA_MD} não encontrado.")
        sys.exit(1)

    text = CARTEIRA_MD.read_text(encoding="utf-8")

    # Match the Patrimonio total line — tolerates optional note after the number
    pattern = r">\s*Patrimoni[oa]\s+total\s*:\s*R\$\s*([\d.,]+)"
    match = re.search(pattern, text, re.IGNORECASE)
    if not match:
        print("ERRO: linha 'Patrimonio total: R$ ...' não encontrada em carteira.md")
        print("       Padrão esperado: > Patrimonio total: R$ X.XXX.XXX")
        sys.exit(1)

    raw = match.group(1)
    # Remove thousands separators (dots), replace decimal comma with dot
    normalized = raw.replace(".", "").replace(",", ".")
    try:
        return float(normalized)
    except ValueError:
        print(f"ERRO: não foi possível converter '{raw}' para número.")
        sys.exit(1)


def update_carteira(pipeline_value: float) -> None:
    """
    Updates the Patrimonio total line in carteira.md with pipeline_value.
    Preserves the rest of the note (parenthetical) using today's date.
    """
    text = CARTEIRA_MD.read_text(encoding="utf-8")

    today_str = date.today().strftime("%d/%m/%Y")
    new_value_str = f"{pipeline_value:,.0f}".replace(",", ".")

    # Replace the number portion of the line, preserving any parenthetical note pattern
    # Pattern captures prefix, number, and optional note
    pattern = r"(>\s*Patrimoni[oa]\s+total\s*:\s*R\$\s*)([\d.,]+)(\s*\([^)]*\))?(.*)$"

    def replacer(m):
        prefix = m.group(1)
        note = m.group(3)
        rest = m.group(4) or ""
        if note:
            # Update date inside the parenthetical
            updated_note = re.sub(
                r"\d{2}/\d{2}/\d{4}",
                today_str,
                note,
            )
        else:
            updated_note = f" (pipeline generate_data.py {today_str} — fonte: patrimonio_holistico.financeiro_brl)"
        return f"{prefix}{new_value_str}{updated_note}{rest}"

    new_text, n = re.subn(pattern, replacer, text, flags=re.IGNORECASE | re.MULTILINE)
    if n == 0:
        print("AVISO: não foi possível localizar a linha para --update. Nada alterado.")
        return

    CARTEIRA_MD.write_text(new_text, encoding="utf-8")
    print(f"  carteira.md atualizado: Patrimônio total = {format_brl(pipeline_value)}")


def main():
    parser = argparse.ArgumentParser(
        description="Verifica drift entre carteira.md e data.json (pipeline)"
    )
    parser.add_argument(
        "--update",
        action="store_true",
        help="Atualiza carteira.md automaticamente se drift > R$100k",
    )
    args = parser.parse_args()

    pipeline_value, generated_date_str = load_pipeline_value()
    carteira_value = load_carteira_value()

    # Age of data.json
    try:
        generated_date = datetime.strptime(generated_date_str, "%Y-%m-%d").date()
        data_age_days = (date.today() - generated_date).days
    except ValueError:
        data_age_days = None
        generated_date_str = str(generated_date_str)

    drift = abs(pipeline_value - carteira_value)
    drift_ok = drift <= DRIFT_THRESHOLD

    age_label = f"[gerado em {generated_date_str}, {data_age_days} dias atrás]" if data_age_days is not None else f"[gerado em {generated_date_str}]"
    drift_flag = "OK" if drift_ok else "⚠️  ALERTA"

    print("═══════════════════════════════════════")
    print("VERIFICAÇÃO DE PATRIMÔNIO — L-25")
    print("═══════════════════════════════════════")
    print(f"Pipeline (data.json):  {format_brl(pipeline_value)}  {age_label}")
    print(f"Carteira.md:           {format_brl(carteira_value)}")
    print(f"Drift:                 {format_brl(drift)}  [{drift_flag}]")
    print("───────────────────────────────────────")

    if drift_ok:
        print("Status: ✅ OK")
    else:
        print("Status: ❌ DRIFT > R$100k — ATUALIZAR carteira.md")

    # Additional warnings
    if data_age_days is not None and data_age_days > STALE_DAYS:
        print(f"\n⚠️  data.json tem {data_age_days} dias — considere rodar generate_data.py")

    if not drift_ok:
        if args.update:
            print("\nAplicando --update...")
            update_carteira(pipeline_value)
        else:
            print(
                f"\nPara corrigir:\n"
                f"  1. ~/claude/finance-tools/.venv/bin/python3 scripts/generate_data.py\n"
                f"  2. Atualizar carteira.md: Patrimônio total = {format_brl(pipeline_value)}"
            )
        sys.exit(1)


if __name__ == "__main__":
    main()
