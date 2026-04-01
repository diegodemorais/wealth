# Hierarquia de Memória — Regras de Uso

> Fonte única de verdade para onde cada tipo de conteúdo deve ser persistido.
> Aprovado: 2026-04-01.

---

## Dois Sistemas de Memória

| Sistema | Localização | Escopo | Versionado? |
|---------|------------|--------|-------------|
| **Memórias de agente** | `agentes/memoria/XX-agente.md` | Decisões, gatilhos, calibrações, aprendizados de cada agente | Sim (git) |
| **Auto-memory** | `~/.claude/projects/.../memory/` | Preferências do usuário, meta-comportamentos, referências cross-session | Não (local) |

---

## Regra Principal: Qual usar?

```
Pergunta: O conteúdo é específico de um agente ou do portfolio de Diego?
  → SIM: usar agentes/memoria/XX-agente.md

Pergunta: O conteúdo é sobre como o Head/time deve se comportar?
  → SIM: usar agentes/memoria/XX-agente.md (perfil 00-head se for meta)

Pergunta: O conteúdo é sobre preferências de trabalho do Diego (comunicação, workflow)?
  → SIM: usar ~/.claude/memory/ (feedback_*.md)

Pergunta: O conteúdo é uma referência a sistema externo (Google Sheets, fórum)?
  → SIM: usar ~/.claude/memory/ (reference_*.md)
```

---

## O que vai onde

### `agentes/memoria/` (por agente)

| Tipo de conteúdo | Arquivo |
|-----------------|---------|
| Decisões aprovadas sobre a carteira | `01-head.md` (CIO memory) |
| Gatilhos ativos (HODL11, Renda+, IPCA+) | Agente responsável (06, 03, 08) |
| Aprendizados de retro sobre comportamento do agente | Agente em questão |
| Premissas aprovadas (retornos, haircuts, câmbio) | `01-head.md` ou agente de domínio |
| Histórico de erros do agente | Perfil do agente (`agentes/perfis/`) |
| Calibração de previsões | `agentes/metricas/previsoes.md` |
| Snapshot macro atual | `08-macro.md` |
| Estado da carteira | `agentes/contexto/carteira.md` |

### `~/.claude/memory/` (auto-memory cross-session)

| Tipo de conteúdo | Arquivo |
|-----------------|---------|
| Preferências de comunicação de Diego | `feedback_*.md` |
| Regras de workflow (aprovação, commits, debates) | `feedback_*.md` |
| Links para sistemas externos (planilha, fórum) | `reference_*.md` |
| Perfil do usuário Diego (idade, patrimônio, metas) | `user_diego.md` |
| Estado de projetos em andamento (cross-session) | `project_*.md` |
| Regras de câmbio por contexto | `reference_cambio_padrao.md` |

---

## Conflito entre sistemas

Se o mesmo conteúdo aparecer nos dois sistemas com valores diferentes:
1. **`agentes/memoria/` prevalece** para decisões de portfolio (está no git, versionado)
2. **`~/.claude/memory/` prevalece** para preferências de comportamento do Head
3. Ao detectar conflito: atualizar o sistema secundário para espelhar o primário. Não deixar divergência.

---

## Quem mantém

- **agentes/memoria/**: cada agente atualiza sua própria memória após aprovação de Diego
- **~/.claude/memory/**: Head atualiza automaticamente ao aprender nova preferência de Diego
- **Auditoria**: GC (`/gc`) verifica inconsistências entre os dois sistemas trimestralmente

---

## O que NÃO vai em nenhum sistema de memória

- Estado da sessão atual (usar Tasks)
- Planos de implementação de issues em andamento (usar o arquivo da issue)
- Código ou scripts (usar `scripts/` ou `analysis/`)
- Snapshots completos da carteira em momento específico (usar `agentes/contexto/evolucao.md`)
- Listas de tarefas da sessão (usar TaskCreate)
