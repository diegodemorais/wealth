#!/usr/bin/env python3
"""Release gate — valida timestamp da última entrada do changelog.ts.

Causa raiz do bug recorrente (Diego reclamou 10x até 2026-05-02):
- react-app/CLAUDE.md mandava `datetime: 'ISO'` sem fonte canônica.
- Cada Dev (humano ou agente) escolhia um timestamp "próximo do anterior".
- Resultado: efeito cascata, entradas progressivamente no futuro
  (ex: commit às 22:00 BRT registrado como 03:00 do dia seguinte).

Esta validação:
1. Lê a primeira entrada não-comentário de CHANGELOG[] em changelog.ts.
2. Parseia o `datetime` ISO.
3. Falha o gate se:
   - timestamp > 5 min no futuro (forbidden — sempre erro)
   - timestamp > 24 h no passado (esquecido — provável esqueceu de adicionar)
   - formato com sufixo `Z` (UTC ambíguo — exige offset explícito -03:00)

Uso (do root do repo):
    ~/claude/finance-tools/.venv/bin/python3 scripts/release_gate_changelog.py
Exit:
    0 — entrada mais recente válida
    1 — falha (mensagem explica)
"""
from __future__ import annotations

import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
CHANGELOG_PATH = REPO_ROOT / "react-app" / "src" / "config" / "changelog.ts"

BRT = timezone(timedelta(hours=-3))
MAX_FUTURE = timedelta(minutes=5)
MAX_PAST = timedelta(hours=24)


def first_entry_datetime(text: str) -> tuple[str, int]:
    """Retorna (datetime_string, line_no_1based) da primeira entrada do array."""
    lines = text.splitlines()
    in_array = False
    for i, line in enumerate(lines, start=1):
        if "export const CHANGELOG" in line:
            in_array = True
            continue
        if not in_array:
            continue
        m = re.search(r"datetime:\s*'([^']+)'", line)
        if m:
            return m.group(1), i
    raise SystemExit("❌ Changelog: nenhuma entrada com `datetime: '...'` encontrada após `CHANGELOG`.")


def parse_iso(value: str) -> datetime:
    if value.endswith("Z"):
        # Aceita Z para parse mas vamos rejeitar abaixo (formato ambíguo).
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    return datetime.fromisoformat(value)


def main() -> int:
    if not CHANGELOG_PATH.exists():
        print(f"❌ Changelog: arquivo não encontrado em {CHANGELOG_PATH}", file=sys.stderr)
        return 1

    raw, line_no = first_entry_datetime(CHANGELOG_PATH.read_text(encoding="utf-8"))

    if raw.endswith("Z"):
        print(
            f"❌ Changelog: entrada na linha {line_no} usa sufixo 'Z' (UTC).\n"
            f"   Valor encontrado: {raw}\n"
            f"   Exigido: ISO com offset BRT explícito (ex: 2026-05-02T22:35:00-03:00).\n"
            f"   Como gerar: node react-app/scripts/changelog-now.mjs",
            file=sys.stderr,
        )
        return 1

    try:
        ts = parse_iso(raw)
    except ValueError as exc:
        print(f"❌ Changelog: `datetime` malformado na linha {line_no}: {raw} ({exc})", file=sys.stderr)
        return 1

    if ts.utcoffset() != BRT.utcoffset(None):
        print(
            f"❌ Changelog: linha {line_no} tem offset {ts.utcoffset()}, exigido -03:00.\n"
            f"   Valor: {raw}\n"
            f"   Como gerar: node react-app/scripts/changelog-now.mjs",
            file=sys.stderr,
        )
        return 1

    now = datetime.now(BRT)
    delta = ts - now

    if delta > MAX_FUTURE:
        print(
            f"❌ Changelog: linha {line_no} no futuro por {delta}.\n"
            f"   Entrada: {raw}\n"
            f"   Hora atual BRT: {now.isoformat(timespec='seconds')}\n"
            f"   Causa típica: timestamp escrito manualmente sem usar fonte canônica.\n"
            f"   Como corrigir: substitua pelo output de\n"
            f"     node react-app/scripts/changelog-now.mjs",
            file=sys.stderr,
        )
        return 1

    if -delta > MAX_PAST:
        print(
            f"⚠️  Changelog: entrada mais recente tem {-delta} (>24h atrás).\n"
            f"   Provável esquecimento de adicionar entrada para a mudança atual.\n"
            f"   Entrada: {raw}\n"
            f"   Hora atual BRT: {now.isoformat(timespec='seconds')}",
            file=sys.stderr,
        )
        return 1

    print(f"✅ Changelog: última entrada {raw} ({-delta} atrás).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
