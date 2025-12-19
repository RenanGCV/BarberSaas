# 🧪 Testes do Schedules Module

## Pré-requisitos

1. Banco de dados rodando:
```bash
docker-compose up -d
```

2. Migration aplicada:
```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

3. API rodando:
```bash
npm run dev
```

---

## 📋 Checklist de Testes Manuais

### 1. ✅ Atualizar Horários de Trabalho

**Endpoint:** `PATCH /schedules/barbers/:barberId/working-hours`

**Request:**
```bash
curl -X PATCH http://localhost:3333/schedules/barbers/{barberId}/working-hours \
  -H "Authorization: Bearer {token}" \
  -H "x-tenant-id: {tenantId}" \
  -H "Content-Type: application/json" \
  -d '{
    "workingHours": {
      "monday": { "start": "09:00", "end": "18:00" },
      "tuesday": { "start": "09:00", "end": "18:00" },
      "wednesday": { "start": "09:00", "end": "18:00" },
      "thursday": { "start": "09:00", "end": "18:00" },
      "friday": { "start": "09:00", "end": "20:00" },
      "saturday": { "start": "09:00", "end": "14:00" }
    }
  }'
```

**Resultado Esperado:**
- Status: 200
- Retorna horários atualizados
- Mensagem de sucesso

---

### 2. ✅ Consultar Horários de Trabalho

**Endpoint:** `GET /schedules/barbers/:barberId/working-hours`

**Request:**
```bash
curl http://localhost:3333/schedules/barbers/{barberId}/working-hours \
  -H "Authorization: Bearer {token}" \
  -H "x-tenant-id: {tenantId}"
```

**Resultado Esperado:**
- Status: 200
- Retorna objeto com workingHours do barbeiro

---

### 3. ✅ Buscar Slots Disponíveis

**Endpoint:** `GET /schedules/available`

**Request:**
```bash
curl "http://localhost:3333/schedules/available?barberId={barberId}&serviceId={serviceId}&date=2025-12-20" \
  -H "Authorization: Bearer {token}" \
  -H "x-tenant-id: {tenantId}"
```

**Resultado Esperado:**
- Status: 200
- Retorna array de slots disponíveis (ex: ["09:00", "09:15", "09:30", ...])
- Considera:
  - Horários de trabalho do barbeiro
  - Duração do serviço
  - Agendamentos existentes
  - Horários bloqueados

---

### 4. ✅ Bloquear Horário

**Endpoint:** `POST /schedules/block`

**Request:**
```bash
curl -X POST http://localhost:3333/schedules/block \
  -H "Authorization: Bearer {token}" \
  -H "x-tenant-id: {tenantId}" \
  -H "Content-Type: application/json" \
  -d '{
    "barberId": "{barberId}",
    "startTime": "2025-12-20T12:00:00Z",
    "endTime": "2025-12-20T13:00:00Z",
    "reason": "Almoço"
  }'
```

**Resultado Esperado:**
- Status: 201
- Retorna bloqueio criado com ID

---

### 5. ✅ Listar Horários Bloqueados

**Endpoint:** `GET /schedules/barbers/:barberId/blocked`

**Request:**
```bash
curl http://localhost:3333/schedules/barbers/{barberId}/blocked \
  -H "Authorization: Bearer {token}" \
  -H "x-tenant-id: {tenantId}"
```

**Resultado Esperado:**
- Status: 200
- Array de bloqueios futuros

---

### 6. ✅ Remover Bloqueio

**Endpoint:** `DELETE /schedules/block/:id`

**Request:**
```bash
curl -X DELETE http://localhost:3333/schedules/block/{blockId} \
  -H "Authorization: Bearer {token}" \
  -H "x-tenant-id: {tenantId}"
```

**Resultado Esperado:**
- Status: 200
- Mensagem de sucesso

---

## 🔍 Cenários de Teste

### Cenário 1: Barbeiro sem horários de trabalho
- Consultar slots disponíveis
- **Esperado:** Array vazio com mensagem "barbeiro não trabalha neste dia"

### Cenário 2: Serviço que o barbeiro não oferece
- Buscar slots com serviceId incorreto
- **Esperado:** Erro 400 "Este barbeiro não oferece o serviço selecionado"

### Cenário 3: Sobreposição de horários
- Criar agendamento das 10:00 às 10:30
- Buscar slots disponíveis no mesmo dia
- **Esperado:** 10:00 e 10:15 não aparecem na lista

### Cenário 4: Bloqueio de horário
- Bloquear das 12:00 às 13:00
- Buscar slots disponíveis
- **Esperado:** Horários entre 12:00 e 13:00 não aparecem

### Cenário 5: Validação de horários inválidos
- Tentar definir end < start
- **Esperado:** Erro 400 "horário de início deve ser anterior ao de fim"

---

## 📊 Teste Automatizado (Opcional)

### Usando Swagger UI

1. Acesse: http://localhost:3333/api/docs
2. Faça login e copie o token
3. Clique em "Authorize" e cole o token
4. Teste todos os endpoints do "Schedules" tag

---

## ✅ Checklist Final

- [ ] Migration aplicada sem erros
- [ ] Código compila sem erros
- [ ] Swagger exibe endpoints do Schedules
- [ ] Atualizar horários de trabalho funciona
- [ ] Consultar horários funciona
- [ ] Buscar slots disponíveis funciona
- [ ] Slots consideram agendamentos existentes
- [ ] Slots consideram horários bloqueados
- [ ] Bloquear horário funciona
- [ ] Remover bloqueio funciona
- [ ] Validações de erro funcionam
- [ ] Isolamento de tenant funciona

---

## 🐛 Troubleshooting

### Erro: "Can't reach database"
```bash
docker-compose up -d
```

### Erro: "Unknown argument: workingHours"
```bash
npx prisma generate
```

### Erro: "Barber not found"
- Verificar se barberId e tenantId estão corretos
- Verificar se barber está ativo (isActive = true)

---

**Status:** ✅ Schedules Module implementado!  
**Próximo:** Payments Module (Pix Integration)
