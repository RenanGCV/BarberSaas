# Notifications Module - Testes Manuais

## 📋 Módulo de Notificações Push (Firebase Cloud Messaging - MOCK)

### ✅ Funcionalidades Implementadas

1. **Enviar Notificação Individual** (`POST /notifications/send`)
2. **Broadcast (Múltiplos Usuários)** (`POST /notifications/broadcast`)
3. **Registrar Token de Push** (`POST /notifications/register-token`)
4. **Remover Token** (`DELETE /notifications/token/:token`)
5. **Listar Notificações** (`GET /notifications/me`)
6. **Marcar como Lida** (`PATCH /notifications/:id/read`)
7. **Lembretes Automáticos** (`POST /notifications/test/send-reminders`)

### 🔥 Helpers para Integração Automática

- `notifyAppointmentConfirmed()` - Notifica cliente quando agendamento é confirmado
- `notifyAppointmentCancelled()` - Notifica cliente quando agendamento é cancelado
- `sendAppointmentReminders()` - Envia lembretes 1h antes (cron job)

---

## 🧪 Testes via Swagger

### Passo 1: Autenticação

```bash
POST /auth/login
{
  "email": "owner@barbershop.com",
  "password": "senha123"
}
```

Copiar o `accessToken` e usar no Swagger (botão "Authorize").

---

### Passo 2: Registrar Token de Push (Cliente)

**Endpoint:** `POST /notifications/register-token`

**Body:**
```json
{
  "token": "fcm_token_device_123456",
  "platform": "ANDROID"
}
```

**Resposta esperada:**
```json
{
  "message": "Token registrado com sucesso",
  "tokenId": "uuid",
  "platform": "ANDROID"
}
```

---

### Passo 3: Enviar Notificação Individual

**Endpoint:** `POST /notifications/send`

**Body:**
```json
{
  "userId": "user-uuid-aqui",
  "title": "Seu agendamento foi confirmado!",
  "body": "Corte de cabelo amanhã às 14:00",
  "data": {
    "appointmentId": "appointment-uuid",
    "type": "appointment_confirmed"
  }
}
```

**Resposta esperada (MOCK):**
```json
{
  "sent": true,
  "successCount": 1,
  "failureCount": 0,
  "userId": "user-uuid",
  "userName": "João Silva",
  "title": "Seu agendamento foi confirmado!",
  "body": "Corte de cabelo amanhã às 14:00",
  "devicesNotified": 1
}
```

---

### Passo 4: Broadcast para Múltiplos Usuários

**Endpoint:** `POST /notifications/broadcast`

**Body:**
```json
{
  "userIds": [
    "user-uuid-1",
    "user-uuid-2",
    "user-uuid-3"
  ],
  "title": "🎉 Promoção Especial!",
  "body": "30% de desconto em todos os serviços neste fim de semana!",
  "data": {
    "promotionId": "promo-uuid",
    "type": "promotion"
  }
}
```

**Resposta esperada:**
```json
{
  "sent": true,
  "usersNotified": 3,
  "devicesNotified": 5,
  "successCount": 5,
  "failureCount": 0,
  "title": "🎉 Promoção Especial!",
  "body": "30% de desconto em todos os serviços neste fim de semana!"
}
```

---

### Passo 5: Listar Minhas Notificações

**Endpoint:** `GET /notifications/me`

**Resposta esperada (MOCK):**
```json
{
  "notifications": [],
  "message": "Histórico de notificações não implementado ainda"
}
```

---

### Passo 6: Remover Token (Logout do Dispositivo)

**Endpoint:** `DELETE /notifications/token/fcm_token_device_123456`

**Resposta esperada:**
```json
{
  "message": "Token removido com sucesso",
  "tokenId": "uuid"
}
```

---

### Passo 7: Lembretes Automáticos (Teste Manual)

**Endpoint:** `POST /notifications/test/send-reminders`

**Resposta esperada:**
```json
{
  "remindersSent": 3
}
```

**Obs:** Envia notificação para todos os agendamentos nas próximas 1 hora.

---

## 🛠️ Integração com Firebase Cloud Messaging (Produção)

### Instalação:

```bash
npm install firebase-admin
```

### Configuração:

1. Criar projeto no [Firebase Console](https://console.firebase.google.com/)
2. Baixar `serviceAccountKey.json`
3. Adicionar ao `.env`:

```env
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
```

4. Inicializar no `main.ts`:

```typescript
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});
```

5. Substituir código MOCK no `notifications.service.ts`:

```typescript
// De:
const mockResponse = { ... };

// Para:
const response = await admin.messaging().sendMulticast({
  notification: { title, body },
  data: data || {},
  tokens: pushTokens.map(pt => pt.token),
});
```

---

## 📊 Validações Implementadas

| Campo       | Validações                                    |
|-------------|-----------------------------------------------|
| `userId`    | UUID, obrigatório                             |
| `userIds`   | Array de UUIDs, obrigatório                   |
| `title`     | String, obrigatório, mensagem em PT-BR        |
| `body`      | String, obrigatório, mensagem em PT-BR        |
| `token`     | String, obrigatório (FCM token)               |
| `platform`  | Enum: ANDROID, IOS, WEB                       |
| `data`      | Objeto opcional (metadados extras)            |

---

## 🔄 Integração com Outros Módulos

### Appointments Module:

Ao confirmar/cancelar agendamento, chamar:

```typescript
// Em appointments.service.ts
await this.notificationsService.notifyAppointmentConfirmed(
  appointment.id,
  tenantId
);
```

### Cron Job para Lembretes:

```typescript
// Criar em schedules/tasks.service.ts
@Cron('0 */10 * * * *') // A cada 10 minutos
async handleAppointmentReminders() {
  await this.notificationsService.sendAppointmentReminders();
}
```

---

## ✅ Checklist de Testes

- [ ] Registrar token de push (ANDROID)
- [ ] Registrar token de push (IOS)
- [ ] Enviar notificação individual
- [ ] Enviar broadcast para 3+ usuários
- [ ] Remover token (logout)
- [ ] Tentar enviar para usuário sem token (deve retornar mensagem)
- [ ] Teste de lembrete automático (criar agendamento para daqui 1h e rodar endpoint)
- [ ] Validar que apenas OWNER/ADMIN podem enviar notificações
- [ ] Validar que qualquer usuário pode registrar seu próprio token

---

## 🎯 Status: COMPLETO (MOCK)

**Próximos passos:**
1. Criar modelo `Notification` para histórico (opcional)
2. Implementar cron job para lembretes automáticos
3. Integrar Firebase FCM em produção
4. Adicionar notificações para promoções e cupons
