# 🚀 Deploy Rápido - BarberSaas

## 📋 Pré-requisitos

- [ ] Conta no [GitHub](https://github.com)
- [ ] Conta no [Vercel](https://vercel.com)
- [ ] Conta no [Railway](https://railway.app) ou [Render](https://render.com)

---

## ⚡ Deploy em 5 Passos

### 1️⃣ Preparar Repositório

```bash
# Inicializar Git (se ainda não fez)
git init
git add .
git commit -m "feat: complete BarberSaas project"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/barbersaas.git
git push -u origin main
```

### 2️⃣ Deploy Backend (Railway)

**Via Interface Web (Mais Fácil):**

1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha seu repositório
5. Clique em "Add PostgreSQL" e "Add Redis"
6. Configure variáveis:
   ```
   JWT_SECRET=cole-um-secret-forte-aqui
   JWT_REFRESH_SECRET=cole-outro-secret-aqui
   CORS_ORIGIN=https://seu-app.vercel.app
   NODE_ENV=production
   PORT=3333
   ```
7. Em "Settings", configure:
   - **Root Directory:** `apps/api`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm run start:prod`

8. Aguarde deploy completar ✅

**Via CLI:**

```bash
npm install -g @railway/cli
railway login
cd apps/api
railway init
railway add postgresql
railway add redis
railway up
```

### 3️⃣ Deploy Frontend (Vercel)

**Via Interface Web (Recomendado):**

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New" → "Project"
3. Importe seu repositório do GitHub
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && npm install && cd apps/web`

5. Adicione variável de ambiente:
   ```
   NEXT_PUBLIC_API_URL=https://seu-backend.railway.app/api
   ```

6. Clique em "Deploy" ✅

**Via CLI:**

```bash
npm install -g vercel
cd apps/web
vercel --prod
```

### 4️⃣ Configurar Banco de Dados

No Railway CLI ou Dashboard, execute:

```bash
# Executar migrations
railway run npx prisma migrate deploy

# Popular com dados de teste (opcional)
railway run npm run seed
```

### 5️⃣ Testar Deploy

1. Acesse sua URL da Vercel: `https://seu-app.vercel.app`
2. Faça login com:
   ```
   owner@barbearia.com / 123456
   ```
3. Verifique se o dashboard carrega ✅

---

## 🎯 URLs Finais

Após deploy, você terá:

- **Frontend:** `https://seu-projeto.vercel.app`
- **Backend API:** `https://seu-projeto.up.railway.app`
- **Swagger Docs:** `https://seu-projeto.up.railway.app/api/docs`

---

## 🔧 Configurações Importantes

### Railway (Backend)

```env
DATABASE_URL=postgresql://... (automático)
REDIS_URL=redis://... (automático)
JWT_SECRET=seu-secret-forte-aqui
JWT_REFRESH_SECRET=outro-secret-forte
CORS_ORIGIN=https://seu-app.vercel.app
NODE_ENV=production
PORT=3333
```

### Vercel (Frontend)

```env
NEXT_PUBLIC_API_URL=https://seu-backend.railway.app/api
NEXTAUTH_URL=https://seu-app.vercel.app
NEXTAUTH_SECRET=gere-secret-com-openssl-rand-base64-32
```

---

## ⚠️ Checklist Pós-Deploy

- [ ] Backend respondendo em `/health`
- [ ] Frontend abrindo a página de login
- [ ] Login funcionando
- [ ] Dashboard carregando dados
- [ ] Swagger acessível em `/api/docs`
- [ ] CORS configurado corretamente

---

## 🐛 Problemas Comuns

### "Cannot connect to database"
- Verifique se PostgreSQL foi adicionado no Railway
- Confirme que `DATABASE_URL` está configurada

### "CORS Error"
- Adicione URL da Vercel em `CORS_ORIGIN` no Railway
- Redeploy o backend

### "Build Failed"
- Verifique logs no Railway/Vercel
- Confirme que Root Directory está correto
- Teste build local: `npm run build`

### Login não funciona
- Verifique se `NEXT_PUBLIC_API_URL` aponta para o backend correto
- Teste a API diretamente: `curl https://seu-backend.railway.app/api/health`

---

## 💰 Custos

### Free Tier
- **Vercel:** Grátis (ilimitado para projetos pessoais)
- **Railway:** $5 de crédito grátis/mês
- **Total:** ~$0/mês para testes

### Produção
- **Vercel Pro:** $20/mês
- **Railway:** $10-30/mês (varia por uso)
- **Total:** ~$30-50/mês

---

## 📞 Precisa de Ajuda?

1. Veja documentação completa: [DEPLOY.md](DEPLOY.md)
2. Consulte a API: [API.md](API.md)
3. Verifique arquitetura: [ARCHITECTURE.md](ARCHITECTURE.md)

---

**🎉 Parabéns! Seu BarberSaas está no ar! 🚀**
