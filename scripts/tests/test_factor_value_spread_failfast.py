#!/usr/bin/env python3
"""
test_factor_value_spread_failfast.py — Testa que get_factor_value_spread()
levanta RuntimeError em vez de retornar None silenciosamente quando
'getfactormodels' falta.

DEV-pipeline-fail-fast P2: bug original era `except Exception: return None`
em scripts/generate_data.py:4047. Agora: assert_optional_pkg → RuntimeError.
"""
from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import patch

import pytest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))

# generate_data.py roda argparse em module-level → limpa sys.argv antes de importar.
_old_argv = sys.argv
sys.argv = ["generate_data.py"]
try:
    import generate_data  # noqa: E402
finally:
    sys.argv = _old_argv


def test_get_factor_value_spread_raises_when_getfactormodels_missing(tmp_path, monkeypatch):
    """Sem getfactormodels e sem cache → RuntimeError com hint para venv."""
    # Aponta FACTOR_CACHE para diretório limpo (sem cache).
    fake_cache = tmp_path / "factor_cache.json"

    # generate_data já importado no topo (com argv limpo).
    monkeypatch.setattr(generate_data, "FACTOR_CACHE", fake_cache)

    # Mock para fazer assert_optional_pkg falhar.
    def fake_assert(name, fn_name):
        raise RuntimeError(
            f"{fn_name}() requer pacote '{name}', que não está instalado. "
            "Use o venv canônico (DEV-pipeline-fail-fast)."
        )

    monkeypatch.setattr(generate_data, "assert_optional_pkg", fake_assert)

    with pytest.raises(RuntimeError) as excinfo:
        generate_data.get_factor_value_spread()

    msg = str(excinfo.value)
    assert "get_factor_value_spread" in msg
    assert "DEV-pipeline-fail-fast" in msg


def test_get_factor_value_spread_uses_cache_when_available(tmp_path, monkeypatch):
    """Cache disponível → retorna cache, não chama compute (não exige pkg)."""
    import json

    fake_cache = tmp_path / "factor_cache.json"
    cached_value = {
        "value_spread": 1.23,
        "_source": "test_cache",
    }
    fake_cache.write_text(json.dumps({"factor_value_spread": cached_value}))

    monkeypatch.setattr(generate_data, "FACTOR_CACHE", fake_cache)

    # Se a função usar cache corretamente, não chama assert_optional_pkg.
    def boom(*a, **kw):
        raise AssertionError("assert_optional_pkg não deveria ser chamado em cache hit")

    monkeypatch.setattr(generate_data, "assert_optional_pkg", boom)

    result = generate_data.get_factor_value_spread()
    assert result == cached_value


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))
