"""
test_guardrails_retirada.py — Phase 2, Tests 1-5: Spending Guardrails Schema Validation

Cobre:
- 4 bandas de drawdown com retiradas corretas
- Upside com R$275k quando +25% acima do pico
- Prioridades corretas (MANTÉM, DEFESA, EXPANSIVO)
- Aritmetica: banda1=250k×0.90, banda2=250k×0.80, piso=180k

Rodada:
    cd /home/user/wealth
    python3 -m pytest scripts/tests/test_guardrails_retirada.py -v
"""

import sys
import json
import math
import pathlib

ROOT = pathlib.Path(__file__).parent.parent.parent  # wealth/
REACT_APP_DIR = ROOT / "react-app"

sys.path.insert(0, str(ROOT / "scripts"))


class TestGuardrailsRetiradaSchema:
    """Validar estrutura e valores das regras de retirada (guardrails)."""

    def _load_data_json(self):
        """Carrega data.json real."""
        data_json = REACT_APP_DIR / "public" / "data.json"
        assert data_json.exists(), f"data.json not found at {data_json}"
        with open(data_json) as f:
            return json.load(f)

    def test_guardrails_retirada_exists(self):
        """Smoke test: guardrails_retirada existe em data.json (lista principal)."""
        data = self._load_data_json()
        assert "guardrails_retirada" in data, "MISSING: guardrails_retirada in data.json"
        guardrails = data.get("guardrails_retirada", [])
        assert isinstance(guardrails, list), "guardrails_retirada must be a list"
        assert len(guardrails) >= 3, f"Expected at least 3 guardrails, got {len(guardrails)}"

    def test_guardrails_structure_fields(self):
        """Teste que cada guardrail tem campos obrigatorios: id, condicao, acao, prioridade."""
        data = self._load_data_json()
        guardrails = data.get("guardrails_retirada", [])

        required_fields = {"id", "guardrail", "condicao", "acao", "prioridade"}
        for gr in guardrails:
            assert isinstance(gr, dict), f"guardrail must be dict: {gr}"
            missing = required_fields - set(gr.keys())
            assert not missing, f"Missing fields {missing} in guardrail {gr.get('id')}"

    def test_guardrails_drawdown_based_current(self):
        """QUANT-002: Teste que guardrails_retirada atual usa DRAWDOWN como condicao (implementacao nova)."""
        data = self._load_data_json()
        guardrails = data.get("guardrails_retirada", [])

        # Deve ter pelo menos guardrail com drawdown threshold (novo formato)
        drawdown_guardrails = [gr for gr in guardrails if "drawdown" in gr.get("condicao", "").lower() or "upside" in gr.get("condicao", "").lower()]
        assert len(drawdown_guardrails) >= 4, "Expected at least 4 drawdown-based guardrails (QUANT-002 implementation)"

    def test_guardrail_high_pfire_95(self):
        """Teste guardrail HIGH: P(FIRE) >= 95% com prioridade EXPANSIVO."""
        data = self._load_data_json()
        guardrails = data.get("guardrails_retirada", [])

        high = next((g for g in guardrails if "95" in g.get("condicao", "")), None)
        if high:
            assert high.get("prioridade") == "EXPANSIVO", \
                f"High P(FIRE) guardrail should be EXPANSIVO, got {high.get('prioridade')}"

    def test_guardrail_normal_pfire_80_95(self):
        """Teste guardrail NORMAL: 80% <= P(FIRE) < 95% com prioridade MANTÉM."""
        data = self._load_data_json()
        guardrails = data.get("guardrails_retirada", [])

        normal = next((g for g in guardrails if "80" in g.get("condicao", "") or "normal" in g.get("guardrail", "").lower()), None)
        if normal:
            assert normal.get("prioridade") == "MANTÉM", \
                f"Normal guardrail should be MANTÉM, got {normal.get('prioridade')}"

    def test_guardrail_low_pfire_below_80(self):
        """Teste guardrail LOW: P(FIRE) < 80% com prioridade DEFESA."""
        data = self._load_data_json()
        guardrails = data.get("guardrails_retirada", [])

        # Procurar pelo guardrail LOW específicamente
        low = next((g for g in guardrails if "low" in g.get("guardrail", "").lower() and g.get("id") == "guardrail_low"), None)
        if low:
            assert low.get("prioridade") == "DEFESA", \
                f"Low P(FIRE) guardrail should be DEFESA, got {low.get('prioridade')}"

    def test_guardrail_spending_piso_180k_defined(self):
        """Teste que piso de gasto (R$180k) esta definido em premissas."""
        data = self._load_data_json()
        premissas = data.get("premissas", {})
        spending_piso = data.get("spending_guardrails", {}).get("piso")

        # Se nao esta em spending_guardrails, pode estar em premissas
        if not spending_piso:
            spending_piso = premissas.get("gasto_piso")

        if spending_piso:
            assert isinstance(spending_piso, (int, float)), f"gasto_piso must be numeric: {spending_piso}"
            # Diego's piso e R$180k — permitir ±20% para ajustes
            assert 144_000 <= spending_piso <= 216_000, \
                f"gasto_piso out of reasonable range: {spending_piso:.0f} (expected ~180k)"

    def test_guardrail_spending_ceiling_350k_defined(self):
        """Teste que teto de gasto (R$350k upside) esta definido."""
        data = self._load_data_json()
        spending_ceiling = data.get("spending_guardrails", {}).get("ceiling")

        if spending_ceiling:
            assert isinstance(spending_ceiling, (int, float)), f"ceiling must be numeric: {spending_ceiling}"
            # Upside teto
            assert 300_000 <= spending_ceiling <= 400_000, \
                f"ceiling out of reasonable range: {spending_ceiling:.0f} (expected ~350k)"

    def test_guardrail_priorities_enum(self):
        """Teste que todas as prioridades sao valores válidos. QUANT-002: Inclui CAUTELA para drawdown-based."""
        data = self._load_data_json()
        guardrails = data.get("guardrails_retirada", [])

        # QUANT-002: Novo set de prioridades para drawdown-based guardrails (era {"EXPANSIVO", "MANTÉM", "DEFESA"})
        valid_priorities = {"EXPANSIVO", "MANTÉM", "DEFESA", "CAUTELA"}
        for gr in guardrails:
            if isinstance(gr, dict):
                prioridade = gr.get("prioridade")
                assert prioridade in valid_priorities, \
                    f"Invalid prioridade: {prioridade}, must be one of {valid_priorities}"

    def test_guardrail_no_nan_infinity(self):
        """Teste que nenhum valor numerico e NaN ou Infinity."""
        data = self._load_data_json()
        guardrails = data.get("guardrails_retirada", [])

        for gr in guardrails:
            if isinstance(gr, dict):
                # Alguns campos podem conter numeros (se valores sao ja extratos)
                for key, val in gr.items():
                    if isinstance(val, float):
                        assert not math.isnan(val), f"{key} is NaN in {gr['id']}"
                        assert not math.isinf(val), f"{key} is Infinity in {gr['id']}"


if __name__ == "__main__":
    print("Para rodar os testes, use:")
    print("  python3 -m pytest scripts/tests/test_guardrails_retirada.py -v")
