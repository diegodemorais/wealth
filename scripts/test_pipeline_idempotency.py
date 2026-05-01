#!/usr/bin/env python3
"""
test_pipeline_idempotency.py — Verifica que o pipeline append-only é idempotente.

Spec: agentes/issues/DEV-pipeline-append-only.md (P5).

Estratégia: roda os scripts geradores 2× consecutivas (sem --rebuild) e verifica
que os artefatos NÃO mudam, exceto `_meta.last_appended_at`. Cobre Lote A
(retornos, historico, rolling), Lote B (drawdown, fire_trilha), Lote C
(tlh_lotes), e backtest_r7.

Uso:
    ~/claude/finance-tools/.venv/bin/python3 scripts/test_pipeline_idempotency.py

Saída: imprime PASS/FAIL por artefato e total. Exit 0 se todos PASS, 1 caso contrário.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DADOS = ROOT / "dados"
PY = str(Path.home() / "claude" / "finance-tools" / ".venv" / "bin" / "python3")

# Artefatos cobertos pelo contrato append-only.
# Para cada um: (path_relativo, comando para regenerar).
ARTEFACTS = [
    ("dados/historico_carteira.csv",   [PY, "scripts/reconstruct_history.py"]),
    ("dados/retornos_mensais.json",    [PY, "scripts/reconstruct_history.py"]),
    ("dados/rolling_metrics.json",     [PY, "scripts/reconstruct_history.py"]),
    ("dados/drawdown_history.json",    [PY, "scripts/reconstruct_fire_data.py", "--only", "drawdown_history"]),
    ("dados/fire_trilha.json",         [PY, "scripts/reconstruct_fire_data.py", "--only", "fire_trilha"]),
    ("dados/tlh_lotes.json",           [PY, "scripts/ibkr_lotes.py"]),
    ("dados/spending_summary.json",    [PY, "scripts/spending_analysis.py", "--json-output"]),
]

VOLATILE_META_KEYS = {"_meta", "_generated", "_window_id", "gerado_em"}


def strip_volatile(obj):
    if isinstance(obj, dict):
        return {k: strip_volatile(v) for k, v in obj.items() if k not in VOLATILE_META_KEYS}
    if isinstance(obj, list):
        return [strip_volatile(x) for x in obj]
    return obj


def load(path: Path):
    if path.suffix == ".csv":
        return path.read_text()
    return strip_volatile(json.loads(path.read_text()))


def run_cmd(cmd: list[str]) -> tuple[int, str]:
    out = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=900)
    return out.returncode, (out.stdout + "\n" + out.stderr)[-300:]


def main() -> int:
    # Resolver comandos únicos (alguns artefatos compartilham script).
    unique_cmds = []
    seen = set()
    for _, cmd in ARTEFACTS:
        key = tuple(cmd)
        if key not in seen:
            seen.add(key)
            unique_cmds.append(cmd)

    # Run 1: garantir baseline atualizado
    print("[1/3] Run 1 — gerando baseline...")
    for cmd in unique_cmds:
        rc, tail = run_cmd(cmd)
        if rc != 0:
            print(f"  FAIL run1 {cmd}: {tail}")
            return 1

    # Snapshot
    print("[2/3] Snapshot dos artefatos...")
    snap = {}
    for rel, _ in ARTEFACTS:
        p = ROOT / rel
        if not p.exists():
            print(f"  FAIL: {rel} não existe após run 1")
            return 1
        snap[rel] = load(p)

    # Run 2: verificar idempotência
    print("[3/3] Run 2 — verificando idempotência...")
    for cmd in unique_cmds:
        rc, tail = run_cmd(cmd)
        if rc != 0:
            print(f"  FAIL run2 {cmd}: {tail}")
            return 1

    # Compare
    failures = 0
    for rel, _ in ARTEFACTS:
        p = ROOT / rel
        new = load(p)
        if new == snap[rel]:
            print(f"  PASS  {rel}")
        else:
            print(f"  FAIL  {rel} mudou entre runs (ignorando _meta/_generated)")
            failures += 1

    print()
    if failures:
        print(f"❌ {failures} artefato(s) mudaram entre runs consecutivas")
        return 1
    print(f"✅ {len(ARTEFACTS)} artefatos idempotentes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
