# PT-onelife

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | PT-onelife |
| **Dono** | 09 Patrimonial |
| **Status** | Done |
| **Prioridade** | Baixa |
| **Participantes** | 00 Head, 04 FIRE, 05 Tax, 06 Risco, 09 Patrimonial, 10 Advocate, 12 Behavioral, Fact-Checker, Juridico-br (temp), Juridico-intl (temp) |
| **Dependencias** | — |
| **Criado em** | 2026-03-19 |
| **Origem** | Conversa — socio de Diego opera estrutura de Luxemburgo via OneLife |
| **Concluido em** | 2026-03-27 |

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
- [x] Simular com equity value modesto (USD 200k)
- [x] Full-team stress-test: 9 agentes (2026-03-27)

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

## Full-Team Stress-Test (2026-03-27)

> Executado em 2026-03-27. 9 agentes consultados. Gatilho: Diego — "parece bom demais pra ser verdade."

### Veredicto: 9-0 contra entrar na estrutura como proposta

A frase de Diego foi confirmada pelo time. Os 4 pilares da proposta têm fragilidades jurídicas e fiscais significativas. A análise original da issue (seções 1-6) foi gerada com base no pitch do sócio — sem verificação independente. O stress-test identificou múltiplos erros factuais e riscos não divulgados.

### Erros Factuais Confirmados (Fact-Checker + Juridico-br + Juridico-intl)

| Claim original | Correto |
|---|---|
| Art. 22 Lei 7.713/89 garante isenção na morte | **Art. 6, XIII Lei 7.713/88**. Isenção existe mas é contestável para bond unit-linked |
| Tripartite = CAA + CSSF + auditor | CAA + **Seguradora** + **Banco Custódia** (UBS). CSSF supervisiona o banco, não é vértice |
| Lombard a 2-3% a.a. | UBS Base Loan Rate USD = **9.75%** (dez/2025). Spread positivo quebra em USD |
| "Opacidade" garantida por lei | Jargão sem base legal. Lei 14.754/2023 não usa os termos "opaco" ou "transparente" |
| Isenção total na morte | Contestável — bond unit-linked tem componente securitário de ~1%. RFB provavelmente isenta apenas esse componente (analogia VGBL) |
| Key person risk "eliminado" | Incompleto — co-souscription entre não-cônjuges cria dependência jurídica do sócio |
| OneLife pertence à Utmost Group | **OneLife pertence ao Grupo APICIL** desde 2019. Utmost = Lombard International (entidade diferente) |

### Os 4 Pilares — Status Pós Stress-Test

| Pilar | Status | Detalhe |
|---|---|---|
| "Opacidade" e diferimento | ❌ Frágil | Jargão sem base legal. CFO role + Art. 16 IN 2.180/2024 → bond = entidade controlada → tributação anual 15% em 31/12 (não diferimento) |
| Conversão sem IR | ❌ Improvável | Alienação tributável. IR 15-22.5% sobre ganho. Custo histórico no IRPF desconhecido |
| Lombard sem IR por décadas | ❌ Território minado | Zero precedente CARF. Lei 15.270/2025 cria alvo. RFB tem DDL (Lei 14.596/2023) como instrumento de requalificação. Sem step-up in basis na morte |
| Isenção total na morte | ❌ Altamente improvável | Componente seguritário do bond ≈ 1% do NAV. RFB aplica analogia VGBL: só componente seguro é isento |

### Achado Estrutural Crítico (Juridico-intl — CAA Circular 26/1, fev/2026)

A proposta "Diego entra no bond do sócio" pode ser **juridicamente inviável** sob a regulação luxemburguesa atual:

> *"Le Fonds Dédié ne peut pas servir de support au contrat d'un autre Souscripteur"*

Exceção permitida pela CAA: somente quando múltiplos souscripteurs são *"unis par le mariage ou des liens familiaux étroits"* (casados ou laços familiares estreitos). Diego e o sócio são parceiros de negócios — sem vínculo matrimonial/familiar.

**As 4 estruturas possíveis e seus riscos:**

| Estrutura | Super-privilège | Resgate autônomo | Proteção vs Lombard do sócio | Status |
|---|---|---|---|---|
| Diego = co-souscripteur do contrato do sócio | ✅ | ❌ Requer acordo conjunto | ❌ Ambos afetados | Provavelmente inviável (CAA 26/1) |
| Diego = contrato próprio + IDF separado | ✅ | ✅ | ✅ | **Viável — estrutura correta** |
| Diego = beneficiário do contrato do sócio | ⚠️ Derivado | ❌ Zero | ❌ Zero | Não é o que foi proposto |
| Diego = investidor informal | ❌ | ❌ | ❌ | Pior caso possível |

### Risco de Cross-collateralization (Juridico-intl)

Se o sócio tiver o bond pledgeado (nantissement) para Lombard loan próprio, e Diego estiver como co-souscripteur no mesmo contrato, o banco credor tem **direito exclusivo** ao valor de resgate do bond inteiro — incluindo a parcela de Diego. Execução sem aviso prévio (Lei luxemburguesa de Financial Collateral, 2005).

**Diego precisa saber: o bond atual do sócio já está pledgeado para Lombard?**

### Achado Fiscal Crítico (Tax + Juridico-br + Advocate)

**Cadeia fiscal completa: 5 premissas em série, qualquer uma quebrando destrói o benefício**

| Premissa | Probabilidade estimada | Base |
|---|---|---|
| "Opacidade" válida para Diego como co-participante | ~60-70% | IN 2.180/2024 Art. 16 — indefinido |
| Diego não classificado como "controlador" (CFO role) | ~50-60% | "Influenciar a estratégia" = zona cinzenta |
| Substância das SPVs aceita pela RFB | ~80% | Renda operacional real mitiga |
| Parecer Pinheiro Neto válido para Diego (não só o sócio) | ~70% | Parecer dado para o sócio |
| Lombard lending não requalificado pela RFB | ~60% | Sem precedente; Lei 15.270/2025 agrava |

**Cadeia completa: ~60%^5 ≈ 8-17% de certeza.** O diferimento — que é 80% do argumento financeiro — depende de todas as 5 premissas serem verdadeiras simultaneamente.

### Agravante: CRS Ativo Desde 2018

Luxemburgo e Brasil trocam informações automaticamente via Common Reporting Standard desde 2018. A RFB **já recebe dados sobre o bond**. Não há sigilo. Em caso de autuação, o histórico completo estará disponível.

### Resumo por Agente

| Agente | Achado Principal | Severidade |
|---|---|---|
| Advocate | IN 2.180/2024 + CFO role = diferimento pode colapsar | 🔴 |
| Tax | 5 premissas em cadeia; fee > deferral benefit; evento de conversão gera IR | 🔴 |
| Juridico-br | Lombard = zero precedente + Lei 15.270/2025; isenção morte = ~1% real; conversão = alienação tributável | 🔴 |
| Juridico-intl | IDF compartilhado inviável (CAA 26/1); cross-collateral Lombard; estrutura correta = contrato próprio | 🔴 |
| Fact-Checker | 5 erros factuais confirmados no pitch | 🟠 |
| Risco | 3 riscos sem mitigação; FWU = capital congelado por anos (stress test real em curso) | 🟠 |
| Patrimonial | Holding própria superior; cláusulas no foro luxemburguês impraticáveis para Diego | 🟠 |
| FIRE | Fee drag 11 anos ≈ R$350k; lock-in pré-FIRE; Lombard pior que guardrails | 🟡 |
| Behavioral | 5 biases ativos: autoridade, herding, reciprocidade, complexidade-como-qualidade, negligência de omissão | 🟡 |

---

## Conclusao

> Issue encerrada em 2026-03-27 após full-team stress-test com 9 agentes.

### Análise original (pré stress-test)

A análise inicial (seções 1-5) foi gerada com base no pitch do sócio e identificou benefícios reais: desacoplamento M&A, opcionalidade fiscal, proteção patrimonial. Com equity value de USD 200k (próximo ao real de Diego ~USD 150k), o bond empata no resgate gradual e ganha USD 130k se Diego nunca resgatar.

### Conclusao pós stress-test (2026-03-27)

**A estrutura tem mérito conceitual para investidores europeus sem exposição ao CRS. Para Diego — residente fiscal brasileiro com papel ativo de CFO, equity modesto (~USD 150k), e sob Lei 14.754/2023 + IN 2.180/2024 + Lei 15.270/2025 + CRS ativo — a proposta como apresentada não sustenta os benefícios prometidos.**

Os 3 pilares que fizeram a análise original ser positiva colapsam sob lei brasileira atual:
- "Opacidade" → interpretação de advogado do sócio, não disposição legal. CFO role provavelmente torna o bond uma entidade controlada (tributação anual, não diferimento)
- Lombard sem IR → zero precedente CARF + instrumentos de requalificação disponíveis + Lei 15.270/2025 cria perfil de alvo
- Isenção total na morte → provavelmente ~1% do NAV (componente seguro), não 100%

**Não é que a estrutura seja ilegal. É que todos os 4 pilares dependem de interpretações não testadas — e Diego seria o primeiro a testar, com a RFB já recebendo os dados via CRS.**

### Alternativa válida

Se Diego tiver interesse genuíno na plataforma OneLife, a estrutura correta é **contrato próprio com IDF separado** (não "entrar no bond do sócio"):
- Proteção plena: super-privilège (Art. 118), resgate autônomo, sem dependência do sócio
- Mínimo para IDF Tipo A: EUR 125k (Diego tem ~EUR 140k — no limite)
- Exige parecer fiscal próprio confirmando opacidade para este perfil específico

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Não entrar na estrutura como proposta. Antes de qualquer decisão: parecer fiscal próprio (R$20-40k, tier-1, advogado de Diego) |
| **Estrategia** | Bond como instrumento de planejamento de vida tem mérito conceitual — mas 4 pilares fiscais são frágeis sob lei brasileira atual. Estrutura correta = contrato próprio + IDF separado |
| **Conhecimento** | "Opacidade" = jargão, não lei. CFO role + IN 2.180/2024 = risco de tributação anual. Lombard = zero precedente CARF. Isenção morte = ~1% real. CRS ativo desde 2018. IDF compartilhado entre não-cônjuges inviável (CAA 26/1) |
| **Preventivo** | 5 erros factuais confirmados no pitch. Parecer do sócio não cobre Diego |

---

## Proximos Passos

### Antes de qualquer decisão (obrigatório):

- [ ] **Perguntar ao sócio qual das 4 estruturas está sendo proposta** — Diego seria co-souscripteur, teria contrato próprio com IDF separado, seria beneficiário, ou investidor informal? Resposta vaga = red flag.
- [ ] **Perguntar ao sócio se o bond atual está pledgeado (nantissement)** — para Lombard loan do sócio. Se sim: qual LTV e banco credor?
- [ ] **Contratar parecer fiscal próprio** (R$20-40k, tributarista tier-1, independente do advogado do sócio). Questões: (1) CFO role = entidade controlada ou aplicação financeira? (2) conversão gera IR imediato? (3) Lombard lending sistemático é sustentável no Brasil? (4) Art. 6 XIII se aplica a bond unit-linked?

### Se o parecer for favorável — estrutura recomendada:

- [ ] Contrato próprio com IDF separado (não compartilhar o bond do sócio)
- [ ] Verificar mínimo EUR 125k para IDF Tipo A — Diego tem ~EUR 140k (no limite)
- [ ] Formalizar mandato de investimento, direito de resgate unilateral, beneficiário, surrender charges schedule
- [ ] Confirmar custódia UBS independente e aprovada pela CAA

### Quando reabrir:

Após resposta do sócio às perguntas acima + parecer fiscal próprio.
