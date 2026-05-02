---
ID: HD-head-runbook
Titulo: Extrair runbook operacional do Head para agentes/referencia/head-runbook.md
Dono: Head + Dev
Prioridade: 🟢 Baixa (qualidade)
Dependências: DEV-perfis-overhaul (concluído 2026-05-01)
Origem: DEV-perfis-overhaul (overhaul de perfis identificou outlier de tamanho)
---

## Contexto

`agentes/perfis/00-head.md` ficou com 372 linhas após DEV-perfis-overhaul (range alvo: 80-180). O perfil tem manual operacional pesado misturado com mandato — extrair operacional reduz prompt size e clarifica papel.

## Escopo

Mover do perfil para `agentes/referencia/head-runbook.md`:
- Bloco "Abertura de Sessao — Top 3 Urgentes" (~40 linhas)
- Bloco "Planejamento Financeiro Pessoal" (~30 linhas) — pode ficar no perfil mas resumido
- Bloco "Checklist Pre-Veredicto" e Regras A-F (~70 linhas) — referência permanente, melhor isolado
- Bloco "Regra L-24 PROIBIDO Commit Antes de Mostrar Diego" (~30 linhas)
- Bloco "Regulas Operacionais de Retro" (~20 linhas)
- Mapa de relacionamento detalhado pode virar tabela compacta no perfil + detalhamento no runbook

## Critérios de aceite

- [ ] `agentes/referencia/head-runbook.md` criado com seções extraídas
- [ ] `agentes/perfis/00-head.md` reduzido para 150-180 linhas
- [ ] Cada seção movida tem link de retorno no perfil ("ver `head-runbook.md` § X")
- [ ] Nenhuma regra estrutural perdida (sycophancy, regra 6, regras A-F)
- [ ] Validação: leitura completa do perfil + runbook continua dando ao Head a mesma instrução operacional

## Não escopo

- Mudar regras (apenas reorganizar localização)
- Mexer em outros perfis (esse trabalho terminou em DEV-perfis-overhaul)

## Reportar

- Diff de tamanho ANTES/DEPOIS
- Lista do que foi para `head-runbook.md` vs o que ficou no perfil
- Sign-off do Head
