"""
Quant Audit: Renda+ 2065 — Tabela de Cenários Completa
Auditor: Quant (agente 14)
Data: 2026-03-24

Parâmetros:
  r₀ = 7.00% (taxa de compra)
  D = 43.6 anos (Macaulay Duration)
  π = 5.00%/ano (IPCA estimado)
  Custódia B3 = 0.20%/ano
"""
import numpy as np
from itertools import product

# ============================================================
# PARÂMETROS
# ============================================================
r0 = 0.07       # taxa de compra
D = 43.6         # Macaulay Duration
pi = 0.05        # IPCA
cust = 0.002     # custódia B3 0.20%/ano

# Constante
CONST = (1 + r0) ** D
mod_dur = D / (1 + r0)

print("=" * 70)
print("VERIFICAÇÃO DE PARÂMETROS")
print("=" * 70)
print(f"(1+r₀)^D = (1.07)^{D} = {CONST:.4f}")
print(f"Valor informado: 19.1044")
print(f"Diferença: {CONST - 19.1044:.4f} ({(CONST - 19.1044)/19.1044*100:.4f}%)")
print(f"Modified Duration = D/(1+r₀) = {D}/{1+r0} = {mod_dur:.4f}")
print(f"Valor informado: 40.75")
print(f"Diferença: {mod_dur - 40.75:.4f}")
print()

# ============================================================
# CENÁRIOS E HORIZONTES
# ============================================================
scenarios = {
    'C1': 0.050,
    'C2': 0.055,
    'C3': 0.060,
    'C4': 0.065,
    'C5': 0.070,
    'C6': 0.075,
    'C7': 0.085,
    'C8': 0.100,
}

labels = {
    'C1': 'Muito Bom',
    'C2': 'Bom',
    'C3': 'Neutro',
    'C4': 'Leve Alta',
    'C5': 'Status Quo',
    'C6': 'Ruim',
    'C7': 'Muito Ruim',
    'C8': 'Péssimo',
}

horizons = [0.5, 1.0, 1.5, 3.0, 5.0, 7.0, 10.0]

# IR regressivo
def ir_rate(n_years):
    days = n_years * 365
    if days <= 180:
        return 0.225
    elif days <= 360:
        return 0.200
    elif days <= 720:
        return 0.175
    else:
        return 0.150

# ============================================================
# FÓRMULAS DE CÁLCULO
# ============================================================
def calc(n, r1):
    """
    Calcula retornos para horizonte N e taxa final r1.

    R_total_gross = (1+r₀)^D × (1+π)^N / (1+r₁)^(D−N) − 1
    R_carry_gross = ((1+r₀)(1+π))^N − 1
    R_mtm = R_total_gross − R_carry_gross
    R_after_custody = (1 + R_total_gross) × (1 − cust)^N − 1
    R_líq = R_after_custody × (1 − IR) se R_after_custody > 0, senão R_after_custody
    """
    # Gross total return (MtM)
    r_total = CONST * (1 + pi)**n / (1 + r1)**(D - n) - 1

    # Carry (sem MtM — se taxa não muda de r₀)
    r_carry = ((1 + r0) * (1 + pi))**n - 1

    # MtM component (gross)
    r_mtm = r_total - r_carry

    # Custody drag (aplicado sobre valor de mercado)
    r_after_cust = (1 + r_total) * (1 - cust)**n - 1

    # IR
    ir = ir_rate(n)
    if r_after_cust > 0:
        r_liq = r_after_cust * (1 - ir)
    else:
        r_liq = r_after_cust  # IR = 0 sobre perda

    # Anualizado
    if n > 0 and (1 + r_liq) > 0:
        r_liq_ann = (1 + r_liq)**(1/n) - 1
    else:
        r_liq_ann = float('nan')

    return {
        'R_total': r_total,
        'R_carry': r_carry,
        'R_mtm': r_mtm,
        'R_after_cust': r_after_cust,
        'IR_rate': ir,
        'R_liq': r_liq,
        'R_liq_ann': r_liq_ann,
    }

# ============================================================
# TAREFA 1: TABELA COMPLETA
# ============================================================
print("=" * 70)
print("TAREFA 1: TABELA COMPLETA POR CENÁRIO × HORIZONTE")
print("=" * 70)

# Store results for later use
results = {}

for n in horizons:
    print(f"\n{'─' * 70}")
    print(f"HORIZONTE N = {n} anos | IR = {ir_rate(n)*100:.1f}%")
    print(f"{'─' * 70}")
    print(f"{'Cen':>4} {'r₁':>6} {'R_total':>10} {'R_carry':>10} {'R_mtm':>10} "
          f"{'R_cust':>10} {'R_líq':>10} {'R_líq_aa':>10}")
    print(f"{'':>4} {'':>6} {'(gross)':>10} {'':>10} {'':>10} "
          f"{'(net cust)':>10} {'(net IR)':>10} {'(annual)':>10}")

    for cname, r1 in scenarios.items():
        res = calc(n, r1)
        results[(n, cname)] = res

        print(f"{cname:>4} {r1*100:>5.1f}% "
              f"{res['R_total']*100:>9.2f}% "
              f"{res['R_carry']*100:>9.2f}% "
              f"{res['R_mtm']*100:>9.2f}% "
              f"{res['R_after_cust']*100:>9.2f}% "
              f"{res['R_liq']*100:>9.2f}% "
              f"{res['R_liq_ann']*100:>9.2f}%")

# ============================================================
# Passo a passo detalhado para N=3, C1 (verificação)
# ============================================================
print("\n" + "=" * 70)
print("VERIFICAÇÃO DETALHADA: N=3, C1 (r₁=5%)")
print("=" * 70)

n_check, r1_check = 3.0, 0.05
print(f"(1+r₀)^D = (1.07)^{D} = {CONST:.6f}")
print(f"(1+π)^N = (1.05)^{n_check} = {(1+pi)**n_check:.6f}")
print(f"(1+r₁)^(D-N) = (1.05)^{D-n_check} = {(1+r1_check)**(D-n_check):.6f}")
print(f"Numerador = {CONST:.6f} × {(1+pi)**n_check:.6f} = {CONST * (1+pi)**n_check:.6f}")
print(f"R_total = {CONST * (1+pi)**n_check:.6f} / {(1+r1_check)**(D-n_check):.6f} - 1 = {(CONST * (1+pi)**n_check / (1+r1_check)**(D-n_check) - 1)*100:.4f}%")
print(f"R_carry = ((1.07)(1.05))^{n_check} - 1 = (1.1235)^{n_check} - 1 = {(1.1235**n_check - 1)*100:.4f}%")
print(f"R_mtm = {(CONST * (1+pi)**n_check / (1+r1_check)**(D-n_check) - 1 - (1.1235**n_check - 1))*100:.4f}%")
r_tot = CONST * (1+pi)**n_check / (1+r1_check)**(D-n_check) - 1
r_cust = (1 + r_tot) * (1 - cust)**n_check - 1
print(f"R_after_cust = (1 + {r_tot:.6f}) × (0.998)^{n_check} - 1 = {r_cust*100:.4f}%")
print(f"IR = 15% (N=3 > 720 dias)")
r_liq = r_cust * 0.85
print(f"R_líq = {r_cust*100:.4f}% × 0.85 = {r_liq*100:.4f}%")
print(f"R_líq anualizado = (1 + {r_liq:.6f})^(1/3) - 1 = {((1+r_liq)**(1/3) - 1)*100:.4f}%")

# ============================================================
# TAREFA 2: DISTRIBUIÇÕES POR HORIZONTE
# ============================================================
print("\n" + "=" * 70)
print("TAREFA 2: DISTRIBUIÇÕES DE PROBABILIDADE")
print("=" * 70)

# N=3 dado
dist_n3 = np.array([2, 5, 12, 22, 27, 18, 9, 5], dtype=float) / 100
rates = np.array([5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.5, 10.0])

def dist_stats(probs, rates):
    mean = np.sum(probs * rates)
    var = np.sum(probs * (rates - mean)**2)
    sigma = np.sqrt(var)
    bias_low = np.sum(probs[:4])  # C1-C4 (<=6.5%)
    bias_high = np.sum(probs[4:])  # C5-C8 (>=7.0%)
    return mean, sigma, bias_low, bias_high

m3, s3, bl3, bh3 = dist_stats(dist_n3, rates)
print(f"\nN=3 (dado):")
print(f"  Probs: {[f'{p:.0%}' for p in dist_n3]}")
print(f"  Mean: {m3:.3f}%  σ: {s3:.3f}%  Bias: {bl3:.0%}/{bh3:.0%}")
print(f"  Soma: {dist_n3.sum():.4f}")

# Propostas para N=5, 7, 10
# Critérios: mesmo bias 41/59, σ crescente, nenhuma prob zerada

# N=5: σ ~1.25%
dist_n5 = np.array([3, 7, 12, 19, 24, 18, 11, 6], dtype=float) / 100
m5, s5, bl5, bh5 = dist_stats(dist_n5, rates)
print(f"\nN=5 (proposta):")
print(f"  Probs: {[f'{p:.0%}' for p in dist_n5]}")
print(f"  Mean: {m5:.3f}%  σ: {s5:.3f}%  Bias: {bl5:.0%}/{bh5:.0%}")
print(f"  Soma: {dist_n5.sum():.4f}")

# N=7: σ ~1.45%
dist_n7 = np.array([4, 8, 11, 18, 22, 17, 12, 8], dtype=float) / 100
m7, s7, bl7, bh7 = dist_stats(dist_n7, rates)
print(f"\nN=7 (proposta):")
print(f"  Probs: {[f'{p:.0%}' for p in dist_n7]}")
print(f"  Mean: {m7:.3f}%  σ: {s7:.3f}%  Bias: {bl7:.0%}/{bh7:.0%}")
print(f"  Soma: {dist_n7.sum():.4f}")

# N=10: σ ~1.65%
dist_n10 = np.array([5, 9, 10, 17, 20, 16, 13, 10], dtype=float) / 100
m10, s10, bl10, bh10 = dist_stats(dist_n10, rates)
print(f"\nN=10 (proposta):")
print(f"  Probs: {[f'{p:.0%}' for p in dist_n10]}")
print(f"  Mean: {m10:.3f}%  σ: {s10:.3f}%  Bias: {bl10:.0%}/{bh10:.0%}")
print(f"  Soma: {dist_n10.sum():.4f}")

# Resumo comparativo
print(f"\n{'Horizonte':>10} {'Mean':>8} {'σ':>8} {'Bias L/H':>10}")
for name, dist in [('N=3', dist_n3), ('N=5', dist_n5), ('N=7', dist_n7), ('N=10', dist_n10)]:
    m, s, bl, bh = dist_stats(dist, rates)
    print(f"{name:>10} {m:>7.3f}% {s:>7.3f}% {bl:>4.0%}/{bh:<4.0%}")

# ============================================================
# TAREFA 3: EV PONDERADO POR HORIZONTE
# ============================================================
print("\n" + "=" * 70)
print("TAREFA 3: EV PONDERADO POR HORIZONTE")
print("=" * 70)

distributions = {3.0: dist_n3, 5.0: dist_n5, 7.0: dist_n7, 10.0: dist_n10}
scenario_names = list(scenarios.keys())

for n_ev in [3.0, 5.0, 7.0, 10.0]:
    dist = distributions[n_ev]
    print(f"\n--- EV(N={n_ev:.0f}) ---")
    print(f"{'Cen':>4} {'r₁':>6} {'P(Ci)':>8} {'R_líq':>10} {'P×R_líq':>10}")

    ev = 0
    for i, (cname, r1) in enumerate(scenarios.items()):
        res = results[(n_ev, cname)]
        contrib = dist[i] * res['R_liq']
        ev += contrib
        print(f"{cname:>4} {r1*100:>5.1f}% {dist[i]:>7.1%} "
              f"{res['R_liq']*100:>9.2f}% {contrib*100:>9.4f}%")

    print(f"{'':>4} {'':>6} {'':>8} {'EV =':>10} {ev*100:>9.2f}%")

# EV sem custódia (para comparar com sessão anterior)
print("\n" + "=" * 70)
print("EV SEM CUSTÓDIA (para comparação com sessão anterior)")
print("=" * 70)

def calc_no_custody(n, r1):
    r_total = CONST * (1 + pi)**n / (1 + r1)**(D - n) - 1
    ir = ir_rate(n)
    if r_total > 0:
        r_liq = r_total * (1 - ir)
    else:
        r_liq = r_total
    return r_liq

for n_ev in [3.0, 5.0, 7.0, 10.0]:
    dist = distributions[n_ev]
    ev_nc = 0
    for i, (cname, r1) in enumerate(scenarios.items()):
        r_liq_nc = calc_no_custody(n_ev, r1)
        ev_nc += dist[i] * r_liq_nc
    print(f"EV(N={n_ev:.0f}) sem custódia = {ev_nc*100:.2f}%")

# EV com distribuição N=3 para TODOS os horizontes (caso sessão anterior tenha usado dist_n3 fixa)
print("\n--- EV com dist_n3 fixa para todos os horizontes ---")
for n_ev in [3.0, 5.0, 7.0, 10.0]:
    ev_fixed = 0
    for i, (cname, r1) in enumerate(scenarios.items()):
        r_liq_nc = calc_no_custody(n_ev, r1)
        ev_fixed += dist_n3[i] * r_liq_nc
    print(f"EV(N={n_ev:.0f}) [dist N=3, sem custódia] = {ev_fixed*100:.2f}%")

# ============================================================
# TAREFA 4: THRESHOLD VENDA ANTECIPADA
# ============================================================
print("\n" + "=" * 70)
print("TAREFA 4: THRESHOLD VENDA ANTECIPADA (r₁ = 6%)")
print("=" * 70)

r1_trigger = 0.06

# Opção A: vender em N
# Opção B: aguardar até N=2.0 e vender
# A taxa continua a 6% em ambos os cenários (simplificação)

print("\nComparando: vender AGORA (N) vs aguardar N=2.0, ambos com r₁=6%")
print(f"\n{'N':>6} {'R_líq(A)':>12} {'R_líq(B,N=2)':>14} {'Delta A−B':>12}")

test_horizons = np.arange(0.25, 3.01, 0.25)

for n in test_horizons:
    # Opção A: vender em N com r₁=6%
    res_a = calc(n, r1_trigger)
    r_liq_a = res_a['R_liq']

    # Opção B: aguardar até N=2.0
    if n < 2.0:
        res_b = calc(2.0, r1_trigger)
        r_liq_b = res_b['R_liq']
    else:
        res_b = calc(n, r1_trigger)
        r_liq_b = res_b['R_liq']

    delta = r_liq_a - r_liq_b
    marker = " <<<" if abs(delta) < 0.01 else ""
    print(f"{n:>5.2f}a {r_liq_a*100:>11.2f}% {r_liq_b*100:>13.2f}% {delta*100:>11.4f}%{marker}")

# Busca mais fina do threshold
print("\nBusca fina do crossover (resolução diária):")
r_liq_b_2 = calc(2.0, r1_trigger)['R_liq']

prev_delta = None
for day in range(1, 730):  # 0 a 2 anos em dias
    n = day / 365.0
    res_a = calc(n, r1_trigger)
    r_liq_a = res_a['R_liq']
    delta = r_liq_a - r_liq_b_2

    if prev_delta is not None and prev_delta < 0 and delta >= 0:
        print(f"  Crossover entre dia {day-1} e {day}")
        print(f"  Dia {day-1}: N={((day-1)/365.0):.4f}a, delta={prev_delta*100:.4f}%")
        print(f"  Dia {day}: N={(day/365.0):.4f}a, delta={delta*100:.4f}%")
        # Interpolação linear
        frac = -prev_delta / (delta - prev_delta)
        cross_day = (day - 1) + frac
        print(f"  Interpolado: dia {cross_day:.1f} (~{cross_day/365:.3f} anos = ~{cross_day:.0f} dias)")
        break
    prev_delta = delta

# Análise do efeito: POR QUE existe o crossover?
print("\nAnálise do crossover:")
print("O crossover existe porque:")
print("  - Em N curto, IR é alto (22.5% ou 20%) vs 17.5% em N=2.0")
print("  - O carry adicional de esperar até N=2.0 compensa o 'custo' de espera")
print("  - No crossover, o ganho de MtM em N curto com IR maior = ganho de carry+MtM em N=2.0 com IR menor")

print("\nDetalhe IR por horizonte:")
for n in [0.5, 1.0, 1.5, 2.0]:
    print(f"  N={n:.1f}a ({n*365:.0f} dias): IR={ir_rate(n)*100:.1f}%")

# ============================================================
# THRESHOLD ALTERNATIVO: sem custódia
# ============================================================
print("\n--- Threshold sem custódia ---")
def calc_nc(n, r1):
    r_total = CONST * (1 + pi)**n / (1 + r1)**(D - n) - 1
    ir = ir_rate(n)
    if r_total > 0:
        r_liq = r_total * (1 - ir)
    else:
        r_liq = r_total
    return r_liq

r_liq_b_2_nc = calc_nc(2.0, r1_trigger)
prev_delta = None
for day in range(1, 730):
    n = day / 365.0
    r_liq_a_nc = calc_nc(n, r1_trigger)
    delta = r_liq_a_nc - r_liq_b_2_nc

    if prev_delta is not None and prev_delta < 0 and delta >= 0:
        frac = -prev_delta / (delta - prev_delta)
        cross_day = (day - 1) + frac
        print(f"  Crossover sem custódia: dia {cross_day:.1f} (~{cross_day/365:.3f} anos)")
        break
    prev_delta = delta

# ============================================================
# RESUMO FINAL
# ============================================================
print("\n" + "=" * 70)
print("RESUMO FINAL")
print("=" * 70)

print("\n1. Constante (1.07)^43.6:")
print(f"   Calculado: {CONST:.4f}")
print(f"   Informado: 19.1044")
print(f"   Status: {'OK' if abs(CONST - 19.1044) < 0.01 else 'DIVERGENTE'}")

print(f"\n2. Modified Duration:")
print(f"   Calculado: {mod_dur:.4f}")
print(f"   Informado: 40.75")
print(f"   Status: {'OK' if abs(mod_dur - 40.75) < 0.01 else 'DIVERGENTE'}")

print("\n3. EVs comparados com sessão anterior:")
sessao_anterior = {3: 68.5, 5: 107.4, 7: 160.0, 10: 261.4}
for n_ev in [3.0, 5.0, 7.0, 10.0]:
    dist = distributions[n_ev]
    ev = sum(dist[i] * results[(n_ev, cname)]['R_liq'] for i, cname in enumerate(scenario_names))
    ev_nc = sum(dist[i] * calc_no_custody(n_ev, list(scenarios.values())[i])
                for i in range(len(scenarios)))
    ev_nc_fixed = sum(dist_n3[i] * calc_no_custody(n_ev, list(scenarios.values())[i])
                      for i in range(len(scenarios)))
    sa = sessao_anterior[int(n_ev)]
    print(f"   N={n_ev:.0f}: Com custódia = {ev*100:.1f}% | Sem custódia = {ev_nc*100:.1f}% "
          f"| Sem cust+dist fixa = {ev_nc_fixed*100:.1f}% | Sessão anterior = {sa}%")
