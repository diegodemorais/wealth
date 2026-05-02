"""Tests para release_gate_sanity.py — DEV-release-gate-checklist."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent.parent
SCRIPT = ROOT / "scripts" / "release_gate_sanity.py"
REAL_DATA = ROOT / "react-app" / "public" / "data.json"
FIXTURES = ROOT / "dados" / "test_fixtures"


def run_gate(data_path: Path) -> tuple[int, str]:
    proc = subprocess.run(
        [sys.executable, str(SCRIPT), "--data", str(data_path)],
        capture_output=True,
        text=True,
    )
    return proc.returncode, proc.stdout + proc.stderr


def test_real_data_passes():
    """data.json atual deve passar todos os checks."""
    code, out = run_gate(REAL_DATA)
    assert code == 0, f"data.json real falhou no gate:\n{out}"
    assert "sanity numérico OK" in out


def test_fixture_drawdown_cliff_fails():
    """Fixture com cliff -91% no drawdown deve falhar com mensagem clara."""
    fixture = FIXTURES / "data_drawdown_cliff.json"
    code, out = run_gate(fixture)
    assert code == 1, f"gate deveria falhar com cliff:\n{out}"
    assert "drawdown_history.drawdown_pct" in out
    assert "cliff vertical" in out


def test_fixture_pfire_invalid_fails():
    """Fixture com P(FIRE) > 100 deve falhar."""
    fixture = FIXTURES / "data_pfire_invalid.json"
    code, out = run_gate(fixture)
    assert code == 1
    assert "P(FIRE) base" in out


def test_fixture_macro_invalid_fails():
    """Fixture com Selic 145% deve falhar."""
    fixture = FIXTURES / "data_macro_invalid.json"
    code, out = run_gate(fixture)
    assert code == 1
    assert "Selic" in out


def test_fixture_sortino_outlier_fails():
    """Fixture com Sortino 19.259 (bug 2026-05-02) deve falhar no gate."""
    fixture = FIXTURES / "data_sortino_outlier.json"
    code, out = run_gate(fixture)
    assert code == 1, f"gate deveria falhar com Sortino outlier:\n{out}"
    assert "rolling_sharpe.sortino" in out


def test_anti_cliff_logic_unit():
    """Threshold conjunto (rel E abs) — não deve falsar em séries pequenas."""
    sys.path.insert(0, str(ROOT / "scripts"))
    from release_gate_sanity import assert_no_cliff

    # Caso 1: drawdown -2% → -3% (50% relativo, 1pp absoluto) — NÃO é cliff
    series = [-1.0] * 23 + [-2.0, -3.0]
    assert assert_no_cliff(series, "test", min_len=24) is None, \
        "1pp absoluto não deveria ativar cliff"

    # Caso 2: drawdown -7% → -91% (1200% relativo, 84pp absoluto) — É cliff
    series = [-5.0] * 23 + [-7.0, -91.0]
    err = assert_no_cliff(series, "drawdown", min_len=24, max_abs_change=15.0)
    assert err is not None
    assert "cliff vertical" in err

    # Caso 3: série curta — sempre passa (baixa significância)
    series = [-7.0, -91.0]
    assert assert_no_cliff(series, "short", min_len=24) is None

    # Caso 4: prev=0 e last≠0 — trata como cliff se passa abs threshold
    series = [0.0] * 23 + [0.0, 100.0]
    err = assert_no_cliff(series, "fromzero", min_len=24, max_abs_change=10.0)
    assert err is not None


def test_get_nested():
    """get_nested resolve dotted paths e indexing."""
    sys.path.insert(0, str(ROOT / "scripts"))
    from release_gate_sanity import get_nested

    data = {"a": {"b": [{"c": 42}, {"c": 99}]}, "x": None}
    assert get_nested(data, "a.b[0].c") == 42
    assert get_nested(data, "a.b[1].c") == 99
    assert get_nested(data, "a.b[5].c") is None
    assert get_nested(data, "x.y") is None
    assert get_nested(data, "missing.path") is None


def test_all_fixtures_exist():
    """Sanidade: fixtures negativas existem (caso o setup tenha sido apagado)."""
    expected = [
        "data_drawdown_cliff.json",
        "data_pfire_invalid.json",
        "data_macro_invalid.json",
        "data_sortino_outlier.json",
    ]
    for name in expected:
        assert (FIXTURES / name).exists(), \
            f"fixture {name} ausente — regere com scripts/release_gate_sanity.py setup"
