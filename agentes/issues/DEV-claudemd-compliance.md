| Campo | Valor |
|-------|-------|
| ID | DEV-claudemd-compliance |
| Título | Conformidade CLAUDE.md — 6 violações no dashboard |
| Dono | Dev |
| Status | 🔴 Doing |
| Prioridade | 🟡 Média |
| Criada | 2026-04-22 |

## Motivo

Auditoria de conformidade do dashboard contra as diretrizes do CLAUDE.md encontrou 6 violações. Nenhuma é funcional (dashboard opera normalmente), mas representam dívida técnica que cresce se ignorada.

## Violações

| # | Regra | Escala | Ação |
|---|-------|--------|------|
| 1 | Arquivos >500 linhas | 9 arquivos | Identificar e planejar split (não big-bang) |
| 2 | `any` em código | 294 ocorrências | Migrar gradualmente; proibir em código novo |
| 3 | Dead code restante | ~10 componentes órfãos | Verificar e deletar |
| 4 | Hex inline em .tsx | 216 ocorrências | Migrar para EC.* / var(--*) |
| 5 | gridTemplateColumns inline | 10 violações | Migrar para Tailwind grid-cols-* |
| 6 | Privacy faltando em charts | 5 charts | Adicionar useEChartsPrivacy() |

## Escopo desta execução

Resolver #3 (dead code), #5 (gridTemplateColumns), #6 (privacy). São cirúrgicos e de alto impacto.
#1, #2, #4 são migrações graduais — registrar como backlog.
