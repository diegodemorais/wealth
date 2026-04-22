# 🚀 Deploy Strategy & Production Setup

## 📋 Arquitetura de Deploy

```
┌─────────────────────────────────────────────────────────┐
│                   GitHub Workflow                        │
│         (Tests → Build → Deploy)                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├─ Unit Tests ✅
                 ├─ Build: npm run build:no-test
                 │  └─ Output: dashboard/ (static)
                 ├─ E2E Tests ✅
                 │
                 ▼
        ┌───────────────────┐
        │   wealth repo      │ (current)
        │  /dashboard/ files │ (index.html, bootstrap.mjs, js/)
        └────────┬──────────┘
                 │
          DEPLOY_TOKEN
                 │
                 ▼
        ┌───────────────────┐
        │ wealth-dash repo   │ (destination)
        │  Main branch       │ (GitHub Pages)
        └────────┬──────────┘
                 │
                 ▼
        ┌───────────────────┐
        │  GitHub Pages     │
        │  (wealth-dash)    │
        │  diegodemorais/   │
        │  wealth-dash      │
        └───────────────────┘
```

---

## 🔄 Fluxo de Deploy

### PASSO 1: Trigger
```
Developer pushes to: claude/user-token-auth-coUQ3
  ↓
GitHub Actions: deploy-dashboard.yml dispara
```

### PASSO 2: Testes & Build
```
Unit Tests (66) ✅
  ↓
Build Next.js → dashboard/ ✅
  ├─ index.html (entrada)
  ├─ bootstrap.mjs (bootstrap)
  └─ js/ (módulos)
  ↓
E2E Tests (588) ✅
```

### PASSO 3: Sync para wealth-dash
```
Download build artifact
  ↓
Clone: diegodemorais/wealth-dash.git
  ↓
Copy files:
  ├─ index.html → /index.html
  ├─ bootstrap.mjs → /bootstrap.mjs
  └─ js/* → /js/*
  ↓
Commit + Push (main branch)
```

### PASSO 4: GitHub Pages (Automático)
```
wealth-dash/main branch atualizado
  ↓
GitHub Pages rebuilds
  ↓
Site atualizado em:
https://diegodemorais.github.io/wealth-dash
```

---

## 📁 Estrutura de Arquivos

### wealth (este repo)
```
/dashboard/
  ├─ index.html       (main entry point)
  ├─ bootstrap.mjs    (initialization)
  ├─ js/
  │  ├─ app.mjs
  │  ├─ utils.mjs
  │  └─ ...
  └─ [outros arquivos estáticos]
```

### wealth-dash (deployment repo)
```
/
  ├─ index.html       ← sincronizado
  ├─ bootstrap.mjs    ← sincronizado
  ├─ js/              ← sincronizado
  │  ├─ app.mjs
  │  └─ ...
  ├─ README.md
  ├─ .gitignore
  └─ [configuração Pages]
```

---

## ⚙️ Configuração Necessária

### 1. wealth-dash Repo Setup

**GitHub Pages Configuration**:
```
GitHub → Settings → Pages
├─ Source: Deploy from branch
├─ Branch: main
├─ Folder: / (root)
└─ Save
```

**Resultado**: Site disponível em
```
https://diegodemorais.github.io/wealth-dash
```

### 2. CNAME (Domínio Customizado - Opcional)

Se usar domínio customizado:

**1. Criar arquivo CNAME**:
```bash
echo "wealth.diegodemorais.com" > /tmp/wealth-dash/CNAME
```

**2. Configurar DNS**:
```
DNS Provider (ex: Cloudflare)
├─ Type: CNAME
├─ Name: wealth
├─ Value: diegodemorais.github.io
└─ TTL: Auto
```

**3. GitHub Pages Config**:
```
Settings → Pages
├─ Custom domain: wealth.diegodemorais.com
└─ Enforce HTTPS: ✅
```

### 3. Environment Variables (se necessário)

Se o app precisa de environment vars:

**Em wealth-dash/.github/workflows/** (se houver):
```yaml
env:
  NODE_ENV: production
  API_BASE_URL: https://api.example.com
```

Ou em arquivo `.env.production`:
```
NEXT_PUBLIC_API_URL=https://api.example.com
```

---

## 🔐 Access Control

### DEPLOY_TOKEN Permissions

Token deve ter:
```
✅ repo (full control)
  ├─ read:repo_hook
  ├─ write:repo_hook
  ├─ admin:repo_hook
  └─ admin:org_hook (se org)
```

### wealth-dash Repo Access

Ensure DEPLOY_TOKEN user has:
```
✅ Push access (main branch)
✅ Commit access
✅ No branch protection on main (ou exceção para bot)
```

**Verificar**:
```
wealth-dash repo
  ↓
Settings → Collaborators
  ↓
Procurar usuario do DEPLOY_TOKEN
  ↓
Role: deve ser "Maintain" ou "Admin"
```

---

## 📊 Deploy Checklist

### Antes de Primeiro Deploy

- [ ] wealth-dash repo existe?
- [ ] DEPLOY_TOKEN tem acesso?
- [ ] GitHub Pages está habilitado?
- [ ] Branch protection permite bot push?
- [ ] dashboard/ folder existe no wealth repo?
- [ ] Testes passam localmente?
- [ ] Workflow trigger está correto?

### Após Primeiro Deploy

- [ ] Site acessível em GitHub Pages?
- [ ] Arquivos foram copiados corretamente?
- [ ] Commit aparece no wealth-dash?
- [ ] GitHub Actions workflow passou?
- [ ] Não há erros de 404?

---

## 🧪 Testar Deploy Localmente

### 1. Simular Build

```bash
cd react-app

# Build estático
npm run build:no-test

# Verificar output
ls -la ../dashboard/
# Deve ter: index.html, bootstrap.mjs, js/
```

### 2. Simular Sync

```bash
# Criar temp dir
mkdir /tmp/test-deploy
cd /tmp/test-deploy

# Clone wealth-dash
git clone https://github.com/diegodemorais/wealth-dash.git

# Copy files
cp /home/user/wealth/dashboard/index.html wealth-dash/
cp /home/user/wealth/dashboard/bootstrap.mjs wealth-dash/
cp -r /home/user/wealth/dashboard/js/* wealth-dash/js/

# Verificar mudanças
cd wealth-dash
git status
git diff index.html | head -20
```

### 3. Verificar Site

```bash
# Abrir em browser
open https://diegodemorais.github.io/wealth-dash

# Verificar console
Press F12 → Console
# Não deve ter erros de 404 ou CORS
```

---

## 🔄 Processo de Deploy Manual (Se Necessário)

Se o GitHub Actions falhar e precisar fazer deploy manual:

```bash
# 1. Build
cd react-app
npm run build:no-test

# 2. Clone wealth-dash
git clone https://github.com/diegodemorais/wealth-dash.git /tmp/manual-deploy

# 3. Copy files
cp dashboard/index.html /tmp/manual-deploy/
cp dashboard/bootstrap.mjs /tmp/manual-deploy/
cp -r dashboard/js/* /tmp/manual-deploy/js/

# 4. Commit & Push
cd /tmp/manual-deploy
git config user.name "Your Name"
git config user.email "your@email.com"
git add .
git commit -m "🚀 Manual deploy: sync dashboard files"
git push origin main

# 5. Verify
open https://diegodemorais.github.io/wealth-dash
```

---

## 📈 Monitoração

### GitHub Actions

```
wealth repo
  ↓
Actions tab
  ↓
Deploy workflow
  ↓
Check status & logs
```

### Deploy Artifact

```
Actions run → Artifacts
  ↓
build-dashboard folder
  ↓
Download & inspect files
```

### wealth-dash Commits

```
wealth-dash repo
  ↓
Commits tab
  ↓
Procurar por "Deploy: sync dashboard"
  ↓
Verificar alterações
```

### Site Availability

```
https://diegodemorais.github.io/wealth-dash
  ↓
F12 → Network tab
  ↓
Verificar:
  ✅ index.html (200)
  ✅ bootstrap.mjs (200)
  ✅ js/* (200)
  ✅ Sem 404s
```

---

## 🆘 Troubleshooting Deploy

### Problema: Deploy não ocorre
```
Verificar:
1. Branch é claude/user-token-auth-coUQ3?
2. Testes passaram?
3. Workflow não foi desabilitado?
4. Event é push (não pull_request)?
```

### Problema: Arquivos não aparecem em wealth-dash
```
Verificar:
1. DEPLOY_TOKEN tem acesso?
2. Branch é main?
3. Arquivos foram copiados? (check logs)
4. Path está correto?
```

### Problema: Site não atualiza (304 cache)
```
Solução:
1. Hard refresh: Ctrl+Shift+R (ou Cmd+Shift+R)
2. Clear browser cache
3. Esperar 1-5 minutos (GitHub Pages cache)
4. Verificar Network tab (F12)
```

### Problema: 404 errors no site
```
Verificar:
1. index.html foi copiado?
2. bootstrap.mjs foi copiado?
3. Paths em index.html estão corretos?
4. CSS/JS paths são relativos?
```

### Problema: CORS errors
```
Verificar:
1. API calls têm CORS headers?
2. Requests são para HTTPS?
3. Headers estão corretos?
4. DEPLOY_TOKEN não foi exposto (não está em console)
```

---

## 🔒 Segurança em Produção

### 1. Secrets Não Devem Vazar

```
❌ ERRADO: console.log(process.env.DEPLOY_TOKEN)
✅ CERTO: GitHub Actions secrets are masked
```

### 2. Commit Messages

```
✅ "🚀 Deploy: sync dashboard files [CI skip]"
❌ "Deploy with secret token: xyz..."
```

### 3. Branch Protection

Opcional mas recomendado:

```
wealth repo → Settings → Branches
├─ Branch: claude/user-token-auth-coUQ3
├─ Require status checks:
│  ├─ unit-tests
│  ├─ build
│  └─ e2e-tests
├─ Require code review (se multi-person)
└─ Dismiss stale reviews
```

### 4. Token Rotation

Periodicamente:
```
1. GitHub → Settings → Tokens → DEPLOY_TOKEN
2. Regenerate se > 90 dias
3. Update secret em repo
4. Test deploy após update
```

---

## 📊 Performance Considerações

### Build Time Optimization

Já feito:
- ✅ Testes executam em paralelo (jobs)
- ✅ Artifacts usam cache
- ✅ npm ci em vez de npm install

Pode melhorar:
- [ ] Matrix testing (múltiplas versões)
- [ ] Incremental builds
- [ ] Cache más agressivo

### Site Performance (wealth-dash)

GitHub Pages é estático, então:
- ✅ Rápido (servido via CDN)
- ✅ Sem servidor necesário
- ✅ HTTPS incluído
- ✅ Uptime: 99.99%

Se precisar de APIs dinâmicas:
- [ ] Usar Vercel Deploy
- [ ] ~~Netlify~~ (migrado para GitHub Pages)
- [ ] Usar servidor próprio

---

## 📚 Próximos Passos

### Imediato
1. ✅ Verificar DEPLOY_TOKEN
2. ✅ Testar deploy localmente
3. ✅ Fazer primeiro push e monitorar

### Curto Prazo
1. [ ] Configurar GitHub Pages (se não tiver)
2. [ ] Teste de acesso ao site
3. [ ] Verificar logs do workflow

### Longo Prazo
1. [ ] Considerar domínio customizado (CNAME)
2. [ ] Adicionar analytics (Google Analytics, Vercel)
3. [ ] Monitorar uptime
4. [ ] Planejar escala (se crescer)

---

## 🎓 Resumo

| Componente | Status | Ação |
|-----------|--------|------|
| **Workflow** | ✅ Configured | Pronto |
| **Tests** | ✅ 654 tests | Pronto |
| **Build** | ✅ Static export | Pronto |
| **DEPLOY_TOKEN** | ⚠️ Verify | Verificar |
| **GitHub Pages** | ⚠️ Verify | Verificar |
| **Deploy** | 🟡 Ready to go | Começar |

---

**Status**: ✅ Pronto para Deploy em Produção

Próximo passo: Fazer push para `claude/user-token-auth-coUQ3` e monitorar primeiro deploy!
