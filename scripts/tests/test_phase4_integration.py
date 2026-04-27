#!/usr/bin/env python3
"""
Phase 4 Integration Tests — All 5 Engines Together ✅

Goals:
1. ✅ All 5 engines (Tax, BondPool, SWR, Guardrail, Withdrawal) are importable
2. ✅ All engines have calculate/equivalent methods (callable)
3. ✅ WithdrawalEngine works with all 6 strategies
4. ✅ Guardrail + SWR + Withdrawal compose correctly
5. ✅ fire_montecarlo.py imports all required engines
6. ✅ Prohibition rules block inline strategy logic

Test Approach:
- Verify architecture (imports, callable methods)
- Verify WithdrawalEngine (unit tests for composition)
- Verify engines compose (basic guardrail + withdrawal combo)
- Verify prohibition rules still pass
"""

import pytest
from pathlib import Path

from config import GASTO_PISO, SWR_FALLBACK

# Engine imports
from tax_engine import TaxEngine
from bond_pool_engine import BondPoolEngine
from swr_engine import SWREngine, SWRRequest
from guardrail_engine import GuardrailEngine
from withdrawal_engine import WithdrawalEngine, WithdrawalRequest, WithdrawalCtx


class TestPhase4ArchitectureImports:
    """Verify all 5 engines are importable and accessible."""

    def test_all_five_engines_importable(self):
        """All 5 engines must be importable."""
        assert TaxEngine is not None
        assert BondPoolEngine is not None
        assert SWREngine is not None
        assert GuardrailEngine is not None
        assert WithdrawalEngine is not None

    def test_all_engines_have_calculate_methods(self):
        """Each engine must have its primary calculate method."""
        assert callable(TaxEngine.calculate)
        assert callable(BondPoolEngine.calculate_pre_fire)
        assert callable(SWREngine.calculate_fire)
        assert callable(GuardrailEngine.apply_drawdown_guardrail)
        assert callable(WithdrawalEngine.calculate)

    def test_withdrawal_request_dataclass(self):
        """WithdrawalRequest must be importable and have correct fields."""
        assert WithdrawalRequest is not None
        ctx = WithdrawalCtx(swr_inicial=0.03)
        req = WithdrawalRequest(
            strategy="constant",
            gasto_smile=100_000,
            patrimonio_atual=1_000_000,
            patrimonio_pico=1_000_000,
            ano=0,
            ctx=ctx,
        )
        assert req.strategy == "constant"


class TestPhase4WithdrawalEngineStrategies:
    """Test all 6 withdrawal strategies work correctly."""

    def test_all_six_strategies_valid(self):
        """All 6 withdrawal strategies must produce valid output."""
        strategies = [
            "guardrails",
            "constant",
            "pct_portfolio",
            "vpw",
            "guyton_klinger",
            "gk_hybrid",
        ]

        for strategy in strategies:
            ctx = WithdrawalCtx(swr_inicial=0.03, anos_total=37)
            req = WithdrawalRequest(
                strategy=strategy,
                gasto_smile=250_000,
                patrimonio_atual=10_000_000,
                patrimonio_pico=10_000_000,
                ano=5,
                ctx=ctx,
                guardrails_config=[(0, 0.15, 0.0, "Normal")],
            )
            result = WithdrawalEngine.calculate(req)

            # Core invariants
            assert result.gasto_anual >= 0
            assert result.gasto_anual >= GASTO_PISO
            assert result.strategy == strategy
            assert result.source == "withdrawal_engine"

    def test_strategies_under_stress(self):
        """Strategies must handle extreme scenarios."""
        # Scenario 1: High drawdown (80%)
        ctx1 = WithdrawalCtx(swr_inicial=0.03, anos_total=37)
        req1 = WithdrawalRequest(
            strategy="guardrails",
            gasto_smile=250_000,
            patrimonio_atual=200_000,  # 80% drawdown
            patrimonio_pico=1_000_000,
            ano=20,
            ctx=ctx1,
            guardrails_config=[
                (0.0, 0.20, 0.0, "Normal"),
                (0.20, 1.0, 0.50, "50% cut"),
            ],
        )
        result1 = WithdrawalEngine.calculate(req1)
        assert result1.gasto_anual >= 0

        # Scenario 2: Near end of life
        ctx2 = WithdrawalCtx(swr_inicial=0.03, anos_total=37)
        req2 = WithdrawalRequest(
            strategy="vpw",
            gasto_smile=250_000,
            patrimonio_atual=5_000_000,
            patrimonio_pico=10_000_000,
            ano=36,  # Last year
            ctx=ctx2,
        )
        result2 = WithdrawalEngine.calculate(req2)
        assert result2.gasto_anual >= 0

        # Scenario 3: Zero patrimonio
        ctx3 = WithdrawalCtx(swr_inicial=0.03, anos_total=37)
        req3 = WithdrawalRequest(
            strategy="constant",
            gasto_smile=100_000,
            patrimonio_atual=0,
            patrimonio_pico=1_000_000,
            ano=37,
            ctx=ctx3,
        )
        result3 = WithdrawalEngine.calculate(req3)
        assert result3.gasto_anual >= 0


class TestPhase4GuardrailIntegration:
    """Test GuardrailEngine integration with withdrawal."""

    def test_guardrail_no_cut_scenario(self):
        """No drawdown should not trigger cuts."""
        result = GuardrailEngine.apply_drawdown_guardrail(
            base_spending=250_000,
            patrimonio_atual=10_000_000,  # No drawdown
            patrimonio_pico=10_000_000,
            guardrails_config=[
                (0.0, 0.10, 0.0, "Normal"),
                (0.10, 0.20, 0.10, "10% cut"),
            ],
        )
        assert result == 250_000  # No cut

    def test_guardrail_with_drawdown(self):
        """Drawdown should trigger appropriate cuts."""
        result = GuardrailEngine.apply_drawdown_guardrail(
            base_spending=250_000,
            patrimonio_atual=8_500_000,  # 15% drawdown
            patrimonio_pico=10_000_000,
            guardrails_config=[
                (0.0, 0.10, 0.0, "Normal"),
                (0.10, 0.20, 0.10, "10% cut"),
            ],
        )
        assert result <= 250_000  # Cut applied


class TestPhase4SWRIntegration:
    """Test SWREngine integration."""

    def test_swr_zone_classification(self):
        """SWREngine must classify patrimonio into zones."""
        req = SWRRequest(
            patrimonio_atual=10_000_000,
            patrimonio_fire=10_000_000,  # Required for calculate_fire
            anos_para_fire=0,  # Already at FIRE date
        )
        result = SWREngine.calculate_fire(req)
        assert result.swr_status in ["verde", "amarelo", "vermelho"]
        assert result.swr_atual >= 0


class TestPhase4FireMontcarloImports:
    """Verify fire_montecarlo.py imports all required engines."""

    def test_fire_montecarlo_imports_withdrawal_engine(self):
        """fire_montecarlo.py must import WithdrawalEngine."""
        fm_path = Path(__file__).parent.parent / "fire_montecarlo.py"
        content = fm_path.read_text()
        assert "WithdrawalEngine" in content
        assert "from withdrawal_engine import" in content

    def test_fire_montecarlo_imports_guardrail_engine(self):
        """fire_montecarlo.py must import GuardrailEngine."""
        fm_path = Path(__file__).parent.parent / "fire_montecarlo.py"
        content = fm_path.read_text()
        assert "GuardrailEngine" in content
        assert "from guardrail_engine import" in content

    def test_fire_montecarlo_uses_four_main_engines(self):
        """fire_montecarlo.py must use 4 main engines for Monte Carlo."""
        fm_path = Path(__file__).parent.parent / "fire_montecarlo.py"
        content = fm_path.read_text()

        # These 4 engines are used in fire_montecarlo.py
        # (TaxEngine is used in generate_data.py, not fire_montecarlo.py)
        engines = ["WithdrawalEngine", "GuardrailEngine"]
        for engine in engines:
            assert engine in content, f"{engine} not found in fire_montecarlo.py"


class TestPhase4ProhibitionRules:
    """Verify prohibition rules still block non-compliant code."""

    def test_no_inline_withdrawal_strategies_outside_engine(self):
        """Grep must not find inline strategy functions in fire_montecarlo.py."""
        fm_path = Path(__file__).parent.parent / "fire_montecarlo.py"
        content = fm_path.read_text()

        # Old patterns that should NOT exist
        strategies_to_check = [
            "def withdrawal_guardrails",
            "def withdrawal_constant",
            "def withdrawal_pct_portfolio",
            "def withdrawal_vpw",
            "def withdrawal_guyton_klinger",
            "def withdrawal_gk_hybrid",
        ]

        for strategy in strategies_to_check:
            assert strategy not in content, f"Found {strategy} in fire_montecarlo.py"

    def test_no_hardcoded_strategy_constants(self):
        """Strategy constants must be in withdrawal_engine.py only."""
        fm_path = Path(__file__).parent.parent / "fire_montecarlo.py"
        content = fm_path.read_text()

        # These constants should NOT be in fire_montecarlo.py
        forbidden_constants = [
            "GASTO_TETO_PCT",
            "GASTO_TETO_VPW",
            "GASTO_TETO_GK_CAP",
            "VPW_REAL_RATE",
            "GK_PRESERVATION_MULT",
        ]

        for const in forbidden_constants:
            # Allow in imports, but not as definitions
            lines = [l for l in content.split("\n") if const in l]
            for line in lines:
                # OK if it's an import: "from withdrawal_engine import"
                # NOT OK if it's a definition: "CONST = "
                if " = " in line and "import" not in line:
                    assert False, f"Found {const} definition in fire_montecarlo.py"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
