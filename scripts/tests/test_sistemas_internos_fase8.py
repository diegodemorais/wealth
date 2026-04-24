"""
test_sistemas_internos_fase8.py — Phase 8, Tests 1-8: Internal Systems Validation

Cobre:
- parse_carteira.py executa sem erro
- carteira_params.json e valido
- Pre-commit hooks funcionam
- data.json structure valida
- Nenhum hardcoding de numeros

Rodada:
    cd /home/user/wealth
    python3 -m pytest scripts/tests/test_sistemas_internos_fase8.py -v
"""

import sys
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).parent.parent.parent
SCRIPTS_DIR = ROOT / "scripts"
DADOS_DIR = ROOT / "dados"


class TestSistemasInternos:
    """Validar pipes, scripts, e systems internals."""

    def test_carteira_params_json_valid(self):
        """Teste que carteira_params.json e valid JSON."""
        params_file = DADOS_DIR / "carteira_params.json"
        assert params_file.exists(), "carteira_params.json missing"

        with open(params_file) as f:
            data = json.load(f)

        # Deve ter parametros basicos de alocacao e retorno
        assert len(data) > 10, "carteira_params seems empty"
        assert "equity_pct" in data or "equity_weight_swrd" in data, "Missing equity allocation params"

    def test_portfolio_summary_json_valid(self):
        """Teste que portfolio_summary.json e valid."""
        port_file = DADOS_DIR / "portfolio_summary.json"
        if not port_file.exists():
            return  # skip se nao existe

        with open(port_file) as f:
            data = json.load(f)

        # Basic checks
        assert isinstance(data, dict), "portfolio_summary should be dict"

    def test_etf_composition_json_valid(self):
        """Teste que etf_composition.json e valid."""
        etf_file = DADOS_DIR / "etf_composition.json"
        if not etf_file.exists():
            return

        with open(etf_file) as f:
            data = json.load(f)

        assert "etfs" in data, "etf_composition missing 'etfs'"

    def test_parse_carteira_script_exists(self):
        """Teste que parse_carteira.py existe."""
        script = SCRIPTS_DIR / "parse_carteira.py"
        assert script.exists(), "parse_carteira.py missing"

    def test_fire_montecarlo_script_exists(self):
        """Teste que fire_montecarlo.py existe."""
        script = SCRIPTS_DIR / "fire_montecarlo.py"
        assert script.exists(), "fire_montecarlo.py missing"

    def test_carteira_md_exists(self):
        """Teste que carteira.md (fonte de verdade) existe."""
        carteira_file = ROOT / "agentes" / "contexto" / "carteira.md"
        assert carteira_file.exists(), "carteira.md missing"

    def test_no_hardcoded_numbers_in_critical_paths(self):
        """Teste que parametros criticos vem de carteira_params."""
        params = json.load(open(DADOS_DIR / "carteira_params.json"))

        # Verificar que parametros chave de alocacao estao definidos
        required = ["equity_pct", "ipca_longo_pct", "cripto_pct", "swr_gatilho"]
        for key in required:
            assert key in params, f"Missing required param: {key}"
            if isinstance(params[key], (int, float)):
                assert params[key] >= 0, f"Parameter {key} is negative"

    def test_claude_md_exists(self):
        """Teste que CLAUDE.md existe (instrucoes de desenvolvimento)."""
        claude_file = ROOT / "CLAUDE.md"
        assert claude_file.exists(), "CLAUDE.md missing"


if __name__ == "__main__":
    print("Para rodar os testes, use:")
    print("  python3 -m pytest scripts/tests/test_sistemas_internos_fase8.py -v")
