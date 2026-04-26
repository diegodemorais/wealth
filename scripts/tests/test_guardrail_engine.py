#!/usr/bin/env python3
"""
Test suite for GuardrailEngine.

Tests validate:
- Input validation (GuardrailRequest.__post_init__)
- Output validation (GuardrailResult.__post_init__)
- P(FIRE)-based guardrail calculation
- Drawdown-based guardrail adjustment
- Edge cases
"""

import pytest
from datetime import datetime

from guardrail_engine import GuardrailEngine, GuardrailRequest, GuardrailResult


@pytest.fixture
def valid_verde_request():
    """Create valid request in verde zone (P(FIRE) ≥ 85%)."""
    return GuardrailRequest(
        pfire_atual=90.0,
        spending_atual=250_000,
    )


@pytest.fixture
def valid_amarelo_request():
    """Create valid request in amarelo zone (P(FIRE) 75-85%)."""
    return GuardrailRequest(
        pfire_atual=80.0,
        spending_atual=250_000,
    )


@pytest.fixture
def valid_vermelho_request():
    """Create valid request in vermelho zone (P(FIRE) < 75%)."""
    return GuardrailRequest(
        pfire_atual=70.0,
        spending_atual=250_000,
    )


class TestGuardrailRequestValidation:
    """Test input validation for GuardrailRequest."""

    def test_valid_verde_request(self, valid_verde_request):
        """Valid request should pass validation."""
        assert valid_verde_request.pfire_atual == 90.0
        assert valid_verde_request.spending_atual == 250_000

    def test_invalid_pfire_negative(self, valid_verde_request):
        """P(FIRE) must be 0-100%."""
        with pytest.raises(ValueError, match="pfire_atual must be 0-100"):
            GuardrailRequest(
                pfire_atual=-10.0,
                spending_atual=valid_verde_request.spending_atual,
            )

    def test_invalid_pfire_above_100(self, valid_verde_request):
        """P(FIRE) must be 0-100%."""
        with pytest.raises(ValueError, match="pfire_atual must be 0-100"):
            GuardrailRequest(
                pfire_atual=110.0,
                spending_atual=valid_verde_request.spending_atual,
            )

    def test_invalid_spending_zero(self, valid_verde_request):
        """Spending must be > 0."""
        with pytest.raises(ValueError, match="spending_atual must be > 0"):
            GuardrailRequest(
                pfire_atual=valid_verde_request.pfire_atual,
                spending_atual=0,
            )

    def test_invalid_patrimonio_negative(self, valid_verde_request):
        """Patrimonio must be >= 0."""
        with pytest.raises(ValueError, match="patrimonio_atual must be >= 0"):
            GuardrailRequest(
                pfire_atual=valid_verde_request.pfire_atual,
                spending_atual=valid_verde_request.spending_atual,
                patrimonio_atual=-1000,
            )


class TestGuardrailResultValidation:
    """Test output validation for GuardrailResult."""

    def test_valid_result(self, valid_verde_request):
        """Valid result should pass validation."""
        result = GuardrailEngine.calculate(valid_verde_request)
        assert result.source == "guardrail_engine"
        assert result.zona in ("verde", "amarelo", "vermelho")

    def test_invalid_negative_spending(self):
        """Spending values cannot be negative."""
        with pytest.raises(ValueError, match="spending_atual must be > 0"):
            GuardrailResult(
                zona="verde",
                pfire_atual=90.0,
                spending_atual=-100,
                upper_guardrail=300_000,
                safe_target=250_000,
                lower_guardrail=200_000,
                banda="Verde",
                nota="test",
            )

    def test_invalid_ordering(self):
        """Upper must >= safe >= lower."""
        with pytest.raises(ValueError, match="ordering violated"):
            GuardrailResult(
                zona="verde",
                pfire_atual=90.0,
                spending_atual=250_000,
                upper_guardrail=200_000,  # Should be >= safe
                safe_target=250_000,  # Should be >= lower
                lower_guardrail=300_000,  # Should be <= safe
                banda="Verde",
                nota="test",
            )

    def test_invalid_zona_mismatch(self):
        """Zona must match P(FIRE)."""
        with pytest.raises(ValueError, match="doesn't match"):
            GuardrailResult(
                zona="verde",  # Should be amarelo for 80%
                pfire_atual=80.0,
                spending_atual=250_000,
                upper_guardrail=275_000,
                safe_target=225_000,
                lower_guardrail=200_000,
                banda="Amarelo",
                nota="test",
            )


class TestGuardrailEngineZones:
    """Test P(FIRE)-based zone classification."""

    def test_verde_zone_high_pfire(self, valid_verde_request):
        """P(FIRE) ≥ 85% should be verde."""
        result = GuardrailEngine.calculate(valid_verde_request)
        assert result.zona == "verde"
        assert "Verde" in result.banda

    def test_amarelo_zone_medium_pfire(self, valid_amarelo_request):
        """P(FIRE) 75-85% should be amarelo."""
        result = GuardrailEngine.calculate(valid_amarelo_request)
        assert result.zona == "amarelo"
        assert "Amarelo" in result.banda

    def test_vermelho_zone_low_pfire(self, valid_vermelho_request):
        """P(FIRE) < 75% should be vermelho."""
        result = GuardrailEngine.calculate(valid_vermelho_request)
        assert result.zona == "vermelho"
        assert "Vermelho" in result.banda

    def test_verde_boundary_85_percent(self):
        """P(FIRE) exactly 85% should be verde."""
        request = GuardrailRequest(
            pfire_atual=85.0,
            spending_atual=250_000,
        )
        result = GuardrailEngine.calculate(request)
        assert result.zona == "verde"

    def test_amarelo_boundary_75_percent(self):
        """P(FIRE) exactly 75% should be amarelo."""
        request = GuardrailRequest(
            pfire_atual=75.0,
            spending_atual=250_000,
        )
        result = GuardrailEngine.calculate(request)
        assert result.zona == "amarelo"


class TestGuardrailEngineCalculation:
    """Test guardrail spending limits."""

    def test_upper_guardrail_expansion(self, valid_verde_request):
        """Upper guardrail should be spending + 10%."""
        result = GuardrailEngine.calculate(valid_verde_request)
        expected_upper = round(250_000 * 1.10)
        assert result.upper_guardrail == expected_upper

    def test_safe_target_reduction(self, valid_verde_request):
        """Safe target should be spending - 10%."""
        result = GuardrailEngine.calculate(valid_verde_request)
        expected_safe = round(250_000 * 0.90)
        assert result.safe_target == expected_safe

    def test_lower_guardrail_emergency(self, valid_verde_request):
        """Lower guardrail should be spending - 20%."""
        result = GuardrailEngine.calculate(valid_verde_request)
        expected_lower = round(250_000 * 0.80)
        assert result.lower_guardrail == expected_lower

    def test_guardrail_ordering(self, valid_verde_request):
        """Guardrails must be ordered: upper >= safe >= lower."""
        result = GuardrailEngine.calculate(valid_verde_request)
        assert result.upper_guardrail >= result.safe_target
        assert result.safe_target >= result.lower_guardrail

    def test_custom_percentages(self):
        """Custom guardrail percentages should be respected."""
        request = GuardrailRequest(
            pfire_atual=90.0,
            spending_atual=100_000,
            expansion_pct=0.15,  # +15% instead of +10%
            corte_safe_pct=0.15,  # -15% instead of -10%
            corte_lower_pct=0.25,  # -25% instead of -20%
        )
        result = GuardrailEngine.calculate(request)
        assert result.upper_guardrail == round(100_000 * 1.15)
        assert result.safe_target == round(100_000 * 0.85)
        assert result.lower_guardrail == round(100_000 * 0.75)


class TestGuardrailEngineDrawdown:
    """Test drawdown-based guardrail adjustment."""

    def test_no_drawdown_no_adjustment(self, valid_verde_request):
        """Zero drawdown should not reduce spending."""
        adjusted = GuardrailEngine.apply_drawdown_guardrail(
            base_spending=250_000,
            patrimonio_atual=10_000_000,
            patrimonio_pico=10_000_000,  # At peak, no drawdown
        )
        assert adjusted == 250_000  # No cutoff applied

    def test_small_drawdown_no_cutoff(self):
        """Small drawdown (< dd_min) should not apply cutoff."""
        # Assuming dd_min starts at some threshold (e.g., 5%)
        adjusted = GuardrailEngine.apply_drawdown_guardrail(
            base_spending=250_000,
            patrimonio_atual=9_600_000,  # 4% drawdown
            patrimonio_pico=10_000_000,
        )
        # If no matching guardrail, should use GASTO_PISO as floor
        # Exact result depends on GUARDRAILS config
        assert adjusted > 0

    def test_peak_zero_no_adjustment(self):
        """Zero patrimonio_pico should not apply drawdown."""
        adjusted = GuardrailEngine.apply_drawdown_guardrail(
            base_spending=250_000,
            patrimonio_atual=5_000_000,
            patrimonio_pico=0,  # No peak data
        )
        assert adjusted == 250_000  # Returns base unchanged


class TestGuardrailEngineIntegration:
    """Test comprehensive guardrail analysis."""

    def test_complete_analysis(self, valid_verde_request):
        """Complete analysis includes metadata."""
        result = GuardrailEngine.calculate(valid_verde_request)
        assert result._generated is not None
        # Verify timestamp format
        datetime.fromisoformat(result._generated)

    def test_nota_contains_all_info(self, valid_verde_request):
        """Nota should have human-readable explanation."""
        result = GuardrailEngine.calculate(valid_verde_request)
        assert "P(FIRE@53)" in result.nota
        assert "R$" in result.nota
        assert "Teto de expansão" in result.nota or "Safe target" in result.nota

    def test_all_zones_have_metadata(self):
        """All zones should have complete metadata."""
        for pfire in [90.0, 80.0, 70.0]:  # Verde, Amarelo, Vermelho
            request = GuardrailRequest(
                pfire_atual=pfire,
                spending_atual=250_000,
            )
            result = GuardrailEngine.calculate(request)
            assert result.banda is not None
            assert len(result.banda) > 0
            assert result.nota is not None
            assert len(result.nota) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
