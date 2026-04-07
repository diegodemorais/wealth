# Reconciliar — Verificação de Posições

Compara posições em `carteira.md` vs fontes externas. Identifica divergências.

## Fontes (em ordem de prioridade)

1. **carteira.md** — source of truth (sempre presente)
2. **ibkr_sync.py** — fonte primária para posições IBKR
3. **`dados/ibkr_positions.csv`** — fallback se sync falhar
4. **Input do Diego** — se `$ARGUMENTS` contiver dados ("SWRD 1500 shares")

## Execução

### Passo 1 — Extrair posições base

Leia `agentes/contexto/carteira.md` — seção "Posições Atuais". Extrair qtd e preço de cada ativo.

### Passo 2 — Buscar posições IBKR (camadas de fallback)

**Camada A: ibkr_sync**
```bash
PTAX=$(python3 -c "
from bcb import currency
import datetime
d = datetime.date.today()
ptax = currency.get('USD', start=d - datetime.timedelta(days=7), end=d)
print(f'{ptax.iloc[-1]:.4f}')
" 2>/dev/null)
[ -n "$PTAX" ] && python3 scripts/ibkr_sync.py --cambio $PTAX 2>&1 || echo "IBKR_SYNC_FAILED"
```

Se ibkr_sync retornar dados → usar como fonte IBKR.

**Camada B: CSV manual**
Se ibkr_sync falhar, verificar se `dados/ibkr_positions.csv` existe:
```bash
[ -f dados/ibkr_positions.csv ] && cat dados/ibkr_positions.csv || echo "CSV_NOT_FOUND"
```

**Camada C: Input Diego**
Se `$ARGUMENTS` contiver dados (ex: "SWRD 1500 AVGS 700"), usar como posições reportadas.

**Sem fonte IBKR:** informar que reconciliação parcial é possível apenas com input manual. Solicitar via argumento.

### Passo 3 — Comparar e reportar

## Output

**Status geral:** `OK` (sem divergências) ou `X divergências encontradas`

**Tabela comparativa:**

| Ativo | carteira.md | Fonte IBKR | Diff | Status |
|-------|-------------|------------|------|--------|
| SWRD | 1.500 | 1.498 | −2 | ⚠️ divergência |
| AVGS | 700 | 700 | 0 | ✓ ok |
| AVEM | 400 | 400 | 0 | ✓ ok |

**Por divergência encontrada:**
- Causa provável: "compra não registrada?", "split/dividendo não capturado?"
- Ação: "registrar operação em operacoes.md" / "investigar extrato IBKR"

**Fonte usada:** informar qual camada (ibkr_sync / CSV / input Diego / sem fonte)

## Regras

- carteira.md é source of truth — divergências sinalizadas, não corrigidas automaticamente
- Alertar Bookkeeper sobre divergências para correção
- Diff ≤ 1 share: pode ser arredondamento fracionário — verificar antes de alertar
- Se nenhuma fonte IBKR disponível: reconciliar apenas itens fornecidos via argumento e listar pendências
