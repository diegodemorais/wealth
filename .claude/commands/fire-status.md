# FIRE Status — P(FIRE) Rápido

Mostra status FIRE: P(FIRE), distância ao gatilho, projeção, comparação com último check-in.

## Execução

1. Leia `agentes/contexto/carteira.md` para patrimônio atual
2. Rode os Monte Carlo **em paralelo** via Bash:

```bash
python3 scripts/fire_montecarlo.py --n-sim 3000 > /tmp/fire53.txt 2>&1 &
python3 scripts/fire_montecarlo.py --n-sim 3000 --anos 11 > /tmp/fire50.txt 2>&1 &
wait
cat /tmp/fire53.txt
cat /tmp/fire50.txt
```

Se o script falhar (dependências, erro), reportar o erro e usar último P(FIRE) registrado em `agentes/memoria/04-fire.md` como fallback.

3. Leia `agentes/memoria/04-fire.md` para comparação com último resultado

## Flags Úteis

```bash
# Comparar withdrawal strategies (mensal ou quando P(FIRE) < 85%)
python3 scripts/fire_montecarlo.py --compare-strategies --n-sim 5000

# Cenário factor drought: AVGS permanentemente em 2.0% real
python3 scripts/fire_montecarlo.py --retorno-equity 0.0395 --n-sim 3000
```

Factor drought (−6.7pp) é cenário de stress, não central. Reportar só se Diego pedir ou P(FIRE) base < 85%.

## Output

Incluir:
- **Tabela P(FIRE)**: cenários base/favorável/stress × FIRE 53 e FIRE 50
- **Distância ao gatilho**: patrimônio atual vs R$13.4M, gap em R$ e em aportes
- **Delta vs último check-in**: P(FIRE) anterior → atual, patrimônio anterior → atual
- **Status**: on track (≥90%), atenção (80-90%), revisar (<80%)

## Regras

- Se P(FIRE base) ≥ 90%: on track
- Se 80-90%: atenção — verificar se transitório (drawdown recente?)
- Se <80%: acionar FIRE agent para revisão de premissas
