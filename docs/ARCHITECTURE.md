# 🏗️ Estrutura Completa do Projeto BarberSaas

Este documento descreve a estrutura completa do monorepo.

## 📁 Estrutura de Diretórios

```
barbersaas/
├── .github/
│   └── copilot-instructions.md      # Instruções para agentes de IA
│
├── apps/
│   ├── api/                          # Backend NestJS
│   │   ├── prisma/
│   │   │   ├── migrations/           # Migrations do banco
│   │   │   ├── schema.prisma         # Schema do Prisma
│   │   │   └── seed.ts               # Dados de exemplo
│   │   │
│   │   ├── src/
│   │   │   ├── auth/                 # Autenticação JWT
│   │   │   │   ├── decorators/
│   │   │   │   ├── dto/
│   │   │   │   ├── guards/
│   │   │   │   ├── strategies/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.module.ts
│   │   │   │
│   │   │   ├── users/                # Gerenciamento de usuários
│   │   │   │   ├── dto/
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   └── users.module.ts
│   │   │   │
│   │   │   ├── tenants/              # Barbearias (Multi-tenant)
│   │   │   │   ├── dto/
│   │   │   │   ├── tenants.controller.ts
│   │   │   │   ├── tenants.service.ts
│   │   │   │   └── tenants.module.ts
│   │   │   │
│   │   │   ├── barbers/              # Barbeiros
│   │   │   │   ├── dto/
│   │   │   │   ├── barbers.controller.ts
│   │   │   │   ├── barbers.service.ts
│   │   │   │   └── barbers.module.ts
│   │   │   │
│   │   │   ├── services/             # Serviços da barbearia
│   │   │   │   ├── dto/
│   │   │   │   ├── services.controller.ts
│   │   │   │   ├── services.service.ts
│   │   │   │   └── services.module.ts
│   │   │   │
│   │   │   ├── appointments/         # Agendamentos
│   │   │   │   ├── dto/
│   │   │   │   ├── appointments.controller.ts
│   │   │   │   ├── appointments.service.ts
│   │   │   │   ├── appointments.gateway.ts
│   │   │   │   └── appointments.module.ts
│   │   │   │
│   │   │   ├── payments/             # Pagamentos (Pix, etc)
│   │   │   │   ├── dto/
│   │   │   │   ├── payments.controller.ts
│   │   │   │   ├── payments.service.ts
│   │   │   │   └── payments.module.ts
│   │   │   │
│   │   │   ├── transactions/         # Transações financeiras
│   │   │   │   ├── dto/
│   │   │   │   ├── transactions.controller.ts
│   │   │   │   ├── transactions.service.ts
│   │   │   │   └── transactions.module.ts
│   │   │   │
│   │   │   ├── cash-flow/            # Fluxo de caixa
│   │   │   │   ├── dto/
│   │   │   │   ├── cash-flow.controller.ts
│   │   │   │   ├── cash-flow.service.ts
│   │   │   │   └── cash-flow.module.ts
│   │   │   │
│   │   │   ├── promotions/           # Promoções e cupons
│   │   │   │   ├── dto/
│   │   │   │   ├── promotions.controller.ts
│   │   │   │   ├── promotions.service.ts
│   │   │   │   └── promotions.module.ts
│   │   │   │
│   │   │   ├── reports/              # Relatórios
│   │   │   │   ├── reports.controller.ts
│   │   │   │   ├── reports.service.ts
│   │   │   │   └── reports.module.ts
│   │   │   │
│   │   │   ├── notifications/        # Push notifications
│   │   │   │   ├── notifications.service.ts
│   │   │   │   └── notifications.module.ts
│   │   │   │
│   │   │   ├── prisma/               # Prisma service
│   │   │   │   ├── prisma.service.ts
│   │   │   │   └── prisma.module.ts
│   │   │   │
│   │   │   ├── common/               # Shared utilities
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── pipes/
│   │   │   │   └── utils/
│   │   │   │
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   │
│   │   ├── test/
│   │   ├── .env.example
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                          # Painel Web Next.js 14
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/                  # App Router
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   │
│   │   │   │   ├── (dashboard)/
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── page.tsx      # Dashboard
│   │   │   │   │   ├── agenda/       # Gestão de agenda
│   │   │   │   │   ├── barbeiros/    # Gestão de barbeiros
│   │   │   │   │   ├── servicos/     # Gestão de serviços
│   │   │   │   │   ├── financeiro/   # Módulo financeiro
│   │   │   │   │   │   ├── caixa/
│   │   │   │   │   │   ├── transacoes/
│   │   │   │   │   │   └── relatorios/
│   │   │   │   │   ├── marketing/    # Promoções, cupons
│   │   │   │   │   └── configuracoes/
│   │   │   │   │
│   │   │   │   ├── api/              # API Routes
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ui/               # Componentes Shadcn
│   │   │   │   ├── dashboard/
│   │   │   │   ├── appointments/
│   │   │   │   ├── financial/
│   │   │   │   └── layouts/
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── api.ts
│   │   │   │   ├── utils.ts
│   │   │   │   └── validations.ts
│   │   │   │
│   │   │   ├── hooks/
│   │   │   ├── contexts/
│   │   │   └── styles/
│   │   │
│   │   ├── .env.example
│   │   ├── next.config.js
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   └── tsconfig.json
│   │
│   └── mobile/                       # App Mobile React Native
│       ├── assets/
│       ├── src/
│       │   ├── screens/              # Telas
│       │   │   ├── Auth/
│       │   │   │   ├── LoginScreen.tsx
│       │   │   │   └── RegisterScreen.tsx
│       │   │   ├── Home/
│       │   │   │   └── HomeScreen.tsx
│       │   │   ├── Barbershop/
│       │   │   │   ├── BarbershopDetailsScreen.tsx
│       │   │   │   └── BarbershopListScreen.tsx
│       │   │   ├── Appointment/
│       │   │   │   ├── AppointmentBookingScreen.tsx
│       │   │   │   ├── AppointmentListScreen.tsx
│       │   │   │   └── AppointmentDetailsScreen.tsx
│       │   │   ├── Profile/
│       │   │   │   └── ProfileScreen.tsx
│       │   │   └── Payment/
│       │   │       └── PaymentScreen.tsx
│       │   │
│       │   ├── components/
│       │   │   ├── common/
│       │   │   ├── barbershop/
│       │   │   ├── appointment/
│       │   │   └── animations/
│       │   │
│       │   ├── navigation/
│       │   │   ├── AppNavigator.tsx
│       │   │   ├── AuthNavigator.tsx
│       │   │   └── MainNavigator.tsx
│       │   │
│       │   ├── services/
│       │   │   ├── api.ts
│       │   │   ├── auth.ts
│       │   │   ├── storage.ts
│       │   │   └── notifications.ts
│       │   │
│       │   ├── hooks/
│       │   ├── contexts/
│       │   ├── utils/
│       │   ├── constants/
│       │   ├── theme/
│       │   └── types/
│       │
│       ├── app.json
│       ├── App.tsx
│       ├── .env.example
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                       # Tipos compartilhados
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── constants.ts
│   │   │   ├── utils.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                           # Componentes UI reutilizáveis
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── config/                       # Configs compartilhadas
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── nginx.conf
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── deploy.yml
│   └── copilot-instructions.md
│
├── docker-compose.yml
├── .gitignore
├── .prettierrc
├── package.json
├── tsconfig.json
├── README.md
└── INSTALLATION.md
```

## 🎯 Arquivos Principais por Módulo

### Backend (NestJS)

Cada módulo segue a estrutura:

```
módulo/
├── dto/
│   ├── create-{módulo}.dto.ts
│   ├── update-{módulo}.dto.ts
│   └── query-{módulo}.dto.ts
├── {módulo}.controller.ts    # Endpoints REST
├── {módulo}.service.ts        # Lógica de negócio
├── {módulo}.module.ts         # Configuração do módulo
└── {módulo}.spec.ts           # Testes
```

### Web (Next.js)

Estrutura do App Router:

```
app/
├── (auth)/                    # Grupo de rotas de autenticação
│   └── login/
│       └── page.tsx
│
├── (dashboard)/               # Grupo de rotas do dashboard
│   ├── layout.tsx             # Layout compartilhado
│   └── page.tsx               # Página principal
│
└── api/                       # API Routes
    └── [...]/
```

### Mobile (React Native)

Organização por features:

```
src/
├── screens/                   # Telas principais
├── components/                # Componentes reutilizáveis
├── navigation/                # React Navigation
├── services/                  # Integrações API
├── hooks/                     # Custom hooks
└── contexts/                  # Context API
```

## 🔑 Arquivos de Configuração Importantes

| Arquivo | Descrição |
|---------|-----------|
| `docker-compose.yml` | Orquestra PostgreSQL, Redis e MailHog |
| `prisma/schema.prisma` | Schema do banco de dados |
| `nest-cli.json` | Configuração do NestJS CLI |
| `next.config.js` | Configuração do Next.js |
| `tailwind.config.js` | Tema dark customizado |
| `app.json` | Configuração do Expo |
| `tsconfig.json` | TypeScript config |

## 📦 Dependências Principais

### Backend
- `@nestjs/core` - Framework
- `@prisma/client` - ORM
- `bcrypt` - Hash de senhas
- `@nestjs/jwt` - Autenticação
- `socket.io` - Real-time
- `@nestjs/swagger` - Documentação

### Web
- `next` - Framework React
- `tailwindcss` - Estilização
- `shadcn/ui` - Componentes
- `react-query` - Estado servidor
- `recharts` - Gráficos

### Mobile
- `expo` - Toolchain
- `react-native` - Framework
- `@react-navigation` - Navegação
- `react-native-reanimated` - Animações
- `axios` - HTTP client

## 🚀 Próximos Passos

1. Execute `npm install` na raiz
2. Siga o arquivo `INSTALLATION.md` para configurar
3. Use o arquivo `.github/copilot-instructions.md` para orientar IAs

---

Esta estrutura foi projetada para ser escalável, modular e fácil de manter.
