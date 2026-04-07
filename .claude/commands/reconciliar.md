# Reconciliar — Verificação de Posições

Compara posições em `carteira.md` vs outras fontes. Identifica divergências.

## Fontes

1. **carteira.md** — source of truth (sempre presente)
2. **IBKR Flex Query** — se `dados/ibkr_positions.csv` existir
3. **Input do Diego** — se `$ARGUMENTS` contiver dados ("SWRD 1500 shares")

## Execução

1. Extrair posições de `agentes/contexto/carteira.md`
2. Se `dados/ibkr_positions.csv` existir, ler e comparar
3. Se Diego forneceu dados no argumento, comparar

## Output

Incluir:
- **Status**: OK ou divergências encontradas
- **Tabela comparativa**: ativo × fonte × diff × status
- **Divergências**: cada uma com possível causa ("compra não registrada?")
- **Ações**: checklist de correções necessárias

## Regras

- carteira.md é source of truth — divergências sinalizadas, não corrigidas automaticamente
- Se IBKR não disponível, informar e recomendar configurar Flex Query (HD-ibkr-import)
- Alertar Bookkeeper sobre divergências para correção
