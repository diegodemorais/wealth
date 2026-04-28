#!/usr/bin/env python3
"""
Pipeline Archive — DATA_PIPELINE_CENTRALIZATION Invariant 7.

Mantém janela de rollback de 7 dias para snapshots do pipeline.
Uso:
    python scripts/pipeline_archive.py --archive        # move snapshots >7 dias para dados/archive/
    python scripts/pipeline_archive.py --archive --dry-run   # mostra o que seria movido
    python scripts/pipeline_archive.py --rollback 2026-04-19 # restaura snapshots desta data
    python scripts/pipeline_archive.py --list           # lista archives disponíveis
"""

import json
import shutil
import argparse
from datetime import datetime, timedelta
from pathlib import Path


ROOT = Path(__file__).parent.parent
DADOS_DIR = ROOT / "dados"
ARCHIVE_DIR = DADOS_DIR / "archive"
RETENTION_DAYS = 7

# Snapshots gerenciados pelo pipeline (não incluir dashboard_state.json — fonte primária)
MANAGED_SNAPSHOTS = [
    "macro_snapshot.json",
    "factor_snapshot.json",
    "tax_snapshot.json",
    "fire_matrix.json",
    "fire_trilha.json",
    "fire_swr_percentis.json",
    "fire_aporte_sensitivity.json",
    "drawdown_history.json",
    "bond_pool_runway.json",
    "etf_composition.json",
    "lumpy_events.json",
    "retornos_mensais.json",
    "rolling_metrics.json",
]


def _read_generated(path: Path) -> datetime | None:
    try:
        data = json.loads(path.read_text())
        raw = data.get("_generated") or data.get("generated")
        return datetime.fromisoformat(raw.replace("Z", "")) if raw else None
    except Exception:
        return None


def archive_old_snapshots(dry_run: bool = False) -> list[str]:
    """Move snapshots com _generated >RETENTION_DAYS para archive/."""
    cutoff = datetime.now() - timedelta(days=RETENTION_DAYS)
    moved = []

    for filename in MANAGED_SNAPSHOTS:
        src = DADOS_DIR / filename
        if not src.exists():
            continue

        generated = _read_generated(src)
        if generated is None:
            print(f"  ⚠ {filename}: sem _generated, ignorado")
            continue

        if generated >= cutoff:
            age_days = (datetime.now() - generated).days
            print(f"  ✓ {filename}: {age_days}d (dentro da janela)")
            continue

        dest_dir = ARCHIVE_DIR / generated.strftime("%Y-%m-%d")
        dest = dest_dir / filename
        age_days = (datetime.now() - generated).days

        if dry_run:
            print(f"  [dry-run] arquivaria: {filename} ({age_days}d) → archive/{generated.strftime('%Y-%m-%d')}/")
        else:
            dest_dir.mkdir(parents=True, exist_ok=True)
            shutil.move(str(src), str(dest))
            print(f"  → arquivado: {filename} ({age_days}d)")
        moved.append(str(dest))

    return moved


def rollback_to_date(target_date: str) -> list[str]:
    """Restaura snapshots de uma data específica (formato: YYYY-MM-DD)."""
    archive_path = ARCHIVE_DIR / target_date
    if not archive_path.exists():
        available = sorted(p.name for p in ARCHIVE_DIR.iterdir() if p.is_dir()) if ARCHIVE_DIR.exists() else []
        raise FileNotFoundError(
            f"Sem archive para {target_date}. Disponíveis: {available or 'nenhum'}"
        )

    restored = []
    for snapshot in archive_path.glob("*.json"):
        dest = DADOS_DIR / snapshot.name
        shutil.copy2(str(snapshot), str(dest))
        print(f"  ← restaurado: {snapshot.name}")
        restored.append(str(dest))

    return restored


def list_archives() -> None:
    """Lista todas as datas com archive disponível."""
    if not ARCHIVE_DIR.exists():
        print("Nenhum archive encontrado.")
        return

    dates = sorted(p.name for p in ARCHIVE_DIR.iterdir() if p.is_dir())
    if not dates:
        print("Nenhum archive encontrado.")
        return

    print(f"Archives disponíveis ({len(dates)}):")
    for date in dates:
        files = list((ARCHIVE_DIR / date).glob("*.json"))
        print(f"  {date}: {len(files)} snapshot(s)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Pipeline Archive — rollback de snapshots")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--archive", action="store_true", help="Arquivar snapshots antigos")
    group.add_argument("--rollback", metavar="YYYY-MM-DD", help="Restaurar snapshots de uma data")
    group.add_argument("--list", action="store_true", help="Listar archives disponíveis")
    parser.add_argument("--dry-run", action="store_true", help="Mostrar o que seria feito sem executar")
    args = parser.parse_args()

    if args.archive:
        print(f"Arquivando snapshots com >{RETENTION_DAYS} dias...")
        moved = archive_old_snapshots(dry_run=args.dry_run)
        print(f"  Total: {len(moved)} arquivo(s) {'(dry-run)' if args.dry_run else 'movidos'}")
    elif args.rollback:
        print(f"Restaurando snapshots de {args.rollback}...")
        restored = rollback_to_date(args.rollback)
        print(f"  Total: {len(restored)} arquivo(s) restaurados")
    elif args.list:
        list_archives()


if __name__ == "__main__":
    main()
