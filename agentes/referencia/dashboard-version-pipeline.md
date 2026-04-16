# Dashboard Version Pipeline (External JSON Architecture)

## Visão Geral

A versão do dashboard é mantida em um arquivo JSON **externo** (`react-app/public/version.json`) que é carregado pelo React em runtime. O incremento de versão acontece **APÓS o deploy bem-sucedido**, não durante o build.

**Decisão arquitetural:** Desacoplamento entre compilação e versionamento.

## Pipeline Completo

```
┌─────────────────────────────────────────────────────────────┐
│ GitHub Push → react-app/**                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ JOB: Build Application       │
        │ ✓ npm run build:no-test      │
        │ ✓ Gera /dash/               │
        │ ✓ Sem tocar versão           │
        └──────────────┬───────────────┘
                       │
              ❌ Falha?├→ STOP (versão intacta ✓)
                       │
              ✅ Sucesso│
                       ▼
        ┌──────────────────────────────┐
        │ JOB: Deploy to Pages         │
        │ ✓ Faz upload de /dash/       │
        │ ✓ GitHub Pages recebe        │
        └──────────────┬───────────────┘
                       │
              ❌ Falha?├→ STOP (versão intacta ✓)
                       │
              ✅ Sucesso│
                       ▼
        ┌──────────────────────────────┐
        │ POST-DEPLOY: Increment       │
        │ ✓ node increment-version...  │
        │ ✓ Atualiza version.json      │
        │ ✓ Commit + Push              │
        └──────────────────────────────┘
```

## Arquivos Chave

### 1. `react-app/public/version.json`
```json
{
  "version": "0.1.172",
  "buildDate": "2026-04-16T13:15:34.912Z",
  "lastUpdate": "2026-04-16T13:15:34.912Z"
}
```

**Características:**
- Arquivo estático no public/
- Copiado para `/dash/` via post-build.js
- Carregado pelo React em runtime
- Incrementado APÓS deploy

### 2. `scripts/increment-version-external.js`
```javascript
// Lê version.json
// Incrementa patch (x.y.Z)
// Atualiza lastUpdate timestamp
// Escreve de volta
```

**Quando rodar:** Após deploy bem-sucedido (no workflow)

### 3. `.github/workflows/deploy-dashboard.yml`

**Job 1: Build**
```yaml
- npm run build:no-test  # sem increment
- Gera /dash/ com version.json atual
```

**Job 2: Deploy**
```yaml
- Deploy para GitHub Pages
- Após sucesso: increment-version-external.js
- Commit + Push do version.json atualizado
```

## Por que essa arquitetura?

### ✅ Problema Antigo (Build-time versioning)
```
Build gera /dash/ com versão X
Depois incrementa versão para X+1
MAS /dash/ já foi gerado com versão X
→ Site fica defasado até próximo build
```

### ✅ Solução Nova (Runtime versioning)
```
Build gera /dash/ com version.json (externo)
React carrega version.json via fetch
Deploy coloca /dash/ no ar
Post-deploy: incrementa version.json
Próxima visita: React já vê versão nova
→ Sem rebuild necessário
```

## Como Usar

### Build Local (desenvolvimento)
```bash
cd react-app
npm run build:no-test
# Gera /dash/ com versão atual de public/version.json
```

### Incrementar Versão Manualmente
```bash
node scripts/increment-version-external.js
# Incrementa version.json
# Use só se precisar forçar (normalmente workflow faz isso)
```

### Workflow Automático
- Push para main com mudanças em `react-app/`
- GitHub Actions:
  1. Faz build (sem tocar versão)
  2. Faz deploy
  3. Incrementa version.json
  4. Commit + Push automático

## Garantias de Segurança

| Cenário | Resultado |
|---------|-----------|
| Build falha | Versão NÃO muda ✓ |
| Deploy falha | Versão NÃO muda ✓ |
| Build OK, Deploy OK | Versão incrementa ✓ |
| Alguém faz push sem build | Workflow compila primeiro ✓ |

## Integração com React

No componente que exibe versão:
```tsx
const [version, setVersion] = useState('loading...');

useEffect(() => {
  fetch('/version.json')
    .then(r => r.json())
    .then(data => setVersion(data.version));
}, []);
```

Renderiza sempre a versão mais recente sem rebuild!

## Manutenção

### Se versão ficar desincronizada
```bash
# Verificar versão local
cat react-app/public/version.json

# Verificar versão no site
curl https://diegodemorais.github.io/wealth/version.json | jq .version

# Se divergir, force um rebuild:
git commit --allow-empty -m "force: rebuild dashboard"
git push origin main
```

### Monitorar incrementos
```bash
git log --grep="Increment version" --oneline
```

## Referências

- **Arquivo de versão:** `/home/user/wealth/react-app/public/version.json`
- **Script de incremento:** `/home/user/wealth/scripts/increment-version-external.js`
- **Workflow:** `/home/user/wealth/.github/workflows/deploy-dashboard.yml`
- **Build script:** `npm run build:no-test` (em `react-app/`)

## Histórico de Decisão

**Data:** 2026-04-16  
**Decisão:** Migrar para versão externa em JSON  
**Motivo:** Desacoplar versionamento de compilação, permitir increments pós-deploy sem rebuild  
**Benefício:** Versão sempre sincronizada, sem defasagens, segura contra falhas parciais  
**Commit:** d2dad59
