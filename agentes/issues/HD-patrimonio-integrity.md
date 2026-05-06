# HD-patrimonio-integrity — Verificação Automática de Integridade de Patrimônio

| Campo | Valor |
|-------|-------|
| **Status** | Doing |
| **Dono** | Head / Bookkeeper |
| **Prioridade** | 🟠 Média — prevenção de erro recorrente |
| **Aberta** | 2026-05-06 |

---

## Contexto

Patrimônio errado apresentado 3+ vezes. Causa raiz: Bookkeeper calculava `valor_anterior ± delta` em vez de derivar do pipeline. Em 06/05/2026: R$3.385M registrado vs R$3.705M real (−R$320k).

Regra L-25 criada: patrimônio sempre do pipeline. Esta issue implementa a verificação automática.

---

## Escopo

### Script: `scripts/patrimonio_check.py`

Verifica drift entre `carteira.md` e `data.json` sem rodar o pipeline completo:

1. Lê `react-app/public/data.json` → `patrimonio_holistico.financeiro_brl` + `_meta.generated`
2. Parseia `agentes/contexto/carteira.md` → valor "Patrimônio total"
3. Calcula `drift = |pipeline − carteira|`
4. Output estruturado (tabela):
   - Pipeline: R$X (gerado em YYYY-MM-DD, N dias atrás)
   - Carteira.md: R$X
   - Drift: R$X → OK / ⚠️ ALERTA
5. Se `data.json` > 7 dias antigo: warn "pipeline stale — rodar generate_data.py"
6. Se drift > R$100k: exit code 1 + mensagem clara com instrução de correção
7. Também aceita `--update` flag: se aprovado pelo usuário, atualiza carteira.md automaticamente

### Cron Semanal

CronCreate (durable) — toda segunda-feira às 9:07: roda `patrimonio_check.py`, reporta resultado.

---

## Critério de Done

- [ ] `scripts/patrimonio_check.py` implementado e testado
- [ ] `python3 scripts/patrimonio_check.py` funciona standalone
- [ ] Cron configurado e ativo
- [ ] Issue commitada e arquivada
