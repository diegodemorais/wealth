# HD-009-Audit_gastos_pessoais: Auditoria de gastos pessoais e consistencia com FIRE

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-009-Audit_gastos_pessoais |
| **Dono** | 00 Head |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 04 FIRE, 10 Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-03-23 |
| **Origem** | Conversa |
| **Concluido em** | 2026-03-23 |

---

## Motivo / Gatilho

> Diego trouxe controle financeiro pessoal (Aug '25 – Feb '26) para revisao. Quer avaliar se os gastos estao alinhados com o plano FIRE e identificar algo relevante que o time deveria saber.

---

## Descricao

> Analisar os gastos pessoais de Diego (excluindo investimentos) para:
> 1. Verificar consistencia com o custo de vida projetado no plano FIRE (R$250k–R$350k/ano)
> 2. Identificar tendencias preocupantes, sazonalidade ou anomalias
> 3. Cruzar com as movimentacoes de investimentos
> 4. Dar um veredicto claro: os gastos sao sustentaveis no contexto do plano?

---

## Escopo

- [x] Receber e mapear os dados de gastos (Aug '25 – Feb '26)
- [x] Calcular total anualizado e comparar com premissa FIRE
- [x] Identificar categorias dominantes e anomalias
- [x] Cruzar com movimentacoes de investimentos
- [x] Advocate: stress-test dos gastos
- [x] Veredicto: gastos consistentes com FIRE?

---

## Analise

### Dados brutos (Aug '25 – Feb '26, 7 meses)

**Gastos pessoais mensais:**
| Mes | Total |
|-----|-------|
| Aug '25 | R$15.177 |
| Sep '25 | R$17.482 |
| Oct '25 | R$16.884 |
| Nov '25 | R$20.738 |
| Dec '25 | R$17.506 |
| Jan '26 | R$22.333 |
| Feb '26 | R$15.172 |
| **Media** | **R$17.899** |
| **Anualizado** | **R$214.8k** |

**Anomalias explicadas:**
- Jan Transportation R$6.135: IPVA + pneus (evento anual)
- Feb Housing R$6.901: IPTU + seguro carro (evento anual)
- Nov Real Estate R$16.484: transferencia interna de contas, desconsiderar

**Composicao estrutural (media mensal):**
- Taxes & Fees (ISS + tributos PJ): ~R$4.100/mes = R$49k/ano → SOME na aposentadoria
- Mortgage juros+seguros+adm: ~R$2.617/mes = R$31.4k/ano
- Housing & Utilities: ~R$1.800/mes (normal)
- Transportation: ~R$1.300/mes (normal)
- Foods & Groceries: ~R$1.180/mes
- Insurance: ~R$568/mes
- Optionals total: ~R$4.300/mes (Health, Dining, Alcohol, Travel, Leisure)

**Gastos normalizados** (tirando sazonais ~R$9.9k/ano): ~R$197.7k/ano

### Hipoteca (Bradesco SAC, parcela 062/360, 23/03/2026)
- Saldo devedor: R$452.125
- Amortizacao (principal, contabilizado como investimento): R$1.517/mes
- Juros + seguros + adm (despesa corrente): ~R$2.617/mes
- Total prestacao: R$4.134/mes
- Parcelas restantes: ~298 (~25 anos) → quita ~2051 (Diego com 64 anos)
- Hipoteca NAO quita antes do FIRE. Em 2037 (aposentadoria): ~14 anos restantes, juros caem para ~R$1.370/mes
- Decisao: nao quitar antecipadamente (custo de oportunidade vs retorno do portfolio)

### Aportes (padrao identificado)
- Aug–Nov '25: Short-term Goals (ETFs transicionais) ~R$28k/mes
- Dez '25 em diante: Long-term Goals (alocacao final) — virada completa
- Confirma transicao para alocacao final iniciada em Dezembro

### FIRE vs gastos reais
- O R$250k baseline tem conta por tras (gastos + viagem) mas nunca foi validado bottom-up contra dados reais — esta foi a primeira auditoria
- Custo estrutural no FIRE (FIRE agent): piso ~R$136k, estimativa central ~R$190-200k/ano
- O R$250k funciona como buffer implicito para Go-Go years (50-60), que tendem a custar mais

### Advocate: principais riscos identificados
1. **Lifestyle creep (Go-Go years 50-60)**: Optionals comprimidos na fase de acumulacao. Travel R$491/mes medio e irrisorio para o patrimonio. Primeiros 5-10 anos de FIRE provavelmente custam R$270-290k (Blanchett 2014 — retirement spending smile)
2. **Health escalation**: unico componente com inflacao propria (+5-8%/ano real). Planos individuais sobem ~115% entre 50-59 anos. Modelo atual nao captura curva convexa
3. **PJ taxes saving liquido**: IR sobre ganho em BRL nos saques (~15%) e outros custos de desacumulacao consomem parte dos R$49k. Saving liquido real: R$0-12k (nao R$49k). TX precisa quantificar
4. **Spending smile nao modelado**: modelo usa R$250k flat. Realidade e: R$270-290k (50-60), R$220-230k (60-70), R$270-300k+ (70+)

---

## Conclusao

**Veredicto: VERDE. Nenhuma acao imediata necessaria.**

Gastos atuais (R$215k/ano) sao compatíveis com o plano FIRE. Dentro do range esperado, sem anomalias estruturais. A separacao principal/juros da hipoteca esta correta.

**O risco nao esta nos gastos de hoje — esta no modelo que descreve os gastos de amanha.**

O R$250k flat do FR-003 e uma simplificacao adequada mas imperfeita. Os primeiros 10 anos de FIRE (Go-Go phase) provavelmente custam R$270-290k, consumindo boa parte da margem. A saude e o unico componente com inflacao propria crescente que merece modelagem separada.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Nenhuma mudanca |
| **Estrategia** | Nenhuma mudanca imediata. Dois gaps identificados no modelo FIRE |
| **Conhecimento** | Baseline real de gastos: R$215k/ano (R$197.7k normalizado). R$250k nunca foi validado bottom-up — hoje confirmado como conservador com margem ~25-30%. Spending smile nao esta modelado. Saude precisa de inflator proprio |
| **Memoria** | Registrar baseline de gastos reais |
| **Nenhum** | — |

---

## Proximos Passos

- [ ] FR-006: Atualizar FR-003 com spending smile (R$270-290k anos 50-60, R$220-230k anos 60-70, R$270-300k 70+) + saude com inflator proprio — **Backlog, baixa urgencia**
- [ ] TX-003: Quantificar custos de desacumulacao pos-FIRE (IR sobre ganho BRL, IOF, etc.) para calcular saving liquido real de sair da estrutura PJ — **Backlog, baixa urgencia**
