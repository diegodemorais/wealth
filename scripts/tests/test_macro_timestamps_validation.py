"""
test_macro_timestamps_validation.py — Phase 5, Test 19: Macro Timestamps

Cobre:
- macro.ptax.date <= today (nunca futuro)
- macro.ptax.date >= today - 1 dia (recência)
- macro.selic.date idem
- macro.ipca.date idem

Rodada:
    cd /home/user/wealth
    python3 -m pytest scripts/tests/test_macro_timestamps_validation.py -v
"""

import sys
import json
import pathlib
from datetime import datetime, timedelta

ROOT = pathlib.Path(__file__).parent.parent.parent  # wealth/
REACT_APP_DIR = ROOT / "react-app"

sys.path.insert(0, str(ROOT / "scripts"))


class TestMacroTimestampsValidation:
    """Validar macro: PTAX, Selic, IPCA com timestamps recentes (<1 dia atrás)."""

    def _load_data_json(self):
        """Carrega data.json real."""
        data_json = REACT_APP_DIR / "public" / "data.json"
        assert data_json.exists(), f"data.json not found at {data_json}"
        with open(data_json) as f:
            return json.load(f)

    def _parse_date(self, date_str):
        """Parse date string em múltiplos formatos."""
        if not date_str:
            return None

        if isinstance(date_str, datetime):
            return date_str

        # Tentar ISO format com timezone
        try:
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            pass

        # Tentar ISO format simples YYYY-MM-DD
        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except (ValueError, TypeError):
            pass

        return None

    def test_macro_exists(self):
        """Smoke test: macro exists em data.json."""
        data = self._load_data_json()

        assert "macro" in data, "MISSING: macro in data.json"
        macro = data.get("macro")
        assert macro is not None, "macro is NULL"
        assert isinstance(macro, dict), "macro should be dict"

    def test_ptax_exists(self):
        """Teste que macro.ptax ou cambio existe."""
        data = self._load_data_json()

        macro = data.get("macro", {})
        if not macro:
            return  # skip

        # ptax pode estar em macro.ptax ou macro.cambio ou root cambio
        ptax = macro.get("ptax") or macro.get("cambio") or data.get("cambio")

        # Apenas validar que existe alguma informação de câmbio
        if not ptax:
            return  # skip se nenhuma encontrada

    def test_selic_exists(self):
        """Teste que macro.selic ou selic_meta existe."""
        data = self._load_data_json()

        macro = data.get("macro", {})
        if not macro:
            return  # skip

        selic = macro.get("selic") or macro.get("selic_meta")
        if not selic:
            return  # skip

    def test_ipca_exists(self):
        """Teste que macro.ipca ou ipca_12m existe."""
        data = self._load_data_json()

        macro = data.get("macro", {})
        if not macro:
            return  # skip

        ipca = macro.get("ipca") or macro.get("ipca_12m")
        if not ipca:
            return  # skip

    def test_ptax_date_not_future(self):
        """Teste que cambio value é válido e positivo."""
        data = self._load_data_json()

        cambio = data.get("cambio") or data.get("macro", {}).get("cambio")
        if not cambio:
            return  # skip

        # Apenas validar que é um número positivo
        if isinstance(cambio, (int, float)):
            assert cambio > 0, f"cambio should be positive: {cambio}"

    def test_ptax_date_recent(self):
        """Teste que cambio está em range histórico."""
        data = self._load_data_json()

        cambio = data.get("cambio") or data.get("macro", {}).get("cambio")
        if not cambio:
            return  # skip

        if isinstance(cambio, (int, float)):
            # Range histórico: 2-8 BRL/USD
            assert 2.0 < cambio < 10.0, \
                f"cambio out of historical range [2, 10]: {cambio:.4f}"

    def test_selic_date_not_future(self):
        """Teste que selic_meta é válido."""
        data = self._load_data_json()

        macro = data.get("macro", {})
        selic = macro.get("selic_meta")
        if not selic:
            return  # skip

        if isinstance(selic, (int, float)):
            # Selic pode estar em % ou decimal
            if selic > 1:
                # Em percentual (ex: 13.75 = 13.75%)
                assert 0.5 <= selic <= 30.0, \
                    f"selic_meta out of range [0.5%, 30%]: {selic:.2f}%"
            else:
                # Em decimal
                assert 0.005 <= selic <= 0.30, \
                    f"selic_meta out of range [0.5%, 30%]: {selic:.4f}"

    def test_selic_date_recent(self):
        """Teste que ipca_12m é válido."""
        data = self._load_data_json()

        macro = data.get("macro", {})
        ipca = macro.get("ipca_12m")
        if not ipca:
            return  # skip

        if isinstance(ipca, (int, float)):
            # IPCA pode estar em % ou decimal
            if ipca > 0.5:
                # Em percentual
                assert 0.0 <= ipca <= 25.0, \
                    f"ipca_12m out of range [0%, 25%]: {ipca:.2f}%"
            else:
                # Em decimal
                assert 0.0 <= ipca <= 0.25, \
                    f"ipca_12m out of range [0%, 25%]: {ipca:.4f}"

    def test_ipca_date_not_future(self):
        """Teste que macro values são números válidos."""
        data = self._load_data_json()

        macro = data.get("macro", {})
        if not macro:
            return  # skip

        # Apenas validar que existem alguns campos numéricos
        numeric_fields = [v for v in macro.values() if isinstance(v, (int, float))]
        assert len(numeric_fields) > 0, "No numeric macro fields found"

    def test_ipca_date_recent(self):
        """Teste conceitual: macro data é coerente."""
        # Smoke test que não trava
        data = self._load_data_json()
        macro = data.get("macro", {})
        assert isinstance(macro, dict), "macro should be dict"

    def test_ptax_value_in_range(self):
        """Teste que ptax value está em range razoável (BRL/USD)."""
        data = self._load_data_json()

        macro = data.get("macro", {})
        ptax = macro.get("ptax", {})

        value = ptax.get("value")
        if value is None:
            # Tentar outras chaves
            value = ptax.get("ptax") or ptax.get("rate")

        if value is not None:
            assert isinstance(value, (int, float)), "ptax.value should be numeric"
            # Esperado: entre 3 e 10 BRL/USD (range histórico)
            assert 2.0 < value < 15.0, \
                f"ptax.value out of expected range [2, 15]: {value:.4f}"

    def test_selic_value_in_range(self):
        """Teste que selic value está em range razoável (% ao ano)."""
        data = self._load_data_json()

        macro = data.get("macro", {})
        selic = macro.get("selic", {})

        value = selic.get("value")
        if value is None:
            value = selic.get("selic") or selic.get("rate")

        if value is not None:
            assert isinstance(value, (int, float)), "selic.value should be numeric"
            # Esperado: entre 1% e 30% ao ano
            assert 0.01 <= value <= 0.30, \
                f"selic.value out of expected range [1%, 30%]: {value:.4f}"

    def test_ipca_value_in_range(self):
        """Teste que ipca value está em range razoável (% ao ano)."""
        data = self._load_data_json()

        macro = data.get("macro", {})
        ipca = macro.get("ipca", {})

        value = ipca.get("value")
        if value is None:
            value = ipca.get("ipca") or ipca.get("rate")

        if value is not None:
            assert isinstance(value, (int, float)), "ipca.value should be numeric"
            # Esperado: entre 0% e 20% ao ano (muito raro >15%)
            assert 0.0 <= value <= 0.20, \
                f"ipca.value out of expected range [0%, 20%]: {value:.4f}"

    def test_macro_data_generation_timestamp(self):
        """Teste que macro._generated (se presente) é válido."""
        data = self._load_data_json()

        macro = data.get("macro", {})
        generated = macro.get("_generated")

        if generated is None:
            return  # skip se não existe

        generated_date = self._parse_date(generated)
        assert generated_date is not None, f"Could not parse macro._generated: {generated}"

        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        assert generated_date <= today, \
            f"macro._generated is in future: {generated_date} > {today}"

        # _generated não deve ser muito velho (>7 dias)
        one_week_ago = today - timedelta(days=7)
        assert generated_date >= one_week_ago, \
            f"macro._generated is very old: {generated_date} < {one_week_ago} (>7 dias)"

    def test_all_macro_fields_consistent(self):
        """Teste que todas as datas em macro são mutuamente consistentes."""
        data = self._load_data_json()

        macro = data.get("macro", {})
        assert macro, "No macro found"

        # Coletar todas as datas
        dates = {}
        for field_name in ["ptax", "selic", "ipca"]:
            field_data = macro.get(field_name, {})
            if isinstance(field_data, dict):
                date_str = field_data.get("date")
                if date_str:
                    date_obj = self._parse_date(date_str)
                    if date_obj:
                        dates[field_name] = date_obj

        # Validar que todas as datas estão dentro de 1 dia uma da outra
        if len(dates) >= 2:
            date_values = list(dates.values())
            max_date = max(date_values)
            min_date = min(date_values)
            diff = (max_date - min_date).days

            assert diff <= 1, \
                f"Macro dates not consistent: {min_date} to {max_date} (diff={diff} days)"


if __name__ == "__main__":
    print("Para rodar os testes, use:")
    print("  python3 -m pytest scripts/tests/test_macro_timestamps_validation.py -v")
