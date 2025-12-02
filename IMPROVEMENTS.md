# 🚀 Melhorias e Próximos Passos - BarberSaas

> **Documento criado em:** 1 de dezembro de 2025  
> **Objetivo:** Registrar todas as melhorias sugeridas para não perder nenhuma funcionalidade até o app estar completo

---

## 📊 Status Atual do Projeto

```
Fundação:     [██████████] 100% ✅
Backend:      [████░░░░░░]  40% ⏳
Web:          [██░░░░░░░░]  20% ⏳
Mobile:       [░░░░░░░░░░]   0% ⏳
─────────────────────────────────
TOTAL:        [███░░░░░░░]  30%
```

---

## 🔴 PRIORIDADE MÁXIMA - BACKEND CORE

### 1. Módulo de Agendamentos (Appointments)

**Arquivo:** `apps/api/src/appointments/`

#### Funcionalidades Críticas:

- [ ] **CRUD Completo**
  ```typescript
  - POST   /appointments              // Criar agendamento
  - GET    /appointments              // Listar (com filtros)
  - GET    /appointments/:id          // Buscar por ID
  - GET    /appointments/upcoming     // Próximos agendamentos
  - PATCH  /appointments/:id/status   // Alterar status
  - DELETE /appointments/:id          // Cancelar
  ```

- [ ] **Validações de Negócio**
  - Verificar conflitos de horário
  - Validar disponibilidade do barbeiro
  - Não permitir agendamento no passado
  - Respeitar horário de funcionamento da barbearia
  - Validar duração do serviço
  - Verificar se barbeiro trabalha naquele dia/horário

- [ ] **Regras de Status**
  ```typescript
  enum AppointmentStatus {
    PENDING    // Aguardando confirmação
    CONFIRMED  // Confirmado pelo barbeiro
    COMPLETED  // Concluído
    CANCELLED  // Cancelado
    NO_SHOW    // Cliente não compareceu
  }
  ```

- [ ] **Notificações** (Mock inicial, real depois)
  - Email/SMS ao criar agendamento
  - Lembrete 1h antes (push notification)
  - Confirmação de conclusão

- [ ] **WebSocket (Real-time)**
  ```typescript
  // apps/api/src/appointments/appointments.gateway.ts
  @WebSocketGateway()
  export class AppointmentsGateway {
    @SubscribeMessage('appointment:created')
    @SubscribeMessage('appointment:updated')
    @SubscribeMessage('appointment:cancelled')
  }
  ```

#### DTOs Necessários:

```typescript
// create-appointment.dto.ts
- tenantId: string
- clientId: string
- barberId: string
- serviceId: string
- scheduledFor: Date
- notes?: string

// update-appointment.dto.ts
- scheduledFor?: Date
- status?: AppointmentStatus
- notes?: string

// query-appointment.dto.ts
- barberId?: string
- clientId?: string
- status?: AppointmentStatus
- startDate?: Date
- endDate?: Date
- page?: number
- limit?: number
```

#### Endpoints Adicionais:

- [ ] `GET /barbers/:id/schedule?date=YYYY-MM-DD` - Ver agenda do barbeiro
- [ ] `POST /barbers/:id/check-availability` - Verificar horários disponíveis
- [ ] `GET /appointments/calendar?month=MM&year=YYYY` - Visão de calendário
- [ ] `GET /appointments/stats` - Estatísticas de agendamentos

---

### 2. Sistema Financeiro (Transactions + CashFlow)

**Arquivos:** 
- `apps/api/src/transactions/`
- `apps/api/src/cash-flow/`

#### 2.1 Transactions (Transações)

- [ ] **CRUD Completo**
  ```typescript
  - POST   /transactions               // Criar transação
  - GET    /transactions               // Listar com filtros
  - GET    /transactions/:id           // Buscar por ID
  - PUT    /transactions/:id           // Atualizar
  - DELETE /transactions/:id           // Deletar (soft delete)
  - GET    /transactions/period        // Por período
  - GET    /transactions/summary/:type // Resumo por categoria
  ```

- [ ] **Tipos de Transação**
  ```typescript
  enum TransactionType {
    INCOME    // Receita (agendamento, produto vendido)
    EXPENSE   // Despesa (aluguel, salário, produto comprado)
  }
  
  enum PaymentMethod {
    CASH      // Dinheiro
    PIX       // Pix
    DEBIT     // Débito
    CREDIT    // Crédito
    TRANSFER  // Transferência
  }
  ```

- [ ] **Categorias**
  ```typescript
  // Receitas
  - Serviços (corte, barba, etc)
  - Produtos (pomada, shampoo)
  - Outros
  
  // Despesas
  - Salários/Comissões
  - Aluguel
  - Água/Luz/Internet
  - Produtos para revenda
  - Equipamentos
  - Marketing
  - Outros
  ```

- [ ] **Relacionamentos**
  - Transação pode vir de um Appointment (receita automática)
  - Transação pode ser manual (receita/despesa manual)
  - Transação deve estar linkada a um CashFlow (caixa do dia)

- [ ] **Cálculos Automáticos**
  - Total de receitas (período)
  - Total de despesas (período)
  - Saldo (receitas - despesas)
  - Agrupamento por categoria
  - Agrupamento por método de pagamento
  - Comissão dos barbeiros (% sobre serviços)

#### 2.2 CashFlow (Fluxo de Caixa)

- [ ] **Operações Principais**
  ```typescript
  - POST   /cash-flow/open             // Abrir caixa
  - GET    /cash-flow/current          // Caixa atual (aberto)
  - POST   /cash-flow/:id/movement     // Registrar movimento
  - POST   /cash-flow/:id/close        // Fechar caixa
  - GET    /cash-flow/daily/:date      // Resumo do dia
  - GET    /cash-flow/history          // Histórico de caixas
  ```

- [ ] **Abertura de Caixa**
  ```typescript
  {
    openedAt: Date
    openedBy: string (userId)
    initialBalance: number  // Valor inicial (troco)
    status: 'OPEN'
  }
  ```

- [ ] **Movimentações**
  - Todas as transações do dia vão para o caixa aberto
  - Registrar entrada manual (vendas não agendadas)
  - Registrar saída manual (despesas do dia)
  - Sangria (retirada de dinheiro)
  - Reforço (adição de troco)

- [ ] **Fechamento de Caixa**
  ```typescript
  {
    closedAt: Date
    closedBy: string (userId)
    finalBalance: number      // Calculado
    expectedBalance: number   // Calculado
    difference: number        // finalBalance - expectedBalance
    
    // Contagem por método
    cashCount: number
    pixCount: number
    debitCount: number
    creditCount: number
    
    // Totais
    totalIncome: number
    totalExpense: number
    totalNet: number
    
    notes?: string            // Observações sobre diferenças
  }
  ```

- [ ] **Validações**
  - Não pode abrir caixa se já existe um aberto
  - Não pode fechar caixa de outro usuário (apenas owner/admin)
  - Alertar se houver diferença > R$ 10,00
  - Registrar histórico de todas operações (audit log)

- [ ] **Conciliação**
  - Comparar valor esperado vs contado
  - Gerar relatório de divergências
  - Permitir ajustes com justificativa

---

### 3. Módulo de Relatórios (Reports)

**Arquivo:** `apps/api/src/reports/`

#### Relatórios Essenciais:

- [ ] **Relatório Financeiro**
  ```typescript
  GET /reports/financial?startDate=X&endDate=Y&format=json|csv|pdf
  
  Retorna:
  - Total de receitas (por categoria)
  - Total de despesas (por categoria)
  - Saldo líquido
  - Métodos de pagamento mais usados
  - Gráfico de evolução diária
  ```

- [ ] **Relatório de Comissões**
  ```typescript
  GET /reports/commissions/:barberId?month=MM&year=YYYY
  
  Retorna:
  - Total de serviços realizados
  - Valor total gerado
  - Comissão calculada (%)
  - Detalhamento por serviço
  - Detalhamento por dia
  ```

- [ ] **Relatório de Agendamentos**
  ```typescript
  GET /reports/appointments?startDate=X&endDate=Y
  
  Retorna:
  - Total de agendamentos
  - Taxa de comparecimento (completed vs no_show)
  - Taxa de cancelamento
  - Horários mais procurados
  - Serviços mais procurados
  - Barbeiros mais requisitados
  ```

- [ ] **Relatório de Produtos/Serviços**
  ```typescript
  GET /reports/services?period=month|week|day
  
  Retorna:
  - Serviços mais vendidos
  - Receita por serviço
  - Ticket médio
  - Tempo médio de atendimento
  ```

- [ ] **Dashboard Metrics**
  ```typescript
  GET /reports/dashboard/today
  
  Retorna:
  - Agendamentos do dia
  - Valor faturado hoje
  - Próximos agendamentos
  - Status dos barbeiros (livre/ocupado)
  - Alertas (caixa aberto, agendamentos pendentes)
  ```

#### Exportação:

- [ ] **CSV Export**
  - Gerar arquivo CSV de qualquer relatório
  - Headers em português
  - Formato Excel-friendly

- [ ] **PDF Export** (Fase 2)
  - Usar biblioteca (puppeteer ou pdfkit)
  - Template com logo da barbearia
  - Formatação profissional

---

### 4. Módulo de Barbearias (Tenants)

**Arquivo:** `apps/api/src/tenants/`

- [ ] **CRUD Completo**
  ```typescript
  - GET    /tenants                    // Listar
  - GET    /tenants/:id                // Buscar por ID
  - GET    /tenants/slug/:slug         // Buscar por slug
  - POST   /tenants                    // Criar
  - PUT    /tenants/:id                // Atualizar
  - DELETE /tenants/:id                // Desativar
  ```

- [ ] **Busca por Proximidade**
  ```typescript
  GET /tenants/nearby?latitude=X&longitude=Y&radius=5000
  
  // Usa PostGIS ou cálculo manual de distância
  // Retorna barbearias próximas ordenadas por distância
  ```

- [ ] **Upload de Logo**
  - Integração com Cloudinary ou S3
  - Resize automático (200x200, 400x400)
  - Validação de formato (jpg, png, webp)
  - Limite de 2MB

- [ ] **Configurações**
  ```typescript
  {
    businessHours: {
      monday: { open: "09:00", close: "19:00", isClosed: false }
      tuesday: { open: "09:00", close: "19:00", isClosed: false }
      // ... resto da semana
    }
    
    settings: {
      allowOnlineBooking: boolean
      requireApproval: boolean
      cancellationHours: number  // Ex: 24h
      slotDuration: number        // Ex: 30 minutos
    }
  }
  ```

---

### 5. Módulo de Barbeiros (Barbers)

**Arquivo:** `apps/api/src/barbers/`

- [ ] **CRUD Completo**
  ```typescript
  - GET    /barbers                    // Listar
  - GET    /barbers/:id                // Buscar por ID
  - POST   /barbers                    // Criar
  - PUT    /barbers/:id                // Atualizar
  - DELETE /barbers/:id                // Desativar
  ```

- [ ] **Gestão de Horários**
  ```typescript
  // Horários disponíveis (diferente do horário da barbearia)
  {
    schedule: {
      monday: { start: "10:00", end: "18:00", breaks: ["12:00-13:00"] }
      // ...
    }
  }
  
  // Bloqueios pontuais
  POST /barbers/:id/block-time
  {
    date: "2025-12-15"
    startTime: "14:00"
    endTime: "16:00"
    reason: "Almoço de família"
  }
  ```

- [ ] **Comissão**
  ```typescript
  {
    commissionType: 'PERCENTAGE' | 'FIXED'
    commissionValue: number  // Ex: 40 (%) ou 50.00 (R$)
    commissionPerService: [  // Comissão por serviço específico
      { serviceId: "...", value: 50 }
    ]
  }
  ```

- [ ] **Especialidades**
  - Link com Services (muitos-para-muitos)
  - Apenas serviços da especialidade aparecem

- [ ] **Status em Tempo Real**
  ```typescript
  enum BarberStatus {
    AVAILABLE   // Disponível
    BUSY        // Em atendimento
    BREAK       // Pausa/Almoço
    OFFLINE     // Folga/Não trabalha hoje
  }
  ```

---

### 6. Módulo de Serviços (Services)

**Arquivo:** `apps/api/src/services/`

- [ ] **CRUD Completo**
  ```typescript
  - GET    /services                   // Listar
  - GET    /services/:id               // Buscar por ID
  - GET    /services/barber/:barberId  // Serviços de um barbeiro
  - POST   /services                   // Criar
  - PUT    /services/:id               // Atualizar
  - DELETE /services/:id               // Desativar
  ```

- [ ] **Informações do Serviço**
  ```typescript
  {
    name: string
    description: string
    price: number
    duration: number        // Em minutos
    imageUrl?: string       // Foto do serviço
    isActive: boolean
    category?: string       // Corte, Barba, Combo, Extras
  }
  ```

- [ ] **Vincular Barbeiros**
  - Relação muitos-para-muitos
  - Nem todos barbeiros fazem todos serviços
  - Preço pode variar por barbeiro (opcional)

---

### 7. Módulo de Pagamentos (Payments)

**Arquivo:** `apps/api/src/payments/`

#### Fase 1 - Mock (Desenvolvimento)

- [ ] **Simular Pix**
  ```typescript
  POST /payments/create-pix
  {
    appointmentId: string
    amount: number
  }
  
  Retorna:
  {
    qrCode: "base64...",
    qrCodeText: "00020126580014...",
    pixKey: "pix@barbearia.com",
    expiresAt: Date
  }
  ```

- [ ] **Webhook Mock**
  ```typescript
  POST /payments/webhook
  
  // Simula confirmação de pagamento
  // Atualiza status do agendamento
  // Cria transação automática
  ```

#### Fase 2 - Integração Real

- [ ] **Mercado Pago ou Asaas**
  - Gerar Pix real
  - Receber webhook de confirmação
  - Atualizar status automaticamente
  - Registrar em Transactions

- [ ] **Preparar para Cartões**
  - Estrutura para aceitar cartão
  - Split de pagamento (comissão plataforma)
  - Estorno/Cancelamento

---

### 8. Módulo de Promoções (Promotions)

**Arquivo:** `apps/api/src/promotions/`

- [ ] **CRUD de Cupons**
  ```typescript
  - GET    /promotions                 // Listar
  - GET    /promotions/active          // Promoções ativas
  - POST   /promotions                 // Criar
  - PUT    /promotions/:id             // Atualizar
  - DELETE /promotions/:id             // Desativar
  - POST   /promotions/:code/validate  // Validar cupom
  ```

- [ ] **Tipos de Promoção**
  ```typescript
  {
    code: string                 // Ex: PRIMEIRAVISITA
    type: 'PERCENTAGE' | 'FIXED' // 20% ou R$ 10,00
    value: number
    
    minValue?: number            // Valor mínimo do pedido
    maxDiscount?: number         // Desconto máximo
    
    validFrom: Date
    validTo: Date
    
    maxUses?: number             // Uso total
    maxUsesPerClient?: number    // Uso por cliente
    
    applicableServices?: string[] // Serviços específicos
  }
  ```

- [ ] **Programa de Fidelidade**
  ```typescript
  // A cada X agendamentos, ganhar Y% desconto
  {
    pointsPerService: number
    rewardThreshold: number
    rewardValue: number
  }
  ```

---

### 9. Módulo de Notificações (Notifications)

**Arquivo:** `apps/api/src/notifications/`

#### Fase 1 - Email (MailHog)

- [ ] **Emails Transacionais**
  - Confirmação de cadastro
  - Confirmação de agendamento
  - Lembrete de agendamento (1h antes)
  - Cancelamento de agendamento
  - Promoções

#### Fase 2 - Push Notifications

- [ ] **Firebase Cloud Messaging**
  ```typescript
  POST /notifications/register-device
  {
    userId: string
    fcmToken: string
    platform: 'ios' | 'android'
  }
  
  POST /notifications/send
  {
    userIds: string[]
    title: string
    body: string
    data?: any
  }
  ```

- [ ] **Notificações Automáticas**
  - Novo agendamento (para barbeiro)
  - Agendamento confirmado (para cliente)
  - Lembrete 1h antes (para cliente)
  - Promoções especiais

#### Fase 3 - SMS (Opcional)

- [ ] Integração com Twilio
- [ ] Notificações críticas via SMS

---

## 🌐 FRONTEND WEB (Next.js)

### Setup e Configuração

- [ ] **Shadcn/ui Components**
  ```bash
  npx shadcn-ui@latest init
  npx shadcn-ui@latest add button input card table dialog
  ```

- [ ] **Tema Dark Premium**
  ```typescript
  // tailwind.config.ts
  colors: {
    primary: '#F5A027',
    background: '#0F0F0F',
    card: '#1A1A1A',
    // ...
  }
  ```

- [ ] **React Query Setup**
  ```typescript
  // Configurar client
  // Criar hooks customizados (useAuth, useAppointments)
  ```

---

### Páginas Principais

#### 1. Autenticação

- [ ] **Login** - `app/(auth)/login/page.tsx`
  - Formulário com validação (zod)
  - Salvar token em cookies
  - Redirect para dashboard

- [ ] **Registro** - `app/(auth)/register/page.tsx`
  - Cadastro de nova barbearia
  - Validações completas
  - Email de confirmação

- [ ] **Recuperação de Senha**
  - Enviar link por email
  - Reset com token

---

#### 2. Dashboard

- [ ] **Dashboard Principal** - `app/(dashboard)/page.tsx`
  ```typescript
  // Cards com métricas
  - Total do dia (R$)
  - Agendamentos do dia
  - Próximos agendamentos (lista)
  - Status dos barbeiros
  
  // Gráficos
  - Receita últimos 7 dias (Recharts)
  - Serviços mais vendidos (pizza chart)
  - Taxa de ocupação
  ```

---

#### 3. Agenda

- [ ] **Calendário** - `app/(dashboard)/agenda/page.tsx`
  - Visualização dia/semana/mês
  - Arrastar e soltar agendamentos
  - Cores por status
  - Filtro por barbeiro
  - Criar novo agendamento (modal)

- [ ] **Novo Agendamento** - Modal/Dialog
  - Selecionar cliente (busca)
  - Selecionar barbeiro
  - Selecionar serviço
  - Selecionar data/hora
  - Observações

---

#### 4. Financeiro

- [ ] **Caixa** - `app/(dashboard)/financeiro/caixa/page.tsx`
  ```typescript
  // Abrir Caixa
  - Valor inicial (troco)
  - Responsável
  
  // Caixa Aberto
  - Total de entradas
  - Total de saídas
  - Saldo atual
  - Últimas movimentações
  - Botão: Adicionar movimento
  - Botão: Fechar caixa
  
  // Fechar Caixa
  - Contagem por método
  - Diferença (esperado vs real)
  - Observações
  ```

- [ ] **Transações** - `app/(dashboard)/financeiro/transacoes/page.tsx`
  - Tabela paginada
  - Filtros (tipo, categoria, método, data)
  - Busca
  - Adicionar transação manual
  - Editar/Excluir

- [ ] **Relatórios** - `app/(dashboard)/financeiro/relatorios/page.tsx`
  - Seletor de período
  - Tipo de relatório (financeiro, comissões, etc)
  - Visualização de dados
  - Gráficos interativos
  - Exportar CSV/PDF

---

#### 5. Gestão

- [ ] **Barbeiros** - `app/(dashboard)/barbeiros/page.tsx`
  - Listar barbeiros (cards ou tabela)
  - Adicionar novo barbeiro
  - Editar informações
  - Configurar comissão
  - Configurar horários
  - Vincular serviços

- [ ] **Serviços** - `app/(dashboard)/servicos/page.tsx`
  - Listar serviços
  - CRUD simples
  - Upload de imagem
  - Definir preço e duração

---

#### 6. Marketing

- [ ] **Promoções** - `app/(dashboard)/marketing/page.tsx`
  - Criar cupom
  - Listar cupons ativos
  - Estatísticas de uso
  - Enviar push notification

---

#### 7. Configurações

- [ ] **Dados da Barbearia** - `app/(dashboard)/configuracoes/page.tsx`
  - Editar informações
  - Upload de logo
  - Horário de funcionamento
  - Endereço

---

### Componentes Reutilizáveis

- [ ] **DataTable** - Tabela com paginação, filtro e ordenação
- [ ] **DateRangePicker** - Seletor de período
- [ ] **StatusBadge** - Badge colorido por status
- [ ] **StatsCard** - Card de métrica
- [ ] **Calendar** - Calendário customizado
- [ ] **FormDialog** - Dialog com formulário genérico

---

## 📱 FRONTEND MOBILE (React Native + Expo)

### Setup Inicial

- [ ] **Criar projeto Expo**
  ```bash
  cd apps
  npx create-expo-app mobile --template blank-typescript
  ```

- [ ] **Instalar Dependências**
  ```bash
  # Navegação
  npm i @react-navigation/native @react-navigation/stack
  npm i react-native-screens react-native-safe-area-context
  
  # UI
  npm i react-native-reanimated react-native-gesture-handler
  npm i react-native-vector-icons
  
  # API
  npm i axios react-query
  
  # Storage
  npm i @react-native-async-storage/async-storage
  
  # Outros
  npm i date-fns react-native-maps
  ```

- [ ] **Theme Provider**
  ```typescript
  // Dark theme com laranja
  const theme = {
    colors: {
      primary: '#F5A027',
      background: '#0F0F0F',
      card: '#1A1A1A',
      text: '#FFFFFF',
      // ...
    }
  }
  ```

---

### Telas Principais

#### 1. Autenticação

- [ ] **Splash Screen** - Animação premium
  ```typescript
  - Logo animado (scale + fade)
  - Gradient background
  - Transição suave para login/home
  ```

- [ ] **Login** - `screens/Auth/LoginScreen.tsx`
  - Email e senha
  - Validações
  - "Esqueci senha"
  - "Criar conta"
  - Login com Google (Fase 2)

- [ ] **Registro** - `screens/Auth/RegisterScreen.tsx`
  - Nome, email, telefone, senha
  - Validações
  - Termos de uso

- [ ] **Recuperação de Senha**
  - Email
  - Código de verificação
  - Nova senha

---

#### 2. Home

- [ ] **Home** - `screens/Home/HomeScreen.tsx`
  ```typescript
  // Header
  - Logo
  - Localização atual
  - Notificações (badge)
  
  // Busca
  - Input de busca
  - Filtros (distância, avaliação, preço)
  
  // Seções
  - Barbearias próximas (FlatList horizontal)
  - Destaques
  - Promoções (banner carousel)
  - Serviços populares
  ```

- [ ] **Busca de Barbearias**
  - Pedir permissão de localização
  - Buscar por geolocalização
  - Listar com distância
  - Abrir no mapa

---

#### 3. Barbearia

- [ ] **Detalhes** - `screens/Barbershop/BarbershopDetailsScreen.tsx`
  ```typescript
  // Header
  - Imagens (carousel)
  - Nome, distância, avaliação
  - Botão: Agendar
  
  // Informações
  - Endereço (abrir no maps)
  - Telefone (ligar)
  - Horário de funcionamento
  
  // Serviços
  - Lista de serviços com preço
  
  // Barbeiros
  - Cards dos barbeiros
  
  // Avaliações
  - Últimas avaliações
  - Nota média
  ```

---

#### 4. Agendamento

- [ ] **Fluxo de Agendamento** (4 steps com animação)

  **Step 1 - Selecionar Barbeiro**
  ```typescript
  - Lista de barbeiros (cards)
  - Foto, nome, avaliação
  - Especialidades
  - Animação de seleção
  ```

  **Step 2 - Selecionar Serviço**
  ```typescript
  - Grid ou lista de serviços
  - Foto, nome, preço, duração
  - Seleção múltipla (opcional)
  ```

  **Step 3 - Selecionar Data e Hora**
  ```typescript
  - Calendário
  - Horários disponíveis (grid)
  - Marcar horários ocupados
  - Animação de loading ao buscar horários
  ```

  **Step 4 - Confirmar**
  ```typescript
  - Resumo do agendamento
  - Total a pagar
  - Observações (opcional)
  - Botão: Confirmar agendamento
  ```

- [ ] **Confirmação**
  ```typescript
  - Animação de sucesso (check animado)
  - Detalhes do agendamento
  - Botões:
    - Ver meus agendamentos
    - Voltar para home
  ```

---

#### 5. Meus Agendamentos

- [ ] **Lista** - `screens/Appointment/AppointmentListScreen.tsx`
  ```typescript
  // Tabs
  - Próximos
  - Concluídos
  - Cancelados
  
  // Cada item
  - Data/hora
  - Barbearia
  - Barbeiro
  - Serviço
  - Status (badge)
  - Botão: Ver detalhes
  ```

- [ ] **Detalhes** - `screens/Appointment/AppointmentDetailsScreen.tsx`
  ```typescript
  - Todas informações
  - QR Code (para check-in no local)
  - Botões:
    - Cancelar (se pendente/confirmado)
    - Como chegar (maps)
    - Avaliar (se concluído)
  ```

---

#### 6. Perfil

- [ ] **Perfil** - `screens/Profile/ProfileScreen.tsx`
  ```typescript
  // Header
  - Foto
  - Nome
  - Email
  
  // Opções
  - Editar perfil
  - Meus agendamentos
  - Histórico de pagamentos
  - Notificações (ativar/desativar)
  - Endereços salvos
  - Sair
  ```

- [ ] **Editar Perfil**
  - Nome, email, telefone
  - Upload de foto
  - Alterar senha

---

#### 7. Pagamento

- [ ] **Pagamento Pix** - `screens/Payment/PaymentScreen.tsx`
  ```typescript
  - QR Code (grande, centralizado)
  - Botão: Copiar código Pix
  - Tempo restante (countdown)
  - Instruções de pagamento
  - Status: Aguardando pagamento
  - Auto-atualizar quando pago (WebSocket)
  ```

---

### Animações Premium

- [ ] **Transições de Tela**
  - Slide horizontal suave
  - Fade in/out
  - Shared element transitions

- [ ] **Micro-interações**
  - Botões com feedback tátil
  - Cards com scale ao pressionar
  - Skeleton loading
  - Pull to refresh
  - Swipe para cancelar/deletar

- [ ] **Loading States**
  - Shimmer effect
  - Animação personalizada
  - Progress indicator

---

### Recursos Nativos

- [ ] **Geolocalização**
  - Pedir permissão
  - Buscar barbearias próximas
  - Calcular distância

- [ ] **Push Notifications**
  - Firebase Cloud Messaging
  - Solicitar permissão
  - Exibir badge
  - Deep linking

- [ ] **Câmera** (Fase 2)
  - Upload de foto de perfil
  - Scan de QR Code (check-in)

- [ ] **Deep Links**
  - Abrir app de agendamento via link
  - Compartilhar barbearia

---

## 🔧 MELHORIAS TÉCNICAS

### Backend

- [ ] **Rate Limiting Avançado**
  - Limite por IP
  - Limite por usuário
  - Diferentes limites por rota

- [ ] **Logging**
  - Winston ou Pino
  - Logs estruturados (JSON)
  - Diferentes níveis (info, warn, error)
  - Rotação de logs

- [ ] **Monitoramento**
  - Sentry (error tracking)
  - Métricas de performance
  - Health check endpoint

- [ ] **Testes**
  - Cobertura > 80%
  - Unit tests (Jest)
  - Integration tests
  - E2E tests (Supertest)

- [ ] **Documentação API**
  - Swagger completo
  - Exemplos de request/response
  - Postman collection

- [ ] **Cache com Redis**
  - Cache de queries frequentes
  - Session storage
  - Rate limiting

- [ ] **Queue com Bull**
  - Email assíncrono
  - Processamento de relatórios
  - Geração de PDFs

- [ ] **Migrations**
  - Seed de produção
  - Rollback strategy
  - Backup automático

---

### Frontend Web

- [ ] **Otimizações**
  - Code splitting
  - Lazy loading de rotas
  - Image optimization
  - Font optimization

- [ ] **PWA**
  - Service Worker
  - Offline support
  - Install prompt

- [ ] **Analytics**
  - Google Analytics
  - Event tracking
  - Conversion tracking

- [ ] **Acessibilidade**
  - ARIA labels
  - Keyboard navigation
  - Screen reader support

---

### Mobile

- [ ] **Otimizações**
  - FlatList otimizado
  - Image caching
  - Memoization
  - useMemo/useCallback

- [ ] **Offline Support**
  - Cache de dados
  - Sync quando online
  - Indicador de conexão

- [ ] **Performance**
  - Hermes engine
  - Bundle size optimization
  - Startup time < 2s

- [ ] **Crash Reporting**
  - Sentry ou Firebase Crashlytics
  - Error boundaries

---

## 🚀 DEPLOY E INFRAESTRUTURA

### Backend

- [ ] **Railway/Render**
  - Configurar variáveis de ambiente
  - Database (PostgreSQL)
  - Redis
  - Auto-deploy (main branch)

- [ ] **CI/CD**
  ```yaml
  # .github/workflows/api.yml
  - Lint
  - Tests
  - Build
  - Deploy
  ```

- [ ] **Database**
  - Backup automático diário
  - Migrations em produção
  - Monitoring

---

### Web

- [ ] **Vercel**
  - Deploy automático
  - Preview deployments
  - Edge functions

- [ ] **Environment Variables**
  - NEXT_PUBLIC_API_URL
  - Secrets seguros

---

### Mobile

- [ ] **Expo EAS**
  ```bash
  # Build Android
  eas build --platform android --profile production
  
  # Build iOS
  eas build --platform ios --profile production
  
  # Submit
  eas submit --platform android
  eas submit --platform ios
  ```

- [ ] **OTA Updates**
  - Updates sem rebuild
  - Rollback support

---

## 📚 DOCUMENTAÇÃO FINAL

- [ ] **README Atualizado**
  - Screenshots
  - GIFs de demonstração
  - Badges atualizados

- [ ] **User Guide**
  - Como usar (cliente)
  - Como gerenciar (barbeiro)
  - FAQ

- [ ] **API Documentation**
  - Swagger completo
  - Autenticação
  - Rate limits
  - Códigos de erro

- [ ] **Developer Guide**
  - Setup local
  - Arquitetura
  - Contribuindo
  - Code standards

---

## 🎯 CHECKLIST FINAL DE LANÇAMENTO

### Funcionalidades Essenciais
- [ ] Login/Registro funcionando
- [ ] Criar agendamento (mobile)
- [ ] Confirmar agendamento (web)
- [ ] Abrir/Fechar caixa (web)
- [ ] Relatório básico (web)
- [ ] Push notifications

### Performance
- [ ] Backend response time < 200ms (média)
- [ ] Mobile startup < 2s
- [ ] Web FCP < 1.5s
- [ ] Lighthouse score > 90

### Segurança
- [ ] HTTPS em produção
- [ ] Secrets em variáveis de ambiente
- [ ] Rate limiting ativo
- [ ] Validação de inputs
- [ ] SQL injection protegido
- [ ] XSS protegido

### Testes
- [ ] Cobertura de testes > 80%
- [ ] E2E dos fluxos críticos
- [ ] Teste de carga (500 usuários simultâneos)

### Deploy
- [ ] Backend em produção
- [ ] Web em produção
- [ ] Mobile na Play Store
- [ ] Database backups configurados

### Documentação
- [ ] README atualizado
- [ ] API docs completa
- [ ] User guide pronto

---

## 📊 MÉTRICAS DE SUCESSO

### Técnicas
- ✅ Backend response time médio < 200ms
- ✅ 99.9% uptime
- ✅ Cobertura de testes > 80%
- ✅ Zero vulnerabilidades críticas

### Produto
- ✅ Cliente consegue agendar em < 60s
- ✅ Barbeiro abre caixa em < 10s
- ✅ Relatório gerado em < 5s
- ✅ App mobile abre em < 2s

### Negócio
- ✅ 100 barbearias cadastradas (mês 1)
- ✅ 1000 agendamentos (mês 1)
- ✅ NPS > 50
- ✅ Churn < 5%

---

## 🗓️ TIMELINE ESTIMADO

```
Semana 1-2:   Backend Core (Appointments + CashFlow)     ⏳
Semana 3-4:   Backend Complementar (Reports + Tenants)   ⏳
Semana 5-8:   Frontend Web (Dashboard + Financeiro)      ⏳
Semana 9-12:  Frontend Mobile (Fluxo completo)           ⏳
Semana 13-14: Features Avançadas (Real-time + Push)      ⏳
Semana 15-16: Polimento + Deploy                         ⏳
```

**Total: ~4 meses para MVP completo**

---

## 🎓 RECURSOS DE APRENDIZADO

### Backend (NestJS)
- [Documentação Oficial NestJS](https://docs.nestjs.com)
- [Prisma Best Practices](https://www.prisma.io/docs/guides)
- [JWT Authentication Guide](https://docs.nestjs.com/security/authentication)

### Frontend Web (Next.js)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Shadcn/ui Components](https://ui.shadcn.com)
- [React Query Guide](https://tanstack.com/query/latest/docs)

### Mobile (React Native)
- [Expo Documentation](https://docs.expo.dev)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

---

**FIM DO DOCUMENTO**

> 💡 **Dica:** Use este documento como guia. Marque os itens conforme implementa. Não tente fazer tudo de uma vez - priorize o que traz mais valor primeiro!

**Status do Documento:** 📝 Completo  
**Última Atualização:** 1 de dezembro de 2025  
**Itens Totais:** 200+  
**Progresso:** 0% → 100% 🚀
