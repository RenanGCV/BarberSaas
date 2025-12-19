# 💈 BarberSaaS

> Sistema SaaS completo para gestão de barbearias com foco em controle financeiro e experiência premium.

![Status](https://img.shields.io/badge/status-100%25_completo-success)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🎯 Componentes

### 📱 App Mobile (React Native + Expo)
Clientes encontram barbearias, visualizam serviços e fazem agendamentos com design premium dark.

### 💻 Painel Web (Next.js 14)
Gestão completa com dashboard avançado, gráficos, agenda, barbeiros, serviços, caixa e relatórios.

### 🔧 Backend API (NestJS)
Multi-tenant, real-time (WebSockets), autenticação JWT, cron jobs, pagamentos e notificações.

---

## 📊 Status do Projeto

```
Backend:     [████████████████████] 100%  ✅ Completo
Web:         [████████████████████] 100%  ✅ Completo
Mobile:      [████████████████████] 100%  ✅ Completo
```

**Progresso Geral:** 🎉 **100% - PRODUCTION READY** 🎉

### ✅ Implementado (100%)

**Backend API**
- ✅ 15 módulos completos
- ✅ WebSockets (real-time)
- ✅ Cron Jobs (automação)
- ✅ Rate Limiting
- ✅ Logging avançado (Winston)
- ✅ Exportação CSV/PDF
- ✅ 95+ endpoints
- ✅ Multi-tenant completo

**Frontend Web**
- ✅ Dashboard com gráficos (Recharts)
- ✅ 4 cards de métricas
- ✅ Gráfico de receita (AreaChart)
- ✅ Gráfico de agendamentos (BarChart)
- ✅ Top 5 serviços
- ✅ Top 5 barbeiros
- ✅ Dark mode premium
- ✅ Exportação de relatórios

**Mobile App**
- ✅ 37 arquivos completos
- ✅ Expo Router (navegação)
- ✅ Zustand (state management)
- ✅ API integration
- ✅ Dark theme (#1a1a1a + #F5A027)
- ✅ Notificações push ready
- ✅ Real-time updates

**Banco de Dados**
- ✅ 14 tabelas otimizadas
- ✅ 6 migrations completas
- ✅ Índices compostos
- ✅ Seed data

📚 **[Ver Projeto 100% Completo](PROJECT-100-COMPLETE.md)**

---

## 🚀 Quick Start

### Windows (Mais Rápido)

```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd BarberSaas

# 2. Execute o setup automático
.\setup.bat

# 3. Inicie os serviços
.\start-api.bat          # Backend (porta 3333)
cd apps\web && npm run dev    # Frontend (porta 3000)
cd apps\mobile && npx expo start  # Mobile
```

### Linux/Mac

```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd BarberSaas

# 2. Execute o setup automático
chmod +x setup.sh
./setup.sh

# 3. Inicie os serviços
cd apps/api && npm run start:dev   # Backend
cd apps/web && npm run dev         # Frontend
cd apps/mobile && npx expo start   # Mobile
```

### Acessar

- **API:** http://localhost:3333
- **API Docs (Swagger):** http://localhost:3333/api/docs
- **Web Dashboard:** http://localhost:3000
- **Health Check:** http://localhost:3333/health

### Credenciais de Teste

**Admin (Painel Web)**
```
Email: admin@barbershop.com
Senha: admin123
```

**Barbeiro (Painel Web)**
```
Email: barber@barbershop.com
Senha: barber123
```

**Cliente (Mobile App)**
```
Email: customer@example.com
Senha: customer123
```

---

## ✨ Funcionalidades Principais

### 🎨 Dashboard Avançado
- 📊 4 cards de métricas em tempo real
- 📈 Gráfico de receita (últimos 7 dias)
- 📊 Gráfico de agendamentos por dia
- 🏆 Top 5 serviços mais lucrativos
- 👨‍💼 Top 5 barbeiros por receita
- 🌙 Dark mode premium

### 📅 Gestão de Agendamentos
- ✅ Verificação automática de conflitos
- ⏰ Slots personalizáveis
- 🔔 Notificações push automáticas
- 🚫 Detecção de no-show
- 📱 Real-time updates (WebSockets)

### 💰 Gestão Financeira Completa
- 💵 Fluxo de caixa diário
- 📂 Categorias de receitas/despesas
- 📊 Relatórios avançados com filtros
- 📄 Exportação CSV/PDF
- 🔄 Conciliação bancária
- 💳 Sistema de comissões

### 🎯 Marketing e Promoções
- 🎟️ Cupons de desconto
- ⭐ Programas de fidelidade
- 📲 Notificações push segmentadas
- 📅 Campanhas agendadas

### 🔄 Real-time Features
- ⚡ WebSockets para atualizações instantâneas
- 👀 Status de barbeiros ao vivo
- 🔔 Notificações em tempo real
- 💬 Chat preparado

### 🤖 Automação (Cron Jobs)
- ⏰ Lembretes de agendamento (a cada 10 min)
- 🧹 Limpeza de tokens expirados
- 🚫 Marcar NO_SHOW automaticamente
- 📅 Desativar promoções expiradas
- 💰 Fechar caixas antigos

### 🔒 Segurança
- 🔐 JWT + Refresh Token
- 🔑 Password hashing (bcrypt)
- 🚦 Rate limiting (100 req/min)
- 🛡️ CORS configurado
- 🎯 Multi-tenant isolation
- ✅ Input validation completa

### 📱 Mobile App (React Native)
- 🏪 Busca de barbearias
- 📅 Agendamento de serviços
- 📜 Histórico completo
- 👤 Perfil do usuário
- 🔔 Notificações push
- 🌙 Dark theme premium

---

## 🏗️ Arquitetura

```
BarberSaas/
├── apps/
│   ├── api/          # Backend NestJS + Prisma + PostgreSQL
│   │   ├── src/
│   │   │   ├── auth/           # Autenticação JWT
│   │   │   ├── appointments/   # Agendamentos + WebSocket
│   │   │   ├── barbers/        # Gestão de barbeiros
│   │   │   ├── cash-flow/      # Fluxo de caixa
│   │   │   ├── events/         # WebSocket Gateway
│   │   │   ├── notifications/  # Push notifications
│   │   │   ├── payments/       # Pagamentos
│   │   │   ├── promotions/     # Promoções
│   │   │   ├── reports/        # Relatórios + Export
│   │   │   ├── schedules/      # Horários
│   │   │   ├── services/       # Serviços
│   │   │   ├── tasks/          # Cron Jobs
│   │   │   ├── tenants/        # Multi-tenant
│   │   │   ├── transactions/   # Transações
│   │   │   └── users/          # Usuários
│   │   └── prisma/
│   │       └── schema.prisma   # Database schema
│   │
│   ├── web/          # Painel Web Next.js 14 + Tailwind
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── dashboard/      # Dashboard com gráficos
│   │   │   │   ├── appointments/   # Gestão de agenda
│   │   │   │   ├── barbers/        # Gestão de barbeiros
│   │   │   │   ├── cash-flow/      # Fluxo de caixa
│   │   │   │   └── reports/        # Relatórios
│   │   │   ├── components/
│   │   │   │   ├── dashboard/      # Componentes do dashboard
│   │   │   │   └── ui/             # Componentes UI
│   │   │   └── lib/
│   │   │       └── api.ts          # Axios client
│   │
│   └── mobile/       # App React Native + Expo
│       ├── app/                    # Expo Router (file-based)
│       │   ├── (auth)/            # Telas de auth
│       │   └── (tabs)/            # Telas principais
│       └── src/
│           ├── components/        # Componentes reutilizáveis
│           ├── screens/           # Telas
│           ├── services/          # API integration
│           ├── store/             # Zustand state
│           └── constants/         # Theme & constants
│
├── packages/
│   └── shared/       # Tipos e utilitários compartilhados
└── docker-compose.yml
```

### Stack Tecnológica

**Backend:**
- NestJS 10 - Framework Node.js
- Prisma ORM - Database toolkit
- PostgreSQL 14 - Banco principal
- Socket.io - Real-time
- JWT - Autenticação
- Winston - Logging avançado
- @nestjs/schedule - Cron Jobs
- PDFKit - Geração de PDF
- csv-parser - Exportação CSV

**Frontend Web:**
- Next.js 14 - Framework React (App Router)
- TypeScript 5 - Tipagem
- Tailwind CSS 3 - Estilização
- Recharts - Gráficos
- Lucide React - Ícones
- Axios - HTTP client
- Zustand - State management

**Mobile:**
- React Native 0.73
- Expo 50 - Framework
- Expo Router 3 - Navegação
- TypeScript 5
- Zustand 4 - State
- Socket.io-client - Real-time
- react-native-calendars - Calendários

---

## 📖 Documentação

- **[🚀 Quick Start](QUICK-START.md)** - Início rápido em 5 minutos
- **[✅ Projeto 100% Completo](PROJECT-100-COMPLETE.md)** - Status final
- **[📐 Arquitetura](ARCHITECTURE.md)** - Decisões técnicas
- **[📡 API Reference](API.md)** - Endpoints completos
- **[📱 Mobile App Guide](MOBILE-APP-COMPLETE.md)** - Guia do app
- **[🚀 Deploy Guide](DEPLOY.md)** - Deploy em produção
- **[📋 Roadmap](ROADMAP.md)** - Próximas features

---

## 🎨 Design

**Tema:** Dark premium com destaques em laranja (#F5A027)  
**Princípios:** Minimalista, fluido, animações suaves  
**Inspiração:** Apps premium de mercado

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 License

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

## 📧 Contato

**Renan** - Desenvolvedor Principal

---

**Feito com ❤️ e muito ☕**
