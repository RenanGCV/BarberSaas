# 📡 API Documentation - BarberSaas

## Base URL

```
http://localhost:3333/api
```

## Autenticação

Todas as rotas protegidas requerem o header:

```
Authorization: Bearer <access_token>
```

---

## 🔐 Auth Module

### POST /auth/register
Registrar novo usuário.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "phone": "(11) 98765-4321"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "CUSTOMER"
  },
  "access_token": "jwt_token",
  "refresh_token": "refresh_token"
}
```

### POST /auth/login
Fazer login.

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

### POST /auth/refresh
Renovar access token.

**Body:**
```json
{
  "refresh_token": "refresh_token"
}
```

### GET /auth/me
Obter dados do usuário autenticado.

**Headers:** Bearer Token

**Response:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "CUSTOMER",
  "tenantId": "uuid"
}
```

---

## 🏪 Tenants Module

### GET /tenants
Listar todas as barbearias.

**Query Params:**
- `page` (opcional): número da página
- `limit` (opcional): itens por página

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Barbearia Premium",
      "slug": "barbearia-premium",
      "address": "Rua das Flores, 123",
      "city": "São Paulo",
      "openTime": "09:00",
      "closeTime": "20:00",
      "latitude": -23.5505,
      "longitude": -46.6333
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

### GET /tenants/nearby
Buscar barbearias próximas.

**Query Params:**
- `latitude` (obrigatório): -23.5505
- `longitude` (obrigatório): -46.6333
- `radius` (opcional): raio em km (default: 10)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Barbearia Premium",
    "address": "Rua das Flores, 123",
    "distance": 2.5,
    "latitude": -23.5505,
    "longitude": -46.6333
  }
]
```

### GET /tenants/slug/:slug
Buscar barbearia por slug.

**Response:**
```json
{
  "id": "uuid",
  "name": "Barbearia Premium",
  "slug": "barbearia-premium",
  "barbers": [
    {
      "id": "uuid",
      "user": {
        "name": "João Barbeiro",
        "avatar": "url"
      }
    }
  ],
  "services": [
    {
      "id": "uuid",
      "name": "Corte Tradicional",
      "price": 45.00,
      "duration": 30
    }
  ],
  "reviews": [...]
}
```

### POST /tenants
Criar nova barbearia.

**Headers:** Bearer Token

**Body:**
```json
{
  "name": "Barbearia Premium",
  "phone": "(11) 98765-4321",
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "openTime": "09:00",
  "closeTime": "20:00"
}
```

### PUT /tenants/:id
Atualizar barbearia.

**Headers:** Bearer Token

**Body:** (todos os campos opcionais)
```json
{
  "name": "Barbearia Premium VIP",
  "logo": "url_da_logo",
  "openTime": "08:00",
  "closeTime": "21:00"
}
```

---

## 💈 Barbers Module

### GET /barbers
Listar todos os barbeiros da barbearia.

**Headers:** Bearer Token

**Response:**
```json
[
  {
    "id": "uuid",
    "user": {
      "id": "uuid",
      "name": "João Barbeiro",
      "email": "joao@barbearia.com",
      "avatar": "url"
    },
    "specialties": ["Corte", "Barba"],
    "commission": 30,
    "workingHours": "Segunda a Sexta: 09:00-18:00",
    "_count": {
      "appointments": 45
    }
  }
]
```

### POST /barbers
Criar novo barbeiro.

**Headers:** Bearer Token

**Body:**
```json
{
  "userId": "uuid-do-usuario",
  "specialties": ["Corte tradicional", "Barba"],
  "commission": 30,
  "workingHours": "Segunda a Sexta: 09:00-18:00"
}
```

### GET /barbers/:id/schedule?date=YYYY-MM-DD
Ver agenda do barbeiro em um dia específico.

**Headers:** Bearer Token

**Response:**
```json
{
  "barber": {
    "id": "uuid",
    "name": "João Barbeiro"
  },
  "date": "2024-02-15",
  "appointments": [
    {
      "id": "uuid",
      "scheduledDate": "2024-02-15T14:00:00Z",
      "status": "CONFIRMED",
      "customer": {
        "name": "Cliente Silva",
        "phone": "(11) 98765-4321"
      },
      "service": {
        "name": "Corte + Barba",
        "duration": 45,
        "price": 70.00
      }
    }
  ]
}
```

### POST /barbers/:id/check-availability
Verificar disponibilidade do barbeiro.

**Headers:** Bearer Token

**Body:**
```json
{
  "date": "2024-02-15",
  "time": "14:00"
}
```

**Response:**
```json
{
  "available": true,
  "appointments": []
}
```

---

## ✂️ Services Module

### GET /services
Listar todos os serviços.

**Headers:** Bearer Token

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Corte Tradicional",
    "description": "Corte masculino com máquina e tesoura",
    "price": 45.00,
    "duration": 30,
    "barbers": [
      {
        "id": "uuid",
        "user": {
          "name": "João Barbeiro"
        }
      }
    ],
    "_count": {
      "appointments": 120
    }
  }
]
```

### GET /services/barber/:barberId
Listar serviços de um barbeiro específico.

**Headers:** Bearer Token

### POST /services
Criar novo serviço.

**Headers:** Bearer Token

**Body:**
```json
{
  "name": "Corte Tradicional",
  "description": "Corte masculino com máquina e tesoura",
  "price": 45.00,
  "duration": 30,
  "barberIds": ["uuid-barbeiro-1", "uuid-barbeiro-2"]
}
```

### PUT /services/:id
Atualizar serviço.

**Headers:** Bearer Token

**Body:** (todos os campos opcionais)
```json
{
  "name": "Corte Premium",
  "price": 60.00,
  "barberIds": ["uuid-barbeiro-1"]
}
```

---

## 📅 Appointments Module

### GET /appointments
Listar todos os agendamentos.

**Headers:** Bearer Token

**Query Params:**
- `customerId` (opcional): filtrar por cliente

**Response:**
```json
[
  {
    "id": "uuid",
    "scheduledDate": "2024-02-15T14:00:00Z",
    "status": "CONFIRMED",
    "notes": "Cliente pediu degradê",
    "service": {
      "name": "Corte Tradicional",
      "price": 45.00,
      "duration": 30
    },
    "barber": {
      "user": {
        "name": "João Barbeiro"
      }
    },
    "customer": {
      "name": "Cliente Silva",
      "phone": "(11) 98765-4321"
    }
  }
]
```

### GET /appointments/upcoming
Listar próximos agendamentos.

**Headers:** Bearer Token

**Query Params:**
- `customerId` (opcional): filtrar por cliente

**Response:** (mesma estrutura de GET /appointments)

### POST /appointments
Criar novo agendamento.

**Headers:** Bearer Token

**Body:**
```json
{
  "serviceId": "uuid-do-servico",
  "barberId": "uuid-do-barbeiro",
  "scheduledDate": "2024-02-15T14:00:00Z",
  "notes": "Gostaria de um corte degradê"
}
```

**Validações:**
- ❌ Não permite agendamento no passado
- ❌ Verifica conflito de horário do barbeiro
- ❌ Verifica horário de funcionamento da barbearia
- ❌ Verifica se barbeiro oferece o serviço

### PATCH /appointments/:id/status
Alterar status do agendamento.

**Headers:** Bearer Token

**Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Status válidos:**
- `PENDING` → `CONFIRMED`, `CANCELED`
- `CONFIRMED` → `IN_PROGRESS`, `CANCELED`, `NO_SHOW`
- `IN_PROGRESS` → `COMPLETED`, `CANCELED`
- `COMPLETED`, `CANCELED`, `NO_SHOW` → (finais)

**Automação:**
- Ao marcar como `COMPLETED`, cria automaticamente uma transação de INCOME

### DELETE /appointments/:id
Cancelar agendamento.

**Headers:** Bearer Token

---

## 💰 Transactions Module

### GET /transactions
Listar transações com filtros.

**Headers:** Bearer Token

**Query Params:**
- `type` (opcional): INCOME | EXPENSE
- `category` (opcional): categoria
- `startDate` (opcional): YYYY-MM-DD
- `endDate` (opcional): YYYY-MM-DD

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "INCOME",
      "category": "Serviço",
      "amount": 45.00,
      "description": "Corte de cabelo - Cliente João",
      "date": "2024-02-15T14:30:00Z",
      "paymentMethod": "pix",
      "appointment": {
        "customer": {
          "name": "João Silva"
        },
        "service": {
          "name": "Corte Tradicional"
        }
      }
    }
  ],
  "totals": {
    "income": 1250.00,
    "expense": 350.00,
    "balance": 900.00
  }
}
```

### GET /transactions/period
Obter transações por período com agrupamento diário.

**Headers:** Bearer Token

**Query Params:**
- `startDate` (obrigatório): YYYY-MM-DD
- `endDate` (obrigatório): YYYY-MM-DD

**Response:**
```json
{
  "transactions": [...],
  "totals": {
    "income": 1250.00,
    "expense": 350.00,
    "balance": 900.00
  },
  "byDay": {
    "2024-02-15": {
      "income": 450.00,
      "expense": 120.00,
      "transactions": [...]
    }
  }
}
```

### GET /transactions/summary/:type
Resumo por categoria (INCOME ou EXPENSE).

**Headers:** Bearer Token

**Path Params:**
- `type`: INCOME | EXPENSE

**Query Params:**
- `startDate` (opcional): YYYY-MM-DD
- `endDate` (opcional): YYYY-MM-DD

**Response:**
```json
[
  {
    "category": "Serviço",
    "total": 1250.00
  },
  {
    "category": "Produtos",
    "total": 350.00
  }
]
```

### POST /transactions
Criar nova transação.

**Headers:** Bearer Token

**Body:**
```json
{
  "type": "EXPENSE",
  "category": "Produtos",
  "amount": 150.00,
  "description": "Compra de pomadas e cremes",
  "date": "2024-02-15",
  "paymentMethod": "dinheiro"
}
```

### PUT /transactions/:id
Atualizar transação.

**Headers:** Bearer Token

**Body:** (todos os campos opcionais)
```json
{
  "amount": 180.00,
  "description": "Compra de pomadas, cremes e toalhas"
}
```

### DELETE /transactions/:id
Remover transação.

**Headers:** Bearer Token

---

## 💵 CashFlow Module

### POST /cash-flow/open
Abrir caixa do dia.

**Headers:** Bearer Token

**Body:**
```json
{
  "initialBalance": 100.00,
  "notes": "Abertura do caixa dia 15/02"
}
```

**Response:**
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "openedBy": "uuid-usuario",
  "openedAt": "2024-02-15T08:00:00Z",
  "initialBalance": 100.00,
  "currentBalance": 100.00,
  "closedAt": null
}
```

### GET /cash-flow/current
Obter caixa atual aberto.

**Headers:** Bearer Token

**Response:**
```json
{
  "id": "uuid",
  "openedAt": "2024-02-15T08:00:00Z",
  "initialBalance": 100.00,
  "currentBalance": 1250.00,
  "transactions": [
    {
      "id": "uuid",
      "type": "INCOME",
      "amount": 45.00,
      "description": "Corte de cabelo"
    }
  ]
}
```

### POST /cash-flow/:id/movement
Adicionar movimento ao caixa.

**Headers:** Bearer Token

**Body:**
```json
{
  "type": "INCOME",
  "amount": 50.00,
  "description": "Gorjeta do cliente",
  "category": "Outros"
}
```

### POST /cash-flow/:id/close
Fechar caixa do dia.

**Headers:** Bearer Token

**Body:**
```json
{
  "notes": "Tudo conferido, fechamento normal"
}
```

**Response:**
```json
{
  "id": "uuid",
  "openedAt": "2024-02-15T08:00:00Z",
  "closedAt": "2024-02-15T20:00:00Z",
  "initialBalance": 100.00,
  "finalBalance": 1250.00,
  "currentBalance": 1250.00,
  "totalIncome": 1200.00,
  "totalExpense": 50.00,
  "difference": 0.00
}
```

### GET /cash-flow/daily/:date
Resumo do dia específico.

**Headers:** Bearer Token

**Path Params:**
- `date`: YYYY-MM-DD

**Response:**
```json
{
  "date": "2024-02-15",
  "cashFlow": {
    "id": "uuid",
    "initialBalance": 100.00,
    "finalBalance": 1250.00
  },
  "totalIncome": 1200.00,
  "totalExpense": 50.00,
  "balance": 1150.00,
  "transactions": [...]
}
```

### GET /cash-flow/history
Histórico de caixas.

**Headers:** Bearer Token

**Query Params:**
- `startDate` (opcional): YYYY-MM-DD
- `endDate` (opcional): YYYY-MM-DD

**Response:**
```json
[
  {
    "id": "uuid",
    "date": "2024-02-15T08:00:00Z",
    "openedAt": "2024-02-15T08:00:00Z",
    "closedAt": "2024-02-15T20:00:00Z",
    "initialBalance": 100.00,
    "finalBalance": 1250.00,
    "totalIncome": 1200.00,
    "totalExpense": 50.00
  }
]
```

---

## 📊 Status Codes

| Code | Descrição |
|------|-----------|
| `200` | Sucesso |
| `201` | Criado com sucesso |
| `400` | Bad Request (validação falhou) |
| `401` | Não autenticado |
| `403` | Sem permissão |
| `404` | Não encontrado |
| `409` | Conflito (ex: horário já ocupado) |
| `500` | Erro interno do servidor |

---

## 🔒 Multi-tenant

Todas as operações são isoladas por `tenantId`. O tenant é extraído automaticamente do JWT do usuário autenticado.

**Exemplo de JWT payload:**
```json
{
  "sub": "user-uuid",
  "email": "joao@email.com",
  "role": "BARBER",
  "tenantId": "tenant-uuid"
}
```

---

## 🧪 Testando a API

### Com cURL

```bash
# Login
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@barbearia.com","password":"123456"}'

# Listar agendamentos (com token)
curl -X GET http://localhost:3333/api/appointments \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Com Swagger UI

Acesse `http://localhost:3333/api/docs` para testar interativamente todas as rotas.

---

## 📝 Notas Importantes

### Validações de Agendamento
- ✅ Data não pode ser no passado
- ✅ Barbeiro deve estar disponível no horário
- ✅ Barbeiro deve oferecer o serviço selecionado
- ✅ Horário deve estar dentro do expediente da barbearia
- ✅ Não permite conflito de horários (considera duração do serviço)

### Fluxo de Status do Agendamento
```
PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
   ↓          ↓             ↓
CANCELED   NO_SHOW      CANCELED
```

### Transações Automáticas
- Quando um agendamento é marcado como `COMPLETED`, uma transação de `INCOME` é criada automaticamente

### Caixa Diário
- Apenas 1 caixa pode estar aberto por vez
- Ao fechar, calcula automaticamente totais e saldo final
- Permite adicionar movimentos manuais (gorjetas, despesas avulsas)
