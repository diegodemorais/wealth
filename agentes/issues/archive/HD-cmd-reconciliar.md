# HD-cmd-reconciliar: Command /reconciliar — reconciliação de posições

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-cmd-reconciliar |
| **Dono** | Bookkeeper |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | Bookkeeper (lead), Head, Quant |
| **Co-sponsor** | Head |
| **Dependencias** | HD-ibkr-import |
| **Criado em** | 2026-04-07 |
| **Origem** | Agent review — Bookkeeper identificou gap: sem tool para comparar carteira.md vs IBKR vs planilha. |
| **Concluido em** | 2026-04-07 |

---

## Descricao

Criar `/reconciliar` que compara posições em carteira.md vs dados IBKR (quando disponível) vs planilha Google Sheets. Identifica divergências e alerta.

---

## Escopo

- [ ] Definir fontes: carteira.md (source of truth), IBKR Flex Query, planilha
- [ ] Criar command `.claude/commands/reconciliar.md`
- [ ] Formato de output: tabela de divergências (ativo, fonte A, fonte B, diff)
- [ ] Testar com dados reais

---

## Conclusao

Command `.claude/commands/reconciliar.md` criado. Compara posições em `carteira.md` vs IBKR Flex Query (`ibkr_sync.py`) vs input manual. Output: tabela de divergências com causa provável e ações. `carteira.md` é sempre source of truth — divergências sinalizadas, não corrigidas automaticamente.
