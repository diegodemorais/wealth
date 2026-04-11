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
from config import (
    APORTE_MENSAL, CUSTO_VIDA_BASE, PATRIMONIO_GATILHO,
    IDADE_ATUAL, IDADE_FIRE_ALVO,
    IPCA_LONGO_PCT, IPCA_CURTO_PCT, EQUITY_PCT, CRIPTO_PCT,
    ETF_COMPOSITION, MACRO_REGRAS,
)
from fire_montecarlo import (
    PREMISSAS, rodar_monte_carlo, projetar_acumulacao,
    _retorno_equity_cenario,
)

NOW = datetime.now().isoformat(timespec="seconds")
DADOS = ROOT / "dados"


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
        "_source": "config.py ETF_COMPOSITION",
        "etfs": ETF_COMPOSITION,
    }
    _save(DADOS / "etf_composition.json", data)


# ─── R5: Trilha Patrimonial ────────────────────────────────────────────────────

def gen_fire_trilha():
    """R5 — Trilha patrimonial esperada vs realizado por ano."""
    csv_path = DADOS / "historico_carteira.csv"
    if not csv_path.exists():
        print("  ⚠️  historico_carteira.csv não encontrado — skipping fire_trilha")
        return

    import csv as _csv

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
    trilha = []
    for i, row in enumerate(rows):
        # Trilha composta: pat0 × (1+r)^i + aportes acumulados
        crescimento = pat0 * (1 + retorno_mensal) ** i
        aportes_acum = aporte_mensal * ((1 + retorno_mensal) ** i - 1) / retorno_mensal if retorno_mensal > 0 else aporte_mensal * i
        trilha.append(round(crescimento + aportes_acum, 0))

    # Status: ahead/behind/on_track
    status = []
    for real, esp in zip([r["patrimonio"] for r in rows], trilha):
        if real > esp * 1.05:
            status.append("ahead")
        elif real < esp * 0.95:
            status.append("behind")
        else:
            status.append("on_track")

    # Meta FIRE: R$13.4M em 2040-01
    meta_fire_brl = PATRIMONIO_GATILHO
    meta_fire_date = "2040-01"

    data = {
        "_generated": NOW,
        "_source": "reconstruct_fire_data.py",
        "dates": [r["date"] for r in rows],
        "trilha_brl": trilha,
        "realizado_brl": [round(r["patrimonio"], 0) for r in rows],
        "status": status,
        "meta_fire_brl": meta_fire_brl,
        "meta_fire_date": meta_fire_date,
        "retorno_anual_premissa": retorno_anual,
        "aporte_mensal_premissa": aporte_mensal,
    }
    _save(DADOS / "fire_trilha.json", data)


# ─── N1: Drawdown History ──────────────────────────────────────────────────────

def gen_drawdown_history():
    """N1 — Série temporal de drawdown do portfolio + anotações de crises."""
    retornos_path = DADOS / "retornos_mensais.json"
    historico_path = DADOS / "historico_carteira.csv"

    # Preferir patrimônio real para drawdown (mais preciso)
    dates = []
    pat_series = []

    if historico_path.exists():
        import csv as _csv
        with open(historico_path, newline="", encoding="utf-8") as f:
            reader = _csv.DictReader(f)
            for row in reader:
                try:
                    dates.append(row["data"][:7])
                    pat_series.append(float(row["patrimonio_brl"]))
                except (KeyError, ValueError):
                    continue

    # Fallback: usar acumulado_pct de retornos_mensais.json
    if not pat_series and retornos_path.exists():
        rm = _load_json(retornos_path)
        dates = rm.get("dates", [])
        acum = rm.get("acumulado_pct", [])
        # Converter acumulado % em série de "patrimônio normalizado" (base 100)
        pat_series = [100 * (1 + a / 100) for a in acum]

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

    data = {
        "_generated": NOW,
        "_source": "reconstruct_fire_data.py → historico_carteira.csv",
        "dates": dates,
        "drawdown_pct": drawdowns,
        "max_drawdown": round(max_dd, 2),
        "crises": crises,
    }
    _save(DADOS / "drawdown_history.json", data)


# ─── N3: Bond Pool Runway ──────────────────────────────────────────────────────

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

    # Aporte mensal para IPCA+ (quando taxa >= piso 6.0%)
    # Cascade: 15% do portfolio em IPCA+, DCA ativo até fechar o gap
    # Estimativa conservadora: R$10k/mês médio para IPCA+ até fechar gap de ~12%
    aporte_ipca_mensal = 10_000   # R$/mês — estimativa conservadora
    aporte_ipca_anual = aporte_ipca_mensal * 12

    # Anos de projeção
    ano_atual = 2026
    ano_fire = 2040
    anos = list(range(ano_atual, ano_fire + 1))
    n_anos = len(anos)

    # Projeção: valor cresce com taxa real + aportes
    pool_2040 = []
    pool_2050 = []
    v40 = pool_2040_atual
    v50 = pool_2050_atual

    for i, ano in enumerate(anos):
        pool_2040.append(round(v40, 0))
        pool_2050.append(round(v50, 0))
        # Crescimento + aporte (aporte para de fechar o gap, estimado 2028)
        # Assumir aportes ativos até 2028, depois só crescimento (gap fechado)
        aporte_este_ano = aporte_ipca_anual if ano <= 2028 else 0
        v40 = v40 * (1 + taxa_2040) + aporte_este_ano * 0.8   # 80% para 2040
        v50 = v50 * (1 + taxa_2050_real) + aporte_este_ano * 0.2  # 20% para 2050

    pool_total = [round(a + b, 0) for a, b in zip(pool_2040, pool_2050)]

    # Alvo: 15% do patrimônio esperado em 2040
    # Patrimônio esperado 2040 ≈ P50 do MC = R$11.5M
    pat_p50_2040 = state.get("fire", {}).get("pat_mediano_fire", 11_527_476)
    alvo_pool_brl_2040 = round(pat_p50_2040 * IPCA_LONGO_PCT, 0)

    # Runway pós-FIRE: bond pool no FIRE Day / custo_vida_anual
    pool_no_fire = pool_total[-1]  # valor no último ano = 2040
    custo_vida_anual = CUSTO_VIDA_BASE  # R$250k
    anos_cobertura = 10  # projetar 10 anos pós-FIRE

    anos_pos_fire = list(range(1, anos_cobertura + 1))
    # Bond pool disponível em cada ano pós-FIRE (consumindo custo_vida)
    pool_disponivel = []
    v = pool_no_fire
    gaps = []
    for ano_pf in anos_pos_fire:
        v = v - custo_vida_anual
        pool_disponivel.append(round(v, 0))
        if v < 0:
            gaps.append({"ano_pos_fire": ano_pf, "gap_brl": round(v, 0)})

    data = {
        "_generated": NOW,
        "_source": "reconstruct_fire_data.py",
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
    """R2 — SWR implícita nos percentis P10/P50/P90 na data FIRE (2040)."""
    state = _load_json(DADOS / "dashboard_state.json")
    fire = state.get("fire", {})

    custo_vida = CUSTO_VIDA_BASE  # R$250k

    # Percentis do patrimônio no FIRE (2040 = FIRE 53)
    p10 = fire.get("pat_p10_fire53", fire.get("pat_p10_fire", 6_834_909))
    p50 = fire.get("pat_mediano_fire53", fire.get("pat_mediano_fire", 11_527_476))
    p90 = fire.get("pat_p90_fire53", fire.get("pat_p90_fire", 18_916_227))

    swr_p10 = round(custo_vida / p10, 4) if p10 > 0 else None
    swr_p50 = round(custo_vida / p50, 4) if p50 > 0 else None
    swr_p90 = round(custo_vida / p90, 4) if p90 > 0 else None

    data = {
        "_generated": NOW,
        "_source": "reconstruct_fire_data.py → dashboard_state.json fire section",
        "custo_vida_base": custo_vida,
        "patrimonio_p10_2040": p10,
        "patrimonio_p50_2040": p50,
        "patrimonio_p90_2040": p90,
        "swr_p10": swr_p10,
        "swr_p50": swr_p50,
        "swr_p90": swr_p90,
        "swr_p10_pct": round(swr_p10 * 100, 2) if swr_p10 else None,
        "swr_p50_pct": round(swr_p50 * 100, 2) if swr_p50 else None,
        "swr_p90_pct": round(swr_p90 * 100, 2) if swr_p90 else None,
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
    aportes = [15_000, 20_000, 25_000, 30_000, 35_000, 40_000]
    anos_acum = IDADE_FIRE_ALVO - IDADE_ATUAL  # 14 anos para FIRE 2040

    print(f"    R3: rodando MC para {len(aportes)} aportes ({n_sim} sims cada)...")
    pfire_list = []
    for aporte in aportes:
        p = _rodar_mc_customizado({"aporte_mensal": aporte}, n_sim=n_sim)
        pfire_list.append(p)
        print(f"      aporte R${aporte:,}/mês → P(FIRE)={p:.1%}")

    data = {
        "_generated": NOW,
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
    n_anos_desacum = 30

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

    data = {
        "_generated": NOW,
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
    args = parser.parse_args()

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
