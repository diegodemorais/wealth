# FR-ir-desacumulacao: IR na desacumulação — modelar impacto no P(FIRE)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-ir-desacumulacao |
| **Dono** | FIRE |
| **Status** | Done |
| **Prioridade** | 🟡 Média |
| **Participantes** | FIRE (lead), Quant |
| **Co-sponsor** | Quant |
| **Dependencias** | — |
| **Criado em** | 2026-04-06 |
| **Origem** | Finding do Quant em FI-avgs-premium-reconciliacao: IR não modelado na desacumulação |
| **Concluido em** | 2026-04-06 |

---

## Motivo / Gatilho

O Quant identificou ao auditar `fire_montecarlo.py` que o script usa retornos reais BRL que incluem TER e WHT, mas **não incluem o IR de 15% sobre ganho nominal** na fase de desacumulação.

Durante a acumulação isso é correto — Diego não vende, não há IR. Mas na desacumulação (pós-FIRE), cada saque de equity gera um evento tributável sobre o ganho nominal (real + inflação + câmbio). Isso não está modelado no MC atual.

---

## Descrição

### O gap

`fire_montecarlo.py` usa `retorno_equity_base = 4.85%` real BRL como retorno líquido de TER+WHT. Não desconta IR de 15% sobre ganho nominal na fase de retirada.

### Estimativa do impacto

Ganho nominal = retorno real (4.85%) + IPCA (4%) = ~8.85% nominal.
IR = 15% × 8.85% = 1.33% de drag.
Retorno efetivo pós-IR na desacumulação = ~8.85% × 0.85 − 4% IPCA ≈ 3.52% real.
Delta vs premissa atual: ~−1.3pp/ano na fase de retirada.

### Atenuantes relevantes

1. **Bond pool cobre primeiros ~7 anos do FIRE** (TD 2040 vence no FIRE Day, pool ~R$2.3M). Equity IR só começa a pesar depois de ~2047 (Diego com ~60 anos).
2. **IPCA+ HTM já tem IR modelado corretamente** (6.0% real líquido).
3. **Ativos transitórios** (EIMI, AVUV, AVDV, etc.) têm custo base baixo — IR será alto quando vendidos, mas na fase de usufruto já planejada.
4. **Rising equity glidepath pós-2040**: conforme IPCA+ vence, capital realocado para equity. O IR afeta mais a fase 60–70+.

---

## Escopo

- [ ] FIRE: modelar IR de 15% sobre ganho nominal na fase de desacumulação do `fire_montecarlo.py`
- [ ] FIRE: implementar como parâmetro opcional `aplicar_ir_desacumulacao: bool` (default True)
- [ ] FIRE: rodar P(FIRE) base com IR modelado vs atual — delta real
- [ ] FIRE: modelar atenuante bond pool (primeiros 7 anos sem IR de equity)
- [ ] Quant: validar a fórmula e o delta
- [ ] Head: se P(FIRE) cair >3pp, avaliar se gatilho FIRE ou premissas precisam revisão

---

## Raciocínio

**Argumento central:** O MC atual é otimista na fase de desacumulação porque não cobra o IR que incidirá sobre cada saque de equity. O impacto estimado é −1.0 a −1.3pp/ano no retorno efetivo durante retiradas — não negligenciável.

**Contraponto:** O atenuante do bond pool é real e material. Diego passará os primeiros 7 anos do FIRE sem precisar vender equity. O IR de desacumulação começa a pesar só depois de 2047.

**Falsificação:** Se após modelar corretamente o IR, P(FIRE) cair menos de 2pp, o gap é aceitável dado o nível de conservadorismo das demais premissas (mediana vs otimista, spending smile com healthcare, guardrails).

---

## Resultado

### Implementação

`fire_montecarlo.py` atualizado com:
```python
"aplicar_ir_desacumulacao": True
"anos_bond_pool": 7        # TD 2040 cobre anos 0–6 pós-FIRE
"aliquota_ir_equity": 0.15

# Fórmula aplicada (ano >= 7 na desacumulação)
r_nominal = (1+r_real) × (1+IPCA) - 1
r_depois_ir = r_nominal × 0.85
r_real_net = (1+r_depois_ir) / (1+IPCA) - 1  # ≈ 3.55% vs 4.85% → drag -1.30pp
```
Flag `--sem-ir` mantida para backward compatibility.

### P(FIRE) — delta após modelar IR

| Cenário | COM IR (correto) | SEM IR (anterior) | Delta |
|---------|-----------------|-------------------|-------|
| Base | **82,8%** | 87,2% | **−4,4pp** |
| Favorável | 89,8% | 92,7% | −2,9pp |
| Stress | **78,3%** | 83,5% | **−5,2pp** |

Delta supera threshold de 3pp do escopo → Head avalia. Conclusão: 82,8% ainda acima do piso operacional. Bond pool atenua. Monitorar — sem ação imediata.

**Nota:** Gap existia desde criação do script. Diego havia orientado antes. Abertura de HD-mc-audit para auditoria sistemática de outros gaps similares.
