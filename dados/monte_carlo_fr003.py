#!/usr/bin/env python3
"""
FR-003: Monte Carlo Computacional — 10,000 trajetorias
Premissas: HD-006 final (2026-03-22)
"""

import numpy as np
from dataclasses import dataclass

np.random.seed(42)  # Reproducibilidade
N_SIM = 10_000

# =====================================================
# PREMISSAS APROVADAS (HD-006 final, 2026-03-22)
# =====================================================

PATRIMONIO_INICIAL = 3_482_633  # BRL
APORTE_ANUAL = 300_000  # BRL
IDADE_ATUAL = 39
IDADE_FIRE = 50
HORIZONTE_DESACUM = 45  # ate 95 anos
ANOS_ACUM = IDADE_FIRE - IDADE_ATUAL  # 11

# Retornos reais BRL (base, com dep BRL 0.5%)
# Fonte: DMS 2025 + factor premiums + dep BRL
EQUITY_RETURN = 0.0589       # Bloco equity ponderado
IPCA_RETURN_HTM = 0.060      # IPCA+ longo liquido HTM 14 anos
CRIPTO_RETURN = 0.050        # Estimativa conservadora
RENDA_PLUS_RETURN = 0.0534   # Proxy

# Volatilidades anuais (retorno real)
EQUITY_VOL = 0.16            # DMS: equity global ~16%
IPCA_VOL = 0.05              # MtM IPCA+, baixo para HTM
CRIPTO_VOL = 0.60            # Crypto ~60%
RENDA_PLUS_VOL = 0.15        # Duration 43.6 x ~3.5% yield vol

# Alocacao na acumulacao (39-50)
ALLOC_EQUITY = 0.79
ALLOC_IPCA = 0.15
ALLOC_CRIPTO = 0.03
ALLOC_RENDA_PLUS = 0.03

# Desacumulacao
DESACUM_RETURN_CONSERV = 0.0457  # Retorno real liquido (IR 15% sobre nominal)
DESACUM_RETURN_PARCIAL = 0.0500  # Cenario venda parcial
DESACUM_VOL = 0.15               # Volatilidade equity (dominante pos-50)

# Fat tails: usar t-distribution com df=5 (mais realista que normal)
# Referencia: Cont (2001) "Empirical properties of asset returns"
DF_T = 5

# Correlacoes simplificadas
# Equity-IPCA+: ~0.1 (baixa no Brasil)
# Equity-Cripto: ~0.3
# IPCA+-Cripto: ~0.0
CORR_MATRIX = np.array([
    [1.0,  0.1,  0.3,  0.1],   # Equity
    [0.1,  1.0,  0.0,  0.5],   # IPCA+
    [0.3,  0.0,  1.0,  0.0],   # Cripto
    [0.1,  0.5,  0.0,  1.0],   # Renda+
])

# Guardrails (Kitces & Fitzpatrick 2024)
GUARDRAILS = {
    "drawdown_15_25": 0.10,   # Corte 10%
    "drawdown_25_35": 0.20,   # Corte 20%
    "drawdown_35_plus": None,  # Piso fixo
    "upside_25_plus": 0.10,   # Aumento 10%
    "piso_essencial": 180_000,
    "teto_retirada": 350_000,
}

# =====================================================
# SIMULACAO
# =====================================================

def generate_correlated_returns(n_years, n_sims, means, vols, corr_matrix, df=5):
    """Gera retornos correlacionados com t-distribution (fat tails)."""
    n_assets = len(means)
    L = np.linalg.cholesky(corr_matrix)

    all_returns = np.zeros((n_sims, n_years, n_assets))

    for sim in range(n_sims):
        # t-distribution para fat tails
        z = np.random.standard_t(df, size=(n_years, n_assets))
        # Escalar para ter variancia correta: var(t_df) = df/(df-2)
        scale = np.sqrt((df - 2) / df)
        z = z * scale

        # Correlacionar
        correlated = z @ L.T

        # Converter para retornos
        for a in range(n_assets):
            # retorno = media + vol * z
            # Usando retorno aritmetico -> geometrico: mu_g = mu_a - sigma^2/2
            mu_g = means[a] - vols[a]**2 / 2
            all_returns[sim, :, a] = np.exp(mu_g + vols[a] * correlated[:, a]) - 1

    return all_returns


def simulate_accumulation(n_sims=N_SIM):
    """Fase de acumulacao: 39-50 (11 anos)."""
    means = np.array([EQUITY_RETURN, IPCA_RETURN_HTM, CRIPTO_RETURN, RENDA_PLUS_RETURN])
    vols = np.array([EQUITY_VOL, IPCA_VOL, CRIPTO_VOL, RENDA_PLUS_VOL])
    allocs = np.array([ALLOC_EQUITY, ALLOC_IPCA, ALLOC_CRIPTO, ALLOC_RENDA_PLUS])

    returns = generate_correlated_returns(ANOS_ACUM, n_sims, means, vols, CORR_MATRIX)

    patrimonio = np.zeros((n_sims, ANOS_ACUM + 1))
    patrimonio[:, 0] = PATRIMONIO_INICIAL

    for year in range(ANOS_ACUM):
        # Retorno ponderado do portfolio
        portfolio_return = np.sum(returns[:, year, :] * allocs, axis=1)
        patrimonio[:, year + 1] = (patrimonio[:, year] + APORTE_ANUAL) * (1 + portfolio_return)

    return patrimonio


def simulate_decumulation(patrimonio_fire, withdrawal, return_mean, return_vol,
                          n_years=HORIZONTE_DESACUM, use_guardrails=False, n_sims=N_SIM):
    """Fase de desacumulacao: 50-95."""
    patrimonio = np.zeros((n_sims, n_years + 1))
    patrimonio[:, 0] = patrimonio_fire

    # Track de pico para guardrails
    pico = patrimonio_fire.copy()
    retirada_base = np.full(n_sims, float(withdrawal))
    retirada_atual = retirada_base.copy()
    failed = np.zeros(n_sims, dtype=bool)
    fail_year = np.full(n_sims, n_years + 1)

    # Gerar retornos com fat tails
    mu_g = return_mean - return_vol**2 / 2
    scale = np.sqrt((DF_T - 2) / DF_T)

    for year in range(n_years):
        z = np.random.standard_t(DF_T, size=n_sims) * scale
        returns = np.exp(mu_g + return_vol * z) - 1

        if use_guardrails:
            # Calcular drawdown
            drawdown = 1 - patrimonio[:, year] / pico

            # Aplicar guardrails
            for i in range(n_sims):
                if failed[i]:
                    continue

                dd = drawdown[i]
                if dd > 0.35:
                    retirada_atual[i] = GUARDRAILS["piso_essencial"]
                elif dd > 0.25:
                    retirada_atual[i] = retirada_base[i] * (1 - GUARDRAILS["drawdown_25_35"])
                elif dd > 0.15:
                    retirada_atual[i] = retirada_base[i] * (1 - GUARDRAILS["drawdown_15_25"])
                else:
                    retirada_atual[i] = retirada_base[i]

                # Upside
                if patrimonio[:, year][i] > pico[i] * 1.25:
                    retirada_base[i] = min(
                        retirada_base[i] * (1 + GUARDRAILS["upside_25_plus"]),
                        GUARDRAILS["teto_retirada"]
                    )
                    pico[i] = patrimonio[:, year][i]

                # Floor
                retirada_atual[i] = max(retirada_atual[i], GUARDRAILS["piso_essencial"])
        else:
            retirada_atual = retirada_base.copy()

        # Patrimonio pos-retirada e retorno
        patrimonio[:, year + 1] = (patrimonio[:, year] - retirada_atual) * (1 + returns)

        # Atualizar pico
        pico = np.maximum(pico, patrimonio[:, year + 1])

        # Marcar falhas
        newly_failed = (patrimonio[:, year + 1] <= 0) & (~failed)
        failed |= newly_failed
        fail_year[newly_failed] = year + 1
        patrimonio[patrimonio[:, year + 1] < 0, year + 1] = 0

    success_rate = 1 - np.mean(failed)
    return patrimonio, success_rate, fail_year


def main():
    print("=" * 70)
    print("FR-003: MONTE CARLO COMPUTACIONAL — 10,000 TRAJETORIAS")
    print("Premissas: HD-006 final (2026-03-22)")
    print("Fat tails: t-distribution df=5 (Cont 2001)")
    print("=" * 70)

    # ---- FASE 1: ACUMULACAO ----
    print("\n### FASE 1: ACUMULACAO (39-50, 11 anos)")
    print(f"Patrimonio inicial: R$ {PATRIMONIO_INICIAL:,.0f}")
    print(f"Aporte anual: R$ {APORTE_ANUAL:,.0f}")
    print(f"Alocacao: {ALLOC_EQUITY:.0%} equity / {ALLOC_IPCA:.0%} IPCA+ / "
          f"{ALLOC_CRIPTO:.0%} cripto / {ALLOC_RENDA_PLUS:.0%} Renda+")

    patrimonio_acum = simulate_accumulation()
    patrimonio_fire = patrimonio_acum[:, -1]

    p5, p25, p50, p75, p95 = np.percentile(patrimonio_fire, [5, 25, 50, 75, 95])

    print(f"\nPatrimonio aos 50 (distribuicao):")
    print(f"  P5  (pessimista):  R$ {p5:>12,.0f}")
    print(f"  P25 (conservador): R$ {p25:>12,.0f}")
    print(f"  P50 (mediana):     R$ {p50:>12,.0f}")
    print(f"  P75 (favoravel):   R$ {p75:>12,.0f}")
    print(f"  P95 (otimista):    R$ {p95:>12,.0f}")
    print(f"  Media:             R$ {np.mean(patrimonio_fire):>12,.0f}")
    print(f"  Deterministico:    R$ {10_958_429:>12,d}  (FR-001 v4)")
    print(f"  Desvio padrao:     R$ {np.std(patrimonio_fire):>12,.0f}")

    # Probabilidade de atingir R$10M+
    prob_10m = np.mean(patrimonio_fire >= 10_000_000)
    prob_8m = np.mean(patrimonio_fire >= 8_000_000)
    prob_6m = np.mean(patrimonio_fire >= 6_000_000)
    print(f"\n  P(>= R$ 10M):  {prob_10m:.1%}")
    print(f"  P(>= R$  8M):  {prob_8m:.1%}")
    print(f"  P(>= R$  6M):  {prob_6m:.1%}")

    # ---- FASE 2: DESACUMULACAO ----
    print("\n" + "=" * 70)
    print("### FASE 2: DESACUMULACAO (50-95, 45 anos)")
    print("=" * 70)

    withdrawals = [250_000, 300_000, 350_000, 400_000]
    scenarios = [
        ("Conservador (4.57%)", DESACUM_RETURN_CONSERV, DESACUM_VOL),
        ("Venda parcial (5.00%)", DESACUM_RETURN_PARCIAL, DESACUM_VOL),
    ]

    for scenario_name, ret, vol in scenarios:
        print(f"\n--- Cenario: {scenario_name} ---")

        for use_guardrails in [False, True]:
            guard_label = "COM guardrails" if use_guardrails else "SEM guardrails"
            print(f"\n  [{guard_label}]")
            print(f"  {'Custo/ano':>12}  {'Success Rate':>13}  {'P5 aos 70':>14}  {'P5 aos 95':>14}  {'Mediana 95':>14}")
            print(f"  {'-'*12}  {'-'*13}  {'-'*14}  {'-'*14}  {'-'*14}")

            for w in withdrawals:
                pat, sr, fail_yr = simulate_decumulation(
                    patrimonio_fire, w, ret, vol,
                    use_guardrails=use_guardrails
                )

                # P5 aos 70 (ano 20) e 95 (ano 45)
                p5_70 = np.percentile(pat[:, 20], 5)
                p5_95 = np.percentile(pat[:, min(45, pat.shape[1]-1)], 5)
                med_95 = np.percentile(pat[:, min(45, pat.shape[1]-1)], 50)

                print(f"  R$ {w/1000:>5.0f}k      {sr:>8.1%}    "
                      f"R$ {p5_70:>10,.0f}    R$ {p5_95:>10,.0f}    R$ {med_95:>10,.0f}")

    # ---- SWR DISTRIBUTION ----
    print("\n" + "=" * 70)
    print("### SWR IMPLICITO (baseado na distribuicao de patrimonio aos 50)")
    print("=" * 70)

    for w in withdrawals:
        swr_dist = w / patrimonio_fire * 100
        p5, p50, p95 = np.percentile(swr_dist, [5, 50, 95])
        print(f"  R$ {w/1000:.0f}k/ano: SWR mediano {p50:.2f}%  "
              f"(P5={p5:.2f}%, P95={p95:.2f}%)")

    # ---- COMPARACAO COM FR-001 ----
    print("\n" + "=" * 70)
    print("### COMPARACAO: FR-001 (analitico) vs FR-003 (Monte Carlo)")
    print("=" * 70)

    # FR-001 valores
    fr001 = {
        250: {"sem_guard": "~87%", "com_guard": "~95-97%"},
        350: {"sem_guard": "~70%", "com_guard": "~82-85%"},
        400: {"sem_guard": "~58%", "com_guard": "~70-73%"},
    }

    print(f"\n  Cenario conservador (4.57%), SEM guardrails:")
    print(f"  {'Custo':>10}  {'FR-001 (analitico)':>20}  {'FR-003 (MC)':>15}  {'Delta':>10}")
    print(f"  {'-'*10}  {'-'*20}  {'-'*15}  {'-'*10}")

    for w in [250_000, 350_000, 400_000]:
        pat, sr, _ = simulate_decumulation(
            patrimonio_fire, w, DESACUM_RETURN_CONSERV, DESACUM_VOL,
            use_guardrails=False
        )
        fr001_val = fr001.get(w//1000, {}).get("sem_guard", "n/a")
        print(f"  R$ {w/1000:>5.0f}k    {fr001_val:>20}    {sr:>12.1%}")

    # ---- CENARIO DECADA PERDIDA ----
    print("\n" + "=" * 70)
    print("### STRESS: DECADA PERDIDA (retorno 3% acum, 2% desacum)")
    print("=" * 70)

    # Recalcular acumulacao com 3%
    means_stress = np.array([0.03, 0.06, 0.02, 0.03])
    vols_stress = np.array([0.20, 0.05, 0.70, 0.20])

    returns_stress = generate_correlated_returns(ANOS_ACUM, N_SIM, means_stress, vols_stress, CORR_MATRIX)
    allocs = np.array([ALLOC_EQUITY, ALLOC_IPCA, ALLOC_CRIPTO, ALLOC_RENDA_PLUS])

    pat_stress = np.zeros((N_SIM, ANOS_ACUM + 1))
    pat_stress[:, 0] = PATRIMONIO_INICIAL
    for year in range(ANOS_ACUM):
        portfolio_return = np.sum(returns_stress[:, year, :] * allocs, axis=1)
        pat_stress[:, year + 1] = (pat_stress[:, year] + APORTE_ANUAL) * (1 + portfolio_return)

    pat_fire_stress = pat_stress[:, -1]
    p5s, p50s = np.percentile(pat_fire_stress, [5, 50])
    print(f"  Patrimonio aos 50 (decada perdida):")
    print(f"    P5:      R$ {p5s:>12,.0f}")
    print(f"    Mediana: R$ {p50s:>12,.0f}")

    for w in [250_000, 350_000]:
        pat_d, sr_d, _ = simulate_decumulation(
            pat_fire_stress, w, 0.02, 0.20,
            use_guardrails=False
        )
        pat_g, sr_g, _ = simulate_decumulation(
            pat_fire_stress, w, 0.02, 0.20,
            use_guardrails=True
        )
        print(f"  R$ {w/1000:.0f}k/ano: SR sem guardrails={sr_d:.1%}, com={sr_g:.1%}")

    # ---- BOND TENT ----
    print("\n" + "=" * 70)
    print("### BOND TENT: IPCA+ 2040 vence aos 53 (protege primeiros 3 anos)")
    print("=" * 70)

    # Simplificacao: nos primeiros 3 anos pos-FIRE, 15% do portfolio em RF (vol=0)
    # gera retorno fixo de 6%, restante em equity com vol normal

    for w in [250_000, 350_000]:
        # Sem bond tent (100% equity vol)
        _, sr_no_tent, _ = simulate_decumulation(
            patrimonio_fire, w, DESACUM_RETURN_CONSERV, DESACUM_VOL,
            use_guardrails=True
        )

        # Com bond tent (primeiros 3 anos: 85% equity vol, 15% RF vol=0)
        # Simplificacao: reduzir vol efetiva nos primeiros 3 anos
        tent_vol = np.sqrt(0.85 * DESACUM_VOL**2)  # ~13.8%
        tent_ret = 0.85 * DESACUM_RETURN_CONSERV + 0.15 * 0.06  # ~4.78%

        pat_tent = np.zeros((N_SIM, HORIZONTE_DESACUM + 1))
        pat_tent[:, 0] = patrimonio_fire
        pico_t = patrimonio_fire.copy()
        ret_base = np.full(N_SIM, float(w))
        ret_atual = ret_base.copy()
        failed_t = np.zeros(N_SIM, dtype=bool)

        for year in range(HORIZONTE_DESACUM):
            if year < 3:  # Bond tent ativo
                r = tent_ret
                v = tent_vol
            else:
                r = DESACUM_RETURN_CONSERV
                v = DESACUM_VOL

            mu_g = r - v**2 / 2
            scale = np.sqrt((DF_T - 2) / DF_T)
            z = np.random.standard_t(DF_T, size=N_SIM) * scale
            returns = np.exp(mu_g + v * z) - 1

            # Guardrails
            dd = 1 - pat_tent[:, year] / pico_t
            for i in range(N_SIM):
                if failed_t[i]:
                    continue
                if dd[i] > 0.35:
                    ret_atual[i] = 180_000
                elif dd[i] > 0.25:
                    ret_atual[i] = ret_base[i] * 0.80
                elif dd[i] > 0.15:
                    ret_atual[i] = ret_base[i] * 0.90
                else:
                    ret_atual[i] = ret_base[i]
                ret_atual[i] = max(ret_atual[i], 180_000)

            pat_tent[:, year + 1] = (pat_tent[:, year] - ret_atual) * (1 + returns)
            pico_t = np.maximum(pico_t, pat_tent[:, year + 1])
            newly = (pat_tent[:, year + 1] <= 0) & (~failed_t)
            failed_t |= newly
            pat_tent[pat_tent[:, year + 1] < 0, year + 1] = 0

        sr_tent = 1 - np.mean(failed_t)
        print(f"  R$ {w/1000:.0f}k/ano: Sem tent={sr_no_tent:.1%}, Com tent={sr_tent:.1%}, Delta={sr_tent-sr_no_tent:+.1%}")

    print("\n" + "=" * 70)
    print("NOTA: Seed=42 para reproducibilidade. t-dist df=5 para fat tails.")
    print("Guardrails: Kitces & Fitzpatrick 2024 (risk-based, drawdown tiers).")
    print("=" * 70)


if __name__ == "__main__":
    main()
