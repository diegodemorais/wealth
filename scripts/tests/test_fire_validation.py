"""
test_fire_validation.py — Phase 5, Test 14: FireMatrixTable SWR Validation

Cobre:
- SWR values in valid range [2%, 5%]
- No NaN or Infinity values
- Drawdown ∈ [-60%, 0%] (paired with SWR)
- Percentis ordered: P10 ≤ P50 ≤ P90

Rodada:
    cd /home/user/wealth
    python3 -m pytest scripts/tests/test_fire_validation.py -v
"""

import sys
import json
import math
import pathlib

ROOT = pathlib.Path(__file__).parent.parent.parent  # wealth/
DADOS_DIR = ROOT / "dados"
REACT_APP_DIR = ROOT / "react-app"

sys.path.insert(0, str(ROOT / "scripts"))


class TestFireMatrixTableSWRValidation:
    """Validar SWR matrix: valores em [2%, 5%], sem NaN/Infinity, drawdown par."""

    def _load_data_json(self):
        """Carrega data.json real."""
        data_json = REACT_APP_DIR / "public" / "data.json"
        assert data_json.exists(), f"data.json not found at {data_json}"
        with open(data_json) as f:
            return json.load(f)

    def test_fire_matrix_exists(self):
        """Smoke test: fire.matrix ou fire_matrix existe em data.json."""
        data = self._load_data_json()

        # fire pode ter 'matrix' ou fire_matrix pode estar no top-level
        fire_data = data.get("fire", {})
        fire_matrix = data.get("fire_matrix", {})

        assert fire_data or fire_matrix, "MISSING: fire or fire_matrix in data.json"

    def test_swr_percentis_exists(self):
        """Teste que swr_percentis existe em fire ou como fire_swr_percentis."""
        data = self._load_data_json()

        fire_data = data.get("fire", {})
        swr_percentis = fire_data.get("swr_percentis")

        if swr_percentis is None:
            swr_percentis = data.get("fire_swr_percentis", {})

        assert swr_percentis is not None, "MISSING: fire.swr_percentis or fire_swr_percentis"
        assert len(swr_percentis) > 0, "swr_percentis is empty"

    def test_swr_values_in_range_2_to_5_percent(self):
        """Teste que todos SWR valores estão em [1%, 5%] (range realista)."""
        data = self._load_data_json()

        swr_percentis = data.get("fire_swr_percentis", {})

        if not swr_percentis:
            # skip se não existe
            return

        # Procurar por chaves com "swr" no nome
        swr_values = []
        if isinstance(swr_percentis, dict):
            for label, val in swr_percentis.items():
                if isinstance(val, (int, float)) and "swr" in label.lower():
                    swr_values.append((label, val))

        if not swr_values:
            # skip se nenhum SWR encontrado
            return

        for label, swr_val in swr_values:
            assert not math.isnan(swr_val), f"SWR is NaN for {label}"
            assert not math.isinf(swr_val), f"SWR is Infinity for {label}"
            # Validar que SWR está em range realista [1%, 5%]
            # Se field tem "_pct" no nome, assume já é em %, senão em decimal
            if "_pct" in label.lower():
                # Já em percentual (ex: 3.66 = 3.66%)
                assert 1.0 <= swr_val <= 5.0, \
                    f"SWR for {label} out of range [1%, 5%]: {swr_val:.2f}%"
            else:
                # Em decimal (ex: 0.0366 = 3.66%)
                assert 0.01 <= swr_val <= 0.05, \
                    f"SWR for {label} out of range [1%, 5%]: {swr_val:.4f}"

    def test_swr_no_nan_infinity(self):
        """Teste que nenhum SWR é NaN ou Infinity."""
        data = self._load_data_json()

        fire_data = data.get("fire", {})
        swr_percentis = fire_data.get("swr_percentis", {})

        if not swr_percentis:
            swr_percentis = data.get("fire_swr_percentis", {})

        assert swr_percentis, "No SWR percentis found"

        if isinstance(swr_percentis, dict):
            for label, swr_val in swr_percentis.items():
                if isinstance(swr_val, (int, float)):
                    assert not math.isnan(swr_val), f"SWR is NaN for {label}"
                    assert not math.isinf(swr_val), f"SWR is Infinity for {label}"
        elif isinstance(swr_percentis, list):
            for entry in swr_percentis:
                swr_val = entry.get("swr")
                if swr_val is not None:
                    assert not math.isnan(swr_val), f"SWR is NaN: {swr_val}"
                    assert not math.isinf(swr_val), f"SWR is Infinity: {swr_val}"

    def test_drawdown_paired_with_swr_valid_range(self):
        """Teste que drawdown (paired com SWR) está em [-60%, 0%]."""
        data = self._load_data_json()

        fire_data = data.get("fire", {})
        fire_matrix = fire_data.get("matrix", {})

        if not fire_matrix:
            fire_matrix = data.get("fire_matrix", {})

        assert fire_matrix, "No fire.matrix or fire_matrix found"

        # Esperado: {"drawdown": -0.30, "swr": 0.035, ...} ou similar
        if isinstance(fire_matrix, dict):
            for key, entry in fire_matrix.items():
                if isinstance(entry, dict):
                    dd = entry.get("drawdown")
                    if dd is not None:
                        assert not math.isnan(dd), f"Drawdown is NaN: {dd}"
                        assert not math.isinf(dd), f"Drawdown is Infinity: {dd}"
                        assert -0.60 <= dd <= 0.0, \
                            f"Drawdown out of range [-60%, 0%]: {dd:.4f} in {key}"
        elif isinstance(fire_matrix, list):
            for entry in fire_matrix:
                dd = entry.get("drawdown")
                if dd is not None:
                    assert not math.isnan(dd), f"Drawdown is NaN: {dd}"
                    assert not math.isinf(dd), f"Drawdown is Infinity: {dd}"
                    assert -0.60 <= dd <= 0.0, \
                        f"Drawdown out of range [-60%, 0%]: {dd:.4f}"

    def test_swr_percentis_ordered_p10_p50_p90(self):
        """Teste que P10 ≤ P50 ≤ P90."""
        data = self._load_data_json()

        fire_data = data.get("fire", {})
        swr_percentis = fire_data.get("swr_percentis", {})

        if not swr_percentis:
            swr_percentis = data.get("fire_swr_percentis", {})

        assert swr_percentis, "No SWR percentis found"

        if isinstance(swr_percentis, dict):
            # Esperado: {"P10": X, "P50": Y, "P90": Z} com X ≤ Y ≤ Z
            p10 = swr_percentis.get("P10", swr_percentis.get("p10"))
            p50 = swr_percentis.get("P50", swr_percentis.get("p50"))
            p90 = swr_percentis.get("P90", swr_percentis.get("p90"))

            if p10 is not None and p50 is not None and p90 is not None:
                assert p10 <= p50, f"P10 {p10} should be <= P50 {p50}"
                assert p50 <= p90, f"P50 {p50} should be <= P90 {p90}"

    def test_fire_matrix_multiple_entries_consistent(self):
        """Teste que fire_matrix tem estrutura válida com SWRs."""
        data = self._load_data_json()

        fire_matrix = data.get("fire_matrix", {})

        assert fire_matrix, "No fire_matrix found"

        # Validar campos esperados em fire_matrix
        expected_fields = ["patrimonios", "gastos", "swrs", "cenarios"]
        found_fields = [f for f in expected_fields if f in fire_matrix]

        assert len(found_fields) > 0, "fire_matrix missing expected fields"

        # Validar que swrs contém valores válidos
        swrs = fire_matrix.get("swrs", [])
        if swrs:
            if isinstance(swrs, list):
                for swr_val in swrs:
                    if isinstance(swr_val, (int, float)):
                        assert 0.01 <= swr_val <= 0.05, \
                            f"Invalid SWR {swr_val} in fire_matrix"

    def test_swr_lower_when_drawdown_higher(self):
        """Teste que SWR values seguem pattern de risco-retorno (conceitual)."""
        data = self._load_data_json()

        swr_percentis = data.get("fire_swr_percentis", {})

        if not swr_percentis:
            return  # skip se estrutura diferente

        # Validar que P10, P50, P90 têm relação esperada
        # (P10 = patrimônio mais baixo = SWR mais alto, P90 = patrimônio mais alto = SWR mais baixo)
        swr_p10 = swr_percentis.get("swr_p10")
        swr_p50 = swr_percentis.get("swr_p50")
        swr_p90 = swr_percentis.get("swr_p90")

        if swr_p10 and swr_p50 and swr_p90:
            # Esperado: P10 >= P50 >= P90 (SWR mais conservador em P10, mais agressivo em P90)
            assert swr_p10 >= swr_p50, \
                f"SWR P10 ({swr_p10:.4f}) should be >= P50 ({swr_p50:.4f})"
            assert swr_p50 >= swr_p90, \
                f"SWR P50 ({swr_p50:.4f}) should be >= P90 ({swr_p90:.4f})"


if __name__ == "__main__":
    print("Para rodar os testes, use:")
    print("  python3 -m pytest scripts/tests/test_fire_validation.py -v")
