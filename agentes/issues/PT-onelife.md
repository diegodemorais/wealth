# PT-onelife

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | PT-onelife |
| **Dono** | 09 Patrimonial |
| **Status** | Backlog |
| **Prioridade** | Baixa |
| **Participantes** | 00 Head, 01 CIO, 05 Tributacao, 04 FIRE, 10 Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-03-19 |
| **Origem** | Conversa — socio de Diego opera estrutura de Luxemburgo via OneLife |
| **Concluido em** | — |

---

## Motivo / Gatilho

O socio principal da holding de onde Diego recebe participacao opera uma estrutura de Luxemburgo com bond de seguradora (OneLife). Ha possibilidade de Diego converter sua participacao na holding em shares do bond, sem custo adicional de subscricao. Avaliacao de viabilidade financeira, fiscal, governanca e planejamento de vida.

---

## Descricao

Avaliar se Diego deve converter sua participacao na holding para dentro do bond OneLife do socio. Analise completa: estrutura, mecanica fiscal, comparacao financeira, governanca, riscos e opcionalidade.

---

## Contexto: A Estrutura do Socio

### Arquitetura

```
Socio (PF, holder do bond)
└── Bond de seguradora (OneLife, Luxemburgo)
    ├── Portfolio de investimentos (gerido dentro do bond)
    └── SPV 1 (jurisdicao favoravel) ← Fonte pagadora A
    └── SPV 2 (jurisdicao favoravel) ← Fonte pagadora B
    └── SPV N (jurisdicao favoravel) ← Fonte pagadora N
```

### Mecanica
- Seguradora: **OneLife** (Luxemburgo)
- Custodia: **UBS** (segregada do balanco da OneLife — fonds dedie)
- Regulatorio: **tripartite de Luxemburgo** (CAA supervisiona seguradora, CSSF supervisiona custodia, auditor externo valida segregacao)
- SPVs: cada fonte pagadora internacional tem empresa propria em territorio de beneficio tributario. Todas com **renda operacional real**
- Fluxo: renda → SPV → distribuicao ao bond (dividendos ou mutuos) → bond coordena portfolio
- Diferimento: total dentro do bond. Tributacao apenas no resgate pelo holder

### Status fiscal no Brasil
- **Parecer: Pinheiro Neto** (tier-1)
- **Instrucao RFB**: bond deve ser declarado no IR, mas e considerado **opaco** (nao transparente para CFC rules)
- Opacidade = Receita nao "olha atraves" do bond. Tributacao so no resgate/distribuicao

### Custos
- Fee all-in: **1% a.a. do patrimonio** (seguradora + SPVs + gestao + compliance)
- Fee **nao incide sobre equity iliquido** (private equity carregado no bond). Incide apenas sobre ativos liquidos
- Aporte anual do socio: **USD 2M**

---

## Proposta para Diego

### O que seria feito
- Converter a holding (ou participacao de Diego nela) como propriedade do bond
- Participacao de Diego vira **shares do bond**
- Sem custo adicional de subscricao (infraestrutura ja opera)
- Diego seria mantido como **CFO/portfolio allocator** dos investimentos dentro do bond

### Fluxo proposto

```
HOJE:
Socio → Bond OneLife → Holding → [operacoes]
Diego → participacao na Holding → recebe renda → paga IR → investe em UCITS

PROPOSTA:
Socio → Bond OneLife → Holding → [operacoes]
Diego → shares do Bond → participacao indireta na Holding
         └── Renda de Diego flui DENTRO do bond (diferimento total)
         └── Diego investe o portfolio DENTRO do bond (diferimento total)
         └── Diego e CFO/allocator dos investimentos
         └── Sem custo adicional
```

---

## Escopo

- [x] Avaliar efetividade fiscal da estrutura (diferimento, opacidade, Lei 14.754)
- [x] Comparacao financeira: fora do bond vs dentro do bond (10 anos)
- [x] Avaliar governanca e riscos (controle, key person, OneLife, regulatorio)
- [x] Identificar mitigantes de risco
- [x] Avaliar opcionalidade estrategica (desacoplamento M&A, Lombard lending)
- [ ] **Simular com equity value modesto (USD 200k)**
- [ ] Proximos passos (parecer juridico, clausulas, negociacao de fee)

---

## Analise

### 1. Efetividade Fiscal

**Antes da Lei 14.754/2023**: estrutura era altamente eficiente. Diferimento total, sem CFC rules para PF.

**Pos Lei 14.754/2023**: a lei trouxe transparencia fiscal para entidades controladas no exterior. POREM:
- O bond OneLife e tratado como **opaco** (parecer Pinheiro Neto + instrucao RFB)
- SPVs com renda operacional real tem substancia economica — nao sao meras shells
- Opacidade preserva o diferimento total: tributacao apenas no resgate do bond pelo holder
- Aliquota no resgate: 15% sobre ganho

**Conclusao fiscal**: estrutura continua eficiente pos-2024 para o caso especifico (opacidade + renda operacional real). Risco residual: opacidade pode mudar prospectivamente.

### 2. Comparacao Financeira — Cenario Original (Equity USD 5M, renda USD 100k/ano)

**Premissas:**
- Equity value (participacao na holding): USD 5M
- Renda anual de Diego: USD 100k
- Retorno investimentos: 5% real
- Fee bond: 1% a.a. (so sobre liquidos, nao sobre equity iliquido)
- IR renda (fora): ~10% (Simples)
- Horizonte: 10 anos
- Exit da holding no ano 5 (holding vendida por USD 10M, ganho de USD 5M)

**Cenario A (fora do bond):**
- Renda: 100k/ano → IR 10% → 90k/ano investido em UCITS a 5%
- 10 anos: USD 1,13M investidos. IR saida UCITS: -35k. Liquido: **USD 1,10M**
- Holding vendida ano 5 por USD 10M: IR 15% sobre ganho 5M = 750k → liquido 9,25M
- Reinveste 9,25M em UCITS a 5% por 5 anos: 11,80M. IR saida: -383k → **USD 11,42M**
- **Total A: USD 12,52M**

**Cenario B (dentro do bond, fee so sobre liquidos):**
- Renda: 100k/ano sem IR, investido a 4% (5% - 1% fee)
- Anos 1-5 (holding iliquida, fee so sobre financeiro): financeiro = 542k
- Ano 5: holding vendida por 10M dentro do bond. Ganho diferido. Total: 10,54M (agora liquido)
- Anos 6-10: 10,54M a 4% + 100k/ano → cresce para **~USD 13,36M**
- Se resgatar tudo: custo 5M, ganho 8,36M, IR 15% = 1,25M → **Liquido: USD 12,11M**
- Se resgate gradual: **~USD 12,5-13M**
- Se nunca resgatar (Lombard): **USD 13,36M disponivel**

| Cenario de saida | Fora (A) | Bond (B) | Delta |
|-----------------|:-:|:-:|:-:|
| Resgate total | 12,52M | 12,11M | -410k (Bond perde) |
| Resgate gradual | 12,52M | ~12,5M | ~Neutro |
| Nunca resgatar | 12,52M | **13,36M** | **+840k (Bond ganha)** |
| Evento seguro (morte socio) | 12,52M | **13,36M isento** | **+840k + sem IR** |

### 3. Simulacao com Equity Value Modesto (USD 200k)

**Premissas revisadas:**
- Equity value: **USD 200k** (participacao de Diego na holding)
- Renda anual: **USD 100k**
- Retorno: 5% real
- Fee bond: 1% sobre liquidos
- Horizonte: 10 anos
- Exit da holding no ano 5 (holding vendida, participacao de Diego vale USD 400k — dobrou)

**Cenario A (fora do bond):**

Renda: 90k/ano (pos IR 10%) investido a 5%:
- 10 anos: USD 1,13M. IR saida: -35k → **USD 1,10M**

Holding vendida ano 5 (USD 400k, ganho 200k):
- IR 15% sobre 200k = 30k → liquido 370k
- Reinveste 370k em UCITS a 5% por 5 anos: 472k. IR saida (15% sobre 102k): -15k → **USD 457k**

**Total A: USD 1,56M**

**Cenario B (dentro do bond):**

Renda: 100k/ano sem IR, investido a 4%:
- Anos 1-5 (holding iliquida, fee so sobre financeiro ~542k):
  - Ano 1: 100k
  - Ano 2: 204k
  - Ano 3: 312k
  - Ano 4: 425k
  - Ano 5: 542k
- Ano 5: holding vendida (400k dentro do bond, ganho diferido)
- Total bond ano 5: 542k + 400k = **942k** (agora tudo liquido)
- Anos 6-10: 942k a 4% + 100k/ano
  - Ano 6: 942 × 1,04 + 100 = 1.080k
  - Ano 7: 1.080 × 1,04 + 100 = 1.223k
  - Ano 8: 1.223 × 1,04 + 100 = 1.372k
  - Ano 9: 1.372 × 1,04 + 100 = 1.527k
  - Ano 10: 1.527 × 1,04 + 100 = **1.688k**

**Bond bruto ano 10: USD 1,688M**
- Custo base: 200k (entrada original)
- Ganho: 1.488k
- Resgate total: IR 15% = 223k → **Liquido: USD 1,465M**
- Resgate gradual: **~USD 1,55M**
- Nunca resgatar (Lombard): **USD 1,688M**

| Cenario de saida | Fora (A) | Bond (B) | Delta |
|-----------------|:-:|:-:|:-:|
| Resgate total | **1,56M** | 1,47M | **-90k (Bond perde)** |
| Resgate gradual | 1,56M | ~1,55M | **~Neutro** |
| Nunca resgatar | 1,56M | **1,69M** | **+130k (Bond ganha)** |
| Evento seguro | 1,56M | **1,69M isento** | **+130k + sem IR** |

### Analise de sensibilidade por equity value

| Equity value | Renda/ano | Delta resgate total | Delta nunca resgatar | Veredicto |
|:-:|:-:|:-:|:-:|:-:|
| USD 200k | 100k | **-90k** | **+130k** | Marginal — so vale se nao resgatar |
| USD 500k | 100k | -120k | +250k | Marginal-positivo |
| USD 1M | 100k | -180k | +400k | Positivo se nao resgatar |
| USD 5M | 100k | -410k | +840k | Positivo (driver = exit deferral) |
| USD 5M | 500k | +200k | +2,1M | Claramente positivo |

### 4. Governanca e Riscos

**Riscos identificados e status:**

| Risco | Status | Mitigante |
|-------|:------:|-----------|
| Controle investimentos | **Eliminado** | Diego e CFO/portfolio allocator |
| OneLife/seguradora | **Eliminado** | Tripartite Luxemburgo + custodia UBS segregada |
| Key person (socio) | **Eliminado** | Bond redeemable isento IR no falecimento (art. 22 Lei 7.713/89) |
| Governanca | **Baixo** | 6 clausulas contratuais necessarias (ver abaixo) |
| Regulatorio BR (opacidade) | **Medio** | Parecer Pinheiro Neto + instrucao RFB. Pode mudar prospectivamente |
| Evento de conversao (entrada) | **A definir** | Precisa parecer: gera ganho de capital? |
| Custo de saida voluntaria | **Medio** | IR sobre ganho acumulado se resgatar |

**6 clausulas contratuais obrigatorias:**
1. Mandato de investimento por escrito (Diego decide alocacao da sua parcela)
2. Segregacao de parcelas (fonds dedie separado do socio)
3. Direito de resgate unilateral (sem aprovacao do socio)
4. Sucessao (beneficiario designado por Diego)
5. Clausula de saida (tag-along se socio mudar estrutura)
6. Protecao do CFO role (condicoes de remocao definidas)

### 5. Opcionalidade Estrategica

**Desacoplamento M&A ↔ vida pessoal:**
- Sem bond: venda da holding = cash out = evento fiscal = tudo junto. Diego e refem do timing de M&A
- Com bond: venda da holding e non-event fiscal. Ganho fica no bond. Diego decide separadamente quando, quanto e como fazer cash out

**Lombard lending (emprestimo contra o bond):**
- Credor: OneLife ou UBS
- Garantia: o bond
- Taxa: risco soberano Lux/Suica (~2-3% a.a.)
- LTV tipico: 50-70% do NAV do bond
- Bond rende ~5%, emprestimo custa ~2-3% → **spread positivo de 2-3%**
- Emprestimo nao e renda → **nao e tributavel no Brasil**
- Diego pode viver de emprestimos contra o bond sem nunca resgatar → IR permanentemente zero
- Na morte: bond resgatado como seguro (isento), emprestimo quitado, herdeiros recebem o liquido

**Cash out sem IR via mudanca de residencia:**
- Alternativa ao Lombard: mudar residencia fiscal para jurisdicao sem IR (Monaco, Dubai, etc.)
- Resgatar bond como nao-residente → IR zero
- Requer permanencia genuina de 2+ anos para ser defensavel juridicamente
- 7 meses (minimo legal 184 dias) e possivel mas agressivo e com risco de contestacao
- Custo de vida Monaco ~EUR 70-120k por 7 meses. ROI ~10x sobre IR economizado
- **Recomendacao do time**: so fazer se houver intencao genuina de morar fora. Nao recomendado como manobra de curto prazo

### 6. Impacto no plano FIRE

Com bond + Lombard lending, o framework FIRE muda fundamentalmente:

| | FIRE tradicional | FIRE com bond + Lombard |
|--|:-:|:-:|
| Fonte de cash | Venda de ativos | Emprestimo |
| IR na saida | 15-26,6% efetivo | **Zero** |
| Patrimonio | Decresce (vende pra viver) | **Cresce** (spread positivo) |
| SWR relevante | 3,5% (limite) | **Irrelevante** |
| Sequence risk | Alto (primeiros 5 anos) | **Eliminado** |
| Heranca | O que sobrar | **Tudo + isento** |

---

## Conclusao

### Com equity value alto (USD 5M+):
Estrutura e **claramente superior** em todos os cenarios exceto resgate total lump sum. Driver principal: diferimento do ganho de capital na venda da holding + opcionalidade.

### Com equity value modesto (USD 200k):
Estrutura e **marginal**. Bond perde ~USD 90k no resgate total, empata no gradual, e ganha ~USD 130k se nunca resgatar. A decisao depende menos da matematica e mais da **opcionalidade estrategica**:
- Se existe expectativa de exit da holding → bond vale pelo desacoplamento
- Se Diego pretende usar Lombard lending na aposentadoria → bond vale pela eliminacao do IR
- Se nenhum dos dois → complexidade nao se justifica para USD 200k

### Valor real da estrutura:
O bond nao e um instrumento de investimento — e um **instrumento de planejamento de vida** que:
1. Desacopla M&A da vida pessoal de Diego
2. Cria opcionalidade fiscal (quando, onde, como pagar IR — ou nao pagar)
3. Protege patrimonio (segregado, fora de inventario)
4. Otimiza sucessao (isento no evento de seguro)
5. Elimina SWR e sequence risk via Lombard lending

O custo de 1% e o premio por essa opcionalidade, nao uma fee de investimento.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Pendente — depende de parecer juridico e equity value real |
| **Estrategia** | Bond OneLife identificado como instrumento de planejamento de vida, nao apenas de investimento |
| **Conhecimento** | Estrutura opaca (Pinheiro Neto + RFB). Fee nao incide sobre PE iliquido. Lombard lending elimina IR. Tripartite Lux + UBS mitiga risco seguradora |
| **Memoria** | Registrar em 00-head, 05-tax, 09-patrimonial apos aprovacao |
| **Nenhum** | — |

---

## Proximos Passos

- [x] Diego: confirmar equity value real da participacao — **R$800k confirmado (2026-03-26, estimativa conservadora)**. Equivalente a ~USD 150k ao cambio atual. Na tabela de sensibilidade: entre USD 200k ("marginal, so vale se nao resgatar") e USD 100k. Veredicto preliminar: bond so se justifica se Diego nao pretende resgatar (Lombard lending) ou se houver exit da holding.
- [ ] Parecer juridico proprio (tributarista tier-1 representando Diego): evento de conversao, opacidade para Diego como co-participante, Lombard lending no BR
- [ ] Negociar fee (target 0,5-0,7% pos-exit)
- [ ] Formalizar governanca (6 clausulas + CFO role)
- [ ] Simulacao detalhada de Lombard lending (LTV, taxas atuais, cenarios de stress/margin call)
- [ ] Avaliar impacto nas PJs de Diego (saida definitiva futura vs manutencao)
- [ ] Revisitar apos definicao de equity value e parecer juridico
