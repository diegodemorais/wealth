# Changelog Validator — Pre-Commit Hook

## 📋 O Quê?

Sistema automático que **BLOQUEIA commits** se alterações no dashboard/scripts não forem registradas na tabela "Done" do `agentes/issues/README.md`.

Objetivo: Garantir rastreabilidade 100% de mudanças no código.

---

## 🔧 Como Funciona

### 1. **Pre-Commit Hook** (`.git/hooks/pre-commit`)

Executa **automaticamente** antes de cada commit:

```bash
┌─────────────────────────────────────┐
│ git commit                          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ .git/hooks/pre-commit               │
├─────────────────────────────────────┤
│ 1. Validar changelog registration   │ ← FAIL FAST
│    (exit 1 se arquivo não está)     │
│                                      │
│ 2. Rodar testes (npm test:pre-commit)│
│    (exit 1 se teste falhar)         │
└──────────────┬──────────────────────┘
               │
               ▼
         ✅ Commit permitido
```

### 2. **Validador** (`scripts/validate_changelog_registration.py`)

Detecta e lista arquivos não registrados:

```python
# Detecta files alterados
git diff --cached --name-only
→ ["react-app/src/components/Foo.tsx", "scripts/bar.py", ...]

# Filtra os que devem ser rastreados
TRACKED_DIRS = ["react-app/src/", "scripts/"]
TRACKED_EXT = [".tsx", ".py", ...]
IGNORE = [".env", "node_modules/", ...]

# Procura na tabela 'Done' do README.md
entries = extract_links_from_readme()
→ ["scripts/config.py", "react-app/src/app/page.tsx", ...]

# Compara e reporta
if file not in entries:
    ❌ ERRO: arquivo não registrado
    ✏️  AÇÃO: adicionar linha no README.md
```

---

## 📁 O Quê É Rastreado?

### ✅ Rastreados (requerem changelog entry)

```
react-app/src/**/*.{tsx,ts,jsx,js}
react-app/tests/**/*.{ts,tsx}
scripts/**/*.{py,tsx,ts,jsx,js}
**/*.md (documentação)
**/*.{css,scss} (estilos)
```

### ❌ Ignorados (não requerem changelog)

```
.env, .env.local
package-lock.json, yarn.lock
node_modules/, __pycache__/
build/, dist/, .next/
coverage/, .pytest_cache/
.git/*, .husky/
README.md (o próprio arquivo)
```

---

## 🚦 Fluxo de Erro

### Cenário: Commit com arquivo não registrado

```bash
$ git commit -m "Add new component"
🧪 Running pre-commit checks...

📝 Validating changelog registration...
🔍 Validando alterações no changelog...

❌ ERRO: Alterações não registradas no changelog!

   1 arquivo(s) não estão na tabela 'Done' do README.md:

   - react-app/src/components/NewComponent.tsx

📝 AÇÃO REQUERIDA:
   1. Abra: agentes/issues/README.md
   2. Vá para: ### Done — Últimos Componentes Alterados
   3. Adicione 1 linha por arquivo alterado:
      | ISSUE-ID | Component | 2026-04-27 | Descrição | [path](link) |
   4. git add agentes/issues/README.md
   5. git commit novamente
```

### Passo 1: Abrir README.md

```markdown
### Done — Últimos Componentes Alterados
> Últimas mudanças em código, testes e configuração

| ID | Componente | Data | Descrição | Link |
|----|-----------|------|-----------|------|
```

### Passo 2: Adicionar linha (1 por arquivo)

```markdown
| XX-feature-new | React: NewComponent.tsx | 2026-04-27 | Novo componente visual para dashboard | [react-app/src/components/NewComponent.tsx](https://github.com/diegodemorais/wealth/blob/main/react-app/src/components/NewComponent.tsx) |
```

Formato:
- **ID**: Issue ID (XX-feature-xxx ou HD-xxx, etc)
- **Componente**: Tipo + arquivo (Python/React/Docs, path curto)
- **Data**: YYYY-MM-DD
- **Descrição**: 1 frase (o que mudou, não o código)
- **Link**: Markdown link com âncora se relevante (#L123)

### Passo 3: Commit novamente

```bash
$ git add agentes/issues/README.md
$ git commit --amend --no-edit
# ou
$ git commit -m "Register changelog + my feature"
```

---

## 🎯 Hooks de Sucesso

### ✅ Changelog OK + Testes OK

```bash
$ git commit -m "Fix bug in calculations"
🧪 Running pre-commit checks...

📝 Validating changelog registration...
🔍 Validando alterações no changelog...
✅ Todos os 2 arquivo(s) estão registrados no changelog.

🧪 Running full test suite...
✅ All tests passed. Commit allowed.
```

### ✅ Changelog OK + Testes FALHAM

```bash
$ git commit
🧪 Running pre-commit checks...

📝 Validating changelog registration...
✅ Todos os 2 arquivo(s) estão registrados no changelog.

🧪 Running full test suite...
❌ Tests failed. Commit blocked.
   Fix errors and try again, or use: git commit --no-verify
```

---

## ⏭️ Pular Hook (Emergências)

Se precisar pular a validação (é raro):

```bash
# Pular tudo
git commit --no-verify

# Risco: sua mudança não fica rastreada
# Solução: atualizar README.md no próximo commit
```

**Regra**: Use `--no-verify` APENAS para:
- Correções críticas de bug em produção
- Reversão de commit ruim
- Merge/rebase em conflito

**Depois**: Registre a mudança no próximo commit com `--amend` ou novo commit.

---

## 📊 Exemplo Real

### Estado Inicial

```markdown
| XX-audit | Test: P1 FIRE Logic | 2026-04-27 | 5 testes (stress, ordering...) | [scripts/tests/test_audit_p0_p1.py#L200](link) |
| XX-audit | Docs: POST-AUDIT-GAPS | 2026-04-27 | Mapa 28 gaps bloqueados | [agentes/issues/XX-POST-AUDIT-GAPS.md](link) |
```

### Novo Commit

```bash
$ git add react-app/src/components/NewWidget.tsx scripts/utils/helper.py
$ git commit -m "Add new widget + helper"

❌ 2 arquivos não registrados:
   - react-app/src/components/NewWidget.tsx
   - scripts/utils/helper.py
```

### Solução

Editar README.md e adicionar:

```markdown
| XX-feature | React: NewWidget.tsx | 2026-04-27 | Widget exibição dados | [react-app/src/components/NewWidget.tsx](link) |
| XX-feature | Python: utils/helper.py | 2026-04-27 | Função utilitária cálculo | [scripts/utils/helper.py](link) |
```

Depois:

```bash
$ git add agentes/issues/README.md
$ git commit --amend --no-edit  # Adiciona ao commit anterior
# ou
$ git commit -m "Register new components"  # Novo commit
```

---

## 🔗 Integração com CI/CD

Hook roda **localmente** antes de commit. GitHub Actions pode adicionar validação remota:

```yaml
# .github/workflows/validate-changelog.yml
name: Validate Changelog
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: python3 scripts/validate_changelog_registration.py
```

---

## 📞 Troubleshooting

### Pergunta: "Arquivo XYZ deve ser rastreado mas foi ignorado?"

**Solução**: Editar `scripts/validate_changelog_registration.py`:
- Adicionar extensão em `TRACKED_EXTENSIONS`
- Remover padrão de `IGNORE_PATTERNS`
- Re-executar commit

### Pergunta: "O hook não funciona após `git clone`"

**Solução**: Permissões

```bash
chmod +x .git/hooks/pre-commit
chmod +x scripts/validate_changelog_registration.py
```

### Pergunta: "Preciso reverter tudo, hook me bloqueou"

**Solução**:

```bash
git reset --soft HEAD~1          # Desfazer commit, manter staging
git reset HEAD agentes/issues/README.md  # Remover do staging
git checkout agentes/issues/README.md    # Restaurar arquivo
# Editar novamente e fazer commit

# Ou pular tudo:
git reset --hard HEAD~1         # Desfazer tudo (use com cuidado!)
```

---

## ✅ Checklist Implementação

- [x] Script validador criado (`scripts/validate_changelog_registration.py`)
- [x] Hook integrado (`.git/hooks/pre-commit`)
- [x] Tabela expandida no README.md (42+ linhas)
- [x] Documentação criada (este arquivo)
- [ ] CI/CD validation (GitHub Actions, futuro)
- [ ] Team documentation (briefing)

---

## 📚 Referências

- Hook script: `scripts/validate_changelog_registration.py`
- Changelog table: `agentes/issues/README.md` (seção "Done")
- Pre-commit hook: `.git/hooks/pre-commit`
