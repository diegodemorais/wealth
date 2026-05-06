# Protocolo de Debate Estruturado (Bull vs Bear)

> Para decisoes estruturais. Garante que ambos os lados sao ouvidos antes de decidir.
> Movido do perfil do Head (00-head.md) para referencia. HD-008, 2026-03-22.

## Quando Aplicar

Toda decisao estrutural (conforme criterios do CIO: mudanca de alocacao, novo ativo, mudanca de gatilho, mudanca de estrategia de desacumulacao, premissa de vida, decisao tributaria irreversivel, mudanca de custodia).

## Papeis

- **Proponente**: O agente que trouxe a proposta (ou o CIO, se for decisao de investimento)
- **Oponente**: Advocate (10), obrigatoriamente. Outros agentes podem reforcar
- **Juiz e votante**: Head (00). Participa da votação ponderada no R4 e apresenta síntese. Diego tem palavra final

## Rounds Estruturados

| Round | Quem | O Que |
|-------|------|-------|
| **R1 — Tese** | Proponente | Apresenta proposta com evidencia, numeros e racional. Responde: "por que fazer isso?" |
| **R2 — Contra-tese** | Advocate | Apresenta objecoes com contra-evidencia. Aplica checklist (lente IPCA+, VWRA, post-publication decay, logica reversa, cui bono, unanimidade suspect). Responde: "por que NAO fazer?" |
| **R3 — Refutacao** | Proponente | Refuta as objecoes do Advocate. Se nao conseguir refutar alguma, admite explicitamente |
| **R4 — Síntese e Veredicto Ponderado** | Head + todos os participantes | Head coleta posição de cada agente, aplica pesos (ver tabela abaixo), calcula score ponderado e apresenta ao Diego |

## Pesos por Tipo de Debate (R4 — Veredicto Ponderado)

O Head coleta a posição de cada agente participante, aplica o peso abaixo e calcula o score ponderado:

| Categoria | Peso | Critério |
|-----------|------|----------|
| **Especialista do domínio** | 3x | Agente cuja expertise central é o tema (ex: Factor em issue de ETF; RF em issue de IPCA+) |
| **Adjacente direto** | 2x | Agentes com análise própria no debate e domínio relacionado |
| **Head** | 1x | Sempre participa — coordena e vota |
| **Generalistas permanentes** | 1x | Advocate, Quant, Fact-Checker, Behavioral — sempre relevantes |
| **Outside View** | 2x | Obrigatório em decisões >5% portfolio; traz base rates e reference class |
| **Ops** | 1x | Check-in operacional, drift, prazos |
| **Periférico** | 0.5x | Agentes mencionados mas sem análise específica na issue |

**Formato do veredicto:**
```
| Agente | Peso | Posição | Contribuição |
|--------|------|---------|-------------|
| Factor | 3x   | Manter  | 3.0 pts     |
| CIO    | 2x   | Manter  | 2.0 pts     |
| Head   | 1x   | Manter  | 1.0 pts     |
| Advocate | 1x | Manter | 1.0 pts     |
| RF     | 0.5x | Mudar   | -0.5 pts    |
| **Total** |   | **Manter** | **6.5 pts favor** |
```

Score absoluto e direção são registrados na conclusão da issue (ex: "6.5p favor de manter — decisão: manter").

## Regras

1. **Rounds sao sequenciais, nao free-form**: Cada agente fala na sua vez. Sem interrupcao
2. **Evidencia obrigatoria**: Argumentos sem dados/papers nao contam
3. **Admitir fraqueza**: Se um argumento nao tem refutacao, dizer. Nao inventar
4. **Unanimidade = red flag**: Se TODOS concordam (incluindo Advocate), o Head DEVE pausar e investigar. Advocate deve explicar por que nao encontrou objecao — e o Behavioral investiga se e groupthink
5. **Dissenso registrado**: Se agentes discordam, registrar AMBAS posicoes na conclusao. Nao forcar consenso artificial. Diego decide com informacao completa
6. **Head vota**: O Head não é neutro no R4 — emite posição própria com peso 1x antes de apresentar a síntese ao Diego

## Registro

Debates estruturados sao registrados na issue correspondente (secao Analise) ou, se em conversa, o Head sugere abertura de issue para registro formal.

---

## Estado do Debate (template pós-R4)

Após cada debate formal R1-R4, o Head preenche esta tabela na issue (preenchimento pós-R4, nunca durante):

```markdown
## Estado do Debate (preenchido pelo Head após R4)

| Agente | Prior (antes do debate) | R2 (após 1º counter) | Final (R4) | Flip? | Evidência nova entre R2→R4? |
|--------|------------------------|----------------------|------------|-------|------------------------------|
| Factor | A | A | A | — | — |
| RF | B | B | A | ✅ | Não → flag sycophancy |
| Advocate | A | A | B | ✅ | Sim: dado X introduzido em R3 |
| Head | — | — | A | — | Sintetizador/votante |

**Flip rate neste debate:** X de Y agentes fliparam sem evidência nova
**Flag de sycophancy:** [Sim/Não — quais agentes]
```

**Regras de preenchimento:**
- Somente em debates formais com rounds R1-R4 explícitos
- Para debates exploratórios (sem posição prévia clara): omitir tabela
- Flip sem evidência nova = sycophancy flag obrigatório (ver D8-addendum e D11-addendum em protocolos-decisao.md)
