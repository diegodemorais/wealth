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
import numpy as np
import warnings
warnings.filterwarnings("ignore")

# ─── PREMISSAS (fonte: carteira.md + HD-006 final 2026-03-22) ─────────────────

PREMISSAS = {
    # Patrimônio e aportes
    "patrimonio_atual":    3_372_673,   # R$ — atualizar a cada sessão
    "aporte_mensal":       25_000,      # R$
    "custo_vida_base":     250_000,     # R$/ano — base FIRE

    # Horizonte
    "idade_atual":         39,
    "idade_fire_alvo":     50,
    "idade_safe_harbor":   53,
    "anos_simulacao":      40,          # anos de desacumulação (50→90)

    # Retornos reais anuais em BRL — cenário BASE (fonte: carteira.md premissas HD-006)
    "retorno_equity_base": 0.0596,      # 5.96% real BRL ponderado (SWRD/AVGS/AVEM/JPGL)
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
    "pct_ipca_longo":      0.15,        # 15% — TD 2040/2050
    "pct_ipca_curto":      0.03,        # 3% — comprado perto dos 50
    "pct_equity":          0.79,        # 79%
    "pct_cripto":          0.03,        # 3%

    # IPCA estimado (para converter nominais)
    "ipca_anual":          0.04,        # 4%/ano

    # Gatilho FIRE
    "patrimonio_gatilho":  13_400_000,  # R$2026 real
    "swr_gatilho":         0.024,       # 2.4%
}

# ─── SPENDING SMILE (fonte: FR-spending-smile 2026-03-27) ─────────────────────

SPENDING_SMILE = {
    # Fase: (gasto_base, anos_inicio, anos_fim) a partir da aposentadoria
    "go_go":   {"gasto": 280_000, "inicio": 0,  "fim": 15},   # anos 0–14 pós-FIRE
    "slow_go": {"gasto": 225_000, "inicio": 15, "fim": 30},   # anos 15–29
    "no_go":   {"gasto": 285_000, "inicio": 30, "fim": 99},   # anos 30+ (saúde domina)
}

SAUDE_BASE         = 37_900   # R$/ano no FIRE (inflator próprio)
SAUDE_INFLATOR     = 0.07     # 7%/ano cap
SAUDE_INFLATOR_CAP = 0.07
SAUDE_DECAY        = 0.50     # 50% após No-Go (custos caem quando mobilidade cai)

# ─── GUARDRAILS (fonte: carteira.md, aprovados 2026-03-20) ────────────────────

GUARDRAILS = [
    # (drawdown_min, drawdown_max, corte_pct, descricao)
    (0.00, 0.15, 0.00, "Normal — sem corte"),
    (0.15, 0.25, 0.10, "Corte 10% → R$225k"),
    (0.25, 0.35, 0.20, "Corte 20% → R$200k"),
    (0.35, 1.00, 0.28, "Piso — R$180k"),
]
GASTO_PISO = 180_000


# ─── CÁLCULOS ─────────────────────────────────────────────────────────────────

def gasto_spending_smile(ano_pos_fire: int, ipca_acumulado: float) -> float:
    """Gasto base ajustado pelo spending smile + saúde, em R$ reais (base 2026)."""
    for fase, cfg in SPENDING_SMILE.items():
        if cfg["inicio"] <= ano_pos_fire < cfg["fim"]:
            gasto_base = cfg["gasto"]
            break
    else:
        gasto_base = SPENDING_SMILE["no_go"]["gasto"]

    # Saúde com inflator próprio e decay no No-Go
    anos_saude = ano_pos_fire
    saude = SAUDE_BASE * min((1 + SAUDE_INFLATOR) ** anos_saude,
                              (1 + SAUDE_INFLATOR_CAP) ** anos_saude)
    if ano_pos_fire >= SPENDING_SMILE["no_go"]["inicio"]:
        saude *= SAUDE_DECAY

    return gasto_base + saude


def aplicar_guardrail(gasto_base: float, drawdown: float) -> float:
    """Aplica guardrail de retirada com base no drawdown atual."""
    for dd_min, dd_max, corte, _ in GUARDRAILS:
        if dd_min <= drawdown < dd_max:
            gasto_ajustado = gasto_base * (1 - corte)
            return max(gasto_ajustado, GASTO_PISO)
    return GASTO_PISO


def simular_trajetoria(patrimonio_inicial: float, n_anos: int, retorno_equity: float,
                        volatilidade: float, df: int, rng: np.random.Generator) -> tuple:
    """
    Simula uma trajetória de desacumulação.
    Retorna (sobreviveu: bool, patrimônio_final: float, patrimônio_pico: float)
    """
    pat = patrimonio_inicial
    pat_pico = patrimonio_inicial

    for ano in range(n_anos):
        # Retorno anual com fat tails
        z = rng.standard_t(df) / np.sqrt(df / (df - 2))  # normalizar variância
        retorno_anual = retorno_equity + volatilidade * z

        # Crescimento
        pat = pat * (1 + retorno_anual)
        pat_pico = max(pat_pico, pat)

        # Gasto do ano (spending smile + guardrail)
        gasto_base = gasto_spending_smile(ano, 0)  # em R$ reais 2026
        drawdown = max(0, 1 - pat / pat_pico)
        gasto = aplicar_guardrail(gasto_base, drawdown)

        pat -= gasto

        if pat <= 0:
            return False, 0.0, pat_pico

    return True, pat, pat_pico


def rodar_monte_carlo(premissas: dict, n_sim: int = 10_000,
                       cenario: str = "base", seed: int = 42) -> dict:
    """
    Roda n_sim trajetórias e retorna estatísticas.

    Lógica correta (alinhada com FR-spending-smile + FR-fire2040):
    1. Projetar acumulação até idade_fire_alvo → patrimônio no FIRE
    2. Simular desacumulação 40 anos para TODAS as trajetórias
    3. P(FIRE) = % que sobrevivem os 40 anos com spending smile + guardrails

    O gatilho R$13.4M/SWR 2.4% é reportado separadamente (% de trajetórias
    que o atingem) — não é filtro da simulação.

    cenario: "base", "favoravel", "stress"
    """
    rng = np.random.default_rng(seed)

    # Retorno equity ajustado por cenário
    r_equity = premissas["retorno_equity_base"]
    if cenario == "favoravel":
        r_equity += premissas["adj_favoravel"]
    elif cenario == "stress":
        r_equity += premissas["adj_stress"]

    # Fase 1: Acumulação até o FIRE
    anos_acum = premissas["idade_fire_alvo"] - premissas["idade_atual"]
    pat_fire_trajetorias = projetar_acumulacao(premissas, r_equity, cenario, n_sim, rng, anos_acum)

    # % que atingem o gatilho formal (R$13.4M + SWR <= 2.4%)
    atingiu_gatilho = (
        (pat_fire_trajetorias >= premissas["patrimonio_gatilho"]) &
        (premissas["custo_vida_base"] / pat_fire_trajetorias <= premissas["swr_gatilho"])
    )
    pct_gatilho = float(atingiu_gatilho.mean())

    # Fase 2: Desacumulação para TODAS as trajetórias
    sucessos = 0
    pats_finais = []

    for i in range(n_sim):
        pat_ini = float(pat_fire_trajetorias[i])
        sobreviveu, pat_final, _ = simular_trajetoria(
            pat_ini, premissas["anos_simulacao"], r_equity,
            premissas["volatilidade_equity"], premissas["t_dist_df"], rng
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
        "ipca_anual":          "IPCA estimado (+/-10%)",
        "volatilidade_equity": "Volatilidade equity (+/-10%)",
        "dep_brl_base":        "Depreciação BRL (+/-10%)",
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
    args = parser.parse_args()

    premissas = dict(PREMISSAS)
    if args.patrimonio: premissas["patrimonio_atual"] = args.patrimonio
    if args.aporte:     premissas["aporte_mensal"] = args.aporte
    if args.anos:
        premissas["idade_fire_alvo"] = premissas["idade_atual"] + args.anos

    print(f"\n🎲 Rodando {args.n_sim:,} simulações...")

    resultados = []
    for cenario in ["base", "favoravel", "stress"]:
        print(f"   Cenário {cenario}...", end=" ", flush=True)
        r = rodar_monte_carlo(premissas, n_sim=args.n_sim, cenario=cenario)
        resultados.append(r)
        print(f"P(FIRE) = {r['p_sucesso']:.1%}")

    imprimir_resultados(resultados, premissas)

    if args.tornado:
        print("🌪️  Calculando tornado chart (5k sims por variável)...")
        tornado = rodar_tornado(premissas, n_sim=5_000)
        imprimir_tornado(tornado, resultados[0]["p_sucesso"])


if __name__ == "__main__":
    main()
