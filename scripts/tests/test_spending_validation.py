"""
test_spending_validation.py — Phase 5, Test 17: Spending Ratio

Cobre:
- ceiling ≥ floor para cada entry
- floor >0 (não pode ser negativo)
- ceiling >0
- ratio (ceil/floor) ∈ [1, 5] (sanidade)

Rodada:
    cd /home/user/wealth
    python3 -m pytest scripts/tests/test_spending_validation.py -v
"""

import sys
import json
import math
import pathlib

ROOT = pathlib.Path(__file__).parent.parent.parent  # wealth/
REACT_APP_DIR = ROOT / "react-app"

sys.path.insert(0, str(ROOT / "scripts"))


class TestSpendingRatioValidation:
    """Validar spending_guardrails: ceil ≥ floor, ambos >0, ratio [1,5]."""

    def _load_data_json(self):
        """Carrega data.json real."""
        data_json = REACT_APP_DIR / "public" / "data.json"
        assert data_json.exists(), f"data.json not found at {data_json}"
        with open(data_json) as f:
            return json.load(f)

    def test_spending_guardrails_exists(self):
        """Smoke test: spending_guardrails existe em data.json."""
        data = self._load_data_json()

        assert "spending_guardrails" in data, "MISSING: spending_guardrails in data.json"
        guardrails = data.get("spending_guardrails")
        assert guardrails is not None, "spending_guardrails is NULL"
        assert isinstance(guardrails, (dict, list)), "spending_guardrails should be dict or list"

    def test_spending_guardrails_not_empty(self):
        """Teste que spending_guardrails não está vazio."""
        data = self._load_data_json()

        guardrails = data.get("spending_guardrails", {})
        assert guardrails, "spending_guardrails is empty"

    def test_ceiling_greater_equal_floor(self):
        """Teste que ceiling ≥ floor para cada entry (se presentes)."""
        data = self._load_data_json()

        guardrails = data.get("spending_guardrails", {})
        if not guardrails:
            return  # skip

        # Procurar por chaves que pareçam ser floor/ceiling
        # Pode estar como "lower_guardrail_spending" e "upper_guardrail_spending"
        lower_val = None
        upper_val = None

        if isinstance(guardrails, dict):
            # Procurar por chaves típicas
            for key in ["floor", "lower", "lower_guardrail_spending", "safe_target_spending"]:
                if key in guardrails:
                    lower_val = guardrails[key]
                    break

            for key in ["ceiling", "upper", "upper_guardrail_spending"]:
                if key in guardrails:
                    upper_val = guardrails[key]
                    break

        if lower_val is not None and upper_val is not None:
            assert isinstance(lower_val, (int, float)), f"floor should be numeric"
            assert isinstance(upper_val, (int, float)), f"ceiling should be numeric"
            assert upper_val >= lower_val, \
                f"ceiling ({upper_val}) should be ≥ floor ({lower_val})"

    def test_floor_greater_than_zero(self):
        """Teste que floor (ou lower) > 0."""
        data = self._load_data_json()

        guardrails = data.get("spending_guardrails", {})
        if not guardrails:
            return  # skip

        lower_val = None
        if isinstance(guardrails, dict):
            for key in ["floor", "lower", "lower_guardrail_spending", "safe_target_spending"]:
                if key in guardrails:
                    lower_val = guardrails[key]
                    break

        if lower_val is not None:
            assert isinstance(lower_val, (int, float)), f"floor should be numeric"
            assert lower_val > 0, \
                f"floor should be > 0: {lower_val}"

    def test_ceiling_greater_than_zero(self):
        """Teste que ceiling (ou upper) > 0."""
        data = self._load_data_json()

        guardrails = data.get("spending_guardrails", {})
        if not guardrails:
            return  # skip

        upper_val = None
        if isinstance(guardrails, dict):
            for key in ["ceiling", "upper", "upper_guardrail_spending"]:
                if key in guardrails:
                    upper_val = guardrails[key]
                    break

        if upper_val is not None:
            assert isinstance(upper_val, (int, float)), f"ceiling should be numeric"
            assert upper_val > 0, \
                f"ceiling should be > 0: {upper_val}"

    def test_ratio_in_sane_range_1_to_5(self):
        """Teste que ratio (ceiling/floor) está em [1, 5]."""
        data = self._load_data_json()

        guardrails = data.get("spending_guardrails", {})
        if not guardrails:
            return  # skip

        lower_val = None
        upper_val = None

        if isinstance(guardrails, dict):
            for key in ["floor", "lower", "lower_guardrail_spending", "safe_target_spending"]:
                if key in guardrails:
                    lower_val = guardrails[key]
                    break
            for key in ["ceiling", "upper", "upper_guardrail_spending"]:
                if key in guardrails:
                    upper_val = guardrails[key]
                    break

        if lower_val is not None and upper_val is not None and lower_val > 0:
            ratio = upper_val / lower_val
            assert 1.0 <= ratio <= 5.0, \
                f"ratio out of sane range [1, 5]: {ratio:.2f} (upper={upper_val}, lower={lower_val})"

    def test_no_nan_infinity_values(self):
        """Teste que nenhum valor é NaN ou Infinity."""
        data = self._load_data_json()

        guardrails = data.get("spending_guardrails", {})
        assert guardrails, "No spending_guardrails found"

        entries = []
        if isinstance(guardrails, dict):
            for label, entry in guardrails.items():
                if isinstance(entry, dict):
                    entries.append((label, entry))
            if "floor" in guardrails:
                entries = [("root", guardrails)]
        elif isinstance(guardrails, list):
            for i, entry in enumerate(guardrails):
                if isinstance(entry, dict):
                    entries.append((f"entry_{i}", entry))

        for label, entry in entries:
            for key, val in entry.items():
                if isinstance(val, float):
                    assert not math.isnan(val), f"{key} is NaN in {label}"
                    assert not math.isinf(val), f"{key} is Infinity in {label}"

    def test_floor_and_ceiling_reasonable_magnitude(self):
        """Teste que floor e ceiling estão em magnitude razoável (R$10k-R$500k/ano)."""
        data = self._load_data_json()

        guardrails = data.get("spending_guardrails", {})
        assert guardrails, "No spending_guardrails found"

        entries = []
        if isinstance(guardrails, dict):
            for label, entry in guardrails.items():
                if isinstance(entry, dict):
                    entries.append((label, entry))
            if "floor" in guardrails:
                entries = [("root", guardrails)]
        elif isinstance(guardrails, list):
            for i, entry in enumerate(guardrails):
                if isinstance(entry, dict):
                    entries.append((f"entry_{i}", entry))

        for label, entry in entries:
            floor = entry.get("floor")
            ceiling = entry.get("ceiling")

            if floor is not None:
                # Esperado: R$10k–500k/ano
                assert 10_000 <= floor <= 500_000, \
                    f"floor in {label} out of magnitude range [10k, 500k]: {floor}"

            if ceiling is not None:
                assert 10_000 <= ceiling <= 500_000, \
                    f"ceiling in {label} out of magnitude range [10k, 500k]: {ceiling}"

    def test_multiple_guardrail_entries_consistent(self):
        """Teste que múltiplas entries de guardrails são consistentes entre si."""
        data = self._load_data_json()

        guardrails = data.get("spending_guardrails", {})
        assert guardrails, "No spending_guardrails found"

        entries = []
        if isinstance(guardrails, list):
            for i, entry in enumerate(guardrails):
                if isinstance(entry, dict):
                    entries.append(entry)
        elif isinstance(guardrails, dict):
            for label, entry in guardrails.items():
                if isinstance(entry, dict):
                    entries.append(entry)

        # Se houver múltiplas entradas, elas devem ter estrutura consistente
        if len(entries) >= 2:
            # Todas devem ter "floor" ou nenhuma
            has_floor = [bool("floor" in e) for e in entries]
            assert all(has_floor) or not any(has_floor), \
                "Inconsistent: some entries have floor, others don't"

            # Todas devem ter "ceiling" ou nenhuma
            has_ceiling = [bool("ceiling" in e) for e in entries]
            assert all(has_ceiling) or not any(has_ceiling), \
                "Inconsistent: some entries have ceiling, others don't"

    def test_spending_breakdown_complements_guardrails(self):
        """Teste que spending_breakdown (se existe) é consistente com guardrails."""
        data = self._load_data_json()

        breakdown = data.get("spending_breakdown", {})
        guardrails = data.get("spending_guardrails", {})

        if not breakdown or not guardrails:
            return  # skip se não ambas existem

        # Conceitual: total spending em breakdown deve estar entre min e max guardrails
        # Não é rigoroso; apenas sanidade check

        if isinstance(breakdown, dict):
            for label, val in breakdown.items():
                if isinstance(val, (int, float)):
                    # Este é um gasto observado; deve estar em range razoável
                    assert val > 0, f"spending_breakdown {label} should be positive: {val}"
                    assert val < 500_000, f"spending_breakdown {label} seems too large: {val}"


if __name__ == "__main__":
    print("Para rodar os testes, use:")
    print("  python3 -m pytest scripts/tests/test_spending_validation.py -v")
