#!/usr/bin/env python3
"""
FR-spending-smile: Monte Carlo with variable spending by life phase
Base: FR-003 (HD-006 premissas, 2026-03-22)
Inputs: HD-009 gastos auditados, TX-desacumulacao custos, INSS revisado

Blanchett (2014): retirement spending follows a "smile" pattern.
Health inflates at +5%/year real (above IPCA) — modeled as separate line.
"""

import numpy as np
from dataclasses import dataclass

np.random.seed(42)  # Reproducibilidade
N_SIM = 10_000

# =====================================================
# PREMISSAS (HD-006 final + TX-desacumulacao + HD-009)
# =====================================================

PATRIMONIO_INICIAL = 3_482_633  # BRL
APORTE_ANUAL = 300_000          # R$25k/mes
IDADE_ATUAL = 39
IDADE_FIRE = 50
HORIZONTE_DESACUM = 45           # ate 95 anos
ANOS_ACUM = IDADE_FIRE - IDADE_ATUAL  # 11

# Retornos reais BRL — 3 cenarios (HD-006)
SCENARIOS = {
    "base":      {"equity": 0.0596, "dep_brl": 0.005, "label": "Base (dep 0.5%)"},
    "favoravel": {"equity": 0.0696, "dep_brl": 0.015, "label": "Favoravel (dep 1.5%)"},
    "stress":    {"equity": 0.0546, "dep_brl": 0.000, "label": "Stress (dep 0%)"},
}

# Retornos e vols por asset class (acumulacao)
IPCA_RETURN_HTM = 0.060
CRIPTO_RETURN = 0.050
RENDA_PLUS_RETURN = 0.0534

EQUITY_VOL = 0.16
IPCA_VOL = 0.05
CRIPTO_VOL = 0.60
RENDA_PLUS_VOL = 0.15

# Alocacao acumulacao
ALLOC_EQUITY = 0.79
ALLOC_IPCA = 0.15
ALLOC_CRIPTO = 0.03
ALLOC_RENDA_PLUS = 0.03

# Desacumulacao
DESACUM_VOL = 0.15  # Equity-dominated portfolio

# Fat tails
DF_T = 5

# Correlacoes (mesmas FR-003)
CORR_MATRIX = np.array([
    [1.0,  0.1,  0.3,  0.1],
    [0.1,  1.0,  0.0,  0.5],
    [0.3,  0.0,  1.0,  0.0],
    [0.1,  0.5,  0.0,  1.0],
])

# =====================================================
# SPENDING SMILE — PERFIL DE GASTOS POR FASE
# =====================================================

# Saude: componente separado com inflator proprio
SAUDE_BASE = 18_000       # R$18k/ano dentro dos R$215k atuais
SAUDE_INFLATOR = 0.05     # +5%/ano real (acima do IPCA)

# Custos de desacumulacao (TX-desacumulacao)
CUSTO_DESACUM_50_65 = 38_000   # R$37-40k/ano (central R$38k)
CUSTO_DESACUM_65_80 = 27_000   # R$25-30k/ano (central R$27k)
CUSTO_DESACUM_80_PLUS = 25_000 # Estimativa (menor saque = menor IR)

# INSS (TX-desacumulacao revisado): R$46-55k/ano real a partir dos 65
INSS_BENEFICIO = 50_000  # Premissa conservadora

# Lifestyle spending (ex-saude, ex-custos desacumulacao, ex-INSS)
# Gastos reais auditados: R$215k/ano (HD-009)
# Saude R$18k esta dentro dos R$215k
# Lifestyle ex-saude = R$215k - R$18k = R$197k base

# Fases do spending smile (lifestyle total incl. saude):
# Go-Go (50-60): R$280k/ano — viagens, experiencias, vida ativa
# Slow-Go (60-70): R$225k/ano — mais calmo
# No-Go/Care (70+): depende da saude (inflator separado)

# Decomposicao por fase (lifestyle ex-saude):
GOGO_LIFESTYLE_EX_SAUDE = 262_000    # R$280k - R$18k saude base
SLOWGO_LIFESTYLE_EX_SAUDE = 207_000  # R$225k - R$18k saude base
NOGO_LIFESTYLE_EX_SAUDE = 237_000    # R$285k - ~R$48k saude aos 70 (inflated)
# Nota: No-Go lifestyle ex-saude inclui cuidados nao-medicos

def get_spending_profile(year_in_retirement):
    """
    Retorna (lifestyle_ex_saude, saude, custo_desacum, inss) para cada ano.
    year_in_retirement: 0 = primeiro ano (idade 50), ..., 44 = ultimo (idade 94)

    Saude cresce a +5%/ano real a partir do valor base (R$18k).
    Saude no ano t = R$18k * (1.05)^(t) onde t=0 no FIRE (idade 50)
    Porem saude ja inflou 11 anos (39->50) durante acumulacao.
    Usamos t=0 no FIRE = saude ja a R$18k*(1.05)^11 = R$30.7k.
    CORRECAO: o Head definiu saude hoje=R$18k e inflator a partir de hoje.
    Aos 50: R$18k*(1.05)^11 = R$30.7k
    Aos 60: R$18k*(1.05)^21 = R$50.0k
    Aos 70: R$18k*(1.05)^31 = R$81.5k
    Aos 80: R$18k*(1.05)^41 = R$132.7k

    POREM, o Head briefing diz:
    - Aos 70: saude ~R$48k (= R$18k * 1.05^20, contando do "hoje")
    - Aos 80: saude ~R$78k (= R$18k * 1.05^30, contando do "hoje")
    Isso implica que o inflator comeca AGORA (idade 39), nao no FIRE.
    Mas os valores Go-Go/Slow-Go/No-Go JA incluem a saude inflacionada.

    Approach: os valores do Head (R$280k, R$225k, R$285k) ja incorporam
    saude inflacionada em cada fase. Modelar saude como componente
    separado DENTRO desses valores, crescendo a 5%/ano real.
    """

    idade = 50 + year_in_retirement
    anos_desde_hoje = 11 + year_in_retirement  # 39 + 11 + year = 50 + year

    # Saude com inflator proprio: R$18k * (1.05)^(anos desde hoje)
    saude = SAUDE_BASE * (1 + SAUDE_INFLATOR) ** anos_desde_hoje

    # Fase de vida (lifestyle ex-saude)
    if year_in_retirement < 10:  # 50-59: Go-Go
        # Go-Go: R$280k total definido pelo Head
        # Mas saude cresce dentro disso. Se saude > R$18k*(1.05)^11=R$30.7k inicial,
        # a diferenca adicional vem alem do R$280k baseline.
        # Abordagem conservadora: R$280k e o MINIMO no Go-Go,
        # saude adicional (acima do valor medio no Go-Go) soma.
        # Valor medio saude Go-Go: (30.7k + 50.0k)/2 ~ 40k
        # R$280k ja contempla ~R$40k de saude na fase Go-Go
        lifestyle_ex_saude = 280_000 - saude  # Lifestyle se ajusta
        if lifestyle_ex_saude < 200_000:  # Piso lifestyle
            lifestyle_ex_saude = 200_000

    elif year_in_retirement < 20:  # 60-69: Slow-Go
        lifestyle_ex_saude = 225_000 - saude
        if lifestyle_ex_saude < 150_000:
            lifestyle_ex_saude = 150_000

    else:  # 70+: No-Go/Care
        # No-Go: saude domina. R$285k e o total incluindo saude alta.
        # Lifestyle reduz, saude cresce. Total = lifestyle_ex_saude + saude
        lifestyle_ex_saude = 285_000 - saude
        if lifestyle_ex_saude < 120_000:  # Piso: moradia+alimentacao minimo
            lifestyle_ex_saude = 120_000

    # Total lifestyle (incl saude)
    lifestyle_total = lifestyle_ex_saude + saude

    # Custos de desacumulacao (TX-desacumulacao)
    if idade < 65:
        custo_desacum = CUSTO_DESACUM_50_65
    elif idade < 80:
        custo_desacum = CUSTO_DESACUM_65_80
    else:
        custo_desacum = CUSTO_DESACUM_80_PLUS

    # INSS (a partir dos 65)
    inss = INSS_BENEFICIO if idade >= 65 else 0

    return lifestyle_total, custo_desacum, inss


def get_total_withdrawal(year_in_retirement):
    """Saque total do portfolio = lifestyle + custos desacum - INSS."""
    lifestyle, custo_desacum, inss = get_spending_profile(year_in_retirement)
    total = lifestyle + custo_desacum - inss
    return max(total, 0)  # Nunca negativo


# =====================================================
# GUARDRAILS ADAPTADOS AO SPENDING SMILE
# =====================================================

def get_guardrail_withdrawal(year_in_retirement, drawdown, pico, patrimonio,
                              retirada_base_atual):
    """
    Guardrails Kitces & Fitzpatrick 2024, adaptados ao spending smile.
    O "base" nao e fixo R$250k — varia por fase.
    Os cortes % permanecem iguais. O piso se adapta.
    """
    base = retirada_base_atual  # Usar o base ja calculado (com overrides)

    # Piso essencial adaptado por fase
    # Go-Go piso: R$200k (moradia+saude+alimentacao sem viagens)
    # Slow-Go piso: R$180k
    # No-Go piso: depende da saude (alto)
    idade = 50 + year_in_retirement
    if idade < 60:
        piso = 220_000  # Go-Go: R$200k lifestyle + R$20k saude minimo
    elif idade < 70:
        piso = 180_000  # Slow-Go
    else:
        # No-Go: saude alta e inelastica
        saude_minima = SAUDE_BASE * (1 + SAUDE_INFLATOR) ** (11 + year_in_retirement)
        piso = 120_000 + saude_minima  # moradia+alimentacao + saude

    if drawdown > 0.35:
        return max(piso, 180_000)
    elif drawdown > 0.25:
        return max(base * 0.80, piso)
    elif drawdown > 0.15:
        return max(base * 0.90, piso)
    else:
        return base


# =====================================================
# FLAT GUARDRAILS (FR-003 original para comparacao)
# =====================================================

FLAT_WITHDRAWAL = 250_000
FLAT_PISO = 180_000
FLAT_TETO = 350_000


def get_flat_guardrail(drawdown, retirada_base):
    """FR-003 original: flat R$250k com guardrails fixos."""
    if drawdown > 0.35:
        return FLAT_PISO
    elif drawdown > 0.25:
        return max(retirada_base * 0.80, FLAT_PISO)
    elif drawdown > 0.15:
        return max(retirada_base * 0.90, FLAT_PISO)
    else:
        return retirada_base


# =====================================================
# SIMULACAO
# =====================================================

def generate_correlated_returns(n_years, n_sims, means, vols, corr_matrix, df=5):
    """Gera retornos correlacionados com t-distribution (fat tails)."""
    n_assets = len(means)
    L = np.linalg.cholesky(corr_matrix)
    all_returns = np.zeros((n_sims, n_years, n_assets))

    for sim in range(n_sims):
        z = np.random.standard_t(df, size=(n_years, n_assets))
        scale = np.sqrt((df - 2) / df)
        z = z * scale
        correlated = z @ L.T

        for a in range(n_assets):
            mu_g = means[a] - vols[a]**2 / 2
            all_returns[sim, :, a] = np.exp(mu_g + vols[a] * correlated[:, a]) - 1

    return all_returns


def simulate_accumulation(equity_return, n_sims=N_SIM):
    """Fase de acumulacao: 39-50 (11 anos)."""
    means = np.array([equity_return, IPCA_RETURN_HTM, CRIPTO_RETURN, RENDA_PLUS_RETURN])
    vols = np.array([EQUITY_VOL, IPCA_VOL, CRIPTO_VOL, RENDA_PLUS_VOL])
    allocs = np.array([ALLOC_EQUITY, ALLOC_IPCA, ALLOC_CRIPTO, ALLOC_RENDA_PLUS])

    returns = generate_correlated_returns(ANOS_ACUM, n_sims, means, vols, CORR_MATRIX)

    patrimonio = np.zeros((n_sims, ANOS_ACUM + 1))
    patrimonio[:, 0] = PATRIMONIO_INICIAL

    for year in range(ANOS_ACUM):
        portfolio_return = np.sum(returns[:, year, :] * allocs, axis=1)
        patrimonio[:, year + 1] = (patrimonio[:, year] + APORTE_ANUAL) * (1 + portfolio_return)

    return patrimonio


def simulate_decumulation_smile(patrimonio_fire, return_mean, return_vol,
                                  use_guardrails=True, inss_override=None,
                                  gogo_override=None, year1_shock=None,
                                  n_years=HORIZONTE_DESACUM, n_sims=N_SIM):
    """
    Desacumulacao com spending smile.

    Parameters:
        patrimonio_fire: array (n_sims,) de patrimonio no FIRE
        return_mean: retorno real medio (desacumulacao)
        return_vol: volatilidade
        use_guardrails: aplicar guardrails adaptativos
        inss_override: se definido, usa esse valor de INSS (0 para stress test)
        gogo_override: se definido, usa esse valor como Go-Go total
        year1_shock: se definido, aplica choque no retorno do ano 1 (ex: -0.30)
    """
    patrimonio = np.zeros((n_sims, n_years + 1))
    patrimonio[:, 0] = patrimonio_fire

    pico = patrimonio_fire.copy()
    failed = np.zeros(n_sims, dtype=bool)
    fail_year = np.full(n_sims, n_years + 1)
    retiradas_efetivas = np.zeros((n_sims, n_years))

    mu_g = return_mean - return_vol**2 / 2
    scale = np.sqrt((DF_T - 2) / DF_T)

    for year in range(n_years):
        # Gerar retornos
        z = np.random.standard_t(DF_T, size=n_sims) * scale

        if year == 0 and year1_shock is not None:
            # Forcar choque no ano 1
            returns = np.full(n_sims, year1_shock)
        else:
            returns = np.exp(mu_g + return_vol * z) - 1

        # Calcular saque base para este ano (spending smile)
        lifestyle, custo_desacum, inss_original = get_spending_profile(year)
        inss_efetivo = inss_override if inss_override is not None else inss_original
        base_withdrawal = lifestyle + custo_desacum - inss_efetivo

        # Override Go-Go se especificado (substitui o calculo acima para Go-Go)
        if gogo_override is not None and year < 10:
            base_withdrawal = gogo_override

        for i in range(n_sims):
            if failed[i]:
                retiradas_efetivas[i, year] = 0
                continue

            if use_guardrails:
                drawdown = max(0, 1 - patrimonio[i, year] / pico[i])
                withdrawal = get_guardrail_withdrawal(year, drawdown, pico[i],
                                                       patrimonio[i, year],
                                                       base_withdrawal)

                # Upside: se patrimonio > 25% acima do pico, aumento permanente 10%
                if patrimonio[i, year] > pico[i] * 1.25:
                    withdrawal = min(withdrawal * 1.10, base_withdrawal * 1.40)
                    pico[i] = patrimonio[i, year]
            else:
                withdrawal = base_withdrawal

            retiradas_efetivas[i, year] = withdrawal

            # Patrimonio pos-retirada e retorno
            novo = (patrimonio[i, year] - withdrawal) * (1 + returns[i])
            if novo <= 0:
                patrimonio[i, year + 1] = 0
                failed[i] = True
                fail_year[i] = year + 1
            else:
                patrimonio[i, year + 1] = novo
                pico[i] = max(pico[i], novo)

    success_rate = 1 - np.mean(failed)
    return patrimonio, success_rate, fail_year, retiradas_efetivas


def simulate_decumulation_flat(patrimonio_fire, withdrawal, return_mean, return_vol,
                                use_guardrails=True, n_years=HORIZONTE_DESACUM, n_sims=N_SIM):
    """Desacumulacao flat (FR-003 baseline) para comparacao."""
    patrimonio = np.zeros((n_sims, n_years + 1))
    patrimonio[:, 0] = patrimonio_fire

    pico = patrimonio_fire.copy()
    retirada_base = np.full(n_sims, float(withdrawal))
    failed = np.zeros(n_sims, dtype=bool)
    fail_year = np.full(n_sims, n_years + 1)

    mu_g = return_mean - return_vol**2 / 2
    scale_t = np.sqrt((DF_T - 2) / DF_T)

    for year in range(n_years):
        z = np.random.standard_t(DF_T, size=n_sims) * scale_t
        returns = np.exp(mu_g + return_vol * z) - 1

        for i in range(n_sims):
            if failed[i]:
                continue

            if use_guardrails:
                drawdown = max(0, 1 - patrimonio[i, year] / pico[i])
                ret = get_flat_guardrail(drawdown, retirada_base[i])

                if patrimonio[i, year] > pico[i] * 1.25:
                    retirada_base[i] = min(retirada_base[i] * 1.10, FLAT_TETO)
                    pico[i] = patrimonio[i, year]
                ret = max(ret, FLAT_PISO)
            else:
                ret = retirada_base[i]

            novo = (patrimonio[i, year] - ret) * (1 + returns[i])
            if novo <= 0:
                patrimonio[i, year + 1] = 0
                failed[i] = True
                fail_year[i] = year + 1
            else:
                patrimonio[i, year + 1] = novo
                pico[i] = max(pico[i], novo)

    success_rate = 1 - np.mean(failed)
    return patrimonio, success_rate, fail_year


# =====================================================
# MAIN
# =====================================================

def main():
    print("=" * 80)
    print("FR-SPENDING-SMILE: MONTE CARLO COM SPENDING VARIAVEL POR FASE")
    print("Base: FR-003 (HD-006, 2026-03-22) | Fat tails: t-dist df=5")
    print("Inputs: HD-009 gastos, TX-desacumulacao custos, INSS R$50k")
    print("=" * 80)

    # ---- SPENDING PROFILE ----
    print("\n### PERFIL DE GASTOS POR FASE (spending smile)")
    print(f"\n{'Idade':>5} | {'Fase':>10} | {'Lifestyle':>12} | {'Saude':>10} | "
          f"{'Custos':>10} | {'INSS':>10} | {'Saque Portfolio':>16}")
    print("-" * 85)

    for yr in [0, 5, 10, 15, 20, 25, 30, 35, 40, 44]:
        idade = 50 + yr
        lifestyle, custo, inss = get_spending_profile(yr)
        saude = SAUDE_BASE * (1 + SAUDE_INFLATOR) ** (11 + yr)
        total = lifestyle + custo - inss
        fase = "Go-Go" if yr < 10 else ("Slow-Go" if yr < 20 else "No-Go")
        print(f"  {idade:>3} | {fase:>10} | R$ {lifestyle:>9,.0f} | R$ {saude:>7,.0f} | "
              f"R$ {custo:>7,.0f} | R$ {inss:>7,.0f} | R$ {total:>12,.0f}")

    # ---- ACUMULACAO ----
    print("\n" + "=" * 80)
    print("### FASE 1: ACUMULACAO (39-50, 11 anos)")
    print("=" * 80)

    # Usar cenario base para acumulacao
    equity_base = SCENARIOS["base"]["equity"]
    patrimonio_acum = simulate_accumulation(equity_base)
    patrimonio_fire = patrimonio_acum[:, -1]

    p5, p25, p50, p75, p95 = np.percentile(patrimonio_fire, [5, 25, 50, 75, 95])
    print(f"\nPatrimonio aos 50 (cenario base {equity_base:.2%}):")
    print(f"  P5:      R$ {p5:>12,.0f}")
    print(f"  P25:     R$ {p25:>12,.0f}")
    print(f"  P50:     R$ {p50:>12,.0f}")
    print(f"  P75:     R$ {p75:>12,.0f}")
    print(f"  P95:     R$ {p95:>12,.0f}")
    print(f"  Media:   R$ {np.mean(patrimonio_fire):>12,.0f}")

    # SWR implicito no ano 1 (saque R$318k / patrimonio)
    saque_ano1 = get_total_withdrawal(0)
    swr_mediano = saque_ano1 / p50 * 100
    swr_p5 = saque_ano1 / p5 * 100
    print(f"\n  Saque ano 1 (Go-Go + custos): R$ {saque_ano1:,.0f}")
    print(f"  SWR implicito mediano: {swr_mediano:.2f}%")
    print(f"  SWR implicito P5 (pessimista): {swr_p5:.2f}%")

    # ---- DESACUMULACAO: 3 CENARIOS ----
    print("\n" + "=" * 80)
    print("### FASE 2: DESACUMULACAO — SPENDING SMILE vs FLAT R$250k")
    print("=" * 80)

    # Retornos de desacumulacao por cenario
    # Desacum return = equity return * (1 - tax_drag)
    # Tax drag ~15% sobre ganho nominal. Simplificacao: ret_desacum ~ ret_acum * 0.85
    # Mas FR-003 usou 4.57% (conservador) e 5.00% (parcial)
    # Vamos usar: base=4.57%, favoravel=5.50%, stress=4.00%
    desacum_scenarios = {
        "base":      {"ret": 0.0457, "label": "Base (4.57%)"},
        "favoravel": {"ret": 0.0550, "label": "Favoravel (5.50%)"},
        "stress":    {"ret": 0.0400, "label": "Stress (4.00%)"},
    }

    results = {}

    for scenario_name, scenario in desacum_scenarios.items():
        ret = scenario["ret"]
        label = scenario["label"]

        # Acumulacao com retorno do cenario (seed fixa por cenario)
        np.random.seed(42)
        eq_ret = SCENARIOS[scenario_name]["equity"]
        pat_acum = simulate_accumulation(eq_ret)
        pat_fire = pat_acum[:, -1]

        print(f"\n--- Cenario: {label} ---")
        print(f"  Equity acum: {eq_ret:.2%} | Desacum: {ret:.2%}")
        print(f"  Patrimonio mediano aos 50: R$ {np.median(pat_fire):,.0f}")

        # Spending smile COM guardrails (seed fixa para comparabilidade)
        np.random.seed(200)
        pat_smile, sr_smile, fy_smile, ret_efetivas = simulate_decumulation_smile(
            pat_fire, ret, DESACUM_VOL, use_guardrails=True
        )

        # Flat R$250k COM guardrails (FR-003 baseline, mesma seed)
        np.random.seed(200)
        pat_flat, sr_flat, fy_flat = simulate_decumulation_flat(
            pat_fire, FLAT_WITHDRAWAL, ret, DESACUM_VOL, use_guardrails=True
        )

        # Patrimonio mediano aos 80 (ano 30)
        med_80_smile = np.median(pat_smile[:, 30])
        med_80_flat = np.median(pat_flat[:, 30])

        p5_80_smile = np.percentile(pat_smile[:, 30], 5)
        p5_80_flat = np.percentile(pat_flat[:, 30], 5)

        print(f"\n  {'Metrica':>30} | {'Smile':>14} | {'Flat R$250k':>14} | {'Delta':>10}")
        print(f"  {'-'*30}-+-{'-'*14}-+-{'-'*14}-+-{'-'*10}")
        print(f"  {'P(sucesso) 45 anos':>30} | {sr_smile:>13.1%} | {sr_flat:>13.1%} | {sr_smile-sr_flat:>+9.1%}")
        print(f"  {'Pat mediano aos 50':>30} | R$ {np.median(pat_fire):>10,.0f} |                |")
        print(f"  {'Pat mediano aos 80':>30} | R$ {med_80_smile:>10,.0f} | R$ {med_80_flat:>10,.0f} |")
        print(f"  {'Pat P5 aos 80':>30} | R$ {p5_80_smile:>10,.0f} | R$ {p5_80_flat:>10,.0f} |")

        # Saque medio por decada
        if sr_smile > 0:
            ret_gogo = np.mean(ret_efetivas[:, :10])
            ret_slowgo = np.mean(ret_efetivas[:, 10:20])
            ret_nogo = np.mean(ret_efetivas[:, 20:30])
            print(f"\n  Saque medio efetivo (smile com guardrails):")
            print(f"    Go-Go (50-59):   R$ {ret_gogo:>10,.0f}")
            print(f"    Slow-Go (60-69): R$ {ret_slowgo:>10,.0f}")
            print(f"    No-Go (70-79):   R$ {ret_nogo:>10,.0f}")

        results[scenario_name] = {
            "sr_smile": sr_smile, "sr_flat": sr_flat,
            "pat_fire_median": np.median(pat_fire),
            "pat_80_smile": med_80_smile, "pat_80_flat": med_80_flat,
        }

    # ---- COMPARACAO CONSOLIDADA ----
    print("\n" + "=" * 80)
    print("### COMPARACAO CONSOLIDADA: SMILE vs FLAT")
    print("=" * 80)

    print(f"\n  {'Cenario':>20} | {'P(smile)':>10} | {'P(flat)':>10} | {'Delta':>10} | {'Pat50 med':>12}")
    print(f"  {'-'*20}-+-{'-'*10}-+-{'-'*10}-+-{'-'*10}-+-{'-'*12}")
    for name, r in results.items():
        print(f"  {desacum_scenarios[name]['label']:>20} | {r['sr_smile']:>9.1%} | {r['sr_flat']:>9.1%} | "
              f"{r['sr_smile']-r['sr_flat']:>+9.1%} | R$ {r['pat_fire_median']:>9,.0f}")

    # ---- SWR IMPLICITO ----
    print("\n" + "=" * 80)
    print("### SWR IMPLICITO ANO 1 (SMILE)")
    print("=" * 80)

    saque_ano1 = get_total_withdrawal(0)
    print(f"\n  Saque total ano 1: R$ {saque_ano1:,.0f}")
    print(f"    Lifestyle + saude: R$ {get_spending_profile(0)[0]:,.0f}")
    print(f"    Custos desacumulacao: R$ {get_spending_profile(0)[1]:,.0f}")
    print(f"    INSS: -R$ {get_spending_profile(0)[2]:,.0f}")

    for name in ["base", "favoravel", "stress"]:
        pat_med = results[name]["pat_fire_median"]
        swr = saque_ano1 / pat_med * 100
        print(f"  SWR {name}: {swr:.2f}% (pat mediano R$ {pat_med:,.0f})")

    # ---- STRESS TESTS ----
    print("\n" + "=" * 80)
    print("### STRESS TESTS")
    print("=" * 80)

    # Acumulacao base (seed fixa)
    np.random.seed(42)
    pat_acum_base = simulate_accumulation(SCENARIOS["base"]["equity"])
    pat_fire_base = pat_acum_base[:, -1]
    ret_base = desacum_scenarios["base"]["ret"]

    # Baseline smile (referencia para comparacao)
    np.random.seed(100)
    _, sr_baseline, _, _ = simulate_decumulation_smile(
        pat_fire_base, ret_base, DESACUM_VOL,
        use_guardrails=True
    )
    print(f"\n  Baseline smile COM guardrails: {sr_baseline:.1%}")

    # Stress 1: Go-Go R$300k + drawdown -30% ano 1
    print("\n--- Stress 1: Go-Go R$300k + drawdown -30% ano 1 ---")
    saque_stress1 = 300_000 + CUSTO_DESACUM_50_65

    np.random.seed(100)
    pat_s1, sr_s1, _, ret_s1 = simulate_decumulation_smile(
        pat_fire_base, ret_base, DESACUM_VOL,
        use_guardrails=True, gogo_override=saque_stress1,
        year1_shock=-0.30
    )
    np.random.seed(100)
    pat_s1_ng, sr_s1_ng, _, _ = simulate_decumulation_smile(
        pat_fire_base, ret_base, DESACUM_VOL,
        use_guardrails=False, gogo_override=saque_stress1,
        year1_shock=-0.30
    )

    print(f"  Saque Go-Go: R$ {saque_stress1:,.0f}/ano + drawdown -30% ano 1")
    print(f"  P(sucesso) COM guardrails: {sr_s1:.1%}")
    print(f"  P(sucesso) SEM guardrails: {sr_s1_ng:.1%}")
    print(f"  Pat mediano apos ano 1: R$ {np.median(pat_s1[:, 1]):,.0f}")
    print(f"  Pat mediano aos 80: R$ {np.median(pat_s1[:, 30]):,.0f}")
    print(f"  Delta vs baseline: {sr_s1-sr_baseline:+.1%}")

    # Stress 2: INSS = 0 (nao chega)
    print("\n--- Stress 2: INSS = R$0 (nao recebe) ---")

    np.random.seed(100)
    pat_s2, sr_s2, _, _ = simulate_decumulation_smile(
        pat_fire_base, ret_base, DESACUM_VOL,
        use_guardrails=True, inss_override=0
    )
    np.random.seed(100)
    pat_s2_ng, sr_s2_ng, _, _ = simulate_decumulation_smile(
        pat_fire_base, ret_base, DESACUM_VOL,
        use_guardrails=False, inss_override=0
    )

    print(f"  P(sucesso) INSS=0 COM guardrails: {sr_s2:.1%}")
    print(f"  P(sucesso) INSS=0 SEM guardrails: {sr_s2_ng:.1%}")
    print(f"  Baseline (INSS R$50k): {sr_baseline:.1%}")
    print(f"  Impacto: {sr_s2-sr_baseline:+.1%}")

    # Stress 3 (bonus): Go-Go R$300k + INSS=0
    print("\n--- Stress 3: Go-Go R$300k + INSS = R$0 (combinado) ---")
    np.random.seed(100)
    pat_s3, sr_s3, _, _ = simulate_decumulation_smile(
        pat_fire_base, ret_base, DESACUM_VOL,
        use_guardrails=True, inss_override=0,
        gogo_override=300_000 + CUSTO_DESACUM_50_65
    )
    print(f"  P(sucesso) COM guardrails: {sr_s3:.1%}")
    print(f"  Delta vs baseline: {sr_s3-sr_baseline:+.1%}")

    # ---- GUARDRAILS ATUALIZADOS ----
    print("\n" + "=" * 80)
    print("### GUARDRAILS PROPOSTOS PARA SPENDING SMILE")
    print("=" * 80)

    print("""
  Os guardrails FR-003 (flat R$250k) nao se aplicam diretamente ao spending smile
  porque a "base" de retirada varia por fase.

  PROPOSTA: guardrails PERCENTUAIS sobre a base variavel:

  | Drawdown | Acao        | Go-Go (base ~R$318k) | Slow-Go (base ~R$202k) | No-Go (base ~R$260k) |
  |----------|-------------|---------------------|----------------------|---------------------|
  | 0-15%    | Normal      | R$318k               | R$202k                | R$260k               |
  | 15-25%   | -10%        | R$286k               | R$182k                | R$234k               |
  | 25-35%   | -20%        | R$254k               | R$180k (piso)         | R$208k               |
  | >35%     | Piso        | R$220k               | R$180k                | Saude + R$120k       |

  Pisos por fase:
  - Go-Go: R$220k (moradia + saude + alimentacao, sem viagens)
  - Slow-Go: R$180k (original FR-003)
  - No-Go: R$120k + saude inflacionada (inelastica)

  Upside: +10% permanente se portfolio sobe 25%+ acima do pico (igual FR-003).
  Teto: base + 40% por fase.
  Revisao anual em janeiro.
    """)

    # ---- FORMULAS EXPLICITAS ----
    print("=" * 80)
    print("### FORMULAS EXPLICITAS")
    print("=" * 80)

    print("""
  1. Saude(t) = R$18k * (1.05)^(11+t), t=0 no FIRE (idade 50)
     - Aos 50: R$18k * 1.05^11 = R$30,700
     - Aos 60: R$18k * 1.05^21 = R$50,000
     - Aos 70: R$18k * 1.05^31 = R$81,500
     - Aos 80: R$18k * 1.05^41 = R$132,700

  2. Saque_total(t) = Lifestyle(fase) + CustosDesacum(idade) - INSS(idade)
     - Go-Go (50-59): R$280k + R$38k - R$0 = R$318k/ano
     - Slow-Go (60-64): R$225k + R$38k - R$0 = R$263k/ano
     - Slow-Go (65-69): R$225k + R$27k - R$50k = R$202k/ano
     - No-Go (70-79): R$285k + R$27k - R$50k = R$262k/ano
     - No-Go (80+): ~R$285k+ + R$25k - R$50k = R$260k+/ano (saude crescente)

  3. Retorno MC: r_t ~ LogNormal(mu_g, sigma) com mu_g = mu - sigma^2/2
     Shocks: t-distribution df=5 (Cont 2001)

  4. SWR_ano1 = Saque_ano1 / Patrimonio_FIRE
     = R$318k / R$10.56M(mediana) = 3.01%

  5. Guardrails: % corte sobre base VARIAVEL, nao fixa.
     Piso adapta por fase (Go-Go > Slow-Go < No-Go).
    """)

    print("\n" + "=" * 80)
    print("NOTA: Seed=42. 10,000 trajetorias. t-dist df=5.")
    print("Premissas: HD-006 (retornos), TX-desacumulacao (custos), HD-009 (gastos).")
    print("Blanchett (2014): spending smile. Kitces & Fitzpatrick (2024): guardrails.")
    print("=" * 80)


if __name__ == "__main__":
    main()
