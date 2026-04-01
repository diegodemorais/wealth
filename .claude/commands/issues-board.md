# Board — Issues Carteira Diego

Leia `agentes/issues/README.md`. Para cada issue em Doing, Refinamento E Backlog, leia tambem o arquivo individual `agentes/issues/{ID}.md` para obter data de criacao e dependencias. Se o arquivo nao existir, mostrar "—" nos campos correspondentes.

Calcule a idade de cada issue em dias (data de hoje menos Criado em). Se nao tiver data, mostre "—".

Apresente o board exatamente neste formato:

---

## Board — {data de hoje}

### 🔵 Em Andamento

| ID | Título | Dono | Dias | Status | Bloqueio | Deps |
|----|--------|------|------|--------|----------|------|
| {ID} | {Titulo} | {Dono} | {N} | {status curto} | {bloqueio ou —} | {IDs das deps ou —} |

### 🔷 Em Refinamento

| ID | Título | Dono | Dias | Pendência |
|----|--------|------|------|-----------|
| {ID} | {Titulo} | {Dono} | {N} | {o que falta para entrar em Doing} |

### 📋 Backlog

| ID | Título | Dono | Prioridade | Dias | Deps |
|----|--------|------|------------|------|------|
{Ordenar por prioridade. Emoji: 🔴 Alta, 🟡 Média, 🟢 Baixa. Separar grupos com linha vazia. Deps: listar IDs separados por virgula, ou — se nenhuma.}

### ✅ Concluídas Recentes (últimas 5)

| Data | ID | Título | Resultado |
|------|----|--------|-----------|
{5 mais recentes, resultado em max 8 palavras}

---

Regras:
- Dono abreviado: Head, Factor, FIRE, RF, Tax, Risco, Advocate, Bookkeeper, Patrimonial, FX
- Titulo: truncar com "..." se necessario, manter sentido
- Dias: numero inteiro, so o numero
- Status (Doing): 3-5 palavras ativas
- Deps: so os IDs curtos (ex: HD-006, FR-003), sem titulo. Se muitas, mostrar as 2 mais criticas
- Resultado (Done): max 8 palavras
- Se secao Refinamento estiver vazia, omitir a secao
- Nao adicione texto fora das tabelas — apenas tabelas e cabecalhos de secao
