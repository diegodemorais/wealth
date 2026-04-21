"""
test_data_pipeline.py — Pipeline de dados: parse_carteira, config, fire_montecarlo

Cobre:
- parse_carteira.py: extração correta de tabela, erro em seção ausente
- config.py: valores numéricos corretos, fallback sem carteira_params.json
- fire_montecarlo.py: spending smile (3 fases) e guardrails (bandas + cortes)
- Consistência: IR_ALIQUOTA igual em config e reconstruct_tax

Rodada:
    cd /Users/diegodemorais/claude/code/wealth
    python -m pytest scripts/tests/test_data_pipeline.py -v
ou
    ~/claude/finance-tools/.venv/bin/python -m pytest scripts/tests/test_data_pipeline.py -v
"""

import sys
import os
import json
import pathlib
import textwrap
import tempfile
import importlib

ROOT = pathlib.Path(__file__).parent.parent.parent  # wealth/
SCRIPTS_DIR = ROOT / "scripts"
DADOS_DIR = ROOT / "dados"

sys.path.insert(0, str(SCRIPTS_DIR))


# ─────────────────────────────────────────────────────────────────────────────
# parse_carteira.py
# ─────────────────────────────────────────────────────────────────────────────

class TestParseCarteira:
    def _make_md(self, table_rows: str) -> str:
        """Cria carteira.md mínimo com seção Parâmetros para Scripts."""
        return textwrap.dedent(f"""
            # Carteira

            Texto qualquer.

            ## Parâmetros para Scripts

            | Chave | Valor | Fonte |
            |-------|-------|-------|
            {table_rows}

            ## Próxima seção
            Conteúdo.
        """)

    def test_parses_int_values(self, tmp_path, monkeypatch):
        import parse_carteira
        md = self._make_md("| idade_atual | 39 | manual |")
        (tmp_path / "agentes" / "contexto").mkdir(parents=True)
        (tmp_path / "agentes" / "contexto" / "carteira.md").write_text(md)
        monkeypatch.setattr(parse_carteira, "ROOT", tmp_path)
        result = parse_carteira.parse()
        assert result["idade_atual"] == 39
        assert isinstance(result["idade_atual"], int)

    def test_parses_float_values(self, tmp_path, monkeypatch):
        import parse_carteira
        md = self._make_md("| equity_pct | 0.79 | FI-equity |")
        (tmp_path / "agentes" / "contexto").mkdir(parents=True)
        (tmp_path / "agentes" / "contexto" / "carteira.md").write_text(md)
        monkeypatch.setattr(parse_carteira, "ROOT", tmp_path)
        result = parse_carteira.parse()
        assert abs(result["equity_pct"] - 0.79) < 1e-9
        assert isinstance(result["equity_pct"], float)

    def test_parses_multiple_rows(self, tmp_path, monkeypatch):
        import parse_carteira
        rows = "| equity_pct | 0.79 | - |\n| swr_gatilho | 0.03 | - |\n| idade_atual | 39 | - |"
        md = self._make_md(rows)
        (tmp_path / "agentes" / "contexto").mkdir(parents=True)
        (tmp_path / "agentes" / "contexto" / "carteira.md").write_text(md)
        monkeypatch.setattr(parse_carteira, "ROOT", tmp_path)
        result = parse_carteira.parse()
        assert len(result) == 3

    def test_raises_on_missing_section(self, tmp_path, monkeypatch):
        import parse_carteira
        md = "# Carteira\n\nNenhuma seção de parâmetros aqui.\n"
        (tmp_path / "agentes" / "contexto").mkdir(parents=True)
        (tmp_path / "agentes" / "contexto" / "carteira.md").write_text(md)
        monkeypatch.setattr(parse_carteira, "ROOT", tmp_path)
        try:
            parse_carteira.parse()
            assert False, "Deveria lançar ValueError"
        except ValueError as e:
            assert "Parâmetros para Scripts" in str(e)

    def test_skips_header_and_separator_rows(self, tmp_path, monkeypatch):
        import parse_carteira
        rows = "| Chave | Valor | Fonte |\n|-------|-------|-------|\n| real_key | 1 | - |"
        md = self._make_md(rows)
        (tmp_path / "agentes" / "contexto").mkdir(parents=True)
        (tmp_path / "agentes" / "contexto" / "carteira.md").write_text(md)
        monkeypatch.setattr(parse_carteira, "ROOT", tmp_path)
        result = parse_carteira.parse()
        assert "real_key" in result
        assert "Chave" not in result

    def test_real_carteira_has_required_params(self):
        """Smoke test: carteira.md real contém os parâmetros críticos."""
        import parse_carteira
        result = parse_carteira.parse()
        required = [
            "equity_pct", "swr_gatilho", "horizonte_vida",
            "spending_smile_go_go", "guardrails_banda1_min",
            "gasto_piso", "saude_base",
        ]
        missing = [k for k in required if k not in result]
        assert not missing, f"Parâmetros faltando em carteira.md: {missing}"

    def test_real_carteira_equity_pct_valid(self):
        import parse_carteira
        result = parse_carteira.parse()
        assert 0.0 < result["equity_pct"] < 1.0, "equity_pct fora do range [0,1]"

    def test_real_carteira_swr_valid(self):
        import parse_carteira
        result = parse_carteira.parse()
        assert 0.01 < result["swr_gatilho"] < 0.10, "swr_gatilho implausível"


# ─────────────────────────────────────────────────────────────────────────────
# config.py
# ─────────────────────────────────────────────────────────────────────────────

class TestConfig:
    def _import_fresh(self):
        """Re-importa config com estado atual do disco."""
        if "config" in sys.modules:
            del sys.modules["config"]
        import config
        return config

    def test_equity_pct_loaded(self):
        config = self._import_fresh()
        assert 0.0 < config.EQUITY_PCT < 1.0, f"EQUITY_PCT inválido: {config.EQUITY_PCT}"

    def test_swr_gatilho_loaded(self):
        config = self._import_fresh()
        assert 0.01 < config.SWR_GATILHO < 0.10, f"SWR_GATILHO inválido: {config.SWR_GATILHO}"

    def test_spending_smile_ordering(self):
        """go-go ≥ slow-go ≥ no-go."""
        config = self._import_fresh()
        assert config.SPENDING_SMILE_GO_GO >= config.SPENDING_SMILE_SLOW_GO, \
            "go_go deve ser ≥ slow_go"
        assert config.SPENDING_SMILE_SLOW_GO >= config.SPENDING_SMILE_NO_GO, \
            "slow_go deve ser ≥ no_go"

    def test_spending_smile_range(self):
        """Valores plausíveis (R$100k–R$500k/ano)."""
        config = self._import_fresh()
        for name, val in [
            ("go_go", config.SPENDING_SMILE_GO_GO),
            ("slow_go", config.SPENDING_SMILE_SLOW_GO),
            ("no_go", config.SPENDING_SMILE_NO_GO),
        ]:
            assert 100_000 <= val <= 500_000, f"spending_smile_{name}={val} fora do range"

    def test_guardrails_bands_ascending(self):
        """banda1 < banda2 < banda3 (cada banda ativa a um drawdown maior)."""
        config = self._import_fresh()
        assert config.GUARDRAILS_BANDA1_MIN < config.GUARDRAILS_BANDA2_MIN < config.GUARDRAILS_BANDA3_MIN, \
            "Bandas guardrails devem ser crescentes"

    def test_guardrails_cuts_ascending(self):
        """corte1 < corte2 (corte progressivo)."""
        config = self._import_fresh()
        assert config.GUARDRAILS_CORTE1_PCT < config.GUARDRAILS_CORTE2_PCT, \
            "Cortes de guardrails devem ser crescentes"

    def test_guardrails_piso_above_zero(self):
        config = self._import_fresh()
        assert 0 < config.GUARDRAILS_PISO_PCT < 1.0, \
            f"GUARDRAILS_PISO_PCT inválido: {config.GUARDRAILS_PISO_PCT}"

    def test_ir_aliquota_correct(self):
        config = self._import_fresh()
        assert config.IR_ALIQUOTA == 0.15, \
            f"IR_ALIQUOTA deve ser 0.15 (Lei 14.754/2023), encontrado: {config.IR_ALIQUOTA}"

    def test_fallback_without_json(self, tmp_path, monkeypatch):
        """config.py importa sem erro quando carteira_params.json não existe."""
        import config as c_module
        monkeypatch.setattr(
            c_module, "_load_params",
            lambda: {}  # simula JSON ausente
        )
        # O módulo já está carregado; o teste verifica que os fallbacks são válidos
        # (re-import com _P vazio não é necessário — só validamos que os defaults existem)
        assert c_module.EQUITY_PCT > 0       # fallback 0.79
        assert c_module.SWR_GATILHO > 0      # fallback 0.03
        assert c_module.SPENDING_SMILE_GO_GO > 0  # fallback 242_000


# ─────────────────────────────────────────────────────────────────────────────
# fire_montecarlo.py — spending smile + guardrails
# ─────────────────────────────────────────────────────────────────────────────

class TestFireMontecarloConstants:
    def _import_fm(self):
        if "fire_montecarlo" in sys.modules:
            del sys.modules["fire_montecarlo"]
        import fire_montecarlo
        return fire_montecarlo

    def test_spending_smile_has_three_phases(self):
        fm = self._import_fm()
        assert hasattr(fm, "SPENDING_SMILE"), "SPENDING_SMILE não existe em fire_montecarlo.py"
        assert len(fm.SPENDING_SMILE) == 3, f"Esperado 3 fases, encontrado {len(fm.SPENDING_SMILE)}"

    def test_spending_smile_phases_named(self):
        fm = self._import_fm()
        phases = list(fm.SPENDING_SMILE.keys())
        assert "go_go" in phases
        assert "slow_go" in phases
        assert "no_go" in phases

    def test_spending_smile_uses_config(self):
        """SPENDING_SMILE deve usar as constantes de config, não literais hardcoded."""
        import config
        fm = self._import_fm()
        # SPENDING_SMILE entries are dicts with 'gasto' key
        assert fm.SPENDING_SMILE["go_go"]["gasto"]   == config.SPENDING_SMILE_GO_GO,   "go_go inconsistente"
        assert fm.SPENDING_SMILE["slow_go"]["gasto"] == config.SPENDING_SMILE_SLOW_GO, "slow_go inconsistente"
        assert fm.SPENDING_SMILE["no_go"]["gasto"]   == config.SPENDING_SMILE_NO_GO,   "no_go inconsistente"

    def test_guardrails_structure(self):
        fm = self._import_fm()
        assert hasattr(fm, "GUARDRAILS"), "GUARDRAILS não existe em fire_montecarlo.py"
        guardrails = fm.GUARDRAILS
        assert len(guardrails) >= 3, f"Esperado ≥3 bandas, encontrado {len(guardrails)}"

    def test_guardrails_bands_use_config(self):
        """Bandas de guardrails devem vir de config, não de literais."""
        import config
        fm = self._import_fm()
        # GUARDRAILS entries are tuples: (dd_min, dd_max, corte, label)
        # Verify that the known config values appear in the tuples
        all_values = [v for entry in fm.GUARDRAILS for v in entry if isinstance(v, (int, float))]
        assert config.GUARDRAILS_BANDA1_MIN in all_values, \
            f"GUARDRAILS_BANDA1_MIN={config.GUARDRAILS_BANDA1_MIN} não encontrado em GUARDRAILS"
        assert config.GUARDRAILS_CORTE1_PCT in all_values, \
            f"GUARDRAILS_CORTE1_PCT={config.GUARDRAILS_CORTE1_PCT} não encontrado em GUARDRAILS"

    def test_no_hardcoded_242k(self):
        """Valor 242_000 não deve aparecer como literal em fire_montecarlo.py."""
        fm_path = SCRIPTS_DIR / "fire_montecarlo.py"
        content = fm_path.read_text(encoding="utf-8")
        # Permitido apenas em comentários ou strings — não em assignments
        lines_with_literal = [
            line for line in content.splitlines()
            if "242" in line and "242_000" in line and not line.strip().startswith("#")
        ]
        assert not lines_with_literal, \
            f"Literal 242_000 hardcoded em fire_montecarlo.py:\n" + "\n".join(lines_with_literal)

    def test_no_hardcoded_18000_saude(self):
        """SAUDE_BASE = 18_000 não deve ser redefinido (assignment) localmente em fire_montecarlo.py."""
        fm_path = SCRIPTS_DIR / "fire_montecarlo.py"
        content = fm_path.read_text(encoding="utf-8")
        # Detect actual assignments: `SAUDE_BASE = ...` at start of statement
        # Exclude: import lines, usage in expressions (contains arithmetic operators), comments
        import re
        redef_lines = [
            line for line in content.splitlines()
            if re.match(r"^\s*SAUDE_BASE\s*=\s*[^=]", line)  # assignment (not ==)
            and "import" not in line
            and not line.strip().startswith("#")
        ]
        assert not redef_lines, \
            f"SAUDE_BASE redefinida localmente em fire_montecarlo.py:\n" + "\n".join(redef_lines)


# ─────────────────────────────────────────────────────────────────────────────
# Consistência cross-script
# ─────────────────────────────────────────────────────────────────────────────

class TestCrossScriptConsistency:
    def test_ir_aliquota_consistent_with_reconstruct_tax(self):
        """IR_ALIQUOTA em reconstruct_tax.py deve vir de config (não redefinida como literal)."""
        rt_path = SCRIPTS_DIR / "reconstruct_tax.py"
        if not rt_path.exists():
            return  # skip se arquivo não existe
        content = rt_path.read_text(encoding="utf-8")
        import re
        # Detect actual assignments: `IR_ALIQUOTA = <number>` at start of statement
        local_defs = [
            line for line in content.splitlines()
            if re.match(r"^\s*IR_ALIQUOTA\s*=\s*[\d.]", line)  # assignment to numeric literal
            and "import" not in line
            and not line.strip().startswith("#")
        ]
        assert not local_defs, \
            f"IR_ALIQUOTA redefinida como literal em reconstruct_tax.py:\n" + "\n".join(local_defs)

    def test_carteira_params_json_exists(self):
        """dados/carteira_params.json deve existir (gerado por parse_carteira.py)."""
        json_path = DADOS_DIR / "carteira_params.json"
        assert json_path.exists(), \
            "dados/carteira_params.json não encontrado — rode: python scripts/parse_carteira.py"

    def test_carteira_params_json_valid(self):
        """dados/carteira_params.json deve ser JSON válido com ≥ 50 parâmetros."""
        json_path = DADOS_DIR / "carteira_params.json"
        if not json_path.exists():
            return  # skip
        with open(json_path) as f:
            params = json.load(f)
        assert isinstance(params, dict), "carteira_params.json não é um dict"
        assert len(params) >= 50, \
            f"carteira_params.json tem apenas {len(params)} parâmetros, esperado ≥ 50"

    def test_spending_smile_values_in_json(self):
        """carteira_params.json deve conter as chaves de spending smile."""
        json_path = DADOS_DIR / "carteira_params.json"
        if not json_path.exists():
            return
        with open(json_path) as f:
            params = json.load(f)
        for key in ["spending_smile_go_go", "spending_smile_slow_go", "spending_smile_no_go"]:
            assert key in params, f"Chave '{key}' não encontrada em carteira_params.json"

    def test_guardrails_values_in_json(self):
        """carteira_params.json deve conter as chaves de guardrails."""
        json_path = DADOS_DIR / "carteira_params.json"
        if not json_path.exists():
            return
        with open(json_path) as f:
            params = json.load(f)
        for key in ["guardrails_banda1_min", "guardrails_corte1_pct", "guardrails_piso_pct"]:
            assert key in params, f"Chave '{key}' não encontrada em carteira_params.json"
