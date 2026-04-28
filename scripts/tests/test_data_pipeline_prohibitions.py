#!/usr/bin/env python3
"""
Data Pipeline Prohibition Tests — DATA_PIPELINE_CENTRALIZATION Invariant 6.

Enforces:
- No script besides generate_data.py loads snapshot files for aggregation
- Snapshot generators (reconstruct_*.py) only called from generate_data.py or CLI
- React components consume only data.json (not raw snapshots)
- Comments and test files are always allowed

Architecture: generate_data.py IS the DataPipelineEngine — it owns all snapshot path
constants. Other scripts must not bypass it by loading snapshots independently.
"""

import subprocess
from pathlib import Path


ROOT = Path(__file__).parent.parent.parent
SCRIPTS_DIR = ROOT / "scripts"
REACT_DIR = ROOT / "react-app"


def _grep(pattern: str, *paths: Path, extra_flags: list | None = None) -> list[str]:
    cmd = ["grep", "-r", "--include=*.py", *(extra_flags or []), pattern, *[str(p) for p in paths]]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return [line for line in result.stdout.strip().split("\n") if line]


def _is_allowed(line: str, exceptions: list[str]) -> bool:
    """Returns True if the line should be excluded from violations."""
    line_content = line.split(":", 2)[-1].lstrip() if ":" in line else line
    # Always allow comment lines
    if line_content.startswith("#") or line_content.startswith('"""') or line_content.startswith("'''"):
        return True
    return any(exc in line for exc in exceptions)


class TestDataPipelineProhibitions:
    """Grep-based QA: prevent snapshot bypass patterns."""

    def test_no_direct_snapshot_loads_in_scripts(self):
        """Prohibit json.load(...snapshot) outside generate_data.py and reconstruct_*.py"""
        lines = _grep(
            r"json\.load.*snapshot\|load.*snapshot\|from dados import.*snapshot",
            SCRIPTS_DIR,
        )
        exceptions = [
            "generate_data.py",   # orchestrator — owns all snapshot loads
            "reconstruct_",       # snapshot generators
            "test_data_pipeline", # tests
            "__pycache__",
        ]
        violations = [l for l in lines if not _is_allowed(l, exceptions)]
        assert len(violations) == 0, "Snapshots loaded outside orchestrator:\n" + "\n".join(violations)

    def test_no_snapshot_imports_in_production(self):
        """Prohibit importing reconstruct_*.py as a module outside allowed scopes.

        Note: grep pattern 'import reconstruct_' only matches actual Python import
        statements, not occurrences of the string inside comments or docstrings.
        """
        lines = _grep(
            r"^from reconstruct_\|^import reconstruct_",
            SCRIPTS_DIR,
        )
        exceptions = [
            "generate_data.py",   # orchestrator may call them
            "test_data_pipeline", # tests
            "__pycache__",
        ]
        violations = [l for l in lines if not _is_allowed(l, exceptions)]
        assert len(violations) == 0, "Snapshot generators imported outside allowed scope:\n" + "\n".join(violations)

    def test_no_snapshot_usage_in_react_components(self):
        """Prohibit React components loading snapshots directly — must use data.json.

        Test files (react-app/tests/) and cross-source validation scripts are allowed.
        node_modules/ is excluded (Vitest uses 'snapshot' for test snapshots — different concept).
        """
        result = subprocess.run(
            ["grep", "-r", "--include=*.ts", "--include=*.tsx",
             "--exclude-dir=node_modules",
             r"import.*snapshot\|from.*snapshot", str(REACT_DIR)],
            capture_output=True, text=True,
        )
        lines = [l for l in result.stdout.strip().split("\n") if l]
        exceptions = [
            "/tests/",      # test files
            ".test.ts",     # test files
            ".test.tsx",    # test files
        ]
        violations = [l for l in lines if not _is_allowed(l, exceptions)]
        assert len(violations) == 0, "React components loading snapshots directly:\n" + "\n".join(violations)

    def test_no_hardcoded_snapshot_paths_outside_orchestrator(self):
        """Prohibit hardcoded snapshot paths outside generate_data.py and reconstruct_*.

        generate_data.py is the orchestrator — it defines the canonical path constants.
        All other production scripts must import those constants, not hardcode new paths.
        Test files and comments are always allowed.
        """
        snapshot_files = [
            "macro_snapshot.json",
            "factor_snapshot.json",
            "tax_snapshot.json",
            "fire_matrix.json",
            "drawdown_history.json",
            "bond_pool_runway.json",
        ]
        # Check Python files in scripts/
        py_exceptions = [
            "generate_data.py",        # orchestrator defines path constants
            "data_pipeline_engine.py", # engine maps snapshot names to paths
            "pipeline_archive.py",     # archive script manages snapshot files by name
            "reconstruct_",            # snapshot generators define their output paths
            "fire_montecarlo.py",      # writes fire_matrix.json + docstring refs
            "test_data_pipeline",      # tests
            "__pycache__",
        ]
        # Check TypeScript files in react-app/
        ts_exceptions = [
            "/tests/",
            ".test.ts",
            ".test.tsx",
        ]

        violations = []
        for snapshot_file in snapshot_files:
            # Python scripts
            py_lines = _grep(snapshot_file, SCRIPTS_DIR)
            for line in py_lines:
                if not _is_allowed(line, py_exceptions):
                    violations.append(line)

            # TypeScript files
            ts_result = subprocess.run(
                ["grep", "-r", "--include=*.ts", "--include=*.tsx",
                 snapshot_file, str(REACT_DIR)],
                capture_output=True, text=True,
            )
            for line in ts_result.stdout.strip().split("\n"):
                if line and not _is_allowed(line, ts_exceptions):
                    violations.append(line)

        assert len(violations) == 0, "Hardcoded snapshot paths outside orchestrator:\n" + "\n".join(violations)

    def test_no_window_id_manipulation_outside_orchestrator(self):
        """Prohibit creating/modifying _window_id outside generate_data.py and reconstruct_*.

        Only the pipeline orchestrator and snapshot generators may set _window_id.
        """
        lines = _grep(r'_window_id\s*=|"_window_id":\s*', SCRIPTS_DIR)
        exceptions = [
            "generate_data.py",   # orchestrator sets pipeline_run_id
            "reconstruct_",       # generators embed _window_id in their output
            "test_data_pipeline", # tests
            "__pycache__",
        ]
        violations = [l for l in lines if not _is_allowed(l, exceptions)]
        assert len(violations) == 0, "_window_id modified outside orchestrator:\n" + "\n".join(violations)


if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v"])
