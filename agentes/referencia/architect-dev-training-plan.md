# Architect ← → Dev Training Plan

**Target**: Dev (React + Python build)  
**Duration**: 15 minutos  
**Trigger**: Antes da primeira PR após auditoria (2026-04-27)

---

## Sessão Estruturada (15 min)

### 1️⃣ Contexto — Por que Architect? (2 min)

**Mensagem-chave**: 
- Codebase complexo (9 engines financeiros, cross-domain)
- Riscos: hardcoding, duplicação, inconsistência em data
- Solução: 8-item checklist automático em pre-commit + PR review

**Referência**: `analysis/architect-audit-2026-04-27.md` (seção "Próximas Ações")

---

### 2️⃣ Os 9 Engines — Mapa Mental (3 min)

**Objetivo**: Dev entender "qual engine chamar" antes de código.

| Engine | Responsabilidade | Exemplo |
|--------|-----------------|---------|
| `pfire_transformer` | Canonicalizar P(FIRE) 0-1 ↔ % | `canonicalize_pfire(0.864, 'mc')` |
| `tax_engine` | Lei 14.754/2023, DARF, FIFO | Calcular IR estimado em simulação |
| `bond_pool_engine` | Sequência de saques (bond ladder) | Quando sacar Tesouro vs Ações |
| `swr_engine` | SWR por percentil + floor | Saque seguro por cenário |
| `guardrail_engine` | Dual P(FIRE) + drawdown | Trigger rebalance quando P<75% |
| `withdrawal_engine` | Spending strategy + rebalance | Quanto gastar este ano? |
| `data_pipeline_engine` | DAG (orquestração snapshots) | Gerar data.json |
| `validators` | Cross-field invariants | P10≤P50≤P90? patrimonio>500k? |
| `pfire_canonical.ts` | TypeScript equivalent (React) | Display P(FIRE) em componentes |

**Dúvida comum**: "Devo usar qual engine?"
- **Novo feature financeira?** → Grep em `scripts/` pelos engines → copia padrão existente
- **Bug em número?** → Primeiro: quale engine? → Fix lá → teste → propaga

---

### 3️⃣ Checklist Walkthrough — ✅ vs ❌ (8 min)

Mostrar lado-a-lado bom vs ruim:

#### ✅ **CORRETO** — PR que passa checklist

**Arquivo**: `scripts/new_withdrawal_fix.py`
```python
# ✅ Usa engine centralizado
from scripts.withdrawal_engine import WithdrawalEngine

engine = WithdrawalEngine(portfolio, guardrails)
annual_spend = engine.calculate_spending()
```

**Arquivo**: `scripts/config.py`
```python
# ✅ Constantes centralizadas (vindo de carteira_params.json)
EQUITY_PCT = _P.get("equity_pct", 0.79)
BOND_PCT = 0.21
```

**Arquivo**: `tests/test_withdrawal.py`
```python
# ✅ Mock com Source documentado
# Source: Historical withdrawal patterns 2020-2025
test_spending = [15000, 16000, 17500]
```

**Arquivo**: `react-app/components/Dashboard.tsx`
```typescript
// ✅ Cores importadas de theme
import { EC } from '@/utils/echarts-theme';
const color = EC.primary;

// ✅ Constantes importadas
import { EQUITY_WEIGHTS } from '@/config';
```

---

#### ❌ **INCORRETO** — PR que bloqueia em pre-commit

**Exemplos de violações**:
1. **Cálculo inline de P(FIRE)**: Conversão direta de decimal para percentual (BLOQUEADO por pre-commit grep)
2. **Constante hardcoded**: Valor tipo `0.50` direto no código (deveria estar em config.py)
3. **Lógica sem engine**: SWR calculado inline (deveria usar swr_engine.py)

**Feedback pre-commit** (exemplo de saída):
```
❌ ARCHITECT: Found inline conversion (* 100)
   Fix: Use canonicalize_pfire(decimal, source='mc') instead
   Reference: agentes/referencia/pr-checklist.md
   
⚠️  ARCHITECT: Found numeric hardcoding outside config.py
   Move constants to scripts/config.py
```

**O que Dev faz**:
1. Lê mensagem de erro acima
2. Corrige o código (move para engine/config.py)
3. Rodar `npm run test:pre-commit` localmente → verifica
4. Faz commit novamente

---

### 4️⃣ O Checklist em Ação — PR Prática (2 min)

**Cenário**: Dev abre PR com novo feature.

**Workflow**:
1. **Local Dev** (antes de push)
   ```bash
   git add .
   npm run test:pre-commit  # pre-commit hook roda
   # Se bloqueia → corrige + retry
   git commit -m "..."
   ```

2. **Push → GitHub**
   ```bash
   git push origin feature-branch
   ```

3. **PR Descrição** (Dev preenche)
   ```markdown
   ## Architectural Checklist
   - [x] Centralizations OK (usou withdrawal_engine)
   - [x] No hardcoding (constantes em config.py)
   - [x] P(FIRE) canonical (usou canonicalize_pfire)
   - [x] Data mock sourced (# Source: ___)
   - [x] Deletions audited (grep 0 refs)
   - [x] data.json valid (pytest validators)
   - [x] React clean (EC theme + imports)
   - [x] Tests pass (npm run test ✅)
   ```

4. **Code Review** (Architect + Head)
   - Lê checklist acima
   - Valida com grep/git log
   - Aprova ou pede changes

---

## Materiais Necessários (distribute antes)

1. **pr-checklist.md** — Reference rápida (1 página)
   - Arquivo: `agentes/referencia/pr-checklist.md`
   - Use na PR description

2. **architect-audit-2026-04-27.md** — Contexto completo
   - Seções principais:
     - "Os 9 Engines" (linhas 109-123)
     - "Checklist de PR" (linhas 238-279)

3. **Exemplos de código** (prepare 4 snippets)
   - ✅ OK: Tax calc (usa tax_engine)
   - ✅ OK: React component (EC theme)
   - ❌ Violação 1: Inline × 100
   - ❌ Violação 2: Hardcoded constante

4. **Pre-commit hook output** — Mostra mensagem de erro
   - Arquivo: `.git/hooks/pre-commit`
   - Teste com violação mock

---

## Session Checklist (para Architect)

Antes de executar sessão:

- [ ] Ler `pr-checklist.md` (1 min)
- [ ] Preparar 4 exemplos de código (boa prática + violações)
- [ ] Clonar 2 snapshots do pre-commit hook (um ok, um com violação)
- [ ] Ter aberto `agentes/referencia/pr-checklist.md` na tela durante demo
- [ ] Confirmar que Dev tem acesso a:
  - `agentes/referencia/pr-checklist.md`
  - `analysis/architect-audit-2026-04-27.md`
  - `.git/hooks/pre-commit` (leitura)

---

## Q&A — Respostas Rápidas

**P: E se eu não sou dev, sou designer/product?**  
R: Esse checklist é só para PRs que tocam código. Design/product não precisa.

**P: O que é "analytics"? Por que fica excluído?**  
R: Scripts em `scripts/fire_glide_path_scenarios.py` ou similares que geram relatórios descartáveis (não vão a data.json). Esses pode ter `* 100` em cálculo intermediário.

**P: Pre-commit hook bloqueou meu commit. Posso skippar com `--no-verify`?**  
R: Não recomendado. Resolve a violação em 2 min, é mais rápido. Se for algo legit (teste de error), aí sim usa `--no-verify`, mas documenta no commit.

**P: Por que 9 engines? Isso é muito?**  
R: Cada um soluciona um problema específico (tax, bonds, spending, etc). Uma mudança em qualquer um desses afeta decisões. Engine = "single source of truth" para que sub-domínio.

**P: Qual engine chamar se não tenho certeza?**  
R: Procura no codebase:
  ```bash
  grep -r "novo_conceito" scripts/ | grep -i "def\|class"
  ```
  Se não existe → cria novo? Não! Fala com Architect/Head primeiro.

---

## Timeline

| Fase | Ação | Estimativa |
|------|------|-----------|
| **Prep** | Distribuir materiais | 5 min |
| **Session** | Walkthrough (15 min acima) | 15 min |
| **Apply** | Dev abre 1ª PR com checklist | [when ready] |
| **Feedback** | Architect comenta em PR | 10 min |

---

## Success Criteria

Dev completou training quando:
1. ✅ Consegue identificar qual engine usar (verbal test: "Como faço saque seguro?")
2. ✅ Roda pre-commit hook localmente sem erros (demo)
3. ✅ Preenche checklist completo em 1ª PR
4. ✅ Pre-commit hook passa na 1ª tentativa (sem violations)

---

## Feedback Loop

Após 1ª PR auditada:
- Architect escreve comentário com learnings
- Se novo padrão de violação detectado → adiciona à exclusão no pre-commit
- Atualiza esse documento com insights

---

**Created**: 2026-04-27  
**Version**: 1.0  
**Owner**: Architect

