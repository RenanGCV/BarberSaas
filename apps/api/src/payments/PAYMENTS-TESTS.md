# 🧪 Testes do Payments Module

## Pré-requisitos

1. API rodando: `npm run dev`
2. Token JWT válido
3. Tenant ID
4. Agendamento criado (status PENDING)

---

## 📋 Checklist de Testes Manuais

### 1. ✅ Criar Pagamento Pix (Gerar QR Code)

**Endpoint:** `POST /payments/pix`

**Request:**
```bash
curl -X POST http://localhost:3333/payments/pix \
  -H "Authorization: Bearer {token}" \
  -H "x-tenant-id: {tenantId}" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "{appointmentId}",
    "amount": 50.00,
    "payerName": "João Silva",
    "payerEmail": "joao@email.com",
    "payerDocument": "12345678900"
  }'
```

**Resultado Esperado:**
- Status: 201
- Retorna:
  - `paymentId` (ex: pix_uuid)
  - `transactionId`
  - `qrCode` (Base64)
  - `qrCodeText` (Pix Copia e Cola)
  - `expiresAt`
  - Dados do agendamento
- Transaction criada no banco com status PENDING

---

### 2. ✅ Consultar Status do Pagamento

**Endpoint:** `GET /payments/:id/status`

**Request:**
```bash
curl http://localhost:3333/payments/{paymentId}/status \
  -H "Authorization: Bearer {token}" \
  -H "x-tenant-id: {tenantId}"
```

**Resultado Esperado:**
- Status: 200
- Retorna status atual (PENDING, PAID, FAILED)

---

### 3. ✅ Confirmar Pagamento (Teste Manual)

**Endpoint:** `POST /payments/:id/confirm`

**Request:**
```bash
curl -X POST http://localhost:3333/payments/{transactionId}/confirm \
  -H "Authorization: Bearer {token}" \
  -H "x-tenant-id: {tenantId}"
```

**Resultado Esperado:**
- Status: 200
- Transaction atualizada para PAID
- Appointment atualizado para CONFIRMED
- Mensagem de sucesso

---

### 4. ✅ Webhook de Confirmação

**Endpoint:** `POST /payments/webhook`

**Request:**
```bash
curl -X POST http://localhost:3333/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "pix_uuid",
    "status": "approved"
  }'
```

**Resultado Esperado:**
- Status: 200
- Pagamento confirmado automaticamente
- Appointment status = CONFIRMED

---

## 🔍 Cenários de Teste

### Cenário 1: Fluxo Completo de Pagamento
1. Criar appointment (status PENDING)
2. Gerar QR Code Pix
3. Verificar status (PENDING)
4. Simular confirmação via webhook
5. Verificar status (PAID)
6. Verificar appointment (CONFIRMED)

### Cenário 2: Valor Incorreto
- Tentar criar pagamento com valor != service.price
- **Esperado:** Erro 400 "O valor deve ser R$ X.XX"

### Cenário 3: Agendamento Cancelado
- Tentar pagar agendamento cancelado
- **Esperado:** Erro 400 "Não é possível pagar um agendamento cancelado"

### Cenário 4: Agendamento Não Encontrado
- Usar appointmentId inválido
- **Esperado:** Erro 404 "Agendamento não encontrado"

### Cenário 5: Pagamento Duplicado
- Confirmar mesmo pagamento duas vezes
- **Esperado:** Erro 400 "Pagamento já foi confirmado"

---

## 📊 Integração Real (Mercado Pago)

Para substituir o mock por integração real:

### 1. Instalar SDK
```bash
npm install mercadopago
```

### 2. Configurar .env
```
MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui
MERCADOPAGO_PUBLIC_KEY=sua_public_key_aqui
MERCADOPAGO_WEBHOOK_SECRET=seu_webhook_secret_aqui
```

### 3. Atualizar payments.service.ts

Substituir método `createPixPayment`:

```typescript
import mercadopago from 'mercadopago';

// No constructor
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

async createPixPayment(dto: CreatePixPaymentDto, tenantId: string) {
  // ... validações existentes

  // Criar pagamento real
  const payment = await mercadopago.payment.create({
    transaction_amount: amount,
    description: `${appointment.service.name} - ${appointment.barber.user.name}`,
    payment_method_id: 'pix',
    payer: {
      email: payerEmail,
      first_name: payerName,
      identification: {
        type: 'CPF',
        number: payerDocument,
      },
    },
  });

  return {
    paymentId: payment.body.id,
    qrCode: payment.body.point_of_interaction.transaction_data.qr_code_base64,
    qrCodeText: payment.body.point_of_interaction.transaction_data.qr_code,
    // ... resto da resposta
  };
}
```

### 4. Validar Webhook

```typescript
async processWebhook(payload: any) {
  // Validar assinatura do Mercado Pago
  const signature = req.headers['x-signature'];
  // ... validação

  // Consultar pagamento
  const payment = await mercadopago.payment.get(payload.data.id);
  
  if (payment.body.status === 'approved') {
    await this.confirmPayment(transactionId, tenantId);
  }
}
```

---

## ✅ Checklist Final

- [ ] Mock de pagamento Pix funciona
- [ ] QR Code gerado (Base64)
- [ ] Pix Copia e Cola gerado
- [ ] Transaction criada com status PENDING
- [ ] Consultar status retorna dados corretos
- [ ] Confirmar pagamento atualiza transaction
- [ ] Confirmar pagamento atualiza appointment
- [ ] Webhook processa corretamente
- [ ] Validações de erro funcionam
- [ ] Isolamento de tenant funciona

---

## 🎯 Próximos Passos

1. ✅ Testar com dados reais
2. ✅ Integrar com Mercado Pago (produção)
3. ✅ Configurar webhook URL no painel do Mercado Pago
4. ✅ Testar em ambiente de produção

---

**Status:** ✅ PAYMENTS MODULE IMPLEMENTADO (MOCK)  
**Pronto para integração real:** Sim - basta substituir lógica mock
