# Prompt para QA — Desenho de Plano de Testes Completo

**Contexto:** Auditoria real identificou 5 padrões de erro recorrentes e 3 fontes de verdade divergentes. Plano de testes anterior era superficial. Agora precisa de análise profunda e redesenho da estratégia.

**Referência:** `agentes/referencia/plano-testes-auditoria-real.md` (443 linhas com achados reais)

---

## Tarefa para o QA

Usando a auditoria como base, **desenhe um plano de testes executável** que:

1. **Mapeie a Arquitetura Real**
   - Trace o fluxo de dados: carteira.md → config.py → generate_data.py → data.json → React
   - Identifique todos os pontos de falha (schema mismatches, type errors, dados faltando)
   - Documente quais componentes dependem de quais campos em data.json
   - Exemplo: `PerformanceSummary.tsx` espera `annual_returns[].alpha_vs_vwra` — o que acontece se faltar?

2. **Defina Testes para os 5 Padrões de Erro Identificados**
   - Schema Mismatch (spec.json ↔ config.ts ↔ pages)
   - Gráficos não renderizam (15ª reincidência)
   - TWR pipeline (P1/P3/P4)
   - Privacy edge cases (ordem de grandeza)
   - Data binding (componentes com campos faltando)

   Para cada padrão:
   - [ ] Qual é o teste específico?
   - [ ] Em qual arquivo roda (Python/React/E2E)?
   - [ ] Quando deve rodar (pré-commit/build/push)?
   - [ ] O que bloqueia se falhar?

3. **Criticidade vs Cobertura**
   - Identificar top 5–10 testes que teriam **prevenido erros reais** das últimas 2 semanas
   - Exemplo: "Teste de schema sync teria pego DEV-schema-sync em 5 min"
   - Priorizar por ROI (máxima prevenção com mínimo effort)

4. **Ciclo de Execução (Local, não CI/CD)**
   - Definir comando local: `npm run test:pre-commit` (30–60s, bloqueante)
   - Integração com `npm run build` (garante código testado)
   - Teste específico de Python quando toucar reconstruct_history.py, generate_data.py
   - Teste específico de React quando adicionar componente novo

5. **Estrutura de Dados para Testes**
   - Quais fixtures (dados mock) são necessários?
   - Dados completos (data.json real) vs sintéticos (mini dataset)?
   - Como validar que fixture está atualizada quando schema muda?

6. **Validação Arquitetural (CLAUDE.md Compliance)**
   - "Zero hardcoded" — validar componentes
   - "Dados em tempo real: CLI primeiro" — validar que dados vêm de reconstruct_history, não mocks
   - "Quant valida mudanças" — teste de reconciliação numérica (Python ↔ React)
   - "Privacy obrigatório" — verificar que valores sensíveis usam fmtPrivacy

7. **Cobertura por Módulo**
   - `scripts/reconstruct_history.py`: % esperado, testes por função (TWR, aggregation, IPCA lookup)
   - `scripts/generate_data.py`: % esperado, testes de enriquecimento + schema
   - `react-app/src/components/dashboard/PerformanceSummary.tsx`: render + data binding
   - `react-app/src/config/dashboard.config.ts`: sincronização com spec.json + pages
   - Dados: schema validation, completeness, ranges sanity

8. **Problemas Conhecidos a Resolver**
   - 3 bugs TWR ainda abertos (P1/P3/P4 não testados)
   - Chart.js 4 breakage (getPixelForIndex removido)
   - TypeScript com filtros de "known errors" (remover?)
   - Testes legados com `any` implícito

9. **Checklist para Novo Código**
   - Quando dev toca em reconstruct_history.py: quais testes rodam?
   - Quando dev toca em PerformanceSummary.tsx: quais testes rodam?
   - Quando dev toca em dashboard.config.ts: como validar que não quebra spec.json + pages?
   - Quando dev toca em generate_data.py: como validar schema?

10. **Implementação Prática**
    - Não escrever código ainda (só plano)
    - Listar em ordem: qual teste implementar primeiro para máximo ROI?
    - Estimativa: horas para cada teste
    - Dependências (qual teste precisa de qual fixture?)

---

## Constraints

- **Local builds, sem CI/CD remoto:** Testes rodam na máquina do dev antes de commit/push
- **GitHub Pages recebe APENAS código testado:** Deployment é rápido (sem overhead de CI)
- **Sem mudança de arquitetura:** Plano trabalha com arquivos existentes (carteira.md, config.py, generate_data.py, etc.)
- **Sem mocks quando dados reais disponíveis:** Usar data.json real para testes de integração

---

## Formato de Entrega

Documento estruturado com:
- [ ] Seção I: Mapeamento Arquitetural (fluxo de dados + pontos de falha)
- [ ] Seção II: 5 Testes Críticos (um por padrão de erro)
- [ ] Seção III: Cobertura por Módulo (% target, testes por função)
- [ ] Seção IV: Ciclo de Execução (pré-commit, build, push)
- [ ] Seção V: Checklist para Novo Código (quando quais testes rodam)
- [ ] Seção VI: Roadmap de Implementação (ordem + estimativa)
- [ ] Apêndice: Fixtures Necessários + Dados Mock

**Tamanho esperado:** 500–800 linhas (mais específico, menos genérico que v1)

---

## Context Que Pode Usar

- Audit document: `agentes/referencia/plano-testes-auditoria-real.md`
- Issues: `agentes/issues/DEV-charts-render-2026-04-13.md`, `DEV-schema-sync.md`, `DEV-twr-pipeline-fixes.md`
- Commits: últimos 30 (git log --oneline -30)
- Arquivos críticos: carteira.md, config.py, generate_data.py, reconstruct_history.py, data.json, dashboard.config.ts

**NÃO é tarefa de implementação.** É design/planejamento. Foco no QUÊ testar, não como (ainda).

