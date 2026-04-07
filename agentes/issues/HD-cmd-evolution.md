# HD-cmd-evolution: Evolução dos commands impactados pelas 19 issues

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-cmd-evolution |
| **Dono** | Head |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | Head (lead), FIRE, Bookkeeper |
| **Co-sponsor** | — |
| **Dependencias** | FR-withdrawal-engine ✅, FI-portfolio-optimization ✅, HD-ibkr-import ✅ |
| **Criado em** | 2026-04-07 |
| **Origem** | skill-creator — 3 commands cresceram em complexidade após 19 issues, mas não foram refatorados |

---

## Motivo / Gatilho

Após 19 issues executadas em 2026-04-07, 3 commands ficaram desatualizados ou com complexidade acima do que foi projetado:

1. **`/fire-status`** — não integra o cenário de factor drought automaticamente. P(FIRE) pode cair 6.7pp sem alerta contextual.
2. **`/reconciliar`** — integração ibkr_sync ficou ad-hoc (linha de bash inline). Fluxo precisa de fallback estruturado e output claro.
3. **`/relatorio-mensal`** — cresceu de 3 para 6 fontes de dados sem refactor do template. Seções desalinhadas com o que temos hoje.

---

## Escopo

- [x] **1. /fire-status**: Integrar contexto drought automaticamente + threshold de alerta
- [x] **2. /reconciliar**: Refatorar fluxo ibkr_sync com fallback limpo e output estruturado
- [x] **3. /relatorio-mensal**: Refactor seções + integrar fx_utils e ibkr_sync no fluxo de dados

---

## Análise e Resultado

### /fire-status

**Problema:** flag `--retorno-equity` existe no script mas não é usada pelo command. Se P(FIRE) base cair para 83-88%, o time não tem contexto de "qual cenário explica isso".

**Melhoria implementada:**
- Threshold inteligente: se P(FIRE base) < 88%, rodar automaticamente o cenário drought
- Output: tabela P(FIRE) com coluna adicional "Drought −6.7pp" para contexto
- Regra: não reportar drought se P(FIRE) base ≥ 88% (evita ruído)

### /reconciliar

**Problema:** a integração com ibkr_sync era um bash inline de 3 linhas que dependia de `python-bcb` estar no PATH — frágil. Sem fallback estruturado. Output não especificava o que fazer com divergências.

**Melhoria implementada:**
- Fluxo em 3 camadas: ibkr_sync → CSV manual → input Diego
- Fallback explícito com mensagem de erro clara
- Output: tabela divergências + ações sugeridas por tipo

### /relatorio-mensal

**Problema:** seção "Performance" não especificava de onde buscar os dados (script? planilha? memória?). Seção "Macro" duplicava o que `/macro-bcb` já faz. Com 6 fontes de dados, o command cresceu mas o template ficou desalinhado.

**Melhoria implementada:**
- Fluxo de dados refatorado: fontes explícitas por seção
- Seção "Macro" delega para `/macro-bcb` (sem duplicação)
- Seção "FX" adicionada (fx_utils.py — nova com as 19 issues)
- Template de saída mais explícito com placeholders

---

## Conclusao

3 commands refatorados e aprovados (2026-04-07). `/fire-status`: drought condicional por threshold (< 88% → roda automaticamente). `/reconciliar`: 3 camadas estruturadas ibkr_sync → CSV → input manual, output padronizado com causa e ação. `/relatorio-mensal`: tabela de fontes explícita, seção FX nova (fx_utils.py), Macro delega para `/macro-bcb`, anti-retrabalho MC < 7 dias.
