"""
Shadow/Benchmark Audit — Quant Agent
Audita as 4 shadows propostas para comparacao com carteira Diego Target.
Data: 2026-03-22

Premissas fonte: carteira.md (HD-006 final, aprovado 2026-03-22)
"""

# =============================================================================
# PREMISSAS APROVADAS (carteira.md)
# =============================================================================

PATRIMONIO_INICIAL = 3_482_633  # BRL
APORTE_MENSAL = 25_000          # BRL
HORIZONTE_ANOS = 11             # 2026 -> 2037 (FIRE aos 50)
MESES = HORIZONTE_ANOS * 12    # 132 meses
IPCA_ANUAL = 0.04              # 4%/ano

# Depreciacao real BRL (cenario base)
DEP_BRL_BASE = 0.005  # 0.5%/ano

# Retornos reais USD esperados (carteira.md)
RET_USD = {
    "SWRD": 0.049,  # mercado neutro
    "AVGS": 0.060,  # small value
    "AVEM": 0.055,  # EM + value tilt
    "JPGL": 0.057,  # multifator
}

# Pesos target equity
PESOS_TARGET = {
    "SWRD": 0.35,
    "AVGS": 0.25,
    "AVEM": 0.20,
    "JPGL": 0.20,
}

# Custos equity (carteira.md)
TER = {
    "SWRD": 0.0012,
    "AVGS": 0.0023,  # Avantis TER
    "AVEM": 0.0036,  # Avantis EM TER
    "JPGL": 0.0025,  # JPGL TER
    "VWRA": 0.0022,  # VWRA TER
}

WHT = 0.0022           # 15% sobre ~1.5% yield
TRACKING_DIFF = 0.001  # ~0.10%
FX_ENTRY = 0.0135      # IOF 1.1% + spread 0.25%
FX_EXIT = 0.0135
IR_RATE = 0.15          # 15% flat sobre ganho nominal BRL

# IPCA+ HTM
IPCA_PLUS_BRUTA = 0.0716
CUSTODIA_B3 = 0.0020
IPCA_PLUS_POS_CUSTODIA = IPCA_PLUS_BRUTA - CUSTODIA_B3  # 6.96%

# McLean & Pontiff decay (fonte: perfis/14-quant.md, ips.md)
MP_DECAY = 0.35  # -35%, NAO -40%

# Factor premiums (implícitos nos retornos USD de carteira.md)
# SWRD = base 4.9%, demais = base + premium
FACTOR_PREMIUM = {
    "SWRD": 0.0,    # mercado neutro
    "AVGS": 0.011,  # 6.0% - 4.9% = 1.1pp
    "AVEM": 0.006,  # 5.5% - 4.9% = 0.6pp
    "JPGL": 0.008,  # 5.7% - 4.9% = 0.8pp
}

print("=" * 70)
print("SHADOW AUDIT — Quant Agent")
print("=" * 70)

# =============================================================================
# FUNCAO: Projecao FV com aportes mensais
# =============================================================================

def projecao_fv(ret_anual_real_brl, patrimonio_ini, aporte_mensal, meses):
    """
    Projecao de patrimonio com aportes mensais.
    Retorno real BRL (ja descontada inflacao).
    Formula: FV = PV * (1+r_m)^n + PMT * [((1+r_m)^n - 1) / r_m]
    onde r_m = (1 + r_anual)^(1/12) - 1
    """
    r_m = (1 + ret_anual_real_brl) ** (1/12) - 1
    fv_pv = patrimonio_ini * (1 + r_m) ** meses
    fv_pmt = aporte_mensal * (((1 + r_m) ** meses - 1) / r_m)
    return fv_pv + fv_pmt


def ret_brl_base(ret_usd, dep_brl=DEP_BRL_BASE):
    """Retorno real BRL = retorno real USD + depreciacao real BRL"""
    return ret_usd + dep_brl


def equity_ret_liquido(ret_real_brl, horizonte_anos, ipca=IPCA_ANUAL,
                        fx_entry=FX_ENTRY, fx_exit=FX_EXIT, ir=IR_RATE,
                        ter=0.0, wht=WHT, td=TRACKING_DIFF):
    """
    Retorno liquido all-in de equity.

    Custos anuais recorrentes: TER, WHT, tracking diff -> reduzem retorno anual
    Custos one-off: FX entrada (no inicio), FX saida (no fim), IR sobre ganho nominal

    Metodo:
    1. Retorno real BRL pre-tax anual = ret_real_brl - TER - WHT - TD
    2. Converter para nominal: (1 + ret_real) * (1 + ipca) - 1
    3. Acumular por horizonte
    4. Aplicar FX entry cost no capital inicial (reduz capital investido)
    5. Aplicar FX exit + IR sobre ganho nominal no resgate
    """
    # Custos anuais
    ret_real_net = ret_real_brl - ter - wht - td

    # Nominal
    ret_nominal_anual = (1 + ret_real_net) * (1 + ipca) - 1

    # Acumulado nominal em N anos (por R$1 investido)
    acum_nominal = (1 + ret_nominal_anual) ** horizonte_anos

    # FX entry: capital efetivamente investido = 1 - fx_entry
    capital_investido = 1 - fx_entry
    valor_final_bruto = capital_investido * acum_nominal

    # Ganho nominal
    ganho_nominal = valor_final_bruto - 1  # base de custo = R$1 original

    # IR sobre ganho nominal
    ir_pago = max(0, ganho_nominal) * ir

    # FX exit sobre valor final
    valor_pos_fx_exit = valor_final_bruto * (1 - fx_exit)

    # Valor final liquido
    valor_final_liq = valor_pos_fx_exit - ir_pago

    # Retorno real liquido anualizado
    ret_nominal_liq = valor_final_liq ** (1 / horizonte_anos) - 1
    ret_real_liq = (1 + ret_nominal_liq) / (1 + ipca) - 1

    return ret_real_liq, {
        "ret_real_net_anual": ret_real_net,
        "ret_nominal_anual": ret_nominal_anual,
        "acum_nominal": acum_nominal,
        "capital_investido": capital_investido,
        "valor_final_bruto": valor_final_bruto,
        "ganho_nominal": ganho_nominal,
        "ir_pago": ir_pago,
        "valor_final_liq": valor_final_liq,
    }


print("\n" + "=" * 70)
print("VALIDACAO: Retorno ponderado equity target BRL base (pre-tax, pre-cost)")
print("=" * 70)
ret_pond = sum(PESOS_TARGET[e] * ret_brl_base(RET_USD[e]) for e in PESOS_TARGET)
print(f"  0.35*{ret_brl_base(RET_USD['SWRD']):.3f} + 0.25*{ret_brl_base(RET_USD['AVGS']):.3f} "
      f"+ 0.20*{ret_brl_base(RET_USD['AVEM']):.3f} + 0.20*{ret_brl_base(RET_USD['JPGL']):.3f}")
print(f"  = {ret_pond:.4f} = {ret_pond*100:.2f}%")
print(f"  Carteira.md diz: 5.89%. {'OK' if abs(ret_pond - 0.0589) < 0.0001 else 'DIVERGE'}")


# =============================================================================
# S1 — VWRA puro (100% equity, sem factor tilt)
# =============================================================================

print("\n" + "=" * 70)
print("S1 — VWRA PURO (100% equity global, sem factor tilt)")
print("=" * 70)

# VWRA = FTSE All-World = ~60% US, ~30% DM ex-US, ~12% EM
# SWRD = MSCI World = DM only (sem EM)
# Usar retorno SWRD (4.9% USD) para VWRA ignora que VWRA tem ~12% EM
# EM expected return (AQR): 5.1% USD.
# Ajuste: VWRA ~= 0.88 * SWRD + 0.12 * EM_base
# Mas AVEM usa 5.5% (com value tilt). EM base puro (sem tilt) ~= 5.1% (AQR)
# Entao VWRA USD ~= 0.88 * 4.9% + 0.12 * 5.1% = 4.924%
# Diferenca vs SWRD puro: 0.024pp -> trivial

VWRA_USD_CORRETO = 0.88 * 0.049 + 0.12 * 0.051
VWRA_BRL = ret_brl_base(VWRA_USD_CORRETO)

print(f"  VWRA USD (com EM): 0.88*4.9% + 0.12*5.1% = {VWRA_USD_CORRETO*100:.3f}%")
print(f"  VWRA BRL base: {VWRA_BRL*100:.3f}%")
print(f"  vs premissa usada (5.40% = SWRD): diferenca = {(VWRA_BRL - 0.054)*100:.3f}pp")
print(f"  -> Diferenca trivial (~2bps). Premissa de 5.40% aceitavel.")

# TER: VWRA = 0.22% vs SWRD = 0.12%
print(f"\n  TER VWRA: {TER['VWRA']*100:.2f}% vs SWRD: {TER['SWRD']*100:.2f}%")
print(f"  Diferenca TER: {(TER['VWRA'] - TER['SWRD'])*100:.2f}pp")

# Retorno liquido all-in
s1_ret_liq, s1_detail = equity_ret_liquido(
    VWRA_BRL, HORIZONTE_ANOS, ter=TER['VWRA']
)
print(f"\n  Retorno real liquido all-in (11 anos): {s1_ret_liq*100:.2f}%")
print(f"    Detalhe: ret_real_net={s1_detail['ret_real_net_anual']*100:.2f}%, "
      f"nominal={s1_detail['ret_nominal_anual']*100:.2f}%")

# NOTA: Para shadow comparison, FX entry/exit sao custos REAIS que Diego paga
# em qualquer cenario equity. Mas para comparar ESTRATEGIAS (VWRA vs tilts),
# o FX cost cancela (ambos pagam). Calcular AMBOS: com e sem FX.

s1_ret_liq_no_fx, _ = equity_ret_liquido(
    VWRA_BRL, HORIZONTE_ANOS, ter=TER['VWRA'], fx_entry=0, fx_exit=0
)
print(f"  Retorno real liquido SEM FX (p/ comparacao entre estrategias): {s1_ret_liq_no_fx*100:.2f}%")

# Projecao patrimonial
# Para projecao, usar retorno liquido COM FX para novos aportes
# Mas patrimonio existente ja esta investido (ja pagou FX entry)
# Modelagem simplificada: usar retorno liquido uniforme
# Nota: isso superestima ligeiramente (patrimonio existente nao paga FX entry de novo)

# Melhor modelagem: patrimonio existente cresce a ret sem FX entry; aportes novos a ret com FX entry
s1_ret_existente, _ = equity_ret_liquido(
    VWRA_BRL, HORIZONTE_ANOS, ter=TER['VWRA'], fx_entry=0, fx_exit=FX_EXIT
)
s1_ret_novos = s1_ret_liq  # com FX entry e exit

# Para simplificacao e comparabilidade, usar retorno unico (media ponderada aproximada)
# Aporte total em 11 anos: 25k * 132 = R$3.3M. Patrimonio inicial: R$3.48M.
# Proporcao: ~51% existente, ~49% novos aportes (em valor nominal, sem crescimento)
# Mas com crescimento o existente domina. Usar retorno com FX entry como conservador.

# Projecao com retorno BRUTO (pre-tax) para comparar com numeros do prompt
# O prompt usa 5.40% sem especificar se e bruto ou liquido
s1_fv_bruto = projecao_fv(0.054, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES)
s1_fv_liq = projecao_fv(s1_ret_liq, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES)

print(f"\n  Patrimonio aos 50 (ret bruto 5.40%, como no prompt): R${s1_fv_bruto:,.0f}")
print(f"  Patrimonio aos 50 (ret liquido all-in {s1_ret_liq*100:.2f}%): R${s1_fv_liq:,.0f}")
print(f"  Prompt diz: R$10.56M")
print(f"  Delta vs prompt (bruto): {(s1_fv_bruto/10_560_000 - 1)*100:+.1f}%")


# =============================================================================
# S2 — 100% IPCA+ HTM
# =============================================================================

print("\n" + "=" * 70)
print("S2 — 100% IPCA+ HTM")
print("=" * 70)

# Calculo IPCA+ liquido (carteira.md)
# Taxa bruta: 7.16%
# Custodia B3: -0.20%
# Pos-custodia: 6.96%
# Nominal bruto: (1.0696)(1.04) - 1 = 11.24%
# Nominal liquido (IR 15%): 11.24% * 0.85 = 9.55%
# Real liquido: (1.0955 / 1.04) - 1 = 5.34%... mas carteira.md diz ~6.0%

# Vamos recalcular com rigor
nominal_bruto = (1 + IPCA_PLUS_POS_CUSTODIA) * (1 + IPCA_ANUAL) - 1
print(f"  Nominal bruto: (1 + {IPCA_PLUS_POS_CUSTODIA:.4f}) * (1 + {IPCA_ANUAL}) - 1 = {nominal_bruto*100:.2f}%")

# IR 15% incide sobre o ganho nominal, nao sobre todo o valor
# Para R$100 investido por N anos:
# Valor final nominal = 100 * (1 + nominal_bruto)^N
# Ganho nominal = Valor final - 100
# IR = Ganho * 15%
# Valor liquido = Valor final - IR

for N in [11, 14]:
    vf_nom = 100 * (1 + nominal_bruto) ** N
    ganho = vf_nom - 100
    ir = ganho * IR_RATE
    vf_liq = vf_nom - ir
    # Deflacionar
    vf_real_liq = vf_liq / (1 + IPCA_ANUAL) ** N
    ret_real_liq_anual = (vf_real_liq / 100) ** (1/N) - 1

    # Alternativa: IR sobre rendimento anual (como se fosse resgate anual)
    # Isso NAO se aplica a TD IPCA+ que e resgate unico no vencimento

    print(f"\n  --- Hold {N} anos ---")
    print(f"  VF nominal: R${vf_nom:.2f}")
    print(f"  Ganho nominal: R${ganho:.2f}")
    print(f"  IR (15%): R${ir:.2f}")
    print(f"  VF nominal liquido: R${vf_liq:.2f}")
    print(f"  VF real liquido: R${vf_real_liq:.2f}")
    print(f"  Retorno real liquido anualizado: {ret_real_liq_anual*100:.2f}%")

# O calculo da carteira.md tem inconsistencia:
# Diz nominal liquido = 11.24% * 0.85 = 9.55%
# Mas IR 15% NAO incide sobre o retorno anual — incide sobre o GANHO TOTAL no resgate
# Quando IR incide sobre ganho total no resgate (como e o caso do TD):
# O retorno efetivo e MAIOR do que 9.55% anualizado, porque ha deferral de imposto

# Recalcular para 11 anos (horizonte dos shadows)
N_shadow = 11
vf_nom_11 = 100 * (1 + nominal_bruto) ** N_shadow
ganho_11 = vf_nom_11 - 100
ir_11 = ganho_11 * IR_RATE
vf_liq_11 = vf_nom_11 - ir_11
vf_real_liq_11 = vf_liq_11 / (1 + IPCA_ANUAL) ** N_shadow
ret_real_liq_11 = (vf_real_liq_11 / 100) ** (1/N_shadow) - 1

print(f"\n  >>> IPCA+ real liquido para shadow S2 (11 anos): {ret_real_liq_11*100:.2f}%")

# Problema: taxa de entrada variavel (DCA)
# Nao sabemos taxas futuras. Cenarios:
# a) Taxa constante 7.16% (otimista para RF)
# b) Taxa media historica ~5.5% (conservador para RF)
# c) Range: 5.5% - 7.16%
print(f"\n  NOTA: {ret_real_liq_11*100:.2f}% assume taxa constante 7.16% para TODOS os aportes.")
print(f"  Isso e OTIMISTA — taxas futuras sao incertas.")
print(f"  Se taxa media cair para 6.0% (piso operacional):")

IPCA_ALT = 0.060 - CUSTODIA_B3  # 5.80% pos-custodia
nom_alt = (1 + IPCA_ALT) * (1 + IPCA_ANUAL) - 1
vf_nom_alt = 100 * (1 + nom_alt) ** N_shadow
ganho_alt = vf_nom_alt - 100
ir_alt = ganho_alt * IR_RATE
vf_liq_alt = vf_nom_alt - ir_alt
vf_real_alt = vf_liq_alt / (1 + IPCA_ANUAL) ** N_shadow
ret_alt = (vf_real_alt / 100) ** (1/N_shadow) - 1
print(f"    Real liquido 11 anos: {ret_alt*100:.2f}%")

# Projecao S2
s2_ret = ret_real_liq_11
s2_fv = projecao_fv(s2_ret, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES)
s2_fv_prompt = projecao_fv(0.06, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES)

print(f"\n  Patrimonio aos 50 (ret real liq {s2_ret*100:.2f}%): R${s2_fv:,.0f}")
print(f"  Patrimonio aos 50 (usando 6.0% do prompt): R${s2_fv_prompt:,.0f}")
print(f"  Prompt diz: R$11.1M")
print(f"  Delta vs prompt: {(s2_fv/11_100_000 - 1)*100:+.1f}%")

# Vencimento 2040 vs FIRE 2037
print(f"\n  FLAG: TD 2040 vence em 2040. FIRE = 2037. Gap de 3 anos.")
print(f"  Se vender MtM em 2037, retorno depende da curva naquela data.")
print(f"  Se hold ate 2040, nao ha 'patrimonio aos 50' — capital fica travado.")
print(f"  Solucao para shadow: assumir mix TD 2035 (existisse) + TD 2040.")
print(f"  Ou assumir que shadow usa titulo hipotetico com vencimento 2037.")


# =============================================================================
# S3 — Carteira com factor decay -35% (McLean & Pontiff)
# =============================================================================

print("\n" + "=" * 70)
print("S3 — CARTEIRA COM FACTOR DECAY -35% (McLean & Pontiff 2016)")
print("=" * 70)

print(f"\n  FINDING: Prompt usa -40%. Premissa aprovada no codebase: -35%.")
print(f"  McLean & Pontiff 2016 media: ~32-35% (varia por fator).")
print(f"  Usando -35% conforme aprovado.\n")

MARKET_BASE_USD = RET_USD["SWRD"]  # 4.9%

for etf in ["SWRD", "AVGS", "AVEM", "JPGL"]:
    prem = FACTOR_PREMIUM[etf]
    if prem > 0:
        prem_decayed = prem * (1 - MP_DECAY)
        ret_decayed_usd = MARKET_BASE_USD + prem_decayed
    else:
        ret_decayed_usd = MARKET_BASE_USD
    ret_decayed_brl = ret_brl_base(ret_decayed_usd)
    print(f"  {etf}: premium={prem*100:.1f}pp, decayed={prem*(1-MP_DECAY)*100:.2f}pp, "
          f"USD={ret_decayed_usd*100:.2f}%, BRL={ret_decayed_brl*100:.2f}%")

# Retorno ponderado S3
s3_rets_usd = {}
for etf in PESOS_TARGET:
    prem = FACTOR_PREMIUM[etf]
    prem_decayed = prem * (1 - MP_DECAY)
    s3_rets_usd[etf] = MARKET_BASE_USD + prem_decayed

s3_pond_usd = sum(PESOS_TARGET[e] * s3_rets_usd[e] for e in PESOS_TARGET)
s3_pond_brl = ret_brl_base(s3_pond_usd)

print(f"\n  Retorno ponderado USD: {s3_pond_usd*100:.3f}%")
print(f"  Retorno ponderado BRL base: {s3_pond_brl*100:.3f}%")

# Comparar com prompt
# Prompt diz: ~5.75% BRL base
print(f"  Prompt diz: ~5.75% BRL base")
print(f"  Diferenca: {(s3_pond_brl - 0.0575)*100:.2f}pp")

# NOTA: O prompt usou decay -40%, nos usamos -35%.
# Recalcular com -40% para mostrar a diferenca:
s3_40_rets = {}
for etf in PESOS_TARGET:
    prem = FACTOR_PREMIUM[etf]
    prem_decayed = prem * (1 - 0.40)
    s3_40_rets[etf] = MARKET_BASE_USD + prem_decayed
s3_40_pond_usd = sum(PESOS_TARGET[e] * s3_40_rets[e] for e in PESOS_TARGET)
s3_40_pond_brl = ret_brl_base(s3_40_pond_usd)
print(f"  Com decay -40% (errado): {s3_40_pond_brl*100:.3f}% -> isso bate ~5.75%? {abs(s3_40_pond_brl - 0.0575) < 0.001}")

# Verificacao aritmetica do calculo com -40%:
print(f"\n  Verificacao com -40% (para checar aritmetica do prompt):")
for etf in ["SWRD", "AVGS", "AVEM", "JPGL"]:
    prem = FACTOR_PREMIUM[etf]
    prem_d = prem * 0.60
    r = MARKET_BASE_USD + prem_d
    print(f"    {etf}: {MARKET_BASE_USD*100}% + {prem_d*100:.2f}% = {r*100:.2f}% USD, {ret_brl_base(r)*100:.2f}% BRL")

val = 0.35*ret_brl_base(0.049) + 0.25*ret_brl_base(0.049+0.011*0.6) + 0.20*ret_brl_base(0.049+0.006*0.6) + 0.20*ret_brl_base(0.049+0.008*0.6)
print(f"    Ponderado (com -40%): {val*100:.3f}%")

# Com -35% (correto):
s3_ret_liq, s3_detail = equity_ret_liquido(
    s3_pond_brl, HORIZONTE_ANOS,
    ter=sum(PESOS_TARGET[e]*TER[e] for e in PESOS_TARGET)  # TER medio ponderado
)
s3_fv = projecao_fv(s3_pond_brl, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES)
s3_fv_liq = projecao_fv(s3_ret_liq, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES)

print(f"\n  TER medio ponderado: {sum(PESOS_TARGET[e]*TER[e] for e in PESOS_TARGET)*100:.3f}%")
print(f"  Retorno real liquido all-in: {s3_ret_liq*100:.2f}%")
print(f"  Patrimonio aos 50 (bruto {s3_pond_brl*100:.2f}%): R${s3_fv:,.0f}")
print(f"  Patrimonio aos 50 (liquido {s3_ret_liq*100:.2f}%): R${s3_fv_liq:,.0f}")
print(f"  Prompt diz: ~R$10.85M")


# =============================================================================
# S4 — Carteira atual (com transitorios, JPGL gap)
# =============================================================================

print("\n" + "=" * 70)
print("S4 — CARTEIRA ATUAL (com transitorios, JPGL gap)")
print("=" * 70)

# Composicao real (carteira.md)
EQUITY_TOTAL = 1_304_850 + 987_969 + 857_179 + 11_383  # = 3,161,381
print(f"  Equity total: R${EQUITY_TOTAL:,.0f}")
print(f"  % do patrimonio: {EQUITY_TOTAL/PATRIMONIO_INICIAL*100:.1f}%")

# Pesos reais no bloco equity
pesos_reais_eq = {
    "SWRD": 1_304_850 / EQUITY_TOTAL,
    "AVGS-like": 987_969 / EQUITY_TOTAL,
    "AVEM-like": 857_179 / EQUITY_TOTAL,
    "JPGL-like": 11_383 / EQUITY_TOTAL,
}
for k, v in pesos_reais_eq.items():
    print(f"  {k}: {v*100:.1f}%")

# Retornos dos proxies
# AVUV/AVDV/USSC sao US-listed -> estate tax risk, mas retorno esperado similar
# Para retorno, usar AVGS como proxy e razoavel (mesmos fatores)
# Para AVEM-like (EIMI + AVES + DGS): EIMI e mercado neutro EM, AVES/DGS sao value EM
# Mix: EIMI ~55% do bloco, AVES+DGS ~45% -> retorno medio entre EM neutro e AVEM
EIMI_share = 96.1 / (96.1 + 56.1 + 11.3)  # ~59%
AVES_DGS_share = 1 - EIMI_share  # ~41%
# EIMI = EM neutro ~ 5.1% USD (AQR EM), AVES/DGS ~ 5.5-6.0% USD (EM value)
AVEM_like_ret_usd = EIMI_share * 0.051 + AVES_DGS_share * 0.055
print(f"\n  AVEM-like USD: {EIMI_share:.0%}*5.1% + {AVES_DGS_share:.0%}*5.5% = {AVEM_like_ret_usd*100:.2f}%")
print(f"  vs AVEM target: {RET_USD['AVEM']*100:.1f}% USD")

# JPGL-like: atualmente so IWVL ($2.2k). IWVL = value only, nao multifator
# Retorno esperado: ~5.4-5.7% USD (value tilt mas sem momentum/quality)
JPGL_like_ret_usd = 0.055  # conservador vs JPGL 5.7%

# Retorno ponderado equity bloco ATUAL
s4_eq_ret_usd = (
    pesos_reais_eq["SWRD"] * RET_USD["SWRD"] +
    pesos_reais_eq["AVGS-like"] * RET_USD["AVGS"] +
    pesos_reais_eq["AVEM-like"] * AVEM_like_ret_usd +
    pesos_reais_eq["JPGL-like"] * JPGL_like_ret_usd
)
s4_eq_ret_brl = ret_brl_base(s4_eq_ret_usd)

print(f"\n  Retorno ponderado equity atual:")
print(f"    USD: {s4_eq_ret_usd*100:.3f}%")
print(f"    BRL base: {s4_eq_ret_brl*100:.3f}%")

# Composicao TOTAL da carteira atual (nao so equity)
# Equity: 90.8% do patrimonio
# IPCA+ (reserva + legado + Renda+): 87,862 + 13,308 + 111,992 = 213,162 = 6.1%
# HODL11 + spot: 108,089 = 3.1%
RF_TOTAL = 87_862 + 13_308 + 111_992
CRIPTO_TOTAL = 108_089
print(f"\n  Equity: {EQUITY_TOTAL/PATRIMONIO_INICIAL*100:.1f}% (R${EQUITY_TOTAL:,.0f})")
print(f"  RF total: {RF_TOTAL/PATRIMONIO_INICIAL*100:.1f}% (R${RF_TOTAL:,.0f})")
print(f"  Cripto: {CRIPTO_TOTAL/PATRIMONIO_INICIAL*100:.1f}% (R${CRIPTO_TOTAL:,.0f})")
print(f"  Soma: {(EQUITY_TOTAL+RF_TOTAL+CRIPTO_TOTAL)/PATRIMONIO_INICIAL*100:.1f}%")

# Para S4 estatico (pesos de hoje por 11 anos):
# Retorno ponderado total
# RF: mix de IPCA+ 2029 (2.5%, vence em 3 anos), IPCA+ 2040 legado, Renda+ 2065
# Simplificacao: RF ~= 5.0% real liquido (conservador, mix de titulos)
# Cripto: retorno esperado? Nao ha consenso academico. Usar 0% real como base conservadora.
# Ou usar o que o Head estima? Nao ha premissa aprovada para cripto retorno.

RF_RET_REAL_LIQ = 0.05  # conservador
CRIPTO_RET_REAL = 0.0    # sem premissa academica

w_eq = EQUITY_TOTAL / PATRIMONIO_INICIAL
w_rf = RF_TOTAL / PATRIMONIO_INICIAL
w_cr = CRIPTO_TOTAL / PATRIMONIO_INICIAL

s4_ret_total = w_eq * s4_eq_ret_brl + w_rf * RF_RET_REAL_LIQ + w_cr * CRIPTO_RET_REAL
print(f"\n  Retorno ponderado total (estatico, pesos atuais):")
print(f"    {w_eq:.3f}*{s4_eq_ret_brl*100:.2f}% + {w_rf:.3f}*{RF_RET_REAL_LIQ*100:.1f}% + {w_cr:.3f}*{CRIPTO_RET_REAL*100:.1f}%")
print(f"    = {s4_ret_total*100:.2f}%")
print(f"    Prompt diz: ~5.27%")

# Projecao
s4_fv = projecao_fv(s4_ret_total, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES)
s4_fv_prompt = projecao_fv(0.0527, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES)

print(f"\n  Patrimonio aos 50 (ret {s4_ret_total*100:.2f}%): R${s4_fv:,.0f}")
print(f"  Patrimonio aos 50 (usando 5.27% do prompt): R${s4_fv_prompt:,.0f}")
print(f"  Prompt diz: ~R$10.3M")


# =============================================================================
# DIEGO TARGET (baseline para comparacao)
# =============================================================================

print("\n" + "=" * 70)
print("DIEGO TARGET (baseline)")
print("=" * 70)

# Target: 79% equity (5.89% BRL) + 15% IPCA+ (~6.0% real liq) + 3% cripto + 3% Renda+
# Para projecao do target, precisamos de retorno ponderado total
# Renda+ 2065: retorno esperado? Duration 43.6 anos, taxa ~7%+ -> se hold, ~6.5% real liq?
# Vou usar 6.0% como proxy (similar a IPCA+ longo)

RENDA_RET = 0.06  # proxy
target_ret = 0.79 * 0.0589 + 0.15 * 0.06 + 0.032 * RENDA_RET + 0.03 * CRIPTO_RET_REAL
print(f"  Retorno ponderado target:")
print(f"    0.79*5.89% + 0.15*6.0% + 0.032*6.0% + 0.03*0.0%")
print(f"    = {target_ret*100:.2f}%")

target_fv = projecao_fv(target_ret, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES)
print(f"  Patrimonio aos 50: R${target_fv:,.0f}")


# =============================================================================
# TABELA COMPARATIVA FINAL
# =============================================================================

print("\n" + "=" * 70)
print("TABELA COMPARATIVA FINAL")
print("=" * 70)

# Recalcular FV para cada shadow usando retorno bruto (pre-tax) para comparabilidade
# Nota: o prompt parece usar retornos BRUTOS (pre-tax, pre-cost) para projecao
# Isso e INCORRETO para comparacao real, mas mostra o que o prompt fez

shadows = {
    "Diego Target": {"ret_brl": target_ret, "ret_prompt": None},
    "S1 VWRA puro": {"ret_brl": VWRA_BRL, "ret_prompt": 0.054},
    "S2 IPCA+ HTM": {"ret_brl": ret_real_liq_11, "ret_prompt": 0.06},
    "S3 Factor decay": {"ret_brl": s3_pond_brl, "ret_prompt": 0.0575},
    "S4 Atual": {"ret_brl": s4_ret_total, "ret_prompt": 0.0527},
}

print(f"\n{'Shadow':<20} {'Ret BRL Quant':>14} {'Ret Prompt':>12} {'FV Quant':>14} {'FV Prompt':>14} {'Delta':>8}")
print("-" * 82)

for name, data in shadows.items():
    ret_q = data["ret_brl"]
    ret_p = data["ret_prompt"]
    fv_q = projecao_fv(ret_q, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES)
    fv_p = projecao_fv(ret_p, PATRIMONIO_INICIAL, APORTE_MENSAL, MESES) if ret_p else None

    fv_p_str = f"R${fv_p/1e6:.2f}M" if fv_p else "—"
    delta = f"{(fv_q/fv_p - 1)*100:+.1f}%" if fv_p else "—"

    print(f"{name:<20} {ret_q*100:>13.2f}% {(str(ret_p*100)+'%') if ret_p else '—':>12} "
          f"{'R$'+f'{fv_q/1e6:.2f}M':>14} {fv_p_str:>14} {delta:>8}")

print("\nNOTA: 'Ret BRL Quant' = retorno real BRL pre-tax/pre-cost (exceto S2 que ja e liquido)")
print("Para comparacao justa, todos devem ser all-in (post-tax, post-cost).")
print("Script: analysis/shadow_audit.py")
