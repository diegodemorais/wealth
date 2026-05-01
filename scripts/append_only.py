"""
Append-only contract for deterministic time-series artefacts in dados/.

Spec: agentes/issues/DEV-pipeline-append-only.md (princípios P1–P5).

Padrão de uso:

    from append_only import load_or_init, write_with_meta, is_period_closed, merge_append

    METODOLOGIA_VERSION = "twr-md-v1"
    artefact, needs_rebuild = load_or_init(path, METODOLOGIA_VERSION, rebuild_flag=args.rebuild)

    if needs_rebuild:
        data = compute_full(...)
        write_with_meta(path, data, METODOLOGIA_VERSION, last_period=last_ym,
                        rebuild_reason="version-bump" if not args.rebuild else "cli-flag")
    else:
        last_period = artefact["_meta"]["last_period_appended"]
        new = compute_only_after(last_period)
        merged = merge_append(artefact["data"], new, key="mes")
        write_with_meta(path, {"data": merged, ...}, METODOLOGIA_VERSION, last_period=new_last_ym)

Para CSV (sem _meta inline), usar arquivo sidecar `<name>.meta.json` via
`load_or_init_sidecar` / `write_meta_sidecar`.
"""
from __future__ import annotations

import json
from datetime import date, datetime
from pathlib import Path
from typing import Any


def _now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def load_or_init(
    path: Path,
    current_version: str,
    *,
    rebuild_flag: bool = False,
) -> tuple[dict, bool]:
    """Carrega artefato existente e decide se precisa rebuild.

    Retorna (artefato, needs_rebuild).

    Regras:
    - rebuild_flag=True            -> needs_rebuild=True, artefato={}
    - arquivo não existe           -> needs_rebuild=True, artefato={}
    - JSON inválido                -> needs_rebuild=True, artefato={}
    - _meta.metodologia_version diferente de current_version -> needs_rebuild=True, artefato={}
    - caso contrário               -> needs_rebuild=False, artefato carregado
    """
    if rebuild_flag:
        return {}, True
    if not path.exists():
        return {}, True
    try:
        existing = json.loads(path.read_text())
    except (json.JSONDecodeError, OSError):
        return {}, True
    meta = existing.get("_meta") if isinstance(existing, dict) else None
    if not isinstance(meta, dict):
        return {}, True
    if meta.get("metodologia_version") != current_version:
        return {}, True
    return existing, False


def load_or_init_sidecar(
    artefact_path: Path,
    current_version: str,
    *,
    rebuild_flag: bool = False,
) -> tuple[dict, bool]:
    """Variante para artefatos CSV: meta vive em <name>.meta.json sidecar.

    Retorna (meta_dict, needs_rebuild). Se o CSV não existe, força rebuild.
    """
    sidecar = sidecar_path(artefact_path)
    if rebuild_flag:
        return {}, True
    if not artefact_path.exists() or not sidecar.exists():
        return {}, True
    try:
        meta = json.loads(sidecar.read_text())
    except (json.JSONDecodeError, OSError):
        return {}, True
    inner = meta.get("_meta") if isinstance(meta, dict) else None
    if not isinstance(inner, dict):
        return {}, True
    if inner.get("metodologia_version") != current_version:
        return {}, True
    return meta, False


def sidecar_path(artefact_path: Path) -> Path:
    """Retorna o caminho do sidecar `<name>.meta.json` para um artefato CSV."""
    return artefact_path.with_name(artefact_path.stem + ".meta.json")


def write_with_meta(
    path: Path,
    data: dict,
    version: str,
    last_period: str,
    *,
    rebuild_reason: str | None = None,
    schema_version: str = "1.0",
) -> None:
    """Escreve JSON com bloco `_meta` canônico.

    `data` deve ser um dict; `_meta` será injetado/sobrescrito.
    """
    if not isinstance(data, dict):
        raise TypeError("write_with_meta: data deve ser dict")
    payload = dict(data)  # shallow copy
    payload["_meta"] = {
        "metodologia_version": version,
        "schema_version": schema_version,
        "last_period_appended": last_period,
        "last_appended_at": _now_iso(),
        "rebuild_reason": rebuild_reason,
    }
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False))


def write_meta_sidecar(
    artefact_path: Path,
    version: str,
    last_period: str,
    *,
    rebuild_reason: str | None = None,
    schema_version: str = "1.0",
) -> None:
    """Escreve sidecar `<name>.meta.json` para artefato CSV."""
    sidecar = sidecar_path(artefact_path)
    payload = {
        "_meta": {
            "metodologia_version": version,
            "schema_version": schema_version,
            "last_period_appended": last_period,
            "last_appended_at": _now_iso(),
            "rebuild_reason": rebuild_reason,
            "artefact": artefact_path.name,
        }
    }
    sidecar.write_text(json.dumps(payload, indent=2, ensure_ascii=False))


def is_period_closed(period: str, today: date | None = None) -> bool:
    """True se `period` (YYYY-MM ou YYYY-MM-DD) é estritamente anterior ao período corrente.

    Para mensal (len=7): True se mês < mês corrente.
    Para diário (len=10): True se dia < hoje.
    """
    today = today or date.today()
    if len(period) == 7:
        # YYYY-MM
        try:
            y, m = int(period[:4]), int(period[5:7])
        except ValueError as e:
            raise ValueError(f"period inválido (esperado YYYY-MM): {period!r}") from e
        return (y, m) < (today.year, today.month)
    if len(period) == 10:
        try:
            d = date.fromisoformat(period)
        except ValueError as e:
            raise ValueError(f"period inválido (esperado YYYY-MM-DD): {period!r}") from e
        return d < today
    raise ValueError(f"period com formato não suportado: {period!r}")


def merge_append(
    existing: list[dict],
    new_periods: list[dict],
    key: str,
    *,
    today: date | None = None,
) -> list[dict]:
    """Merge append-only por chave temporal.

    Regras:
    - Períodos fechados (`is_period_closed(item[key])`) que existem em `existing`
      são preservados imutáveis (entrada de `new_periods` é IGNORADA para esses).
    - Períodos abertos (mês corrente, dia corrente) podem ser atualizados:
      `new_periods` sobrescreve `existing`.
    - Períodos novos (não existem em `existing`) são adicionados.
    - Resultado é ordenado por `key` ascendente.
    """
    by_key: dict[str, dict] = {}
    for item in existing:
        if key in item:
            by_key[item[key]] = item
    for item in new_periods:
        if key not in item:
            continue
        period = item[key]
        if period in by_key and is_period_closed(period, today=today):
            # Período fechado já registrado: mantém o existente, ignora o novo.
            continue
        by_key[period] = item
    return [by_key[k] for k in sorted(by_key.keys())]


def merge_append_parallel(
    existing_dates: list[str],
    existing_arrays: dict[str, list],
    new_dates: list[str],
    new_arrays: dict[str, list],
    *,
    today: date | None = None,
) -> tuple[list[str], dict[str, list], list[str]]:
    """Merge append-only para artefatos com **arrays paralelos** indexados por `dates`.

    Útil para retornos_mensais.json e rolling_metrics.json (formato pivot, não record).

    Para cada data:
    - Se já existia em `existing_dates` E é período fechado: mantém valores antigos.
      Se valor recomputado em `new_arrays` divergir, regista em `divergent` (diagnóstico).
    - Período aberto (mês corrente / dia corrente): usa novo valor.
    - Período novo (não existia): adiciona com valor novo.

    Output ordenado por data ascendente.

    Retorna (merged_dates, merged_arrays, divergent_periods).

    Pré-condições:
    - `existing_arrays` e `new_arrays` têm as mesmas chaves.
    - len(values) == len(<dates>) para cada array em ambos.
    """
    if existing_arrays.keys() != new_arrays.keys():
        raise ValueError(
            f"Arrays divergentes: existing={sorted(existing_arrays.keys())} "
            f"new={sorted(new_arrays.keys())}"
        )
    for k, v in existing_arrays.items():
        if len(v) != len(existing_dates):
            raise ValueError(f"existing[{k}] len={len(v)} != dates len={len(existing_dates)}")
    for k, v in new_arrays.items():
        if len(v) != len(new_dates):
            raise ValueError(f"new[{k}] len={len(v)} != dates len={len(new_dates)}")

    keys = list(existing_arrays.keys())
    existing_idx = {d: i for i, d in enumerate(existing_dates)}
    new_idx = {d: i for i, d in enumerate(new_dates)}
    all_dates = sorted(set(existing_dates) | set(new_dates))

    merged_arrays: dict[str, list] = {k: [] for k in keys}
    divergent: list[str] = []
    for d in all_dates:
        in_existing = d in existing_idx
        in_new = d in new_idx
        closed = is_period_closed(d, today=today)
        for k in keys:
            if in_existing and closed:
                old_val = existing_arrays[k][existing_idx[d]]
                if in_new:
                    new_val = new_arrays[k][new_idx[d]]
                    if old_val != new_val and d not in divergent:
                        divergent.append(d)
                merged_arrays[k].append(old_val)
            elif in_new:
                merged_arrays[k].append(new_arrays[k][new_idx[d]])
            else:
                # data existe só em existing mas é período aberto → mantém o valor antigo
                # (não temos novo, então não há melhor opção)
                merged_arrays[k].append(existing_arrays[k][existing_idx[d]])
    return all_dates, merged_arrays, divergent


__all__ = [
    "load_or_init",
    "load_or_init_sidecar",
    "write_with_meta",
    "write_meta_sidecar",
    "sidecar_path",
    "is_period_closed",
    "merge_append",
    "merge_append_parallel",
]
