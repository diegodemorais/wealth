# DEV-fire-dashboard-gaps: Dashboard FIRE — 3 Gaps Críticos de Comunicação de Risco

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-fire-dashboard-gaps |
| **Dono** | Dev |
| **Status** | ✅ Done |
| **Concluído em** | 2026-04-22 |
| **Prioridade** | Alta |
| **Participantes** | FIRE, RF, Tax, Quant |
| **Co-sponsor** | Head (síntese análise 8 agentes 2026-04-21) |
| **Dependencias** | — |
| **Criado em** | 2026-04-21 |
| **Origem** | Revisão paralela 8 agentes — gaps identificados por FIRE, RF e Tax independentemente |
| **Concluido em** | — |

---

## Motivo / Gatilho

Análise paralela de 8 agentes (2026-04-21) identificou 3 gaps críticos no dashboard que criam ilusão de segurança:

1. **Bond pool** — usuário vê P(FIRE)=90.7% e pensa que está bem; não vê que a proteção contra Sequence of Returns Risk está a 11% do target
2. **Trajetória patrimonial** — usuário não consegue ver "em qual ano o P50 cruza R$8.33M" sem rodar MC manualmente
3. **IR latente** — dashboard mostra patrimônio bruto; passivo de ~R$90k em IR nos transitórios é invisível

Os 3 foram identificados de forma independente por FIRE e RF (sem comunicação entre si), o que aumenta a confiança no diagnóstico.

---

## Descrição

Implementar 3 melhorias de comunicação de risco na aba FIRE do dashboard:

### Gap 1 — Bond Pool Gauge Visual
**Situação atual:** bond pool aparece como número (R$211k / 0.8 anos). Usuário não tem referência visual do quanto falta.
**Meta:** gauge ou progress bar mostrando "0.8 / 7 anos cobertos = 11%". Incluir projeção: "ao ritmo atual de DCA, bond pool no FIRE Day = X anos."

### Gap 2 — Trajetória Patrimonial P10/P50/P90 com Gatilho
**Situação atual:** `TrackingFireChart` já existe com P10/P50/P90 histórico + projeção futura e Meta FIRE plotada. Verificar se o gatilho de antecipação (R$8.33M = 250k ÷ 3%) está plotado como linha horizontal adicional, e se o cruzamento P50 × gatilho é destacado visualmente (ex: marcador de ano).
**Meta:** se o gatilho não está plotado ou o cruzamento não é destacado, adicionar. O usuário deve ver claramente "P50 cruza o gatilho em XXXX".

### Gap 3 — IR Latente como Passivo
**Situação atual:** dashboard mostra patrimônio bruto R$3.665M. IR latente de ~R$90k nos transitórios é invisível.
**Meta:** adicionar ao resumo patrimonial: "Patrimônio bruto: R$3.665M | IR latente (transitórios): R$90k | Patrimônio líquido pós-IR: R$3.575M"

---

## Escopo

- [ ] G1: Verificar estrutura atual do bond pool no dashboard — onde está exibido, em qual componente/aba
- [ ] G1: Implementar gauge/progress bar "X / 7 anos cobertos (Y%)" na aba FIRE
- [ ] G1: Calcular e exibir projeção do pool no FIRE Day dado DCA atual
- [ ] G2: Verificar se `TrackingFireChart` já plota linha do gatilho de antecipação (R$8.33M)
- [ ] G2: Se não, adicionar linha horizontal "Gatilho antecipação R$8.33M" no chart
- [ ] G2: Destacar o ponto/ano onde P50 cruza o gatilho (marcador ou anotação no chart)
- [ ] G3: Calcular IR latente total dos transitórios (usando dados de lotes em `dados/tlh_lotes.json` ou equivalente)
- [ ] G3: Expor o campo `ir_latente_brl` no pipeline de dados (generate_data.py ou equivalente)
- [ ] G3: Exibir "IR latente / Patrimônio líquido" no painel patrimonial (Privacy Mode: ocultar valores)
- [ ] Quant: validar cálculo de IR latente (15% × ganho nominal BRL por lote, somado)
- [ ] Quant: validar cálculo de projeção do bond pool
- [ ] Build + teste Playwright

---

## Raciocínio

**Argumento central:** Os 3 números existem nos dados — são questão de exibição, não de cálculo novo. O custo de implementação é baixo; o benefício é eliminar ilusão de segurança que um P(FIRE)=90.7% estático cria.

**Alternativas rejeitadas:** esconder o IR latente para "não assustar" — rejeitado. Diego quer transparência de risco, não conforto artificial.

**Incerteza reconhecida:** o cálculo de IR latente requer o custo de aquisição em BRL por lote, que pode não estar totalmente disponível no pipeline atual. Pode precisar de dado de `tlh_lotes.json`.

**Falsificação:** se o bond pool gauge criar ansiedade desnecessária (Behavioral: adaptation level reverso — "11% parece crítico mesmo não sendo"), reconsiderar a apresentação. Testar com Diego.

---

## Análise

> A preencher durante implementação.

---

## Conclusão

> A preencher após implementação.

---

## Resultado

> A preencher.

---

## Próximos Passos

- [ ] Dev: ler componentes atuais de FIRE no dashboard antes de implementar
- [ ] Dev: confirmar fonte de dados para IR latente por lote
- [ ] Quant: validar fórmulas antes do build final
