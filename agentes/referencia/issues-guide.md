# Guia de Issues

## IDs de Issues
Formato: `{SIGLA}-{slug-descritivo}` — sigla do agente responsavel principal + slug curto legível sem contexto.
HD (Head), FI (Factor), RF (Renda Fixa), FR (FIRE), TX (Tributacao), RK (Risco), FX (Cambio), MA (Macro), PT (Patrimonial), DA (Devil's Advocate), OP (Oportunidades), XX (Cross-domain)

Exemplos: `FR-spending-smile`, `RK-gold-hedge`, `MA-bond-correlation`
Regra: 1-3 palavras em kebab-case, sem número. O slug deve dizer o assunto sem precisar ler o título.

## Status de Issues
`Refinamento` -> `Backlog` -> `Doing` -> `Done`

## Fluxo Conversa -> Issue
```
Conversa -> Head identifica tema que merece profundidade
         -> Sugere Issue ao Diego (com ID, titulo, responsavel)
         -> Diego aprova -> Cria arquivo em agentes/issues/{ID}.md (usar _TEMPLATE.md)
         -> Atualiza board em agentes/issues/README.md
         -> Trabalha no Issue (pode ser agora ou depois)
         -> Conclusao -> Preenche Resultado -> Registra na memoria se relevante
         -> Move para Done no board
```
