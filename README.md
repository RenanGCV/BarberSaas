# 💈 BarberSaas - Sistema Completo de Gestão para Barbearias

![License](https://img.shields.io/badge/license-MIT-orange)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React Native](https://img.shields.io/badge/react--native-0.73-blue)
![Status](https://img.shields.io/badge/status-fundação_completa-success)

## 📋 Sobre o Projeto

BarberSaas é uma **plataforma SaaS completa** para gestão de barbearias, com foco em **controle financeiro** e experiência premium.

### 🎯 Componentes

- **📱 App Mobile**: React Native + Expo (cliente final)
- **💻 Painel Web**: Next.js 14 + Tailwind (gestão)
- **🔧 Backend API**: NestJS + Prisma + PostgreSQL

### 🎨 Design Premium

Interface **dark moderna** com destaques em **laranja (#F5A027)**, animações fluidas e UX inspirada nos melhores apps do mercado.

### ⚡ Status Atual

```
[████████████████░░░░] 80% Completo - PRONTO PARA DEPLOY! 🚀

✅ Infraestrutura e arquitetura
✅ Backend API completo (10 módulos, 50+ endpoints)
✅ Database schema completo (12 models)
✅ Seed com dados de teste
✅ Documentação completa (7 arquivos)
✅ Módulos de negócio Core
✅ Sistema Financeiro completo
✅ Frontend Web (Login + Dashboard)
✅ Configurações de Deploy (Vercel + Railway)
⏳ Frontend Mobile
⏳ Real-time e Notificações
```

> 📚 **[Ver Roadmap Completo](ROADMAP.md)** | **[Status Detalhado](PROJECT-STATUS.md)**

## 🏗️ Arquitetura

```
barbersaas/
├── apps/
│   ├── api/          # Backend NestJS + PostgreSQL + Prisma
│   ├── web/          # Painel Web Next.js 14 + Tailwind
│   └── mobile/       # App React Native + Expo
├── packages/
│   ├── shared/       # Tipos compartilhados (TypeScript)
│   ├── ui/           # Componentes UI reutilizáveis
│   └── config/       # Configurações compartilhadas
└── docker/           # Configurações Docker
```

### 📊 Diagrama de Fluxo

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Mobile    │────────▶│     API     │◀────────│   Web Panel  │
│   (Expo)    │  HTTPS  │  (NestJS)   │  HTTPS  │  (Next.js)   │
└─────────────┘         └─────────────┘         └──────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
              ┌─────▼───┐ ┌───▼────┐ ┌─▼─────┐
              │PostgreSQL│ │ Redis  │ │Firebase│
              │(Principal)│ │(Cache) │ │(Push)  │
              └──────────┘ └────────┘ └────────┘
```

## 🚀 Tecnologias

### Backend
- **NestJS** - Framework Node.js robusto
- **PostgreSQL** - Banco de dados relacional
- **Prisma** - ORM moderno
- **Redis** - Cache e filas
- **Socket.io** - Real-time
- **JWT** - Autenticação segura

### Web
- **Next.js 14** - Framework React (App Router)
- **Tailwind CSS** - Estilização utilitária
- **Shadcn/ui** - Componentes premium
- **React Query** - Gerenciamento de estado servidor
- **Recharts** - Gráficos e relatórios

### Mobile
- **React Native** - Framework mobile
- **Expo** - Toolchain completo
- **React Navigation** - Navegação fluida
- **Reanimated 3** - Animações de alta performance
- **AsyncStorage** - Cache offline

## 🚀 Quick Start (5 minutos)

### Setup Automatizado

**Windows**:
```bash
setup.bat
```

**Linux/Mac**:
```bash
chmod +x setup.sh
./setup.sh
```

O script irá:
1. ✅ Verificar Docker
2. ✅ Instalar dependências
3. ✅ Iniciar PostgreSQL, Redis, MailHog
4. ✅ Configurar variáveis de ambiente
5. ✅ Executar migrations
6. ✅ Popular banco com dados de exemplo

### Credenciais de Teste

```
Proprietário: owner@barbearia.com / 123456
Barbeiro:     joao@barbearia.com / 123456
Cliente:      cliente1@email.com / 123456
```

> 📖 **[Guia de Instalação Detalhado](INSTALLATION.md)**

## 🏃 Como Executar

### Backend (API)

```bash
cd apps/api
npm run dev
# API rodando em http://localhost:3333
```

### Web (Painel)

```bash
cd apps/web
npm run dev
# Web rodando em http://localhost:3000
```

### Mobile (App)

```bash
cd apps/mobile
npm start
# Use Expo Go no celular ou emulador
```

## 📱 Funcionalidades

### App Mobile (Cliente)

- ✅ Autenticação (Email, Google, Telefone)
- ✅ Busca de barbearias próximas
- ✅ Visualização de serviços e preços
- ✅ Agendamento com seleção de profissional
- ✅ Histórico de agendamentos
- ✅ Avaliações e comentários
- ✅ Pagamento via Pix
- ✅ Notificações push
- ✅ Perfil do usuário

### Painel Web (Gestor/Barbeiro)

#### Dashboard
- 📊 Visão geral do dia
- 💰 Total recebido
- 📅 Próximos agendamentos
- 👥 Status dos profissionais

#### Gestão de Agenda
- 📆 Calendário visual (dia/semana/mês)
- ⏰ Criação de horários disponíveis
- ✂️ Cadastro de serviços
- ✅ Confirmação/recusa de agendamentos
- 🚫 Bloqueio de horários

#### Gestão de Profissionais
- 👤 Cadastro de barbeiros
- 💵 Configuração de comissões
- ⏱️ Controle de horários
- 📈 Relatórios individuais

#### Sistema Financeiro (CORE)
- 💰 Caixa diário (abertura/fechamento)
- 📥 Registro de entradas/saídas
- 🏷️ Categorização de despesas
- 📊 Fluxo de caixa
- 💳 Conciliação financeira
- 📄 Exportação CSV/PDF
- 📈 Relatórios de comissão

#### Marketing
- 🔔 Push notifications
- 🎁 Cupons e promoções
- 🎯 Programas de fidelidade

## 🗄️ Banco de Dados

### Principais Entidades

- **Users** - Usuários (clientes e barbeiros)
- **Tenants** - Barbearias (multi-tenant)
- **Barbers** - Profissionais da barbearia
- **Services** - Serviços oferecidos
- **Appointments** - Agendamentos
- **Transactions** - Movimentações financeiras
- **CashFlow** - Fluxo de caixa
- **Promotions** - Promoções e cupons

## 🔐 Autenticação e Segurança

- JWT com Refresh Token
- Rate limiting por IP
- Validação de schemas com class-validator
- Sanitização de inputs
- CORS configurado
- Helmet para headers HTTP seguros
- Multi-tenant com isolamento de dados

## 🚀 Deploy Rápido

### Opção 1: Scripts Automatizados

**Windows**:
```bash
.\deploy.bat
```

**Linux/Mac**:
```bash
chmod +x deploy.sh
./deploy.sh
```

### Opção 2: Manual (Via Web)

1. **Backend no Railway**: [Guia Rápido](QUICK-DEPLOY.md#2️⃣-deploy-backend-railway)
2. **Frontend no Vercel**: [Guia Rápido](QUICK-DEPLOY.md#3️⃣-deploy-frontend-vercel)

> 📖 **Ver também**: [DEPLOY.md](DEPLOY.md) (guia completo) | [QUICK-DEPLOY.md](QUICK-DEPLOY.md) (5 passos)

### Mobile (Expo EAS)

```bash
cd apps/mobile
eas build --platform android
eas submit --platform android
```

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| **[INSTALLATION.md](INSTALLATION.md)** | Guia passo a passo de instalação |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Estrutura completa do monorepo |
| **[AI-AGENT-GUIDE.md](AI-AGENT-GUIDE.md)** | **Guia para agentes de IA** 🤖 |
| **[PROJECT-STATUS.md](PROJECT-STATUS.md)** | Status detalhado do projeto |
| **[ROADMAP.md](ROADMAP.md)** | Roadmap de desenvolvimento |
| **[API.md](API.md)** | Documentação completa da API |
| **[DEPLOY.md](DEPLOY.md)** | 🚀 **Guia de Deploy Completo** |
| **[QUICK-DEPLOY.md](QUICK-DEPLOY.md)** | ⚡ **Deploy em 5 Passos** |
| **[READY-FOR-DEPLOY.md](READY-FOR-DEPLOY.md)** | ✅ **Checklist Final** |

### 📡 API Docs (Swagger)

```
http://localhost:3333/api/docs
```

### Principais Endpoints Implementados

**Autenticação**
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login
- `POST /auth/refresh` - Renovar token
- `GET /auth/me` - Dados do usuário autenticado

**Barbearias (Tenants)**
- `GET /tenants` - Listar barbearias
- `GET /tenants/nearby?latitude=X&longitude=Y` - Buscar próximas
- `GET /tenants/slug/:slug` - Buscar por slug
- `POST /tenants` - Criar barbearia
- `PUT /tenants/:id` - Atualizar barbearia

**Barbeiros**
- `GET /barbers` - Listar barbeiros
- `POST /barbers` - Criar barbeiro
- `GET /barbers/:id/schedule?date=YYYY-MM-DD` - Ver agenda
- `POST /barbers/:id/check-availability` - Verificar disponibilidade

**Serviços**
- `GET /services` - Listar serviços
- `GET /services/barber/:barberId` - Serviços por barbeiro
- `POST /services` - Criar serviço
- `PUT /services/:id` - Atualizar serviço

**Agendamentos**
- `GET /appointments` - Listar agendamentos
- `GET /appointments/upcoming` - Próximos agendamentos
- `POST /appointments` - Criar agendamento
- `PATCH /appointments/:id/status` - Alterar status
- `DELETE /appointments/:id` - Cancelar

**Transações Financeiras**
- `GET /transactions` - Listar com filtros
- `GET /transactions/period?startDate=X&endDate=Y` - Por período
- `GET /transactions/summary/:type` - Resumo por categoria
- `POST /transactions` - Criar transação
- `PUT /transactions/:id` - Atualizar transação

**Caixa Diário (CashFlow)**
- `POST /cash-flow/open` - Abrir caixa
- `GET /cash-flow/current` - Caixa atual
- `POST /cash-flow/:id/movement` - Registrar movimento
- `POST /cash-flow/:id/close` - Fechar caixa
- `GET /cash-flow/daily/:date` - Resumo do dia
- `GET /cash-flow/history` - Histórico

```
✅ POST   /auth/login              - Login
✅ POST   /auth/register           - Registro
✅ POST   /auth/refresh            - Refresh token
✅ GET    /auth/me                 - Usuário autenticado
✅ GET    /users                   - Listar usuários
⏳ POST   /appointments            - Criar agendamento
⏳ POST   /transactions            - Registrar transação
⏳ GET    /cash-flow               - Fluxo de caixa
⏳ GET    /reports/financial       - Relatório financeiro
```

## 🧪 Testes

```bash
# Backend
cd apps/api
npm run test
npm run test:e2e

# Web
cd apps/web
npm run test

# Mobile
cd apps/mobile
npm run test
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤖 Para Agentes de IA

Se você é uma IA trabalhando neste projeto:

1. **LEIA PRIMEIRO**: [AI-AGENT-GUIDE.md](AI-AGENT-GUIDE.md)
2. Consulte os tipos em `packages/shared/src/types.ts`
3. Siga os padrões dos módulos existentes (Auth, Users)
4. **SEMPRE** filtrar por `tenantId` (multi-tenant)
5. Use decorators do NestJS e Swagger

## 🎯 Próximos Passos

1. Implementar módulo **Appointments** (alta prioridade)
2. Implementar módulo **Transactions + CashFlow** (CORE)
3. Criar dashboard web com Next.js
4. Desenvolver app mobile com animações premium

Ver [ROADMAP.md](ROADMAP.md) para plano completo.

## 📞 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido com ❤️ e ☕**  
**Status**: Fundação Completa ✅ | Em Desenvolvimento Ativo 🚀
