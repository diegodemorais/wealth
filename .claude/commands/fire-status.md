# FIRE Status — P(FIRE) Rápido

Mostra status FIRE atual: P(FIRE), distância ao gatilho, projeção.

## Execução

1. Leia `agentes/contexto/carteira.md` para patrimônio atual
2. Rode o Monte Carlo rápido:

```bash
python3 scripts/fire_montecarlo.py --n-sim 3000
```

3. Rode também para FIRE 50 (aspiracional):

```bash
python3 scripts/fire_montecarlo.py --n-sim 3000 --anos 11
```

## Output

```
## FIRE Status — {data}

### P(FIRE)
| Cenário | FIRE 53 | FIRE 50 |
|---------|---------|---------|
| Base | X% | X% |
| Favorável | X% | X% |
| Stress | X% | X% |

### Distância ao Gatilho
- Patrimônio atual: R$ X
- Gatilho formal: R$ 13.4M + SWR ≤ 2.4%
- Gap: R$ X (Y aportes de R$25k)
- Projeção mediana: atinge em {ano} (age {idade})

### vs Último Check-in
- P(FIRE) anterior: X% → atual: X% (Δ +/-Xpp)
- Patrimônio anterior: R$ X → atual: R$ X (Δ +/-X%)

### Status
{emoji} {mensagem — "On track", "Atenção", "Revisar premissas"}
```

## Regras

- Comparar com último resultado registrado em `agentes/memoria/04-fire.md`
- Se P(FIRE base) ≥ 90%: on track
- Se 80-90%: atenção — verificar se é transitório
- Se <80%: revisar premissas com time FIRE
