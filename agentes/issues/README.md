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
| 1 | XX-casamento | Casamento iminente: recalibrar P(FIRE), testamento, pacto antenupcial | 00 Head | Baixa |
| 2 | HD-behavioral | Behavioral checklist enriquecido com evidencias do curso | 10 Advocate | Baixa |
| 3 | RK-gold-hedge | Ouro (IGLN) 2-3% como tail risk hedge: debate estruturado | 06 Risco | Baixa |
| 4 | RK-managed-futures | Managed Futures como diversificador: debate estruturado | 06 Risco | Baixa |
| 5 | PT-onelife | Bond OneLife: converter participacao na holding (longo prazo) | 05 Tax | Baixa |
| 6 | FR-spending-smile | Spending smile + saude com inflator proprio (+5-8%/ano real) | 04 FIRE | Baixa |
| 7 | TX-desacumulacao | Custos tributarios de desacumulacao pos-FIRE | 05 Tributacao | Baixa |
| 8 | HD-psicologia | Psicologia cognitiva aplicada: calibracao de confianca, pre-mortem, dado vs interpretacao | 00 Head | Baixa |
| 9 | MA-equity-br | Equity Brasil (IBOV/ETF): faz sentido dado balanco soberano 62.9%? | 08 Macro | Baixa |

### Doing
> Issues em andamento

| ID | Titulo | Dono | Prioridade | Status |
|----|--------|------|------------|--------|
| — | — | — | — | — |

### Done
> Issues concluidas

| ID | Titulo | Dono | Data | Resultado |
|----|--------|------|------|-----------|
| MA-bond-correlation | Correlacao stock-bond inflacionario: IPCA+ como hedge? | 08 Macro | 2026-03-26 | Premissa inaplicavel. IPCA+ HTM = carry, nao hedge. Risco real = recessao global. |
| HD-brazil-concentration | Exposicao real ao Brasil: capital humano + soberano | 07 FX | 2026-03-26 | Concentracao 62.9% estrutural. Portfolio financeiro correto (6.1% BR). Risco e liquidez, nao alocacao. |
| HD-scorecard | Scorecard + shadow portfolios com premissas HD-006 | 10 Advocate | 2026-03-26 | P(FIRE)=91% preenchido. Shadow C adicionado. 10 novos findings. Alpha 0.16%/ano (haircut 58%). |
| HD-simplicity | VWRA + IPCA+ é suficiente? (burden of proof) | 10 Advocate | 2026-03-25 | Carteira atual mantida. Alpha ~0.16% real. Haircut correto: 58% (McLean & Pontiff). Precommitment AVGS validado. |
| HD-equity-weight | 79% equity certo para horizonte fixo de 11 anos? | 04 FIRE | 2026-03-25 | Confirmado. Equity internacional = única diversificação soberana. Balanço total já é quase 100% Brasil. |
| FR-glide-path | Glide path pre-FIRE: definir regra formal de reducao de equity | 04 FIRE | 2026-03-25 | Sem glide path formal. SoRR coberto por 15% IPCA+ longo + 3% IPCA+ curto. INSS aos 65 como floor. |
| FI-crowdedness | Crowdedness de factor strategies e risco AVGS/JPGL | 02 Factor | 2026-03-24 | Tese sustentada. Momentum na zona de atenção sistêmica. Haircut SmB/HmL recalibrar 35-40%. Quant crisis 2.0 modelar no HD-scorecard. |
| FR-equity-equivalent | Equity equivalent do tilt fatorial | 04 FIRE | 2026-03-24 | Portfólio Sortino-eficiente. EE 74.2% (haircut). Vol 16.8%. Nenhuma mudança de alocação. SWRD = seguro anti-modelo. |
| XX-001-Performance_attribution_trimestral | Performance attribution trimestral — primeiro report | 13 Bookkeeper | 2026-03-23 | Framework Q1 pronto. BRL +6.15% neutralizou USD +3.9%. Q2 terá dados completos. |
| FI-004-Validacao_empirica_fatores_JPGL | Validacao empirica dos fatores de JPGL | 02 Factor | 2026-03-23 | JPGL validado. 5 fatores significativos ao vivo. TER cortado para 0.19% (total ~0.45%). Cost-benefit vs SWRD: +1.88%/ano net (30% haircut). Momentum crash risk nao aplicavel (long-only). Risco real: AUM €245M — gatilhos de monitoramento adicionados. |
| XX-004-Bogleheads_forum_scan | Intelligence Gathering — Bogleheads forum scan | 00 Head | 2026-03-23 | 7 topicos lidos. Carteira 100% alinhada com consensus. JPGL confirmado melhor multi-factor UCITS. SWRD validado. SWR non-US = 3.5% (dado novo). Ponto acionavel: cash IBKR < $60k (estate tax sobre cash). RSS feed disponivel: feed.php?f=22 |
| HD-007-Mapa_completo_gatilhos | Mapa completo de gatilhos: inventario, gaps, monitoramento | 00 Head | 2026-03-23 | 60+ gatilhos reduzidos a 16 ativos em 3 niveis (Alarme/Mensal/Anual). HTM absoluto confirmado IPCA+ estrutural. Arquivo: agentes/contexto/gatilhos.md |
| HD-009-Audit_gastos_pessoais | Auditoria de gastos pessoais e consistencia com FIRE | 00 Head | 2026-03-23 | Gastos VERDE: R$215k/ano anualizado, dentro do range FIRE. R$250k baseline confirmado com margem ~25-30% (primeira validacao bottom-up). Spending smile e saude com inflator proprio identificados como gaps no modelo. Dois issues backlog criados: FR-spending-smile e TX-desacumulacao |
| XX-003-RR_Forum_Intelligence_scan | Intelligence Gathering — RR Forum scan de topicos relevantes | 00 Head | 2026-03-22 | 10 topicos lidos. Carteira confirmada alinhada com consensus do forum. Avantis UCITS lancados jun/2024 — Diego ja tem os produtos certos. JPGL usa momentum como negative screen (superior a XDEM/IWMO). Issue criado: RK-managed-futures. Nenhuma acao imediata. |
| HD-008-Reconciliacao_arquivos_deduplicacao | Reconciliacao de arquivos e deduplicacao agent defs | 00 Head | 2026-03-22 | 10+ conflitos corrigidos (ips, evolucao, risk-framework, execucoes, memorias, perfis). 13 agent defs enxugados para bootstrap-only. 2 blocos extraidos para referencia (autonomia-critica, debate-estruturado) |
| FIRE-002-Plano_B_perda_renda | Plano B: perda de renda + decada perdida (escopo expandido) | 04 FIRE | 2026-03-22 | Perda renda nao e risco dominante (R$250k viavel ate perda aos 42, SWR 3.12%). Decada perdida e o killer (SR 31-43%). Plano B: human capital hedge (consultoria R$120-180k/ano) + guardrails + piso R$180k. Nenhuma acao preventiva necessaria agora |
| TX-002-Tax_loss_harvesting_transitorios | Tax-loss harvesting nos 7 ETFs transitorios | 05 Tributacao | 2026-03-22 | Nao aplicavel — todos transitorios com lucro. Framework TLH registrado. Sem wash sale rule no Brasil. Gatilho: reativar em drawdown (TLH + migracao UCITS = duplo beneficio) |
| FR-004-Bond_tent_pre_FIRE (v2) | Bond tent pre-FIRE: design e glidepath | 04 FIRE | 2026-03-22 | Bond tent = 15% IPCA+ longo (HD-006) + 3% IPCA+ curto (aos 50). Tent natural, nao requer gestao ativa. Equity 79% no FIRE, rising pos-vencimento. FR-003: bond tent +0.1pp SR — valor esta no retorno garantido |
| RK-001-Stress_test_risco_soberano_BR (v2) | Stress test risco soberano Brasil (bloco ~21%) | 06 Risco | 2026-03-22 | Bloco soberano ~21% aceito. Risco compensado pelo retorno all-in superior IPCA+ >= 6.0%. Drawdowns Renda+ corrigidos (formula exata). Regra de liquidacao mantida. Equity continua risco dominante (~7x maior) |
| HD-006-Audit_reconciliacao_premissas | Audit e reconciliacao de premissas (retornos, breakeven, IR) | 00 Head | 2026-03-22 | 9+4 erros corrigidos. Decisao final: IPCA+ longo 15%, piso 6.0%, equity 79%, cripto 3%. Breakeven all-in ~5.5%. Selic removido -> IPCA+ curto 3% aos 50. 5 regras anti-recorrencia |
| FR-003-Monte_Carlo_computacional | Monte Carlo 10k trajetorias com premissas HD-006 | 04 FIRE | 2026-03-22 | Pat mediano R$10.56M. SR R$250k: 91% (guard), R$350k: 87%. FR-001 errava 3-6pp sem guard. Decada perdida: 31-43%. Bond tent: +0.1pp |
| HD-002-Scorecard_metricas_sistema | Scorecard de metricas do sistema de agentes | 10 Advocate | 2026-03-20 | Scorecard + 2 shadows + findings log + previsoes. Baseline T0 preenchido. P(FIRE) pendente FR-003 |
| RF-003-Duration_risk_Renda2065_inflacao | Duration risk Renda+ 2065 em regime de inflacao | 03 RF | 2026-03-20 | Target revertido para 5% (decisao Diego 2026-03-22). DCA reativado. Gatilhos mantidos. IPCA+ 2040 e tese diferente (estrutural) |
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

Formato: `{SIGLA}-{slug-descritivo}`
- Slug: kebab-case, 1-3 palavras, legivel sem contexto. Ex: `RF-ipca-dca`, `FR-spending-smile`
- Arquivo: `agentes/issues/{ID}.md`
- Issues arquivadas (Done pre-2026-03-24): mantêm formato antigo `{SIGLA}-{NUM}-{Slug}` como registro historico

| Sigla | Agente | Exemplo |
|-------|--------|---------|
| HD | 00 Head de Investimentos | HD-scorecard |
| FI | 02 Factor Investing | FI-crowdedness |
| RF | 03 Renda Fixa Brasil | RF-ipca-dca |
| FR | 04 FIRE / Aposentadoria | FR-spending-smile |
| TX | 05 Tributacao | TX-desacumulacao |
| RK | 06 Ativos de Risco | RK-gold-hedge |
| FX | 07 Cambio Internacional | FX-hedge-custo |
| MA | 08 Macro Brasil | MA-bond-correlation |
| PT | 09 Patrimonial | PT-onelife |
| XX | Cross-domain (multiplos) | XX-retro-q1 |

Sigla = agente RESPONSAVEL principal (mesmo que outros participem).

---

## Template

Cada issue e um arquivo em `agentes/issues/{ID}.md`. Ver `_TEMPLATE.md` para o modelo.
