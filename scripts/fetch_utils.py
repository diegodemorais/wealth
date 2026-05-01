#!/usr/bin/env python3
"""
fetch_utils.py — Retry exponencial + cache opcional para fetches externos.

Template implementado conforme RUNBOOK.md Seção 7 (XX-system-audit Item 2).

Uso:
    from fetch_utils import fetch_with_retry

    resultado = fetch_with_retry(
        fn=lambda: some_api_call(),
        fallback=5.20,
        retries=3,
        cache_key="ptax_today",
        cache_ttl_h=4,
    )
"""

import json
import time
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Optional

_CACHE_PATH = Path(__file__).parent.parent / "dados" / "fetch_cache.json"

logger = logging.getLogger(__name__)


def _read_cache(key: str, ttl_h: float) -> Optional[Any]:
    """Lê valor do cache se existir e não estiver expirado. Retorna None caso contrário."""
    if not _CACHE_PATH.exists():
        return None
    try:
        store = json.loads(_CACHE_PATH.read_text(encoding="utf-8"))
        entry = store.get(key)
        if entry is None:
            return None
        cached_at_str = entry.get("_cached_at")
        if not cached_at_str:
            return None
        cached_at = datetime.fromisoformat(cached_at_str)
        # Normaliza para UTC naive se necessário
        if cached_at.tzinfo is not None:
            cached_at = cached_at.replace(tzinfo=None)
        age_h = (datetime.utcnow() - cached_at).total_seconds() / 3600
        if age_h > ttl_h:
            return None
        return entry.get("data")
    except Exception as e:
        logger.warning(f"fetch_utils._read_cache({key}): {e}")
        return None


def _write_cache(key: str, data: Any, ttl_h: float) -> None:
    """Salva valor no cache com timestamp e TTL explícito."""
    try:
        store: dict = {}
        if _CACHE_PATH.exists():
            try:
                store = json.loads(_CACHE_PATH.read_text(encoding="utf-8"))
            except Exception:
                store = {}
        store[key] = {
            "_cached_at": datetime.utcnow().isoformat(),
            "_ttl_hours": ttl_h,
            "data": data,
        }
        _CACHE_PATH.write_text(json.dumps(store, indent=2, ensure_ascii=False), encoding="utf-8")
    except Exception as e:
        logger.warning(f"fetch_utils._write_cache({key}): {e}")


def fetch_with_retry(
    fn: Callable[[], Any],
    fallback: Any = None,
    retries: int = 3,
    cache_key: Optional[str] = None,
    cache_ttl_h: float = 4,
) -> Any:
    """
    Tenta fn() com retry exponencial (1s → 2s → 4s).
    Cache opcional em dados/fetch_cache.json com TTL em horas.

    Se todas as tentativas falharem:
      - Tenta cache stale (TTL * 24) se cache_key fornecido
      - Retorna fallback se não None
      - Re-raise última exceção se fallback for None

    Args:
        fn: callable sem argumentos que executa o fetch
        fallback: valor de retorno de emergência (None = re-raise)
        retries: número de tentativas (padrão 3)
        cache_key: chave para cache em dados/fetch_cache.json (None = sem cache)
        cache_ttl_h: TTL do cache em horas (padrão 4)
    """
    # Verificar cache fresco antes de tentar
    if cache_key is not None:
        cached = _read_cache(cache_key, cache_ttl_h)
        if cached is not None:
            return cached

    last_exc: Optional[Exception] = None
    for attempt in range(retries):
        try:
            result = fn()
            if cache_key is not None:
                _write_cache(cache_key, result, cache_ttl_h)
            return result
        except Exception as e:
            last_exc = e
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                # Última tentativa falhou — tentar cache stale
                if cache_key is not None:
                    stale = _read_cache(cache_key, cache_ttl_h * 24)
                    if stale is not None:
                        logger.warning(
                            f"fetch_utils: todas as tentativas falharam ({e}). "
                            f"Usando cache stale para key='{cache_key}'."
                        )
                        return stale
                if fallback is not None:
                    logger.warning(
                        f"fetch_utils: todas as tentativas falharam ({e}). "
                        f"Usando fallback={fallback!r}."
                    )
                    return fallback
                raise last_exc
