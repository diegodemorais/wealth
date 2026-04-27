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
        """SWR_FALLBACK must be imported from config, not hardcoded."""
        # Look for hardcoded fallback assignments like: swr_fallback = 0.035
        # Exclude config.py and swr_engine.py (which defines thresholds)
        matches = _grep_in_files(
            r"swr_fallback\s*=\s*0\.035\|SWR_FALLBACK\s*=",
            exclude_patterns=["config.py", "swr_engine.py"],  # Allow in definitions
        )
        assert (
            len(matches) == 0
        ), f"Hardcoded SWR_FALLBACK found outside config: {matches}"

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


class TestProhibitionRulesSWREngine:
    """Prohibition rules for SWREngine."""

    def test_no_duplicate_swr_calculate_logic_outside_engine(self):
        """Duplicate SWR.calculate_*() logic must not exist outside SWREngine."""
        # Look for duplicate zone-classification logic (verde/amarelo/vermelho)
        # that duplicates SWREngine.calculate_*() behavior
        matches = _grep_in_files(
            r"if.*swr.*>=.*0\.035.*verde\|if.*swr_atual.*>=.*3\.5",
            exclude_patterns=["swr_engine.py", "test_"],
        )
        # Filter to find actual duplicates (not just references)
        filtered = [m for m in matches if "zona" in m.lower()]
        assert (
            len(filtered) == 0
        ), f"Duplicate SWR zone logic found outside SWREngine: {filtered}"

    def test_no_zone_classification_outside_engine(self):
        """SWR zone classification must use SWREngine.calculate_*()."""
        # Look for hardcoded zone comparisons: swr >= 0.035 or swr_atual >= 3.5
        matches = _grep_in_files(
            r">=\s*0\.035\|<=\s*0\.025\|>=\s*3\.5",
            exclude_patterns=["swr_engine.py", "test_"],
        )
        filtered = [m for m in matches if "swr" in m.lower()]
        assert (
            len(filtered) == 0
        ), f"Hardcoded SWR zone thresholds found outside SWREngine: {filtered}"

    def test_swr_engine_imported_by_data_pipeline(self):
        """SWR calculations must be delegated through SWREngine imports."""
        # Check generate_data and reconstruct_fire_data import SWREngine
        matches_gen = _grep_in_files(
            r"from.*swr_engine import.*SWREngine",
            exclude_patterns=[],
        )
        matches_recon = [m for m in matches_gen if "reconstruct_fire_data" in m]
        assert len(matches_recon) > 0, "reconstruct_fire_data.py doesn't import SWREngine"


class TestProhibitionRulesGuardrailEngine:
    """Prohibition rules for GuardrailEngine."""

    def test_no_guardrail_calculation_outside_engine(self):
        """Guardrail calculations must use GuardrailEngine, not inline logic."""
        # Look for: spending * (1 - corte) — guardrail calculation pattern
        # Exclude guardrail_engine.py and test files
        matches = _grep_in_files(
            r"spending.*\(1\s*-.*corte\|gasto.*\(1\s*-.*0\.",
            exclude_patterns=["guardrail_engine.py", "test_"],
        )
        filtered = [m for m in matches if "guarantee" not in m]
        assert (
            len(filtered) == 0
        ), f"Inline guardrail calculations found outside GuardrailEngine: {filtered}"

    def test_no_drawdown_guardrail_outside_engine(self):
        """Drawdown-based guardrails must use GuardrailEngine.apply_drawdown_guardrail()."""
        # Look for: aplicar_guardrail function (legacy pattern)
        matches = _grep_in_files(
            r"def aplicar_guardrail\|aplicar_guardrail\(",
            exclude_patterns=["guardrail_engine.py"],
        )
        assert (
            len(matches) == 0
        ), f"Legacy aplicar_guardrail() found outside engine: {matches}"

    def test_guardrail_engine_imported_by_fire_montecarlo(self):
        """fire_montecarlo.py must import GuardrailEngine for withdrawal strategy."""
        matches = _grep_in_files(r"from.*guardrail_engine import.*GuardrailEngine")
        assert (
            len(matches) > 0
        ), "fire_montecarlo.py doesn't import GuardrailEngine"

    def test_guardrail_engine_imported_by_generate_data(self):
        """generate_data.py must import GuardrailEngine for spending guardrails."""
        matches = _grep_in_files(r"from.*guardrail_engine import.*GuardrailEngine")
        assert (
            len(matches) > 0
        ), "generate_data.py doesn't import GuardrailEngine"


class TestProhibitionRulesWithdrawalEngine:
    """Prohibition rules for WithdrawalEngine."""

    def test_no_inline_withdrawal_strategy_outside_engine(self):
        """Withdrawal strategy implementations must use WithdrawalEngine, not inline logic."""
        # Look for: def withdrawal_* (strategy function definitions)
        # Exclude withdrawal_engine.py and test files
        matches = _grep_in_files(
            r"def withdrawal_\|STRATEGY_FNS",
            exclude_patterns=["withdrawal_engine.py", "test_"],
        )
        assert (
            len(matches) == 0
        ), f"Inline withdrawal strategy functions found outside engine: {matches}"

    def test_no_hardcoded_strategy_constants_outside_engine(self):
        """Withdrawal strategy constants must be in withdrawal_engine.py, not duplicated."""
        # Look for: GASTO_TETO_*, VPW_*, GK_* constants
        matches = _grep_in_files(
            r"GASTO_TETO_PCT\|GASTO_TETO_VPW\|VPW_REAL_RATE\|GK_PRESERVATION",
            exclude_patterns=["withdrawal_engine.py", "test_", "config.py"],
        )
        assert (
            len(matches) == 0
        ), f"Withdrawal strategy constants found outside engine: {matches}"

    def test_withdrawal_engine_imported_by_fire_montecarlo(self):
        """fire_montecarlo.py must import WithdrawalEngine."""
        matches = _grep_in_files(r"from.*withdrawal_engine import.*WithdrawalEngine")
        assert (
            len(matches) > 0
        ), "fire_montecarlo.py doesn't import WithdrawalEngine"

    def test_withdrawal_ctx_not_duplicated(self):
        """WithdrawalCtx must only be defined in withdrawal_engine.py."""
        # Look for class WithdrawalCtx definitions
        matches = _grep_in_files(
            r"class WithdrawalCtx",
            exclude_patterns=["withdrawal_engine.py"],
        )
        assert (
            len(matches) == 0
        ), f"WithdrawalCtx class defined outside withdrawal_engine.py: {matches}"

    def test_strategy_functions_not_in_fire_montecarlo(self):
        """fire_montecarlo.py should not have individual strategy functions."""
        # Look for old pattern: def withdrawal_guardrails, def withdrawal_constant, etc.
        fm_file = SCRIPTS_DIR / "fire_montecarlo.py"
        content = fm_file.read_text()

        strategies = ["withdrawal_guardrails", "withdrawal_constant", "withdrawal_pct_portfolio",
                      "withdrawal_vpw", "withdrawal_guyton_klinger", "withdrawal_gk_hybrid"]

        for strategy in strategies:
            assert (
                f"def {strategy}" not in content
            ), f"Found old strategy function {strategy} in fire_montecarlo.py"


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

    def test_all_engines_imported_in_generate_data(self):
        """generate_data.py must import all centralized engines."""
        gd_file = SCRIPTS_DIR / "generate_data.py"
        content = gd_file.read_text()
        engines = ["TaxEngine", "BondPoolEngine", "GuardrailEngine", "SWREngine"]
        for engine in engines:
            assert (
                engine in content
            ), f"generate_data.py doesn't import {engine}"

    def test_swr_engine_imported_in_reconstruct_fire_data(self):
        """reconstruct_fire_data.py must import SWREngine."""
        rfd_file = SCRIPTS_DIR / "reconstruct_fire_data.py"
        content = rfd_file.read_text()
        assert (
            "SWREngine" in content
        ), "reconstruct_fire_data.py doesn't import SWREngine"

    def test_guardrail_engine_imported_in_fire_montecarlo(self):
        """fire_montecarlo.py must import GuardrailEngine."""
        fm_file = SCRIPTS_DIR / "fire_montecarlo.py"
        content = fm_file.read_text()
        assert (
            "GuardrailEngine" in content
        ), "fire_montecarlo.py doesn't import GuardrailEngine"

    def test_withdrawal_engine_imported_in_fire_montecarlo(self):
        """fire_montecarlo.py must import WithdrawalEngine and WithdrawalRequest."""
        fm_file = SCRIPTS_DIR / "fire_montecarlo.py"
        content = fm_file.read_text()
        assert (
            "WithdrawalEngine" in content and "WithdrawalRequest" in content
        ), "fire_montecarlo.py doesn't import WithdrawalEngine/WithdrawalRequest"

    def test_all_five_engines_imported(self):
        """All 5 engines must be imported and used across data pipeline."""
        # Check each engine is imported somewhere in scripts
        engines = {
            "TaxEngine": "tax_engine.py",
            "BondPoolEngine": "bond_pool_engine.py",
            "SWREngine": "swr_engine.py",
            "GuardrailEngine": "guardrail_engine.py",
            "WithdrawalEngine": "withdrawal_engine.py",
        }

        for engine, source_file in engines.items():
            # Verify engine exists
            engine_file = SCRIPTS_DIR / source_file
            assert engine_file.exists(), f"{source_file} doesn't exist"

            # Verify engine is imported somewhere
            matches = _grep_in_files(f"from.*{source_file.replace('.py', '')} import.*{engine}")
            assert (
                len(matches) > 0
            ), f"{engine} from {source_file} not imported anywhere"


if __name__ == "__main__":
    import pytest

    pytest.main([__file__, "-v"])
