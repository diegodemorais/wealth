# FR-glide-path: Glide path pre-FIRE — definir regra formal de reducao de equity

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-glide-path |
| **Dono** | 04 FIRE |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | 01 CIO, 10 Advocate, 08 Macro, 17 Cetico |
| **Dependencias** | HD-equity-weight (relacionado — equity % no FIRE) |
| **Criado em** | 2026-03-24 |
| **Origem** | Re-analise estrategica full-path (10 agentes) |
| **Concluido em** | — |

---

## Motivo / Gatilho

Re-analise estrategica completa de 2026-03-24 identificou gap critico: nao existe regra formal de glidepath pre-FIRE. A carteira esta com 79% equity hoje e tambem estara com 79% equity aos 50 — sem nenhuma reducao planejada.

Agents que flagaram o gap: FIRE (implicitamente), Pfau & Kitces 2014 (Cetico), Risco (glide path como gatilho hibrido), CIO (risco de portfolio real != portfolio desenhado).

---

## Descricao

Hoje a carteira tem equity constante de 79% dos 39 aos 50 anos. O risco de Sequence of Returns (SoRR) e maximo nos 3-5 anos antes e depois do FIRE date. A literatura (Pfau & Kitces 2014, Cocco et al 2005) mostra que um glidepath em V (reduzir antes, aumentar depois) domina equity constante alto em P(sucesso) para FIRE com data marcada.

Questao central: **quando e quanto reduzir equity antes dos 50?**

Ha duas escolas no time:
- **Escola A** (CIO, FIRE, Advocate): reduzir equity gradualmente a partir dos 45-47, chegando a 70-75% aos 50
- **Escola B** (maioria da votacao): manter 79% e usar o bond tent 15% IPCA+ como hedge suficiente para SoRR

Nenhuma das duas foi formalizada como regra com triggers definidos.

---

## Escopo

- [ ] Quantificar o SoRR: qual o impacto de um crash de -40% nos anos 48, 49 ou 50?
- [ ] Modelar glidepath V: curva de reducao otima (de quando a quando, quanto por ano)
- [ ] Comparar: bond tent 15% e suficiente como hedge de SoRR, ou precisa glidepath?
- [ ] Definir triggers: calendario puro (ex: -1pp equity/ano a partir de 46) vs eventos (ex: quando bond tent atingir 15%)
- [ ] Considerar: capital humano (renda ativa ate 50 amoriza SoRR — Cocco et al)
- [ ] Responder ao Cetico: Pfau & Kitces 2014 mostra glidepath V domina empiricamente — refutar ou incorporar
- [ ] Definir regra formal com owner e data de revisao

**Teste de irrefalsificabilidade**: Qual evidencia coletavel nos proximos 12 meses nos faria mudar >=20% da alocacao pre-FIRE? Ex: "Se Monte Carlo mostrar que P(FIRE) cai abaixo de 80% com equity 79% + cenario sequence risk severo, reduzir equity para 70%".

---

## Analise

> A preencher durante a issue.

### Literatura relevante

- **Pfau & Kitces (2014)** — "Reducing Retirement Risk with a Rising Equity Glidepath", JPF: glidepath em V domina equity constante para FIRE com data marcada. Reduzir equity antes, aumentar depois.
- **Cocco, Gomes & Maenhout (2005)** — RFS: capital humano correlacionado com equity -> alocacao otima em equity financeiro e menor (o investidor ja e "long equity" via salario)
- **Cederburg et al (2023)** — NBER: 100% equity otimo para horizonte 30+ com **renda continua**. Com data marcada, a conclusao diverge.
- **FR-003** (Monte Carlo): P(FIRE) 91% com guardrails, decada perdida 31-43%. Bond tent adiciona +0.1pp SR.

---

## Conclusao

> A preencher ao finalizar.

---

## Resultado

> A preencher ao finalizar.

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | — |
| **Estrategia** | — |
| **Conhecimento** | — |
| **Memoria** | — |

---

## Proximos Passos

> A definir durante a issue.
