#!/usr/bin/env python3
"""
Data Pipeline Prohibition Tests — Guarantee snapshots only used via DataPipelineEngine.

Enforces:
- No direct JSON loads of snapshots outside data_pipeline_engine.py
- All snapshot usage routed through centralized orchestrator
- CI blocks merge if violations found
"""

import subprocess
import re
from pathlib import Path


ROOT = Path(__file__).parent.parent.parent
SCRIPTS_DIR = ROOT / "scripts"
REACT_DIR = ROOT / "react-app"


class TestDataPipelineProhibitions:
    """Grep-based QA: prevent snapshot bypass patterns."""

    def test_no_direct_snapshot_loads_in_scripts(self):
        """Prohibit json.load(...snapshot) outside data_pipeline_engine.py"""
        violations = subprocess.run(
            [
                "grep",
                "-r",
                "--include=*.py",
                r"json\.load.*\(.*snapshot\|load.*snapshot\|from dados import.*snapshot",
                str(SCRIPTS_DIR),
            ],
            capture_output=True,
            text=True,
        ).stdout.strip()

        # Filter exceptions
        exceptions = [
            "data_pipeline_engine.py",  # Engine itself
            "reconstruct_",  # Snapshot generators (allowed in __main__)
            "test_data_pipeline",  # Tests
            "__pycache__",
        ]

        violations = [
            v
            for v in violations.split("\n")
            if v and not any(e in v for e in exceptions)
        ]

        assert (
            len(violations) == 0
        ), f"Snapshots loaded outside DataPipelineEngine:\n" + "\n".join(violations)

    def test_no_snapshot_imports_in_production(self):
        """Prohibit importing reconstruct_*.py outside __main__ blocks"""
        violations = subprocess.run(
            [
                "grep",
                "-r",
                "--include=*.py",
                r"from reconstruct_\|import reconstruct_",
                str(SCRIPTS_DIR),
            ],
            capture_output=True,
            text=True,
        ).stdout.strip()

        # Filter exceptions
        exceptions = [
            "data_pipeline_engine.py",  # Engine calls them
            "test_data_pipeline",  # Tests
            "__main__",  # CLI entry points
            "__pycache__",
        ]

        violations = [
            v
            for v in violations.split("\n")
            if v and not any(e in v for e in exceptions)
        ]

        assert (
            len(violations) == 0
        ), f"Snapshot generators imported outside allowed scope:\n" + "\n".join(
            violations
        )

    def test_no_snapshot_usage_in_react(self):
        """Prohibit React loading snapshots directly (must go through data.json)"""
        violations = subprocess.run(
            [
                "grep",
                "-r",
                "--include=*.ts",
                "--include=*.tsx",
                r"import.*snapshot\|from.*snapshot",
                str(REACT_DIR),
            ],
            capture_output=True,
            text=True,
        ).stdout.strip()

        # Filter exceptions (tests are OK)
        exceptions = ["__tests__", "__pycache__"]

        violations = [
            v
            for v in violations.split("\n")
            if v and not any(e in v for e in exceptions)
        ]

        assert (
            len(violations) == 0
        ), f"React components loading snapshots directly:\n" + "\n".join(violations)

    def test_no_hardcoded_snapshot_paths(self):
        """Prohibit hardcoded paths like 'dados/macro_snapshot.json' outside engine"""
        snapshot_files = [
            "macro_snapshot.json",
            "factor_snapshot.json",
            "tax_snapshot.json",
            "fire_matrix.json",
            "drawdown_history.json",
            "bond_pool_runway.json",
        ]

        violations = []
        for snapshot_file in snapshot_files:
            grep_result = subprocess.run(
                [
                    "grep",
                    "-r",
                    "--include=*.py",
                    "--include=*.ts",
                    "--include=*.tsx",
                    snapshot_file,
                    str(SCRIPTS_DIR),
                    str(REACT_DIR),
                ],
                capture_output=True,
                text=True,
            ).stdout.strip()

            for match in grep_result.split("\n"):
                if not match:
                    continue
                # Allow in: engine, tests, snapshot generators, comments
                if any(
                    e in match
                    for e in [
                        "data_pipeline_engine",
                        "test_data_pipeline",
                        "reconstruct_",
                        "# ",
                    ]
                ):
                    continue
                violations.append(match)

        assert len(violations) == 0, f"Hardcoded snapshot paths:\n" + "\n".join(
            violations
        )

    def test_no_window_id_manipulation_outside_engine(self):
        """Prohibit creating/modifying _window_id outside DataPipelineEngine"""
        violations = subprocess.run(
            [
                "grep",
                "-r",
                "--include=*.py",
                r'_window_id\s*=|"_window_id":\s*',
                str(SCRIPTS_DIR),
            ],
            capture_output=True,
            text=True,
        ).stdout.strip()

        # Allow in engine and tests only
        exceptions = ["data_pipeline_engine", "test_data_pipeline", "__pycache__"]

        violations = [
            v
            for v in violations.split("\n")
            if v and not any(e in v for e in exceptions)
        ]

        assert (
            len(violations) == 0
        ), f"_window_id modified outside DataPipelineEngine:\n" + "\n".join(
            violations
        )


if __name__ == "__main__":
    import pytest

    pytest.main([__file__, "-v"])
