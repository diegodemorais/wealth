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

## Cenário Drought (condicional)

Rode automaticamente se P(FIRE base) < 88%:

```bash
python3 scripts/fire_montecarlo.py --n-sim 3000 --retorno-equity 0.0395 > /tmp/fire_drought.txt 2>&1
cat /tmp/fire_drought.txt
```

O cenário drought (AVGS 2.0% real permanente) explica quedas de P(FIRE) de até −6.7pp vs base. Se P(FIRE) ≥ 88%, **não rodar** — evita ruído no status normal.

## Output

Incluir:

**Tabela P(FIRE):**

| Cenário | FIRE 53 | FIRE 50 |
|---------|---------|---------|
| Base | X% | X% |
| Favorável | X% | X% |
| Stress | X% | X% |
| *Factor drought (se rodado)* | *X%* | *—* |

- **Distância ao gatilho**: patrimônio atual vs R$13.4M, gap em R$ e em aportes (~R$25k/mês)
- **Delta vs último check-in**: P(FIRE) anterior → atual, patrimônio anterior → atual
- **Status**: ver regras abaixo

## Regras

- P(FIRE base) ≥ 90%: **on track** ✓
- P(FIRE base) 85–90%: **atenção** — verificar se transitório (drawdown recente?) e rodar drought
- P(FIRE base) 80–85%: **alerta** — rodar drought + acionar FIRE para revisão de premissas
- P(FIRE base) < 80%: **crítico** — acionar FIRE agent imediatamente
- Drought rodado: contextualizar se queda é estrutural (premissas) ou de mercado (patrimônio)
