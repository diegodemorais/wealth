#!/usr/bin/env python3
"""
fire_montecarlo.py — P(FIRE) reproduzível
Monte Carlo 10k trajetórias com spending smile, bond tent, guardrails aprovados.

Uso:
    python3 fire_montecarlo.py
    python3 fire_montecarlo.py --patrimonio 3550000 --aporte 25000 --anos 11
    python3 fire_montecarlo.py --tornado        # gera tornado chart de sensibilidade

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import argparse
from dataclasses import dataclass, field
import json as _json
import os
import numpy as np
import warnings
warnings.filterwarnings("ignore")

import sys as _sys
from pathlib import Path as _Path
_sys.path.insert(0, str(_Path(__file__).parent))
from config import (
    TICKER_SWRD_LSE, TICKER_VWRA_LSE, COLUMN_CLOSE, DATE_FORMAT_YM,
    APORTE_MENSAL, CUSTO_VIDA_BASE,
    IDADE_ATUAL, IDADE_CENARIO_BASE, IDADE_CENARIO_ASPIRACIONAL,
    IPCA_LONGO_PCT, IPCA_CURTO_PCT, EQUITY_PCT, CRIPTO_PCT,
    IR_ALIQUOTA, PATRIMONIO_GATILHO, SWR_GATILHO, SWR_FALLBACK,
    APORTE_CENARIO_BASE, APORTE_CENARIO_ASPIRACIONAL,
    HORIZONTE_VIDA,
    RETORNO_EQUITY_BASE, RETORNO_IPCA_PLUS, VOLATILIDADE_EQUITY,
    DEP_BRL_BASE, DEP_BRL_FAVORAVEL, DEP_BRL_STRESS,
    ADJ_FAVORAVEL, ADJ_STRESS, IPCA_ANUAL,
    INSS_ANUAL, INSS_INICIO_ANO_POS_FIRE,
    BOND_TENT_META_ANOS, FIRE_P_THRESHOLD,
    IPCA_LONGO_ATUAL_BRL, BOND_POOL_ISOLATION_THRESHOLD,
    SPENDING_SMILE_GO_GO, SPENDING_SMILE_SLOW_GO, SPENDING_SMILE_NO_GO,
    GUARDRAILS_BANDA1_MIN, GUARDRAILS_BANDA2_MIN, GUARDRAILS_BANDA3_MIN,
    GUARDRAILS_CORTE1_PCT, GUARDRAILS_CORTE2_PCT, GUARDRAILS_PISO_PCT,
    GASTO_PISO, PISO_LIFESTYLE_FRACTION, MIN_QUALITY_FRAC, MIN_QUALITY_GOGOWINDOW, SAUDE_BASE,
    SAUDE_INFLATOR, SAUDE_DECAY,
    CUSTO_VIDA_BASE_CASADO, CUSTO_VIDA_BASE_FILHO,
    update_dashboard_state,
)
from guardrail_engine import GuardrailEngine, GuardrailRequest
from withdrawal_engine import WithdrawalEngine, WithdrawalRequest, WithdrawalCtx
from pfire_transformer import canonicalize_pfire

_SCRIPTS_DIR = _Path(__file__).parent
_DADOS_DIR   = _SCRIPTS_DIR.parent / "dados"

def _load_patrimonio_atual() -> float:
    """Lê patrimônio financeiro total de dashboard_state.json ou portfolio_summary.json.
    Fallback para valor hardcoded se nenhum arquivo acessível."""
    # 1. dashboard_state — atualizado por generate_data.py
    try:
        with open(_DADOS_DIR / "dashboard_state.json") as f:
            ds = _json.load(f)
        val = ds.get("patrimonio", {}).get("total_brl")
        if val and val > 0:
            return float(val)
    except Exception:
        pass
    # 2. portfolio_summary — atualizado por ibkr_analysis.py
    try:
        with open(_DADOS_DIR / "portfolio_summary.json") as f:
            ps = _json.load(f)
        val = ps.get("patrimonio", {}).get("fim_brl")
        if val and val > 0:
            return float(val)
    except Exception:
        pass
    # 3. fallback hardcoded (desatualizado — atualizar ao rodar sessão)
    return 3_372_673.0

# ─── BOND POOL ISOLATION — definida antes de PREMISSAS (usada no módulo-level) ──

def compute_bond_pool_status(patrimonio_atual: float, ipca_longo_pct: float,
                               ipca_longo_atual_brl: float,
                               threshold_pct: float) -> dict:
    """Status do bond pool para determinar se isolation está habilitada."""
    target_brl = ipca_longo_pct * patrimonio_atual
    threshold_brl = threshold_pct * target_brl
    completion_pct = (ipca_longo_atual_brl / target_brl * 100) if target_brl > 0 else 0.0
    completion_fraction = min(1.0, ipca_longo_atual_brl / target_brl) if target_brl > 0 else 0.0
    enabled = completion_fraction > 0          # partial isolation active whenever any position exists
    fully_enabled = ipca_longo_atual_brl >= threshold_brl
    return {
        "enabled": enabled,
        "fully_enabled": fully_enabled,
        "completion_pct": round(completion_pct, 1),
        "completion_fraction": round(completion_fraction, 4),
        "ipca_longo_atual_brl": round(ipca_longo_atual_brl, 0),
        "target_brl": round(target_brl, 0),
        "threshold_pct": round(threshold_pct * 100, 1),
        "threshold_brl": round(threshold_brl, 0),
        "underestimation_warning": not fully_enabled,
    }


# ─── PREMISSAS (fonte: carteira.md via parse_carteira.py → config.py) ────────

# Limiar de P(FIRE) para calcular fire_age_threshold por perfil
# FIRE_P_THRESHOLD importado de config.py (lê de carteira_params.json)
FIRE_AGES_SCAN = list(range(49, 61))  # range metodológico do scan

PREMISSAS = {
    # Patrimônio e aportes — lido de dashboard_state.json, nunca hardcoded
    "patrimonio_atual":    _load_patrimonio_atual(),
    "aporte_mensal":       APORTE_MENSAL,
    "custo_vida_base":     CUSTO_VIDA_BASE,

    # Horizonte — Cenário Base (padrão)
    "horizonte_vida":      HORIZONTE_VIDA,
    "idade_atual":         IDADE_ATUAL,
    "idade_cenario_base":  IDADE_CENARIO_BASE,
    "idade_cenario_aspiracional": IDADE_CENARIO_ASPIRACIONAL,
    "idade_fire_alvo":     IDADE_CENARIO_BASE,
    "idade_safe_harbor":   IDADE_CENARIO_BASE,
    "anos_simulacao":      HORIZONTE_VIDA - IDADE_CENARIO_BASE,

    # Retornos reais anuais em BRL (fonte: carteira.md → config.py)
    "retorno_equity_base": RETORNO_EQUITY_BASE,
    "retorno_ipca_plus":   RETORNO_IPCA_PLUS,
    "volatilidade_equity": VOLATILIDADE_EQUITY,
    "t_dist_df":           5,           # parâmetro estatístico do modelo (t-student df=5)

    # Depreciação BRL por cenário (fonte: carteira.md → config.py)
    "dep_brl_base":        DEP_BRL_BASE,
    "dep_brl_favoravel":   DEP_BRL_FAVORAVEL,
    "dep_brl_stress":      DEP_BRL_STRESS,

    # Ajuste de retorno por cenário (fonte: carteira.md → config.py)
    "adj_favoravel":       ADJ_FAVORAVEL,
    "adj_stress":          ADJ_STRESS,

    # Bond tent
    "pct_ipca_longo":      IPCA_LONGO_PCT,
    "pct_ipca_curto":      IPCA_CURTO_PCT,
    "pct_equity":          EQUITY_PCT,
    "pct_cripto":          CRIPTO_PCT,

    # IPCA estimado (fonte: carteira.md → config.py)
    "ipca_anual":          IPCA_ANUAL,

    # IR na desacumulação (FR-ir-desacumulacao)
    "aplicar_ir_desacumulacao": True,
    "anos_bond_pool":           BOND_TENT_META_ANOS,
    "aliquota_ir_equity":       IR_ALIQUOTA,

    # INSS (fonte: carteira.md → config.py)
    "inss_anual":               INSS_ANUAL,
    "inss_inicio_ano":          INSS_INICIO_ANO_POS_FIRE,

    # Volatilidade por fase — derivada em runtime (não hardcoded)
    # vol_bond_pool = pct_equity × vol_equity = 0.79 × 0.168 = 13.3%
    "vol_bond_pool":            EQUITY_PCT * VOLATILIDADE_EQUITY,

    # Bond pool isolation (FR-mc-bond-pool-isolation 2026-04-29)
    "ipca_longo_atual_brl":              IPCA_LONGO_ATUAL_BRL,
    "bond_pool_isolation_threshold":     BOND_POOL_ISOLATION_THRESHOLD,

    # Gatilho FIRE (fonte: carteira.md → config.py)
    "patrimonio_gatilho":  PATRIMONIO_GATILHO,
    "swr_gatilho":         SWR_GATILHO,
}

# Computar bond pool isolation status (após PREMISSAS dict)
_bp_status = compute_bond_pool_status(
    PREMISSAS["patrimonio_atual"],
    PREMISSAS["pct_ipca_longo"],
    PREMISSAS["ipca_longo_atual_brl"],
    PREMISSAS["bond_pool_isolation_threshold"],
)
PREMISSAS["bond_pool_isolation"] = _bp_status["enabled"]
PREMISSAS["bond_pool_status"] = _bp_status
PREMISSAS["bond_pool_completion_fraction"] = _bp_status["completion_fraction"]

# ─── PERFIS FIRE (fonte: carteira.md + FR-spending-modelo-familia 2026-04-06) ──
# Cada perfil tem spending anual diferente; MC roda para cada um em 2 idades-alvo.

PERFIS_FIRE = {
    "atual": {
        "label": "Atual (Solteiro)",
        "gasto_anual": 250_000,
        "descricao": "Diego solo, custo de vida base",
    },
    "casado": {
        "label": "Casado",
        "gasto_anual": 270_000,
        "descricao": "Diego + parceira, custos compartilhados, saúde 2p",
    },
    "filho": {
        "label": "Casado + Filho",
        "gasto_anual": 300_000,
        "descricao": "Diego + parceira + criança(s), educação e saúde expandidas",
    },
}

# Idades-alvo para P(FIRE): aspiracional (50) e base (53)
FIRE_AGES = {
    "p_fire_50": 50,
    "p_fire_53": 53,
}

# ─── SPENDING SMILE (fonte: FR-spending-smile 2026-03-27) ─────────────────────

SPENDING_SMILE = {
    # Fase: gasto LIFESTYLE EX-SAÚDE (saúde é somada separadamente via gasto_spending_smile)
    # Fonte: FR-spending-smile (2026-03-27) — corrigido HD-mc-audit (2026-04-06)
    # Valores originais (R$280k/225k/285k) embutiam saúde R$37.9k (modelo antigo) — double-count
    # Corretos: lifestyle-only conforme tabela de breakdown da issue. Lidos de carteira.md.
    "go_go":   {"gasto": SPENDING_SMILE_GO_GO,   "inicio": 0,  "fim": 15},   # anos 0–14 pós-FIRE
    "slow_go": {"gasto": SPENDING_SMILE_SLOW_GO, "inicio": 15, "fim": 30},   # anos 15–29
    "no_go":   {"gasto": SPENDING_SMILE_NO_GO,   "inicio": 30, "fim": 99},   # anos 30+ (saúde domina)
}

# SAUDE_BASE, SAUDE_INFLATOR, SAUDE_DECAY importados de config (fonte: carteira.md → carteira_params.json)
# FR-saude-modelo-custo 2026-04-29: VCMH 5%→3.5%, SAUDE_DECAY 50%→15%
SAUDE_INFLATOR_CAP = 0.060    # 6.0% cap conservador (fixo — não é decisão financeira)
IDADE_FIRE_SAUDE   = 53       # idade no FIRE Day (faixa ANS 49-53 = 3.0×)

# ─── GUARDRAILS (fonte: carteira.md, aprovados 2026-03-20) ────────────────────

GUARDRAILS = [
    # (drawdown_min, drawdown_max, corte_pct, descricao)
    # Fonte: carteira.md §Guardrails aprovados 2026-03-20 (lidos via config.py)
    (0.00,                GUARDRAILS_BANDA1_MIN, 0.00,                "Normal — sem corte"),
    (GUARDRAILS_BANDA1_MIN, GUARDRAILS_BANDA2_MIN, GUARDRAILS_CORTE1_PCT, f"Corte {GUARDRAILS_CORTE1_PCT*100:.0f}%"),
    (GUARDRAILS_BANDA2_MIN, GUARDRAILS_BANDA3_MIN, GUARDRAILS_CORTE2_PCT, f"Corte {GUARDRAILS_CORTE2_PCT*100:.0f}%"),
    (GUARDRAILS_BANDA3_MIN, 1.00,               GUARDRAILS_PISO_PCT,  "Piso"),
]
# GASTO_PISO importado de config (fonte: carteira.md §Guardrails aprovados 2026-03-20)

# ─── WITHDRAWAL STRATEGIES (fonte: FR-withdrawal-engine 2026-04-07) ──────────
# Cada strategy é uma função que recebe (gasto_smile, pat, pat_pico, ano, ctx)
# e retorna o gasto efetivo do ano.

STRATEGIES = ["guardrails", "constant", "pct_portfolio", "vpw", "guyton_klinger", "gk_hybrid"]

# SWR_FALLBACK imported from config.py (centralized constant)
# WithdrawalCtx and strategy constants are now in withdrawal_engine.py


# All 6 withdrawal strategies are now consolidated in WithdrawalEngine
# Use WithdrawalEngine.calculate() to route to appropriate strategy


# ─── CÁLCULOS ─────────────────────────────────────────────────────────────────

def ans_faixa_multiplier(ano_pos_fire: int) -> float:
    """Multiplicador de custo de saúde relativo ao FIRE Day (idade 53, ANS faixa 49-53 = 3.0×).
    Saltos discretos conforme RN 63/2003 da ANS.
    """
    idade = IDADE_FIRE_SAUDE + ano_pos_fire
    if idade >= 64: return 6.0 / 3.0   # 2.00× do FIRE Day
    if idade >= 59: return 5.0 / 3.0   # 1.67×
    if idade >= 54: return 4.0 / 3.0   # 1.33×
    return 1.0                          # 49-53 — faixa do FIRE Day


def gasto_spending_smile_split(ano_pos_fire: int, ipca_acumulado: float,
                                escala_custo_vida: float = 1.0) -> tuple[float, float]:
    """Returns (gasto_lifestyle, gasto_saude) — elastic vs. inelastic spending.

    gasto_lifestyle: spending smile (cortável por guardrails)
    gasto_saude: saúde (inelástica, protegida — nunca cortada por guardrails)
    FR-guardrails-categoria-elasticidade 2026-04-28.
    """
    for fase, cfg in SPENDING_SMILE.items():
        if cfg["inicio"] <= ano_pos_fire < cfg["fim"]:
            gasto_lifestyle = cfg["gasto"] * escala_custo_vida
            break
    else:
        gasto_lifestyle = SPENDING_SMILE["no_go"]["gasto"] * escala_custo_vida

    taxa_efetiva = min(SAUDE_INFLATOR, SAUDE_INFLATOR_CAP)
    saude_vcmh = SAUDE_BASE * (1 + taxa_efetiva) ** ano_pos_fire
    gasto_saude = saude_vcmh * ans_faixa_multiplier(ano_pos_fire)
    if ano_pos_fire >= SPENDING_SMILE["no_go"]["inicio"]:
        gasto_saude *= SAUDE_DECAY

    return gasto_lifestyle, gasto_saude


def gasto_spending_smile(ano_pos_fire: int, ipca_acumulado: float,
                          escala_custo_vida: float = 1.0) -> float:
    """Gasto total (lifestyle + saúde) em R$ reais (base 2026).

    escala_custo_vida: fator de escala relativo à base R$250k (ex: 1.1 = +10%).
    Usado pelo tornado para medir sensibilidade ao custo de vida.
    """
    g, s = gasto_spending_smile_split(ano_pos_fire, ipca_acumulado, escala_custo_vida)
    return g + s


def retorno_equity_net_ir(retorno_real: float, ipca: float, aliquota: float) -> float:
    """Calcula retorno real líquido de IR sobre ganho nominal.

    Fórmula (FR-ir-desacumulacao):
        r_nominal = (1 + r_real) * (1 + IPCA) - 1
        r_depois_ir = r_nominal * (1 - aliquota)
        r_real_net = (1 + r_depois_ir) / (1 + IPCA) - 1

    Quando r_nominal <= 0 (ano de perda), não há IR — retorna retorno_real inalterado.
    """
    r_nominal = (1 + retorno_real) * (1 + ipca) - 1
    if r_nominal <= 0:
        return retorno_real  # sem ganho nominal → sem IR
    r_depois_ir = r_nominal * (1 - aliquota)
    return (1 + r_depois_ir) / (1 + ipca) - 1


def simular_trajetoria_com_trajeto(patrimonio_inicial: float, n_anos: int, retorno_equity: float,
                                     volatilidade: float, df: int, rng: np.random.Generator,
                                     escala_custo_vida: float = 1.0,
                                     aplicar_ir: bool = False, anos_bond_pool: int = 7,
                                     ipca_anual: float = 0.04, aliquota_ir: float = 0.15,
                                     inss_anual: float = 0.0, inss_inicio_ano: int = 12,
                                     vol_bond_pool: float = None,
                                     strategy: str = "guardrails",
                                     bond_pool_isolation: bool = False,
                                     bond_pool_completion_fraction: float = 1.0) -> tuple:
    """
    Simula trajetória de desacumulação e retorna TRAJETÓRIA COMPLETA.
    Retorna (sobreviveu: bool, patrimônio_final: float, trajetoria: list[float])
    trajetoria[i] = patrimônio no ano i (começando em ano 0)
    """
    pat = patrimonio_inicial
    pat_pico = patrimonio_inicial
    trajeto = [patrimonio_inicial]  # Começar com valor inicial

    ctx = WithdrawalCtx(
        swr_inicial=PREMISSAS["custo_vida_base"] / patrimonio_inicial if patrimonio_inicial > 0 else SWR_FALLBACK,
        anos_total=n_anos,
        ipca_anual=ipca_anual,
    )

    t_scale = np.sqrt(df / (df - 2))
    for ano in range(n_anos):
        in_pool_phase = bond_pool_isolation and ano < anos_bond_pool
        if in_pool_phase:
            f = bond_pool_completion_fraction  # 0.0 to 1.0
            vol_ano = volatilidade * (1.0 - f)  # vol reduz proporcionalmente à cobertura do bucket
        elif vol_bond_pool is not None and ano < anos_bond_pool:
            vol_ano = vol_bond_pool  # proxy legado (bond_pool_isolation=False)
        else:
            vol_ano = volatilidade

        z = rng.standard_t(df) / t_scale
        retorno_anual = retorno_equity + vol_ano * z

        if aplicar_ir and ano >= anos_bond_pool:
            retorno_anual = retorno_equity_net_ir(retorno_anual, ipca_anual, aliquota_ir)

        ctx.retorno_ano = retorno_anual

        pat = pat * (1 + retorno_anual)
        pat_pico = max(pat_pico, pat)

        gasto_lifestyle_target, gasto_saude = gasto_spending_smile_split(ano, 0, escala_custo_vida)
        if in_pool_phase:
            f = bond_pool_completion_fraction
            gasto_from_bucket = f * gasto_lifestyle_target
            remaining_target = (1.0 - f) * gasto_lifestyle_target
            if remaining_target > 0:
                withdrawal_req = WithdrawalRequest(
                    strategy=strategy,
                    gasto_smile=remaining_target,
                    patrimonio_atual=max(0, pat),
                    patrimonio_pico=pat_pico,
                    ano=ano,
                    ctx=ctx,
                    guardrails_config=GUARDRAILS,
                )
                gasto_from_equity = WithdrawalEngine.calculate(withdrawal_req).gasto_anual
            else:
                gasto_from_equity = 0.0
            gasto_lifestyle = gasto_from_bucket + gasto_from_equity
        elif vol_bond_pool is not None and ano < anos_bond_pool:
            withdrawal_req = WithdrawalRequest(
                strategy=strategy,
                gasto_smile=gasto_lifestyle_target,
                patrimonio_atual=max(0, pat),
                patrimonio_pico=pat_pico,
                ano=ano,
                ctx=ctx,
                guardrails_config=GUARDRAILS,
            )
            gasto_lifestyle = WithdrawalEngine.calculate(withdrawal_req).gasto_anual
        else:
            withdrawal_req = WithdrawalRequest(
                strategy=strategy,
                gasto_smile=gasto_lifestyle_target,
                patrimonio_atual=max(0, pat),  # Clamp to 0 (depleted portfolio)
                patrimonio_pico=pat_pico,
                ano=ano,
                ctx=ctx,
                guardrails_config=GUARDRAILS,
            )
            gasto_lifestyle = WithdrawalEngine.calculate(withdrawal_req).gasto_anual
        gasto = gasto_lifestyle + gasto_saude  # saúde sempre pago, protegido de guardrails

        if inss_anual > 0 and ano >= inss_inicio_ano:
            gasto = max(0, gasto - inss_anual)

        pat -= gasto
        trajeto.append(max(pat, 0))  # Guardar patrimônio após gasto

        if pat <= 0:
            # Preencher resto da trajetória com zeros
            trajeto.extend([0.0] * (n_anos - len(trajeto) + 1))
            return False, 0.0, trajeto

    return True, pat, trajeto


def simular_trajetoria(patrimonio_inicial: float, n_anos: int, retorno_equity: float,
                        volatilidade: float, df: int, rng: np.random.Generator,
                        escala_custo_vida: float = 1.0,
                        aplicar_ir: bool = False, anos_bond_pool: int = 7,
                        ipca_anual: float = 0.04, aliquota_ir: float = 0.15,
                        inss_anual: float = 0.0, inss_inicio_ano: int = 12,
                        vol_bond_pool: float = None,
                        strategy: str = "guardrails",
                        track_spending: bool = False,
                        bond_pool_isolation: bool = False,
                        bond_pool_completion_fraction: float = 1.0) -> tuple:
    """
    Simula uma trajetória de desacumulação.
    Retorna (sobreviveu: bool, patrimônio_final: float, patrimônio_pico: float, gastos: list|None)

    strategy: "guardrails" (default), "constant", "pct_portfolio", "vpw", "guyton_klinger", "gk_hybrid"
    track_spending: se True, retorna lista de gastos anuais no 4º elemento
    bond_pool_isolation: se True, vol=0 e sem guardrails nos anos 0..anos_bond_pool-1
    """
    pat = patrimonio_inicial
    pat_pico = patrimonio_inicial
    gastos_hist = [] if track_spending else None

    ctx = WithdrawalCtx(
        swr_inicial=PREMISSAS["custo_vida_base"] / patrimonio_inicial if patrimonio_inicial > 0 else SWR_FALLBACK,
        anos_total=n_anos,
        ipca_anual=ipca_anual,
    )

    t_scale = np.sqrt(df / (df - 2))
    for ano in range(n_anos):
        in_pool_phase = bond_pool_isolation and ano < anos_bond_pool
        if in_pool_phase:
            f = bond_pool_completion_fraction  # 0.0 to 1.0
            vol_ano = volatilidade * (1.0 - f)  # vol reduz proporcionalmente à cobertura do bucket
        elif vol_bond_pool is not None and ano < anos_bond_pool:
            vol_ano = vol_bond_pool  # proxy legado
        else:
            vol_ano = volatilidade

        z = rng.standard_t(df) / t_scale
        retorno_anual = retorno_equity + vol_ano * z

        if aplicar_ir and ano >= anos_bond_pool:
            retorno_anual = retorno_equity_net_ir(retorno_anual, ipca_anual, aliquota_ir)

        ctx.retorno_ano = retorno_anual

        pat = pat * (1 + retorno_anual)
        pat_pico = max(pat_pico, pat)

        gasto_lifestyle_target, gasto_saude = gasto_spending_smile_split(ano, 0, escala_custo_vida)
        if in_pool_phase:
            f = bond_pool_completion_fraction
            gasto_from_bucket = f * gasto_lifestyle_target
            remaining_target = (1.0 - f) * gasto_lifestyle_target
            if remaining_target > 0:
                withdrawal_req = WithdrawalRequest(
                    strategy=strategy,
                    gasto_smile=remaining_target,
                    patrimonio_atual=max(0, pat),
                    patrimonio_pico=pat_pico,
                    ano=ano,
                    ctx=ctx,
                    guardrails_config=GUARDRAILS,
                )
                gasto_from_equity = WithdrawalEngine.calculate(withdrawal_req).gasto_anual
            else:
                gasto_from_equity = 0.0
            gasto_lifestyle = gasto_from_bucket + gasto_from_equity
        elif vol_bond_pool is not None and ano < anos_bond_pool:
            withdrawal_req = WithdrawalRequest(
                strategy=strategy,
                gasto_smile=gasto_lifestyle_target,
                patrimonio_atual=max(0, pat),
                patrimonio_pico=pat_pico,
                ano=ano,
                ctx=ctx,
                guardrails_config=GUARDRAILS,
            )
            gasto_lifestyle = WithdrawalEngine.calculate(withdrawal_req).gasto_anual
        else:
            withdrawal_req = WithdrawalRequest(
                strategy=strategy,
                gasto_smile=gasto_lifestyle_target,
                patrimonio_atual=max(0, pat),  # Clamp to 0 (depleted portfolio)
                patrimonio_pico=pat_pico,
                ano=ano,
                ctx=ctx,
                guardrails_config=GUARDRAILS,
            )
            gasto_lifestyle = WithdrawalEngine.calculate(withdrawal_req).gasto_anual
        gasto = gasto_lifestyle + gasto_saude  # saúde sempre pago, protegido de guardrails

        if inss_anual > 0 and ano >= inss_inicio_ano:
            gasto = max(0, gasto - inss_anual)

        if track_spending:
            gastos_hist.append(gasto)

        pat -= gasto

        if pat <= 0:
            return False, 0.0, pat_pico, gastos_hist

    return True, pat, pat_pico, gastos_hist


def _retorno_equity_cenario(premissas: dict, cenario: str) -> float:
    """Retorno equity ajustado por cenário."""
    r = premissas["retorno_equity_base"]
    if cenario == "favoravel":
        r += premissas["adj_favoravel"]
    elif cenario == "stress":
        r += premissas["adj_stress"]
    return r


def compute_p_quality(premissas: dict, n_sim: int = 10_000, seed: int = 42,
                      min_frac_anos: float | None = None,
                      gogowindow: int | None = None,
                      max_bad_total: int | None = 1,
                      max_bad_consec: int = 0,
                      cenario: str = "base",
                      bond_pool_isolation: bool = False,
                      bond_pool_completion_fraction: float | None = None) -> float:
    """P(quality): % de trajetórias onde lifestyle >= PISO_LIFESTYLE_FRACTION * smile_target.

    Critérios (ambos devem ser satisfeitos):
      1. >= min_frac_anos dos anos totais (default: MIN_QUALITY_FRAC from config)
      2. go-go window — critério configurável via max_bad_total / max_bad_consec:
           max_bad_total=0  → critério A (binário: nenhum ano ruim)
           max_bad_total=1  → critério B (≤1 total, default)
           max_bad_total=2  → critério C (≤2 total)
           max_bad_total=None, max_bad_consec=1 → critério D (≤1 consecutivo)
           max_bad_total=None, max_bad_consec=2 → critério E (≤2 consecutivos)

    cenario: "base" | "favoravel" | "stress" — ajusta retorno equity.

    FR-pquality-recalibration 2026-04-29.
    FR-pquality-matrix 2026-04-29.
    """
    if min_frac_anos is None:
        min_frac_anos = MIN_QUALITY_FRAC
    if gogowindow is None:
        gogowindow = MIN_QUALITY_GOGOWINDOW
    if bond_pool_completion_fraction is None:
        bond_pool_completion_fraction = premissas.get("bond_pool_completion_fraction", 1.0)

    rng = np.random.default_rng(seed)

    # Retorno equity ajustado por cenário
    r_equity = premissas["retorno_equity_base"]
    if cenario == "favoravel":
        r_equity += premissas.get("adj_favoravel", 0.0)
    elif cenario == "stress":
        r_equity += premissas.get("adj_stress", 0.0)

    anos_acum = premissas["idade_fire_alvo"] - premissas["idade_atual"]
    pat_fire = projetar_acumulacao(premissas, r_equity, cenario, n_sim, rng, anos_acum)

    # escala_cv: ratio do custo de vida do perfil vs base canônico (250k)
    escala_cv = premissas.get("custo_vida_base", CUSTO_VIDA_BASE) / CUSTO_VIDA_BASE
    n_anos = premissas["anos_simulacao"]
    df = premissas["t_dist_df"]
    vol = premissas["volatilidade_equity"]
    t_scale = np.sqrt(df / (df - 2))
    ipca_anual = premissas.get("ipca_anual", 0.04)
    anos_bond_pool = premissas.get("anos_bond_pool", 7)
    vol_bond_pool = premissas.get("vol_bond_pool", None)

    qualidade_count = 0
    for i in range(n_sim):
        pat = float(pat_fire[i])
        pat_pico = pat
        ctx = WithdrawalCtx(
            swr_inicial=premissas["custo_vida_base"] / pat if pat > 0 else SWR_FALLBACK,
            anos_total=n_anos,
            ipca_anual=ipca_anual,
        )
        anos_acima_piso = 0
        gogo_bad_total = 0
        gogo_consec_atual = 0
        gogo_max_consec = 0

        for ano in range(n_anos):
            in_pool_phase = bond_pool_isolation and ano < anos_bond_pool
            if in_pool_phase:
                f = bond_pool_completion_fraction  # 0.0 to 1.0
                vol_ano = vol * (1.0 - f)  # vol reduz proporcionalmente à cobertura do bucket
            elif vol_bond_pool is not None and ano < anos_bond_pool:
                vol_ano = vol_bond_pool  # proxy legado
            else:
                vol_ano = vol

            z = rng.standard_t(df) / t_scale
            retorno_anual = r_equity + vol_ano * z
            ctx.retorno_ano = retorno_anual
            pat = pat * (1 + retorno_anual)
            pat_pico = max(pat_pico, pat)

            gasto_lifestyle_target, gasto_saude = gasto_spending_smile_split(ano, 0, escala_cv)
            if in_pool_phase:
                f = bond_pool_completion_fraction
                gasto_from_bucket = f * gasto_lifestyle_target
                remaining_target = (1.0 - f) * gasto_lifestyle_target
                if remaining_target > 0:
                    req = WithdrawalRequest(
                        strategy="guardrails",
                        gasto_smile=remaining_target,
                        patrimonio_atual=max(0, pat),
                        patrimonio_pico=pat_pico,
                        ano=ano,
                        ctx=ctx,
                        guardrails_config=GUARDRAILS,
                    )
                    gasto_from_equity = WithdrawalEngine.calculate(req).gasto_anual
                else:
                    gasto_from_equity = 0.0
                gasto_lifestyle = gasto_from_bucket + gasto_from_equity
            else:
                req = WithdrawalRequest(
                    strategy="guardrails",
                    gasto_smile=gasto_lifestyle_target,
                    patrimonio_atual=max(0, pat),
                    patrimonio_pico=pat_pico,
                    ano=ano,
                    ctx=ctx,
                    guardrails_config=GUARDRAILS,
                )
                gasto_lifestyle = WithdrawalEngine.calculate(req).gasto_anual
            gasto_total = gasto_lifestyle + gasto_saude

            piso_ano = PISO_LIFESTYLE_FRACTION * gasto_lifestyle_target
            acima_piso = gasto_lifestyle >= piso_ano
            if acima_piso:
                anos_acima_piso += 1

            # Tracking para ambos os critérios (total e consecutivo)
            if not acima_piso and ano < gogowindow:
                gogo_bad_total += 1
                gogo_consec_atual += 1
                gogo_max_consec = max(gogo_max_consec, gogo_consec_atual)
            elif ano < gogowindow:
                gogo_consec_atual = 0

            pat -= gasto_total
            if pat <= 0:
                break

        # Avaliar critério go-go ao final da trajetória
        if max_bad_total is not None:
            gogo_ok = gogo_bad_total <= max_bad_total
        else:
            gogo_ok = gogo_max_consec <= max_bad_consec

        if gogo_ok and (anos_acima_piso / n_anos >= min_frac_anos):
            qualidade_count += 1

    return qualidade_count / n_sim


# Critérios de qualidade para a matriz 5×3×3
_CRITERIOS_MATRIZ = [
    {"id": "A", "label": "Binário (nenhum)",  "descricao": "0 anos ruins no go-go", "max_bad_total": 0,    "max_bad_consec": 0},
    {"id": "B", "label": "≤1 total",           "descricao": "máx 1 ano ruim total",  "max_bad_total": 1,    "max_bad_consec": None, "default": True},
    {"id": "C", "label": "≤2 total",           "descricao": "máx 2 anos ruins total","max_bad_total": 2,    "max_bad_consec": None},
    {"id": "D", "label": "≤1 consecutivo",     "descricao": "máx 1 consecutivo",     "max_bad_total": None, "max_bad_consec": 1},
    {"id": "E", "label": "≤2 consecutivos",    "descricao": "máx 2 consecutivos",    "max_bad_total": None, "max_bad_consec": 2},
]


def compute_p_quality_matrix(premissas_base: dict, n_sim: int = 5_000, seed: int = 42,
                              bond_pool_isolation: bool = False,
                              bond_pool_completion_fraction: float | None = None) -> dict:
    """Computa P(quality) para todas as combinações: 5 critérios × 3 perfis × 3 cenários.

    Retorna dict estruturado para data.json['fire']['p_quality_matrix'].
    FR-pquality-matrix 2026-04-29.

    Args:
        bond_pool_isolation: Se True, usa isolamento do bond pool (reduz vol).
        bond_pool_completion_fraction: Fração de conclusão do bucket (None = lê de premissas).
    """
    # Perfis com gasto anual (custo_vida_base) fixo por perfil
    perfis_config = {
        "atual":  {"custo_vida_base": 250_000, "idade_fire_alvo": 53},
        "casado": {"custo_vida_base": 270_000, "idade_fire_alvo": 53},
        "filho":  {"custo_vida_base": 300_000, "idade_fire_alvo": 53},
    }
    cenarios = ["base", "favoravel", "stress"]

    # Metadados dos critérios (sem max_bad_* que são parâmetros internos)
    criterios_meta = [
        {k: v for k, v in c.items() if k not in ("max_bad_total", "max_bad_consec")}
        for c in _CRITERIOS_MATRIZ
    ]

    values: dict = {}
    total = len(_CRITERIOS_MATRIZ) * len(perfis_config) * len(cenarios)
    done = 0

    for crit in _CRITERIOS_MATRIZ:
        crit_id = crit["id"]
        values[crit_id] = {}

        for perfil_id, perfil_cfg in perfis_config.items():
            values[crit_id][perfil_id] = {}

            # Construir premissas do perfil (cópia do base, ajustando custo de vida e horizonte)
            p = dict(premissas_base)
            p["custo_vida_base"] = perfil_cfg["custo_vida_base"]
            p["idade_fire_alvo"] = perfil_cfg["idade_fire_alvo"]
            p["anos_simulacao"] = premissas_base.get("horizonte_vida", 90) - perfil_cfg["idade_fire_alvo"]

            for cenario in cenarios:
                pq = compute_p_quality(
                    p,
                    n_sim=n_sim,
                    seed=seed,
                    max_bad_total=crit["max_bad_total"],
                    max_bad_consec=crit["max_bad_consec"] if crit["max_bad_consec"] is not None else 0,
                    cenario=cenario,
                    bond_pool_isolation=bond_pool_isolation,
                    bond_pool_completion_fraction=bond_pool_completion_fraction,
                )
                values[crit_id][perfil_id][cenario] = round(pq * 100, 1)
                done += 1
                print(f"    p_quality_matrix [{crit_id}][{perfil_id}][{cenario}] = {pq*100:.1f}% ({done}/{total})")

    # Identificar o modo para label no frontend
    if not bond_pool_isolation:
        _mode = "sem_bucket"
    elif bond_pool_completion_fraction == 1.0:
        _mode = "full"
    else:
        _mode = "partial"

    return {
        "criterios": criterios_meta,
        "perfis": list(perfis_config.keys()),
        "cenarios": cenarios,
        "values": values,
        "gogowindow": MIN_QUALITY_GOGOWINDOW,
        "min_frac_anos": MIN_QUALITY_FRAC,
        "bond_pool_mode": _mode,
    }


def compute_pfire_percentiles(premissas: dict, n_rodadas: int = 20, n_sim_por_rodada: int = 10_000) -> dict:
    """
    Roda Monte Carlo múltiplas vezes com seeds diferentes para capturar distribuição de P(FIRE).

    Cada rodada usa seed diferente, produzindo ligeira variação em P(FIRE) por causa da
    aleatoriedade das trajetórias. Percentis dessa distribuição refletem incerteza no estimate.

    Args:
        premissas: dicionário de premissas FIRE
        n_rodadas: número de rodadas MC (20 padrão)
        n_sim_por_rodada: simulações por rodada (10k padrão)

    Returns:
        {
            'p5': 80.2,
            'p10': 81.0,
            'p25': 82.3,
            'p50': 83.5,  # mediana
            'p75': 84.7,
            'p90': 85.8,
            'p95': 86.2,
            'mean': 83.4,
            'std': 1.2,
            'n_rodadas': 20
        }
    """
    resultados = []

    for seed_offset in range(1, n_rodadas + 1):
        seed = seed_offset * 10  # seeds: 10, 20, 30, ..., 200
        resultado = rodar_monte_carlo(
            premissas, n_sim=n_sim_por_rodada, cenario="base",
            seed=seed, strategy="guardrails"
        )
        pfire_canonical = canonicalize_pfire(resultado["p_sucesso"], source='mc')
        p_fire_pct = pfire_canonical.percentage
        resultados.append(p_fire_pct)

    resultados_sorted = sorted(resultados)

    return {
        'p5': float(np.percentile(resultados_sorted, 5)),
        'p10': float(np.percentile(resultados_sorted, 10)),
        'p25': float(np.percentile(resultados_sorted, 25)),
        'p50': float(np.percentile(resultados_sorted, 50)),
        'p75': float(np.percentile(resultados_sorted, 75)),
        'p90': float(np.percentile(resultados_sorted, 90)),
        'p95': float(np.percentile(resultados_sorted, 95)),
        'mean': float(np.mean(resultados)),
        'std': float(np.std(resultados)),
        'n_rodadas': n_rodadas,
        'n_sim_por_rodada': n_sim_por_rodada,
    }


def rodar_monte_carlo(premissas: dict, n_sim: int = 10_000,
                       cenario: str = "base", seed: int = 42,
                       strategy: str = "guardrails",
                       pat_fire_precomputed: np.ndarray = None) -> dict:
    """
    Roda n_sim trajetórias e retorna estatísticas.

    Lógica correta (alinhada com FR-spending-smile + FR-fire2040):
    1. Projetar acumulação até idade_fire_alvo → patrimônio no FIRE
    2. Simular desacumulação 40 anos para TODAS as trajetórias
    3. P(FIRE) = % que sobrevivem os 40 anos com spending smile + guardrails

    O gatilho R$13.4M/SWR 2.4% é reportado separadamente (% de trajetórias
    que o atingem) — não é filtro da simulação.

    cenario: "base", "favoravel", "stress"
    pat_fire_precomputed: skip accumulation phase (for --compare-strategies)
    """
    rng = np.random.default_rng(seed)
    r_equity = _retorno_equity_cenario(premissas, cenario)

    # Fase 1: Acumulação até o FIRE (skip se precomputed)
    anos_acum = premissas["idade_fire_alvo"] - premissas["idade_atual"]
    if pat_fire_precomputed is not None:
        pat_fire_trajetorias = pat_fire_precomputed
        # Advance RNG past accumulation draws so withdrawal phase is deterministic
        # projetar_acumulacao draws n_sim * anos_acum t-distributed values
        rng.standard_t(premissas["t_dist_df"], size=n_sim * anos_acum)
    else:
        pat_fire_trajetorias = projetar_acumulacao(premissas, r_equity, cenario, n_sim, rng, anos_acum)

    # % que atingem o gatilho formal (R$13.4M + SWR <= 2.4%)
    atingiu_gatilho = (
        (pat_fire_trajetorias >= premissas["patrimonio_gatilho"]) &
        (premissas["custo_vida_base"] / pat_fire_trajetorias <= premissas["swr_gatilho"])
    )
    pct_gatilho = float(atingiu_gatilho.mean())

    # Fase 2: Desacumulação para TODAS as trajetórias
    escala_cv = premissas.get("custo_vida_base", 250_000) / 250_000
    sucessos = 0
    pats_finais = []

    aplicar_ir = premissas.get("aplicar_ir_desacumulacao", False)
    anos_bond_pool = premissas.get("anos_bond_pool", 7)
    ipca_anual = premissas.get("ipca_anual", 0.04)
    aliquota_ir = premissas.get("aliquota_ir_equity", 0.15)
    inss_anual = premissas.get("inss_anual", 0.0)
    inss_inicio_ano = premissas.get("inss_inicio_ano", 12)
    vol_bond_pool = premissas.get("vol_bond_pool", None)
    bond_pool_isolation = premissas.get("bond_pool_isolation", False)
    bond_pool_completion_fraction = premissas.get("bond_pool_completion_fraction", 1.0)

    for i in range(n_sim):
        pat_ini = float(pat_fire_trajetorias[i])
        sobreviveu, pat_final, _, _spending = simular_trajetoria(
            pat_ini, premissas["anos_simulacao"], r_equity,
            premissas["volatilidade_equity"], premissas["t_dist_df"], rng,
            escala_custo_vida=escala_cv,
            aplicar_ir=aplicar_ir, anos_bond_pool=anos_bond_pool,
            ipca_anual=ipca_anual, aliquota_ir=aliquota_ir,
            inss_anual=inss_anual, inss_inicio_ano=inss_inicio_ano,
            vol_bond_pool=vol_bond_pool,
            strategy=strategy,
            bond_pool_isolation=bond_pool_isolation,
            bond_pool_completion_fraction=bond_pool_completion_fraction,
        )
        if sobreviveu:
            sucessos += 1
        pats_finais.append(pat_final)

    pats_finais = np.array(pats_finais)
    p_sucesso = sucessos / n_sim

    return {
        "cenario": cenario,
        "n_sim": n_sim,
        "p_sucesso": p_sucesso,
        "pct_gatilho_formal": pct_gatilho,   # % que atingem R$13.4M + SWR <= 2.4%
        "pat_mediana_fire": float(np.median(pat_fire_trajetorias)),
        "pat_p10_fire": float(np.percentile(pat_fire_trajetorias, 10)),
        "pat_p90_fire": float(np.percentile(pat_fire_trajetorias, 90)),
        "pat_p10_final": float(np.percentile(pats_finais[pats_finais > 0], 10)) if (pats_finais > 0).any() else 0,
        "pat_p90_final": float(np.percentile(pats_finais[pats_finais > 0], 90)) if (pats_finais > 0).any() else 0,
        "retorno_equity_usado": r_equity,
    }


def rodar_monte_carlo_com_trajetorias(premissas: dict, n_sim: int = 10_000,
                                      cenario: str = "base", seed: int = 42,
                                      strategy: str = "guardrails",
                                      pat_fire_precomputed: np.ndarray = None) -> dict:
    """
    Roda Monte Carlo e retorna trajetórias COMPLETAS (ano a ano).
    Usado pelo gráfico NetWorthProjection.

    Retorna:
    {
      "trilha_p10": [val_ano0, val_ano1, ...],  # P10 por ano
      "trilha_p50": [val_ano0, val_ano1, ...],  # P50 (mediana) por ano
      "trilha_p90": [val_ano0, val_ano1, ...],  # P90 por ano
      "datas": [2024, 2025, ...],
      "cenario": "base",
      "p_sucesso": 0.866
    }
    """
    rng = np.random.default_rng(seed)
    r_equity = _retorno_equity_cenario(premissas, cenario)

    # Acumulação
    anos_acum = premissas["idade_fire_alvo"] - premissas["idade_atual"]
    if pat_fire_precomputed is not None:
        pat_fire_trajetorias = pat_fire_precomputed
        rng.standard_t(premissas["t_dist_df"], size=n_sim * anos_acum)
    else:
        pat_fire_trajetorias = projetar_acumulacao(premissas, r_equity, cenario, n_sim, rng, anos_acum)

    # Parâmetros desacumulação
    escala_cv = premissas.get("custo_vida_base", 250_000) / 250_000
    aplicar_ir = premissas.get("aplicar_ir_desacumulacao", False)
    anos_bond_pool = premissas.get("anos_bond_pool", 7)
    ipca_anual = premissas.get("ipca_anual", 0.04)
    aliquota_ir = premissas.get("aliquota_ir_equity", 0.15)
    inss_anual = premissas.get("inss_anual", 0.0)
    inss_inicio_ano = premissas.get("inss_inicio_ano", 12)
    vol_bond_pool = premissas.get("vol_bond_pool", None)
    bond_pool_isolation = premissas.get("bond_pool_isolation", False)
    bond_pool_completion_fraction = premissas.get("bond_pool_completion_fraction", 1.0)

    # Guardar trajetórias completas
    trajetorias = []
    sucessos = 0
    n_anos = premissas["anos_simulacao"]

    for i in range(n_sim):
        pat_ini = float(pat_fire_trajetorias[i])
        sobreviveu, pat_final, trajeto = simular_trajetoria_com_trajeto(
            pat_ini, n_anos, r_equity,
            premissas["volatilidade_equity"], premissas["t_dist_df"], rng,
            escala_custo_vida=escala_cv,
            aplicar_ir=aplicar_ir, anos_bond_pool=anos_bond_pool,
            ipca_anual=ipca_anual, aliquota_ir=aliquota_ir,
            inss_anual=inss_anual, inss_inicio_ano=inss_inicio_ano,
            vol_bond_pool=vol_bond_pool,
            strategy=strategy,
            bond_pool_isolation=bond_pool_isolation,
            bond_pool_completion_fraction=bond_pool_completion_fraction,
        )
        if sobreviveu:
            sucessos += 1
        # trajeto é a sequência de patrimônios: [pat_ano0, pat_ano1, ..., pat_anoN]
        trajetorias.append(trajeto)

    # Converter para array (n_sim x n_anos)
    trajetorias = np.array(trajetorias)
    p_sucesso = sucessos / n_sim

    # Calcular percentis por ano
    trilha_p10 = np.percentile(trajetorias, 10, axis=0).tolist()
    trilha_p50 = np.percentile(trajetorias, 50, axis=0).tolist()
    trilha_p90 = np.percentile(trajetorias, 90, axis=0).tolist()

    # Gerar datas (anos do FIRE até final)
    idade_fire = premissas["idade_fire_alvo"]
    ano_fire = int(premissas.get("ano_atual", 2024)) + anos_acum
    # +1: inclui ano 0 (início do FIRE) que a trajetória armazena como pat_inicial
    datas = [str(ano_fire + i) for i in range(n_anos + 1)]

    return {
        "trilha_p10": trilha_p10,
        "trilha_p50": trilha_p50,
        "trilha_p90": trilha_p90,
        "datas": datas,
        "cenario": cenario,
        "p_sucesso": float(p_sucesso),
        "retorno_equity_usado": r_equity,
    }


def projetar_acumulacao(premissas: dict, r_equity: float, cenario: str,
                         n_sim: int, rng: np.random.Generator, n_anos: int) -> np.ndarray:
    """
    Projeta patrimônio no FIRE via Monte Carlo de acumulação.
    Retorna array de patrimônios simulados.
    """
    vol = premissas["volatilidade_equity"] * premissas["pct_equity"]  # vol proporcional ao equity
    df = premissas["t_dist_df"]
    pat = np.full(n_sim, float(premissas["patrimonio_atual"]))
    aporte_anual = premissas["aporte_mensal"] * 12
    anos_bond_pool = premissas.get("anos_bond_pool", 7)

    for ano in range(n_anos):
        z = rng.standard_t(df, size=n_sim) / np.sqrt(df / (df - 2))
        # Usar vol_bond_pool nos primeiros anos da bond pool, depois vol_equity
        vol_efetivo = premissas["vol_bond_pool"] if (premissas.get("vol_bond_pool") is not None and ano < anos_bond_pool) else premissas["volatilidade_equity"]
        retorno_carteira = (
            premissas["pct_equity"]    * (r_equity + vol_efetivo * z) +
            premissas["pct_ipca_longo"] * premissas["retorno_ipca_plus"] +
            premissas["pct_cripto"]    * (r_equity + 2 * vol_efetivo * z)  # proxy cripto: 2x vol
        )
        pat = pat * (1 + retorno_carteira) + aporte_anual

    return pat


def projetar_acumulacao_mensal(premissas: dict, r_equity: float, n_sim: int = 5_000,
                                n_meses: int = None, seed: int = 42) -> tuple:
    """
    Projeta patrimônio mês-a-mês via Monte Carlo (acumulação).
    Retorna (dates, p50_brl, p10_brl, p90_brl) — arrays paralelos para FIRE dashboard.

    n_meses: se None, calcula até idade_fire_alvo
    """
    if n_meses is None:
        n_meses = (premissas["idade_fire_alvo"] - premissas["idade_atual"]) * 12

    rng = np.random.default_rng(seed)
    vol = premissas["volatilidade_equity"] * premissas["pct_equity"]
    vol_mensal = vol / np.sqrt(12)  # Converter volatilidade anual para mensal
    vol_bond_pool_mensal = premissas["vol_bond_pool"] / np.sqrt(12)  # vol_bond_pool também mensal
    df = premissas["t_dist_df"]
    pat = np.full(n_sim, float(premissas["patrimonio_atual"]))
    aporte_mensal = premissas["aporte_mensal"]
    retorno_mensal = (1 + r_equity) ** (1 / 12) - 1

    # Arrays para armazenar percentis por mês
    p50_monthly = []
    p10_monthly = []
    p90_monthly = []
    dates = []

    from datetime import datetime
    from dateutil.relativedelta import relativedelta

    today = datetime.now()
    cur_date = today.replace(day=1)  # primeiro do mês atual

    for mês in range(n_meses):
        # Shocks mensais
        z = rng.standard_t(df, size=n_sim) / np.sqrt(df / (df - 2))
        # Usar vol_bond_pool nos primeiros 84 meses (7 anos bond pool), depois vol_equity (mensais)
        vol_efetivo = vol_bond_pool_mensal if mês < 84 else vol_mensal
        retorno_carteira = (
            premissas["pct_equity"]    * (retorno_mensal + vol_efetivo * z) +
            premissas["pct_ipca_longo"] * (premissas["retorno_ipca_plus"] / 12) +
            premissas["pct_cripto"]    * (retorno_mensal + 2 * vol_efetivo * z)
        )
        pat = pat * (1 + retorno_carteira) + aporte_mensal

        # Percentis
        p50_monthly.append(float(np.percentile(pat, 50)))
        p10_monthly.append(float(np.percentile(pat, 10)))
        p90_monthly.append(float(np.percentile(pat, 90)))

        dates.append(cur_date.strftime(DATE_FORMAT_YM))
        cur_date += relativedelta(months=1)

    return dates, p50_monthly, p10_monthly, p90_monthly


def rodar_tornado(premissas: dict, variacao: float = 0.10, n_sim: int = 5_000) -> list:
    """
    Tornado chart: impacto de ±variacao% em cada premissa sobre P(FIRE).
    """
    base = rodar_monte_carlo(premissas, n_sim=n_sim, cenario="base")
    p_base = base["p_sucesso"]

    # Ordem manual: volatilidade, custo de vida, retorno, aporte (DEV-fire-sim-fixes)
    variaveis = {
        "volatilidade_equity": "Volatilidade equity (+/-10%)",
        "custo_vida_base":     "Custo de vida (+/-10%)",
        "retorno_equity_base": "Retorno equity (+/-10%)",
        "aporte_mensal":       "Aporte mensal (+/-10%)",
        # ipca_anual e dep_brl_base omitidos: já embutidos nos retornos reais BRL
    }

    resultados = []
    for var, label in variaveis.items():
        p_up_dict = dict(premissas)
        p_down_dict = dict(premissas)
        p_up_dict[var] = premissas[var] * (1 + variacao)
        p_down_dict[var] = premissas[var] * (1 - variacao)

        r_up   = rodar_monte_carlo(p_up_dict,   n_sim=n_sim, cenario="base")
        r_down = rodar_monte_carlo(p_down_dict, n_sim=n_sim, cenario="base")

        impacto_up   = r_up["p_sucesso"]   - p_base
        impacto_down = r_down["p_sucesso"] - p_base
        impacto_abs  = abs(impacto_up) + abs(impacto_down)

        resultados.append({
            "variavel": label,
            "p_base": p_base,
            "p_up": r_up["p_sucesso"],
            "p_down": r_down["p_sucesso"],
            "impacto_up": impacto_up,
            "impacto_down": impacto_down,
            "impacto_abs": impacto_abs,
        })

    return resultados  # ordem preservada do dict variaveis (DEV-fire-sim-fixes)


def rodar_mc_by_profile(premissas: dict, n_sim: int = 10_000, seed: int = 42) -> list:
    """
    Roda MC para cada perfil (PERFIS_FIRE) em cada idade-alvo (FIRE_AGES) +
    scan de idades para determinar fire_age_threshold (primeira onde P ≥ FIRE_P_THRESHOLD).

    Output schema (por perfil):
      {
        "profile": "atual",
        "label": "Atual (Solteiro)",
        "gasto_anual": 250000,
        "p_fire_50": 85.4,   # % base scenario
        "p_fire_53": 90.4,   # % base scenario
        "p_fire_50_fav": ..., "p_fire_50_stress": ...,
        "p_fire_53_fav": ..., "p_fire_53_stress": ...,
        "fire_age_50": "2037",  # calendar year
        "fire_age_53": "2040",
        "pat_mediano_50": ..., "pat_mediano_53": ...,
        # NOVO:
        "fire_age_threshold": 51,        # primeira idade onde P(base) >= 85%
        "fire_year_threshold": "2038",   # ano calendário correspondente
        "p_at_threshold": 87.2,          # P(base) nessa idade
        "swr_at_fire": 0.0225,           # gasto_anual / pat_mediano_at_threshold
        "pat_mediano_threshold": 11100000,
        "p_quality": 66.1,  # P(quality) para perfil (fire_age_threshold), em %
      }
    """
    results = []
    ano_nascimento = 2026 - premissas["idade_atual"]  # ~1987

    for perfil_id, perfil in PERFIS_FIRE.items():
        entry = {
            "profile": perfil_id,
            "label": perfil["label"],
            "gasto_anual": perfil["gasto_anual"],
        }

        # ── Scan idades-alvo fixas (50, 53) — backwards compat ──────────────
        for age_key, age_target in FIRE_AGES.items():
            p = dict(premissas)
            p["custo_vida_base"] = perfil["gasto_anual"]
            p["idade_fire_alvo"] = age_target
            p["anos_simulacao"] = HORIZONTE_VIDA - age_target

            fire_year = ano_nascimento + age_target
            entry[f"fire_age_{age_target}"] = str(fire_year)

            for cenario in ["base", "favoravel", "stress"]:
                r = rodar_monte_carlo(p, n_sim=n_sim, cenario=cenario, seed=seed)
                pfire_canonical = canonicalize_pfire(r["p_sucesso"], source='mc')
                p_pct = round(pfire_canonical.percentage, 1)

                if cenario == "base":
                    entry[age_key] = p_pct
                    entry[f"pat_mediano_{age_target}"] = round(r["pat_mediana_fire"], 0)
                else:
                    suffix = "fav" if cenario == "favoravel" else "stress"
                    entry[f"{age_key}_{suffix}"] = p_pct

        # ── Scan para fire_age_threshold — SWR=3% fixo, idade varia ─────────
        # Encontra primeira idade onde P(base) >= FIRE_P_THRESHOLD
        threshold_found = False
        for age_target in FIRE_AGES_SCAN:
            p = dict(premissas)
            p["custo_vida_base"] = perfil["gasto_anual"]
            p["idade_fire_alvo"] = age_target
            p["anos_simulacao"] = HORIZONTE_VIDA - age_target

            r = rodar_monte_carlo(p, n_sim=n_sim, cenario="base", seed=seed)
            pfire_canonical = canonicalize_pfire(r["p_sucesso"], source='mc')
            p_pct = round(pfire_canonical.percentage, 1)
            pat_med = round(r["pat_mediana_fire"], 0)

            if p_pct >= FIRE_P_THRESHOLD and not threshold_found:
                swr = perfil["gasto_anual"] / pat_med if pat_med > 0 else None
                # Compute fav + stress at this threshold age
                r_fav    = rodar_monte_carlo(dict(premissas, custo_vida_base=perfil["gasto_anual"], idade_fire_alvo=age_target, anos_simulacao=HORIZONTE_VIDA-age_target), n_sim=n_sim, cenario="favoravel", seed=seed)
                r_stress = rodar_monte_carlo(dict(premissas, custo_vida_base=perfil["gasto_anual"], idade_fire_alvo=age_target, anos_simulacao=HORIZONTE_VIDA-age_target), n_sim=n_sim, cenario="stress",    seed=seed)
                entry["fire_age_threshold"]      = age_target
                entry["fire_year_threshold"]     = str(ano_nascimento + age_target)
                entry["p_at_threshold"]          = p_pct
                pfire_fav_canonical = canonicalize_pfire(r_fav["p_sucesso"], source='mc')
                pfire_stress_canonical = canonicalize_pfire(r_stress["p_sucesso"], source='mc')
                entry["p_at_threshold_fav"]      = round(pfire_fav_canonical.percentage, 1)
                entry["p_at_threshold_stress"]   = round(pfire_stress_canonical.percentage, 1)
                entry["swr_at_fire"]             = round(swr, 4) if swr else None
                entry["pat_mediano_threshold"]   = pat_med
                threshold_found = True
                break  # scan can stop here

        if not threshold_found:
            # Nunca alcançou o threshold no range — usar última idade do scan
            last_age = FIRE_AGES_SCAN[-1]
            p = dict(premissas)
            p["custo_vida_base"] = perfil["gasto_anual"]
            p["idade_fire_alvo"] = last_age
            p["anos_simulacao"] = HORIZONTE_VIDA - last_age
            r = rodar_monte_carlo(p, n_sim=n_sim, cenario="base", seed=seed)
            pfire_canonical = canonicalize_pfire(r["p_sucesso"], source='mc')
            p_pct = round(pfire_canonical.percentage, 1)
            pat_med = round(r["pat_mediana_fire"], 0)
            swr = perfil["gasto_anual"] / pat_med if pat_med > 0 else None
            entry["fire_age_threshold"]      = last_age
            entry["fire_year_threshold"]     = str(ano_nascimento + last_age)
            entry["p_at_threshold"]          = p_pct
            entry["p_at_threshold_fav"]      = None
            entry["p_at_threshold_stress"]   = None
            entry["swr_at_fire"]             = round(swr, 4) if swr else None
            entry["pat_mediano_threshold"]   = pat_med

        # P(quality) para este perfil (usa idade_fire_alvo = fire_age_threshold)
        age_q = entry["fire_age_threshold"]
        p_quality_premissas = dict(premissas)
        p_quality_premissas["custo_vida_base"] = perfil["gasto_anual"]
        p_quality_premissas["idade_fire_alvo"] = age_q
        p_quality_premissas["anos_simulacao"] = HORIZONTE_VIDA - age_q
        p_q = compute_p_quality(p_quality_premissas, n_sim=n_sim, seed=seed)
        entry["p_quality"] = round(p_q * 100, 1)

        # Variantes bond pool para seletor no simulador
        p_q_proxy = compute_p_quality(p_quality_premissas, n_sim=n_sim, seed=seed,
                                      bond_pool_isolation=False)
        p_q_full  = compute_p_quality(p_quality_premissas, n_sim=n_sim, seed=seed,
                                      bond_pool_isolation=True,
                                      bond_pool_completion_fraction=1.0)
        entry["p_quality_proxy"] = round(p_q_proxy * 100, 1)
        entry["p_quality_full"]  = round(p_q_full  * 100, 1)

        results.append(entry)

    return results


# ─── MC LÍQUIDO (IR DIFERIDO DESCONTADO) ─────────────────────────────────────

def run_canonical_mc_with_ir_discount(ir_diferido: float,
                                       n_sim: int = 10_000,
                                       seed: int = 42) -> dict:
    """
    Roda Monte Carlo canônico (P(FIRE@53), cenário base) com patrimônio líquido.

    Metodologia: IR diferido descontado antes da simulação, per Lei 14.754/2023.
    O imposto latente sobre ganhos acumulados nos ETFs UCITS é uma obrigação
    econômica presente — reduz o patrimônio disponível para desacumulação.

    Fórmula:
        patrimonio_liquido = patrimonio_atual (de dashboard_state.json) - ir_diferido

    Args:
        ir_diferido: IR latente total em BRL (fonte: tax_snapshot.json,
                     campo ir_diferido_total_brl). Ex: 133_075.41
        n_sim: número de simulações (default 10k para consistência com MC bruto)
        seed: seed para reproducibilidade (default 42, mesmo do MC canônico)

    Returns:
        {
          "patrimonio_bruto":    float,   # patrimônio antes do desconto
          "ir_diferido":         float,   # desconto aplicado
          "patrimonio_liquido":  float,   # patrimônio_bruto - ir_diferido
          "pfire_bruto":         float,   # P(FIRE@53) base sem desconto (%)
          "pfire_liquido":       float,   # P(FIRE@53) base com desconto (%)
          "delta_pp":            float,   # pfire_liquido - pfire_bruto (pp, negativo)
          "n_sim":               int,
          "seed":                int,
          "cenario":             "base",
          "metodologia":         str,
          "_generated":          str,
        }
    """
    from datetime import date as _date

    # ── Patrimônio bruto (fonte canônica: dashboard_state.json) ──────────────
    pat_bruto = _load_patrimonio_atual()

    # ── Patrimônio líquido ────────────────────────────────────────────────────
    pat_liquido = pat_bruto - ir_diferido

    if pat_liquido <= 0:
        raise ValueError(
            f"patrimonio_liquido={pat_liquido:.0f} <= 0. "
            f"ir_diferido={ir_diferido:.0f} >= patrimonio_bruto={pat_bruto:.0f}. "
            "Verificar tax_snapshot.json."
        )

    # ── MC bruto (patrimônio original) ───────────────────────────────────────
    premissas_bruto = dict(PREMISSAS)
    premissas_bruto["idade_fire_alvo"] = IDADE_CENARIO_BASE  # 53
    premissas_bruto["anos_simulacao"]  = HORIZONTE_VIDA - IDADE_CENARIO_BASE
    # Garantir que usamos o patrimônio carregado (sem override externo)
    premissas_bruto["patrimonio_atual"] = pat_bruto

    r_bruto = rodar_monte_carlo(premissas_bruto, n_sim=n_sim, cenario="base", seed=seed)

    # ── MC líquido (patrimônio descontado de IR diferido) ────────────────────
    premissas_liquido = dict(premissas_bruto)
    premissas_liquido["patrimonio_atual"] = pat_liquido

    r_liquido = rodar_monte_carlo(premissas_liquido, n_sim=n_sim, cenario="base", seed=seed)

    pfire_bruto_canonical = canonicalize_pfire(r_bruto["p_sucesso"], source='mc')
    pfire_liquido_canonical = canonicalize_pfire(r_liquido["p_sucesso"], source='mc')
    pfire_bruto   = round(pfire_bruto_canonical.percentage, 1)
    pfire_liquido = round(pfire_liquido_canonical.percentage, 1)
    delta_pp      = round(pfire_liquido - pfire_bruto, 1)

    return {
        "patrimonio_bruto":   round(pat_bruto, 2),
        "ir_diferido":        round(ir_diferido, 2),
        "patrimonio_liquido": round(pat_liquido, 2),
        "pfire_bruto":        pfire_bruto,
        "pfire_liquido":      pfire_liquido,
        "delta_pp":           delta_pp,
        "pat_mediana_fire_bruto":  round(r_bruto["pat_mediana_fire"], 0),
        "pat_mediana_fire_liquido": round(r_liquido["pat_mediana_fire"], 0),
        "n_sim":              n_sim,
        "seed":               seed,
        "cenario":            "base",
        "metodologia": (
            "IR diferido descontado antes de simulação per Lei 14.754/2023. "
            "patrimonio_liquido = patrimonio_atual - ir_diferido_total_brl "
            "(fonte: tax_snapshot.json). Todas as demais premissas idênticas "
            "ao MC canônico (seed=42, 10k sims, spending smile, guardrails, "
            f"bond tent, INSS R$18k/ano@65, VCMH {SAUDE_INFLATOR*100:.1f}%)."
        ),
        "_generated": str(_date.today()),
    }


# ─── OUTPUT ───────────────────────────────────────────────────────────────────

def imprimir_resultados(resultados: list, premissas: dict):
    print("\n" + "═"*60)
    print("  P(FIRE) — MONTE CARLO 10k TRAJETÓRIAS")
    print(f"  Patrimônio atual: R$ {premissas['patrimonio_atual']:,.0f}")
    print(f"  Aporte mensal:    R$ {premissas['aporte_mensal']:,.0f}")
    print(f"  Custo de vida:    R$ {premissas['custo_vida_base']:,.0f}/ano (spending smile ativo)")
    print(f"  Horizonte FIRE:   {premissas['idade_fire_alvo']} anos (safe harbor: {premissas['idade_safe_harbor']})")
    print(f"  Desacumulação:    {premissas['anos_simulacao']} anos (até ~{premissas['idade_fire_alvo']+premissas['anos_simulacao']} anos)")
    print(f"  Gatilho formal:   R$ {premissas['patrimonio_gatilho']/1e6:.1f}M + SWR ≤ {premissas['swr_gatilho']:.1%}")
    if premissas.get("aplicar_ir_desacumulacao", False):
        print(f"  IR desacumulação: ATIVO — {premissas['aliquota_ir_equity']:.0%} sobre ganho nominal, bond pool {premissas['anos_bond_pool']} anos")
    else:
        print(f"  IR desacumulação: DESATIVADO (--sem-ir)")
    inss = premissas.get("inss_anual", 0)
    if inss > 0:
        print(f"  INSS:             R$ {inss:,.0f}/ano a partir do ano {premissas.get('inss_inicio_ano', 12)} (age {premissas['idade_fire_alvo'] + premissas.get('inss_inicio_ano', 12)})")
    vbp = premissas.get("vol_bond_pool")
    if vbp:
        print(f"  Vol bond pool:    {vbp:.1%} (anos 0-{premissas.get('anos_bond_pool',7)-1}) → {premissas['volatilidade_equity']:.1%} (anos {premissas.get('anos_bond_pool',7)}+)")

    # ── Calibração: comparar premissas vs dados reais do portfolio ──
    try:
        import json as _json
        _summary_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../dados/portfolio_summary.json")
        with open(_summary_path) as _f:
            _ps = _json.load(_f)
        _cagr_real = _ps["retorno_twr"]["cagr_pct"]
        _vol_real = _ps["risco"]["volatilidade_anual_pct"]
        _anos_real = _ps["periodo"]["anos"]
        print(f"\n  ── Calibração vs dados reais ({_anos_real:.0f} anos, TWR) ──")
        print(f"  Retorno real:  premissa {premissas['retorno_equity_base']:.2%} vs realizado {_cagr_real:.2f}% a.a.")
        print(f"  Volatilidade:  premissa {premissas['volatilidade_equity']:.1%} vs realizada {_vol_real:.1f}%")
        print(f"  (Premissas acadêmicas mantidas — dados reais como referência)")
    except Exception:
        pass
    print("═"*60)

    print(f"\n{'Cenário':<12} {'P(FIRE)':>8} {'P(Gatilho)':>11}  {'Pat.Mediana@50':>15}  {'r_equity':>10}")
    print("-"*62)
    for r in resultados:
        status = "✅" if r["p_sucesso"] >= 0.90 else ("⚠️ " if r["p_sucesso"] >= 0.80 else "🔴")
        print(f"{status} {r['cenario']:<10} {r['p_sucesso']:>7.1%}  {r['pct_gatilho_formal']:>10.1%}  "
              f"R$ {r['pat_mediana_fire']/1e6:>9.2f}M  "
              f"{r['retorno_equity_usado']:>9.2%}")

    print(f"\n  P(FIRE)    = % trajetórias que sobrevivem {premissas['anos_simulacao']} anos com spending smile + guardrails")
    print(f"  P(Gatilho) = % trajetórias que atingem R$13.4M + SWR ≤ 2.4% aos {premissas['idade_fire_alvo']} anos")
    print(f"\n  Meta: P(FIRE) ≥ 90%  |  Referência scorecard: 80.8% base (FR-spending-smile 2026-03-27)")
    print(f"  Safe harbor FIRE 53: rodar com --anos 14\n")


def imprimir_tornado(resultados: list, p_base: float):
    print("\n" + "═"*60)
    print("  TORNADO CHART — Sensibilidade de P(FIRE) a ±10%")
    print(f"  P(FIRE) base: {p_base:.1%}")
    print("═"*60)
    print(f"\n{'Variável':<35} {'▲ +10%':>8}  {'▼ -10%':>8}  {'Impacto Total':>13}")
    print("-"*68)
    for r in resultados:
        bar_up   = "█" * int(abs(r["impacto_up"])   * 200)
        bar_down = "█" * int(abs(r["impacto_down"]) * 200)
        print(f"  {r['variavel']:<33} {r['impacto_up']:>+7.1%}  {r['impacto_down']:>+7.1%}  {r['impacto_abs']:>12.1%}")
    print()


# ─── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="P(FIRE) — Monte Carlo Reproduzível")
    parser.add_argument("--patrimonio", type=float, help="Patrimônio atual (R$)")
    parser.add_argument("--aporte",     type=float, help="Aporte mensal (R$)")
    parser.add_argument("--anos",       type=int,   help="Anos até o FIRE alvo")
    parser.add_argument("--n-sim",      type=int,   default=10_000, help="Número de simulações (default: 10k)")
    parser.add_argument("--tornado",    action="store_true", help="Gerar tornado chart de sensibilidade (5k sims)")
    parser.add_argument("--sem-ir",    action="store_true", help="Desabilitar IR na desacumulação (backward compat)")
    parser.add_argument("--strategy",  type=str, default="guardrails", choices=STRATEGIES,
                        help=f"Withdrawal strategy (default: guardrails). Opções: {STRATEGIES}")
    parser.add_argument("--compare-strategies", action="store_true",
                        help="Comparar TODAS as withdrawal strategies lado a lado")
    parser.add_argument("--spending", type=float, default=None,
                        help="Override custo de vida base (R$/ano) para compare-strategies. Ex: --spending 300000")
    parser.add_argument("--retorno-equity", type=float, default=None,
                        help="Override retorno_equity_base (ex: 0.0395 para factor drought scenario)")
    parser.add_argument("--by-profile", action="store_true",
                        help="Rodar MC para 3 perfis (Atual/Casado/Filho) × 2 idades (50/53) e exportar fire_matrix.json")
    args = parser.parse_args()

    premissas = dict(PREMISSAS)
    if args.sem_ir:
        premissas["aplicar_ir_desacumulacao"] = False
    if args.patrimonio: premissas["patrimonio_atual"] = args.patrimonio
    if args.aporte:     premissas["aporte_mensal"] = args.aporte
    if args.anos:
        premissas["idade_fire_alvo"] = premissas["idade_atual"] + args.anos
    if args.spending:
        premissas["custo_vida_base"] = args.spending
    if args.retorno_equity is not None:
        premissas["retorno_equity_base"] = args.retorno_equity

    if args.by_profile:
        import json as _json
        from datetime import date as _date

        print(f"\n  Rodando MC por perfil ({args.n_sim:,} sims × 3 perfis × 2 idades × 3 cenários = {args.n_sim * 18:,} runs)...")
        by_profile = rodar_mc_by_profile(premissas, n_sim=args.n_sim, seed=42)

        # Print results
        print(f"\n{'Perfil':<22} {'P(50) Base':>10} {'P(53) Base':>10} {'P(50) Stress':>12} {'P(53) Stress':>12}")
        print("-" * 70)
        for p in by_profile:
            status_50 = "+" if p["p_fire_50"] >= 90 else ("~" if p["p_fire_50"] >= 80 else "-")
            status_53 = "+" if p["p_fire_53"] >= 90 else ("~" if p["p_fire_53"] >= 80 else "-")
            print(f"  {status_50}{status_53} {p['label']:<20} {p['p_fire_50']:>9.1f}% {p['p_fire_53']:>9.1f}% "
                  f"{p.get('p_fire_50_stress', 0):>11.1f}% {p.get('p_fire_53_stress', 0):>11.1f}%")
        print()

        # Merge into fire_matrix.json (preserve existing matrix data)
        fire_matrix_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../dados/fire_matrix.json")
        existing = {}
        try:
            with open(fire_matrix_path) as f:
                existing = _json.load(f)
        except Exception:
            pass

        # Update perfis metadata + add by_profile MC results
        existing["perfis"] = {pid: {"label": pf["label"], "gasto_anual": pf["gasto_anual"],
                                     "descricao": pf["descricao"]}
                              for pid, pf in PERFIS_FIRE.items()}
        existing["by_profile"] = by_profile
        existing["_by_profile_generated"] = str(_date.today())
        existing["_by_profile_n_sim"] = args.n_sim

        with open(fire_matrix_path, "w") as f:
            _json.dump(existing, f, indent=2, ensure_ascii=False)
        print(f"  ✓ fire_matrix.json atualizado com by_profile ({len(by_profile)} perfis)")

        # Write to dedicated fire_by_profile.json (never overwritten by regular pipeline)
        by_profile_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../dados/fire_by_profile.json")
        with open(by_profile_path, "w") as f:
            _json.dump(by_profile, f, indent=2, ensure_ascii=False)
        print(f"  ✓ fire_by_profile.json atualizado (fonte primária imutável pelo pipeline)")

        # Also update dashboard_state.json for generate_data.py
        fire_state = {}
        try:
            from config import load_dashboard_state
            fire_state = load_dashboard_state().get("fire", {})
        except Exception:
            pass
        fire_state["by_profile"] = by_profile
        update_dashboard_state("fire", fire_state, generator="fire_montecarlo.py --by-profile")
        print(f"  ✓ dashboard_state.json fire.by_profile atualizado\n")
        return

    if args.compare_strategies:
        print(f"\n  Comparando {len(STRATEGIES)} withdrawal strategies ({args.n_sim:,} sims cada)...\n")

        # Precompute accumulation once (strategy-independent) — saves ~80% of compute
        r_equity = _retorno_equity_cenario(premissas, "base")
        anos_acum = premissas["idade_fire_alvo"] - premissas["idade_atual"]
        rng_acum = np.random.default_rng(42)
        pat_fire = projetar_acumulacao(premissas, r_equity, "base", args.n_sim, rng_acum, anos_acum)

        # Compute spending stats via direct simulation (track_spending=True)
        aplicar_ir = premissas.get("aplicar_ir_desacumulacao", False)
        anos_bond_pool = premissas.get("anos_bond_pool", 7)
        ipca_anual = premissas.get("ipca_anual", 0.04)
        aliquota_ir = premissas.get("aliquota_ir_equity", 0.15)
        inss_anual = premissas.get("inss_anual", 0.0)
        inss_inicio_ano = premissas.get("inss_inicio_ano", 12)
        vol_bond_pool = premissas.get("vol_bond_pool", None)
        n_anos = premissas["anos_simulacao"]
        df_t = premissas["t_dist_df"]
        vol_eq = premissas["volatilidade_equity"]

        print(f"  {'Strategy':<20} {'P(FIRE)':>8} {'Gasto Médio':>13} {'Vol Gasto':>11} {'P10–P90':>22}")
        print("  " + "-" * 80)
        for strat in STRATEGIES:
            r = rodar_monte_carlo(premissas, n_sim=args.n_sim, cenario="base",
                                  strategy=strat, pat_fire_precomputed=pat_fire)

            # Spending stats via subset (2k sims for speed)
            rng_sp = np.random.default_rng(42)
            rng_sp.standard_t(df_t, size=args.n_sim * anos_acum)  # advance past accum
            n_spend = min(args.n_sim, 2000)
            all_gastos = []
            for i in range(n_spend):
                pat_ini = float(pat_fire[i])
                _, _, _, gastos = simular_trajetoria(
                    pat_ini, n_anos, r_equity, vol_eq, df_t, rng_sp,
                    aplicar_ir=aplicar_ir, anos_bond_pool=anos_bond_pool,
                    ipca_anual=ipca_anual, aliquota_ir=aliquota_ir,
                    inss_anual=inss_anual, inss_inicio_ano=inss_inicio_ano,
                    vol_bond_pool=vol_bond_pool, strategy=strat, track_spending=True
                )
                if gastos:
                    all_gastos.extend(gastos)
            gasto_arr = np.array(all_gastos)
            g_med = np.mean(gasto_arr) / 1000
            g_std = np.std(gasto_arr) / 1000
            g_p10 = np.percentile(gasto_arr, 10) / 1000
            g_p90 = np.percentile(gasto_arr, 90) / 1000

            status = "+" if r["p_sucesso"] >= 0.90 else ("~" if r["p_sucesso"] >= 0.80 else "-")
            range_str = f"R${g_p10:.0f}k–R${g_p90:.0f}k"
            print(f"  {status} {strat:<20} {r['p_sucesso']:>7.1%}  R${g_med:>7.1f}k  ±R${g_std:>5.1f}k  {range_str:>22}")
        print()
        return

    print(f"\n  Rodando {args.n_sim:,} simulacoes (strategy: {args.strategy})...")

    resultados = []
    for cenario in ["base", "favoravel", "stress"]:
        print(f"   Cenario {cenario}...", end=" ", flush=True)
        r = rodar_monte_carlo(premissas, n_sim=args.n_sim, cenario=cenario, strategy=args.strategy)
        resultados.append(r)
        print(f"P(FIRE) = {r['p_sucesso']:.1%}")

    imprimir_resultados(resultados, premissas)

    # ── Export dashboard_state.json ──
    from datetime import date
    idade_fire = premissas.get("idade_fire_alvo", premissas["idade_cenario_base"])

    # Detectar cenário: base (53) ou aspiracional (49)
    cenario = "base" if idade_fire == IDADE_CENARIO_BASE else "aspiracional"

    fire_data_existing = {}
    try:
        from config import load_dashboard_state
        fire_data_existing = load_dashboard_state().get("fire", {})
    except Exception:
        pass

    fire_data = {**fire_data_existing}  # preserva campos existentes
    pfire_base_canonical = canonicalize_pfire(resultados[0]["p_sucesso"], source='mc')
    fire_data.update({
        "pfire_base": round(pfire_base_canonical.percentage, 1),
        "pfire_fav":  round(canonicalize_pfire(resultados[1]["p_sucesso"], source='mc').percentage, 1) if len(resultados) > 1 else None,
        "pfire_stress": round(canonicalize_pfire(resultados[2]["p_sucesso"], source='mc').percentage, 1) if len(resultados) > 2 else None,
        "pat_mediano_fire": round(resultados[0]["pat_mediana_fire"], 0),
        "pat_p10_fire": round(resultados[0]["pat_p10_fire"], 0),
        "pat_p90_fire": round(resultados[0]["pat_p90_fire"], 0),
        "mc_date": str(date.today()),
    })
    # Salvar com chave específica do cenário (base ou aspiracional)
    prefix = f"pfire_{cenario}"
    fire_data[f"{prefix}_base"]   = fire_data["pfire_base"]
    fire_data[f"{prefix}_fav"]    = fire_data["pfire_fav"]
    fire_data[f"{prefix}_stress"] = fire_data["pfire_stress"]
    # Patrimônio percentis específicos por cenário
    fire_data[f"pat_mediano_{cenario}"] = round(resultados[0]["pat_mediana_fire"], 0)
    fire_data[f"pat_p10_{cenario}"]     = round(resultados[0]["pat_p10_fire"], 0)
    fire_data[f"pat_p90_{cenario}"]     = round(resultados[0]["pat_p90_fire"], 0)

    # P(quality) — cenário base e aspiracional (FR-pquality-recalibration 2026-04-29)
    if cenario in ("base", "aspiracional"):
        print(f"  Calculando P(quality) ({cenario}, {args.n_sim:,} sims)...")
        bond_pool_isolation_active = premissas.get("bond_pool_isolation", False)
        # Proxy (modelo antigo — sempre rodar para comparação histórica)
        p_quality_proxy = compute_p_quality(premissas, n_sim=args.n_sim, bond_pool_isolation=False)
        # Canônico (com isolation se habilitada) — todos os 3 cenários macro
        p_quality     = compute_p_quality(premissas, n_sim=args.n_sim,
                                          bond_pool_isolation=bond_pool_isolation_active, cenario="base")
        p_quality_fav = compute_p_quality(premissas, n_sim=args.n_sim,
                                          bond_pool_isolation=bond_pool_isolation_active, cenario="favoravel")
        p_quality_stress = compute_p_quality(premissas, n_sim=args.n_sim,
                                             bond_pool_isolation=bond_pool_isolation_active, cenario="stress")
        # Full (potencial quando bucket completo — vol=0, 100% spending do bucket)
        p_quality_full = compute_p_quality(premissas, n_sim=args.n_sim,
                                           bond_pool_isolation=True,
                                           bond_pool_completion_fraction=1.0)
        key = "p_quality" if cenario == "base" else "p_quality_aspiracional"
        fire_data[key] = round(p_quality * 100, 1)
        fire_data["p_quality_fav"]    = round(p_quality_fav * 100, 1)
        fire_data["p_quality_stress"] = round(p_quality_stress * 100, 1)
        fire_data["p_quality_proxy"]  = round(p_quality_proxy * 100, 1)
        fire_data["p_quality_full"]   = round(p_quality_full * 100, 1)
        print(f"  P(quality) [{cenario}]: {p_quality:.1%} base, {p_quality_fav:.1%} fav, {p_quality_stress:.1%} stress | proxy {p_quality_proxy:.1%} | full {p_quality_full:.1%}")
        # Bond pool status
        fire_data["bond_pool_status"] = premissas.get("bond_pool_status", {})
        fire_data["bond_pool_isolation_enabled"] = premissas.get("bond_pool_isolation", False)
        fire_data["bond_pool_completion_pct"] = (premissas.get("bond_pool_status") or {}).get("completion_pct", 0.0)
        fire_data["bond_pool_fully_enabled"] = premissas.get("bond_pool_status", {}).get("fully_enabled", False)
        fire_data["bond_pool_completion_fraction"] = premissas.get("bond_pool_completion_fraction", 0.0)

    update_dashboard_state("fire", fire_data, generator="fire_montecarlo.py")

    if args.tornado:
        print("  Calculando tornado chart (5k sims por variavel)...")
        tornado = rodar_tornado(premissas, n_sim=5_000)
        imprimir_tornado(tornado, resultados[0]["p_sucesso"])

        # Salvar tornado no dashboard_state.json para o pipeline generate_data.py
        tornado_data = []
        for r in tornado:
            tornado_data.append({
                "variavel": r["variavel"],
                "mais10":   round(r["impacto_up"] * 100, 1),   # em pp
                "menos10":  round(r["impacto_down"] * 100, 1), # em pp
            })
        fire_data_with_tornado = {**fire_data, "tornado": tornado_data}
        update_dashboard_state("fire", fire_data_with_tornado, generator="fire_montecarlo.py")


if __name__ == "__main__":
    main()
