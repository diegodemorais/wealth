# HD-gws-auth: Autenticar gws CLI para acesso Google Workspace

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-gws-auth |
| **Dono** | Head |
| **Status** | Cancelada |
| **Prioridade** | 🟡 Média |
| **Criado em** | 2026-04-08 |
| **Origem** | Tentativa de usar gws para validar holdings.md — sem OAuth client configurado |
| **Concluido em** | 2026-04-08 |
| **Motivo cancelamento** | gws CLI requer pagamento — inviável |

---

## Problema

`gws auth status` retorna `auth_method: none` — sem `client_secret.json` configurado.
`gws auth login --full` falha com: "No OAuth client configured."

O `gcloud` está autenticado como `diegodemorais@gmail.com` com projeto `diego-workspace-cli`, mas OAuth Desktop client não foi criado.

---

## Por que importa

`gws` é a ferramenta principal para leitura direta do Google Workspace (Sheets, Gmail, Calendar, Drive). Sem autenticação, qualquer atualização de `dados/holdings.md` não pode ser validada contra a fonte primária (Carteira Viva), aumentando risco de erro como o de HD-swrd-114-cotas.

---

## Passos para Resolver (Diego executa — 2 min)

**1. Consent Screen** (se não configurado):
→ `https://console.cloud.google.com/apis/credentials/consent?project=diego-workspace-cli`
- User Type: External
- App name: `gws CLI`
- Support email: diegodemorais@gmail.com
- Salva e avança por todas as telas

**2. Criar OAuth Client ID:**
→ `https://console.cloud.google.com/apis/credentials?project=diego-workspace-cli`
- `Create Credentials` → `OAuth client ID`
- Application type: **Desktop app**
- Name: `gws CLI`
- Clica `Create`

**3. Salvar credenciais:**
Copiar o Client ID e Client Secret e passar para o Head configurar:
```bash
# Head salva em client_secret.json e roda:
gws auth login --full
```

Ou baixar o JSON e salvar em `~/.config/gws/client_secret.json`, depois `gws auth login --full`.

---

## Critério de conclusão

- [ ] `gws auth status` retorna credenciais válidas
- [ ] `gws sheets spreadsheets get` funciona na Carteira Viva
- [ ] Salvar Client ID/Secret nas env vars de `.claude/settings.local.json` (não commitar)
