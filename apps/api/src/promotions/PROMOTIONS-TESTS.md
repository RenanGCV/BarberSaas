# Promotions Module - Testes Manuais

## 📋 Módulo de Promoções e Cupons

### ✅ Funcionalidades Implementadas

#### Promoções:
1. **Criar Promoção** (`POST /promotions`)
2. **Listar Promoções** (`GET /promotions?activeOnly=true`)
3. **Buscar Promoção** (`GET /promotions/:id`)
4. **Atualizar Promoção** (`PATCH /promotions/:id`)
5. **Deletar Promoção** (`DELETE /promotions/:id`)

#### Cupons:
6. **Criar Cupom** (`POST /promotions/coupons`)
7. **Validar Cupom** (`POST /promotions/coupons/validate`)
8. **Aplicar Cupom** (`POST /promotions/coupons/:code/apply`)
9. **Listar Cupons** (`GET /promotions/:promotionId/coupons`)
10. **Desativar Cupom** (`PATCH /promotions/coupons/:id/deactivate`)

### 🎯 Tipos de Desconto

- **PERCENTAGE**: Desconto percentual (ex: 30%)
- **FIXED_AMOUNT**: Valor fixo em reais (ex: R$ 50,00)
- **FREE_SERVICE**: Serviço gratuito (100% desconto)

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

### Passo 2: Criar Promoção - Black Friday

**Endpoint:** `POST /promotions`

**Body:**
```json
{
  "name": "Black Friday - 30% OFF",
  "description": "Desconto especial de Black Friday em todos os serviços",
  "discountType": "PERCENTAGE",
  "discountValue": 30,
  "startDate": "2024-12-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "serviceIds": [],
  "maxUses": 100,
  "isActive": true
}
```

**Resposta esperada:**
```json
{
  "message": "Promoção criada com sucesso",
  "promotion": {
    "id": "promotion-uuid",
    "name": "Black Friday - 30% OFF",
    "discountType": "PERCENTAGE",
    "discountValue": 30,
    "currentUses": 0,
    "maxUses": 100,
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "isActive": true,
    "services": [],
    "coupons": []
  }
}
```

**Copiar o `promotion.id` para os próximos testes.**

---

### Passo 3: Criar Promoção com Serviços Específicos

**Endpoint:** `POST /promotions`

**Body:**
```json
{
  "name": "Corte + Barba - R$ 50 OFF",
  "description": "Desconto de R$ 50 para pacote Corte + Barba",
  "discountType": "FIXED_AMOUNT",
  "discountValue": 50,
  "startDate": "2024-12-01T00:00:00Z",
  "endDate": "2024-12-15T23:59:59Z",
  "serviceIds": ["service-uuid-corte", "service-uuid-barba"],
  "maxUses": 50,
  "isActive": true
}
```

---

### Passo 4: Listar Todas as Promoções

**Endpoint:** `GET /promotions`

**Resposta esperada:**
```json
{
  "total": 2,
  "promotions": [
    {
      "id": "promotion-uuid-1",
      "name": "Black Friday - 30% OFF",
      "discountType": "PERCENTAGE",
      "discountValue": 30,
      "currentUses": 0,
      "maxUses": 100,
      "isCurrentlyActive": true,
      "usagePercentage": 0,
      "_count": {
        "services": 0,
        "coupons": 0
      }
    },
    {
      "id": "promotion-uuid-2",
      "name": "Corte + Barba - R$ 50 OFF",
      "discountType": "FIXED_AMOUNT",
      "discountValue": 50,
      "currentUses": 0,
      "maxUses": 50,
      "isCurrentlyActive": true,
      "usagePercentage": 0,
      "_count": {
        "services": 2,
        "coupons": 0
      }
    }
  ]
}
```

---

### Passo 5: Filtrar Apenas Promoções Ativas

**Endpoint:** `GET /promotions?activeOnly=true`

Retorna apenas promoções:
- `isActive = true`
- Dentro do período (`startDate <= hoje <= endDate`)
- Com usos disponíveis (`currentUses < maxUses`)

---

### Passo 6: Criar Cupom

**Endpoint:** `POST /promotions/coupons`

**Body:**
```json
{
  "code": "BLACKFRIDAY30",
  "promotionId": "promotion-uuid-aqui"
}
```

**Resposta esperada:**
```json
{
  "message": "Cupom criado com sucesso",
  "coupon": {
    "id": "coupon-uuid",
    "code": "BLACKFRIDAY30",
    "promotionId": "promotion-uuid",
    "isActive": true,
    "usageCount": 0,
    "promotion": {
      "name": "Black Friday - 30% OFF",
      "discountType": "PERCENTAGE",
      "discountValue": 30
    }
  }
}
```

---

### Passo 7: Validar Cupom (Antes de Aplicar)

**Endpoint:** `POST /promotions/coupons/validate`

**Body:**
```json
{
  "code": "BLACKFRIDAY30",
  "serviceId": "service-uuid-opcional"
}
```

**Resposta esperada (cupom válido):**
```json
{
  "valid": true,
  "message": "Cupom válido",
  "coupon": {
    "code": "BLACKFRIDAY30",
    "discountType": "PERCENTAGE",
    "discountValue": 30,
    "promotionName": "Black Friday - 30% OFF"
  }
}
```

**Resposta esperada (cupom inválido):**
```json
{
  "valid": false,
  "message": "Cupom fora do período de validade"
}
```

**Possíveis mensagens de erro:**
- `"Cupom não encontrado"`
- `"Cupom desativado"`
- `"Promoção desativada"`
- `"Cupom fora do período de validade"`
- `"Cupom esgotado"`
- `"Cupom não válido para este serviço"`

---

### Passo 8: Aplicar Cupom (Incrementar Uso)

**Endpoint:** `POST /promotions/coupons/BLACKFRIDAY30/apply`

**Resposta esperada:**
```json
{
  "message": "Cupom aplicado com sucesso",
  "discountType": "PERCENTAGE",
  "discountValue": 30
}
```

**Efeitos:**
- Incrementa `coupon.usageCount` +1
- Incrementa `promotion.currentUses` +1

---

### Passo 9: Listar Cupons de uma Promoção

**Endpoint:** `GET /promotions/{promotion-uuid}/coupons`

**Resposta esperada:**
```json
{
  "total": 1,
  "coupons": [
    {
      "id": "coupon-uuid",
      "code": "BLACKFRIDAY30",
      "isActive": true,
      "usageCount": 1,
      "promotion": {
        "name": "Black Friday - 30% OFF",
        "discountType": "PERCENTAGE",
        "discountValue": 30
      }
    }
  ]
}
```

---

### Passo 10: Atualizar Promoção

**Endpoint:** `PATCH /promotions/{promotion-uuid}`

**Body:**
```json
{
  "discountValue": 40,
  "maxUses": 200
}
```

**Resposta esperada:**
```json
{
  "message": "Promoção atualizada com sucesso",
  "promotion": {
    "id": "promotion-uuid",
    "discountValue": 40,
    "maxUses": 200
  }
}
```

---

### Passo 11: Desativar Cupom

**Endpoint:** `PATCH /promotions/coupons/{coupon-uuid}/deactivate`

**Resposta esperada:**
```json
{
  "message": "Cupom desativado com sucesso"
}
```

---

### Passo 12: Deletar Promoção

**Endpoint:** `DELETE /promotions/{promotion-uuid}`

**Resposta esperada (sucesso):**
```json
{
  "message": "Promoção deletada com sucesso"
}
```

**Resposta esperada (erro - possui cupons):**
```json
{
  "statusCode": 409,
  "message": "Não é possível deletar promoção com cupons vinculados"
}
```

---

## 💡 Casos de Uso

### 1. Black Friday (30% em tudo)

```json
{
  "name": "Black Friday 2024",
  "discountType": "PERCENTAGE",
  "discountValue": 30,
  "startDate": "2024-11-29T00:00:00Z",
  "endDate": "2024-12-01T23:59:59Z",
  "serviceIds": [],
  "maxUses": 1000
}
```

### 2. Primeira Compra (R$ 20 OFF)

```json
{
  "name": "Primeira Visita - R$ 20 OFF",
  "discountType": "FIXED_AMOUNT",
  "discountValue": 20,
  "startDate": "2024-12-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z"
}
```

### 3. Aniversário (Serviço Gratuito)

```json
{
  "name": "Aniversário - Corte Grátis",
  "discountType": "FREE_SERVICE",
  "discountValue": 100,
  "startDate": "2024-12-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "serviceIds": ["service-uuid-corte"],
  "maxUses": 50
}
```

---

## 📊 Validações Implementadas

| Campo           | Validações                                           |
|-----------------|------------------------------------------------------|
| `name`          | Obrigatório, string                                  |
| `discountType`  | Enum (PERCENTAGE, FIXED_AMOUNT, FREE_SERVICE)        |
| `discountValue` | Número, min 0, max 100 (para percentual)             |
| `startDate`     | Data válida, obrigatória                             |
| `endDate`       | Data válida, deve ser após startDate                 |
| `serviceIds`    | Array de UUIDs válidos, opcional                     |
| `maxUses`       | Número, min 1, opcional                              |
| `code` (cupom)  | String, 4-20 caracteres, maiúsculas, único           |

---

## 🔄 Integração com Appointments

### Ao criar agendamento com cupom:

```typescript
// No appointments.service.ts
const validation = await this.promotionsService.validateCoupon({
  code: 'BLACKFRIDAY30',
  serviceId: appointment.serviceId
}, tenantId);

if (validation.valid) {
  const discount = this.promotionsService.calculateDiscount(
    service.price,
    validation.coupon.discountType,
    validation.coupon.discountValue
  );
  
  const finalPrice = service.price - discount;
  
  // Aplicar cupom (incrementar uso)
  await this.promotionsService.applyCoupon('BLACKFRIDAY30', tenantId);
}
```

---

## ✅ Checklist de Testes

- [ ] Criar promoção com desconto percentual (30%)
- [ ] Criar promoção com desconto fixo (R$ 50)
- [ ] Criar promoção com serviço gratuito
- [ ] Criar promoção com serviços específicos
- [ ] Listar todas as promoções
- [ ] Filtrar apenas promoções ativas
- [ ] Buscar promoção por ID
- [ ] Atualizar promoção (alterar desconto)
- [ ] Criar cupom para promoção
- [ ] Validar cupom válido
- [ ] Validar cupom expirado
- [ ] Validar cupom esgotado (maxUses atingido)
- [ ] Validar cupom para serviço não incluído
- [ ] Aplicar cupom (incrementar uso)
- [ ] Listar cupons de uma promoção
- [ ] Desativar cupom
- [ ] Tentar deletar promoção com cupons (deve falhar)
- [ ] Deletar promoção sem cupons

---

## 🎯 Status: COMPLETO

**Próximos passos:**
1. Integrar com módulo de agendamentos (aplicar desconto automaticamente)
2. Criar notificações automáticas para promoções ativas
3. Dashboard com estatísticas de uso de cupons
4. Relatório de conversão de promoções
