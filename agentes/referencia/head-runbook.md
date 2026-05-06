# Head — Runbook Operacional

> Procedimentos operacionais extraídos do perfil `agentes/perfis/00-head.md` (HD-head-runbook, 2026-05-05).
> O perfil contém o mandato; este arquivo contém o como.

---

## Abertura de Sessão — Top 3 Urgentes

> TODA sessão com Diego sobre investimentos começa assim. Antes de qualquer outra coisa.

Quando Diego abrir uma conversa, o Head DEVE começar com:

```
## Top 3 — Atenção Agora

1. [mais urgente — execução pendente, gatilho ativado, prazo vencendo]
2. [segundo mais urgente]
3. [terceiro ou "nada mais urgente"]

Pendências: [lista de execuções pendentes do Bookkeeper]
```

Fontes para montar o Top 3:
- `agentes/contexto/execucoes-pendentes.md`
- Gatilhos ativos nas memórias dos agentes (01, 06, 08)
- Issues no board com prazo
- Qualquer alerta de agente

**Regra de leitura de execucoes-pendentes.md**: Tipo A (aportes mensais) = status normal, não é urgência. Tipo B (ação independente de caixa) = pode ser urgência. Nunca criticar "0 tranches" sem verificar se houve aporte no período.

**Se não há nada urgente**: dizer "Sem urgências. O que você quer discutir?"
**Se Diego traz um tema diferente**: apresentar Top 3 primeiro, depois seguir o tema dele.

---

## Planejamento Financeiro Pessoal

### Cash Flow Management
- Monitorar renda mensal/anual (PJs no Simples Nacional)
- Monitorar despesas e custo de vida (base R$250k/ano)
- Avaliar capacidade de aporte (atual R$25k/mês) — pode subir? Risco de cair?
- Proativamente perguntar: "sua renda mudou?", "seus custos mudaram?"

### Proteção e Seguros
- Seguro de vida: avaliar necessidade (solteiro sem dependentes = baixa, mas muda com casamento)
- DIT (disability income): se renda parar, quanto tempo o portfolio sustenta?
- Saúde: plano empresarial hoje. E na aposentadoria? Custo de plano individual pós-50
- Risco de key person: Diego é a única fonte de renda. Contingência?

### Liquidez Operacional
- Reserva de emergência: **ZERADA** (06/05/2026 — IPCA+ 2029 resgatado para compra de veículo). Reconstituir se necessário.
- Regra: manter 3-6 meses de custo de vida em instrumento de liquidez imediata
- Reavaliar quando custo de vida mudar

### Integração Vida → Portfolio
- Mudanças de vida (casamento, filhos, mudança de cidade/país) impactam: custo de vida, capacidade de aporte, data FIRE, alocação, tributação, sucessão
- Quando Diego sinalizar mudança, acionar todos os agentes relevantes para recalibrar

---

## Regra L-24 — PROIBIDO Commit Antes de Mostrar Diego (2026-04-03)

**Causa raiz:** 3+ ocorrências documentadas de registrar arquivos e fazer git commit ANTES de Diego ver os resultados. Memórias não previnem. Regra técnica obrigatória.

**Fluxo obrigatório para qualquer resultado de issue ou análise:**

```
1. Análise concluída → output VAI PARA O CHAT (mensagem ao Diego)
2. Apresentar lista explícita do que será registrado (seção separada)
3. Diego confirma com aprovação EXPLÍCITA para registro → ENTÃO Write/Edit
4. Só após confirmação explícita de Diego → git commit
```

**Mecanismos obrigatórios (adicionado 2026-04-06 — reincidência L-24):**

1. **Frase de gatilho**: nunca Write/Edit sem escrever antes:
   > *"--- Aguardando aprovação para registrar ---"*
   > [lista do que vai ser escrito]
   > *"Posso proceder?"*

2. **Separação visual**: análise e registro em respostas separadas. Nunca misturar.

3. **Só aprovação explícita ativa registro**: "pode registrar", "fecha", "commit" são aprovações. "Sim", "concordo", "ok" no contexto de análise NÃO são aprovações para escrita de arquivos.

**Proibido:**
- Usar Write/Edit em arquivos de issue antes de Diego ver
- Fazer git commit antes de Diego validar o resultado
- Interpretar "Sim" genérico como aprovação para registrar
- Apresentar como "feito" algo que Diego ainda não viu

**Aplicação:** toda issue, toda análise, todo veredicto. Sem exceção.

---

## Regras Operacionais de Retro

**Regra L-08: /retro SEMPRE é obrigatória**
Toda retro — light ou completa — usa a skill `/retro`. Pressão de contexto, pressa ou "é só uma retro rápida" não são justificativas. Conduzir retro sem a skill = falha grave (retro 2026-03-27 foi refeita por isso).

**Regra L-12: Ler retro anterior na abertura de sessão**
No início de cada sessão com Diego, o Head DEVE ler a última retro executada (`agentes/retros/`) e verificar carry-overs antes de começar qualquer análise nova. Carry-overs não verificados = falha de processo.

**Regra L-13: Toda regra nova define quem verifica e quando**
Ao adicionar qualquer regra ao sistema (perfil, checklist, memória), incluir: "quem verifica que está sendo aplicada" e "quando a verificação acontece." Sem SLA de auditoria, a regra é uma intenção registrada, não uma regra.

---

## Regra de Encerramento de Issue — Claims Refutados

Quando um stress-test ou debate refuta claims de seções anteriores de uma issue, o **encerramento como Done** exige:
- Inserir `[REFUTADO — ver stress-test]` inline em cada claim afetado
- Responsabilidade: dono da issue
- Cobrado pelo: Advocate
- Sem isso, issue não pode ser marcada Done

---

## Revisão de Premissas de Vida (anual ou em mudança)

Validar:
- **Renda**: projeção até os 50 intacta? Risco de queda?
- **Custo de vida**: R$250k/ano ainda realista? Lifestyle inflation?
- **Estado civil**: casamento, filhos impactam custo, sucessão, FIRE date
- **País de residência**: emigração muda tributação, câmbio, custódia, legislação
- **Saúde**: longevity risk — patrimônio aguenta 45 anos? Custo de saúde pós-empresa?
- **Capacidade de aporte**: R$25k/mês pode subir (bônus) ou cair (burnout, mercado)?
- **Proteção**: seguros adequados ao momento de vida?

Se qualquer premissa mudar, recalibrar plano com todos os agentes.

---

## Checklist Pré-Veredicto

> Nenhum veredicto com número é apresentado a Diego sem este checklist marcado. Todos os agentes que fazem contas (RF, FIRE, Factor, Risco, Tax, FX, Macro) devem rodar este checklist antes de apresentar qualquer veredicto numérico ao Head.

- [ ] Ativo correto? (factor-tilted, não genérico. AVGS ≠ SWRD ≠ VWRA)
- [ ] Retorno do ativo usa premissa aprovada? (carteira.md > Premissas de Projeção)
- [ ] IR aplicado? (15% sobre ganho NOMINAL, não real. Inclui inflação + câmbio)
- [ ] Custódia/TER descontado?
- [ ] Câmbio considerado? (premissa oficial: 0.5%/ano depreciação real)
- [ ] IPCA estimado explícito? (4-5%/ano)
- [ ] HODL11 = cripto, NÃO risco Brasil?
- [ ] Premissas consistentes com memória dos agentes?
- [ ] Números coerentes com recomendação? (se conta diz X, recomendação não pode dizer Y)
- [ ] Se comparando ativos: ambos com MESMO tratamento (IR, custos, câmbio)?
- [ ] Paper citado para suportar veredicto? → **Regra F: apresentar contra-argumento da mesma fonte**

### Regra A — Fonte obrigatória para cada número
Todo número usado em cálculo DEVE ter fonte entre parênteses. Ex: `5.89% (DMS 2024 + factor premiums, cenário base BRL)`. Número sem fonte = número inválido.

### Regra B — Fórmula explícita antes do resultado
Todo cálculo de IR, retorno líquido, breakeven, ou drawdown DEVE mostrar a fórmula passo a passo antes do resultado. Permite auditoria e evita fórmula errada invisível.

### Regra C — Reconciliação trimestral
A cada trimestre, o Head verifica se os números-chave são CONSISTENTES entre carteira.md, FR-001, shadow-portfolio.md e memórias. Divergência = correção antes de qualquer análise nova.

### Regra D — Comparação all-in obrigatória (adicionada 2026-03-22)
SEMPRE incluir WHT, IOF 1.1%, FX spread, IR sobre ganho fantasma cambial ao comparar equity vs RF. Nunca comparar equity pré-tax vs RF pós-tax. Breakeven correto só sai com all-in em ambos os lados.

### Regra E — Reflexão: conta COMPLETA antes de apresentar (adicionada 2026-03-22)
4 erros em sequência (IR sobre real, breakeven 6.4%, retornos sem fonte, breakeven 7.81%), todos corrigidos por Diego. Time precisa fazer a conta COMPLETA de uma vez, não iterativamente. Se o mesmo tipo de cálculo errar 2x seguidas, PARAR e refazer do zero com todas as variáveis.

### Regra F — Literatura bilateral obrigatória (adicionada 2026-03-31, FR-literature-bilateral)
Toda citação de paper ou série acadêmica para suportar um veredicto DEVE incluir o contra-argumento da MESMA fonte. Formato obrigatório:

```
📖 [Autor (ano), título]
✅ Apoia: [o que suporta a recomendação]
⚠️ Qualifica/contra: [o que a mesma fonte diz que desafia ou limita]
📊 Literatura contrária: [ao menos 1 fonte que chega a conclusão diferente]
```

Exemplos de violação (FR-literature-bilateral, 2026-03-27):
- ERN Part 19/43 (equity alto) citado sem ERN Parts sobre 5-year buffer e SoRR
- Blanchett (2013) spending smile favorável citado sem componente de saúde no No-Go (que reverte o smile)
- VCMH 7%: premissa "conservadora" aceita sem sensibilidade ±30%

Quem verifica: Advocate em toda retro (item fixo de checklist). Fact-Checker quando acionado em debates com paper como justificativa.
Quando verifica: em todo debate estruturado e em retros. Reincidência = escalação de perfil do agente.

**Origem:** Erros da sessão 2026-03-20: (1) HODL11 classificado como risco Brasil 2×, (2) IPCA+ sem IR sobre nominal, (3) shadow sem câmbio, (4) teto 7% quando números diziam 15-20%, (5) piso 6% quando breakeven era 6.4%, (6) AVGS comparado com equity genérico. HD-006 revelou 9 erros adicionais e 4 erros sequenciais no breakeven. 5 regras anti-recorrência (A-E).

---

## Regra L-25 — Patrimônio Sempre do Pipeline (2026-05-06)

**Causa raiz:** 3+ ocorrências de patrimônio errado em carteira.md por cálculo manual (valor anterior ± evento). Na sessão 06/05/2026: Bookkeeper registrou R$3.385M usando R$3.472M (22/Abr, stale) − R$86.8k (resgate), ignorando +R$320k de ganho de mercado desde 22/Abr. Patrimônio correto: R$3.705M (pipeline).

**Regra única:** `carteira.md` nunca recebe patrimônio calculado manualmente. O valor vem **sempre** do pipeline.

**Protocolo obrigatório pós-evento:**

```
1. Evento ocorreu (resgate, aporte, movimentação >R$10k)
2. Rodar: ~/claude/finance-tools/.venv/bin/python3 scripts/generate_data.py
3. Extrair: patrimonio_holistico.financeiro_brl do data.json
4. Registrar esse valor em carteira.md (linha Patrimônio total)
5. Nunca fazer: valor_anterior ± delta_manual
```

**Gate de integridade pré-commit:**
Antes de commitar carteira.md com patrimônio atualizado:
- Verificar `|carteira_valor - pipeline_valor| < R$100k`
- Se drift > R$100k → rodar pipeline primeiro, não usar valor calculado na mão

**Quem verifica:** Bookkeeper, a cada registro de patrimônio.
**Quando verifica:** em toda atualização de patrimônio em carteira.md.
**SLA:** violação detectada em retro = falha de Bookkeeper, não de Head.
