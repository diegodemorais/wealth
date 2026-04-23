| Campo | Valor |
|-------|-------|
| ID | TX-us-listed-decision |
| Título | US-listed: vender agora (IR ~R$57k) vs segurar (estate tax ~$177k) |
| Dono | Tax |
| Status | 🟡 Backlog |
| Prioridade | 🟡 Média |
| Criada | 2026-04-22 |
| Participantes | Tax (lead), Head, Quant, Advocate |

## Motivo

Diego tem ~$177k em ETFs US-listed (AVUV, AVDV, AVES, DGS, USSC) que acumulam risco de estate tax americano (>$60k threshold). A decisão de manter ou migrar pra UCITS nunca foi quantificada formalmente.

## As duas opções

### Opção A — Vender agora, migrar pra UCITS
- Cristaliza IR de ~R$57k (15% sobre ganho nominal BRL dos lotes)
- Recompra equivalente em UCITS (AVGS, AVEM) — elimina estate tax
- Custo one-time, definitivo

### Opção B — Segurar até FIRE Day (~2040)
- Diferir IR (ganho continua crescendo, IR futuro > R$57k)
- Carregar risco estate tax por ~14 anos
- Mitigar com seguro de vida temporário (~$177k, 11 anos)
- Custo recorrente (prêmio do seguro × anos)

## Escopo

- [ ] Quant: calcular IR exato de vender cada US-listed hoje (dados do ibkr_lotes.py)
- [ ] Tax: calcular IR projetado se vender em 2040 (com valorização estimada)
- [ ] Tax: estimar custo de seguro de vida temporário $177k por 11 anos
- [ ] Quant: comparar VP das duas opções (taxa de desconto = retorno equity 4.85%)
- [ ] Advocate: stress-test — e se morrer amanhã sem seguro?
- [ ] Head: veredicto e decisão

## Dados disponíveis

Do `dados/tlh_lotes.json` (22/04/2026):

| ETF | Custo BRL | Valor BRL | IR 15% | Domicílio |
|-----|-----------|-----------|--------|-----------|
| AVUV | R$237k | R$321k | R$12.5k | US-listed |
| AVDV | R$303k | R$493k | R$28.5k | UCITS (!) |
| AVES | R$232k | R$296k | R$9.6k | US-listed |
| DGS | R$50k | R$60k | R$1.4k | US-listed |
| USSC | R$129k | R$162k | R$5.0k | US-listed |

Nota: AVDV é UCITS (Ireland) — não tem estate tax risk. Só AVUV+AVES+DGS+USSC são US-listed.

IR de vender só US-listed: ~R$28.5k (AVUV R$12.5k + AVES R$9.6k + DGS R$1.4k + USSC R$5.0k)
Estate tax em risco: $177k custo → valor de mercado atual ~$169k → estate tax potencial ~$43k (40% sobre excedente de $60k)
