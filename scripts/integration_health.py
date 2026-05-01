#!/usr/bin/env python3
"""
integration_health.py — Verifica saúde de todas as integrações externas do pipeline.

Integrações cobertas:
  yfinance      → preços ETFs, câmbio USD/BRL, BTC-USD, VWRA.L
  pyield/ANBIMA → taxas NTN-B, NTN-B Principal
  python-bcb    → PTAX, Selic, IPCA (SGS API)
  FRED CSV      → Fed Funds (público, sem API key)
  fredapi       → Fed Funds + Treasuries + VIX (requer FRED_API_KEY)
  IBKR Flex     → posições e trades (requer IBKR_TOKEN + IBKR_QUERY_POSITIONS)
  Binance API   → preços BTC/USDT (público)
  Google Sheets → snapshot Carteira Viva (URL pública)
  Ken French    → fatores FF5 via getfactormodels ou urllib direto

Uso:
    python3 scripts/integration_health.py            # check all
    python3 scripts/integration_health.py --json     # output JSON
    python3 scripts/integration_health.py --fix      # check + suggest fixes

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import json
import os
import sys
import time
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

# ─── Status constants ─────────────────────────────────────────────────────────

STATUS_OK      = "OK"
STATUS_DEGRADED = "DEGRADED"   # fallback usado, dado stale
STATUS_DOWN    = "DOWN"        # integração inacessível
STATUS_SKIP    = "SKIP"        # não configurada (creds ausentes)

# ─── TTL padrões por fonte ────────────────────────────────────────────────────

TTL_HOURS = {
    "yfinance":   4,    # preços intra-day — stale se >4h
    "pyield":    24,    # ANBIMA publica daily — stale se >24h
    "bcb":        6,    # SGS BCB — stale se >6h
    "fred_csv":  24,    # Fed Funds mensal — stale se >24h
    "fredapi":   24,    # idem
    "ibkr":     168,    # posições — stale se >7d (semanal OK)
    "binance":    4,    # BTC price — stale se >4h
    "sheets":    48,    # snapshot Sheets — stale se >48h
    "ken_french": 72,   # dados mensais — stale se >72h
}


# ─── Core check functions ─────────────────────────────────────────────────────

def check_yfinance() -> dict:
    """Verifica acesso ao yfinance com ticker simples (SWRD.L)."""
    start = time.monotonic()
    try:
        import yfinance as yf  # type: ignore
        data = yf.download("SWRD.L", period="2d", progress=False, auto_adjust=True)
        elapsed = time.monotonic() - start
        if data is not None and not data.empty and len(data) > 0:
            last_date = str(data.index[-1].date()) if hasattr(data.index[-1], "date") else str(data.index[-1])[:10]
            return {
                "status": STATUS_OK,
                "latency_s": round(elapsed, 2),
                "last_date": last_date,
                "note": "SWRD.L fetch OK",
            }
        return {
            "status": STATUS_DEGRADED,
            "latency_s": round(elapsed, 2),
            "note": "yfinance retornou DataFrame vazio",
        }
    except ImportError:
        return {"status": STATUS_DOWN, "note": "yfinance não instalado — pip install yfinance"}
    except Exception as e:
        return {"status": STATUS_DOWN, "latency_s": round(time.monotonic() - start, 2), "note": str(e)[:120]}


def check_pyield() -> dict:
    """Verifica acesso ao pyield/ANBIMA com NTN-B de hoje ou D-1."""
    start = time.monotonic()
    try:
        import pyield as yd  # type: ignore
        today = date.today()
        # Tenta hoje e D-1 (ANBIMA pode não ter dados do fim de semana)
        for offset in range(3):
            try_date = today - timedelta(days=offset)
            if try_date.weekday() >= 5:
                continue
            try:
                df = yd.anbima.tpf(try_date, "NTN-B")
                elapsed = time.monotonic() - start
                if df is not None and len(df) > 0:
                    return {
                        "status": STATUS_OK,
                        "latency_s": round(elapsed, 2),
                        "ref_date": str(try_date),
                        "n_bonds": len(df),
                        "note": f"NTN-B OK — {len(df)} vencimentos",
                    }
            except Exception:
                continue
        elapsed = time.monotonic() - start
        return {
            "status": STATUS_DEGRADED,
            "latency_s": round(elapsed, 2),
            "note": "pyield conectou mas não retornou dados NTN-B (fim de semana ou feriado?)",
        }
    except ImportError:
        return {"status": STATUS_DOWN, "note": "pyield não instalado — pip install pyield"}
    except Exception as e:
        return {"status": STATUS_DOWN, "latency_s": round(time.monotonic() - start, 2), "note": str(e)[:120]}


def check_bcb() -> dict:
    """Verifica acesso ao python-bcb via SGS (Selic série 432)."""
    start = time.monotonic()
    try:
        from bcb import sgs  # type: ignore
        df = sgs.get({"selic": 432}, start=(date.today() - timedelta(days=7)).isoformat())
        elapsed = time.monotonic() - start
        if df is not None and not df.empty:
            val = float(df["selic"].iloc[-1])
            return {
                "status": STATUS_OK,
                "latency_s": round(elapsed, 2),
                "selic_meta": round(val, 2),
                "note": f"Selic: {val:.2f}%",
            }
        return {
            "status": STATUS_DEGRADED,
            "latency_s": round(elapsed, 2),
            "note": "python-bcb conectou mas SGS retornou vazio",
        }
    except ImportError:
        return {"status": STATUS_DOWN, "note": "python-bcb não instalado — pip install python-bcb"}
    except Exception as e:
        return {"status": STATUS_DOWN, "latency_s": round(time.monotonic() - start, 2), "note": str(e)[:120]}


def check_fred_csv() -> dict:
    """Verifica acesso ao FRED CSV público (Fed Funds, sem API key)."""
    start = time.monotonic()
    url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=FEDFUNDS"
    try:
        with urllib.request.urlopen(url, timeout=8) as resp:
            content = resp.read().decode("utf-8").strip()
        elapsed = time.monotonic() - start
        lines = [l for l in content.splitlines() if l and not l.startswith("DATE")]
        if lines:
            last = lines[-1].split(",")
            val = round(float(last[1]), 2) if len(last) == 2 else None
            return {
                "status": STATUS_OK,
                "latency_s": round(elapsed, 2),
                "fed_funds": val,
                "last_date": last[0] if last else None,
                "note": f"Fed Funds CSV: {val}%",
            }
        return {
            "status": STATUS_DEGRADED,
            "latency_s": round(elapsed, 2),
            "note": "FRED CSV acessível mas sem dados numéricos",
        }
    except Exception as e:
        return {"status": STATUS_DOWN, "latency_s": round(time.monotonic() - start, 2), "note": str(e)[:120]}


def check_fredapi() -> dict:
    """Verifica acesso ao fredapi (requer FRED_API_KEY no .env)."""
    from dotenv import load_dotenv  # type: ignore
    load_dotenv(ROOT / ".env")
    api_key = os.getenv("FRED_API_KEY")
    if not api_key:
        return {"status": STATUS_SKIP, "note": "FRED_API_KEY não configurada — definir no .env"}
    start = time.monotonic()
    try:
        from fredapi import Fred  # type: ignore
        fred = Fred(api_key=api_key)
        s = fred.get_series("DFF", observation_start=(date.today() - timedelta(days=10)).isoformat())
        elapsed = time.monotonic() - start
        val = float(s.dropna().iloc[-1]) if len(s.dropna()) > 0 else None
        return {
            "status": STATUS_OK,
            "latency_s": round(elapsed, 2),
            "fed_funds_dff": round(val, 4) if val is not None else None,
            "note": f"fredapi DFF: {val}%",
        }
    except ImportError:
        return {"status": STATUS_DOWN, "note": "fredapi não instalado — pip install fredapi"}
    except Exception as e:
        return {"status": STATUS_DOWN, "latency_s": round(time.monotonic() - start, 2), "note": str(e)[:120]}


def check_ibkr_flex() -> dict:
    """Verifica configuração IBKR Flex (token + query_id) e staleness do lotes.json."""
    from dotenv import load_dotenv  # type: ignore
    load_dotenv(ROOT / ".env")
    token = os.getenv("IBKR_TOKEN")
    query_id = os.getenv("IBKR_QUERY_POSITIONS")

    lotes_path = ROOT / "dados" / "ibkr" / "lotes.json"
    lotes_age_h: Optional[float] = None
    if lotes_path.exists():
        age_s = time.time() - lotes_path.stat().st_mtime
        lotes_age_h = round(age_s / 3600, 1)

    if not token or not query_id:
        return {
            "status": STATUS_SKIP,
            "lotes_age_h": lotes_age_h,
            "note": "IBKR_TOKEN ou IBKR_QUERY_POSITIONS não configurados — modo manual (CSV)",
            "action": "Definir IBKR_TOKEN + IBKR_QUERY_POSITIONS no .env para Flex Query automático",
        }

    # Verificar se ibflex está instalado
    try:
        import ibflex  # type: ignore
        ibflex_ok = True
    except ImportError:
        ibflex_ok = False

    ttl_h = TTL_HOURS["ibkr"]
    if lotes_age_h is not None and lotes_age_h > ttl_h:
        status = STATUS_DEGRADED
        note = f"lotes.json stale: {lotes_age_h}h (TTL={ttl_h}h) — rodar ibkr_sync.py"
    elif lotes_path.exists():
        status = STATUS_OK
        note = f"lotes.json age: {lotes_age_h}h"
    else:
        status = STATUS_DEGRADED
        note = "lotes.json não existe — rodar ibkr_lotes.py --flex"

    return {
        "status": status,
        "lotes_age_h": lotes_age_h,
        "token_configured": bool(token),
        "query_configured": bool(query_id),
        "ibflex_installed": ibflex_ok,
        "note": note,
    }


def check_binance() -> dict:
    """Verifica acesso à Binance API pública (BTC/USDT klines)."""
    start = time.monotonic()
    url = "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=2"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
        elapsed = time.monotonic() - start
        if data and len(data) > 0:
            last_close = round(float(data[-1][4]), 2)
            return {
                "status": STATUS_OK,
                "latency_s": round(elapsed, 2),
                "btc_usdt_close": last_close,
                "note": f"BTC/USDT: ${last_close:,.0f}",
            }
        return {
            "status": STATUS_DEGRADED,
            "latency_s": round(elapsed, 2),
            "note": "Binance API retornou vazio",
        }
    except Exception as e:
        return {"status": STATUS_DOWN, "latency_s": round(time.monotonic() - start, 2), "note": str(e)[:120]}


def check_google_sheets() -> dict:
    """Verifica acesso ao Google Sheets (URL pública da Carteira Viva)."""
    sheets_json = ROOT / "dados" / "historico_sheets.json"
    age_h: Optional[float] = None
    if sheets_json.exists():
        age_s = time.time() - sheets_json.stat().st_mtime
        age_h = round(age_s / 3600, 1)

    # Verificar se SHEET_ID está configurado em fetch_historico_sheets.py
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("fetch_historico_sheets",
                                                        ROOT / "scripts" / "fetch_historico_sheets.py")
        mod = importlib.util.module_from_spec(spec)
        sheet_id = None
        # Ler o SHEET_ID do arquivo diretamente (evitar executar o módulo)
        content = (ROOT / "scripts" / "fetch_historico_sheets.py").read_text()
        import re
        m = re.search(r'SHEET_ID\s*=\s*["\']([^"\']+)["\']', content)
        if m:
            sheet_id = m.group(1)
    except Exception:
        sheet_id = None

    if not sheet_id or sheet_id in ("YOUR_SHEET_ID", ""):
        return {
            "status": STATUS_SKIP,
            "cache_age_h": age_h,
            "note": "SHEET_ID não configurado em fetch_historico_sheets.py",
        }

    ttl_h = TTL_HOURS["sheets"]
    start = time.monotonic()
    try:
        test_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:csv&sheet=Summary&range=A1:A1"
        req = urllib.request.Request(test_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            _ = resp.read()
        elapsed = time.monotonic() - start
        stale = age_h is not None and age_h > ttl_h
        return {
            "status": STATUS_DEGRADED if stale else STATUS_OK,
            "latency_s": round(elapsed, 2),
            "cache_age_h": age_h,
            "note": f"Sheets acessível. Cache: {age_h}h {'(STALE)' if stale else 'OK'}",
        }
    except Exception as e:
        elapsed = time.monotonic() - start
        # Sheets inacessível, mas cache pode estar OK
        if age_h is not None and age_h <= ttl_h:
            return {
                "status": STATUS_DEGRADED,
                "latency_s": round(elapsed, 2),
                "cache_age_h": age_h,
                "note": f"Sheets inacessível ({str(e)[:60]}) — cache {age_h}h (dentro TTL={ttl_h}h)",
            }
        return {
            "status": STATUS_DOWN,
            "latency_s": round(elapsed, 2),
            "cache_age_h": age_h,
            "note": str(e)[:120],
        }


def check_ken_french() -> dict:
    """Verifica acesso a Ken French data library via getfactormodels ou urllib direto."""
    factor_cache = ROOT / "dados" / "factor_cache.json"
    cache_age_h: Optional[float] = None
    if factor_cache.exists():
        age_s = time.time() - factor_cache.stat().st_mtime
        cache_age_h = round(age_s / 3600, 1)

    start = time.monotonic()
    try:
        from getfactormodels import FamaFrenchFactors  # type: ignore
        ff = FamaFrenchFactors(model="5", frequency="m")
        ff.load()
        df = ff.to_pandas().tail(1)
        elapsed = time.monotonic() - start
        last_date = str(df.index[-1].date()) if hasattr(df.index[-1], "date") else str(df.index[-1])[:10]
        return {
            "status": STATUS_OK,
            "latency_s": round(elapsed, 2),
            "last_date": last_date,
            "cache_age_h": cache_age_h,
            "source": "getfactormodels",
            "note": f"FF5 OK via getfactormodels — último: {last_date}",
        }
    except ImportError:
        pass
    except Exception as e:
        elapsed = time.monotonic() - start
        # Fallback: testar urllib direto
        try:
            url = "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/Developed_5_Factors_CSV.zip"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                _ = resp.read(1024)  # só testar conectividade
            elapsed2 = time.monotonic() - start
            return {
                "status": STATUS_DEGRADED,
                "latency_s": round(elapsed2, 2),
                "cache_age_h": cache_age_h,
                "source": "urllib_direct",
                "note": f"getfactormodels falhou ({str(e)[:60]}) — Ken French URL acessível",
            }
        except Exception as e2:
            return {
                "status": STATUS_DOWN,
                "latency_s": round(time.monotonic() - start, 2),
                "cache_age_h": cache_age_h,
                "note": f"getfactormodels: {str(e)[:60]} | KF URL: {str(e2)[:60]}",
            }

    # getfactormodels não instalado — testar urllib
    start = time.monotonic()
    try:
        url = "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/Developed_5_Factors_CSV.zip"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            _ = resp.read(1024)
        elapsed = time.monotonic() - start
        return {
            "status": STATUS_DEGRADED,
            "latency_s": round(elapsed, 2),
            "cache_age_h": cache_age_h,
            "source": "urllib_direct",
            "note": "getfactormodels não instalado — Ken French URL acessível (pip install getfactormodels)",
        }
    except Exception as e:
        return {
            "status": STATUS_DOWN,
            "latency_s": round(time.monotonic() - start, 2),
            "cache_age_h": cache_age_h,
            "note": f"getfactormodels não instalado E Ken French URL inacessível: {str(e)[:80]}",
        }


# ─── Staleness check for local caches ────────────────────────────────────────

def _cache_staleness() -> dict:
    """Verifica staleness dos caches locais que servem de fallback."""
    caches = {
        "ntnb_history_cache.json":   {"path": ROOT / "dados" / "ntnb_history_cache.json",   "ttl_h": 24},
        "factor_cache.json":         {"path": ROOT / "dados" / "factor_cache.json",          "ttl_h": 72},
        "macro_snapshot.json":       {"path": ROOT / "dados" / "macro_snapshot.json",        "ttl_h": 6},
        "factor_snapshot.json":      {"path": ROOT / "dados" / "factor_snapshot.json",       "ttl_h": 72},
        "historico_sheets.json":     {"path": ROOT / "dados" / "historico_sheets.json",      "ttl_h": 48},
        "ibkr/lotes.json":           {"path": ROOT / "dados" / "ibkr" / "lotes.json",        "ttl_h": 168},
        "binance/posicoes.json":      {"path": ROOT / "dados" / "binance" / "posicoes.json",  "ttl_h": 4},
    }
    result = {}
    for name, cfg in caches.items():
        p = cfg["path"]
        if p.exists():
            age_s = time.time() - p.stat().st_mtime
            age_h = round(age_s / 3600, 1)
            stale = age_h > cfg["ttl_h"]
            result[name] = {
                "exists": True,
                "age_h": age_h,
                "ttl_h": cfg["ttl_h"],
                "stale": stale,
            }
        else:
            result[name] = {"exists": False, "ttl_h": cfg["ttl_h"], "stale": True}
    return result


# ─── Run all checks ───────────────────────────────────────────────────────────

INTEGRATIONS = {
    "yfinance":    check_yfinance,
    "pyield_anbima": check_pyield,
    "bcb_sgs":     check_bcb,
    "fred_csv":    check_fred_csv,
    "fredapi":     check_fredapi,
    "ibkr_flex":   check_ibkr_flex,
    "binance_api": check_binance,
    "google_sheets": check_google_sheets,
    "ken_french":  check_ken_french,
}


def run_all(verbose: bool = True) -> dict:
    """Roda todos os checks e retorna resultado consolidado."""
    results = {}
    for name, fn in INTEGRATIONS.items():
        if verbose:
            print(f"  ▶ {name} ...", end="", flush=True)
        try:
            r = fn()
        except Exception as exc:
            r = {"status": STATUS_DOWN, "note": f"Exceção inesperada: {exc}"}
        results[name] = r
        if verbose:
            status = r.get("status", "?")
            symbol = {"OK": "✅", "DEGRADED": "🟡", "DOWN": "🔴", "SKIP": "⊘"}.get(status, "?")
            note = r.get("note", "")[:80]
            latency = f" ({r['latency_s']}s)" if "latency_s" in r else ""
            print(f" {symbol} {status}{latency} — {note}")

    caches = _cache_staleness()
    if verbose:
        print()
        print("  Cache staleness:")
        for name, info in caches.items():
            if info["exists"]:
                stale_marker = " ⚠️ STALE" if info["stale"] else ""
                print(f"    {name:<35} {info['age_h']}h (TTL={info['ttl_h']}h){stale_marker}")
            else:
                print(f"    {name:<35} ✗ não existe")

    summary = {
        "integrations": results,
        "caches": caches,
        "generated": datetime.now().isoformat(),
        "counts": {
            "ok":      sum(1 for r in results.values() if r.get("status") == STATUS_OK),
            "degraded": sum(1 for r in results.values() if r.get("status") == STATUS_DEGRADED),
            "down":    sum(1 for r in results.values() if r.get("status") == STATUS_DOWN),
            "skip":    sum(1 for r in results.values() if r.get("status") == STATUS_SKIP),
        },
    }
    return summary


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    import argparse
    parser = argparse.ArgumentParser(
        description="Verifica saúde de todas as integrações externas do pipeline."
    )
    parser.add_argument("--json", action="store_true", help="Output JSON em vez de texto")
    parser.add_argument("--fix", action="store_true", help="Exibir ações corretivas por integração")
    parser.add_argument("--integration", metavar="NAME", help="Verificar apenas uma integração específica")
    args = parser.parse_args()

    # Carregar .env se disponível
    try:
        from dotenv import load_dotenv  # type: ignore
        load_dotenv(ROOT / ".env")
    except ImportError:
        pass

    if args.integration:
        if args.integration not in INTEGRATIONS:
            print(f"❌ Integração '{args.integration}' não encontrada.")
            print(f"   Disponíveis: {', '.join(INTEGRATIONS)}")
            sys.exit(1)
        r = INTEGRATIONS[args.integration]()
        if args.json:
            print(json.dumps(r, indent=2, default=str))
        else:
            print(json.dumps(r, indent=2, default=str))
        sys.exit(0)

    print(f"\n{'─' * 62}")
    print(f"  Integration Health Check — {date.today()}")
    print(f"{'─' * 62}")

    verbose = not args.json
    summary = run_all(verbose=verbose)

    if args.json:
        print(json.dumps(summary, indent=2, default=str))
        sys.exit(0)

    counts = summary["counts"]
    print()
    print(f"{'─' * 62}")
    print(f"  Resumo: {counts['ok']} OK | {counts['degraded']} DEGRADED | {counts['down']} DOWN | {counts['skip']} SKIP")
    print(f"{'─' * 62}")

    if args.fix:
        print()
        print("  Ações corretivas:")
        for name, r in summary["integrations"].items():
            status = r.get("status")
            if status in (STATUS_DOWN, STATUS_DEGRADED, STATUS_SKIP):
                print(f"\n  [{status}] {name}")
                print(f"    Problema: {r.get('note', '?')}")
                action = r.get("action")
                if action:
                    print(f"    Ação:     {action}")
                # Runbook hints
                if "yfinance" in name and status == STATUS_DOWN:
                    print("    Ação:     python3 scripts/generate_data.py --skip-prices")
                elif "bcb" in name and status == STATUS_DOWN:
                    print("    Ação:     usar macro_snapshot.json existente; reconstruct_macro.py quando voltar")
                elif "pyield" in name and status == STATUS_DOWN:
                    print("    Ação:     usar ntnb_history_cache.json existente; reconstruct_fire_data.py quando voltar")
                elif "ibkr" in name and status in (STATUS_DEGRADED, STATUS_DOWN):
                    print("    Ação:     python3 scripts/ibkr_sync.py --cambio <ptax>")
                elif "sheets" in name and status in (STATUS_DOWN, STATUS_DEGRADED):
                    print("    Ação:     python3 scripts/fetch_historico_sheets.py")
                elif "ken_french" in name and status == STATUS_DOWN:
                    print("    Ação:     usar factor_snapshot.json existente; reconstruct_factor.py quando voltar")

    overall_ok = counts["down"] == 0 and counts["degraded"] == 0
    sys.exit(0 if overall_ok else 1)


if __name__ == "__main__":
    main()
