#!/usr/bin/env python3
"""
reconstruct_fire_data.py — Gera JSONs core para features do dashboard (HD-perplexity-review Stage 1).

JSONs gerados:
  dados/etf_composition.json       — N2: composição regional/fatorial por ETF
  dados/fire_matrix.json           — R1: matriz SWR × Gasto → P(sucesso 30 anos)
  dados/fire_swr_percentis.json    — R2: SWR implícita nos percentis P10/P50/P90 na data FIRE
  dados/fire_aporte_sensitivity.json — R3: aporte → P(FIRE 2040) via MC real
  dados/fire_trilha.json           — R5: trilha patrimonial esperada vs realizado
  dados/drawdown_history.json      — N1: série temporal de drawdown + anotações de crises
  dados/bond_pool_runway.json      — N3: projeção bond pool até 2040 e runway pós-FIRE
  dados/lumpy_events.json          — N4: cenários de eventos de vida

Nota: R4 (plano_status em macro_snapshot.json) é feito por reconstruct_macro.py.

Uso:
    python3 scripts/reconstruct_fire_data.py
    python3 scripts/reconstruct_fire_data.py --only etf_composition
    python3 scripts/reconstruct_fire_data.py --only fire_matrix  # lento: ~60s

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import argparse
import json
import math
import sys
from datetime import datetime, date
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

import numpy as np
from append_only import (
    load_or_init,
    merge_append_parallel,
    write_with_meta,
)
from config import (
    APORTE_MENSAL, CUSTO_VIDA_BASE, PATRIMONIO_GATILHO,
    IDADE_ATUAL, IDADE_CENARIO_BASE,
    IPCA_LONGO_PCT, IPCA_CURTO_PCT, EQUITY_PCT, CRIPTO_PCT,
    ETF_COMPOSITION, MACRO_REGRAS, HORIZONTE_VIDA,
    DATE_FORMAT_YM, DATE_FORMAT_YMD, ANOS_COBERTURA_POS_FIRE,
)
from fire_montecarlo import (
    PREMISSAS, rodar_monte_carlo, projetar_acumulacao,
    projetar_acumulacao_mensal,
    _retorno_equity_cenario,
)
from bond_pool_engine import BondPoolEngine, BondPoolRequest
from swr_engine import SWREngine, SWRRequest

NOW = datetime.now().isoformat(timespec="seconds")
DADOS = ROOT / "dados"
_WINDOW_ID = None  # DATA_PIPELINE_CENTRALIZATION: Invariant 1 — set by CLI --window-id

# Append-only contract: bumpar quando lógica de cálculo mudar (força rebuild).
# - DD: peak-to-trough sobre TWR (acumulado_pct ou compondo patrimonio_var).
# - TRILHA: trilha esperada (CAGR + aportes) vs realizado, ambos por mês.
METODOLOGIA_VERSION_DD = "dd-peak-trough-v1"
METODOLOGIA_VERSION_TRILHA = "trilha-v1"

# CLI flag global — definido pelo argparser; permite que generators chamados via
# --only herdem a flag.
_REBUILD_FLAG = False


def _save(path: Path, data: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    print(f"  ✓ {path.relative_to(ROOT)}")


def _load_json(path: Path, fallback: dict = None) -> dict:
    try:
        return json.loads(path.read_text())
    except Exception:
        return fallback or {}


# ─── N2: ETF Composition ──────────────────────────────────────────────────────

def gen_etf_composition():
    """N2 — Composição regional e fatorial por ETF (dados de config.py)."""
    data = {
        "_generated": NOW,
        "_window_id": _WINDOW_ID,
        "_source": "config.py ETF_COMPOSITION",
        "etfs": ETF_COMPOSITION,
    }
    _save(DADOS / "etf_composition.json", data)


# ─── R5: Trilha Patrimonial ────────────────────────────────────────────────────

def gen_fire_trilha(rebuild: bool = False):
    """R5 — Trilha patrimonial esperada vs realizado por ano, extendida até 2040-01.

    Append-only: pontos de meses fechados (histórico) são imutáveis. Futuro é
    sempre re-projetado a partir do último realizado (MC + trilha continuação).
    Versão FIRE specialist: trilha esperada (CAGR estático) + realizado fixo →
    histórico determinístico salvo bump de premissa (force version bump).
    """
    out_path = DADOS / "fire_trilha.json"
    rebuild_flag = rebuild or _REBUILD_FLAG
    existing_trilha, needs_rebuild_t = load_or_init(
        out_path, METODOLOGIA_VERSION_TRILHA, rebuild_flag=rebuild_flag,
    )
    rebuild_reason_t = None
    if needs_rebuild_t:
        rebuild_reason_t = (
            "cli-flag" if rebuild_flag
            else "missing-or-version-mismatch"
        )
    csv_path = DADOS / "historico_carteira.csv"
    if not csv_path.exists():
        print("  ⚠️  historico_carteira.csv não encontrado — skipping fire_trilha")
        return

    import csv as _csv
    from dateutil.relativedelta import relativedelta

    rows = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = _csv.DictReader(f)
        for row in reader:
            try:
                dt_str = row["data"][:7]  # YYYY-MM
                pat = float(row["patrimonio_brl"])
                rows.append({"date": dt_str, "patrimonio": pat})
            except (KeyError, ValueError):
                continue

    if not rows:
        print("  ⚠️  historico_carteira.csv sem dados válidos")
        return

    # Trilha esperada: a partir do patrimônio inicial em cada mês, projetar
    # retorno 4.85%/ano real + aporte R$25k/mês
    retorno_anual = PREMISSAS["retorno_equity_base"]  # 4.85%
    retorno_mensal = (1 + retorno_anual) ** (1 / 12) - 1
    aporte_mensal = APORTE_MENSAL  # 25000

    pat0 = rows[0]["patrimonio"]

    # Gerar trilha para todos os meses históricos
    def _trilha_val(i):
        crescimento = pat0 * (1 + retorno_mensal) ** i
        aportes_acum = aporte_mensal * ((1 + retorno_mensal) ** i - 1) / retorno_mensal if retorno_mensal > 0 else aporte_mensal * i
        return round(crescimento + aportes_acum, 0)

    trilha_hist = [_trilha_val(i) for i, _ in enumerate(rows)]

    # Status: ahead/behind/on_track (apenas para períodos históricos)
    status_hist = []
    for real, esp in zip([r["patrimonio"] for r in rows], trilha_hist):
        if real > esp * 1.05:
            status_hist.append("ahead")
        elif real < esp * 0.95:
            status_hist.append("behind")
        else:
            status_hist.append("on_track")

    # Extender datas até 2040-01 (data FIRE alvo)
    fire_date_str = "2040-01"
    last_hist_date_str = rows[-1]["date"]
    last_hist_date = datetime.strptime(last_hist_date_str, "%Y-%m")
    fire_date = datetime.strptime(fire_date_str, "%Y-%m")

    # Gerar meses futuros (após último dado histórico até 2040-01 inclusive)
    # A projeção futura parte do ÚLTIMO REALIZADO (não do pat0 original), para
    # que a trilha reflita "de onde estou hoje, vou chegar na meta?"
    last_realizado = rows[-1]["patrimonio"]

    def _trilha_future(j):
        """j = meses a partir do último dado histórico (1-indexed)."""
        crescimento = last_realizado * (1 + retorno_mensal) ** j
        aportes_acum = aporte_mensal * ((1 + retorno_mensal) ** j - 1) / retorno_mensal if retorno_mensal > 0 else aporte_mensal * j
        return round(crescimento + aportes_acum, 0)

    n_hist = len(rows)
    future_dates = []
    future_trilha = []
    cur = last_hist_date + relativedelta(months=1)
    while cur <= fire_date:
        dt_str = cur.strftime(DATE_FORMAT_YM)
        j = len(future_dates) + 1  # meses a partir do último histórico
        future_dates.append(dt_str)
        future_trilha.append(_trilha_future(j))
        cur += relativedelta(months=1)

    # Meta FIRE: R$13.4M em 2040-01
    meta_fire_brl = PATRIMONIO_GATILHO
    meta_fire_date = fire_date_str

    all_dates = [r["date"] for r in rows] + future_dates
    all_trilha = trilha_hist + future_trilha
    # realizado_brl: valor real para histórico, null para futuro
    all_realizado = [round(r["patrimonio"], 0) for r in rows] + [None] * len(future_dates)
    all_status = status_hist + ["future"] * len(future_dates)

    # P10/P50/P90 via Monte Carlo — todos ancorados no patrimônio atual, projetado só para o futuro
    # Fix: P50 agora vem do MC para garantir P10 <= P50 <= P90 em todos os pontos
    # Histórico: trilha_brl=realizados, trilha_p10/p50/p90=None
    # Futuro: trilha_brl=mc_p50, trilha_p10/p50/p90=mc valores
    try:
        n_meses_futuro = len(future_dates)
        mc_dates, mc_p50, mc_p10, mc_p90 = projetar_acumulacao_mensal(
            PREMISSAS,
            r_equity=_retorno_equity_cenario(PREMISSAS, "base"),
            n_sim=5000,
            n_meses=n_meses_futuro,
            seed=42
        )
        if len(mc_p10) == n_meses_futuro:
            # Histórico = None/realizados, futuro = valores MC ancorados no patrimônio atual
            trilha_p10_brl = [None] * n_hist + [round(v, 0) for v in mc_p10]
            trilha_p50_brl = [None] * n_hist + [round(v, 0) for v in mc_p50]
            trilha_p90_brl = [None] * n_hist + [round(v, 0) for v in mc_p90]
            # Substituir trilha_brl future com MC P50 (garante P10 <= P50 <= P90)
            all_trilha = trilha_hist + [round(v, 0) for v in mc_p50]
        else:
            print(f"  ⚠️  MC dates mismatch: {len(mc_p10)} vs {n_meses_futuro} — omitindo P10/P50/P90")
            trilha_p10_brl = None
            trilha_p50_brl = None
            trilha_p90_brl = None
    except Exception as e:
        print(f"  ⚠️  Erro ao gerar P10/P50/P90 via MC: {e}")
        trilha_p10_brl = None
        trilha_p50_brl = None
        trilha_p90_brl = None

    data = {
        "_generated": NOW,
        "_window_id": _WINDOW_ID,
        "_source": "reconstruct_fire_data.py",
        "dates": all_dates,
        "trilha_brl": all_trilha,
        "realizado_brl": all_realizado,
        "status": all_status,
        "meta_fire_brl": meta_fire_brl,
        "meta_fire_date": meta_fire_date,
        "retorno_anual_premissa": retorno_anual,
        "aporte_mensal_premissa": aporte_mensal,
        "n_historico": n_hist,
    }

    # Adicionar P10/P50/P90 se disponível
    if trilha_p10_brl is not None:
        data["trilha_p10_brl"] = trilha_p10_brl
        data["trilha_p50_brl"] = trilha_p50_brl
        data["trilha_p90_brl"] = trilha_p90_brl
        data["trilha_percentis_source"] = "fire_montecarlo.py projetar_acumulacao_mensal (5k sims, garantindo P10<=P50<=P90)"

    # Append-only sobre prefixo histórico: meses fechados imutáveis em
    # trilha_brl/realizado_brl/status (e percentis None nesse trecho).
    # Futuro (n_hist..end) é sempre re-projetado: sobrescreve.
    if not needs_rebuild_t and existing_trilha:
        ex_dates = existing_trilha.get("dates", [])
        ex_realizado = existing_trilha.get("realizado_brl", [])
        # Considerar histórico do existing onde realizado != None (proxy para "fechado").
        hist_idx_ex = [i for i, v in enumerate(ex_realizado) if v is not None]
        ex_hist_dates = [ex_dates[i] for i in hist_idx_ex]
        ex_hist_realizado = [ex_realizado[i] for i in hist_idx_ex]
        ex_hist_trilha = [existing_trilha.get("trilha_brl", [])[i] for i in hist_idx_ex] if existing_trilha.get("trilha_brl") else []
        ex_hist_status = [existing_trilha.get("status", [])[i] for i in hist_idx_ex] if existing_trilha.get("status") else []

        new_hist_dates = [r["date"] for r in rows]
        new_hist_realizado = [round(r["patrimonio"], 0) for r in rows]
        new_hist_trilha = trilha_hist
        new_hist_status = status_hist

        if ex_hist_dates and len(ex_hist_trilha) == len(ex_hist_dates) \
                and len(ex_hist_realizado) == len(ex_hist_dates) \
                and len(ex_hist_status) == len(ex_hist_dates):
            try:
                m_dates, m_arrs, divergent = merge_append_parallel(
                    ex_hist_dates,
                    {
                        "trilha_brl": ex_hist_trilha,
                        "realizado_brl": ex_hist_realizado,
                        "status": ex_hist_status,
                    },
                    new_hist_dates,
                    {
                        "trilha_brl": new_hist_trilha,
                        "realizado_brl": new_hist_realizado,
                        "status": new_hist_status,
                    },
                )
                if divergent:
                    print(f"  ⚠ fire_trilha: {len(divergent)} divergências em meses fechados (mantidas antigas)")
                # Reconstroi all_* concatenando histórico merged + futuro re-projetado.
                hist_n = len(m_dates)
                all_dates = m_dates + future_dates
                all_trilha = list(m_arrs["trilha_brl"]) + (
                    [round(v, 0) for v in mc_p50] if trilha_p10_brl is not None else future_trilha
                )
                all_realizado = list(m_arrs["realizado_brl"]) + [None] * len(future_dates)
                all_status = list(m_arrs["status"]) + ["future"] * len(future_dates)
                if trilha_p10_brl is not None:
                    trilha_p10_brl = [None] * hist_n + [round(v, 0) for v in mc_p10]
                    trilha_p50_brl = [None] * hist_n + [round(v, 0) for v in mc_p50]
                    trilha_p90_brl = [None] * hist_n + [round(v, 0) for v in mc_p90]
                # Atualiza data dict
                data["dates"] = all_dates
                data["trilha_brl"] = all_trilha
                data["realizado_brl"] = all_realizado
                data["status"] = all_status
                if trilha_p10_brl is not None:
                    data["trilha_p10_brl"] = trilha_p10_brl
                    data["trilha_p50_brl"] = trilha_p50_brl
                    data["trilha_p90_brl"] = trilha_p90_brl
            except ValueError as e:
                print(f"  ⚠ merge fire_trilha falhou ({e}) — forçando rebuild")
                rebuild_reason_t = "legacy-misaligned"
                needs_rebuild_t = True

    last_period_t = data["dates"][n_hist - 1] if n_hist > 0 else ""
    write_with_meta(
        out_path, data, METODOLOGIA_VERSION_TRILHA, last_period_t,
        rebuild_reason=rebuild_reason_t,
    )
    print(f"  ✓ {out_path.relative_to(ROOT)} "
          f"({'rebuild' if needs_rebuild_t else 'append-merge'})")


# ─── N1: Drawdown History ──────────────────────────────────────────────────────

def gen_drawdown_history(rebuild: bool = False):
    """N1 — Série temporal de drawdown do portfolio + anotações de crises.

    Append-only: meses fechados são imutáveis. Mês corrente recalcula.
    Versão FIRE specialist: drawdown = (value - peak) / peak; peak monotônico
    sobre histórico fixo → fechados imutáveis (validado).
    """
    out_path = DADOS / "drawdown_history.json"
    rebuild_flag = rebuild or _REBUILD_FLAG
    existing, needs_rebuild = load_or_init(
        out_path, METODOLOGIA_VERSION_DD, rebuild_flag=rebuild_flag,
    )
    rebuild_reason_dd = None
    if needs_rebuild:
        rebuild_reason_dd = (
            "cli-flag" if rebuild_flag
            else "missing-or-version-mismatch"
        )
    retornos_path = DADOS / "retornos_mensais.json"
    historico_path = DADOS / "historico_carteira.csv"

    # Usar TWR (acumulado_pct) para drawdown — patrimônio bruto é distorcido por aportes
    # historico_carteira.csv cria picos artificiais com novos aportes, mascarando drawdown real
    dates = []
    pat_series = []

    if retornos_path.exists():
        rm = _load_json(retornos_path)
        dates = rm.get("dates", [])
        acum = rm.get("acumulado_pct", [])
        pat_series = [100 * (1 + a / 100) for a in acum]

    # Fallback: TWR via patrimonio_var (retorno % mensal) — mais preciso que patrimônio bruto
    # patrimônio bruto é distorcido por aportes que criam picos artificiais, mascarando drawdown real.
    # patrimonio_var é o retorno % do mês, que ao ser composto resulta em índice TWR correto.
    if not pat_series and historico_path.exists():
        import csv as _csv
        _twr_rows = []
        with open(historico_path, newline="", encoding="utf-8") as f:
            reader = _csv.DictReader(f)
            for row in reader:
                try:
                    dt = row["data"][:7]
                    pv_str = row.get("patrimonio_var", "").strip()
                    _twr_rows.append((dt, pv_str))
                except (KeyError, ValueError):
                    continue
        if _twr_rows:
            # Construir índice TWR: começa em 100, compõe patrimonio_var mensalmente
            twr_idx = 100.0
            for dt, pv_str in _twr_rows:
                dates.append(dt)
                pat_series.append(round(twr_idx, 6))
                if pv_str:
                    try:
                        twr_idx *= (1 + float(pv_str) / 100)
                    except ValueError:
                        pass  # mês sem retorno: mantém índice

    if not pat_series:
        print("  ⚠️  Sem dados para drawdown_history")
        return

    # Calcular drawdown
    max_running = pat_series[0]
    drawdowns = []
    for p in pat_series:
        max_running = max(max_running, p)
        dd = (p - max_running) / max_running * 100 if max_running > 0 else 0
        drawdowns.append(round(dd, 2))

    max_dd = min(drawdowns)

    # Anotações de crises — apenas períodos que existem nos dados
    date_set = set(dates)
    crises_candidatas = [
        {"nome": "Rate shock Fed", "inicio": "2022-01", "fim": "2022-10"},
        {"nome": "Tariffs Trump", "inicio": "2025-04", "fim": "2025-06"},
        {"nome": "Carry trade unwind", "inicio": "2025-09", "fim": "2025-11"},
    ]
    crises = []
    for c in crises_candidatas:
        # Verificar se período está nos dados
        if c["inicio"] not in date_set:
            continue
        # Encontrar drawdown máximo no período
        periodo_dd = []
        in_period = False
        for d, dd in zip(dates, drawdowns):
            if d == c["inicio"]:
                in_period = True
            if in_period:
                periodo_dd.append(dd)
            if d == c["fim"]:
                break
        dd_max = min(periodo_dd) if periodo_dd else None
        crises.append({
            "nome": c["nome"],
            "inicio": c["inicio"],
            "fim": c["fim"],
            "drawdown_max": round(dd_max, 1) if dd_max is not None else None,
        })

    # Append-only merge: meses fechados imutáveis.
    if not needs_rebuild:
        ex_dates = existing.get("dates", [])
        ex_dd = existing.get("drawdown_pct", [])
        if len(ex_dd) == len(ex_dates):
            try:
                merged_dates, merged_arrs, divergent = merge_append_parallel(
                    ex_dates, {"drawdown_pct": ex_dd},
                    dates, {"drawdown_pct": drawdowns},
                )
                if divergent:
                    print(f"  ⚠ drawdown_history: {len(divergent)} divergências em meses fechados (mantidas antigas)")
                dates = merged_dates
                drawdowns = merged_arrs["drawdown_pct"]
                max_dd = min(drawdowns) if drawdowns else 0.0
            except ValueError as e:
                print(f"  ⚠ merge falhou ({e}) — forçando rebuild")
                rebuild_reason_dd = "legacy-misaligned"
                needs_rebuild = True

    last_period_dd = dates[-1] if dates else ""
    data = {
        "_generated": NOW,
        "_window_id": _WINDOW_ID,
        "_source": "reconstruct_fire_data.py → historico_carteira.csv",
        "dates": dates,
        "drawdown_pct": drawdowns,
        "max_drawdown": round(max_dd, 2),
        "crises": crises,
    }
    write_with_meta(
        out_path, data, METODOLOGIA_VERSION_DD, last_period_dd,
        rebuild_reason=rebuild_reason_dd,
    )
    print(f"  ✓ {out_path.relative_to(ROOT)} "
          f"({'rebuild' if needs_rebuild else 'append-merge'})")


# ─── N3: Bond Pool Runway ──────────────────────────────────────────────────────

# Bond pool calculation now centralized in BondPoolEngine
# See scripts/bond_pool_engine.py for single source of truth
def gen_bond_pool_runway():
    """N3 — Projeção anual do bond pool até 2040 e runway pós-FIRE."""
    state = _load_json(DADOS / "dashboard_state.json")
    rf = state.get("rf", {})

    # Valores atuais do bond pool (TD IPCA+ estrutural)
    td2040 = rf.get("ipca2040", {})
    td2050 = {}  # operação 2026-04-10 pendente de liquidação — usar fallback

    # Valor atual
    pool_2040_atual = td2040.get("valor_brl", 20019)
    pool_2050_atual = td2050.get("valor_brl", 11661)  # valor da compra pendente

    # Taxas (IPCA+ real)
    taxa_2040 = td2040.get("taxa", 7.10) / 100   # 7.10% = IPCA + 7.10% real
    taxa_2050_real = 6.85 / 100                   # taxa operação pendente

    # Pre-FIRE accumulation via BondPoolEngine
    try:
        request = BondPoolRequest(
            pool_2040_inicial=pool_2040_atual,
            pool_2050_inicial=pool_2050_atual,
            taxa_2040=taxa_2040,
            taxa_2050=taxa_2050_real,
            aporte_ipca_mensal=10_000,
            ano_aporte_fim=2028,
            ano_atual=2026,
            ano_fire=2040,
        )
        pool_2040, pool_2050, pool_total = BondPoolEngine.calculate_pre_fire(request)
    except ValueError as e:
        print(f"  ⚠️ BondPoolEngine error: {e}")
        return

    # Alvo: 15% do patrimônio esperado em 2040
    pat_p50_2040 = state.get("fire", {}).get("pat_mediano_fire", 11_527_476)
    alvo_pool_brl_2040 = round(pat_p50_2040 * IPCA_LONGO_PCT, 0)

    # Runway pós-FIRE: simples depleção sem crescimento (v = v - custo_vida)
    pool_no_fire = pool_total[-1]  # valor no último ano = 2040
    custo_vida_anual = CUSTO_VIDA_BASE  # R$250k
    anos_cobertura = ANOS_COBERTURA_POS_FIRE

    anos_pos_fire = list(range(1, anos_cobertura + 1))
    pool_disponivel = []
    v = pool_no_fire
    gaps = []
    for ano_pf in anos_pos_fire:
        v = v - custo_vida_anual
        pool_disponivel.append(round(v, 0))
        if v < 0:
            gaps.append({"ano_pos_fire": ano_pf, "gap_brl": round(v, 0)})

    anos = list(range(2026, 2041))
    data = {
        "_generated": NOW,
        "_window_id": _WINDOW_ID,
        "_source": "reconstruct_fire_data.py (pre-FIRE via BondPoolEngine)",
        "anos_pre_fire": anos,
        "pool_td2040_brl": pool_2040,
        "pool_td2050_brl": pool_2050,
        "pool_total_brl": pool_total,
        "alvo_pool_pct": IPCA_LONGO_PCT,
        "alvo_pool_brl_2040": alvo_pool_brl_2040,
        "anos_cobertura_pos_fire": anos_pos_fire,
        "pool_disponivel_pos_fire": pool_disponivel,
        "custo_vida_anual": custo_vida_anual,
        "gap_anos": gaps,
        "taxas": {
            "td2040_real_pct": round(taxa_2040 * 100, 2),
            "td2050_real_pct": round(taxa_2050_real * 100, 2),
        },
        "nota": "td2050 baseado em operação pendente 2026-04-10 (liquidação 13/04). Atualizar após confirmação.",
    }
    _save(DADOS / "bond_pool_runway.json", data)


# ─── R2: SWR Percentis ────────────────────────────────────────────────────────

def gen_fire_swr_percentis():
    """R2 — SWR implícita nos percentis P10/P50/P90 na data FIRE (2040).

    Delegado para SWREngine.calculate_fire() — single source of truth.
    """
    state = _load_json(DADOS / "dashboard_state.json")
    fire = state.get("fire", {})

    custo_vida = CUSTO_VIDA_BASE  # R$250k

    # Percentis do patrimônio no FIRE (2040 = FIRE 53)
    p10 = fire.get("pat_p10_fire53", fire.get("pat_p10_fire", 6_834_909))
    p50 = fire.get("pat_mediano_fire53", fire.get("pat_mediano_fire", 11_527_476))
    p90 = fire.get("pat_p90_fire53", fire.get("pat_p90_fire", 18_916_227))

    # Use SWREngine.calculate_fire() for each percentile
    swr_results = {}
    for label, patrimonio_fire in [("p10", p10), ("p50", p50), ("p90", p90)]:
        if patrimonio_fire <= 0:
            swr_results[label] = None
        else:
            request = SWRRequest(
                patrimonio_atual=0,
                custo_vida_base=custo_vida,
                patrimonio_fire=patrimonio_fire,
                anos_para_fire=IDADE_CENARIO_BASE - IDADE_ATUAL,
            )
            result = SWREngine.calculate_fire(request)
            swr_results[label] = result.swr_fire

    data = {
        "_generated": NOW,
        "_window_id": _WINDOW_ID,
        "_source": "reconstruct_fire_data.py → SWREngine.calculate_fire()",
        "custo_vida_base": custo_vida,
        "patrimonio_p10_2040": p10,
        "patrimonio_p50_2040": p50,
        "patrimonio_p90_2040": p90,
        "swr_p10": swr_results["p10"],
        "swr_p50": swr_results["p50"],
        "swr_p90": swr_results["p90"],
        "swr_p10_pct": round(swr_results["p10"] * 100, 2) if swr_results["p10"] else None,
        "swr_p50_pct": round(swr_results["p50"] * 100, 2) if swr_results["p50"] else None,
        "swr_p90_pct": round(swr_results["p90"] * 100, 2) if swr_results["p90"] else None,
        "mc_date": fire.get("mc_date", ""),
    }
    _save(DADOS / "fire_swr_percentis.json", data)


# ─── MC Helper ────────────────────────────────────────────────────────────────

def _rodar_mc_customizado(premissas_override: dict, n_sim: int = 5_000) -> float:
    """Roda MC com override de premissas e retorna P(FIRE 2040) base."""
    p = dict(PREMISSAS)
    p.update(premissas_override)
    r = rodar_monte_carlo(p, n_sim=n_sim, cenario="base", seed=42)
    return round(r["p_sucesso"], 4)


def _rodar_mc_anos_acum(premissas_override: dict, anos_acum: int, n_sim: int = 5_000) -> float:
    """Roda MC com número de anos de acumulação customizado."""
    p = dict(PREMISSAS)
    p.update(premissas_override)
    # Ajustar idade de acumulação: setar idade_fire_alvo = idade_atual + anos_acum
    p["idade_fire_alvo"] = p["idade_atual"] + anos_acum
    r = rodar_monte_carlo(p, n_sim=n_sim, cenario="base", seed=42)
    return round(r["p_sucesso"], 4)


# ─── R3: Aporte Sensitivity ──────────────────────────────────────────────────

def gen_fire_aporte_sensitivity(n_sim: int = 5_000):
    """R3 — Tabela aporte → P(FIRE 2040) via MC real."""
    from config import MACRO_REGRAS as _  # noqa: verificar import
    aportes = [15_000, 20_000, 25_000, 30_000, 33_000, 35_000, 40_000]
    anos_acum = IDADE_CENARIO_BASE - IDADE_ATUAL  # 14 anos para FIRE 2040 (53 - 39)

    print(f"    R3: rodando MC para {len(aportes)} aportes ({n_sim} sims cada)...")
    pfire_list = []
    for aporte in aportes:
        p = _rodar_mc_customizado({"aporte_mensal": aporte}, n_sim=n_sim)
        pfire_list.append(p)
        print(f"      aporte R${aporte:,}/mês → P(FIRE)={p:.1%}")

    data = {
        "_generated": NOW,
        "_window_id": _WINDOW_ID,
        "_source": "reconstruct_fire_data.py → fire_montecarlo.py",
        "aportes_brl": aportes,
        "pfire_2040": pfire_list,
        "aporte_base": APORTE_MENSAL,
        "n_sim": n_sim,
    }
    _save(DADOS / "fire_aporte_sensitivity.json", data)


# ─── R1: Fire Matrix ──────────────────────────────────────────────────────────

def gen_fire_matrix(n_sim: int = 3_000):
    """R1 — Matriz Patrimônio × Gasto → P(sucesso 30 anos) por cenário base/fav/stress.

    Eixos (spec DEV-fire-matrix-v2):
      - Linhas (patrimônios): R$7M, 9M, 11M, 12M, 13M, 14M, 16M
      - Colunas (gastos anuais): R$180k, 220k, 250k, 270k, 300k, 350k
    Cenários: base (4.85%), fav (+1pp = 5.85%), stress (-0.5pp = 4.35%)
    """
    from fire_montecarlo import simular_trajetoria, PREMISSAS as _PREM

    patrimonios = [7_000_000, 9_000_000, 11_000_000, 12_000_000,
                   13_000_000, 14_000_000, 16_000_000]
    gastos = [180_000, 220_000, 250_000, 270_000, 300_000, 350_000]
    # Horizonte universal: HORIZONTE_VIDA - IDADE_CENARIO_BASE (90 - 53 = 37a)
    # A matriz não tem eixo de idade; usar FIRE base como referência conservadora
    n_anos_desacum = HORIZONTE_VIDA - IDADE_CENARIO_BASE

    cenarios = {
        "base":   _PREM["retorno_equity_base"],
        "fav":    _PREM["retorno_equity_base"] + _PREM["adj_favoravel"],
        "stress": _PREM["retorno_equity_base"] + _PREM["adj_stress"],
    }

    print(f"    R1: rodando matriz {len(patrimonios)}×{len(gastos)} × 3 cenários ({n_sim} sims cada)...")

    resultado_cenarios = {}
    for cenario_nome, retorno_equity in cenarios.items():
        matrix = {}
        rng = np.random.default_rng(42)
        for pat in patrimonios:
            for gasto in gastos:
                key = f"{pat}_{gasto}"
                sucessos = 0
                for _ in range(n_sim):
                    sobreviveu, _, _, _ = simular_trajetoria(
                        patrimonio_inicial=pat,
                        n_anos=n_anos_desacum,
                        retorno_equity=retorno_equity,
                        volatilidade=_PREM["volatilidade_equity"],
                        df=_PREM["t_dist_df"],
                        rng=rng,
                        escala_custo_vida=gasto / CUSTO_VIDA_BASE,
                        aplicar_ir=_PREM["aplicar_ir_desacumulacao"],
                        anos_bond_pool=_PREM["anos_bond_pool"],
                        ipca_anual=_PREM["ipca_anual"],
                        aliquota_ir=_PREM["aliquota_ir_equity"],
                        inss_anual=_PREM["inss_anual"],
                        inss_inicio_ano=_PREM["inss_inicio_ano"],
                        vol_bond_pool=_PREM["vol_bond_pool"],
                        strategy="guardrails",
                    )
                    if sobreviveu:
                        sucessos += 1
                matrix[key] = round(sucessos / n_sim, 4)
        resultado_cenarios[cenario_nome] = matrix
        print(f"      cenário {cenario_nome} (r={retorno_equity:.2%}) ✓")

    # Preservar seções geradas por outros scripts (by_profile, perfis, etc.)
    existing_fm = {}
    try:
        with open(DADOS / "fire_matrix.json") as f:
            existing_fm = json.load(f)
    except Exception:
        pass

    data = {
        "_generated": NOW,
        "_window_id": _WINDOW_ID,
        "_source": "reconstruct_fire_data.py → fire_montecarlo.simular_trajetoria",
        "_spec": "DEV-fire-matrix-v2: eixos Patrimônio×Gasto, 3 cenários",
        "patrimonios": patrimonios,
        "gastos": gastos,
        "n_anos_desacumulacao": n_anos_desacum,
        "n_sim": n_sim,
        "retornos_equity": {k: v for k, v in cenarios.items()},
        "cenarios": resultado_cenarios,
        # legado — manter para compatibilidade com buildFireMatrix() atual até migração
        "swrs": [0.020, 0.022, 0.024, 0.026, 0.028, 0.030],
        "matrix": resultado_cenarios["base"],  # fallback: base
    }
    # Preservar campos externos (by_profile, perfis — gerados por fire_montecarlo.py --by_profile)
    for _key in ("by_profile", "perfis", "_by_profile_generated", "_by_profile_n_sim"):
        if _key in existing_fm:
            data[_key] = existing_fm[_key]
    _save(DADOS / "fire_matrix.json", data)


# ─── N4: Lumpy Events ─────────────────────────────────────────────────────────

def gen_lumpy_events(n_sim: int = 5_000):
    """N4 — Cenários de eventos de vida com impacto em P(FIRE 2040)."""
    print(f"    N4: rodando MC para 3 cenários de eventos ({n_sim} sims cada)...")

    # P(FIRE) base
    p_base = _rodar_mc_customizado({}, n_sim=n_sim)
    print(f"      base P(FIRE)={p_base:.1%} spending=R${CUSTO_VIDA_BASE:,}")

    # Cenários: modelar como spending override
    # O MC usa custo_vida_base como escala para spending smile
    # Casamento 2027: spending R$270k permanente
    p_casamento = _rodar_mc_customizado({"custo_vida_base": 270_000}, n_sim=n_sim)
    print(f"      casamento P(FIRE)={p_casamento:.1%} spending=R$270k")

    # Filho+escola 2030: spending R$300k permanente
    p_filho = _rodar_mc_customizado({"custo_vida_base": 300_000}, n_sim=n_sim)
    print(f"      filho+escola P(FIRE)={p_filho:.1%} spending=R$300k")

    # Combinado: ambos (spending R$300k = pior caso)
    p_combinado = p_filho  # mesmo spending máximo
    print(f"      combinado P(FIRE)={p_combinado:.1%} spending=R$300k")

    def pat_nec(gasto, swr=0.024):
        return round(gasto / swr, 0)

    data = {
        "_generated": NOW,
        "_window_id": _WINDOW_ID,
        "_source": "reconstruct_fire_data.py → fire_montecarlo.py",
        "base": {
            "pfire_2040": p_base,
            "spending_brl": CUSTO_VIDA_BASE,
        },
        "eventos": [
            {
                "id": "casamento",
                "label": "Casamento (2027)",
                "spending_novo": 270_000,
                "ano_inicio": 2027,
                "confirmado": True,
                "pfire_2040": p_casamento,
                "delta_pp": round((p_casamento - p_base) * 100, 1),
                "patrimonio_necessario": pat_nec(270_000),
            },
            {
                "id": "filho_escola",
                "label": "Filho + escola (2030)",
                "spending_novo": 300_000,
                "ano_inicio": 2030,
                "confirmado": False,
                "pfire_2040": p_filho,
                "delta_pp": round((p_filho - p_base) * 100, 1),
                "patrimonio_necessario": pat_nec(300_000),
            },
            {
                "id": "combinado",
                "label": "Casamento + filho (2027-2030)",
                "spending_novo": 300_000,
                "ano_inicio": 2030,
                "confirmado": False,
                "pfire_2040": p_combinado,
                "delta_pp": round((p_combinado - p_base) * 100, 1),
                "patrimonio_necessario": pat_nec(300_000),
            },
        ],
        "n_sim": n_sim,
        "nota": "Casamento e filho modelados como spending permanente override. Impacto de timing (2027 vs 2030) não capturado — conservador (pior caso).",
    }
    _save(DADOS / "lumpy_events.json", data)


# ─── MAIN ─────────────────────────────────────────────────────────────────────

GENERATORS = {
    "etf_composition": gen_etf_composition,
    "fire_swr_percentis": gen_fire_swr_percentis,
    "fire_trilha": gen_fire_trilha,
    "drawdown_history": gen_drawdown_history,
    "bond_pool_runway": gen_bond_pool_runway,
    "fire_aporte_sensitivity": gen_fire_aporte_sensitivity,
    "lumpy_events": gen_lumpy_events,
    "fire_matrix": gen_fire_matrix,
}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gera JSONs core para dashboard (Stage 1)")
    parser.add_argument("--only", type=str, help=f"Gerar só um JSON. Opções: {list(GENERATORS)}")
    parser.add_argument("--n-sim", type=int, default=5_000, help="Número de simulações MC (default: 5k)")
    parser.add_argument("--window-id", default=None, help="Pipeline run window ID for synchronization")
    parser.add_argument("--rebuild", action="store_true",
                        help="Força regeneração dos artefatos append-only (drawdown, trilha) mesmo com versão igual.")
    args = parser.parse_args()
    if args.window_id:
        _WINDOW_ID = args.window_id
    if args.rebuild:
        _REBUILD_FLAG = True

    if args.only:
        if args.only not in GENERATORS:
            print(f"Erro: '{args.only}' não encontrado. Opções: {list(GENERATORS)}")
            sys.exit(1)
        fn = GENERATORS[args.only]
        import inspect
        sig = inspect.signature(fn)
        if "n_sim" in sig.parameters:
            fn(n_sim=args.n_sim)
        else:
            fn()
    else:
        print("\n=== reconstruct_fire_data.py — Stage 1 JSONs ===\n")
        # Ordem: simples → complexo
        print("N2 ETF Composition...")
        gen_etf_composition()

        print("R2 Fire SWR Percentis...")
        gen_fire_swr_percentis()

        print("R5 Fire Trilha...")
        gen_fire_trilha()

        print("N1 Drawdown History...")
        gen_drawdown_history()

        print("N3 Bond Pool Runway...")
        gen_bond_pool_runway()

        print(f"R3 Aporte Sensitivity ({args.n_sim} sims)...")
        gen_fire_aporte_sensitivity(n_sim=args.n_sim)

        print(f"N4 Lumpy Events ({args.n_sim} sims)...")
        gen_lumpy_events(n_sim=args.n_sim)

        print(f"R1 Fire Matrix ({args.n_sim} sims — mais lento)...")
        gen_fire_matrix(n_sim=args.n_sim)

        print("\n=== Stage 1 completo ===\n")
