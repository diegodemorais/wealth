# IIFPT Coupling Reference — Appendix C Adaptado para BR

> Fonte: Kothakota, SSRN 6030356 (Dez 2025), Appendix C — Sub-domain Coupling Taxonomy  
> Adaptações brasileiras documentadas explicitamente.  
> Constante canônica: `scripts/config.py::IIFPT_COUPLING_INTENSITY`

---

## Tabela de Acoplamentos

| Par | Intensidade | Classificação | Sub-domínios principais | Adaptação BR |
|-----|------------|---------------|------------------------|-------------|
| **Tax ↔ Investment** | S = 0.60 | **Strong** | Tax-Loss Harvesting, Asset Location, Income Bracket Mgmt | Lei 14.754/2023 cria coupling explícito (IR sobre rendimentos ext). DARF timing = equivalente BR de income bracket management. TLH sem wash sale rule (mais simples). |
| **Tax ↔ Retirement** | S = 0.55 | **Strong** | Roth Conversion, RMD timing, Social Security optimization | IR diferido na desacumulação (TX-desacumulacao). DARF no FIRE Day. INSS timing (Diego: 65a, Katia: 62a). Renda+ = instrumento híbrido com implicações tributárias distintas. |
| **Estate ↔ Tax** | S = 0.40 | **Moderate** | Estate Tax, Charitable Giving, Trust structures | Estate tax US (40% > $13.6M) não se aplica. BR: ITCMD (2-8% por estado), inventário, holding familiar. Diego: w_Est=0.05 → impacto baixo agora. Rever pós-casamento. |
| **CF ↔ Retirement** | S = 0.35 | **Moderate** | Savings Rate, Debt Payoff timing, Income Stability | Aportes mensais R$25k são o principal driver de P(FIRE). Hipoteca SAC R$452k quita 2051 (persiste pós-FIRE). Renda = PJ quasi-CLT → estável mas concentrada. |
| **RM ↔ CF** | S = 0.30 | **Moderate** | Disability Insurance, Emergency Fund, Income Replacement | Diego: sem disability coverage. Evento de saúde → income para → saques antecipados do portfolio → SoRR piora. INSS disability cobre ~R$1.5-2k/mês vs renda ~R$55k/mês. |
| **RM ↔ Retirement** | S = 0.30 | **Moderate** | Life Insurance, Long-term Care, Sequence of Returns | Disability em 2031 → aportes param por N anos → P(FIRE) cai. Stochastic separability destruída (T7.4): β_CF + β_RM + β_Ret sobem simultaneamente. |
| **CF ↔ Investment** | S = 0.20 | **Weak** | Dollar-Cost Averaging timing, Liquidity Management | Timing de aportes afeta custo médio SWRD/AVGS/AVEM. Câmbio Okegen: spread 0.25% ida e volta. Impacto operacional — não estratégico. |
| **Estate ↔ Investment** | S = 0.15 | **Weak** | Asset Titling, Beneficiary Designations, Offshore Structure | Titularidade ETFs IBKR sob nome de Diego: exposto a estate tax US para US-listed (cash < $60k — gatilho Bogleheads). UCITS LSE: sem estate tax US. |
| **Estate ↔ Retirement** | S = 0.15 | **Weak** | Retirement Account Beneficiaries, Stretch IRA | Sucessão pós-FIRE irrelevante enquanto Diego vivo. PGBL Katia tem beneficiário. Rever pós-casamento. |
| **RM ↔ Investment** | S = 0.15 | **Weak** | Insurance Premium Opportunity Cost | Custo de disability insurance (~R$X/mês) reduz capacidade de aporte. Impacto marginal vs. proteção de R$3.65M capital humano. |

---

## Acoplamentos Prioritários para Diego (filtrados por Λ)

Com Λ = {Inv: 0.35, Ret: 0.25, Tax: 0.18, CF: 0.10, RM: 0.07, Est: 0.05}, os acoplamentos mais relevantes estrategicamente são:

| Par | S × w_i × w_j | % do total Q | Implicação prática |
|-----|--------------|-------------|-------------------|
| Tax ↔ Inv | 0.60 × 0.063 = **0.0378** | **46.8%** | DARF timing + asset location = maior ROI de qualquer atividade de integração |
| Tax ↔ Ret | 0.55 × 0.045 = **0.0248** | **30.7%** | Otimizar desacumulação tributária antes do FIRE Day |
| CF ↔ Ret | 0.35 × 0.025 = **0.0088** | **10.9%** | Manter aportes estáveis = proteção direta do P(FIRE) |
| RM ↔ Ret | 0.30 × 0.018 = **0.0054** | 6.7% | Disability coverage = seguro do FIRE |
| **Q_Diego total** | **0.0807** | 100% | |

**Driver dominante:** Tax ↔ Investment (46.8%). Otimização tributária da carteira de ETFs é a atividade de maior leverage no framework IIFPT para Diego.

---

## Conceitos US sem Equivalente Direto no Brasil

| Conceito US | Status BR | Alternativa BR |
|-------------|-----------|---------------|
| Estate Tax (40% > $13.6M) | Não aplicável | ITCMD estadual (2-8%), inventário |
| Roth Conversion | Sem equivalente exato | Migração PGBL → regime tributação |
| Stretch IRA | Não aplicável | PGBL/VGBL beneficiários |
| GRAT / ILIT | Não aplicável | Holding familiar + doação em vida |
| Social Security optimization | Parcialmente análogo | INSS timing (Diego 65a / Katia 62a) |
| Medicare planning | Não aplicável | Plano de saúde privado (custo SAUDE_BASE R$24k/ano) |

---

## Integration Premium Estimado para Diego

> Cálculo Quant 2026-04-30. Theorem 7.8: V*_int - Σ w_k V*_sep ≥ ½ Δd^T |Γ_B| Δd

| Métrica | Range | Midpoint | R$ (NW R$3.47M) |
|---------|-------|----------|-----------------|
| Π^det (determinístico) | 5.6% – 11.0% | ~7.8% | R$194k – R$381k |
| Π^total (+ stochastic 10-28%) | 6.1% – 14.1% | ~9.1% | R$212k – R$490k |

**Caveat Quant:** Range largo (5.4pp de incerteza). Usar como ordem de grandeza, não estimativa precisa. Driver Tax↔Inv é o único resultado robusto independente de parametrização.

**Comparação com casos US** (§8 do paper): 5.9%-13.2% NW. Diego ligeiramente abaixo por w_Est=0.05 (sem estate planning ativo). Sem ajuste, os ranges se sobrepõem.
