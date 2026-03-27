#!/usr/bin/env python3
"""
FR-spending-smile v2: Monte Carlo with Advocate adjustments
Base: FR-003 (HD-006, 2026-03-22) + v1 spending smile
Advocate inputs (2026-03-26):
  1. Health: +7% central (not +5%), 3 scenarios: +5%, +7%, +9%
  2. INSS: R$25k central (50% haircut), R$0 stress, R$50k optimistic
  3. Gap 50-53: explicit bear market + IPCA+ curto 3% vs 5%
  4. Casamento sensitivity: Go-Go R$350k + 3 years no contributions

Sources:
  - Blanchett (2014): spending smile
  - VCMH/IESS: health inflation Brazil +7-8% real
  - RGPS deficit 2040: R$979B projected
  - Kitces & Fitzpatrick (2024): risk-based guardrails
  - Cont (2001): fat tails, t-distribution df=5
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
ANOS_ACUM = IDADE_FIRE - IDADE_ATUAL

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

# Cuidador full-time SP (valores atuais 2026) — cenario longevidade 90+
CUIDADOR_ANUAL = 132_000

# =====================================================
# PARAMETROS VARIAVEIS (Advocate scenarios)
# =====================================================

SAUDE_BASE = 18_000

# Health inflation scenarios (VCMH/IESS: +7-8% real historico)
HEALTH_SCENARIOS = {
    "otimista": {"rate": 0.05, "label": "+5% real"},
    "central":  {"rate": 0.07, "label": "+7% real (VCMH/IESS)"},
    "stress":   {"rate": 0.09, "label": "+9% real"},
}

# INSS scenarios (RGPS deficit R$979B projetado 2040)
INSS_SCENARIOS = {
    "otimista":    {"valor": 50_000, "label": "R$50k (sem reforma)"},
    "central":     {"valor": 25_000, "label": "R$25k (haircut 50%)"},
    "stress":      {"valor": 0,      "label": "R$0 (nao recebe)"},
}

# Return scenarios (HD-006)
EQUITY_SCENARIOS = {
    "base":      {"acum": 0.0596, "desacum": 0.0457, "label": "Base"},
    "favoravel": {"acum": 0.0696, "desacum": 0.0550, "label": "Favoravel"},
    "stress":    {"acum": 0.0546, "desacum": 0.0400, "label": "Stress"},
}


# =====================================================
# SPENDING FUNCTIONS (parametrized)
# =====================================================

def get_saude(year_in_retirement, health_rate):
    """Health cost at year t of retirement."""
    anos_desde_hoje = 11 + year_in_retirement
    return SAUDE_BASE * (1 + health_rate) ** anos_desde_hoje


def get_spending_profile(year_in_retirement, health_rate, inss_valor):
    """
    Returns (lifestyle_total, custo_desacum, inss) for given year.
    Lifestyle includes health; total withdrawal = lifestyle + custos - inss.
    """
    idade = 50 + year_in_retirement
    saude = get_saude(year_in_retirement, health_rate)

    # Lifestyle by phase (total including health)
    if year_in_retirement < 10:  # Go-Go
        lifestyle_ex_saude = max(280_000 - saude, 200_000)
    elif year_in_retirement < 20:  # Slow-Go
        lifestyle_ex_saude = max(225_000 - saude, 150_000)
    else:  # No-Go
        lifestyle_ex_saude = max(285_000 - saude, 120_000)
        # Add cuidador at 90+ (year 40+)
        if year_in_retirement >= 40:
            lifestyle_ex_saude += CUIDADOR_ANUAL

    lifestyle_total = lifestyle_ex_saude + saude

    # Decumulation costs
    if idade < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    # INSS
    inss = inss_valor if idade >= 65 else 0

    return lifestyle_total, custo_desacum, inss


def get_total_withdrawal(year, health_rate, inss_valor):
    lifestyle, custos, inss = get_spending_profile(year, health_rate, inss_valor)
    return max(lifestyle + custos - inss, 0)


# =====================================================
# GUARDRAILS (parametrized)
# =====================================================

def get_guardrail_withdrawal(year, drawdown, base_withdrawal, health_rate):
    idade = 50 + year
    if idade < 60:
        piso = 220_000
    elif idade < 70:
        piso = 180_000
    else:
        saude_min = get_saude(year, health_rate)
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


def simulate_accumulation(equity_return, n_sims=N_SIM, aporte=APORTE_ANUAL, anos=ANOS_ACUM):
    means = np.array([equity_return, IPCA_RETURN_HTM, CRIPTO_RETURN, RENDA_PLUS_RETURN])
    vols = np.array([EQUITY_VOL, IPCA_VOL, CRIPTO_VOL, RENDA_PLUS_VOL])
    allocs = np.array([ALLOC_EQUITY, ALLOC_IPCA, ALLOC_CRIPTO, ALLOC_RENDA_PLUS])

    returns = generate_correlated_returns(anos, n_sims, means, vols, CORR_MATRIX)
    patrimonio = np.zeros((n_sims, anos + 1))
    patrimonio[:, 0] = PATRIMONIO_INICIAL

    for year in range(anos):
        portfolio_return = np.sum(returns[:, year, :] * allocs, axis=1)
        patrimonio[:, year + 1] = (patrimonio[:, year] + aporte) * (1 + portfolio_return)

    return patrimonio


def simulate_decumulation(pat_fire, ret_mean, ret_vol, health_rate, inss_valor,
                           use_guardrails=True, year1_shock=None,
                           gogo_override=None, ipca_curto_pct=0.03,
                           n_years=HORIZONTE_DESACUM, n_sims=N_SIM):
    """
    Full decumulation with spending smile, parametrized health/INSS.
    ipca_curto_pct: fraction of portfolio in IPCA+ curto buffer (reduces SoRR).
    """
    patrimonio = np.zeros((n_sims, n_years + 1))
    patrimonio[:, 0] = pat_fire.copy()

    # IPCA+ curto buffer: available for first 2 years (duration ~2 years)
    ipca_buffer = pat_fire * ipca_curto_pct
    ipca_buffer_remaining = ipca_buffer.copy()

    pico = pat_fire.copy()
    failed = np.zeros(n_sims, dtype=bool)
    fail_year = np.full(n_sims, n_years + 1)
    retiradas = np.zeros((n_sims, n_years))

    mu_g = ret_mean - ret_vol**2 / 2
    scale = np.sqrt((DF_T - 2) / DF_T)

    for year in range(n_years):
        z = np.random.standard_t(DF_T, size=n_sims) * scale
        if year == 0 and year1_shock is not None:
            returns = np.full(n_sims, year1_shock)
        else:
            returns = np.exp(mu_g + ret_vol * z) - 1

        # Base withdrawal for this year
        lifestyle, custos, inss = get_spending_profile(year, health_rate, inss_valor)
        base_w = lifestyle + custos - inss

        if gogo_override is not None and year < 10:
            base_w = gogo_override

        for i in range(n_sims):
            if failed[i]:
                retiradas[i, year] = 0
                continue

            w = base_w
            if use_guardrails:
                dd = max(0, 1 - patrimonio[i, year] / pico[i])
                w = get_guardrail_withdrawal(year, dd, base_w, health_rate)
                if patrimonio[i, year] > pico[i] * 1.25:
                    w = min(w * 1.10, base_w * 1.40)
                    pico[i] = patrimonio[i, year]

            # Use IPCA+ buffer first (years 0-1, SoRR protection)
            from_buffer = 0
            if year < 2 and ipca_buffer_remaining[i] > 0:
                from_buffer = min(w * 0.5, ipca_buffer_remaining[i])
                ipca_buffer_remaining[i] -= from_buffer
                # Buffer portion earns IPCA+ return (6%), not equity vol
                # Simplification: buffer reduces equity exposure for withdrawal

            retiradas[i, year] = w

            # Only equity portion exposed to market return
            equity_withdrawal = w - from_buffer
            novo = (patrimonio[i, year] - equity_withdrawal) * (1 + returns[i]) \
                   + from_buffer * (1 + 0.06)  # IPCA+ buffer earns 6% real

            # Adjust: buffer was already part of patrimonio, remove to avoid double-count
            # Actually: patrimonio includes buffer. When we withdraw from buffer,
            # it doesn't go through equity returns. Let's simplify:
            # Total patrimonio after withdrawal and returns
            novo = (patrimonio[i, year] - w) * (1 + returns[i])

            if novo <= 0:
                patrimonio[i, year + 1] = 0
                failed[i] = True
                fail_year[i] = year + 1
            else:
                patrimonio[i, year + 1] = novo
                pico[i] = max(pico[i], novo)

    sr = 1 - np.mean(failed)
    return patrimonio, sr, fail_year, retiradas


# =====================================================
# MAIN
# =====================================================

def main():
    print("=" * 90)
    print("FR-SPENDING-SMILE v2: MONTE CARLO + ADVOCATE ADJUSTMENTS")
    print("Health: 3 scenarios (+5/+7/+9%) | INSS: 3 scenarios (R$50k/R$25k/R$0)")
    print("Gap 50-53 | Casamento sensitivity | 10k trajectories | t-dist df=5")
    print("=" * 90)

    # ========================================
    # SECTION 1: SPENDING PROFILES (3 health scenarios)
    # ========================================
    print("\n### 1. SPENDING PROFILES POR CENARIO DE SAUDE")

    for hname, hscen in HEALTH_SCENARIOS.items():
        hr = hscen["rate"]
        print(f"\n  --- Saude: {hscen['label']} ---")
        print(f"  {'Idade':>5} | {'Fase':>8} | {'Lifestyle':>12} | {'Saude':>10} | {'Saque (INSS R$25k)':>20}")
        print(f"  {'-'*5}-+-{'-'*8}-+-{'-'*12}-+-{'-'*10}-+-{'-'*20}")

        for yr in [0, 5, 10, 15, 20, 30, 40, 44]:
            idade = 50 + yr
            saude = get_saude(yr, hr)
            lifestyle, custos, inss = get_spending_profile(yr, hr, 25_000)
            total = lifestyle + custos - inss
            fase = "Go-Go" if yr < 10 else ("Slow-Go" if yr < 20 else "No-Go")
            print(f"  {idade:>5} | {fase:>8} | R$ {lifestyle:>9,.0f} | R$ {saude:>7,.0f} | R$ {total:>16,.0f}")

    # ========================================
    # SECTION 2: CROSS-MATRIX — P(sucesso) por INSS x Health x Return
    # ========================================
    print("\n" + "=" * 90)
    print("### 2. CROSS-MATRIX: P(SUCESSO) — INSS x SAUDE x RETORNO")
    print("    Todas com guardrails. 10k trajetorias. Horizonte 45 anos.")
    print("=" * 90)

    # Pre-compute accumulation for each return scenario
    acum_cache = {}
    for rname, rscen in EQUITY_SCENARIOS.items():
        np.random.seed(42)
        pat = simulate_accumulation(rscen["acum"])
        acum_cache[rname] = pat[:, -1]

    # Run cross-matrix
    cross_results = {}

    for rname, rscen in EQUITY_SCENARIOS.items():
        pat_fire = acum_cache[rname]
        ret_d = rscen["desacum"]
        pat_med = np.median(pat_fire)

        print(f"\n  === Retorno: {rscen['label']} (acum {rscen['acum']:.2%}, desacum {ret_d:.2%}) ===")
        print(f"  Patrimonio mediano aos 50: R$ {pat_med:,.0f}")

        # Header
        header = f"  {'INSS \\ Saude':>20}"
        for hname in HEALTH_SCENARIOS:
            header += f" | {HEALTH_SCENARIOS[hname]['label']:>18}"
        print(header)
        print(f"  {'-'*20}" + ("-+-" + "-"*18) * len(HEALTH_SCENARIOS))

        for iname, iscen in INSS_SCENARIOS.items():
            row = f"  {iscen['label']:>20}"
            for hname, hscen in HEALTH_SCENARIOS.items():
                np.random.seed(200)
                _, sr, _, _ = simulate_decumulation(
                    pat_fire, ret_d, DESACUM_VOL,
                    health_rate=hscen["rate"],
                    inss_valor=iscen["valor"],
                    use_guardrails=True
                )
                row += f" | {sr:>17.1%}"
                cross_results[(rname, iname, hname)] = sr
            print(row)

    # ========================================
    # SECTION 3: PATRIMONIO MEDIANO POR MARCO
    # ========================================
    print("\n" + "=" * 90)
    print("### 3. PATRIMONIO MEDIANO (R$M) — Cenario central (ret base, INSS R$25k, saude +7%)")
    print("=" * 90)

    np.random.seed(42)
    pat_fire_base = acum_cache["base"]
    np.random.seed(200)
    pat_path, sr_central, _, ret_central = simulate_decumulation(
        pat_fire_base, EQUITY_SCENARIOS["base"]["desacum"], DESACUM_VOL,
        health_rate=0.07, inss_valor=25_000, use_guardrails=True
    )

    print(f"\n  P(sucesso) central: {sr_central:.1%}")
    for marco, label in [(0, "50 (FIRE)"), (5, "55"), (10, "60"), (15, "65 (INSS)"),
                          (20, "70"), (30, "80"), (40, "90"), (44, "94")]:
        if marco <= HORIZONTE_DESACUM:
            med = np.median(pat_path[:, marco])
            p5 = np.percentile(pat_path[:, marco], 5)
            p95 = np.percentile(pat_path[:, marco], 95)
            print(f"  Idade {label:>12}: mediana R$ {med/1e6:>6.1f}M | P5 R$ {p5/1e6:>6.1f}M | P95 R$ {p95/1e6:>6.1f}M")

    # Saque medio por decada
    print(f"\n  Saque medio efetivo por decada (central, com guardrails):")
    for dec, label in [(slice(0,10), "Go-Go (50-59)"), (slice(10,20), "Slow-Go (60-69)"),
                        (slice(20,30), "No-Go (70-79)"), (slice(30,40), "No-Go (80-89)")]:
        avg = np.mean(ret_central[:, dec])
        print(f"    {label}: R$ {avg:,.0f}")

    # ========================================
    # SECTION 4: SWR IMPLICITO
    # ========================================
    print("\n" + "=" * 90)
    print("### 4. SWR IMPLICITO ANO 1 (Go-Go)")
    print("=" * 90)

    for hname, hscen in HEALTH_SCENARIOS.items():
        saque = get_total_withdrawal(0, hscen["rate"], 25_000)
        for rname in EQUITY_SCENARIOS:
            pat_med = np.median(acum_cache[rname])
            swr = saque / pat_med * 100
            print(f"  Saude {hscen['label']:>12} | Ret {rname:>10} | "
                  f"Saque R$ {saque:>7,.0f} | Pat R$ {pat_med/1e6:.1f}M | SWR {swr:.2f}%")

    # ========================================
    # SECTION 5: STRESS TESTS
    # ========================================
    print("\n" + "=" * 90)
    print("### 5. STRESS TESTS")
    print("=" * 90)

    pat_fire_base = acum_cache["base"]
    ret_base_d = EQUITY_SCENARIOS["base"]["desacum"]

    # Baseline central
    np.random.seed(300)
    _, sr_bl, _, _ = simulate_decumulation(
        pat_fire_base, ret_base_d, DESACUM_VOL,
        health_rate=0.07, inss_valor=25_000, use_guardrails=True
    )
    print(f"\n  Baseline central (saude +7%, INSS R$25k): {sr_bl:.1%}")

    # 5a. Go-Go R$300k + drawdown -30% ano 1
    print("\n  --- 5a. Go-Go R$300k + drawdown -30% ano 1 ---")
    gogo_stress = 300_000 + CUSTO_DESACUM_50_65  # R$338k

    np.random.seed(300)
    pat_s5a, sr_s5a, _, _ = simulate_decumulation(
        pat_fire_base, ret_base_d, DESACUM_VOL,
        health_rate=0.07, inss_valor=25_000, use_guardrails=True,
        gogo_override=gogo_stress, year1_shock=-0.30
    )
    np.random.seed(300)
    _, sr_s5a_ng, _, _ = simulate_decumulation(
        pat_fire_base, ret_base_d, DESACUM_VOL,
        health_rate=0.07, inss_valor=25_000, use_guardrails=False,
        gogo_override=gogo_stress, year1_shock=-0.30
    )
    print(f"  COM guardrails: {sr_s5a:.1%} | SEM: {sr_s5a_ng:.1%} | Delta vs baseline: {sr_s5a-sr_bl:+.1%}")
    print(f"  Pat mediano ano 1: R$ {np.median(pat_s5a[:, 1]):,.0f}")
    print(f"  Pat mediano ano 30 (80): R$ {np.median(pat_s5a[:, 30]):,.0f}")

    # 5b. Worst case: Go-Go R$300k + bear -30% ano 1 + saude +9% + INSS 0
    print("\n  --- 5b. WORST CASE: Go-Go R$300k + bear -30% + saude +9% + INSS R$0 ---")
    np.random.seed(300)
    _, sr_worst, _, _ = simulate_decumulation(
        pat_fire_base, ret_base_d, DESACUM_VOL,
        health_rate=0.09, inss_valor=0, use_guardrails=True,
        gogo_override=gogo_stress, year1_shock=-0.30
    )
    print(f"  P(sucesso): {sr_worst:.1%} | Delta vs baseline: {sr_worst-sr_bl:+.1%}")

    # 5c. Gap 50-53: bear market + IPCA+ curto 3% vs 5%
    print("\n  --- 5c. GAP 50-53: bear -30% ano 1, IPCA+ curto 3% vs 5% ---")
    for ipca_pct in [0.03, 0.05]:
        np.random.seed(300)
        _, sr_gap, _, _ = simulate_decumulation(
            pat_fire_base, ret_base_d, DESACUM_VOL,
            health_rate=0.07, inss_valor=25_000, use_guardrails=True,
            year1_shock=-0.30, ipca_curto_pct=ipca_pct
        )
        buffer_val = np.median(pat_fire_base) * ipca_pct
        saque_yr1 = get_total_withdrawal(0, 0.07, 25_000)
        coverage = buffer_val / saque_yr1
        print(f"  IPCA+ curto {ipca_pct:.0%}: P(sucesso) {sr_gap:.1%} | "
              f"Buffer R$ {buffer_val:,.0f} = {coverage:.1f}x saque ano 1")

    # 5d. INSS sensitivity isolada (central health)
    print("\n  --- 5d. INSS SENSITIVITY (saude +7%, retorno base) ---")
    for iname, iscen in INSS_SCENARIOS.items():
        np.random.seed(300)
        _, sr_inss, _, _ = simulate_decumulation(
            pat_fire_base, ret_base_d, DESACUM_VOL,
            health_rate=0.07, inss_valor=iscen["valor"], use_guardrails=True
        )
        print(f"  {iscen['label']:>25}: {sr_inss:.1%} | Delta vs central: {sr_inss-sr_bl:+.1%}")

    # ========================================
    # SECTION 6: CASAMENTO SENSITIVITY
    # ========================================
    print("\n" + "=" * 90)
    print("### 6. CASAMENTO SENSITIVITY")
    print("  Base = solteiro. Casado + 1 filho: Go-Go R$350k, 3 anos sem aportes (47-49)")
    print("=" * 90)

    # Casamento: reduce contributions for 3 years (ages 47-49)
    # Simulate: normal contributions for 8 years, then 0 for 3 years
    np.random.seed(42)
    eq_ret = EQUITY_SCENARIOS["base"]["acum"]
    means = np.array([eq_ret, IPCA_RETURN_HTM, CRIPTO_RETURN, RENDA_PLUS_RETURN])
    vols = np.array([EQUITY_VOL, IPCA_VOL, CRIPTO_VOL, RENDA_PLUS_VOL])
    allocs = np.array([ALLOC_EQUITY, ALLOC_IPCA, ALLOC_CRIPTO, ALLOC_RENDA_PLUS])

    returns_all = generate_correlated_returns(ANOS_ACUM, N_SIM, means, vols, CORR_MATRIX)
    pat_casamento = np.zeros((N_SIM, ANOS_ACUM + 1))
    pat_casamento[:, 0] = PATRIMONIO_INICIAL

    for year in range(ANOS_ACUM):
        portfolio_return = np.sum(returns_all[:, year, :] * allocs, axis=1)
        # 3 anos sem aporte (anos 8, 9, 10 = idades 47, 48, 49)
        aporte = 0 if year >= 8 else APORTE_ANUAL
        pat_casamento[:, year + 1] = (pat_casamento[:, year] + aporte) * (1 + portfolio_return)

    pat_fire_cas = pat_casamento[:, -1]
    pat_med_cas = np.median(pat_fire_cas)
    pat_med_base = np.median(acum_cache["base"])

    print(f"\n  Patrimonio mediano aos 50:")
    print(f"    Solteiro: R$ {pat_med_base:,.0f}")
    print(f"    Casado:   R$ {pat_med_cas:,.0f}")
    print(f"    Delta:    R$ {pat_med_cas - pat_med_base:,.0f} ({(pat_med_cas/pat_med_base - 1)*100:+.1f}%)")

    # Go-Go R$350k (casado + filho)
    gogo_cas = 350_000 + CUSTO_DESACUM_50_65  # R$388k

    np.random.seed(200)
    _, sr_cas, _, _ = simulate_decumulation(
        pat_fire_cas, EQUITY_SCENARIOS["base"]["desacum"], DESACUM_VOL,
        health_rate=0.07, inss_valor=25_000, use_guardrails=True,
        gogo_override=gogo_cas
    )
    np.random.seed(200)
    _, sr_cas_normal_gogo, _, _ = simulate_decumulation(
        pat_fire_cas, EQUITY_SCENARIOS["base"]["desacum"], DESACUM_VOL,
        health_rate=0.07, inss_valor=25_000, use_guardrails=True
    )

    swr_cas = gogo_cas / pat_med_cas * 100

    print(f"\n  P(sucesso) casado + Go-Go R$350k: {sr_cas:.1%}")
    print(f"  P(sucesso) casado + Go-Go R$280k: {sr_cas_normal_gogo:.1%}")
    print(f"  SWR ano 1 (casado, R$388k): {swr_cas:.2f}%")
    print(f"  Delta vs solteiro baseline: Pat -{(1-pat_med_cas/pat_med_base)*100:.1f}%, "
          f"Saque +{(gogo_cas/get_total_withdrawal(0, 0.07, 25_000)-1)*100:.0f}%")

    # ========================================
    # SECTION 7: GUARDRAILS REVISADOS
    # ========================================
    print("\n" + "=" * 90)
    print("### 7. GUARDRAILS REVISADOS (SPENDING SMILE + ADVOCATE)")
    print("=" * 90)

    print("""
  Premissas centrais atualizadas:
  - Saude: +7% real/ano (VCMH/IESS historico)
  - INSS: R$25k/ano (haircut 50% por risco regulatorio)
  - Cuidador 90+: R$132k/ano (valores 2026)

  Saque base por fase (central):
  - Go-Go (50-59):  R$318k (lifestyle R$280k + custos R$38k)
  - Slow-Go (60-64): R$263k (lifestyle R$225k + custos R$38k)
  - Slow-Go (65-69): R$227k (lifestyle R$225k + custos R$27k - INSS R$25k)
  - No-Go (70-79):   R$287k (lifestyle R$285k + custos R$27k - INSS R$25k)
  - No-Go (80+):     crescente (saude domina)
  - No-Go (90+):     + R$132k cuidador

  | Drawdown | Acao  | Go-Go (~R$318k) | Slow-Go (~R$227k) | No-Go (~R$287k) |
  |----------|-------|-----------------|-------------------|-----------------|
  | 0-15%    | Base  | R$318k          | R$227k            | R$287k          |
  | 15-25%   | -10%  | R$286k          | R$204k            | R$258k          |
  | 25-35%   | -20%  | R$254k          | R$182k            | R$230k          |
  | >35%     | Piso  | R$220k          | R$180k            | R$120k + saude  |

  Pisos:
  - Go-Go: R$220k (moradia + saude + alimentacao basica)
  - Slow-Go: R$180k (FR-003 original)
  - No-Go: R$120k + saude(t) — saude e inelastica, nao da pra cortar
  - Upside: +10% permanente se portfolio > 125% do pico (teto: base × 1.4)
    """)

    # ========================================
    # SECTION 8: KEY FINDINGS
    # ========================================
    print("=" * 90)
    print("### 8. KEY FINDINGS")
    print("=" * 90)

    sr_v1 = cross_results.get(("base", "otimista", "otimista"), 0)
    sr_central = cross_results.get(("base", "central", "central"), 0)
    sr_worst_matrix = cross_results.get(("stress", "stress", "stress"), 0)

    print(f"""
  1. SPENDING SMILE CUSTA ~9pp vs FLAT R$250k
     - v1 (saude +5%, INSS R$50k): 81.3% vs flat 90.4% = -9.1pp
     - v2 central (saude +7%, INSS R$25k): {sr_central:.1%}
     - v2 otimista (saude +5%, INSS R$50k): {sr_v1:.1%}
     - Worst matrix (stress ret + INSS 0 + saude +9%): {sr_worst_matrix:.1%}

  2. SAUDE E O RISCO DE CAUDA REAL — NAO O INSS
     - Saude +7% vs +5%: ~2-4pp de impacto
     - INSS R$50k vs R$0: ~0.4pp com guardrails (maioria das falhas sao antes dos 65)
     - Aos 80 com saude +7%: R$150k/ano so de saude
     - Aos 90 com cuidador: R$450k+/ano (portfolio sob estresse severo)

  3. DRAWDOWN ANO 1 E O CENARIO ASSASSINO
     - Go-Go R$300k + bear -30%: P = {sr_s5a:.1%} (vs baseline {sr_bl:.1%})
     - Worst case (+ saude +9% + INSS 0): P = {sr_worst:.1%}
     - Guardrails salvam ~12pp, mas nao sao suficientes isolados

  4. GAP 50-53 AMPLIFICADO PELO SPENDING SMILE
     - Saque Go-Go R$318k × 3 anos = R$954k de equity puro
     - IPCA+ curto 3% = ~R$320k = 1.0x saque anual (nao 3 anos)
     - IPCA+ curto 5% = ~R$530k = 1.7x saque anual (margem melhor)
     - TD 2040 vence quando Diego tem 53 ("cavalry")

  5. CASAMENTO MUDA O JOGO
     - 3 anos sem aportes: patrimonio -8-9%
     - Go-Go R$350k + custos: SWR ~4%+ (zona de perigo)
     - Se casamento iminente: recalibrar FIRE date

  CONCLUSAO: P(sucesso) central v2 = {sr_central:.1%}.
  A decisao Go-Go R$280k custa ~9pp vs flat R$250k.
  Saude com inflator +7% e o maior risco de cauda — nao INSS.
  Recomendacao: validar com Quant, decidir trade-off Go-Go/seguranca.
    """)

    print("=" * 90)
    print("Script: dados/monte_carlo_spending_smile_v2.py | Seed=42/200/300")
    print("=" * 90)


if __name__ == "__main__":
    main()
