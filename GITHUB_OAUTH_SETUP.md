# GitHub OAuth Setup — Dashboard Wealth

**Status**: Implementado. Falta configurar a OAuth App no GitHub.

## 1. Criar OAuth App no GitHub

1. Acesse: https://github.com/settings/developers
2. Clique em "New OAuth App" (ou "New GitHub App" → escolha OAuth App)
3. Preencha:
   - **Application name**: "Wealth Dashboard"
   - **Homepage URL**: `https://diegodemorais.github.io/wealth` (ou seu domínio)
   - **Authorization callback URL**: `https://diegodemorais.github.io/wealth/auth/callback`
   
4. Clique "Register application"

5. Você receberá:
   - **Client ID** (público) → copiar para `NEXT_PUBLIC_GITHUB_CLIENT_ID`
   - **Client Secret** (privado) → **NÃO usar no frontend**

## 2. Configurar Variáveis de Ambiente

### Local Development
```bash
# Cria .env.local baseado em .env.local.example
cp react-app/.env.local.example react-app/.env.local

# Edita .env.local e adiciona seu Client ID
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback
```

### Produção (GitHub Pages)
```bash
# As secrets devem estar em GitHub Secrets (Settings → Secrets and variables → Actions)
# Adicione:
# GITHUB_CLIENT_ID = seu_client_id_aqui

# Depois, no workflow que faz o build, injete via:
# env:
#   NEXT_PUBLIC_GITHUB_CLIENT_ID: ${{ secrets.GITHUB_CLIENT_ID }}
```

## 3. Fluxo de Autenticação

```
Usuário clica "Entrar com GitHub"
    ↓
Redirecionado para: github.com/login/oauth/authorize?client_id=...&redirect_uri=...
    ↓
Usuário faz login no GitHub (se não estiver logado)
    ↓
GitHub retorna para: https://seu-dominio/auth/callback?code=...
    ↓
Página de callback troca code por access_token
    ↓
Token armazenado em localStorage por 30 dias
    ↓
Dashboard acessível
```

## 4. Segurança

✅ **O que NÃO está exposto**:
- Sua senha do GitHub (GitHub a guarda)
- Client Secret (nunca enviar ao frontend)

⚠️ **Limitações da abordagem atual**:
- Cliente secret é exposto se você o colocar em `.env.local` → **NÃO FAÇA**
- O `code` do GitHub pode ser lido na URL durante callback → é seguro (one-time use)
- Token GitHub persiste 30 dias em localStorage → risco se device for roubado

✅ **Mitigações**:
- Token é vinculado ao seu GitHub account (não transferível)
- Pode ser revogado manualmente em: https://github.com/settings/applications

## 5. Testar Localmente

```bash
cd react-app
npm run dev
# Abra http://localhost:3000
# Clique "Entrar com GitHub"
# Você será redirecionado para GitHub e de volta
```

## 6. Deploy em Produção

No `.github/workflows/deploy.yml` (ou seu workflow):

```yaml
env:
  NEXT_PUBLIC_GITHUB_CLIENT_ID: ${{ secrets.GITHUB_CLIENT_ID }}
  NEXT_PUBLIC_GITHUB_REDIRECT_URI: https://diegodemorais.github.io/wealth/auth/callback
```

## 7. Troubleshooting

**"Erro: client_id não pode estar em branco"**
→ Você não configurou `NEXT_PUBLIC_GITHUB_CLIENT_ID` em `.env.local`

**"Error: redirect_uri mismatch"**
→ A URL de callback em GitHub não bate. Verifique em: Settings → Developer settings → OAuth Apps → Wealth Dashboard

**"Token inválido"**
→ Pode ter expirado (30 dias). Limpe localStorage e faça re-login:
```js
localStorage.clear()
location.reload()
```

## 8. Próximos Passos (Opcional)

Para máxima segurança, implementar um backend que:
- Recebe o `code` do frontend
- Troca por token (usando Client Secret seguro no servidor)
- Retorna um JWT que pode ser mais seguro

Isso pode ser feito com Vercel Serverless Functions ou um backend externo.
