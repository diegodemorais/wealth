# FR-bond-tent-fire-date: Bond Tent — Robustez para FIRE Date Incerta

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-bond-tent-fire-date |
| **Dono** | FIRE |
| **Status** | Backlog |
| **Prioridade** | 🟡 Média |
| **Participantes** | FIRE (lead), RF, Advocate, Quant |
| **Co-sponsor** | RF (confirmou tensão do design 80/20 para FIRE fora de 2040) |
| **Dependencias** | — |
| **Criado em** | 2026-04-10 |
| **Origem** | Conversa — aporte R$58k levantou dúvida de FIRE date e robustez do bond tent |
| **Concluido em** | — |

---

## Motivo / Gatilho

Diego expressou baixa confiança subjetiva em aposentar exatamente em 2040, citando: incertezas de casamento, filho, novos custos, moradia, e dúvida sobre querer parar de trabalhar. O design atual do bond tent usa TD 2040 (80%) como bond pool primário — calibrado para FIRE exatamente em 2040. Se FIRE ocorrer em 2037 (aspiracional) ou 2043+ (tardio), há tensões não modeladas.

Behavioral confirmou que parte da dúvida é present bias (momento pré-casamento), mas a questão estrutural é legítima e independente do viés.

---

## Descrição

O bond tent atual foi desenhado com uma âncora temporal específica: TD 2040 vence exatamente no FIRE Day 2040 → entrega ~R$2.3M de bond pool imediato para os anos 1-7 do FIRE. Esse design é ótimo para FIRE 2039-2041, mas cria três tensões não resolvidas:

**Tensão 1 — FIRE 2037 (aspiracional):**
TD 2040 ainda não venceu. Pool principal (R$~2.3M) não disponível nos 3 primeiros anos do FIRE. O IPCA+ curto 3% (comprado aos 50) cobre 2 anos, não 3. Sequence-of-returns risk exposto nos anos 1-3 sem bond pool.

**Tensão 2 — FIRE 2043+ (tardio):**
TD 2040 vence em 2040 e Diego ainda está trabalhando. Recebe ~R$2.3M, paga IR 15% sobre nominal, e precisa reinvestir. Não há regra documentada para esse cenário. Pode ir para equity (altera alocação pré-FIRE), novo TD (reinvestment risk), ou Selic (ineficiente).

**Tensão 3 — Split 80/20 vs data incerta:**
O split 80/20 (TD 2040 / TD 2050) é ótimo quando a data é 2040. Para date incerta em range 2037-2047, pode ser subótimo. Split 60/40 ou 50/50 cria mais optionality mas custa 25bps de carry no capital em TD 2040 que seria mantido mesmo sem incerteza.

---

## Escopo

- [ ] Modelar os 3 cenários de FIRE date (2037, 2040, 2043, 2047) com o bond tent atual — P(sucesso) e exposição SoRR por cenário
- [ ] Calcular o custo de mudar o split de 80/20 para 60/40 ou 50/50 em termos de retorno esperado e robustez
- [ ] Documentar regra para reinvestimento do TD 2040 se FIRE não ocorrer em 2040 (Decisão 7 reformulada apenas cobre 2050 ≥ 3%, não a regra operacional de 2040)
- [ ] Avaliar se IPCA+ curto 3% (comprado aos 50) precisa ser dimensionado diferente para cobrir o gap no cenário FIRE 2037
- [ ] Quant: validar os números dos cenários de bond pool por data

---

## Raciocínio

**Argumento central:** O design de bond tent é extremamente sensível à data de FIRE quando usa instrumento de vencimento fixo (TD 2040). Com FIRE date genuinamente incerta, essa sensibilidade cria risco estrutural não modelado.

**Alternativas rejeitadas na conversa:**
- Desviar R$58k para equity agora: não resolve — é decisão de alocação tática, não de design do bond tent
- Ignorar a incerteza: Behavioral identificou parte como viés, mas não toda — a questão é estruturalmente válida

**Incerteza reconhecida:** não sabemos se Diego vai preferir trabalhar além de 2040. O FIRE pode ser uma opção, não uma obrigação. Se isso for verdade, o design do bond tent precisa ser robusto para "opções" de FIRE, não só para "obrigações".

**Falsificação:** se o custo de aumentar o peso em TD 2050 (split 60/40 ou 50/50) for < 15bps em retorno esperado anualizado E a robustez para date uncertainty aumentar materialmente (>5pp de P(sucesso) em cenários fora de 2040), a mudança de split é justificada.

---

## Análise

> A preencher quando a issue entrar em Doing.

---

## Conclusão

> A preencher quando concluída.

---

## Resultado

> A preencher quando concluída.

---

## Próximos Passos

- [ ] Entrar em Doing quando Diego priorizar
- [ ] Se FIRE 2037 parecer mais provável (patrimônio atingir R$13.4M antes de 2040), priorizar urgentemente
