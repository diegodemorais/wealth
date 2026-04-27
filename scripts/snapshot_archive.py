"""
Snapshot Archive and Rollback — Maintain historical snapshots for recovery.

Features:
- Archive old snapshots to dados/archive/{date}/
- Maintain 7-day rolling window for recovery
- Rollback to previous state if pipeline corrupted
- Cleanup stale archives
"""

import json
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

ROOT = Path(__file__).parent.parent
DADOS_DIR = ROOT / "dados"
ARCHIVE_DIR = DADOS_DIR / "archive"
RETENTION_DAYS = 7


class SnapshotArchive:
    """Manage snapshot archival and rollback."""

    RETENTION_DAYS = RETENTION_DAYS

    @staticmethod
    def ensure_archive_dir() -> None:
        """Create archive directory if not exists."""
        ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def get_archive_path_for_date(date_str: str) -> Path:
        """
        Get archive directory for a specific date.

        Args:
            date_str: ISO date string (e.g., "2026-04-26")

        Returns:
            Path to archive directory for that date
        """
        return ARCHIVE_DIR / date_str

    @staticmethod
    def archive_snapshot(snapshot_path: Path, dry_run: bool = False) -> Optional[Path]:
        """
        Move a snapshot to archive with today's date.

        Args:
            snapshot_path: Path to snapshot file
            dry_run: If True, don't actually move (just report)

        Returns:
            Archive path if moved, None if already archived
        """
        if not snapshot_path.exists():
            logger.warning(f"Snapshot not found: {snapshot_path}")
            return None

        # Get metadata to extract generation date if possible
        try:
            with open(snapshot_path) as f:
                if snapshot_path.suffix == ".json":
                    data = json.load(f)
                    generated = data.get("_generated", "")
                    # Extract date from ISO timestamp
                    if generated:
                        gen_date = generated.split("T")[0]
                    else:
                        gen_date = datetime.now().date().isoformat()
                else:
                    # CSV or other format: use current date
                    gen_date = datetime.now().date().isoformat()
        except Exception as e:
            logger.warning(f"Could not read metadata from {snapshot_path}: {e}")
            gen_date = datetime.now().date().isoformat()

        archive_date_dir = SnapshotArchive.get_archive_path_for_date(gen_date)
        archive_path = archive_date_dir / snapshot_path.name

        if dry_run:
            logger.info(f"[DRY RUN] Would archive: {snapshot_path} → {archive_path}")
            return archive_path

        archive_date_dir.mkdir(parents=True, exist_ok=True)

        try:
            shutil.move(str(snapshot_path), str(archive_path))
            logger.info(f"Archived: {snapshot_path} → {archive_path}")
            return archive_path
        except Exception as e:
            logger.error(f"Failed to archive {snapshot_path}: {e}")
            return None

    @staticmethod
    def cleanup_old_archives(dry_run: bool = False) -> None:
        """
        Remove archives older than RETENTION_DAYS.

        Args:
            dry_run: If True, don't actually delete (just report)
        """
        if not ARCHIVE_DIR.exists():
            return

        cutoff_date = (datetime.now() - timedelta(days=SnapshotArchive.RETENTION_DAYS)).date()

        for date_dir in ARCHIVE_DIR.iterdir():
            if not date_dir.is_dir():
                continue

            try:
                archive_date = datetime.fromisoformat(date_dir.name).date()
            except ValueError:
                logger.warning(f"Archive directory with invalid date name: {date_dir.name}")
                continue

            if archive_date < cutoff_date:
                if dry_run:
                    logger.info(f"[DRY RUN] Would delete old archive: {date_dir}")
                else:
                    try:
                        shutil.rmtree(date_dir)
                        logger.info(f"Deleted old archive: {date_dir}")
                    except Exception as e:
                        logger.error(f"Failed to delete archive {date_dir}: {e}")

    @staticmethod
    def list_available_dates() -> List[str]:
        """
        List all available archive dates in descending order (newest first).

        Returns:
            List of ISO date strings (e.g., ["2026-04-26", "2026-04-25", ...])
        """
        if not ARCHIVE_DIR.exists():
            return []

        dates = []
        for date_dir in ARCHIVE_DIR.iterdir():
            if date_dir.is_dir():
                try:
                    datetime.fromisoformat(date_dir.name)  # Validate format
                    dates.append(date_dir.name)
                except ValueError:
                    pass

        return sorted(dates, reverse=True)

    @staticmethod
    def get_snapshots_for_date(date_str: str) -> List[Path]:
        """
        Get all snapshots archived for a specific date.

        Args:
            date_str: ISO date string (e.g., "2026-04-26")

        Returns:
            List of snapshot file paths
        """
        date_dir = SnapshotArchive.get_archive_path_for_date(date_str)
        if not date_dir.exists():
            return []

        return sorted(date_dir.glob("*.json")) + sorted(date_dir.glob("*.csv"))

    @staticmethod
    def rollback_to_date(target_date: str, dry_run: bool = False) -> None:
        """
        Restore all snapshots from a specific archive date.

        Backs up current snapshots before restoring, so no data loss.

        Args:
            target_date: ISO date string to restore from
            dry_run: If True, don't actually restore (just report)

        Raises:
            FileNotFoundError: If archive for date doesn't exist
        """
        archive_date_dir = SnapshotArchive.get_archive_path_for_date(target_date)
        if not archive_date_dir.exists():
            raise FileNotFoundError(f"No archive available for {target_date}")

        snapshots = SnapshotArchive.get_snapshots_for_date(target_date)
        if not snapshots:
            raise FileNotFoundError(f"No snapshots in archive for {target_date}")

        if dry_run:
            logger.info(f"[DRY RUN] Would restore {len(snapshots)} snapshots from {target_date}")
            for snapshot in snapshots:
                logger.info(f"  {snapshot.name}")
            return

        # Backup current snapshots first
        backup_date = datetime.now().date().isoformat()
        backup_dir = SnapshotArchive.get_archive_path_for_date(f"{backup_date}-rollback-backup")
        backup_dir.mkdir(parents=True, exist_ok=True)

        for snapshot_path in DADOS_DIR.glob("*_snapshot.json"):
            if snapshot_path.exists():
                try:
                    shutil.copy(snapshot_path, backup_dir / snapshot_path.name)
                    logger.info(f"Backed up: {snapshot_path.name}")
                except Exception as e:
                    logger.error(f"Failed to backup {snapshot_path}: {e}")

        # Restore archived snapshots
        for archived_snapshot in snapshots:
            dest = DADOS_DIR / archived_snapshot.name
            try:
                shutil.copy(archived_snapshot, dest)
                logger.info(f"Restored: {archived_snapshot.name} from {target_date}")
            except Exception as e:
                logger.error(f"Failed to restore {archived_snapshot.name}: {e}")

        logger.info(f"Rollback complete. Backup of current state saved to {backup_dir}")


def main():
    """CLI for snapshot management."""
    import argparse

    parser = argparse.ArgumentParser(description="Snapshot Archive Management")
    parser.add_argument(
        "command",
        choices=["list", "restore", "cleanup"],
        help="Archive command to run",
    )
    parser.add_argument(
        "--date",
        help="Date for restore (format: YYYY-MM-DD)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Don't actually modify files",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        help="Logging level",
    )

    args = parser.parse_args()

    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(asctime)s [%(levelname)s] %(message)s",
    )

    SnapshotArchive.ensure_archive_dir()

    if args.command == "list":
        dates = SnapshotArchive.list_available_dates()
        print(f"Available archive dates ({len(dates)}):")
        for date in dates:
            date_dir = SnapshotArchive.get_archive_path_for_date(date)
            snapshots = SnapshotArchive.get_snapshots_for_date(date)
            print(f"  {date}: {len(snapshots)} snapshots")

    elif args.command == "restore":
        if not args.date:
            print("Error: --date required for restore")
            return
        try:
            SnapshotArchive.rollback_to_date(args.date, dry_run=args.dry_run)
            print(f"✅ Restored snapshots from {args.date}")
        except FileNotFoundError as e:
            print(f"❌ {e}")

    elif args.command == "cleanup":
        SnapshotArchive.cleanup_old_archives(dry_run=args.dry_run)
        print("✅ Archive cleanup complete")


if __name__ == "__main__":
    main()
