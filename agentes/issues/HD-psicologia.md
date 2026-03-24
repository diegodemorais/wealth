# HD-psicologia: Psicologia cognitiva aplicada — evolucao do sistema de agentes

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-psicologia |
| **Dono** | 00 Head |
| **Status** | Backlog |
| **Prioridade** | Baixa |
| **Participantes** | 12 Behavioral, 10 Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-03-23 |
| **Origem** | Conversa — Diego explorando formas de evoluir o sistema |
| **Concluido em** | — |

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

## Escopo (quando executado)

- [ ] Avaliar quais das 4 ideias tem melhor custo-beneficio para implementar
- [ ] Definir como cada uma mudaria o comportamento dos agentes na pratica
- [ ] Prototipar com Behavioral e Advocate: como ficaria o template de resposta?
- [ ] Testar em 2-3 decisoes reais antes de padronizar
- [ ] Avaliar se muda o CLAUDE.md ou apenas os perfis dos agentes

---

## Analise

> A preencher quando executado.

---

## Conclusao

> A preencher.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | — |
| **Estrategia** | — |
| **Conhecimento** | — |
| **Memoria** | — |
| **Nenhum** | — |

---

## Proximos Passos

- [ ] Executar quando prioridade subir — nao urgente, alto potencial de longo prazo
