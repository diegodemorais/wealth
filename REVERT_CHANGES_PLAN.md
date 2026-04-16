# Plano de Reversão: v0.1.170 → stable-v2.77

## 📊 Análise: O que mudou?

### 1. **DADOS HARDCODED** (vs placeholders)
**Antes (stable-v2.77):**
```html
<div class="hval pv" id="heroPatrimonioBrl">—</div>
<div class="hval pv" id="heroAnos">—</div>
```

**Depois (0.1.170):**
```html
<div class="hval pv" id="heroPatrimonioBrl">R$3.59M</div>
<div class="hval pv" id="heroAnos">13a 9m</div>
```

### 2. **ESTILOS INLINE** (vs CSS variables)
**Antes:**
```html
<div class="hval pv" id="heroProgresso">—</div>
```

**Depois:**
```html
<div class="hval pv" id="heroProgresso" style="color: rgb(234, 179, 8);">43.1%</div>
```

### 3. **SVGS AUTO-CLOSING TAGS**
**Antes:**
```html
<polyline points="23 4 23 10 17 10"/>
```

**Depois:**
```html
<polyline points="23 4 23 10 17 10"></polyline>
```

### 4. **ELEMENTOS HIDDEN COM DADOS**
**Antes:**
```html
<span id="kpiBondPool" style="display:none"></span>
```

**Depois:**
```html
<span id="kpiBondPool" style="display: none; color: rgb(239, 68, 68);">0.8a</span>
```

### 5. **SEÇÃO SEMÁFOROS EXPANDIDA**
**Antes:**
```html
<table class="semaforo-table" id="semaforoBody">
<!-- gerado por buildSemaforoPanel() -->
</table>
```

**Depois:**
```html
<table class="semaforo-table" id="semaforoBody">
<thead><tr><th>Gatilho</th><th>Status</th>...
<tbody><tr><td>Renda+ 2065...
```

### 6. **FIRE SCENARIOS COM LAYOUT COMPLETO**
**Antes:**
```html
<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));gap:10px" id="fireScenarioGrid"></div>
```

**Depois:**
```html
<div style="display:grid;...;gap:10px" id="fireScenarioGrid">
<div style="display: flex; flex-direction: column; gap: 8px;">
  <div>🧑 Solteiro</div>
  <div class="scenario-card">...FIRE 49...</div>
  <div class="scenario-card chosen">...FIRE 53...</div>
</div>
...
</div>
```

---

## 🎯 O QUE O USUÁRIO QUER?

**Opção 1: Reverter arquivo HTML** ✅ Mais rápido
- Copiar `DashHTML-estavel.html` → `DashHTML.html`
- Risco: Perde dados populados/estilos atualizados

**Opção 2: Limpar DashHTML.html atual** (Recomendado)
- Remover hardcoded data → deixar placeholders `—`
- Remover estilos inline → deixar apenas classes CSS
- Remover HTML renderizado → deixar contêineres vazios
- Mantém estrutura atual (que parece estar correta)

**Opção 3: Atualizar design visual** ⏸️ Fora do escopo
- Mudaria layout inteiro (cards → grid, espaçamento, etc)
- Requer reimplementação do CSS e HTML

---

## 💡 RECOMENDAÇÃO

**Executar Opção 2** — reverter ao estado "template limpo":

### Mudanças específicas:
1. `id="heroPatrimonioBrl">R$3.59M` → `>—`
2. Remover todos `style="color: rgb(...)"` → deixar Classes CSS
3. `<span id="kpiBondPool" style="display: none; ...;">0.8a</span>` → `<span style="display:none"></span>`
4. Limpar tabelas renderizadas em semaforoBody
5. Limpar fireScenarioGrid (deixar vazio)
6. Remover `width: 75.792%` → deixar vazio para JS preencher
7. Remover `<thead>/<tbody>` rendido → deixar limpo para JS

### Resultado:
- Arquivo volta a parecer com `DashHTML-estavel.html`
- Estrutura HTML idêntica (safe for JS rendering)
- Estilos CSS variables (safe for theme changes)
- Pronto para ser preenchido dinamicamente

---

## ⚙️ Execução

```bash
# Opção rápida: copiar arquivo
cp analysis/raw/DashHTML-estavel.html analysis/raw/DashHTML.html

# Opção segura: remover dados line-by-line (tedioso, usar script)
```

**Você quer Opção 1 (copiar) ou Opção 2 (limpar)?**
