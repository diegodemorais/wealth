"""
Testes unitários do append_only contract.

Run:
    ~/claude/finance-tools/.venv/bin/python3 -m pytest scripts/test_append_only.py -v

Cobre:
- load_or_init: rebuild flag, file not found, version mismatch, version match, JSON inválido
- write_with_meta: escreve _meta canônico
- is_period_closed: mês corrente, mês passado, dia corrente, dia passado
- merge_append: preserva fechado, atualiza aberto, adiciona novo, ordena por chave
- sidecar: load/write CSV companion
"""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path

import pytest

from append_only import (
    is_period_closed,
    load_or_init,
    load_or_init_sidecar,
    merge_append,
    merge_append_parallel,
    sidecar_path,
    write_meta_sidecar,
    write_with_meta,
)


# ───────────────────────── load_or_init ─────────────────────────

def test_load_or_init_rebuild_flag_forces_rebuild(tmp_path: Path) -> None:
    p = tmp_path / "a.json"
    p.write_text(json.dumps({"_meta": {"metodologia_version": "v1"}, "x": 1}))
    artefact, needs = load_or_init(p, "v1", rebuild_flag=True)
    assert needs is True
    assert artefact == {}


def test_load_or_init_missing_file(tmp_path: Path) -> None:
    artefact, needs = load_or_init(tmp_path / "nope.json", "v1")
    assert needs is True
    assert artefact == {}


def test_load_or_init_version_mismatch(tmp_path: Path) -> None:
    p = tmp_path / "a.json"
    p.write_text(json.dumps({"_meta": {"metodologia_version": "v0"}, "x": 1}))
    artefact, needs = load_or_init(p, "v1")
    assert needs is True
    assert artefact == {}


def test_load_or_init_version_match(tmp_path: Path) -> None:
    p = tmp_path / "a.json"
    payload = {"_meta": {"metodologia_version": "v1", "last_period_appended": "2026-04"}, "x": 1}
    p.write_text(json.dumps(payload))
    artefact, needs = load_or_init(p, "v1")
    assert needs is False
    assert artefact == payload


def test_load_or_init_invalid_json(tmp_path: Path) -> None:
    p = tmp_path / "a.json"
    p.write_text("not json {{{")
    artefact, needs = load_or_init(p, "v1")
    assert needs is True
    assert artefact == {}


def test_load_or_init_no_meta_block(tmp_path: Path) -> None:
    p = tmp_path / "a.json"
    p.write_text(json.dumps({"x": 1}))  # legacy sem _meta
    artefact, needs = load_or_init(p, "v1")
    assert needs is True


# ───────────────────────── write_with_meta ─────────────────────────

def test_write_with_meta_injects_meta(tmp_path: Path) -> None:
    p = tmp_path / "a.json"
    write_with_meta(p, {"data": [1, 2, 3]}, version="v1", last_period="2026-04")
    out = json.loads(p.read_text())
    assert out["data"] == [1, 2, 3]
    assert out["_meta"]["metodologia_version"] == "v1"
    assert out["_meta"]["last_period_appended"] == "2026-04"
    assert out["_meta"]["schema_version"] == "1.0"
    assert out["_meta"]["rebuild_reason"] is None
    assert "last_appended_at" in out["_meta"]


def test_write_with_meta_records_rebuild_reason(tmp_path: Path) -> None:
    p = tmp_path / "a.json"
    write_with_meta(p, {"x": 1}, version="v1", last_period="2026-04",
                    rebuild_reason="version-bump")
    out = json.loads(p.read_text())
    assert out["_meta"]["rebuild_reason"] == "version-bump"


def test_write_with_meta_rejects_non_dict(tmp_path: Path) -> None:
    with pytest.raises(TypeError):
        write_with_meta(tmp_path / "a.json", [1, 2, 3], version="v1", last_period="2026-04")  # type: ignore[arg-type]


# ───────────────────────── is_period_closed ─────────────────────────

def test_is_period_closed_monthly_past() -> None:
    assert is_period_closed("2026-03", today=date(2026, 5, 1)) is True


def test_is_period_closed_monthly_current() -> None:
    assert is_period_closed("2026-05", today=date(2026, 5, 1)) is False


def test_is_period_closed_monthly_future() -> None:
    assert is_period_closed("2026-08", today=date(2026, 5, 1)) is False


def test_is_period_closed_daily_past() -> None:
    assert is_period_closed("2026-04-30", today=date(2026, 5, 1)) is True


def test_is_period_closed_daily_today() -> None:
    assert is_period_closed("2026-05-01", today=date(2026, 5, 1)) is False


def test_is_period_closed_invalid_format() -> None:
    with pytest.raises(ValueError):
        is_period_closed("2026")


# ───────────────────────── merge_append ─────────────────────────

def _today() -> date:
    return date(2026, 5, 1)


def test_merge_append_preserves_closed_months() -> None:
    existing = [{"mes": "2026-03", "v": 100}, {"mes": "2026-04", "v": 200}]
    new = [{"mes": "2026-03", "v": 999}, {"mes": "2026-04", "v": 888}]  # tentativa de sobrescrever
    out = merge_append(existing, new, key="mes", today=_today())
    assert out == [{"mes": "2026-03", "v": 100}, {"mes": "2026-04", "v": 200}]


def test_merge_append_updates_open_month() -> None:
    existing = [{"mes": "2026-04", "v": 200}, {"mes": "2026-05", "v": 300}]
    new = [{"mes": "2026-05", "v": 350}]  # mês corrente: pode atualizar
    out = merge_append(existing, new, key="mes", today=_today())
    assert {"mes": "2026-05", "v": 350} in out
    assert {"mes": "2026-04", "v": 200} in out


def test_merge_append_adds_new_periods() -> None:
    existing = [{"mes": "2026-03", "v": 100}]
    new = [{"mes": "2026-04", "v": 200}, {"mes": "2026-05", "v": 300}]
    out = merge_append(existing, new, key="mes", today=_today())
    assert len(out) == 3
    assert [r["mes"] for r in out] == ["2026-03", "2026-04", "2026-05"]


def test_merge_append_sorts_output() -> None:
    existing = [{"mes": "2026-05", "v": 300}, {"mes": "2026-03", "v": 100}]
    new = [{"mes": "2026-04", "v": 200}]
    out = merge_append(existing, new, key="mes", today=_today())
    assert [r["mes"] for r in out] == ["2026-03", "2026-04", "2026-05"]


def test_merge_append_ignores_items_without_key() -> None:
    existing = [{"mes": "2026-04", "v": 200}]
    new = [{"mes": "2026-05", "v": 300}, {"x": "no-key"}]
    out = merge_append(existing, new, key="mes", today=_today())
    assert all("mes" in r for r in out)


def test_merge_append_works_with_data_key() -> None:
    """Suporta chaves diferentes (ex: 'data' em vez de 'mes')."""
    existing = [{"data": "2026-03-15", "v": 1}]
    new = [{"data": "2026-03-15", "v": 999}, {"data": "2026-05-01", "v": 5}]
    out = merge_append(existing, new, key="data", today=_today())
    # 2026-03-15 é fechado, deve manter v=1
    march = next(r for r in out if r["data"] == "2026-03-15")
    assert march["v"] == 1


# ─────────────────────── merge_append_parallel ───────────────────────

def test_merge_parallel_preserves_closed_months() -> None:
    ex_dates = ["2026-03", "2026-04"]
    ex_arr = {"twr": [1.0, 2.0], "vol": [10.0, 20.0]}
    new_dates = ["2026-03", "2026-04", "2026-05"]
    new_arr = {"twr": [1.5, 2.5, 3.0], "vol": [15.0, 25.0, 30.0]}  # tenta sobrescrever passado
    out_dates, out_arr, div = merge_append_parallel(
        ex_dates, ex_arr, new_dates, new_arr, today=_today()
    )
    assert out_dates == ["2026-03", "2026-04", "2026-05"]
    assert out_arr["twr"] == [1.0, 2.0, 3.0]   # passado preservado, novo adicionado
    assert out_arr["vol"] == [10.0, 20.0, 30.0]
    assert set(div) == {"2026-03", "2026-04"}  # divergências registradas


def test_merge_parallel_open_month_updates() -> None:
    ex_dates = ["2026-04", "2026-05"]
    ex_arr = {"twr": [2.0, 3.0]}
    new_dates = ["2026-05"]
    new_arr = {"twr": [3.5]}  # mês corrente — pode atualizar
    out_dates, out_arr, div = merge_append_parallel(
        ex_dates, ex_arr, new_dates, new_arr, today=_today()
    )
    assert out_dates == ["2026-04", "2026-05"]
    assert out_arr["twr"] == [2.0, 3.5]
    assert div == []


def test_merge_parallel_keys_must_match() -> None:
    with pytest.raises(ValueError):
        merge_append_parallel(["2026-04"], {"a": [1]}, ["2026-04"], {"b": [1]})


def test_merge_parallel_length_mismatch() -> None:
    with pytest.raises(ValueError):
        merge_append_parallel(["2026-04", "2026-05"], {"a": [1]},
                              ["2026-04"], {"a": [1]})


# ───────────────────────── sidecar ─────────────────────────

def test_sidecar_path() -> None:
    assert sidecar_path(Path("/x/y/historico.csv")) == Path("/x/y/historico.meta.json")


def test_sidecar_roundtrip(tmp_path: Path) -> None:
    csv_path = tmp_path / "historico.csv"
    csv_path.write_text("a,b\n1,2\n")
    write_meta_sidecar(csv_path, version="v1", last_period="2026-04")
    meta, needs = load_or_init_sidecar(csv_path, "v1")
    assert needs is False
    assert meta["_meta"]["metodologia_version"] == "v1"
    assert meta["_meta"]["last_period_appended"] == "2026-04"
    assert meta["_meta"]["artefact"] == "historico.csv"


def test_sidecar_version_mismatch(tmp_path: Path) -> None:
    csv_path = tmp_path / "historico.csv"
    csv_path.write_text("a,b\n1,2\n")
    write_meta_sidecar(csv_path, version="v0", last_period="2026-04")
    _, needs = load_or_init_sidecar(csv_path, "v1")
    assert needs is True


def test_sidecar_missing_csv_forces_rebuild(tmp_path: Path) -> None:
    csv_path = tmp_path / "missing.csv"
    write_meta_sidecar(csv_path.with_name("missing.csv"), version="v1", last_period="2026-04")
    # CSV não existe — sidecar até pode existir, mas força rebuild
    _, needs = load_or_init_sidecar(csv_path, "v1")
    assert needs is True
