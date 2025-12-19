# 🚀 Deploy em Produção - BarberSaaS

## Arquitetura de Deploy Recomendada

### ✅ Opção 1: Vercel + Railway (Recomendado - Gratuito para começar)

```
Frontend (Next.js)  →  Vercel (gratuito)
Backend (NestJS)    →  Railway (gratuito até $5/mês)
PostgreSQL          →  Railway (incluído)
Mobile (Expo)       →  Expo Build Service
```

**Custo:** $0 - $5/mês inicialmente

---

### ✅ Opção 2: Vercel + Render + Neon

```
Frontend (Next.js)  →  Vercel (gratuito)
Backend (NestJS)    →  Render (gratuito)
PostgreSQL          →  Neon (gratuito - 512MB)
Mobile (Expo)       →  Expo Build Service
```

**Custo:** $0/mês (limitado)

---

### ✅ Opção 3: Full Serverless (Avançado)

```
Frontend (Next.js)  →  Vercel (gratuito)
Backend (API)       →  Vercel Serverless Functions
PostgreSQL          →  Supabase (gratuito - 500MB)
Mobile (Expo)       →  Expo Build Service
```

**Custo:** $0/mês (limitado)

---

## 🎯 Guia de Deploy - Opção 1 (Vercel + Railway)

### Passo 1: Deploy do Banco de Dados no Railway

1. **Criar conta no Railway:**
   - Acesse: https://railway.app
   - Login com GitHub

2. **Criar novo projeto PostgreSQL:**
   ```
   New Project → Deploy PostgreSQL
   ```

3. **Copiar credenciais:**
   - Clique no PostgreSQL
   - Aba "Connect"
   - Copie a `DATABASE_URL`

4. **Exemplo de URL:**
   ```
   postgresql://postgres:senha@containers-us-west-123.railway.app:5432/railway
   ```

---

### Passo 2: Deploy do Backend no Railway

1. **No Railway, adicionar serviço:**
   ```
   Add Service → GitHub Repo
   ```

2. **Selecione seu repositório** do BarberSaaS

3. **Configurar variáveis de ambiente:**
   ```env
   DATABASE_URL=postgresql://postgres:senha@railway.app:5432/railway
   JWT_SECRET=seu-secret-super-seguro-production-123456
   JWT_REFRESH_SECRET=seu-refresh-secret-production-789012
   PORT=3333
   NODE_ENV=production
   FRONTEND_URL=https://seu-app.vercel.app
   ```

4. **Configurar Build Settings:**
   - **Root Directory:** `apps/api`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npx prisma migrate deploy && npm run start:prod`

5. **Deploy automático:** Railway vai buildar e deployar!

6. **Obter URL da API:**
   - Settings → Generate Domain
   - Exemplo: `https://barbersaas-api.up.railway.app`

---

### Passo 3: Deploy do Frontend na Vercel

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Fazer login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd apps/web
   vercel
   ```

4. **Configurar variáveis de ambiente na Vercel:**
   - Dashboard Vercel → Projeto → Settings → Environment Variables
   
   Adicionar:
   ```env
   NEXT_PUBLIC_API_URL=https://barbersaas-api.up.railway.app/api
   ```

5. **Deploy production:**
   ```bash
   vercel --prod
   ```

6. **URL final:**
   - `https://barbersaas.vercel.app`

---

### Passo 4: Configurar CORS no Backend

Atualize `apps/api/src/main.ts` para aceitar sua URL do Vercel:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://barbersaas.vercel.app',  // Sua URL Vercel
    'https://*.vercel.app',             // Todas preview URLs
  ],
  credentials: true,
});
```

---

### Passo 5: Deploy do Mobile App

1. **Instalar EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login no Expo:**
   ```bash
   cd apps/mobile
   eas login
   ```

3. **Configurar projeto:**
   ```bash
   eas build:configure
   ```

4. **Atualizar API URL em `apps/mobile/.env`:**
   ```env
   API_URL=https://barbersaas-api.up.railway.app/api
   ```

5. **Build para Android:**
   ```bash
   eas build --platform android --profile production
   ```

6. **Build para iOS:**
   ```bash
   eas build --platform ios --profile production
   ```

7. **Publicar:**
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

---

## 📋 Checklist de Deploy

### Antes do Deploy
- [ ] Código testado localmente
- [ ] Migrations testadas
- [ ] Variáveis de ambiente preparadas
- [ ] CORS configurado
- [ ] Secrets seguros (não usar senhas de dev)

### Railway (Backend + DB)
- [ ] Conta Railway criada
- [ ] PostgreSQL provisionado
- [ ] DATABASE_URL copiada
- [ ] Repositório conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Build settings corretos
- [ ] Deploy bem-sucedido
- [ ] Migrations executadas
- [ ] Seed executado (se necessário)
- [ ] Health check funcionando

### Vercel (Frontend)
- [ ] Conta Vercel criada
- [ ] Projeto importado
- [ ] NEXT_PUBLIC_API_URL configurada
- [ ] Build bem-sucedida
- [ ] Preview testado
- [ ] Deploy production
- [ ] Domínio customizado (opcional)

### Mobile
- [ ] Conta Expo criada
- [ ] EAS CLI instalado
- [ ] API_URL atualizada
- [ ] Build Android gerada
- [ ] Build iOS gerada
- [ ] App publicado nas stores

---

## 🔒 Segurança em Produção

### Variáveis Sensíveis

**❌ NÃO usar em produção:**
```env
JWT_SECRET=dev-secret-123
DATABASE_URL=postgresql://user:password@localhost:5432/db
```

**✅ Gerar secrets seguros:**
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### HTTPS Obrigatório
- ✅ Railway fornece HTTPS automático
- ✅ Vercel fornece HTTPS automático
- ✅ Configurar HSTS headers

### Rate Limiting
Já implementado no projeto:
- 100 requisições/minuto por IP
- Middleware ativo em produção

---

## 🌍 Domínio Customizado

### Frontend (Vercel)

1. **Comprar domínio** (Registro.br, GoDaddy, Namecheap)

2. **Configurar na Vercel:**
   - Settings → Domains → Add Domain
   - `barbersaas.com`
   - Seguir instruções DNS

3. **Configurar DNS:**
   ```
   A     @       76.76.21.21
   CNAME www     cname.vercel-dns.com
   ```

### Backend (Railway)

1. **Configurar na Railway:**
   - Settings → Domains → Custom Domain
   - `api.barbersaas.com`

2. **Configurar DNS:**
   ```
   CNAME api    seu-projeto.up.railway.app
   ```

---

## 📊 Monitoramento

### Railway
- Dashboard → Métricas automáticas
- CPU, RAM, Network
- Logs em tempo real

### Vercel
- Analytics integrado
- Web Vitals
- Edge Functions logs

### Alternativas
- **Sentry** - Error tracking (gratuito até 5k eventos/mês)
- **LogRocket** - Session replay
- **New Relic** - APM completo

---

## 💰 Custos Estimados

### Tier Gratuito (0-100 usuários)
```
Railway PostgreSQL:  $0 - $5/mês
Railway Backend:     $0 - $5/mês  
Vercel Frontend:     $0/mês
Expo:                $0/mês
TOTAL:               $0 - $10/mês
```

### Tier Startup (100-1000 usuários)
```
Railway Pro:         $20/mês
Vercel Pro:          $20/mês
Expo:                $29/mês (opcional)
TOTAL:               $40 - $69/mês
```

### Tier Growth (1000-10000 usuários)
```
Railway:             $50/mês
Vercel Pro:          $20/mês
Supabase Pro:        $25/mês
CDN (Cloudflare):    $0 - $20/mês
TOTAL:               $95 - $115/mês
```

---

## 🔄 CI/CD Automático

### GitHub Actions (Opcional)

Criar `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🐛 Troubleshooting Production

### Backend não inicia no Railway

**Verificar logs:**
```bash
railway logs
```

**Problemas comuns:**
- Migrations falhando → Executar manualmente
- Porta errada → Railway usa PORT automático
- Variáveis faltando → Verificar no dashboard

### Frontend não conecta ao Backend

**Verificar:**
1. CORS configurado com URL correta
2. NEXT_PUBLIC_API_URL correto
3. HTTPS em ambos
4. Firewall/Rate limiting

### Database connection timeout

**Soluções:**
1. Verificar DATABASE_URL
2. Whitelist IP do Railway
3. Aumentar connection pool
4. Verificar SSL mode

---

## 📞 Suporte

### Railway
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

### Vercel
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Status: https://vercel-status.com

### Expo
- Docs: https://docs.expo.dev
- Forums: https://forums.expo.dev
- Status: https://status.expo.dev

---

## ✅ Próximos Passos Após Deploy

1. ✅ Testar todos os endpoints
2. ✅ Criar usuário admin em produção
3. ✅ Configurar backups automáticos
4. ✅ Configurar monitoramento
5. ✅ Configurar alertas
6. ✅ Testar app mobile
7. ✅ Fazer stress test
8. 🎉 **Lançar para usuários!**

---

**BarberSaaS** - Deploy em Produção
Atualizado: Dezembro 2024
Status: ✅ Production Ready
