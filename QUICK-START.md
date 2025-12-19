# 🚀 BarberSaaS - Guia de Início Rápido

> Projeto 100% completo e pronto para produção!

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn
- Git

## ⚡ Instalação Rápida (Windows)

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd BarberSaas
```

### 2. Execute o script de setup automático
```bash
.\setup.bat
```

Este script irá:
- ✅ Instalar todas as dependências
- ✅ Configurar o banco de dados
- ✅ Executar migrations
- ✅ Criar seed data (dados de exemplo)

### 3. Inicie os serviços

**Backend API:**
```bash
.\start-api.bat
```
Acessível em: http://localhost:3333

**Frontend Web:**
```bash
cd apps\web
npm run dev
```
Acessível em: http://localhost:3000

**Mobile App:**
```bash
cd apps\mobile
npx expo start
```

---

## 🔧 Configuração Manual (Passo a Passo)

### Backend API

1. **Instalar dependências:**
```bash
cd apps/api
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/barbersaas"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=3333
```

3. **Configurar banco de dados:**
```bash
npx prisma migrate dev
npx prisma generate
```

4. **Popular com dados de exemplo:**
```bash
npm run seed
```

5. **Iniciar em desenvolvimento:**
```bash
npm run start:dev
```

### Frontend Web

1. **Instalar dependências:**
```bash
cd apps/web
npm install
```

2. **Configurar API URL:**
```bash
cp .env.example .env.local
```

Edite o `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3333/api
```

3. **Iniciar:**
```bash
npm run dev
```

### Mobile App

1. **Instalar dependências:**
```bash
cd apps/mobile
npm install
```

2. **Configurar API URL:**
```bash
cp .env.example .env
```

Edite o `.env`:
```env
API_URL=http://SEU-IP:3333/api
```

3. **Iniciar Expo:**
```bash
npx expo start
```

4. **Testar:**
- Pressione `a` para Android
- Pressione `i` para iOS
- Escaneie o QR Code com Expo Go

---

## 📱 Credenciais de Teste

Após executar o seed, você terá:

### Admin (Painel Web)
- **Email**: admin@barbershop.com
- **Senha**: admin123

### Barbeiro (Painel Web)
- **Email**: barber@barbershop.com
- **Senha**: barber123

### Cliente (Mobile App)
- **Email**: customer@example.com
- **Senha**: customer123

---

## 🗂️ Estrutura do Projeto

```
BarberSaas/
├── apps/
│   ├── api/          # Backend NestJS
│   ├── web/          # Frontend Next.js
│   └── mobile/       # App React Native
├── packages/
│   └── shared/       # Código compartilhado
├── docker-compose.yml
├── setup.bat
└── README.md
```

---

## 🔍 Verificar Instalação

### 1. Backend API
```bash
curl http://localhost:3333/health
```
Resposta esperada: `{"status":"ok"}`

### 2. Frontend Web
Abra: http://localhost:3000
Você deve ver a página de login

### 3. Mobile App
Abra o Expo Go e escaneie o QR Code

---

## 🐛 Problemas Comuns

### Erro de conexão com banco de dados
```bash
# Verifique se o PostgreSQL está rodando
psql --version

# Teste a conexão
psql -U postgres
```

### Porta 3333 já em uso
```bash
# Windows: Encontrar processo
netstat -ano | findstr :3333

# Matar processo
taskkill /PID <PID> /F
```

### Erro ao instalar dependências
```bash
# Limpar cache npm
npm cache clean --force

# Deletar node_modules e reinstalar
rm -rf node_modules
npm install
```

### Mobile app não conecta à API
- Verifique se está usando o IP correto (não localhost)
- Certifique-se de estar na mesma rede WiFi
- Desative firewall temporariamente para teste

---

## 📚 Próximos Passos

1. **Explorar o Dashboard**
   - Faça login como admin
   - Veja estatísticas em tempo real
   - Explore os gráficos

2. **Testar Agendamentos**
   - Crie um novo agendamento
   - Veja notificações em tempo real
   - Confirme/cancele agendamentos

3. **Gestão Financeira**
   - Abra um caixa
   - Registre transações
   - Feche o caixa
   - Exporte relatórios

4. **Mobile App**
   - Cadastre-se como cliente
   - Busque barbearias
   - Faça um agendamento
   - Veja seu histórico

---

## 🚀 Deploy em Produção

### Opção 1: Vercel + Railway (Recomendado)

**Frontend (Vercel):**
```bash
cd apps/web
vercel --prod
```

**Backend (Railway):**
```bash
cd apps/api
railway up
```

### Opção 2: Docker

```bash
docker-compose up -d
```

### Opção 3: VPS com PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar API
cd apps/api
pm2 start ecosystem.config.js

# Iniciar Frontend
cd apps/web
npm run build
pm2 serve .next 3000 --name "barbersaas-web"
```

Veja [DEPLOY.md](./DEPLOY.md) para guia completo.

---

## 📖 Documentação Adicional

- [Architecture](./ARCHITECTURE.md) - Arquitetura do sistema
- [API Documentation](./API.md) - Endpoints da API
- [Mobile App Guide](./MOBILE-APP-COMPLETE.md) - Guia do app mobile
- [Deployment Guide](./DEPLOY.md) - Guia de deploy
- [Project Status](./PROJECT-100-COMPLETE.md) - Status 100%

---

## 💡 Dicas

- Use `npm run dev` para desenvolvimento com hot-reload
- Execute `npm run test` para rodar testes
- Use `npm run lint` para verificar código
- Veja logs com `pm2 logs` em produção

---

## 🆘 Suporte

- Abra uma issue no GitHub
- Consulte a documentação em `/docs`
- Veja exemplos em `/examples`

---

## ✅ Checklist de Instalação

- [ ] Node.js instalado
- [ ] PostgreSQL instalado e rodando
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Banco de dados configurado
- [ ] Migrations executadas
- [ ] Seed data criado
- [ ] API rodando (porta 3333)
- [ ] Frontend rodando (porta 3000)
- [ ] Mobile app testado
- [ ] Login funcionando
- [ ] Dashboard carregando

---

🎉 **Parabéns! Seu BarberSaaS está pronto para usar!**

Desenvolvido com ❤️ usando NestJS, Next.js e React Native
