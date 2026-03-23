# HD-007: Mapa Completo de Gatilhos da Carteira

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-007 |
| **Dono** | 00 Head |
| **Status** | Doing |
| **Prioridade** | Alta |
| **Participantes** | 06 Risco, 04 FIRE, 08 Macro, 10 Advocate, 07 Cambio, 05 Tax, 03 RF |
| **Dependencias** | HD-006 (premissas), FIRE-002 (cenarios de perda renda), FR-003 (Monte Carlo) |
| **Criado em** | 2026-03-22 |
| **Iniciado em** | 2026-03-23 |
| **Origem** | Diego apontou que os gatilhos atuais surgiram organicamente de issues individuais, sem um scan sistematico de todos os cenarios que deveriam acionar acao |

---

## Motivo / Gatilho

Hoje existem gatilhos espalhados por varios arquivos (carteira.md, memorias, issues), mas ninguem fez o exercicio de pensar: "quais sao TODOS os cenarios que deveriam acionar uma acao?" Podem existir gaps — riscos mapeados sem gatilho, ou gatilhos sem acao definida.

---

## Escopo

### 1. Inventario dos gatilhos existentes
- Coletar todos os gatilhos registrados em carteira.md, memorias, issues
- Classificar por dominio (alocacao, FIRE, macro, fiscal, behavioral, operacional)
- Verificar: cada gatilho tem condicao + acao + responsavel?

### 2. Scan de gaps
Para cada dominio, perguntar: "que evento deveria acionar uma acao e NAO tem gatilho?"

### 3. Consolidar em tabela unica
Uma tabela master com:
| Dominio | Gatilho | Condicao | Acao | Responsavel | Frequencia de check |

### 4. Definir monitoramento
- Quais gatilhos o check-in semanal/mensal verifica?
- Quais sao event-driven (so quando acontece)?
- Quais sao automatizaveis vs manuais?

---

## Status da Sessao 2026-03-23

### O que foi feito
- Todos os 5 agentes especialistas completaram o scan (risco, macro, rf, fire, tax)
- Head compilou rascunho da tabela master
- Advocate acionado para stress-test (estava rodando quando Diego saiu)

### Pendente ao retomar
1. **Receber resposta do Advocate** (estava em execucao)
2. **Diego resolver o conflito HTM** (ver abaixo)
3. **Diego aprovar tabela master** (rascunho completo abaixo)
4. Escrever tabela final em arquivo separado + commit

---

## ⚠️ CONFLITO A RESOLVER (Diego decide ao retomar)

**IPCA+ Longo — gatilho de venda:**
- `carteira.md` diz: "Gatilho de venda: NENHUM (exceto risco soberano extremo)" → HTM absoluto
- Memoria RF menciona: venda se taxa < 5,0% (MtM positivo) como possivel gatilho
- **Qual prevalece?** Head recomenda HTM absoluto (posicao estrutural, bond tent), mas Diego deve confirmar

---

## Rascunho da Tabela Master (para aprovacao de Diego)

### Gatilhos Existentes (confirmados)

| Dominio | Gatilho | Condicao | Acao | Freq |
|---------|---------|----------|------|------|
| IPCA+ Longo | DCA ativo | Taxa >= 6,0% | Aportar TD 2040 (80%) + 2050 (20%) | Mensal |
| IPCA+ Longo | Pausar DCA | Taxa 5,0-6,0% | Redirecionar para JPGL | Mensal |
| IPCA+ Curto | Compra SoRR | "Perto dos 50" | Comprar TD ~2 anos (3% patrimonio) | Event |
| Renda+ 2065 | Compra | Taxa >= 6,5% | DCA ate 5% | Mensal |
| Renda+ 2065 | Venda | Taxa <= 6,0% | Vender tudo | Mensal |
| Renda+ 2065 | Panico | Taxa >= 9,0% | Manter carrego | Event |
| HODL11 | Piso | < 1,5% patrimonio | Comprar ate 3% | Trimestral |
| HODL11 | Teto | > 5% patrimonio | Rebalancear para 3% | Trimestral |
| Equity | Rebalancear | Desvio de target | Via aportes, nunca venda | Mensal |
| Equity | JPGL prioritario | JPGL < 20% target | Aportar JPGL | Mensal |
| Evento de vida | Casamento | Decisao de casar | Recalibrar custo, FIRE, testamento, estrutura | Event |
| Desacumulacao | Guardrails | 0-15% / 15-25% / 25-35% / >35% | R$250k / R$225k / R$200k / R$180k | Trimestral |
| Desacumulacao | Upside | +25% acima do pico | +10% retirada permanente, teto R$350k | Anual |
| Operacional | Revisao anual | Janeiro | Revisao completa com todos agentes | Anual |
| Operacional | Reserva 2029 | Vencimento | Migrar para Selic | 2029 |

### Novos Gatilhos Propostos — IPCA+ / RF

| Dominio | Gatilho | Condicao | Acao | Freq |
|---------|---------|----------|------|------|
| IPCA+ Longo | Alvo atingido | RF longa = 15% patrimonio | Parar DCA, manter HTM | Mensal |
| IPCA+ Longo | Re-entrada | Taxa volta >= 6,0% apos pausa | Retomar DCA | Mensal |
| IPCA+ Longo | Acelerar DCA | Taxa >= 8,0% | Aumentar tiquete mensal | Event |
| IPCA+ Longo | Risco soberano (criterio) | CDS > 800 bps OU dominancia fiscal | Avaliar venda com Advocate | Mensal |
| IPCA+ Curto | Criterio de entrada | Diego com 48 anos (2035) + taxa >= 6,0% | Comprar TD ~2 anos, 3% patrimonio | 2035 |
| Renda+ 2065 | Zona neutra | Taxa 6,0-6,5% | Hold — sem compra, sem venda | Mensal |
| Renda+ 2065 | Teto atingido | Posicao >= 5% patrimonio | Pausar DCA | Mensal |
| Renda+ 2065 | Pos-FIRE | Diego completa 50 anos (2037) | Zerar Renda+ | 2037 |
| Renda+ 2065 | Conflito equity | Equity drawdown >30% + Renda+ < teto | Aportar equity primeiro | Event |

### Novos Gatilhos Propostos — HODL11 / Cripto

| Dominio | Gatilho | Condicao | Acao | Freq |
|---------|---------|----------|------|------|
| HODL11 | Tese quebra - regulacao | Proibicao ETF cripto B3 ou confisco | Venda total | Event |
| HODL11 | Tese quebra - protocolo | Falha critica Bitcoin (51%, quantum) | Venda total | Event |
| HODL11 | Correlacao | BTC/equity rolling 90d > 0.7 por 3+ meses | Revisar sizing (reduzir para 1-2%?) | Trimestral |

### Novos Gatilhos Propostos — FIRE / Patrimonio

| Dominio | Gatilho | Condicao | Acao | Freq |
|---------|---------|----------|------|------|
| Trajetoria | Off-track | Pat real < 80% mediano FR-003 na idade | Revisar aporte, custo alvo, FIRE date | Anual (jan) |
| Antecipacao | Piso FIRE | Pat >= R$7.35M | FIRE possivel, modelar success rate | Anual (jan) |
| Antecipacao | Mediano FIRE | Pat >= R$10.56M antes dos 50 | Avaliar FIRE imediato vs continuar | Anual (jan) |
| Antecipacao | Coast FIRE | Pat cresce ate R$10.56M sem aportes | Reduzir carga de trabalho | Anual (jan) |
| Antecipacao | Windfall | Evento > R$1M | Recalcular trajetoria imediatamente | Event |
| Adiamento | Insuficiente aos 48 | Pat < 70% mediano aos 48 (~R$7.4M) | Modelar adiamento 2-3 anos | Aos 48 (2035) |
| Adiamento | Bear pre-FIRE | Drawdown >30% nos 2 anos antes dos 50 | Adiar 1-2 anos | Event |
| FIRE | Custo de vida | Custo > R$287k/ano | Recalcular SWR, patrimonio-alvo, FIRE date | Anual (jan) |
| Guardrails | Restauracao | Pat volta ao pico + 2 trimestres de confirmacao | Restaurar retirada anterior | Trimestral |
| Evento de vida | Filho(s) | Decisao de ter filhos | Recalcular custo +R$60-120k/ano, FIRE date | Event |
| Protecao | Perda parcial renda | Renda cai >50% | Reduzir aporte, recalcular trajetoria | Event |
| Protecao | Invalidez | Incapacidade > 6 meses | Avaliar seguro DIT | Event |
| Marco | Auto-sustentavel | Pat >= R$5.47M | Perda de renda nao compromete FIRE | Mensal |

### Novos Gatilhos Propostos — Macro

| Dominio | Gatilho | Condicao | Acao | Freq |
|---------|---------|----------|------|------|
| Macro | Selic terminal | Focus Selic terminal < 12% | Alertar RF: antecipar DCA | Mensal |
| Macro | Desancoragem IPCA | Focus IPCA > 4,5% | Alerta geral; tese Renda+ muda | Mensal |
| Macro | IPCA severo | Focus IPCA > 5,5% | Alertar FIRE: premissa 4%/ano pode estar errada | Mensal |
| Macro | CDS amarelo | CDS Brasil 5y > 300 bps | Sinalizar deterioracao soberana | Mensal |
| Macro | CDS vermelho | CDS Brasil 5y > 500 bps | Revisao exposicao BR soberana com Advocate | Mensal |
| Macro | Divida/PIB | >= 100% PIB | Alertar: mercado reprecia risco soberano | Anual |
| Macro | Recessao + acumulacao | MSCI World -20% em 6 meses | Sinal para aumentar ritmo aportes | Event |

### Novos Gatilhos Propostos — Cambio

| Dominio | Gatilho | Condicao | Acao | Freq |
|---------|---------|----------|------|------|
| Cambio | BRL stress | BRL/USD > 6,5 | Acionar FX para analise de aporte exterior | Event |
| Cambio | BRL forte | BRL/USD < 4,5 | Acelerar aportes exterior | Event |
| Cambio | Custo de hedge | Diferencial Selic-Fed < 2% | Reavaliar viabilidade de hedge | Semestral |

### Novos Gatilhos Propostos — Fiscal / Tax

| Dominio | Gatilho | Prioridade | Condicao | Acao | Freq |
|---------|---------|------------|----------|------|------|
| Tax | CBE trimestral | CRITICO | Saldo IBKR > US$100k (ja excede) | Declarar CBE na RFB — multa por omissao | Trimestral |
| Tax | DARF pos-venda | CRITICO | Qualquer venda ETF com ganho | DARF ate ultimo dia util do mes seguinte | Event |
| Tax | Estate tax seguro | ALTA | Exposicao US-listed > US$200k (~$211k atual) | Cotar seguro de vida temporario | Event |
| Tax | IOF cascade | MEDIA | Mudanca de aliquota IOF | Recalcular breakeven all-in e piso 6,0% | Event |
| Tax | TLH transitarios UCITS | MEDIA | Transitario UCITS entra em prejuizo | Vender, recomprar via UCITS alvo | Event |
| Tax | Holding | MEDIA | Pat >= R$5M | Avaliar holding: ITCMD, sucessao | Anual |
| Tax | DIRPF | BAIXA | Marco/ano | Checklist preparacao declaracao + CBE | Anual |
| Tax | Lei IR ETFs | BAIXA | Mudanca em 15% flat | Recalcular breakevens, atualizar carteira.md | Event |

### Novos Gatilhos Propostos — Operacional / Comportamental

| Dominio | Gatilho | Condicao | Acao | Freq |
|---------|---------|----------|------|------|
| Operacional | CDS no snapshot | Mensal | Adicionar CDS BR 5y ao check-in mensal | Mensal |
| Operacional | Trajetoria patrimonio | Janeiro | Comparar pat real vs mediano FR-003 | Anual |
| Comportamental | Desejo de vender | Drawdown + vontade de sair | Acionar Behavioral primeiro | Event |
| Comportamental | Herding | Sugestao externa com argumento social | Acionar Behavioral | Event |

---

## Entregas

- Tabela master de gatilhos (completa, sem gaps)
- Mapa de monitoramento (quem checa o que, quando)
- Recomendacao: precisa de novos gatilhos? Algum existente deve ser removido?

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Pendente aprovacao |
| **Estrategia** | Pendente aprovacao |
| **Conhecimento** | Pendente aprovacao |
| **Memoria** | Pendente aprovacao |
