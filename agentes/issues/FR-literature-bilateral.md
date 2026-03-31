# FR-literature-bilateral: Regra de literatura bilateral para citacoes academicas

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-literature-bilateral |
| **Dono** | 04 FIRE |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 00 Head, 10 Advocate, 15 Fact-Checker |
| **Dependencias** | — |
| **Criado em** | 2026-03-27 |
| **Origem** | Retro 2026-03-27 — L-09 (falha em 2+ retros = issue obrigatoria) |
| **Concluido em** | 2026-03-31 |

---

## Motivo / Gatilho

FIRE citou ERN (Early Retirement Now) seletivamente em **duas retros consecutivas** (2026-03-20 e 2026-03-27), sempre no lado favoravel a equity alto, ignorando partes da mesma serie que recomendam buffer conservador. Conforme regra de escalacao do retro-dinamica.md: *"Falha que aparece em 2+ retros → acao obrigatoria."* A correcao (nota no perfil) nao foi suficiente — reincidencia confirmou isso.

---

## Descricao

O sistema nao tem regra formal que exija apresentar **ambos os lados da literatura** quando um paper ou serie academica e citada. FIRE (e potencialmente outros agentes) pode selecionar partes favoraveis e ignorar partes criticas, criando viés de confirmacao sistematico nas analises.

Exemplos concretos do periodo:
- ERN Part 19/43 (equity alto favoravel) citado; ERN Parts sobre buffer de 5 anos ignorados
- Blanchett (2013) spending smile: componente de saude favoravel ao FIRE Brasil nao problematizado ate Diego questionar

---

## Escopo

- [ ] Definir regra formal de "literatura bilateral" para citacoes academicas
- [ ] Identificar quais papers/series ja foram citados seletivamente no historico (ERN, Cederburg, Blanchett)
- [ ] Propor formato de citacao que exija: (a) argumento citado, (b) contra-argumento da mesma literatura
- [ ] Incorporar regra no Checklist Pre-Veredicto do Head (00-head.md)
- [ ] Incorporar regra no perfil do FIRE (04-fire.md)
- [ ] Verificar: Cederburg 2023 foi citado integralmente ou seletivamente?

---

## Raciocinio

**Argumento central:** Citacao seletiva de literatura e cherry-picking — forma de viés de confirmacao. A regra de "sempre apresentar ambos os lados" e mecanismo preventivo, nao critica ao agente. Sem essa regra, toda analise que termina com "manter" pode estar sustentada por selecao de evidencias.

**Incerteza reconhecida:** Pode ser que algumas citacoes seletivas sejam intencionais e justificadas (ex: citar apenas a parte relevante para a pergunta especifica). A regra nao deve inibir foco — deve exigir que o contra-argumento seja pelo menos reconhecido.

**Falsificacao:** Se a regra for implementada e FIRE continuar apresentando apenas o lado favoravel em 2+ citacoes na proxima retro, o perfil precisa ser reescrito (regra de escalacao: 3+ retros = revisao do agente).

---

## Analise (2026-03-31)

### Casos históricos de citação seletiva identificados

| Fonte | Como foi citada | O que foi ignorado | Retros afetadas |
|-------|----------------|-------------------|-----------------|
| ERN (Karsten), Part 19/43 | Equity alto suporta SWR — favorável ao 79% equity | Part 28: 5-year buffer recomendado; partes sobre SoRR e sequência adversa | 2026-03-20, 2026-03-27 (reincidência) |
| Blanchett (2013) spending smile | Gastos caem na slow-go — favorável ao custo de vida R$250k | Saúde no no-go reverte o smile; sem VCMH, componente de saúde explode | 2026-03-27 |
| VCMH 7% (IESS) | Premissa "conservadora" para inflação de saúde | Dado agregado, não curva individual; intervalo real 5-10%; Diego puxou sensibilidade, não o agente | 2026-03-27 |
| Cederburg et al. (2023) | 100% equity global domina TDFs em todo ciclo | Horizonte de 30+ anos; SSRN, não peer-reviewed; resultado sensível a horizonte | HD-equity-weight (Advocate participou — mais bilateral) |

### Padrão identificado

Cherry-pick assume duas formas:
1. **Omissão direta**: citar apenas partes favoráveis de uma série (ERN)
2. **Premissa-escudo**: aceitar premissa "conservadora" sem questionar (VCMH 7%, Blanchett health) — aparência de rigor que bloqueia o escrutínio

### Regra implementada

**Regra F: Literatura bilateral** adicionada em:
- `agentes/perfis/00-head.md` → Regras A-E adicionada F + item no Checklist Pre-Veredicto
- `agentes/perfis/04-fire.md` → Regra específica + tabela de contra-argumentos obrigatórios

Formato obrigatório:
```
📖 [Autor (ano)]
✅ Apoia: [argumento favorável]
⚠️ Qualifica/contra: [o que a mesma fonte diz em contrário]
📊 Literatura contrária: [ao menos 1 fonte alternativa]
```

Auditoria: Advocate verifica em toda retro (item fixo). Reincidência = escalação de perfil.

---

## Conclusao

Regra bilateral implementada nos perfis Head e FIRE. Casos históricos documentados. Formato de citação definido. Advocate como verificador em retros.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Estrategia** | Regra F: literatura bilateral obrigatória em toda citação acadêmica que suporta veredicto |
| **Conhecimento** | ERN/Blanchett/Cederburg: contra-argumentos mapeados e documentados no perfil FIRE |
| **Memoria** | Head (00), FIRE (04) |

---

## Proximos Passos

- [ ] Revisar citacoes de ERN no historico de issues (FR-003, FR-fire2040)
- [x] Revisar citacao de Cederburg em HD-equity-weight — qualificacao SSRN/horizonte adicionada, conclusao intacta
- [x] Propor regra ao Diego para aprovacao antes de incorporar nos perfis — aprovada ao fechar a issue
