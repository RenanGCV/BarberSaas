# 🔧 Guia de Solução de Problemas - BarberSaaS

## Erro ao Executar setup.bat

### ❌ Problema: Docker Desktop não está rodando

**Erro:**
```
unable to get image 'mailhog/mailhog:latest': error during connect: 
Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/...": 
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

**Causa:** Docker Desktop não está iniciado no Windows.

### ✅ Solução

#### 1. Iniciar Docker Desktop

1. **Abra o Docker Desktop** do menu Iniciar do Windows
2. **Aguarde** até ver o ícone da baleia na bandeja do sistema (system tray)
3. Clique no ícone e verifique se está **"Docker Desktop is running"**

#### 2. Verificar se Docker está funcionando

Abra o terminal e execute:
```bash
docker --version
docker ps
```

Se aparecer uma lista (mesmo vazia), o Docker está funcionando!

#### 3. Executar setup novamente

```bash
.\setup.bat
```

---

## Alternativa: Setup Manual (Sem Docker)

Se você **não conseguir usar Docker**, pode configurar manualmente:

### 1. Instalar PostgreSQL Localmente

**Download:**
- https://www.postgresql.org/download/windows/

**Configuração:**
- Usuário: `barbersaas`
- Senha: `barbersaas_dev_2024`
- Database: `barbersaas`
- Porta: `5432`

### 2. Configurar ambiente

Edite `apps/api/.env`:
```env
DATABASE_URL="postgresql://barbersaas:barbersaas_dev_2024@localhost:5432/barbersaas"
JWT_SECRET="seu-secret-super-seguro-aqui-123456"
JWT_REFRESH_SECRET="seu-refresh-secret-super-seguro-123456"
PORT=3333
NODE_ENV=development
```

### 3. Instalar dependências

```bash
# Backend
cd apps/api
npm install

# Frontend
cd ../web
npm install

# Mobile (opcional)
cd ../mobile
npm install
```

### 4. Configurar banco de dados

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 5. Iniciar serviços

**Terminal 1 - Backend:**
```bash
cd apps/api
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm run dev
```

---

## Outros Problemas Comuns

### ❌ Erro: Porta 5432 já está em uso

**Solução:**
```bash
# Windows
netstat -ano | findstr :5432
taskkill /PID <numero-do-pid> /F

# Ou altere a porta no docker-compose.yml
ports:
  - '5433:5432'  # Use 5433 no host

# E atualize o .env
DATABASE_URL="postgresql://barbersaas:barbersaas_dev_2024@localhost:5433/barbersaas"
```

### ❌ Erro: npm vulnerabilities

As vulnerabilities mostradas são de **dependências de desenvolvimento** e **não bloqueiam** o projeto. Você pode:

**Opção 1:** Ignorar (seguro para desenvolvimento)

**Opção 2:** Tentar corrigir
```bash
npm audit fix
```

**Opção 3:** Forçar correção (pode quebrar compatibilidade)
```bash
npm audit fix --force
```

### ❌ Erro: Migrations falhando

**Solução:**
```bash
cd apps/api
npx prisma migrate reset  # ATENÇÃO: Apaga todos os dados
npx prisma migrate dev
npx prisma db seed
```

### ❌ Erro: "Cannot find module"

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## Verificação de Saúde do Sistema

Execute este checklist:

### ✅ Checklist de Verificação

```bash
# 1. Node.js instalado
node --version  # Deve ser >= 18

# 2. npm instalado
npm --version

# 3. Docker rodando (se usar Docker)
docker --version
docker ps

# 4. PostgreSQL acessível
# Se Docker:
docker exec -it barbersaas-postgres psql -U barbersaas -c "SELECT version();"

# Se local:
psql -U barbersaas -c "SELECT version();"

# 5. Dependências instaladas
cd apps/api && npm list --depth=0
cd apps/web && npm list --depth=0

# 6. Prisma configurado
cd apps/api
npx prisma studio  # Abre interface visual do banco
```

---

## Logs de Debug

### Backend (API)
```bash
cd apps/api
npm run start:dev

# Com logs detalhados
DEBUG=* npm run start:dev
```

### Docker
```bash
# Ver logs do PostgreSQL
docker logs barbersaas-postgres

# Ver logs em tempo real
docker logs -f barbersaas-postgres
```

### Prisma
```bash
# Verificar conexão
cd apps/api
npx prisma db pull

# Ver schema atual
npx prisma studio
```

---

## Comandos Úteis

### Docker

```bash
# Parar todos os containers
docker-compose down

# Parar e remover volumes (CUIDADO: Apaga dados)
docker-compose down -v

# Reiniciar containers
docker-compose restart

# Ver status
docker-compose ps

# Acessar container PostgreSQL
docker exec -it barbersaas-postgres bash
psql -U barbersaas
```

### Banco de Dados

```bash
# Resetar banco (APAGA TUDO)
cd apps/api
npx prisma migrate reset

# Nova migration
npx prisma migrate dev --name nome_da_migration

# Visualizar dados
npx prisma studio
```

### Limpar Tudo

```bash
# Limpar node_modules
rm -rf apps/api/node_modules
rm -rf apps/web/node_modules
rm -rf apps/mobile/node_modules
rm -rf node_modules

# Limpar Docker
docker-compose down -v
docker system prune -a

# Reinstalar
npm install
```

---

## Contatos de Suporte

Se nenhuma solução funcionar:

1. **Abra uma issue** no GitHub com:
   - Sistema operacional
   - Versão do Node.js
   - Log completo do erro
   - Comandos executados

2. **Logs importantes:**
   - Output do `docker ps`
   - Output do `docker logs barbersaas-postgres`
   - Conteúdo do `.env` (sem senhas!)

---

## Status de Serviços

### Serviços que devem estar rodando:

| Serviço | Porta | Status | URL |
|---------|-------|--------|-----|
| PostgreSQL | 5432 | ✅ Running | - |
| Backend API | 3333 | ✅ Running | http://localhost:3333 |
| Frontend Web | 3000 | ✅ Running | http://localhost:3000 |
| Swagger Docs | 3333 | ✅ Running | http://localhost:3333/api/docs |

### Como verificar:

```bash
# PostgreSQL (Docker)
docker ps | grep postgres

# Backend
curl http://localhost:3333/health

# Frontend
curl http://localhost:3000
```

---

## Próximos Passos Após Resolver

1. ✅ Docker iniciado
2. ✅ Setup concluído
3. ✅ Migrations executadas
4. ✅ Seed data criado
5. ✅ API rodando
6. ✅ Frontend rodando
7. 🎉 **Pronto para usar!**

### Acessar:
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:3333/api/docs
- **Prisma Studio:** `npx prisma studio` (em apps/api)

### Logar:
- Email: `admin@barbershop.com`
- Senha: `admin123`

---

**BarberSaaS** - Guia de Troubleshooting
Atualizado: Dezembro 2024
