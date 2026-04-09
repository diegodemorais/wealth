# HD-plataforma-wm: Explorar plataforma de wealth management como produto

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-plataforma-wm |
| **Dono** | Head |
| **Status** | Discovery |
| **Prioridade** | Baixa |
| **Participantes** | Head (lead), todos os agentes |
| **Co-sponsor** | — |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Conversa — Diego perguntou se o sistema tem potencial como produto |
| **Concluido em** | — |

---

## Motivo / Gatilho

Após 90+ issues resolvidas, 13 agentes, 22 commands, e scan de 21 repos open-source, o sistema de wealth management de Diego é mais sofisticado que qualquer alternativa open-source existente. Zero concorrentes combinam AI agents + FIRE planning + behavioral guardrails + factor investing evidence-based + compliance tributário BR.

---

## Descricao

Explorar se o sistema atual tem potencial como produto — open-source template, dashboard, ou plataforma SaaS. Definir MVP, escopo, e validação de mercado.

---

## Diferenciais identificados

| Diferencial | Vs mercado |
|-------------|-----------|
| Multi-agent com debate estruturado (julgamentos independentes, advocate, fact-checker) | AI Hedge Fund/FinRobot votam ou agregam |
| Behavioral stewardship (detecção de viés, intervenção proativa) | Ninguém tem |
| FIRE-specific (MC, spending smile, withdrawal strategies, bond tent) | Ghostfolio/Maybe só trackam |
| Brasil-ready (Lei 14.754, IPCA+, INSS, VCMH, ANS, PTAX) | Todos são US-centric |
| Evidence-based (literature bilateral, falsificação, papers peer-reviewed) | Robo-advisors são black-box |

## Possíveis formatos (do mais simples ao mais complexo)

### Nível 1 — Open-source template
- Publicar repo `wealth` como template para investidores FIRE usarem no Claude Code
- Esforço: documentação + generalização de premissas (remover dados pessoais Diego)
- Tempo: dias

### Nível 2 — Streamlit dashboard
- Interface web mínima sobre scripts Python existentes (MC, snapshot, rebalance, relatório)
- Single-user, local-first
- Esforço: frontend Streamlit + integração com scripts
- Tempo: 1-2 semanas

### Nível 3 — SaaS multi-user
- Plataforma completa: auth, banco, onboarding wizard, multi-user
- Requer: frontend (React), backend (FastAPI), banco (Postgres), deploy (cloud)
- Compliance: disclaimers CVM, não-recomendação
- Esforço: meses. Requer validação de mercado antes

## O que temos vs o que falta

| Camada | Status | Detalhe |
|--------|--------|---------|
| Lógica/inteligência | 90% | Generalizar premissas (não hardcoded) |
| Dados | 70% | API keys, IBKR import, multi-user |
| Interface | 0% | Frontend web/mobile |
| Persistência | 30% | Markdown → banco de dados |
| Auth/multi-user | 0% | Perfil por usuário |
| Onboarding | 0% | Wizard para capturar perfil |
| Compliance | 0% | Disclaimers, CVM |

---

## Critério para sair de Discovery

Diego decide avançar. Sugestão: após concluir as issues operacionais do backlog (quantstats, ibkr-import, commands), revisitar com mais clareza sobre o que generalizar.

---

## Bloqueador Impeditivo (2026-04-09)

**Custo deve ser zero.** Qualquer nível de monetização (hosting, API keys, infra) é bloqueador. Antes de avançar além de Discovery, validar que o modelo é viável sem custo operacional. Nível 1 (open-source template, zero hosting) é o único caminho imediato viável. Níveis 2 e 3 ficam congelados até resolver bloqueador de custo.
