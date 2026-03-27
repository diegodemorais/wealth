#!/usr/bin/env python3
"""
FR-spending-smile v3 CORRIGIDO: Monte Carlo with cap/decay health model
Base: FR-003 (HD-006, 2026-03-22) + v1/v2 spending smile

CORRECAO CRITICA vs v3 anterior:
  v3 anterior: SAUDE_BASE = R$18,000 no FIRE (ERRADO)
  v3 corrigido: SAUDE_BASE_FIRE = R$18,000 * (1.07)^11 = R$37,887

  Diego gasta R$18k/ano em saude HOJE (idade 39).
  O VCMH/inflator de saude (+7% real) ja compoe durante os 11 anos ate o FIRE.
  Portanto, ao chegar aos 50, saude ja custa R$37,887.

Health model v3 — cap/decay (inalterado, mas BASE corrigida):
  inflator_saude(t) = max(3%, 7% - 0.2% * t)
  where t = years since FIRE (age 50)

  Saude(t) = R$37,887 * product(1 + inflator(i)) for i=1 to t

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
# HEALTH MODELS — BASE CORRIGIDA
# =====================================================

# CORRECAO: base de saude composta ate o FIRE
SAUDE_BASE_HOJE = 18_000           # R$18k/ano HOJE (idade 39, auditado HD-009)
ANOS_ATE_FIRE = 11                 # 50 - 39
VCMH_PRE_FIRE = 0.07              # VCMH +7% real/ano (IESS)
SAUDE_BASE_FIRE = SAUDE_BASE_HOJE * ((1 + VCMH_PRE_FIRE) ** ANOS_ATE_FIRE)
# = 18000 * (1.07)^11 = 18000 * 2.10485 = R$37,887

# Manter compatibilidade: v3 anterior usava SAUDE_BASE = 18000
# Para comparacao, guardar ambos
SAUDE_BASE_V3_ERRADO = 18_000     # base errada do v3 anterior (referencia)


def inflator_capdecay(t):
    """
    v3 cap/decay: inflator_saude(t) = max(3%, 7% - 0.2% * t)
    t = years since FIRE (age 50)
    """
    return max(0.03, 0.07 - 0.002 * t)


def saude_capdecay(t):
    """
    CORRIGIDO: Saude(t) = R$37,887 * prod_{i=1}^{t} (1 + inflator(i))

    FORMULA EXPLICITA:
    saude(0) = 37887  (base composta: 18000 * 1.07^11)
    saude(1) = 37887 * (1 + max(3%, 7% - 0.2%*1)) = 37887 * 1.068 = 40,463
    saude(2) = 40463 * (1 + max(3%, 7% - 0.2%*2)) = 40463 * 1.066 = 43,134
    ...
    saude(t) = 37887 * prod_{i=1}^{t} (1 + max(0.03, 0.07 - 0.002*i))
    """
    if t == 0:
        return SAUDE_BASE_FIRE
    val = SAUDE_BASE_FIRE
    for i in range(1, t + 1):
        rate = max(0.03, 0.07 - 0.002 * i)
        val *= (1 + rate)
    return val


def saude_flat5(t):
    """v1: +5% flat forever from FIRE. Base corrigida."""
    return SAUDE_BASE_FIRE * (1.05) ** t


def saude_exp7(t):
    """v2: +7% exponential pure from FIRE. Base corrigida."""
    return SAUDE_BASE_FIRE * (1.07) ** t


# =====================================================
# SPENDING FUNCTIONS
# =====================================================

def get_spending(year_in_retirement, saude_func, inss_valor):
    """
    Returns total withdrawal for a given year.
    year_in_retirement: 0 = age 50, 10 = age 60, etc.

    Lifestyle ex-saude:
      Go-Go  (50-59): R$280k - R$37,887 = R$242,113 non-health
      Slow-Go (60-69): R$225k - R$37,887 = R$187,113 non-health
      No-Go  (70+):   R$285k - R$37,887 = R$247,113 non-health

    Total = lifestyle_ex_saude + saude(t) + custo_desacum - INSS
    """
    idade = 50 + year_in_retirement
    t = year_in_retirement
    saude = saude_func(t)

    # Lifestyle by phase (EXCLUDING health — health added separately)
    # Base: R$280k/225k/285k total spending por fase (incluindo saude)
    # Subtrair base de saude no FIRE para isolar lifestyle
    if t < 10:   # Go-Go (50-59)
        lifestyle_ex_saude = 280_000 - SAUDE_BASE_FIRE
    elif t < 20:  # Slow-Go (60-69)
        lifestyle_ex_saude = 225_000 - SAUDE_BASE_FIRE
    else:         # No-Go (70+)
        lifestyle_ex_saude = 285_000 - SAUDE_BASE_FIRE

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
    print("=" * 100)
    print("FR-SPENDING-SMILE v3 CORRIGIDO: MONTE CARLO — HEALTH CAP/DECAY (BASE COMPOSTA)")
    print(f"CORRECAO: SAUDE_BASE = R$18k * (1.07)^11 = R${SAUDE_BASE_FIRE:,.0f} no FIRE")
    print(f"(v3 anterior usava R${SAUDE_BASE_V3_ERRADO:,} — ERRADO)")
    print("inflator_saude(t) = max(3%, 7% - 0.2% * t)  |  t = anos desde FIRE")
    print("10k trajectories | t-dist df=5 | seed=42 (acum), 200 (decum)")
    print("=" * 100)

    # ========================================
    # DERIVACAO DA BASE CORRIGIDA
    # ========================================
    print("\n" + "-" * 100)
    print("DERIVACAO: BASE DE SAUDE CORRIGIDA")
    print("-" * 100)
    print(f"""
  Diego tem 39 anos, gasta R$18,000/ano em saude.
  VCMH (inflacao de saude) = +7% real/ano (IESS).
  FIRE aos 50 = 11 anos de composicao.

  SAUDE_BASE_FIRE = R$18,000 * (1.07)^11
                  = R$18,000 * {(1.07**11):.5f}
                  = R${SAUDE_BASE_FIRE:,.0f}

  Verificacao ano a ano:
""")
    val = SAUDE_BASE_HOJE
    for y in range(1, ANOS_ATE_FIRE + 1):
        val *= 1.07
        print(f"    Idade {39+y:>2} (ano {y:>2}): R${val:>10,.0f}")

    print(f"\n  => No FIRE (idade 50): R${SAUDE_BASE_FIRE:,.0f}")
    print(f"  => v3 anterior usava:  R${SAUDE_BASE_V3_ERRADO:,} (ERRADO, sem composicao)")
    print(f"  => Diferenca: R${SAUDE_BASE_FIRE - SAUDE_BASE_V3_ERRADO:,.0f} ({SAUDE_BASE_FIRE/SAUDE_BASE_V3_ERRADO:.2f}x)")

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
    # TABELA 3 — SAUDE CAP/DECAY CORRIGIDA POR IDADE (passo a passo)
    # ========================================
    print("\n" + "=" * 100)
    print("TABELA 3 — SAUDE CAP/DECAY CORRIGIDA POR IDADE")
    print(f"  Base no FIRE: R${SAUDE_BASE_FIRE:,.0f} (= R$18k * 1.07^11)")
    print("  inflator(t) = max(3%, 7% - 0.2% * t)")
    print("=" * 100)

    print(f"\n  {'Idade':>5} | {'t':>3} | {'Inflator':>10} | {'Formula':>35} | {'Saude':>12}")
    print(f"  {'-'*5}-+-{'-'*3}-+-{'-'*10}-+-{'-'*35}-+-{'-'*12}")

    val = SAUDE_BASE_FIRE
    for idade in range(50, 91):
        t = idade - 50
        if t == 0:
            inflator_str = "n/a"
            formula_str = f"18000 * 1.07^11"
            val_display = SAUDE_BASE_FIRE
        else:
            inf_raw = 0.07 - 0.002 * t
            inf = max(0.03, inf_raw)
            inflator_str = f"{inf*100:.1f}%"
            if t == 1:
                val = SAUDE_BASE_FIRE * (1 + inf)
            else:
                val *= (1 + inf)
            formula_str = f"prev * {1+inf:.3f}"
            val_display = val

        # Verify against function
        assert abs(val_display - saude_capdecay(t)) < 0.01, \
            f"Mismatch at t={t}: {val_display:.2f} vs {saude_capdecay(t):.2f}"

        print(f"  {idade:>5} | {t:>3} | {inflator_str:>10} | {formula_str:>35} | R$ {val_display:>9,.0f}")

    # ========================================
    # TABELA 4 — COMPARATIVO DE SAUDE POR MODELO
    # ========================================
    print("\n" + "=" * 100)
    print("TABELA 4 — COMPARATIVO FINAL SAUDE POR MODELO (base corrigida R$37,887)")
    print("=" * 100)
    print(f"\n  {'Idade':>5} | {'t':>3} | {'+5% flat':>12} | {'cap/decay':>12} | {'+7% puro':>12}")
    print(f"  {'-'*5}-+-{'-'*3}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")

    for idade in [50, 55, 60, 65, 70, 75, 80, 85, 90, 95]:
        t = idade - 50
        if t > HORIZONTE_DESACUM:
            break
        v_flat5 = saude_flat5(t)
        v_cap = saude_capdecay(t)
        v_exp7 = saude_exp7(t)
        print(f"  {idade:>5} | {t:>3} | R$ {v_flat5:>9,.0f} | R$ {v_cap:>9,.0f} | R$ {v_exp7:>9,.0f}")

    # ========================================
    # TABELA 1 — EVOLUCAO HISTORICA DO P(SUCESSO)
    # ========================================
    print("\n" + "=" * 100)
    print("TABELA 1 — EVOLUCAO HISTORICA DO P(SUCESSO)")
    print("  Todos com guardrails, INSS R$25k, spending smile")
    print("=" * 100)

    print(f"\n  {'Modelo':<45} | {'P(base)':>10} | {'P(favoravel)':>12} | {'P(stress)':>10}")
    print(f"  {'-'*45}-+-{'-'*10}-+-{'-'*12}-+-{'-'*10}")

    # FR-003 flat R$250k (reference — not re-run)
    print(f"  {'FR-003 flat R$250k (sem smile)':<45} | {'90.4%':>10} | {'95.4%':>12} | {'86.1%':>10}")

    # v1: smile + saude +5% flat (base errada R$18k — historico)
    print(f"  {'v1: smile +5% flat (base R$18k ERRADA)':<45} | {'(historico)':>10} | {'(historico)':>12} | {'(historico)':>10}")

    # v2: smile + saude +7% exp (base errada R$18k — historico)
    print(f"  {'v2: smile +7% exp (base R$18k ERRADA)':<45} | {'79.0%':>10} | {'88.5%':>12} | {'72.0%':>10}")

    # v3 anterior: cap/decay (base errada R$18k — historico, nao re-rodar)
    # v3 anterior nao foi registrado, rodar para referencia
    # (mas usando base errada para mostrar delta)

    # v1 corrigido: smile + saude +5% flat (base R$37,887)
    v1c_results = {}
    for rname, rscen in EQUITY_SCENARIOS.items():
        np.random.seed(200)
        sr = simulate_decumulation(
            acum_cache[rname], rscen["desacum"], DESACUM_VOL,
            saude_func=saude_flat5, inss_valor=25_000
        )
        v1c_results[rname] = sr

    print(f"  {'v1c: smile +5% flat (base R$37.9k CORR.)':<45} | {v1c_results['base']:>9.1%} | {v1c_results['favoravel']:>11.1%} | {v1c_results['stress']:>9.1%}")

    # v2 corrigido: smile + saude +7% exp (base R$37,887)
    v2c_results = {}
    for rname, rscen in EQUITY_SCENARIOS.items():
        np.random.seed(200)
        sr = simulate_decumulation(
            acum_cache[rname], rscen["desacum"], DESACUM_VOL,
            saude_func=saude_exp7, inss_valor=25_000
        )
        v2c_results[rname] = sr

    print(f"  {'v2c: smile +7% exp (base R$37.9k CORR.)':<45} | {v2c_results['base']:>9.1%} | {v2c_results['favoravel']:>11.1%} | {v2c_results['stress']:>9.1%}")

    # v3 corrigido: smile + cap/decay (base R$37,887) — PRINCIPAL
    v3c_results = {}
    for rname, rscen in EQUITY_SCENARIOS.items():
        np.random.seed(200)
        sr = simulate_decumulation(
            acum_cache[rname], rscen["desacum"], DESACUM_VOL,
            saude_func=saude_capdecay, inss_valor=25_000
        )
        v3c_results[rname] = sr

    print(f"  {'**v3c: cap/decay (base R$37.9k CORR.)**':<45} | {v3c_results['base']:>9.1%} | {v3c_results['favoravel']:>11.1%} | {v3c_results['stress']:>9.1%}")

    # ========================================
    # TABELA 2 — CROSS-MATRIX INSS x SAUDE (cenario base 5.96%)
    # ========================================
    print("\n" + "=" * 100)
    print("TABELA 2 — CROSS-MATRIX INSS x SAUDE (cenario base 5.96%)")
    print(f"  Base de saude CORRIGIDA: R${SAUDE_BASE_FIRE:,.0f}")
    print("=" * 100)

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
    # TABELA 5 — STRESS TESTS v3 CORRIGIDO
    # ========================================
    print("\n" + "=" * 100)
    print("TABELA 5 — STRESS TESTS v3 CORRIGIDO")
    print(f"  Base de saude: R${SAUDE_BASE_FIRE:,.0f} | inflator cap/decay")
    print("=" * 100)

    stress_tests = []

    # 1. Base v3c (cap/decay, INSS R$25k)
    np.random.seed(200)
    sr = simulate_decumulation(
        pat_fire_base, ret_base_d, DESACUM_VOL,
        saude_func=saude_capdecay, inss_valor=25_000
    )
    stress_tests.append(("Base cap/decay (INSS R$25k)", sr))

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

    # 4. Bear -30% + INSS R$0 + cap/decay (combo extremo)
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
    # IMPACTO DA CORRECAO
    # ========================================
    print("\n" + "=" * 100)
    print("IMPACTO DA CORRECAO: SAUDE BASE R$18k vs R$37.9k")
    print("=" * 100)

    print(f"""
  Saude no FIRE (t=0):  R${SAUDE_BASE_V3_ERRADO:>6,} (v3 errado) -> R${SAUDE_BASE_FIRE:>6,.0f} (v3 corrigido)
  Saude aos 70 (t=20):  R${SAUDE_BASE_V3_ERRADO * 3.12:>6,.0f} (v3 errado) -> R${saude_capdecay(20):>6,.0f} (v3 corrigido)
  Saude aos 90 (t=40):  R${SAUDE_BASE_V3_ERRADO * 5.63:>6,.0f} (v3 errado) -> R${saude_capdecay(40):>6,.0f} (v3 corrigido)

  A base corrigida gera gastos de saude 2.1x maiores em TODOS os anos,
  reduzindo as success rates porque o spending total sobe.

  Gasto total t=0 (Go-Go + saude + custos):
    v3 errado:    R${280_000 - SAUDE_BASE_V3_ERRADO + SAUDE_BASE_V3_ERRADO + CUSTO_DESACUM_50_65:,}
    v3 corrigido: R${280_000 - SAUDE_BASE_FIRE + SAUDE_BASE_FIRE + CUSTO_DESACUM_50_65:,.0f}
    (Iguais no t=0 porque lifestyle_ex_saude + saude = R$280k constante no Go-Go)

  Divergencia cresce com o tempo:
    t=20 (No-Go, idade 70): lifestyle R$247k + saude R${saude_capdecay(20):,.0f} + custos R${CUSTO_DESACUM_65_80:,} - INSS R$25k
                           = R${247_000 + saude_capdecay(20) + CUSTO_DESACUM_65_80 - 25_000:,.0f}/ano (v3c)
                           vs R${267_000 + 56_128 + CUSTO_DESACUM_65_80 - 25_000:,} (v3 errado, R$56k saude)
""")

    # ========================================
    # SPENDING YEAR 1 BREAKDOWN
    # ========================================
    print("=" * 100)
    print("DECOMPOSICAO DO SPENDING: ANO 1 NO FIRE (t=0, idade 50)")
    print("=" * 100)
    s0 = saude_capdecay(0)
    lifestyle_ex = 280_000 - s0
    total_t0 = lifestyle_ex + s0 + CUSTO_DESACUM_50_65
    print(f"""
  Spending smile Go-Go target:   R$280,000
  Saude no FIRE (base composta): R$ {s0:,.0f}
  Lifestyle ex-saude:            R${lifestyle_ex:,.0f}  (= R$280k - R${s0:,.0f})
  Custo desacumulacao:           R$ {CUSTO_DESACUM_50_65:,}
  INSS (antes dos 65):           R$      0
  -----------------------------------------------
  TOTAL SAQUE ANO 1:             R${total_t0:,.0f}
  SWR (sobre mediana R${pat_med_base/1e6:.1f}M):    {total_t0/pat_med_base*100:.2f}%
""")

    print("=" * 100)
    print(f"Script: dados/monte_carlo_spending_smile_v3_corrigido.py")
    print(f"Seeds: 42 (acumulacao), 200 (desacumulacao) | N=10,000 | t-dist df=5")
    print("=" * 100)


if __name__ == "__main__":
    main()
