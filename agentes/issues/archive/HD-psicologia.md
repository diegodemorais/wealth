# HD-psicologia: Psicologia cognitiva aplicada — evolucao do sistema de agentes

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-psicologia |
| **Dono** | 00 Head |
| **Status** | Done |
| **Prioridade** | Baixa |
| **Participantes** | 12 Behavioral, 10 Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-03-23 |
| **Origem** | Conversa — Diego explorando formas de evoluir o sistema |
| **Concluido em** | 2026-03-26 |

---

## Motivo / Gatilho

Diego estava explorando psicologia cognitiva aplicada a IA e questionou se havia algo que pudesse melhorar o sistema de agentes da carteira. Quatro ideias concretas surgiram da conversa com o Head.

---

## Descricao

O sistema atual e forte em execucao e processo, mas pode evoluir na qualidade do raciocinio e na reducao de vieses sistemicos. As ideias abaixo nao sao urgentes, mas representam evolucoes de alto potencial para a qualidade das decisoes ao longo do tempo.

---

## Ideias a Explorar

### 1. Calibracao de confianca dos agentes

**Problema:** agentes dao recomendacoes sem indicar grau de certeza. "Recomendo X" e "recomendo X com alta incerteza, dados limitados" sao tratados igual pelo Diego — e nao deveriam.

**Evidencia:** experts mal calibrados sao mais perigosos que incertos (Kahneman, Tetlock — superforecasters). Voce age como se soubesse mais do que sabe.

**Proposta:** cada recomendacao de agente incluir explicitamente: confianca (Alta/Media/Baixa) + base da confianca (dados robustos / analogia / opiniao). Padronizar no template de resposta.

---

### 2. Pre-mortem estruturado (proativo)

**Problema:** o Advocate faz stress-test de forma reativa (quando acionado). Psicologia cognitiva mostra que o pre-mortem — imaginar que a decisao falhou e perguntar "como aconteceu?" — e mais eficaz que analise de risco convencional para identificar pontos cegos.

**Evidencia:** Gary Klein (naturalistic decision making) — pre-mortem reduz overconfidence e melhora identificacao de riscos antes da decisao, nao depois.

**Proposta:** para decisoes de alta consequencia (mudanca de alocacao >5%, novo ativo, mudanca de premissa FIRE), ativar pre-mortem como etapa obrigatoria antes da aprovacao de Diego.

---

### 3. Registro de raciocinio, nao so de decisao

**Problema:** hoje registramos o que decidimos (issues, memoria). Nao registramos o raciocinio no momento da decisao — os argumentos, as alternativas rejeitadas, as incertezas reconhecidas.

**Potencial:** com o tempo, seria possivel identificar padroes: "toda vez que o mercado caiu X%, Diego decidiu Y com argumento Z — e o argumento estava correto/errado." Isso e aprendizado real, nao so historico.

**Proposta:** adicionar campo "Raciocinio" nas conclusoes de issues importantes. Formato: (1) alternativas consideradas, (2) argumento principal, (3) incerteza reconhecida. Avaliar na retro se os argumentos se provaram corretos.

---

### 4. Separacao explicita de dado e interpretacao

**Problema:** agentes frequentemente trazem dado + interpretacao juntos, sem distinguir. Diego absorve os dois como igualmente confiaveis — mas o dado e empirico, a interpretacao e contestavel.

**Proposta:** nas respostas dos agentes, separar explicitamente:
- **Dado:** "a taxa IPCA+ esta em 6,2%" (confiavel, verificavel)
- **Interpretacao:** "isso sugere que o DCA deve ser retomado" (contestavel, sujeito a debate)

Reduz o risco de Diego aceitar uma conclusao por confiar na fonte dos dados.

---

## Exemplos concretos das ultimas sessoes (2026-03-26)

As sessoes de 2026-03-22 a 2026-03-26 geraram exemplos perfeitos para cada ideia:

| Ideia | Exemplo concreto |
|-------|-----------------|
| Calibracao de confianca | Advocate deu Renda+ MtM -75%, Quant corrigiu para -82%. Nenhum indicou incerteza. Se tivessem, Diego saberia que o numero era estimativa. |
| Pre-mortem | HD-simplicity usou "burden of proof invertido" — imaginou que a carteira atual falhou e perguntou "como aconteceu?". Funcionou muito bem, identificou que alpha e 0.16%, nao 0.5%. |
| Dado vs interpretacao | Fact-Checker separou dado IOF (errado — era sobre entrada de capital estrangeiro, nao remessas PF) da interpretacao de risco (valida — controle de capital existe historicamente). Evitou uma decisao baseada em dado incorreto. |
| Registro de raciocinio | HD-brazil-concentration: o raciocinio do Advocate ("riqueza total sobe 7% em BRL em crise") foi o argumento central. Mas nao esta registrado formalmente — so a conclusao. Em 5 anos, Diego nao saberia por que concluiu isso. |

## Escopo (quando executado)

- [ ] Avaliar quais das 4 ideias tem melhor custo-beneficio para implementar
- [ ] Definir como cada uma mudaria o comportamento dos agentes na pratica
- [ ] Prototipar com Behavioral e Advocate: como ficaria o template de resposta?
- [ ] Testar em 2-3 decisoes reais antes de padronizar
- [ ] Avaliar se muda o CLAUDE.md ou apenas os perfis dos agentes

---

## Analise

Debate com Behavioral (12), Fact-Checker e Advocate (10) revelou tres temas transversais:

1. **Gap critico: feedback loop** — nenhuma das 4 ideias originais fechava o ciclo. Sem scoring retroativo, calibracao e decorativa (Tetlock 2015). Identificado independentemente pelos 3 agentes.

2. **Ideia 2 precisa de complemento**: pre-mortem ja existia no Advocate — risco de duplicacao. Klein (1998) recomenda pre-parade como complemento obrigatorio. Reference class forecasting (Flyvbjerg 2006) como etapa 0 e mais poderoso que qualquer tecnica narrativa.

3. **Novos vieses identificados pelo Behavioral**: affect heuristic (Slovic 2002), attribute substitution (Kahneman 2003), hot-cold empathy gap (Loewenstein 2005) — nao cobertos pelas 4 ideias originais. Cobertos indiretamente pelo scoring retroativo (se calibracao sistematicamente alta em bull markets = overconfidence situacional).

Ajustes incorporados vs proposta original:
- Ideia 1: transformada de label por veredicto → scoring retroativo na retro (Advocate: "cortar ou scoring real")
- Ideia 2: estendida com pre-parade + reference class + cenarios especificos (nao genericos)
- Ideia 3: adicionado campo "Falsificacao" — operacionaliza Popper (Mauboussin 2012)
- Ideia 4: adicionado criterio explicito (dado = verificavel agora; interpretacao = requer inferencia)
- Adicao B (julgamentos independentes): evidencia Kahneman/Sibony/Sunstein 2021 suporta fortemente
- Adicao C (commitment device): ja existia parcialmente em retro-dinamica.md — estendido para premissas frageis

---

## Conclusao

7 implementacoes concluidas em 4 arquivos. Debate com agentes revelou ajustes significativos vs proposta original — especialmente o feedback loop como gap critico e o pre-parade como complemento obrigatorio ao pre-mortem.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | — |
| **Estrategia** | 7 mudancas de processo: template issues, pre-mortem+pre-parade+reference class, scoring retroativo na retro, commitment device premissas frageis, julgamentos independentes, separacao dado/interpretacao |
| **Conhecimento** | Feedback loop e o gap critico de sistemas de decisao sem aprendizado. Pre-parade corrige negativity bias do pre-mortem. Reference class > narrativa especifica. |
| **Memoria** | — |
| **Nenhum** | — |

---

## Proximos Passos

- [ ] Aplicar campo Raciocinio + Falsificacao na proxima issue de Alta prioridade
- [ ] Primeiro scoring retroativo na proxima retro trimestral
- [ ] Verificar em 2 retros se julgamentos independentes geram divergencias reais vs ancoragem anterior
