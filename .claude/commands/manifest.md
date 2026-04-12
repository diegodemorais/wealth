# Dashboard Manifest — spec.json executivo

Leia `dashboard/spec.json` e apresente o manifesto de forma executiva.

## Formato de saída

---

## Dashboard Manifest — v{version} · {generated}

### Resumo

| Métrica | Valor |
|---------|-------|
| Total de blocos | N |
| Abas | 4 (Now / Portfolio / Performance / FIRE) |
| Blocos com privacy | N |
| Tipos distintos | lista |

---

### Now — "{job}"
*N blocos*

| ID | Label | Tipo | Privacy | Purpose (resumido) |
|----|-------|------|---------|-------------------|
{todos os blocos da aba now}

---

### Portfolio — "{job}"
*N blocos*

| ID | Label | Tipo | Privacy | Purpose (resumido) |
|----|-------|------|---------|-------------------|
{todos os blocos da aba portfolio}

---

### Performance — "{job}"
*N blocos*

| ID | Label | Tipo | Privacy | Purpose (resumido) |
|----|-------|------|---------|-------------------|
{todos os blocos da aba performance}

---

### FIRE — "{job}"
*N blocos*

| ID | Label | Tipo | Privacy | Purpose (resumido) |
|----|-------|------|---------|-------------------|
{todos os blocos da aba fire}

---

## Regras de formatação

- Purpose resumido: max 8 palavras (cortar o "Mostra X para responder Y" para só o essencial)
- Privacy: 🔒 se true, — se false
- Tipo: exibir como está (kpi, chart-line, table, etc.)
- ID: exibir em backticks
- Ordenar os blocos exatamente como aparecem no spec.json (não reordenar)
- Não omitir nenhum bloco
- Após as tabelas, nenhum texto adicional

$ARGUMENTS
