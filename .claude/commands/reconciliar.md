# Reconciliar — Verificação de Posições

Compara posições em `carteira.md` vs outras fontes. Identifica divergências.

## Fontes

1. **carteira.md** — source of truth (sempre presente)
2. **ibkr_sync.py** — sincroniza posições IBKR via Flex Query (preferencial)
3. **`dados/ibkr_positions.csv`** — fallback se sync falhar
4. **Input do Diego** — se `$ARGUMENTS` contiver dados ("SWRD 1500 shares")

## Execução

1. Extrair posições de `agentes/contexto/carteira.md`
2. Tentar sync IBKR:
```bash
python3 scripts/ibkr_sync.py --cambio $(python3 -c "from bcb import currency; import datetime; d=datetime.date.today(); print(f'{currency.get(\"USD\", start=d-datetime.timedelta(days=5), end=d).iloc[-1]:.4f}')") 2>/dev/null || echo "ibkr_sync falhou — usar carteira.md"
```
3. Se Diego forneceu dados no argumento, comparar
4. Se tudo falhar: alertar e pedir dados manualmente

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
