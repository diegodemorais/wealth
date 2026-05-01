#!/usr/bin/env python3
"""
test_validate_env.py — Testes para o validador de ambiente do pipeline.

Cobre os caminhos:
- Imports core ausentes → RuntimeError com mensagem acionável
- Pacote opcional ausente em assert_optional_pkg → RuntimeError com função alvo
- Python fora do venv → RuntimeWarning (não fatal)

Run: ~/claude/finance-tools/.venv/bin/python3 -m pytest scripts/tests/test_validate_env.py -v
"""
from __future__ import annotations

import sys
import warnings
from pathlib import Path
from unittest.mock import patch

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import validate_env  # noqa: E402


def test_validate_env_passes_in_canonical_environment():
    """Em ambiente bom (todos pacotes core), valida sem erro."""
    # Não deve raise (assumindo venv canônico carregado nos testes).
    validate_env.validate_pipeline_env()


def test_validate_env_raises_when_core_pkg_missing():
    """Imports core ausentes → RuntimeError com nome do pacote e venv hint."""
    def fake_import(name, *a, **kw):
        if name == "getfactormodels":
            raise ImportError(f"No module named '{name}'")
        return _real_import(name, *a, **kw)

    _real_import = __import__
    with patch("validate_env.importlib.import_module") as mock_import:
        def side_effect(name):
            if name == "getfactormodels":
                raise ImportError(f"No module named '{name}'")
            return None  # outros imports OK

        mock_import.side_effect = side_effect

        with pytest.raises(RuntimeError) as excinfo:
            validate_env.validate_pipeline_env()

        msg = str(excinfo.value)
        assert "getfactormodels" in msg
        assert "venv canônico" in msg
        assert "DEV-pipeline-fail-fast" in msg


def test_validate_env_lists_all_missing_pkgs():
    """Múltiplos pacotes ausentes → todos aparecem na mensagem."""
    with patch("validate_env.importlib.import_module") as mock_import:
        def side_effect(name):
            if name in ("yfinance", "pyield", "fredapi"):
                raise ImportError(f"No module named '{name}'")
            return None

        mock_import.side_effect = side_effect

        with pytest.raises(RuntimeError) as excinfo:
            validate_env.validate_pipeline_env()

        msg = str(excinfo.value)
        for pkg in ("yfinance", "pyield", "fredapi"):
            assert pkg in msg, f"esperava {pkg} na mensagem: {msg}"


def test_assert_optional_pkg_raises_with_function_context():
    """assert_optional_pkg falha com nome da função chamadora na mensagem."""
    with patch("validate_env.importlib.import_module") as mock_import:
        mock_import.side_effect = ImportError("No module named 'foo'")

        with pytest.raises(RuntimeError) as excinfo:
            validate_env.assert_optional_pkg("foo", fn_name="my_func")

        msg = str(excinfo.value)
        assert "my_func" in msg
        assert "'foo'" in msg
        assert "venv canônico" in msg


def test_assert_optional_pkg_passes_when_present():
    """Pacote disponível → não raise."""
    # 'json' sempre disponível no stdlib.
    validate_env.assert_optional_pkg("json", fn_name="test")


def test_venv_warning_when_python_outside_venv():
    """Python fora do venv → RuntimeWarning não-fatal."""
    with patch.object(validate_env.sys, "executable", "/usr/bin/python3"):
        with patch("validate_env.importlib.import_module") as mock_import:
            mock_import.return_value = None  # todos imports OK
            with warnings.catch_warnings(record=True) as caught:
                warnings.simplefilter("always")
                validate_env.validate_pipeline_env()  # não deve raise
                runtime_warns = [w for w in caught if issubclass(w.category, RuntimeWarning)]
                assert len(runtime_warns) >= 1
                assert "venv canônico" in str(runtime_warns[0].message)


def test_no_venv_warning_when_python_inside_venv():
    """Python dentro do venv → sem warning."""
    fake_path = "/home/user/claude/finance-tools/.venv/bin/python3"
    with patch.object(validate_env.sys, "executable", fake_path):
        with patch("validate_env.importlib.import_module") as mock_import:
            mock_import.return_value = None
            with warnings.catch_warnings(record=True) as caught:
                warnings.simplefilter("always")
                validate_env.validate_pipeline_env()
                runtime_warns = [
                    w for w in caught
                    if issubclass(w.category, RuntimeWarning)
                    and "venv" in str(w.message)
                ]
                assert len(runtime_warns) == 0


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))
