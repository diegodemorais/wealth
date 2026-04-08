# {SIGLA}-{NUM}-{Slug_descritivo}: {Titulo completo}

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | {SIGLA}-{NUM}-{Slug_descritivo} |
| **Dono** | {Agente responsavel principal} |
| **Status** | Refinamento / Backlog / Doing / Done |
| **Prioridade** | Alta / Media / Baixa |
| **Participantes** | {Outros agentes envolvidos} |
| **Co-sponsor** | {Agente que endossou a abertura — obrigatório} |
| **Dependencias** | {IDs de issues que precisam ser concluidos antes, ou "—"} |
| **Criado em** | {YYYY-MM-DD} |
| **Origem** | Conversa / Revisao Mensal / Gatilho / Proativo |
| **Concluido em** | — |

---

## Motivo / Gatilho

> Por que este issue existe? O que motivou a abertura?
> Ex: "Surgiu em conversa sobre X", "Gatilho Y foi atingido", "Revisao mensal identificou Z"

---

## Descricao

> O que precisa ser analisado, decidido ou resolvido?

---

## Escopo

> Checklist objetivo do que precisa ser feito:

- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

> **Se esta issue toca `dados/holdings.md` ou qualquer arquivo em `dados/`:**
> - [ ] Verificar qtdes via `gws sheets read` (Carteira Viva, aba Utils) OU `ibkr_analysis.py` antes de qualquer escrita
> - [ ] Comparar campo a campo com a fonte primária — nunca usar valor de contexto/memória de sessão
> - [ ] Documentar a fonte no cabeçalho do arquivo atualizado

---

## Raciocinio

> Obrigatorio para issues de prioridade **Alta**. Opcional para Media/Baixa.
> Preencher ANTES da analise — captura o pensamento no momento da decisao, nao depois.

**Alternativas rejeitadas:** *(por que nao X, por que nao Y)*
> ...

**Argumento central:** *(a premissa que justifica a decisao — em 1-2 frases)*
> ...

**Incerteza reconhecida:** *(o que poderia estar errado)*
> ...

**Falsificacao:** *(qual evidencia especifica me faria reverter essa decisao?)*
> ...

---

## Analise

> Espaco para o trabalho em si: dados, calculos, comparacoes, evidencias.
> Preencher conforme o issue avanca.

---

## Conclusao

> Preenchido ao finalizar. Responde: o que decidimos?

### Veredicto Ponderado

| Agente | Peso | Posição | Contribuição |
|--------|------|---------|-------------|
| Head | 1x | — | — |
| {Especialista domínio} | 3x | — | — |
| {Adjacente} | 2x | — | — |
| Advocate | 1x | — | — |
| **Score ponderado** | | **{posição vencedora}** | **{X.X pts favor}** |

*Pesos: especialista do domínio = 3x, adjacente direto = 2x, Head/Generalistas = 1x, periférico = 0.5x*

---

## Resultado

> O que este issue gerou de concreto?

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Mudou alguma alocacao? Qual? |
| **Estrategia** | Mudou alguma estrategia ou regra? |
| **Conhecimento** | Aprendemos algo novo que vale registrar? |
| **Memoria** | Registrado na memoria de qual agente? |
| **Nenhum** | Se nao acrescentou nada: por que? Deveria ter sido issue? |

---

## Proximos Passos

> Acoes que surgiram deste issue (podem gerar novos issues)

- [ ] ...
