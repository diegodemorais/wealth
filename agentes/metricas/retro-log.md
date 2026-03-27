# Retro Log — Carteira Diego

> Registro de todas as retros executadas. Cada retro inclui: scorecard de notas, aprendizados registrados, acoes implementadas.

---

## Retro 2026-03-27

### Contexto
Issues fechadas nesta sessao: FR-spending-smile, FR-fire2040, XX-casamento, PT-onelife
Agentes ativos: Head, FIRE, Advocate, Behavioral, Fact-Checker + Juridico-br/intl (temporarios)

### Scorecard de Notas (0-10)

| Avaliado | FIRE | Advocate | Behavioral | Fact-Checker | Media |
|---|---|---|---|---|---|
| Head | 5 | 5 | 6 | 5 | **5.25** |
| FIRE | — | 6 | 6 | 7 | **6.33** |
| Advocate | 7 | — | 7 | 6 | **6.67** |
| Behavioral | 5 | 4 | — | 5 | **4.67** |
| Fact-Checker | 6 | 6 | 5 | — | **5.67** |
| Diego | 9 | 9 | 8 | 9 | **8.75** |

**Ranking:** Diego (8.75) > Advocate (6.67) > FIRE (6.33) > Fact-Checker (5.67) > Head (5.25) > Behavioral (4.67)

**Consenso do time:** Diego foi o melhor jogador desta sessao — e nao deveria ter precisado ser. Diego detectou o sinal em PT-onelife ("parece bom demais pra ser verdade") e questionou VCMH 7% com dado real antes do sistema.

### Aprendizados Registrados

| # | Aprendizado | Agente(s) | Status |
|---|---|---|---|
| L-01 | Fact-Checker mandatorio na GERACAO em 3 gatilhos: (a) legislacao citada, (b) claim numerica sobre produto de terceiro, (c) identidade/estrutura corporativa | Fact-Checker + Head | Implementado em perfis |
| L-02 | Behavioral pre-requisito antes de qualquer analise em issue com sugestao externa (socio/assessor/amigo) | Behavioral + Head | Implementado em perfis |
| L-03 | FIRE: toda premissa nova passa por sensibilidade ±30% antes de ser adotada como central | FIRE | Implementado em perfil |
| L-04 | Scripts MC: PREMISSAS_SOURCE header + alinhamento com carteira.md | FIRE | Implementado em perfil |
| L-05 | Claims refutados por stress-test recebem [REFUTADO — ver stress-test] inline. Condicao de encerramento de issue | Head + Advocate | Implementado em perfis e PT-onelife |
| L-06 | Advocate: gate escalado para pre-analise em propostas externas. Fact-Checker verifica fatos ANTES do Advocate stress-testar | Advocate | Implementado em perfil |
| L-07 | Estrutural: sistema nao pode depender de Diego como ultima linha de defesa. L-01+L-02+L-06 fecham essa dependencia | Head | Implementado |

### Scoring Retroativo de Calibracao

| Decisao | Premissa central | Certeza declarada | Resultado | Calibracao |
|---|---|---|---|---|
| HD-006: piso 6.0%, equity 79% | Breakeven all-in ~5.5% | Alta | Mantida — taxa acima de 6% | OK |
| FR-003: P(FIRE) = 91% | R$250k flat sem spending smile | Alta | Errado — P real = 80.8% | Superestimada |
| PT-onelife v1: marginal/positivo | Opacidade + Lombard 2-3% + isencao total | Media | Errado — 4 pilares frageis | Superestimada |
| XX-casamento P casal 65.4% | Premissas baixa confianca (explicitadas) | Baixa | Premissas nao validadas ainda | OK (honesta) |

### Acoes Pendentes (a verificar na proxima retro)

- [ ] FIRE: implementar PREMISSAS_SOURCE nos scripts existentes (dados/)
- [ ] FIRE: alinhar guardrails dos scripts com carteira.md (pisos por idade nao aprovados)
- [ ] Behavioral: propor ao Head protocolo formal de monitoramento do backlog para sugestoes externas
- [ ] Head: verificar se ha outras issues no board com claims de terceiros sem Fact-Check na geracao

---

## Retro 2026-03-20 (Fundacao)

> Retro de fundacao — 3 sessoes. Scorecard nao existia.

### Erros principais registrados
- HODL11 classificado como risco Brasil 2x (Risco)
- IR sobre retorno real em vez de nominal (FIRE, RF)
- Breakeven IPCA+ com 4 versoes diferentes em sequencia (Head)
- 7 agentes criticaram "gap de execucao" sem dado real (sistema inteiro — Bookkeeper refutou)
- Advocate: sugeriu IPCA+ 12-22% sem analise liquida

### Acoes implementadas
- Checklist Pre-Veredicto (5 regras A-E)
- Bookkeeper como fonte de verdade obrigatoria antes de criticas sobre comportamento de Diego
- Behavioral delegado formalmente (delegacao do Head)

---
