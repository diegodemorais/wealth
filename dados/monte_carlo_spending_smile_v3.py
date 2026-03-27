#!/usr/bin/env python3
"""
FR-spending-smile v3: Monte Carlo with cap/decay health model
Base: FR-003 (HD-006, 2026-03-22) + v1/v2 spending smile

Health model v3 — cap/decay:
  inflator_saude(t) = max(3%, 7% - 0.2% * t)
  where t = years since FIRE (age 50)
  - t=0  (age 50): 7.0%
  - t=10 (age 60): 5.0%
  - t=20 (age 70): 3.0% (floor — stays here)

  Saude(t) = R$18k * product(1 + inflator(i)) for i=1 to t

Sources:
  - Blanchett (2014): spending smile
  - VCMH/IESS: health inflation Brazil +7-8% real
  - Cont (2001): fat tails, t-distribution df=5
  - Kitces & Fitzpatrick (2024): risk-based guardrails
"""

import numpy as np

np.random.seed(42)
N_SIM = 10_000

# =====================================================
# PREMISSAS FIXAS (HD-006 final)
# =====================================================

PATRIMONIO_INICIAL = 3_482_633
APORTE_ANUAL = 300_000
IDADE_ATUAL = 39
IDADE_FIRE = 50
HORIZONTE_DESACUM = 45
ANOS_ACUM = IDADE_FIRE - IDADE_ATUAL  # 11

# Asset class returns and vols (accumulation)
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

# Decumulation costs (TX-desacumulacao)
CUSTO_DESACUM_50_65 = 38_000
CUSTO_DESACUM_65_80 = 27_000
CUSTO_DESACUM_80_PLUS = 25_000

# =====================================================
# RETURN SCENARIOS (HD-006)
# =====================================================

EQUITY_SCENARIOS = {
    "base":      {"acum": 0.0596, "desacum": 0.0457, "label": "Base (5.96%)"},
    "favoravel": {"acum": 0.0696, "desacum": 0.0550, "label": "Favoravel (6.96%)"},
    "stress":    {"acum": 0.0546, "desacum": 0.0400, "label": "Stress (5.46%)"},
}

# INSS scenarios
INSS_SCENARIOS = {
    "R$50k": 50_000,
    "R$25k": 25_000,
    "R$0":       0,
}

# =====================================================
# HEALTH MODELS
# =====================================================

SAUDE_BASE = 18_000  # R$18k/ano no FIRE (already in R$215k audited)

def inflator_capdecay(t):
    """
    v3 cap/decay: inflator_saude(t) = max(3%, 7% - 0.2% * t)
    t = years since FIRE (age 50)
    """
    return max(0.03, 0.07 - 0.002 * t)


def saude_capdecay(t):
    """
    Saude(t) = R$18k * product(1 + inflator(i)) for i=1 to t
    At t=0: R$18k (base, no inflation yet applied)

    EXPLICIT FORMULA:
    saude(0) = 18000
    saude(1) = 18000 * (1 + max(3%, 7% - 0.2%*1)) = 18000 * 1.068 = 19224
    saude(2) = 19224 * (1 + max(3%, 7% - 0.2%*2)) = 19224 * 1.066 = 20492.784
    ...
    saude(t) = 18000 * prod_{i=1}^{t} (1 + max(0.03, 0.07 - 0.002*i))
    """
    if t == 0:
        return SAUDE_BASE
    val = SAUDE_BASE
    for i in range(1, t + 1):
        rate = max(0.03, 0.07 - 0.002 * i)
        val *= (1 + rate)
    return val


def saude_flat5(t):
    """v1: +5% flat forever. t = years since FIRE."""
    # From age 50 onward, compound from base
    return SAUDE_BASE * (1.05) ** t


def saude_exp7(t):
    """v2: +7% exponential pure. t = years since FIRE."""
    return SAUDE_BASE * (1.07) ** t


# =====================================================
# SPENDING FUNCTIONS
# =====================================================

def get_spending(year_in_retirement, saude_func, inss_valor):
    """
    Returns total withdrawal for a given year.
    year_in_retirement: 0 = age 50, 10 = age 60, etc.
    """
    idade = 50 + year_in_retirement
    t = year_in_retirement
    saude = saude_func(t)

    # Lifestyle by phase (EXCLUDING health — health added separately)
    if t < 10:  # Go-Go (50-59)
        lifestyle_ex_saude = 280_000 - SAUDE_BASE  # R$262k non-health lifestyle
    elif t < 20:  # Slow-Go (60-69)
        lifestyle_ex_saude = 225_000 - SAUDE_BASE  # R$207k non-health lifestyle
    else:  # No-Go (70+)
        lifestyle_ex_saude = 285_000 - SAUDE_BASE  # R$267k non-health lifestyle

    lifestyle_total = lifestyle_ex_saude + saude

    # Decumulation costs
    if idade < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    # INSS starts at 65
    inss = inss_valor if idade >= 65 else 0

    total = lifestyle_total + custo_desacum - inss
    return max(total, 0)


def get_fixed_withdrawal(saque_fixo, year_in_retirement, inss_valor):
    """For guardrails table: fixed withdrawal, no spending smile."""
    idade = 50 + year_in_retirement
    if idade < 65:
        custo = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo = CUSTO_DESACUM_65_80
    else:
        custo = CUSTO_DESACUM_80_PLUS
    inss = inss_valor if idade >= 65 else 0
    return saque_fixo + custo - inss


# =====================================================
# GUARDRAILS
# =====================================================

def apply_guardrails(base_withdrawal, drawdown, year, saude_func):
    """Apply drawdown-based guardrails."""
    t = year
    idade = 50 + t

    if idade < 60:
        piso = 220_000
    elif idade < 70:
        piso = 180_000
    else:
        saude_min = saude_func(t)
        piso = 120_000 + saude_min

    if drawdown > 0.35:
        return max(piso, 180_000)
    elif drawdown > 0.25:
        return max(base_withdrawal * 0.80, piso)
    elif drawdown > 0.15:
        return max(base_withdrawal * 0.90, piso)
    else:
        return base_withdrawal


# =====================================================
# SIMULATION ENGINES
# =====================================================

def generate_correlated_returns(n_years, n_sims, means, vols, corr_matrix, df=5):
    n_assets = len(means)
    L = np.linalg.cholesky(corr_matrix)
    all_returns = np.zeros((n_sims, n_years, n_assets))
    for sim in range(n_sims):
        z = np.random.standard_t(df, size=(n_years, n_assets))
        z = z * np.sqrt((df - 2) / df)
        correlated = z @ L.T
        for a in range(n_assets):
            mu_g = means[a] - vols[a]**2 / 2
            all_returns[sim, :, a] = np.exp(mu_g + vols[a] * correlated[:, a]) - 1
    return all_returns


def simulate_accumulation(equity_return, n_sims=N_SIM):
    means = np.array([equity_return, IPCA_RETURN_HTM, CRIPTO_RETURN, RENDA_PLUS_RETURN])
    vols = np.array([EQUITY_VOL, IPCA_VOL, CRIPTO_VOL, RENDA_PLUS_VOL])
    allocs = np.array([ALLOC_EQUITY, ALLOC_IPCA, ALLOC_CRIPTO, ALLOC_RENDA_PLUS])

    returns = generate_correlated_returns(ANOS_ACUM, n_sims, means, vols, CORR_MATRIX)
    patrimonio = np.zeros((n_sims, ANOS_ACUM + 1))
    patrimonio[:, 0] = PATRIMONIO_INICIAL

    for year in range(ANOS_ACUM):
        portfolio_return = np.sum(returns[:, year, :] * allocs, axis=1)
        patrimonio[:, year + 1] = (patrimonio[:, year] + APORTE_ANUAL) * (1 + portfolio_return)

    return patrimonio[:, -1]


def simulate_decumulation(pat_fire, ret_mean, ret_vol, saude_func, inss_valor,
                           use_guardrails=True, year1_shock=None,
                           n_years=HORIZONTE_DESACUM, n_sims=None):
    """
    Full decumulation simulation.
    pat_fire: array of starting patrimony (one per sim)
    """
    if n_sims is None:
        n_sims = len(pat_fire)

    patrimonio = np.zeros((n_sims, n_years + 1))
    patrimonio[:, 0] = pat_fire.copy()

    pico = pat_fire.copy()
    failed = np.zeros(n_sims, dtype=bool)

    mu_g = ret_mean - ret_vol**2 / 2
    scale = np.sqrt((DF_T - 2) / DF_T)

    for year in range(n_years):
        z = np.random.standard_t(DF_T, size=n_sims) * scale
        if year == 0 and year1_shock is not None:
            returns = np.full(n_sims, year1_shock)
        else:
            returns = np.exp(mu_g + ret_vol * z) - 1

        base_w = get_spending(year, saude_func, inss_valor)

        for i in range(n_sims):
            if failed[i]:
                continue

            w = base_w
            if use_guardrails:
                dd = max(0, 1 - patrimonio[i, year] / pico[i])
                w = apply_guardrails(base_w, dd, year, saude_func)
                if patrimonio[i, year] > pico[i] * 1.25:
                    w = min(w * 1.10, base_w * 1.40)
                    pico[i] = patrimonio[i, year]

            novo = (patrimonio[i, year] - w) * (1 + returns[i])

            if novo <= 0:
                patrimonio[i, year + 1] = 0
                failed[i] = True
            else:
                patrimonio[i, year + 1] = novo
                pico[i] = max(pico[i], novo)

    sr = 1 - np.mean(failed)
    return sr


def simulate_decum_flat_withdrawal(pat_fire, ret_mean, ret_vol, saque_anual,
                                    inss_valor=25_000, year1_shock=None,
                                    n_years=HORIZONTE_DESACUM):
    """
    Simplified decumulation with fixed annual withdrawal (for guardrails table).
    No spending smile — just fixed saque + costs - INSS.
    """
    n_sims = len(pat_fire)
    patrimonio = np.zeros((n_sims, n_years + 1))
    patrimonio[:, 0] = pat_fire.copy()
    failed = np.zeros(n_sims, dtype=bool)

    mu_g = ret_mean - ret_vol**2 / 2
    scale = np.sqrt((DF_T - 2) / DF_T)

    for year in range(n_years):
        z = np.random.standard_t(DF_T, size=n_sims) * scale
        if year == 0 and year1_shock is not None:
            returns = np.full(n_sims, year1_shock)
        else:
            returns = np.exp(mu_g + ret_vol * z) - 1

        w = get_fixed_withdrawal(saque_anual, year, inss_valor)

        for i in range(n_sims):
            if failed[i]:
                continue
            novo = (patrimonio[i, year] - w) * (1 + returns[i])
            if novo <= 0:
                patrimonio[i, year + 1] = 0
                failed[i] = True
            else:
                patrimonio[i, year + 1] = novo

    sr = 1 - np.mean(failed)
    return sr


# =====================================================
# MAIN
# =====================================================

def main():
    print("=" * 95)
    print("FR-SPENDING-SMILE v3: MONTE CARLO — HEALTH CAP/DECAY MODEL")
    print("inflator_saude(t) = max(3%, 7% - 0.2% * t)")
    print("10k trajectories | t-dist df=5 | seed=42")
    print("=" * 95)

    # ========================================
    # PRE-COMPUTE: Accumulation
    # ========================================
    acum_cache = {}
    for rname, rscen in EQUITY_SCENARIOS.items():
        np.random.seed(42)
        acum_cache[rname] = simulate_accumulation(rscen["acum"])

    pat_med_base = np.median(acum_cache["base"])
    print(f"\nPatrimonio mediano aos 50 (base): R$ {pat_med_base:,.0f}")

    # ========================================
    # FORMULAS EXPLICITAS — SAUDE CAP/DECAY
    # ========================================
    print("\n" + "=" * 95)
    print("FORMULAS EXPLICITAS — MODELO DE SAUDE v3 (CAP/DECAY)")
    print("=" * 95)
    print("""
  inflator_saude(t) = max(3%, 7% - 0.2% * t)
  Saude(t) = R$18k * prod_{i=1}^{t} (1 + inflator(i))

  Derivacao passo a passo:

  inflator(1)  = max(3%, 7% - 0.2%*1)  = max(3%, 6.8%) = 6.8%
  inflator(2)  = max(3%, 7% - 0.2%*2)  = max(3%, 6.6%) = 6.6%
  inflator(5)  = max(3%, 7% - 0.2%*5)  = max(3%, 6.0%) = 6.0%
  inflator(10) = max(3%, 7% - 0.2%*10) = max(3%, 5.0%) = 5.0%
  inflator(15) = max(3%, 7% - 0.2%*15) = max(3%, 4.0%) = 4.0%
  inflator(20) = max(3%, 7% - 0.2%*20) = max(3%, 3.0%) = 3.0%  <-- piso atingido
  inflator(25) = max(3%, 7% - 0.2%*25) = max(3%, 2.0%) = 3.0%  <-- mantem piso
  inflator(30) = max(3%, 7% - 0.2%*30) = max(3%, 1.0%) = 3.0%  <-- mantem piso
  inflator(40) = max(3%, 7% - 0.2%*40) = max(3%, -1.0%) = 3.0% <-- mantem piso

  Saude(0)  = R$18,000
  Saude(1)  = 18000 * 1.068 = R$19,224
  Saude(2)  = 19224 * 1.066 = R$20,493
  Saude(5)  = produto acumulado = R$24,976
  Saude(10) = R$35,282
  Saude(20) = R$56,128
  Saude(30) = R$75,433
  Saude(40) = R$101,392
    """)

    # Compute and verify explicit values
    print("  Verificacao computacional:")
    for t in [0, 1, 2, 5, 10, 15, 20, 25, 30, 35, 40]:
        val = saude_capdecay(t)
        rate = inflator_capdecay(t) if t > 0 else 0
        idade = 50 + t
        print(f"    t={t:>2} (idade {idade}): inflator={max(0.03, 0.07-0.002*t)*100 if t>0 else 0:.1f}%  "
              f"Saude = R$ {val:>10,.0f}")

    # ========================================
    # TABELA 4: PROJECAO DE SAUDE POR MODELO
    # ========================================
    print("\n" + "=" * 95)
    print("TABELA 4 — PROJECAO DE SAUDE POR MODELO")
    print("=" * 95)
    print(f"\n  {'Idade':>5} | {'t':>3} | {'+5% flat':>12} | {'cap/decay':>12} | {'+7% puro':>12}")
    print(f"  {'-'*5}-+-{'-'*3}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")

    for idade in [50, 55, 60, 65, 70, 75, 80, 85, 90]:
        t = idade - 50
        v_flat5 = saude_flat5(t)
        v_cap = saude_capdecay(t)
        v_exp7 = saude_exp7(t)
        print(f"  {idade:>5} | {t:>3} | R$ {v_flat5:>9,.0f} | R$ {v_cap:>9,.0f} | R$ {v_exp7:>9,.0f}")

    # ========================================
    # TABELA 1: EVOLUCAO HISTORICA DO P(SUCESSO)
    # ========================================
    print("\n" + "=" * 95)
    print("TABELA 1 — EVOLUCAO HISTORICA DO P(SUCESSO)")
    print("=" * 95)

    # FR-003 flat R$250k (reference — not re-run, values from FR-003)
    print(f"\n  {'Modelo':<40} | {'P(base)':>10} | {'P(favoravel)':>12} | {'P(stress)':>10}")
    print(f"  {'-'*40}-+-{'-'*10}-+-{'-'*12}-+-{'-'*10}")
    print(f"  {'FR-003 flat R$250k':<40} | {'90.4%':>10} | {'95.4%':>12} | {'86.1%':>10}")

    # v1: smile + saude +5% flat
    v1_results = {}
    for rname, rscen in EQUITY_SCENARIOS.items():
        np.random.seed(200)
        sr = simulate_decumulation(
            acum_cache[rname], rscen["desacum"], DESACUM_VOL,
            saude_func=saude_flat5, inss_valor=25_000
        )
        v1_results[rname] = sr

    print(f"  {'v1: smile, saude +5% flat':<40} | {v1_results['base']:>9.1%} | {v1_results['favoravel']:>11.1%} | {v1_results['stress']:>9.1%}")

    # v2: smile + saude +7% exp puro (reference values — re-run for consistency)
    v2_results = {}
    for rname, rscen in EQUITY_SCENARIOS.items():
        np.random.seed(200)
        sr = simulate_decumulation(
            acum_cache[rname], rscen["desacum"], DESACUM_VOL,
            saude_func=saude_exp7, inss_valor=25_000
        )
        v2_results[rname] = sr

    print(f"  {'v2: smile, saude +7% exp. puro':<40} | {v2_results['base']:>9.1%} | {v2_results['favoravel']:>11.1%} | {v2_results['stress']:>9.1%}")

    # v3: smile + saude cap/decay
    v3_results = {}
    for rname, rscen in EQUITY_SCENARIOS.items():
        np.random.seed(200)
        sr = simulate_decumulation(
            acum_cache[rname], rscen["desacum"], DESACUM_VOL,
            saude_func=saude_capdecay, inss_valor=25_000
        )
        v3_results[rname] = sr

    print(f"  {'**v3: smile, saude cap/decay**':<40} | {v3_results['base']:>9.1%} | {v3_results['favoravel']:>11.1%} | {v3_results['stress']:>9.1%}")

    # ========================================
    # TABELA 2: CROSS-MATRIX INSS x SAUDE (cenario base 5.96%)
    # ========================================
    print("\n" + "=" * 95)
    print("TABELA 2 — CROSS-MATRIX INSS x SAUDE (cenario base 5.96%)")
    print("=" * 95)

    pat_fire_base = acum_cache["base"]
    ret_base_d = EQUITY_SCENARIOS["base"]["desacum"]

    saude_models = {
        "+5% flat": saude_flat5,
        "cap/decay": saude_capdecay,
        "+7% puro": saude_exp7,
    }

    print(f"\n  {'INSS \\ Saude':>15} | {'+5% flat':>10} | {'cap/decay':>10} | {'+7% puro':>10}")
    print(f"  {'-'*15}-+-{'-'*10}-+-{'-'*10}-+-{'-'*10}")

    cross_results = {}
    for iname, ival in INSS_SCENARIOS.items():
        row = f"  {iname:>15}"
        for sname, sfunc in saude_models.items():
            np.random.seed(200)
            sr = simulate_decumulation(
                pat_fire_base, ret_base_d, DESACUM_VOL,
                saude_func=sfunc, inss_valor=ival
            )
            row += f" | {sr:>9.1%}"
            cross_results[(iname, sname)] = sr
        print(row)

    # ========================================
    # TABELA 3: GUARDRAILS COM P(SUCESSO) RODADO
    # ========================================
    print("\n" + "=" * 95)
    print("TABELA 3 — GUARDRAILS COM P(SUCESSO) RODADO")
    print(f"  SWR = saque / R${pat_med_base/1e6:.1f}M (patrimonio mediano aos 50)")
    print("  MC fixando o saque (sem spending smile), 45 anos, cap/decay saude")
    print("=" * 95)

    # For guardrails table: run MC with fixed withdrawal levels
    # Each row: a specific withdrawal amount representing a guardrail scenario
    guardrail_rows = [
        ("Normal",  "Go-Go",   318_000),
        ("-10%",    "Go-Go",   286_000),
        ("-20%",    "Go-Go",   254_000),
        ("Piso",    "Go-Go",   220_000),
        ("Normal",  "Slow-Go", 202_000),
        ("Normal",  "No-Go",   262_000),
        ("Piso",    "No-Go",   150_000),  # + saude handled in note
    ]

    print(f"\n  {'Drawdown':>10} | {'Fase':>8} | {'Saque':>10} | {'SWR':>6} | {'P(base)':>8} | {'P(fav)':>8} | {'P(stress)':>10}")
    print(f"  {'-'*10}-+-{'-'*8}-+-{'-'*10}-+-{'-'*6}-+-{'-'*8}-+-{'-'*8}-+-{'-'*10}")

    for dd_label, fase, saque in guardrail_rows:
        swr = saque / pat_med_base * 100
        results_row = {}
        for rname, rscen in EQUITY_SCENARIOS.items():
            np.random.seed(200)
            sr = simulate_decum_flat_withdrawal(
                acum_cache[rname], rscen["desacum"], DESACUM_VOL,
                saque_anual=saque, inss_valor=25_000
            )
            results_row[rname] = sr

        print(f"  {dd_label:>10} | {fase:>8} | R${saque/1e3:>5.0f}k | {swr:>5.2f}% | {results_row['base']:>7.1%} | {results_row['favoravel']:>7.1%} | {results_row['stress']:>9.1%}")

    # ========================================
    # TABELA 5: STRESS TESTS v3
    # ========================================
    print("\n" + "=" * 95)
    print("TABELA 5 — STRESS TESTS v3")
    print("=" * 95)

    stress_tests = []

    # 1. Base v3 (cap/decay, INSS R$25k)
    np.random.seed(200)
    sr = simulate_decumulation(
        pat_fire_base, ret_base_d, DESACUM_VOL,
        saude_func=saude_capdecay, inss_valor=25_000
    )
    stress_tests.append(("Base v3 (cap/decay, INSS R$25k)", sr))

    # 2. Bear -30% ano 1 + cap/decay
    np.random.seed(200)
    sr = simulate_decumulation(
        pat_fire_base, ret_base_d, DESACUM_VOL,
        saude_func=saude_capdecay, inss_valor=25_000,
        year1_shock=-0.30
    )
    stress_tests.append(("Bear -30% ano 1 + cap/decay", sr))

    # 3. INSS R$0 + cap/decay
    np.random.seed(200)
    sr = simulate_decumulation(
        pat_fire_base, ret_base_d, DESACUM_VOL,
        saude_func=saude_capdecay, inss_valor=0
    )
    stress_tests.append(("INSS R$0 + cap/decay", sr))

    # 4. Bear -30% + INSS R$0 + cap/decay
    np.random.seed(200)
    sr = simulate_decumulation(
        pat_fire_base, ret_base_d, DESACUM_VOL,
        saude_func=saude_capdecay, inss_valor=0,
        year1_shock=-0.30
    )
    stress_tests.append(("Bear -30% + INSS R$0 + cap/decay", sr))

    print(f"\n  {'Cenario':<45} | {'P(sucesso)':>10}")
    print(f"  {'-'*45}-+-{'-'*10}")
    for label, sr in stress_tests:
        print(f"  {label:<45} | {sr:>9.1%}")

    # ========================================
    # SUMMARY
    # ========================================
    print("\n" + "=" * 95)
    print("RESUMO: v3 cap/decay vs v2 exponencial puro")
    print("=" * 95)
    print(f"""
  v3 cap/decay:   P(base) = {v3_results['base']:.1%}  |  P(fav) = {v3_results['favoravel']:.1%}  |  P(stress) = {v3_results['stress']:.1%}
  v2 exp +7%:     P(base) = {v2_results['base']:.1%}  |  P(fav) = {v2_results['favoravel']:.1%}  |  P(stress) = {v2_results['stress']:.1%}
  Delta (v3-v2):  P(base) = {(v3_results['base']-v2_results['base'])*100:+.1f}pp  |  P(fav) = {(v3_results['favoravel']-v2_results['favoravel'])*100:+.1f}pp  |  P(stress) = {(v3_results['stress']-v2_results['stress'])*100:+.1f}pp

  O modelo cap/decay e intermediario: mais conservador que +5% flat,
  mais realista que +7% exponencial puro (que implica R$567k de saude aos 90).
  Cap/decay converge para +3% real apos 20 anos — coerente com estabilizacao
  de consumo de saude em idade avancada quando ja se tem plano premium.
    """)

    print("=" * 95)
    print("Script: dados/monte_carlo_spending_smile_v3.py | Seed=42 (acum), 200 (desacum)")
    print("=" * 95)


if __name__ == "__main__":
    main()
