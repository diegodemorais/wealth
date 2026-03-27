#!/usr/bin/env python3
"""
FR-fire2040: Monte Carlo com bond tent explícito
FIRE 53 (2040) vs FIRE 50 (2037) — dois pools: bond (determinístico) + equity (estocástico)

Questão central: isolar o efeito do bond tent (~R$1.6M HTM) sobre P(sucesso),
separando-o do efeito puro de patrimônio maior.

Premissas herdadas de FR-spending-smile (v3c):
- Spending smile: Go-Go R$280k (53-62), Slow-Go R$225k (63-72), No-Go R$285k (73+)
- Saúde base composta: R$18k × (1.07)^anos_ate_fire
- Inflator cap/decay ajustado por idade de FIRE
- Custo desacumulação: R$38k (50-65), R$27k (65-80), R$25k (80+)
- INSS R$25k a partir dos 65
- t-dist df=5, 10k trajetórias

Bond tent:
- Pool bond: 12% do patrimônio no FIRE (TD 2040 = 80% do IPCA+ longo = 80% × 15% = 12%)
- Rende Selic real ~0.5%/ano (já é caixa no vencimento)
- Saques: bond pool primeiro → equity quando bond esgota
"""

import numpy as np

np.random.seed(42)
N_SIM = 10_000

# =====================================================
# PREMISSAS FIXAS (HD-006)
# =====================================================

PATRIMONIO_ATUAL = 3_482_633
APORTE_ANUAL = 300_000
IDADE_ATUAL = 39
HORIZONTE_DESACUM = 45

EQUITY_SCENARIOS = {
    "base":      {"acum": 0.0596, "desacum": 0.0457},
    "favoravel": {"acum": 0.0696, "desacum": 0.0550},
    "stress":    {"acum": 0.0546, "desacum": 0.0400},
}

IPCA_RETURN_HTM = 0.060
CRIPTO_RETURN = 0.050
RENDA_PLUS_RETURN = 0.0534

EQUITY_VOL = 0.16
IPCA_VOL = 0.05
CRIPTO_VOL = 0.60
RENDA_PLUS_VOL = 0.15
DESACUM_VOL = 0.15

ALLOC_EQUITY = 0.79
ALLOC_IPCA = 0.15
ALLOC_CRIPTO = 0.03
ALLOC_RENDA_PLUS = 0.03

DF_T = 5

CORR_MATRIX = np.array([
    [1.0,  0.1,  0.3,  0.1],
    [0.1,  1.0,  0.0,  0.5],
    [0.3,  0.0,  1.0,  0.0],
    [0.1,  0.5,  0.0,  1.0],
])

CUSTO_DESACUM_50_65 = 38_000
CUSTO_DESACUM_65_80 = 27_000
CUSTO_DESACUM_80_PLUS = 25_000
INSS_BASE = 25_000

SAUDE_BASE_HOJE = 18_000
VCMH_PRE_FIRE = 0.07

SELIC_REAL = 0.005     # retorno real do bond pool (caixa/Selic após vencimento)
BOND_TENT_PROP = 0.12  # TD2040 = 80% × IPCA+ longo 15% = 12% do portfolio


# =====================================================
# HEALTH MODEL — CAP/DECAY AJUSTADO POR IDADE DE FIRE
# =====================================================

def saude_base_no_fire(idade_fire):
    anos = idade_fire - IDADE_ATUAL
    return SAUDE_BASE_HOJE * ((1 + VCMH_PRE_FIRE) ** anos)


def inflator_capdecay(t, idade_fire):
    """
    Decaimento relativo à idade real, não ao t abstrato.
    Para FIRE 53: inflator começa em 6.4% (=7% - 0.2%×3), não 7%.
    """
    t_offset = idade_fire - 50
    return max(0.03, 0.07 - 0.002 * (t + t_offset))


def saude_capdecay(t, base, idade_fire):
    if t == 0:
        return base
    val = base
    for i in range(1, t + 1):
        val *= (1 + inflator_capdecay(i, idade_fire))
    return val


# =====================================================
# SPENDING
# =====================================================

def get_spending(year, saude_base, idade_fire, inss_valor):
    idade = idade_fire + year
    t = year
    saude = saude_capdecay(t, saude_base, idade_fire)

    # Spending smile: fases baseadas em idade absoluta
    if idade < 63:
        lifestyle_total = 280_000
    elif idade < 73:
        lifestyle_total = 225_000
    else:
        lifestyle_total = 285_000

    lifestyle_ex_saude = lifestyle_total - saude_base
    total_lifestyle = lifestyle_ex_saude + saude

    if idade < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    inss = inss_valor if idade >= 65 else 0
    return max(total_lifestyle + custo_desacum - inss, 0)


# =====================================================
# GUARDRAILS
# =====================================================

def apply_guardrails(base_w, drawdown, year, saude_base, idade_fire):
    idade = idade_fire + year
    t = year

    if idade < 63:
        piso = 220_000
    elif idade < 73:
        piso = 180_000
    else:
        piso = 150_000 + saude_capdecay(t, saude_base, idade_fire)

    if drawdown > 0.35:
        return max(piso, 180_000)
    elif drawdown > 0.25:
        return max(base_w * 0.80, piso)
    elif drawdown > 0.15:
        return max(base_w * 0.90, piso)
    else:
        return base_w


# =====================================================
# ACUMULAÇÃO
# =====================================================

def generate_correlated_returns(n_years, n_sims, means, vols, df=5):
    n_assets = len(means)
    L = np.linalg.cholesky(CORR_MATRIX)
    all_returns = np.zeros((n_sims, n_years, n_assets))
    for sim in range(n_sims):
        z = np.random.standard_t(df, size=(n_years, n_assets))
        z = z * np.sqrt((df - 2) / df)
        correlated = z @ L.T
        for a in range(n_assets):
            mu_g = means[a] - vols[a]**2 / 2
            all_returns[sim, :, a] = np.exp(mu_g + vols[a] * correlated[:, a]) - 1
    return all_returns


def simulate_accumulation(equity_return, anos_acum):
    means = np.array([equity_return, IPCA_RETURN_HTM, CRIPTO_RETURN, RENDA_PLUS_RETURN])
    vols = np.array([EQUITY_VOL, IPCA_VOL, CRIPTO_VOL, RENDA_PLUS_VOL])
    allocs = np.array([ALLOC_EQUITY, ALLOC_IPCA, ALLOC_CRIPTO, ALLOC_RENDA_PLUS])

    returns = generate_correlated_returns(anos_acum, N_SIM, means, vols)
    pat = np.zeros((N_SIM, anos_acum + 1))
    pat[:, 0] = PATRIMONIO_ATUAL

    for year in range(anos_acum):
        r = np.sum(returns[:, year, :] * allocs, axis=1)
        pat[:, year + 1] = (pat[:, year] + APORTE_ANUAL) * (1 + r)

    return pat[:, -1]


# =====================================================
# DESACUMULAÇÃO — SINGLE POOL (baseline)
# =====================================================

def sim_single(pat_fire, ret_mean, ret_vol, saude_base, idade_fire,
               use_guardrails=True, year1_shock=None):
    n = len(pat_fire)
    port = pat_fire.copy()
    pico = pat_fire.copy()
    failed = np.zeros(n, dtype=bool)
    mu_g = ret_mean - ret_vol**2 / 2
    scale = np.sqrt((DF_T - 2) / DF_T)

    for yr in range(HORIZONTE_DESACUM):
        z = np.random.standard_t(DF_T, size=n) * scale
        ret = np.full(n, year1_shock) if (yr == 0 and year1_shock is not None) \
              else np.exp(mu_g + ret_vol * z) - 1

        base_w = get_spending(yr, saude_base, idade_fire, INSS_BASE)

        for i in range(n):
            if failed[i]:
                continue
            w = base_w
            if use_guardrails:
                dd = max(0, 1 - port[i] / pico[i])
                w = apply_guardrails(base_w, dd, yr, saude_base, idade_fire)
                if port[i] > pico[i] * 1.25:
                    w = min(w * 1.10, base_w * 1.40)
                    pico[i] = port[i]
            novo = (port[i] - w) * (1 + ret[i])
            if novo <= 0:
                port[i] = 0
                failed[i] = True
            else:
                port[i] = novo
                pico[i] = max(pico[i], novo)

    return 1 - np.mean(failed)


# =====================================================
# DESACUMULAÇÃO — BOND TENT (2 pools)
# =====================================================

def sim_bondtent(pat_fire, ret_mean, ret_vol, saude_base, idade_fire,
                 tent_prop=BOND_TENT_PROP, use_guardrails=True, year1_shock=None):
    """
    2 pools:
    - bond: tent_prop × patrimônio, determinístico Selic real
    - equity: restante, estocástico
    Saque: bond primeiro → equity quando bond esgota
    """
    n = len(pat_fire)
    bond = pat_fire * tent_prop
    equity = pat_fire * (1 - tent_prop)
    pico = equity.copy()
    failed = np.zeros(n, dtype=bool)
    mu_g = ret_mean - ret_vol**2 / 2
    scale = np.sqrt((DF_T - 2) / DF_T)

    for yr in range(HORIZONTE_DESACUM):
        z = np.random.standard_t(DF_T, size=n) * scale
        ret_eq = np.full(n, year1_shock) if (yr == 0 and year1_shock is not None) \
                 else np.exp(mu_g + ret_vol * z) - 1

        base_w = get_spending(yr, saude_base, idade_fire, INSS_BASE)

        for i in range(n):
            if failed[i]:
                continue

            w = base_w
            if use_guardrails:
                total = bond[i] + equity[i]
                pico_total = pico[i] + pat_fire[i] * tent_prop  # pico do bond: inicial
                dd = max(0, 1 - total / (pico[i] + pat_fire[i] * tent_prop))
                w = apply_guardrails(base_w, dd, yr, saude_base, idade_fire)
                if total > pico_total * 1.25:
                    w = min(w * 1.10, base_w * 1.40)
                    pico[i] = equity[i]

            # Saque: bond primeiro
            from_bond = min(w, bond[i])
            from_eq = w - from_bond

            bond[i] = max(0, (bond[i] - from_bond) * (1 + SELIC_REAL))
            novo_eq = (equity[i] - from_eq) * (1 + ret_eq[i])

            if novo_eq <= 0 and bond[i] <= 0:
                failed[i] = True
            else:
                equity[i] = max(0, novo_eq)
                pico[i] = max(pico[i], equity[i])

    return 1 - np.mean(failed)


# =====================================================
# MAIN
# =====================================================

def main():
    print("=" * 100)
    print("FR-fire2040: MONTE CARLO COM BOND TENT EXPLÍCITO")
    print("FIRE 53 (2040) vs FIRE 50 (2037) — isolando efeito patrimônio vs bond tent")
    print("10k trajetórias | t-dist df=5 | spending smile cap/decay | seeds 42/200")
    print("=" * 100)

    base_50 = saude_base_no_fire(50)
    base_53 = saude_base_no_fire(53)
    print(f"\nSaúde base no FIRE:")
    print(f"  FIRE 50: R$18k × 1.07^11 = R${base_50:,.0f}")
    print(f"  FIRE 53: R$18k × 1.07^14 = R${base_53:,.0f}  (Δ +R${base_53-base_50:,.0f}, +{(base_53/base_50-1)*100:.1f}%)")

    # Acumulação
    acum = {}
    for rname, rscen in EQUITY_SCENARIOS.items():
        np.random.seed(42)
        acum[f"50_{rname}"] = simulate_accumulation(rscen["acum"], anos_acum=11)
        np.random.seed(42)
        acum[f"53_{rname}"] = simulate_accumulation(rscen["acum"], anos_acum=14)

    med50 = np.median(acum["50_base"])
    med53 = np.median(acum["53_base"])
    tent_val = med53 * BOND_TENT_PROP
    saque50 = get_spending(0, base_50, 50, INSS_BASE)
    saque53 = get_spending(0, base_53, 53, INSS_BASE)

    print(f"\nPatrimônio mediano no FIRE:")
    print(f"  FIRE 50: R${med50:,.0f}  | SWR: {saque50/med50*100:.2f}% | Saque t=0: R${saque50:,.0f}")
    print(f"  FIRE 53: R${med53:,.0f}  | SWR: {saque53/med53*100:.2f}% | Saque t=0: R${saque53:,.0f}")
    print(f"  Bond tent (12%): R${tent_val:,.0f} ({tent_val/saque53:.1f} anos cobertura)")

    ret_base_d = EQUITY_SCENARIOS["base"]["desacum"]

    # =====================================================
    # TABELA 1 — COMPARAÇÃO PRINCIPAL
    # =====================================================
    print("\n" + "=" * 100)
    print("TABELA 1 — P(SUCESSO): FIRE 50 vs 53 × SINGLE POOL vs BOND TENT")
    print("  Cenário base | INSS R$25k | com guardrails")
    print("=" * 100)

    np.random.seed(200); r_50s = sim_single(acum["50_base"], ret_base_d, DESACUM_VOL, base_50, 50)
    np.random.seed(200); r_53s = sim_single(acum["53_base"], ret_base_d, DESACUM_VOL, base_53, 53)
    np.random.seed(200); r_53b = sim_bondtent(acum["53_base"], ret_base_d, DESACUM_VOL, base_53, 53)

    np.random.seed(200); r_50s_bear = sim_single(acum["50_base"], ret_base_d, DESACUM_VOL, base_50, 50, year1_shock=-0.30)
    np.random.seed(200); r_53b_bear = sim_bondtent(acum["53_base"], ret_base_d, DESACUM_VOL, base_53, 53, year1_shock=-0.30)
    np.random.seed(200); r_53s_bear = sim_single(acum["53_base"], ret_base_d, DESACUM_VOL, base_53, 53, year1_shock=-0.30)

    np.random.seed(200); r_50s_nogr = sim_single(acum["50_base"], ret_base_d, DESACUM_VOL, base_50, 50, use_guardrails=False)
    np.random.seed(200); r_53b_nogr = sim_bondtent(acum["53_base"], ret_base_d, DESACUM_VOL, base_53, 53, use_guardrails=False)

    ref = r_50s
    print(f"\n  {'Modelo':<60} | {'P(sucesso)':>10} | {'Δ vs FIRE 50':>12}")
    print(f"  {'-'*60}-+-{'-'*10}-+-{'-'*12}")

    rows = [
        ("FIRE 50 — single pool (FR-spending-smile referência)", r_50s, None),
        ("FIRE 53 — single pool  (só patrimônio, sem bond tent)", r_53s, r_53s - ref),
        ("FIRE 53 — bond tent 12%  (patrimônio + bond tent)", r_53b, r_53b - ref),
        (None, None, None),
        ("FIRE 50 — single pool, sem guardrails", r_50s_nogr, None),
        ("FIRE 53 — bond tent,   sem guardrails", r_53b_nogr, r_53b_nogr - r_50s_nogr),
        (None, None, None),
        ("FIRE 50 — bear -30% ano 1", r_50s_bear, None),
        ("FIRE 53 — single pool  bear -30%", r_53s_bear, r_53s_bear - r_50s_bear),
        ("FIRE 53 — bond tent    bear -30%", r_53b_bear, r_53b_bear - r_50s_bear),
    ]

    for label, val, delta in rows:
        if label is None:
            print()
            continue
        dstr = f"+{delta*100:.1f}pp" if delta and delta >= 0 else (f"{delta*100:.1f}pp" if delta is not None else "—")
        print(f"  {label:<60} | {val:>9.1%} | {dstr:>12}")

    # =====================================================
    # TABELA 2 — DECOMPOSIÇÃO
    # =====================================================
    print("\n" + "=" * 100)
    print("TABELA 2 — DECOMPOSIÇÃO DO GANHO: FIRE 50 → FIRE 53 COM BOND TENT")
    print("=" * 100)

    d_pat = r_53s - r_50s
    d_tent = r_53b - r_53s
    d_total = r_53b - r_50s

    print(f"""
  FIRE 50 single pool:           {r_50s:>6.1%}  (baseline)
  FIRE 53 single pool:           {r_53s:>6.1%}  Δ patrimônio:  +{d_pat*100:.1f}pp  ({d_pat/d_total*100:.0f}% do ganho total)
  FIRE 53 bond tent 12%:         {r_53b:>6.1%}  Δ bond tent:   +{d_tent*100:.1f}pp  ({d_tent/d_total*100:.0f}% do ganho total)
  ─────────────────────────────────────────────────
  Ganho total FIRE 53 vs 50:    +{d_total*100:.1f}pp

  Bear -30% ano 1:
    FIRE 50:                     {r_50s_bear:>6.1%}
    FIRE 53 single pool:         {r_53s_bear:>6.1%}  +{(r_53s_bear-r_50s_bear)*100:.1f}pp
    FIRE 53 bond tent:           {r_53b_bear:>6.1%}  +{(r_53b_bear-r_50s_bear)*100:.1f}pp
    → Bond tent extra vs só patrimônio (bear): +{(r_53b_bear-r_53s_bear)*100:.1f}pp
""")

    # =====================================================
    # TABELA 3 — SENSIBILIDADE TAMANHO DO TENT
    # =====================================================
    print("=" * 100)
    print("TABELA 3 — SENSIBILIDADE AO TAMANHO DO BOND TENT (FIRE 53)")
    print("=" * 100)
    print(f"\n  {'Tent %':>8} | {'R$ valor':>14} | {'Anos cob.':>10} | {'P(base)':>9} | {'Bear-30%':>9}")
    print(f"  {'-'*8}-+-{'-'*14}-+-{'-'*10}-+-{'-'*9}-+-{'-'*9}")

    for prop in [0.0, 0.06, 0.09, 0.12, 0.15, 0.20]:
        tent_r = med53 * prop
        anos_cob = tent_r / saque53 if prop > 0 else 0
        if prop == 0:
            np.random.seed(200)
            p = sim_single(acum["53_base"], ret_base_d, DESACUM_VOL, base_53, 53)
            np.random.seed(200)
            p_bear = sim_single(acum["53_base"], ret_base_d, DESACUM_VOL, base_53, 53, year1_shock=-0.30)
        else:
            np.random.seed(200)
            p = sim_bondtent(acum["53_base"], ret_base_d, DESACUM_VOL, base_53, 53, tent_prop=prop)
            np.random.seed(200)
            p_bear = sim_bondtent(acum["53_base"], ret_base_d, DESACUM_VOL, base_53, 53, tent_prop=prop, year1_shock=-0.30)
        marker = " ←" if abs(prop - BOND_TENT_PROP) < 0.001 else ""
        anos_str = f"{anos_cob:.1f}" if prop > 0 else "0 (equity puro)"
        print(f"  {prop*100:>7.0f}% | R$ {tent_r:>11,.0f} | {anos_str:>10} | {p:>8.1%} | {p_bear:>8.1%}{marker}")

    # =====================================================
    # TABELA 4 — CENÁRIOS COMPLETOS FIRE 53 BOND TENT
    # =====================================================
    print("\n" + "=" * 100)
    print("TABELA 4 — FIRE 53 BOND TENT: CENÁRIOS COMPLETOS")
    print("=" * 100)
    print(f"\n  {'Cenário':<50} | {'Base':>7} | {'Favorável':>10} | {'Stress':>7}")
    print(f"  {'-'*50}-+-{'-'*7}-+-{'-'*10}-+-{'-'*7}")

    for label, scen in [("FIRE 53 bond tent 12%", "53"), ("FIRE 50 single pool (ref)", "50")]:
        row_vals = []
        for rname in ["base", "favoravel", "stress"]:
            rscen = EQUITY_SCENARIOS[rname]
            np.random.seed(200)
            if scen == "53":
                p = sim_bondtent(acum[f"53_{rname}"], rscen["desacum"], DESACUM_VOL, base_53, 53)
            else:
                p = sim_single(acum[f"50_{rname}"], rscen["desacum"], DESACUM_VOL, base_50, 50)
            row_vals.append(p)
        print(f"  {label:<50} | {row_vals[0]:>6.1%} | {row_vals[1]:>9.1%} | {row_vals[2]:>6.1%}")

    # =====================================================
    # RESUMO EXECUTIVO
    # =====================================================
    print("\n" + "=" * 100)
    print("RESUMO EXECUTIVO")
    print("=" * 100)
    print(f"""
  FIRE 50 (FR-spending-smile baseline):
    P(sucesso) base:     {r_50s:>6.1%}
    P bear -30% ano 1:   {r_50s_bear:>6.1%}

  FIRE 53 — bond tent 12% (R${tent_val:,.0f}, {tent_val/saque53:.1f} anos cobertura):
    P(sucesso) base:     {r_53b:>6.1%}  (+{(r_53b-r_50s)*100:.1f}pp total vs FIRE 50)
    P bear -30% ano 1:   {r_53b_bear:>6.1%}  (+{(r_53b_bear-r_50s_bear)*100:.1f}pp vs FIRE 50 bear)

  Decomposição:
    → Patrimônio maior:  +{d_pat*100:.1f}pp ({d_pat/d_total*100:.0f}% do total)
    → Bond tent isolado: +{d_tent*100:.1f}pp ({d_tent/d_total*100:.0f}% do total)

  SWR FIRE 53: {saque53/med53*100:.2f}% | Bond tent: {tent_val/saque53:.1f} anos cobertura
""")
    print("Script: dados/monte_carlo_fire2040_bondtent.py")
    print("Seeds: 42 (acumulação), 200 (desacumulação) | N=10,000 | t-dist df=5")
    print("=" * 100)


if __name__ == "__main__":
    main()
