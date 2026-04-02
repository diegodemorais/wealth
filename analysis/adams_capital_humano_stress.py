#!/usr/bin/env python3
"""
adams_capital_humano_stress.py — Stress test: correlacao capital humano x equity
Issue: HD-adams-capitalhumano

Cenarios:
  A) Base: aportes normais, equity 4.85% real BRL
  B) Stress correlacionado: -50% renda 3 anos + equity -40% ano 1
  C) Stress severo: renda zero 5 anos + equity -40% ano 1

Monte Carlo 10k trajetorias, seed=42, t-student df=5 (fat tails).
Premissas: carteira.md 2026-04-01

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import numpy as np

# ─── PREMISSAS (fonte: carteira.md 2026-04-01, HD-006 final) ─────────────────

PATRIMONIO_ATUAL   = 3_372_673   # R$ (carteira.md)
APORTE_MENSAL      = 25_000      # R$ (carteira.md)
APORTE_ANUAL       = APORTE_MENSAL * 12  # R$ 300,000/ano
CUSTO_VIDA_BASE    = 250_000     # R$/ano

IDADE_ATUAL        = 39
IDADE_FIRE         = 53          # FIRE 2040
ANOS_ACUM          = IDADE_FIRE - IDADE_ATUAL  # 14 anos
ANOS_DESACUM       = 37          # 53 -> 90

# Retornos reais anuais BRL
R_EQUITY_BASE      = 0.0485      # 4.85% ponderado (SWRD 50%/AVGS 30%/AVEM 20%)
R_IPCA_PLUS        = 0.0600      # 6.0% real liquido HTM
VOL_EQUITY         = 0.168       # 16.8%
T_DF               = 5           # fat tails

# Alocacao
PCT_EQUITY         = 0.79
PCT_IPCA           = 0.15
PCT_CRIPTO         = 0.03

# FIRE gates
PATRIMONIO_GATE    = 8_000_000   # R$ — gate minimo do playbook (pedido no brief)
PATRIMONIO_GATILHO = 13_400_000  # R$ — gatilho formal FIRE
SWR_GATILHO        = 0.024

N_SIM              = 10_000
SEED               = 42

# Spending smile (fonte: FR-spending-smile 2026-03-27)
SPENDING_SMILE = {
    "go_go":   {"gasto": 280_000, "inicio": 0,  "fim": 15},
    "slow_go": {"gasto": 225_000, "inicio": 15, "fim": 30},
    "no_go":   {"gasto": 285_000, "inicio": 30, "fim": 99},
}

SAUDE_BASE         = 16_000
SAUDE_INFLATOR     = 0.027
SAUDE_DECAY        = 0.50
IDADE_FIRE_SAUDE   = 53

# Guardrails
GUARDRAILS = [
    (0.00, 0.15, 0.00),
    (0.15, 0.25, 0.10),
    (0.25, 0.35, 0.20),
    (0.35, 1.00, 0.28),
]
GASTO_PISO = 180_000


# ─── FUNCOES AUXILIARES ──────────────────────────────────────────────────────

def ans_faixa_multiplier(ano_pos_fire: int) -> float:
    idade = IDADE_FIRE_SAUDE + ano_pos_fire
    if idade >= 64: return 6.0 / 3.0
    if idade >= 59: return 5.0 / 3.0
    if idade >= 54: return 4.0 / 3.0
    return 1.0


def gasto_spending_smile(ano_pos_fire: int) -> float:
    for fase, cfg in SPENDING_SMILE.items():
        if cfg["inicio"] <= ano_pos_fire < cfg["fim"]:
            gasto_base = cfg["gasto"]
            break
    else:
        gasto_base = SPENDING_SMILE["no_go"]["gasto"]

    saude_vcmh = SAUDE_BASE * (1 + min(SAUDE_INFLATOR, 0.06)) ** ano_pos_fire
    saude = saude_vcmh * ans_faixa_multiplier(ano_pos_fire)
    if ano_pos_fire >= SPENDING_SMILE["no_go"]["inicio"]:
        saude *= SAUDE_DECAY
    return gasto_base + saude


def aplicar_guardrail(gasto_base: float, drawdown: float) -> float:
    for dd_min, dd_max, corte in GUARDRAILS:
        if dd_min <= drawdown < dd_max:
            return max(gasto_base * (1 - corte), GASTO_PISO)
    return GASTO_PISO


def simular_desacumulacao(pat_inicial: float, r_equity: float,
                           rng: np.random.Generator) -> tuple:
    """Retorna (sobreviveu, pat_final)."""
    pat = pat_inicial
    pat_pico = pat_inicial
    for ano in range(ANOS_DESACUM):
        z = rng.standard_t(T_DF) / np.sqrt(T_DF / (T_DF - 2))
        retorno = r_equity + VOL_EQUITY * z
        pat *= (1 + retorno)
        pat_pico = max(pat_pico, pat)
        gasto_base = gasto_spending_smile(ano)
        dd = max(0, 1 - pat / pat_pico)
        gasto = aplicar_guardrail(gasto_base, dd)
        pat -= gasto
        if pat <= 0:
            return False, 0.0
    return True, pat


# ─── ACUMULACAO COM STRESS ───────────────────────────────────────────────────

def projetar_acumulacao_stress(cenario: str, rng: np.random.Generator) -> np.ndarray:
    """
    Projeta patrimonio no FIRE Day para N_SIM trajetorias.

    Cenario A (base): aportes R$300k/ano, retornos estocasticos normais
    Cenario B (correl): anos 1-3 aporte = R$150k/ano (metade), ano 1 equity -40% forcado
    Cenario C (severo): anos 1-5 aporte = R$0, ano 1 equity -40% forcado

    Retornos estocasticos para todos os anos exceto o ano 1 forcado nos cenarios B/C.
    """
    vol_portfolio = VOL_EQUITY * PCT_EQUITY
    pat = np.full(N_SIM, float(PATRIMONIO_ATUAL))

    for ano in range(ANOS_ACUM):
        # Retorno estocastico base
        z = rng.standard_t(T_DF, size=N_SIM) / np.sqrt(T_DF / (T_DF - 2))
        r_equity_estoc = R_EQUITY_BASE + VOL_EQUITY * z

        # Retorno da carteira (equity + IPCA + cripto)
        retorno_carteira = (
            PCT_EQUITY * r_equity_estoc +
            PCT_IPCA   * R_IPCA_PLUS +
            PCT_CRIPTO * (R_EQUITY_BASE + 2 * VOL_EQUITY * z)
        )

        # Aporte do ano (default = normal)
        aporte = APORTE_ANUAL

        if cenario == "B":
            # Anos 0-2 (2026-2029): aporte 50%, ano 0: equity forcado -40%
            if ano == 0:
                # Forcar equity -40% no ano 1
                retorno_carteira = (
                    PCT_EQUITY * (-0.40) +
                    PCT_IPCA   * R_IPCA_PLUS +
                    PCT_CRIPTO * (-0.60)  # cripto cai mais em crash
                )
                aporte = APORTE_ANUAL * 0.5
            elif ano <= 2:
                aporte = APORTE_ANUAL * 0.5
                # Retornos estocasticos normais (recuperacao)

        elif cenario == "C":
            # Anos 0-4 (2026-2031): aporte zero, ano 0: equity forcado -40%
            if ano == 0:
                retorno_carteira = (
                    PCT_EQUITY * (-0.40) +
                    PCT_IPCA   * R_IPCA_PLUS +
                    PCT_CRIPTO * (-0.60)
                )
                aporte = 0
            elif ano <= 4:
                aporte = 0

        pat = pat * (1 + retorno_carteira) + aporte

    return pat


# ─── MAIN ────────────────────────────────────────────────────────────────────

def main():
    print("=" * 72)
    print("  ADAMS CAPITAL HUMANO — STRESS TEST")
    print(f"  Patrimonio atual: R$ {PATRIMONIO_ATUAL:,.0f}")
    print(f"  Aporte mensal: R$ {APORTE_MENSAL:,.0f} (R$ {APORTE_ANUAL:,.0f}/ano)")
    print(f"  Equity return base: {R_EQUITY_BASE:.2%} real BRL")
    print(f"  Horizonte acum: {ANOS_ACUM} anos | Desacum: {ANOS_DESACUM} anos")
    print(f"  Simulacoes: {N_SIM:,} | Seed: {SEED} | Fat tails: t-student df={T_DF}")
    print("=" * 72)

    cenarios = {
        "A": "Base (sem stress)",
        "B": "Stress correlacionado (-50% renda 3a + equity -40% ano 1)",
        "C": "Stress severo (renda zero 5a + equity -40% ano 1)",
    }

    resultados = {}

    for cen_id, descr in cenarios.items():
        rng = np.random.default_rng(SEED)

        # Fase 1: Acumulacao
        pat_fire = projetar_acumulacao_stress(cen_id, rng)

        # Fase 2: Desacumulacao (10k trajetorias)
        sucessos = 0
        pats_finais = []
        for i in range(N_SIM):
            sobreviveu, pat_final = simular_desacumulacao(
                float(pat_fire[i]), R_EQUITY_BASE, rng
            )
            if sobreviveu:
                sucessos += 1
            pats_finais.append(pat_final)

        pats_finais = np.array(pats_finais)
        p_fire = sucessos / N_SIM

        # Metricas
        mediana_fire = float(np.median(pat_fire))
        p5_fire  = float(np.percentile(pat_fire, 5))
        p25_fire = float(np.percentile(pat_fire, 25))
        p75_fire = float(np.percentile(pat_fire, 75))
        p95_fire = float(np.percentile(pat_fire, 95))

        pct_abaixo_gate = float((pat_fire < PATRIMONIO_GATE).mean())
        pct_atinge_gatilho = float((pat_fire >= PATRIMONIO_GATILHO).mean())

        resultados[cen_id] = {
            "descr": descr,
            "p_fire": p_fire,
            "mediana_fire": mediana_fire,
            "p5_fire": p5_fire,
            "p25_fire": p25_fire,
            "p75_fire": p75_fire,
            "p95_fire": p95_fire,
            "pct_abaixo_gate": pct_abaixo_gate,
            "pct_atinge_gatilho": pct_atinge_gatilho,
        }

    # ─── OUTPUT ──────────────────────────────────────────────────────────────

    print("\n" + "─" * 72)
    print("  RESULTADOS POR CENARIO")
    print("─" * 72)

    for cen_id in ["A", "B", "C"]:
        r = resultados[cen_id]
        print(f"\n  [{cen_id}] {r['descr']}")
        print(f"      P(FIRE 2040)         = {r['p_fire']:.1%}")
        print(f"      Pat. mediana @FIRE    = R$ {r['mediana_fire']/1e6:.2f}M")
        print(f"      Pat. P5/P25/P75/P95   = R$ {r['p5_fire']/1e6:.2f}M / {r['p25_fire']/1e6:.2f}M / {r['p75_fire']/1e6:.2f}M / {r['p95_fire']/1e6:.2f}M")
        print(f"      % abaixo R$8M (gate)  = {r['pct_abaixo_gate']:.1%}")
        print(f"      % atinge R$13.4M      = {r['pct_atinge_gatilho']:.1%}")

    # Delta
    print("\n" + "─" * 72)
    print("  DELTAS vs CENARIO BASE (A)")
    print("─" * 72)
    base = resultados["A"]
    for cen_id in ["B", "C"]:
        r = resultados[cen_id]
        dp = r["p_fire"] - base["p_fire"]
        dm = r["mediana_fire"] - base["mediana_fire"]
        dg = r["pct_abaixo_gate"] - base["pct_abaixo_gate"]
        print(f"\n  [{cen_id}] vs [A]:")
        print(f"      Delta P(FIRE)         = {dp:+.1%}")
        print(f"      Delta pat. mediana    = R$ {dm/1e6:+.2f}M")
        print(f"      Delta % abaixo gate   = {dg:+.1%}")

    # Aportes perdidos (valor presente)
    print("\n" + "─" * 72)
    print("  APORTES PERDIDOS (valor presente a 4.85% real)")
    print("─" * 72)
    r_desconto = R_EQUITY_BASE
    # Cenario B: 50% de R$300k/ano por 3 anos
    vp_b = sum(150_000 / (1 + r_desconto)**t for t in range(1, 4))
    # Cenario C: 100% de R$300k/ano por 5 anos
    vp_c = sum(300_000 / (1 + r_desconto)**t for t in range(1, 6))
    print(f"  [B] Aportes perdidos (VP): R$ {vp_b/1e6:.2f}M")
    print(f"  [C] Aportes perdidos (VP): R$ {vp_c/1e6:.2f}M")

    # Composicao do impacto
    print("\n" + "─" * 72)
    print("  DECOMPOSICAO DO IMPACTO (estimativa)")
    print("─" * 72)
    # Impacto do drawdown forcado -40% equity no ano 1 sobre patrimonio
    impacto_drawdown = PATRIMONIO_ATUAL * PCT_EQUITY * 0.40
    impacto_cripto   = PATRIMONIO_ATUAL * PCT_CRIPTO * 0.60
    print(f"  Drawdown forcado ano 1:")
    print(f"    Equity -40% sobre {PCT_EQUITY:.0%} = R$ {impacto_drawdown/1e6:.2f}M")
    print(f"    Cripto -60% sobre {PCT_CRIPTO:.0%} = R$ {impacto_cripto/1e6:.2f}M")
    print(f"    Total impacto imediato  = R$ {(impacto_drawdown + impacto_cripto)/1e6:.2f}M")
    print(f"    IPCA+ 15% nao afetado (HTM)")

    print("\n" + "=" * 72)
    print("  CHECKLIST QUANT (Bloco D + F)")
    print("=" * 72)
    print("  [x] Patrimonio inicial = R$3,372,673 (carteira.md 2026-04-01)")
    print("  [x] Aporte = R$25k/mes = R$300k/ano (carteira.md)")
    print("  [x] Equity return = 4.85% real BRL ponderado (HD-006)")
    print("  [x] IPCA+ = 6.0% real liquido HTM (HD-006)")
    print("  [x] Volatilidade = 16.8% (FR-equity-equivalent)")
    print("  [x] Fat tails: t-student df=5")
    print("  [x] N=10,000 simulacoes, seed=42")
    print("  [x] Spending smile + guardrails + saude VCMH")
    print("  [x] Horizonte: 14 anos acum + 37 anos desacum")
    print("  [x] Drawdown forcado: deterministico ano 1, estocastico depois")
    print("  [x] Aportes variaveis por cenario conforme brief")
    print("  [x] Script salvo em analysis/ para reproducibilidade")


if __name__ == "__main__":
    main()
