# FR-filho-drawdown: MC com Cenário Conjunto Filho 2028 + Drawdown 2029

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-filho-drawdown |
| **Dono** | FIRE |
| **Status** | Doing |
| **Prioridade** | Média |
| **Participantes** | Quant, Advocate |
| **Co-sponsor** | Advocate (scan 2026-04-20) |
| **Dependencias** | — |
| **Criado em** | 2026-04-20 |
| **Origem** | Rotina periódica — scan Advocate + F-4 Multi-Model Validation 2026-04-06 |
| **Concluido em** | — |

---

## Motivo / Gatilho

O Advocate identificou em HD-multimodel-validation (2026-04-06) o cenário F-4: "filho + drawdown simultâneos" como o caminho de falha mais provável dado a distribuição subjetiva de FIRE date de Diego. O cenário nunca foi modelado no `fire_montecarlo.py`. O scan de 2026-04-20 reforçou: filho previsto para ~2028, drawdown possível em 2029, e o P(FIRE) do MC não captura esse stress combinado durante a fase de acumulação.

---

## Descricao

Rodar fire_montecarlo.py com parâmetros que aproximem o cenário combinado:
- Filho nasce em 2028 (Diego com 41 anos) → spending sobe para R$300k/ano
- Aportes mensais podem cair de R$25k para ~R$18-20k (maior custo de vida, escola, etc.)
- Drawdown de mercado em 2029 (2-3 anos antes de qualquer estabilização)
- FIRE alvo mantido em 2040 (53 anos)

---

## Escopo

- [x] Rodar MC base com spending=R$300k, aporte=R$25k (filho só afeta desacumulação)
- [x] Rodar MC com spending=R$300k, aporte=R$18k (filho afeta acumulação também)
- [x] Rodar MC com spending=R$300k, aporte=R$18k, cenário stress (pior caso conjunto)
- [ ] Quant valida os números
- [ ] Comparar com baseline (R$250k, R$25k) — delta P(FIRE)
- [ ] Avaliar: se P(stress conjunto) < 75%, há ação necessária?

---

## Raciocinio

**Argumento central:** O MC atual modela cada variável independentemente. O risco F-4 é a correlação: filho reduz aportes exatamente quando o mercado cai, comprimindo o período mais crítico de acumulação (Diego 41-43 anos, ainda com 10+ anos para o FIRE).

**Incerteza reconhecida:** Redução de R$25k para R$18k é estimativa — Diego pode manter R$25k com ajuste de custo de vida. O filho pode não nascer em 2028.

**Falsificação:** Se P(FIRE stress conjunto) > 80%, o cenário F-4 não é um risco material suficiente para mudança de estratégia.

---

## Analise

### Resultados fire_montecarlo.py — 2026-04-20 (5k sims)

**Baseline (R$250k spending / R$25k aporte) — referência oficial:**

| Cenário | P(FIRE) |
|---------|---------|
| Base | 90.4% |
| Favorável | 94.1% |
| Stress | 86.8% |

**Cenário F-4a: Filho (R$300k spending / R$25k aporte mantido):**

| Cenário | P(FIRE) | Delta vs baseline |
|---------|---------|-------------------|
| Base | 86.3% | -4.1pp |
| Favorável | 92.1% | -2.0pp |
| Stress | 82.9% | -3.9pp |

Pat. mediana no FIRE Day: R$11.53M (igual ao baseline — acumulação não depende do spending)

**Cenário F-4b: Filho + aporte reduzido (R$300k spending / R$18k aporte):**

| Cenário | P(FIRE) | Delta vs baseline |
|---------|---------|-------------------|
| Base | 80.7% | -9.7pp |
| Favorável | 88.5% | -5.6pp |
| **Stress** | **75.1%** | **-11.7pp** |

Pat. mediana no FIRE Day: R$9.99M base / R$9.56M stress (queda de R$1.5-1.5M vs baseline)

### Leitura crítica

O cenário F-4b (filho + aporte cai para R$18k + stress de mercado) produz P(stress) = **75.1%** — exatamente no limite do critério de segurança de 75%. Qualquer combinação ligeiramente pior (aporte R$15k, spending R$310k) rompe o piso.

O cenário F-4a (filho mas aporte mantido) é sobrevivível: P(stress) 82.9% > 75%. O risco não é o filho per se — é a compressão do aporte combinada com drawdown.

**Implicação operacional:** manter R$25k de aporte mesmo após o nascimento do filho é o fator de proteção mais importante do plano. Abaixo de R$20k de aporte com spending R$300k, o stress scenario fica vulnerável.

---

## Conclusao

### Validação Quant — 2026-04-20

**APROVADO COM RESSALVAS**

1. Os 3 deltas são matematicamente consistentes. FV analítico da redução de R$84k/ano × 14 anos a 4.85% = R$1.627M — bate com a queda de patrimônio mediano R$11.53M → R$9.99M (R$1.54M).
2. **Ressalva R1:** n=5k gera margem amostral ±0.7-1pp. P(stress)=75.1% no F-4b está dentro da margem do piso de 75% — "exatamente no limite" é estatisticamente impreciso. Requer revalidação com n=10k para qualquer decisão baseada nesse número.
3. **Ressalva R2 (governança):** O piso de 75% não está formalizado em carteira.md — está disperso em 5+ issues e memória. Quant recomenda formalizar como premissa canônica.

### Veredicto Final

O risco F-4 é **real e material**, mas não exige mudança de alocação agora. A conclusão operacional se sustenta: manter R$25k de aporte após o filho é o principal fator de proteção. Abaixo de R$20k, o plano fica vulnerável no stress. O piso de 75% deve ser formalizado em carteira.md.

---

## Proximos Passos

- [ ] FIRE: interpretar resultados do MC
- [ ] Quant: validar números
- [ ] Advocate: avaliar se há ação necessária
- [ ] Head: registrar conclusão e atualizar P(FIRE) oficial se necessário
