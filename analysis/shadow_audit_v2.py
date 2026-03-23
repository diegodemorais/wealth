"""
Shadow/Benchmark Audit v2 — Quant Agent
Todos os shadows em base LIQUIDA all-in (pos-tax, pos-cost).
Data: 2026-03-22

Premissas: carteira.md (HD-006 final) + definicoes aprovadas por Diego.
"""

# =============================================================================
# PREMISSAS APROVADAS
# =============================================================================

PATRIMONIO_INICIAL = 3_482_633  # BRL (carteira.md)
APORTE_MENSAL = 25_000          # BRL
HORIZONTE_ANOS = 11             # 2026 -> 2037
MESES = HORIZONTE_ANOS * 12    # 132
IPCA_ANUAL = 0.04              # 4%/ano
DEP_BRL_BASE = 0.005           # 0.5%/ano depreciacao real BRL
GASTOS_ANUAIS = 250_000        # custo de vida FIRE

# Retornos reais USD (carteira.md, fontes: DMS 2025, AQR 2026, FF93)
RET_USD = {"SWRD": 0.049, "AVGS": 0.060, "AVEM": 0.055, "JPGL": 0.057}

# Pesos target equity (carteira.md)
PESOS_TARGET = {"SWRD": 0.35, "AVGS": 0.25, "AVEM": 0.20, "JPGL": 0.20}

# TER por ETF (factsheets)
TER = {"SWRD": 0.0012, "AVGS": 0.0023, "AVEM": 0.0036, "JPGL": 0.0025, "VWRA": 0.0022}

# Custos equity
WHT = 0.0022            # 15% sobre ~1.5% yield
TRACKING_DIFF = 0.001   # ~0.10%
FX_ENTRY = 0.0135       # IOF 1.1% + spread 0.25%
FX_EXIT = 0.0135
IR_RATE = 0.15           # 15% flat sobre ganho nominal BRL

# IPCA+ HTM
IPCA_PLUS_BRUTA = 0.0716
CUSTODIA_B3 = 0.0020

# Factor decay (McLean & Pontiff 2016)
MP_DECAY = 0.35
FACTOR_PREMIUM = {"SWRD": 0.0, "AVGS": 0.011, "AVEM": 0.006, "JPGL": 0.008}


# =============================================================================
# FUNCOES
# =============================================================================

def ret_brl(ret_usd, dep=DEP_BRL_BASE):
    """Retorno real BRL = retorno real USD + depreciacao real BRL."""
    return ret_usd + dep


def equity_ret_liquido_anualizado(ret_real_brl, horizonte, ter, ipca=IPCA_ANUAL,
                                   fx_entry=FX_ENTRY, fx_exit=FX_EXIT, ir=IR_RATE,
                                   wht=WHT, td=TRACKING_DIFF):
    """
    Retorno real liquido anualizado all-in de equity.

    Metodo (por R$1 investido):
    1. Capital efetivo apos FX entry: (1 - fx_entry)
    2. Retorno real anual net de custos recorrentes: ret - TER - WHT - TD
    3. Converter para nominal: (1 + ret_real_net) * (1 + ipca) - 1
    4. Acumular nominal por horizonte anos
    5. Valor final bruto = capital_efetivo * acumulado_nominal
    6. Ganho nominal = VF_bruto - 1 (base de custo = R$1 original enviado)
    7. IR = 15% sobre ganho nominal (se positivo)
    8. VF pos FX exit = VF_bruto * (1 - fx_exit)
    9. VF liquido = VF_pos_fx_exit - IR
    10. Retorno nominal liquido anualizado = VF_liq^(1/N) - 1
    11. Retorno real liquido = (1 + r_nom_liq) / (1 + ipca) - 1
    """
    ret_real_net = ret_real_brl - ter - wht - td
    ret_nom = (1 + ret_real_net) * (1 + ipca) - 1
    acum_nom = (1 + ret_nom) ** horizonte

    capital = 1 - fx_entry
    vf_bruto = capital * acum_nom
    ganho = vf_bruto - 1
    ir_pago = max(0, ganho) * ir
    vf_pos_fx = vf_bruto * (1 - fx_exit)
    vf_liq = vf_pos_fx - ir_pago

    r_nom_liq = vf_liq ** (1 / horizonte) - 1
    r_real_liq = (1 + r_nom_liq) / (1 + ipca) - 1

    return r_real_liq, {
        "ret_real_net": ret_real_net,
        "ret_nom_anual": ret_nom,
        "acum_nom": acum_nom,
        "capital": capital,
        "vf_bruto": vf_bruto,
        "ganho": ganho,
        "ir_pago": ir_pago,
        "vf_pos_fx": vf_pos_fx,
        "vf_liq": vf_liq,
    }


def ipca_plus_ret_liquido(taxa_bruta, horizonte, custodia=CUSTODIA_B3,
                           ipca=IPCA_ANUAL, ir=IR_RATE):
    """
    Retorno real liquido anualizado IPCA+ HTM.

    Metodo (por R$100):
    1. Taxa pos-custodia = taxa_bruta - custodia
    2. Nominal anual = (1 + taxa_pos) * (1 + ipca) - 1
    3. VF nominal = 100 * (1 + nominal)^N
    4. Ganho nominal = VF - 100
    5. IR = 15% * ganho
    6. VF liquido nominal = VF - IR
    7. VF real liquido = VF_liq_nom / (1 + ipca)^N
    8. Retorno real liquido = (VF_real / 100)^(1/N) - 1
    """
    taxa_pos = taxa_bruta - custodia
    nominal = (1 + taxa_pos) * (1 + ipca) - 1
    vf_nom = 100 * (1 + nominal) ** horizonte
    ganho = vf_nom - 100
    ir_pago = ganho * ir
    vf_liq_nom = vf_nom - ir_pago
    vf_real = vf_liq_nom / (1 + ipca) ** horizonte
    ret_real = (vf_real / 100) ** (1 / horizonte) - 1

    return ret_real, {
        "taxa_pos": taxa_pos,
        "nominal_anual": nominal,
        "vf_nom": vf_nom,
        "ganho": ganho,
        "ir_pago": ir_pago,
        "vf_liq_nom": vf_liq_nom,
        "vf_real": vf_real,
    }


def projecao_fv_real(ret_anual_real, patrimonio_ini, aporte_mensal, meses):
    """
    FV em reais de HOJE (real).
    FV = PV * (1+r_m)^n + PMT * [((1+r_m)^n - 1) / r_m]
    """
    r_m = (1 + ret_anual_real) ** (1/12) - 1
    fv_pv = patrimonio_ini * (1 + r_m) ** meses
    fv_pmt = aporte_mensal * (((1 + r_m) ** meses - 1) / r_m)
    return fv_pv + fv_pmt


def fv_real_to_nominal(fv_real, anos, ipca=IPCA_ANUAL):
    """Converte FV real para FV nominal."""
    return fv_real * (1 + ipca) ** anos


def swr_necessario(gastos_anuais, patrimonio):
    """SWR = gastos / patrimonio."""
    return gastos_anuais / patrimonio


# =============================================================================
# EXECUCAO
# =============================================================================

print("=" * 80)
print("SHADOW AUDIT v2 — BASE LIQUIDA ALL-IN")
print("Quant Agent | 2026-03-22")
print("=" * 80)


# =============================================================================
# S1 — VWRA PURO (100% equity global, sem factor tilt)
# =============================================================================

print("\n" + "=" * 80)
print("S1 — VWRA PURO (100% equity global, sem factor tilt)")
print("=" * 80)

# VWRA = ~88% DM + 12% EM
# DM (SWRD proxy): 4.9% USD | EM neutro (AQR): 5.1% USD
VWRA_USD = 0.88 * 0.049 + 0.12 * 0.051
VWRA_BRL = ret_brl(VWRA_USD)

print(f"\n  Retorno bruto:")
print(f"    USD: 0.88*4.9% + 0.12*5.1% = {VWRA_USD*100:.3f}%")
print(f"    BRL base (dep 0.5%): {VWRA_BRL*100:.3f}%")

s1_ret, s1_d = equity_ret_liquido_anualizado(VWRA_BRL, HORIZONTE_ANOS, ter=TER['VWRA'])

print(f"\n  Custos all-in:")
print(f"    TER: {TER['VWRA']*100:.2f}%")
print(f"    WHT: {WHT*100:.2f}%")
print(f"    TD:  {TRACKING_DIFF*100:.2f}%")
print(f"    FX entry: {FX_ENTRY*100:.2f}%  |  FX exit: {FX_EXIT*100:.2f}%")
print(f"    IR: {IR_RATE*100:.0f}% sobre ganho nominal")
print(f"\n  Ret real net recorrentes: {VWRA_BRL*100:.3f}% - {TER['VWRA']*100:.2f}% - {WHT*100:.2f}% - {TRACKING_DIFF*100:.2f}% = {s1_d['ret_real_net']*100:.3f}%")
print(f"  Ret nominal anual: (1+{s1_d['ret_real_net']*100:.3f}%)*(1+4%) - 1 = {s1_d['ret_nom_anual']*100:.3f}%")
print(f"  Acumulado nominal 11a: {s1_d['acum_nom']:.4f}")
print(f"  Capital pos FX entry: {s1_d['capital']:.4f}")
print(f"  VF bruto: {s1_d['vf_bruto']:.4f}")
print(f"  Ganho nominal: {s1_d['ganho']:.4f}")
print(f"  IR pago: {s1_d['ir_pago']:.4f}")
print(f"  VF pos FX exit: {s1_d['vf_pos_fx']:.4f}")
print(f"  VF liquido: {s1_d['vf_liq']:.4f}")
print(f"\n  >>> RETORNO REAL LIQUIDO ALL-IN S1: {s1_ret*100:.2f}%")

s1_fv = projecao_fv_real(s1_ret, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES)
s1_fv_nom = fv_real_to_nominal(s1_fv, HORIZONTE_ANOS)
s1_swr = swr_necessario(GASTOS_ANUAIS, s1_fv)

print(f"\n  FV real (R$ hoje): R${s1_fv:,.0f}")
print(f"  FV nominal: R${s1_fv_nom:,.0f}")
print(f"  SWR necessario (R$250k/ano): {s1_swr*100:.2f}%")


# =============================================================================
# S2 — 100% IPCA+ HTM (3 cenarios de taxa)
# =============================================================================

print("\n" + "=" * 80)
print("S2 — 100% IPCA+ HTM (3 cenarios de taxa)")
print("=" * 80)

print(f"\n  Premissa comum: patrimonio 100% em IPCA+ HTM.")
print(f"  Problema: shadow hipotetico assume titulo com vencimento 2037 (11a).")
print(f"  IR 15% incide sobre ganho nominal acumulado no resgate.\n")

# Cenario A: taxa constante 7.16%
s2a_ret, s2a_d = ipca_plus_ret_liquido(0.0716, HORIZONTE_ANOS)
print(f"  S2-A (taxa constante 7.16%):")
print(f"    Taxa pos-custodia: {s2a_d['taxa_pos']*100:.2f}%")
print(f"    Nominal anual: (1+{s2a_d['taxa_pos']*100:.2f}%)*(1+4%)-1 = {s2a_d['nominal_anual']*100:.2f}%")
print(f"    VF nominal (R$100): R${s2a_d['vf_nom']:.2f}")
print(f"    Ganho nominal: R${s2a_d['ganho']:.2f}")
print(f"    IR (15%): R${s2a_d['ir_pago']:.2f}")
print(f"    VF nominal liquido: R${s2a_d['vf_liq_nom']:.2f}")
print(f"    VF real liquido: R${s2a_d['vf_real']:.2f}")
print(f"    >>> RETORNO REAL LIQUIDO S2-A: {s2a_ret*100:.2f}%")

# Cenario B: queda gradual 7.16% -> 6.50% em 5 anos, depois constante
# Modelagem: patrimonio existente a 7.16%. Aportes novos a taxa declinante.
# Simplificacao: taxa media de compra dos aportes ~6.83% (media 7.16 e 6.50)
# Rigoroso: aportes mensais nos primeiros 60 meses a taxa que declina linearmente
print(f"\n  S2-B (queda gradual 7.16% -> 6.50% em 5 anos):")
print(f"    Modelagem rigorosa: cada mes de aporte a taxa corrente daquele mes.")
print(f"    Aportes mes 1-60: taxa declina linearmente 7.16% -> 6.50%.")
print(f"    Aportes mes 61-132: taxa constante 6.50%.")
print(f"    Patrimonio existente: taxa 7.16% HTM.\n")

# Patrimonio existente: retorno a 7.16% por 11 anos
_, s2b_exist_d = ipca_plus_ret_liquido(0.0716, HORIZONTE_ANOS)
PV_exist_real = PATRIMONIO_INICIAL * s2b_exist_d['vf_real'] / 100

# Aportes: calcular mes a mes
total_real_aportes_b = 0
for m in range(1, MESES + 1):
    # Taxa no mes m
    if m <= 60:
        taxa_m = 0.0716 - (0.0716 - 0.0650) * (m - 1) / 59
    else:
        taxa_m = 0.0650
    # Meses restantes ate fim do horizonte
    meses_restantes = MESES - m
    anos_restantes = meses_restantes / 12
    if anos_restantes < 0.01:
        # Ultimo mes, quase sem crescimento
        total_real_aportes_b += APORTE_MENSAL
        continue
    # Retorno real liquido para esse aporte (HTM pelo periodo restante)
    r_liq, _ = ipca_plus_ret_liquido(taxa_m, max(anos_restantes, 0.1))
    r_m = (1 + r_liq) ** (anos_restantes)
    total_real_aportes_b += APORTE_MENSAL * r_m

s2b_fv = PV_exist_real + total_real_aportes_b
# Retorno implicito
s2b_total_investido_real = PATRIMONIO_INICIAL + APORTE_MENSAL * MESES
# Para calcular retorno anualizado implicito, usar solver
# FV = PV * (1+r)^n + PMT * [((1+r)^n - 1) / r_m] onde r_m = (1+r)^(1/12)-1
# Resolver numericamente
def fv_diff(r_anual, target_fv, pv, pmt, n_meses):
    return projecao_fv_real(r_anual, pv, pmt, n_meses) - target_fv

def brentq(f, a, b, args=(), tol=1e-12, maxiter=300):
    """Bisection solver (drop-in replacement for scipy.optimize.brentq)."""
    fa = f(a, *args)
    for _ in range(maxiter):
        mid = (a + b) / 2
        fm = f(mid, *args)
        if abs(fm) < tol or (b - a) / 2 < tol:
            return mid
        if fa * fm < 0:
            b = mid
        else:
            a, fa = mid, fm
    return (a + b) / 2

s2b_ret = brentq(fv_diff, 0.01, 0.15, args=(s2b_fv, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES))
s2b_fv_nom = fv_real_to_nominal(s2b_fv, HORIZONTE_ANOS)
s2b_swr = swr_necessario(GASTOS_ANUAIS, s2b_fv)

taxa_media_b = sum(
    (0.0716 - (0.0716 - 0.0650) * (m - 1) / 59 if m <= 60 else 0.0650)
    for m in range(1, MESES + 1)
) / MESES
print(f"    Taxa media de compra dos aportes: {taxa_media_b*100:.2f}%")
print(f"    PV existente (real, 11a): R${PV_exist_real:,.0f}")
print(f"    FV aportes (real): R${total_real_aportes_b:,.0f}")
print(f"    >>> FV total real: R${s2b_fv:,.0f}")
print(f"    >>> RETORNO REAL LIQUIDO IMPLICITO S2-B: {s2b_ret*100:.2f}%")

# Cenario C: queda para 6.0% em 3 anos; abaixo de 6.0% aportes param (vao para JPGL)
print(f"\n  S2-C (queda 7.16% -> 6.00% em 3 anos):")
print(f"    Quando taxa < 6.0%, novos aportes IPCA+ param (vao para JPGL).")
print(f"    Modelar: posicao existente + aportes ate taxa=6.0% em IPCA+,")
print(f"    aportes remanescentes em JPGL (equity).\n")

# Aportes IPCA+: mes 1-36, taxa declina 7.16% -> 6.00%. No mes 36 taxa = 6.0%.
# Depois: aportes vao para JPGL.
total_real_aportes_c_rf = 0
total_real_aportes_c_eq = 0
meses_ipca_c = 36  # taxa atinge 6.0% no mes 36

for m in range(1, MESES + 1):
    meses_restantes = MESES - m
    anos_restantes = meses_restantes / 12

    if m <= meses_ipca_c:
        # Aporte em IPCA+
        taxa_m = 0.0716 - (0.0716 - 0.0600) * (m - 1) / (meses_ipca_c - 1)
        if anos_restantes < 0.01:
            total_real_aportes_c_rf += APORTE_MENSAL
            continue
        r_liq, _ = ipca_plus_ret_liquido(taxa_m, max(anos_restantes, 0.1))
        total_real_aportes_c_rf += APORTE_MENSAL * (1 + r_liq) ** anos_restantes
    else:
        # Aporte em JPGL (equity)
        if anos_restantes < 0.01:
            total_real_aportes_c_eq += APORTE_MENSAL
            continue
        jpgl_brl = ret_brl(RET_USD['JPGL'])
        r_liq_eq, _ = equity_ret_liquido_anualizado(jpgl_brl, max(anos_restantes, 0.5),
                                                      ter=TER['JPGL'])
        total_real_aportes_c_eq += APORTE_MENSAL * (1 + r_liq_eq) ** anos_restantes

s2c_fv = PV_exist_real + total_real_aportes_c_rf + total_real_aportes_c_eq
s2c_ret = brentq(fv_diff, 0.001, 0.15, args=(s2c_fv, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES))
s2c_fv_nom = fv_real_to_nominal(s2c_fv, HORIZONTE_ANOS)
s2c_swr = swr_necessario(GASTOS_ANUAIS, s2c_fv)

taxa_media_c = sum(
    0.0716 - (0.0716 - 0.0600) * (m - 1) / (meses_ipca_c - 1)
    for m in range(1, meses_ipca_c + 1)
) / meses_ipca_c
print(f"    Taxa media IPCA+ (meses 1-36): {taxa_media_c*100:.2f}%")
print(f"    PV existente (real, 11a): R${PV_exist_real:,.0f}")
print(f"    FV aportes IPCA+ (36 meses, real): R${total_real_aportes_c_rf:,.0f}")
print(f"    FV aportes JPGL (96 meses, real): R${total_real_aportes_c_eq:,.0f}")
print(f"    >>> FV total real: R${s2c_fv:,.0f}")
print(f"    >>> RETORNO REAL LIQUIDO IMPLICITO S2-C: {s2c_ret*100:.2f}%")

# S2-A projecao
s2a_fv = projecao_fv_real(s2a_ret, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES)
s2a_fv_nom = fv_real_to_nominal(s2a_fv, HORIZONTE_ANOS)
s2a_swr = swr_necessario(GASTOS_ANUAIS, s2a_fv)

print(f"\n  --- Resumo S2 ---")
for label, ret, fv in [("S2-A (7.16%)", s2a_ret, s2a_fv),
                         ("S2-B (7.16%->6.5%)", s2b_ret, s2b_fv),
                         ("S2-C (7.16%->6.0%+JPGL)", s2c_ret, s2c_fv)]:
    fv_n = fv_real_to_nominal(fv, HORIZONTE_ANOS)
    swr = swr_necessario(GASTOS_ANUAIS, fv)
    print(f"  {label}: ret={ret*100:.2f}%, FV_real=R${fv:,.0f}, FV_nom=R${fv_n:,.0f}, SWR={swr*100:.2f}%")


# =============================================================================
# S3 — CARTEIRA TARGET COM FACTOR DECAY -35% (McLean & Pontiff 2016)
# =============================================================================

print("\n" + "=" * 80)
print("S3 — CARTEIRA TARGET COM FACTOR DECAY -35% (M&P 2016)")
print("=" * 80)

MARKET_USD = RET_USD["SWRD"]  # 4.9%

s3_rets = {}
for etf in PESOS_TARGET:
    prem = FACTOR_PREMIUM[etf]
    prem_decayed = prem * (1 - MP_DECAY)
    r_usd = MARKET_USD + prem_decayed
    r_brl = ret_brl(r_usd)
    s3_rets[etf] = r_brl
    print(f"  {etf}: premium {prem*100:.1f}pp * (1-35%) = {prem_decayed*100:.2f}pp | "
          f"USD {r_usd*100:.2f}% | BRL {r_brl*100:.2f}%")

s3_pond_brl = sum(PESOS_TARGET[e] * s3_rets[e] for e in PESOS_TARGET)
print(f"\n  Ret ponderado BRL bruto: {s3_pond_brl*100:.3f}%")

# TER medio ponderado target
ter_pond = sum(PESOS_TARGET[e] * TER[e] for e in PESOS_TARGET)
print(f"  TER medio ponderado: {ter_pond*100:.3f}%")

s3_ret, s3_d = equity_ret_liquido_anualizado(s3_pond_brl, HORIZONTE_ANOS, ter=ter_pond)

print(f"\n  Custos all-in (mesmo de S1 exceto TER):")
print(f"    Ret real net recorrentes: {s3_d['ret_real_net']*100:.3f}%")
print(f"    Ret nominal: {s3_d['ret_nom_anual']*100:.3f}%")
print(f"    VF liq (por R$1): {s3_d['vf_liq']:.4f}")
print(f"    >>> RETORNO REAL LIQUIDO ALL-IN S3: {s3_ret*100:.2f}%")

s3_fv = projecao_fv_real(s3_ret, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES)
s3_fv_nom = fv_real_to_nominal(s3_fv, HORIZONTE_ANOS)
s3_swr = swr_necessario(GASTOS_ANUAIS, s3_fv)

print(f"\n  FV real: R${s3_fv:,.0f}")
print(f"  FV nominal: R${s3_fv_nom:,.0f}")
print(f"  SWR necessario: {s3_swr*100:.2f}%")


# =============================================================================
# S4 — CARTEIRA ATUAL (duas versoes)
# =============================================================================

print("\n" + "=" * 80)
print("S4 — CARTEIRA ATUAL")
print("=" * 80)

# Composicao atual
EQUITY_TOTAL = 1_304_850 + 987_969 + 857_179 + 11_383  # = R$3,161,381
RF_reserva = 87_862   # IPCA+ 2029
RF_legado = 13_308    # IPCA+ 2040
RF_renda = 111_992    # Renda+ 2065
CRIPTO = 108_089      # HODL11 + spot

# Verificacao
soma = EQUITY_TOTAL + RF_reserva + RF_legado + RF_renda + CRIPTO
print(f"\n  Composicao atual:")
print(f"    Equity: R${EQUITY_TOTAL:,.0f} ({EQUITY_TOTAL/PATRIMONIO_INICIAL*100:.1f}%)")
print(f"    IPCA+ 2029: R${RF_reserva:,.0f} ({RF_reserva/PATRIMONIO_INICIAL*100:.1f}%)")
print(f"    IPCA+ 2040: R${RF_legado:,.0f} ({RF_legado/PATRIMONIO_INICIAL*100:.1f}%)")
print(f"    Renda+ 2065: R${RF_renda:,.0f} ({RF_renda/PATRIMONIO_INICIAL*100:.1f}%)")
print(f"    Cripto: R${CRIPTO:,.0f} ({CRIPTO/PATRIMONIO_INICIAL*100:.1f}%)")
print(f"    Soma: R${soma:,.0f} ({soma/PATRIMONIO_INICIAL*100:.1f}%)")
print(f"    Gap vs patrimonio: R${PATRIMONIO_INICIAL - soma:,.0f}")

# Pesos equity bloco
eq_pesos = {
    "SWRD": 1_304_850 / EQUITY_TOTAL,
    "AVGS-like": 987_969 / EQUITY_TOTAL,
    "AVEM-like": 857_179 / EQUITY_TOTAL,
    "JPGL-like": 11_383 / EQUITY_TOTAL,
}

# Retornos equity
# AVEM-like: EIMI ~59% (EM neutro 5.1% USD) + AVES/DGS ~41% (EM value ~5.5% USD)
EIMI_sh = 96.1 / (96.1 + 56.1 + 11.3)  # 58.8%
AVEM_like_USD = EIMI_sh * 0.051 + (1 - EIMI_sh) * 0.055  # 5.26%
# JPGL-like: so IWVL (value only) ~ 5.5% USD (sem momentum/quality)
JPGL_like_USD = 0.055

eq_ret_brl = {
    "SWRD": ret_brl(RET_USD["SWRD"]),         # 5.40%
    "AVGS-like": ret_brl(RET_USD["AVGS"]),     # 6.50% (proxy aceitavel)
    "AVEM-like": ret_brl(AVEM_like_USD),        # 5.76%
    "JPGL-like": ret_brl(JPGL_like_USD),        # 6.00%
}

# Nota do prompt: AVEM-like media 5.76% BRL. Verificar:
print(f"\n  AVEM-like: EIMI {EIMI_sh*100:.0f}% * 5.1% + AVES/DGS {(1-EIMI_sh)*100:.0f}% * 5.5% = {AVEM_like_USD*100:.2f}% USD -> {ret_brl(AVEM_like_USD)*100:.2f}% BRL")
print(f"  Prompt diz ~5.76% BRL. Calculo: {ret_brl(AVEM_like_USD)*100:.2f}%. ", end="")
# Prompt usa: EIMI 60% neutro EM 5.1% USD -> 5.6% BRL + AVES/DGS 40% value EM 5.5% USD -> 6.0% BRL -> media 5.76%
# Meu calculo: exato do prompt
prompt_avem = 0.60 * ret_brl(0.051) + 0.40 * ret_brl(0.055)
print(f"Prompt method: 0.60*{ret_brl(0.051)*100:.1f}% + 0.40*{ret_brl(0.055)*100:.1f}% = {prompt_avem*100:.2f}%")
# Usar o calculo exato do prompt (60/40 vs meu 59/41 -> diferenca minima)
eq_ret_brl["AVEM-like"] = prompt_avem  # usar 5.76% conforme prompt

s4_eq_ret_brl = sum(eq_pesos[e] * eq_ret_brl[e] for e in eq_pesos)
print(f"\n  Retorno ponderado equity bloco (BRL bruto): {s4_eq_ret_brl*100:.3f}%")

# TER medio ponderado atual (aproximado)
# SWRD 0.12%, AVUV/AVDV/USSC/AVGS ~0.25%, EIMI 0.18%, AVES 0.36%, DGS 0.63%, IWVL 0.30%
# Simplificacao: usar TER ponderado ~0.22% (medio entre todos)
ter_s4 = (eq_pesos["SWRD"] * 0.0012 + eq_pesos["AVGS-like"] * 0.0025 +
          eq_pesos["AVEM-like"] * 0.0030 + eq_pesos["JPGL-like"] * 0.0030)
print(f"  TER medio ponderado equity: {ter_s4*100:.3f}%")

# Retorno liquido equity bloco
s4_eq_ret_liq, _ = equity_ret_liquido_anualizado(s4_eq_ret_brl, HORIZONTE_ANOS, ter=ter_s4)

# RF retornos liquidos
# IPCA+ 2029: vence em 3 anos. Taxa de compra desconhecida, estimar ~5.5% bruta
rf_2029_ret, _ = ipca_plus_ret_liquido(0.055, 3)
# IPCA+ 2040 legado: taxa de compra desconhecida, usando 5.9% bruta como proxy
rf_2040_ret, _ = ipca_plus_ret_liquido(0.059, 14)
# Renda+ 2065: taxa ~6.5-7% na epoca. Usando 5.9% real liquido conforme prompt
rf_renda_ret = 0.059  # proxy direto (prompt: "usar 5.9% real liquido")

# Cripto cenarios
CRIPTO_RET = {"A": 0.00, "B": 0.05, "C": 0.15}

print(f"\n  RF retornos reais liquidos:")
print(f"    IPCA+ 2029 (3a): {rf_2029_ret*100:.2f}%")
print(f"    IPCA+ 2040 (14a): {rf_2040_ret*100:.2f}%")
print(f"    Renda+ 2065: {rf_renda_ret*100:.2f}% (proxy)")
print(f"    Cripto: A={CRIPTO_RET['A']*100:.0f}%, B={CRIPTO_RET['B']*100:.0f}%, C={CRIPTO_RET['C']*100:.0f}%")


# --- S4-a: ESTATICO (pesos atuais por 11 anos) ---

print(f"\n  --- S4-a: ESTATICO (pesos atuais por 11 anos) ---")

w = {
    "equity": EQUITY_TOTAL / PATRIMONIO_INICIAL,
    "rf_2029": RF_reserva / PATRIMONIO_INICIAL,
    "rf_2040": RF_legado / PATRIMONIO_INICIAL,
    "renda": RF_renda / PATRIMONIO_INICIAL,
    "cripto": CRIPTO / PATRIMONIO_INICIAL,
}

for cen_cripto in ["A", "B", "C"]:
    cr = CRIPTO_RET[cen_cripto]
    # Retorno ponderado total
    # Nota: IPCA+ 2029 vence em 3 anos -> depois os 8 anos restantes, o que acontece?
    # Em shadow estatico, assumir que capital e reinvestido a mesma taxa (simplificacao)
    # Ou mais rigoroso: capital vence em 2029, reinveste a taxa vigente
    # Para shadow estatico puro: usar retorno medio ponderado como se fosse uniforme
    # Usar rf_2029_ret para a parcela de reserva (conservador)
    ret_total = (w["equity"] * s4_eq_ret_liq +
                 w["rf_2029"] * rf_2029_ret +
                 w["rf_2040"] * rf_2040_ret +
                 w["renda"] * rf_renda_ret +
                 w["cripto"] * cr)

    fv = projecao_fv_real(ret_total, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES)
    fv_n = fv_real_to_nominal(fv, HORIZONTE_ANOS)
    swr = swr_necessario(GASTOS_ANUAIS, fv)

    print(f"\n    Cripto cenario {cen_cripto} ({cr*100:.0f}% real):")
    print(f"      Ret ponderado: {w['equity']:.3f}*{s4_eq_ret_liq*100:.2f}% + "
          f"{w['rf_2029']:.3f}*{rf_2029_ret*100:.2f}% + "
          f"{w['rf_2040']:.3f}*{rf_2040_ret*100:.2f}% + "
          f"{w['renda']:.3f}*{rf_renda_ret*100:.2f}% + "
          f"{w['cripto']:.3f}*{cr*100:.1f}%")
    print(f"      = {ret_total*100:.2f}%")
    print(f"      FV real: R${fv:,.0f} | FV nom: R${fv_n:,.0f} | SWR: {swr*100:.2f}%")


# --- S4-b: DINAMICO (converge para target via aportes R$25k/mes) ---

print(f"\n  --- S4-b: DINAMICO (converge para target via aportes R$25k/mes) ---")
print(f"  Regra: aportes focam JPGL ate convergir ~20%, depois IPCA+ ate 15%.")

# Simulacao mes a mes
# Blocos: SWRD, AVGS, AVEM, JPGL, IPCA+_longo, reserva, legado, renda, cripto
# Target aos 50: equity 79% (SWRD 35%, AVGS 25%, AVEM 20%, JPGL 20%), IPCA+ 15%, cripto 3%

for cen_cripto in ["A", "B", "C"]:
    cr = CRIPTO_RET[cen_cripto]

    # Retornos mensais reais liquidos (pre-calculados)
    # Equity: usar retorno liquido all-in (ja calculado), converter para mensal
    # Simplificacao: cada bloco equity cresce a seu retorno liquido
    eq_rets_liq = {}
    for etf_key, brl_ret in [("SWRD", ret_brl(RET_USD["SWRD"])),
                               ("AVGS", ret_brl(RET_USD["AVGS"])),
                               ("AVEM", prompt_avem),
                               ("JPGL", ret_brl(RET_USD["JPGL"]))]:
        r_liq, _ = equity_ret_liquido_anualizado(brl_ret, HORIZONTE_ANOS,
                                                   ter=TER.get(etf_key, 0.0025))
        eq_rets_liq[etf_key] = (1 + r_liq) ** (1/12) - 1

    # RF retornos mensais
    # IPCA+ longo: novos aportes a 7.16% (cenario A de S2)
    rf_longo_ret_mensal = (1 + s2a_ret) ** (1/12) - 1
    rf_2029_ret_mensal = (1 + rf_2029_ret) ** (1/12) - 1
    rf_2040_ret_mensal = (1 + rf_2040_ret) ** (1/12) - 1
    rf_renda_ret_mensal = (1 + rf_renda_ret) ** (1/12) - 1
    cripto_ret_mensal = (1 + cr) ** (1/12) - 1

    # Estado inicial
    blocos = {
        "SWRD": 1_304_850.0,
        "AVGS": 987_969.0,
        "AVEM": 857_179.0,
        "JPGL": 11_383.0,
        "IPCA_longo": 0.0,
        "reserva": float(RF_reserva),
        "legado": float(RF_legado),
        "renda": float(RF_renda),
        "cripto": float(CRIPTO),
    }

    rets_mensal = {
        "SWRD": eq_rets_liq["SWRD"],
        "AVGS": eq_rets_liq["AVGS"],
        "AVEM": eq_rets_liq["AVEM"],
        "JPGL": eq_rets_liq["JPGL"],
        "IPCA_longo": rf_longo_ret_mensal,
        "reserva": rf_2029_ret_mensal,
        "legado": rf_2040_ret_mensal,
        "renda": rf_renda_ret_mensal,
        "cripto": cripto_ret_mensal,
    }

    for m in range(1, MESES + 1):
        # Crescer todos os blocos
        for k in blocos:
            blocos[k] *= (1 + rets_mensal[k])

        # Reserva vence em 2029 (mes ~36). Capital vai para IPCA+ longo
        if m == 36:
            blocos["IPCA_longo"] += blocos["reserva"]
            blocos["reserva"] = 0

        # Aporte mensal: decidir destino
        total = sum(blocos.values())
        eq_total = blocos["SWRD"] + blocos["AVGS"] + blocos["AVEM"] + blocos["JPGL"]
        ipca_total = blocos["IPCA_longo"] + blocos["legado"]

        # Pesos atuais
        jpgl_pct = blocos["JPGL"] / total if total > 0 else 0
        ipca_pct = ipca_total / total if total > 0 else 0

        # Regra de aporte: JPGL ate 20%, depois IPCA+ ate 15%
        if jpgl_pct < 0.20:
            blocos["JPGL"] += APORTE_MENSAL
        elif ipca_pct < 0.15:
            blocos["IPCA_longo"] += APORTE_MENSAL
        else:
            # Distribuir pro-rata entre equity target
            for etf in ["SWRD", "AVGS", "AVEM", "JPGL"]:
                tgt = {"SWRD": 0.35, "AVGS": 0.25, "AVEM": 0.20, "JPGL": 0.20}
                blocos[etf] += APORTE_MENSAL * tgt[etf]

    fv = sum(blocos.values())
    fv_n = fv_real_to_nominal(fv, HORIZONTE_ANOS)
    swr = swr_necessario(GASTOS_ANUAIS, fv)

    # Retorno implicito
    ret_imp = brentq(fv_diff, 0.001, 0.15, args=(fv, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES))

    # Pesos finais
    total_final = sum(blocos.values())

    if cen_cripto == "A":
        print(f"\n    Pesos finais (cripto {cen_cripto}):")
        for k, v in blocos.items():
            print(f"      {k}: R${v:,.0f} ({v/total_final*100:.1f}%)")

    print(f"\n    Cripto cenario {cen_cripto} ({cr*100:.0f}% real):")
    print(f"      Ret real liquido implicito: {ret_imp*100:.2f}%")
    print(f"      FV real: R${fv:,.0f} | FV nom: R${fv_n:,.0f} | SWR: {swr*100:.2f}%")


# =============================================================================
# TABELA COMPARATIVA FINAL
# =============================================================================

print("\n\n" + "=" * 100)
print("TABELA COMPARATIVA FINAL — TODOS OS SHADOWS, BASE LIQUIDA ALL-IN")
print("=" * 100)

# Recalcular todos em formato tabular
rows = []

# S1
rows.append(("S1: VWRA puro", s1_ret, s1_fv, s1_fv_nom, s1_swr))

# S2 (3 cenarios)
rows.append(("S2-A: IPCA+ 7.16% const", s2a_ret, s2a_fv, s2a_fv_nom, s2a_swr))
rows.append(("S2-B: IPCA+ 7.16%->6.5%", s2b_ret, s2b_fv, s2b_fv_nom, s2b_swr))
rows.append(("S2-C: IPCA+ 7.16%->6.0%+JPGL", s2c_ret, s2c_fv, s2c_fv_nom, s2c_swr))

# S3
rows.append(("S3: Factor decay -35%", s3_ret, s3_fv, s3_fv_nom, s3_swr))

# S4-a estatico (cripto B como central)
for cen in ["A", "B", "C"]:
    cr = CRIPTO_RET[cen]
    ret_t = (w["equity"] * s4_eq_ret_liq +
             w["rf_2029"] * rf_2029_ret +
             w["rf_2040"] * rf_2040_ret +
             w["renda"] * rf_renda_ret +
             w["cripto"] * cr)
    fv_t = projecao_fv_real(ret_t, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES)
    fv_n_t = fv_real_to_nominal(fv_t, HORIZONTE_ANOS)
    swr_t = swr_necessario(GASTOS_ANUAIS, fv_t)
    rows.append((f"S4a-{cen}: Atual estatico (cripto {cen})", ret_t, fv_t, fv_n_t, swr_t))

# S4-b dinamico: re-simulate for table
for cen_cripto in ["A", "B", "C"]:
    cr = CRIPTO_RET[cen_cripto]

    blocos = {
        "SWRD": 1_304_850.0, "AVGS": 987_969.0, "AVEM": 857_179.0, "JPGL": 11_383.0,
        "IPCA_longo": 0.0, "reserva": float(RF_reserva), "legado": float(RF_legado),
        "renda": float(RF_renda), "cripto": float(CRIPTO),
    }
    rets_m = {
        "SWRD": eq_rets_liq["SWRD"], "AVGS": eq_rets_liq["AVGS"],
        "AVEM": eq_rets_liq["AVEM"], "JPGL": eq_rets_liq["JPGL"],
        "IPCA_longo": rf_longo_ret_mensal, "reserva": rf_2029_ret_mensal,
        "legado": rf_2040_ret_mensal, "renda": rf_renda_ret_mensal,
        "cripto": (1 + cr) ** (1/12) - 1,
    }

    for m_i in range(1, MESES + 1):
        for k in blocos:
            blocos[k] *= (1 + rets_m[k])
        if m_i == 36:
            blocos["IPCA_longo"] += blocos["reserva"]
            blocos["reserva"] = 0
        total_m = sum(blocos.values())
        jpgl_p = blocos["JPGL"] / total_m if total_m > 0 else 0
        ipca_p = (blocos["IPCA_longo"] + blocos["legado"]) / total_m if total_m > 0 else 0

        if jpgl_p < 0.20:
            blocos["JPGL"] += APORTE_MENSAL
        elif ipca_p < 0.15:
            blocos["IPCA_longo"] += APORTE_MENSAL
        else:
            for etf in ["SWRD", "AVGS", "AVEM", "JPGL"]:
                tgt = {"SWRD": 0.35, "AVGS": 0.25, "AVEM": 0.20, "JPGL": 0.20}
                blocos[etf] += APORTE_MENSAL * tgt[etf]

    fv_d = sum(blocos.values())
    fv_n_d = fv_real_to_nominal(fv_d, HORIZONTE_ANOS)
    swr_d = swr_necessario(GASTOS_ANUAIS, fv_d)
    ret_d = brentq(fv_diff, 0.001, 0.15, args=(fv_d, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES))
    rows.append((f"S4b-{cen_cripto}: Atual dinamico (cripto {cen_cripto})", ret_d, fv_d, fv_n_d, swr_d))

# Print table
header = f"{'Shadow':<38} {'Ret real liq':>12} {'FV real':>14} {'FV nominal':>14} {'SWR':>8}"
print(f"\n{header}")
print("-" * len(header))

for name, ret_r, fv_r, fv_n, swr_v in rows:
    print(f"{name:<38} {ret_r*100:>11.2f}% R${fv_r/1e6:>12.2f}M R${fv_n/1e6:>12.2f}M {swr_v*100:>7.2f}%")

print(f"\n  Referencia: SWR < 3.5% = confortavel | 3.5-4.0% = OK | > 4.0% = risco elevado")
print(f"  Todos os retornos: reais, liquidos, all-in (pos-tax, pos-cost, pos-FX)")
print(f"  FV real = poder de compra em R$ de hoje | FV nominal = R$ correntes em 2037")
print(f"  Gastos FIRE: R${GASTOS_ANUAIS:,}/ano em R$ de hoje")


# =============================================================================
# FINDINGS E FLAGS
# =============================================================================

print("\n\n" + "=" * 80)
print("FINDINGS E FLAGS")
print("=" * 80)

print("""
1. S2-A (IPCA+ 7.16%) provavelmente e o teto do S2 — taxas futuras podem ser menores.
   S2-B e S2-C mostram sensibilidade. S2-C introduz componente equity (JPGL) quando
   taxa cai abaixo de 6.0%.

2. S4 dinamico converge para target ao longo de 11 anos. A maior fonte de variacao
   vs estatico e a concentracao inicial em JPGL (custo de oportunidade nos primeiros
   anos vs diversificacao posterior).

3. Cripto: com 3% do patrimonio, a diferenca entre cenario A (0%) e C (15%) no FV
   total e limitada mas mensuravel. Calcular delta exato na tabela.

4. IR sobre ganho nominal: metodo correto para equity e IPCA+.
   - Equity: IR incide no resgate sobre (VF_nominal - custo_aquisicao)
   - IPCA+: IR incide no resgate/vencimento sobre ganho nominal acumulado
   Ambos beneficiam-se de tax deferral (IR so no final).

5. FX costs (2.7% total ida e volta): amortizados implicitamente pelo metodo
   de calculo (reduzem capital na entrada e valor no resgate). Nao sao anualizados
   artificialmente — o impacto exato depende do horizonte.

6. AVEM-like usa proxy 60/40 conforme prompt (EIMI neutro + AVES/DGS value).
   Diferenca vs calculo exato (59/41): < 1bp. Imaterial.
""")

print("Script: analysis/shadow_audit_v2.py")
print("Para reproduzir: python3 analysis/shadow_audit_v2.py")
