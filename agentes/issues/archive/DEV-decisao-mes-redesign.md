# DEV-decisao-mes-redesign — Redesign do Bloco "Decisão do Mês"

| Campo | Valor |
|-------|-------|
| ID | DEV-decisao-mes-redesign |
| Dono | Dev + CIO + UX |
| Status | Done |
| Prioridade | 🟡 Média |
| Criado | 2026-04-25 |

## Contexto

O bloco "Decisão do Mês" na aba Dashboard (home) é composto por 3 componentes separados, empilhados verticalmente, com linguagens visuais diferentes e informação redundante:

1. **AporteDecisionPanel** (215 linhas) — Banner ETF prioritário + tabela de drift + semáforos RF/Crypto
2. **AporteDoMes** (136 linhas) — Último aporte, meta mensal, acumulado mês/ano, savings rate
3. **MacroUnificado** (206 linhas) — Taxas BR/EUA (6 tiles), Ativos de Referência (2 tiles), Exposição Brasil + collapsible FX

**Problemas identificados:**
- Três cards distintos com linguagens visuais diferentes (bg-slate, bg-card, bg-card2)
- Hierarquia de informação confusa — não fica claro o que é "decisão" vs "contexto"
- MacroUnificado mistura 3 sub-seções sem relação direta com a decisão de aporte
- AporteDoMes e AporteDecisionPanel deveriam ser integrados (o aporte é a decisão)
- Tabela de ETFs com Score é pouco intuitiva para uso rápido
- Tiles de taxas (Selic, IPCA, Fed Funds, Spread, BRL, CDS) são dados de contexto, não decisão

## Objetivo

Redesenhar o bloco como uma unidade visual coesa com hierarquia clara:
1. **Decisão** (o que fazer agora) — imediato, acionável
2. **Contexto** (por que) — suporte compacto à decisão
3. Remover redundâncias e unificar linguagem visual

## Escopo

- **Redesenhar**: AporteDecisionPanel + AporteDoMes (fundir em 1 componente coeso)
- **Compactar**: MacroUnificado — só o essencial para suporte à decisão, resto → collapsible
- **Preservar**: toda lógica de dados, semáforos, DCA triggers, scoring de ETFs
- **Zero dados novos**: só reorganização e UX

## Spec de Design (a ser definida pelos agentes)

CIO, Bookkeeper e UX devem definir spec antes da implementação.

## Entregáveis

- [ ] Spec visual aprovada pelo CIO
- [ ] Dev implementa novos componentes (ou refatora existentes)
- [ ] Build passa (`npx next build`)
- [ ] Quant/QA validam
- [ ] Commit + push na main

## Resultado

✅ Done — `DecisaoDoMes.tsx` (340 linhas) substitui 3 componentes (557 linhas total). Hierarquia clara: Decisão → Gatilhos → Contexto Macro → Strip execução fora do card. Coluna Score removida. Ativos de Referência redundantes removidos. Privacy, Quant e build validados. 495 testes passando. 3 bugs corrigidos no ciclo (fmtPrivacy negativo, dataWiring crash, operator precedence).
