# GC — Garbage Collector do Projeto

Voce e o Head conduzindo a manutencao periodica do projeto. Rode este processo uma vez por mes ou quando o projeto estiver visivelmente pesado.

## O que o GC faz (4 operacoes)

### Operacao 1 — Archive de Issues

Issues Done ou Deprecated no README.md que ainda estao no diretorio ativo devem ser movidas para `agentes/issues/archive/`.

**Como fazer:**
1. Ler `agentes/issues/README.md`
2. Identificar issues nas secoes "Done" e "Deprecated" que tem arquivo em `agentes/issues/` (fora do archive)
3. Criar `agentes/issues/archive/` se nao existir: `mkdir -p agentes/issues/archive/`
4. Mover cada uma: `mv agentes/issues/{ID}.md agentes/issues/archive/`
5. O README.md ja tem o resumo de cada issue Done — e o suficiente para referencia rapida

**Nao mover:** issues em Backlog, Doing, Refinamento, `README.md`, `_TEMPLATE.md`

**Verificar orphans:** listar arquivos `agentes/issues/*.md` (excluindo README.md e _TEMPLATE.md). Se algum nao estiver referenciado no README.md, alertar no relatorio — nao mover autonomamente.

---

### Operacao 2 — Archive de Retros Antigas

Retros com mais de 60 dias devem ser condensadas e movidas para `agentes/retros/archive/`.

**Como fazer:**
1. Listar arquivos em `agentes/retros/` (data no nome do arquivo)
2. Criar `agentes/retros/archive/` se nao existir: `mkdir -p agentes/retros/archive/`
3. Para cada retro com mais de 60 dias:
   a. Criar summary em `agentes/retros/archive/YYYY-MM-DD-summary.md` com:
      - Headline
      - Aprendizados registrados (tabela)
      - Metricas por agente (tabela)
      - Link para arquivo original no archive
   b. Mover o arquivo original: `mv agentes/retros/YYYY-MM-DD.md agentes/retros/archive/`
4. Retros light (`*-light.md`) com mais de 30 dias: mover diretamente para archive sem criar summary

---

### Operacao 3 — Limpeza de Memorias

Nas memorias dos agentes (`agentes/memoria/*.md`), entradas marcadas com `~~tachado~~` ja foram superadas. Consolidar:

**Como fazer:**
1. Para cada arquivo de memoria, identificar entradas com `~~tachado~~` em tabelas de "Decisoes Confirmadas"
2. Se a decisao superada ja esta refletida em carteira.md ou numa decisao posterior na mesma memoria: remover a linha tachada
3. Se e historico util (explica por que chegamos onde chegamos): mover para secao `## Historico Superado` no final do arquivo
4. **Nao remover** entradas tachadas que ainda tem contexto util ("superado porque X revelou Y")

---

### Operacao 4 — Verificar MEMORY.md

Verificar se o indice `~/.claude/projects/*/memory/MEMORY.md` esta consistente:
1. Contar linhas — se > 180, alertar que esta proximo do limite de 200
2. Verificar se ha entradas no indice sem arquivo correspondente (links quebrados)
3. Verificar se ha arquivos na pasta de memoria sem entrada no indice (arquivos orphaos)
4. Reportar inconsistencias, mas nao corrigir autonomamente (risco de perda de contexto)

---

## Relatorio ao Diego

Apos as 4 operacoes, apresentar:

```
## GC — {data}

### Operacao 1 — Issues arquivadas
- {N} issues movidas para archive
- Issues ativas restantes: {lista}
- Orphans detectados: {lista ou "nenhum"}

### Operacao 2 — Retros arquivadas
- {N} retros condensadas/movidas
- Retros ativas restantes: {lista}

### Operacao 3 — Memorias limpas
- {N} entradas tachadas removidas ou movidas para Historico Superado
- Agentes atualizados: {lista}

### Operacao 4 — MEMORY.md
- Linhas atuais: {N}/200
- Links quebrados: {lista ou "nenhum"}
- Arquivos orphaos: {lista ou "nenhum"}

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
- Nao arquivar issues em Backlog, Doing ou Refinamento (mesmo que antigas)
- Nao alterar README.md das issues — ele e o indice e deve refletir o board atual
- Nao condensar retros com menos de 60 dias
- Nao mover `README.md` ou `_TEMPLATE.md` do diretorio de issues
