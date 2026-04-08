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
import numpy as np
import warnings
warnings.filterwarnings("ignore")

import sys as _sys
from pathlib import Path as _Path
_sys.path.insert(0, str(_Path(__file__).parent))
from config import (
    APORTE_MENSAL, CUSTO_VIDA_BASE,
    IDADE_ATUAL, IDADE_FIRE_ALVO, IDADE_FIRE_ASPIRACIONAL,
    IPCA_LONGO_PCT, IPCA_CURTO_PCT, EQUITY_PCT, CRIPTO_PCT,
    IR_ALIQUOTA, PATRIMONIO_GATILHO, SWR_GATILHO,
    update_dashboard_state,
)

# ─── PREMISSAS (fonte: carteira.md + HD-006 final 2026-03-22) ─────────────────

PREMISSAS = {
    # Patrimônio e aportes
    "patrimonio_atual":    3_372_673,   # R$ — atualizar a cada sessão
    "aporte_mensal":       APORTE_MENSAL,
    "custo_vida_base":     CUSTO_VIDA_BASE,

    # Horizonte
    "idade_atual":         IDADE_ATUAL,
    "idade_fire_alvo":     IDADE_FIRE_ALVO,
    "idade_fire_aspiracional": IDADE_FIRE_ASPIRACIONAL,
    "idade_safe_harbor":   53,
    "anos_simulacao":      37,          # anos de desacumulação (53→90)

    # Retornos reais anuais em BRL — cenário BASE (fonte: carteira.md premissas HD-006)
    "retorno_equity_base": 0.0485,      # 4.85% real BRL ponderado base (SWRD 50%/AVGS 30%/AVEM 20%, aprovado FI-premissas-retorno 2026-04-01)
    "retorno_ipca_plus":   0.0600,      # 6.0% real líquido HTM 14 anos
    "volatilidade_equity": 0.168,       # 16.8% — equity equivalent FR-equity-equivalent
    "t_dist_df":           5,           # fat tails (t-student df=5)

    # Depreciação BRL (cenários)
    "dep_brl_base":        0.005,       # 0.5%/ano
    "dep_brl_favoravel":   0.015,       # 1.5%/ano
    "dep_brl_stress":      0.000,       # 0.0%/ano

    # Ajuste de retorno por cenário (aplicado sobre equity)
    "adj_favoravel":       +0.010,      # +1.0pp
    "adj_stress":          -0.005,      # -0.5pp

    # Bond tent
    "pct_ipca_longo":      IPCA_LONGO_PCT,
    "pct_ipca_curto":      IPCA_CURTO_PCT,
    "pct_equity":          EQUITY_PCT,
    "pct_cripto":          CRIPTO_PCT,

    # IPCA estimado (para converter nominais)
    "ipca_anual":          0.04,        # 4%/ano

    # IR na desacumulação (FR-ir-desacumulacao)
    "aplicar_ir_desacumulacao": True,   # default True — modelagem correta
    "anos_bond_pool":           7,      # anos pós-FIRE cobertos pelo bond pool (sem IR equity)
    "aliquota_ir_equity":       IR_ALIQUOTA,

    # INSS (HD-mc-audit 2026-04-06)
    "inss_anual":               18_000, # R$18k/ano real — estimativa central (TX-inss-beneficio: R$46-55k nominal, uso R$18k real conservador)
    "inss_inicio_ano":          12,     # ano 12 pós-FIRE = age 65

    # Volatilidade por fase (HD-mc-audit 2026-04-06)
    # Anos 0-6 (bond pool ativo): vol reduzida pela participação real do portfólio
    # vol_bond_pool = pct_equity × vol_equity = 0.79 × 0.168 = 13.3%
    # Anos 7+: vol cheia (portfólio ~97% equity após bond pool consumido)
    "vol_bond_pool":            0.133,  # 79% × 16.8% — vol portfólio durante bond pool

    # Gatilho FIRE
    "patrimonio_gatilho":  PATRIMONIO_GATILHO,
    "swr_gatilho":         SWR_GATILHO,
}

# ─── SPENDING SMILE (fonte: FR-spending-smile 2026-03-27) ─────────────────────

SPENDING_SMILE = {
    # Fase: gasto LIFESTYLE EX-SAÚDE (saúde é somada separadamente via gasto_spending_smile)
    # Fonte: FR-spending-smile (2026-03-27) — corrigido HD-mc-audit (2026-04-06)
    # Valores originais (R$280k/225k/285k) embutiam saúde R$37.9k (modelo antigo) — double-count
    # Corretos: lifestyle-only conforme tabela de breakdown da issue
    "go_go":   {"gasto": 242_000, "inicio": 0,  "fim": 15},   # anos 0–14 pós-FIRE
    "slow_go": {"gasto": 200_000, "inicio": 15, "fim": 30},   # anos 15–29
    "no_go":   {"gasto": 187_000, "inicio": 30, "fim": 99},   # anos 30+ (saúde domina)
}

SAUDE_BASE         = 18_000   # R$/ano no FIRE 53 — plano empresarial coletivo PJ (revisado 2026-04-06, HD-multimodel-premissas Bloco A)
SAUDE_INFLATOR     = 0.027    # 2.7%/ano real — VCMH IESS média 18 anos (revisado 2026-04-02)
SAUDE_INFLATOR_CAP = 0.060    # 6.0% cap conservador
SAUDE_DECAY        = 0.50     # 50% após No-Go (mobilidade cai; cuidado institucional já no no_go base)
IDADE_FIRE_SAUDE   = 53       # idade no FIRE Day (faixa ANS 49-53 = 3.0×)

# ─── GUARDRAILS (fonte: carteira.md, aprovados 2026-03-20) ────────────────────

GUARDRAILS = [
    # (drawdown_min, drawdown_max, corte_pct, descricao)
    (0.00, 0.15, 0.00, "Normal — sem corte"),
    (0.15, 0.25, 0.10, "Corte 10% → R$225k"),
    (0.25, 0.35, 0.20, "Corte 20% → R$200k"),
    (0.35, 1.00, 0.28, "Piso — R$180k"),
]
GASTO_PISO = 180_000

# ─── WITHDRAWAL STRATEGIES (fonte: FR-withdrawal-engine 2026-04-07) ──────────
# Cada strategy é uma função que recebe (gasto_smile, pat, pat_pico, ano, ctx)
# e retorna o gasto efetivo do ano.

STRATEGIES = ["guardrails", "constant", "pct_portfolio", "vpw", "guyton_klinger", "gk_hybrid"]

# Strategy constants — withdrawal caps/floors and Guyton-Klinger thresholds
GASTO_TETO_PCT      = 400_000  # R$/ano — teto percent-of-portfolio (evita overshooting em bull markets)
GASTO_TETO_VPW      = 500_000  # R$/ano — teto VPW
GASTO_TETO_GK_CAP   = 350_000  # R$/ano — teto GK híbrido (alinhado com guardrails teto)
VPW_REAL_RATE        = 0.035   # 3.5% real conservador para projeção interna VPW
GK_PRESERVATION_MULT = 1.20    # Capital Preservation: corta se WR > 120% do inicial
GK_PROSPERITY_MULT   = 0.80    # Prosperity Rule: sobe se WR < 80% do inicial
GK_CUT_FACTOR        = 0.90    # fator de corte Capital Preservation
GK_RAISE_FACTOR      = 1.10    # fator de aumento Prosperity Rule
GK_MAX_AGE           = 85      # idade-limite para regras de ajuste (paper Guyton-Klinger 2006)
SWR_FALLBACK         = 0.035   # SWR default quando patrimônio_inicial desconhecido


@dataclass
class WithdrawalCtx:
    """State shared across years within a single withdrawal simulation."""
    swr_inicial: float = SWR_FALLBACK
    anos_total: int = 37
    retorno_ano: float = 0.0
    ipca_anual: float = 0.04
    # Guyton-Klinger mutable state
    gasto_prev_gk: float = 0.0
    swr_inicial_gk: float = 0.0
    _gk_initialized: bool = False

    def init_gk(self, gasto_smile: float):
        """Lazy-init GK state on first withdrawal year."""
        if not self._gk_initialized:
            self.gasto_prev_gk = gasto_smile
            self.swr_inicial_gk = self.swr_inicial
            self._gk_initialized = True


def _clamp(gasto: float, teto: float = None) -> float:
    """Aplica piso (GASTO_PISO) e teto opcional ao gasto."""
    if teto is not None:
        return max(GASTO_PISO, min(gasto, teto))
    return max(GASTO_PISO, gasto)


def withdrawal_guardrails(gasto_smile, pat, pat_pico, ano, ctx):
    """Drawdown-based guardrails (nossa estrategia atual)."""
    drawdown = max(0, 1 - pat / pat_pico) if pat_pico > 0 else 0
    return aplicar_guardrail(gasto_smile, drawdown)

def withdrawal_constant(gasto_smile, pat, pat_pico, ano, ctx):
    """Constant-dollar: spending smile puro, sem ajuste por mercado."""
    return gasto_smile

def withdrawal_pct_portfolio(gasto_smile, pat, pat_pico, ano, ctx):
    """Percent-of-portfolio: SWR inicial aplicada ao patrimonio corrente."""
    gasto = pat * ctx.swr_inicial
    return _clamp(gasto, GASTO_TETO_PCT)

def withdrawal_vpw(gasto_smile, pat, pat_pico, ano, ctx):
    """Variable Percentage Withdrawal (Bogleheads).
    PMT actuarial simplificado com r_real = VPW_REAL_RATE.
    """
    anos_restantes = ctx.anos_total - ano
    if anos_restantes <= 0:
        return pat

    vpw_rate = VPW_REAL_RATE / (1 - (1 + VPW_REAL_RATE) ** (-anos_restantes))
    gasto = pat * vpw_rate
    return _clamp(gasto, GASTO_TETO_VPW)

def withdrawal_guyton_klinger(gasto_smile, pat, pat_pico, ano, ctx):
    """Guyton-Klinger Decision Rules (2006).
    1. Withdrawal Rule: forgo inflation adjustment em anos de retorno negativo
    2. Capital Preservation: corta se WR > 120% do inicial
    3. Prosperity Rule: sobe se WR < 80% do inicial
    """
    ctx.init_gk(gasto_smile)
    anos_gk_limit = GK_MAX_AGE - PREMISSAS["idade_fire_alvo"]

    if ctx.retorno_ano >= 0:
        gasto = ctx.gasto_prev_gk
    else:
        gasto = ctx.gasto_prev_gk / (1 + ctx.ipca_anual)

    wr_current = gasto / pat if pat > 0 else 1.0

    if ano < anos_gk_limit:
        if wr_current > ctx.swr_inicial_gk * GK_PRESERVATION_MULT:
            gasto *= GK_CUT_FACTOR
        elif wr_current < ctx.swr_inicial_gk * GK_PROSPERITY_MULT:
            gasto *= GK_RAISE_FACTOR

    gasto = _clamp(gasto)
    ctx.gasto_prev_gk = gasto
    return gasto

def withdrawal_gk_hybrid(gasto_smile, pat, pat_pico, ano, ctx):
    """GK Híbrido: regras Guyton-Klinger + teto R$350k (guardrails cap) + floor R$180k.
    Captura a flexibilidade de GK sem o runaway spending dos anos finais.
    Implementado em FR-withdrawal-engine (Advocate, 2026-04-07).
    """
    ctx.init_gk(gasto_smile)
    anos_gk_limit = GK_MAX_AGE - PREMISSAS["idade_fire_alvo"]

    if ctx.retorno_ano >= 0:
        gasto = ctx.gasto_prev_gk
    else:
        gasto = ctx.gasto_prev_gk / (1 + ctx.ipca_anual)

    wr_current = gasto / pat if pat > 0 else 1.0

    if ano < anos_gk_limit:
        if wr_current > ctx.swr_inicial_gk * GK_PRESERVATION_MULT:
            gasto *= GK_CUT_FACTOR
        elif wr_current < ctx.swr_inicial_gk * GK_PROSPERITY_MULT:
            gasto *= GK_RAISE_FACTOR

    gasto = _clamp(gasto, GASTO_TETO_GK_CAP)
    ctx.gasto_prev_gk = gasto
    return gasto


STRATEGY_FNS = {
    "guardrails": withdrawal_guardrails,
    "constant": withdrawal_constant,
    "pct_portfolio": withdrawal_pct_portfolio,
    "vpw": withdrawal_vpw,
    "guyton_klinger": withdrawal_guyton_klinger,
    "gk_hybrid": withdrawal_gk_hybrid,
}


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


def gasto_spending_smile(ano_pos_fire: int, ipca_acumulado: float,
                          escala_custo_vida: float = 1.0) -> float:
    """Gasto base ajustado pelo spending smile + saúde, em R$ reais (base 2026).

    escala_custo_vida: fator de escala relativo à base R$250k (ex: 1.1 = +10%).
    Usado pelo tornado para medir sensibilidade ao custo de vida.
    """
    for fase, cfg in SPENDING_SMILE.items():
        if cfg["inicio"] <= ano_pos_fire < cfg["fim"]:
            gasto_base = cfg["gasto"] * escala_custo_vida
            break
    else:
        gasto_base = SPENDING_SMILE["no_go"]["gasto"] * escala_custo_vida

    # Saúde: VCMH 2.7%/ano real + saltos discretos ANS por faixa etária (RN 63/2003)
    taxa_efetiva = min(SAUDE_INFLATOR, SAUDE_INFLATOR_CAP)
    saude_vcmh = SAUDE_BASE * (1 + taxa_efetiva) ** ano_pos_fire
    saude = saude_vcmh * ans_faixa_multiplier(ano_pos_fire)
    if ano_pos_fire >= SPENDING_SMILE["no_go"]["inicio"]:
        saude *= SAUDE_DECAY

    return gasto_base + saude


def aplicar_guardrail(gasto_base: float, drawdown: float) -> float:
    """Aplica guardrail de retirada com base no drawdown atual."""
    for dd_min, dd_max, corte, _ in GUARDRAILS:
        if dd_min <= drawdown < dd_max:
            return _clamp(gasto_base * (1 - corte))
    return GASTO_PISO


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


def simular_trajetoria(patrimonio_inicial: float, n_anos: int, retorno_equity: float,
                        volatilidade: float, df: int, rng: np.random.Generator,
                        escala_custo_vida: float = 1.0,
                        aplicar_ir: bool = False, anos_bond_pool: int = 7,
                        ipca_anual: float = 0.04, aliquota_ir: float = 0.15,
                        inss_anual: float = 0.0, inss_inicio_ano: int = 12,
                        vol_bond_pool: float = None,
                        strategy: str = "guardrails",
                        track_spending: bool = False) -> tuple:
    """
    Simula uma trajetória de desacumulação.
    Retorna (sobreviveu: bool, patrimônio_final: float, patrimônio_pico: float, gastos: list|None)

    strategy: "guardrails" (default), "constant", "pct_portfolio", "vpw", "guyton_klinger", "gk_hybrid"
    track_spending: se True, retorna lista de gastos anuais no 4º elemento
    """
    pat = patrimonio_inicial
    pat_pico = patrimonio_inicial
    strategy_fn = STRATEGY_FNS[strategy]
    gastos_hist = [] if track_spending else None

    ctx = WithdrawalCtx(
        swr_inicial=PREMISSAS["custo_vida_base"] / patrimonio_inicial if patrimonio_inicial > 0 else SWR_FALLBACK,
        anos_total=n_anos,
        ipca_anual=ipca_anual,
    )

    t_scale = np.sqrt(df / (df - 2))
    for ano in range(n_anos):
        vol_ano = vol_bond_pool if (vol_bond_pool is not None and ano < anos_bond_pool) else volatilidade

        z = rng.standard_t(df) / t_scale
        retorno_anual = retorno_equity + vol_ano * z

        if aplicar_ir and ano >= anos_bond_pool:
            retorno_anual = retorno_equity_net_ir(retorno_anual, ipca_anual, aliquota_ir)

        ctx.retorno_ano = retorno_anual

        pat = pat * (1 + retorno_anual)
        pat_pico = max(pat_pico, pat)

        gasto_base = gasto_spending_smile(ano, 0, escala_custo_vida)
        gasto = strategy_fn(gasto_base, pat, pat_pico, ano, ctx)

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
            strategy=strategy
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

    for _ in range(n_anos):
        z = rng.standard_t(df, size=n_sim) / np.sqrt(df / (df - 2))
        retorno_carteira = (
            premissas["pct_equity"]    * (r_equity + premissas["volatilidade_equity"] * z) +
            premissas["pct_ipca_longo"] * premissas["retorno_ipca_plus"] +
            premissas["pct_cripto"]    * (r_equity + 2 * premissas["volatilidade_equity"] * z)  # proxy cripto: 2x vol
        )
        pat = pat * (1 + retorno_carteira) + aporte_anual

    return pat


def rodar_tornado(premissas: dict, variacao: float = 0.10, n_sim: int = 5_000) -> list:
    """
    Tornado chart: impacto de ±variacao% em cada premissa sobre P(FIRE).
    """
    base = rodar_monte_carlo(premissas, n_sim=n_sim, cenario="base")
    p_base = base["p_sucesso"]

    variaveis = {
        "retorno_equity_base": "Retorno equity (+/-10%)",
        "aporte_mensal":       "Aporte mensal (+/-10%)",
        "custo_vida_base":     "Custo de vida (+/-10%)",
        "volatilidade_equity": "Volatilidade equity (+/-10%)",
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

    return sorted(resultados, key=lambda x: x["impacto_abs"], reverse=True)


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
    fire_data = {
        "pfire_base": round(resultados[0]["p_sucesso"] * 100, 1),
        "pfire_fav": round(resultados[1]["p_sucesso"] * 100, 1) if len(resultados) > 1 else None,
        "pfire_stress": round(resultados[2]["p_sucesso"] * 100, 1) if len(resultados) > 2 else None,
        "pat_mediano_fire": round(resultados[0]["pat_mediana_fire"], 0),
        "pat_p10_fire": round(resultados[0]["pat_p10_fire"], 0),
        "pat_p90_fire": round(resultados[0]["pat_p90_fire"], 0),
        "mc_date": str(date.today()),
    }
    update_dashboard_state("fire", fire_data, generator="fire_montecarlo.py")

    if args.tornado:
        print("  Calculando tornado chart (5k sims por variavel)...")
        tornado = rodar_tornado(premissas, n_sim=5_000)
        imprimir_tornado(tornado, resultados[0]["p_sucesso"])


if __name__ == "__main__":
    main()
