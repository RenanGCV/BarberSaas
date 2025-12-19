# Variáveis de Ambiente - Produção

## 🔐 Railway (Backend + PostgreSQL)

Configurar no Railway Dashboard → Variáveis:

```env
# Database (gerado automaticamente pelo Railway)
DATABASE_URL=postgresql://postgres:senha@containers.railway.app:5432/railway

# JWT Secrets (GERAR NOVOS - NÃO USAR OS DE DEV!)
JWT_SECRET=<gerar-com-openssl-rand-base64-32>
JWT_REFRESH_SECRET=<gerar-com-openssl-rand-base64-32>

# App
PORT=3333
NODE_ENV=production

# Frontend URL (substituir pela sua URL Vercel)
FRONTEND_URL=https://barbersaas.vercel.app

# Opcional - Para Uploads
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret

# Opcional - Para Emails (SendGrid, Mailgun, etc)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua-senha-sendgrid

# Opcional - Notificações Push (Firebase)
FIREBASE_PROJECT_ID=seu-projeto
FIREBASE_PRIVATE_KEY=sua-chave-privada
FIREBASE_CLIENT_EMAIL=seu-email@projeto.iam.gserviceaccount.com

# Opcional - Pagamentos (Pix)
PIX_API_KEY=sua-chave-api
PIX_API_SECRET=seu-secret
```

---

## 🌐 Vercel (Frontend)

Configurar no Vercel Dashboard → Settings → Environment Variables:

```env
# Backend API URL (substituir pela sua URL Railway)
NEXT_PUBLIC_API_URL=https://barbersaas-api.up.railway.app/api

# Opcional - Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Opcional - Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 📱 Expo (Mobile)

Configurar em `apps/mobile/.env` antes do build:

```env
# Backend API URL (mesma do Railway)
API_URL=https://barbersaas-api.up.railway.app/api

# Opcional - Sentry Mobile
SENTRY_DSN=https://xxx@sentry.io/xxx

# Opcional - Google Maps
GOOGLE_MAPS_API_KEY=sua-chave-google-maps
```

---

## 🔒 Como Gerar Secrets Seguros

### Linux/Mac:
```bash
openssl rand -base64 32
```

### Node.js (qualquer OS):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Windows PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Online (use com cuidado):
- https://generate-secret.vercel.app/32

---

## ⚠️ IMPORTANTE

### ❌ NUNCA usar em produção:
```env
JWT_SECRET=dev-secret-123
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

### ✅ SEMPRE gerar novos secrets para produção
### ✅ NUNCA commitar arquivos .env no Git
### ✅ Usar secrets diferentes para staging e production

---

## 📋 Checklist de Variáveis

### Railway (Backend)
- [ ] DATABASE_URL (gerado automaticamente)
- [ ] JWT_SECRET (gerar novo)
- [ ] JWT_REFRESH_SECRET (gerar novo)
- [ ] PORT=3333
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL (URL do Vercel)

### Vercel (Frontend)
- [ ] NEXT_PUBLIC_API_URL (URL do Railway)

### Expo (Mobile)
- [ ] API_URL (URL do Railway)

---

## 🔄 Atualizando Variáveis

### Railway:
```bash
# Via CLI
railway variables set JWT_SECRET=novo-valor

# Via Dashboard
Settings → Variables → Edit
```

### Vercel:
```bash
# Via CLI
vercel env add NEXT_PUBLIC_API_URL production

# Via Dashboard
Settings → Environment Variables → Edit
```

---

## 🧪 Testando Variáveis

### Backend (Railway):
```bash
# Verificar se estão carregadas
railway run echo $DATABASE_URL
railway run echo $JWT_SECRET

# Testar conexão
railway run npx prisma db pull
```

### Frontend (Vercel):
- Deploy e verificar logs
- Inspecionar Network tab no browser
- Verificar se API está sendo chamada corretamente

---

**BarberSaaS** - Variáveis de Ambiente em Produção
Segurança: ✅ Crítica
Status: 📋 Template
