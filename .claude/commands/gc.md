# GC — Garbage Collector do Projeto

Voce e o Head conduzindo a manutencao periodica do projeto. Rode este processo uma vez por mes ou quando o projeto estiver visivelmente pesado.

## O que o GC faz (3 operacoes)

### Operacao 1 — Archive de Issues

Issues Done ou Deprecated no README.md que ainda estao no diretorio ativo devem ser movidas para `agentes/issues/archive/`.

**Como fazer:**
1. Ler `agentes/issues/README.md`
2. Identificar issues nas secoes "Done" e "Deprecated" que tem arquivo em `agentes/issues/` (fora do archive)
3. Mover cada uma: `mv agentes/issues/{ID}.md agentes/issues/archive/`
4. O README.md ja tem o resumo de cada issue Done — e o suficiente para referencia rapida

**Nao mover:** issues em Backlog, Doing, Refinamento, `README.md`, `_TEMPLATE.md`

---

### Operacao 2 — Archive de Retros Antigas

Retros com mais de 60 dias devem ser condensadas e movidas para `agentes/retros/archive/`.

**Como fazer:**
1. Listar arquivos em `agentes/retros/` (data no nome do arquivo)
2. Para cada retro com mais de 60 dias:
   a. Criar summary em `agentes/retros/archive/YYYY-MM-DD-summary.md` com:
      - Headline
      - Aprendizados registrados (tabela)
      - Metricas por agente (tabela)
      - Link para arquivo original no archive
   b. Mover o arquivo original: `mv agentes/retros/YYYY-MM-DD.md agentes/retros/archive/`
3. Retros light (`*-light.md`) com mais de 30 dias: mover diretamente para archive sem criar summary

---

### Operacao 3 — Limpeza de Memorias

Nas memorias dos agentes (`agentes/memoria/*.md`), entradas marcadas com `~~tachado~~` ja foram superadas. Consolidar:

**Como fazer:**
1. Para cada arquivo de memoria, identificar entradas com `~~tachado~~` em tabelas de "Decisoes Confirmadas"
2. Se a decisao superada ja esta refletida em carteira.md ou numa decisao posterior na mesma memoria: remover a linha tachada
3. Se e historico util (explica por que chegamos onde chegamos): mover para secao `## Historico Superado` no final do arquivo
4. **Nao remover** entradas tachadas que ainda tem contexto util ("superado porque X revelou Y")

---

## Relatorio ao Diego

Apos as 3 operacoes, apresentar:

```
## GC — {data}

### Operacao 1 — Issues arquivadas
- {N} issues movidas para archive
- Issues ativas restantes: {lista}

### Operacao 2 — Retros arquivadas
- {N} retros condensadas/movidas
- Retros ativas restantes: {lista}

### Operacao 3 — Memorias limpas
- {N} entradas tachadas removidas ou movidas para Historico Superado
- Agentes atualizados: {lista}

### Impacto estimado
- Antes: ~{N} linhas no diretorio ativo
- Depois: ~{N} linhas no diretorio ativo
- Reducao: {%}
```

Commitar com mensagem: `GC {data}: {N} issues arquivadas, {N} retros condensadas, memorias limpas`

---

## Frequencia recomendada

- **Mensal**: rodar como parte da revisao mensal
- **Sob demanda**: quando projeto estiver visivelmente pesado (bootstrap lento, muitos arquivos no diretorio ativo)
- **Threshold**: se `agentes/issues/` tiver mais de 15 arquivos ativos OU `agentes/retros/` tiver mais de 6 retros ativas

## O que NAO fazer

- Nao deletar arquivos — sempre mover para archive (historico tem valor)
- Nao arquivar issues em Backlog ou Doing (mesmo que antigas)
- Nao alterar README.md das issues — ele e o indice e deve refletir o board atual
- Nao condensar retros com menos de 60 dias
