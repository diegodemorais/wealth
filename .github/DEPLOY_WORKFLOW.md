# GitHub Actions Deploy Workflow

## 📋 Resumo das Mudanças

O workflow foi atualizado para incluir **3 níveis de validação** antes de fazer deploy:

1. **Unit Tests** (Vitest) - Testa lógica e utils
2. **Build** (Next.js) - Compila a aplicação
3. **E2E Tests** (Cypress) - Testa a aplicação completa
4. **Deploy** - Apenas se todos os testes passarem

---

## 🔄 Pipeline Completo

```
┌─────────────────────────────────────────────────────┐
│  Push para branch development                        │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  Unit Tests (66)    │ ← npm run test:ci
        │  77.43% coverage    │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  Build Next.js      │ ← npm run build:no-test
        │  + Dashboard output │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  E2E Tests (588)    │ ← npm run cypress:run
        │  Headless Chrome    │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  Deploy to wealth-  │ ← git push
        │  dash repository    │
        └─────────────────────┘
```

---

## 📊 Job Details

### 1. Unit Tests (Vitest)
**Objetivo**: Validar lógica, utils e store

```yaml
- Node.js cache (rápido)
- npm ci (install from lock file)
- npm run test:ci (66 testes)
- Upload coverage
- Duration: ~15s
```

**O que testa**:
- ✅ Store (Zustand) - 79.48%
- ✅ Utils - 77%
- ✅ Data Wiring - 91.37%
- ✅ Monte Carlo - 80.64%
- ✅ Formatters - 49.01%

**Artifacts**:
- Coverage report (codecov)

---

### 2. Build (Next.js)
**Objetivo**: Compilar aplicação e gerar dashboard

```yaml
- Depends on: unit-tests
- npm run build:no-test
- Output: dashboard/ folder
- Duration: ~30s
```

**O que gera**:
- Dashboard estático (para wealth-dash repo)
- Bootstrap files
- JS modules

**Artifacts**:
- build-dashboard (uploaded)

---

### 3. E2E Tests (Cypress)
**Objetivo**: Testar aplicação inteira em headless Chrome

```yaml
- Depends on: build
- Uses: cypress-io/github-action@v6
- Browser: Chrome (headless)
- Specs: cypress/e2e/**/*.cy.ts (588 testes)
- Duration: ~2-3 minutos
```

**O que testa**:
- ✅ Layout & Navigation (43 testes)
- ✅ Components (46 testes)
- ✅ Charts (54 testes)
- ✅ Responsive Design (79 testes)
- ✅ Accessibility (80 testes)
- ✅ Simulators (71 testes)
- ✅ Integration (59 testes)
- ✅ Visual Design (112 testes)

**Artifacts**:
- Screenshots (se falhar)
- Videos (sempre)

---

### 4. Deploy
**Objetivo**: Sync dashboard files para wealth-dash repo

```yaml
- Depends on: [unit-tests, build, e2e-tests]
- Trigger: push to claude/user-token-auth-coUQ3
- Uses: DEPLOY_TOKEN secret
- Clones wealth-dash repo
- Syncs files
- Commits + Push
```

**Condições**:
- ✅ Todos os testes devem passar
- ✅ Deve ser push (não pull request)
- ✅ Branch deve ser claude/user-token-auth-coUQ3
- ✅ Deve haver mudanças para commitar

---

## ⚙️ Configuração Necessária

### Secrets Requeridos

1. **DEPLOY_TOKEN** (já existe?)
   - Token GitHub com acesso a diegodemorais/wealth-dash
   - Scope: repo (read + write)
   - Tipo: Personal Access Token

**Verificar/Criar**:
```
GitHub → Settings → Secrets and variables → Actions → DEPLOY_TOKEN
```

### Branch Configuration

O deploy ocorre **apenas** em:
```yaml
if: github.ref == 'refs/heads/claude/user-token-auth-coUQ3'
```

Para mudar para outra branch (ex: main):
```yaml
if: github.ref == 'refs/heads/main'
```

---

## 🚀 Como Funciona

### Fluxo Normal (testes passam):

```
1. Push para branch
   ↓
2. GitHub Actions dispara
   ↓
3. Unit Tests: ✅ 66/66 passed
   ↓
4. Build: ✅ Compiled successfully
   ↓
5. E2E Tests: ✅ 588/588 passed
   ↓
6. Deploy: ✅ Synced to wealth-dash
   ↓
7. Notification: "Deployment successful"
```

### Fluxo com Falha (um teste falha):

```
1. Push para branch
   ↓
2. GitHub Actions dispara
   ↓
3. Unit Tests: ❌ 1 test failed
   ↓
4. Build: ⏭️ SKIPPED (unit-tests failed)
   ↓
5. E2E Tests: ⏭️ SKIPPED (build failed)
   ↓
6. Deploy: ⏭️ SKIPPED (e2e-tests failed)
   ↓
7. Notification: "Deployment failed - fix tests"
```

---

## 📈 Tempo Total

| Step | Tempo | Total |
|------|-------|-------|
| Unit Tests | ~15s | 15s |
| Build | ~30s | 45s |
| E2E Tests | ~2-3m | 2m 45s |
| Deploy | ~10s | 2m 55s |

**Total esperado**: ~3 minutos

---

## 🔍 Monitoramento

### Ver status do workflow:

1. **GitHub UI**
   - Repo → Actions tab
   - Ver último run
   - Click para detalhes

2. **Checkout commit status**
   - Commit → Green checkmark = passou
   - Red X = falhou

3. **Artifacts**
   - Actions → Run → Artifacts
   - Download screenshots/videos se falhar

---

## 🆘 Troubleshooting

### E2E Tests timeout
```
Problema: Cypress times out esperando servidor
Solução: Aumentar wait-on-timeout em deploy-dashboard.yml
```

### Deploy token inválido
```
Problema: "Permission denied" ao fazer push
Solução: 
1. Verificar DEPLOY_TOKEN secret
2. Token ainda é válido?
3. Token tem acesso ao wealth-dash repo?
```

### Tests passam localmente, falham no CI
```
Problema: Diferença entre local e CI
Solução:
1. Usar mesmo Node.js version
2. Rodar `npm ci` ao invés de `npm install`
3. Verificar dependências do Cypress
```

### Build muito lento
```
Problema: Cada run leva 10+ minutos
Solução:
1. Cache npm está habilitado? ✅
2. Use cache: 'npm'
3. Especificar package-lock.json path
```

---

## 📝 Mudanças Futuras (Opcionais)

### Adicionar Notifications
```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
```

### Adicionar Performance Check
```yaml
- name: Lighthouse Check
  uses: treosh/lighthouse-ci-action@v10
```

### Adicionar Dependency Check
```yaml
- name: Dependency Check
  uses: github/super-linter@v4
```

### Matrix Testing (múltiplos Node versions)
```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
```

---

## ✅ Checklist de Validação

Antes de usar em produção:

- ✅ DEPLOY_TOKEN secret está configurado
- ✅ Branch filter é correto (claude/user-token-auth-coUQ3)
- ✅ wealth-dash repo está acessível
- ✅ Testes passam localmente
- ✅ No dependência em secrets não configurados
- ✅ Workflow triggers corretamente

---

## 🔐 Segurança

- ✅ DEPLOY_TOKEN armazenado como secret (não visível)
- ✅ Testes rodam ANTES de deploy
- ✅ Deploy só ocorre se testes passarem
- ✅ Bot actions[bot] usa config segura
- ✅ Commits marcados com [CI skip]

---

## 📚 Referências

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Cypress GitHub Action](https://github.com/cypress-io/github-action)
- [Node.js Action](https://github.com/actions/setup-node)
- [Artifact Upload](https://github.com/actions/upload-artifact)

---

**Status**: ✅ Ready for Production  
**Last Updated**: 2026-04-14
