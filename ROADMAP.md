# 🗺️ Roadmap - BarberSaas

**Última atualização:** 19 de Dezembro de 2025  
**Progresso:** 43% completo

## 📊 Status Geral do Projeto

```
Backend API:    [████████████░░░░░░░░] 60%  ✅ Fundação completa
Frontend Web:   [███████████████░░░░░] 75%  ✅ Dashboard funcional
Mobile App:     [░░░░░░░░░░░░░░░░░░░░] 0%   🚨 Não iniciado
```

---

## ✅ Fase 0: Fundação (COMPLETO)

### Infraestrutura
- [x] Monorepo configurado (apps/api, apps/web)
- [x] Docker Compose (PostgreSQL + Redis)
- [x] Scripts de setup automatizados
- [x] Configuração de deploy (Vercel + Railway)

### Backend API
- [x] NestJS + Prisma + PostgreSQL
- [x] Autenticação JWT + Refresh Token
- [x] Multi-tenant completo (isolamento por barbearia)
- [x] RBAC (OWNER, ADMIN, BARBER, CUSTOMER)
- [x] WebSocket (real-time)
- [x] 74+ validações em PT-BR
- [x] Global Exception Filter
- [x] Rate limiting global

### Módulos Implementados
- [x] Auth (register, login, refresh, logout)
- [x] Users (CRUD, perfil)
- [x] Tenants (CRUD de barbearias)
- [x] Barbers (CRUD, relação com serviços)
- [x] Services (CRUD de serviços)
- [x] Appointments (CRUD, real-time, validações)
- [x] Transactions (receitas e despesas)
- [x] CashFlow (abrir/fechar caixa)
- [x] Reports (financeiro, comissões) - parcial

### Database
- [x] Schema completo (12 models)
- [x] Migrations
- [x] Índices compostos otimizados
- [x] Seed com dados de teste

### Frontend Web
- [x] Next.js 14 + Tailwind CSS
- [x] Login e autenticação
- [x] Dashboard (métricas básicas)
- [x] Gestão de agendamentos
- [x] Gestão de barbeiros e serviços
- [x] Controle financeiro (caixa, transações)
- [x] Relatórios básicos

---

## 🔴 Fase 1: Módulos Críticos (EM ANDAMENTO - 2-3 semanas)

### 1.1 Schedules Module ✅ COMPLETO
**Pasta:** `apps/api/src/schedules/`  
**Status:** Implementado e documentado

**Implementado:**
- ✅ Service com lógica de slots disponíveis
- ✅ `GET /schedules/available` - Slots disponíveis (15min)
- ✅ `POST /schedules/block` - Bloquear horário
- ✅ `DELETE /schedules/block/:id` - Desbloquear
- ✅ `GET /barbers/:id/working-hours` - Horários de trabalho
- ✅ `PATCH /barbers/:id/working-hours` - Atualizar horários
- ✅ Campo `workingHours Json?` no modelo Barber
- ✅ Modelo `BlockedSchedule`
- ✅ Migration criada
- ✅ Cálculo de slots considerando:
  - Agendamentos existentes
  - Duração do serviço
  - Horários de trabalho do barbeiro
  - Horários bloqueados
  - Slots no passado
- ✅ Documentação completa (IMPLEMENTATION-SUMMARY.md)
- ✅ Testes documentados (SCHEDULES-TESTS.md)

**Arquivos criados:**
- 9 arquivos (DTOs, Service, Controller, Module, Docs)
- ~600 linhas de código
- 6 endpoints REST
- 15+ validações

**Status:** ✅ BLOQUEADOR RESOLVIDO - Sistema de agendamento funcional!

---

### 1.2 Payments Module 🚨 BLOQUEADOR
**Pasta:** `apps/api/src/payments/`  
**Status:** Vazia - precisa implementar

**Endpoints:**
- [ ] `POST /payments/pix` - Gerar QR Code Pix
  - Body: `appointmentId`, `amount`
  - Retorna: `qrCode`, `qrCodeText`, `paymentId`
- [ ] `GET /payments/:id/status` - Consultar status
- [ ] `POST /payments/webhook` - Webhook de confirmação

**Integração:**
- [ ] Criar conta Mercado Pago sandbox
- [ ] Instalar SDK `mercadopago`
- [ ] Configurar credenciais (env)
- [ ] Validar assinatura do webhook

**Fluxo:**
- [ ] Cliente solicita pagamento
- [ ] Sistema gera Pix e retorna QR Code
- [ ] Cliente paga
- [ ] Webhook confirma pagamento
- [ ] Sistema atualiza Appointment → CONFIRMED
- [ ] Sistema cria Transaction → INCOME
- [ ] Notifica cliente e barbeiro

**Prioridade:** ⭐⭐⭐ CRÍTICA  
**Estimativa:** 1 semana

---

### 1.3 Notifications Module 🟡 IMPORTANTE
**Pasta:** `apps/api/src/notifications/`  
**Status:** Vazia - precisa implementar

**Endpoints:**
- [ ] `POST /notifications/send` - Enviar individual
- [ ] `POST /notifications/broadcast` - Enviar múltiplos
- [ ] `GET /notifications/me` - Listar minhas
- [ ] `PATCH /notifications/:id/read` - Marcar como lida

**Integração:**
- [ ] Configurar Firebase Cloud Messaging
- [ ] Instalar `firebase-admin`
- [ ] CRUD de PushTokens

**Notificações Automáticas:**
- [ ] Agendamento confirmado
- [ ] Agendamento cancelado
- [ ] Lembrete 1h antes (cron job)
- [ ] Promoção ativa

**Prioridade:** ⭐⭐ MÉDIA  
**Estimativa:** 1 semana

---

## 🟡 Fase 2: Backend - Complementar (1-2 semanas)

### 2.1 Promotions Module
**Pasta:** `apps/api/src/promotions/`

**Endpoints:**
- [ ] `POST /promotions` - Criar promoção
- [ ] `GET /promotions` - Listar ativas
- [ ] `PATCH /promotions/:id` - Editar
- [ ] `DELETE /promotions/:id` - Desativar
- [ ] `POST /promotions/:id/apply` - Aplicar cupom

**Features:**
- [ ] Tipos: PERCENTAGE, FIXED_AMOUNT, FREE_SERVICE
- [ ] Validação de data e limite de uso
- [ ] Sistema de cupons únicos
- [ ] Integração com Appointments

**Estimativa:** 3 dias

---

### 2.2 Reports - Exportação
**Pasta:** `apps/api/src/reports/`

- [ ] Instalar biblioteca PDF (puppeteer/pdfkit)
- [ ] `GET /reports/export/csv` - Exportar CSV
- [ ] `GET /reports/export/pdf` - Exportar PDF
- [ ] Gráficos de tendências

**Estimativa:** 2 dias

---

### 2.3 Melhorias de Segurança
- [ ] CSRF Protection (csurf)
- [ ] Auto-detect OWNER role
- [ ] Rate limiting específico por endpoint

**Estimativa:** 2 dias

---

## 🟢 Fase 3: Mobile App - MVP (6-8 semanas) 🚨 CRÍTICO

### Semana 1-2: Setup e Autenticação
- [ ] Criar `apps/mobile/` com Expo
- [ ] Configurar React Navigation
- [ ] Theme provider (dark + #F5A027)
- [ ] API client (Axios + AsyncStorage)
- [ ] Componentes base (Button, Input, Card, Avatar)
- [ ] Telas: Splash, Login, Registro, Recuperação

---

### Semana 3-4: Home e Busca
- [ ] Home Screen (barbearias próximas, destaques)
- [ ] Integrar Geolocalização (expo-location)
- [ ] Integrar Google Maps API
- [ ] Busca com filtros
- [ ] Detalhes da Barbearia (fotos, serviços, avaliações)

---

### Semana 5-6: Agendamento
- [ ] Fluxo 4 steps:
  1. Selecionar barbeiro
  2. Selecionar serviço
  3. Selecionar data/hora
  4. Confirmar e pagar
- [ ] Animações Reanimated
- [ ] Integração com `/schedules/available`
- [ ] Integração com `/payments/pix`
- [ ] QR Code e polling de status

---

### Semana 7: Meus Agendamentos
- [ ] Listagem (tabs: Futuros, Passados, Cancelados)
- [ ] Detalhes e cancelamento
- [ ] Tela de Avaliação (stars + comentário)

---

### Semana 8: Perfil e Notificações
- [ ] Perfil (editar, upload avatar)
- [ ] Histórico de Pagamentos
- [ ] Configurações (notificações, tema, logout)
- [ ] Firebase Push Notifications

---

## 🔵 Fase 4: Refinamentos (1-2 semanas)

### Frontend Web
- [ ] Página de Conciliação Financeira
- [ ] Página de Promoções
- [ ] Component de Horários de Trabalho
- [ ] Exportação CSV/PDF
- [ ] Loading states e confirmações
- [ ] PWA (opcional)

### Testes
- [ ] Testes E2E (Cypress)
- [ ] Testes de carga (k6)
- [ ] Testes de segurança

---

## 📋 Resumo de Prioridades

### 🚨 Críticas (Bloqueiam MVP):
1. **Schedules Module** - Disponibilidade de horários
2. **Payments Module** - Core do negócio
3. **Mobile App** - 1/3 do produto

### ⚠️ Importantes:
4. **Notifications Module** - Engagement
5. **Promotions Module** - Marketing
6. **Reports Exportação** - Gestão

### ✨ Nice-to-Have:
7. Conciliação financeira
8. PWA
9. Dark mode toggle
10. Testes automatizados

---

## 🎯 Meta Final

**Lançamento Beta:** 16 semanas (4 meses)  
**MVP Completo:** Todas funcionalidades críticas implementadas  
**Status:** Pronto para primeiros clientes

---

## 📝 Próximos Passos

1. ✅ Implementar **Schedules Module**
2. ✅ Integrar **Pagamentos Pix**
3. ✅ Iniciar **Mobile App**
4. ✅ Implementar **Notifications**
5. ✅ Launch Beta 🚀
  - Detalhes
  - Cancelar

#### Semana 4: Perfil e Pagamento
- [ ] Perfil do Usuário
  - Editar dados
  - Upload de foto
  - Histórico de pagamentos
- [ ] Tela de Pagamento Pix
  - Exibir QR Code
  - Copiar chave Pix
  - Confirmação

---

### Fase 4: Features Avançadas 🔵 AGUARDANDO
**Duração Estimada**: 2-3 semanas
**Status**: ⏳ Aguardando Fase 3

#### Real-time (Socket.io)
- [ ] Configurar Socket.io no backend
- [ ] Eventos de agendamento
- [ ] Notificações em tempo real
- [ ] Sincronização de agenda

#### Push Notifications
- [ ] Firebase Cloud Messaging
- [ ] Envio de notificações
- [ ] Gerenciar tokens de dispositivo
- [ ] Notificações programadas
  - Lembrete de agendamento (1h antes)
  - Promoções

#### Pagamentos
- [ ] Integração Pix real (API)
- [ ] Webhook de confirmação
- [ ] Preparar camada para cartões
- [ ] Histórico de transações

#### Relatórios Avançados
- [ ] Exportação PDF
- [ ] Gráficos interativos
- [ ] Dashboard analytics
- [ ] Previsão de receita

---

### Fase 5: Polimento e Deploy 🔵 AGUARDANDO
**Duração Estimada**: 2 semanas
**Status**: ⏳ Aguardando Fase 4

#### Testes
- [ ] Cobertura de testes > 80%
- [ ] Testes E2E completos
- [ ] Testes de carga (k6)
- [ ] Testes de segurança

#### Performance
- [ ] Otimização de queries
- [ ] Cache com Redis
- [ ] Lazy loading (frontend)
- [ ] Compressão de imagens

#### Deploy
- [ ] Backend no Railway/Render
- [ ] Web no Vercel
- [ ] Mobile build (EAS)
- [ ] CI/CD com GitHub Actions

#### Documentação
- [ ] API docs completa
- [ ] Guia do usuário
- [ ] Vídeos tutoriais
- [ ] FAQ

---

## 📊 Métricas de Progresso

### Backend
```
Módulos Implementados:  3/12 (25%)
├─ Auth             ✅
├─ Users            ✅
├─ Prisma           ✅
├─ Tenants          ⏳
├─ Barbers          ⏳
├─ Services         ⏳
├─ Appointments     ⏳
├─ Payments         ⏳
├─ Transactions     ⏳
├─ CashFlow         ⏳
├─ Promotions       ⏳
└─ Reports          ⏳
```

### Frontend Web
```
Telas Implementadas: 0/15 (0%)
├─ Login            ⏳
├─ Dashboard        ⏳
├─ Agenda           ⏳
├─ Caixa            ⏳
├─ Transações       ⏳
├─ Relatórios       ⏳
├─ Barbeiros        ⏳
├─ Serviços         ⏳
├─ Marketing        ⏳
└─ Configurações    ⏳
```

### Frontend Mobile
```
Telas Implementadas: 0/12 (0%)
├─ Splash           ⏳
├─ Login            ⏳
├─ Home             ⏳
├─ Barbearias       ⏳
├─ Agendamento      ⏳
├─ Meus Agendamentos ⏳
├─ Perfil           ⏳
└─ Pagamento        ⏳
```

---

## 🎯 Milestones

| # | Nome | Data Alvo | Status |
|---|------|-----------|--------|
| 1 | Fundação Completa | ✅ Concluído | ✅ |
| 2 | Backend Core Funcional | +3 semanas | ⏳ |
| 3 | Dashboard Web MVP | +7 semanas | ⏳ |
| 4 | App Mobile MVP | +11 semanas | ⏳ |
| 5 | Features Avançadas | +14 semanas | ⏳ |
| 6 | Launch 1.0 | +16 semanas | ⏳ |

---

## 🚀 Quick Start

### Para Começar AGORA:

```bash
# 1. Clone e configure
git clone <repo>
cd barbersaas
setup.bat  # ou ./setup.sh no Linux/Mac

# 2. Inicie o backend
cd apps/api
npm run dev

# 3. Teste no Swagger
# http://localhost:3333/api/docs

# 4. Implemente o próximo módulo
# Consulte: AI-AGENT-GUIDE.md
```

### Próximo Módulo Recomendado:

**Appointments** (apps/api/src/appointments/)

1. Implementar AppointmentsService
2. Criar DTOs de validação
3. Implementar Controller
4. Adicionar testes
5. Documentar no Swagger

**Template disponível**: `AI-AGENT-GUIDE.md`

---

## 📞 Suporte

- 📚 Documentação: Ver arquivos `*.md` na raiz
- 🤖 Para IAs: `AI-AGENT-GUIDE.md`
- 🐛 Issues: GitHub Issues
- 💬 Discussões: GitHub Discussions

---

**Última Atualização**: 1 de dezembro de 2025  
**Versão**: 0.4.0 (Fundação Completa)  
**Próxima Release**: 0.5.0 (Backend Core)
