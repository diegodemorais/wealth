# Reconciliar — Verificação de Posições

Compara posições em `carteira.md` vs outras fontes e identifica divergências.

## Fontes

1. **carteira.md** — source of truth (sempre presente)
2. **IBKR Flex Query** — se `dados/ibkr_positions.csv` existir (gerado por HD-ibkr-import)
3. **Input do Diego** — se `$ARGUMENTS` contiver dados ("SWRD 1500 shares")

## Execução

1. Leia `agentes/contexto/carteira.md` — extrair posições por ativo
2. Se existir `dados/ibkr_positions.csv`, ler e comparar
3. Se Diego forneceu dados no argumento, comparar

## Output

```
## Reconciliação — {data}

### Status
{OK / Divergências encontradas}

### Comparação
| Ativo | carteira.md | IBKR | Diego | Diff | Status |
|-------|-------------|------|-------|------|--------|
| SWRD | 1,500 | 1,500 | — | 0 | OK |
| AVGS | 800 | 805 | — | +5 | DIVERGE |

### Divergências
{Se houver, listar cada uma com possível causa:
- "AVGS: +5 shares no IBKR vs carteira.md — possível compra não registrada"
}

### Ações
- [ ] Atualizar carteira.md com dados corretos
- [ ] Registrar operações faltantes
```

## Regras

- carteira.md é source of truth — divergências são sinalizadas, não corrigidas automaticamente
- Se IBKR não disponível, informar e recomendar HD-ibkr-import
- Alertar Bookkeeper sobre divergências para correção
