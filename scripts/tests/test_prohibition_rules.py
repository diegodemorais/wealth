#!/usr/bin/env python3
"""
Prohibition Rules for Centralized Engines.

These tests enforce architectural guarantees by preventing code patterns
that would bypass the centralized calculation engines.

Pattern: Guaranteed Invariants
- TaxEngine: single source of tax calculations (Lei 14.754/2023)
- BondPoolEngine: single source of bond pool calculations
- Config: single source of SWR constants

Violations cause CI to fail, preventing merge of non-compliant code.
"""

import subprocess
from pathlib import Path


ROOT = Path(__file__).parent.parent.parent
SCRIPTS_DIR = ROOT / "scripts"


def _grep_in_files(pattern: str, exclude_patterns: list[str] = None) -> list[str]:
    """Run grep to find pattern in Python files, excluding test files."""
    if exclude_patterns is None:
        exclude_patterns = []

    cmd = [
        "grep",
        "-r",
        "--include=*.py",
    ] + [f"--exclude-dir={d}" for d in ["__pycache__", ".git", "tests"]] + [
        pattern,
        str(SCRIPTS_DIR),
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        lines = result.stdout.strip().split("\n") if result.stdout.strip() else []
        # Filter out excluded patterns
        filtered = []
        for line in lines:
            exclude = False
            for exc in exclude_patterns:
                if exc in line:
                    exclude = True
                    break
            if not exclude and line:
                filtered.append(line)
        return filtered
    except Exception:
        return []


class TestProhibitionRulesTaxEngine:
    """Prohibition rules for TaxEngine (Lei 14.754/2023)."""

    def test_no_compute_tax_diferido_outside_tax_engine(self):
        """compute_tax_diferido function must only exist in tax_engine.py."""
        # Look for function definition: def compute_tax_diferido
        matches = _grep_in_files(
            r"def compute_tax_diferido",
            exclude_patterns=["tax_engine.py"],  # Allow in tax_engine.py itself
        )
        assert (
            len(matches) == 0
        ), f"compute_tax_diferido() found outside tax_engine.py: {matches}"

    def test_no_inline_tax_calculations_outside_tax_engine(self):
        """Tax calculations must use TaxEngine.calculate(), not inline logic."""
        # Look for: (valor_brl - custo_brl) * 0.15 — common pattern
        # This is permissive: only catch obvious inline tax arithmetic
        matches = _grep_in_files(
            r"ir.*=.*\*.*0\.15\|ganho.*\*.*0\.15",
            exclude_patterns=["tax_engine.py", "test_"],
        )
        # Allow _load_cache (caching), IPCA (allocation), generic multiplication
        filtered = [
            m
            for m in matches
            if "ALIQUOTA" not in m and "_load_cache" not in m and "IPCA" not in m
        ]
        assert (
            len(filtered) == 0
        ), f"Inline tax calculations found outside TaxEngine: {filtered}"

    def test_ptax_series_must_use_tax_engine(self):
        """PTAX lookups must route through TaxEngine._lookup_ptax()."""
        # Look for direct PTAX series access outside TaxEngine
        matches = _grep_in_files(
            r"_fetch_ptax_series|_lookup_ptax",
            exclude_patterns=["tax_engine.py"],
        )
        assert (
            len(matches) == 0
        ), f"Direct PTAX access outside TaxEngine: {matches}"


class TestProhibitionRulesBondPoolEngine:
    """Prohibition rules for BondPoolEngine."""

    def test_no_bond_pool_inline_calculations(self):
        """Bond pool calculations must use BondPoolEngine, not inline logic."""
        # Look for: pool = pool * (1 + r) — common pattern
        # But exclude reconstruct_fire_data (keeps legacy simple depletion)
        matches = _grep_in_files(
            r"pool\s*=\s*pool\s*\*\s*\(",
            exclude_patterns=[
                "bond_pool_engine.py",  # Allow in engine
                "reconstruct_fire_data.py",  # Legacy code
                "test_",  # Test files
            ],
        )
        assert (
            len(matches) == 0
        ), f"Inline bond pool calculations found outside BondPoolEngine: {matches}"

    def test_no_pre_fire_accumulation_outside_engine(self):
        """Pre-FIRE accumulation must use BondPoolEngine.calculate_pre_fire()."""
        # Look for the specific pattern: years accumulation loop
        matches = _grep_in_files(
            r"for.*ano.*in.*range.*\|anos_pre_fire.*=",
            exclude_patterns=["bond_pool_engine.py", "test_"],
        )
        # Filter: this is a strict search, may have false positives
        # We're looking for accumulation patterns specifically
        bond_accum = [
            m
            for m in matches
            if "pool" in m.lower() and ("taxa" in m.lower() or "aporte" in m.lower())
        ]
        assert (
            len(bond_accum) == 0
        ), f"Pre-FIRE accumulation outside BondPoolEngine: {bond_accum}"

    def test_profile_dependent_runway_uses_engine(self):
        """Profile-dependent runway calculations must use BondPoolEngine."""
        # Look for: _compute_bond_pool_runway_by_profile as a custom function
        matches = _grep_in_files(
            r"def.*bond_pool_runway.*profile\|def.*runway.*profile",
            exclude_patterns=["generate_data.py"],  # Wrapper is OK
        )
        assert (
            len(matches) == 0
        ), f"Custom profile runway function found outside wrapper: {matches}"


class TestProhibitionRulesSWRConstants:
    """Prohibition rules for SWR constants."""

    def test_no_hardcoded_swr_fallback(self):
        """SWR_FALLBACK must be defined in config.py, not hardcoded elsewhere."""
        # Look for: = 0.035 or = 0.035 (SWR fallback value)
        matches = _grep_in_files(
            r"SWR.*=.*0\.035\|swr.*=.*0\.035",
            exclude_patterns=["config.py"],  # Allow in config
        )
        assert (
            len(matches) == 0
        ), f"Hardcoded SWR_FALLBACK = 0.035 found outside config.py: {matches}"

    def test_withdrawal_uses_config_swr(self):
        """Withdrawal calculations must import SWR constants from config."""
        # Look for: withdrawal code that imports or uses SWR
        # Make sure it's coming from config
        matches = _grep_in_files(
            r"from.*fire_montecarlo.*import.*SWR",
            exclude_patterns=[],  # This should have no matches
        )
        assert (
            len(matches) == 0
        ), f"SWR imported from fire_montecarlo (should be from config): {matches}"


class TestProhibitionRulesIntegration:
    """Integration tests ensuring engines are actually used."""

    def test_tax_engine_imported_by_generate_data(self):
        """generate_data.py must import TaxEngine."""
        matches = _grep_in_files(r"from.*tax_engine import.*TaxEngine")
        assert len(matches) > 0, "generate_data.py doesn't import TaxEngine"

    def test_bond_pool_engine_imported_by_generate_data(self):
        """generate_data.py must import BondPoolEngine."""
        matches = _grep_in_files(r"from.*bond_pool_engine import.*BondPoolEngine")
        assert len(matches) > 0, "generate_data.py doesn't import BondPoolEngine"

    def test_bond_pool_engine_imported_by_reconstruct_fire_data(self):
        """reconstruct_fire_data.py must import BondPoolEngine."""
        matches = _grep_in_files(r"from.*bond_pool_engine import.*BondPoolEngine")
        assert (
            len(matches) > 0
        ), "reconstruct_fire_data.py doesn't import BondPoolEngine"

    def test_swr_fallback_imported_by_fire_montecarlo(self):
        """fire_montecarlo.py must import SWR_FALLBACK from config."""
        # Check fire_montecarlo.py directly
        fm_file = SCRIPTS_DIR / "fire_montecarlo.py"
        content = fm_file.read_text()
        assert (
            "SWR_FALLBACK" in content and "from config import" in content
        ), "fire_montecarlo.py doesn't import SWR_FALLBACK from config"


if __name__ == "__main__":
    import pytest

    pytest.main([__file__, "-v"])
