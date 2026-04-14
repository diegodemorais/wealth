# 🚀 Development Workflow

## Fluxo de Desenvolvimento

```
Desenvolver → Testar Localmente → Commit → Push → Build & Deploy
```

---

## 1️⃣ Desenvolver Localmente

```bash
cd react-app
npm run dev    # Start dev server (localhost:3000)
```

---

## 2️⃣ Testar Localmente (ANTES de fazer commit)

### Unit Tests
```bash
npm run test:ci       # Run all unit tests
npm run test:watch    # Watch mode during development
npm run test:ui       # Vitest UI
```

### E2E Tests
```bash
npm run cypress:open   # Interactive UI (melhor para debugging)
npm run cypress:run    # Headless mode
```

**Se algum teste falhar → Corrige o código → Testa novamente**

---

## 3️⃣ Commit & Push (após testes passarem)

```bash
git add .
git commit -m "feat: descrição da mudança"
git push -u origin main
```

---

## 4️⃣ GitHub Actions (Automático)

Quando você faz push, o workflow executa:

```
Build (npm run build:no-test)  ~30s
   ↓
Deploy (sync to wealth-dash)   ~10s
   ↓
Notification (status)          ~5s
   ↓
GitHub Pages Live              ~2-3 min

Total: 4-5 minutos
```

---

## 📊 Version Badge

Cada build recebe uma versão automática:

```
v0.1.0+{buildNumber}
```

Exibido no header da aplicação.

---

## 🔄 Status do Deployment

Acompanhe em: https://github.com/diegodemorais/wealth/actions

---

## ⚠️ Importante

- **Testes rodamAQUI (localmente), não lá no CI**
- Nunca push sem passar nos testes
- Se CI falhar, significa build/deploy falhou, não testes
- E2E tests também rodam no CI como validação final

---

## 📝 Comandos Rápidos

| Comando | Função |
|---------|--------|
| `npm run test:ci` | Todos unit tests (antes de commit) |
| `npm run test:watch` | Watch mode |
| `npm run cypress:open` | E2E interativo |
| `npm run cypress:run` | E2E headless |
| `npm run dev` | Dev server |
| `npm run build:no-test` | Build production |

---

## 🎯 Pipeline Simplificado

**Sem testes no CI** = Deploy **3x mais rápido** ⚡

Você controla a qualidade localmente. GitHub Actions só builda e deploya.
