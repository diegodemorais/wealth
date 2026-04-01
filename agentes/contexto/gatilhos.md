# Tabela Master de Gatilhos — Carteira Diego

> Fonte de verdade para gatilhos de acao da carteira.
> Ultima revisao: 2026-03-23 (HD-007)
> Metodologia: 60 gatilhos iniciais reduzidos a 16 ativos (Advocate + Behavioral)

---

## ALARME (4) — agir em dias, event-driven

| Dominio | Gatilho | Condicao | Acao |
|---------|---------|----------|------|
| Soberano | CDS critico | CDS Brasil 5y > 800 bps **OU** juros/receita federal > 35% por 2 trimestres | Avaliar venda IPCA+ estrutural com Advocate (excecao HTM) |
| Mercado | Bear pre-FIRE | Drawdown >30% nos 2 anos antes dos 50 (2035-2037) | Adiar FIRE 1-2 anos |
| Renda | Career disruption | Renda cai >50% **OU** invalidez > 6 meses | Reduzir aporte, recalcular trajetoria, avaliar seguro DIT |
| Vida | Casamento / Filhos | Decisao tomada | Recalibrar custo (+R$60-120k se filhos), FIRE date, testamento, estrutura patrimonial |

---

## REVISAO MENSAL / TRIMESTRAL (9)

| Dominio | Gatilho | Condicao | Acao | Freq |
|---------|---------|----------|------|------|
| IPCA+ Longo | DCA por bandas | >=6,0% + RF longa <15%: DCA ativo (TD 2040 80% + TD 2050 20%) · <6,0%: pausar, redirecionar JPGL · <5,0% por 3 meses consecutivos: revisao de premissas (nao de posicao) — (1) por que caiu? (2) patrimonio >120% trajetoria FIRE? (3) se ambos confirmados: Issue formal Bull vs Bear antes de qualquer acao · alvo 15% atingido: parar DCA, manter HTM · venda: NENHUMA — exceto CDS >800bps (soberano) | Executar conforme banda | Mensal |
| Renda+ 2065 | Regime completo | >=6,5% + posicao <5%: comprar · 6,0-6,5%: hold · <=6,0% + holding >=720 dias: vender tudo · <=6,0% + holding <720 dias: aguardar (carry domina reducao de IR) · >=9,0%: manter carrego · equity drawdown >30%: priorizar equity primeiro · aos 50 anos (2037): zerar | Executar conforme regime | Mensal |
| Equity | JPGL catch-up | JPGL < 20% do target equity | Todo aporte livre vai para JPGL prioritariamente | Mensal |
| JPGL AUM | Alerta delisting | AUM JPGL < €150M | Alertar — risco de encerramento do fundo aumenta, avaliar com Factor | Mensal |
| JPGL AUM | Parar aportes | AUM JPGL < €100M | Parar aportes em JPGL imediatamente. Avaliar saida com Factor e Advocate | Mensal |
| Soberano | CDS alerta | CDS Brasil 5y > 500 bps | Revisao exposicao soberana BR com Advocate | Mensal |
| HODL11 | Banda cripto | < 1,5% patrimonio: comprar ate 3% · > 5% patrimonio: rebalancear para 3% | Manter target 3% via aportes ou venda | Trimestral |
| Desacumulacao | Guardrails — montante | Drawdown 0-15%: R$250k/ano · 15-25%: R$225k · 25-35%: R$200k · >35%: R$180k (piso) · Upside +25% acima pico: +10% permanente (teto R$350k) · Restauracao: volta ao pico + 2 trimestres | Ajustar retirada conforme tier | Trimestral (pos-FIRE) |
| Desacumulacao | Guardrails — fonte | **Anos 1–5 do FIRE:** sacar do bond pool (TD 2040 vencido / caixa) antes do equity. Equity intocado ate bond pool esgotado. Violacao = ativar Behavioral | Verificar origem do saque | Trimestral (pos-FIRE) |
| Saude | VCMH anual | VCMH real IESS > 9% por 2 anos consecutivos → recalibrar spending smile (saude base + inflator cap/decay) na proxima retro anual. Fonte: iess.org.br > Publicacoes > VCMH. Ref: VCMH Jun/2023 = 15.1% nominal / ~11.7% real (pico pos-COVID) | Verificar dado IESS | Anual |
| Bond tent | Tamanho TD 2040 | TD 2040 como % do portfolio < 6% em jan/2037 (3 anos antes do FIRE 2040): bond tent < 2 anos de cobertura — irrelevante. Avaliar alternativa (IPCA+ curto maior ou IMAB5). Meta: >= 10% do portfolio em 2040 | Verificar % portfolio | Anual |
| Tax | CBE | Saldo IBKR > US$100k (ja excede desde 2025) | Declarar CBE na RFB | Trimestral |

---

## REVISAO ANUAL (5) — janeiro de cada ano

| Dominio | Gatilho | Condicao | Acao |
|---------|---------|----------|------|
| FIRE | Gatilho de transicao | **Patrimônio real (R$2026) ≥ R$13.4M E SWR ≤ 2.4%** → iniciar processo de transicao para FIRE. Revisao a partir de jan/2034 (48 anos). Safe harbor: nao trabalhar alem de 2040 (53 anos). Referencia: P(FIRE)~80% base (spending smile + guardrails, XX-lacunas-estrategicas 2026-04-01). Script: monte_carlo_fire2040_bondtent.py | Anual (a partir de 2034) |
| FIRE | Trajetoria intermediaria | Pat real < R$8.5M aos 47 (2034): cenario adverso — modelar adiamento. Pat real >= R$11M aos 47: cenario favoravel — FIRE 50 possivel (P~80%). Pat real >= R$13.4M a qualquer idade: avaliar FIRE imediato | Anual |
| FIRE | Custo de vida | Custo anual > R$287k | Recalcular SWR, patrimonio-alvo e FIRE date |
| Patrimonial | Holding | Pat >= R$5M | Avaliar holding familiar: ITCMD, sucessao, protecao patrimonial |
| Mercado | Equity drawdown global | MSCI World -20% em 6 meses | Aumentar ritmo de aportes equity |
| FIRE | Windfall | Entrada extraordinaria > R$1M | Recalcular trajetoria imediatamente |

---

## NOTAS (nao sao gatilhos ativos)

| Tipo | Item |
|------|------|
| Checklist de execucao | **DARF** — a cada venda de ETF com ganho de capital: emitir DARF ate o ultimo dia util do mes seguinte. Nao e gatilho de monitoramento — e consequencia direta da acao de venda. |
| Nota anual | **Estate tax** — verificar exposicao US-listed na revisao de janeiro. Plano: vender US-listed primeiro no usufruto. Risco aceito durante acumulacao (~US$151k expostos, ~US$39k de imposto potencial em caso de obito antes do FIRE). |

---

## GATILHO FUTURO — ativar em janeiro/2035

| Dominio | Gatilho | Condicao | Acao |
|---------|---------|----------|------|
| IPCA+ Curto | SoRR pre-FIRE | Diego com 48 anos (jan/2035) + taxa IPCA+ curto >= 6,0% | Comprar TD com vencimento ~2 anos, 3% do patrimonio |

---

## Principios do sistema

1. **Alarme = evento real, acao em dias.** Nao ha alertas de ruido.
2. **Mensal/Trimestral = check-in estruturado.** Data fixa, nao vigilancia constante.
3. **Anual = calibracao estrategica.** Janeiro — revisao completa de todos os 16 + premissas.
4. **HTM absoluto para IPCA+ Longo (TD 2040/2050).** Excecao unica: CDS > 800 bps.
5. **Menos e mais.** De 60 para 16 gatilhos ativos. Qualquer adicao exige justificativa de impacto material.
