# Issues — Carteira Diego

## Modos Operandi

| Modo | Descricao | Quando |
|------|-----------|--------|
| **Conversa** | Livre, exploratorio. Head roteia e sintetiza | Modo padrao |
| **Issue** | Formal, estruturado, com conclusao obrigatoria | Temas que merecem profundidade |

Conversas podem gerar Issues. O Head deve sugerir proativamente.

---

## Board

### Refinamento
> Issues que precisam de mais detalhamento antes de comecar

| ID | Titulo | Dono | Prioridade |
|----|--------|-------------|------------|
| — | — | — | — |

### Backlog
> Issues prontas para execucao, aguardando vez

| # | ID | Titulo | Dono | Prioridade |
|---|-----|--------|------|------------|
| 1 | XX-001-Performance_attribution_trimestral | Performance attribution trimestral (primeiro report) | 13 Bookkeeper | Alta |
| 3 | FI-004-Validacao_empirica_fatores_JPGL | Validacao empirica dos fatores de JPGL (factor loadings, smart beta mirage) | 02 Factor | Alta |
| 4 | HD-002-v2-Scorecard_shadows_atualizados | Scorecard + shadow portfolios atualizados com premissas HD-006 final | 10 Advocate | Media |
| 5 | FI-005-Crowdedness_factor_strategies | Crowdedness de factor strategies e risco para AVGS/JPGL | 02 Factor | Media |
| 6 | HD-004-Behavioral_checklist_Chicago_Booth | Behavioral checklist enriquecido com evidencias do curso | 10 Advocate | Baixa |
| 7 | RK-002-Ouro_tail_risk_hedge | Ouro (IGLN) 2-3% como tail risk hedge: debate estruturado | 06 Risco | Baixa |
| 8 | PT-001-Bond_OneLife_estrutura_luxemburgo | Bond OneLife: converter participacao na holding (longo prazo) | 09 Patrimonial | Baixa |

### Doing
> Issues em andamento

| ID | Titulo | Dono | Prioridade | Status |
|----|--------|------|------------|--------|
| — | — | — | — | — |

### Done
> Issues concluidas

| ID | Titulo | Dono | Data | Resultado |
|----|--------|------|------|-----------|
| FIRE-002-Plano_B_perda_renda | Plano B: perda de renda + decada perdida (escopo expandido) | 04 FIRE | 2026-03-22 | Perda renda nao e risco dominante (R$250k viavel ate perda aos 42, SWR 3.12%). Decada perdida e o killer (SR 31-43%). Plano B: human capital hedge (consultoria R$120-180k/ano) + guardrails + piso R$180k. Nenhuma acao preventiva necessaria agora |
| TX-002-Tax_loss_harvesting_transitorios | Tax-loss harvesting nos 7 ETFs transitorios | 05 Tributacao | 2026-03-22 | Nao aplicavel — todos transitorios com lucro. Framework TLH registrado. Sem wash sale rule no Brasil. Gatilho: reativar em drawdown (TLH + migracao UCITS = duplo beneficio) |
| FR-004-Bond_tent_pre_FIRE (v2) | Bond tent pre-FIRE: design e glidepath | 04 FIRE | 2026-03-22 | Bond tent = 15% IPCA+ longo (HD-006) + 3% IPCA+ curto (aos 50). Tent natural, nao requer gestao ativa. Equity 79% no FIRE, rising pos-vencimento. FR-003: bond tent +0.1pp SR — valor esta no retorno garantido |
| RK-001-Stress_test_risco_soberano_BR (v2) | Stress test risco soberano Brasil (bloco ~21%) | 06 Risco | 2026-03-22 | Bloco soberano ~21% aceito. Risco compensado pelo retorno all-in superior IPCA+ >= 6.0%. Drawdowns Renda+ corrigidos (formula exata). Regra de liquidacao mantida. Equity continua risco dominante (~7x maior) |
| HD-006-Audit_reconciliacao_premissas | Audit e reconciliacao de premissas (retornos, breakeven, IR) | 00 Head | 2026-03-22 | 9+4 erros corrigidos. Decisao final: IPCA+ longo 15%, piso 6.0%, equity 79%, cripto 3%. Breakeven all-in ~5.5%. Selic removido -> IPCA+ curto 3% aos 50. 5 regras anti-recorrencia |
| FR-003-Monte_Carlo_computacional | Monte Carlo 10k trajetorias com premissas HD-006 | 04 FIRE | 2026-03-22 | Pat mediano R$10.56M. SR R$250k: 91% (guard), R$350k: 87%. FR-001 errava 3-6pp sem guard. Decada perdida: 31-43%. Bond tent: +0.1pp |
| HD-002-Scorecard_metricas_sistema | Scorecard de metricas do sistema de agentes | 10 Advocate | 2026-03-20 | Scorecard + 2 shadows + findings log + previsoes. Baseline T0 preenchido. P(FIRE) pendente FR-003 |
| RF-003-Duration_risk_Renda2065_inflacao | Duration risk Renda+ 2065 em regime de inflacao | 03 RF | 2026-03-20 | Target 3% (nao 5%). DCA parado. Gatilhos mantidos. IPCA+ 2040 e tese diferente (estrutural) |
| RK-001-Stress_test_risco_soberano_BR | Stress test risco soberano Brasil (bloco ~13%) | 06 Risco | 2026-03-20 | IPCA+ 7% adequado. Risco real e equity 89%. Liquidacao: Reserva -> equity -> RF por ultimo |
| FR-004-Bond_tent_pre_FIRE | Bond tent pre-FIRE: design e glidepath | 04 FIRE | 2026-03-20 | NAO implementar tent agressivo. Manter 88% equity no FIRE. IPCA+ 2040 e o tent natural |
| HD-003-Scan_Chicago_Booth | Scan Material Chicago Booth | 01 Head | 2026-03-20 | Scan completo em `agentes/contexto/chicago_booth_scan.md`. 60+ papers, 18 frameworks, 8 issues candidatos |
| FI-003-AVGC_vs_JPGL_multifator | AVGC vs JPGL: melhor multifator UCITS? | 02 Factor | 2026-03-18 | JPGL confirmado — complementa com momentum + low vol. AVGC closet indexing |
| RF-002-IPCA_plus_agora_taxa_7 | Alocar 10% IPCA+ agora (taxa 7%+) | 03 Renda Fixa | 2026-03-18 | Aprovado. Ladder 2035/2040/2050 sem cupom. Gatilho IPCA+ aos 48 removido. **Superseded por HD-006** (alvo final: 15%, TD 2040 80% + TD 2050 20%, piso 6.0%) |
| FR-001-Stress_test_custo_vida_fire | Stress test FIRE: cenarios de custo de vida | 04 FIRE | 2026-03-18 | Limite seguro R$ 360k/ano. R$ 250k folga ampla, R$ 350k viavel (SWR 3,40%) |
| RF-001-Renda_plus_rentabilidade_cenarios_queda | Rentabilidade Renda+ 2065 nos cenarios de queda | 03 Renda Fixa | 2026-03-18 | Gatilho 6,0% validado. Duration 43,6. Compra DCA ate 5% se taxa >= 6,5% |
| HD-001-Retro_2026_03_18_acoes | Acoes da Retro 2026-03-18 | 01 Head | 2026-03-18 | 6/6 acoes concluidas |

### Deprecated
> Issues removidas do board (arquivos mantidos como registro historico)

| ID | Titulo | Motivo |
|----|--------|--------|
| FI-002-Reduzir_AVEM_20_para_15 | Reduzir AVEM de 20% para 15% | Superado por decisao HD-006 (alocacao final aprovada) |
| FR-005-FIRE_bands_custo_vida | FIRE bands: modelar custo de vida R$300-400k | Coberto por FR-003 (Monte Carlo com guardrails) |
| XX-002-Correlacao_stock_bond_BR | Correlacao stock-bond no Brasil | Absorvido por RK-001 v2 (stress test soberano) |
| FI-006-Intangibles_value_factor_AVGS | Intangibles e o value factor | Escopo coberto por FI-004 (validacao empirica JPGL) |
| FI-001-Rebalancear_SWRD_AVGS_factor_tilt | SWRD 35->30% / AVGS 25->30% | Superado por HD-006 (alocacao final aprovada com targets atuais) |
| HD-005-Carry_framework_carteira | Carry framework (Koijen 2018) | Baixa prioridade vs backlog atual, escopo parcialmente coberto por FI-004 |

---

## Convencao de IDs

Formato: `{SIGLA}-{NUM}-{Slug_descritivo}`
- Slug: snake_case, curto, descritivo. Ex: `RF-001-Renda_plus_rentabilidade_cenarios_queda`
- Arquivo: `agentes/issues/{ID}.md`

| Sigla | Agente | Exemplo |
|-------|--------|---------|
| HD | 01 Head de Investimentos | HD-001 |
| FI | 02 Factor Investing | FI-001 |
| RF | 03 Renda Fixa Brasil | RF-001 |
| FR | 04 FIRE / Aposentadoria | FR-001 |
| TX | 05 Tributacao | TX-001 |
| RK | 06 Ativos de Risco | RK-001 |
| FX | 07 Cambio Internacional | FX-001 |
| MA | 08 Macro Brasil | MA-001 |
| PT | 09 Patrimonial | PT-001 |
| XX | Cross-domain (multiplos) | XX-001 |

Sigla = agente RESPONSAVEL principal (mesmo que outros participem).

---

## Template

Cada issue e um arquivo em `agentes/issues/{ID}.md`. Ver `_TEMPLATE.md` para o modelo.
