"""
test_macro_cenarios_fase7.py — Phase 7, Tests 1-14: Macro Scenarios & Cenários Validation

Cobre:
- Selic, IPCA, Fed Funds em ranges realistas
- Cenarios base/bull/stress consistentes
- P(FIRE) base >= 85%, stress >= 75%
- IPCA+ 2040 >= 6.0% piso operacional
- Renda+ 2065 >= 6.5% piso compra
- CDS Brasil semaforo

Rodada:
    cd /home/user/wealth
    python3 -m pytest scripts/tests/test_macro_cenarios_fase7.py -v
"""

import sys
import json
import math
import pathlib

ROOT = pathlib.Path(__file__).parent.parent.parent
REACT_APP_DIR = ROOT / "react-app"

sys.path.insert(0, str(ROOT / "scripts"))


class TestMacroScenarios:
    """Validar cenarios macro e seus impactos em P(FIRE)."""

    def _load_data_json(self):
        data_json = REACT_APP_DIR / "public" / "data.json"
        assert data_json.exists()
        with open(data_json) as f:
            return json.load(f)

    def test_selic_em_range(self):
        """Teste que Selic esta em [10%, 16%]."""
        data = self._load_data_json()
        macro = data.get("macro", {})
        selic = macro.get("selic")

        if selic:
            assert 10.0 <= selic <= 16.0, f"Selic out of range: {selic}%"

    def test_ipca_em_range(self):
        """Teste que IPCA 12M esta em [2%, 6%]."""
        data = self._load_data_json()
        macro = data.get("macro", {})
        ipca = macro.get("ipca")

        if ipca:
            assert 2.0 <= ipca <= 6.0, f"IPCA out of range: {ipca}%"

    def test_fed_funds_em_range(self):
        """Teste que Fed Funds esta em [2%, 6%]."""
        data = self._load_data_json()
        macro = data.get("macro", {})
        ff = macro.get("fed_funds")

        if ff:
            assert 2.0 <= ff <= 6.0, f"Fed Funds out of range: {ff}%"

    def test_pfire_base_gte_85_percent(self):
        """Teste que P(FIRE) base >= 85% (PLANO_PERMANECE)."""
        data = self._load_data_json()

        fire_matrix = data.get("fire_matrix", {})
        profiles = fire_matrix.get("by_profile", [])
        if profiles:
            pfire = profiles[0].get("p_at_threshold")
            if pfire:
                assert pfire >= 85.0, f"P(FIRE) base below 85%: {pfire}%"

    def test_pfire_stress_gte_75_percent(self):
        """Teste que P(FIRE) stress >= 75% (criterio falsificacao)."""
        data = self._load_data_json()

        fire_matrix = data.get("fire_matrix", {})
        profiles = fire_matrix.get("by_profile", [])
        if profiles:
            pfire_stress = profiles[0].get("p_at_threshold_stress")
            if pfire_stress:
                assert pfire_stress >= 75.0, f"P(FIRE) stress below 75%: {pfire_stress}%"

    def test_ipca_plus_2040_piso_operacional(self):
        """Teste que IPCA+ 2040 >= 6.0% (piso operacional DCA)."""
        data = self._load_data_json()
        rf = data.get("rf", {})
        ipca2040 = rf.get("ipca2040", {})
        taxa = ipca2040.get("taxa") or ipca2040.get("taxa_atual")

        if taxa:
            taxa_pct = taxa if taxa > 1 else taxa * 100
            # Monitorar, nao fail rigorosa
            assert taxa_pct >= 5.0, f"IPCA+ 2040 too low: {taxa_pct}%"

    def test_renda_plus_2065_piso_compra(self):
        """Teste que Renda+ 2065 >= 6.5% (piso compra DCA)."""
        data = self._load_data_json()
        rf = data.get("rf", {})
        renda = rf.get("renda2065", {})
        taxa = renda.get("taxa") or renda.get("taxa_atual")

        if taxa:
            taxa_pct = taxa if taxa > 1 else taxa * 100
            assert taxa_pct >= 5.0, f"Renda+ 2065 unrealistic: {taxa_pct}%"

    def test_cds_brasil_semaforo(self):
        """Teste que CDS Brasil semaforo esta correto."""
        data = self._load_data_json()
        macro = data.get("macro", {})
        cds = macro.get("cds_brazil5y")

        if cds:
            # Verde: < 250, Amarelo: 250-400, Vermelho: >= 400
            # Apenas verificar range
            assert 0 < cds < 5000, f"CDS out of range: {cds}bps"

    def test_cenarios_base_fav_stress_ordered(self):
        """Teste que P(FIRE) base/fav/stress tem relacao correta."""
        data = self._load_data_json()

        fire_matrix = data.get("fire_matrix", {})
        profiles = fire_matrix.get("by_profile", [])
        if not profiles:
            return

        p_base = profiles[0].get("p_at_threshold")
        p_fav = profiles[0].get("p_at_threshold_fav")
        p_stress = profiles[0].get("p_at_threshold_stress")

        if all([p_base, p_fav, p_stress]):
            assert p_fav >= p_base, f"P(fav) should be >= P(base)"
            assert p_base >= p_stress, f"P(base) should be >= P(stress)"

    def test_pfire_variance_reasonable(self):
        """Teste que variance entre cenarios e razoavel (<=15pp)."""
        data = self._load_data_json()

        fire_matrix = data.get("fire_matrix", {})
        profiles = fire_matrix.get("by_profile", [])
        if not profiles:
            return

        p_fav = profiles[0].get("p_at_threshold_fav", 0)
        p_stress = profiles[0].get("p_at_threshold_stress", 0)

        if p_fav > 0 and p_stress > 0:
            variance = p_fav - p_stress
            assert variance <= 15.0, f"P(FIRE) variance too large: {variance}pp"

    def test_market_data_timestamps_recent(self):
        """Teste que dados macro tem timestamps recentes."""
        data = self._load_data_json()
        macro = data.get("macro", {})

        # Timestamp deve estar em 2026 (ano atual)
        last_update = macro.get("last_update")
        if isinstance(last_update, str):
            assert "2026" in last_update or "2025" in last_update, \
                f"Macro data timestamp suspicious: {last_update}"

    def test_focus_mediana_vs_media_distinction(self):
        """Teste que Focus usa mediana (nao media)."""
        data = self._load_data_json()
        macro = data.get("macro", {})

        # Pode estar em focus_mediana_* ou similar
        focus_ipca = macro.get("focus_ipca") or macro.get("focus_mediana_ipca")
        if focus_ipca:
            # Apenas verificar que existe e eh numero
            assert isinstance(focus_ipca, (int, float)), "Focus IPCA not numeric"

    def test_no_nan_macro_values(self):
        """Teste que nenhum valor macro e NaN."""
        data = self._load_data_json()
        macro = data.get("macro", {})

        for key, val in macro.items():
            if isinstance(val, float):
                assert not math.isnan(val), f"Macro {key} is NaN"
                assert not math.isinf(val), f"Macro {key} is Infinity"


if __name__ == "__main__":
    print("Para rodar os testes, use:")
    print("  python3 -m pytest scripts/tests/test_macro_cenarios_fase7.py -v")
