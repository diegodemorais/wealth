#!/usr/bin/env python3
"""
Test suite for TaxEngine (Lei 14.754/2023).

Tests validate:
- Input validation (TaxRequest.__post_init__)
- Output validation (TaxResult.__post_init__)
- Calculation correctness
- Edge cases (zero gains, missing prices, etc)
"""

import pytest
from datetime import datetime
from pathlib import Path
import json
import tempfile

from tax_engine import TaxEngine, TaxRequest, TaxResult


@pytest.fixture
def temp_lotes_file():
    """Create a temporary lotes.json file for testing."""
    lotes_data = {
        "SWRD": {
            "total_qty": 1000,
            "lotes": [
                {
                    "qty": 1000,
                    "custo_por_share": 50.0,
                    "data": "2024-01-15",
                }
            ],
        }
    }
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        json.dump(lotes_data, f)
        yield Path(f.name)
    Path(f.name).unlink()


@pytest.fixture
def valid_request(temp_lotes_file):
    """Create a valid TaxRequest for testing."""
    return TaxRequest(
        posicoes={"SWRD": {"price": 60.0}},
        cambio_atual=5.0,
        ptax_series={"2024-01-15": 5.0},
        ptax_source="BCB PTAX ask",
        lotes_path=temp_lotes_file,
    )


class TestTaxRequestValidation:
    """Test input validation for TaxRequest."""

    def test_valid_request(self, valid_request):
        """Valid request should pass validation."""
        assert valid_request.cambio_atual == 5.0
        assert valid_request.posicoes["SWRD"]["price"] == 60.0

    def test_invalid_cambio_zero(self, valid_request):
        """Cambio must be > 0."""
        with pytest.raises(ValueError, match="cambio_atual must be > 0"):
            TaxRequest(
                posicoes=valid_request.posicoes,
                cambio_atual=0.0,
                ptax_series=valid_request.ptax_series,
                ptax_source=valid_request.ptax_source,
                lotes_path=valid_request.lotes_path,
            )

    def test_invalid_cambio_negative(self, valid_request):
        """Cambio must be > 0."""
        with pytest.raises(ValueError, match="cambio_atual must be > 0"):
            TaxRequest(
                posicoes=valid_request.posicoes,
                cambio_atual=-5.0,
                ptax_series=valid_request.ptax_series,
                ptax_source=valid_request.ptax_source,
                lotes_path=valid_request.lotes_path,
            )

    def test_invalid_posicoes_type(self, valid_request):
        """Posicoes must be dict."""
        with pytest.raises(ValueError, match="posicoes must be dict"):
            TaxRequest(
                posicoes="not a dict",
                cambio_atual=valid_request.cambio_atual,
                ptax_series=valid_request.ptax_series,
                ptax_source=valid_request.ptax_source,
                lotes_path=valid_request.lotes_path,
            )

    def test_invalid_ptax_source_empty(self, valid_request):
        """Ptax source must not be empty."""
        with pytest.raises(ValueError, match="ptax_source must not be empty"):
            TaxRequest(
                posicoes=valid_request.posicoes,
                cambio_atual=valid_request.cambio_atual,
                ptax_series=valid_request.ptax_series,
                ptax_source="",
                lotes_path=valid_request.lotes_path,
            )


class TestTaxResultValidation:
    """Test output validation for TaxResult."""

    def test_valid_result(self):
        """Valid result should pass validation."""
        result = TaxResult(
            ir_diferido_total_brl=10000.0,
            ir_por_etf={
                "SWRD": {
                    "ganho_usd": 1000.0,
                    "ir_estimado": 1500.0,
                }
            },
            regime="ACC UCITS — diferimento fiscal (Lei 14.754/2023, art. 2-3: 15% flat)",
            badges={"SWRD": "ACC — diferimento fiscal"},
            ptax_source="BCB PTAX ask",
            ptax_atual=5.0,
        )
        assert result.ir_diferido_total_brl == 10000.0
        assert result.source == "lei14754"

    def test_negative_ir_fails(self):
        """IR cannot be negative."""
        with pytest.raises(ValueError, match="cannot be negative"):
            TaxResult(
                ir_diferido_total_brl=-100.0,
                ir_por_etf={},
                regime="Lei 14.754/2023",
                badges={},
                ptax_source="fallback",
                ptax_atual=5.0,
            )

    def test_invalid_ptax_atual_zero(self):
        """Ptax atual must be > 0."""
        with pytest.raises(ValueError, match="ptax_atual must be > 0"):
            TaxResult(
                ir_diferido_total_brl=1000.0,
                ir_por_etf={},
                regime="Lei 14.754/2023",
                badges={},
                ptax_source="fallback",
                ptax_atual=0.0,
            )

    def test_invalid_regime(self):
        """Regime must reference Lei 14.754."""
        with pytest.raises(ValueError, match="regime must reference Lei 14.754"):
            TaxResult(
                ir_diferido_total_brl=1000.0,
                ir_por_etf={},
                regime="Some other regime",
                badges={},
                ptax_source="fallback",
                ptax_atual=5.0,
            )


class TestTaxEngineCalculation:
    """Test tax calculation logic."""

    def test_basic_calculation(self, valid_request):
        """Basic calculation: (1000 shares * $60 * R$5) - (1000 * $50 * R$5) = R$5,000 gain × 15% = R$750."""
        result = TaxEngine.calculate(valid_request)

        assert result.ir_diferido_total_brl == 750.0
        assert "SWRD" in result.ir_por_etf
        assert result.ir_por_etf["SWRD"]["ganho_brl"] == 5000.0
        assert result.ir_por_etf["SWRD"]["ir_estimado"] == 750.0

    def test_zero_gain(self, temp_lotes_file):
        """No gain = no tax."""
        request = TaxRequest(
            posicoes={"SWRD": {"price": 50.0}},  # Price = cost, zero gain
            cambio_atual=5.0,
            ptax_series={"2024-01-15": 5.0},
            ptax_source="BCB PTAX ask",
            lotes_path=temp_lotes_file,
        )
        result = TaxEngine.calculate(request)

        assert result.ir_diferido_total_brl == 0.0
        assert result.ir_por_etf["SWRD"]["ganho_brl"] == 0.0

    def test_loss_no_tax(self, temp_lotes_file):
        """Loss = no tax (max(0, loss) = 0)."""
        request = TaxRequest(
            posicoes={"SWRD": {"price": 40.0}},  # Price < cost, loss
            cambio_atual=5.0,
            ptax_series={"2024-01-15": 5.0},
            ptax_source="BCB PTAX ask",
            lotes_path=temp_lotes_file,
        )
        result = TaxEngine.calculate(request)

        assert result.ir_diferido_total_brl == 0.0
        assert result.ir_por_etf["SWRD"]["ganho_brl"] == -5000.0
        assert result.ir_por_etf["SWRD"]["ir_estimado"] == 0.0

    def test_missing_price(self, temp_lotes_file):
        """Missing price = skip ticker."""
        request = TaxRequest(
            posicoes={},  # No SWRD in posicoes
            cambio_atual=5.0,
            ptax_series={"2024-01-15": 5.0},
            ptax_source="BCB PTAX ask",
            lotes_path=temp_lotes_file,
        )
        result = TaxEngine.calculate(request)

        assert result.ir_diferido_total_brl == 0.0
        assert "SWRD" not in result.ir_por_etf

    def test_zero_lotes(self, temp_lotes_file):
        """Zero lotes = skip ticker."""
        # Create temp file with zero qty
        zero_lotes = {
            "SWRD": {
                "total_qty": 0,  # Zero quantity
                "lotes": [],
            }
        }
        zero_file = temp_lotes_file.parent / "zero_lotes.json"
        zero_file.write_text(json.dumps(zero_lotes))

        request = TaxRequest(
            posicoes={"SWRD": {"price": 60.0}},
            cambio_atual=5.0,
            ptax_series={"2024-01-15": 5.0},
            ptax_source="BCB PTAX ask",
            lotes_path=zero_file,
        )
        result = TaxEngine.calculate(request)

        assert result.ir_diferido_total_brl == 0.0
        assert "SWRD" not in result.ir_por_etf
        zero_file.unlink()

    def test_missing_lotes_file(self, valid_request):
        """Missing lotes.json raises error."""
        request = TaxRequest(
            posicoes=valid_request.posicoes,
            cambio_atual=valid_request.cambio_atual,
            ptax_series=valid_request.ptax_series,
            ptax_source=valid_request.ptax_source,
            lotes_path=Path("/nonexistent/lotes.json"),
        )
        with pytest.raises(ValueError, match="lotes.json not found"):
            TaxEngine.calculate(request)

    def test_ptax_fallback(self, temp_lotes_file):
        """Missing PTAX date falls back to current cambio."""
        request = TaxRequest(
            posicoes={"SWRD": {"price": 60.0}},
            cambio_atual=5.5,
            ptax_series={},  # No PTAX data
            ptax_source="fallback",
            lotes_path=temp_lotes_file,
        )
        result = TaxEngine.calculate(request)

        # With no PTAX, should use current cambio (5.5) as PTAX
        # Gain = (1000 * 60 * 5.5) - (1000 * 50 * 5.5) = R$5,500
        # Tax = 15% * 5,500 = R$825
        assert result.ir_diferido_total_brl == 825.0


class TestTaxResultProperties:
    """Test TaxResult properties and invariants."""

    def test_source_is_lei14754(self, valid_request):
        """Result source must be 'lei14754'."""
        result = TaxEngine.calculate(valid_request)
        assert result.source == "lei14754"

    def test_generated_timestamp_set(self, valid_request):
        """Result should have _generated timestamp."""
        result = TaxEngine.calculate(valid_request)
        assert result._generated is not None
        # Verify it's a valid ISO format
        datetime.fromisoformat(result._generated)

    def test_badges_match_ir_por_etf(self, valid_request):
        """Badges should have entries for all ETFs with tax."""
        result = TaxEngine.calculate(valid_request)
        for ticker in result.ir_por_etf:
            assert ticker in result.badges
            assert result.badges[ticker] == "ACC — diferimento fiscal"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
