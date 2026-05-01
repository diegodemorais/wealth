# HD-unanimidade: Unanimidade em macro/risco — calibragem ou echo chamber?

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-unanimidade |
| **Dono** | 00 Head |
| **Status** | Done |
| **Prioridade** | Media |
| **Participantes** | 10 Advocate, 12 Behavioral, 15 Fact-Checker |
| **Dependencias** | — |
| **Criado em** | 2026-03-27 |
| **Origem** | Retro 2026-03-27 — provocacao do Advocate sobre unanimidade |
| **Concluido em** | 2026-04-01 |

---

## Motivo / Gatilho

Na retro 2026-03-27, o Advocate identificou que **7 issues analisadas no periodo terminaram com "manter/zero mudanca"**:

- MA-equity-br: 0% equity BR
- MA-bond-correlation: IPCA+ = carry HTM, nao hedge
- HD-brazil-concentration: concentracao estrutural aceita
- RK-gold-hedge: zero ouro
- RK-managed-futures: zero MF
- HD-equity-weight: 79% equity confirmado
- HD-simplicity: carteira atual mantida

**Zero divergencia real em 7 analises.** Isso levanta a questao: o sistema esta gerando insights ou confirmando o que Diego ja decidiu?

---

## Descricao

Investigar se a unanimidade observada e:

**Hipotese A (Calibragem):** A carteira foi bem projetada e resistiu a 7 stress-tests distintos. "Manter" e a resposta correta quando a evidencia nao justifica mudanca.

**Hipotese B (Convergencia estrutural):** Os agentes estao converging para confirmar o status quo porque foi definido por Diego + pelo proprio sistema em iteracoes anteriores. Nenhum agente tem incentivo para ser o unico a dizer "muda."

**Hipotese C (Ausencia de falsificabilidade):** As issues foram formuladas de forma que confirmacao e o resultado natural. "79% equity e certo?" e uma pergunta que facilita confirmacao; "quando 79% equity estaria errado?" e a pergunta que revelaria os limites.

---

## Escopo

- [ ] Revisitar as 7 issues com a pergunta: "qual evidencia especifica teria mudado a conclusao?"
- [ ] Verificar: as condicoes de falsificabilidade foram registradas em cada issue?
- [ ] Advocate e Behavioral: buscar argumentos nao apresentados nas issues originais que poderiam ter divergido
- [ ] Fact-Checker: verificar se ha literatura relevante nao citada que contradiz as conclusoes
- [ ] Comparar com forum Rational Reminder e Bogleheads: ha debate ativo sobre alguma dessas 7 posicoes?
- [ ] Proposta: ao menos 1 das 7 issues deve ter uma condicao de mudanca explicita registrada

---

## Raciocinio

**Argumento central (Advocate):** Se 100% dos debates terminam com "manter", o sistema nao esta gerando valor diferencial. Diego com uma planilha e o Rational Reminder chegaria ao mesmo resultado. O valor do time e proporcional a quantas vezes ele mudar a conclusao que Diego chegaria sozinho — ou explicar *por que nao mudou* com rigor que Diego nao teria sozinho.

**Contra-argumento (Head):** Periodo de 4 dias apos um audit extenso (HD-006, scorecard, etc.) — e natural que as conclusoes estejam estabilizadas. Unanimidade num periodo de maturacao nao implica echo chamber permanente.

**Incerteza reconhecida:** Nao temos baseline de "qual taxa de mudanca seria saudavel." 0% parece suspeito; 100% seria alarme constante. Algum valor entre 10-30% parece razoavel — mas nunca foi definido.

**Falsificacao:** Se Advocate + Behavioral + Fact-Checker encontrarem argumentos concretos que deveriam ter mudado pelo menos 1 das 7 conclusoes, Hipotese B ou C e confirmada e protocolo anti-echo-chamber precisa ser implementado.

---

## Analise

### Classificação por Issue (3 agentes + 2 advocates independentes)

| Issue | Veredito | Achado principal |
|-------|----------|-----------------|
| MA-equity-br | **A com gap** | Heathcote & Perri (JPE 2013) não citado — refuta Baxter & Jermann diretamente. Conclusão pode estar certa, melhor contra-argumento foi ignorado |
| MA-bond-correlation | **C** | Única das 7 sem falsificabilidade registrada. Escopo prometia correlação rolling 3 anos — não foi executado. Fechada com reclassificação conceitual, não cálculo |
| HD-brazil-concentration | **A com ressalva** | "Risco é de liquidez, não alocação" — sem base empírica (Argentina 2001, Rússia 1998 = destruição de capital, não liquidez). Buffer USD $25k nunca implementado |
| RK-gold-hedge | **A** | Evidência peer-reviewed fraca para ouro. BTC ≠ substituto de ouro (correlação ~0.1, perfis de crise diferentes). Cadeia de delegação: gold→MF→JPGL→nunca resolvido |
| RK-managed-futures | **A genuíno** | Bloqueio operacional real (sem UCITS viável), gatilhos claros e verificáveis |
| HD-equity-weight | **B** | Pfau/Kitces (2014) descartado sem refutação: Diego tem guardrails = withdrawal flexível = exatamente o perfil de Pfau/Kitces. Plano de transição (bond tent timing) ausente |
| HD-simplicity | **A** | Trabalho rigoroso, quantificação feita. Ressalva: argumento comportamental (custo > alpha) subdesenvolvido |

**Contagem: 4-5 A, 1 B, 1 C (bond-correlation)**

### 3 Bugs Sistêmicos Documentados

**Bug 1 — Restrição operacional ≠ validação estratégica:**
Custo de IR (15%) ao migrar foi usado para confirmar que a alocação *atual está certa* — quando deveria responder separadamente: "Se começasse do zero, qual seria a alocação?" HD-equity-weight e HD-simplicity confundiram as duas perguntas sistematicamente.

**Bug 2 — Burden of proof no lado da mudança:**
Nenhuma das 7 issues perguntou "qual é a melhor opção entre N alternativas?" Sempre: "X está certo?" — framing que favorece confirmação do status quo.

**Bug 3 — Cadeia de delegação circular:**
- RK-gold-hedge → "avalie MF antes de ouro"
- RK-managed-futures → "zero, reavalie quando JPGL fechar gap"
- Resultado líquido: zero diversificação alternativa sem ninguém responsável pela decisão consolidada

### Case Study JPGL

Em 5 análises, nunca foi feita a pergunta "adicionaríamos do zero?". A pergunta foi sempre "devemos remover?"

Ao fazer a pergunta zero-based pela primeira vez (FI-jpgl-zerobased, 2026-04-01), dois agentes independentes convergiram para **10-15%, não 20%** — resultado diferente das 5 análises anteriores. Isso confirma que o framing anterior favorecia o status quo.

Dado perturbador: alpha ao vivo -2.33%/ano (t=-1.49, 79 meses) foi interpretado como "período adverso" — narrativa não falsificável. A posição real era ~R$12k (0.4% do portfolio): o time defendia um target teórico, não uma posição consolidada.

---

## Conclusao

**Hipóteses B+C confirmadas parcialmente — não é echo chamber puro, mas sistema com vieses sistêmicos documentados.**

O sistema não fabrica evidências e chegou a conclusões defensáveis em 4-5 das 7 issues. Mas opera com três vieses que produziram:
- Excesso de confiança em 3/7 issues (raciocínio contaminado, não conclusão errada)
- Ausência de falsificabilidade em 1/7 (MA-bond-correlation — a mais grave)
- Burden of proof sistematicamente no lado da mudança

A taxa de 0% de mudança em 7 issues não reflete calibragem perfeita. Reflete protocolo que não tem mecanismo de invalidação. A pergunta zero-based, feita pela primeira vez em JPGL, produziu resultado divergente.

### Veredicto Ponderado

| Agente | Peso | Posição |
|--------|------|---------|
| Behavioral | 2x | Hipótese C dominante — framing bias 5/5 em HD-equity-weight, HD-simplicity |
| Fact-Checker | 2x | 5/7 robustas, gaps materiais em gold (paper não citado) e brazil-concentration (claim sem suporte) |
| Advocate-1 | 1x | C dominante em 3/7, B em 2/7, A em 2/7 |
| Advocate-7 | 1x | Calibragem imperfeita — 3-4 A, 2 B, 1 C. "Grau de certeza excessivo em 3 issues" |
| **Consensus** | | **B+C parcialmente confirmadas. Calibragem imperfeita com vieses sistêmicos documentados** |

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | Indiretamente: JPGL provavelmente 15%, não 20% (FI-jpgl-zerobased em andamento) |
| **Estratégia** | 4 outputs gerados: (1) falsificabilidade MA-bond-correlation, (2) FR-bond-tent-transicao, (3) protocolo Advocate pré-fechamento, (4) Agente 16 Zero-Based criado |
| **Conhecimento** | 3 bugs sistêmicos documentados. Pergunta zero-based é a ferramenta que faltava |
| **Memória** | Head, Advocate, Behavioral |

---

## Proximos Passos

- [x] Advocate: revisitar 7 issues com olhar adversarial
- [x] Behavioral: avaliar viés de status quo nas formulações
- [x] Fact-Checker: buscar evidência contraditória não apresentada
- [x] Criar agente 16 Zero-Based (concluído 2026-04-01)
- [x] Adicionar falsificabilidade MA-bond-correlation em gatilhos.md
- [x] Criar FR-bond-tent-transicao
- [x] Atualizar protocolo Advocate pré-fechamento
- [x] Abrir FI-jpgl-zerobased com framing correto
