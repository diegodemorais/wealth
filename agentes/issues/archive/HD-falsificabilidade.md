# HD-falsificabilidade: Registrar condição de falsificabilidade em decisões de manter

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-falsificabilidade |
| **Dono** | Head |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Advocate, agentes de domínio relevantes |
| **Co-sponsor** | Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-04-01 |
| **Origem** | Carry-over — 3 retros consecutivas sem aplicação (2026-03-23, 2026-03-27, 2026-04-01) |
| **Concluido em** | — |

---

## Motivo / Gatilho

Carry-over originado na retro 2026-03-23: "toda sessão que terminar com 'sem mudanças': registrar condição de falsificabilidade." Permaneceu pendente em 2026-03-27 e 2026-04-01. Regra de escalação obrigatória ativada (2+ retros consecutivas = issue formal).

O problema: quando o time conclui com "manter estratégia", não registra o que evidência específica mudaria essa conclusão. Isso torna as decisões irrefalsificáveis — e por definição não são evidence-based.

---

## Descricao

Toda decisão de "manter" precisa de uma condição de falsificabilidade explícita: qual evidência concreta e coletável nos próximos 12-24 meses faria o time mudar ≥20% de posição?

Sem isso:
- A estratégia vira dogma (não pode ser refutada)
- O time não sabe o que monitorar
- A retro não tem como auditar se a premissa ainda vale

Isso já está parcialmente nas regras de issues (`issues-guide.md`: "teste de irrefalsificabilidade"), mas não está sendo aplicado sistematicamente em conversas e decisões de manter fora de issues formais.

---

## Escopo

- [ ] Definir formato mínimo de falsificabilidade para decisões de "manter" (1-2 linhas: "mudaríamos se X acontecesse")
- [ ] Decidir onde registrar: na memória do agente dono, no arquivo de gatilhos, ou no próprio arquivo de contexto
- [ ] Avaliar se deve ser checklist no template de retro ou regra nos perfis dos agentes
- [ ] Revisar as decisões "manter" mais recentes (FI-jpgl-redundancia, MA-equity-br, RK-gold-hedge) e adicionar condição retroativamente — ou definir que vale só para novas decisões
- [ ] Definir quem verifica e quando (SLA de auditoria — regra L-13)

---

## Raciocinio

**Alternativas rejeitadas:**
- Exigir falsificabilidade só em issues formais: issues já têm isso no template. O gap é em conversas e conclusões de retro.
- Ignorar: carry-over de 3 retros = impacto real. Sem falsificabilidade, o sistema acumula "manter" sem mecanismo de revisão.

**Argumento central:**
Uma decisão de manter sem condição de falsificabilidade é indistinguível de um viés de status quo disfarçado de estratégia. O custo de adicionar 1-2 linhas é zero; o benefício é ter critério claro de quando rever.

**Incerteza reconhecida:**
Pode ser burocracia desnecessária para decisões óbvias (ex: "manter SWRD porque é o core" — o que mudaria isso?). Precisa de formato leve para não travar o fluxo.

**Falsificação desta issue:**
Se após implementar, o time nunca usar as condições registradas para de fato revisar uma decisão em 12 meses, o mecanismo não funcionou e deve ser removido.

---

## Analise

> A preencher conforme a issue avanca.

---

## Conclusao

> A preencher ao finalizar.

### Veredicto Ponderado

| Agente | Peso | Posição | Contribuição |
|--------|------|---------|-------------|
| Head | 1x | — | — |
| Advocate | 3x | — | — |
| **Score ponderado** | | **—** | **—** |

---

## Resultado

> A preencher ao finalizar.

| Tipo | Detalhe |
|------|---------|
| **Estrategia** | — |
| **Conhecimento** | — |
| **Memoria** | — |

---

## Proximos Passos

- [ ] Advocate: propor formato mínimo de falsificabilidade (leve, 1-2 linhas)
- [ ] Head: decidir onde registrar e quem audita
