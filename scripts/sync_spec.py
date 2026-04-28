#!/usr/bin/env python3
"""
sync_spec.py — Audita cobertura do spec.json vs dashboard React.

Uso:
    python scripts/sync_spec.py            # relatório completo
    python scripts/sync_spec.py --missing  # só blocos sem data-testid

Verifica:
  1. Cada bloco do spec.json tem data-testid correspondente no React?
  2. Cada data-testid no React tem bloco no spec.json?
"""

import re
import argparse
from pathlib import Path

ROOT = Path(__file__).parent.parent
SPEC_PATH = ROOT / "dashboard" / "spec.json"
REACT_SRC = ROOT / "react-app" / "src"


def load_spec_blocks() -> list[dict]:
    import json
    return json.loads(SPEC_PATH.read_text()).get("blocks", [])


def find_testids_in_react() -> set[str]:
    testids = set()
    # Only match actual JSX attribute assignments: data-testid="foo" or data-testid={'foo'}
    pattern = re.compile(r'data-testid=["\']([a-z0-9][a-z0-9\-]*)["\']')
    for f in REACT_SRC.rglob("*.tsx"):
        if "node_modules" in str(f) or "__tests__" in str(f):
            continue
        for match in pattern.finditer(f.read_text()):
            testids.add(match.group(1))
    return testids


def main() -> None:
    parser = argparse.ArgumentParser(description="Audita cobertura spec.json vs data-testid React")
    parser.add_argument("--missing", action="store_true", help="Só blocos sem data-testid")
    args = parser.parse_args()

    blocks = load_spec_blocks()
    testids = find_testids_in_react()

    # Blocos do spec sem data-testid correspondente
    missing_testid = [b for b in blocks if b["id"] not in testids]
    # data-testids sem bloco no spec (excluindo internos como "sankey-mock")
    spec_ids = {b["id"] for b in blocks}
    orphan_testids = {t for t in testids if t not in spec_ids and not t.endswith("-mock")}

    print(f"\n📋 spec.json: {len(blocks)} blocos | React data-testids: {len(testids)}")
    print(f"   Cobertura Playwright: {len(blocks) - len(missing_testid)}/{len(blocks)} blocos ({(len(blocks)-len(missing_testid))*100//len(blocks)}%)")

    if not args.missing:
        print(f"\n✅ Blocos com data-testid ({len(blocks) - len(missing_testid)}):")
        for b in blocks:
            if b["id"] in testids:
                print(f"   [{b['tab']:12s}] {b['id']}")

    if missing_testid:
        print(f"\n⚠️  Blocos SEM data-testid ({len(missing_testid)}) — não validados pelo Playwright:")
        for b in missing_testid:
            opt = " [optional]" if b.get("optional") else ""
            print(f"   [{b['tab']:12s}] {b['id']}{opt}")
            print(f"              campos: {', '.join(b.get('data_fields', [])[:3])}" +
                  (" ..." if len(b.get("data_fields", [])) > 3 else ""))
    else:
        print("\n✅ Todos os blocos têm data-testid!")

    if orphan_testids:
        print(f"\n🔍 data-testids sem bloco no spec ({len(orphan_testids)}) — adicionar ao spec.json:")
        for t in sorted(orphan_testids):
            print(f"   {t}")


if __name__ == "__main__":
    main()
