# 🚀 Guia de Instalação e Execução - BarberSaas

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))

## 🛠️ Instalação Passo a Passo

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/barbersaas.git
cd barbersaas
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Inicie os Serviços Docker

```bash
docker-compose up -d
```

Isso irá iniciar:
- PostgreSQL na porta 5432
- Redis na porta 6379
- MailHog (servidor de email para testes) nas portas 1025 (SMTP) e 8025 (Web UI)

Aguarde alguns segundos para os serviços inicializarem completamente.

### 4. Configure as Variáveis de Ambiente

#### Backend (API)

```bash
cd apps/api
copy .env.example .env
```

O arquivo `.env` já está configurado para desenvolvimento local. Se necessário, ajuste as credenciais.

#### Web (Painel)

```bash
cd apps/web
copy .env.example .env.local
```

#### Mobile (App)

```bash
cd apps/mobile
copy .env.example .env
```

### 5. Configure o Banco de Dados

```bash
cd apps/api

# Gerar o Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# Popular o banco com dados de exemplo
npm run prisma:seed
```

Após o seed, você terá acesso a:
- 2 barbearias de exemplo
- 10 clientes
- 3 barbeiros
- Vários agendamentos
- Transações financeiras
- 1 caixa aberto

**Credenciais de acesso:**
- **Owner:** `owner@barbearia.com` / `123456`
- **Barbeiro:** `joao@barbearia.com` / `123456`
- **Cliente:** `cliente1@email.com` / `123456`

## ▶️ Executando o Projeto

### Opção 1: Executar Tudo (Backend + Web)

Na raiz do projeto:

```bash
npm run dev
```

### Opção 2: Executar Individualmente

#### Backend (API)

```bash
cd apps/api
npm run dev
```

A API estará disponível em: `http://localhost:3333`
Documentação Swagger: `http://localhost:3333/api/docs`

#### Web (Painel do Barbeiro)

```bash
cd apps/web
npm run dev
```

O painel web estará em: `http://localhost:3000`

#### Mobile (App do Cliente)

```bash
cd apps/mobile
npm start
```

Use o aplicativo Expo Go no seu celular ou um emulador para visualizar.

## 📱 Configurando o App Mobile

### Android/iOS - Expo Go

1. Instale o **Expo Go** no seu dispositivo:
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)

2. Execute `npm start` no diretório `apps/mobile`

3. Escaneie o QR Code que aparece no terminal com:
   - **Android**: Expo Go app
   - **iOS**: Câmera nativa do iPhone

### Emuladores

#### Android

```bash
# Certifique-se de ter o Android Studio instalado
cd apps/mobile
npm run android
```

#### iOS (apenas macOS)

```bash
cd apps/mobile
npm run ios
```

## 🧪 Executando Testes

### Backend

```bash
cd apps/api

# Testes unitários
npm run test

# Testes com coverage
npm run test:cov

# Testes E2E
npm run test:e2e
```

### Web

```bash
cd apps/web
npm run test
```

## 🗄️ Prisma Studio (UI do Banco de Dados)

Para visualizar e editar dados do banco graficamente:

```bash
cd apps/api
npm run prisma:studio
```

Acesse: `http://localhost:5555`

## 🔧 Comandos Úteis

### Docker

```bash
# Parar os serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Resetar tudo (CUIDADO: apaga todos os dados)
docker-compose down -v
```

### Prisma

```bash
cd apps/api

# Criar uma migration
npm run prisma:migrate

# Resetar banco de dados
npx prisma migrate reset

# Formatar schema.prisma
npx prisma format
```

### Limpar e Reinstalar

```bash
# Na raiz do projeto
npm run clean
npm install
```

## 🌐 URLs Importantes

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| API | http://localhost:3333 | - |
| Swagger Docs | http://localhost:3333/api/docs | - |
| Web Panel | http://localhost:3000 | owner@barbearia.com / 123456 |
| Prisma Studio | http://localhost:5555 | - |
| MailHog | http://localhost:8025 | - |
| PostgreSQL | localhost:5432 | barbersaas / barbersaas_dev_2024 |
| Redis | localhost:6379 | - |

## 🐛 Problemas Comuns

### Erro: "Port already in use"

Se alguma porta já estiver em uso:

```bash
# Windows (PowerShell como Administrador)
netstat -ano | findstr :3333
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3333 | xargs kill -9
```

### Erro no Docker

```bash
# Reconstruir containers
docker-compose down
docker-compose up -d --build
```

### Erro no Prisma

```bash
cd apps/api

# Regenerar Prisma Client
npm run prisma:generate

# Resetar banco e migrations
npx prisma migrate reset
```

### Erro no Mobile (Expo)

```bash
cd apps/mobile

# Limpar cache
npx expo start --clear
```

## 📦 Build para Produção

### Backend

```bash
cd apps/api
npm run build
npm run start
```

### Web

```bash
cd apps/web
npm run build
npm run start
```

### Mobile

```bash
cd apps/mobile

# Build Android
npx expo build:android

# Build iOS
npx expo build:ios
```

## 🚀 Deploy

### Backend - Railway/Render

1. Faça push para o GitHub
2. Conecte ao Railway/Render
3. Configure as variáveis de ambiente
4. Deploy automático

### Web - Vercel

```bash
cd apps/web
npx vercel
```

### Mobile - Expo EAS

```bash
cd apps/mobile

# Configurar EAS
npx eas build:configure

# Build
npx eas build --platform android
npx eas build --platform ios

# Submit para lojas
npx eas submit --platform android
npx eas submit --platform ios
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs -f`
2. Limpe o cache: `npm run clean && npm install`
3. Abra uma issue no GitHub

---

Desenvolvido com ❤️ para facilitar a gestão de barbearias
