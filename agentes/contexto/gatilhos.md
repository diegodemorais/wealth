# Tabela Master de Gatilhos — Carteira Diego

> Fonte de verdade para gatilhos de acao da carteira.
> Ultima revisao: 2026-04-01 (revisao completa do time — 8 modificacoes, 7 novos, reestruturacao)
> Metodologia original: 60 gatilhos reduzidos a 16 ativos (Advocate + Behavioral, 2026-03-23)

---

## ALARME (4) — agir em dias, event-driven

| Dominio | Gatilho | Condicao | Acao |
|---------|---------|----------|------|
| Soberano | CDS critico | CDS Brasil 5y > 800 bps **OU** divida bruta/PIB > 100% por 2 trimestres consecutivos | Avaliar venda IPCA+ estrutural com Advocate (excecao HTM) |
| Mercado | Bear pre-FIRE | Drawdown >30% nos **5 anos** antes dos 50 (2032-2037) | Adiar FIRE 1-2 anos **OU** acelerar bond tent (antecipar compra IPCA+ longo se taxa >= 6.0%) |
| Renda | Career disruption | Renda cai >50% **OU** invalidez > 6 meses | Reduzir aporte, recalcular trajetoria, avaliar seguro DIT |
| Vida | Casamento / Filhos | Decisao tomada | Recalibrar custo (+R$60-120k se filhos), FIRE date, testamento, **seguro de vida**, estrutura patrimonial |

---

## REVISAO MENSAL / TRIMESTRAL (12)

| Dominio | Gatilho | Condicao | Acao | Freq |
|---------|---------|----------|------|------|
| IPCA+ Longo | DCA por bandas | >=6,0% + IPCA+ longo <15%: DCA ativo (TD 2040 80% + TD 2050 20%) · <6,0%: pausar, redirecionar JPGL · <5,0% por 3 meses consecutivos: revisao de premissas (nao de posicao) — (1) por que caiu? (2) patrimonio >120% trajetoria FIRE? (3) se ambos: Issue formal antes de qualquer acao · alvo 15% atingido: parar DCA, manter HTM · queda de % por crescimento equity nao exige aporte compensatorio (posicao absoluta e o que importa) · venda: NENHUMA — exceto CDS >800bps | Executar conforme banda | Mensal |
| Renda+ 2065 | Regime completo | >=6,5% + posicao <5%: comprar · 6,0-6,5%: hold · <=6,0% + holding >=720 dias: vender tudo (**720 dias conta por lote individual**, nao da primeira compra do DCA) · <=6,0% + holding <720 dias: aguardar (carry domina reducao de IR) · >=9,0%: manter carrego (**nao cancela regra de venda**: se holding >=720 dias E taxa <=6,0%, vender mesmo assim) · equity drawdown >30%: priorizar equity primeiro · aos 50 anos (2037): zerar (vale mesmo se FIRE adiado — posicao e tatica) | Executar conforme regime | Mensal |
| Soberano | CDS alerta | CDS Brasil 5y > 500 bps | Revisao exposicao soberana BR com Advocate | Mensal |
| IPCA+ / Soberano | MA-bond-correlation falsificabilidade | CDS Brasil 5y > 400 bps por 6+ meses consecutivos | Reavaliar premissa de carry IPCA+ como garantido em HTM — cenario de cauda soberana (MA-bond-correlation). Perguntas: (1) acesso a resgates pode ser restrito? (2) repactuacao forcada de divida interna? (3) inflacao acima do IPCA oficial por controle de precos? | Mensal |
| HODL11 | Banda cripto | < 1,5% patrimonio: comprar ate 3% · > 5% patrimonio: rebalancear para 3% | Manter target 3% via aportes ou venda | Trimestral |
| Desacumulacao | Guardrails — montante | Drawdown 0-15%: R$250k/ano · 15-25%: R$225k · 25-35%: R$200k · >35%: R$180k (piso) · Upside +25% acima pico: +10% permanente (teto R$350k) · Restauracao: volta ao pico + 2 trimestres | Ajustar retirada conforme tier | Trimestral (pos-FIRE) |
| Desacumulacao | Guardrails — fonte | **Anos 1–5 do FIRE:** sacar do bond pool (TD 2040 vencido / caixa) antes do equity. Equity intocado ate bond pool esgotado. Violacao = ativar Behavioral | Verificar origem do saque | Trimestral (pos-FIRE) |
| Equity / AVGS | AVGS underperformance | AVGS underperforma SWRD >=5% cumulativo em janela rolling de 12 meses | Revisao com Factor + Advocate: (1) factor premium comprimiu? (2) regime ciclico ou estrutural? (3) confirmar via AQR Factor Returns. Se estrutural → Issue de reducao de peso | Trimestral |
| Equity / AVGS | AVGS AUM | AUM AVGS UCITS < $300M alerta · < $150M parar aportes | Alerta $300M: avaliar alternativas UCITS. Parar $150M: suspender aportes em AVGS imediatamente | Trimestral |

---

## REVISAO ANUAL (12) — janeiro de cada ano

| Dominio | Gatilho | Condicao | Acao |
|---------|---------|----------|------|
| FIRE | Gatilho de transicao | **SWR ≤ 3.0%** → iniciar processo de transicao para FIRE. Revisao a partir de jan/2034 (48 anos). Safe harbor: nao trabalhar alem de 2040 (53 anos). Referencia: P(FIRE)~80% base (spending smile + guardrails, XX-lacunas-estrategicas 2026-04-01). Script: monte_carlo_fire2040_bondtent.py | Anual (a partir de 2034) |
| FIRE | Trajetoria intermediaria | Pat real < R$8.5M aos 47 (2034): cenario adverso — modelar adiamento. Pat real >= R$11M aos 47: cenario favoravel — FIRE 50 altamente provavel (**P>85%**). SWR ≤ 3.0% a qualquer idade: avaliar FIRE imediato | Anual |
| FIRE | Custo de vida | Custo anual > R$287k | Recalcular SWR, patrimonio-alvo e FIRE date |
| Patrimonial | Holding | Pat >= R$5M | Avaliar holding familiar: ITCMD, sucessao, protecao patrimonial |
| Mercado | Equity drawdown global | MSCI World -20% em 6 meses | Manter DCA sem interrupcao. Se houver caixa extra (13o, PLR, entrada extraordinaria): antecipar aportes em equity. Nao reduzir aportes regulares por volatilidade |
| FIRE | Windfall | Entrada extraordinaria > R$1M | Recalcular trajetoria imediatamente |
| Saude | VCMH anual | VCMH real IESS > 9% por 2 anos consecutivos | Recalibrar spending smile (saude base + inflator cap/decay) na proxima retro anual. Fonte: iess.org.br > Publicacoes > VCMH. Ref: VCMH Jun/2023 = 15.1% nominal / ~11.7% real (pico pos-COVID) |
| Bond tent | Tamanho TD 2040 | TD 2040 < 6% do portfolio em jan/2037: bond tent < 2 anos de cobertura — avaliar alternativa (IPCA+ curto maior ou IMAB5). Meta: >= 10% do portfolio em 2040 | Verificar % portfolio. Monitorar a partir de jan/2032 |
| Soberano | Risco soberano BR | **CDS 5Y Brasil > 400bps sustentado por 6 meses** (pré-crise 2015 = ~350bps). Ou: dívida/PIB > 90% + deficit primário > 3% por 2 anos. | Avaliar venda IPCA+ longo e Renda+ 2065 (posições estruturais em BRL soberano). Escalar para Head + Tax + RF + Advocate como issue formal. NÃO vender em pânico — gatilho requer 6 meses sustentados. Monitorar: `market_data.py --macro-us` (CDS via FRED) |
| Tax | CBE obrigatorio | Saldo IBKR permanentemente > US$100k (desde 2025). Obrigacao legal continua | Declarar CBE anual na RFB (prazo: 31/mar). Confirmar saldo em 31/dez do ano-base |
| Equity / AVGS | AVGS alpha | Alpha liquido real pos-haircut 58% (McLean & Pontiff 2016) cai para <0% — verificar via AQR Factor Returns | Revisao de peso AVGS com Factor + Quant. Se confirmado com >=3 anos de dados: reduzir AVGS de 25% para 15-20% via aportes (nao vender) |
| Equity | Revisao transitorios | — (revisao sistematica anual) | Revisar estado dos 7 transitorios (EIMI, AVES, AVUV, AVDV, DGS, USSC, IWVL): (1) ritmo de diluicao vs target, (2) TLH opportunities (perda >=5%), (3) liquidez e regulacao. Nao e gatilho de venda — e gatilho de monitoramento |

---

## NOTAS (nao sao gatilhos ativos)

| Tipo | Item |
|------|------|
| Checklist de execucao | **DARF** — a cada venda de ETF com ganho de capital: emitir DARF ate o ultimo dia util do mes seguinte. Nao e gatilho de monitoramento — e consequencia direta da acao de venda. |
| Nota anual | **Estate tax** — verificar exposicao US-listed na revisao de janeiro. Exposicao atual: ~US$222k US-situs, ~US$65k de estate tax potencial (~R$340k). Plano: (1) diluir via aportes UCITS, (2) vender US-listed primeiro no usufruto/FIRE, (3) TLH em drawdown (duplo beneficio). Pendente: cotacao de seguro de vida temporario ~11 anos para cobrir risco residual. Risco aceito durante acumulacao. |

---

## GATILHOS FUTUROS

| Ativar em | Dominio | Gatilho | Condicao | Acao |
|-----------|---------|---------|----------|------|
| Jan/2031 | Equity / Bond tent | Glide path condicional | Diego com 44 anos + IPCA+ bruto >= 6.5% **e** curva de juros sinaliza manutenção acima de 6% por 5+ anos | Avaliar redução gradual de equity (79% → ~60%) via aportes direcionados para IPCA+. Se IPCA+ < 6%: manter 79% sem ação. Ref: FR-bond-tent-transicao (2026-04-02). Não incondicional — regime-dependent |
| Jan/2035 | IPCA+ Curto | SoRR pre-FIRE | Diego com 48 anos + **dois sinais simultâneos**: (1) taxa IPCA+ curto >= 6.5% **E** (2) gastos reais médios dos últimos 2 anos > R$270k | Comprar TD com vencimento ~2 anos antes do FIRE date previsto, 3% do patrimônio. Se apenas um sinal ativo: não comprar — TD 2040 sozinho cobre 6+ anos a R$250-270k |
| Jan/2038 | FIRE | RF pos-tent | Diego com 51-52 anos (2038-2039) + IPCA+ longo >= 6.0% | Avaliar compra IPCA+ ~2045-2050 (3-5% portfolio) para cobrir gap pos-tent (anos 53-60) |
| Jan/2047 | FIRE | INSS integration | Diego com 60 anos | Recalcular withdrawal rate incluindo INSS projetado aos 65. Atualizar guardrails se INSS > R$40k/ano |

---

## Principios do sistema

1. **Alarme = evento real, acao em dias.** Nao ha alertas de ruido.
2. **Mensal/Trimestral = check-in estruturado.** Data fixa, nao vigilancia constante.
3. **Anual = calibracao estrategica.** Janeiro — revisao completa de todos os gatilhos + premissas.
4. **HTM absoluto para IPCA+ Longo (TD 2040/2050).** Excecao unica: CDS > 800 bps.
5. **Menos e mais.** Qualquer adicao exige justificativa de impacto material. Revisoes documentadas no historico de issues.
