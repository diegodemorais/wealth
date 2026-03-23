# HD-008-Reconciliacao_arquivos_deduplicacao: Reconciliacao de arquivos e deduplicacao agent defs

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-008-Reconciliacao_arquivos_deduplicacao |
| **Dono** | 00 Head |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | — (execucao interna, sem agentes especialistas) |
| **Dependencias** | HD-006 (fonte de verdade para dados corretos) |
| **Criado em** | 2026-03-22 |
| **Origem** | Conversa — Diego identificou drift entre documentos apos HD-006 final |
| **Concluido em** | 2026-03-22 |

---

## Motivo / Gatilho

> Apos HD-006 final (IPCA+ 15%, equity 79%, sem Selic, retorno 5.89%), multiplos documentos ficaram desatualizados. Risco: agentes lendo dados errados e tomando decisoes com premissas antigas. Adicionalmente, agent definitions estavam inchados com conteudo duplicado dos perfis (autonomia critica, auto-diagnostico, regras absolutas, etc.), aumentando tamanho de contexto sem beneficio.

---

## Descricao

> Reconciliar TODOS os documentos com carteira.md (fonte de verdade HD-006 final) e enxugar agent definitions para bootstrap-only.

---

## Escopo

- [x] **P0 — Corrigir dados conflitantes**
  - [x] ips.md: IPCA+ 15%, equity 79%, retorno 5.89%, sem Selic, IPCA+ curto 3% aos 50, Renda+ <=3%
  - [x] evolucao.md: tabela de alvos por idade reconciliada
  - [x] risk-framework.md: equity 79%, IPCA+ 15%, Renda+ <=3%, concentracao broker ~79%
  - [x] execucoes-pendentes.md: IPCA+ alvo ~R$523k (15%), nao R$244k (7%)
  - [x] memoria/01-head.md: Renda+ DCA parado (3,2% ~ target <=3%)
  - [x] Perfis desatualizados: 04-fire (Selic, glidepath), 06-risco (Renda+ 5%->3%, equity 90%->79%), 03-renda-fixa (7%->15%)

- [x] **P1 — Enxugar agent definitions**
  - [x] 13 agent defs reescritos para bootstrap-only (~30-50 linhas cada)
  - [x] Removidos de todos: Autonomia Critica, Auto-Diagnostico, Regras Absolutas, Mapa de Relacionamento, Perfil Comportamental, Gatilhos
  - [x] Mantidos: frontmatter + bootstrap + WebSearch/dados + idioma + Foco Atual (se unico)
  - [x] behavioral e bookkeeper nao mexidos (ja estavam enxutos)
  - [x] Regra explicita: "perfil = source of truth para conteudo, agent def = bootstrap only"

- [x] **P2 — Extrair blocos comuns**
  - [x] Criado `agentes/referencia/autonomia-critica.md`
  - [x] 8 perfis atualizados com referencia ao arquivo

- [x] **P3 — Mover protocolos longos**
  - [x] "Debate Estruturado Bull vs Bear" movido para `agentes/referencia/debate-estruturado.md`
  - [x] Perfil do Head atualizado com referencia
  - [x] Checklist Pre-Veredicto MANTIDO no perfil do Head (visivel, nao movido)

---

## Analise

### P0 — Conflitos encontrados e corrigidos

| Arquivo | Dado antigo | Dado correto (HD-006 final) |
|---------|-----------|---------------------------|
| ips.md | Selic 5% aos 50, IPCA+ 7%, equity 90% | Sem Selic, IPCA+ longo 15%, IPCA+ curto 3% aos 50, equity 79% |
| ips.md | Retorno 5.09%, pat projetado R$10.3M | Retorno 5.89%, pat projetado R$10.56M (FR-003) |
| ips.md | Renda+ <=5%, R$244k IPCA+ | Renda+ <=3%, R$523k IPCA+ |
| evolucao.md | Selic 5%, IPCA+ 7%, equity nao declarado | Sem Selic, IPCA+ 15%, equity 79% |
| risk-framework.md | Equity 90%, IPCA+ 7%, broker ~89% | Equity 79%, IPCA+ 15%, broker ~79% |
| execucoes-pendentes.md | R$244k (7%) | R$523k (15%) |
| memoria/01-head.md | Renda+ DCA ate 5% | Renda+ DCA parado (3,2% ~ target) |
| perfil 04-fire | Selic 5% aos 50, equity 82-90% | IPCA+ curto 3% aos 50, equity 79% |
| perfil 06-risco | Renda+ teto 5%, equity 90% | Renda+ teto 3%, equity 79% |
| perfil 03-renda-fixa | IPCA+ 7% | IPCA+ 15% |

### P1 — Agent defs enxugados

Antes: agent defs de 80-190 linhas, com conteudo duplicado dos perfis.
Depois: agent defs de 30-50 linhas (bootstrap + busca + idioma + foco).
Reducao estimada: ~60-70% do tamanho total de agent defs.

### P2 — Bloco Autonomia Critica extraido

Bloco identico em 8 perfis. Agora 1 arquivo de referencia + 8 referencias de 1 linha cada.

### P3 — Debate Estruturado movido

Protocolo de ~35 linhas movido do perfil do Head para referencia. Head mantem referencia de 1 linha. Checklist Pre-Veredicto permanece no perfil (precisa estar visivel).

---

## Conclusao

> Reconciliacao completa executada. Todos os documentos agora refletem HD-006 final. Agent definitions reduzidos para bootstrap-only com regra explicita: "perfil = source of truth, agent def = bootstrap only". Dois blocos extraidos para referencia (autonomia-critica, debate-estruturado).

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Nenhuma mudanca de alocacao — apenas reconciliacao de documentos |
| **Estrategia** | Regra "perfil = source of truth, agent def = bootstrap only" estabelecida |
| **Conhecimento** | 10+ conflitos de dados identificados e corrigidos entre documentos |
| **Memoria** | Nao aplicavel (nao e decisao de investimento) |
| **Nenhum** | — |

---

## Proximos Passos

- [ ] Regra C (Checklist Pre-Veredicto): reconciliacao trimestral entre documentos. Proxima: jun/2026
- [ ] Verificar se outros perfis/memorias tem dados pre-HD-006 (scan menos criticos)
