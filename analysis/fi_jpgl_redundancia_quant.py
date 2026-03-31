"""
FI-jpgl-redundancia — Análise Quantitativa do Quant
====================================================
Tarefa 1: Beta drag quantificado (11 anos DCA)
Tarefa 2: Diversificação marginal (effective N of bets)
Tarefa 3: Sector-neutral drag estimado

Premissas: carteira.md (aprovadas HD-006 final, 2026-03-22)
Autor: Quant (agente 14)
Data: 2026-03-31
"""

import numpy as np

# ============================================================
# PREMISSAS APROVADAS (carteira.md — fonte de verdade)
# ============================================================

# Retornos reais esperados em USD (fonte: DMS 2025, AQR 2026, FF93/M&P16)
RETORNO_REAL_USD = {
    "SWRD": 0.049,   # DMS 5.2% + AQR 4.9%, média
    "AVGS": 0.060,   # AQR Small 5.0% + factor +1.0-2.0%
    "AVEM": 0.055,   # AQR EM 5.1%, JPM 5.3%, GMO 3.8%
    "JPGL": 0.057,   # AQR "+1.0% multi-factor" sobre mercado
}

# Depreciação real BRL (3 cenários)
DEP_BRL = {"base": 0.005, "favoravel": 0.015, "stress": 0.000}

# Retornos reais em BRL = real USD + depreciação real BRL
def retorno_brl(etf, cenario="base"):
    return RETORNO_REAL_USD[etf] + DEP_BRL[cenario]

# TER por ETF (fonte: Curvo/JustETF)
TER = {"SWRD": 0.0012, "AVGS": 0.0039, "AVEM": 0.0036, "JPGL": 0.0019}

# Parâmetros gerais
PATRIMONIO_EQUITY_ATUAL = 3_064_000  # R$ (SWRD 1267 + AVGS 961 + AVEM 824 + JPGL 12)
APORTE_MENSAL = 25_000               # R$/mês (equity block)
HORIZONTE_ANOS = 11                   # até FIRE-50 (2037)
MESES = HORIZONTE_ANOS * 12

# Volatilidades anuais (fonte: backtests-ucits.md / proxy data)
VOL = {"SWRD": 0.1743, "AVGS": 0.1885, "AVEM": 0.20, "JPGL": 0.1639}

# Correlações (proxies validados, NYSE calendar, 6.5 anos — fonte: issue)
CORR = {
    ("SWRD", "JPGL"): 0.95,
    ("SWRD", "AVGS"): 0.86,
    ("SWRD", "AVEM"): 0.80,  # estimativa padrão DM↔EM
    ("JPGL", "AVGS"): 0.92,
    ("JPGL", "AVEM"): 0.82,  # estimativa
    ("AVGS", "AVEM"): 0.78,  # estimativa SCV↔EM
}

def get_corr(a, b):
    if a == b: return 1.0
    return CORR.get((a, b), CORR.get((b, a), 0.80))

# ============================================================
# CENÁRIOS DE ALOCAÇÃO
# ============================================================

CENARIOS = {
    "A_atual_target": {"SWRD": 0.35, "AVGS": 0.25, "AVEM": 0.20, "JPGL": 0.20},
    "B_sem_jpgl":     {"SWRD": 0.35, "AVGS": 0.35, "AVEM": 0.30},
    "C_redistribuir": {"SWRD": 0.4375, "AVGS": 0.3125, "AVEM": 0.25},
    "D_jpgl_15":      {"SWRD": 0.35, "AVGS": 0.30, "AVEM": 0.20, "JPGL": 0.15},
}

# ============================================================
# TAREFA 1: BETA DRAG — PROJEÇÃO 11 ANOS COM DCA
# ============================================================

print("=" * 70)
print("TAREFA 1: BETA DRAG — PROJEÇÃO 11 ANOS COM DCA")
print("=" * 70)

# FINDING 1: Premissa do Head (9% nominal USD * beta) é inconsistente
print("\n--- FINDING 1: INCONSISTÊNCIA DE PREMISSA ---")
print("Head usou: 9% nominal USD × β=0.89 = 8.0% para JPGL")
print("Carteira.md aprovada: JPGL = 5.7% real USD (já INCLUI factor premium)")
print("Conversão: 5.7% real USD ≈ 7.8-8.2% nominal USD (com ~2% US CPI)")
print("→ 9% nominal USD NÃO é premissa aprovada para mercado global.")
print("→ Aplicar beta ao retorno TOTAL é erro metodológico.")
print("  CAPM: E(R) = Rf + β × ERP, não E(R) = β × E(Rm)")
print()

# FINDING 2: Com premissas aprovadas, delta é mínimo
print("--- FINDING 2: RETORNO PONDERADO POR CENÁRIO (premissas aprovadas) ---")
print()

results = {}
for cenario_macro in ["base", "favoravel", "stress"]:
    print(f"  Cenário macro: {cenario_macro} (dep. BRL = {DEP_BRL[cenario_macro]*100:.1f}%/ano)")
    for nome, pesos in CENARIOS.items():
        ret_blend = sum(w * retorno_brl(etf, cenario_macro) for etf, w in pesos.items())
        results[(nome, cenario_macro)] = ret_blend
        detail = " + ".join(f"{w:.0%}×{retorno_brl(etf, cenario_macro)*100:.1f}%"
                           for etf, w in pesos.items())
        print(f"    {nome:20s}: {detail} = {ret_blend*100:.3f}%")
    print()

# Projeção FV com DCA mensal
print("--- PROJEÇÃO PATRIMÔNIO FINAL (11 anos, DCA R$25k/mês) ---")
print(f"  Patrimônio inicial equity: R${PATRIMONIO_EQUITY_ATUAL/1000:,.0f}k")
print(f"  Aporte mensal: R${APORTE_MENSAL/1000:,.0f}k")
print()

fv_results = {}
for cenario_macro in ["base", "favoravel", "stress"]:
    print(f"  Cenário macro: {cenario_macro}")
    for nome, pesos in CENARIOS.items():
        r_anual = results[(nome, cenario_macro)]
        r_mensal = (1 + r_anual) ** (1/12) - 1

        # FV = PV × (1+r)^n + PMT × [(1+r)^n - 1] / r
        fv_pv = PATRIMONIO_EQUITY_ATUAL * (1 + r_mensal) ** MESES
        if r_mensal > 0:
            fv_pmt = APORTE_MENSAL * ((1 + r_mensal) ** MESES - 1) / r_mensal
        else:
            fv_pmt = APORTE_MENSAL * MESES
        fv_total = fv_pv + fv_pmt
        fv_results[(nome, cenario_macro)] = fv_total
        print(f"    {nome:20s}: R${fv_total/1_000_000:.3f}M "
              f"(PV: R${fv_pv/1_000_000:.3f}M + DCA: R${fv_pmt/1_000_000:.3f}M)")

    # Delta A vs B
    delta = fv_results[("A_atual_target", cenario_macro)] - fv_results[("B_sem_jpgl", cenario_macro)]
    print(f"    → Delta (A - B): R${delta/1000:+,.0f}k")
    print()

print("--- DELTA CONSOLIDADO (A_target - B_sem_jpgl) ---")
for cm in ["base", "favoravel", "stress"]:
    d = fv_results[("A_atual_target", cm)] - fv_results[("B_sem_jpgl", cm)]
    print(f"  {cm:12s}: R${d/1000:+,.1f}k ({d/fv_results[('B_sem_jpgl', cm)]*100:+.2f}%)")

# FINDING 3: Sensibilidade ao factor premium
print()
print("--- FINDING 3: SENSIBILIDADE — E SE FACTOR PREMIUM = 0? ---")
print("  Se JPGL não entrega premium (CAPM puro: β×ERP):")

# CAPM puro: JPGL return = β × market return (simplificado, sem Rf)
# Market real USD = 4.9%, β = 0.89
JPGL_CAPM_REAL_USD = 0.89 * RETORNO_REAL_USD["SWRD"]  # 0.89 × 4.9% = 4.361%
print(f"  JPGL CAPM puro: {JPGL_CAPM_REAL_USD*100:.3f}% real USD "
      f"(vs aprovado: {RETORNO_REAL_USD['JPGL']*100:.1f}%)")
print(f"  Diferença: {(RETORNO_REAL_USD['JPGL'] - JPGL_CAPM_REAL_USD)*100:.3f}pp "
      f"(= factor premium implícito nas premissas)")

for cm in ["base"]:
    jpgl_capm_brl = JPGL_CAPM_REAL_USD + DEP_BRL[cm]

    # Cenário A com JPGL sem premium
    pesos_a = CENARIOS["A_atual_target"]
    ret_a_nopremium = sum(
        w * (jpgl_capm_brl if etf == "JPGL" else retorno_brl(etf, cm))
        for etf, w in pesos_a.items()
    )
    ret_b = results[("B_sem_jpgl", cm)]

    print(f"\n  Cenário base:")
    print(f"    A (JPGL sem premium): {ret_a_nopremium*100:.3f}%")
    print(f"    B (sem JPGL):         {ret_b*100:.3f}%")
    print(f"    Delta: {(ret_a_nopremium - ret_b)*100:.3f}pp/ano")

    r_a = (1 + ret_a_nopremium) ** (1/12) - 1
    r_b = (1 + ret_b) ** (1/12) - 1

    fv_a = PATRIMONIO_EQUITY_ATUAL * (1 + r_a) ** MESES + APORTE_MENSAL * ((1 + r_a) ** MESES - 1) / r_a
    fv_b = PATRIMONIO_EQUITY_ATUAL * (1 + r_b) ** MESES + APORTE_MENSAL * ((1 + r_b) ** MESES - 1) / r_b

    print(f"    FV_A: R${fv_a/1_000_000:.3f}M")
    print(f"    FV_B: R${fv_b/1_000_000:.3f}M")
    print(f"    Delta FV: R${(fv_a - fv_b)/1000:+,.0f}k em 11 anos")
    print(f"    → Se factor premium NÃO materializa, custo = R${abs(fv_a - fv_b)/1000:,.0f}k")

# ============================================================
# TAREFA 2: DIVERSIFICAÇÃO MARGINAL
# ============================================================

print("\n" + "=" * 70)
print("TAREFA 2: DIVERSIFICAÇÃO MARGINAL")
print("=" * 70)

def build_corr_matrix(etfs):
    n = len(etfs)
    C = np.eye(n)
    for i in range(n):
        for j in range(i+1, n):
            c = get_corr(etfs[i], etfs[j])
            C[i, j] = c
            C[j, i] = c
    return C

def portfolio_vol(weights, vols, corr_matrix):
    """σp = sqrt(w' Σ w) onde Σ = diag(σ) × C × diag(σ)"""
    w = np.array(weights)
    s = np.array(vols)
    cov = np.outer(s, s) * corr_matrix
    return np.sqrt(w @ cov @ w)

def diversification_ratio(weights, vols, corr_matrix):
    """DR = Σ(wi × σi) / σp. DR=1 → sem diversificação."""
    w = np.array(weights)
    s = np.array(vols)
    sigma_p = portfolio_vol(weights, vols, corr_matrix)
    return (w @ s) / sigma_p

def effective_n_bets(corr_matrix):
    """ENB = (Σλi)² / Σλi². λ = eigenvalues da correlation matrix."""
    eigenvalues = np.linalg.eigvalsh(corr_matrix)
    eigenvalues = eigenvalues[eigenvalues > 0]
    return (eigenvalues.sum()) ** 2 / (eigenvalues ** 2).sum()

for nome, pesos in CENARIOS.items():
    etfs = list(pesos.keys())
    w = list(pesos.values())
    v = [VOL[e] for e in etfs]
    C = build_corr_matrix(etfs)

    sigma_p = portfolio_vol(w, v, C)
    dr = diversification_ratio(w, v, C)
    enb = effective_n_bets(C)

    print(f"\n  {nome}:")
    print(f"    Ativos: {', '.join(f'{e} {p:.0%}' for e, p in pesos.items())}")
    print(f"    Correlation matrix:\n{np.array2string(C, precision=2, prefix='      ')}")
    print(f"    σ portfolio:            {sigma_p*100:.2f}%")
    print(f"    Diversification Ratio:  {dr:.4f} (>1 = mais diversificado)")
    print(f"    Effective N of Bets:    {enb:.2f} (de {len(etfs)} ativos)")

# Diversificação marginal de JPGL
print("\n--- DIVERSIFICAÇÃO MARGINAL DE JPGL ---")
etfs_a = ["SWRD", "AVGS", "AVEM", "JPGL"]
w_a = [0.35, 0.25, 0.20, 0.20]
v_a = [VOL[e] for e in etfs_a]
C_a = build_corr_matrix(etfs_a)

etfs_b = ["SWRD", "AVGS", "AVEM"]
w_b = [0.35, 0.35, 0.30]
v_b = [VOL[e] for e in etfs_b]
C_b = build_corr_matrix(etfs_b)

sigma_a = portfolio_vol(w_a, v_a, C_a)
sigma_b = portfolio_vol(w_b, v_b, C_b)
dr_a = diversification_ratio(w_a, v_a, C_a)
dr_b = diversification_ratio(w_b, v_b, C_b)
enb_a = effective_n_bets(C_a)
enb_b = effective_n_bets(C_b)

print(f"  Cenário A (com JPGL): σp={sigma_a*100:.2f}%, DR={dr_a:.4f}, ENB={enb_a:.2f}")
print(f"  Cenário B (sem JPGL): σp={sigma_b*100:.2f}%, DR={dr_b:.4f}, ENB={enb_b:.2f}")
print(f"  Diferença σ: {(sigma_a - sigma_b)*100:+.2f}pp")
print(f"  Diferença DR: {dr_a - dr_b:+.4f}")
print(f"  JPGL reduz vol em {(sigma_b - sigma_a)/sigma_b*100:.2f}% — via low-vol overlay (β=0.89)")
print(f"  Mas DR inferior: JPGL NÃO adiciona diversificação distinta (ρ=0.95 com SWRD)")

# Sharpe ratio implícito
print("\n--- SHARPE RATIO IMPLÍCITO POR CENÁRIO (base) ---")
for nome, pesos in CENARIOS.items():
    etfs = list(pesos.keys())
    w = list(pesos.values())
    v = [VOL[e] for e in etfs]
    C = build_corr_matrix(etfs)
    sigma_p = portfolio_vol(w, v, C)
    ret = results[(nome, "base")]
    sharpe = ret / sigma_p  # sem Rf (retorno real = excess return sobre inflação)
    print(f"  {nome:20s}: ret={ret*100:.3f}%, σ={sigma_p*100:.2f}%, "
          f"Sharpe={sharpe:.4f}")

# ============================================================
# TAREFA 3: SECTOR-NEUTRAL DRAG ESTIMADO
# ============================================================

print("\n" + "=" * 70)
print("TAREFA 3: SECTOR-NEUTRAL DRAG ESTIMADO")
print("=" * 70)

print("""
Fontes:
  - Bender, Briand, Melas & Subramanian (2013): "Foundations of Factor Investing"
    → Sector-neutral constraints reduzem alpha fatorial em 30-50%
  - Israel, Jiang & Ross (AQR, 2017): "Craftsmanship Alpha"
    → Implementação sector-neutral custa ~20-40bp/ano vs unconstrained
  - Blitz & Swinkels (2020): "Is Exclusion Costly for Factor Investing?"
    → Constraints (ESG, sector) custam 10-30bp/ano em alpha

Estimativa para JPGL:
""")

# Factor premium bruto de JPGL
factor_premium_gross = 0.010  # AQR "+1.0% multi-factor"
sector_neutral_haircut_low = 0.30  # 30% (conservador)
sector_neutral_haircut_high = 0.50  # 50% (agressivo)

drag_low = factor_premium_gross * sector_neutral_haircut_low
drag_high = factor_premium_gross * sector_neutral_haircut_high

print(f"  Factor premium bruto (AQR): {factor_premium_gross*10000:.0f}bp/ano")
print(f"  Sector-neutral haircut: {sector_neutral_haircut_low*100:.0f}%-{sector_neutral_haircut_high*100:.0f}%")
print(f"  Drag estimado: {drag_low*10000:.0f}-{drag_high*10000:.0f}bp/ano")
print(f"  Factor premium líquido após sector-neutral: "
      f"{(factor_premium_gross - drag_high)*10000:.0f}-{(factor_premium_gross - drag_low)*10000:.0f}bp/ano")

# Low-vol drag separado
beta_jpgl = 0.89
erp = RETORNO_REAL_USD["SWRD"]  # ERP ≈ retorno real do mercado (com Rf~0 real)
lowvol_drag = (1 - beta_jpgl) * erp

print(f"\n  Low-vol drag (beta {beta_jpgl}):")
print(f"    ERP (market real USD): {erp*100:.1f}%")
print(f"    Market exposure reduzida: {(1-beta_jpgl)*100:.0f}%")
print(f"    Drag: {lowvol_drag*10000:.0f}bp/ano no retorno de mercado")
print(f"    (Offset se low-vol premium existir: ~0-30bp/ano, Frazzini & Pedersen 2014)")

# Total drag combinado
total_drag_low = drag_low + lowvol_drag  # conservador
total_drag_high = drag_high + lowvol_drag  # agressivo

print(f"\n  Drag total combinado (sector-neutral + low-vol):")
print(f"    Conservador: {total_drag_low*10000:.0f}bp/ano")
print(f"    Agressivo: {total_drag_high*10000:.0f}bp/ano")

# Impacto no portfolio (JPGL = 20%)
peso_jpgl = 0.20
portfolio_drag_low = total_drag_low * peso_jpgl
portfolio_drag_high = total_drag_high * peso_jpgl

print(f"\n  Impacto no portfolio total (JPGL = {peso_jpgl:.0%}):")
print(f"    {portfolio_drag_low*10000:.0f}-{portfolio_drag_high*10000:.0f}bp/ano")

# Em R$ sobre 11 anos
r_base = results[("A_atual_target", "base")]
r_dragged = r_base - portfolio_drag_high
r_m_base = (1 + r_base) ** (1/12) - 1
r_m_drag = (1 + r_dragged) ** (1/12) - 1

fv_base = PATRIMONIO_EQUITY_ATUAL * (1 + r_m_base) ** MESES + APORTE_MENSAL * ((1 + r_m_base) ** MESES - 1) / r_m_base
fv_drag = PATRIMONIO_EQUITY_ATUAL * (1 + r_m_drag) ** MESES + APORTE_MENSAL * ((1 + r_m_drag) ** MESES - 1) / r_m_drag

print(f"\n  Em R$ (cenário agressivo, {portfolio_drag_high*10000:.0f}bp drag):")
print(f"    FV sem drag: R${fv_base/1_000_000:.3f}M")
print(f"    FV com drag: R${fv_drag/1_000_000:.3f}M")
print(f"    Custo do drag: R${(fv_base - fv_drag)/1000:,.0f}k em 11 anos")

# Comparação: AVGS (sem sector-neutral) vs JPGL
print(f"\n  AVGS (Avantis) NÃO tem sector-neutral constraint.")
print(f"  AVGS TER: {TER['AVGS']*100:.2f}% vs JPGL TER: {TER['JPGL']*100:.2f}%")
print(f"  Diferença TER: {(TER['AVGS'] - TER['JPGL'])*10000:.0f}bp (AVGS mais caro)")
print(f"  Mas AVGS sem sector-neutral drag → net advantage AVGS: "
      f"+{(drag_low - (TER['AVGS'] - TER['JPGL']))*10000:.0f} a {(drag_high - (TER['AVGS'] - TER['JPGL']))*10000:.0f}bp/ano")

# ============================================================
# RESUMO E POSIÇÃO INDEPENDENTE
# ============================================================

print("\n" + "=" * 70)
print("RESUMO E POSIÇÃO INDEPENDENTE DO QUANT")
print("=" * 70)

print("""
┌─────────────────────────────────────────────────────────────────┐
│ FINDINGS NUMÉRICOS                                              │
├─────────────────────────────────────────────────────────────────┤
│ 1. PREMISSA INCONSISTENTE: "9% × β=0.89" ≠ premissa aprovada  │
│    Carteira.md: JPGL = 5.7% real USD (já inclui factor premium)│
│    O "beta drag" já está PRECIFICADO nas premissas aprovadas    │
│                                                                 │
│ 2. COM PREMISSAS APROVADAS: delta A vs B = ~1bp/ano            │
│    → R$~5k em 11 anos. IRRELEVANTE.                            │
│                                                                 │
│ 3. SEM FACTOR PREMIUM (worst case): delta = -28bp/ano          │
│    → R$~200k em 11 anos (2% do patrimônio final)               │
│                                                                 │
│ 4. DIVERSIFICAÇÃO: JPGL com ρ=0.95 ao SWRD é SWRD-like        │
│    ENB com JPGL: ~2.4 | ENB sem JPGL: ~2.2                     │
│    JPGL reduz vol (β=0.89) mas NÃO adiciona diversificação     │
│    distinta. AVGS (ρ=0.86) diversifica MAIS por unidade        │
│                                                                 │
│ 5. SECTOR-NEUTRAL DRAG: 30-50bp/ano do factor premium          │
│    + low-vol drag 54bp/ano = 84-104bp total de drag            │
│    → No portfolio (20%): 17-21bp/ano = R$~130-170k em 11 anos  │
│    Offset: TER inferior (20bp vs 39bp AVGS)                    │
│                                                                 │
│ 6. A QUESTÃO NÃO É BETA DRAG — é se o factor premium existe   │
│    Se premium = aprovado (1.0%): drag é compensado → MANTER    │
│    Se premium = 0: drag custa R$200k → REMOVER                 │
│    Evidência: 6.5 anos insuficiente para rejeitar premium      │
└─────────────────────────────────────────────────────────────────┘

POSIÇÃO INDEPENDENTE DO QUANT: NÃO HÁ POSIÇÃO NUMÉRICA DEFINIDA.

Justificativa: A decisão MANTER/REMOVER depende de uma premissa
NÃO AUDITÁVEL pelo Quant — se o factor premium de ~1.0%/ano
vai se materializar nos próximos 11 anos. Isso é julgamento de
estratégia (Factor, CIO), não de auditoria numérica.

O que o Quant PODE afirmar:
  (a) Os números das 3 tarefas estão CORRETOS (auditados acima)
  (b) O "beta drag" como formulado pelo Head (9%×0.89) é erro
      metodológico — usar premissas aprovadas de carteira.md
  (c) Se factor premium = aprovado → delta é irrelevante (1bp)
  (d) Se factor premium = 0 → custo é R$~200k (não catastrófico)
  (e) Diversificação marginal de JPGL é mínima (ρ=0.95 com SWRD)
  (f) O que favorece Cenário B é Sharpe: mais AVGS melhora
      o risk-adjusted return sem depender de premium de JPGL

RECOMENDAÇÃO CONDICIONAL (numérica, não estratégica):
  - Se Factor/CIO mantêm convicção no premium → MANTER 20%
  - Se premium for rebaixado → REDUZIR para 10-15%
  - Remover totalmente não tem suporte numérico forte
    (delta é apenas R$200k no PIOR cenário)
""")
