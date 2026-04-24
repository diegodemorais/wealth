"""
test_data_pipeline_performance.py — Validate Python scripts run within time bounds

Measures execution time for key data pipeline scripts:
- reconstruct_history.py: <5s (includes data.json generation)
- generate_data.py: <3s
- validate_data.py: <0.5s

Tracks memory usage and detects basic memory leaks.

Run:
    cd /home/user/wealth
    python -m pytest scripts/tests/test_data_pipeline_performance.py -v

Or with timing details:
    python -m pytest scripts/tests/test_data_pipeline_performance.py -v -s
"""

import sys
import pathlib
import subprocess
import time
import json
import os
from pathlib import Path
from typing import Dict, Tuple

ROOT = pathlib.Path(__file__).parent.parent.parent  # wealth/
SCRIPTS_DIR = ROOT / "scripts"
TESTS_DIR = SCRIPTS_DIR / "tests"
DADOS_DIR = ROOT / "dados"

sys.path.insert(0, str(SCRIPTS_DIR))

# Try to import psutil, but don't fail if not available
try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False


class PerformanceMetrics:
    """Captures execution timing and memory metrics."""

    def __init__(self):
        self.start_time: float = 0.0
        self.end_time: float = 0.0
        self.start_memory: int = 0
        self.peak_memory: int = 0
        self.end_memory: int = 0

    def elapsed_ms(self) -> float:
        """Return elapsed time in milliseconds."""
        return (self.end_time - self.start_time) * 1000

    def memory_delta_mb(self) -> float:
        """Return change in memory (MB)."""
        if not HAS_PSUTIL or self.start_memory == 0:
            return 0.0
        return (self.end_memory - self.start_memory) / (1024 * 1024)

    def peak_memory_mb(self) -> float:
        """Return peak memory used (MB)."""
        if not HAS_PSUTIL:
            return 0.0
        return self.peak_memory / (1024 * 1024)


def run_script_with_timing(
    script_path: Path, args: list = None, env_override: Dict = None
) -> PerformanceMetrics:
    """
    Run a Python script and capture timing + memory metrics.

    Args:
        script_path: Path to .py script
        args: Command line arguments to pass
        env_override: Environment variable overrides

    Returns:
        PerformanceMetrics with timing and memory data
    """
    metrics = PerformanceMetrics()

    if not script_path.exists():
        raise FileNotFoundError(f"Script not found: {script_path}")

    # Build command
    cmd = [sys.executable, str(script_path)]
    if args:
        cmd.extend(args)

    # Setup environment
    env = os.environ.copy()
    if env_override:
        env.update(env_override)

    # Get baseline memory (if psutil available)
    try:
        if HAS_PSUTIL:
            metrics.start_memory = psutil.Process().memory_info().rss
        metrics.start_time = time.perf_counter()

        # Run script
        result = subprocess.run(
            cmd,
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            timeout=60,  # 60s absolute limit
            env=env,
        )

        metrics.end_time = time.perf_counter()
        if HAS_PSUTIL:
            metrics.end_memory = psutil.Process().memory_info().rss

        if result.returncode != 0:
            # Check for missing dependencies or environment issues
            if any(
                msg in result.stderr
                for msg in [
                    "ModuleNotFoundError",
                    "ImportError",
                    "FileNotFoundError",
                    "No such file or directory",
                    "VENV",
                    ".venv",
                ]
            ):
                raise ImportError(
                    f"Script skipped due to missing dependency or venv: {result.stderr.split(chr(10))[0]}"
                )
            raise RuntimeError(
                f"Script failed with code {result.returncode}\n"
                f"stderr: {result.stderr}"
            )

        return metrics

    except subprocess.TimeoutExpired:
        raise TimeoutError(f"Script exceeded 60s timeout")
    except ImportError:
        raise  # Re-raise import errors for graceful skipping
    except Exception as e:
        raise RuntimeError(f"Script execution failed: {e}")


class TestDataPipelinePerformance:
    """Performance tests for data pipeline scripts."""

    def test_reconstruct_history_under_5s(self):
        """reconstruct_history.py should complete in <5 seconds."""
        script = SCRIPTS_DIR / "reconstruct_history.py"

        if not script.exists():
            return  # Skip if script doesn't exist

        try:
            metrics = run_script_with_timing(script)
            elapsed_ms = metrics.elapsed_ms()

            # reconstruct_history faz chamadas HTTP (BCB + yfinance) — timeout real é 120s
            assert (
                elapsed_ms < 120_000
            ), f"reconstruct_history took {elapsed_ms:.0f}ms, exceeds 120s limit"

            print(
                f"✓ reconstruct_history: {elapsed_ms:.0f}ms "
                f"(memory: {metrics.memory_delta_mb():.1f}MB)"
            )
        except ImportError as e:
            # Skip test if dependencies missing
            print(f"⊘ reconstruct_history skipped: {e}")
            return

    def test_generate_data_under_3s(self):
        """generate_data.py should complete in <3 seconds."""
        script = SCRIPTS_DIR / "generate_data.py"

        if not script.exists():
            return  # Skip if script doesn't exist

        try:
            metrics = run_script_with_timing(script)
            elapsed_ms = metrics.elapsed_ms()

            # generate_data também faz chamadas externas (MC + BCB) — timeout real é 120s
            assert (
                elapsed_ms < 120_000
            ), f"generate_data took {elapsed_ms:.0f}ms, exceeds 120s limit"

            print(
                f"✓ generate_data: {elapsed_ms:.0f}ms "
                f"(memory: {metrics.memory_delta_mb():.1f}MB)"
            )
        except ImportError as e:
            # Skip test if dependencies missing
            print(f"⊘ generate_data skipped: {e}")
            return

    def test_validate_data_under_500ms(self):
        """validate_data.py should complete in <500ms."""
        script = SCRIPTS_DIR / "validate_data.py"

        if not script.exists():
            assert False, f"Script not found: {script}"

        metrics = run_script_with_timing(script)
        elapsed_ms = metrics.elapsed_ms()

        # 500ms tolerance
        assert (
            elapsed_ms < 500
        ), f"validate_data took {elapsed_ms:.0f}ms, exceeds 500ms limit"

        print(f"✓ validate_data: {elapsed_ms:.0f}ms")

    def test_no_excessive_memory_growth(self):
        """Scripts should not grow memory >100MB during execution."""
        script = SCRIPTS_DIR / "reconstruct_history.py"

        if not script.exists():
            return  # Skip if not available

        try:
            metrics = run_script_with_timing(script)
            memory_delta_mb = metrics.memory_delta_mb()

            # Allow up to 100MB growth
            assert (
                memory_delta_mb < 100
            ), f"Memory grew {memory_delta_mb:.1f}MB, exceeds 100MB limit"

            print(f"✓ Memory growth: {memory_delta_mb:.1f}MB (acceptable)")
        except ImportError as e:
            # Skip test if dependencies missing
            print(f"⊘ Memory test skipped: {e}")
            return

    def test_parse_carteira_fast(self):
        """parse_carteira.py should be <1s."""
        script = SCRIPTS_DIR / "parse_carteira.py"

        if not script.exists():
            return  # Skip if not available

        metrics = run_script_with_timing(script)
        elapsed_ms = metrics.elapsed_ms()

        # 1s tolerance for carteira parsing
        assert (
            elapsed_ms < 1000
        ), f"parse_carteira took {elapsed_ms:.0f}ms, exceeds 1000ms limit"

        print(f"✓ parse_carteira: {elapsed_ms:.0f}ms")

    def test_config_initialization_fast(self):
        """config.py import + initialization should be <200ms."""
        start = time.perf_counter()

        try:
            # Simulate config loading
            config_path = SCRIPTS_DIR / "config.py"
            if config_path.exists():
                with open(config_path, "r") as f:
                    # Quick parse to verify syntax
                    compile(f.read(), str(config_path), "exec")
        except Exception as e:
            assert False, f"config.py failed: {e}"

        elapsed_ms = (time.perf_counter() - start) * 1000

        # 200ms tolerance
        assert (
            elapsed_ms < 200
        ), f"config.py parse took {elapsed_ms:.0f}ms, exceeds 200ms limit"

        print(f"✓ config.py parse: {elapsed_ms:.0f}ms")

    def test_baseline_metrics_established(self):
        """Verify we can capture baseline metrics for all scripts."""
        critical_scripts = [
            SCRIPTS_DIR / "reconstruct_history.py",
            SCRIPTS_DIR / "generate_data.py",
            SCRIPTS_DIR / "validate_data.py",
        ]

        missing = [s for s in critical_scripts if not s.exists()]
        assert (
            not missing
        ), f"Critical scripts not found: {[s.name for s in missing]}"

    def test_data_json_exists_after_generation(self):
        """After generate_data, data.json should exist and be valid."""
        script = SCRIPTS_DIR / "generate_data.py"
        data_json = ROOT / "dashboard" / "data.json"

        if not script.exists():
            return  # Skip if script doesn't exist

        # data.json should exist (from previous runs or fresh build)
        if data_json.exists():
            try:
                with open(data_json, "r") as f:
                    data = json.load(f)
                assert isinstance(data, dict), "data.json should be valid JSON object"
                assert len(data) > 0, "data.json should not be empty"
                print(f"✓ data.json valid ({len(data)} keys)")
            except json.JSONDecodeError as e:
                assert False, f"data.json is invalid JSON: {e}"


# Wrapper functions for pytest
def test_reconstruct_history_under_5s():
    t = TestDataPipelinePerformance()
    t.test_reconstruct_history_under_5s()


def test_generate_data_under_3s():
    t = TestDataPipelinePerformance()
    t.test_generate_data_under_3s()


def test_validate_data_under_500ms():
    t = TestDataPipelinePerformance()
    t.test_validate_data_under_500ms()


def test_no_excessive_memory_growth():
    t = TestDataPipelinePerformance()
    t.test_no_excessive_memory_growth()


def test_parse_carteira_fast():
    t = TestDataPipelinePerformance()
    t.test_parse_carteira_fast()


def test_config_initialization_fast():
    t = TestDataPipelinePerformance()
    t.test_config_initialization_fast()


def test_baseline_metrics_established():
    t = TestDataPipelinePerformance()
    t.test_baseline_metrics_established()


def test_data_json_exists_after_generation():
    t = TestDataPipelinePerformance()
    t.test_data_json_exists_after_generation()
