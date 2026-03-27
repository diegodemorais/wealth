#!/usr/bin/env python3
"""
FR-spending-smile: Monte Carlo FIRE Age Sweep (50-60)
=====================================================

Premissas fixas (HD-006):
  - Patrimonio atual: R$3.482M. Aporte R$25k/mes (R$300k/ano).
  - Retorno real equity BRL base: 5.96%/ano
  - t-dist df=5, seed=42, 10k trajetorias
  - Spending smile cap/decay CORRIGIDO:
    SAUDE_BASE_FIRE(N) = R$18k * (1.07)^(N-39)
  - inflator: max(3%, 7% - 0.2%*t), t = anos desde FIRE
  - INSS central: R$25k/ano a partir dos 65
  - Custos desacumulacao: R$38k (50-65), R$27k (65-80), R$25k (80+)
  - Saque Go-Go: R$280k lifestyle + custos = R$318k/ano

Guardrails (FR-003):
  COM: 0-15% normal, 15-25% corte 10%, 25-35% corte 20%, >35% piso
       Upside: +25% acima pico -> +10% retirada (teto R$350k)
  SEM: saque fixo pelo spending smile

Formulas de patrimonio acumulado:
  P(N) = P0 * (1+r)^(N-39) + A * sum_{k=0}^{N-40} (1+r)^k
       = P0 * (1+r)^(N-39) + A * [(1+r)^(N-39) - 1] / r

  onde P0 = R$3,482,633, A = R$300,000/ano, r = 0.0596
"""

import numpy as np

np.random.seed(42)
N_SIM = 10_000

# =====================================================
# PREMISSAS FIXAS (HD-006)
# =====================================================

P0 = 3_482_633          # Patrimonio atual
APORTE_ANUAL = 300_000  # R$25k/mes
IDADE_ATUAL = 39
HORIZONTE_TOTAL = 95    # Idade maxima (horizonte)

# Returns
EQUITY_RETURN_ACUM = 0.0596   # Retorno real equity BRL base (acumulacao)
EQUITY_RETURN_DESACUM = 0.0457  # Retorno desacumulacao (HD-006)
EQUITY_VOL = 0.16
DESACUM_VOL = 0.15

# Multi-asset accumulation
IPCA_RETURN_HTM = 0.060
CRIPTO_RETURN = 0.050
RENDA_PLUS_RETURN = 0.0534

IPCA_VOL = 0.05
CRIPTO_VOL = 0.60
RENDA_PLUS_VOL = 0.15

ALLOC_EQUITY = 0.79
ALLOC_IPCA = 0.15
ALLOC_CRIPTO = 0.03
ALLOC_RENDA_PLUS = 0.03

DF_T = 5  # Degrees of freedom for t-distribution

CORR_MATRIX = np.array([
    [1.0,  0.1,  0.3,  0.1],
    [0.1,  1.0,  0.0,  0.5],
    [0.3,  0.0,  1.0,  0.0],
    [0.1,  0.5,  0.0,  1.0],
])

# INSS
INSS_ANUAL = 25_000  # Central, a partir dos 65

# Custos desacumulacao
CUSTO_50_65 = 38_000
CUSTO_65_80 = 27_000
CUSTO_80_PLUS = 25_000

# Saude base HOJE
SAUDE_BASE_HOJE = 18_000
VCMH = 0.07  # inflacao saude real/ano

# Go-Go lifestyle
GOGO_TOTAL = 280_000  # lifestyle total Go-Go (inclui saude)
SAQUE_GOGO_COM_CUSTOS = 318_000  # lifestyle + custos desacum


# =====================================================
# FORMULAS EXPLICITAS DE PATRIMONIO ACUMULADO
# =====================================================

def patrimonio_deterministico(idade_fire, r=EQUITY_RETURN_ACUM):
    """
    Formula de anuidade composta (crescimento + aportes):

    P(N) = P0 * (1+r)^n + A * [(1+r)^n - 1] / r

    onde n = idade_fire - 39 (anos de acumulacao)

    NOTA: Esta formula assume retorno constante r.
    O Monte Carlo usa retornos estocasticos (t-dist df=5).
    """
    n = idade_fire - IDADE_ATUAL
    growth_factor = (1 + r) ** n
    P = P0 * growth_factor + APORTE_ANUAL * (growth_factor - 1) / r
    return P


def saude_base_fire(idade_fire):
    """
    SAUDE_BASE_FIRE(N) = R$18k * (1.07)^(N-39)

    Saude compoe desde HOJE ate o FIRE.
    """
    anos = idade_fire - IDADE_ATUAL
    return SAUDE_BASE_HOJE * ((1 + VCMH) ** anos)


def inflator_capdecay(t):
    """max(3%, 7% - 0.2%*t), t = anos desde FIRE"""
    return max(0.03, 0.07 - 0.002 * t)


def saude_at_year(t, idade_fire):
    """
    Saude(t) = SAUDE_BASE_FIRE(N) * prod_{i=1}^{t} (1 + inflator(i))

    t = anos desde FIRE
    """
    base = saude_base_fire(idade_fire)
    if t == 0:
        return base
    val = base
    for i in range(1, t + 1):
        val *= (1 + inflator_capdecay(i))
    return val


# =====================================================
# SPENDING BY PHASE
# =====================================================

def get_spending(year_since_fire, idade_fire, with_smile=True):
    """
    Total withdrawal for year t since FIRE.

    Go-Go (fire to fire+9):  R$280k lifestyle
    Slow-Go (fire+10 to fire+19): R$225k lifestyle
    No-Go (fire+20+): R$285k lifestyle

    Total = lifestyle_ex_saude + saude(t) + custos - INSS
    """
    t = year_since_fire
    idade = idade_fire + t
    base_saude = saude_base_fire(idade_fire)

    if with_smile:
        saude = saude_at_year(t, idade_fire)
        if t < 10:  # Go-Go
            lifestyle_ex = GOGO_TOTAL - base_saude
        elif t < 20:  # Slow-Go
            lifestyle_ex = 225_000 - base_saude
        else:  # No-Go
            lifestyle_ex = 285_000 - base_saude
        total_lifestyle = lifestyle_ex + saude
    else:
        # SEM smile: saque fixo Go-Go = R$280k (flat, sem ajuste por fase)
        total_lifestyle = GOGO_TOTAL

    # Custos desacumulacao
    if idade < 65:
        custo = CUSTO_50_65
    elif idade < 80:
        custo = CUSTO_65_80
    else:
        custo = CUSTO_80_PLUS

    # INSS
    inss = INSS_ANUAL if idade >= 65 else 0

    total = total_lifestyle + custo - inss
    return max(total, 0)


# =====================================================
# GUARDRAILS
# =====================================================

def apply_guardrails(base_withdrawal, drawdown, year_since_fire, idade_fire):
    """
    FR-003 guardrails:
    - 0-15%: normal
    - 15-25%: corte 10%
    - 25-35%: corte 20%
    - >35%: piso por fase
    """
    t = year_since_fire
    idade = idade_fire + t

    # Pisos por fase
    if idade < 60:
        piso = 220_000  # Go-Go piso
    elif idade < 70:
        piso = 180_000  # Slow-Go piso
    else:
        saude_min = saude_at_year(t, idade_fire)
        piso = 150_000 + saude_min  # No-Go: R$150k + saude

    if drawdown > 0.35:
        return max(piso, base_withdrawal * 0.60)
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
    """Multi-asset correlated returns with t-distribution fat tails."""
    n_assets = len(means)
    L = np.linalg.cholesky(corr_matrix)
    all_returns = np.zeros((n_sims, n_years, n_assets))
    for sim in range(n_sims):
        z = np.random.standard_t(df, size=(n_years, n_assets))
        z = z * np.sqrt((df - 2) / df)
        correlated = z @ L.T
        for a in range(n_assets):
            mu_g = means[a] - vols[a] ** 2 / 2
            all_returns[sim, :, a] = np.exp(mu_g + vols[a] * correlated[:, a]) - 1
    return all_returns


def simulate_accumulation(n_years, n_sims=N_SIM):
    """
    Multi-asset accumulation with correlated returns.
    Returns array of terminal patrimony values.
    """
    means = np.array([EQUITY_RETURN_ACUM, IPCA_RETURN_HTM, CRIPTO_RETURN, RENDA_PLUS_RETURN])
    vols = np.array([EQUITY_VOL, IPCA_VOL, CRIPTO_VOL, RENDA_PLUS_VOL])
    allocs = np.array([ALLOC_EQUITY, ALLOC_IPCA, ALLOC_CRIPTO, ALLOC_RENDA_PLUS])

    returns = generate_correlated_returns(n_years, n_sims, means, vols, CORR_MATRIX, DF_T)
    patrimonio = np.zeros((n_sims, n_years + 1))
    patrimonio[:, 0] = P0

    for year in range(n_years):
        portfolio_return = np.sum(returns[:, year, :] * allocs, axis=1)
        patrimonio[:, year + 1] = (patrimonio[:, year] + APORTE_ANUAL) * (1 + portfolio_return)

    return patrimonio[:, -1]


def simulate_decumulation(pat_fire, idade_fire, use_guardrails=True,
                          year1_shock=None, n_sims=None):
    """
    Decumulation simulation from FIRE age to age 95.
    """
    n_years = HORIZONTE_TOTAL - idade_fire
    if n_sims is None:
        n_sims = len(pat_fire)

    patrimonio = np.zeros((n_sims, n_years + 1))
    patrimonio[:, 0] = pat_fire.copy()
    pico = pat_fire.copy()
    failed = np.zeros(n_sims, dtype=bool)

    ret_mean = EQUITY_RETURN_DESACUM
    ret_vol = DESACUM_VOL
    mu_g = ret_mean - ret_vol ** 2 / 2
    scale = np.sqrt((DF_T - 2) / DF_T)

    for year in range(n_years):
        z = np.random.standard_t(DF_T, size=n_sims) * scale
        if year == 0 and year1_shock is not None:
            returns = np.full(n_sims, year1_shock)
        else:
            returns = np.exp(mu_g + ret_vol * z) - 1

        for i in range(n_sims):
            if failed[i]:
                continue

            base_w = get_spending(year, idade_fire, with_smile=True)

            w = base_w
            if use_guardrails:
                dd = max(0, 1 - patrimonio[i, year] / pico[i])
                w = apply_guardrails(base_w, dd, year, idade_fire)
                # Upside rule: +25% above peak -> +10% withdrawal, capped at R$350k
                if patrimonio[i, year] > pico[i] * 1.25:
                    w = min(w * 1.10, 350_000)
                    pico[i] = patrimonio[i, year]
            # SEM guardrails: use base withdrawal as-is

            novo = (patrimonio[i, year] - w) * (1 + returns[i])

            if novo <= 0:
                patrimonio[i, year + 1] = 0
                failed[i] = True
            else:
                patrimonio[i, year + 1] = novo
                pico[i] = max(pico[i], novo)

    sr = 1 - np.mean(failed)
    return sr


# =====================================================
# MAIN
# =====================================================

def main():
    print("=" * 110)
    print("FR-SPENDING-SMILE: MONTE CARLO FIRE AGE SWEEP (50-60)")
    print("10k trajetorias | t-dist df=5 | seed=42 (acum) | Retorno base 5.96%")
    print("Spending smile cap/decay | SAUDE_BASE(N) = R$18k * (1.07)^(N-39)")
    print("=" * 110)

    # ========================================
    # FORMULAS EXPLICITAS DE PATRIMONIO
    # ========================================
    print("\n" + "-" * 110)
    print("FORMULAS DE PATRIMONIO ACUMULADO POR IDADE")
    print("-" * 110)
    print(f"""
  Formula deterministica:
    P(N) = P0 * (1+r)^n + A * [(1+r)^n - 1] / r
    onde:
      P0 = R${P0:,.0f} (patrimonio atual, idade 39)
      A  = R${APORTE_ANUAL:,.0f}/ano (R$25k/mes)
      r  = {EQUITY_RETURN_ACUM:.4f} (retorno real equity BRL base)
      n  = N - 39 (anos de acumulacao)

  Nota: O Monte Carlo usa retornos estocasticos (t-dist df=5, vol={EQUITY_VOL:.0%}).
        O deterministico serve como referencia/sanity check.
""")

    print(f"  {'Idade':>5} | {'n':>3} | {'(1+r)^n':>10} | {'P0*(1+r)^n':>14} | {'FV aportes':>14} | {'P(N) determ.':>14}")
    print(f"  {'-'*5}-+-{'-'*3}-+-{'-'*10}-+-{'-'*14}-+-{'-'*14}-+-{'-'*14}")

    for idade in range(50, 61):
        n = idade - IDADE_ATUAL
        gf = (1 + EQUITY_RETURN_ACUM) ** n
        p_growth = P0 * gf
        fv_aportes = APORTE_ANUAL * (gf - 1) / EQUITY_RETURN_ACUM
        p_total = p_growth + fv_aportes
        print(f"  {idade:>5} | {n:>3} | {gf:>10.5f} | R${p_growth/1e6:>10.3f}M | R${fv_aportes/1e6:>10.3f}M | R${p_total/1e6:>10.3f}M")

    # ========================================
    # SAUDE BASE POR IDADE DE FIRE
    # ========================================
    print("\n" + "-" * 110)
    print("SAUDE BASE NO FIRE POR IDADE DE APOSENTADORIA")
    print("  SAUDE_BASE(N) = R$18,000 * (1.07)^(N-39)")
    print("-" * 110)
    print(f"  {'Idade FIRE':>10} | {'Anos comp.':>10} | {'(1.07)^n':>10} | {'SAUDE_BASE':>12}")
    print(f"  {'-'*10}-+-{'-'*10}-+-{'-'*10}-+-{'-'*12}")
    for idade in range(50, 61):
        n = idade - IDADE_ATUAL
        factor = (1 + VCMH) ** n
        base = SAUDE_BASE_HOJE * factor
        print(f"  {idade:>10} | {n:>10} | {factor:>10.5f} | R${base:>9,.0f}")

    # ========================================
    # SIMULATE ACCUMULATION FOR EACH FIRE AGE
    # ========================================
    print("\n" + "-" * 110)
    print("SIMULANDO ACUMULACAO (10k trajetorias por idade)...")
    print("-" * 110)

    acum_results = {}
    for idade_fire in range(50, 61):
        n_years = idade_fire - IDADE_ATUAL
        np.random.seed(42)
        pat_array = simulate_accumulation(n_years)
        acum_results[idade_fire] = pat_array
        median_val = np.median(pat_array)
        p25 = np.percentile(pat_array, 25)
        p75 = np.percentile(pat_array, 75)
        det_val = patrimonio_deterministico(idade_fire)
        print(f"  FIRE {idade_fire}: MC mediana R${median_val/1e6:.3f}M "
              f"[P25 R${p25/1e6:.3f}M, P75 R${p75/1e6:.3f}M] "
              f"| Determ. R${det_val/1e6:.3f}M")

    # ========================================
    # TABELA PRINCIPAL: P(sucesso) COM e SEM guardrails
    # ========================================
    print("\n" + "=" * 110)
    print("TABELA PRINCIPAL: P(SUCESSO) POR IDADE DE FIRE")
    print("  Spending smile cap/decay | INSS R$25k/ano aos 65 | Horizonte: ate 95 anos")
    print("=" * 110)

    results_main = []

    for idade_fire in range(50, 61):
        pat = acum_results[idade_fire]
        median_pat = np.median(pat)
        # SWR = saque Go-Go ano 1 / patrimonio mediano
        saque_ano1 = get_spending(0, idade_fire, with_smile=True)
        swr = saque_ano1 / median_pat * 100

        # COM guardrails
        np.random.seed(200)
        sr_com = simulate_decumulation(pat, idade_fire, use_guardrails=True)

        # SEM guardrails
        np.random.seed(200)
        sr_sem = simulate_decumulation(pat, idade_fire, use_guardrails=False)

        delta = sr_com - sr_sem

        results_main.append({
            'idade': idade_fire,
            'anos_extra': idade_fire - 50,
            'pat_mediano': median_pat,
            'swr': swr,
            'sr_com': sr_com,
            'sr_sem': sr_sem,
            'delta': delta,
            'saque_ano1': saque_ano1,
        })

    print(f"\n  {'Idade':>5} | {'Anos':>4} | {'Pat mediano':>13} | {'Saque t=0':>11} | {'SWR':>6} | {'P COM guard':>11} | {'P SEM guard':>11} | {'Delta':>7}")
    print(f"  {'FIRE':>5} | {'extra':>4} | {'':>13} | {'':>11} | {'':>6} | {'':>11} | {'':>11} | {'':>7}")
    print(f"  {'-'*5}-+-{'-'*4}-+-{'-'*13}-+-{'-'*11}-+-{'-'*6}-+-{'-'*11}-+-{'-'*11}-+-{'-'*7}")

    for r in results_main:
        print(f"  {r['idade']:>5} | {r['anos_extra']:>4} | R${r['pat_mediano']/1e6:>8.3f}M | R${r['saque_ano1']/1e3:>7.0f}k | {r['swr']:>5.2f}% | {r['sr_com']:>10.1%} | {r['sr_sem']:>10.1%} | {r['delta']:>+6.1%}")

    # ========================================
    # TABELA STRESS: BEAR -30% ANO 1
    # ========================================
    print("\n" + "=" * 110)
    print("TABELA STRESS: BEAR -30% ANO 1")
    print("  Mesmo setup + forced -30% return no primeiro ano de FIRE")
    print("=" * 110)

    results_bear = []

    for idade_fire in range(50, 61):
        pat = acum_results[idade_fire]

        # COM guardrails + bear
        np.random.seed(200)
        sr_com_bear = simulate_decumulation(pat, idade_fire, use_guardrails=True, year1_shock=-0.30)

        # SEM guardrails + bear
        np.random.seed(200)
        sr_sem_bear = simulate_decumulation(pat, idade_fire, use_guardrails=False, year1_shock=-0.30)

        results_bear.append({
            'idade': idade_fire,
            'sr_com_bear': sr_com_bear,
            'sr_sem_bear': sr_sem_bear,
        })

    print(f"\n  {'Idade FIRE':>10} | {'P COM guard (bear)':>18} | {'P SEM guard (bear)':>18}")
    print(f"  {'-'*10}-+-{'-'*18}-+-{'-'*18}")
    for r in results_bear:
        print(f"  {r['idade']:>10} | {r['sr_com_bear']:>17.1%} | {r['sr_sem_bear']:>17.1%}")

    # ========================================
    # TABELA: CUSTO DE CADA ANO DE TRABALHO ADICIONAL
    # ========================================
    print("\n" + "=" * 110)
    print("TABELA: CUSTO DE CADA ANO DE TRABALHO ADICIONAL")
    print("  Delta P(sucesso) COM guardrails e equivalencia em reducao de Go-Go")
    print("=" * 110)

    print(f"\n  {'Ano extra':>9} | {'FIRE':>4} | {'DeltaP COM guard':>16} | {'DeltaP bear':>11} | {'Equiv. reducao Go-Go':>20}")
    print(f"  {'-'*9}-+-{'-'*4}-+-{'-'*16}-+-{'-'*11}-+-{'-'*20}")

    for i in range(1, len(results_main)):
        r_prev = results_main[i - 1]
        r_curr = results_main[i]
        delta_sr = r_curr['sr_com'] - r_prev['sr_com']

        # Bear delta
        b_prev = results_bear[i - 1]
        b_curr = results_bear[i]
        delta_bear = b_curr['sr_com_bear'] - b_prev['sr_com_bear']

        # Equivalencia: quanto teria que cortar o Go-Go para obter o mesmo P(sucesso)
        # sem trabalhar mais? Estimativa: cada R$10k de corte ~ +1pp
        # (aproximacao baseada em FR-003: R$250k=91%, R$350k=87% -> R$100k = ~4pp)
        # Mais preciso: pat extra * SWR ~ equivale a lifestyle reduction
        pat_extra = r_curr['pat_mediano'] - r_prev['pat_mediano']
        equiv_reducao = pat_extra * r_prev['swr'] / 100  # quanto de gasto a mais o pat extra suporta

        print(f"  {r_curr['anos_extra']:>9} | {r_curr['idade']:>4} | {delta_sr:>+15.1%} | {delta_bear:>+10.1%} | R${equiv_reducao/1e3:>8.0f}k/ano")

    # ========================================
    # DECOMPOSICAO: SPENDING POR FASE E IDADE DE FIRE
    # ========================================
    print("\n" + "=" * 110)
    print("DECOMPOSICAO SPENDING: SAQUE TOTAL POR FASE E IDADE DE FIRE")
    print("  (lifestyle_ex_saude + saude(t) + custos - INSS)")
    print("=" * 110)

    print(f"\n  {'FIRE':>4} | {'t=0 (Go-Go)':>14} | {'t=10':>14} | {'t=15 (Slow)':>14} | {'t=20 (No-Go)':>14} | {'t=30':>14} | {'t=40':>14}")
    print(f"  {'-'*4}-+-{'-'*14}-+-{'-'*14}-+-{'-'*14}-+-{'-'*14}-+-{'-'*14}-+-{'-'*14}")

    for idade_fire in range(50, 61):
        vals = []
        for t in [0, 10, 15, 20, 30, 40]:
            if idade_fire + t <= HORIZONTE_TOTAL:
                val = get_spending(t, idade_fire, with_smile=True)
                vals.append(f"R${val/1e3:>8.0f}k")
            else:
                vals.append(f"{'n/a':>14}")
        print(f"  {idade_fire:>4} | {vals[0]:>14} | {vals[1]:>14} | {vals[2]:>14} | {vals[3]:>14} | {vals[4]:>14} | {vals[5]:>14}")

    # ========================================
    # RESUMO
    # ========================================
    print("\n" + "=" * 110)
    print("RESUMO")
    print("=" * 110)

    # Find the age where P(success) COM guardrails crosses 95%
    ages_95 = [r['idade'] for r in results_main if r['sr_com'] >= 0.95]
    ages_90 = [r['idade'] for r in results_main if r['sr_com'] >= 0.90]
    ages_85 = [r['idade'] for r in results_main if r['sr_com'] >= 0.85]

    print(f"\n  FIRE 50 (baseline): P(sucesso) = {results_main[0]['sr_com']:.1%} COM / {results_main[0]['sr_sem']:.1%} SEM guardrails")
    print(f"  FIRE 55 (+5 anos):  P(sucesso) = {results_main[5]['sr_com']:.1%} COM / {results_main[5]['sr_sem']:.1%} SEM guardrails")
    print(f"  FIRE 60 (+10 anos): P(sucesso) = {results_main[10]['sr_com']:.1%} COM / {results_main[10]['sr_sem']:.1%} SEM guardrails")

    if ages_90:
        print(f"\n  Primeiro FIRE com P >= 90% COM guardrails: {ages_90[0]}")
    if ages_95:
        print(f"  Primeiro FIRE com P >= 95% COM guardrails: {ages_95[0]}")
    else:
        print(f"  P >= 95% COM guardrails: nao atingido no range 50-60")

    print(f"\n  Bear -30% ano 1:")
    print(f"    FIRE 50: {results_bear[0]['sr_com_bear']:.1%} COM / {results_bear[0]['sr_sem_bear']:.1%} SEM")
    print(f"    FIRE 55: {results_bear[5]['sr_com_bear']:.1%} COM / {results_bear[5]['sr_sem_bear']:.1%} SEM")
    print(f"    FIRE 60: {results_bear[10]['sr_com_bear']:.1%} COM / {results_bear[10]['sr_sem_bear']:.1%} SEM")

    # Marginal value of each year
    print(f"\n  Valor marginal medio por ano extra de trabalho:")
    deltas_com = [results_main[i]['sr_com'] - results_main[i-1]['sr_com'] for i in range(1, len(results_main))]
    print(f"    Anos 1-5:  +{np.mean(deltas_com[:5]):.1%}/ano")
    print(f"    Anos 6-10: +{np.mean(deltas_com[5:]):.1%}/ano")
    print(f"    Diminishing returns: valor marginal cai de ~{deltas_com[0]:.1%} para ~{deltas_com[-1]:.1%}")

    print(f"\n" + "=" * 110)
    print(f"Script: dados/monte_carlo_fire_age_sweep.py")
    print(f"Seeds: 42 (acumulacao), 200 (desacumulacao) | N={N_SIM:,} | t-dist df={DF_T}")
    print(f"Premissas: HD-006 final | Guardrails: FR-003")
    print("=" * 110)


if __name__ == "__main__":
    main()
