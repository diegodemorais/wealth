#!/usr/bin/env python3
"""
fire_glide_path_scenarios.py — Compara 3 cenários de equity allocation pré-FIRE.
Wrapper sobre fire_montecarlo.py. Modifica projetar_acumulacao para suportar glide path.

Cenários:
  (A) Baseline: 79% equity constante até 2037
  (B) Glide path cedo: 79% → 50% linear de 2031 (Diego 44) até 2037 (Diego 50)
  (C) Glide path tardio: 79% → 60% linear de 2034 (Diego 47) até 2037 (Diego 50)

Seed fixo = 42, 10k sims. Reproducível.
"""

import numpy as np
import sys
import os

# Import do módulo principal
sys.path.insert(0, os.path.dirname(__file__))
from fire_montecarlo import (
    PREMISSAS, simular_trajetoria, gasto_spending_smile, aplicar_guardrail,
    rodar_monte_carlo
)


def equity_schedule_constant(ano, anos_total, pct_equity_start=0.79):
    """Cenário A: equity constante."""
    return pct_equity_start


def equity_schedule_glide_early(ano, anos_total, pct_equity_start=0.79):
    """Cenário B: 79% → 50% linear de ano 5 (2031, Diego 44) até ano 11 (2037, Diego 50).
    Nota: idade_atual=39, fire_alvo depende do cenário.
    Para FIRE 2040 (14 anos): glide começa ano 5 (2031), termina ano 14 (2040).
    Mas a premissa do usuário é até 2037. Usar anos absolutos.

    Diego atual: 39. FIRE alvo: 53 (2040). Acumulação: 14 anos.
    Glide path começa: 2031 (Diego 44) = ano 5 da acumulação.
    Glide path termina: 2037 (Diego 50) = ano 11 da acumulação.
    De 79% → 50% em 6 anos (2031-2037).
    Após 2037 até 2040: mantém 50%.
    """
    ano_inicio_glide = 5   # 2031 - 2026 = 5
    ano_fim_glide = 11     # 2037 - 2026 = 11
    pct_equity_end = 0.50

    if ano < ano_inicio_glide:
        return pct_equity_start
    elif ano >= ano_fim_glide:
        return pct_equity_end
    else:
        frac = (ano - ano_inicio_glide) / (ano_fim_glide - ano_inicio_glide)
        return pct_equity_start - frac * (pct_equity_start - pct_equity_end)


def equity_schedule_glide_late(ano, anos_total, pct_equity_start=0.79):
    """Cenário C: 79% → 60% linear de 2034 (Diego 47) até 2037 (Diego 50).

    Glide path começa: 2034 (Diego 47) = ano 8 da acumulação.
    Glide path termina: 2037 (Diego 50) = ano 11 da acumulação.
    De 79% → 60% em 3 anos (2034-2037).
    Após 2037 até 2040: mantém 60%.
    """
    ano_inicio_glide = 8   # 2034 - 2026 = 8
    ano_fim_glide = 11     # 2037 - 2026 = 11
    pct_equity_end = 0.60

    if ano < ano_inicio_glide:
        return pct_equity_start
    elif ano >= ano_fim_glide:
        return pct_equity_end
    else:
        frac = (ano - ano_inicio_glide) / (ano_fim_glide - ano_inicio_glide)
        return pct_equity_start - frac * (pct_equity_start - pct_equity_end)


def projetar_acumulacao_glide(premissas, r_equity, cenario, n_sim, rng, n_anos,
                               equity_fn):
    """
    Projeta patrimônio no FIRE com alocação equity variável por ano.
    equity_fn(ano, n_anos) → pct_equity naquele ano.
    O resíduo (1 - equity - cripto) vai para IPCA+.
    """
    vol_equity = premissas["volatilidade_equity"]
    df = premissas["t_dist_df"]
    pat = np.full(n_sim, float(premissas["patrimonio_atual"]))
    aporte_anual = premissas["aporte_mensal"] * 12
    pct_cripto = premissas["pct_cripto"]

    for ano in range(n_anos):
        pct_eq = equity_fn(ano, n_anos)
        pct_rf = 1.0 - pct_eq - pct_cripto  # restante vai para RF (IPCA+)

        vol = vol_equity * pct_eq  # vol proporcional ao equity
        z = rng.standard_t(df, size=n_sim) / np.sqrt(df / (df - 2))

        retorno_carteira = (
            pct_eq    * (r_equity + vol_equity * z) +
            pct_rf    * premissas["retorno_ipca_plus"] +
            pct_cripto * (r_equity + 2 * vol_equity * z)
        )
        pat = pat * (1 + retorno_carteira) + aporte_anual

    return pat


def rodar_cenario_glide(premissas, equity_fn, cenario_retorno, n_sim, seed):
    """Roda MC completo (acumulação com glide + desacumulação)."""
    rng = np.random.default_rng(seed)

    r_equity = premissas["retorno_equity_base"]
    if cenario_retorno == "favoravel":
        r_equity += premissas["adj_favoravel"]
    elif cenario_retorno == "stress":
        r_equity += premissas["adj_stress"]

    anos_acum = premissas["idade_fire_alvo"] - premissas["idade_atual"]
    pat_fire = projetar_acumulacao_glide(
        premissas, r_equity, cenario_retorno, n_sim, rng, anos_acum, equity_fn
    )

    # Gatilho formal
    atingiu_gatilho = (
        (pat_fire >= premissas["patrimonio_gatilho"]) &
        (premissas["custo_vida_base"] / pat_fire <= premissas["swr_gatilho"])
    )
    pct_gatilho = float(atingiu_gatilho.mean())

    # Desacumulação
    escala_cv = premissas.get("custo_vida_base", 250_000) / 250_000
    sucessos = 0
    pats_finais = []

    for i in range(n_sim):
        pat_ini = float(pat_fire[i])
        sobreviveu, pat_final, _ = simular_trajetoria(
            pat_ini, premissas["anos_simulacao"], r_equity,
            premissas["volatilidade_equity"], premissas["t_dist_df"], rng,
            escala_custo_vida=escala_cv
        )
        if sobreviveu:
            sucessos += 1
        pats_finais.append(pat_final)

    pats_finais = np.array(pats_finais)

    return {
        "p_sucesso": sucessos / n_sim,
        "pct_gatilho": pct_gatilho,
        "pat_mediana_fire": float(np.median(pat_fire)),
        "pat_p10_fire": float(np.percentile(pat_fire, 10)),
        "pat_p25_fire": float(np.percentile(pat_fire, 25)),
        "pat_p75_fire": float(np.percentile(pat_fire, 75)),
        "pat_p90_fire": float(np.percentile(pat_fire, 90)),
        "r_equity": r_equity,
    }


def main():
    premissas = dict(PREMISSAS)
    n_sim = 10_000
    seed = 42

    cenarios_equity = {
        "A_baseline":   equity_schedule_constant,
        "B_glide_early": equity_schedule_glide_early,
        "C_glide_late":  equity_schedule_glide_late,
    }

    cenarios_retorno = ["base", "stress"]

    print(f"\nParametros fixos:")
    print(f"  Patrimonio atual:  R$ {premissas['patrimonio_atual']:,.0f}")
    print(f"  Aporte mensal:     R$ {premissas['aporte_mensal']:,.0f}")
    print(f"  Idade atual:       {premissas['idade_atual']}")
    print(f"  FIRE alvo:         {premissas['idade_fire_alvo']} (2040)")
    print(f"  Desacumulacao:     {premissas['anos_simulacao']} anos")
    print(f"  Simulacoes:        {n_sim:,}")
    print(f"  Seed:              {seed}")
    print(f"  Equity base:       {premissas['pct_equity']:.0%}")
    print(f"  Retorno eq base:   {premissas['retorno_equity_base']:.2%}")
    print(f"  Retorno eq stress: {premissas['retorno_equity_base'] + premissas['adj_stress']:.2%}")
    print(f"  Retorno IPCA+:     {premissas['retorno_ipca_plus']:.2%}")

    # Mostrar schedule de equity por cenário
    anos_acum = premissas["idade_fire_alvo"] - premissas["idade_atual"]
    print(f"\nEquity schedule (% equity por ano de acumulacao, {anos_acum} anos):")
    print(f"  {'Ano':<5} {'Idade':<6} {'A_const':>8} {'B_early':>8} {'C_late':>8}")
    for a in range(anos_acum):
        idade = premissas["idade_atual"] + a
        print(f"  {a:<5} {idade:<6} "
              f"{equity_schedule_constant(a, anos_acum):>7.0%} "
              f"{equity_schedule_glide_early(a, anos_acum):>7.0%} "
              f"{equity_schedule_glide_late(a, anos_acum):>7.0%}")

    print(f"\n{'='*75}")
    print(f"  RESULTADOS — P(FIRE) por cenário de glide path")
    print(f"{'='*75}")

    resultados = {}

    for cenario_ret in cenarios_retorno:
        print(f"\n--- Cenario retorno: {cenario_ret.upper()} ---")
        print(f"  {'Cenario':<18} {'P(FIRE)':>8} {'P(Gatilho)':>11} {'Pat.Med@FIRE':>14} {'Pat.P10':>12} {'Pat.P90':>12}")
        print(f"  {'-'*68}")

        for nome_eq, fn_eq in cenarios_equity.items():
            r = rodar_cenario_glide(premissas, fn_eq, cenario_ret, n_sim, seed)
            resultados[(nome_eq, cenario_ret)] = r

            print(f"  {nome_eq:<18} {r['p_sucesso']:>7.1%} {r['pct_gatilho']:>10.1%} "
                  f"R${r['pat_mediana_fire']/1e6:>9.2f}M "
                  f"R${r['pat_p10_fire']/1e6:>8.2f}M "
                  f"R${r['pat_p90_fire']/1e6:>8.2f}M")

    # Deltas
    print(f"\n{'='*75}")
    print(f"  DELTAS — Diferença de P(FIRE) vs Baseline (A)")
    print(f"{'='*75}")

    for cenario_ret in cenarios_retorno:
        p_a = resultados[("A_baseline", cenario_ret)]["p_sucesso"]
        p_b = resultados[("B_glide_early", cenario_ret)]["p_sucesso"]
        p_c = resultados[("C_glide_late", cenario_ret)]["p_sucesso"]

        med_a = resultados[("A_baseline", cenario_ret)]["pat_mediana_fire"]
        med_b = resultados[("B_glide_early", cenario_ret)]["pat_mediana_fire"]
        med_c = resultados[("C_glide_late", cenario_ret)]["pat_mediana_fire"]

        print(f"\n  {cenario_ret.upper()}:")
        print(f"    B vs A (glide cedo):   dP(FIRE) = {p_b - p_a:>+.1%}   dPat.Med = R$ {(med_b - med_a)/1e6:>+.2f}M")
        print(f"    C vs A (glide tardio): dP(FIRE) = {p_c - p_a:>+.1%}   dPat.Med = R$ {(med_c - med_a)/1e6:>+.2f}M")

    # Custo marginal
    print(f"\n{'='*75}")
    print(f"  CUSTO MARGINAL — P(FIRE) perdido por pp de equity reduzido")
    print(f"{'='*75}")

    for cenario_ret in cenarios_retorno:
        p_a = resultados[("A_baseline", cenario_ret)]["p_sucesso"]
        p_b = resultados[("B_glide_early", cenario_ret)]["p_sucesso"]
        p_c = resultados[("C_glide_late", cenario_ret)]["p_sucesso"]

        # Equity médio reduzido vs baseline
        eq_medio_a = sum(equity_schedule_constant(a, anos_acum) for a in range(anos_acum)) / anos_acum
        eq_medio_b = sum(equity_schedule_glide_early(a, anos_acum) for a in range(anos_acum)) / anos_acum
        eq_medio_c = sum(equity_schedule_glide_late(a, anos_acum) for a in range(anos_acum)) / anos_acum

        delta_eq_b = (eq_medio_a - eq_medio_b) * 100  # em pp
        delta_eq_c = (eq_medio_a - eq_medio_c) * 100

        custo_b = (p_a - p_b) / delta_eq_b * 100 if delta_eq_b > 0 else 0  # P(FIRE) perdido por pp de equity
        custo_c = (p_a - p_c) / delta_eq_c * 100 if delta_eq_c > 0 else 0

        print(f"\n  {cenario_ret.upper()}:")
        print(f"    Equity medio A: {eq_medio_a:.1%}  B: {eq_medio_b:.1%} (-{delta_eq_b:.1f}pp)  C: {eq_medio_c:.1%} (-{delta_eq_c:.1f}pp)")
        print(f"    Custo B: {custo_b:>+.2f}% P(FIRE) por pp de equity reduzido")
        print(f"    Custo C: {custo_c:>+.2f}% P(FIRE) por pp de equity reduzido")

    print()


if __name__ == "__main__":
    main()
