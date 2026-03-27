#!/usr/bin/env python3
"""
Monte Carlo — Cenario Casal (Diego + Katia) em Indaiatuba
Base: monte_carlo_spending_smile_v3_corrigido.py (FR-spending-smile)

Premissas de acumulacao:
  - Patrimonio inicial: R$3.48M
  - Aportes variaveis por fase (mensal -> anual):
    Meses 1-24 (SP, ambos trabalhando): R$15k/mes = R$180k/ano
    Meses 25-42 (licenca Katia + bebe): R$9k/mes = R$108k/ano
    Meses 43-132 (Indaiatuba, Katia voltou): R$16k/mes = R$192k/ano
  - One-time: +R$190k no mes 30 (liquido venda apt Katia - entrada casa)
  - FIRE age: 50 (11 anos = 132 meses)

Premissas de spending (casal Indaiatuba):
  Lifestyle (ex-saude, net de aluguel Pinheiros R$66k/ano):
    Go-Go  (anos 1-10): R$290k/ano (inclui viagens R$60k)
    Slow-Go (anos 11-20): R$230k/ano
    No-Go  (anos 21+): R$200k/ano

  Saude (2 pessoas, ambos 50 no FIRE):
    Base no FIRE: R$18k * (1.07)^11 * 2 = R$75,774
    Inflator: max(3%, 7% - 0.2% * t)

  Sobrecarga temporaria (escola + mortgage declining):
    Anos 1-7 FIRE: +R$100k/ano (escola R$30k + mortgage R$70k medio)
    Anos 8-10: +R$50k/ano (mortgage, escola acabou)
    Anos 11+: R$0

  Aluguel Pinheiros R$66k/ano ja descontado do lifestyle.
  Katia ~R$800k proprios no FIRE -> ~R$32k/ano (ja incorporado no lifestyle net).

Guardrails (adaptados para casal):
  0-15%: R$290k | 15-25%: R$260k | 25-35%: R$230k | >35%: R$200k (piso)
  Upside +25%: +R$29k permanente (teto R$380k)

3 cenarios x 10k trajetorias, seeds 42 e 200.

Sources:
  - Blanchett (2014): spending smile
  - VCMH/IESS: health inflation Brazil +7-8% real
  - Cont (2001): fat tails, t-distribution df=5
  - Kitces & Fitzpatrick (2024): risk-based guardrails
"""

import numpy as np

N_SIM = 10_000

# =====================================================
# PREMISSAS FIXAS
# =====================================================

PATRIMONIO_INICIAL = 3_482_633
IDADE_ATUAL = 39
IDADE_FIRE = 50
HORIZONTE_DESACUM = 45  # ate 95 anos
ANOS_ACUM = IDADE_FIRE - IDADE_ATUAL  # 11
MESES_ACUM = ANOS_ACUM * 12  # 132

# Asset class returns and vols (accumulation) — from HD-006
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

# INSS — casal: Diego contribui, Katia nao (simplificacao)
INSS_VALOR = 25_000  # Diego aos 65+

# =====================================================
# APORTES VARIAVEIS POR FASE (mensal)
# =====================================================

def get_monthly_contribution(month):
    """
    month: 1-based (1 = primeiro mes)
    Retorna aporte mensal em R$.
    """
    if month <= 24:
        return 15_000
    elif month <= 42:
        return 9_000
    else:
        return 16_000


def get_one_time_events(month):
    """One-time cash events by month."""
    if month == 30:
        return 190_000
    return 0


# Pre-compute annual contributions (for annual model)
def compute_annual_contributions():
    """
    Converte aportes mensais em anuais.
    Ano 1 = meses 1-12, Ano 2 = meses 13-24, etc.
    """
    annual = []
    for year in range(ANOS_ACUM):
        total = 0
        for m in range(1, 13):
            month = year * 12 + m
            if month <= MESES_ACUM:
                total += get_monthly_contribution(month)
                total += get_one_time_events(month)
        annual.append(total)
    return annual


ANNUAL_CONTRIBUTIONS = compute_annual_contributions()

# =====================================================
# HEALTH MODEL — 2 PESSOAS
# =====================================================

SAUDE_BASE_HOJE_PP = 18_000       # R$18k/ano por pessoa HOJE (idade 39)
N_PESSOAS_SAUDE = 2
VCMH_PRE_FIRE = 0.07
SAUDE_BASE_FIRE_PP = SAUDE_BASE_HOJE_PP * ((1 + VCMH_PRE_FIRE) ** ANOS_ACUM)
SAUDE_BASE_FIRE = SAUDE_BASE_FIRE_PP * N_PESSOAS_SAUDE
# = 18000 * (1.07)^11 * 2 = 37887 * 2 = R$75,774


def inflator_capdecay(t):
    """v3 cap/decay: max(3%, 7% - 0.2% * t)"""
    return max(0.03, 0.07 - 0.002 * t)


def saude_capdecay(t):
    """Saude(t) = base_fire * prod_{i=1}^{t} (1 + inflator(i))"""
    if t == 0:
        return SAUDE_BASE_FIRE
    val = SAUDE_BASE_FIRE
    for i in range(1, t + 1):
        rate = max(0.03, 0.07 - 0.002 * i)
        val *= (1 + rate)
    return val


# =====================================================
# SPENDING FUNCTIONS — CASAL INDAIATUBA
# =====================================================

def get_sobrecarga(year_in_retirement):
    """
    Sobrecarga temporaria (escola + mortgage declining).
    Anos 1-7 (t=0 a t=6): +R$100k/ano
    Anos 8-10 (t=7 a t=9): +R$50k/ano
    Anos 11+ (t>=10): R$0
    """
    if year_in_retirement < 7:
        return 100_000
    elif year_in_retirement < 10:
        return 50_000
    else:
        return 0


def get_spending_casal(year_in_retirement, inss_valor=INSS_VALOR):
    """
    Total withdrawal for casal in a given year.
    year_in_retirement: 0 = age 50, 10 = age 60, etc.

    Lifestyle (ex-saude, net de aluguel Pinheiros):
      Go-Go  (anos 1-10, t=0-9): R$290k
      Slow-Go (anos 11-20, t=10-19): R$230k
      No-Go  (anos 21+, t>=20): R$200k

    + Saude (2 pessoas, cap/decay)
    + Sobrecarga temporaria
    + Custo desacumulacao
    - INSS (Diego aos 65+)

    NOTE: lifestyle ja inclui saude base no target total.
    Saude separate = saude(t) - saude_base_fire (delta above base).
    Mas para manter consistencia com o modelo v3: lifestyle_ex_saude + saude(t).
    O lifestyle value acima JA eh net de saude. Saude eh adicionada separadamente.

    Correcao: os R$290k/R$230k/R$200k sao o lifestyle TOTAL ex-saude.
    Saude eh adicionada on top.
    """
    t = year_in_retirement
    idade = 50 + t
    saude = saude_capdecay(t)

    # Lifestyle ex-saude (ja net de aluguel Pinheiros R$66k/ano)
    if t < 10:    # Go-Go
        lifestyle_ex_saude = 290_000
    elif t < 20:  # Slow-Go
        lifestyle_ex_saude = 230_000
    else:         # No-Go
        lifestyle_ex_saude = 200_000

    # Sobrecarga temporaria
    sobrecarga = get_sobrecarga(t)

    # Custo desacumulacao
    if idade < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    # INSS (Diego aos 65+)
    inss = inss_valor if idade >= 65 else 0

    total = lifestyle_ex_saude + saude + sobrecarga + custo_desacum - inss
    return max(total, 0)


# =====================================================
# GUARDRAILS — CASAL
# =====================================================

def apply_guardrails_casal(base_withdrawal, drawdown, year, upside_bump=0):
    """
    Guardrails adaptados para casal:
    0-15%: base (R$290k lifestyle equiv)
    15-25%: R$260k lifestyle equiv
    25-35%: R$230k lifestyle equiv
    >35%: R$200k (piso)
    """
    t = year
    idade = 50 + t
    saude = saude_capdecay(t)
    sobrecarga = get_sobrecarga(t)

    if idade < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    inss = INSS_VALOR if idade >= 65 else 0

    # Piso = R$200k lifestyle + saude + sobrecarga + custos - INSS
    piso = 200_000 + saude + sobrecarga + custo_desacum - inss

    if drawdown > 0.35:
        return piso
    elif drawdown > 0.25:
        cut_lifestyle = 230_000 + saude + sobrecarga + custo_desacum - inss
        return max(cut_lifestyle, piso)
    elif drawdown > 0.15:
        cut_lifestyle = 260_000 + saude + sobrecarga + custo_desacum - inss
        return max(cut_lifestyle, piso)
    else:
        return base_withdrawal + upside_bump


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


def simulate_accumulation_casal(equity_return, contributions, n_sims=N_SIM):
    """
    Accumulation with variable annual contributions.
    """
    means = np.array([equity_return, IPCA_RETURN_HTM, CRIPTO_RETURN, RENDA_PLUS_RETURN])
    vols = np.array([EQUITY_VOL, IPCA_VOL, CRIPTO_VOL, RENDA_PLUS_VOL])
    allocs = np.array([ALLOC_EQUITY, ALLOC_IPCA, ALLOC_CRIPTO, ALLOC_RENDA_PLUS])

    n_years = len(contributions)
    returns = generate_correlated_returns(n_years, n_sims, means, vols, CORR_MATRIX)
    patrimonio = np.zeros((n_sims, n_years + 1))
    patrimonio[:, 0] = PATRIMONIO_INICIAL

    for year in range(n_years):
        portfolio_return = np.sum(returns[:, year, :] * allocs, axis=1)
        patrimonio[:, year + 1] = (patrimonio[:, year] + contributions[year]) * (1 + portfolio_return)

    return patrimonio[:, -1]


def simulate_decumulation_casal(pat_fire, ret_mean, ret_vol,
                                 use_guardrails=True, year1_shock=None,
                                 n_years=HORIZONTE_DESACUM, n_sims=None,
                                 return_paths=False):
    if n_sims is None:
        n_sims = len(pat_fire)

    patrimonio = np.zeros((n_sims, n_years + 1))
    patrimonio[:, 0] = pat_fire.copy()

    pico = pat_fire.copy()
    failed = np.zeros(n_sims, dtype=bool)
    upside_bump = np.zeros(n_sims)

    mu_g = ret_mean - ret_vol**2 / 2
    scale = np.sqrt((DF_T - 2) / DF_T)

    annual_spending = np.zeros((n_sims, n_years))

    for year in range(n_years):
        z = np.random.standard_t(DF_T, size=n_sims) * scale
        if year == 0 and year1_shock is not None:
            returns = np.full(n_sims, year1_shock)
        else:
            returns = np.exp(mu_g + ret_vol * z) - 1

        base_w = get_spending_casal(year)

        for i in range(n_sims):
            if failed[i]:
                continue

            w = base_w
            if use_guardrails:
                dd = max(0, 1 - patrimonio[i, year] / pico[i])
                w = apply_guardrails_casal(base_w, dd, year, upside_bump[i])
                # Upside rule: +25% above peak -> +R$29k permanent (cap R$380k total lifestyle)
                if patrimonio[i, year] > pico[i] * 1.25 and upside_bump[i] == 0:
                    upside_bump[i] = 29_000
                    w += 29_000
                if patrimonio[i, year] > pico[i]:
                    pico[i] = patrimonio[i, year]

            annual_spending[i, year] = w
            novo = (patrimonio[i, year] - w) * (1 + returns[i])

            if novo <= 0:
                patrimonio[i, year + 1] = 0
                failed[i] = True
            else:
                patrimonio[i, year + 1] = novo
                pico[i] = max(pico[i], novo)

    sr = 1 - np.mean(failed)
    if return_paths:
        return sr, patrimonio, annual_spending
    return sr


# =====================================================
# SCENARIO DEFINITIONS
# =====================================================

def build_scenarios():
    """
    3 cenarios:
    - Base: premissas acima completas
    - Favoravel: retornos +1pp, aportes +R$2k, sem sobrecarga, FIRE 53 (nao usado — mantem FIRE 50 para comparacao)
    - Stress: retornos -1pp, licenca Katia 2.5 anos (meses 25-54 R$9k), bear -30% ano 1
    """
    # Base contributions
    base_contribs = ANNUAL_CONTRIBUTIONS

    # Favoravel contributions: +R$2k/mes
    fav_contribs = []
    for year in range(ANOS_ACUM):
        total = 0
        for m in range(1, 13):
            month = year * 12 + m
            if month <= MESES_ACUM:
                total += get_monthly_contribution(month) + 2_000
                total += get_one_time_events(month)
        fav_contribs.append(total)

    # Stress contributions: licenca Katia estendida (meses 25-54 = R$9k)
    stress_contribs = []
    for year in range(ANOS_ACUM):
        total = 0
        for m in range(1, 13):
            month = year * 12 + m
            if month <= MESES_ACUM:
                if month <= 24:
                    contrib = 15_000
                elif month <= 54:  # extended leave
                    contrib = 9_000
                else:
                    contrib = 16_000
                total += contrib
                total += get_one_time_events(month)
        stress_contribs.append(total)

    scenarios = {
        "base": {
            "label": "Base",
            "equity_acum": EQUITY_SCENARIOS["base"]["acum"],
            "equity_desacum": EQUITY_SCENARIOS["base"]["desacum"],
            "contributions": base_contribs,
            "year1_shock": None,
            "sobrecarga_override": None,  # use default
        },
        "favoravel": {
            "label": "Favoravel",
            "equity_acum": EQUITY_SCENARIOS["base"]["acum"] + 0.01,  # +1pp
            "equity_desacum": EQUITY_SCENARIOS["base"]["desacum"] + 0.01,
            "contributions": fav_contribs,
            "year1_shock": None,
            "sobrecarga_override": None,  # keep sobrecarga for consistency
        },
        "stress": {
            "label": "Stress",
            "equity_acum": EQUITY_SCENARIOS["base"]["acum"] - 0.01,  # -1pp
            "equity_desacum": EQUITY_SCENARIOS["base"]["desacum"] - 0.01,
            "contributions": stress_contribs,
            "year1_shock": -0.30,  # bear -30% ano 1
            "sobrecarga_override": None,
        },
    }
    return scenarios


# =====================================================
# BASELINE SOLO (for comparison)
# =====================================================

def simulate_accumulation_solo(equity_return, n_sims=N_SIM):
    """Solo baseline: R$25k/mes = R$300k/ano flat."""
    means = np.array([equity_return, IPCA_RETURN_HTM, CRIPTO_RETURN, RENDA_PLUS_RETURN])
    vols = np.array([EQUITY_VOL, IPCA_VOL, CRIPTO_VOL, RENDA_PLUS_VOL])
    allocs = np.array([ALLOC_EQUITY, ALLOC_IPCA, ALLOC_CRIPTO, ALLOC_RENDA_PLUS])

    returns = generate_correlated_returns(ANOS_ACUM, n_sims, means, vols, CORR_MATRIX)
    patrimonio = np.zeros((n_sims, ANOS_ACUM + 1))
    patrimonio[:, 0] = PATRIMONIO_INICIAL

    for year in range(ANOS_ACUM):
        portfolio_return = np.sum(returns[:, year, :] * allocs, axis=1)
        patrimonio[:, year + 1] = (patrimonio[:, year] + 300_000) * (1 + portfolio_return)

    return patrimonio[:, -1]


# Solo spending: from v3 corrigido
SAUDE_BASE_FIRE_SOLO = SAUDE_BASE_HOJE_PP * ((1 + VCMH_PRE_FIRE) ** ANOS_ACUM)  # 1 person


def saude_solo(t):
    if t == 0:
        return SAUDE_BASE_FIRE_SOLO
    val = SAUDE_BASE_FIRE_SOLO
    for i in range(1, t + 1):
        rate = max(0.03, 0.07 - 0.002 * i)
        val *= (1 + rate)
    return val


def get_spending_solo(year_in_retirement, inss_valor=25_000):
    """Solo spending from v3 corrigido: R$280k Go-Go, R$225k Slow-Go, R$285k No-Go."""
    t = year_in_retirement
    idade = 50 + t
    saude = saude_solo(t)

    if t < 10:
        lifestyle_ex_saude = 280_000 - SAUDE_BASE_FIRE_SOLO
    elif t < 20:
        lifestyle_ex_saude = 225_000 - SAUDE_BASE_FIRE_SOLO
    else:
        lifestyle_ex_saude = 285_000 - SAUDE_BASE_FIRE_SOLO

    lifestyle_total = lifestyle_ex_saude + saude

    if idade < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    inss = inss_valor if idade >= 65 else 0
    total = lifestyle_total + custo_desacum - inss
    return max(total, 0)


def simulate_decum_solo(pat_fire, ret_mean, ret_vol, use_guardrails=True,
                        year1_shock=None, n_years=HORIZONTE_DESACUM):
    """Solo decumulation using v3 corrigido guardrails."""
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

        base_w = get_spending_solo(year)

        for i in range(n_sims):
            if failed[i]:
                continue
            w = base_w
            if use_guardrails:
                dd = max(0, 1 - patrimonio[i, year] / pico[i])
                if dd > 0.35:
                    w = max(180_000, w * 0.68)
                elif dd > 0.25:
                    w = max(w * 0.80, 180_000)
                elif dd > 0.15:
                    w = max(w * 0.90, 180_000)
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

    return 1 - np.mean(failed)


# =====================================================
# MAIN
# =====================================================

def main():
    print("=" * 110)
    print("MONTE CARLO — CENARIO CASAL (DIEGO + KATIA) EM INDAIATUBA")
    print(f"Patrimonio inicial: R${PATRIMONIO_INICIAL:,} | FIRE age: {IDADE_FIRE}")
    print(f"Saude base FIRE (2 pessoas): R${SAUDE_BASE_FIRE:,.0f} (= R$18k * 1.07^11 * 2)")
    print(f"10k trajectories | t-dist df=5 | seeds 42 (acum), 200 (decum)")
    print("=" * 110)

    # ========================================
    # APORTES POR ANO
    # ========================================
    scenarios = build_scenarios()

    print("\n" + "-" * 110)
    print("APORTES ANUAIS POR CENARIO")
    print("-" * 110)
    print(f"  {'Ano':>4} | {'Idade':>5} | {'Meses':>10} | {'Base':>12} | {'Favoravel':>12} | {'Stress':>12}")
    print(f"  {'-'*4}-+-{'-'*5}-+-{'-'*10}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")

    total_base = total_fav = total_stress = 0
    for y in range(ANOS_ACUM):
        cb = scenarios["base"]["contributions"][y]
        cf = scenarios["favoravel"]["contributions"][y]
        cs = scenarios["stress"]["contributions"][y]
        total_base += cb
        total_fav += cf
        total_stress += cs
        m_start = y * 12 + 1
        m_end = (y + 1) * 12
        print(f"  {y+1:>4} | {IDADE_ATUAL+y+1:>5} | {m_start:>3}-{m_end:<3}    | R${cb:>10,} | R${cf:>10,} | R${cs:>10,}")

    print(f"  {'-'*4}-+-{'-'*5}-+-{'-'*10}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")
    print(f"  {'TOTAL':>4} | {'':>5} | {'':>10} | R${total_base:>10,} | R${total_fav:>10,} | R${total_stress:>10,}")
    print(f"  Solo baseline (R$25k/mes x 11 anos):       R$ {300_000 * 11:>10,}")
    print(f"  Delta base vs solo:                         R${total_base - 300_000 * 11:>+10,}")

    # ========================================
    # SPENDING PROFILE
    # ========================================
    print("\n" + "-" * 110)
    print("SPENDING PROFILE — CASAL INDAIATUBA (primeiros 25 anos)")
    print("-" * 110)
    print(f"  {'Ano':>4} | {'Idade':>5} | {'Fase':>8} | {'Lifestyle':>12} | {'Saude(2p)':>12} | "
          f"{'Sobrecarga':>12} | {'Custos':>8} | {'INSS':>8} | {'TOTAL':>12}")
    print(f"  {'-'*4}-+-{'-'*5}-+-{'-'*8}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}-+-{'-'*8}-+-{'-'*8}-+-{'-'*12}")

    for t in range(min(25, HORIZONTE_DESACUM)):
        idade = 50 + t
        saude = saude_capdecay(t)
        sobrecarga = get_sobrecarga(t)
        if t < 10:
            lifestyle = 290_000
            fase = "Go-Go"
        elif t < 20:
            lifestyle = 230_000
            fase = "Slow-Go"
        else:
            lifestyle = 200_000
            fase = "No-Go"

        if idade < 65:
            custos = CUSTO_DESACUM_50_65
        elif idade < 80:
            custos = CUSTO_DESACUM_65_80
        else:
            custos = CUSTO_DESACUM_80_PLUS
        inss = INSS_VALOR if idade >= 65 else 0
        total = lifestyle + saude + sobrecarga + custos - inss

        print(f"  {t:>4} | {idade:>5} | {fase:>8} | R${lifestyle:>10,} | R${saude:>10,.0f} | "
              f"R${sobrecarga:>10,} | R${custos:>6,} | R${inss:>6,} | R${total:>10,.0f}")

    # ========================================
    # ACCUMULATION
    # ========================================
    print("\n" + "=" * 110)
    print("ACUMULACAO — PATRIMONIO AOS 50")
    print("=" * 110)

    acum_cache = {}
    for sname, scen in scenarios.items():
        np.random.seed(42)
        acum_cache[sname] = simulate_accumulation_casal(
            scen["equity_acum"], scen["contributions"]
        )

    # Solo baseline
    np.random.seed(42)
    pat_solo = simulate_accumulation_solo(EQUITY_SCENARIOS["base"]["acum"])

    print(f"\n  {'Cenario':<20} | {'P25':>12} | {'Mediana':>12} | {'P75':>12} | {'Media':>12}")
    print(f"  {'-'*20}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")
    for sname, scen in scenarios.items():
        p = acum_cache[sname]
        print(f"  {scen['label']:<20} | R${np.percentile(p,25):>10,.0f} | R${np.median(p):>10,.0f} | "
              f"R${np.percentile(p,75):>10,.0f} | R${np.mean(p):>10,.0f}")

    print(f"  {'Solo baseline':<20} | R${np.percentile(pat_solo,25):>10,.0f} | R${np.median(pat_solo):>10,.0f} | "
          f"R${np.percentile(pat_solo,75):>10,.0f} | R${np.mean(pat_solo):>10,.0f}")

    pat_med_base = np.median(acum_cache["base"])
    pat_med_solo = np.median(pat_solo)
    print(f"\n  Delta mediana (casal base vs solo): R${pat_med_base - pat_med_solo:+,.0f} "
          f"({(pat_med_base/pat_med_solo - 1)*100:+.1f}%)")

    # ========================================
    # DECUMULATION — P(SUCCESS) COM E SEM GUARDRAILS
    # ========================================
    print("\n" + "=" * 110)
    print("DESACUMULACAO — P(SUCESSO) 45 ANOS (ATE 95)")
    print("=" * 110)

    results = {}
    for sname, scen in scenarios.items():
        pat = acum_cache[sname]

        # Com guardrails
        np.random.seed(200)
        sr_g = simulate_decumulation_casal(
            pat, scen["equity_desacum"], DESACUM_VOL,
            use_guardrails=True, year1_shock=scen["year1_shock"]
        )

        # Sem guardrails
        np.random.seed(200)
        sr_ng = simulate_decumulation_casal(
            pat, scen["equity_desacum"], DESACUM_VOL,
            use_guardrails=False, year1_shock=scen["year1_shock"]
        )

        results[sname] = {"guardrails": sr_g, "no_guardrails": sr_ng}

    # Solo baseline com guardrails
    np.random.seed(200)
    sr_solo_g = simulate_decum_solo(
        pat_solo, EQUITY_SCENARIOS["base"]["desacum"], DESACUM_VOL,
        use_guardrails=True
    )
    np.random.seed(200)
    sr_solo_ng = simulate_decum_solo(
        pat_solo, EQUITY_SCENARIOS["base"]["desacum"], DESACUM_VOL,
        use_guardrails=False
    )

    print(f"\n  {'Cenario':<20} | {'Com Guardrails':>15} | {'Sem Guardrails':>15} | {'Delta GR':>10}")
    print(f"  {'-'*20}-+-{'-'*15}-+-{'-'*15}-+-{'-'*10}")

    for sname, scen in scenarios.items():
        g = results[sname]["guardrails"]
        ng = results[sname]["no_guardrails"]
        print(f"  {scen['label']:<20} | {g:>14.1%} | {ng:>14.1%} | {(g-ng)*100:>+9.1f}pp")

    print(f"  {'-'*20}-+-{'-'*15}-+-{'-'*15}-+-{'-'*10}")
    print(f"  {'Solo baseline':<20} | {sr_solo_g:>14.1%} | {sr_solo_ng:>14.1%} | {(sr_solo_g-sr_solo_ng)*100:>+9.1f}pp")

    # ========================================
    # SWR IMPLICITO
    # ========================================
    print("\n" + "=" * 110)
    print("SWR IMPLICITO (saque ano 1 / patrimonio mediano)")
    print("=" * 110)

    spending_year1 = get_spending_casal(0)
    spending_year1_solo = get_spending_solo(0)

    print(f"\n  {'Cenario':<20} | {'Pat Mediano':>14} | {'Saque Ano 1':>12} | {'SWR':>8}")
    print(f"  {'-'*20}-+-{'-'*14}-+-{'-'*12}-+-{'-'*8}")

    for sname, scen in scenarios.items():
        pat_med = np.median(acum_cache[sname])
        swr = spending_year1 / pat_med
        print(f"  {scen['label']+' (casal)':<20} | R${pat_med:>12,.0f} | R${spending_year1:>10,.0f} | {swr:>7.2%}")

    swr_solo = spending_year1_solo / pat_med_solo
    print(f"  {'Solo baseline':<20} | R${pat_med_solo:>12,.0f} | R${spending_year1_solo:>10,.0f} | {swr_solo:>7.2%}")

    # ========================================
    # COMPARACAO CASAL vs SOLO
    # ========================================
    print("\n" + "=" * 110)
    print("COMPARACAO: CASAL BASE vs SOLO BASELINE")
    print("=" * 110)

    g_casal = results["base"]["guardrails"]
    g_solo = sr_solo_g
    delta_total = (g_casal - g_solo) * 100

    print(f"""
  P(sucesso) casal base:  {g_casal:.1%}
  P(sucesso) solo base:   {g_solo:.1%}
  Delta total:            {delta_total:+.1f}pp

  Pat mediano casal:      R${pat_med_base:,.0f}
  Pat mediano solo:       R${pat_med_solo:,.0f}
  Delta patrimonio:       R${pat_med_base - pat_med_solo:+,.0f} ({(pat_med_base/pat_med_solo - 1)*100:+.1f}%)

  Spending ano 1 casal:   R${spending_year1:,.0f}
  Spending ano 1 solo:    R${spending_year1_solo:,.0f}
  Delta spending:         R${spending_year1 - spending_year1_solo:+,.0f} ({(spending_year1/spending_year1_solo - 1)*100:+.1f}%)
""")

    # ========================================
    # DECOMPOSICAO: APORTES vs SPENDING
    # ========================================
    print("=" * 110)
    print("DECOMPOSICAO DO DELTA: APORTES MENORES vs SPENDING MAIOR")
    print("=" * 110)

    # (a) Impacto aportes: casal aportes + solo spending
    np.random.seed(42)
    pat_casal_contribs = simulate_accumulation_casal(
        EQUITY_SCENARIOS["base"]["acum"], scenarios["base"]["contributions"]
    )
    np.random.seed(200)
    sr_aportes_only = simulate_decum_solo(
        pat_casal_contribs, EQUITY_SCENARIOS["base"]["desacum"], DESACUM_VOL,
        use_guardrails=True
    )

    # (b) Impacto spending: solo aportes + casal spending
    np.random.seed(200)
    sr_spending_only = simulate_decumulation_casal(
        pat_solo, EQUITY_SCENARIOS["base"]["desacum"], DESACUM_VOL,
        use_guardrails=True
    )

    delta_aportes = (sr_aportes_only - g_solo) * 100
    delta_spending = (sr_spending_only - g_solo) * 100
    interaction = delta_total - delta_aportes - delta_spending

    print(f"""
  Decomposicao (aditiva com interacao):

  (a) Efeito aportes menores (casal aportes + solo spending):
      P(sucesso): {sr_aportes_only:.1%}  ->  delta vs solo: {delta_aportes:+.1f}pp

  (b) Efeito spending maior (solo aportes + casal spending):
      P(sucesso): {sr_spending_only:.1%}  ->  delta vs solo: {delta_spending:+.1f}pp

  (c) Interacao (residuo):  {interaction:+.1f}pp

  Total: {delta_aportes:+.1f} + {delta_spending:+.1f} + {interaction:+.1f} = {delta_total:+.1f}pp
  -------
  Contribuicao aportes:  {abs(delta_aportes)/(abs(delta_aportes)+abs(delta_spending))*100 if (abs(delta_aportes)+abs(delta_spending)) > 0 else 0:.0f}%
  Contribuicao spending: {abs(delta_spending)/(abs(delta_aportes)+abs(delta_spending))*100 if (abs(delta_aportes)+abs(delta_spending)) > 0 else 0:.0f}%
""")

    # ========================================
    # ROBUSTNESS: SEED 200 for accumulation too
    # ========================================
    print("=" * 110)
    print("ROBUSTNESS CHECK — SEED 200 (acumulacao) + SEED 42 (desacumulacao)")
    print("=" * 110)

    acum_cache_s200 = {}
    for sname, scen in scenarios.items():
        np.random.seed(200)
        acum_cache_s200[sname] = simulate_accumulation_casal(
            scen["equity_acum"], scen["contributions"]
        )

    np.random.seed(200)
    pat_solo_s200 = simulate_accumulation_solo(EQUITY_SCENARIOS["base"]["acum"])

    results_s200 = {}
    for sname, scen in scenarios.items():
        pat = acum_cache_s200[sname]
        np.random.seed(42)
        sr_g = simulate_decumulation_casal(
            pat, scen["equity_desacum"], DESACUM_VOL,
            use_guardrails=True, year1_shock=scen["year1_shock"]
        )
        results_s200[sname] = sr_g

    np.random.seed(42)
    sr_solo_s200 = simulate_decum_solo(
        pat_solo_s200, EQUITY_SCENARIOS["base"]["desacum"], DESACUM_VOL,
        use_guardrails=True
    )

    print(f"\n  {'Cenario':<20} | {'Seed 42/200':>12} | {'Seed 200/42':>12} | {'Delta':>8}")
    print(f"  {'-'*20}-+-{'-'*12}-+-{'-'*12}-+-{'-'*8}")
    for sname, scen in scenarios.items():
        s1 = results[sname]["guardrails"]
        s2 = results_s200[sname]
        print(f"  {scen['label']:<20} | {s1:>11.1%} | {s2:>11.1%} | {(s2-s1)*100:>+7.1f}pp")
    print(f"  {'Solo baseline':<20} | {sr_solo_g:>11.1%} | {sr_solo_s200:>11.1%} | {(sr_solo_s200-sr_solo_g)*100:>+7.1f}pp")

    # ========================================
    # SUMMARY TABLE
    # ========================================
    print("\n" + "=" * 110)
    print("RESUMO FINAL")
    print("=" * 110)

    print(f"""
  +{'='*106}+
  | {'Metrica':<40} | {'Base':>15} | {'Favoravel':>15} | {'Stress':>15} | {'Solo':>10} |
  +{'-'*106}+""")

    # Pat mediano
    print(f"  | {'Pat mediano aos 50':<40} | R${np.median(acum_cache['base'])/1e6:>12.2f}M | "
          f"R${np.median(acum_cache['favoravel'])/1e6:>12.2f}M | "
          f"R${np.median(acum_cache['stress'])/1e6:>12.2f}M | "
          f"R${pat_med_solo/1e6:>7.2f}M |")

    # SWR
    for sname in ["base", "favoravel", "stress"]:
        pat_med = np.median(acum_cache[sname])
        swr = spending_year1 / pat_med
    swr_s = spending_year1_solo / pat_med_solo
    print(f"  | {'SWR implicito ano 1':<40} | {spending_year1/np.median(acum_cache['base'])*100:>14.2f}% | "
          f"{spending_year1/np.median(acum_cache['favoravel'])*100:>14.2f}% | "
          f"{spending_year1/np.median(acum_cache['stress'])*100:>14.2f}% | "
          f"{swr_s*100:>9.2f}% |")

    # P(success) com guardrails
    print(f"  | {'P(sucesso) COM guardrails':<40} | {results['base']['guardrails']:>14.1%} | "
          f"{results['favoravel']['guardrails']:>14.1%} | "
          f"{results['stress']['guardrails']:>14.1%} | "
          f"{sr_solo_g:>9.1%} |")

    # P(success) sem guardrails
    print(f"  | {'P(sucesso) SEM guardrails':<40} | {results['base']['no_guardrails']:>14.1%} | "
          f"{results['favoravel']['no_guardrails']:>14.1%} | "
          f"{results['stress']['no_guardrails']:>14.1%} | "
          f"{sr_solo_ng:>9.1%} |")

    # Delta vs solo
    for sname in ["base", "favoravel", "stress"]:
        delta = (results[sname]["guardrails"] - sr_solo_g) * 100
    print(f"  | {'Delta vs solo (c/ guardrails)':<40} | "
          f"{(results['base']['guardrails']-sr_solo_g)*100:>+14.1f}pp | "
          f"{(results['favoravel']['guardrails']-sr_solo_g)*100:>+14.1f}pp | "
          f"{(results['stress']['guardrails']-sr_solo_g)*100:>+14.1f}pp | "
          f"{'ref':>10} |")

    # Spending ano 1
    print(f"  | {'Spending total ano 1':<40} | R${spending_year1:>12,.0f} | "
          f"R${spending_year1:>12,.0f} | "
          f"R${spending_year1:>12,.0f} | "
          f"R${spending_year1_solo:>7,.0f} |")

    print(f"  +{'='*106}+")

    print(f"""
  Notas:
  - Casal: lifestyle R$290k Go-Go + saude R${SAUDE_BASE_FIRE:,.0f} (2p) + sobrecarga R$100k (anos 1-7)
  - Solo: lifestyle R$280k Go-Go + saude R${SAUDE_BASE_FIRE_SOLO:,.0f} (1p) + custos R$38k
  - Aportes casal base: R${total_base:,}/11a = R${total_base//11:,}/a vs solo R$300k/a
  - Assets Katia (R$800k, ~R$32k/ano) ja incorporados no lifestyle net
  - Aluguel Pinheiros (R$66k/ano) ja descontado do lifestyle casal
""")

    print("=" * 110)
    print(f"Script: dados/monte_carlo_casal_katia.py")
    print(f"Seeds: 42 + 200 (cross-validated) | N={N_SIM:,} | t-dist df={DF_T}")
    print("=" * 110)


# =====================================================
# CENARIO 1: FIRE 53, Katia volta apos 1 ano
# CENARIO 2: FIRE escalonado (Diego 50, Katia 53)
# =====================================================

def compute_contributions_c1c2():
    """
    Cenarios 1 e 2 compartilham aportes:
    Meses 1-24: R$15k (SP casados)
    Meses 25-36: R$9k (licenca 1 ano)
    Meses 37-156: R$16k (Indaiatuba, Katia voltou, 10 anos)
    One-time: +R$190k no mes 30
    """
    # FIRE 53 = 14 anos = 156 meses
    n_years_53 = 14
    n_months_53 = 156

    contribs_14y = []
    for year in range(n_years_53):
        total = 0
        for m in range(1, 13):
            month = year * 12 + m
            if month <= n_months_53:
                if month <= 24:
                    contrib = 15_000
                elif month <= 36:
                    contrib = 9_000
                else:
                    contrib = 16_000
                total += contrib
                # One-time R$190k no mes 30
                if month == 30:
                    total += 190_000
        contribs_14y.append(total)

    # For FIRE 50 (cenario 2): first 11 years only
    contribs_11y = contribs_14y[:11]

    # Favoravel: +R$2k/mes
    contribs_14y_fav = []
    for year in range(n_years_53):
        total = 0
        for m in range(1, 13):
            month = year * 12 + m
            if month <= n_months_53:
                if month <= 24:
                    contrib = 15_000
                elif month <= 36:
                    contrib = 9_000
                else:
                    contrib = 16_000
                total += contrib + 2_000
                if month == 30:
                    total += 190_000
        contribs_14y_fav.append(total)

    contribs_11y_fav = contribs_14y_fav[:11]

    # Stress: licenca estendida 2.5 anos (meses 25-54 = R$9k)
    contribs_14y_stress = []
    for year in range(n_years_53):
        total = 0
        for m in range(1, 13):
            month = year * 12 + m
            if month <= n_months_53:
                if month <= 24:
                    contrib = 15_000
                elif month <= 54:
                    contrib = 9_000
                else:
                    contrib = 16_000
                total += contrib
                if month == 30:
                    total += 190_000
        contribs_14y_stress.append(total)

    contribs_11y_stress = contribs_14y_stress[:11]

    return {
        "14y": contribs_14y,
        "14y_fav": contribs_14y_fav,
        "14y_stress": contribs_14y_stress,
        "11y": contribs_11y,
        "11y_fav": contribs_11y_fav,
        "11y_stress": contribs_11y_stress,
    }


# =====================================================
# CENARIO 1 — FIRE 53: saude e spending parametrizados
# =====================================================

FIRE_AGE_C1 = 53
ANOS_ACUM_C1 = FIRE_AGE_C1 - IDADE_ATUAL  # 14
HORIZONTE_DESACUM_C1 = 42  # 53 ate 95
SAUDE_BASE_FIRE_C1 = SAUDE_BASE_HOJE_PP * ((1 + VCMH_PRE_FIRE) ** ANOS_ACUM_C1) * N_PESSOAS_SAUDE
# = 18000 * (1.07)^14 * 2 = R$92,835


def saude_capdecay_c1(t):
    """Saude cap/decay para FIRE 53 (base composta 14 anos)."""
    if t == 0:
        return SAUDE_BASE_FIRE_C1
    val = SAUDE_BASE_FIRE_C1
    for i in range(1, t + 1):
        rate = max(0.03, 0.07 - 0.002 * i)
        val *= (1 + rate)
    return val


def get_sobrecarga_c1(year_in_retirement):
    """
    Cenario 1 sobrecarga:
    Anos 1-5 (t=0..4): +R$95k (escola R$30k + mortgage ~R$65k avg)
    Anos 6-10 (t=5..9): +R$30k (escola, mortgage quase pago)
    Anos 11+ (t>=10): R$0
    """
    if year_in_retirement < 5:
        return 95_000
    elif year_in_retirement < 10:
        return 30_000
    else:
        return 0


def get_spending_c1(year_in_retirement, inss_valor=INSS_VALOR):
    """Spending casal FIRE 53 — cenario 1."""
    t = year_in_retirement
    idade = FIRE_AGE_C1 + t
    saude = saude_capdecay_c1(t)

    if t < 10:
        lifestyle_ex_saude = 290_000
    elif t < 20:
        lifestyle_ex_saude = 230_000
    else:
        lifestyle_ex_saude = 200_000

    sobrecarga = get_sobrecarga_c1(t)

    if idade < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    inss = inss_valor if idade >= 65 else 0
    return max(lifestyle_ex_saude + saude + sobrecarga + custo_desacum - inss, 0)


def apply_guardrails_c1(base_withdrawal, drawdown, year, upside_bump=0):
    """Guardrails for cenario 1 (FIRE 53)."""
    t = year
    idade = FIRE_AGE_C1 + t
    saude = saude_capdecay_c1(t)
    sobrecarga = get_sobrecarga_c1(t)

    if idade < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    inss = INSS_VALOR if idade >= 65 else 0
    piso = 200_000 + saude + sobrecarga + custo_desacum - inss

    if drawdown > 0.35:
        return piso
    elif drawdown > 0.25:
        return max(230_000 + saude + sobrecarga + custo_desacum - inss, piso)
    elif drawdown > 0.15:
        return max(260_000 + saude + sobrecarga + custo_desacum - inss, piso)
    else:
        return base_withdrawal + upside_bump


def simulate_decum_c1(pat_fire, ret_mean, ret_vol, use_guardrails=True,
                       year1_shock=None, n_years=HORIZONTE_DESACUM_C1):
    """Decumulation for cenario 1 (FIRE 53)."""
    n_sims = len(pat_fire)
    patrimonio = np.zeros((n_sims, n_years + 1))
    patrimonio[:, 0] = pat_fire.copy()
    pico = pat_fire.copy()
    failed = np.zeros(n_sims, dtype=bool)
    upside_bump = np.zeros(n_sims)

    mu_g = ret_mean - ret_vol**2 / 2
    scale = np.sqrt((DF_T - 2) / DF_T)

    for year in range(n_years):
        z = np.random.standard_t(DF_T, size=n_sims) * scale
        if year == 0 and year1_shock is not None:
            returns = np.full(n_sims, year1_shock)
        else:
            returns = np.exp(mu_g + ret_vol * z) - 1

        base_w = get_spending_c1(year)

        for i in range(n_sims):
            if failed[i]:
                continue
            w = base_w
            if use_guardrails:
                dd = max(0, 1 - patrimonio[i, year] / pico[i])
                w = apply_guardrails_c1(base_w, dd, year, upside_bump[i])
                if patrimonio[i, year] > pico[i] * 1.25 and upside_bump[i] == 0:
                    upside_bump[i] = 29_000
                    w += 29_000
                if patrimonio[i, year] > pico[i]:
                    pico[i] = patrimonio[i, year]

            novo = (patrimonio[i, year] - w) * (1 + returns[i])
            if novo <= 0:
                patrimonio[i, year + 1] = 0
                failed[i] = True
            else:
                patrimonio[i, year + 1] = novo
                pico[i] = max(pico[i], novo)

    return 1 - np.mean(failed)


# =====================================================
# CENARIO 2 — FIRE escalonado (Diego 50, Katia 53)
# =====================================================

# Saude Diego solo nos anos 1-3 (1 pessoa, base FIRE 50)
SAUDE_BASE_FIRE_C2_DIEGO = SAUDE_BASE_HOJE_PP * ((1 + VCMH_PRE_FIRE) ** ANOS_ACUM)
# = 18000 * (1.07)^11 = R$37,887


def saude_diego_solo(t):
    """Saude Diego only (1 pessoa) para anos 1-3 do cenario 2."""
    if t == 0:
        return SAUDE_BASE_FIRE_C2_DIEGO
    val = SAUDE_BASE_FIRE_C2_DIEGO
    for i in range(1, t + 1):
        rate = max(0.03, 0.07 - 0.002 * i)
        val *= (1 + rate)
    return val


def saude_capdecay_c2_casal(t):
    """
    Saude casal para cenario 2, anos 4+ (ambos 53+).
    Base = SAUDE_BASE_FIRE_C1 = R$92,835 (2 pessoas, composta 14 anos).
    Mas precisamos ajustar: no ano 4 do FIRE de Diego (idade 54),
    Katia tem 53 e acabou de parar.
    Para simplificar: usamos base casal composta para a idade de Diego.
    t_casal_start = 3 (anos que o casal spending comeca, contados do FIRE Diego)
    A saude do casal no t=3 do FIRE Diego: ambos ~53 anos.
    Usar SAUDE_BASE_FIRE_C1 como base (composta 14 anos, 2 pessoas)
    e aplicar inflator a partir de t_since_casal_fire.
    """
    # t = years since Diego FIRE (50)
    # Casal spending starts at t=3 (Diego 53, Katia 53)
    t_since_casal = t - 3
    if t_since_casal <= 0:
        return SAUDE_BASE_FIRE_C1
    val = SAUDE_BASE_FIRE_C1
    for i in range(1, t_since_casal + 1):
        rate = max(0.03, 0.07 - 0.002 * i)
        val *= (1 + rate)
    return val


def get_spending_c2(year_in_retirement, inss_valor=INSS_VALOR):
    """
    Cenario 2: FIRE escalonado.
    Anos 1-3 (t=0,1,2): Diego only — R$274k flat withdrawal
    Anos 4+ (t>=3): casal completo, spending smile C1 but shifted
      (sobrecarga C1 starts from t=3 perspective = t_casal=0)
    """
    t = year_in_retirement
    idade_diego = 50 + t

    if t < 3:
        # Diego only: R$274k/ano flat
        # (R$190k lifestyle Diego + R$47k saude Diego + R$37k gap mortgage)
        return 274_000

    # Casal spending from t=3 onwards
    t_casal = t - 3  # time since Katia stopped working
    saude = saude_capdecay_c2_casal(t)

    if t_casal < 10:
        lifestyle_ex_saude = 290_000
    elif t_casal < 20:
        lifestyle_ex_saude = 230_000
    else:
        lifestyle_ex_saude = 200_000

    # Sobrecarga: same structure as C1 but from Katia FIRE perspective
    # Anos 1-5 do casal FIRE (t_casal=0..4): +R$95k
    # Anos 6-10 (t_casal=5..9): +R$30k
    # Anos 11+: R$0
    # But with 3 years less total sobrecarga (mortgage paid 3 more years while Katia worked)
    # Adjustment: escola+mortgage with 3 less years remaining
    # Anos 1-2 casal (t_casal 0-1): +R$95k (escola + mortgage)
    # Anos 3-7 casal (t_casal 2-6): +R$30k (escola, mortgage finishing)
    # Anos 8+: R$0
    if t_casal < 2:
        sobrecarga = 95_000
    elif t_casal < 7:
        sobrecarga = 30_000
    else:
        sobrecarga = 0

    if idade_diego < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade_diego < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    inss = inss_valor if idade_diego >= 65 else 0
    return max(lifestyle_ex_saude + saude + sobrecarga + custo_desacum - inss, 0)


def apply_guardrails_c2(base_withdrawal, drawdown, year, upside_bump=0):
    """Guardrails for cenario 2."""
    t = year
    idade_diego = 50 + t

    if t < 3:
        # During solo phase, guardrails on R$274k
        piso = 200_000
        if drawdown > 0.35:
            return piso
        elif drawdown > 0.25:
            return max(230_000, piso)
        elif drawdown > 0.15:
            return max(250_000, piso)
        return base_withdrawal + upside_bump

    # Casal phase
    t_casal = t - 3
    saude = saude_capdecay_c2_casal(t)

    if t_casal < 2:
        sobrecarga = 95_000
    elif t_casal < 7:
        sobrecarga = 30_000
    else:
        sobrecarga = 0

    if idade_diego < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade_diego < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    inss = INSS_VALOR if idade_diego >= 65 else 0
    piso = 200_000 + saude + sobrecarga + custo_desacum - inss

    if drawdown > 0.35:
        return piso
    elif drawdown > 0.25:
        return max(230_000 + saude + sobrecarga + custo_desacum - inss, piso)
    elif drawdown > 0.15:
        return max(260_000 + saude + sobrecarga + custo_desacum - inss, piso)
    return base_withdrawal + upside_bump


def simulate_decum_c2(pat_fire, ret_mean, ret_vol, use_guardrails=True,
                       year1_shock=None, n_years=HORIZONTE_DESACUM):
    """Decumulation for cenario 2 (FIRE escalonado, 45 anos)."""
    n_sims = len(pat_fire)
    patrimonio = np.zeros((n_sims, n_years + 1))
    patrimonio[:, 0] = pat_fire.copy()
    pico = pat_fire.copy()
    failed = np.zeros(n_sims, dtype=bool)
    upside_bump = np.zeros(n_sims)

    mu_g = ret_mean - ret_vol**2 / 2
    scale = np.sqrt((DF_T - 2) / DF_T)

    for year in range(n_years):
        z = np.random.standard_t(DF_T, size=n_sims) * scale
        if year == 0 and year1_shock is not None:
            returns = np.full(n_sims, year1_shock)
        else:
            returns = np.exp(mu_g + ret_vol * z) - 1

        base_w = get_spending_c2(year)

        for i in range(n_sims):
            if failed[i]:
                continue
            w = base_w
            if use_guardrails:
                dd = max(0, 1 - patrimonio[i, year] / pico[i])
                w = apply_guardrails_c2(base_w, dd, year, upside_bump[i])
                if patrimonio[i, year] > pico[i] * 1.25 and upside_bump[i] == 0:
                    upside_bump[i] = 29_000
                    w += 29_000
                if patrimonio[i, year] > pico[i]:
                    pico[i] = patrimonio[i, year]

            novo = (patrimonio[i, year] - w) * (1 + returns[i])
            if novo <= 0:
                patrimonio[i, year + 1] = 0
                failed[i] = True
            else:
                patrimonio[i, year + 1] = novo
                pico[i] = max(pico[i], novo)

    return 1 - np.mean(failed)


# =====================================================
# MAIN v2: Cenarios 1 e 2
# =====================================================

def main_v2():
    """Run cenarios 1 and 2 side by side."""
    contribs = compute_contributions_c1c2()

    print("\n\n")
    print("=" * 120)
    print("=" * 120)
    print("CENARIOS NOVOS: C1 (FIRE 53) e C2 (FIRE ESCALONADO 50/53)")
    print("=" * 120)

    # ========================================
    # APORTES
    # ========================================
    print("\n" + "-" * 120)
    print("APORTES ANUAIS — CENARIOS 1 e 2 (compartilhados)")
    print("-" * 120)
    print(f"  {'Ano':>4} | {'Idade':>5} | {'Meses':>10} | {'Base':>12} | {'Favoravel':>12} | {'Stress':>12}")
    print(f"  {'-'*4}-+-{'-'*5}-+-{'-'*10}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")

    total_b = total_f = total_s = 0
    for y in range(14):
        cb = contribs["14y"][y]
        cf = contribs["14y_fav"][y]
        cs = contribs["14y_stress"][y]
        total_b += cb
        total_f += cf
        total_s += cs
        m_start = y * 12 + 1
        m_end = (y + 1) * 12
        marker = " <-- C2 FIRE Diego" if y == 10 else ""
        print(f"  {y+1:>4} | {IDADE_ATUAL+y+1:>5} | {m_start:>3}-{m_end:<3}    | R${cb:>10,} | R${cf:>10,} | R${cs:>10,}{marker}")

    print(f"  {'-'*4}-+-{'-'*5}-+-{'-'*10}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")
    print(f"  {'TOTAL':>4} | {'':>5} | {'14 anos':>10} | R${total_b:>10,} | R${total_f:>10,} | R${total_s:>10,}")

    total_11y = sum(contribs["11y"])
    print(f"  C2 (11 anos):                              R${total_11y:>10,}")
    print(f"  Solo baseline (R$25k/mes x 11 anos):       R$ {300_000 * 11:>10,}")

    # ========================================
    # SAUDE COMPARISON
    # ========================================
    print(f"\n  Saude base no FIRE:")
    print(f"    C1 (FIRE 53, 14a composicao): R${SAUDE_BASE_FIRE_C1:,.0f} (2 pessoas)")
    print(f"    C2 anos 1-3 (Diego solo):     R${SAUDE_BASE_FIRE_C2_DIEGO:,.0f} (1 pessoa)")
    print(f"    C2 anos 4+ (casal):           R${SAUDE_BASE_FIRE_C1:,.0f} (2 pessoas)")
    print(f"    Original FIRE 50 (casal):     R${SAUDE_BASE_FIRE:,.0f} (2 pessoas)")

    # ========================================
    # SPENDING PROFILES
    # ========================================
    print("\n" + "-" * 120)
    print("SPENDING PROFILE — C1 (FIRE 53) vs C2 (FIRE escalonado 50/53)")
    print("-" * 120)
    print(f"  {'t':>3} | {'Idade':>5} | {'C1 Spending':>14} | {'C2 Spending':>14} | {'C1 Saude':>12} | "
          f"{'C1 Sobrecarga':>14} | {'C2 Fase':>12}")
    print(f"  {'-'*3}-+-{'-'*5}-+-{'-'*14}-+-{'-'*14}-+-{'-'*12}-+-{'-'*14}-+-{'-'*12}")

    for t in range(min(25, HORIZONTE_DESACUM)):
        idade_c1 = FIRE_AGE_C1 + t
        idade_c2 = 50 + t
        sp_c1 = get_spending_c1(t) if t < HORIZONTE_DESACUM_C1 else 0
        sp_c2 = get_spending_c2(t)
        saude_c1 = saude_capdecay_c1(t) if t < HORIZONTE_DESACUM_C1 else 0
        sobrecarga_c1 = get_sobrecarga_c1(t) if t < HORIZONTE_DESACUM_C1 else 0
        c2_fase = "Diego solo" if t < 3 else "Casal"

        # For C1, show age at C1's FIRE, for C2 show Diego's age
        print(f"  {t:>3} | {idade_c2:>2}/{idade_c1:>2} | R${sp_c1:>12,.0f} | R${sp_c2:>12,.0f} | "
              f"R${saude_c1:>10,.0f} | R${sobrecarga_c1:>12,} | {c2_fase:>12}")

    # ========================================
    # ACCUMULATION
    # ========================================
    print("\n" + "=" * 120)
    print("ACUMULACAO")
    print("=" * 120)

    # C1: FIRE 53 (14 years)
    acum_c1 = {}
    eq_scenarios_c1 = {
        "base":      {"acum": EQUITY_SCENARIOS["base"]["acum"],      "desacum": EQUITY_SCENARIOS["base"]["desacum"]},
        "favoravel": {"acum": EQUITY_SCENARIOS["base"]["acum"] + 0.01, "desacum": EQUITY_SCENARIOS["base"]["desacum"] + 0.01},
        "stress":    {"acum": EQUITY_SCENARIOS["base"]["acum"] - 0.01, "desacum": EQUITY_SCENARIOS["base"]["desacum"] - 0.01},
    }
    contrib_keys_14y = {"base": "14y", "favoravel": "14y_fav", "stress": "14y_stress"}
    for sname in ["base", "favoravel", "stress"]:
        np.random.seed(42)
        acum_c1[sname] = simulate_accumulation_casal(
            eq_scenarios_c1[sname]["acum"],
            contribs[contrib_keys_14y[sname]],
        )

    # C2: FIRE 50 (11 years) — same aportes as C1 first 11 years
    acum_c2 = {}
    contrib_keys_11y = {"base": "11y", "favoravel": "11y_fav", "stress": "11y_stress"}
    for sname in ["base", "favoravel", "stress"]:
        np.random.seed(42)
        acum_c2[sname] = simulate_accumulation_casal(
            eq_scenarios_c1[sname]["acum"],
            contribs[contrib_keys_11y[sname]],
        )

    # Solo baseline (for reference)
    np.random.seed(42)
    pat_solo = simulate_accumulation_solo(EQUITY_SCENARIOS["base"]["acum"])
    pat_med_solo = np.median(pat_solo)

    labels = {"base": "Base", "favoravel": "Favoravel", "stress": "Stress"}

    print(f"\n  {'Cenario':<25} | {'P25':>12} | {'Mediana':>12} | {'P75':>12} | {'Media':>12}")
    print(f"  {'-'*25}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")
    for sname in ["base", "favoravel", "stress"]:
        p = acum_c1[sname]
        print(f"  {'C1-'+labels[sname]+' (FIRE 53)':<25} | R${np.percentile(p,25):>10,.0f} | R${np.median(p):>10,.0f} | "
              f"R${np.percentile(p,75):>10,.0f} | R${np.mean(p):>10,.0f}")
    print(f"  {'-'*25}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")
    for sname in ["base", "favoravel", "stress"]:
        p = acum_c2[sname]
        print(f"  {'C2-'+labels[sname]+' (FIRE 50)':<25} | R${np.percentile(p,25):>10,.0f} | R${np.median(p):>10,.0f} | "
              f"R${np.percentile(p,75):>10,.0f} | R${np.mean(p):>10,.0f}")
    print(f"  {'-'*25}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")
    print(f"  {'Solo baseline (FIRE 50)':<25} | R${np.percentile(pat_solo,25):>10,.0f} | R${np.median(pat_solo):>10,.0f} | "
          f"R${np.percentile(pat_solo,75):>10,.0f} | R${np.mean(pat_solo):>10,.0f}")

    # ========================================
    # DECUMULATION — P(SUCCESS)
    # ========================================
    print("\n" + "=" * 120)
    print("DESACUMULACAO — P(SUCESSO) COM GUARDRAILS")
    print("=" * 120)

    results_c1 = {}
    shock_map = {"base": None, "favoravel": None, "stress": -0.30}
    for sname in ["base", "favoravel", "stress"]:
        np.random.seed(200)
        sr = simulate_decum_c1(
            acum_c1[sname], eq_scenarios_c1[sname]["desacum"], DESACUM_VOL,
            use_guardrails=True, year1_shock=shock_map[sname],
        )
        results_c1[sname] = sr

    results_c2 = {}
    for sname in ["base", "favoravel", "stress"]:
        np.random.seed(200)
        sr = simulate_decum_c2(
            acum_c2[sname], eq_scenarios_c1[sname]["desacum"], DESACUM_VOL,
            use_guardrails=True, year1_shock=shock_map[sname],
        )
        results_c2[sname] = sr

    # Solo reference
    np.random.seed(200)
    sr_solo = simulate_decum_solo(
        pat_solo, EQUITY_SCENARIOS["base"]["desacum"], DESACUM_VOL,
        use_guardrails=True,
    )

    print(f"\n  {'Cenario':<30} | {'P(sucesso)':>12} | {'vs Solo':>10}")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*10}")
    for sname in ["base", "favoravel", "stress"]:
        sr = results_c1[sname]
        print(f"  {'C1-'+labels[sname]+' (FIRE 53)':<30} | {sr:>11.1%} | {(sr-sr_solo)*100:>+9.1f}pp")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*10}")
    for sname in ["base", "favoravel", "stress"]:
        sr = results_c2[sname]
        print(f"  {'C2-'+labels[sname]+' (escalonado)':<30} | {sr:>11.1%} | {(sr-sr_solo)*100:>+9.1f}pp")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*10}")
    print(f"  {'Solo baseline':<30} | {sr_solo:>11.1%} | {'ref':>10}")

    # ========================================
    # SWR IMPLICITO
    # ========================================
    print("\n" + "=" * 120)
    print("SWR IMPLICITO (saque ano 1 / patrimonio mediano)")
    print("=" * 120)

    sp_c1_y1 = get_spending_c1(0)
    sp_c2_y1 = get_spending_c2(0)
    sp_solo_y1 = get_spending_solo(0)

    print(f"\n  {'Cenario':<30} | {'Pat Mediano':>14} | {'Saque Ano 1':>12} | {'SWR':>8}")
    print(f"  {'-'*30}-+-{'-'*14}-+-{'-'*12}-+-{'-'*8}")
    for sname in ["base", "favoravel", "stress"]:
        pat_med = np.median(acum_c1[sname])
        swr = sp_c1_y1 / pat_med
        print(f"  {'C1-'+labels[sname]+' (FIRE 53)':<30} | R${pat_med:>12,.0f} | R${sp_c1_y1:>10,.0f} | {swr:>7.2%}")
    print(f"  {'-'*30}-+-{'-'*14}-+-{'-'*12}-+-{'-'*8}")
    for sname in ["base", "favoravel", "stress"]:
        pat_med = np.median(acum_c2[sname])
        swr = sp_c2_y1 / pat_med
        print(f"  {'C2-'+labels[sname]+' (escalonado)':<30} | R${pat_med:>12,.0f} | R${sp_c2_y1:>10,.0f} | {swr:>7.2%}")
    print(f"  {'-'*30}-+-{'-'*14}-+-{'-'*12}-+-{'-'*8}")
    swr_solo = sp_solo_y1 / pat_med_solo
    print(f"  {'Solo baseline':<30} | R${pat_med_solo:>12,.0f} | R${sp_solo_y1:>10,.0f} | {swr_solo:>7.2%}")

    # ========================================
    # SIDE-BY-SIDE SUMMARY
    # ========================================
    print("\n" + "=" * 120)
    print("RESUMO LADO A LADO")
    print("=" * 120)

    print(f"""
  +{'='*116}+
  | {'Metrica':<35} | {'C1 Base':>12} | {'C1 Fav':>12} | {'C1 Stress':>12} | {'C2 Base':>12} | {'C2 Fav':>12} | {'C2 Stress':>12} |
  +{'-'*116}+""")

    # FIRE age
    print(f"  | {'FIRE age':<35} | {'53':>12} | {'53':>12} | {'53':>12} | {'50/53':>12} | {'50/53':>12} | {'50/53':>12} |")

    # Pat mediano
    print(f"  | {'Pat mediano no FIRE':<35} | R${np.median(acum_c1['base'])/1e6:>9.2f}M | "
          f"R${np.median(acum_c1['favoravel'])/1e6:>9.2f}M | "
          f"R${np.median(acum_c1['stress'])/1e6:>9.2f}M | "
          f"R${np.median(acum_c2['base'])/1e6:>9.2f}M | "
          f"R${np.median(acum_c2['favoravel'])/1e6:>9.2f}M | "
          f"R${np.median(acum_c2['stress'])/1e6:>9.2f}M |")

    # Spending ano 1
    print(f"  | {'Spending ano 1':<35} | R${sp_c1_y1:>9,.0f} | R${sp_c1_y1:>9,.0f} | "
          f"R${sp_c1_y1:>9,.0f} | R${sp_c2_y1:>9,.0f} | "
          f"R${sp_c2_y1:>9,.0f} | R${sp_c2_y1:>9,.0f} |")

    # SWR
    for sname in ["base", "favoravel", "stress"]:
        pass  # computed inline
    print(f"  | {'SWR ano 1':<35} | {sp_c1_y1/np.median(acum_c1['base'])*100:>11.2f}% | "
          f"{sp_c1_y1/np.median(acum_c1['favoravel'])*100:>11.2f}% | "
          f"{sp_c1_y1/np.median(acum_c1['stress'])*100:>11.2f}% | "
          f"{sp_c2_y1/np.median(acum_c2['base'])*100:>11.2f}% | "
          f"{sp_c2_y1/np.median(acum_c2['favoravel'])*100:>11.2f}% | "
          f"{sp_c2_y1/np.median(acum_c2['stress'])*100:>11.2f}% |")

    # P(success)
    print(f"  | {'P(sucesso) c/ guardrails':<35} | {results_c1['base']:>11.1%} | "
          f"{results_c1['favoravel']:>11.1%} | "
          f"{results_c1['stress']:>11.1%} | "
          f"{results_c2['base']:>11.1%} | "
          f"{results_c2['favoravel']:>11.1%} | "
          f"{results_c2['stress']:>11.1%} |")

    # Delta vs solo
    print(f"  | {'Delta vs solo ({sr_solo:.1%})':<35} | "
          f"{(results_c1['base']-sr_solo)*100:>+11.1f}pp | "
          f"{(results_c1['favoravel']-sr_solo)*100:>+11.1f}pp | "
          f"{(results_c1['stress']-sr_solo)*100:>+11.1f}pp | "
          f"{(results_c2['base']-sr_solo)*100:>+11.1f}pp | "
          f"{(results_c2['favoravel']-sr_solo)*100:>+11.1f}pp | "
          f"{(results_c2['stress']-sr_solo)*100:>+11.1f}pp |")

    print(f"  +{'='*116}+")

    # Key insights
    print(f"""
  INSIGHTS:
  - Solo baseline: P={sr_solo:.1%}, pat mediano R${pat_med_solo/1e6:.2f}M, spending R${sp_solo_y1:,.0f}
  - C1 (FIRE 53): 3 anos extras de aportes + patrimonio maior. Spending ano 1 = R${sp_c1_y1:,.0f}
  - C2 (escalonado): Diego para aos 50, saque baixo 3 anos (R${sp_c2_y1:,.0f}), depois casal completo
  - C2 preserva patrimonio nos anos criticos de SoRR com saque 47% menor que C1 ano 1
  - Spending casal completo (a partir do ano {3 if True else 1} de cada cenario):
      C1 t=0: R${sp_c1_y1:,.0f} | C2 t=3: R${get_spending_c2(3):,.0f}
""")

    print("=" * 120)
    print(f"Script: dados/monte_carlo_casal_katia.py")
    print(f"Seeds: 42 (acum) + 200 (decum) | N={N_SIM:,} | t-dist df={DF_T}")
    print("=" * 120)


# =====================================================
# CENARIO 3 — FIRE 55 CASAL
# =====================================================

FIRE_AGE_C3 = 55
ANOS_ACUM_C3 = FIRE_AGE_C3 - IDADE_ATUAL  # 16
# 16.5 years = 198 months. Annual model uses 16 full years of contributions
# (year 17 has only 6 months — modeled as half-year contrib in year 17)
N_MONTHS_C3 = 198
HORIZONTE_DESACUM_C3 = 40  # 55 ate 95
SAUDE_BASE_FIRE_C3 = SAUDE_BASE_HOJE_PP * ((1 + VCMH_PRE_FIRE) ** 16) * N_PESSOAS_SAUDE
# = 18000 * (1.07)^16 * 2 = R$106,280 (approx)


def compute_contributions_c3():
    """
    C3 aportes (FIRE 55 = 198 meses = 16 anos + 6 meses):
    Meses 1-24: R$15k
    Meses 25-36: R$9k
    Meses 37-198: R$16k
    One-time: +R$190k no mes 30
    """
    # We model 17 years but year 17 only has 6 months
    n_years = 17  # last year partial
    contribs = {"base": [], "fav": [], "stress": []}

    for year in range(n_years):
        total_b = total_f = total_s = 0
        for m in range(1, 13):
            month = year * 12 + m
            if month > N_MONTHS_C3:
                break
            # Base contribution
            if month <= 24:
                cb = 15_000
            elif month <= 36:
                cb = 9_000
            else:
                cb = 16_000
            total_b += cb
            total_f += cb + 2_000
            # Stress: extended leave meses 25-54
            if month <= 24:
                cs = 15_000
            elif month <= 54:
                cs = 9_000
            else:
                cs = 16_000
            total_s += cs
            # One-time
            if month == 30:
                total_b += 190_000
                total_f += 190_000
                total_s += 190_000
        contribs["base"].append(total_b)
        contribs["fav"].append(total_f)
        contribs["stress"].append(total_s)

    return contribs


def saude_capdecay_c3(t):
    """Saude cap/decay for FIRE 55 (base composta 16 anos, 2 pessoas)."""
    if t == 0:
        return SAUDE_BASE_FIRE_C3
    val = SAUDE_BASE_FIRE_C3
    for i in range(1, t + 1):
        rate = max(0.03, 0.07 - 0.002 * i)
        val *= (1 + rate)
    return val


def get_sobrecarga_c3(year_in_retirement):
    """
    C3 sobrecarga (FIRE 55):
    Filho ~14 anos no FIRE -> 4 anos de escola restantes
    Mortgage: ano 13 do SAC 20 anos -> ~R$38k/ano, quita no ano 7-8 do FIRE
    Anos 1-4 (t=0..3): +R$68k (escola R$30k + mortgage R$38k)
    Anos 5-7 (t=4..6): +R$38k (so mortgage, escola acabou)
    Anos 8+ (t>=7): R$0 (mortgage quitado)
    """
    if year_in_retirement < 4:
        return 68_000
    elif year_in_retirement < 7:
        return 38_000
    else:
        return 0


def get_spending_c3(year_in_retirement, inss_valor=INSS_VALOR):
    """Spending casal FIRE 55."""
    t = year_in_retirement
    idade = FIRE_AGE_C3 + t
    saude = saude_capdecay_c3(t)

    if t < 10:
        lifestyle_ex_saude = 290_000
    elif t < 20:
        lifestyle_ex_saude = 230_000
    else:
        lifestyle_ex_saude = 200_000

    sobrecarga = get_sobrecarga_c3(t)

    if idade < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    inss = inss_valor if idade >= 65 else 0
    return max(lifestyle_ex_saude + saude + sobrecarga + custo_desacum - inss, 0)


def apply_guardrails_c3(base_withdrawal, drawdown, year, upside_bump=0):
    """Guardrails for C3 (FIRE 55)."""
    t = year
    idade = FIRE_AGE_C3 + t
    saude = saude_capdecay_c3(t)
    sobrecarga = get_sobrecarga_c3(t)

    if idade < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    inss = INSS_VALOR if idade >= 65 else 0
    piso = 200_000 + saude + sobrecarga + custo_desacum - inss

    if drawdown > 0.35:
        return piso
    elif drawdown > 0.25:
        return max(230_000 + saude + sobrecarga + custo_desacum - inss, piso)
    elif drawdown > 0.15:
        return max(260_000 + saude + sobrecarga + custo_desacum - inss, piso)
    else:
        return base_withdrawal + upside_bump


def simulate_decum_c3(pat_fire, ret_mean, ret_vol, use_guardrails=True,
                       year1_shock=None, n_years=HORIZONTE_DESACUM_C3):
    """Decumulation for C3 (FIRE 55, 40 anos ate 95)."""
    n_sims = len(pat_fire)
    patrimonio = np.zeros((n_sims, n_years + 1))
    patrimonio[:, 0] = pat_fire.copy()
    pico = pat_fire.copy()
    failed = np.zeros(n_sims, dtype=bool)
    upside_bump = np.zeros(n_sims)

    mu_g = ret_mean - ret_vol**2 / 2
    scale = np.sqrt((DF_T - 2) / DF_T)

    for year in range(n_years):
        z = np.random.standard_t(DF_T, size=n_sims) * scale
        if year == 0 and year1_shock is not None:
            returns = np.full(n_sims, year1_shock)
        else:
            returns = np.exp(mu_g + ret_vol * z) - 1

        base_w = get_spending_c3(year)

        for i in range(n_sims):
            if failed[i]:
                continue
            w = base_w
            if use_guardrails:
                dd = max(0, 1 - patrimonio[i, year] / pico[i])
                w = apply_guardrails_c3(base_w, dd, year, upside_bump[i])
                if patrimonio[i, year] > pico[i] * 1.25 and upside_bump[i] == 0:
                    upside_bump[i] = 29_000
                    w += 29_000
                if patrimonio[i, year] > pico[i]:
                    pico[i] = patrimonio[i, year]

            novo = (patrimonio[i, year] - w) * (1 + returns[i])
            if novo <= 0:
                patrimonio[i, year + 1] = 0
                failed[i] = True
            else:
                patrimonio[i, year + 1] = novo
                pico[i] = max(pico[i], novo)

    return 1 - np.mean(failed)


# =====================================================
# MAIN v3: Cenario 3 (FIRE 55) vs C1 (FIRE 53) vs Solo
# =====================================================

def main_v3():
    """Run C3 (FIRE 55) side by side with C1 (FIRE 53)."""
    contribs_c3 = compute_contributions_c3()
    contribs_c1c2 = compute_contributions_c1c2()

    print("\n\n")
    print("=" * 120)
    print("=" * 120)
    print("CENARIO 3: FIRE 55 CASAL vs C1 (FIRE 53) vs SOLO")
    print(f"Saude base FIRE 55 (2p): R${SAUDE_BASE_FIRE_C3:,.0f} (= R$18k * 1.07^16 * 2)")
    print("=" * 120)

    # ========================================
    # APORTES C3
    # ========================================
    print("\n" + "-" * 120)
    print("APORTES ANUAIS — C3 (FIRE 55, 198 meses)")
    print("-" * 120)
    print(f"  {'Ano':>4} | {'Idade':>5} | {'Meses':>10} | {'Base':>12} | {'Favoravel':>12} | {'Stress':>12}")
    print(f"  {'-'*4}-+-{'-'*5}-+-{'-'*10}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")

    total_b = total_f = total_s = 0
    for y in range(len(contribs_c3["base"])):
        cb = contribs_c3["base"][y]
        cf = contribs_c3["fav"][y]
        cs = contribs_c3["stress"][y]
        total_b += cb
        total_f += cf
        total_s += cs
        m_start = y * 12 + 1
        m_end = min((y + 1) * 12, N_MONTHS_C3)
        partial = " (6 meses)" if m_end < (y + 1) * 12 else ""
        print(f"  {y+1:>4} | {IDADE_ATUAL+y+1:>5} | {m_start:>3}-{m_end:<3}    | R${cb:>10,} | R${cf:>10,} | R${cs:>10,}{partial}")

    print(f"  {'-'*4}-+-{'-'*5}-+-{'-'*10}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")
    print(f"  {'TOTAL':>4} | {'':>5} | {'16.5 anos':>10} | R${total_b:>10,} | R${total_f:>10,} | R${total_s:>10,}")
    total_c1 = sum(contribs_c1c2["14y"])
    print(f"  C1 (14 anos):                              R${total_c1:>10,}")
    print(f"  Solo baseline (R$25k/mes x 11 anos):       R$ {300_000 * 11:>10,}")

    # ========================================
    # SPENDING PROFILE C3
    # ========================================
    print("\n" + "-" * 120)
    print("SPENDING PROFILE — C3 (FIRE 55) primeiros 20 anos")
    print("-" * 120)
    print(f"  {'t':>3} | {'Idade':>5} | {'Fase':>8} | {'Lifestyle':>12} | {'Saude(2p)':>12} | "
          f"{'Sobrecarga':>12} | {'Custos':>8} | {'INSS':>8} | {'TOTAL':>12}")
    print(f"  {'-'*3}-+-{'-'*5}-+-{'-'*8}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}-+-{'-'*8}-+-{'-'*8}-+-{'-'*12}")

    for t in range(min(20, HORIZONTE_DESACUM_C3)):
        idade = FIRE_AGE_C3 + t
        saude = saude_capdecay_c3(t)
        sobrecarga = get_sobrecarga_c3(t)
        if t < 10:
            lifestyle = 290_000
            fase = "Go-Go"
        elif t < 20:
            lifestyle = 230_000
            fase = "Slow-Go"
        else:
            lifestyle = 200_000
            fase = "No-Go"
        if idade < 65:
            custos = CUSTO_DESACUM_50_65
        elif idade < 80:
            custos = CUSTO_DESACUM_65_80
        else:
            custos = CUSTO_DESACUM_80_PLUS
        inss = INSS_VALOR if idade >= 65 else 0
        total_sp = lifestyle + saude + sobrecarga + custos - inss
        print(f"  {t:>3} | {idade:>5} | {fase:>8} | R${lifestyle:>10,} | R${saude:>10,.0f} | "
              f"R${sobrecarga:>10,} | R${custos:>6,} | R${inss:>6,} | R${total_sp:>10,.0f}")

    # ========================================
    # ACCUMULATION
    # ========================================
    print("\n" + "=" * 120)
    print("ACUMULACAO")
    print("=" * 120)

    eq_scen = {
        "base":      {"acum": EQUITY_SCENARIOS["base"]["acum"],        "desacum": EQUITY_SCENARIOS["base"]["desacum"]},
        "favoravel": {"acum": EQUITY_SCENARIOS["base"]["acum"] + 0.01, "desacum": EQUITY_SCENARIOS["base"]["desacum"] + 0.01},
        "stress":    {"acum": EQUITY_SCENARIOS["base"]["acum"] - 0.01, "desacum": EQUITY_SCENARIOS["base"]["desacum"] - 0.01},
    }
    contrib_map_c3 = {"base": "base", "favoravel": "fav", "stress": "stress"}
    contrib_map_c1 = {"base": "14y", "favoravel": "14y_fav", "stress": "14y_stress"}

    acum_c3 = {}
    for sname in ["base", "favoravel", "stress"]:
        np.random.seed(42)
        acum_c3[sname] = simulate_accumulation_casal(
            eq_scen[sname]["acum"],
            contribs_c3[contrib_map_c3[sname]],
        )

    acum_c1 = {}
    for sname in ["base", "favoravel", "stress"]:
        np.random.seed(42)
        acum_c1[sname] = simulate_accumulation_casal(
            eq_scen[sname]["acum"],
            contribs_c1c2[contrib_map_c1[sname]],
        )

    np.random.seed(42)
    pat_solo = simulate_accumulation_solo(EQUITY_SCENARIOS["base"]["acum"])
    pat_med_solo = np.median(pat_solo)

    labels = {"base": "Base", "favoravel": "Favoravel", "stress": "Stress"}

    print(f"\n  {'Cenario':<30} | {'P25':>12} | {'Mediana':>12} | {'P75':>12} | {'Media':>12}")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")
    for sname in ["base", "favoravel", "stress"]:
        p = acum_c3[sname]
        print(f"  {'C3-'+labels[sname]+' (FIRE 55)':<30} | R${np.percentile(p,25):>10,.0f} | R${np.median(p):>10,.0f} | "
              f"R${np.percentile(p,75):>10,.0f} | R${np.mean(p):>10,.0f}")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")
    for sname in ["base", "favoravel", "stress"]:
        p = acum_c1[sname]
        print(f"  {'C1-'+labels[sname]+' (FIRE 53)':<30} | R${np.percentile(p,25):>10,.0f} | R${np.median(p):>10,.0f} | "
              f"R${np.percentile(p,75):>10,.0f} | R${np.mean(p):>10,.0f}")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")
    print(f"  {'Solo baseline (FIRE 50)':<30} | R${np.percentile(pat_solo,25):>10,.0f} | R${np.median(pat_solo):>10,.0f} | "
          f"R${np.percentile(pat_solo,75):>10,.0f} | R${np.mean(pat_solo):>10,.0f}")

    # ========================================
    # DECUMULATION
    # ========================================
    print("\n" + "=" * 120)
    print("DESACUMULACAO — P(SUCESSO) COM GUARDRAILS")
    print("=" * 120)

    shock_map = {"base": None, "favoravel": None, "stress": -0.30}

    results_c3 = {}
    for sname in ["base", "favoravel", "stress"]:
        np.random.seed(200)
        sr = simulate_decum_c3(
            acum_c3[sname], eq_scen[sname]["desacum"], DESACUM_VOL,
            use_guardrails=True, year1_shock=shock_map[sname],
        )
        results_c3[sname] = sr

    results_c1 = {}
    for sname in ["base", "favoravel", "stress"]:
        np.random.seed(200)
        sr = simulate_decum_c1(
            acum_c1[sname], eq_scen[sname]["desacum"], DESACUM_VOL,
            use_guardrails=True, year1_shock=shock_map[sname],
        )
        results_c1[sname] = sr

    np.random.seed(200)
    sr_solo = simulate_decum_solo(
        pat_solo, EQUITY_SCENARIOS["base"]["desacum"], DESACUM_VOL,
        use_guardrails=True,
    )

    print(f"\n  {'Cenario':<30} | {'P(sucesso)':>12} | {'vs Solo':>10} | {'vs C1':>10}")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*10}-+-{'-'*10}")
    for sname in ["base", "favoravel", "stress"]:
        sr = results_c3[sname]
        sr1 = results_c1[sname]
        print(f"  {'C3-'+labels[sname]+' (FIRE 55)':<30} | {sr:>11.1%} | {(sr-sr_solo)*100:>+9.1f}pp | {(sr-sr1)*100:>+9.1f}pp")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*10}-+-{'-'*10}")
    for sname in ["base", "favoravel", "stress"]:
        sr = results_c1[sname]
        print(f"  {'C1-'+labels[sname]+' (FIRE 53)':<30} | {sr:>11.1%} | {(sr-sr_solo)*100:>+9.1f}pp | {'ref':>10}")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*10}-+-{'-'*10}")
    print(f"  {'Solo baseline':<30} | {sr_solo:>11.1%} | {'ref':>10} | {'':>10}")

    # ========================================
    # SWR
    # ========================================
    print("\n" + "=" * 120)
    print("SWR IMPLICITO (saque ano 1 / patrimonio mediano)")
    print("=" * 120)

    sp_c3_y1 = get_spending_c3(0)
    sp_c1_y1 = get_spending_c1(0)
    sp_solo_y1 = get_spending_solo(0)

    print(f"\n  {'Cenario':<30} | {'Pat Mediano':>14} | {'Saque Ano 1':>12} | {'SWR':>8}")
    print(f"  {'-'*30}-+-{'-'*14}-+-{'-'*12}-+-{'-'*8}")
    for sname in ["base", "favoravel", "stress"]:
        pat_med = np.median(acum_c3[sname])
        swr = sp_c3_y1 / pat_med
        print(f"  {'C3-'+labels[sname]+' (FIRE 55)':<30} | R${pat_med:>12,.0f} | R${sp_c3_y1:>10,.0f} | {swr:>7.2%}")
    print(f"  {'-'*30}-+-{'-'*14}-+-{'-'*12}-+-{'-'*8}")
    for sname in ["base", "favoravel", "stress"]:
        pat_med = np.median(acum_c1[sname])
        swr = sp_c1_y1 / pat_med
        print(f"  {'C1-'+labels[sname]+' (FIRE 53)':<30} | R${pat_med:>12,.0f} | R${sp_c1_y1:>10,.0f} | {swr:>7.2%}")
    print(f"  {'-'*30}-+-{'-'*14}-+-{'-'*12}-+-{'-'*8}")
    swr_solo = sp_solo_y1 / pat_med_solo
    print(f"  {'Solo baseline':<30} | R${pat_med_solo:>12,.0f} | R${sp_solo_y1:>10,.0f} | {swr_solo:>7.2%}")

    # ========================================
    # SIDE-BY-SIDE SUMMARY
    # ========================================
    print("\n" + "=" * 120)
    print("RESUMO LADO A LADO: C3 (FIRE 55) vs C1 (FIRE 53) vs SOLO")
    print("=" * 120)

    print(f"""
  +{'='*100}+
  | {'Metrica':<30} | {'C3 Base':>12} | {'C3 Fav':>12} | {'C3 Stress':>12} | {'C1 Base':>12} | {'Solo':>10} |
  +{'-'*100}+""")

    print(f"  | {'FIRE age':<30} | {'55':>12} | {'55':>12} | {'55':>12} | {'53':>12} | {'50':>10} |")

    print(f"  | {'Anos acumulacao':<30} | {'16.5':>12} | {'16.5':>12} | {'16.5':>12} | {'14':>12} | {'11':>10} |")

    print(f"  | {'Aportes totais':<30} | R${total_b:>9,} | R${total_f:>9,} | R${total_s:>9,} | R${total_c1:>9,} | R${3_300_000:>7,} |")

    print(f"  | {'Pat mediano no FIRE':<30} | R${np.median(acum_c3['base'])/1e6:>9.2f}M | "
          f"R${np.median(acum_c3['favoravel'])/1e6:>9.2f}M | "
          f"R${np.median(acum_c3['stress'])/1e6:>9.2f}M | "
          f"R${np.median(acum_c1['base'])/1e6:>9.2f}M | "
          f"R${pat_med_solo/1e6:>7.2f}M |")

    print(f"  | {'Spending ano 1':<30} | R${sp_c3_y1:>9,.0f} | R${sp_c3_y1:>9,.0f} | "
          f"R${sp_c3_y1:>9,.0f} | R${sp_c1_y1:>9,.0f} | R${sp_solo_y1:>7,.0f} |")

    print(f"  | {'SWR ano 1':<30} | {sp_c3_y1/np.median(acum_c3['base'])*100:>11.2f}% | "
          f"{sp_c3_y1/np.median(acum_c3['favoravel'])*100:>11.2f}% | "
          f"{sp_c3_y1/np.median(acum_c3['stress'])*100:>11.2f}% | "
          f"{sp_c1_y1/np.median(acum_c1['base'])*100:>11.2f}% | "
          f"{swr_solo*100:>9.2f}% |")

    print(f"  | {'P(sucesso) c/ guardrails':<30} | {results_c3['base']:>11.1%} | "
          f"{results_c3['favoravel']:>11.1%} | "
          f"{results_c3['stress']:>11.1%} | "
          f"{results_c1['base']:>11.1%} | "
          f"{sr_solo:>9.1%} |")

    print(f"  | {'Delta vs solo':<30} | "
          f"{(results_c3['base']-sr_solo)*100:>+11.1f}pp | "
          f"{(results_c3['favoravel']-sr_solo)*100:>+11.1f}pp | "
          f"{(results_c3['stress']-sr_solo)*100:>+11.1f}pp | "
          f"{(results_c1['base']-sr_solo)*100:>+11.1f}pp | "
          f"{'ref':>10} |")

    delta_c3_c1_base = (results_c3['base'] - results_c1['base']) * 100
    print(f"  | {'Delta C3 vs C1':<30} | "
          f"{(results_c3['base']-results_c1['base'])*100:>+11.1f}pp | "
          f"{(results_c3['favoravel']-results_c1['favoravel'])*100:>+11.1f}pp | "
          f"{(results_c3['stress']-results_c1['stress'])*100:>+11.1f}pp | "
          f"{'ref':>12} | "
          f"{'':>10} |")

    print(f"  +{'='*100}+")

    # Horizonte comparison
    print(f"""
  DECOMPOSICAO DO GANHO C3 vs C1 (base):
  - Patrimonio: C3 R${np.median(acum_c3['base'])/1e6:.2f}M vs C1 R${np.median(acum_c1['base'])/1e6:.2f}M = +R${(np.median(acum_c3['base'])-np.median(acum_c1['base']))/1e6:.2f}M
  - Spending ano 1: C3 R${sp_c3_y1:,.0f} vs C1 R${sp_c1_y1:,.0f} = R${sp_c3_y1-sp_c1_y1:+,.0f}
  - Horizonte decum: C3 40 anos vs C1 42 anos (2 anos menos = favorece C3)
  - Sobrecarga total: C3 R${68_000*4 + 38_000*3:,} vs C1 R${95_000*5 + 30_000*5:,} (C3 menos R${(95_000*5+30_000*5)-(68_000*4+38_000*3):,})
  - SWR: C3 {sp_c3_y1/np.median(acum_c3['base'])*100:.2f}% vs C1 {sp_c1_y1/np.median(acum_c1['base'])*100:.2f}%
  - P(sucesso): C3 {results_c3['base']:.1%} vs C1 {results_c1['base']:.1%} = {delta_c3_c1_base:+.1f}pp
""")

    print("=" * 120)
    print(f"Script: dados/monte_carlo_casal_katia.py")
    print(f"Seeds: 42 (acum) + 200 (decum) | N={N_SIM:,} | t-dist df={DF_T}")
    print("=" * 120)


# =====================================================
# CENARIO 4 — FIRE 55 com casa de R$1M
# =====================================================
# Same as C3 except:
# - One-time: +R$390k no mes 30 (vs +R$190k in C3)
# - Mortgage R$610k SAC 20a 10%a.a., 78 meses restantes no FIRE
# - Sobrecarga ajustada para mortgage maior declining


def compute_contributions_c4():
    """
    C4 aportes — identical to C3 except one-time is R$390k.
    Meses 1-24: R$15k, 25-36: R$9k, 37-198: R$16k
    One-time: +R$390k no mes 30
    """
    n_years = 17
    contribs = {"base": [], "fav": [], "stress": []}

    for year in range(n_years):
        total_b = total_f = total_s = 0
        for m in range(1, 13):
            month = year * 12 + m
            if month > N_MONTHS_C3:
                break
            if month <= 24:
                cb = 15_000
            elif month <= 36:
                cb = 9_000
            else:
                cb = 16_000
            total_b += cb
            total_f += cb + 2_000
            if month <= 24:
                cs = 15_000
            elif month <= 54:
                cs = 9_000
            else:
                cs = 16_000
            total_s += cs
            if month == 30:
                total_b += 390_000
                total_f += 390_000
                total_s += 390_000
        contribs["base"].append(total_b)
        contribs["fav"].append(total_f)
        contribs["stress"].append(total_s)

    return contribs


def get_sobrecarga_c4(year_in_retirement):
    """
    C4 sobrecarga (FIRE 55, casa R$1M, mortgage R$610k SAC 20a):
    78 meses restantes no FIRE = 6.5 anos
    Anos 1-4 (t=0..3): +R$75k (escola R$30k + mortgage avg R$45k declining)
    Anos 5-7 (t=4..6): +R$35k (so mortgage declining R$38k->R$32k)
    Anos 8+ (t>=7): R$0
    """
    if year_in_retirement < 4:
        return 75_000
    elif year_in_retirement < 7:
        return 35_000
    else:
        return 0


def get_spending_c4(year_in_retirement, inss_valor=INSS_VALOR):
    """Spending casal FIRE 55, casa R$1M."""
    t = year_in_retirement
    idade = FIRE_AGE_C3 + t  # same FIRE age as C3 (55)
    saude = saude_capdecay_c3(t)  # same health as C3

    if t < 10:
        lifestyle_ex_saude = 290_000
    elif t < 20:
        lifestyle_ex_saude = 230_000
    else:
        lifestyle_ex_saude = 200_000

    sobrecarga = get_sobrecarga_c4(t)

    if idade < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    inss = inss_valor if idade >= 65 else 0
    return max(lifestyle_ex_saude + saude + sobrecarga + custo_desacum - inss, 0)


def apply_guardrails_c4(base_withdrawal, drawdown, year, upside_bump=0):
    """Guardrails for C4 (FIRE 55, casa R$1M)."""
    t = year
    idade = FIRE_AGE_C3 + t
    saude = saude_capdecay_c3(t)
    sobrecarga = get_sobrecarga_c4(t)

    if idade < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    inss = INSS_VALOR if idade >= 65 else 0
    piso = 200_000 + saude + sobrecarga + custo_desacum - inss

    if drawdown > 0.35:
        return piso
    elif drawdown > 0.25:
        return max(230_000 + saude + sobrecarga + custo_desacum - inss, piso)
    elif drawdown > 0.15:
        return max(260_000 + saude + sobrecarga + custo_desacum - inss, piso)
    else:
        return base_withdrawal + upside_bump


def simulate_decum_c4(pat_fire, ret_mean, ret_vol, use_guardrails=True,
                       year1_shock=None, n_years=HORIZONTE_DESACUM_C3):
    """Decumulation for C4 (FIRE 55, casa R$1M, 40 anos)."""
    n_sims = len(pat_fire)
    patrimonio = np.zeros((n_sims, n_years + 1))
    patrimonio[:, 0] = pat_fire.copy()
    pico = pat_fire.copy()
    failed = np.zeros(n_sims, dtype=bool)
    upside_bump = np.zeros(n_sims)

    mu_g = ret_mean - ret_vol**2 / 2
    scale = np.sqrt((DF_T - 2) / DF_T)

    for year in range(n_years):
        z = np.random.standard_t(DF_T, size=n_sims) * scale
        if year == 0 and year1_shock is not None:
            returns = np.full(n_sims, year1_shock)
        else:
            returns = np.exp(mu_g + ret_vol * z) - 1

        base_w = get_spending_c4(year)

        for i in range(n_sims):
            if failed[i]:
                continue
            w = base_w
            if use_guardrails:
                dd = max(0, 1 - patrimonio[i, year] / pico[i])
                w = apply_guardrails_c4(base_w, dd, year, upside_bump[i])
                if patrimonio[i, year] > pico[i] * 1.25 and upside_bump[i] == 0:
                    upside_bump[i] = 29_000
                    w += 29_000
                if patrimonio[i, year] > pico[i]:
                    pico[i] = patrimonio[i, year]

            novo = (patrimonio[i, year] - w) * (1 + returns[i])
            if novo <= 0:
                patrimonio[i, year + 1] = 0
                failed[i] = True
            else:
                patrimonio[i, year + 1] = novo
                pico[i] = max(pico[i], novo)

    return 1 - np.mean(failed)


# =====================================================
# MAIN v4: C4 (FIRE 55 casa R$1M) vs C3 vs Solo
# =====================================================

def main_v4():
    """Run C4 side by side with C3 and Solo."""
    contribs_c4 = compute_contributions_c4()
    contribs_c3 = compute_contributions_c3()

    print("\n\n")
    print("=" * 120)
    print("=" * 120)
    print("CENARIO 4: FIRE 55 CASA R$1M vs C3 (FIRE 55 CASA R$1.5M) vs SOLO")
    print(f"C4: one-time R$390k (vs C3 R$190k) | mortgage R$610k SAC 20a")
    print("=" * 120)

    # ========================================
    # APORTES
    # ========================================
    print("\n" + "-" * 120)
    print("APORTES ANUAIS — C4 vs C3")
    print("-" * 120)
    print(f"  {'Ano':>4} | {'Idade':>5} | {'Meses':>10} | {'C4 Base':>12} | {'C3 Base':>12} | {'Delta':>12}")
    print(f"  {'-'*4}-+-{'-'*5}-+-{'-'*10}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")

    total_c4 = total_c3 = 0
    total_c4_f = total_c4_s = 0
    for y in range(len(contribs_c4["base"])):
        cb4 = contribs_c4["base"][y]
        cb3 = contribs_c3["base"][y]
        total_c4 += cb4
        total_c3 += cb3
        total_c4_f += contribs_c4["fav"][y]
        total_c4_s += contribs_c4["stress"][y]
        m_start = y * 12 + 1
        m_end = min((y + 1) * 12, N_MONTHS_C3)
        partial = " (6m)" if m_end < (y + 1) * 12 else ""
        delta = cb4 - cb3
        print(f"  {y+1:>4} | {IDADE_ATUAL+y+1:>5} | {m_start:>3}-{m_end:<3}    | R${cb4:>10,} | R${cb3:>10,} | R${delta:>+10,}{partial}")

    print(f"  {'-'*4}-+-{'-'*5}-+-{'-'*10}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")
    print(f"  {'TOTAL':>4} | {'':>5} | {'':>10} | R${total_c4:>10,} | R${total_c3:>10,} | R${total_c4-total_c3:>+10,}")
    print(f"  C4 Favoravel total: R${total_c4_f:>10,} | C4 Stress total: R${total_c4_s:>10,}")

    # ========================================
    # SOBRECARGA COMPARISON
    # ========================================
    print("\n" + "-" * 120)
    print("SOBRECARGA — C4 vs C3 (primeiros 10 anos)")
    print("-" * 120)
    print(f"  {'t':>3} | {'Idade':>5} | {'C4':>10} | {'C3':>10} | {'Delta':>10} | {'C4 Detail':>30}")
    print(f"  {'-'*3}-+-{'-'*5}-+-{'-'*10}-+-{'-'*10}-+-{'-'*10}-+-{'-'*30}")
    total_sob_c4 = total_sob_c3 = 0
    for t in range(10):
        s4 = get_sobrecarga_c4(t)
        s3 = get_sobrecarga_c3(t)
        total_sob_c4 += s4
        total_sob_c3 += s3
        if t < 4:
            detail = "escola R$30k + mortgage R$45k"
        elif t < 7:
            detail = "mortgage declining ~R$35k"
        else:
            detail = "quitado"
        print(f"  {t:>3} | {55+t:>5} | R${s4:>8,} | R${s3:>8,} | R${s4-s3:>+8,} | {detail:>30}")
    print(f"  {'':>3} | {'TOTAL':>5} | R${total_sob_c4:>8,} | R${total_sob_c3:>8,} | R${total_sob_c4-total_sob_c3:>+8,} |")

    # ========================================
    # SPENDING PROFILE C4 (first 15 years)
    # ========================================
    print("\n" + "-" * 120)
    print("SPENDING PROFILE — C4 (FIRE 55 casa R$1M) primeiros 15 anos")
    print("-" * 120)
    print(f"  {'t':>3} | {'Idade':>5} | {'C4 Total':>12} | {'C3 Total':>12} | {'Delta':>10} | {'Sobrecarga C4':>14}")
    print(f"  {'-'*3}-+-{'-'*5}-+-{'-'*12}-+-{'-'*12}-+-{'-'*10}-+-{'-'*14}")
    for t in range(15):
        sp4 = get_spending_c4(t)
        sp3 = get_spending_c3(t)
        sob4 = get_sobrecarga_c4(t)
        print(f"  {t:>3} | {55+t:>5} | R${sp4:>10,.0f} | R${sp3:>10,.0f} | R${sp4-sp3:>+8,.0f} | R${sob4:>12,}")

    # ========================================
    # ACCUMULATION
    # ========================================
    print("\n" + "=" * 120)
    print("ACUMULACAO")
    print("=" * 120)

    eq_scen = {
        "base":      {"acum": EQUITY_SCENARIOS["base"]["acum"],        "desacum": EQUITY_SCENARIOS["base"]["desacum"]},
        "favoravel": {"acum": EQUITY_SCENARIOS["base"]["acum"] + 0.01, "desacum": EQUITY_SCENARIOS["base"]["desacum"] + 0.01},
        "stress":    {"acum": EQUITY_SCENARIOS["base"]["acum"] - 0.01, "desacum": EQUITY_SCENARIOS["base"]["desacum"] - 0.01},
    }
    contrib_map = {"base": "base", "favoravel": "fav", "stress": "stress"}

    acum_c4 = {}
    for sname in ["base", "favoravel", "stress"]:
        np.random.seed(42)
        acum_c4[sname] = simulate_accumulation_casal(
            eq_scen[sname]["acum"],
            contribs_c4[contrib_map[sname]],
        )

    acum_c3 = {}
    for sname in ["base", "favoravel", "stress"]:
        np.random.seed(42)
        acum_c3[sname] = simulate_accumulation_casal(
            eq_scen[sname]["acum"],
            contribs_c3[contrib_map[sname]],
        )

    np.random.seed(42)
    pat_solo = simulate_accumulation_solo(EQUITY_SCENARIOS["base"]["acum"])
    pat_med_solo = np.median(pat_solo)

    labels = {"base": "Base", "favoravel": "Favoravel", "stress": "Stress"}

    print(f"\n  {'Cenario':<30} | {'P25':>12} | {'Mediana':>12} | {'P75':>12} | {'Media':>12}")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")
    for sname in ["base", "favoravel", "stress"]:
        p = acum_c4[sname]
        print(f"  {'C4-'+labels[sname]+' (casa R$1M)':<30} | R${np.percentile(p,25):>10,.0f} | R${np.median(p):>10,.0f} | "
              f"R${np.percentile(p,75):>10,.0f} | R${np.mean(p):>10,.0f}")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")
    for sname in ["base", "favoravel", "stress"]:
        p = acum_c3[sname]
        print(f"  {'C3-'+labels[sname]+' (casa R$1.5M)':<30} | R${np.percentile(p,25):>10,.0f} | R${np.median(p):>10,.0f} | "
              f"R${np.percentile(p,75):>10,.0f} | R${np.mean(p):>10,.0f}")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}")
    print(f"  {'Solo baseline (FIRE 50)':<30} | R${np.percentile(pat_solo,25):>10,.0f} | R${np.median(pat_solo):>10,.0f} | "
          f"R${np.percentile(pat_solo,75):>10,.0f} | R${np.mean(pat_solo):>10,.0f}")

    # ========================================
    # DECUMULATION
    # ========================================
    print("\n" + "=" * 120)
    print("DESACUMULACAO — P(SUCESSO) COM GUARDRAILS")
    print("=" * 120)

    shock_map = {"base": None, "favoravel": None, "stress": -0.30}

    results_c4 = {}
    for sname in ["base", "favoravel", "stress"]:
        np.random.seed(200)
        sr = simulate_decum_c4(
            acum_c4[sname], eq_scen[sname]["desacum"], DESACUM_VOL,
            use_guardrails=True, year1_shock=shock_map[sname],
        )
        results_c4[sname] = sr

    results_c3 = {}
    for sname in ["base", "favoravel", "stress"]:
        np.random.seed(200)
        sr = simulate_decum_c3(
            acum_c3[sname], eq_scen[sname]["desacum"], DESACUM_VOL,
            use_guardrails=True, year1_shock=shock_map[sname],
        )
        results_c3[sname] = sr

    np.random.seed(200)
    sr_solo = simulate_decum_solo(
        pat_solo, EQUITY_SCENARIOS["base"]["desacum"], DESACUM_VOL,
        use_guardrails=True,
    )

    print(f"\n  {'Cenario':<30} | {'P(sucesso)':>12} | {'vs Solo':>10} | {'vs C3':>10}")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*10}-+-{'-'*10}")
    for sname in ["base", "favoravel", "stress"]:
        sr4 = results_c4[sname]
        sr3 = results_c3[sname]
        print(f"  {'C4-'+labels[sname]+' (casa R$1M)':<30} | {sr4:>11.1%} | {(sr4-sr_solo)*100:>+9.1f}pp | {(sr4-sr3)*100:>+9.1f}pp")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*10}-+-{'-'*10}")
    for sname in ["base", "favoravel", "stress"]:
        sr3 = results_c3[sname]
        print(f"  {'C3-'+labels[sname]+' (casa R$1.5M)':<30} | {sr3:>11.1%} | {(sr3-sr_solo)*100:>+9.1f}pp | {'ref':>10}")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*10}-+-{'-'*10}")
    print(f"  {'Solo baseline':<30} | {sr_solo:>11.1%} | {'ref':>10} | {'':>10}")

    # ========================================
    # SWR
    # ========================================
    print("\n" + "=" * 120)
    print("SWR IMPLICITO (saque ano 1 / patrimonio mediano)")
    print("=" * 120)

    sp_c4_y1 = get_spending_c4(0)
    sp_c3_y1 = get_spending_c3(0)
    sp_solo_y1 = get_spending_solo(0)

    print(f"\n  {'Cenario':<30} | {'Pat Mediano':>14} | {'Saque Ano 1':>12} | {'SWR':>8}")
    print(f"  {'-'*30}-+-{'-'*14}-+-{'-'*12}-+-{'-'*8}")
    for sname in ["base", "favoravel", "stress"]:
        pat_med = np.median(acum_c4[sname])
        swr = sp_c4_y1 / pat_med
        print(f"  {'C4-'+labels[sname]+' (casa R$1M)':<30} | R${pat_med:>12,.0f} | R${sp_c4_y1:>10,.0f} | {swr:>7.2%}")
    print(f"  {'-'*30}-+-{'-'*14}-+-{'-'*12}-+-{'-'*8}")
    for sname in ["base", "favoravel", "stress"]:
        pat_med = np.median(acum_c3[sname])
        swr = sp_c3_y1 / pat_med
        print(f"  {'C3-'+labels[sname]+' (casa R$1.5M)':<30} | R${pat_med:>12,.0f} | R${sp_c3_y1:>10,.0f} | {swr:>7.2%}")
    print(f"  {'-'*30}-+-{'-'*14}-+-{'-'*12}-+-{'-'*8}")
    swr_solo = sp_solo_y1 / pat_med_solo
    print(f"  {'Solo baseline':<30} | R${pat_med_solo:>12,.0f} | R${sp_solo_y1:>10,.0f} | {swr_solo:>7.2%}")

    # ========================================
    # SIDE-BY-SIDE SUMMARY
    # ========================================
    print("\n" + "=" * 120)
    print("RESUMO LADO A LADO: C4 (casa R$1M) vs C3 (casa R$1.5M) vs SOLO")
    print("=" * 120)

    print(f"""
  +{'='*100}+
  | {'Metrica':<30} | {'C4 Base':>12} | {'C4 Fav':>12} | {'C4 Stress':>12} | {'C3 Base':>12} | {'Solo':>10} |
  +{'-'*100}+""")

    print(f"  | {'FIRE age':<30} | {'55':>12} | {'55':>12} | {'55':>12} | {'55':>12} | {'50':>10} |")

    print(f"  | {'Casa valor':<30} | {'R$1.0M':>12} | {'R$1.0M':>12} | {'R$1.0M':>12} | {'R$1.5M':>12} | {'n/a':>10} |")

    print(f"  | {'One-time mes 30':<30} | {'R$390k':>12} | {'R$390k':>12} | {'R$390k':>12} | {'R$190k':>12} | {'n/a':>10} |")

    print(f"  | {'Aportes totais':<30} | R${total_c4:>9,} | R${total_c4_f:>9,} | R${total_c4_s:>9,} | R${total_c3:>9,} | R${3_300_000:>7,} |")

    print(f"  | {'Pat mediano no FIRE':<30} | R${np.median(acum_c4['base'])/1e6:>9.2f}M | "
          f"R${np.median(acum_c4['favoravel'])/1e6:>9.2f}M | "
          f"R${np.median(acum_c4['stress'])/1e6:>9.2f}M | "
          f"R${np.median(acum_c3['base'])/1e6:>9.2f}M | "
          f"R${pat_med_solo/1e6:>7.2f}M |")

    print(f"  | {'Spending ano 1':<30} | R${sp_c4_y1:>9,.0f} | R${sp_c4_y1:>9,.0f} | "
          f"R${sp_c4_y1:>9,.0f} | R${sp_c3_y1:>9,.0f} | R${sp_solo_y1:>7,.0f} |")

    print(f"  | {'SWR ano 1':<30} | {sp_c4_y1/np.median(acum_c4['base'])*100:>11.2f}% | "
          f"{sp_c4_y1/np.median(acum_c4['favoravel'])*100:>11.2f}% | "
          f"{sp_c4_y1/np.median(acum_c4['stress'])*100:>11.2f}% | "
          f"{sp_c3_y1/np.median(acum_c3['base'])*100:>11.2f}% | "
          f"{swr_solo*100:>9.2f}% |")

    print(f"  | {'P(sucesso) c/ guardrails':<30} | {results_c4['base']:>11.1%} | "
          f"{results_c4['favoravel']:>11.1%} | "
          f"{results_c4['stress']:>11.1%} | "
          f"{results_c3['base']:>11.1%} | "
          f"{sr_solo:>9.1%} |")

    print(f"  | {'Delta vs solo':<30} | "
          f"{(results_c4['base']-sr_solo)*100:>+11.1f}pp | "
          f"{(results_c4['favoravel']-sr_solo)*100:>+11.1f}pp | "
          f"{(results_c4['stress']-sr_solo)*100:>+11.1f}pp | "
          f"{(results_c3['base']-sr_solo)*100:>+11.1f}pp | "
          f"{'ref':>10} |")

    print(f"  | {'Delta C4 vs C3':<30} | "
          f"{(results_c4['base']-results_c3['base'])*100:>+11.1f}pp | "
          f"{(results_c4['favoravel']-results_c3['favoravel'])*100:>+11.1f}pp | "
          f"{(results_c4['stress']-results_c3['stress'])*100:>+11.1f}pp | "
          f"{'ref':>12} | "
          f"{'':>10} |")

    print(f"  +{'='*100}+")

    # Decomposition
    delta_one_time = 390_000 - 190_000  # R$200k extra
    delta_sobrecarga = total_sob_c4 - total_sob_c3 if 'total_sob_c4' in dir() else 0
    # Recompute sobrecarga totals
    sob_c4_total = sum(get_sobrecarga_c4(t) for t in range(HORIZONTE_DESACUM_C3))
    sob_c3_total = sum(get_sobrecarga_c3(t) for t in range(HORIZONTE_DESACUM_C3))

    print(f"""
  DECOMPOSICAO C4 vs C3:
  - One-time extra: R${delta_one_time:,} (R$390k vs R$190k)
  - Aportes totais: C4 R${total_c4:,} vs C3 R${total_c3:,} = +R${total_c4-total_c3:,}
  - Pat mediano: C4 R${np.median(acum_c4['base'])/1e6:.2f}M vs C3 R${np.median(acum_c3['base'])/1e6:.2f}M = +R${(np.median(acum_c4['base'])-np.median(acum_c3['base']))/1e6:.2f}M
  - Sobrecarga total (lifetime): C4 R${sob_c4_total:,} vs C3 R${sob_c3_total:,} = R${sob_c4_total-sob_c3_total:+,}
  - Spending ano 1: C4 R${sp_c4_y1:,.0f} vs C3 R${sp_c3_y1:,.0f} = R${sp_c4_y1-sp_c3_y1:+,.0f}
  - SWR: C4 {sp_c4_y1/np.median(acum_c4['base'])*100:.2f}% vs C3 {sp_c3_y1/np.median(acum_c3['base'])*100:.2f}%
  - P(sucesso): C4 {results_c4['base']:.1%} vs C3 {results_c3['base']:.1%} = {(results_c4['base']-results_c3['base'])*100:+.1f}pp
""")

    print("=" * 120)
    print(f"Script: dados/monte_carlo_casal_katia.py")
    print(f"Seeds: 42 (acum) + 200 (decum) | N={N_SIM:,} | t-dist df={DF_T}")
    print("=" * 120)


# =====================================================
# CENARIO 5 — FIRE 55 casa R$1M, lifestyle reduzido
# =====================================================
# Same as C4 except lifestyle:
#   Go-Go: R$250k (was R$290k)
#   Slow-Go: R$198k (was R$230k, ratio preserved)
#   No-Go: R$172k (was R$200k, ratio preserved)


def get_spending_c5(year_in_retirement, inss_valor=INSS_VALOR):
    """Spending casal FIRE 55, casa R$1M, lifestyle reduzido."""
    t = year_in_retirement
    idade = FIRE_AGE_C3 + t
    saude = saude_capdecay_c3(t)

    if t < 10:
        lifestyle_ex_saude = 250_000
    elif t < 20:
        lifestyle_ex_saude = 198_000
    else:
        lifestyle_ex_saude = 172_000

    sobrecarga = get_sobrecarga_c4(t)  # same as C4

    if idade < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    inss = inss_valor if idade >= 65 else 0
    return max(lifestyle_ex_saude + saude + sobrecarga + custo_desacum - inss, 0)


def apply_guardrails_c5(base_withdrawal, drawdown, year, upside_bump=0):
    """Guardrails for C5 — scaled to lower lifestyle."""
    t = year
    idade = FIRE_AGE_C3 + t
    saude = saude_capdecay_c3(t)
    sobrecarga = get_sobrecarga_c4(t)

    if idade < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    inss = INSS_VALOR if idade >= 65 else 0

    # Guardrail lifestyle tiers scaled: 250/225/198/172
    piso = 172_000 + saude + sobrecarga + custo_desacum - inss

    if drawdown > 0.35:
        return piso
    elif drawdown > 0.25:
        return max(198_000 + saude + sobrecarga + custo_desacum - inss, piso)
    elif drawdown > 0.15:
        return max(225_000 + saude + sobrecarga + custo_desacum - inss, piso)
    else:
        return base_withdrawal + upside_bump


def simulate_decum_c5(pat_fire, ret_mean, ret_vol, use_guardrails=True,
                       year1_shock=None, n_years=HORIZONTE_DESACUM_C3):
    """Decumulation for C5."""
    n_sims = len(pat_fire)
    patrimonio = np.zeros((n_sims, n_years + 1))
    patrimonio[:, 0] = pat_fire.copy()
    pico = pat_fire.copy()
    failed = np.zeros(n_sims, dtype=bool)
    upside_bump = np.zeros(n_sims)

    mu_g = ret_mean - ret_vol**2 / 2
    scale = np.sqrt((DF_T - 2) / DF_T)

    for year in range(n_years):
        z = np.random.standard_t(DF_T, size=n_sims) * scale
        if year == 0 and year1_shock is not None:
            returns = np.full(n_sims, year1_shock)
        else:
            returns = np.exp(mu_g + ret_vol * z) - 1

        base_w = get_spending_c5(year)

        for i in range(n_sims):
            if failed[i]:
                continue
            w = base_w
            if use_guardrails:
                dd = max(0, 1 - patrimonio[i, year] / pico[i])
                w = apply_guardrails_c5(base_w, dd, year, upside_bump[i])
                if patrimonio[i, year] > pico[i] * 1.25 and upside_bump[i] == 0:
                    upside_bump[i] = 29_000
                    w += 29_000
                if patrimonio[i, year] > pico[i]:
                    pico[i] = patrimonio[i, year]

            novo = (patrimonio[i, year] - w) * (1 + returns[i])
            if novo <= 0:
                patrimonio[i, year + 1] = 0
                failed[i] = True
            else:
                patrimonio[i, year + 1] = novo
                pico[i] = max(pico[i], novo)

    return 1 - np.mean(failed)


# =====================================================
# MAIN v5: C5 vs C4 vs Solo
# =====================================================

def main_v5():
    """Run C5 (lifestyle reduzido) side by side with C4 and Solo."""
    contribs_c4 = compute_contributions_c4()  # C5 uses same contributions as C4

    print("\n\n")
    print("=" * 120)
    print("=" * 120)
    print("CENARIO 5: FIRE 55 CASA R$1M LIFESTYLE REDUZIDO vs C4 vs SOLO")
    print(f"C5 lifestyle: Go-Go R$250k / Slow-Go R$198k / No-Go R$172k")
    print(f"C4 lifestyle: Go-Go R$290k / Slow-Go R$230k / No-Go R$200k")
    print("=" * 120)

    # ========================================
    # SPENDING PROFILE COMPARISON
    # ========================================
    print("\n" + "-" * 120)
    print("SPENDING PROFILE — C5 vs C4 (primeiros 20 anos)")
    print("-" * 120)
    print(f"  {'t':>3} | {'Idade':>5} | {'Fase':>8} | {'C5 Lifestyle':>13} | {'C5 Total':>12} | "
          f"{'C4 Total':>12} | {'Delta':>10} | {'Saude':>10}")
    print(f"  {'-'*3}-+-{'-'*5}-+-{'-'*8}-+-{'-'*13}-+-{'-'*12}-+-{'-'*12}-+-{'-'*10}-+-{'-'*10}")

    for t in range(20):
        idade = FIRE_AGE_C3 + t
        sp5 = get_spending_c5(t)
        sp4 = get_spending_c4(t)
        saude = saude_capdecay_c3(t)
        if t < 10:
            ls = 250_000
            fase = "Go-Go"
        elif t < 20:
            ls = 198_000
            fase = "Slow-Go"
        else:
            ls = 172_000
            fase = "No-Go"
        print(f"  {t:>3} | {idade:>5} | {fase:>8} | R${ls:>11,} | R${sp5:>10,.0f} | "
              f"R${sp4:>10,.0f} | R${sp5-sp4:>+8,.0f} | R${saude:>8,.0f}")

    # ========================================
    # ACCUMULATION (same as C4)
    # ========================================
    print("\n" + "=" * 120)
    print("ACUMULACAO (identica ao C4 — mesmos aportes)")
    print("=" * 120)

    eq_scen = {
        "base":      {"acum": EQUITY_SCENARIOS["base"]["acum"],        "desacum": EQUITY_SCENARIOS["base"]["desacum"]},
        "favoravel": {"acum": EQUITY_SCENARIOS["base"]["acum"] + 0.01, "desacum": EQUITY_SCENARIOS["base"]["desacum"] + 0.01},
        "stress":    {"acum": EQUITY_SCENARIOS["base"]["acum"] - 0.01, "desacum": EQUITY_SCENARIOS["base"]["desacum"] - 0.01},
    }
    contrib_map = {"base": "base", "favoravel": "fav", "stress": "stress"}

    acum_c5 = {}  # same as C4
    for sname in ["base", "favoravel", "stress"]:
        np.random.seed(42)
        acum_c5[sname] = simulate_accumulation_casal(
            eq_scen[sname]["acum"],
            contribs_c4[contrib_map[sname]],
        )

    np.random.seed(42)
    pat_solo = simulate_accumulation_solo(EQUITY_SCENARIOS["base"]["acum"])
    pat_med_solo = np.median(pat_solo)

    labels = {"base": "Base", "favoravel": "Favoravel", "stress": "Stress"}

    print(f"\n  {'Cenario':<25} | {'Mediana':>12} | (same for C4 and C5)")
    print(f"  {'-'*25}-+-{'-'*12}-+")
    for sname in ["base", "favoravel", "stress"]:
        p = acum_c5[sname]
        print(f"  {'C4/C5-'+labels[sname]:<25} | R${np.median(p):>10,.0f} |")
    print(f"  {'Solo baseline':<25} | R${pat_med_solo:>10,.0f} |")

    # ========================================
    # DECUMULATION
    # ========================================
    print("\n" + "=" * 120)
    print("DESACUMULACAO — P(SUCESSO) COM GUARDRAILS")
    print("=" * 120)

    shock_map = {"base": None, "favoravel": None, "stress": -0.30}

    results_c5 = {}
    for sname in ["base", "favoravel", "stress"]:
        np.random.seed(200)
        sr = simulate_decum_c5(
            acum_c5[sname], eq_scen[sname]["desacum"], DESACUM_VOL,
            use_guardrails=True, year1_shock=shock_map[sname],
        )
        results_c5[sname] = sr

    results_c4 = {}
    for sname in ["base", "favoravel", "stress"]:
        np.random.seed(200)
        sr = simulate_decum_c4(
            acum_c5[sname], eq_scen[sname]["desacum"], DESACUM_VOL,
            use_guardrails=True, year1_shock=shock_map[sname],
        )
        results_c4[sname] = sr

    np.random.seed(200)
    sr_solo = simulate_decum_solo(
        pat_solo, EQUITY_SCENARIOS["base"]["desacum"], DESACUM_VOL,
        use_guardrails=True,
    )

    print(f"\n  {'Cenario':<30} | {'P(sucesso)':>12} | {'vs Solo':>10} | {'vs C4':>10}")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*10}-+-{'-'*10}")
    for sname in ["base", "favoravel", "stress"]:
        sr5 = results_c5[sname]
        sr4 = results_c4[sname]
        print(f"  {'C5-'+labels[sname]+' (lifestyle -14%)':<30} | {sr5:>11.1%} | {(sr5-sr_solo)*100:>+9.1f}pp | {(sr5-sr4)*100:>+9.1f}pp")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*10}-+-{'-'*10}")
    for sname in ["base", "favoravel", "stress"]:
        sr4 = results_c4[sname]
        print(f"  {'C4-'+labels[sname]+' (lifestyle R$290k)':<30} | {sr4:>11.1%} | {(sr4-sr_solo)*100:>+9.1f}pp | {'ref':>10}")
    print(f"  {'-'*30}-+-{'-'*12}-+-{'-'*10}-+-{'-'*10}")
    print(f"  {'Solo baseline':<30} | {sr_solo:>11.1%} | {'ref':>10} | {'':>10}")

    # ========================================
    # SWR
    # ========================================
    print("\n" + "=" * 120)
    print("SWR IMPLICITO")
    print("=" * 120)

    sp_c5_y1 = get_spending_c5(0)
    sp_c4_y1 = get_spending_c4(0)
    sp_solo_y1 = get_spending_solo(0)

    print(f"\n  {'Cenario':<30} | {'Pat Mediano':>14} | {'Saque Ano 1':>12} | {'SWR':>8}")
    print(f"  {'-'*30}-+-{'-'*14}-+-{'-'*12}-+-{'-'*8}")
    for sname in ["base", "favoravel", "stress"]:
        pat_med = np.median(acum_c5[sname])
        swr = sp_c5_y1 / pat_med
        print(f"  {'C5-'+labels[sname]:<30} | R${pat_med:>12,.0f} | R${sp_c5_y1:>10,.0f} | {swr:>7.2%}")
    print(f"  {'-'*30}-+-{'-'*14}-+-{'-'*12}-+-{'-'*8}")
    for sname in ["base", "favoravel", "stress"]:
        pat_med = np.median(acum_c5[sname])
        swr = sp_c4_y1 / pat_med
        print(f"  {'C4-'+labels[sname]:<30} | R${pat_med:>12,.0f} | R${sp_c4_y1:>10,.0f} | {swr:>7.2%}")
    print(f"  {'-'*30}-+-{'-'*14}-+-{'-'*12}-+-{'-'*8}")
    swr_solo = sp_solo_y1 / pat_med_solo
    print(f"  {'Solo baseline':<30} | R${pat_med_solo:>12,.0f} | R${sp_solo_y1:>10,.0f} | {swr_solo:>7.2%}")

    # ========================================
    # SIDE-BY-SIDE SUMMARY
    # ========================================
    print("\n" + "=" * 120)
    print("RESUMO LADO A LADO: C5 (lifestyle reduzido) vs C4 vs SOLO")
    print("=" * 120)

    print(f"""
  +{'='*100}+
  | {'Metrica':<30} | {'C5 Base':>12} | {'C5 Fav':>12} | {'C5 Stress':>12} | {'C4 Base':>12} | {'Solo':>10} |
  +{'-'*100}+""")

    print(f"  | {'FIRE age':<30} | {'55':>12} | {'55':>12} | {'55':>12} | {'55':>12} | {'50':>10} |")

    print(f"  | {'Lifestyle Go-Go':<30} | {'R$250k':>12} | {'R$250k':>12} | {'R$250k':>12} | {'R$290k':>12} | {'R$280k':>10} |")

    print(f"  | {'Pat mediano no FIRE':<30} | R${np.median(acum_c5['base'])/1e6:>9.2f}M | "
          f"R${np.median(acum_c5['favoravel'])/1e6:>9.2f}M | "
          f"R${np.median(acum_c5['stress'])/1e6:>9.2f}M | "
          f"R${np.median(acum_c5['base'])/1e6:>9.2f}M | "
          f"R${pat_med_solo/1e6:>7.2f}M |")

    print(f"  | {'Spending ano 1':<30} | R${sp_c5_y1:>9,.0f} | R${sp_c5_y1:>9,.0f} | "
          f"R${sp_c5_y1:>9,.0f} | R${sp_c4_y1:>9,.0f} | R${sp_solo_y1:>7,.0f} |")

    print(f"  | {'SWR ano 1':<30} | {sp_c5_y1/np.median(acum_c5['base'])*100:>11.2f}% | "
          f"{sp_c5_y1/np.median(acum_c5['favoravel'])*100:>11.2f}% | "
          f"{sp_c5_y1/np.median(acum_c5['stress'])*100:>11.2f}% | "
          f"{sp_c4_y1/np.median(acum_c5['base'])*100:>11.2f}% | "
          f"{swr_solo*100:>9.2f}% |")

    print(f"  | {'P(sucesso) c/ guardrails':<30} | {results_c5['base']:>11.1%} | "
          f"{results_c5['favoravel']:>11.1%} | "
          f"{results_c5['stress']:>11.1%} | "
          f"{results_c4['base']:>11.1%} | "
          f"{sr_solo:>9.1%} |")

    print(f"  | {'Delta vs solo':<30} | "
          f"{(results_c5['base']-sr_solo)*100:>+11.1f}pp | "
          f"{(results_c5['favoravel']-sr_solo)*100:>+11.1f}pp | "
          f"{(results_c5['stress']-sr_solo)*100:>+11.1f}pp | "
          f"{(results_c4['base']-sr_solo)*100:>+11.1f}pp | "
          f"{'ref':>10} |")

    print(f"  | {'Delta C5 vs C4':<30} | "
          f"{(results_c5['base']-results_c4['base'])*100:>+11.1f}pp | "
          f"{(results_c5['favoravel']-results_c4['favoravel'])*100:>+11.1f}pp | "
          f"{(results_c5['stress']-results_c4['stress'])*100:>+11.1f}pp | "
          f"{'ref':>12} | "
          f"{'':>10} |")

    print(f"  +{'='*100}+")

    # Impact decomposition
    delta_ls_gogo = 290_000 - 250_000
    delta_ls_slowgo = 230_000 - 198_000
    delta_ls_nogo = 200_000 - 172_000

    print(f"""
  IMPACTO DO CORTE DE LIFESTYLE:
  - Go-Go:   R$290k -> R$250k  (-R${delta_ls_gogo:,}/ano, anos 1-10)
  - Slow-Go: R$230k -> R$198k  (-R${delta_ls_slowgo:,}/ano, anos 11-20)
  - No-Go:   R$200k -> R$172k  (-R${delta_ls_nogo:,}/ano, anos 21-40)

  Spending ano 1: C5 R${sp_c5_y1:,.0f} vs C4 R${sp_c4_y1:,.0f} = R${sp_c5_y1-sp_c4_y1:+,.0f}
  SWR: C5 {sp_c5_y1/np.median(acum_c5['base'])*100:.2f}% vs C4 {sp_c4_y1/np.median(acum_c5['base'])*100:.2f}%

  P(sucesso) base: C5 {results_c5['base']:.1%} vs C4 {results_c4['base']:.1%} = {(results_c5['base']-results_c4['base'])*100:+.1f}pp
  P(sucesso) fav:  C5 {results_c5['favoravel']:.1%} vs C4 {results_c4['favoravel']:.1%} = {(results_c5['favoravel']-results_c4['favoravel'])*100:+.1f}pp

  Sensitividade: cada R$1k/ano de lifestyle cortado = ~{(results_c5['base']-results_c4['base'])*100/40:.2f}pp de P(sucesso)
""")

    # Full progression table
    print("=" * 120)
    print("PROGRESSAO COMPLETA — TODOS OS CENARIOS CASAL (base, com guardrails)")
    print("=" * 120)
    print(f"""
  +{'='*90}+
  | {'Cenario':<25} | {'FIRE':>5} | {'Pat Med':>10} | {'Spending Y1':>12} | {'SWR':>7} | {'P(suc)':>8} | {'vs Solo':>10} |
  +{'-'*90}+""")

    progression = [
        ("Original (FIRE 50)", 50, 9_040_542, 503_775, 35.6),
        ("C1 (FIRE 53)", 53, 10_999_950, 515_827, 47.5),
        ("C3 (FIRE 55)", 55, 13_589_286, 502_278, 59.9),
        ("C4 (casa R$1M)", 55, np.median(acum_c5['base']), sp_c4_y1, results_c4['base'] * 100),
        ("C5 (lifestyle -14%)", 55, np.median(acum_c5['base']), sp_c5_y1, results_c5['base'] * 100),
        ("Solo baseline", 50, pat_med_solo, sp_solo_y1, sr_solo * 100),
    ]

    for name, fire_age, pat, sp, p_suc in progression:
        swr = sp / pat * 100
        delta = p_suc - sr_solo * 100
        delta_str = f"{delta:+.1f}pp" if name != "Solo baseline" else "ref"
        print(f"  | {name:<25} | {fire_age:>5} | R${pat/1e6:>7.2f}M | R${sp:>10,.0f} | {swr:>6.2f}% | {p_suc:>7.1f}% | {delta_str:>10} |")

    print(f"  +{'='*90}+")

    print(f"""
  Target aprovado (carteira.md): pat >= R$13.4M E SWR <= 2.4% -> P ~87%
  C5 base: pat R${np.median(acum_c5['base'])/1e6:.2f}M (OK) | SWR {sp_c5_y1/np.median(acum_c5['base'])*100:.2f}% (acima do target)
""")

    print("=" * 120)
    print(f"Script: dados/monte_carlo_casal_katia.py")
    print(f"Seeds: 42 (acum) + 200 (decum) | N={N_SIM:,} | t-dist df={DF_T}")
    print("=" * 120)


if __name__ == "__main__":
    main()       # Original: FIRE 50 casal (base/fav/stress)
    main_v2()    # C1 (FIRE 53) e C2 (escalonado 50/53)
    main_v3()    # C3 (FIRE 55) vs C1 (FIRE 53)
    main_v4()    # C4 (FIRE 55 casa R$1M) vs C3 vs Solo
    main_v5()    # C5 (lifestyle reduzido) vs C4 vs Solo
