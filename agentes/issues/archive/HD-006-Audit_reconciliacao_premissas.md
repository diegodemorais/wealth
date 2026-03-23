# HD-006-Audit_reconciliacao_premissas

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-006 |
| **Dono** | 00 Head |
| **Status** | Done |
| **Prioridade** | Critica |
| **Participantes** | 02 Factor, 03 RF, 04 FIRE, 05 Tax, 10 Advocate |
| **Dependencias** | FR-001, RF-002, shadow-portfolio.md, carteira.md |
| **Criado em** | 2026-03-20 |
| **Origem** | Diego identificou erro no calculo do factor premium do AVGS. Audit revelou que o padrao se repete em multiplos calculos |

---

## Motivo / Gatilho

Diego trouxe tabela de breakeven AVGS que nao foi registrada e apontou: "vcs erraram em calcular o premium. Sera que em outros cenarios nao erraram tbm?"

Audit do Head confirmou: **SIM, o padrao se repetiu sistematicamente.** Premissas sem fonte, IR calculado sobre real em vez de nominal, numeros inconsistentes entre documentos.

### Tabela de referencia (Diego, 2026-03-20)

| Factor premium do AVGS | Equity real BRL | Delta em 14 anos | Compensa? |
|------------------------|-----------------|-------------------|-----------|
| 0% | 5.34% | +R$9.140 | Sim |
| 0.5% | 5.84% | +R$5.300 | Sim |
| **1.04%** | **6.38%** | **R$0** | **Breakeven** |
| 1.5% | 6.84% | -R$4.464 | Nao |

**Interpretacao**: Se AVGS entregar factor premium >= 1.04% sobre mercado neutro, equity BRL sobe para >= 6.38% e IPCA+ a 7.16% (5.34% liq) perde. Com os retornos aprovados (AVGS = 6.0% USD = 6.5% BRL base), o premium implicito e ~1.1% sobre SWRD (4.9% USD). Ou seja, estamos ACIMA do breakeven — equity vence IPCA+ no cenario base. Esta tabela foi o gatilho que motivou todo o audit HD-006.

---

## Escopo

### Bloco 1: Shadow B — IR sobre nominal (CRITICO)

- [x] Recalcular taxa liquida real do Shadow B usando formula correta (IR sobre nominal, nao sobre real)
- [x]Recalcular projecao deterministica inteira com taxa corrigida
- [x]Recalcular patrimonio aos 50 e SWR do Shadow B
- [x]Atualizar shadow-portfolio.md

**Erro**: Shadow B usa 6.09% = 7.16% × 0.85 (IR sobre real). Correto: ~5.31% (IR sobre nominal + custodia)

### Bloco 2: Retornos por ETF — fontes academicas (CRITICO)

- [x]Pesquisar retorno esperado com fonte para: SWRD, AVGS, AVEM, JPGL
- [x]Fontes: DMS 2024, AQR, Research Affiliates, MSCI, Morningstar
- [x]Distinguir: retorno real USD, retorno real BRL, com/sem factor premium
- [x]Registrar tabela com fonte para cada numero
- [x]Recalcular retorno ponderado da carteira

### Bloco 3: Reconciliacao de premissas (CRITICO)

- [x]Resolver inconsistencia: 3 numeros para "equity real" (4.8%, 5.09%, 5.34%)
- [x]Resolver inconsistencia: IPCA+ liquido (5.5-6.0% carteira, 5.88% RF-002, 6.09% Shadow B)
- [x]Criar tabela unica de premissas em carteira.md com fonte para cada numero
- [x]Atualizar todos os documentos que usam premissas desatualizadas

### Bloco 4: Cascata — recalculos dependentes

- [x]RF-002: comparacao IPCA+ vs equity — qual ativo esta sendo substituido? (5.09% generico vs JPGL 4.5%)
- [x]Shadow A: alinhar tax drag com carteira real (0% na acumulacao)
- [x]FR-001: recalcular com retornos corrigidos (se mudarem)
- [x]Breakeven 6.4%: confirmar se piso muda com premissas corrigidas
- [x]Registrar tabela de breakeven AVGS de Diego

---

## Erros Identificados no Audit

| # | Erro | Local | Gravidade | Impacto |
|---|------|-------|-----------|---------|
| 1 | Shadow B: IR sobre real (6.09%), deveria ser sobre nominal (~5.31%) | shadow-portfolio.md | ALTA | R$700k+ no patrimonio projetado |
| 2 | Retornos ETF sem fonte academica (SWRD 3.5%, AVGS 5.5%, AVEM 5.0%, JPGL 4.5%) | FR-001 | ALTA | Retorno ponderado 5.09% pode mudar |
| 3 | 3 numeros para "equity real" (4.8%, 5.09%, 5.34%) | Cross-doc | ALTA | Confusao em todos os calculos |
| 4 | RF-002 compara com 5.09% generico, nao com ativo substituido | RF-002 | MEDIA | Delta +24% errado (direcao correta) |
| 5 | Shadow A aplica IR 15% na acumulacao, carteira real usa 0% | shadow-portfolio.md | MEDIA | Comparacao enviesada |
| 6 | Monte Carlo FR-001 e heuristica, nao simulacao | FR-001 | MEDIA | Success rates podem estar off 5-10pp |
| 7 | Factor loadings FI-003 estimados, nao medidos | FI-003 | BAIXA | Decisao nao depende |

---

## Resultado

### Decisao intermediaria (2026-03-20)

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | IPCA+ alvo reduzido de 20% para 10%. Breakeven subiu de 6.4% para 7.81%. DCA PAUSADO (taxa atual 7.16% < breakeven 7.81%). Aportes redirecionados para JPGL |
| **Estrategia** | Equity BRL ponderado corrigido: 5.89% base / 6.89% favoravel / 5.39% stress. IPCA+ liquido: 5.34%. Equity vence IPCA+ por 55 bps no base |
| **Conhecimento** | (1) IR incide sobre nominal, nao real — drag de ~182 bps no IPCA+. (2) Factor premiums implicitos na carteira: ~1.1% AVGS, ~0.6% AVEM, ~0.8% JPGL. (3) Formula exata de repricing obrigatoria para duration > 20 (simplificada subestima 40-60%). (4) Breakeven de IPCA+ sobe com equity — nao e constante |

### Decisao FINAL (2026-03-22, aprovada por Diego)

O audit continuou apos a decisao intermediaria. Diego identificou que o breakeven de 7.81% e o anterior de 6.4% estavam ambos errados: (1) IR calculado sobre retorno real em vez de nominal, (2) custos de equity (WHT, IOF 1.1%, FX spread, ganho fantasma cambial) nao considerados. Com calculo all-in correto:

| Parametro | Valor |
|-----------|-------|
| **Alocacao alvo** | Equity 79%, IPCA+ longo 15%, IPCA+ curto 3%, Cripto 3% |
| **IPCA+ longo** | TD 2040 (80%) + TD 2050 (20%). DCA ATIVO (taxa 7.16% > piso 6.0%) |
| **IPCA+ curto** | 3% aos 50 (SoRR buffer, ~2 anos duration). Substitui Selic |
| **Breakeven all-in** | ~5.5% (com WHT, IOF, FX spread, IR sobre ganho cambial) |
| **Piso operacional** | 6.0% (margem 50 bps) |
| **Gatilhos** | >= 6.0%: DCA ativo. 5.0-6.0%: pausar, aportes para JPGL. < 5.0%: vender (MtM positivo) |
| **Comparacao R$100/14a** | IPCA+ R$225.8 (6.0%/ano) vs JPGL R$184.6 (4.5%/ano). IPCA+ vence por R$41 e 150 bps |

### Tabela de breakeven AVGS (Diego, 2026-03-20)

| Factor premium do AVGS | Equity real BRL | Delta em 14 anos | Compensa? |
|------------------------|-----------------|-------------------|-----------|
| 0% | 5.34% | +R$9.140 | Sim |
| 0.5% | 5.84% | +R$5.300 | Sim |
| **1.04%** | **6.38%** | **R$0** | **Breakeven** |
| 1.5% | 6.84% | -R$4.464 | Nao |

Interpretacao: esta tabela motivou o audit. Quando custos all-in de equity sao incluidos, IPCA+ a 7.16% vence equity em todos os cenarios razoaveis de factor premium.

### Racional da alocacao 15%

Diego tem concentracao pesada em Brasil (renda, gasto, INSS, empresa, futura esposa). O limitador de IPCA+ eh risco-pais, nao retorno. 15% captura a janela de 7%+ sem over-concentrar.

### 4 erros sequenciais e causa raiz

1. IR sobre real (nao nominal) — breakeven 6.4%
2. Retornos ETF sem fonte academica
3. Breakeven 7.81% (equity pre-tax vs RF post-tax)
4. Custos all-in de equity omitidos

Causa raiz: time calculava iterativamente, corrigindo um erro por vez, em vez de fazer a conta COMPLETA de uma vez. Diego corrigiu os 4 erros.

### Regras anti-recorrencia

1. **Fonte obrigatoria**: todo numero precisa de citacao
2. **Formula explicita**: passo a passo visivel antes do resultado
3. **Reconciliacao trimestral**: checar numeros-chave entre documentos
4. **Comparacao all-in**: SEMPRE incluir WHT, IOF, FX spread, ganho fantasma cambial ao comparar equity vs RF
5. **Reflexao registrada**: 4 erros em sequencia corrigidos por Diego. Time precisa fazer a conta COMPLETA antes de apresentar

| **Memoria** | Registrado em 00-head.md, 01-head.md, 03-renda-fixa.md, 04-fire.md. Correcoes aplicadas: carteira.md, shadow-portfolio.md |

### Erros corrigidos nesta execucao

| # | Erro | Correcao | Arquivo |
|---|------|----------|---------|
| 1 | Shadow B: IR sobre real (6.09%) | Corrigido para 5.34% (IR sobre nominal) | shadow-portfolio.md (sessao anterior) |
| 2 | Retornos ETF sem fonte (SWRD 3.5%, AVGS 5.5%, AVEM 5.0%, JPGL 4.5%) | Corrigido com DMS 2024 + factor premiums, em BRL 3 cenarios | carteira.md, FR-001 |
| 3 | 3 numeros para equity real (4.8%, 5.09%, 5.34%) | Unificado: 5.89% BRL base (portfolio equity ponderado) | carteira.md |
| 4 | IPCA+ liquido "5.5-6.0%" | Corrigido para 5.34% (IR sobre nominal, IPCA 4%) | carteira.md |
| 5 | Breakeven IPCA+ 6.4% | Corrigido para 7.81% (vs equity 5.89%) | carteira.md |
| 6 | IPCA+ alvo 20% | Reduzido para 10% (debate: equity vence por 55 bps) | carteira.md |
| 7 | FR-001 com retorno 5.09% | Corrigido para 5.84% (v4). Pat aos 50: R$10.96M. Limite seguro: R$384k | FR-001 |
| 8 | RK-001 drawdowns com formula simplificada | Recalculados com formula exata. Renda+ -65% (vs -38% anterior) | RK-001 |
| 9 | FR-001 pesos somam >100% | Explicitado: equity 89.1% + demais blocos. Pesos normalizados na tabela | FR-001 |
