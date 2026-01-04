# 🐘 Configuração do Neon PostgreSQL

## 1. Criar Conta no Neon

1. Acesse: https://neon.tech
2. Clique em **Sign Up** (pode usar GitHub)
3. Crie um novo projeto:
   - **Project name**: `barbersaas`
   - **Database name**: `barbersaas`
   - **Region**: `US East (Ohio)` ou mais próximo

## 2. Obter Connection String

Após criar o projeto:

1. Vá em **Dashboard** → **Connection Details**
2. Selecione **Prisma** no dropdown
3. Copie a connection string que será algo como:

```
postgresql://neondb_owner:SENHA@ep-xxx-xxx-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## 3. Configurar no Railway (API)

1. Acesse seu projeto no Railway
2. Vá em **Variables**
3. Atualize a variável `DATABASE_URL` com a string do Neon
4. O Railway vai fazer redeploy automático

## 4. Rodar Migrations

Após configurar a DATABASE_URL, execute as migrations:

### Opção A: Via Railway CLI
```bash
railway run npx prisma migrate deploy
```

### Opção B: Via Dashboard do Railway
1. Abra o terminal no Railway (aba Deploy → Shell)
2. Execute:
```bash
npx prisma migrate deploy
npx prisma db seed
```

## 5. Verificar Conexão

No Neon Dashboard:
- Vá em **Tables** para ver as tabelas criadas
- Vá em **SQL Editor** para executar queries

---

## 🔧 Variáveis de Ambiente Necessárias

```env
DATABASE_URL=postgresql://USER:SENHA@HOST/DATABASE?sslmode=require
JWT_SECRET=seu-jwt-secret-aqui
NODE_ENV=production
PORT=3000
```

## ⚠️ Limites do Free Tier Neon

- **Storage**: 0.5 GB (suficiente para ~100k registros)
- **Compute**: 191 horas/mês
- **Branches**: 10 branches
- **Projetos**: 1 projeto

## 🚀 Próximos Passos

1. ✅ Criar conta no Neon
2. ✅ Criar projeto `barbersaas`
3. ✅ Copiar connection string
4. ✅ Atualizar DATABASE_URL no Railway
5. ✅ Executar migrations
6. ✅ Executar seed
7. ✅ Testar aplicação
