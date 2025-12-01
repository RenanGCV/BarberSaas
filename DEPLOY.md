# BarberSaas Deploy Guide

## 🚀 Deploy na Vercel (Frontend Web)

### 1. Preparação

Certifique-se de que o código está commitado no GitHub:

```bash
git add .
git commit -m "feat: complete web panel for deployment"
git push origin main
```

### 2. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe seu repositório do GitHub
4. Configure o projeto:

**Root Directory:** `apps/web`

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```bash
.next
```

**Install Command:**
```bash
cd ../.. && npm install && cd apps/web
```

### 3. Variáveis de Ambiente na Vercel

Adicione as seguintes variáveis em "Environment Variables":

```bash
NEXT_PUBLIC_API_URL=https://seu-backend.railway.app/api
NEXTAUTH_URL=https://seu-app.vercel.app
NEXTAUTH_SECRET=gere-um-secret-seguro-aqui
NEXT_PUBLIC_APP_NAME=BarberSaas
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
```

### 4. Deploy

Clique em "Deploy" e aguarde o build completar.

---

## 🔧 Deploy do Backend (Railway/Render)

### Opção 1: Railway (Recomendado)

1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project" → "Deploy from GitHub repo"
3. Selecione seu repositório
4. Configure:

**Root Directory:** `apps/api`

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm run start:prod
```

**Watch Paths:**
```
apps/api/**
```

### Variáveis de Ambiente (Railway)

```bash
# Database (Railway fornece automaticamente)
DATABASE_URL=postgresql://...

# Redis (adicione serviço Redis no Railway)
REDIS_URL=redis://...

# JWT
JWT_SECRET=gere-um-secret-forte-aqui
JWT_REFRESH_SECRET=gere-outro-secret-aqui
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=https://seu-app.vercel.app

# Node
NODE_ENV=production
PORT=3333
```

### Adicionar PostgreSQL e Redis no Railway

1. No seu projeto Railway, clique em "+ New"
2. Selecione "Database" → "PostgreSQL"
3. Clique em "+ New" novamente
4. Selecione "Database" → "Redis"
5. O Railway conectará automaticamente os serviços

### Opção 2: Render

1. Acesse [render.com](https://render.com)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório
4. Configure:

**Name:** barbersaas-api

**Root Directory:** `apps/api`

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash npm run start:prod
```

**Environment:** Node

Adicione as mesmas variáveis de ambiente do Railway.

---

## 📦 Configurar Banco de Dados em Produção

### 1. Executar Migrations

No Railway/Render, adicione um comando de migração:

```bash
npx prisma migrate deploy
```

Ou via CLI Railway:
```bash
railway run npx prisma migrate deploy
```

### 2. Popular Banco com Seed (Opcional)

```bash
railway run npm run seed
```

---

## ✅ Checklist de Deploy

### Antes de Deployar

- [ ] Código commitado no GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] `.env.example` atualizado
- [ ] Build local testado (`npm run build`)
- [ ] Migrations testadas

### Backend (Railway/Render)

- [ ] PostgreSQL provisionado
- [ ] Redis provisionado
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations executadas
- [ ] API acessível via HTTPS

### Frontend (Vercel)

- [ ] Variável `NEXT_PUBLIC_API_URL` apontando para backend
- [ ] Build completado sem erros
- [ ] Login funcionando
- [ ] Dashboard carregando

---

## 🔍 Testes Pós-Deploy

### 1. Testar API

```bash
curl https://seu-backend.railway.app/api/health
```

### 2. Testar Login no Frontend

Acesse: `https://seu-app.vercel.app/login`

Use as credenciais de teste:
```
owner@barbearia.com / 123456
```

### 3. Verificar Logs

**Railway:**
- Acesse o dashboard do projeto
- Clique no serviço
- Veja "Deployments" → "View Logs"

**Vercel:**
- Acesse o dashboard do projeto
- Clique em "Deployments"
- Clique no deployment
- Veja "Functions" logs

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

1. Verifique se `DATABASE_URL` está configurada
2. Certifique-se que o PostgreSQL está rodando
3. Execute migrations: `npx prisma migrate deploy`

### Erro: "CORS policy"

1. Adicione o domínio da Vercel em `CORS_ORIGIN`
2. No código `apps/api/src/main.ts`, verifique configuração CORS

### Build falha no Vercel

1. Verifique logs de build
2. Certifique-se que `NEXT_PUBLIC_API_URL` está configurada
3. Verifique se `package.json` está correto

### 502 Bad Gateway (Backend)

1. Verifique logs do serviço
2. Certifique-se que a porta está correta (Railway usa `PORT` env)
3. Verifique se build completou com sucesso

---

## 📊 Monitoramento

### Railway Dashboard

- CPU e Memória em tempo real
- Logs de aplicação
- Métricas de rede

### Vercel Analytics

Ative Vercel Analytics para métricas de performance:
- Web Vitals
- Tempo de carregamento
- Taxa de erro

---

## 🔄 Atualizações

### Deploy Automático

Tanto Vercel quanto Railway fazem deploy automático ao fazer push na branch `main`.

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

### Deploy Manual

**Vercel:**
```bash
cd apps/web
vercel --prod
```

**Railway:**
```bash
railway up
```

---

## 💰 Custos Estimados

### Free Tier

- **Vercel:** Grátis para projetos pessoais
- **Railway:** $5/mês de crédito gratuito
- **Render:** Grátis com limitações (spins down após inatividade)

### Produção (Estimativa)

- **Vercel Pro:** $20/mês
- **Railway:** ~$10-30/mês (variável por uso)
- **Render:** ~$7-25/mês

---

## 🔐 Segurança

1. **Nunca commite arquivos `.env`**
2. **Use secrets fortes** para JWT
3. **Configure rate limiting** em produção
4. **Use HTTPS** sempre
5. **Habilite CORS** apenas para domínios confiáveis

---

## 📞 Suporte

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs

---

**Pronto para produção! 🚀**
